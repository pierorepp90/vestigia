// worker/src/votacion.js
//
// Handlers de la votación de próxima ciudad. Reciben `db` (el módulo
// worker/src/db.js) como último argumento para poder inyectar un doble en
// los tests — mismo patrón que sendEmail(fetchFn) en resend.js.
import * as dbPorDefecto from './db.js';
import { hashIp } from './hash.js';
import { leerJsonAcotado } from './entrada.js';
import { consumirCupo } from './throttle.js';
import { buildPropuestaEmail, sendEmail } from './resend.js';

const RE_ID = /^[a-z0-9-]{1,40}$/;
const VENTANA_THROTTLE = 900; // 15 min
const MAX_VOTOS_POR_IP = 3;
const MAX_CIUDAD = 120;
const MAX_NOTA = 500;
const MAX_EMAIL = 254;

function jsonRes(cuerpo, cors, status = 200) {
  return Response.json(cuerpo, { status, headers: cors });
}

function respuesta429(cors, cupo) {
  return jsonRes(
    { error: 'Demasiadas solicitudes, prueba de nuevo en unos minutos' },
    { ...cors, 'Retry-After': String(cupo.reintentarEn) },
    429,
  );
}

/** Estado del votante a partir de su fila en `votos`. */
function estadoDesdeVoto(voto) {
  if (!voto) return 'sin_voto';
  return voto.estado === 'en_espera' ? 'propuesta_pendiente' : 'voto_activo';
}

/** La etiqueta se guarda como JSON `{es,en,...}`; si viene mal formada, se
 *  devuelve como `{es: <texto>}` para no romper la página. */
export function parseEtiqueta(raw) {
  try {
    const o = JSON.parse(raw);
    return o && typeof o === 'object' ? o : { es: String(raw) };
  } catch {
    return { es: String(raw) };
  }
}

export async function handleObtenerVotacion(request, env, cors, db = dbPorDefecto) {
  const url = new URL(request.url);
  const votante = url.searchParams.get('votante');
  if (!votante || !RE_ID.test(votante.replace(/-/g, ''))) {
    return jsonRes({ error: 'Falta el identificador de votante' }, cors, 400);
  }

  const [opciones, voto] = await Promise.all([
    db.listarOpcionesVotables(env),
    db.votoDeVotante(env, votante),
  ]);
  const estadoVotante = estadoDesdeVoto(voto);
  const miVoto = voto && voto.estado === 'activo' ? voto.opcion_id : null;

  const salida = opciones.map((o) => ({ id: o.id, etiqueta: parseEtiqueta(o.etiqueta) }));
  if (estadoVotante === 'voto_activo') {
    const rec = await db.recuentoVotos(env);
    for (const o of salida) o.votos = rec[o.id] || 0;
  }
  return jsonRes({ opciones: salida, estadoVotante, miVoto }, cors);
}

export async function handleEmitirVoto(request, env, cors, ip, db = dbPorDefecto) {
  const leido = await leerJsonAcotado(request);
  if (leido.error) return jsonRes({ error: leido.error }, cors, leido.status);
  const { opcionId, votante } = leido.datos || {};
  if (!opcionId || !RE_ID.test(opcionId) || !votante) {
    return jsonRes({ error: 'Datos de voto incompletos' }, cors, 400);
  }

  const cupo = await consumirCupo(env.KV, { ip, accion: 'voto', limite: 20, ventanaSegundos: VENTANA_THROTTLE });
  if (!cupo.permitido) return respuesta429(cors, cupo);

  const yaVoto = await db.votoDeVotante(env, votante);
  if (yaVoto) return jsonRes({ error: 'Ya has votado' }, cors, 409);

  const opcion = await db.opcionPorId(env, opcionId);
  if (!opcion || (opcion.estado !== 'oficial' && opcion.estado !== 'aprobada')) {
    return jsonRes({ error: 'Esa opción no se puede votar' }, cors, 400);
  }

  const ipHash = await hashIp(ip, env.IP_SALT);
  if ((await db.votosConMismaIp(env, ipHash)) >= MAX_VOTOS_POR_IP) {
    return jsonRes({ error: 'Demasiados votos desde esta red' }, cors, 429);
  }

  await db.registrarVoto(env, { opcionId, votante, ipHash, ahora: Date.now() });

  const [opciones, rec] = await Promise.all([db.listarOpcionesVotables(env), db.recuentoVotos(env)]);
  const salida = opciones.map((o) => ({ id: o.id, etiqueta: parseEtiqueta(o.etiqueta), votos: rec[o.id] || 0 }));
  return jsonRes({ ok: true, opciones: salida, miVoto: opcionId }, cors);
}

/** slug estable a partir del texto de la ciudad, con sufijo aleatorio para no
 *  colisionar si dos personas proponen lo mismo escrito distinto. Siempre
 *  cumple RE_ID (a-z 0-9 -, <= 40). */
function slugPropuesta(ciudad) {
  const base = ciudad
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 24) || 'propuesta';
  return `${base}-${crypto.randomUUID().slice(0, 6)}`;
}

/**
 * Propuesta de ciudad nueva: entra como opción `pendiente` + voto `en_espera`
 * del proponente y se avisa al propietario por email para moderarla. Un fallo
 * de Resend NO tira la propuesta ya guardada (se registra y se responde ok).
 */
export async function handleEnviarPropuesta(request, env, cors, ip, db = dbPorDefecto) {
  const leido = await leerJsonAcotado(request);
  if (leido.error) return jsonRes({ error: leido.error }, cors, leido.status);
  const { ciudad, nota, email, votante } = leido.datos || {};

  if (!votante) return jsonRes({ error: 'Falta el identificador de votante' }, cors, 400);

  const ciudadLimpia = typeof ciudad === 'string' ? ciudad.trim() : '';
  if (!ciudadLimpia || ciudadLimpia.length > MAX_CIUDAD) {
    return jsonRes({ error: 'Escribe el nombre de la ciudad (máx. 120 caracteres)' }, cors, 400);
  }
  const notaLimpia = typeof nota === 'string' && nota.trim() ? nota.trim().slice(0, MAX_NOTA) : null;
  const emailLimpio = typeof email === 'string' && email.trim() ? email.trim().slice(0, MAX_EMAIL) : null;

  const cupo = await consumirCupo(env.KV, { ip, accion: 'propuesta', limite: 3, ventanaSegundos: VENTANA_THROTTLE });
  if (!cupo.permitido) return respuesta429(cors, cupo);

  if (await db.votoDeVotante(env, votante)) {
    return jsonRes({ error: 'Ya has participado' }, cors, 409);
  }

  const ipHash = await hashIp(ip, env.IP_SALT);

  await db.crearPropuestaConVoto(env, {
    opcionId: slugPropuesta(ciudadLimpia),
    etiquetaJson: JSON.stringify({ es: ciudadLimpia }),
    email: emailLimpio,
    nota: notaLimpia,
    votante,
    ipHash,
    ahora: Date.now(),
  });

  const enviar = env._enviar || ((p) => sendEmail(p, env.RESEND_API_KEY));
  try {
    await enviar(buildPropuestaEmail({ ciudad: ciudadLimpia, nota: notaLimpia, email: emailLimpio }, env.OWNER_EMAIL, env.SITE_URL));
  } catch (err) {
    // La propuesta ya está en D1: un fallo de Resend no debe perderla.
    console.error('No se pudo enviar el email de propuesta:', err);
  }

  return jsonRes({ ok: true }, cors);
}

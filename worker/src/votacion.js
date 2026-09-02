// worker/src/votacion.js
//
// Handlers de la votación de próxima ciudad. Reciben `db` (el módulo
// worker/src/db.js) como último argumento para poder inyectar un doble en
// los tests — mismo patrón que sendEmail(fetchFn) en resend.js.
import * as dbPorDefecto from './db.js';
import { hashIp } from './hash.js';
import { leerJsonAcotado } from './entrada.js';
import { consumirCupo } from './throttle.js';

const RE_ID = /^[a-z0-9-]{1,40}$/;
const VENTANA_THROTTLE = 900; // 15 min
const MAX_VOTOS_POR_IP = 3;

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

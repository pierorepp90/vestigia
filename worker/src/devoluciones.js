// worker/src/devoluciones.js
//
// Devolución del jugador al terminar una ruta. Exige el mismo token de
// acceso firmado que /api/ruta: solo quien compró (o accedió gratis) puede
// dejar una. `db` (último argumento) es inyectable para los tests.
//
// `env._enviar` es una costura SOLO para tests: intercepta el payload de
// email completo antes de que llegue a sendEmail(). En producción no existe
// y se llama a sendEmail directamente.
import * as dbPorDefecto from './db.js';
import { verificarToken } from './acceso.js';
import { buildDevolucionEmail, sendEmail, emailValidoBasico } from './resend.js';
import { leerJsonAcotado } from './entrada.js';
import { consumirCupo } from './throttle.js';

const CATEGORIAS = new Set(['enigmas', 'dificultad', 'recorrido', 'error', 'precio', 'otro']);
const MAX_TEXTO = 2000;
const IDIOMAS = ['es', 'en', 'fr', 'it'];
const VENTANA_THROTTLE = 900; // 15 min

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

export async function handleEnviarDevolucion(request, url, env, cors, ip, db = dbPorDefecto) {
  const token = url.searchParams.get('t');
  const payload = await verificarToken(token, env.TOKEN_SECRET);
  if (!payload) return jsonRes({ error: 'Token inválido o caducado' }, cors, 401);

  const cupo = await consumirCupo(env.KV, { ip, accion: 'devolucion', limite: 5, ventanaSegundos: VENTANA_THROTTLE });
  if (!cupo.permitido) return respuesta429(cors, cupo);

  // 8192 B: el texto libre admite hasta MAX_TEXTO (2000) caracteres, que en
  // ES/FR/IT son casi todos acentuados (~2 B/carácter en UTF-8) → ~4 KB, más
  // el sobre JSON (email ≤254, rutaId, idioma). Con el tope por defecto (2048)
  // un comentario largo se perdería con un 413 antes de llegar aquí.
  const leido = await leerJsonAcotado(request, 8192);
  if (leido.error) return jsonRes({ error: leido.error }, cors, leido.status);
  const { rutaId, valoracion, categoria, texto, email, idioma } = leido.datos || {};

  if (rutaId && rutaId !== payload.rutaId) {
    return jsonRes({ error: 'La ruta no coincide con el acceso' }, cors, 400);
  }
  const val = Number(valoracion);
  if (!Number.isInteger(val) || val < 1 || val > 5) {
    return jsonRes({ error: 'Valoración no válida' }, cors, 400);
  }
  if (!CATEGORIAS.has(categoria)) {
    return jsonRes({ error: 'Categoría no válida' }, cors, 400);
  }
  const textoLimpio = typeof texto === 'string' ? texto.trim() : '';
  if (!textoLimpio) {
    return jsonRes({ error: 'El comentario no puede estar vacío' }, cors, 400);
  }
  if (textoLimpio.length > MAX_TEXTO) {
    return jsonRes({ error: 'El comentario es demasiado largo' }, cors, 400);
  }
  const emailLimpio = typeof email === 'string' && email.trim() ? email.trim() : null;
  if (emailLimpio && !emailValidoBasico(emailLimpio)) {
    return jsonRes({ error: 'Email no válido' }, cors, 400);
  }

  const idiomaLimpio = IDIOMAS.includes(idioma) ? idioma : 'es';
  await db.guardarDevolucion(env, {
    rutaId: payload.rutaId,
    orderId: payload.orderId,
    idioma: idiomaLimpio,
    valoracion: val,
    categoria,
    texto: textoLimpio,
    email: emailLimpio,
    ahora: Date.now(),
  });

  const enviar = env._enviar || ((p) => sendEmail(p, env.RESEND_API_KEY));
  try {
    await enviar(buildDevolucionEmail({ rutaId: payload.rutaId, valoracion: val, categoria, texto: textoLimpio, email: emailLimpio }, env.OWNER_EMAIL));
  } catch (e) {
    console.error('Devolución guardada pero el email falló:', e.message);
  }

  return jsonRes({ ok: true }, cors);
}

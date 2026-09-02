// js/api.js
import { API_BASE_URL } from './config.js';

/** Error listo para mostrar a partir de una respuesta no-OK del Worker. Marca
 *  `.rateLimited` en los 429 para que la UI muestre un mensaje específico. */
function errorDeRespuesta(respuesta, cuerpo) {
  const err = new Error(cuerpo.error || `Error ${respuesta.status}`);
  if (respuesta.status === 429) err.rateLimited = true;
  return err;
}

/**
 * Pide el contenido completo de una ruta al Worker. Lanza un Error con un
 * mensaje ya listo para mostrar al jugador si el token no es válido, ha
 * caducado o la ruta no existe.
 */
export async function obtenerRuta(token, idioma) {
  const url = new URL('/api/ruta', API_BASE_URL);
  url.searchParams.set('t', token);
  url.searchParams.set('idioma', idioma);

  let respuesta;
  try {
    respuesta = await fetch(url);
  } catch {
    throw new Error('No se ha podido conectar. Comprueba tu conexión e inténtalo de nuevo.');
  }

  let cuerpo;
  try {
    cuerpo = await respuesta.json();
  } catch {
    throw new Error('Respuesta inesperada del servidor.');
  }

  if (!respuesta.ok) {
    throw errorDeRespuesta(respuesta, cuerpo);
  }
  return cuerpo; // { rutaId, orderId, idiomaServido, ruta }
}

/** Crea una sesión de pago en Stripe y devuelve la URL a la que redirigir. */
export async function crearCheckoutSession(rutaId, idioma) {
  const respuesta = await fetch(new URL('/api/create-checkout-session', API_BASE_URL), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rutaId, idioma }),
  });
  const cuerpo = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) {
    throw errorDeRespuesta(respuesta, cuerpo);
  }
  return cuerpo.url;
}

/** Verifica un pago ya realizado y, si es válido, devuelve el token de acceso. */
export async function confirmarPago(sessionId) {
  const url = new URL('/api/confirm-payment', API_BASE_URL);
  url.searchParams.set('session_id', sessionId);
  const respuesta = await fetch(url);
  const cuerpo = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) {
    throw errorDeRespuesta(respuesta, cuerpo);
  }
  return cuerpo; // { ok, paid, rutaId, idioma, orderId, token }
}

/** Pide acceso a una ruta gratuita: el Worker acuña el token y envía el
 * email de confirmación, sin pasar por Stripe. */
export async function crearAccesoGratuito(rutaId, idioma, email) {
  const respuesta = await fetch(new URL('/api/acceso-gratuito', API_BASE_URL), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rutaId, idioma, email }),
  });
  const cuerpo = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) {
    throw errorDeRespuesta(respuesta, cuerpo);
  }
  return cuerpo; // { ok, rutaId, idioma, orderId, token }
}

/** Estado de la votación para un votante. Devuelve
 *  { opciones:[{id,etiqueta,votos?}], estadoVotante, miVoto }. */
export async function obtenerVotacion(votante) {
  const url = new URL('/api/votacion', API_BASE_URL);
  url.searchParams.set('votante', votante);
  const respuesta = await fetch(url);
  const cuerpo = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) throw new Error(cuerpo.error || `Error ${respuesta.status}`);
  return cuerpo;
}

export async function emitirVoto(opcionId, votante) {
  const respuesta = await fetch(new URL('/api/votacion/voto', API_BASE_URL), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ opcionId, votante }),
  });
  const cuerpo = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) throw new Error(cuerpo.error || `Error ${respuesta.status}`);
  return cuerpo;
}

export async function enviarPropuesta({ ciudad, nota, email, votante }) {
  const respuesta = await fetch(new URL('/api/votacion/propuesta', API_BASE_URL), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ciudad, nota, email, votante }),
  });
  const cuerpo = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) throw new Error(cuerpo.error || `Error ${respuesta.status}`);
  return cuerpo;
}

/** Envía una devolución. Requiere el token de acceso de la partida. */
export async function enviarDevolucion(token, { rutaId, valoracion, categoria, texto, email, idioma }) {
  const url = new URL('/api/devolucion', API_BASE_URL);
  url.searchParams.set('t', token);
  const respuesta = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rutaId, valoracion, categoria, texto, email, idioma }),
  });
  const cuerpo = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) throw new Error(cuerpo.error || `Error ${respuesta.status}`);
  return cuerpo;
}

// worker/src/index.js — router, mismo patrón que grip-la-seu/worker/src/index.js
import { buildCorsHeaders } from './cors.js';
import { firmarToken, verificarToken } from './acceso.js';
import { cargarContenido } from './contenido.js';
import { precioDeRuta } from './precios.js';
import { buildCheckoutSessionParams, createStripeSession, parseSessionPaymentStatus, pedidoDesdeSession, retrieveStripeSession, validarSesionPagada, sesionReembolsada } from './stripe.js';
import { buildAvisoOwner, buildCustomerEmail, buildOwnerEmail, emailValidoBasico, sendEmail } from './resend.js';
import { consumirCupo } from './throttle.js';
import { entradaValida, leerJsonAcotado } from './entrada.js';
import { debeEnviarEmails, marcarCumplido } from './cumplimiento.js';
import { handleObtenerVotacion, handleEmitirVoto, handleEnviarPropuesta, handleListarPropuestas, handleModerarPropuesta } from './votacion.js';
import { handleEnviarDevolucion } from './devoluciones.js';
// Título de la ruta para el checkout y los emails: no es un dato sensible
// (a diferencia del precio) así que se reutiliza directamente del catálogo
// público en vez de duplicarlo aquí.
import { localizar, rutaPorId } from '../../js/catalogo.js';

const VENTANA_THROTTLE = 900; // 15 min

export async function handleCrearCheckoutSession(request, env, cors, ip) {
  const leido = await leerJsonAcotado(request);
  if (leido.error) return Response.json({ error: leido.error }, { status: leido.status, headers: cors });
  const { rutaId, idioma } = leido.datos || {};

  if (!entradaValida({ rutaId, idioma })) {
    return Response.json({ error: 'Ruta o idioma no válidos' }, { status: 400, headers: cors });
  }

  const cupo = await consumirCupo(env.KV, { ip, accion: 'checkout', limite: 10, ventanaSegundos: VENTANA_THROTTLE });
  if (!cupo.permitido) {
    console.log(JSON.stringify({ evento: 'throttle_bloqueo', accion: 'checkout', ip }));
    return Response.json(
      { error: 'Demasiadas solicitudes, prueba de nuevo en unos minutos' },
      { status: 429, headers: { ...cors, 'Retry-After': String(cupo.reintentarEn) } },
    );
  }

  const precio = precioDeRuta(rutaId);
  if (precio.importe === 0) {
    return Response.json({ error: `"${rutaId}" es una ruta gratuita: usa /api/acceso-gratuito` }, { status: 400, headers: cors });
  }

  const orderId = `ord_${crypto.randomUUID()}`;
  const params = buildCheckoutSessionParams(
    { rutaId, idioma, orderId, tituloRuta: localizar(rutaPorId(rutaId)?.titulo, idioma) },
    env.SITE_URL,
  );
  const session = await createStripeSession(params, env.STRIPE_SECRET_KEY);
  return Response.json({ url: session.url }, { headers: cors });
}

// Ruta gratis: sin Stripe. Acuña el token igual que confirm-payment tras un
// pago real. El email es redundante aquí (gracias.html?gratis=1 ya muestra el
// enlace en pantalla), así que si el cupo de esta IP está agotado se entrega el
// acceso igualmente pero SIN llamar a Resend.
export async function handleAccesoGratuito(request, env, cors, ip) {
  const leido = await leerJsonAcotado(request);
  if (leido.error) return Response.json({ error: leido.error }, { status: leido.status, headers: cors });
  const { rutaId, idioma, email } = leido.datos || {};

  if (!entradaValida({ rutaId, idioma })) {
    return Response.json({ error: 'Ruta o idioma no válidos' }, { status: 400, headers: cors });
  }
  const precio = precioDeRuta(rutaId);
  if (!precio || precio.importe !== 0) {
    return Response.json({ error: `"${rutaId}" no es una ruta gratuita` }, { status: 400, headers: cors });
  }
  if (!emailValidoBasico(email)) {
    return Response.json({ error: 'Email no válido' }, { status: 400, headers: cors });
  }

  const orderId = `ord_${crypto.randomUUID()}`;
  const token = await firmarToken({ rutaId, orderId }, env.TOKEN_SECRET);
  const idiomaFinal = idioma || 'es';
  const tituloRuta = localizar(rutaPorId(rutaId)?.titulo, idiomaFinal);

  const cupo = await consumirCupo(env.KV, { ip, accion: 'acceso-gratuito', limite: 1, ventanaSegundos: VENTANA_THROTTLE });
  let emailEnviado = false;
  if (cupo.permitido) {
    const ownerEmail = buildOwnerEmail({ rutaId, orderId, email, importe: 0 }, env.OWNER_EMAIL);
    const customerEmail = buildCustomerEmail({ rutaId, orderId, idioma: idiomaFinal, email, token, tituloRuta }, env.SITE_URL);
    const envios = await Promise.allSettled([
      sendEmail(ownerEmail, env.RESEND_API_KEY),
      sendEmail(customerEmail, env.RESEND_API_KEY),
    ]);
    emailEnviado = envios.some((e) => e.status === 'fulfilled');
    for (const e of envios) if (e.status === 'rejected') console.error('email_fallo', String(e.reason));
  } else {
    console.log(JSON.stringify({ evento: 'throttle_bloqueo', accion: 'acceso-gratuito', ip }));
  }

  return Response.json({ ok: true, rutaId, idioma: idiomaFinal, orderId, token, emailEnviado }, { headers: cors });
}

// El cliente puede recargar gracias.html tras un pago ya confirmado: el token se
// vuelve a acuñar (válido igualmente) y se devuelve siempre, pero los emails de
// acceso solo se envían una vez por pedido — la marca `fulfilled:<orderId>` en
// KV lo garantiza (con fallback por antigüedad de la sesión si KV no está).
async function handleConfirmarPago(url, env, cors, ip) {
  const sessionId = url.searchParams.get('session_id');
  if (!sessionId || !/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId)) {
    return Response.json({ error: 'session_id inválido' }, { status: 400, headers: cors });
  }

  const cupo = await consumirCupo(env.KV, { ip, accion: 'confirm', limite: 15, ventanaSegundos: VENTANA_THROTTLE });
  if (!cupo.permitido) {
    console.log(JSON.stringify({ evento: 'throttle_bloqueo', accion: 'confirm', ip }));
    return Response.json(
      { error: 'Demasiadas solicitudes, prueba de nuevo en unos minutos' },
      { status: 429, headers: { ...cors, 'Retry-After': String(cupo.reintentarEn) } },
    );
  }

  const session = await retrieveStripeSession(sessionId, env.STRIPE_SECRET_KEY);
  if (!parseSessionPaymentStatus(session)) {
    return Response.json({ ok: true, paid: false }, { headers: { ...cors, 'Cache-Control': 'no-store' } });
  }

  const pedido = pedidoDesdeSession(session);
  const precio = precioDeRuta(pedido.rutaId);

  if (!validarSesionPagada(session, precio)) {
    console.error('pago_incoherente', sessionId, session.amount_total, session.currency, pedido.rutaId);
    try {
      await sendEmail(buildAvisoOwner(`Sesión ${sessionId} pagada con importe/moneda/ruta inesperados`, env.OWNER_EMAIL), env.RESEND_API_KEY);
    } catch (e) {
      console.error('aviso_owner_fallo', String(e));
    }
    return Response.json({ error: 'La sesión de pago no es válida' }, { status: 500, headers: cors });
  }
  if (sesionReembolsada(session)) {
    console.log(JSON.stringify({ evento: 'acceso_denegado_reembolso', orderId: pedido.orderId }));
    return Response.json({ error: 'Este pedido ha sido reembolsado' }, { status: 403, headers: cors });
  }
  console.log(JSON.stringify({ evento: 'pago_validado', orderId: pedido.orderId, rutaId: pedido.rutaId }));

  const token = await firmarToken({ rutaId: pedido.rutaId, orderId: pedido.orderId }, env.TOKEN_SECRET);
  const tituloRuta = localizar(rutaPorId(pedido.rutaId)?.titulo, pedido.idioma);

  if (await debeEnviarEmails(env.KV, pedido.orderId, session)) {
    const ownerEmail = buildOwnerEmail({ ...pedido, importe: precio?.importe }, env.OWNER_EMAIL);
    const envios = [sendEmail(ownerEmail, env.RESEND_API_KEY)];
    if (pedido.email) {
      envios.push(sendEmail(buildCustomerEmail({ ...pedido, token, tituloRuta }, env.SITE_URL), env.RESEND_API_KEY));
    }
    const res = await Promise.allSettled(envios);
    for (const e of res) if (e.status === 'rejected') console.error('email_fallo', String(e.reason));
    await marcarCumplido(env.KV, pedido.orderId);
  } else {
    console.log(JSON.stringify({ evento: 'email_reenvio_saltado', orderId: pedido.orderId }));
  }

  return Response.json(
    { ok: true, paid: true, rutaId: pedido.rutaId, idioma: pedido.idioma, orderId: pedido.orderId, token },
    { headers: { ...cors, 'Cache-Control': 'no-store' } },
  );
}

const IDIOMAS = ['es', 'en', 'fr', 'it'];

export async function handleObtenerRuta(url, env, cors) {
  const token = url.searchParams.get('t');
  const idiomaSolicitado = url.searchParams.get('idioma') || 'es';
  // `rutaId` viene del token firmado (de confianza); solo `idioma` es entrada
  // libre y se limita a la allowlist antes de usarlo como parte de la clave de
  // contenido.js.
  const idioma = IDIOMAS.includes(idiomaSolicitado) ? idiomaSolicitado : 'es';
  const sinCache = { ...cors, 'Cache-Control': 'no-store' };

  const payload = await verificarToken(token, env.TOKEN_SECRET);
  if (!payload) {
    return Response.json({ error: 'Token inválido o caducado' }, { status: 401, headers: sinCache });
  }

  const resultado = cargarContenido(payload.rutaId, idioma);
  if (!resultado) {
    return Response.json({ error: 'Ruta no encontrada' }, { status: 404, headers: sinCache });
  }

  return Response.json(
    {
      rutaId: payload.rutaId,
      orderId: payload.orderId,
      idiomaServido: resultado.idiomaServido,
      ruta: resultado.contenido,
    },
    { headers: sinCache },
  );
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const cors = buildCorsHeaders(origin, env.ALLOWED_ORIGIN);
    const url = new URL(request.url);
    const ip = request.headers.get('CF-Connecting-IP') || '';

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    try {
      if (request.method === 'GET' && url.pathname === '/api/ruta') {
        return await handleObtenerRuta(url, env, cors);
      }
      if (request.method === 'POST' && url.pathname === '/api/create-checkout-session') {
        return await handleCrearCheckoutSession(request, env, cors, ip);
      }
      if (request.method === 'POST' && url.pathname === '/api/acceso-gratuito') {
        return await handleAccesoGratuito(request, env, cors, ip);
      }
      if (request.method === 'GET' && url.pathname === '/api/confirm-payment') {
        return await handleConfirmarPago(url, env, cors, ip);
      }
      if (request.method === 'GET' && url.pathname === '/api/votacion') {
        return await handleObtenerVotacion(request, env, cors);
      }
      if (request.method === 'POST' && url.pathname === '/api/votacion/voto') {
        return await handleEmitirVoto(request, env, cors, ip);
      }
      if (request.method === 'POST' && url.pathname === '/api/votacion/propuesta') {
        return await handleEnviarPropuesta(request, env, cors, ip);
      }
      if (request.method === 'GET' && url.pathname === '/api/admin/propuestas') {
        return await handleListarPropuestas(request, env, cors);
      }
      const modera = url.pathname.match(/^\/api\/admin\/propuestas\/([a-z0-9-]{1,40})$/);
      if (request.method === 'POST' && modera) {
        return await handleModerarPropuesta(request, env, cors, modera[1]);
      }
      if (request.method === 'POST' && url.pathname === '/api/devolucion') {
        return await handleEnviarDevolucion(request, url, env, cors, ip);
      }
    } catch (error) {
      console.error('error_no_controlado', String((error && error.stack) || error));
      return Response.json({ error: 'Error interno' }, { status: 500, headers: cors });
    }

    return new Response('Not found', { status: 404, headers: cors });
  },
};

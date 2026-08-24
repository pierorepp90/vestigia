// worker/src/index.js — router, mismo patrón que grip-la-seu/worker/src/index.js
import { buildCorsHeaders } from './cors.js';
import { firmarToken, verificarToken } from './acceso.js';
import { cargarContenido } from './contenido.js';
import { precioDeRuta } from './precios.js';
import { buildCheckoutSessionParams, createStripeSession, parseSessionPaymentStatus, pedidoDesdeSession, retrieveStripeSession } from './stripe.js';
import { buildCustomerEmail, buildOwnerEmail, emailValidoBasico, sendEmail } from './resend.js';
// Título de la ruta para el checkout y los emails: no es un dato sensible
// (a diferencia del precio) así que se reutiliza directamente del catálogo
// público en vez de duplicarlo aquí.
import { localizar, rutaPorId } from '../../js/catalogo.js';

export async function handleCrearCheckoutSession(request, env, cors) {
  const { rutaId, idioma } = await request.json();
  const precio = precioDeRuta(rutaId);
  if (!precio) {
    return Response.json({ error: `Ruta desconocida: "${rutaId}"` }, { status: 400, headers: cors });
  }
  if (precio.importe === 0) {
    return Response.json({ error: `"${rutaId}" es una ruta gratuita: usa /api/acceso-gratuito` }, { status: 400, headers: cors });
  }

  const orderId = `ord_${crypto.randomUUID()}`;
  const params = buildCheckoutSessionParams({ rutaId, idioma, orderId, tituloRuta: localizar(rutaPorId(rutaId)?.titulo, idioma) }, env.SITE_URL);
  const session = await createStripeSession(params, env.STRIPE_SECRET_KEY);
  return Response.json({ url: session.url }, { headers: cors });
}

// Ruta gratis: sin Stripe. Acuña el token igual que handleConfirmarPago tras
// un pago real, y reenvía el mismo email de Resend — la única diferencia es
// que aquí no hay nada que verificar contra Stripe antes de dar acceso.
export async function handleAccesoGratuito(request, env, cors) {
  const { rutaId, idioma, email } = await request.json();
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

  const ownerEmail = buildOwnerEmail({ rutaId, orderId, email, importe: 0 }, env.OWNER_EMAIL);
  const customerEmail = buildCustomerEmail({ rutaId, orderId, idioma: idiomaFinal, email, token, tituloRuta }, env.SITE_URL);
  await Promise.all([sendEmail(ownerEmail, env.RESEND_API_KEY), sendEmail(customerEmail, env.RESEND_API_KEY)]);

  return Response.json({ ok: true, rutaId, idioma: idiomaFinal, orderId, token }, { headers: cors });
}

// Nota: sin base de datos no hay forma de deduplicar. Si el cliente recarga
// gracias.html tras un pago ya confirmado, esta función vuelve a minar un
// token (válido igualmente) y reenvía ambos emails. Misma limitación
// aceptada que en grip-la-seu — no añadir Workers KV u otra infraestructura
// para esto salvo que el propietario lo pida explícitamente.
async function handleConfirmarPago(url, env, cors) {
  const sessionId = url.searchParams.get('session_id');
  if (!sessionId || !/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId)) {
    return Response.json({ error: 'session_id inválido' }, { status: 400, headers: cors });
  }

  const session = await retrieveStripeSession(sessionId, env.STRIPE_SECRET_KEY);
  if (!parseSessionPaymentStatus(session)) {
    return Response.json({ ok: true, paid: false }, { headers: cors });
  }

  const pedido = pedidoDesdeSession(session);
  const precio = precioDeRuta(pedido.rutaId);
  const token = await firmarToken({ rutaId: pedido.rutaId, orderId: pedido.orderId }, env.TOKEN_SECRET);
  const tituloRuta = localizar(rutaPorId(pedido.rutaId)?.titulo, pedido.idioma);

  const ownerEmail = buildOwnerEmail({ ...pedido, importe: precio?.importe }, env.OWNER_EMAIL);
  const emails = [sendEmail(ownerEmail, env.RESEND_API_KEY)];
  if (pedido.email) {
    const customerEmail = buildCustomerEmail({ ...pedido, token, tituloRuta }, env.SITE_URL);
    emails.push(sendEmail(customerEmail, env.RESEND_API_KEY));
  }
  await Promise.all(emails);

  return Response.json(
    { ok: true, paid: true, rutaId: pedido.rutaId, idioma: pedido.idioma, orderId: pedido.orderId, token },
    { headers: cors },
  );
}

async function handleObtenerRuta(url, env, cors) {
  const token = url.searchParams.get('t');
  const idiomaSolicitado = url.searchParams.get('idioma') || 'es';

  const payload = await verificarToken(token, env.TOKEN_SECRET);
  if (!payload) {
    return Response.json({ error: 'Token inválido o caducado' }, { status: 401, headers: cors });
  }

  const resultado = cargarContenido(payload.rutaId, idiomaSolicitado);
  if (!resultado) {
    return Response.json({ error: 'Ruta no encontrada' }, { status: 404, headers: cors });
  }

  return Response.json(
    {
      rutaId: payload.rutaId,
      orderId: payload.orderId,
      idiomaServido: resultado.idiomaServido,
      ruta: resultado.contenido,
    },
    { headers: cors },
  );
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const cors = buildCorsHeaders(origin, env.ALLOWED_ORIGIN);
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    try {
      if (request.method === 'GET' && url.pathname === '/api/ruta') {
        return await handleObtenerRuta(url, env, cors);
      }
      if (request.method === 'POST' && url.pathname === '/api/create-checkout-session') {
        return await handleCrearCheckoutSession(request, env, cors);
      }
      if (request.method === 'POST' && url.pathname === '/api/acceso-gratuito') {
        return await handleAccesoGratuito(request, env, cors);
      }
      if (request.method === 'GET' && url.pathname === '/api/confirm-payment') {
        return await handleConfirmarPago(url, env, cors);
      }
    } catch (error) {
      return Response.json({ error: error.message }, { status: 500, headers: cors });
    }

    return new Response('Not found', { status: 404, headers: cors });
  },
};

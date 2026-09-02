// worker/src/stripe.js — mismo patrón que grip-la-seu/worker/src/stripe.js:
// fetch plano contra la API de Stripe, sin SDK. `fetchFn` es inyectable
// para poder probar estas funciones con un mock, sin llaves reales.
import { precioDeRuta } from './precios.js';

/**
 * Construye los parámetros del Checkout Session. El precio SIEMPRE sale de
 * precios.js — nunca de lo que mande el cliente — para que nadie pueda
 * comprar una ruta de 29€ pagando 1€ manipulando la petición.
 */
export function buildCheckoutSessionParams({ rutaId, idioma, orderId, tituloRuta }, siteUrl) {
  const precio = precioDeRuta(rutaId);
  if (!precio) throw new Error(`Ruta desconocida: "${rutaId}"`);

  const params = new URLSearchParams();
  params.set('mode', 'payment');
  params.set('success_url', `${siteUrl}/jugar/gracias.html?ruta=${encodeURIComponent(rutaId)}&session_id={CHECKOUT_SESSION_ID}`);
  params.set('cancel_url', `${siteUrl}/ruta/${encodeURIComponent(rutaId)}.html?pago=cancelado`);

  params.set('line_items[0][quantity]', '1');
  params.set('line_items[0][price_data][currency]', precio.moneda);
  params.set('line_items[0][price_data][unit_amount]', String(Math.round(precio.importe * 100)));
  params.set('line_items[0][price_data][product_data][name]', tituloRuta || rutaId);

  params.set('metadata[ruta_id]', rutaId);
  params.set('metadata[idioma]', idioma || 'es');
  params.set('metadata[order_id]', orderId);

  // La aceptación de condiciones (incluye la renuncia al derecho de
  // desistimiento de 14 días para contenido digital de entrega inmediata,
  // ver legal/condiciones.html §5) se exige con un checkbox propio en
  // ruta/*.html antes de llegar aquí — no con consent_collection de Stripe,
  // que requiere activar la cuenta y configurar una "Terms of service URL"
  // en el Dashboard.
  return params;
}

export function parseSessionPaymentStatus(session) {
  return session != null && session.payment_status === 'paid';
}

/**
 * Defensa en profundidad: aunque la sesión la crea este Worker con el precio
 * de precios.js, se vuelve a comprobar al confirmar que el importe, la moneda
 * y la ruta pagados son los esperados. `precioEsperado` = salida de
 * precioDeRuta (importe en euros, moneda en minúsculas).
 */
export function validarSesionPagada(session, precioEsperado) {
  if (!session || session.payment_status !== 'paid') return false;
  if (!precioEsperado) return false;
  if (session.amount_total !== Math.round(precioEsperado.importe * 100)) return false;
  if (session.currency !== precioEsperado.moneda) return false;
  if (!session.metadata || typeof session.metadata.ruta_id !== 'string') return false;
  return true;
}

/** true si el cargo asociado a la sesión ha sido reembolsado (total o
 *  parcialmente). Requiere haber recuperado la sesión con
 *  `expand[]=payment_intent.latest_charge`. */
export function sesionReembolsada(session) {
  const cargo = session?.payment_intent?.latest_charge;
  if (!cargo) return false;
  return cargo.refunded === true || (typeof cargo.amount_refunded === 'number' && cargo.amount_refunded > 0);
}

/** Extrae {rutaId, idioma, orderId, email} de una sesión ya confirmada como pagada. */
export function pedidoDesdeSession(session) {
  const m = session.metadata || {};
  return {
    rutaId: m.ruta_id,
    idioma: m.idioma || 'es',
    orderId: m.order_id,
    email: session.customer_details?.email || session.customer_email || null,
  };
}

export async function createStripeSession(params, secretKey, fetchFn = fetch) {
  const response = await fetchFn('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });
  if (!response.ok) {
    const cuerpo = await response.text();
    let mensaje;
    try {
      mensaje = JSON.parse(cuerpo)?.error?.message;
    } catch {
      // cuerpo no es JSON (p. ej. error de gateway) — se usa el genérico de abajo.
    }
    throw new Error(mensaje || 'Stripe rechazó la creación de la sesión');
  }
  return response.json();
}

export async function retrieveStripeSession(sessionId, secretKey, fetchFn = fetch) {
  // `expand[]=payment_intent.latest_charge` trae el cargo en la misma llamada,
  // para poder comprobar si el pedido fue reembolsado (ver sesionReembolsada).
  const url = `https://api.stripe.com/v1/checkout/sessions/${sessionId}?expand[]=payment_intent.latest_charge`;
  const response = await fetchFn(url, {
    method: 'GET',
    headers: { Authorization: `Bearer ${secretKey}` },
  });
  if (!response.ok) {
    throw new Error('No se pudo recuperar la sesión de Stripe');
  }
  return response.json();
}

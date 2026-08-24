// worker/tests/stripe.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildCheckoutSessionParams,
  parseSessionPaymentStatus,
  pedidoDesdeSession,
  createStripeSession,
  retrieveStripeSession,
} from '../src/stripe.js';

test('buildCheckoutSessionParams toma el precio de precios.js, no permite inventarlo', () => {
  const params = buildCheckoutSessionParams(
    { rutaId: 'barcelona-gotic', idioma: 'es', orderId: 'ord_1', tituloRuta: 'El secreto del Barrio Gótico' },
    'https://vestigia.es',
  );
  assert.equal(params.get('line_items[0][price_data][unit_amount]'), '499'); // 4,99€ (dificultad media) en céntimos
  assert.equal(params.get('line_items[0][price_data][currency]'), 'eur');
  assert.equal(params.get('line_items[0][price_data][product_data][name]'), 'El secreto del Barrio Gótico');
});

test('buildCheckoutSessionParams construye success_url y cancel_url correctas', () => {
  const params = buildCheckoutSessionParams({ rutaId: 'roma-centro', idioma: 'en', orderId: 'ord_2' }, 'https://vestigia.es');
  assert.equal(params.get('success_url'), 'https://vestigia.es/jugar/gracias.html?ruta=roma-centro&session_id={CHECKOUT_SESSION_ID}');
  assert.equal(params.get('cancel_url'), 'https://vestigia.es/ruta/roma-centro.html?pago=cancelado');
});

test('buildCheckoutSessionParams guarda rutaId, idioma y orderId en metadata para recuperarlos tras el pago', () => {
  const params = buildCheckoutSessionParams({ rutaId: 'paris-marais', idioma: 'fr', orderId: 'ord_3' }, 'https://vestigia.es');
  assert.equal(params.get('metadata[ruta_id]'), 'paris-marais');
  assert.equal(params.get('metadata[idioma]'), 'fr');
  assert.equal(params.get('metadata[order_id]'), 'ord_3');
});

test('buildCheckoutSessionParams exige aceptar condiciones antes de pagar (renuncia al derecho de desistimiento)', () => {
  const params = buildCheckoutSessionParams({ rutaId: 'barcelona-gotic', orderId: 'ord_1' }, 'https://vestigia.es');
  assert.equal(params.get('consent_collection[terms_of_service]'), 'required');
});

test('buildCheckoutSessionParams rechaza una ruta que no existe en precios.js', () => {
  assert.throws(() => buildCheckoutSessionParams({ rutaId: 'no-existe', orderId: 'ord_1' }, 'https://vestigia.es'));
});

test('parseSessionPaymentStatus solo es true si payment_status es exactamente "paid"', () => {
  assert.equal(parseSessionPaymentStatus({ payment_status: 'paid' }), true);
  assert.equal(parseSessionPaymentStatus({ payment_status: 'unpaid' }), false);
  assert.equal(parseSessionPaymentStatus({ payment_status: 'no_payment_required' }), false);
  assert.equal(parseSessionPaymentStatus(null), false);
  assert.equal(parseSessionPaymentStatus(undefined), false);
});

test('pedidoDesdeSession reconstruye el pedido desde metadata + datos del cliente', () => {
  const session = {
    metadata: { ruta_id: 'barcelona-gotic', idioma: 'es', order_id: 'ord_9' },
    customer_details: { email: 'cliente@example.com' },
  };
  const pedido = pedidoDesdeSession(session);
  assert.deepEqual(pedido, { rutaId: 'barcelona-gotic', idioma: 'es', orderId: 'ord_9', email: 'cliente@example.com' });
});

test('pedidoDesdeSession usa customer_email como respaldo si no hay customer_details', () => {
  const session = { metadata: { ruta_id: 'roma-centro', order_id: 'ord_5' }, customer_email: 'legacy@example.com' };
  assert.equal(pedidoDesdeSession(session).email, 'legacy@example.com');
  assert.equal(pedidoDesdeSession(session).idioma, 'es'); // por defecto si falta en metadata
});

test('createStripeSession envía Authorization Bearer y el body form-encoded correcto', async () => {
  let peticionCapturada;
  const fetchFalso = async (url, opciones) => {
    peticionCapturada = { url, opciones };
    return { ok: true, json: async () => ({ id: 'cs_test_123', url: 'https://checkout.stripe.com/pay/cs_test_123' }) };
  };

  const params = buildCheckoutSessionParams({ rutaId: 'barcelona-gotic', orderId: 'ord_1' }, 'https://vestigia.es');
  const resultado = await createStripeSession(params, 'sk_test_falsa', fetchFalso);

  assert.equal(peticionCapturada.url, 'https://api.stripe.com/v1/checkout/sessions');
  assert.equal(peticionCapturada.opciones.method, 'POST');
  assert.equal(peticionCapturada.opciones.headers.Authorization, 'Bearer sk_test_falsa');
  assert.equal(peticionCapturada.opciones.headers['Content-Type'], 'application/x-www-form-urlencoded');
  assert.ok(peticionCapturada.opciones.body.includes('metadata%5Bruta_id%5D=barcelona-gotic'));
  assert.equal(resultado.url, 'https://checkout.stripe.com/pay/cs_test_123');
});

test('createStripeSession lanza si Stripe responde con error', async () => {
  const fetchFalso = async () => ({ ok: false });
  const params = buildCheckoutSessionParams({ rutaId: 'barcelona-gotic', orderId: 'ord_1' }, 'https://vestigia.es');
  await assert.rejects(() => createStripeSession(params, 'sk_test_falsa', fetchFalso));
});

test('retrieveStripeSession pide el session_id correcto con autenticación', async () => {
  let urlCapturada;
  const fetchFalso = async (url, opciones) => {
    urlCapturada = url;
    return { ok: true, json: async () => ({ id: 'cs_test_abc', payment_status: 'paid' }) };
  };
  const resultado = await retrieveStripeSession('cs_test_abc', 'sk_test_falsa', fetchFalso);
  assert.ok(urlCapturada.includes('cs_test_abc'));
  assert.equal(resultado.payment_status, 'paid');
});

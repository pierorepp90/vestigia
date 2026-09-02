// worker/tests/resend.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildOwnerEmail, buildCustomerEmail, sendEmail, emailValidoBasico, buildAvisoOwner } from '../src/resend.js';

test('buildAvisoOwner arma un email al owner con el texto escapado', () => {
  const email = buildAvisoOwner('Sesión cs_test_1 con importe <raro>', 'owner@example.com');
  assert.deepEqual(email.to, ['owner@example.com']);
  assert.match(email.subject, /Vestigia/);
  assert.ok(!email.html.includes('<raro>'));
  assert.match(email.html, /&lt;raro&gt;/);
});

test('buildOwnerEmail incluye ruta, pedido, email del cliente e importe', () => {
  const email = buildOwnerEmail(
    { rutaId: 'barcelona-gotic', orderId: 'ord_1', email: 'cliente@example.com', importe: 29 },
    'owner@example.com',
  );
  assert.deepEqual(email.to, ['owner@example.com']);
  assert.match(email.subject, /barcelona-gotic/);
  assert.match(email.html, /ord_1/);
  assert.match(email.html, /cliente@example\.com/);
  assert.match(email.html, /29\.00€/);
});

test('buildOwnerEmail escapa HTML en campos que vienen de fuera (email del cliente)', () => {
  const email = buildOwnerEmail(
    { rutaId: 'barcelona-gotic', orderId: 'ord_1', email: '<script>alert(1)</script>', importe: 29 },
    'owner@example.com',
  );
  assert.ok(!email.html.includes('<script>'));
  assert.match(email.html, /&lt;script&gt;/);
});

test('buildCustomerEmail incluye el enlace de juego con ruta, token e idioma', () => {
  const email = buildCustomerEmail(
    { rutaId: 'roma-centro', orderId: 'ord_2', idioma: 'en', email: 'cliente@example.com', token: 'TOKEN123', tituloRuta: 'Los enigmas del Centro Storico' },
    'https://vestigia.es',
  );
  assert.deepEqual(email.to, ['cliente@example.com']);
  assert.match(email.subject, /Los enigmas del Centro Storico/);
  assert.match(email.html, /https:\/\/vestigia\.es\/jugar\/\?ruta=roma-centro&t=TOKEN123&idioma=en/);
  assert.match(email.html, /https:\/\/vestigia\.es\/jugar\/imprimir\.html\?ruta=roma-centro&t=TOKEN123&idioma=en/);
});

test('buildCustomerEmail funciona sin tituloRuta (usa el rutaId igualmente en el asunto)', () => {
  const email = buildCustomerEmail(
    { rutaId: 'paris-marais', orderId: 'ord_3', email: 'x@example.com', token: 'T' },
    'https://vestigia.es',
  );
  assert.match(email.subject, /paris-marais/);
});

test('buildCustomerEmail añade las recomendaciones de la zona y los pases de la ciudad cuando existen', () => {
  const email = buildCustomerEmail(
    { rutaId: 'barcelona-born', orderId: 'ord_4', email: 'x@example.com', token: 'T' },
    'https://vestigia.es',
  );
  // zona (barcelona-born)
  assert.match(email.html, /Moll de la Fusta/);
  assert.match(email.html, /El Xampanyet/);
  assert.match(email.html, /Arc de Triomf/);
  // pases de ciudad (barcelona, compartidos por las 3 rutas de la ciudad)
  assert.match(email.html, /Hola Barcelona Travel Card/);
  assert.match(email.html, /Articket BCN/);
  assert.match(email.html, /Barcelona Card/);
  assert.match(email.html, /articketbcn\.org/);
});

test('buildCustomerEmail no añade la sección de recomendaciones si la ruta no tiene datos ni ciudad con pases', () => {
  const email = buildCustomerEmail(
    { rutaId: 'ruta-inexistente', orderId: 'ord_5', email: 'x@example.com', token: 'T' },
    'https://vestigia.es',
  );
  assert.ok(!email.html.includes('recomendaciones gratis'));
});

test('sendEmail manda Authorization y Content-Type correctos, y devuelve el JSON de respuesta', async () => {
  let capturada;
  const fetchFalso = async (url, opciones) => {
    capturada = { url, opciones };
    return { ok: true, json: async () => ({ id: 'email_123' }) };
  };
  const resultado = await sendEmail({ to: ['a@example.com'] }, 're_falsa', fetchFalso);
  assert.equal(capturada.url, 'https://api.resend.com/emails');
  assert.equal(capturada.opciones.headers.Authorization, 'Bearer re_falsa');
  assert.equal(capturada.opciones.headers['Content-Type'], 'application/json');
  assert.equal(resultado.id, 'email_123');
});

test('sendEmail lanza si Resend responde con error', async () => {
  const fetchFalso = async () => ({ ok: false });
  await assert.rejects(() => sendEmail({}, 're_falsa', fetchFalso));
});

test('emailValidoBasico acepta direcciones con formato correcto', () => {
  assert.equal(emailValidoBasico('cliente@example.com'), true);
  assert.equal(emailValidoBasico('nombre.apellido@dominio.es'), true);
});

test('emailValidoBasico rechaza valores sin @, sin dominio, vacíos o no-string', () => {
  assert.equal(emailValidoBasico('no-es-un-email'), false);
  assert.equal(emailValidoBasico('falta-dominio@'), false);
  assert.equal(emailValidoBasico('@falta-usuario.com'), false);
  assert.equal(emailValidoBasico(''), false);
  assert.equal(emailValidoBasico(null), false);
  assert.equal(emailValidoBasico(undefined), false);
  assert.equal(emailValidoBasico(42), false);
});

test('emailValidoBasico rechaza direcciones excesivamente largas', () => {
  const local = 'a'.repeat(250);
  assert.equal(emailValidoBasico(`${local}@b.com`), false);
});

test('emailValidoBasico rechaza bytes de control (p. ej. byte nulo)', () => {
  assert.equal(emailValidoBasico('a@b.com '), false);
  assert.equal(emailValidoBasico('a@b.com\n'), false);
});

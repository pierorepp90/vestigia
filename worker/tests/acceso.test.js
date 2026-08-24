// worker/tests/acceso.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { firmarToken, verificarToken } from '../src/acceso.js';

const SECRETO = 'secreto-de-pruebas-no-usar-en-produccion';
const OTRO_SECRETO = 'otro-secreto-completamente-distinto';

test('un token recién firmado se verifica correctamente y devuelve su payload', async () => {
  const token = await firmarToken({ rutaId: 'barcelona-gotic', orderId: 'ord_123' }, SECRETO);
  const payload = await verificarToken(token, SECRETO);
  assert.ok(payload);
  assert.equal(payload.rutaId, 'barcelona-gotic');
  assert.equal(payload.orderId, 'ord_123');
  assert.ok(payload.exp > Math.floor(Date.now() / 1000));
});

test('el token tiene el formato payload.firma separado por un único punto', async () => {
  const token = await firmarToken({ rutaId: 'roma-centro', orderId: 'ord_1' }, SECRETO);
  assert.equal(token.split('.').length, 2);
});

test('verificar con un secreto distinto al que firmó rechaza el token', async () => {
  const token = await firmarToken({ rutaId: 'barcelona-gotic', orderId: 'ord_123' }, SECRETO);
  const payload = await verificarToken(token, OTRO_SECRETO);
  assert.equal(payload, null);
});

test('alterar un solo carácter del payload invalida la firma', async () => {
  const token = await firmarToken({ rutaId: 'barcelona-gotic', orderId: 'ord_123' }, SECRETO);
  const [payloadB64, firmaB64] = token.split('.');
  // Cambia el último carácter de la parte de datos, dejando la firma intacta.
  const alterado = payloadB64.slice(0, -1) + (payloadB64.slice(-1) === 'a' ? 'b' : 'a');
  const tokenAlterado = `${alterado}.${firmaB64}`;
  assert.equal(await verificarToken(tokenAlterado, SECRETO), null);
});

test('un token caducado se rechaza aunque la firma sea válida', async () => {
  const token = await firmarToken({ rutaId: 'barcelona-gotic', orderId: 'ord_123' }, SECRETO, -10); // caducó hace 10s
  assert.equal(await verificarToken(token, SECRETO), null);
});

test('un token para una ruta no se puede reutilizar leyendo otra (rutaId viaja dentro, firmado)', async () => {
  const token = await firmarToken({ rutaId: 'barcelona-gotic', orderId: 'ord_123' }, SECRETO);
  const payload = await verificarToken(token, SECRETO);
  assert.notEqual(payload.rutaId, 'roma-centro');
  assert.equal(payload.rutaId, 'barcelona-gotic');
});

test('entradas degeneradas nunca lanzan, siempre devuelven null', async () => {
  assert.equal(await verificarToken('', SECRETO), null);
  assert.equal(await verificarToken('no-tiene-punto', SECRETO), null);
  assert.equal(await verificarToken('demasiadas.partes.aqui', SECRETO), null);
  assert.equal(await verificarToken('...', SECRETO), null);
  assert.equal(await verificarToken(null, SECRETO), null);
  assert.equal(await verificarToken(undefined, SECRETO), null);
  assert.equal(await verificarToken('%%%no-es-base64%%%.abc', SECRETO), null);
});

test('firmarToken exige rutaId y orderId', async () => {
  await assert.rejects(() => firmarToken({ rutaId: 'barcelona-gotic' }, SECRETO));
  await assert.rejects(() => firmarToken({ orderId: 'ord_1' }, SECRETO));
});

test('dos tokens para el mismo pedido son idénticos solo si se firman en el mismo segundo', async () => {
  // No es un requisito de seguridad, pero documenta el comportamiento: el
  // token no es aleatorio, es determinista dado el mismo payload+exp.
  const a = await firmarToken({ rutaId: 'barcelona-gotic', orderId: 'ord_1' }, SECRETO, 1000);
  const b = await firmarToken({ rutaId: 'barcelona-gotic', orderId: 'ord_1' }, SECRETO, 1000);
  assert.equal(a, b);
});

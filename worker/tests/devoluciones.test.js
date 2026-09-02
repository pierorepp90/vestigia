// worker/tests/devoluciones.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearD1Falsa } from './helpers/fake-d1.js';
import * as dbReal from '../src/db.js';
import { firmarToken } from '../src/acceso.js';
import { handleEnviarDevolucion } from '../src/devoluciones.js';

const CORS = { 'Access-Control-Allow-Origin': '*' };
const SECRET = 'secreto-token';
const IP = '1.1.1.1';

/** doble de request con body JSON y Content-Length coherente (leerJsonAcotado
 *  lee la cabecera). */
function req(body) {
  const s = JSON.stringify(body ?? {});
  return {
    headers: { get: (h) => (h.toLowerCase() === 'content-length' ? String(s.length) : null) },
    json: async () => body,
  };
}
function url(t) {
  const u = new URL('https://api.test/api/devolucion');
  if (t) u.searchParams.set('t', t);
  return u;
}
function env(DB, envios) {
  // sin KV → throttle abierto. `_enviar` intercepta el email en tests.
  return { DB, TOKEN_SECRET: SECRET, RESEND_API_KEY: 'k', OWNER_EMAIL: 'o@t', _enviar: async (p) => envios.push(p) };
}

test('devolución válida: guarda en D1 y envía email', async () => {
  const DB = crearD1Falsa();
  const envios = [];
  const token = await firmarToken({ rutaId: 'roma-centro', orderId: 'ord_1' }, SECRET);
  const res = await handleEnviarDevolucion(
    req({ rutaId: 'roma-centro', valoracion: 4, categoria: 'enigmas', texto: 'gran ruta', email: 'x@y.com', idioma: 'es' }),
    url(token), env(DB, envios), CORS, IP, dbReal,
  );
  assert.equal((await res.json()).ok, true);
  assert.equal(DB._tablas.devoluciones.length, 1);
  assert.equal(DB._tablas.devoluciones[0].order_id, 'ord_1');
  assert.equal(envios.length, 1);
});

test('sin token válido → 401 y no toca D1', async () => {
  const DB = crearD1Falsa();
  const res = await handleEnviarDevolucion(
    req({ rutaId: 'roma-centro', valoracion: 4, categoria: 'enigmas', texto: 'x' }),
    url('token-basura'), env(DB, []), CORS, IP, dbReal,
  );
  assert.equal(res.status, 401);
  assert.equal(DB._tablas.devoluciones.length, 0);
});

test('rutaId del cuerpo que no coincide con el del token → 400', async () => {
  const DB = crearD1Falsa();
  const token = await firmarToken({ rutaId: 'roma-centro', orderId: 'ord_1' }, SECRET);
  const res = await handleEnviarDevolucion(
    req({ rutaId: 'paris-marais', valoracion: 4, categoria: 'enigmas', texto: 'x' }),
    url(token), env(DB, []), CORS, IP, dbReal,
  );
  assert.equal(res.status, 400);
});

test('valoración fuera de 1..5 / categoría desconocida / texto vacío → 400', async () => {
  const DB = crearD1Falsa();
  const token = await firmarToken({ rutaId: 'roma-centro', orderId: 'ord_1' }, SECRET);
  for (const cuerpo of [
    { rutaId: 'roma-centro', valoracion: 0, categoria: 'enigmas', texto: 'x' },
    { rutaId: 'roma-centro', valoracion: 6, categoria: 'enigmas', texto: 'x' },
    { rutaId: 'roma-centro', valoracion: 3, categoria: 'inventada', texto: 'x' },
    { rutaId: 'roma-centro', valoracion: 3, categoria: 'enigmas', texto: '   ' },
  ]) {
    const res = await handleEnviarDevolucion(req(cuerpo), url(token), env(DB, []), CORS, IP, dbReal);
    assert.equal(res.status, 400, JSON.stringify(cuerpo));
  }
  assert.equal(DB._tablas.devoluciones.length, 0);
});

test('email con formato inválido → 400', async () => {
  const DB = crearD1Falsa();
  const token = await firmarToken({ rutaId: 'roma-centro', orderId: 'ord_1' }, SECRET);
  const res = await handleEnviarDevolucion(
    req({ rutaId: 'roma-centro', valoracion: 3, categoria: 'otro', texto: 'ok', email: 'no-es-email' }),
    url(token), env(DB, []), CORS, IP, dbReal,
  );
  assert.equal(res.status, 400);
});

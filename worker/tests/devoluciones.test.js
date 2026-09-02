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

/** doble de request con body JSON y Content-Length en BYTES (leerJsonAcotado
 *  compara la cabecera contra un tope en bytes, y un carácter acentuado ocupa
 *  ~2 B en UTF-8). */
function req(body) {
  const s = JSON.stringify(body ?? {});
  const bytes = String(new TextEncoder().encode(s).length);
  return {
    headers: { get: (h) => (h.toLowerCase() === 'content-length' ? bytes : null) },
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

test('idioma del cuerpo se guarda tal cual si está en la allowlist (en)', async () => {
  const DB = crearD1Falsa();
  const envios = [];
  const token = await firmarToken({ rutaId: 'roma-centro', orderId: 'ord_1' }, SECRET);
  const res = await handleEnviarDevolucion(
    req({ rutaId: 'roma-centro', valoracion: 4, categoria: 'enigmas', texto: 'great trail', idioma: 'en' }),
    url(token), env(DB, envios), CORS, IP, dbReal,
  );
  assert.equal((await res.json()).ok, true);
  assert.equal(DB._tablas.devoluciones.length, 1);
  assert.equal(DB._tablas.devoluciones[0].idioma, 'en');
});

test('idioma del cuerpo fuera de la allowlist cae a es', async () => {
  const DB = crearD1Falsa();
  const envios = [];
  const token = await firmarToken({ rutaId: 'roma-centro', orderId: 'ord_1' }, SECRET);
  const res = await handleEnviarDevolucion(
    req({ rutaId: 'roma-centro', valoracion: 4, categoria: 'enigmas', texto: 'gran ruta', idioma: 'xx' }),
    url(token), env(DB, envios), CORS, IP, dbReal,
  );
  assert.equal((await res.json()).ok, true);
  assert.equal(DB._tablas.devoluciones.length, 1);
  assert.equal(DB._tablas.devoluciones[0].idioma, 'es');
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

test('comentario de 2000 caracteres acentuados (~4 KB) → 200; 2001 → 400', async () => {
  const token = await firmarToken({ rutaId: 'roma-centro', orderId: 'ord_1' }, SECRET);

  const DB1 = crearD1Falsa();
  const envios = [];
  const ok = await handleEnviarDevolucion(
    req({ rutaId: 'roma-centro', valoracion: 4, categoria: 'enigmas', texto: 'á'.repeat(2000), idioma: 'es' }),
    url(token), env(DB1, envios), CORS, IP, dbReal,
  );
  assert.equal(ok.status, 200);
  assert.equal((await ok.json()).ok, true);
  assert.equal(DB1._tablas.devoluciones.length, 1);
  assert.equal(DB1._tablas.devoluciones[0].texto.length, 2000);

  const DB2 = crearD1Falsa();
  const largo = await handleEnviarDevolucion(
    req({ rutaId: 'roma-centro', valoracion: 4, categoria: 'enigmas', texto: 'a'.repeat(2001), idioma: 'es' }),
    url(token), env(DB2, []), CORS, IP, dbReal,
  );
  assert.equal(largo.status, 400);
  assert.match((await largo.json()).error, /demasiado largo/i);
  assert.equal(DB2._tablas.devoluciones.length, 0);
});

test('throttle agotado → 429 con Retry-After y sin escribir en D1', async () => {
  const DB = crearD1Falsa();
  const token = await firmarToken({ rutaId: 'roma-centro', orderId: 'ord_1' }, SECRET);
  const kvLleno = {
    get: async () => ({ n: 5, reset: Math.floor(Date.now() / 1000) + 300 }),
    put: async () => {},
  };
  const res = await handleEnviarDevolucion(
    req({ rutaId: 'roma-centro', valoracion: 4, categoria: 'enigmas', texto: 'ok', idioma: 'es' }),
    url(token),
    { DB, TOKEN_SECRET: SECRET, KV: kvLleno, RESEND_API_KEY: 'k', OWNER_EMAIL: 'o@t', _enviar: async () => {} },
    CORS, IP, dbReal,
  );
  assert.equal(res.status, 429);
  assert.match(res.headers.get('Retry-After'), /^\d+$/);
  assert.equal(DB._tablas.devoluciones.length, 0);
});

test('un fallo de Resend no tira la devolución ya guardada (200 + fila en D1)', async () => {
  const DB = crearD1Falsa();
  const token = await firmarToken({ rutaId: 'roma-centro', orderId: 'ord_1' }, SECRET);
  const origConsoleError = console.error;
  console.error = () => {};
  try {
    const res = await handleEnviarDevolucion(
      req({ rutaId: 'roma-centro', valoracion: 4, categoria: 'enigmas', texto: 'gran ruta', idioma: 'es' }),
      url(token),
      { DB, TOKEN_SECRET: SECRET, RESEND_API_KEY: 'k', OWNER_EMAIL: 'o@t', _enviar: async () => { throw new Error('Resend caído'); } },
      CORS, IP, dbReal,
    );
    assert.equal(res.status, 200);
    assert.equal((await res.json()).ok, true);
    assert.equal(DB._tablas.devoluciones.length, 1);
  } finally {
    console.error = origConsoleError;
  }
});

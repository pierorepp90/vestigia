// worker/tests/entrada.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { entradaValida, leerJsonAcotado } from '../src/entrada.js';

test('entradaValida acepta ruta e idioma soportados', () => {
  assert.equal(entradaValida({ rutaId: 'barcelona-gotic', idioma: 'es' }), true);
  assert.equal(entradaValida({ rutaId: 'roma-centro', idioma: 'en' }), true);
  assert.equal(entradaValida({ rutaId: 'napoles-spaccanapoli', idioma: 'it' }), true);
});

test('entradaValida acepta idioma ausente', () => {
  assert.equal(entradaValida({ rutaId: 'barcelona-gotic' }), true);
});

test('entradaValida rechaza idioma no soportado', () => {
  assert.equal(entradaValida({ rutaId: 'barcelona-gotic', idioma: 'de' }), false);
  assert.equal(entradaValida({ rutaId: 'barcelona-gotic', idioma: 'es-ES' }), false);
});

test('entradaValida rechaza rutaId inexistente o con forma inválida', () => {
  assert.equal(entradaValida({ rutaId: 'no-existe', idioma: 'es' }), false);
  assert.equal(entradaValida({ rutaId: '../secretos', idioma: 'es' }), false);
  assert.equal(entradaValida({ rutaId: '__proto__', idioma: 'es' }), false);
  assert.equal(entradaValida({ rutaId: 123, idioma: 'es' }), false);
  assert.equal(entradaValida({}), false);
});

test('leerJsonAcotado devuelve los datos de un body válido', async () => {
  const req = { headers: { get: () => '20' }, json: async () => ({ a: 1 }) };
  assert.deepEqual(await leerJsonAcotado(req), { datos: { a: 1 } });
});

test('leerJsonAcotado rechaza body mayor que el límite con 413', async () => {
  const req = { headers: { get: () => '5000' }, json: async () => ({}) };
  assert.equal((await leerJsonAcotado(req)).status, 413);
});

test('leerJsonAcotado rechaza JSON inválido con 400', async () => {
  const req = { headers: { get: () => '10' }, json: async () => { throw new SyntaxError('bad'); } };
  assert.equal((await leerJsonAcotado(req)).status, 400);
});

test('leerJsonAcotado tolera Content-Length ausente', async () => {
  const req = { headers: { get: () => null }, json: async () => ({ ok: true }) };
  assert.deepEqual(await leerJsonAcotado(req), { datos: { ok: true } });
});

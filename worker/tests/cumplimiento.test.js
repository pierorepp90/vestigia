// worker/tests/cumplimiento.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { debeEnviarEmails, marcarCumplido } from '../src/cumplimiento.js';

function crearKvFalso(inicial = {}) {
  const mapa = new Map(Object.entries(inicial));
  return {
    async get(clave) { return mapa.get(clave) ?? null; },
    async put(clave, valor) { mapa.set(clave, valor); },
    _mapa: mapa,
  };
}

const ahoraMs = Date.now();
const ahoraSeg = Math.floor(ahoraMs / 1000);

test('con KV y sin marca: debe enviar', async () => {
  assert.equal(await debeEnviarEmails(crearKvFalso(), 'ord_1', {}, ahoraMs), true);
});

test('con KV y marca presente: no debe enviar', async () => {
  const kv = crearKvFalso({ 'fulfilled:ord_1': '123' });
  assert.equal(await debeEnviarEmails(kv, 'ord_1', {}, ahoraMs), false);
});

test('sin KV y sesión reciente: debe enviar', async () => {
  assert.equal(await debeEnviarEmails(null, 'ord_1', { created: ahoraSeg - 60 }, ahoraMs), true);
});

test('sin KV y sesión antigua (>1h): no debe enviar', async () => {
  assert.equal(await debeEnviarEmails(null, 'ord_1', { created: ahoraSeg - 7200 }, ahoraMs), false);
});

test('con KV caído cae al criterio por tiempo', async () => {
  const kv = { get: async () => { throw new Error('kv down'); }, put: async () => {} };
  assert.equal(await debeEnviarEmails(kv, 'ord_1', { created: ahoraSeg - 60 }, ahoraMs), true);
});

test('marcarCumplido escribe la marca con TTL', async () => {
  const kv = crearKvFalso();
  let opciones;
  kv.put = async (clave, valor, opts) => { kv._mapa.set(clave, valor); opciones = opts; };
  await marcarCumplido(kv, 'ord_9', ahoraMs);
  assert.equal(kv._mapa.get('fulfilled:ord_9'), String(ahoraMs));
  assert.ok(opciones.expirationTtl >= 60 * 60 * 24 * 30);
});

test('marcarCumplido sin KV no lanza', async () => {
  await marcarCumplido(null, 'ord_9', ahoraMs);
});

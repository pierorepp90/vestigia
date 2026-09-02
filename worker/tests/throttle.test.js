// worker/tests/throttle.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { consumirCupo } from '../src/throttle.js';

function crearKvFalso(inicial = {}) {
  const mapa = new Map(Object.entries(inicial));
  return {
    async get(clave, tipo) {
      const v = mapa.get(clave);
      if (v == null) return null;
      return tipo === 'json' ? JSON.parse(v) : v;
    },
    async put(clave, valor) { mapa.set(clave, valor); },
    _mapa: mapa,
  };
}

const ahora = () => Math.floor(Date.now() / 1000);

test('sin kv siempre permite', async () => {
  assert.deepEqual(
    await consumirCupo(null, { ip: '1.2.3.4', accion: 'x', limite: 1, ventanaSegundos: 900 }),
    { permitido: true },
  );
});

test('sin ip siempre permite', async () => {
  assert.deepEqual(
    await consumirCupo(crearKvFalso(), { ip: '', accion: 'x', limite: 1, ventanaSegundos: 900 }),
    { permitido: true },
  );
});

test('primera petición pasa y crea el registro con n=1', async () => {
  const kv = crearKvFalso();
  const r = await consumirCupo(kv, { ip: '1.2.3.4', accion: 'acceso-gratuito', limite: 1, ventanaSegundos: 900 });
  assert.equal(r.permitido, true);
  const guardado = JSON.parse(kv._mapa.get('rl:acceso-gratuito:1.2.3.4'));
  assert.equal(guardado.n, 1);
  assert.ok(guardado.reset > ahora());
});

test('alcanzado el límite bloquea con reintentarEn', async () => {
  const kv = crearKvFalso({ 'rl:c:9.9.9.9': JSON.stringify({ n: 1, reset: ahora() + 500 }) });
  const r = await consumirCupo(kv, { ip: '9.9.9.9', accion: 'c', limite: 1, ventanaSegundos: 900 });
  assert.equal(r.permitido, false);
  assert.ok(r.reintentarEn > 0 && r.reintentarEn <= 500);
});

test('por debajo del límite incrementa n y conserva reset', async () => {
  const reset = ahora() + 500;
  const kv = crearKvFalso({ 'rl:c:8.8.8.8': JSON.stringify({ n: 1, reset }) });
  const r = await consumirCupo(kv, { ip: '8.8.8.8', accion: 'c', limite: 5, ventanaSegundos: 900 });
  assert.equal(r.permitido, true);
  const guardado = JSON.parse(kv._mapa.get('rl:c:8.8.8.8'));
  assert.equal(guardado.n, 2);
  assert.equal(guardado.reset, reset);
});

test('ventana expirada reinicia el contador', async () => {
  const kv = crearKvFalso({ 'rl:c:7.7.7.7': JSON.stringify({ n: 9, reset: ahora() - 10 }) });
  const r = await consumirCupo(kv, { ip: '7.7.7.7', accion: 'c', limite: 1, ventanaSegundos: 900 });
  assert.equal(r.permitido, true);
  assert.equal(JSON.parse(kv._mapa.get('rl:c:7.7.7.7')).n, 1);
});

test('un fallo de kv.get no bloquea', async () => {
  const kv = { get: async () => { throw new Error('kv caído'); }, put: async () => {} };
  const r = await consumirCupo(kv, { ip: '1.1.1.1', accion: 'c', limite: 1, ventanaSegundos: 900 });
  assert.equal(r.permitido, true);
});

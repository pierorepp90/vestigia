// worker/tests/votacion.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearD1Falsa } from './helpers/fake-d1.js';
import * as dbReal from '../src/db.js';
import { handleObtenerVotacion, handleEmitirVoto } from '../src/votacion.js';
import { hashIp } from '../src/hash.js';

const CORS = { 'Access-Control-Allow-Origin': '*' };

function req(url, { body, headers } = {}) {
  return {
    url: `https://api.test${url}`,
    headers: { get: (h) => (headers || {})[h.toLowerCase()] ?? null },
    json: async () => body,
  };
}

const SEMILLA = {
  voto_opciones: [
    { id: 'praga', etiqueta: '{"es":"Praga","en":"Prague"}', estado: 'oficial', creada_en: 0 },
    { id: 'viena', etiqueta: '{"es":"Viena"}', estado: 'oficial', creada_en: 0 },
  ],
};

test('GET votación sin voto previo: opciones sin recuentos, estadoVotante sin_voto', async () => {
  const DB = crearD1Falsa(SEMILLA);
  const res = await handleObtenerVotacion(req('/api/votacion?votante=u1'), { DB }, CORS, dbReal);
  const cuerpo = await res.json();
  assert.equal(cuerpo.estadoVotante, 'sin_voto');
  assert.equal(cuerpo.miVoto, null);
  assert.deepEqual(cuerpo.opciones.map((o) => o.id).sort(), ['praga', 'viena']);
  assert.ok(cuerpo.opciones.every((o) => !('votos' in o)));
});

test('GET votación con voto activo: incluye recuentos y miVoto', async () => {
  const DB = crearD1Falsa(SEMILLA);
  await dbReal.registrarVoto({ DB }, { opcionId: 'praga', votante: 'u1', ipHash: 'h', ahora: 1 });
  const res = await handleObtenerVotacion(req('/api/votacion?votante=u1'), { DB }, CORS, dbReal);
  const cuerpo = await res.json();
  assert.equal(cuerpo.estadoVotante, 'voto_activo');
  assert.equal(cuerpo.miVoto, 'praga');
  const praga = cuerpo.opciones.find((o) => o.id === 'praga');
  assert.equal(praga.votos, 1);
});

test('GET votación con propuesta pendiente: estadoVotante propuesta_pendiente, sin recuentos', async () => {
  const DB = crearD1Falsa(SEMILLA);
  await dbReal.crearPropuestaConVoto({ DB }, {
    opcionId: 'oporto', etiquetaJson: '{"es":"Oporto"}', email: null, nota: null, votante: 'u1', ipHash: 'h', ahora: 1,
  });
  const res = await handleObtenerVotacion(req('/api/votacion?votante=u1'), { DB }, CORS, dbReal);
  const cuerpo = await res.json();
  assert.equal(cuerpo.estadoVotante, 'propuesta_pendiente');
  assert.ok(cuerpo.opciones.every((o) => !('votos' in o)));
});

test('GET votación sin parámetro votante: 400', async () => {
  const DB = crearD1Falsa(SEMILLA);
  const res = await handleObtenerVotacion(req('/api/votacion'), { DB }, CORS, dbReal);
  assert.equal(res.status, 400);
});

// --- Task B2: handleEmitirVoto ---
// El `ip` va como argumento posicional (infra de seguridad ya en master);
// `env` en tests no trae `KV`, así que `consumirCupo` cae en abierto.
const ENV = (DB) => ({ DB, IP_SALT: 'sal' });

test('POST voto válido: registra y devuelve recuentos', async () => {
  const DB = crearD1Falsa(SEMILLA);
  const res = await handleEmitirVoto(
    req('/api/votacion/voto', { body: { opcionId: 'praga', votante: 'u1' } }),
    ENV(DB), CORS, '1.1.1.1', dbReal,
  );
  const cuerpo = await res.json();
  assert.equal(cuerpo.ok, true);
  assert.equal(cuerpo.miVoto, 'praga');
  assert.equal(cuerpo.opciones.find((o) => o.id === 'praga').votos, 1);
});

test('POST voto: segundo voto del mismo votante → 409', async () => {
  const DB = crearD1Falsa(SEMILLA);
  await dbReal.registrarVoto({ DB }, { opcionId: 'praga', votante: 'u1', ipHash: 'x', ahora: 1 });
  const res = await handleEmitirVoto(
    req('/api/votacion/voto', { body: { opcionId: 'viena', votante: 'u1' } }),
    ENV(DB), CORS, '1.1.1.1', dbReal,
  );
  assert.equal(res.status, 409);
});

test('POST voto: opción inexistente o no votable → 400', async () => {
  const DB = crearD1Falsa(SEMILLA);
  const res = await handleEmitirVoto(
    req('/api/votacion/voto', { body: { opcionId: 'no-existe', votante: 'u1' } }),
    ENV(DB), CORS, '1.1.1.1', dbReal,
  );
  assert.equal(res.status, 400);
});

test('POST voto: 4º voto desde la misma IP → 429', async () => {
  const DB = crearD1Falsa(SEMILLA);
  const ipHash = await hashIp('9.9.9.9', 'sal');
  for (const u of ['a', 'b', 'c']) {
    await dbReal.registrarVoto({ DB }, { opcionId: 'praga', votante: u, ipHash, ahora: 1 });
  }
  const res = await handleEmitirVoto(
    req('/api/votacion/voto', { body: { opcionId: 'viena', votante: 'nuevo' } }),
    ENV(DB), CORS, '9.9.9.9', dbReal,
  );
  assert.equal(res.status, 429);
});

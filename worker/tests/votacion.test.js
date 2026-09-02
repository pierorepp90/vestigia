// worker/tests/votacion.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearD1Falsa } from './helpers/fake-d1.js';
import * as dbReal from '../src/db.js';
import { handleObtenerVotacion, handleEmitirVoto, handleEnviarPropuesta } from '../src/votacion.js';
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

// --- Task B3: handleEnviarPropuesta ---
const ENV2 = (DB, envios) => ({
  DB, IP_SALT: 'sal', RESEND_API_KEY: 'k', OWNER_EMAIL: 'owner@test', SITE_URL: 'https://vestigia.fun',
  _enviar: async (payload) => { envios.push(payload); },
});

test('POST propuesta válida: crea pendiente + voto en espera + email al propietario', async () => {
  const DB = crearD1Falsa(SEMILLA);
  const envios = [];
  const res = await handleEnviarPropuesta(
    req('/api/votacion/propuesta', {
      body: { ciudad: 'Oporto, Ribeira', nota: 'la Ribeira es perfecta', email: 'x@y.com', votante: 'u5' },
    }),
    ENV2(DB, envios), CORS, '2.2.2.2', dbReal,
  );
  const cuerpo = await res.json();
  assert.equal(cuerpo.ok, true);
  assert.equal(envios.length, 1);
  assert.match(envios[0].subject, /propuesta/i);
  assert.match(envios[0].html, /Oporto, Ribeira/);
  const voto = await dbReal.votoDeVotante({ DB }, 'u5');
  assert.equal(voto.estado, 'en_espera');
});

test('POST propuesta: votante que ya tiene voto → 409', async () => {
  const DB = crearD1Falsa(SEMILLA);
  await dbReal.registrarVoto({ DB }, { opcionId: 'praga', votante: 'u5', ipHash: 'x', ahora: 1 });
  const res = await handleEnviarPropuesta(
    req('/api/votacion/propuesta', { body: { ciudad: 'Oporto', votante: 'u5' } }),
    ENV2(DB, []), CORS, '2.2.2.2', dbReal,
  );
  assert.equal(res.status, 409);
});

test('POST propuesta: ciudad vacía o demasiado larga → 400', async () => {
  const DB = crearD1Falsa(SEMILLA);
  const res1 = await handleEnviarPropuesta(
    req('/api/votacion/propuesta', { body: { ciudad: '   ', votante: 'u6' } }),
    ENV2(DB, []), CORS, '2.2.2.2', dbReal,
  );
  assert.equal(res1.status, 400);
  const res2 = await handleEnviarPropuesta(
    req('/api/votacion/propuesta', { body: { ciudad: 'x'.repeat(121), votante: 'u6' } }),
    ENV2(DB, []), CORS, '2.2.2.2', dbReal,
  );
  assert.equal(res2.status, 400);
});

test('POST propuesta: 2ª propuesta pendiente desde la misma IP → 429', async () => {
  const DB = crearD1Falsa(SEMILLA);
  const ipHash = await hashIp('7.7.7.7', 'sal');
  await dbReal.crearPropuestaConVoto({ DB }, { opcionId: 'previa', etiquetaJson: '{"es":"Previa"}', email: null, nota: null, votante: 'otro', ipHash, ahora: 1 });
  const res = await handleEnviarPropuesta(
    req('/api/votacion/propuesta', { body: { ciudad: 'Oporto', votante: 'nuevo' } }),
    ENV2(DB, []), CORS, '7.7.7.7', dbReal,
  );
  assert.equal(res.status, 429);
});

test('POST propuesta: si falla el envío de email, la propuesta ya guardada no se pierde y responde ok', async () => {
  const DB = crearD1Falsa(SEMILLA);
  const erroresOrig = console.error;
  const errores = [];
  console.error = (...a) => errores.push(a);
  try {
    const env = {
      DB, IP_SALT: 'sal', OWNER_EMAIL: 'owner@test', SITE_URL: 'https://vestigia.fun',
      _enviar: async () => { throw new Error('Resend caído'); },
    };
    const res = await handleEnviarPropuesta(
      req('/api/votacion/propuesta', { body: { ciudad: 'Oporto', votante: 'u7' } }),
      env, CORS, '3.3.3.3', dbReal,
    );
    const cuerpo = await res.json();
    assert.equal(res.status, 200);
    assert.equal(cuerpo.ok, true);
    assert.equal((await dbReal.votoDeVotante({ DB }, 'u7')).estado, 'en_espera');
    assert.equal(errores.length, 1);
  } finally {
    console.error = erroresOrig;
  }
});

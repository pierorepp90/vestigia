// worker/tests/votacion.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearD1Falsa } from './helpers/fake-d1.js';
import * as dbReal from '../src/db.js';
import { handleObtenerVotacion } from '../src/votacion.js';

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

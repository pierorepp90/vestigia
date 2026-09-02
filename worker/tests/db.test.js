// worker/tests/db.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearD1Falsa } from './helpers/fake-d1.js';
import {
  listarOpcionesVotables, recuentoVotos, votoDeVotante, opcionPorId, votosConMismaIp,
  registrarVoto, crearPropuestaConVoto, listarPropuestasPendientes, aprobarPropuesta, rechazarPropuesta,
  propuestasPendientesDeIp,
} from '../src/db.js';

const SEMILLA = {
  voto_opciones: [
    { id: 'praga', etiqueta: '{"es":"Praga"}', estado: 'oficial', creada_en: 0 },
    { id: 'viena', etiqueta: '{"es":"Viena"}', estado: 'oficial', creada_en: 0 },
    { id: 'x', etiqueta: '{"es":"X"}', estado: 'rechazada', creada_en: 0 },
  ],
};

test('listarOpcionesVotables devuelve solo oficiales y aprobadas', async () => {
  const DB = crearD1Falsa(SEMILLA);
  const ops = await listarOpcionesVotables({ DB });
  assert.deepEqual(ops.map((o) => o.id).sort(), ['praga', 'viena']);
});

test('registrarVoto inserta un voto activo y recuentoVotos lo cuenta', async () => {
  const DB = crearD1Falsa(SEMILLA);
  await registrarVoto({ DB }, { opcionId: 'praga', votante: 'u1', ipHash: 'h1', ahora: 111 });
  const rec = await recuentoVotos({ DB });
  assert.deepEqual(rec, { praga: 1 });
});

test('votoDeVotante devuelve el voto existente o null', async () => {
  const DB = crearD1Falsa(SEMILLA);
  assert.equal(await votoDeVotante({ DB }, 'u1'), null);
  await registrarVoto({ DB }, { opcionId: 'viena', votante: 'u1', ipHash: 'h1', ahora: 1 });
  const v = await votoDeVotante({ DB }, 'u1');
  assert.equal(v.opcion_id, 'viena');
  assert.equal(v.estado, 'activo');
});

test('votosConMismaIp cuenta solo votos activos de esa ip', async () => {
  const DB = crearD1Falsa(SEMILLA);
  await registrarVoto({ DB }, { opcionId: 'praga', votante: 'u1', ipHash: 'h1', ahora: 1 });
  await registrarVoto({ DB }, { opcionId: 'viena', votante: 'u2', ipHash: 'h1', ahora: 1 });
  assert.equal(await votosConMismaIp({ DB }, 'h1'), 2);
  assert.equal(await votosConMismaIp({ DB }, 'otra'), 0);
});

test('crearPropuestaConVoto inserta opción pendiente + voto en_espera, no votable aún', async () => {
  const DB = crearD1Falsa(SEMILLA);
  await crearPropuestaConVoto({ DB }, {
    opcionId: 'oporto', etiquetaJson: '{"es":"Oporto"}', email: 'a@b.com', nota: 'porfa', votante: 'u9', ipHash: 'h9', ahora: 5,
  });
  const votables = await listarOpcionesVotables({ DB });
  assert.ok(!votables.some((o) => o.id === 'oporto'));
  const v = await votoDeVotante({ DB }, 'u9');
  assert.equal(v.estado, 'en_espera');
  assert.equal(v.opcion_id, 'oporto');
});

test('aprobarPropuesta la vuelve votable y activa su voto en espera', async () => {
  const DB = crearD1Falsa(SEMILLA);
  await crearPropuestaConVoto({ DB }, { opcionId: 'oporto', etiquetaJson: '{"es":"Oporto"}', email: null, nota: null, votante: 'u9', ipHash: 'h9', ahora: 5 });
  await aprobarPropuesta({ DB }, 'oporto');
  const votables = await listarOpcionesVotables({ DB });
  assert.ok(votables.some((o) => o.id === 'oporto'));
  assert.deepEqual(await recuentoVotos({ DB }), { oporto: 1 });
});

test('rechazarPropuesta la marca rechazada y borra todos los votos de la opción', async () => {
  const DB = crearD1Falsa(SEMILLA);
  await crearPropuestaConVoto({ DB }, { opcionId: 'oporto', etiquetaJson: '{"es":"Oporto"}', email: null, nota: null, votante: 'u9', ipHash: 'h9', ahora: 5 });
  await rechazarPropuesta({ DB }, 'oporto');
  assert.equal(await votoDeVotante({ DB }, 'u9'), null);
  const pend = await listarPropuestasPendientes({ DB });
  assert.deepEqual(pend, []);
});

test('rechazarPropuesta tras aprobarla no deja un voto activo huérfano', async () => {
  const DB = crearD1Falsa(SEMILLA);
  await crearPropuestaConVoto({ DB }, { opcionId: 'oporto', etiquetaJson: '{"es":"Oporto"}', email: null, nota: null, votante: 'u9', ipHash: 'h9', ahora: 5 });
  await aprobarPropuesta({ DB }, 'oporto');
  assert.deepEqual(await recuentoVotos({ DB }), { oporto: 1 });
  await rechazarPropuesta({ DB }, 'oporto');
  assert.equal(await votoDeVotante({ DB }, 'u9'), null);
  assert.deepEqual(await recuentoVotos({ DB }), {});
});

test('listarPropuestasPendientes devuelve las pendientes con sus metadatos', async () => {
  const DB = crearD1Falsa(SEMILLA);
  await crearPropuestaConVoto({ DB }, { opcionId: 'oporto', etiquetaJson: '{"es":"Oporto"}', email: 'a@b.com', nota: 'n', votante: 'u9', ipHash: 'h9', ahora: 5 });
  const pend = await listarPropuestasPendientes({ DB });
  assert.equal(pend.length, 1);
  assert.equal(pend[0].id, 'oporto');
  assert.equal(pend[0].propuesta_email, 'a@b.com');
});

test('propuestasPendientesDeIp cuenta los votos en espera de esa ip', async () => {
  const DB = crearD1Falsa(SEMILLA);
  await crearPropuestaConVoto({ DB }, { opcionId: 'a', etiquetaJson: '{"es":"A"}', email: null, nota: null, votante: 'u1', ipHash: 'ip-x', ahora: 1 });
  assert.equal(await propuestasPendientesDeIp({ DB }, 'ip-x'), 1);
  assert.equal(await propuestasPendientesDeIp({ DB }, 'ip-otra'), 0);
  await aprobarPropuesta({ DB }, 'a');
  assert.equal(await propuestasPendientesDeIp({ DB }, 'ip-x'), 0);
});

// worker/tests/votacion.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearD1Falsa } from './helpers/fake-d1.js';
import * as dbReal from '../src/db.js';
import {
  handleObtenerVotacion, handleEmitirVoto, handleEnviarPropuesta,
  handleListarPropuestas, handleModerarPropuesta, parseEtiqueta, slugPropuesta,
} from '../src/votacion.js';
import { hashIp } from '../src/hash.js';

const CORS = { 'Access-Control-Allow-Origin': '*' };
const RE_ID = /^[a-z0-9-]{1,40}$/;

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
  const res = await handleObtenerVotacion(req('/api/votacion?votante=votante-01'), { DB }, CORS, dbReal);
  const cuerpo = await res.json();
  assert.equal(cuerpo.estadoVotante, 'sin_voto');
  assert.equal(cuerpo.miVoto, null);
  assert.deepEqual(cuerpo.opciones.map((o) => o.id).sort(), ['praga', 'viena']);
  assert.ok(cuerpo.opciones.every((o) => !('votos' in o)));
});

test('GET votación con voto activo: incluye recuentos y miVoto', async () => {
  const DB = crearD1Falsa(SEMILLA);
  await dbReal.registrarVoto({ DB }, { opcionId: 'praga', votante: 'votante-01', ipHash: 'h', ahora: 1 });
  const res = await handleObtenerVotacion(req('/api/votacion?votante=votante-01'), { DB }, CORS, dbReal);
  const cuerpo = await res.json();
  assert.equal(cuerpo.estadoVotante, 'voto_activo');
  assert.equal(cuerpo.miVoto, 'praga');
  const praga = cuerpo.opciones.find((o) => o.id === 'praga');
  assert.equal(praga.votos, 1);
});

test('GET votación con propuesta pendiente: estadoVotante propuesta_pendiente, sin recuentos', async () => {
  const DB = crearD1Falsa(SEMILLA);
  await dbReal.crearPropuestaConVoto({ DB }, {
    opcionId: 'oporto', etiquetaJson: '{"es":"Oporto"}', email: null, nota: null, votante: 'votante-01', ipHash: 'h', ahora: 1,
  });
  const res = await handleObtenerVotacion(req('/api/votacion?votante=votante-01'), { DB }, CORS, dbReal);
  const cuerpo = await res.json();
  assert.equal(cuerpo.estadoVotante, 'propuesta_pendiente');
  assert.ok(cuerpo.opciones.every((o) => !('votos' in o)));
});

test('GET votación sin parámetro votante: 400', async () => {
  const DB = crearD1Falsa(SEMILLA);
  const res = await handleObtenerVotacion(req('/api/votacion'), { DB }, CORS, dbReal);
  assert.equal(res.status, 400);
});

test('GET votación con votante mal formado (corto): 400 Identificador de votante no válido', async () => {
  const DB = crearD1Falsa(SEMILLA);
  const res = await handleObtenerVotacion(req('/api/votacion?votante=u1'), { DB }, CORS, dbReal);
  assert.equal(res.status, 400);
  assert.equal((await res.json()).error, 'Identificador de votante no válido');
});

// --- Task B2: handleEmitirVoto ---
// El `ip` va como argumento posicional (infra de seguridad ya en master);
// `env` en tests no trae `KV`, así que `consumirCupo` cae en abierto.
const ENV = (DB) => ({ DB, IP_SALT: 'sal' });

test('POST voto válido: registra y devuelve recuentos', async () => {
  const DB = crearD1Falsa(SEMILLA);
  const res = await handleEmitirVoto(
    req('/api/votacion/voto', { body: { opcionId: 'praga', votante: 'votante-01' } }),
    ENV(DB), CORS, '1.1.1.1', dbReal,
  );
  const cuerpo = await res.json();
  assert.equal(cuerpo.ok, true);
  assert.equal(cuerpo.miVoto, 'praga');
  assert.equal(cuerpo.opciones.find((o) => o.id === 'praga').votos, 1);
});

test('POST voto: opcionId ausente → 400 Datos de voto incompletos', async () => {
  const DB = crearD1Falsa(SEMILLA);
  const res = await handleEmitirVoto(
    req('/api/votacion/voto', { body: { votante: 'votante-01' } }),
    ENV(DB), CORS, '1.1.1.1', dbReal,
  );
  assert.equal(res.status, 400);
  assert.equal((await res.json()).error, 'Datos de voto incompletos');
});

test('POST voto: votante mal formado → 400 Identificador de votante no válido', async () => {
  const DB = crearD1Falsa(SEMILLA);
  const res = await handleEmitirVoto(
    req('/api/votacion/voto', { body: { opcionId: 'praga', votante: 'u1' } }),
    ENV(DB), CORS, '1.1.1.1', dbReal,
  );
  assert.equal(res.status, 400);
  assert.equal((await res.json()).error, 'Identificador de votante no válido');
});

test('POST voto: segundo voto del mismo votante → 409', async () => {
  const DB = crearD1Falsa(SEMILLA);
  await dbReal.registrarVoto({ DB }, { opcionId: 'praga', votante: 'votante-01', ipHash: 'x', ahora: 1 });
  const res = await handleEmitirVoto(
    req('/api/votacion/voto', { body: { opcionId: 'viena', votante: 'votante-01' } }),
    ENV(DB), CORS, '1.1.1.1', dbReal,
  );
  assert.equal(res.status, 409);
});

test('POST voto: carrera — el INSERT viola UNIQUE(votante) pese al pre-check → 409, no 500', async () => {
  const DB = crearD1Falsa(SEMILLA);
  await dbReal.registrarVoto({ DB }, { opcionId: 'praga', votante: 'votante-01', ipHash: 'h', ahora: 1 });
  // Simula la ventana de carrera: el pre-check no ve el voto, pero el INSERT sí colisiona.
  const db = { ...dbReal, votoDeVotante: async () => null };
  const res = await handleEmitirVoto(
    req('/api/votacion/voto', { body: { opcionId: 'praga', votante: 'votante-01' } }),
    ENV(DB), CORS, '1.1.1.1', db,
  );
  assert.equal(res.status, 409);
  assert.equal((await res.json()).error, 'Ya has votado');
});

test('POST voto: opción inexistente o no votable → 400', async () => {
  const DB = crearD1Falsa(SEMILLA);
  const res = await handleEmitirVoto(
    req('/api/votacion/voto', { body: { opcionId: 'no-existe', votante: 'votante-01' } }),
    ENV(DB), CORS, '1.1.1.1', dbReal,
  );
  assert.equal(res.status, 400);
  assert.equal((await res.json()).error, 'Esa opción no se puede votar');
});

test('POST voto: 4º voto desde la misma IP → 403 (no se despeja esperando)', async () => {
  const DB = crearD1Falsa(SEMILLA);
  const ipHash = await hashIp('9.9.9.9', 'sal');
  for (const u of ['votante-a', 'votante-b', 'votante-c']) {
    await dbReal.registrarVoto({ DB }, { opcionId: 'praga', votante: u, ipHash, ahora: 1 });
  }
  const res = await handleEmitirVoto(
    req('/api/votacion/voto', { body: { opcionId: 'viena', votante: 'votante-nuevo' } }),
    ENV(DB), CORS, '9.9.9.9', dbReal,
  );
  assert.equal(res.status, 403);
  assert.equal((await res.json()).error, 'Demasiados votos desde esta red');
});

test('POST voto: throttle de KV agotado → 429 con Retry-After', async () => {
  const DB = crearD1Falsa(SEMILLA);
  const ahora = Math.floor(Date.now() / 1000);
  const KV = { get: async () => ({ n: 20, reset: ahora + 300 }), put: async () => {} };
  const res = await handleEmitirVoto(
    req('/api/votacion/voto', { body: { opcionId: 'praga', votante: 'votante-01' } }),
    { DB, IP_SALT: 'sal', KV }, CORS, '1.1.1.1', dbReal,
  );
  assert.equal(res.status, 429);
  assert.match(res.headers.get('Retry-After') || '', /^\d+$/);
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
      body: { ciudad: 'Oporto, Ribeira', nota: 'la Ribeira es perfecta', email: 'x@y.com', votante: 'votante-05' },
    }),
    ENV2(DB, envios), CORS, '2.2.2.2', dbReal,
  );
  const cuerpo = await res.json();
  assert.equal(cuerpo.ok, true);
  assert.equal(envios.length, 1);
  assert.match(envios[0].subject, /propuesta/i);
  assert.match(envios[0].html, /Oporto, Ribeira/);
  const voto = await dbReal.votoDeVotante({ DB }, 'votante-05');
  assert.equal(voto.estado, 'en_espera');
});

test('POST propuesta: votante mal formado → 400 Identificador de votante no válido', async () => {
  const DB = crearD1Falsa(SEMILLA);
  const res = await handleEnviarPropuesta(
    req('/api/votacion/propuesta', { body: { ciudad: 'Oporto', votante: 'u5' } }),
    ENV2(DB, []), CORS, '2.2.2.2', dbReal,
  );
  assert.equal(res.status, 400);
  assert.equal((await res.json()).error, 'Identificador de votante no válido');
});

test('POST propuesta: email de contacto con formato inválido → 400 Email no válido', async () => {
  const DB = crearD1Falsa(SEMILLA);
  const res = await handleEnviarPropuesta(
    req('/api/votacion/propuesta', { body: { ciudad: 'Oporto', email: 'no-es-email', votante: 'votante-05' } }),
    ENV2(DB, []), CORS, '2.2.2.2', dbReal,
  );
  assert.equal(res.status, 400);
  assert.equal((await res.json()).error, 'Email no válido');
});

test('POST propuesta: votante que ya tiene voto → 409', async () => {
  const DB = crearD1Falsa(SEMILLA);
  await dbReal.registrarVoto({ DB }, { opcionId: 'praga', votante: 'votante-05', ipHash: 'x', ahora: 1 });
  const res = await handleEnviarPropuesta(
    req('/api/votacion/propuesta', { body: { ciudad: 'Oporto', votante: 'votante-05' } }),
    ENV2(DB, []), CORS, '2.2.2.2', dbReal,
  );
  assert.equal(res.status, 409);
});

test('POST propuesta: carrera — el INSERT viola UNIQUE(votante) pese al pre-check → 409, no 500', async () => {
  const DB = crearD1Falsa(SEMILLA);
  await dbReal.registrarVoto({ DB }, { opcionId: 'praga', votante: 'votante-05', ipHash: 'h', ahora: 1 });
  const db = { ...dbReal, votoDeVotante: async () => null };
  const res = await handleEnviarPropuesta(
    req('/api/votacion/propuesta', { body: { ciudad: 'Oporto', votante: 'votante-05' } }),
    ENV2(DB, []), CORS, '2.2.2.2', db,
  );
  assert.equal(res.status, 409);
  assert.equal((await res.json()).error, 'Ya has participado');
});

test('POST propuesta: ciudad vacía o demasiado larga → 400', async () => {
  const DB = crearD1Falsa(SEMILLA);
  const res1 = await handleEnviarPropuesta(
    req('/api/votacion/propuesta', { body: { ciudad: '   ', votante: 'votante-06' } }),
    ENV2(DB, []), CORS, '2.2.2.2', dbReal,
  );
  assert.equal(res1.status, 400);
  const res2 = await handleEnviarPropuesta(
    req('/api/votacion/propuesta', { body: { ciudad: 'x'.repeat(121), votante: 'votante-06' } }),
    ENV2(DB, []), CORS, '2.2.2.2', dbReal,
  );
  assert.equal(res2.status, 400);
});

test('POST propuesta: 2ª propuesta pendiente desde la misma IP → 409', async () => {
  const DB = crearD1Falsa(SEMILLA);
  const ipHash = await hashIp('7.7.7.7', 'sal');
  await dbReal.crearPropuestaConVoto({ DB }, { opcionId: 'previa', etiquetaJson: '{"es":"Previa"}', email: null, nota: null, votante: 'votante-otro', ipHash, ahora: 1 });
  const res = await handleEnviarPropuesta(
    req('/api/votacion/propuesta', { body: { ciudad: 'Oporto', votante: 'votante-nuevo' } }),
    ENV2(DB, []), CORS, '7.7.7.7', dbReal,
  );
  assert.equal(res.status, 409);
  assert.equal((await res.json()).error, 'Ya tienes una propuesta en revisión');
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
      req('/api/votacion/propuesta', { body: { ciudad: 'Oporto', votante: 'votante-07' } }),
      env, CORS, '3.3.3.3', dbReal,
    );
    const cuerpo = await res.json();
    assert.equal(res.status, 200);
    assert.equal(cuerpo.ok, true);
    assert.equal((await dbReal.votoDeVotante({ DB }, 'votante-07')).estado, 'en_espera');
    assert.equal(errores.length, 1);
  } finally {
    console.error = erroresOrig;
  }
});

// --- Task B5: endpoints de moderación (admin) ---
const ADMIN_ENV = (DB) => ({ DB, ADMIN_SECRET: 'secreto-largo' });
const bearer = (t) => ({ authorization: `Bearer ${t}` });

test('admin: sin bearer correcto → 401 en listar y moderar', async () => {
  const DB = crearD1Falsa(SEMILLA);
  const r1 = await handleListarPropuestas(req('/api/admin/propuestas', { headers: bearer('malo') }), ADMIN_ENV(DB), CORS, dbReal);
  assert.equal(r1.status, 401);
  const r2 = await handleModerarPropuesta(
    req('/api/admin/propuestas/oporto', { body: { accion: 'aprobar' }, headers: bearer('malo') }),
    ADMIN_ENV(DB), CORS, 'oporto', dbReal,
  );
  assert.equal(r2.status, 401);
});

test('admin: sin ADMIN_SECRET configurado → 401 (falla en cerrado, no en abierto)', async () => {
  const DB = crearD1Falsa(SEMILLA);
  await dbReal.crearPropuestaConVoto({ DB }, { opcionId: 'oporto-a1b2c3', etiquetaJson: '{"es":"Oporto"}', email: 'secreto@proponente', nota: null, votante: 'u', ipHash: 'h', ahora: 3 });
  const envSinSecreto = { DB }; // sin ADMIN_SECRET

  const r1 = await handleListarPropuestas(req('/api/admin/propuestas'), envSinSecreto, CORS, dbReal);
  assert.equal(r1.status, 401);
  const r2 = await handleModerarPropuesta(
    req('/api/admin/propuestas/oporto-a1b2c3', { body: { accion: 'aprobar' } }),
    envSinSecreto, CORS, 'oporto-a1b2c3', dbReal,
  );
  assert.equal(r2.status, 401);
  // La propuesta sigue pendiente: la petición no autorizada no la moderó.
  assert.equal((await dbReal.opcionPorId({ DB }, 'oporto-a1b2c3')).estado, 'pendiente');
});

test('admin: listar devuelve las pendientes', async () => {
  const DB = crearD1Falsa(SEMILLA);
  await dbReal.crearPropuestaConVoto({ DB }, { opcionId: 'oporto-a1b2c3', etiquetaJson: '{"es":"Oporto"}', email: 'a@b', nota: 'n', votante: 'u', ipHash: 'h', ahora: 3 });
  const res = await handleListarPropuestas(req('/api/admin/propuestas', { headers: bearer('secreto-largo') }), ADMIN_ENV(DB), CORS, dbReal);
  const cuerpo = await res.json();
  assert.equal(cuerpo.propuestas.length, 1);
  assert.equal(cuerpo.propuestas[0].id, 'oporto-a1b2c3');
  assert.deepEqual(cuerpo.propuestas[0].etiqueta, { es: 'Oporto' });
  // El campo se expone como `email` (renombrado de `propuesta_email`).
  assert.equal(cuerpo.propuestas[0].email, 'a@b');
  assert.equal(cuerpo.propuestas[0].nota, 'n');
});

test('admin: aprobar vuelve la opción votable; rechazar la descarta', async () => {
  const DB = crearD1Falsa(SEMILLA);
  await dbReal.crearPropuestaConVoto({ DB }, { opcionId: 'oporto-a1b2c3', etiquetaJson: '{"es":"Oporto"}', email: null, nota: null, votante: 'u', ipHash: 'h', ahora: 3 });
  const resAprobar = await handleModerarPropuesta(
    req('/api/admin/propuestas/oporto-a1b2c3', { body: { accion: 'aprobar' }, headers: bearer('secreto-largo') }),
    ADMIN_ENV(DB), CORS, 'oporto-a1b2c3', dbReal,
  );
  assert.equal(resAprobar.status, 200);
  assert.deepEqual(await resAprobar.json(), { ok: true });
  assert.ok((await dbReal.listarOpcionesVotables({ DB })).some((o) => o.id === 'oporto-a1b2c3'));

  await dbReal.crearPropuestaConVoto({ DB }, { opcionId: 'lyon-d4e5f6', etiquetaJson: '{"es":"Lyon"}', email: null, nota: null, votante: 'u2', ipHash: 'h2', ahora: 4 });
  await handleModerarPropuesta(
    req('/api/admin/propuestas/lyon-d4e5f6', { body: { accion: 'rechazar' }, headers: bearer('secreto-largo') }),
    ADMIN_ENV(DB), CORS, 'lyon-d4e5f6', dbReal,
  );
  assert.equal(await dbReal.votoDeVotante({ DB }, 'u2'), null);
});

test('admin: acción desconocida → 400', async () => {
  const DB = crearD1Falsa(SEMILLA);
  await dbReal.crearPropuestaConVoto({ DB }, { opcionId: 'x-000000', etiquetaJson: '{"es":"X"}', email: null, nota: null, votante: 'ux', ipHash: 'hx', ahora: 1 });
  const res = await handleModerarPropuesta(
    req('/api/admin/propuestas/x-000000', { body: { accion: 'explotar' }, headers: bearer('secreto-largo') }),
    ADMIN_ENV(DB), CORS, 'x-000000', dbReal,
  );
  assert.equal(res.status, 400);
});

test('admin: moderar una opción inexistente → 404; una ya oficial → 409', async () => {
  const DB = crearD1Falsa(SEMILLA);
  const noExiste = await handleModerarPropuesta(
    req('/api/admin/propuestas/nada-000000', { body: { accion: 'aprobar' }, headers: bearer('secreto-largo') }),
    ADMIN_ENV(DB), CORS, 'nada-000000', dbReal,
  );
  assert.equal(noExiste.status, 404);
  const yaOficial = await handleModerarPropuesta(
    req('/api/admin/propuestas/praga', { body: { accion: 'aprobar' }, headers: bearer('secreto-largo') }),
    ADMIN_ENV(DB), CORS, 'praga', dbReal,
  );
  assert.equal(yaOficial.status, 409);
});

// --- Helpers exportados ---

test('parseEtiqueta: JSON objeto se devuelve tal cual; array o basura cae a { es }', () => {
  assert.deepEqual(parseEtiqueta('{"es":"Praga","en":"Prague"}'), { es: 'Praga', en: 'Prague' });
  assert.deepEqual(parseEtiqueta('["Praga"]'), { es: '["Praga"]' });
  assert.deepEqual(parseEtiqueta('no es json'), { es: 'no es json' });
  assert.deepEqual(parseEtiqueta('42'), { es: '42' });
});

test('slugPropuesta: normaliza acentos, espacios y nombres no latinos, y siempre cumple RE_ID', () => {
  assert.match(slugPropuesta('Ámsterdam'), /^amsterdam-[0-9a-f]{6}$/);
  assert.match(slugPropuesta('Sevilla — Santa Cruz'), /^sevilla-santa-cruz-[0-9a-f]{6}$/);
  assert.match(slugPropuesta('東京'), /^propuesta-[0-9a-f]{6}$/);
  for (const c of ['Ámsterdam', 'Sevilla — Santa Cruz', '東京', 'A Coruña', 'x'.repeat(120), '  ...  ']) {
    assert.match(slugPropuesta(c), RE_ID);
  }
});

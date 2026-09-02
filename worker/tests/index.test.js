// worker/tests/index.test.js
//
// Cubre las barreras de seguridad de index.js que la interfaz nunca ejercita
// por sí sola: el cruce ruta-de-pago / endpoint-gratis, el rate limit por IP y
// la validación de entrada. El resto de los handlers se verifica a mano contra
// `wrangler dev` / `wrangler tail` — esto es la excepción, no la norma.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { firmarToken } from '../src/acceso.js';
import worker, { handleAccesoGratuito, handleCrearCheckoutSession, handleObtenerRuta } from '../src/index.js';
import { crearD1Falsa } from './helpers/fake-d1.js';

const CORS_FALSO = { 'Access-Control-Allow-Origin': '*' };

function requestFalso(cuerpo, headers = {}) {
  const norm = {};
  for (const k of Object.keys(headers)) norm[k.toLowerCase()] = headers[k];
  return {
    headers: { get: (k) => norm[String(k).toLowerCase()] ?? null },
    json: async () => cuerpo,
  };
}

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

const ENV_BASE = {
  TOKEN_SECRET: 's', RESEND_API_KEY: 'k', STRIPE_SECRET_KEY: 'sk',
  OWNER_EMAIL: 'o@e.com', SITE_URL: 'https://vestigia.fun',
};

test('handleCrearCheckoutSession rechaza una ruta gratuita antes de llamar a Stripe', async () => {
  const respuesta = await handleCrearCheckoutSession(
    requestFalso({ rutaId: 'barcelona-born', idioma: 'es' }),
    { ...ENV_BASE, KV: crearKvFalso() },
    CORS_FALSO,
    '1.1.1.1',
  );
  assert.equal(respuesta.status, 400);
  const cuerpo = await respuesta.json();
  assert.match(cuerpo.error, /gratuita/);
});

test('handleAccesoGratuito rechaza una ruta de pago antes de acuñar token o enviar email', async () => {
  const respuesta = await handleAccesoGratuito(
    requestFalso({ rutaId: 'barcelona-gotic', idioma: 'es', email: 'cliente@example.com' }),
    { ...ENV_BASE, KV: crearKvFalso() },
    CORS_FALSO,
    '1.1.1.1',
  );
  assert.equal(respuesta.status, 400);
  const cuerpo = await respuesta.json();
  assert.match(cuerpo.error, /no es una ruta gratuita/);
});

test('handleAccesoGratuito rechaza un email con formato inválido para una ruta gratis real', async () => {
  const respuesta = await handleAccesoGratuito(
    requestFalso({ rutaId: 'barcelona-born', idioma: 'es', email: 'esto-no-es-un-email' }),
    { ...ENV_BASE, KV: crearKvFalso() },
    CORS_FALSO,
    '1.1.1.1',
  );
  assert.equal(respuesta.status, 400);
  const cuerpo = await respuesta.json();
  assert.match(cuerpo.error, /[Ee]mail/);
});

test('create-checkout-session responde 429 cuando el cupo de la IP está agotado', async () => {
  const reset = Math.floor(Date.now() / 1000) + 800;
  const kv = crearKvFalso({ 'rl:checkout:5.5.5.5': JSON.stringify({ n: 10, reset }) });
  const r = await handleCrearCheckoutSession(
    requestFalso({ rutaId: 'barcelona-gotic', idioma: 'es' }),
    { ...ENV_BASE, KV: kv },
    CORS_FALSO,
    '5.5.5.5',
  );
  assert.equal(r.status, 429);
  assert.ok(r.headers.get('Retry-After'));
});

test('create-checkout-session rechaza rutaId con forma inválida antes de tocar Stripe', async () => {
  const r = await handleCrearCheckoutSession(
    requestFalso({ rutaId: '__proto__', idioma: 'es' }),
    { ...ENV_BASE, KV: crearKvFalso() },
    CORS_FALSO,
    '1.1.1.1',
  );
  assert.equal(r.status, 400);
});

test('acceso-gratuito con cupo agotado devuelve token y emailEnviado:false sin llamar a Resend', async () => {
  const reset = Math.floor(Date.now() / 1000) + 800;
  const kv = crearKvFalso({ 'rl:acceso-gratuito:2.2.2.2': JSON.stringify({ n: 1, reset }) });
  const fetchOriginal = globalThis.fetch;
  let resendLlamado = false;
  globalThis.fetch = async () => { resendLlamado = true; return { ok: true, json: async () => ({}) }; };
  try {
    const r = await handleAccesoGratuito(
      requestFalso({ rutaId: 'barcelona-born', idioma: 'es', email: 'v@example.com' }),
      { ...ENV_BASE, KV: kv },
      CORS_FALSO,
      '2.2.2.2',
    );
    assert.equal(r.status, 200);
    const cuerpo = await r.json();
    assert.equal(cuerpo.ok, true);
    assert.ok(cuerpo.token);
    assert.equal(cuerpo.emailEnviado, false);
    assert.equal(resendLlamado, false);
  } finally {
    globalThis.fetch = fetchOriginal;
  }
});

test('handleObtenerRuta ignora un idioma no soportado y sirve es', async () => {
  const token = await firmarToken({ rutaId: 'barcelona-gotic', orderId: 'ord_1' }, 's');
  const url = new URL(`https://x/api/ruta?t=${encodeURIComponent(token)}&idioma=zz`);
  const r = await handleObtenerRuta(url, { TOKEN_SECRET: 's' }, CORS_FALSO);
  assert.equal(r.status, 200);
  const cuerpo = await r.json();
  assert.equal(cuerpo.idiomaServido, 'es');
});

test('la respuesta de /api/ruta no es cacheable', async () => {
  const token = await firmarToken({ rutaId: 'barcelona-gotic', orderId: 'ord_1' }, 's');
  const url = new URL(`https://x/api/ruta?t=${encodeURIComponent(token)}`);
  const r = await handleObtenerRuta(url, { TOKEN_SECRET: 's' }, CORS_FALSO);
  assert.equal(r.headers.get('Cache-Control'), 'no-store');
});

// --- Task B6: enrutado de la votación + CORS del header Authorization ---

function entorno(DB) {
  // sin KV → throttle.js falla en abierto; sin RESEND_API_KEY los envíos de
  // email lanzan pero los handlers los envuelven en try/catch.
  return { DB, IP_SALT: 'sal', ADMIN_SECRET: 'sec', ALLOWED_ORIGIN: 'https://vestigia.fun' };
}
function peticion(metodo, ruta, { body, origin } = {}) {
  return new Request(`https://api.test${ruta}`, {
    method: metodo,
    headers: { 'Content-Type': 'application/json', Origin: origin || 'https://vestigia.fun' },
    body: body ? JSON.stringify(body) : undefined,
  });
}

test('router: GET /api/votacion responde 200 con opciones', async () => {
  const DB = crearD1Falsa({ voto_opciones: [{ id: 'praga', etiqueta: '{"es":"Praga"}', estado: 'oficial', creada_en: 0 }] });
  const res = await worker.fetch(peticion('GET', '/api/votacion?votante=votante-01'), entorno(DB));
  assert.equal(res.status, 200);
  const cuerpo = await res.json();
  assert.equal(cuerpo.opciones.length, 1);
});

test('router: OPTIONS incluye Authorization en Access-Control-Allow-Headers', async () => {
  const res = await worker.fetch(peticion('OPTIONS', '/api/admin/propuestas'), entorno(crearD1Falsa()));
  assert.match(res.headers.get('Access-Control-Allow-Headers') || '', /Authorization/i);
});

test('router: POST /api/admin/propuestas/:id sin bearer → 401', async () => {
  const res = await worker.fetch(peticion('POST', '/api/admin/propuestas/oporto', { body: { accion: 'aprobar' } }), entorno(crearD1Falsa()));
  assert.equal(res.status, 401);
});

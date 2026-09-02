# Endurecimiento de seguridad del Worker de Vestigia — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cerrar el abuso de envío de email de `/api/acceso-gratuito` y `/api/confirm-payment` y endurecer el Worker (validación, fuga de errores, robustez) sin añadir estado de pedidos.

**Architecture:** Se añade un único binding Workers KV usado solo como (a) cubo de rate limit por IP+acción y (b) marca de "pedido cumplido" para deduplicar el envío de emails. Todo lo demás son validaciones y cambios de código en el Worker y en el front estático. Cada defensa falla en abierto: si KV no está, el flujo funcional sigue.

**Tech Stack:** Cloudflare Workers (módulos ESM, Web Crypto), Workers KV, `node:test` para los tests (KV y `fetch` simulados), Stripe REST, Resend REST, front vanilla JS servido por GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-09-02-vestigia-endurecimiento-seguridad-design.md`

---

## Estructura de ficheros

**Nuevos (Worker):**
- `worker/src/throttle.js` — `consumirCupo(kv, {ip, accion, limite, ventanaSegundos})`. Cubo de rate limit por IP+acción sobre KV. Única responsabilidad: decidir si una acción se permite ahora.
- `worker/src/entrada.js` — `entradaValida({rutaId, idioma})` y `leerJsonAcotado(request)`. Validación de entrada compartida por los handlers.
- `worker/src/cumplimiento.js` — `debeEnviarEmails(kv, orderId, session)` y `marcarCumplido(kv, orderId)`. Deduplicación del envío de emails de `confirm-payment`.
- Tests espejo: `worker/tests/throttle.test.js`, `worker/tests/entrada.test.js`, `worker/tests/cumplimiento.test.js`, `worker/tests/cors.test.js`.

**Modificados (Worker):**
- `worker/src/index.js` — router: extrae la IP, pasa `ip`/`env` a los handlers, cablea throttle + validación + idempotencia, respuesta 500 genérica.
- `worker/src/stripe.js` — `validarSesionPagada(session, precio)`, `sesionReembolsada(session)`, `retrieveStripeSession` con `expand[]`.
- `worker/src/resend.js` — `buildAvisoOwner(texto, ownerEmail)`.
- `worker/src/acceso.js` — campo `v: 1` en el token.
- `worker/src/cors.js` — cabecera `X-Content-Type-Options: nosniff` + comentario sobre el alcance de CORS.
- `worker/wrangler.toml` — binding `[[kv_namespaces]]`.
- `worker/tests/index.test.js` — helper `requestFalso` con headers; tests de throttle/validación.

**Modificados (front):**
- `js/api.js` — detección de `429` en `crearCheckoutSession` y `confirmarPago`.
- `js/ruta.js` — mensaje propio para `error.rateLimited`.
- `js/i18n.js` — clave `ruta_error_rate_limit` en `es/en/fr/it`.
- `js/jugar.js`, `js/imprimir.js` — `escaparHtml` en el contenido interpolado en `innerHTML`.
- `jugar/gracias.html`, `jugar/index.html`, `jugar/imprimir.html` — `<meta name="referrer" content="no-referrer">`.

---

## TANDA 1 — Crítico

### Task 1.1: Módulo `throttle.js`

**Files:**
- Create: `worker/src/throttle.js`
- Test: `worker/tests/throttle.test.js`

- [ ] **Step 1: Escribir el test que falla**

Crear `worker/tests/throttle.test.js`:

```js
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
```

- [ ] **Step 2: Ejecutar y ver que falla**

Run: `cd worker && node --test tests/throttle.test.js`
Expected: FAIL — `Cannot find module '../src/throttle.js'`.

- [ ] **Step 3: Implementación mínima**

Crear `worker/src/throttle.js`:

```js
// worker/src/throttle.js
//
// Cubo de rate limit por IP + acción sobre Workers KV. Ventana fija: la primera
// petición fija `reset` a `ahora + ventanaSegundos` y hasta ese instante se
// cuentan las peticiones de esa IP para esa acción.
//
// FALLA EN ABIERTO a propósito: sin binding KV (tests, `wrangler dev` sin KV),
// sin IP, o ante cualquier error de KV, devuelve { permitido: true }. Prefiere
// dejar pasar tráfico antes que romper el acceso de un cliente real.
//
// KV es eventualmente consistente y no atómico: dos peticiones casi simultáneas
// de la misma IP pueden leer el mismo contador y colar 1-2 por encima del
// límite. Aceptable para mitigación de abuso; un límite exacto exigiría Durable
// Objects, fuera del alcance de este Worker.

function ahoraSegundos() {
  return Math.floor(Date.now() / 1000);
}

async function guardar(kv, clave, valor, ttlSegundos) {
  try {
    await kv.put(clave, JSON.stringify(valor), { expirationTtl: Math.max(ttlSegundos, 60) });
  } catch {
    // Si no se puede escribir, el peor caso es no limitar esta petición.
  }
}

export async function consumirCupo(kv, { ip, accion, limite, ventanaSegundos }) {
  if (!kv || !ip) return { permitido: true };

  const clave = `rl:${accion}:${ip}`;
  const ahora = ahoraSegundos();

  let registro;
  try {
    registro = await kv.get(clave, 'json');
  } catch {
    return { permitido: true };
  }

  if (!registro || typeof registro.reset !== 'number' || ahora >= registro.reset) {
    await guardar(kv, clave, { n: 1, reset: ahora + ventanaSegundos }, ventanaSegundos);
    return { permitido: true };
  }

  if (registro.n >= limite) {
    return { permitido: false, reintentarEn: registro.reset - ahora };
  }

  await guardar(kv, clave, { n: registro.n + 1, reset: registro.reset }, registro.reset - ahora);
  return { permitido: true };
}
```

- [ ] **Step 4: Ejecutar y ver que pasa**

Run: `cd worker && node --test tests/throttle.test.js`
Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
git add worker/src/throttle.js worker/tests/throttle.test.js
git commit -m "feat(worker): cubo de rate limit por IP sobre KV (throttle.js)"
```

---

### Task 1.2: Namespace KV + binding en wrangler.toml

**Files:**
- Modify: `worker/wrangler.toml`

- [ ] **Step 1: Crear los namespaces**

Run:
```bash
cd worker
npx wrangler kv namespace create vestigia_throttle
npx wrangler kv namespace create vestigia_throttle --preview
```
Expected: cada comando imprime un bloque `[[kv_namespaces]]` con un `id` (y `preview_id` el segundo). Copiar ambos ids.

- [ ] **Step 2: Añadir el binding**

En `worker/wrangler.toml`, después del bloque `[vars]`, añadir:

```toml
# Rate limiting: cubo por IP+acción (worker/src/throttle.js) y marca de
# "pedido cumplido" para no reenviar emails (worker/src/cumplimiento.js).
# Falla en abierto: si el binding no está, el Worker sigue funcionando.
[[kv_namespaces]]
binding = "KV"
id = "PEGAR_ID_DE_PRODUCCION"
preview_id = "PEGAR_PREVIEW_ID"
```

- [ ] **Step 3: Declarar `KV` en `.dev.vars` no aplica**

`.dev.vars` es solo para variables de texto. Para `wrangler dev` con KV local no hace falta nada extra: `wrangler dev` crea un KV en disco automáticamente a partir del `[[kv_namespaces]]`. Verificar:

Run: `cd worker && npx wrangler dev --local` → debe arrancar sin error de binding. Cerrar con Ctrl-C.

- [ ] **Step 4: Commit**

```bash
git add worker/wrangler.toml
git commit -m "chore(worker): binding KV para rate limiting e idempotencia"
```

---

### Task 1.3: Módulo `entrada.js` (`entradaValida` + `leerJsonAcotado`)

**Files:**
- Create: `worker/src/entrada.js`
- Test: `worker/tests/entrada.test.js`

- [ ] **Step 1: Escribir el test que falla**

Crear `worker/tests/entrada.test.js`:

```js
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
```

- [ ] **Step 2: Ejecutar y ver que falla**

Run: `cd worker && node --test tests/entrada.test.js`
Expected: FAIL — módulo no encontrado.

- [ ] **Step 3: Implementación mínima**

Crear `worker/src/entrada.js`:

```js
// worker/src/entrada.js
//
// Validación de entrada compartida por los handlers de index.js: forma de
// `rutaId` / `idioma` y lectura acotada del body JSON. Aísla aquí lo que antes
// estaba disperso o ausente en cada handler.
import { rutaPorId } from '../../js/catalogo.js';

const IDIOMAS = ['es', 'en', 'fr', 'it'];
const RUTA_ID = /^[a-z]+(?:-[a-z]+)+$/;

/** true si `rutaId` existe en el catálogo y `idioma` es soportado (o ausente,
 *  en cuyo caso el handler cae a 'es'). */
export function entradaValida({ rutaId, idioma }) {
  if (idioma != null && !IDIOMAS.includes(idioma)) return false;
  if (typeof rutaId !== 'string' || !RUTA_ID.test(rutaId)) return false;
  return rutaPorId(rutaId) != null;
}

/** Lee el body JSON rechazando cuerpos desmesurados o malformados. Devuelve
 *  { datos } en éxito, o { error, status } listo para responder. */
export async function leerJsonAcotado(request, maxBytes = 2048) {
  const declarado = Number(request.headers.get('Content-Length'));
  if (Number.isFinite(declarado) && declarado > maxBytes) {
    return { error: 'Petición demasiado grande', status: 413 };
  }
  try {
    return { datos: await request.json() };
  } catch {
    return { error: 'JSON inválido', status: 400 };
  }
}
```

- [ ] **Step 4: Ejecutar y ver que pasa**

Run: `cd worker && node --test tests/entrada.test.js`
Expected: PASS (8 tests).

- [ ] **Step 5: Commit**

```bash
git add worker/src/entrada.js worker/tests/entrada.test.js
git commit -m "feat(worker): validación de entrada compartida (entrada.js)"
```

---

### Task 1.4: Módulo `cumplimiento.js` (dedupe de emails de confirm-payment)

**Files:**
- Create: `worker/src/cumplimiento.js`
- Test: `worker/tests/cumplimiento.test.js`

- [ ] **Step 1: Escribir el test que falla**

Crear `worker/tests/cumplimiento.test.js`:

```js
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
```

- [ ] **Step 2: Ejecutar y ver que falla**

Run: `cd worker && node --test tests/cumplimiento.test.js`
Expected: FAIL — módulo no encontrado.

- [ ] **Step 3: Implementación mínima**

Crear `worker/src/cumplimiento.js`:

```js
// worker/src/cumplimiento.js
//
// Marca de "pedido ya cumplido" para que /api/confirm-payment envíe los emails
// de acceso UNA sola vez por pedido, aunque el cliente recargue gracias.html.
// Con KV: marca persistente `fulfilled:<orderId>`. Sin KV (dev/tests): cae a un
// criterio por tiempo — solo reenvía si la sesión de Stripe se creó hace < 1h.

const VENTANA_SIN_KV_SEGUNDOS = 3600;
const TTL_MARCA_SEGUNDOS = 60 * 60 * 24 * 32;

export async function debeEnviarEmails(kv, orderId, session, ahoraMs = Date.now()) {
  if (kv) {
    try {
      return (await kv.get(`fulfilled:${orderId}`)) == null;
    } catch {
      // KV caído: decide por tiempo abajo.
    }
  }
  const creadaSeg = typeof session?.created === 'number' ? session.created : 0;
  return Math.floor(ahoraMs / 1000) - creadaSeg < VENTANA_SIN_KV_SEGUNDOS;
}

export async function marcarCumplido(kv, orderId, ahoraMs = Date.now()) {
  if (!kv) return;
  try {
    await kv.put(`fulfilled:${orderId}`, String(ahoraMs), { expirationTtl: TTL_MARCA_SEGUNDOS });
  } catch {
    // Si no se puede escribir, el peor caso es reenviar los emails una vez más.
  }
}
```

- [ ] **Step 4: Ejecutar y ver que pasa**

Run: `cd worker && node --test tests/cumplimiento.test.js`
Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
git add worker/src/cumplimiento.js worker/tests/cumplimiento.test.js
git commit -m "feat(worker): dedupe del envío de emails de confirm-payment (cumplimiento.js)"
```

---

### Task 1.5: Cablear `handleAccesoGratuito`

**Files:**
- Modify: `worker/src/index.js` (imports + `handleAccesoGratuito`)

- [ ] **Step 1: Añadir imports**

En `worker/src/index.js`, junto a los imports existentes, añadir:

```js
import { consumirCupo } from './throttle.js';
import { entradaValida, leerJsonAcotado } from './entrada.js';
import { debeEnviarEmails, marcarCumplido } from './cumplimiento.js';
```

- [ ] **Step 2: Reescribir `handleAccesoGratuito`**

Reemplazar la función `handleAccesoGratuito` completa por:

```js
// Ruta gratis: sin Stripe. Acuña el token igual que confirm-payment tras un
// pago real. El email es redundante aquí (gracias.html?gratis=1 ya muestra el
// enlace en pantalla), así que si el cupo de esta IP está agotado se entrega el
// acceso igualmente pero SIN llamar a Resend.
export async function handleAccesoGratuito(request, env, cors, ip) {
  const leido = await leerJsonAcotado(request);
  if (leido.error) return Response.json({ error: leido.error }, { status: leido.status, headers: cors });
  const { rutaId, idioma, email } = leido.datos || {};

  if (!entradaValida({ rutaId, idioma })) {
    return Response.json({ error: 'Ruta o idioma no válidos' }, { status: 400, headers: cors });
  }
  const precio = precioDeRuta(rutaId);
  if (!precio || precio.importe !== 0) {
    return Response.json({ error: `"${rutaId}" no es una ruta gratuita` }, { status: 400, headers: cors });
  }
  if (!emailValidoBasico(email)) {
    return Response.json({ error: 'Email no válido' }, { status: 400, headers: cors });
  }

  const orderId = `ord_${crypto.randomUUID()}`;
  const token = await firmarToken({ rutaId, orderId }, env.TOKEN_SECRET);
  const idiomaFinal = idioma || 'es';
  const tituloRuta = localizar(rutaPorId(rutaId)?.titulo, idiomaFinal);

  const cupo = await consumirCupo(env.KV, { ip, accion: 'acceso-gratuito', limite: 1, ventanaSegundos: 900 });
  let emailEnviado = false;
  if (cupo.permitido) {
    const ownerEmail = buildOwnerEmail({ rutaId, orderId, email, importe: 0 }, env.OWNER_EMAIL);
    const customerEmail = buildCustomerEmail({ rutaId, orderId, idioma: idiomaFinal, email, token, tituloRuta }, env.SITE_URL);
    const envios = await Promise.allSettled([
      sendEmail(ownerEmail, env.RESEND_API_KEY),
      sendEmail(customerEmail, env.RESEND_API_KEY),
    ]);
    emailEnviado = envios.some((e) => e.status === 'fulfilled');
    for (const e of envios) if (e.status === 'rejected') console.error('email_fallo', String(e.reason));
  } else {
    console.log(JSON.stringify({ evento: 'throttle_bloqueo', accion: 'acceso-gratuito', ip }));
  }

  return Response.json({ ok: true, rutaId, idioma: idiomaFinal, orderId, token, emailEnviado }, { headers: cors });
}
```

- [ ] **Step 3: Ajustar la llamada en el router**

Más abajo, en `export default { async fetch }`, cambiar la línea de `acceso-gratuito` a (la firma `ip` se añade en la Task 1.7, pero deja la llamada preparada):

```js
if (request.method === 'POST' && url.pathname === '/api/acceso-gratuito') {
  return await handleAccesoGratuito(request, env, cors, ip);
}
```

Nota: `ip` aún no existe en ese scope — se define en la Task 1.7. Si ejecutas los tests entre ambas tasks, `ip` será `undefined` (throttle en abierto), lo cual es correcto.

- [ ] **Step 4: Ejecutar toda la suite del worker**

Run: `cd worker && node --test`
Expected: los 3 tests de `index.test.js` siguen en verde salvo el que espera 500 por `error.message` (no hay ninguno). Si `requestFalso` da error por `headers` indefinido, se arregla en la Task 1.8 — puedes hacer la 1.8 antes de correr esto. Orden recomendado: 1.5 → 1.6 → 1.7 → 1.8 → correr suite.

- [ ] **Step 5: Commit**

```bash
git add worker/src/index.js
git commit -m "feat(worker): throttle + validación + allSettled en /api/acceso-gratuito"
```

---

### Task 1.6: Cablear `handleConfirmarPago` (throttle + idempotencia)

**Files:**
- Modify: `worker/src/index.js` (`handleConfirmarPago`)

- [ ] **Step 1: Reescribir `handleConfirmarPago`**

Reemplazar la función `handleConfirmarPago` completa por (esta versión NO incluye aún la validación de importe/refund — eso es la Tanda 2, Task 2.3):

```js
async function handleConfirmarPago(url, env, cors, ip) {
  const sessionId = url.searchParams.get('session_id');
  if (!sessionId || !/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId)) {
    return Response.json({ error: 'session_id inválido' }, { status: 400, headers: cors });
  }

  const cupo = await consumirCupo(env.KV, { ip, accion: 'confirm', limite: 15, ventanaSegundos: 900 });
  if (!cupo.permitido) {
    console.log(JSON.stringify({ evento: 'throttle_bloqueo', accion: 'confirm', ip }));
    return Response.json(
      { error: 'Demasiadas solicitudes, prueba de nuevo en unos minutos' },
      { status: 429, headers: { ...cors, 'Retry-After': String(cupo.reintentarEn) } },
    );
  }

  const session = await retrieveStripeSession(sessionId, env.STRIPE_SECRET_KEY);
  if (!parseSessionPaymentStatus(session)) {
    return Response.json({ ok: true, paid: false }, { headers: { ...cors, 'Cache-Control': 'no-store' } });
  }

  const pedido = pedidoDesdeSession(session);
  const precio = precioDeRuta(pedido.rutaId);
  const token = await firmarToken({ rutaId: pedido.rutaId, orderId: pedido.orderId }, env.TOKEN_SECRET);
  const tituloRuta = localizar(rutaPorId(pedido.rutaId)?.titulo, pedido.idioma);

  if (await debeEnviarEmails(env.KV, pedido.orderId, session)) {
    const ownerEmail = buildOwnerEmail({ ...pedido, importe: precio?.importe }, env.OWNER_EMAIL);
    const envios = [sendEmail(ownerEmail, env.RESEND_API_KEY)];
    if (pedido.email) {
      envios.push(sendEmail(buildCustomerEmail({ ...pedido, token, tituloRuta }, env.SITE_URL), env.RESEND_API_KEY));
    }
    const res = await Promise.allSettled(envios);
    for (const e of res) if (e.status === 'rejected') console.error('email_fallo', String(e.reason));
    await marcarCumplido(env.KV, pedido.orderId);
  } else {
    console.log(JSON.stringify({ evento: 'email_reenvio_saltado', orderId: pedido.orderId }));
  }

  return Response.json(
    { ok: true, paid: true, rutaId: pedido.rutaId, idioma: pedido.idioma, orderId: pedido.orderId, token },
    { headers: { ...cors, 'Cache-Control': 'no-store' } },
  );
}
```

Borrar el comentario obsoleto de "sin base de datos no hay forma de deduplicar…" que precedía a la función (ya no aplica: ahora sí se deduplica con KV).

- [ ] **Step 2: Ejecutar la suite del worker**

Run: `cd worker && node --test`
Expected: sin regresiones (hacer tras la Task 1.8).

- [ ] **Step 3: Commit**

```bash
git add worker/src/index.js
git commit -m "feat(worker): throttle + envío único de emails en /api/confirm-payment"
```

---

### Task 1.7: Router — extraer IP y respuesta 500 genérica

**Files:**
- Modify: `worker/src/index.js` (`export default { fetch }`)

- [ ] **Step 1: Reescribir el `fetch`**

Reemplazar el `export default { async fetch(request, env) { … } }` por:

```js
export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const cors = buildCorsHeaders(origin, env.ALLOWED_ORIGIN);
    const url = new URL(request.url);
    const ip = request.headers.get('CF-Connecting-IP') || '';

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    try {
      if (request.method === 'GET' && url.pathname === '/api/ruta') {
        return await handleObtenerRuta(url, env, cors);
      }
      if (request.method === 'POST' && url.pathname === '/api/create-checkout-session') {
        return await handleCrearCheckoutSession(request, env, cors, ip);
      }
      if (request.method === 'POST' && url.pathname === '/api/acceso-gratuito') {
        return await handleAccesoGratuito(request, env, cors, ip);
      }
      if (request.method === 'GET' && url.pathname === '/api/confirm-payment') {
        return await handleConfirmarPago(url, env, cors, ip);
      }
    } catch (error) {
      console.error('error_no_controlado', String((error && error.stack) || error));
      return Response.json({ error: 'Error interno' }, { status: 500, headers: cors });
    }

    return new Response('Not found', { status: 404, headers: cors });
  },
};
```

Esto cubre además el hallazgo **#6** (no filtrar `error.message` al cliente), que la spec listaba en la Tanda 2.

- [ ] **Step 2: Commit**

```bash
git add worker/src/index.js
git commit -m "feat(worker): IP por CF-Connecting-IP y respuesta 500 genérica (#6)"
```

---

### Task 1.8: Cablear `handleCrearCheckoutSession` + tests del router

**Files:**
- Modify: `worker/src/index.js` (`handleCrearCheckoutSession`)
- Modify: `worker/tests/index.test.js`

- [ ] **Step 1: Reescribir `handleCrearCheckoutSession`**

```js
export async function handleCrearCheckoutSession(request, env, cors, ip) {
  const leido = await leerJsonAcotado(request);
  if (leido.error) return Response.json({ error: leido.error }, { status: leido.status, headers: cors });
  const { rutaId, idioma } = leido.datos || {};

  if (!entradaValida({ rutaId, idioma })) {
    return Response.json({ error: 'Ruta o idioma no válidos' }, { status: 400, headers: cors });
  }

  const cupo = await consumirCupo(env.KV, { ip, accion: 'checkout', limite: 10, ventanaSegundos: 900 });
  if (!cupo.permitido) {
    console.log(JSON.stringify({ evento: 'throttle_bloqueo', accion: 'checkout', ip }));
    return Response.json(
      { error: 'Demasiadas solicitudes, prueba de nuevo en unos minutos' },
      { status: 429, headers: { ...cors, 'Retry-After': String(cupo.reintentarEn) } },
    );
  }

  const precio = precioDeRuta(rutaId);
  if (precio.importe === 0) {
    return Response.json({ error: `"${rutaId}" es una ruta gratuita: usa /api/acceso-gratuito` }, { status: 400, headers: cors });
  }

  const orderId = `ord_${crypto.randomUUID()}`;
  const params = buildCheckoutSessionParams(
    { rutaId, idioma, orderId, tituloRuta: localizar(rutaPorId(rutaId)?.titulo, idioma) },
    env.SITE_URL,
  );
  const session = await createStripeSession(params, env.STRIPE_SECRET_KEY);
  return Response.json({ url: session.url }, { headers: cors });
}
```

Nota: `entradaValida` ya garantiza que `rutaId` existe en el catálogo, así que `precioDeRuta(rutaId)` nunca devuelve `null` aquí y se elimina esa rama; queda solo el chequeo de ruta gratuita.

- [ ] **Step 2: Actualizar el helper `requestFalso` y añadir tests**

En `worker/tests/index.test.js`, reemplazar el helper y añadir el import de un KV falso y tests nuevos:

```js
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

test('create-checkout-session responde 429 cuando el cupo de la IP está agotado', async () => {
  const reset = Math.floor(Date.now() / 1000) + 800;
  const kv = crearKvFalso({ 'rl:checkout:5.5.5.5': JSON.stringify({ n: 10, reset }) });
  const r = await handleCrearCheckoutSession(
    requestFalso({ rutaId: 'barcelona-gotic', idioma: 'es' }),
    { ...ENV_BASE, KV: kv },
    { 'Access-Control-Allow-Origin': '*' },
    '5.5.5.5',
  );
  assert.equal(r.status, 429);
  assert.ok(r.headers.get('Retry-After'));
});

test('create-checkout-session rechaza rutaId con forma inválida antes de tocar Stripe', async () => {
  const r = await handleCrearCheckoutSession(
    requestFalso({ rutaId: '__proto__', idioma: 'es' }),
    { ...ENV_BASE, KV: crearKvFalso() },
    { 'Access-Control-Allow-Origin': '*' },
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
      { 'Access-Control-Allow-Origin': '*' },
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
```

Verificar que `barcelona-born` sigue siendo una ruta gratis real del catálogo (lo es, según la spec de enigmas). Si en el futuro deja de serlo, usar la ruta gratis que corresponda.

- [ ] **Step 3: Ejecutar toda la suite**

Run: `cd worker && node --test`
Expected: PASS — todos los ficheros (`acceso`, `contenido`, `cors`, `cumplimiento`, `entrada`, `index`, `resend`, `stripe`, `throttle`).

- [ ] **Step 4: Commit**

```bash
git add worker/src/index.js worker/tests/index.test.js
git commit -m "feat(worker): throttle + validación en /api/create-checkout-session + tests"
```

---

### Task 1.9: Front — manejar 429 en `api.js` y `ruta.js`

**Files:**
- Modify: `js/api.js` (`crearCheckoutSession`, `confirmarPago`)
- Modify: `js/ruta.js` (bloque `catch` del CTA)
- Modify: `js/i18n.js` (clave nueva ×4)

- [ ] **Step 1: `js/api.js` — marcar el error de rate limit**

En `crearCheckoutSession`, tras `const cuerpo = await respuesta.json().catch(() => ({}));` y antes del `if (!respuesta.ok)`:

```js
    if (respuesta.status === 429) {
      const err = new Error(cuerpo.error || 'Demasiadas solicitudes');
      err.rateLimited = true;
      throw err;
    }
```

Idéntico bloque en `confirmarPago`, en el mismo punto (tras el `.catch(() => ({}))`).

- [ ] **Step 2: `js/i18n.js` — clave nueva**

Añadir `ruta_error_rate_limit` en los cuatro bloques de idioma, junto a `ruta_error_reserva`:

```js
// es (línea ~161)
    ruta_error_rate_limit: 'Has hecho demasiadas solicitudes. Espera unos minutos e inténtalo de nuevo.',
// en (línea ~307)
    ruta_error_rate_limit: "You've made too many requests. Wait a few minutes and try again.",
// fr (línea ~453)
    ruta_error_rate_limit: 'Vous avez fait trop de demandes. Attendez quelques minutes et réessayez.',
// it (línea ~599)
    ruta_error_rate_limit: 'Hai effettuato troppe richieste. Attendi qualche minuto e riprova.',
```

- [ ] **Step 3: `js/ruta.js` — usar el mensaje**

En el `catch` del listener del CTA (actualmente `} catch {`), cambiar a:

```js
    } catch (error) {
      cta.removeAttribute('aria-busy');
      const claveError = error?.rateLimited
        ? 'ruta_error_rate_limit'
        : (esGratis ? 'ruta_error_acceso_gratuito' : 'ruta_error_reserva');
      cta.textContent = t(lang, claveError);
      setTimeout(() => { cta.textContent = textoOriginal; }, 4000);
    }
```

- [ ] **Step 4: Verificar la suite del front**

Run: `node --test` (desde la raíz)
Expected: PASS — `tests/i18n.test.js` sigue verde (si comprueba paridad de claves entre idiomas, las 4 nuevas la mantienen).

- [ ] **Step 5: Commit**

```bash
git add js/api.js js/ruta.js js/i18n.js
git commit -m "feat(front): mensaje propio cuando el Worker responde 429"
```

---

### Task 1.10: Verificación manual de la Tanda 1

- [ ] **Step 1: Smoke test local**

```bash
cd worker && npx wrangler dev --local
```
En otra terminal, con el `.dev.vars` cargado:
```bash
curl -s -X POST localhost:8787/api/acceso-gratuito \
  -H 'Content-Type: application/json' \
  -H 'CF-Connecting-IP: 9.9.9.9' \
  -d '{"rutaId":"barcelona-born","idioma":"es","email":"a@a.aa"}'
```
Repetir 3 veces. Expected: la 1ª trae `"emailEnviado":true` (o `false` si Resend no está configurado en dev — mirar logs), la 2ª y 3ª `"emailEnviado":false`. Todas traen `token`.

- [ ] **Step 2: Body gigante y JSON inválido**

```bash
curl -s -o /dev/null -w '%{http_code}\n' -X POST localhost:8787/api/create-checkout-session \
  -H 'Content-Type: application/json' -H 'Content-Length: 99999' -d '{"rutaId":"x"}'   # -> 413
curl -s -o /dev/null -w '%{http_code}\n' -X POST localhost:8787/api/create-checkout-session \
  -H 'Content-Type: application/json' -d 'no-es-json'   # -> 400
```

- [ ] **Step 3: Desplegar**

```bash
cd worker && node --test && npx wrangler deploy
```
Expected: deploy OK, el binding `KV` aparece en la salida.

- [ ] **Step 4: Verificar en producción con `wrangler tail`**

```bash
cd worker && npx wrangler tail
```
Hacer una compra de prueba real (ruta de pago, tarjeta de test de Stripe) y recargar `gracias.html`. Expected en los logs: `email_reenvio_saltado` en la segunda carga; el acceso funciona en ambas.

---

## TANDA 2 — Alto

### Task 2.1: `validarSesionPagada` y `sesionReembolsada` en `stripe.js`

**Files:**
- Modify: `worker/src/stripe.js`
- Modify: `worker/tests/stripe.test.js`

- [ ] **Step 1: Escribir los tests que fallan**

Añadir a `worker/tests/stripe.test.js`:

```js
import { validarSesionPagada, sesionReembolsada } from '../src/stripe.js';

const PRECIO_MEDIA = { importe: 4.99, moneda: 'eur' };

test('validarSesionPagada acepta una sesión coherente', () => {
  const session = { payment_status: 'paid', amount_total: 499, currency: 'eur', metadata: { ruta_id: 'barcelona-gotic' } };
  assert.equal(validarSesionPagada(session, PRECIO_MEDIA), true);
});

test('validarSesionPagada rechaza importe, moneda o ruta manipulados o ausentes', () => {
  assert.equal(validarSesionPagada({ payment_status: 'paid', amount_total: 100, currency: 'eur', metadata: { ruta_id: 'barcelona-gotic' } }, PRECIO_MEDIA), false);
  assert.equal(validarSesionPagada({ payment_status: 'paid', amount_total: 499, currency: 'usd', metadata: { ruta_id: 'barcelona-gotic' } }, PRECIO_MEDIA), false);
  assert.equal(validarSesionPagada({ payment_status: 'paid', amount_total: 499, currency: 'eur', metadata: {} }, PRECIO_MEDIA), false);
  assert.equal(validarSesionPagada({ payment_status: 'unpaid', amount_total: 499, currency: 'eur', metadata: { ruta_id: 'barcelona-gotic' } }, PRECIO_MEDIA), false);
  assert.equal(validarSesionPagada({ payment_status: 'paid', amount_total: 499, currency: 'eur', metadata: { ruta_id: 'barcelona-gotic' } }, null), false);
});

test('sesionReembolsada detecta un cargo reembolsado', () => {
  assert.equal(sesionReembolsada({ payment_intent: { latest_charge: { refunded: true, amount_refunded: 499 } } }), true);
  assert.equal(sesionReembolsada({ payment_intent: { latest_charge: { refunded: false, amount_refunded: 0 } } }), false);
  assert.equal(sesionReembolsada({ payment_intent: null }), false);
  assert.equal(sesionReembolsada({}), false);
});
```

- [ ] **Step 2: Ejecutar y ver que falla**

Run: `cd worker && node --test tests/stripe.test.js`
Expected: FAIL — `validarSesionPagada`/`sesionReembolsada` no exportados.

- [ ] **Step 3: Implementación**

Añadir a `worker/src/stripe.js`:

```js
/**
 * Defensa en profundidad: aunque la sesión la crea este Worker con el precio
 * de precios.js, se vuelve a comprobar al confirmar que el importe, la moneda
 * y la ruta pagados son los esperados. `precioEsperado` = salida de
 * precioDeRuta (importe en euros, moneda en minúsculas).
 */
export function validarSesionPagada(session, precioEsperado) {
  if (!session || session.payment_status !== 'paid') return false;
  if (!precioEsperado) return false;
  if (session.amount_total !== Math.round(precioEsperado.importe * 100)) return false;
  if (session.currency !== precioEsperado.moneda) return false;
  if (!session.metadata || typeof session.metadata.ruta_id !== 'string') return false;
  return true;
}

/** true si el cargo asociado a la sesión ha sido reembolsado (total o
 *  parcialmente). Requiere haber recuperado la sesión con
 *  `expand[]=payment_intent.latest_charge`. */
export function sesionReembolsada(session) {
  const cargo = session?.payment_intent?.latest_charge;
  if (!cargo) return false;
  return cargo.refunded === true || (typeof cargo.amount_refunded === 'number' && cargo.amount_refunded > 0);
}
```

- [ ] **Step 4: Ejecutar y ver que pasa**

Run: `cd worker && node --test tests/stripe.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add worker/src/stripe.js worker/tests/stripe.test.js
git commit -m "feat(worker): validación de importe/moneda/ruta y detección de reembolso"
```

---

### Task 2.2: `retrieveStripeSession` con `expand[]`

**Files:**
- Modify: `worker/src/stripe.js` (`retrieveStripeSession`)
- Modify: `worker/tests/stripe.test.js`

- [ ] **Step 1: Actualizar el test existente**

En `worker/tests/stripe.test.js`, en el test `retrieveStripeSession pide el session_id correcto con autenticación`, añadir una aserción:

```js
  assert.ok(urlCapturada.includes('expand%5B%5D=payment_intent.latest_charge')
    || urlCapturada.includes('expand[]=payment_intent.latest_charge'));
```

- [ ] **Step 2: Ejecutar y ver que falla**

Run: `cd worker && node --test tests/stripe.test.js`
Expected: FAIL en esa aserción.

- [ ] **Step 3: Implementación**

En `retrieveStripeSession`, cambiar la URL:

```js
export async function retrieveStripeSession(sessionId, secretKey, fetchFn = fetch) {
  const url = `https://api.stripe.com/v1/checkout/sessions/${sessionId}?expand[]=payment_intent.latest_charge`;
  const response = await fetchFn(url, {
    method: 'GET',
    headers: { Authorization: `Bearer ${secretKey}` },
  });
  if (!response.ok) {
    throw new Error('No se pudo recuperar la sesión de Stripe');
  }
  return response.json();
}
```

- [ ] **Step 4: Ejecutar y ver que pasa**

Run: `cd worker && node --test tests/stripe.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add worker/src/stripe.js worker/tests/stripe.test.js
git commit -m "feat(worker): expandir payment_intent.latest_charge al recuperar la sesión"
```

---

### Task 2.3: `buildAvisoOwner` + cablear validación/refund en `handleConfirmarPago`

**Files:**
- Modify: `worker/src/resend.js` (nueva `buildAvisoOwner`)
- Modify: `worker/tests/resend.test.js`
- Modify: `worker/src/index.js` (`handleConfirmarPago`, imports)

- [ ] **Step 1: Test de `buildAvisoOwner`**

Añadir a `worker/tests/resend.test.js`:

```js
import { buildAvisoOwner } from '../src/resend.js';

test('buildAvisoOwner arma un email al owner con el texto escapado', () => {
  const email = buildAvisoOwner('Sesión cs_test_1 con importe <raro>', 'owner@example.com');
  assert.deepEqual(email.to, ['owner@example.com']);
  assert.match(email.subject, /Vestigia/);
  assert.ok(!email.html.includes('<raro>'));
  assert.match(email.html, /&lt;raro&gt;/);
});
```

- [ ] **Step 2: Ejecutar y ver que falla**

Run: `cd worker && node --test tests/resend.test.js`
Expected: FAIL — `buildAvisoOwner` no exportado.

- [ ] **Step 3: Implementar `buildAvisoOwner`**

Añadir a `worker/src/resend.js` (reutiliza `FROM_ADDRESS` y `escapeHtml` ya presentes en el módulo):

```js
/** Email de aviso al owner para incidencias que requieren revisión manual
 *  (p. ej. una sesión pagada con un importe inesperado). */
export function buildAvisoOwner(texto, ownerEmail) {
  return {
    from: FROM_ADDRESS,
    to: [ownerEmail],
    subject: 'Vestigia: revisión manual',
    html: `<p>${escapeHtml(texto)}</p>`,
  };
}
```

- [ ] **Step 4: Cablear en `handleConfirmarPago`**

En `worker/src/index.js`:

Import: añadir `validarSesionPagada, sesionReembolsada` a la línea de import de `./stripe.js`, y `buildAvisoOwner` a la de `./resend.js`.

En `handleConfirmarPago`, justo después de `const precio = precioDeRuta(pedido.rutaId);` y antes de `const token = await firmarToken(...)`, insertar:

```js
  if (!validarSesionPagada(session, precio)) {
    console.error('pago_incoherente', sessionId, session.amount_total, session.currency, pedido.rutaId);
    try {
      await sendEmail(buildAvisoOwner(`Sesión ${sessionId} pagada con importe/moneda/ruta inesperados`, env.OWNER_EMAIL), env.RESEND_API_KEY);
    } catch (e) {
      console.error('aviso_owner_fallo', String(e));
    }
    return Response.json({ error: 'La sesión de pago no es válida' }, { status: 500, headers: cors });
  }
  if (sesionReembolsada(session)) {
    console.log(JSON.stringify({ evento: 'acceso_denegado_reembolso', orderId: pedido.orderId }));
    return Response.json({ error: 'Este pedido ha sido reembolsado' }, { status: 403, headers: cors });
  }
```

- [ ] **Step 5: Ejecutar la suite del worker**

Run: `cd worker && node --test`
Expected: PASS. Los tests existentes de `stripe.test.js` que llaman a `parseSessionPaymentStatus` y `pedidoDesdeSession` no se ven afectados.

- [ ] **Step 6: Commit**

```bash
git add worker/src/resend.js worker/tests/resend.test.js worker/src/index.js
git commit -m "feat(worker): rechazar pagos incoherentes o reembolsados en confirm-payment"
```

---

### Task 2.4: Verificación y despliegue Tanda 2

- [ ] **Step 1:** `cd worker && node --test` → PASS completo.
- [ ] **Step 2:** `cd worker && npx wrangler deploy`.
- [ ] **Step 3:** Compra de prueba con tarjeta de test de Stripe → acceso OK. Reembolsar esa compra desde el dashboard de Stripe, volver a llamar a `gracias.html?session_id=…` → Expected: `403`, mensaje "Este pedido ha sido reembolsado".

---

## TANDA 3 — Medio

### Task 3.1: Campo `v` en el token

**Files:**
- Modify: `worker/src/acceso.js` (`firmarToken`, `verificarToken`)
- Modify: `worker/tests/acceso.test.js`

- [ ] **Step 1: Tests que fallan**

Añadir a `worker/tests/acceso.test.js`:

```js
test('el payload del token lleva v: 1', async () => {
  const token = await firmarToken({ rutaId: 'barcelona-gotic', orderId: 'ord_1' }, SECRETO);
  const payload = await verificarToken(token, SECRETO);
  assert.equal(payload.v, 1);
});

test('un token con v ausente o desconocido se rechaza', async () => {
  // Firma manual de un payload sin v, con la misma mecánica que acceso.js
  const { subtle } = globalThis.crypto;
  const b64url = (bytes) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const payloadB64 = b64url(new TextEncoder().encode(JSON.stringify({ rutaId: 'x', orderId: 'y', exp: Math.floor(Date.now() / 1000) + 1000 })));
  const key = await subtle.importKey('raw', new TextEncoder().encode(SECRETO), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const firma = new Uint8Array(await subtle.sign('HMAC', key, new TextEncoder().encode(payloadB64)));
  const tokenSinV = `${payloadB64}.${b64url(firma)}`;
  assert.equal(await verificarToken(tokenSinV, SECRETO), null);
});
```

- [ ] **Step 2: Ejecutar y ver que falla**

Run: `cd worker && node --test tests/acceso.test.js`
Expected: FAIL — `payload.v` es `undefined`; el token sin `v` se acepta.

- [ ] **Step 3: Implementación**

En `worker/src/acceso.js`:

En `firmarToken`, cambiar el objeto `payload`:

```js
  const payload = {
    v: 1,
    rutaId,
    orderId,
    exp: Math.floor(Date.now() / 1000) + duracionSegundos,
  };
```

En `verificarToken`, tras la comprobación `typeof payload.exp !== 'number'` y antes de la de caducidad, añadir:

```js
    if (payload.v !== 1) return null;
```

- [ ] **Step 4: Ejecutar y ver que pasa**

Run: `cd worker && node --test tests/acceso.test.js`
Expected: PASS. El test existente `dos tokens para el mismo pedido son idénticos…` sigue verde (el payload sigue siendo determinista).

- [ ] **Step 5: Commit**

```bash
git add worker/src/acceso.js worker/tests/acceso.test.js
git commit -m "feat(worker): versionar el token de acceso (v: 1)"
```

Nota: invalida los tokens ya emitidos y los de `mint-dev-token.mjs` anteriores al cambio. Sin ventas reales aún (ver spec). Regenerar tokens de dev con `node scripts/mint-dev-token.mjs <ruta>`.

---

### Task 3.2: Allowlist de idioma en `handleObtenerRuta`

**Files:**
- Modify: `worker/src/index.js` (`handleObtenerRuta`)

- [ ] **Step 1: Aplicar la validación de idioma**

En `handleObtenerRuta`, tras `const idiomaSolicitado = url.searchParams.get('idioma') || 'es';`, añadir:

```js
  const IDIOMAS = ['es', 'en', 'fr', 'it'];
  const idioma = IDIOMAS.includes(idiomaSolicitado) ? idiomaSolicitado : 'es';
```

y usar `idioma` en la llamada a `cargarContenido(payload.rutaId, idioma)` y en la respuesta. `payload.rutaId` viene del token ya verificado, no necesita `entradaValida`.

- [ ] **Step 2: Test**

Añadir a `worker/tests/index.test.js` (requiere exportar `handleObtenerRuta` — añadir `export` a la función):

```js
import { handleObtenerRuta } from '../src/index.js';
import { firmarToken } from '../src/acceso.js';

test('handleObtenerRuta ignora un idioma no soportado y sirve es', async () => {
  const token = await firmarToken({ rutaId: 'barcelona-gotic', orderId: 'ord_1' }, 's');
  const url = new URL(`https://x/api/ruta?t=${encodeURIComponent(token)}&idioma=zz`);
  const r = await handleObtenerRuta(url, { TOKEN_SECRET: 's' }, { 'Access-Control-Allow-Origin': '*' });
  assert.equal(r.status, 200);
  const cuerpo = await r.json();
  assert.equal(cuerpo.idiomaServido, 'es');
});
```

Nota: este test carga contenido real; `barcelona-gotic.es` existe en `worker/src/contenido/` (gitignore) — el test solo corre en un entorno con ese contenido presente. Comprobar cómo lo maneja `worker/tests/contenido.test.js` y seguir el mismo patrón (si hace falta, envolver con `{ skip: ... }`).

- [ ] **Step 3: Ejecutar**

Run: `cd worker && node --test`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add worker/src/index.js worker/tests/index.test.js
git commit -m "feat(worker): allowlist de idioma en /api/ruta"
```

---

### Task 3.3: Escapar contenido en `js/jugar.js`

**Files:**
- Modify: `js/jugar.js` (import + `renderPistas` + `renderCampos`)

- [ ] **Step 1: Añadir `escaparHtml` al import de i18n**

Línea 8 de `js/jugar.js`:

```js
import { DEFAULT_LANG, LANGS, aplicarI18n, detectarIdioma, guardarIdioma, escaparHtml, t, tf } from './i18n.js';
```

- [ ] **Step 2: `renderPistas` (L77-79)**

```js
  els['lista-pistas'].innerHTML = reveladas
    .map((texto, i) => `<div class="pista"><span class="pista__numero">#${i + 1}</span><span>${escaparHtml(texto)}</span></div>`)
    .join('');
```

- [ ] **Step 3: `renderCampos`, rama múltiple (L113-121)**

```js
  contenedor.innerHTML = parada.subpreguntas
    .map(
      (sub, i) => `
      <div class="campo-multiple" data-indice="${i}">
        <label class="campo-multiple__etiqueta" for="respuesta-${i}">${escaparHtml(sub.texto)}</label>
        <input id="respuesta-${i}" class="input-respuesta input-respuesta--corta" type="text"
               autocomplete="off" autocapitalize="off" spellcheck="false"
               placeholder="${escaparHtml(t(app.lang, 'juego_input_placeholder_corto'))}">
      </div>`,
    )
    .join('');
```

(También la rama simple L105-109: envolver el `placeholder` en `escaparHtml(...)` por consistencia, aunque venga de i18n.)

- [ ] **Step 4: Test**

Si existe un runner de DOM en `tests/` (mirar `tests/motor.test.js` / `tests/pistas.test.js` — usan `node:test` puro sin DOM), añadir un test unitario de una función de plantilla no es directo porque las plantillas están inline. Alternativa pragmática: extraer la plantilla de pista a una función pura `filaPista(texto, i)` exportada y testearla:

```js
// en js/jugar.js
export function filaPista(texto, i) {
  return `<div class="pista"><span class="pista__numero">#${i + 1}</span><span>${escaparHtml(texto)}</span></div>`;
}
```

```js
// tests/jugar-plantillas.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { filaPista } from '../js/jugar.js';

test('filaPista escapa el texto de la pista', () => {
  const html = filaPista('<img src=x onerror=alert(1)>', 0);
  assert.ok(!html.includes('<img'));
  assert.match(html, /&lt;img/);
});
```

Verificar que importar `js/jugar.js` en Node no ejecuta código de DOM al cargar: el módulo tiene el guard `if (typeof document !== 'undefined')` al final — OK, seguro de importar.

- [ ] **Step 5: Ejecutar**

Run: `node --test` (raíz)
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add js/jugar.js tests/jugar-plantillas.test.js
git commit -m "fix(front): escapar el texto de pistas y subpreguntas en el DOM"
```

---

### Task 3.4: Escapar contenido en `js/imprimir.js`

**Files:**
- Modify: `js/imprimir.js`

- [ ] **Step 1: Import**

Línea 10:

```js
import { DEFAULT_LANG, LANGS, aplicarI18n, detectarIdioma, guardarIdioma, escaparHtml, t, tf } from './i18n.js';
```

- [ ] **Step 2: Envolver todos los campos de contenido interpolados**

En `renderCasillas`: `${escaparHtml(sub.texto)}`.
En `renderParadas`: `${escaparHtml(p.titulo)}`, `${escaparHtml(p.llegada)}`, `${escaparHtml(p.enigma)}`, `${escaparHtml(p.historia)}`. (El `figuraSvg(p.figuraId)` NO se escapa: es SVG de confianza generado por `js/juego/figuras.js`.)
En `renderPistasImpresas`: `${escaparHtml(pista)}`.
En `renderRespuestas`: `${escaparHtml(p.titulo)}`, y `${escaparHtml(p.saberMas)}` dentro del ternario.

- [ ] **Step 3: Extraer una función testeable**

```js
// en js/imprimir.js
export function bloqueParada(p, ruta, lang) {
  return `
    <div class="parada-impresa">
      <span class="parada-impresa__numero">Parada ${p.n} / ${ruta.paradas.length}</span>
      <h2 class="parada-impresa__titulo">${escaparHtml(p.titulo)}</h2>
      <div class="parada-impresa__bloque">
        <span class="parada-impresa__etiqueta">${t(lang, 'imprimir_llegada_label')}</span>
        <p class="parada-impresa__texto">${escaparHtml(p.llegada)}</p>
      </div>
      <div class="parada-impresa__bloque">
        <span class="parada-impresa__etiqueta">${t(lang, 'imprimir_enigma_label')}</span>
        <p class="parada-impresa__texto">${escaparHtml(p.enigma)}</p>
        ${p.figuraId ? `<figure class="figura-impresa">${figuraSvg(p.figuraId)}</figure>` : ''}
      </div>
      ${renderCasillas(p, lang)}
      <div class="parada-impresa__bloque parada-impresa__bloque--historia">
        <span class="parada-impresa__etiqueta">${t(lang, 'imprimir_historia_label')}</span>
        <p class="parada-impresa__texto">${escaparHtml(p.historia)}</p>
      </div>
    </div>`;
}
```

y en `renderParadas` usar `.map((p) => bloqueParada(p, ruta, lang))`.

```js
// tests/imprimir-plantillas.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bloqueParada } from '../js/imprimir.js';

test('bloqueParada escapa titulo, llegada, enigma e historia', () => {
  const p = { n: 1, titulo: '<b>t</b>', llegada: '<i>l</i>', enigma: '<u>e</u>', historia: '<s>h</s>' };
  const html = bloqueParada(p, { paradas: [p] }, 'es');
  for (const frag of ['<b>t</b>', '<i>l</i>', '<u>e</u>', '<s>h</s>']) assert.ok(!html.includes(frag));
  assert.match(html, /&lt;b&gt;t&lt;\/b&gt;/);
});
```

Verificar que `js/imprimir.js` es seguro de importar en Node: tiene el guard `if (document.readyState …)` al final que sí toca `document`. Envolverlo:

```js
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}
```

- [ ] **Step 4: Ejecutar**

Run: `node --test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add js/imprimir.js tests/imprimir-plantillas.test.js
git commit -m "fix(front): escapar el contenido de ruta en la versión imprimible"
```

---

### Task 3.5: Comentario sobre el alcance de CORS

**Files:**
- Modify: `worker/src/cors.js`

- [ ] **Step 1: Añadir el comentario**

Al principio de `buildCorsHeaders`, sobre el `const headers`:

```js
  // CORS NO autoriza nada frente a clientes que no sean navegadores (curl,
  // scripts): solo impide que JS de otro origen LEA la respuesta. La
  // autorización real de estos endpoints son el token firmado (/api/ruta) y
  // el rate limit por IP (worker/src/throttle.js).
```

- [ ] **Step 2: Commit**

```bash
git add worker/src/cors.js
git commit -m "docs(worker): aclarar que CORS no es un control de autorización"
```

---

## TANDA 4 — Bajo / higiene

### Task 4.1: Cabecera `X-Content-Type-Options` en todas las respuestas

**Files:**
- Modify: `worker/src/cors.js`
- Create: `worker/tests/cors.test.js`

- [ ] **Step 1: Test que falla**

Crear `worker/tests/cors.test.js`:

```js
// worker/tests/cors.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildCorsHeaders } from '../src/cors.js';

test('siempre incluye X-Content-Type-Options: nosniff', () => {
  const h = buildCorsHeaders('https://otro.com', 'https://vestigia.fun');
  assert.equal(h['X-Content-Type-Options'], 'nosniff');
});

test('refleja el Origin solo si coincide con el permitido', () => {
  assert.equal(buildCorsHeaders('https://vestigia.fun', 'https://vestigia.fun')['Access-Control-Allow-Origin'], 'https://vestigia.fun');
  assert.equal(buildCorsHeaders('https://malo.com', 'https://vestigia.fun')['Access-Control-Allow-Origin'], undefined);
});
```

- [ ] **Step 2: Ejecutar y ver que falla**

Run: `cd worker && node --test tests/cors.test.js`
Expected: FAIL en la primera aserción.

- [ ] **Step 3: Implementación**

```js
export function buildCorsHeaders(requestOrigin, allowedOrigin) {
  const headers = {
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'X-Content-Type-Options': 'nosniff',
  };
  if (requestOrigin === allowedOrigin) {
    headers['Access-Control-Allow-Origin'] = allowedOrigin;
  }
  return headers;
}
```

- [ ] **Step 4: Ejecutar y ver que pasa**

Run: `cd worker && node --test tests/cors.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add worker/src/cors.js worker/tests/cors.test.js
git commit -m "feat(worker): X-Content-Type-Options: nosniff en todas las respuestas"
```

---

### Task 4.2: `Cache-Control: no-store` en `/api/ruta`

**Files:**
- Modify: `worker/src/index.js` (`handleObtenerRuta`)

- [ ] **Step 1: Añadir la cabecera**

En `handleObtenerRuta`, en el `Response.json` final de éxito y en el de error de token/ruta, cambiar `{ headers: cors }` por `{ headers: { ...cors, 'Cache-Control': 'no-store' } }`. (`confirm-payment` ya lo tiene desde la Task 1.6.)

- [ ] **Step 2: Test**

Añadir a `worker/tests/index.test.js` (reusa el test de idioma de la Task 3.2):

```js
test('la respuesta de /api/ruta no es cacheable', async () => {
  const token = await firmarToken({ rutaId: 'barcelona-gotic', orderId: 'ord_1' }, 's');
  const url = new URL(`https://x/api/ruta?t=${encodeURIComponent(token)}`);
  const r = await handleObtenerRuta(url, { TOKEN_SECRET: 's' }, { 'Access-Control-Allow-Origin': '*' });
  assert.equal(r.headers.get('Cache-Control'), 'no-store');
});
```

- [ ] **Step 3: Ejecutar**

Run: `cd worker && node --test`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add worker/src/index.js worker/tests/index.test.js
git commit -m "feat(worker): Cache-Control no-store en /api/ruta"
```

---

### Task 4.3: `<meta name="referrer">` en las páginas de `jugar/`

**Files:**
- Modify: `jugar/gracias.html`, `jugar/index.html`, `jugar/imprimir.html`

- [ ] **Step 1: Añadir el meta**

En el `<head>` de cada uno de los tres ficheros, inmediatamente tras `<meta charset=…>`:

```html
<meta name="referrer" content="no-referrer">
```

Evita que `?t=<token>` y `?session_id=<id>` viajen en el header `Referer` hacia recursos externos (fuentes, imágenes, enlaces salientes).

- [ ] **Step 2: Verificación**

Abrir `jugar/gracias.html` con un `?t=` de prueba, inspeccionar en el navegador que las peticiones salientes no llevan `Referer` con el token. (Manual.)

- [ ] **Step 3: Commit**

```bash
git add jugar/gracias.html jugar/index.html jugar/imprimir.html
git commit -m "fix(front): no-referrer en las páginas que llevan token en la URL"
```

---

### Task 4.4: Repaso de observabilidad

**Files:**
- Modify: `worker/src/index.js` (si falta algún log)

- [ ] **Step 1: Verificar que existen estos `console.*`**

Recorrer `index.js` y confirmar que están (añadidos en tasks previas): `throttle_bloqueo` (×3 acciones), `email_reenvio_saltado`, `email_fallo`, `pago_incoherente`, `acceso_denegado_reembolso`, `error_no_controlado`, `aviso_owner_fallo`. Añadir `console.log(JSON.stringify({ evento: 'pago_validado', orderId: pedido.orderId, rutaId: pedido.rutaId }))` tras `sesionReembolsada` en `handleConfirmarPago`.

- [ ] **Step 2: Commit (si hubo cambios)**

```bash
git add worker/src/index.js
git commit -m "chore(worker): log de pago validado"
```

---

### Task 4.5: Despliegue Tanda 3 + 4

- [ ] **Step 1:** `cd worker && node --test` → PASS. `node --test` (raíz) → PASS.
- [ ] **Step 2:** `cd worker && npx wrangler deploy`.
- [ ] **Step 3:** `git push` (front a GitHub Pages).
- [ ] **Step 4:** Smoke test: jugar una ruta completa (token nuevo con `v:1`), abrir la versión imprimible, verificar que el contenido se ve bien (el escape no rompe nada visible porque el contenido es texto plano).

---

## TANDA 5 — Investigación (no bloquea las demás)

### Task 5.1: Escaneo de secretos en el historial de git

- [ ] **Step 1: Ejecutar gitleaks**

```bash
cd /c/Users/Administrador/Proyectos/Vestigia
docker run --rm -v "$(pwd):/repo" zricethezav/gitleaks:latest detect --source=/repo --report-format json --report-path /repo/gitleaks-report.json --redact
```
(o `gitleaks` nativo si está instalado). Revisar `gitleaks-report.json`.

- [ ] **Step 2: Buscar patrones concretos en el historial**

```bash
git log -p --all -- worker/.dev.vars | head -50
git log -p --all -S 'sk_live_' --all
git log -p --all -S 're_' -- worker/
git log -p --all -S 'TOKEN_SECRET=' -- ':!*.md'
```
Expected: `worker/.dev.vars` nunca aparece en el historial (está en `.gitignore` desde el principio).

- [ ] **Step 3: Informe**

Escribir hallazgos en `docs/superpowers/notes/2026-09-02-escaneo-secretos.md`. Si aparece algún secreto real: la rotación (Stripe dashboard, Resend dashboard, `wrangler secret put TOKEN_SECRET`) la hace el owner — este plan solo entrega el informe.

- [ ] **Step 4: Limpiar y commit**

```bash
rm -f gitleaks-report.json
git add docs/superpowers/notes/2026-09-02-escaneo-secretos.md
git commit -m "docs: informe de escaneo de secretos del historial"
```

---

### Task 5.2: `npm audit`

- [ ] **Step 1: Ejecutar**

```bash
cd /c/Users/Administrador/Proyectos/Vestigia && npm audit
cd worker && npm audit
```

- [ ] **Step 2: Actuar**

Si hay vulnerabilidades accionables en `playwright` (raíz) o `wrangler` (worker), `npm audit fix` o bump manual de la versión en `package.json`, y `node --test` para confirmar que nada se rompe.

- [ ] **Step 3: Commit (si hubo cambios)**

```bash
git add package.json package-lock.json worker/package.json worker/package-lock.json
git commit -m "chore: npm audit fix"
```

---

### Task 5.3: Revisión de `mint-dev-token.mjs`

- [ ] **Step 1: Confirmar**

Verificar (ya revisado en el diseño, dejar constancia): `worker/scripts/mint-dev-token.mjs` lee `TOKEN_SECRET` de `.dev.vars` en tiempo de ejecución, no tiene secreto embebido, y vive en `scripts/` (fuera de `src/`, `wrangler deploy` empaqueta solo desde `main = src/index.js`). Sin cambios necesarios. Anotar en el informe de la Task 5.1.

---

## Self-review — cobertura de la spec

| Spec | Task |
|---|---|
| Arquitectura: `throttle.js`, KV, fail-open | 1.1, 1.2 |
| Frontend 429 + i18n | 1.9 |
| `<meta referrer>` | 4.3 |
| #1 acceso-gratuito throttle 1/15min + acceso en pantalla | 1.5 |
| #2 checkout throttle 10/15min + 429 | 1.8 |
| #3 confirm-payment idempotencia (`fulfilled:<orderId>`) + fallback por tiempo + throttle | 1.4, 1.6 |
| #4 `validarSesionPagada` (importe/moneda/metadata) + aviso owner | 2.1, 2.3 |
| #5 refund → 403 (`expand[]=payment_intent.latest_charge`) | 2.1, 2.2, 2.3 |
| #6 error 500 genérico | 1.7 |
| #7 token `v: 1` | 3.1 |
| #9 allowlist idioma + forma `rutaId` (`entrada.js`) | 1.3, 3.2 |
| #10 límite de tamaño + Content-Type (`leerJsonAcotado`) | 1.3, 1.5, 1.8 |
| #11 nota CORS | 3.5 |
| #12 escapar contenido en el DOM | 3.3, 3.4 |
| #14 cabeceras (`nosniff`, `no-store`) | 4.1, 4.2 |
| #15 observabilidad | logs en 1.5–2.3, repaso 4.4 |
| #16 `Promise.allSettled` | 1.5, 1.6 |
| #13 escaneo de secretos | 5.1 |
| #17 npm audit | 5.2 |
| #18 mint-dev-token | 5.3 |

Fuera de alcance (spec): Turnstile, BD de pedidos, webhooks de Stripe, rate limit atómico, revocación individual de tokens, anti-scraping de contenido.

---

## Notas de ejecución

- **Orden dentro de la Tanda 1:** 1.1 → 1.2 → 1.3 → 1.4 → 1.5 → 1.6 → 1.7 → 1.8 → 1.9 → 1.10. Las tasks 1.5–1.7 dejan `worker/tests/index.test.js` temporalmente rojo (helper `requestFalso` sin `headers`); la 1.8 lo arregla. Correr `node --test` completo solo al llegar a 1.8.
- **Tests:** worker desde `worker/` (`node --test`), front desde la raíz (`node --test`). Nunca saltarse un fallo.
- **Contenido de pago:** `worker/src/contenido/` está en `.gitignore`; los tests que cargan contenido real (`contenido.test.js`, y el nuevo de idioma en 3.2) asumen que esos JSON están en disco. No commitearlos.
- **Despliegue:** `wrangler deploy` tras cada tanda; el front por `git push`. `wrangler kv namespace create` es un paso manual único (Task 1.2).

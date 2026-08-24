# Precios por dificultad, selector de idioma y mapa de ruta — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cobrar cada ruta según su dificultad (fácil = gratis, media = 4,99 €, difícil = 7,99 €) sin Stripe para las gratuitas, sustituir el `<select>` de idioma por pastillas de texto siempre visibles, y sustituir la sección «Qué incluye» de la ficha de ruta por un mapa antiguo generado una vez a partir de datos reales de OpenStreetMap.

**Architecture:** El precio deja de fijarse por ruta y se deriva de una única tabla `PRECIOS_POR_DIFICULTAD` en `js/catalogo.js`, que tanto el catálogo público como `worker/src/precios.js` importan — así el precio de escaparate y el de cobro son, literalmente, el mismo número. Las rutas gratis se saltan Stripe por completo: un endpoint nuevo del Worker acuña el token de acceso directamente. El selector de idioma pasa de un `<select>` a un grupo de `<button>` (misma lógica de guardar+recargar). El mapa de cada ruta es un SVG estático generado una vez por un script de Node contra la Overpass API y commiteado como archivo, igual que las fotos de ciudad.

**Tech Stack:** Vanilla JS (ES modules), Cloudflare Worker (`worker/src`), `node --test`, Overpass API (datos de OpenStreetMap), sin frameworks ni dependencias nuevas.

**Nota sobre commits:** este proyecto no hace `git commit` salvo que el usuario lo pida explícitamente — así se ha trabajado en toda la sesión de diseño. Cada tarea termina dejando sus archivos en `git add` (staging), nunca commiteados. No ejecutes `git commit` al llegar a esos pasos.

**Nota sobre el entorno:** este repositorio no tiene ningún commit todavía (solo archivos en staging), así que no se puede crear un git worktree para este plan — se ejecuta directamente sobre `C:\Users\Administrador\Proyectos\Vestigia`.

---

## Parte A — Precios por dificultad

### Task 1: Tabla de precios por dificultad en el catálogo ✅ COMPLETADA

**Files:**
- Modify: `js/catalogo.js:18-27` (añadir `PRECIOS_POR_DIFICULTAD` tras `DIFICULTADES`)
- Modify: `js/catalogo.js:135`, `:174`, `:213`, `:252`, `:291`, `:330`, `:369` (los 7 `precio: 29,`)
- Test: `tests/precios.test.js`

- [ ] **Step 1: Escribir el test que falla**

Sustituye el contenido completo de `tests/precios.test.js` por:

```js
// tests/precios.test.js
//
// El error más caro posible: que el precio de escaparate (js/catalogo.js,
// lo que el cliente VE) y el precio de cobro (worker/src/precios.js, lo que
// el cliente PAGA) diverjan. Ambos derivan de la misma PRECIOS_POR_DIFICULTAD,
// así que esta prueba comprueba que esa garantía se sostiene de verdad.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PRECIOS_POR_DIFICULTAD, RUTAS } from '../js/catalogo.js';
import { precioDeRuta } from '../worker/src/precios.js';

test('cada ruta activa en el catálogo tiene un precio de cobro definido', () => {
  for (const ruta of RUTAS) {
    assert.ok(precioDeRuta(ruta.id), `worker/src/precios.js no define precio para "${ruta.id}"`);
  }
});

test('el precio de escaparate coincide exactamente con el precio de cobro', () => {
  for (const ruta of RUTAS) {
    const cobro = precioDeRuta(ruta.id);
    assert.equal(
      ruta.precio,
      cobro.importe,
      `"${ruta.id}": catalogo.js muestra ${ruta.precio}€ pero el Worker cobraría ${cobro.importe}€`,
    );
    assert.equal(
      ruta.moneda?.toLowerCase(),
      cobro.moneda,
      `"${ruta.id}": moneda de escaparate (${ruta.moneda}) no coincide con la de cobro (${cobro.moneda})`,
    );
  }
});

test('el precio de cada ruta coincide con la tabla por dificultad', () => {
  for (const ruta of RUTAS) {
    const nivel = PRECIOS_POR_DIFICULTAD[ruta.dificultad];
    assert.equal(
      ruta.precio,
      nivel.importe,
      `"${ruta.id}" (${ruta.dificultad}): precio ${ruta.precio}€ no coincide con el nivel (${nivel.importe}€)`,
    );
  }
});

test('precioDeRuta devuelve null para una ruta que no existe', () => {
  assert.equal(precioDeRuta('ruta-que-no-existe'), null);
});
```

- [ ] **Step 2: Ejecutar el test y comprobar que falla**

Run: `npm test`
Expected: FAIL — `PRECIOS_POR_DIFICULTAD` no existe todavía en `js/catalogo.js` (`SyntaxError` o `undefined` al importar).

- [ ] **Step 3: Añadir la tabla al catálogo**

En `js/catalogo.js`, justo después de la línea `export const DIFICULTADES = /** @type {const} */ (['facil', 'media', 'dificil']);` (línea 20), añade:

```js

/** Precio de escaparate por nivel de dificultad — la única tabla que decide
 * cuánto cuesta cada ruta. worker/src/precios.js importa esta misma
 * constante para cobrar exactamente lo que aquí se muestra: catálogo y
 * cobro no pueden desincronizarse porque son, literalmente, el mismo dato. */
export const PRECIOS_POR_DIFICULTAD = {
  facil: { importe: 0, moneda: 'EUR' },
  media: { importe: 4.99, moneda: 'EUR' },
  dificil: { importe: 7.99, moneda: 'EUR' },
};
```

- [ ] **Step 4: Actualizar el precio de las 7 rutas**

Cambia cada uno de estos 7 `precio: 29,` (deja `moneda: 'EUR',` tal cual, no cambia):

| Línea aprox. | Ruta | Dificultad | Cambiar a |
|---|---|---|---|
| 135 | barcelona-gotic | media | `precio: PRECIOS_POR_DIFICULTAD.media.importe,` |
| 174 | roma-centro | dificil | `precio: PRECIOS_POR_DIFICULTAD.dificil.importe,` |
| 213 | paris-marais | media | `precio: PRECIOS_POR_DIFICULTAD.media.importe,` |
| 252 | barcelona-born | facil | `precio: PRECIOS_POR_DIFICULTAD.facil.importe,` |
| 291 | barcelona-raval | dificil | `precio: PRECIOS_POR_DIFICULTAD.dificil.importe,` |
| 330 | lisboa-alfama | dificil | `precio: PRECIOS_POR_DIFICULTAD.dificil.importe,` |
| 369 | florencia-centro | facil | `precio: PRECIOS_POR_DIFICULTAD.facil.importe,` |

Usa el `id` de cada bloque (`id: 'barcelona-gotic',` etc.) para localizar el `precio: 29,` correcto — hay 7 apariciones idénticas de `precio: 29,` en el archivo, una por ruta, en el mismo orden que la tabla.

- [ ] **Step 4b: worker/src/precios.js todavía no existe en su forma nueva**

Este test seguirá fallando hasta la Task 2 (que reescribe `worker/src/precios.js` para importar `PRECIOS_POR_DIFICULTAD`). Es esperado — no ejecutes `npm test` en verde todavía, continúa directamente con la Task 2.

- [ ] **Step 5: Dejar el cambio listo para commitear**

```bash
git add js/catalogo.js tests/precios.test.js
```

---

### Task 2: El Worker deriva el precio del catálogo ✅ COMPLETADA

**Files:**
- Modify: `worker/src/precios.js` (reescritura completa)
- Modify: `worker/tests/stripe.test.js:12-20`

- [ ] **Step 1: Reescribir worker/src/precios.js**

Sustituye el contenido completo del archivo por:

```js
// worker/src/precios.js
//
// El precio de cada ruta se deriva de su dificultad — nunca se fija a mano
// por rutaId, para que sea imposible que el precio de cobro se desincronice
// del precio que ve el cliente en js/catalogo.js. Mismo patrón que ya usa
// worker/src/index.js: importar directamente del catálogo público, que
// Wrangler empaqueta junto con el resto del Worker al desplegar.
import { PRECIOS_POR_DIFICULTAD, rutaPorId } from '../../js/catalogo.js';

/** Precio de cobro para `rutaId`, o `null` si la ruta no existe. La moneda
 * se devuelve en minúsculas porque así la exige la API de Stripe. */
export function precioDeRuta(rutaId) {
  const ruta = rutaPorId(rutaId);
  const nivel = ruta && PRECIOS_POR_DIFICULTAD[ruta.dificultad];
  if (!nivel) return null;
  return { importe: nivel.importe, moneda: nivel.moneda.toLowerCase() };
}
```

- [ ] **Step 2: Ejecutar los tests de precios**

Run: `npm test`
Expected: los 4 tests de `tests/precios.test.js` PASAN. `worker/tests/stripe.test.js` falla en el primer test (unit_amount esperado `'2900'`, ahora sería `'499'`).

- [ ] **Step 3: Actualizar la expectativa en stripe.test.js**

En `worker/tests/stripe.test.js`, sustituye:

```js
test('buildCheckoutSessionParams toma el precio de precios.js, no permite inventarlo', () => {
  const params = buildCheckoutSessionParams(
    { rutaId: 'barcelona-gotic', idioma: 'es', orderId: 'ord_1', tituloRuta: 'El secreto del Barrio Gótico' },
    'https://vestigia.es',
  );
  assert.equal(params.get('line_items[0][price_data][unit_amount]'), '2900'); // 29€ en céntimos
  assert.equal(params.get('line_items[0][price_data][currency]'), 'eur');
  assert.equal(params.get('line_items[0][price_data][product_data][name]'), 'El secreto del Barrio Gótico');
});
```

por:

```js
test('buildCheckoutSessionParams toma el precio de precios.js, no permite inventarlo', () => {
  const params = buildCheckoutSessionParams(
    { rutaId: 'barcelona-gotic', idioma: 'es', orderId: 'ord_1', tituloRuta: 'El secreto del Barrio Gótico' },
    'https://vestigia.es',
  );
  assert.equal(params.get('line_items[0][price_data][unit_amount]'), '499'); // 4,99€ (dificultad media) en céntimos
  assert.equal(params.get('line_items[0][price_data][currency]'), 'eur');
  assert.equal(params.get('line_items[0][price_data][product_data][name]'), 'El secreto del Barrio Gótico');
});
```

- [ ] **Step 4: Ejecutar todos los tests**

Run: `npm test`
Expected: PASS — todos los tests, incluidos los de `worker/tests/`.

- [ ] **Step 5: Dejar el cambio listo para commitear**

```bash
git add worker/src/precios.js worker/tests/stripe.test.js
```

---

### Task 3: Arreglar el título de la ruta en los emails de confirmación ✅ COMPLETADA

`worker/src/index.js` pasa `rutaPorId(id)?.titulo` (un objeto `{es,en,fr,it}`) directamente a las plantillas de email, que lo interpolan como texto — hoy el asunto del email de compra muestra literalmente `[object Object]` en vez del nombre de la ruta. La Task 5 (endpoint gratuito) reutiliza exactamente el mismo patrón, así que se arregla aquí antes de duplicarlo.

**Files:**
- Modify: `worker/src/index.js:11`, `:21`, `:45`

- [ ] **Step 1: Importar localizar**

Cambia la línea 11:

```js
import { rutaPorId } from '../../js/catalogo.js';
```

por:

```js
import { localizar, rutaPorId } from '../../js/catalogo.js';
```

- [ ] **Step 2: Localizar el título en handleCrearCheckoutSession**

Cambia la línea 21:

```js
  const params = buildCheckoutSessionParams({ rutaId, idioma, orderId, tituloRuta: rutaPorId(rutaId)?.titulo }, env.SITE_URL);
```

por:

```js
  const params = buildCheckoutSessionParams({ rutaId, idioma, orderId, tituloRuta: localizar(rutaPorId(rutaId)?.titulo, idioma) }, env.SITE_URL);
```

- [ ] **Step 3: Localizar el título en handleConfirmarPago**

Cambia la línea 45:

```js
  const tituloRuta = rutaPorId(pedido.rutaId)?.titulo;
```

por:

```js
  const tituloRuta = localizar(rutaPorId(pedido.rutaId)?.titulo, pedido.idioma);
```

- [ ] **Step 4: Ejecutar los tests**

Run: `npm test`
Expected: PASS — este cambio no lo cubre ningún test unitario porque `handleCrearCheckoutSession`/`handleConfirmarPago` no se exportan (mismo criterio que ya sigue este archivo: la lógica de negocio testeable vive en `stripe.js`/`resend.js`/`precios.js`, que sí tienen tests). Se verifica manualmente en la Task 18.

- [ ] **Step 5: Dejar el cambio listo para commitear**

```bash
git add worker/src/index.js
```

---

### Task 4: Validación de email reutilizable ✅ COMPLETADA

**Files:**
- Modify: `worker/src/resend.js`
- Test: `worker/tests/resend.test.js`

- [ ] **Step 1: Escribir los tests que fallan**

Añade al final de `worker/tests/resend.test.js` (y añade `emailValidoBasico` al import de la línea 4):

Cambia:

```js
import { buildOwnerEmail, buildCustomerEmail, sendEmail } from '../src/resend.js';
```

por:

```js
import { buildOwnerEmail, buildCustomerEmail, sendEmail, emailValidoBasico } from '../src/resend.js';
```

Y añade al final del archivo:

```js

test('emailValidoBasico acepta direcciones con formato correcto', () => {
  assert.equal(emailValidoBasico('cliente@example.com'), true);
  assert.equal(emailValidoBasico('nombre.apellido@dominio.es'), true);
});

test('emailValidoBasico rechaza valores sin @, sin dominio, vacíos o no-string', () => {
  assert.equal(emailValidoBasico('no-es-un-email'), false);
  assert.equal(emailValidoBasico('falta-dominio@'), false);
  assert.equal(emailValidoBasico('@falta-usuario.com'), false);
  assert.equal(emailValidoBasico(''), false);
  assert.equal(emailValidoBasico(null), false);
  assert.equal(emailValidoBasico(undefined), false);
  assert.equal(emailValidoBasico(42), false);
});
```

- [ ] **Step 2: Ejecutar los tests y comprobar que fallan**

Run: `npm test`
Expected: FAIL — `emailValidoBasico` no existe todavía en `worker/src/resend.js`.

- [ ] **Step 3: Implementar emailValidoBasico**

En `worker/src/resend.js`, añade esta función exportada justo después de `escapeHtml` (antes de `enlaceJuego`):

```js

/** Comprobación de formato básica — no valida que el email exista de verdad,
 * solo descarta valores claramente inválidos antes de gastar una llamada a
 * la API de Resend. */
export function emailValidoBasico(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
```

- [ ] **Step 4: Ejecutar los tests y comprobar que pasan**

Run: `npm test`
Expected: PASS

- [ ] **Step 5: Dejar el cambio listo para commitear**

```bash
git add worker/src/resend.js worker/tests/resend.test.js
```

---

### Task 5: Endpoint `/api/acceso-gratuito` ✅ COMPLETADA (+ `worker/tests/index.test.js` nuevo, añadido por la revisión de calidad para cubrir las dos barreras de seguridad — ver nota tras la tarea)

**Files:**
- Modify: `worker/src/index.js`

- [ ] **Step 1: Importar emailValidoBasico**

Cambia la línea 7:

```js
import { buildCustomerEmail, buildOwnerEmail, sendEmail } from './resend.js';
```

por:

```js
import { buildCustomerEmail, buildOwnerEmail, emailValidoBasico, sendEmail } from './resend.js';
```

- [ ] **Step 2: Rechazar rutas gratis en el checkout de Stripe**

En `handleCrearCheckoutSession`, justo después de la comprobación de ruta desconocida, añade la comprobación de ruta gratuita:

```js
async function handleCrearCheckoutSession(request, env, cors) {
  const { rutaId, idioma } = await request.json();
  const precio = precioDeRuta(rutaId);
  if (!precio) {
    return Response.json({ error: `Ruta desconocida: "${rutaId}"` }, { status: 400, headers: cors });
  }
  if (precio.importe === 0) {
    return Response.json({ error: `"${rutaId}" es una ruta gratuita: usa /api/acceso-gratuito` }, { status: 400, headers: cors });
  }

  const orderId = `ord_${crypto.randomUUID()}`;
  const params = buildCheckoutSessionParams({ rutaId, idioma, orderId, tituloRuta: localizar(rutaPorId(rutaId)?.titulo, idioma) }, env.SITE_URL);
  const session = await createStripeSession(params, env.STRIPE_SECRET_KEY);
  return Response.json({ url: session.url }, { headers: cors });
}
```

- [ ] **Step 3: Añadir handleAccesoGratuito**

Añade esta función nueva justo después de `handleCrearCheckoutSession` (antes del comentario de `handleConfirmarPago`):

```js

// Ruta gratis: sin Stripe. Acuña el token igual que handleConfirmarPago tras
// un pago real, y reenvía el mismo email de Resend — la única diferencia es
// que aquí no hay nada que verificar contra Stripe antes de dar acceso.
async function handleAccesoGratuito(request, env, cors) {
  const { rutaId, idioma, email } = await request.json();
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

  const ownerEmail = buildOwnerEmail({ rutaId, orderId, email, importe: 0 }, env.OWNER_EMAIL);
  const customerEmail = buildCustomerEmail({ rutaId, orderId, idioma: idiomaFinal, email, token, tituloRuta }, env.SITE_URL);
  await Promise.all([sendEmail(ownerEmail, env.RESEND_API_KEY), sendEmail(customerEmail, env.RESEND_API_KEY)]);

  return Response.json({ ok: true, rutaId, idioma: idiomaFinal, orderId, token }, { headers: cors });
}
```

- [ ] **Step 4: Añadir la ruta al router**

En el bloque `try` dentro de `fetch()`, añade la nueva ruta junto a las otras (después de la comprobación de `/api/create-checkout-session`):

```js
      if (request.method === 'POST' && url.pathname === '/api/create-checkout-session') {
        return await handleCrearCheckoutSession(request, env, cors);
      }
      if (request.method === 'POST' && url.pathname === '/api/acceso-gratuito') {
        return await handleAccesoGratuito(request, env, cors);
      }
      if (request.method === 'GET' && url.pathname === '/api/confirm-payment') {
        return await handleConfirmarPago(url, env, cors);
      }
```

- [ ] **Step 5: Ejecutar los tests**

Run: `npm test`
Expected: PASS — `handleAccesoGratuito` no se exporta (mismo criterio que el resto de handlers de este router), se verifica manualmente en la Task 18.

- [ ] **Step 6: Dejar el cambio listo para commitear**

```bash
git add worker/src/index.js
```

---

### Task 6: Cliente del endpoint gratuito ✅ COMPLETADA

**Files:**
- Modify: `js/api.js`

- [ ] **Step 1: Añadir crearAccesoGratuito**

Al final de `js/api.js`, añade:

```js

/** Pide acceso a una ruta gratuita: el Worker acuña el token y envía el
 * email de confirmación, sin pasar por Stripe. */
export async function crearAccesoGratuito(rutaId, idioma, email) {
  const respuesta = await fetch(new URL('/api/acceso-gratuito', API_BASE_URL), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rutaId, idioma, email }),
  });
  const cuerpo = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) {
    throw new Error(cuerpo.error || `Error ${respuesta.status}`);
  }
  return cuerpo; // { ok, rutaId, idioma, orderId, token }
}
```

- [ ] **Step 2: Ejecutar los tests**

Run: `npm test`
Expected: PASS — `js/api.js` no tiene tests unitarios (depende de `fetch` real contra el Worker; se verifica manualmente en la Task 18), y este cambio no toca ningún archivo que sí los tenga.

- [ ] **Step 3: Dejar el cambio listo para commitear**

```bash
git add js/api.js
```

---

### Task 7: Copys nuevos en los 4 idiomas ✅ COMPLETADA

Añade las claves de precios gratis y del mapa de ruta, y retira `ruta_incluye_title` (deja de usarse en el HTML a partir de la Task 16). El test `tests/i18n.test.js` ya existente exige que los 4 idiomas tengan exactamente las mismas claves — por eso hay que tocar los 4 bloques en el mismo paso.

**Files:**
- Modify: `js/i18n.js` (bloques `es`, `en`, `fr`, `it`)

- [ ] **Step 1: Ejecutar los tests antes de empezar (deben pasar)**

Run: `npm test`
Expected: PASS (punto de partida limpio).

- [ ] **Step 2: Bloque `es`**

Cambia:

```js
    precio_por_equipo: '/ equipo',
```

por:

```js
    precio_por_equipo: '/ equipo',
    precio_gratis: 'Gratis',
```

Elimina esta línea (deja de usarse):

```js
    ruta_incluye_title: 'Qué incluye',
```

Cambia:

```js
    ruta_reservar_cta: 'Reservar esta ruta — {precio} € por equipo',
```

por:

```js
    ruta_reservar_cta: 'Reservar esta ruta — {precio} € por equipo',
    ruta_jugar_gratis_cta: 'Jugar esta ruta — gratis',
    ruta_mapa_title: 'La zona de juego',
    ruta_mapa_alt: 'Mapa antiguo de la zona: {zona}',
    ruta_email_label: 'Tu email, para enviarte el acceso',
    ruta_email_placeholder: 'nombre@ejemplo.com',
```

Cambia:

```js
    ruta_reservando: 'Conectando con la pasarela de pago…',
```

por:

```js
    ruta_reservando: 'Conectando con la pasarela de pago…',
    ruta_enviando_acceso: 'Enviando el acceso a tu email…',
```

- [ ] **Step 3: Bloque `en`**

Cambia:

```js
    precio_por_equipo: '/ team',
```

por:

```js
    precio_por_equipo: '/ team',
    precio_gratis: 'Free',
```

Elimina:

```js
    ruta_incluye_title: "What's included",
```

Cambia:

```js
    ruta_reservar_cta: 'Book this trail — €{precio} per team',
```

por:

```js
    ruta_reservar_cta: 'Book this trail — €{precio} per team',
    ruta_jugar_gratis_cta: 'Play this trail — free',
    ruta_mapa_title: 'The playing area',
    ruta_mapa_alt: 'Antique map of the area: {zona}',
    ruta_email_label: 'Your email, so we can send you access',
    ruta_email_placeholder: 'name@example.com',
```

Cambia:

```js
    ruta_reservando: 'Connecting to the payment gateway…',
```

por:

```js
    ruta_reservando: 'Connecting to the payment gateway…',
    ruta_enviando_acceso: 'Sending access to your email…',
```

- [ ] **Step 4: Bloque `fr`**

Cambia:

```js
    precio_por_equipo: '/ équipe',
```

por:

```js
    precio_por_equipo: '/ équipe',
    precio_gratis: 'Gratuit',
```

Elimina:

```js
    ruta_incluye_title: 'Ce qui est inclus',
```

Cambia:

```js
    ruta_reservar_cta: 'Réserver ce parcours — {precio} € par équipe',
```

por (nota las comillas dobles en las dos líneas con apóstrofe, igual que ya hace `ruta_incluye_1` en este mismo bloque):

```js
    ruta_reservar_cta: 'Réserver ce parcours — {precio} € par équipe',
    ruta_jugar_gratis_cta: 'Jouer ce parcours — gratuit',
    ruta_mapa_title: 'La zone de jeu',
    ruta_mapa_alt: 'Carte ancienne de la zone : {zona}',
    ruta_email_label: "Votre email, pour vous envoyer l'accès",
    ruta_email_placeholder: 'nom@exemple.com',
```

Cambia:

```js
    ruta_reservando: 'Connexion à la plateforme de paiement…',
```

por:

```js
    ruta_reservando: 'Connexion à la plateforme de paiement…',
    ruta_enviando_acceso: "Envoi de l'accès à votre email…",
```

- [ ] **Step 5: Bloque `it`**

Cambia:

```js
    precio_por_equipo: '/ squadra',
```

por:

```js
    precio_por_equipo: '/ squadra',
    precio_gratis: 'Gratis',
```

Elimina:

```js
    ruta_incluye_title: 'Cosa include',
```

Cambia:

```js
    ruta_reservar_cta: 'Prenota questo percorso — {precio} € a squadra',
```

por (nota las comillas dobles en la línea con apóstrofe, igual que ya hace `ruta_incluye_1` en este bloque):

```js
    ruta_reservar_cta: 'Prenota questo percorso — {precio} € a squadra',
    ruta_jugar_gratis_cta: 'Gioca questo percorso — gratis',
    ruta_mapa_title: 'La zona di gioco',
    ruta_mapa_alt: 'Mappa antica della zona: {zona}',
    ruta_email_label: "La tua email, per inviarti l'accesso",
    ruta_email_placeholder: 'nome@esempio.com',
```

Cambia:

```js
    ruta_reservando: 'Connessione al gateway di pagamento…',
```

por:

```js
    ruta_reservando: 'Connessione al gateway di pagamento…',
    ruta_enviando_acceso: "Invio dell'accesso alla tua email…",
```

- [ ] **Step 6: Ejecutar los tests**

Run: `npm test`
Expected: PASS — `tests/i18n.test.js` comprueba automáticamente que los 4 idiomas tengan las mismas claves y los mismos `{placeholders}`; si algún bloque quedó desalineado, este es el test que lo dirá.

- [ ] **Step 7: Dejar el cambio listo para commitear**

```bash
git add js/i18n.js
```

---

### Task 8: Ficha de ruta — «Gratis» y formulario de acceso gratuito ✅ COMPLETADA

**Files:**
- Modify: `ruta/barcelona-born.html`, `ruta/barcelona-gotic.html`, `ruta/barcelona-raval.html`, `ruta/florencia-centro.html`, `ruta/lisboa-alfama.html`, `ruta/paris-marais.html`, `ruta/roma-centro.html` (las 7)
- Modify: `css/styles.css` (sección 17, cerca de `.panel-ficha`)
- Modify: `js/ruta.js`

- [ ] **Step 1: Añadir el campo de email a las 7 fichas de ruta**

En cada uno de los 7 archivos `ruta/*.html`, dentro de `<aside class="panel-ficha">`, cambia:

```html
      <p class="panel-ficha__precio" id="panel-precio"></p>
      <a class="btn btn-lacre" href="#" id="cta-reservar"></a>
```

por:

```html
      <p class="panel-ficha__precio" id="panel-precio"></p>
      <div class="panel-ficha__email" id="panel-email" hidden>
        <label class="sr-only" for="input-email-gratis" data-i18n="ruta_email_label">Tu email, para enviarte el acceso</label>
        <input class="input-email" type="email" id="input-email-gratis" data-i18n-attr="placeholder:ruta_email_placeholder" required>
      </div>
      <a class="btn btn-lacre" href="#" id="cta-reservar"></a>
```

Este bloque es idéntico en los 7 archivos — repite el mismo cambio en cada uno.

- [ ] **Step 2: CSS del campo de email**

En `css/styles.css`, dentro de la sección `17. Ficha de ruta`, cambia:

```css
.panel-ficha__precio small {
  display: block;
  font-family: var(--font-mono);
  font-style: normal;
  font-size: 0.68rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ink-faint);
  margin-top: 4px;
}

.panel-ficha .btn {
```

por:

```css
.panel-ficha__precio small {
  display: block;
  font-family: var(--font-mono);
  font-style: normal;
  font-size: 0.68rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ink-faint);
  margin-top: 4px;
}

.panel-ficha__email {
  margin: 4px 0 14px;
}

.input-email {
  width: 100%;
  font-family: var(--font-body);
  font-size: 0.92rem;
  padding: 10px 12px;
  border: 1px solid var(--paper-edge);
  border-radius: var(--radio);
  background: var(--paper);
  color: var(--ink);
}

.input-email:focus {
  outline: 2px solid var(--lacre);
  outline-offset: 1px;
}

.panel-ficha .btn {
```

- [ ] **Step 3: Lógica en js/ruta.js**

Cambia el import de la línea 12:

```js
import { crearCheckoutSession } from './api.js';
```

por:

```js
import { crearAccesoGratuito, crearCheckoutSession } from './api.js';
```

Cambia:

```js
  document.getElementById('panel-precio').innerHTML = `${ruta.precio} €<small>${t(lang, 'precio_por_equipo')}</small>`;

  const cta = document.getElementById('cta-reservar');
  const textoOriginal = tf(lang, 'ruta_reservar_cta', { precio: ruta.precio });
  cta.textContent = textoOriginal;
  cta.href = '#';
  cta.addEventListener('click', async (evento) => {
    evento.preventDefault();
    if (cta.getAttribute('aria-busy') === 'true') return; // evita doble clic mientras carga
    cta.setAttribute('aria-busy', 'true');
    cta.textContent = t(lang, 'ruta_reservando');
    try {
      const url = await crearCheckoutSession(ruta.id, lang);
      location.href = url;
    } catch {
      cta.removeAttribute('aria-busy');
      cta.textContent = t(lang, 'ruta_error_reserva');
      setTimeout(() => {
        cta.textContent = textoOriginal;
      }, 3000);
    }
  });
```

por:

```js
  const esGratis = ruta.precio === 0;
  document.getElementById('panel-precio').innerHTML = esGratis
    ? t(lang, 'precio_gratis')
    : `${ruta.precio} €<small>${t(lang, 'precio_por_equipo')}</small>`;

  const panelEmail = document.getElementById('panel-email');
  const inputEmail = document.getElementById('input-email-gratis');
  panelEmail.hidden = !esGratis;

  const cta = document.getElementById('cta-reservar');
  const textoOriginal = esGratis
    ? t(lang, 'ruta_jugar_gratis_cta')
    : tf(lang, 'ruta_reservar_cta', { precio: ruta.precio });
  cta.textContent = textoOriginal;
  cta.href = '#';
  cta.addEventListener('click', async (evento) => {
    evento.preventDefault();
    if (cta.getAttribute('aria-busy') === 'true') return; // evita doble clic mientras carga
    if (esGratis && !inputEmail.reportValidity()) return;

    cta.setAttribute('aria-busy', 'true');
    cta.textContent = t(lang, esGratis ? 'ruta_enviando_acceso' : 'ruta_reservando');
    try {
      if (esGratis) {
        const resultado = await crearAccesoGratuito(ruta.id, lang, inputEmail.value.trim());
        location.href = `../jugar/gracias.html?ruta=${resultado.rutaId}&idioma=${resultado.idioma}&t=${encodeURIComponent(resultado.token)}&gratis=1`;
      } else {
        const url = await crearCheckoutSession(ruta.id, lang);
        location.href = url;
      }
    } catch {
      cta.removeAttribute('aria-busy');
      cta.textContent = t(lang, 'ruta_error_reserva');
      setTimeout(() => {
        cta.textContent = textoOriginal;
      }, 3000);
    }
  });
```

- [ ] **Step 4: Ejecutar los tests**

Run: `npm test`
Expected: PASS — `js/ruta.js` no tiene tests unitarios (glue de DOM; mismo criterio que el resto de `js/*.js` de escaparate). Se verifica manualmente en la Task 18.

- [ ] **Step 5: Dejar el cambio listo para commitear**

```bash
git add ruta/*.html css/styles.css js/ruta.js
```

---

### Task 9: Tarjeta de ruta en la página de ciudad muestra «Gratis» ✅ COMPLETADA

**Files:**
- Modify: `js/ciudad.js:16-35`

- [ ] **Step 1: Calcular el texto de precio antes del template**

Cambia:

```js
function tarjetaRuta(ruta, lang) {
  const titulo = localizar(ruta.titulo, lang);
  return `
  <a class="tarjeta-ruta" href="../ruta/${ruta.id}.html">
    <div class="tarjeta-ruta__foto-envoltorio">
      <img class="tarjeta-ruta__foto" src="../${ruta.imgCard}" alt="${titulo}" loading="lazy" width="900" height="675">
    </div>
    <div class="tarjeta-ruta__cuerpo">
      <span class="tarjeta-ruta__zona">${ICONO_MAPA} ${ruta.zona}</span>
      <h3 class="tarjeta-ruta__titulo">${titulo}</h3>
      <p class="tarjeta-ruta__resumen">${localizar(ruta.resumen, lang)}</p>
      <div class="tarjeta-ruta__pie">
        <span class="meta-item">${ICONO_RELOJ} ${tf(lang, 'meta_duracion', { h: Math.round(ruta.duracionMin / 60) })}</span>
        <span class="meta-item">${ICONO_PERSONAS} ${tf(lang, 'meta_jugadores', { min: ruta.jugadoresMin, max: ruta.jugadoresMax })}</span>
        <span class="badge-dificultad badge-dificultad--${ruta.dificultad}">${t(lang, 'dificultad_' + ruta.dificultad)}</span>
        <span class="tarjeta-ruta__precio">${ruta.precio} € <small>${t(lang, 'precio_por_equipo')}</small></span>
      </div>
    </div>
  </a>`;
}
```

por:

```js
function tarjetaRuta(ruta, lang) {
  const titulo = localizar(ruta.titulo, lang);
  const precioTexto = ruta.precio === 0
    ? t(lang, 'precio_gratis')
    : `${ruta.precio} € <small>${t(lang, 'precio_por_equipo')}</small>`;
  return `
  <a class="tarjeta-ruta" href="../ruta/${ruta.id}.html">
    <div class="tarjeta-ruta__foto-envoltorio">
      <img class="tarjeta-ruta__foto" src="../${ruta.imgCard}" alt="${titulo}" loading="lazy" width="900" height="675">
    </div>
    <div class="tarjeta-ruta__cuerpo">
      <span class="tarjeta-ruta__zona">${ICONO_MAPA} ${ruta.zona}</span>
      <h3 class="tarjeta-ruta__titulo">${titulo}</h3>
      <p class="tarjeta-ruta__resumen">${localizar(ruta.resumen, lang)}</p>
      <div class="tarjeta-ruta__pie">
        <span class="meta-item">${ICONO_RELOJ} ${tf(lang, 'meta_duracion', { h: Math.round(ruta.duracionMin / 60) })}</span>
        <span class="meta-item">${ICONO_PERSONAS} ${tf(lang, 'meta_jugadores', { min: ruta.jugadoresMin, max: ruta.jugadoresMax })}</span>
        <span class="badge-dificultad badge-dificultad--${ruta.dificultad}">${t(lang, 'dificultad_' + ruta.dificultad)}</span>
        <span class="tarjeta-ruta__precio">${precioTexto}</span>
      </div>
    </div>
  </a>`;
}
```

- [ ] **Step 2: Ejecutar los tests**

Run: `npm test`
Expected: PASS

- [ ] **Step 3: Dejar el cambio listo para commitear**

```bash
git add js/ciudad.js
```

---

### Task 10: `gracias.html` soporta el flujo sin Stripe ✅ COMPLETADA

**Files:**
- Modify: `js/gracias.js`

- [ ] **Step 1: Añadir la rama de acceso gratuito al principio de init()**

Cambia:

```js
async function init() {
  refEls();
  const lang = detectarIdioma();
  document.documentElement.lang = lang;
  aplicarI18n(document, lang);
  mostrar('vista-verificando');

  const params = new URLSearchParams(location.search);
  const sessionId = params.get('session_id');

  if (!sessionId) {
    els['txt-error'].textContent = 'Falta la referencia de la sesión de pago.';
    mostrar('vista-error');
    return;
  }
```

por:

```js
async function init() {
  refEls();
  const lang = detectarIdioma();
  document.documentElement.lang = lang;
  aplicarI18n(document, lang);
  mostrar('vista-verificando');

  const params = new URLSearchParams(location.search);

  // Ruta gratis: no hay pago que verificar. El propio enlace ya trae el
  // token, acuñado por /api/acceso-gratuito en el momento de pedirlo.
  if (params.get('gratis') === '1') {
    const rutaId = params.get('ruta');
    const token = params.get('t');
    const idiomaParam = params.get('idioma');
    const idioma = LANGS.includes(idiomaParam) ? idiomaParam : lang;

    if (!rutaId || !token) {
      els['txt-error'].textContent = 'Falta la referencia del acceso gratuito.';
      mostrar('vista-error');
      return;
    }

    if (idioma !== lang) {
      document.documentElement.lang = idioma;
      aplicarI18n(document, idioma);
    }
    els['link-jugar'].href = `index.html?ruta=${rutaId}&t=${encodeURIComponent(token)}&idioma=${idioma}`;
    els['link-imprimir'].href = `imprimir.html?ruta=${rutaId}&t=${encodeURIComponent(token)}&idioma=${idioma}`;
    mostrar('vista-exito');
    return;
  }

  const sessionId = params.get('session_id');

  if (!sessionId) {
    els['txt-error'].textContent = 'Falta la referencia de la sesión de pago.';
    mostrar('vista-error');
    return;
  }
```

El resto de la función (todo lo que sigue tras este bloque) no cambia.

- [ ] **Step 2: Ejecutar los tests**

Run: `npm test`
Expected: PASS — `js/gracias.js` no tiene tests unitarios (mismo criterio que el resto de `js/*.js` de escaparate/pago). Se verifica manualmente en la Task 18.

- [ ] **Step 3: Dejar el cambio listo para commitear**

```bash
git add js/gracias.js
```

---

## Parte B — Selector de idioma

### Task 11: CSS de las pastillas de idioma ✅ COMPLETADA

**Files:**
- Modify: `css/styles.css:267-275`

- [ ] **Step 1: Sustituir el bloque .selector-idioma**

Cambia:

```css
.selector-idioma {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  background: transparent;
  border: 1px solid var(--paper-edge);
  color: var(--ink-soft);
  border-radius: var(--radio);
  padding: 6px 10px;
}
```

por:

```css
.selector-idioma {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-mono);
  font-size: 0.78rem;
  letter-spacing: 0.03em;
}

.selector-idioma__opcion {
  background: none;
  border: none;
  padding: 2px 0 4px;
  color: var(--ink-faint);
  border-bottom: 1.5px solid transparent;
  cursor: pointer;
  font-family: inherit;
  font-size: inherit;
}

.selector-idioma__opcion:hover {
  color: var(--ink-soft);
}

.selector-idioma__opcion.activa {
  color: var(--lacre);
  border-bottom-color: var(--lacre);
  font-weight: 600;
}

.selector-idioma__separador {
  color: var(--paper-edge);
}
```

- [ ] **Step 2: Ejecutar los tests**

Run: `npm test`
Expected: PASS (CSS no afecta a `node --test`)

- [ ] **Step 3: Dejar el cambio listo para commitear**

```bash
git add css/styles.css
```

---

### Task 12: HTML del selector — 13 archivos ✅ COMPLETADA

**Files:**
- Modify: `index.html`
- Modify: `ciudad/barcelona.html`, `ciudad/florencia.html`, `ciudad/lisboa.html`, `ciudad/paris.html`, `ciudad/roma.html`
- Modify: `ruta/barcelona-born.html`, `ruta/barcelona-gotic.html`, `ruta/barcelona-raval.html`, `ruta/florencia-centro.html`, `ruta/lisboa-alfama.html`, `ruta/paris-marais.html`, `ruta/roma-centro.html`

- [ ] **Step 1: Sustituir el bloque del selector en los 13 archivos**

En cada uno de los 13 archivos, dentro de `<nav class="nav-principal">`, cambia:

```html
      <label class="sr-only" for="selector-idioma" data-i18n="nav_idioma_label">Idioma</label>
      <select class="selector-idioma" id="selector-idioma"></select>
```

por:

```html
      <div class="selector-idioma" id="selector-idioma" role="group" data-i18n-attr="aria-label:nav_idioma_label"></div>
```

Este bloque es idéntico en los 13 archivos — repite el mismo cambio en cada uno.

- [ ] **Step 2: Ejecutar los tests**

Run: `npm test`
Expected: PASS (HTML no afecta a `node --test`)

- [ ] **Step 3: Dejar el cambio listo para commitear**

```bash
git add index.html ciudad/*.html ruta/*.html
```

---

### Task 13: JS del selector — 3 archivos ✅ COMPLETADA

**Files:**
- Modify: `js/portada.js`
- Modify: `js/ciudad.js`
- Modify: `js/ruta.js`

- [ ] **Step 1: js/portada.js**

Cambia el import (línea 5):

```js
import { DEFAULT_LANG, LANGS, LANG_NAMES, aplicarI18n, detectarIdioma, guardarIdioma, t, tf } from './i18n.js';
```

por (`DEFAULT_LANG` y `LANG_NAMES` no se usan en ningún otro sitio de este archivo):

```js
import { LANGS, aplicarI18n, detectarIdioma, guardarIdioma, t, tf } from './i18n.js';
```

Cambia:

```js
function poblarSelectorIdioma(lang) {
  const select = document.getElementById('selector-idioma');
  if (!select) return;
  select.innerHTML = LANGS.map((code) => `<option value="${code}">${LANG_NAMES[code]}</option>`).join('');
  select.value = lang;
  select.addEventListener('change', () => {
    guardarIdioma(select.value);
    location.reload();
  });
}
```

por:

```js
function poblarSelectorIdioma(lang) {
  const cont = document.getElementById('selector-idioma');
  if (!cont) return;
  cont.innerHTML = LANGS.map((code, i) => {
    const separador = i > 0 ? '<span class="selector-idioma__separador" aria-hidden="true">·</span>' : '';
    const activa = code === lang ? ' activa' : '';
    return `${separador}<button type="button" class="selector-idioma__opcion${activa}" data-lang="${code}" aria-pressed="${code === lang}">${code.toUpperCase()}</button>`;
  }).join('');
  cont.querySelectorAll('button').forEach((boton) => {
    boton.addEventListener('click', () => {
      guardarIdioma(boton.dataset.lang);
      location.reload();
    });
  });
}
```

- [ ] **Step 2: js/ciudad.js**

Cambia el import (línea 7):

```js
import { LANGS, LANG_NAMES, aplicarI18n, detectarIdioma, guardarIdioma, t, tf } from './i18n.js';
```

por (`LANG_NAMES` no se usa en ningún otro sitio de este archivo):

```js
import { LANGS, aplicarI18n, detectarIdioma, guardarIdioma, t, tf } from './i18n.js';
```

Cambia:

```js
function poblarSelectorIdioma(lang) {
  const select = document.getElementById('selector-idioma');
  if (!select) return;
  select.innerHTML = LANGS.map((code) => `<option value="${code}">${LANG_NAMES[code]}</option>`).join('');
  select.value = lang;
  select.addEventListener('change', () => {
    guardarIdioma(select.value);
    location.reload();
  });
}
```

por (idéntico al de `js/portada.js`):

```js
function poblarSelectorIdioma(lang) {
  const cont = document.getElementById('selector-idioma');
  if (!cont) return;
  cont.innerHTML = LANGS.map((code, i) => {
    const separador = i > 0 ? '<span class="selector-idioma__separador" aria-hidden="true">·</span>' : '';
    const activa = code === lang ? ' activa' : '';
    return `${separador}<button type="button" class="selector-idioma__opcion${activa}" data-lang="${code}" aria-pressed="${code === lang}">${code.toUpperCase()}</button>`;
  }).join('');
  cont.querySelectorAll('button').forEach((boton) => {
    boton.addEventListener('click', () => {
      guardarIdioma(boton.dataset.lang);
      location.reload();
    });
  });
}
```

- [ ] **Step 3: js/ruta.js**

`LANG_NAMES` SÍ se sigue usando en este archivo (línea `panel-idiomas`), así que el import no cambia. Cambia solo:

```js
function poblarSelectorIdioma(lang) {
  const select = document.getElementById('selector-idioma');
  if (!select) return;
  select.innerHTML = LANGS.map((code) => `<option value="${code}">${LANG_NAMES[code]}</option>`).join('');
  select.value = lang;
  select.addEventListener('change', () => {
    guardarIdioma(select.value);
    location.reload();
  });
}
```

por (idéntico al de los otros dos archivos):

```js
function poblarSelectorIdioma(lang) {
  const cont = document.getElementById('selector-idioma');
  if (!cont) return;
  cont.innerHTML = LANGS.map((code, i) => {
    const separador = i > 0 ? '<span class="selector-idioma__separador" aria-hidden="true">·</span>' : '';
    const activa = code === lang ? ' activa' : '';
    return `${separador}<button type="button" class="selector-idioma__opcion${activa}" data-lang="${code}" aria-pressed="${code === lang}">${code.toUpperCase()}</button>`;
  }).join('');
  cont.querySelectorAll('button').forEach((boton) => {
    boton.addEventListener('click', () => {
      guardarIdioma(boton.dataset.lang);
      location.reload();
    });
  });
}
```

- [ ] **Step 4: Ejecutar los tests**

Run: `npm test`
Expected: PASS

- [ ] **Step 5: Dejar el cambio listo para commitear**

```bash
git add js/portada.js js/ciudad.js js/ruta.js
```

---

## Parte C — Mapa envejecido de la zona

### Task 14: Script de generación de mapas ✅ COMPLETADA (+ `tests/generar-mapas.test.js` nuevo, y una guarda de "solo si se ejecuta como script" que el propio subagente detectó como necesaria — ver nota)

**Files:**
- Create: `scripts/generar-mapas.mjs`
- Create: `assets/img/mapas/CREDITOS.md`
- Create (al ejecutar el script): `assets/img/mapas/barcelona-gotic.svg`, `barcelona-born.svg`, `barcelona-raval.svg`, `roma-centro.svg`, `paris-marais.svg`, `lisboa-alfama.svg`, `florencia-centro.svg`

- [ ] **Step 1: Crear el directorio de salida**

```bash
mkdir -p assets/img/mapas
```

- [ ] **Step 2: Escribir el script**

Crea `scripts/generar-mapas.mjs`:

```js
#!/usr/bin/env node
// scripts/generar-mapas.mjs
//
// Genera una vez por ruta un mapa antiguo y desgastado ("pergamino quemado")
// a partir de datos reales de calles de OpenStreetMap. Se ejecuta a mano
// cuando se añade o cambia una ruta; el resultado (los SVG) se commitea
// como archivo estático, igual que las fotos de assets/img/ciudades/.
//
// Uso:
//   node scripts/generar-mapas.mjs                  (las 7 rutas)
//   node scripts/generar-mapas.mjs barcelona-gotic   (solo una — útil si
//                                                      Overpass da 429)
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { rutaPorId } from '../js/catalogo.js';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const DIR_SALIDA = path.join(AQUI, '..', 'assets', 'img', 'mapas');

// Centro real (lat, lng) y radio en metros de la zona de cada ruta. Es
// geografía aproximada de un barrio entero — no un detalle puntual como los
// enigmas — así que no hace falta verificarla sobre el terreno, pero conviene
// mirar el SVG resultante y ajustar el radio si deja fuera calles relevantes.
const ZONAS = {
  'barcelona-gotic': { lat: 41.3833, lng: 2.1763, radioM: 250 },
  'barcelona-born': { lat: 41.385, lng: 2.1827, radioM: 250 },
  'barcelona-raval': { lat: 41.38, lng: 2.17, radioM: 280 },
  'roma-centro': { lat: 41.8986, lng: 12.4769, radioM: 300 },
  'paris-marais': { lat: 48.8575, lng: 2.3605, radioM: 300 },
  'lisboa-alfama': { lat: 38.7139, lng: -9.1302, radioM: 280 },
  'florencia-centro': { lat: 43.7696, lng: 11.2558, radioM: 280 },
};

const ANCHO = 640;
const ALTO = 480;

// Silueta rasgada compartida por los 7 mapas — el contenido de dentro
// cambia, el marco de "pergamino quemado" es siempre el mismo.
const RECORTE_RASGADO =
  '13,29 90,10 166,24 243,5 320,19 397,5 473,24 550,10 627,29 614,86 634,144 608,202 627,259 602,317 621,374 596,432 614,466 538,451 461,470 384,447 307,466 230,442 154,461 77,437 26,455 6,394 32,336 13,278 38,221 6,163 26,106';

function metrosPorGrado(lat) {
  const gradosLat = 1 / 111_320;
  const gradosLng = 1 / (111_320 * Math.cos((lat * Math.PI) / 180));
  return { gradosLat, gradosLng };
}

async function pedirOverpass(lat, lng, radioM) {
  const query = `
    [out:json][timeout:25];
    (
      way["highway"](around:${radioM},${lat},${lng});
      way["building"](around:${radioM},${lat},${lng});
    );
    out geom;
  `;
  const respuesta = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `data=${encodeURIComponent(query)}`,
  });
  if (!respuesta.ok) {
    throw new Error(`Overpass respondió ${respuesta.status} — reintenta en unos minutos`);
  }
  return respuesta.json();
}

function proyectar(lat, lng, centro) {
  const { gradosLat, gradosLng } = metrosPorGrado(centro.lat);
  const dxM = (lng - centro.lng) / gradosLng;
  const dyM = (lat - centro.lat) / gradosLat;
  const escala = (ANCHO * 0.42) / centro.radioM;
  return {
    x: ANCHO / 2 + dxM * escala,
    y: ALTO / 2 - dyM * escala,
  };
}

function puntosDeVia(via, centro) {
  return via.geometry.map((p) => proyectar(p.lat, p.lon, centro));
}

function dibujarSvg(datos, centro, rutaId, zona) {
  const vias = datos.elements.filter((e) => e.type === 'way' && e.tags?.highway && e.geometry);
  const edificios = datos.elements.filter((e) => e.type === 'way' && e.tags?.building && e.geometry);

  const trazosCalles = vias
    .map((via) => {
      const puntos = puntosDeVia(via, centro);
      return `<path d="M${puntos.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L')}" />`;
    })
    .join('\n      ');

  const bloquesEdificios = edificios
    .map((edificio) => {
      const puntos = puntosDeVia(edificio, centro);
      return `<polygon points="${puntos.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')}" />`;
    })
    .join('\n      ');

  return `<svg viewBox="0 0 ${ANCHO} ${ALTO}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Mapa antiguo de ${zona}">
  <defs>
    <clipPath id="recorte-rasgado">
      <polygon points="${RECORTE_RASGADO}" />
    </clipPath>
    <filter id="grano-${rutaId}">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" result="ruido" />
      <feColorMatrix in="ruido" type="matrix" values="0 0 0 0 0.14  0 0 0 0 0.1  0 0 0 0 0.06  0 0 0 0.5 0" />
    </filter>
    <radialGradient id="vineta-${rutaId}" cx="50%" cy="50%" r="72%">
      <stop offset="60%" stop-color="#241a10" stop-opacity="0" />
      <stop offset="100%" stop-color="#241a10" stop-opacity="0.8" />
    </radialGradient>
  </defs>
  <g clip-path="url(#recorte-rasgado)">
    <rect width="${ANCHO}" height="${ALTO}" fill="#e2d0a3" />
    <g stroke="#83714f" stroke-width="1.6" fill="none" opacity="0.85">
      ${trazosCalles}
    </g>
    <g fill="#d6bf8c" stroke="#83714f" stroke-width="0.8" opacity="0.75">
      ${bloquesEdificios}
    </g>
    <ellipse cx="${ANCHO / 2}" cy="${ALTO / 2}" rx="${ANCHO * 0.16}" ry="${ALTO * 0.16}" fill="none" stroke="#9c2b1f" stroke-width="3.5" stroke-dasharray="5 6" transform="rotate(-4 ${ANCHO / 2} ${ALTO / 2})" />
    <rect width="${ANCHO}" height="${ALTO}" fill="url(#grano-${rutaId})" opacity="0.3" style="mix-blend-mode:multiply" />
    <rect width="${ANCHO}" height="${ALTO}" fill="url(#vineta-${rutaId})" />
  </g>
</svg>
`;
}

async function generarUna(rutaId) {
  const centro = ZONAS[rutaId];
  if (!centro) throw new Error(`No hay coordenadas para "${rutaId}" en ZONAS`);
  const ruta = rutaPorId(rutaId);
  if (!ruta) throw new Error(`"${rutaId}" no existe en js/catalogo.js`);

  console.log(`${rutaId}: pidiendo datos a Overpass…`);
  const datos = await pedirOverpass(centro.lat, centro.lng, centro.radioM);
  const svg = dibujarSvg(datos, centro, rutaId, ruta.zona);
  const destino = path.join(DIR_SALIDA, `${rutaId}.svg`);
  writeFileSync(destino, svg, 'utf8');
  console.log(`${rutaId}: guardado en ${destino} (${datos.elements.length} elementos de OSM)`);
}

const [, , rutaIdArg] = process.argv;
const idsAGenerar = rutaIdArg ? [rutaIdArg] : Object.keys(ZONAS);

for (const rutaId of idsAGenerar) {
  await generarUna(rutaId);
  // Overpass pide no encadenar peticiones sin pausa entre ellas.
  await new Promise((resuelve) => setTimeout(resuelve, 1500));
}
```

- [ ] **Step 3: Ejecutar el script**

Run: `node scripts/generar-mapas.mjs`
Expected: 7 líneas `<rutaId>: guardado en ...` — una por ruta. Si Overpass responde 429 (límite de uso), espera unos minutos y vuelve a ejecutar solo la ruta que falló: `node scripts/generar-mapas.mjs <rutaId>`.

- [ ] **Step 4: Revisar visualmente al menos un SVG**

Abre `assets/img/mapas/barcelona-gotic.svg` en un navegador y confirma que se ve un callejero real (no un rectángulo vacío) con el marco envejecido y el óvalo rojo en el centro. Si el radio deja fuera o mete de más zona irrelevante, ajusta `radioM` en `ZONAS` para esa ruta y repite el Step 3 solo para ella.

- [ ] **Step 5: Crear los créditos**

Crea `assets/img/mapas/CREDITOS.md`:

```markdown
# Créditos de los mapas de ruta

Los 7 mapas de `assets/img/mapas/*.svg` se generan con
`scripts/generar-mapas.mjs` a partir de datos de calles y edificios de
OpenStreetMap, obtenidos vía la Overpass API. El estilo (silueta rasgada,
grano, viñeta, óvalo de zona) se dibuja por completo en el script; no es una
imagen de terceros, solo la geometría de calles lo es.

© OpenStreetMap contributors — datos disponibles bajo la
[Open Database License](https://www.openstreetmap.org/copyright).

Si cambia la zona de una ruta, ajusta su entrada en `ZONAS` dentro del
script y vuelve a ejecutarlo solo para esa ruta:
`node scripts/generar-mapas.mjs <rutaId>`.
```

- [ ] **Step 6: Ejecutar los tests**

Run: `npm test`
Expected: PASS (esta tarea no toca ningún archivo bajo test todavía — la Task 15 añade la comprobación de que estos archivos existen).

- [ ] **Step 7: Dejar el cambio listo para commitear**

```bash
git add scripts/generar-mapas.mjs assets/img/mapas/
```

---

### Task 15: `imgMapa` en el catálogo + test de integridad ✅ COMPLETADA

**Files:**
- Modify: `js/catalogo.js` (añadir `imgMapa` a las 7 rutas)
- Test: `tests/catalogo-mapas.test.js` (nuevo)

- [ ] **Step 1: Escribir el test que falla**

Crea `tests/catalogo-mapas.test.js`:

```js
// tests/catalogo-mapas.test.js
//
// Cada ruta debe declarar imgMapa apuntando a un SVG que existe de verdad
// en disco — generado por scripts/generar-mapas.mjs. Sin este test, una
// ruta podría quedarse sin mapa (o con la ruta del archivo mal escrita) y
// no se notaría hasta que alguien abriera la ficha de producto a mano.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { RUTAS } from '../js/catalogo.js';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.join(AQUI, '..');

test('cada ruta tiene un mapa de zona que existe de verdad en disco', () => {
  for (const ruta of RUTAS) {
    assert.ok(ruta.imgMapa, `"${ruta.id}" no declara imgMapa en el catálogo`);
    assert.ok(existsSync(path.join(RAIZ, ruta.imgMapa)), `"${ruta.id}": no existe el archivo ${ruta.imgMapa}`);
  }
});
```

- [ ] **Step 2: Ejecutar el test y comprobar que falla**

Run: `npm test`
Expected: FAIL — ninguna ruta declara `imgMapa` todavía.

- [ ] **Step 3: Añadir imgMapa a las 7 rutas**

En `js/catalogo.js`, en cada una de las 7 entradas de `RUTAS`, añade una línea `imgMapa` justo después de `imgCard`. Por ejemplo, para `barcelona-gotic`:

Cambia:

```js
    imgHero: 'assets/img/ciudades/barcelona-hero.webp',
    imgCard: 'assets/img/ciudades/barcelona-card.webp',
```

por:

```js
    imgHero: 'assets/img/ciudades/barcelona-hero.webp',
    imgCard: 'assets/img/ciudades/barcelona-card.webp',
    imgMapa: 'assets/img/mapas/barcelona-gotic.svg',
```

Repite para las otras 6 rutas, usando siempre `assets/img/mapas/<id-de-la-ruta>.svg`:

| Ruta (`id`) | `imgMapa` |
|---|---|
| roma-centro | `assets/img/mapas/roma-centro.svg` |
| paris-marais | `assets/img/mapas/paris-marais.svg` |
| barcelona-born | `assets/img/mapas/barcelona-born.svg` |
| barcelona-raval | `assets/img/mapas/barcelona-raval.svg` |
| lisboa-alfama | `assets/img/mapas/lisboa-alfama.svg` |
| florencia-centro | `assets/img/mapas/florencia-centro.svg` |

- [ ] **Step 4: Ejecutar los tests**

Run: `npm test`
Expected: PASS

- [ ] **Step 5: Dejar el cambio listo para commitear**

```bash
git add js/catalogo.js tests/catalogo-mapas.test.js
```

---

### Task 16: HTML + CSS del mapa en la ficha de ruta ✅ COMPLETADA

**Files:**
- Modify: las 7 `ruta/*.html`
- Modify: `css/styles.css` (sección 17)

- [ ] **Step 1: Sustituir el bloque «Qué incluye» en las 7 fichas**

En cada uno de los 7 archivos `ruta/*.html`, cambia:

```html
      <h2 class="incluye-title" data-i18n="ruta_incluye_title">Qué incluye</h2>
      <ul class="lista-incluye">
        <li data-i18n="ruta_incluye_1">Acceso a la ruta completa durante 1 año desde la compra</li>
        <li data-i18n="ruta_incluye_2">Sistema de pistas si os quedáis atascados</li>
        <li data-i18n="ruta_incluye_3">Versión imprimible por si preferís ir sin móvil</li>
        <li data-i18n="ruta_incluye_4">Sin necesidad de cobertura una vez cargada la ruta</li>
      </ul>
```

por:

```html
      <h2 class="mapa-zona-title" data-i18n="ruta_mapa_title">La zona de juego</h2>
      <figure class="mapa-zona">
        <img class="mapa-zona__img" id="mapa-zona-img" src="" alt="">
        <figcaption class="mapa-zona__caption" id="mapa-zona-caption"></figcaption>
      </figure>
      <ul class="lista-incluye lista-incluye--compacta">
        <li data-i18n="ruta_incluye_1">Acceso a la ruta completa durante 1 año desde la compra</li>
        <li data-i18n="ruta_incluye_2">Sistema de pistas si os quedáis atascados</li>
        <li data-i18n="ruta_incluye_3">Versión imprimible por si preferís ir sin móvil</li>
        <li data-i18n="ruta_incluye_4">Sin necesidad de cobertura una vez cargada la ruta</li>
      </ul>
```

Este bloque es idéntico en los 7 archivos — repite el mismo cambio en cada uno.

- [ ] **Step 2: Sustituir el CSS de `.incluye-title` / `.lista-incluye`**

En `css/styles.css`, cambia:

```css
.incluye-title {
  font-size: 1.3rem;
  margin: 40px 0 16px;
}

.lista-incluye li {
  position: relative;
  padding: 6px 0 6px 26px;
  color: var(--ink-soft);
}

.lista-incluye li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: var(--forest);
  font-weight: 700;
}
```

por:

```css
.mapa-zona-title {
  font-size: 1.3rem;
  margin: 40px 0 16px;
}

.mapa-zona {
  position: relative;
  aspect-ratio: 4 / 3;
  max-width: 420px;
  margin: 0 0 8px;
}

.mapa-zona__img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mapa-zona__caption {
  margin: 6px 0 0;
  font-family: var(--font-mono);
  font-size: 0.74rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--ink-faint);
}

.lista-incluye li {
  position: relative;
  padding: 6px 0 6px 26px;
  color: var(--ink-soft);
}

.lista-incluye li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: var(--forest);
  font-weight: 700;
}

.lista-incluye--compacta {
  margin-top: 4px;
}

.lista-incluye--compacta li {
  font-size: 0.82rem;
  color: var(--ink-faint);
  padding: 3px 0 3px 22px;
}

.lista-incluye--compacta li::before {
  font-size: 0.8rem;
}
```

- [ ] **Step 3: Ejecutar los tests**

Run: `npm test`
Expected: PASS

- [ ] **Step 4: Dejar el cambio listo para commitear**

```bash
git add ruta/*.html css/styles.css
```

---

### Task 17: `js/ruta.js` pinta el mapa ✅ COMPLETADA (+ arreglada una comilla tipográfica suelta preexistente en la línea de al lado, detectada por la revisión)

**Files:**
- Modify: `js/ruta.js`

- [ ] **Step 1: Rellenar el mapa junto al resto del cuerpo principal**

Cambia:

```js
  // Cuerpo principal
  document.getElementById('ruta-foto').src = `../${ruta.imgHero}`;
  document.getElementById('ruta-foto').alt = tituloRuta;
  document.getElementById('ruta-zona-eyebrow').textContent = ruta.zona;
  document.getElementById('ruta-titulo').textContent = tituloRuta;
  document.getElementById('ruta-resumen').textContent = localizar(ruta.resumen, lang);
  document.getElementById('adelanto-texto').textContent = `“${localizar(ruta.acertijoMuestra, lang)}”`;
```

por:

```js
  // Cuerpo principal
  document.getElementById('ruta-foto').src = `../${ruta.imgHero}`;
  document.getElementById('ruta-foto').alt = tituloRuta;
  document.getElementById('ruta-zona-eyebrow').textContent = ruta.zona;
  document.getElementById('ruta-titulo').textContent = tituloRuta;
  document.getElementById('ruta-resumen').textContent = localizar(ruta.resumen, lang);
  document.getElementById('adelanto-texto').textContent = `“${localizar(ruta.acertijoMuestra, lang)}”`;
  document.getElementById('mapa-zona-img').src = `../${ruta.imgMapa}`;
  document.getElementById('mapa-zona-img').alt = tf(lang, 'ruta_mapa_alt', { zona: ruta.zona });
  document.getElementById('mapa-zona-caption').textContent = ruta.zona;
```

- [ ] **Step 2: Ejecutar los tests**

Run: `npm test`
Expected: PASS

- [ ] **Step 3: Dejar el cambio listo para commitear**

```bash
git add js/ruta.js
```

---

## Verificación final

### Task 18: Verificación manual end-to-end ✅ COMPLETADA (ver hallazgos abajo)

**Hallazgos de la verificación real con Playwright (2026-08-23):**
- Ruta gratis (barcelona-born): precio "Gratis", campo de email visible, CTA "Jugar esta ruta — gratis", mapa envejecido renderiza correctamente (calles reales, silueta rasgada, óvalo de zona), sin errores de consola.
- Flujo de acceso gratis con token real (gracias.html?gratis=1 → jugar/index.html): pantalla de éxito correcta, enlaces construidos bien, la partida carga y es jugable (Parada 1 de 8 con enigma real), sin errores de consola.
- Ruta de pago (barcelona-gotic): precio "4,99 €", sin campo de email, CTA "Reservar esta ruta — 4,99 € por equipo", mapa renderiza, sin errores de consola.
- Selector de idioma: clic en EN cambia toda la página (nav, precio, mapa incl. alt text, CTA, footer) sin mezcla de idiomas, sin errores de consola.
- Página de ciudad (Barcelona, en inglés): las 3 rutas muestran su nivel/precio correcto lado a lado (Medium/4.99€, Easy/Free, Hard/7.99€).
- **Bug real encontrado y arreglado**: una comilla tipográfica suelta preexistente en `js/ruta.js:63` (ver nota de la Task 17).
- **Limitación de entorno, no un bug**: `/api/acceso-gratuito` y el checkout de Stripe fallan en local con 500 porque `worker/.dev.vars` nunca tuvo `RESEND_API_KEY`/`STRIPE_SECRET_KEY` configurados (solo `TOKEN_SECRET`/`SITE_URL`) — confirmado llamando al endpoint directamente (`"Resend rechazó el envío del email"`). Coherente con el propio README del proyecto, que documenta esta misma limitación para el flujo de pago y da como alternativa `mint-dev-token.mjs` (usado aquí para verificar el resto del flujo igualmente). No bloquea nada de este plan — hace falta configurar cuentas reales de Stripe/Resend antes de vender de verdad, algo ya pendiente desde antes de este plan.

No es código — es la comprobación con la que este proyecto valida siempre los cambios de UI y de flujo de pago (ver README, sección "Tests", y el histórico de Playwright de sesiones anteriores). Arranca los dos servidores locales antes de empezar:

```bash
npx http-server -p 8743 -c-1 .
```
```bash
cd worker && npm run dev
```

Y confirma que `js/config.js` apunta a `http://127.0.0.1:8787` mientras pruebas en local.

- [ ] **Step 1: `npm test` en verde**

Run: `npm test` (desde la raíz)
Expected: todos los tests PASAN (los de `tests/` y `worker/tests/` combinados).

- [ ] **Step 2: Ruta gratis de punta a punta**

Con Playwright o en el navegador: abre `ruta/barcelona-born.html` (o `florencia-centro.html`).
- El panel de precio muestra «Gratis», no «0 €».
- El botón dice «Jugar esta ruta — gratis».
- Al pulsar sin rellenar el email, el navegador bloquea el envío (validación nativa del `<input type="email" required>`).
- Con un email válido, el botón pasa a «Enviando el acceso a tu email…» y redirige a `jugar/gracias.html?...&gratis=1&t=...` mostrando la pantalla de éxito, con los enlaces «Empezar a jugar» e «imprimir» funcionando.

- [ ] **Step 3: Ruta de pago sigue intacta**

Abre `ruta/barcelona-gotic.html` (dificultad media, ahora 4,99 €).
- El panel de precio muestra «4,99 €».
- El botón dice «Reservar esta ruta — 4,99 € por equipo».
- El flujo de Stripe Checkout con la tarjeta de test `4242 4242 4242 4242` sigue funcionando igual que antes de este cambio.

- [ ] **Step 4: Selector de idioma en las tres plantillas**

En `index.html`, `ciudad/barcelona.html` y `ruta/barcelona-gotic.html`: las 4 pastillas ES · EN · FR · IT aparecen en la cabecera, la actual está en rojo lacre con subrayado, y al hacer clic en otra la página recarga en ese idioma (interfaz y catálogo, no solo el contenido de juego).

- [ ] **Step 5: Mapa de zona en las 7 fichas de ruta**

Abre cada una de las 7 `ruta/*.html` y confirma que el mapa envejecido aparece bajo el «adelanto» (sin roturas de layout, sin imagen rota) y que la leyenda debajo del mapa coincide con la zona de esa ruta.

- [ ] **Step 6: Ninguna consola con errores**

En cada página abierta durante los steps 2-5, revisa la consola del navegador: no debe haber errores de JS (elemento no encontrado, `imgMapa` undefined, etc.).

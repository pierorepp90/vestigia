# Endurecimiento de seguridad del Worker de Vestigia

**Fecha:** 2026-09-02
**Estado:** Diseño aprobado, pendiente de plan de implementación

## Contexto

El backend de Vestigia es un Cloudflare Worker sin estado (`worker/src/`): el
acceso a las rutas de pago se entrega con un token HMAC firmado en lugar de una
base de datos (ver `docs/superpowers/specs/2026-08-22-vestigia-design.md`). El
Worker cobra por Stripe Checkout y envía los emails de acceso por Resend. El
front es estático (GitHub Pages).

Una revisión de seguridad detectó que los endpoints que envían email o crean
sesiones de pago no tienen ninguna barrera contra el abuso automatizado, además
de varios problemas menores de validación, fuga de errores y robustez.

### Vector principal

`POST /api/acceso-gratuito` envía dos emails por petición (uno al visitante, a
una dirección que él escribe, y otro al owner) sin rate limit, CAPTCHA ni
verificación. Permite:

- bombardear con correo a terceros desde `hola@vestigia.fun`;
- inundar el buzón del owner;
- agotar la cuota / coste de Resend, dejando sin email de acceso a los clientes
  de pago;
- degradar la reputación del dominio (quejas de spam, rebotes).

`GET /api/confirm-payment` reenvía ambos emails y acuña un token nuevo de un año
**en cada llamada**, sin deduplicar. El `session_id` viaja en la URL de éxito y
funciona como credencial bearer.

## Decisiones de alcance

| Tema | Decisión |
|---|---|
| Infraestructura | Se añade **Workers KV**, usado solo para: (a) cubo de rate limit por IP+acción, (b) marca de cumplimiento de `confirm-payment`. No se añade Turnstile ni base de datos de pedidos. |
| Cobertura | Todos los hallazgos, en cinco tandas (Crítico, Alto, Medio, Bajo, Investigación). |
| Tokens ya emitidos | Aún no hay ventas reales: se asume que invalidar los tokens actuales (sin campo `v`) es aceptable. |

## Arquitectura

### Módulo nuevo: `worker/src/throttle.js`

Cubo de rate limit por `IP + acción` sobre Workers KV.

- Clave: `rl:<accion>:<ip>` (IP = `request.headers.get('CF-Connecting-IP')`).
- Valor JSON: `{ n, reset }` donde `reset` es epoch en segundos.
- `expirationTtl` = segundos que quedan hasta `reset`.
- Sin `kv` o sin `ip` (tests, `wrangler dev` sin binding) → **permite siempre**
  (falla en abierto: la seguridad nunca rompe el flujo funcional).
- KV es eventualmente consistente y no atómico: una ráfaga concurrente puede
  colar 1-2 peticiones de más sobre el límite. Aceptable para mitigación de
  abuso; queda documentado en el módulo. Alternativa atómica (Durable Objects)
  fuera de alcance.

Firma:

```js
export async function consumirCupo(kv, { ip, accion, limite, ventanaSegundos }) {
  // -> { permitido: true }
  // -> { permitido: false, reintentarEn: <segundos> }
}
```

### wrangler.toml

- Nuevo binding `KV` (namespace creado con `wrangler kv namespace create`,
  manual y previo a la tanda 1; ids de producción y `preview_id` en el toml).
- `[vars]` sin cambios.

### Frontend

- `js/api.js`: las tres funciones de red detectan `respuesta.status === 429` y
  lanzan un `Error` con `.rateLimited = true`.
- `js/ruta.js`: si `error.rateLimited`, muestra un mensaje propio (nueva clave
  i18n en `es/en/fr/it`) en vez del error genérico.
- `<meta name="referrer" content="no-referrer">` en `jugar/gracias.html`,
  `jugar/index.html`, `jugar/imprimir.html`.

## Tanda 1 — Crítico

### #1 `/api/acceso-gratuito`

- Throttle **1 email por IP cada 15 min** (`accion: 'acceso-gratuito'`,
  `limite: 1`, `ventanaSegundos: 900`).
- Si el throttle bloquea: la respuesta **sigue** devolviendo
  `{ ok: true, rutaId, idioma, orderId, token, emailEnviado: false }` (el acceso
  se entrega igual) pero **no se llama a Resend**. `gracias.html?gratis=1` ya
  muestra el enlace en pantalla (`js/gracias.js:47`), así que el usuario
  legítimo que se equivocó al teclear el email no queda bloqueado del acceso.
- Validación previa: `entradaValida({ rutaId, idioma })` (ver Tanda 3) antes de
  cualquier efecto.

### #2 `/api/create-checkout-session`

- Throttle **10 por IP cada 15 min** (`accion: 'checkout'`) → `429` con
  cabecera `Retry-After`.
- Misma validación `entradaValida`.

### #3 `/api/confirm-payment`

- Se recupera la sesión y se comprueba `paid` como hoy.
- **El token se devuelve siempre** que la sesión esté pagada — el acceso no
  puede depender de KV.
- Emails: se envían **solo si no existe `fulfilled:<orderId>` en KV**. Tras
  enviarlos, se escribe la marca con `expirationTtl` de ~32 días.
- Si KV no está disponible → fallback: enviar solo si `session.created` está
  dentro de la última hora.
- Throttle **5 por IP cada 15 min** (`accion: 'confirm'`) como segunda barrera
  frente a iteración sobre muchos `session_id`.

### Respuesta 429

```
HTTP 429
Retry-After: <segundos>
{ "error": "Demasiadas solicitudes, prueba de nuevo en unos minutos" }
```

### Tests

`worker/tests/throttle.test.js` (nuevo) — KV simulado con `Map`:
- primera petición pasa;
- alcanzado el límite → `permitido: false` con `reintentarEn`;
- pasada la ventana (`reset` en el pasado) → vuelve a pasar y reinicia contador;
- sin `kv` → siempre `permitido: true`;
- sin `ip` → siempre `permitido: true`.

`worker/tests/index.test.js` (añadidos):
- `confirm-payment` con `fulfilled:<orderId>` presente → no llama a Resend,
  devuelve token;
- `confirm-payment` sin marca → llama a Resend y escribe la marca;
- `confirm-payment` sin KV y sesión con `created` antiguo → no reenvía;
- `acceso-gratuito` con throttle agotado → responde token + `emailEnviado:false`
  y el `fetch` simulado de Resend hace fallar el test si se invoca;
- `create-checkout-session` con throttle agotado → `429` + `Retry-After`, sin
  llamada a Stripe.

## Tanda 2 — Alto

### #4 Verificación de importe / moneda / metadata

Nueva función en `worker/src/stripe.js`:

```js
export function validarSesionPagada(session, precioEsperado) {
  // true solo si:
  //  - session.payment_status === 'paid'
  //  - session.amount_total === Math.round(precioEsperado.importe * 100)
  //  - session.currency === precioEsperado.moneda
  //  - session.metadata.ruta_id presente
}
```

En `handleConfirmarPago`: si `validarSesionPagada` es `false` → no se acuña
token, respuesta `500 { error: 'La sesión de pago no es válida' }`,
`console.error` con el detalle y email al owner ("revisión manual: sesión X con
importe inesperado").

### #5 Reembolsos revocan acceso

`retrieveStripeSession` añade `expand[]=payment_intent.latest_charge` a la query.
En `handleConfirmarPago`, si `session.payment_intent.latest_charge.refunded ===
true` o `amount_refunded > 0` → `403 { error: 'Este pedido ha sido reembolsado' }`,
sin token. Coste: ninguna llamada extra.

### #6 No filtrar errores internos

El `catch` de nivel superior de `index.js`:
- `console.error(error)` con el detalle completo;
- responde siempre `500 { error: 'Error interno' }`.

Los `4xx` explícitos (ruta desconocida, email inválido, `429`, token inválido,
`session_id` inválido, JSON inválido) se mantienen tal cual.

### Tests

`worker/tests/stripe.test.js`:
- `validarSesionPagada` acepta una sesión coherente;
- rechaza `amount_total`, `currency` y `ruta_id` manipulados o ausentes.

`worker/tests/index.test.js`:
- sesión pagada pero con importe alterado → sin token, `500` genérico, email al
  owner;
- sesión con `latest_charge.refunded` → `403`, sin token;
- un handler que lanza (p. ej. Resend rechaza) → `500 { error: 'Error interno' }`
  sin el mensaje original.

## Tanda 3 — Medio

(El hallazgo #8 de la revisión —"un token válido permite extraer todo el
contenido de esa ruta"— queda en Fuera de alcance: es una limitación del modelo
sin base de datos.)

### #7 Versión en el token

`firmarToken` incluye `v: 1` en el payload. `verificarToken` devuelve `null` si
`payload.v !== 1`.

### #9 Allowlist de `idioma` y forma de `rutaId`

Helper en un módulo nuevo `worker/src/entrada.js` (que también alojará
`leerJsonAcotado`, ver #10):

```js
export function entradaValida({ rutaId, idioma }) {
  // idioma: undefined | 'es' | 'en' | 'fr' | 'it'
  // rutaId: /^[a-z]+-[a-z]+$/ y rutaPorId(rutaId) existe
}
```

Se aplica en `handleCrearCheckoutSession`, `handleAccesoGratuito` y
`handleObtenerRuta` (este último valida solo `idioma`; el `rutaId` viene del
token ya verificado). Cierra el sink teórico de `${rutaId}.${idioma}` como clave
en `contenido.js`.

### #10 Límite de tamaño y Content-Type

Antes de `request.json()` en cada handler POST:
- `Content-Length > 2048` → `413 { error: 'Petición demasiado grande' }`;
- `request.json()` en try/catch → `400 { error: 'JSON inválido' }`.

Helper `leerJsonAcotado(request)` en `worker/src/entrada.js`.

### #11 Nota sobre CORS

Comentario en `worker/src/cors.js`: CORS no autoriza nada frente a clientes no
navegador; la autorización real son el token firmado y el throttle. Sin cambio
de código.

### #12 Escapar contenido de enigma en el DOM

`js/jugar.js` (`renderPistas` L78, `renderCampos` L117) y `js/imprimir.js`
(L40, L86): pasar `texto`, `sub.texto` y el texto de cada pista por
`escaparHtml` antes de interpolarlos en `innerHTML`.

### Tests

`worker/tests/acceso.test.js`: token sin `v` o con `v` desconocido → `null`;
con `v: 1` → payload.

`worker/tests/index.test.js`: `idioma` no soportado → tratado como `es` sin
error; `rutaId` con forma inválida → `400`; body > 2 KB → `413`; body no-JSON
→ `400`.

`tests/` del front: una plantilla de pista/subpregunta con `<script>` en el
texto se renderiza escapada (unit de la función de plantilla, o test de DOM con
el runner existente si lo hay).

## Tanda 4 — Bajo / higiene

### #14 Cabeceras

- Respuestas del Worker: `X-Content-Type-Options: nosniff` en todas;
  `Cache-Control: no-store` en `/api/ruta` y `/api/confirm-payment`. Se amplía
  `buildCorsHeaders` en `worker/src/cors.js` para incluir siempre `nosniff`, y
  los dos handlers que devuelven token añaden `Cache-Control: no-store`.
- `<meta name="referrer" content="no-referrer">` en las tres páginas de
  `jugar/`.

### #16 Emails independientes

`Promise.all` → `Promise.allSettled` en los envíos de `handleAccesoGratuito` y
`handleConfirmarPago`. Un fallo del email al owner no tumba el flujo del cliente
ni al revés; el envío fallido se loguea.

### #15 Observabilidad

`console.log` con eventos estructurados: `{ evento: 'throttle_bloqueo', accion,
ip }`, `throttle_ok`, `pago_validado`, `pago_rechazado`,
`email_reenvio_saltado`. Visibles en `wrangler tail` y Workers Logs.

### Tests

`worker/tests/index.test.js`: la respuesta de `/api/ruta` lleva
`Cache-Control: no-store` y `X-Content-Type-Options: nosniff`; si un email
falla, el otro se envía y la respuesta no es `500`.

## Tanda 5 — Investigación (no bloquea las demás)

### #13 Escaneo de secretos en el historial de git

`gitleaks detect` o `trufflehog git file://.` sobre todo el historial. Foco:
`sk_live_`, `sk_test_`, `re_`, `TOKEN_SECRET`, contenido de `.dev.vars`. Se
entrega informe; si aparece algo, rotar esa clave (proveedor + `wrangler secret
put`) — la rotación la hace el owner.

### #17 npm audit

En `/` y `/worker`. Se reporta; si hay algo accionable en devDependencies
(`playwright`, `wrangler`) se actualiza.

### #18 mint-dev-token.mjs

Confirmar que `worker/scripts/mint-dev-token.mjs` no tiene secreto embebido y
que `wrangler deploy` no lo empaqueta (está fuera de `src/`).

## Orden de implementación

Cada tanda es un ciclo: propuesta cerrada → código → `node --test` → commit de
lo versionado.

1. Tanda 1 (Crítico) — precede `wrangler kv namespace create` manual.
2. Tanda 2 (Alto).
3. Tanda 3 (Medio).
4. Tanda 4 (Bajo).
5. Tanda 5 (Investigación) — en paralelo.

## Despliegue

- Worker: `node --test` y `wrangler deploy` por tanda. El contenido
  `worker/src/contenido/` (gitignore) viaja en el deploy como siempre.
- Frontend: GitHub Pages.
- KV: `wrangler kv namespace create` antes de la Tanda 1; binding en
  `wrangler.toml` (versionado).

## Fuera de alcance

- Turnstile / CAPTCHA.
- Base de datos de pedidos, deduplicación global de compras.
- Webhooks de Stripe (si se añaden en el futuro: verificar `Stripe-Signature`).
- Rate limit atómico / Durable Objects.
- Revocación individual de tokens sin rotar el secreto (el campo `v` solo
  permite invalidación en bloque).
- Marca de agua / anti-scraping del contenido servido a un token válido.

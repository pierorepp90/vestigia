# Vestigia — votación de próxima ciudad + devoluciones post-ruta

## Contexto

Dos formas nuevas de participación del usuario que el proyecto hoy no
puede ofrecer sin romper su regla de "nada de estado en servidor":

1. **Votación**: que el visitante vote qué ciudad quiere que se prepare a
   continuación, y pueda proponer una que no esté en la lista.
2. **Devoluciones**: que quien termina una ruta pueda valorarla, quejarse
   y contar qué mejoraría.

Ambas necesitan persistencia. Hasta ahora el Worker no tiene base de datos
por decisión expresa (ver `2026-08-22-vestigia-design.md` y el comentario
en `worker/src/index.js` sobre no añadir KV salvo petición explícita del
propietario). Esta spec introduce esa petición explícita: **Cloudflare
D1**, en el plan gratuito, dentro de la misma cuenta de Cloudflare que ya
aloja el Worker.

Decidido en sesión de brainstorming el 2026-09-02.

## Decisiones tomadas

| Tema | Decisión |
|---|---|
| Persistencia | Cloudflare D1 (SQLite gestionado), plan gratuito. Descartados KV (contar/listar incómodo) y "solo email sin BD" (no deja mostrar resultados ni deduplicar) |
| Qué se vota | Lista cerrada que cura el propietario **+** campo libre para proponer ciudad/barrio |
| Propuestas de campo libre | Cola moderada: la propuesta llega al propietario y solo aparece como opción votable cuando la aprueba |
| Visibilidad de resultados | Se revelan **una vez que votas** (patrón encuesta): antes de votar no se ven recuentos |
| Voto de quien propone | Al proponer se guarda su voto "en espera"; si se aprueba la ciudad entra con ese voto ya contado; si se rechaza, se descarta |
| Anti-duplicados | Ligero: UUID en `localStorage` + dedupe por hash de IP en D1 (sin IP en claro). Sin captcha, sin verificación por email |
| Dónde vive la votación | Página propia `/votar`, enlazada desde la portada. Idioma resuelto en runtime (como `jugar/*`), no SSG por idioma: la página no necesita SEO y así no toca `scripts/generar-i18n.mjs` |
| Moderación | Página de admin mínima `/admin/votos.html` protegida por frase secreta (no enlaces de acción en email) |
| Cuándo se pide la devolución | En la pantalla final del juego (`vista-completada`), nada más terminar |
| Qué recoge la devolución | Valoración (1-5) + categoría + texto libre + email opcional ("si quieres que te respondamos") |
| Dónde acaban las devoluciones | Tabla en D1 **+** email al propietario por Resend con cada una |
| Idiomas | Toda la UI nueva en los 4 idiomas (ES/EN/FR/IT), mismo patrón que el resto del sitio; los tests de paridad i18n obligan a completarlos |

## 1. Infraestructura: Cloudflare D1

- Base de datos D1 `vestigia-db`, declarada como binding `DB` en
  `worker/wrangler.toml` (`[[d1_databases]]`).
- Migraciones versionadas en `worker/migrations/*.sql`, aplicadas con
  `wrangler d1 migrations apply vestigia-db` (local y remoto).
- **Todo** el acceso a D1 pasa por un módulo nuevo `worker/src/db.js` con
  funciones con nombre (`listarOpciones`, `estadoVotante`, `registrarVoto`,
  `crearPropuesta`, `listarPendientes`, `moderarPropuesta`,
  `guardarDevolucion`). Los handlers nunca tocan `env.DB` directamente.
  Motivo: los tests del Worker son `node --test` con dobles a mano (sin
  miniflare); `db.js` se prueba con un `DB` falso en memoria y los
  handlers se prueban con un módulo `db` falso.

### Esquema (`migrations/0001_votacion_devoluciones.sql`)

**`voto_opciones`**

| columna | tipo | nota |
|---|---|---|
| `id` | TEXT PRIMARY KEY | slug: `praga`, `oporto`, `sevilla-santacruz`… |
| `etiqueta` | TEXT NOT NULL | JSON `{"es":…,"en":…,"fr":…,"it":…}`; una propuesta sin traducir guarda solo `es` |
| `estado` | TEXT NOT NULL | `oficial` \| `aprobada` \| `pendiente` \| `rechazada` |
| `propuesta_email` | TEXT | email opcional de quien la propuso |
| `nota` | TEXT | texto libre de la propuesta |
| `creada_en` | INTEGER NOT NULL | epoch ms |

Opciones visibles y votables = `estado IN ('oficial','aprobada')`.

**`votos`**

| columna | tipo | nota |
|---|---|---|
| `id` | INTEGER PRIMARY KEY AUTOINCREMENT | |
| `opcion_id` | TEXT NOT NULL REFERENCES `voto_opciones(id)` | |
| `votante` | TEXT NOT NULL | UUID de `localStorage` |
| `ip_hash` | TEXT NOT NULL | `SHA-256(IP + IP_SALT)`, nunca IP en claro |
| `estado` | TEXT NOT NULL | `activo` \| `en_espera` (propuesta pendiente de moderar) |
| `creado_en` | INTEGER NOT NULL | |

- Índice único en `votante`: un voto por navegador (activo o en espera).
- Guard secundario en `registrarVoto`: rechazar si ese `ip_hash` ya tiene
  ≥ 3 votos (comparten NAT sin ser abuso hasta cierto punto).
- `IP_SALT`: secreto de wrangler.

**`devoluciones`**

| columna | tipo | nota |
|---|---|---|
| `id` | INTEGER PRIMARY KEY AUTOINCREMENT | |
| `ruta_id` | TEXT NOT NULL | |
| `order_id` | TEXT NOT NULL | extraído del token de acceso |
| `idioma` | TEXT NOT NULL | |
| `valoracion` | INTEGER NOT NULL | 1-5 |
| `categoria` | TEXT NOT NULL | `enigmas` \| `dificultad` \| `recorrido` \| `error` \| `precio` \| `otro` |
| `texto` | TEXT NOT NULL | libre, ≤ 2000 caracteres |
| `email` | TEXT | opcional |
| `creado_en` | INTEGER NOT NULL | |

### Semilla de candidatas oficiales

La migración inicial hace `INSERT` de las opciones `oficial` que decida el
propietario (Praga ya figura en el catálogo como "próximamente" con
`activa:false`; el resto se listan en el plan de implementación tras
confirmarlas). Editar la lista oficial más adelante = nueva migración o
`UPDATE`/`INSERT` manual con `wrangler d1 execute`. No lleva UI: es una
operación rara y del propietario.

## 2. Votación

### Página `/votar/`

- `votar/index.html` única; los 4 idiomas se resuelven en runtime con
  `js/i18n.js` y `aplicarI18n(document, lang)`, igual que `jugar/*` y
  `gracias.html`. No entra en `scripts/generar-i18n.mjs` ni en el sitemap
  (las arañas la alcanzan por el enlace desde la portada). `noindex` no;
  es contenido legítimo, solo que sin versión estática por idioma.
- Enlazada desde la portada, en el bloque de ciudades / "próximamente".
- Lógica en `js/votar.js` (nuevo). Identidad del votante: UUID guardado en
  `localStorage` como `vestigia_voto_id`, creado la primera vez que se
  carga la página.
- Al cargar: `GET /api/votacion?votante=<uuid>` y se pinta el estado que
  corresponda. Reconciliación: si el votante tenía una propuesta que fue
  rechazada, el Worker devuelve `estadoVotante: "sin_voto"` y la página
  vuelve al estado 1 (aunque `localStorage` recuerde que "ya participó").

**Estados de la vista:**

1. **Sin votar** (`estadoVotante: "sin_voto"`): lista de opciones
   votables (sin recuentos), botón "Votar" en cada una. Debajo, bloque
   "¿Falta una ciudad? Propón una": campo ciudad/barrio (obligatorio),
   nota (opcional), email (opcional).
2. **Ya votó** (`estadoVotante: "voto_activo"`): recuentos revelados,
   ordenados de más a menos, con barra proporcional; "Tu voto: X"
   resaltado. Sin botón de votar ni formulario de propuesta.
3. **Propuesta en espera** (`estadoVotante: "propuesta_pendiente"`):
   mensaje "La revisaremos. Tu voto queda reservado para esa ciudad." Sin
   recuentos (todavía no ha "votado" una opción pública).

### Endpoints (en `worker/src/votacion.js`, enrutados desde `index.js`)

| método | ruta | entrada | salida |
|---|---|---|---|
| GET | `/api/votacion` | `?votante=<uuid>` | `{opciones:[{id,etiqueta}], estadoVotante, miVoto}` — **`votos` por opción SOLO si `estadoVotante === "voto_activo"`** |
| POST | `/api/votacion/voto` | `{opcionId, votante}` | `{ok, opciones:[{id,etiqueta,votos}], miVoto}` |
| POST | `/api/votacion/propuesta` | `{ciudad, nota?, email?, votante}` | `{ok}` |

- `/api/votacion/voto`: valida que `opcionId` existe y es votable, que
  `votante` no tiene voto previo, y el guard de `ip_hash`. Inserta en
  `votos` con `estado:'activo'`. Devuelve ya los recuentos (el usuario
  acaba de ganarse el derecho a verlos).
- `/api/votacion/propuesta`: rechaza si `votante`/`ip_hash` ya tiene una
  propuesta `pendiente` o un voto. Inserta `voto_opciones`
  (`estado:'pendiente'`, `etiqueta` = `{es: ciudad}`) y `votos`
  (`estado:'en_espera'`, apuntando a esa opción). Manda email al
  propietario (`buildPropuestaEmail`). Límites: ciudad ≤ 120, nota ≤ 500.

### Moderación: `/admin/votos.html`

- HTML estático, `<meta name="robots" content="noindex">`, **fuera de
  `sitemap.xml`**. Lógica en `js/admin-votos.js` (nuevo, sin i18n).
- Pide una frase secreta, la guarda en `sessionStorage`, y la envía como
  `Authorization: Bearer <frase>` en cada llamada admin. El Worker la
  compara (comparación de tiempo constante) con `env.ADMIN_SECRET`
  (secreto de wrangler). Respuesta 401 → la página vuelve a pedir la frase.
- Muestra las propuestas `pendiente`: ciudad, nota, email, fecha. Botones
  **Aprobar** y **Rechazar** por fila.

| método | ruta | entrada | efecto |
|---|---|---|---|
| GET | `/api/admin/propuestas` | header bearer | lista de propuestas `pendiente` |
| POST | `/api/admin/propuestas/<id>` | `{accion:"aprobar"\|"rechazar"}` + bearer | aprobar → opción `aprobada` + su voto `en_espera` pasa a `activo`; rechazar → opción `rechazada` + su voto `en_espera` se borra |

## 3. Devoluciones

### UI: pantalla final del juego

En `jugar/index.html`, dentro de `#vista-completada`, un bloque nuevo bajo
el texto de cierre (`renderCompletada` en `js/jugar.js`):

- Título "¿Qué te ha parecido?"
- 5 estrellas (input de valoración 1-5).
- Selector de categoría (las 6 de la tabla `devoluciones`).
- Textarea "Cuéntanos: qué falló, qué mejorarías…".
- Campo email opcional con etiqueta "Déjanoslo si quieres que te
  respondamos".
- Botón "Enviar".

Tras enviar con éxito: el bloque se sustituye por "Gracias, lo leemos
todo." Se marca en el progreso persistente (`js/juego/progreso.js` /
`localStorage`, campo `devolucionEnviada`) para no volver a mostrar el
formulario si el jugador reabre la ruta.

Validación en cliente antes de enviar: valoración obligatoria, categoría
obligatoria, texto no vacío.

### Endpoint

`POST /api/devolucion?t=<token>` con cuerpo
`{rutaId, valoracion, categoria, texto, email?}` (en `worker/src/devoluciones.js`).

- **Exige token de acceso válido** (`verificarToken`, mismo mecanismo que
  `/api/ruta`). De ahí sale `order_id`; `rutaId` del cuerpo se contrasta
  con el `rutaId` del token.
- Valida: `valoracion` entero 1-5; `categoria` en la lista; `texto` no
  vacío y ≤ 2000; `email` con `emailValidoBasico` si viene.
- `guardarDevolucion` inserta la fila y se envía email al propietario
  (`buildDevolucionEmail`): asunto con la valoración y la ruta (p. ej.
  `★★☆☆☆ napoles-spaccanapoli — nueva devolución`) para que las quejas
  salten en la bandeja. El email incluye categoría, texto y, si viene, el
  email del cliente para responder.
- Sin base para deduplicar más allá del flag de `localStorage` del
  cliente; se acepta que un cliente decidido pueda mandar varias (mismo
  criterio que la nota sobre no deduplicar de `index.js`).

## 4. Archivos

### Worker

**Nuevos:** `src/db.js`, `src/votacion.js`, `src/devoluciones.js`,
`migrations/0001_votacion_devoluciones.sql`.

**Tocados:**
- `src/index.js`: rutas nuevas en el router (`/api/votacion*`,
  `/api/devolucion`, `/api/admin/propuestas*`).
- `src/resend.js`: `buildPropuestaEmail`, `buildDevolucionEmail` (ambos
  solo al propietario; no necesitan los 4 idiomas de UI).
- `wrangler.toml`: `[[d1_databases]]`; documentar `ADMIN_SECRET` e
  `IP_SALT` como secretos junto a los ya existentes.

### Front

**Nuevos:** `votar/index.html`, `js/votar.js`, `admin/votos.html`,
`js/admin-votos.js`.

**Tocados:**
- `js/api.js`: `obtenerVotacion`, `emitirVoto`, `enviarPropuesta`,
  `enviarDevolucion`.
- `js/jugar.js`: bloque de devolución en `renderCompletada` + envío.
- `js/juego/progreso.js`: campo `devolucionEnviada` en el estado
  persistente.
- `js/i18n.js`: claves nuevas (página de votación + bloque de devolución)
  en ES/EN/FR/IT.
- Portada (`index.html`): enlace a `/votar` en el bloque de ciudades /
  "próximamente", con `data-i18n` para que el SSG de `en/` lo traduzca al
  reprocesar la portada (basta volver a correr
  `node scripts/generar-seo.mjs && node scripts/generar-i18n.mjs`; no hay
  que tocar los scripts). El texto del enlace, clave nueva en `js/i18n.js`.
- `legal/privacidad.html`: renglón sobre datos de votos (UUID de
  navegador, hash de IP) y devoluciones (email opcional).

## 5. Tests

- `worker/tests/votacion.test.js`:
  - `GET /api/votacion` no incluye recuentos para un votante sin voto.
  - Segundo voto del mismo `votante` → rechazado.
  - `propuesta` crea opción `pendiente` + voto `en_espera` y no la hace
    votable.
  - Aprobar una propuesta la vuelve votable y activa su voto; rechazar la
    marca `rechazada` y borra el voto en espera.
  - Endpoints admin sin bearer correcto → 401.
- `worker/tests/devoluciones.test.js`:
  - Sin token válido → 401, sin tocar D1 ni Resend.
  - Valoración fuera de 1-5 / categoría desconocida / texto vacío → 400.
  - Caso válido: llama a `guardarDevolucion` y a `sendEmail` (con `fetch`
    simulado).
- `worker/tests/db.test.js`: `db.js` contra un `DB` falso en memoria
  (contar votos, unicidad por votante, transición de estados).
- Paridad i18n: cubierta por los tests existentes de `js/i18n.js`.

## 6. Privacidad y legal

- La IP solo se almacena como `SHA-256(IP + IP_SALT)`; el salt es secreto.
- Los emails (propuesta y devolución) son opcionales y se guardan solo
  para poder responder.
- Renglón nuevo en `legal/privacidad.html`.

## 7. Despliegue

Orden: crear D1 (`wrangler d1 create vestigia-db`) → añadir binding a
`wrangler.toml` → aplicar migración en remoto → `wrangler secret put
ADMIN_SECRET` e `IP_SALT` → `wrangler deploy` → publicar el sitio estático
con las páginas nuevas. Documentar en el README junto al resto de la
puesta en marcha del Worker.

## Alternativas consideradas

- **Workers KV** en vez de D1: contar votos con concurrencia y listar
  devoluciones es incómodo en clave-valor. Descartado.
- **Sin BD, todo por email** y recuento manual: fiel a la filosofía
  actual, pero no deja mostrar resultados ni deduplicar votos. Descartado.
- **Moderación por enlaces firmados en el email** (aprobar/rechazar con un
  clic, sin página de admin): el propietario prefirió una página de admin.
- **Voto verificado por email** o **Turnstile**: demasiada fricción / más
  montaje para lo que está en juego. Se optó por UUID + hash de IP.

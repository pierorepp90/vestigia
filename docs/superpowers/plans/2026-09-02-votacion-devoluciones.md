# Votación de próxima ciudad + devoluciones post-ruta — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Añadir a Vestigia una página de votación de la próxima ciudad (con propuestas moderadas) y un formulario de devolución al terminar una ruta, persistiendo ambos en Cloudflare D1.

**Architecture:** El sitio sigue siendo estático + un único Worker de Cloudflare. Se introduce una base de datos D1 (`vestigia-db`, plan gratuito) con tres tablas. Todo el SQL vive en `worker/src/db.js`; los handlers HTTP (`votacion.js`, `devoluciones.js`) reciben el módulo `db` como dependencia inyectable para poder probarse con un doble en memoria, igual que `sendEmail` ya recibe `fetchFn`. La página `/votar` resuelve el idioma en runtime como `jugar/*` (sin SSG por idioma). La moderación es una página estática `/admin/votos.html` protegida por `Authorization: Bearer <ADMIN_SECRET>`.

**Tech Stack:** JavaScript sin build (navegador: ES modules; Worker: Cloudflare Workers runtime), Cloudflare D1 (SQLite), Wrangler 4, `node --test` con dobles a mano, Web Crypto (`crypto.subtle`), Resend para email.

**Spec:** `docs/superpowers/specs/2026-09-02-votacion-devoluciones-design.md`

---

## Convenciones de este plan

- Tests: se ejecutan con `node --test` desde la raíz del repo (descubre `tests/**` y `worker/tests/**`). Para acotar a un archivo: `node --test worker/tests/votacion.test.js`.
- Commits: mensajes en español, imperativo, sin prefijos tipo `feat:` (el repo no los usa). Terminar cada mensaje con la línea `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`.
- Todo el trabajo va a `master` (el proyecto no usa ramas para esto — ver historial de `docs/superpowers/`).
- No tocar `worker/src/contenido/*.json` (contenido de pago, gitignore).

### Infraestructura de seguridad YA presente en `master` (leer antes de la Fase B)

El plan de endurecimiento de seguridad **ya está implementado y desplegado**
(commits `eac8c39`…`47a8c6f`). El Worker actual trae:

- **`worker/src/throttle.js`** → `consumirCupo(kv, { ip, accion, limite, ventanaSegundos })`
  → `{ permitido, reintentarEn }`. **Falla en abierto**: sin `kv` o sin `ip`
  devuelve `{ permitido: true }`, así los tests que no pasan `env.KV` lo
  ignoran sin más.
- **`worker/src/entrada.js`** → `leerJsonAcotado(request, maxBytes=2048)`
  → `{ datos }` o `{ error, status }`; y `entradaValida({ rutaId, idioma })`.
- **`wrangler.toml`** ya tiene el binding `[[kv_namespaces]]` `KV` (además
  del `[[d1_databases]]` `DB` que añadió la Task A1).
- El router de `index.js` calcula `const ip = request.headers.get('CF-Connecting-IP') || '';`
  **una vez** en `fetch` y lo pasa como argumento a cada handler POST.
- Los handlers existentes llaman a `leerJsonAcotado` y `consumirCupo`
  **dentro** del propio handler; las respuestas 429 llevan
  `Retry-After: String(cupo.reintentarEn)`.
- El token de acceso lleva `v: 1`; `verificarToken` sigue devolviendo
  `{ v, rutaId, orderId, exp }` — el código de devoluciones que lee
  `payload.rutaId` / `payload.orderId` no cambia.
- `resend.js` exporta `emailValidoBasico`, `sendEmail`, `buildAvisoOwner`,
  `buildOwnerEmail`, `buildCustomerEmail`; `escapeHtml` y `FROM_ADDRESS`
  son internos del módulo (las funciones nuevas de B4/D2 los usan desde
  dentro del mismo archivo).

**Consecuencias para este plan** (ya incorporadas a las tasks de abajo):

1. Los handlers nuevos siguen el mismo patrón: firma
   `handleX(request, env, cors, ip, db = dbPorDefecto)` (los GET sin `ip`),
   leen el body con `leerJsonAcotado`, y los que mandan email pasan por
   `consumirCupo`.
2. `/api/votacion/voto` → `consumirCupo` `accion: 'voto'`, `limite: 20`.
   `/api/votacion/propuesta` → `accion: 'propuesta'`, `limite: 3`.
   `/api/devolucion` → `accion: 'devolucion'`, `limite: 5`. Ventana 900 s
   (`const VENTANA_THROTTLE = 900` ya existe en `index.js`).
3. La Task **B3b** (guard por IP en D1) se mantiene como defensa extra que
   sobrevive a una caída de KV, pero simplificada.
4. Al enrutar (Task B6) **NO** reescribas los handlers existentes ni el
   cálculo de `ip`; solo añade los `if` de las rutas nuevas y el header
   `Authorization` en `cors.js`.
5. Task A4 (nueva) recoge los "follow-ups" de la revisión de calidad de la
   Fase A antes de que los handlers dependan de `db.js`.

## Mapa de archivos

### Worker — nuevos

| Archivo | Responsabilidad |
|---|---|
| `worker/migrations/0001_votacion_devoluciones.sql` | Esquema de las 3 tablas + semilla de 6 opciones oficiales |
| `worker/src/db.js` | **Único** archivo con SQL. Funciones con nombre sobre `env.DB` |
| `worker/src/hash.js` | `hashIp(ip, salt)` → hex SHA-256 |
| `worker/src/votacion.js` | Handlers: obtener votación, emitir voto, enviar propuesta, listar/moderar propuestas (admin) |
| `worker/src/devoluciones.js` | Handler: enviar devolución (exige token de acceso) |

### Worker — modificados

| Archivo | Cambio |
|---|---|
| `worker/wrangler.toml` | Binding `[[d1_databases]]`; documentar `ADMIN_SECRET` e `IP_SALT` |
| `worker/src/index.js` | Rutas nuevas en el router; pasar `env`/`request` a los handlers nuevos |
| `worker/src/cors.js` | Permitir el header `Authorization` en las peticiones admin |
| `worker/src/resend.js` | `buildPropuestaEmail`, `buildDevolucionEmail` |

### Front — nuevos

| Archivo | Responsabilidad |
|---|---|
| `votar/index.html` | Página de votación (una sola, i18n en runtime) |
| `js/votar.js` | Máquina de estados de la página de votación |
| `admin/votos.html` | Panel de moderación (sin i18n) |
| `js/admin-votos.js` | Lógica del panel de moderación |

### Front — modificados

| Archivo | Cambio |
|---|---|
| `js/api.js` | `obtenerVotacion`, `emitirVoto`, `enviarPropuesta`, `enviarDevolucion` |
| `js/i18n.js` | Claves nuevas (votación + devolución + enlace de portada) en ES/EN/FR/IT |
| `js/juego/progreso.js` | Campo `devolucionEnviada` en `estadoInicial()` |
| `js/jugar.js` | Bloque de devolución en `renderCompletada` + envío |
| `jugar/index.html` | Markup del bloque de devolución en `#vista-completada` |
| `index.html` | Bloque con enlace a `/votar` tras `#grid-ciudades` |
| `legal/privacidad.html` | Renglón sobre datos de votos y devoluciones |
| `css/juego.css` | Estilos mínimos del bloque de devolución |
| `css/styles.css` | Estilos mínimos de la página de votación |
| `README.md` | Puesta en marcha de D1 y secretos nuevos |

---

## FASE A — Cimientos de D1

### Task A1: Base de datos D1 y binding

**Files:**
- Create: `worker/migrations/0001_votacion_devoluciones.sql`
- Modify: `worker/wrangler.toml`

- [ ] **Step 1: Crear la base de datos D1 (remota + local)**

Run desde `worker/`:
```bash
npx wrangler d1 create vestigia-db
```
Expected: imprime un bloque `[[d1_databases]]` con `database_name = "vestigia-db"` y un `database_id` UUID. Copiar ese `database_id`.

Si el comando pide login, hacer `npx wrangler login` primero. Si la cuenta ya tiene una `vestigia-db`, usar `npx wrangler d1 list` para recuperar el `database_id`.

- [ ] **Step 2: Añadir el binding a `wrangler.toml`**

Añadir al final de `worker/wrangler.toml` (sustituir `PEGAR_DATABASE_ID_AQUI`):
```toml

[[d1_databases]]
binding = "DB"
database_name = "vestigia-db"
database_id = "PEGAR_DATABASE_ID_AQUI"
migrations_dir = "migrations"
```

Y en el bloque de comentarios de secretos de `wrangler.toml`, añadir bajo las líneas de `wrangler secret put` existentes:
```toml
#   wrangler secret put ADMIN_SECRET   # frase larga para el panel /admin/votos.html
#   wrangler secret put IP_SALT        # openssl rand -hex 16 — sal para el hash de IP de los votos
```

- [ ] **Step 3: Escribir la migración**

Create `worker/migrations/0001_votacion_devoluciones.sql`:
```sql
-- Votación de próxima ciudad + devoluciones post-ruta.
-- Ver docs/superpowers/specs/2026-09-02-votacion-devoluciones-design.md

CREATE TABLE voto_opciones (
  id              TEXT PRIMARY KEY,
  etiqueta        TEXT NOT NULL,          -- JSON {"es":...,"en":...,"fr":...,"it":...}
  estado          TEXT NOT NULL,          -- oficial | aprobada | pendiente | rechazada
  propuesta_email TEXT,
  nota            TEXT,
  creada_en       INTEGER NOT NULL
);

CREATE TABLE votos (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  opcion_id TEXT NOT NULL REFERENCES voto_opciones(id),
  votante   TEXT NOT NULL,
  ip_hash   TEXT NOT NULL,
  estado    TEXT NOT NULL,                -- activo | en_espera
  creado_en INTEGER NOT NULL
);
CREATE UNIQUE INDEX idx_votos_votante ON votos(votante);
CREATE INDEX idx_votos_ip_hash ON votos(ip_hash);
CREATE INDEX idx_votos_opcion ON votos(opcion_id);

CREATE TABLE devoluciones (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  ruta_id    TEXT NOT NULL,
  order_id   TEXT NOT NULL,
  idioma     TEXT NOT NULL,
  valoracion INTEGER NOT NULL,
  categoria  TEXT NOT NULL,
  texto      TEXT NOT NULL,
  email      TEXT,
  creado_en  INTEGER NOT NULL
);
CREATE INDEX idx_devoluciones_ruta ON devoluciones(ruta_id);

INSERT INTO voto_opciones (id, etiqueta, estado, creada_en) VALUES
  ('praga',     '{"es":"Praga","en":"Prague","fr":"Prague","it":"Praga"}',             'oficial', 0),
  ('amsterdam', '{"es":"Ámsterdam","en":"Amsterdam","fr":"Amsterdam","it":"Amsterdam"}','oficial', 0),
  ('viena',     '{"es":"Viena","en":"Vienna","fr":"Vienne","it":"Vienna"}',             'oficial', 0),
  ('atenas',    '{"es":"Atenas","en":"Athens","fr":"Athènes","it":"Atene"}',            'oficial', 0),
  ('budapest',  '{"es":"Budapest","en":"Budapest","fr":"Budapest","it":"Budapest"}',    'oficial', 0),
  ('dublin',    '{"es":"Dublín","en":"Dublin","fr":"Dublin","it":"Dublino"}',           'oficial', 0);
```

- [ ] **Step 4: Aplicar la migración en local y verificar**

Run desde `worker/`:
```bash
npx wrangler d1 migrations apply vestigia-db --local
npx wrangler d1 execute vestigia-db --local --command "SELECT id, estado FROM voto_opciones ORDER BY id"
```
Expected: la primera orden aplica `0001`; la segunda lista 6 filas (`amsterdam`, `atenas`, `budapest`, `dublin`, `praga`, `viena`), todas `estado = oficial`.

- [ ] **Step 5: Commit**

```bash
git add worker/migrations/0001_votacion_devoluciones.sql worker/wrangler.toml
git commit -m "$(printf 'D1: base de datos vestigia-db y esquema inicial\n\nTres tablas (voto_opciones, votos, devoluciones) + semilla de 6\ncapitales oficiales para la votacion.\n\nCo-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>')"
```

---

### Task A2: `worker/src/db.js` — capa de acceso (parte votación)

**Files:**
- Create: `worker/src/db.js`
- Create: `worker/tests/db.test.js`
- Create: `worker/tests/helpers/fake-d1.js`

- [ ] **Step 1: Escribir el doble en memoria de D1**

Create `worker/tests/helpers/fake-d1.js`:
```js
// worker/tests/helpers/fake-d1.js
//
// Doble mínimo de la API de D1 (env.DB.prepare().bind().first()/all()/run()).
// No interpreta SQL: cada consulta de db.js empieza con un comentario-etiqueta
// `/* tag:NOMBRE */` y este doble conmuta sobre esa etiqueta. Mantener
// sincronizado con las etiquetas de worker/src/db.js.

export function crearD1Falsa(inicial = {}) {
  const tablas = {
    voto_opciones: [...(inicial.voto_opciones || [])],
    votos: [...(inicial.votos || [])],
    devoluciones: [...(inicial.devoluciones || [])],
  };
  let autoId = 1;

  function tag(sql) {
    const m = sql.match(/\/\* tag:(\w+) \*\//);
    if (!m) throw new Error(`SQL sin etiqueta en fake-d1: ${sql}`);
    return m[1];
  }

  function ejecutar(etiqueta, args) {
    switch (etiqueta) {
      case 'opciones_votables':
        return {
          results: tablas.voto_opciones
            .filter((o) => o.estado === 'oficial' || o.estado === 'aprobada')
            .map((o) => ({ id: o.id, etiqueta: o.etiqueta })),
        };
      case 'recuento_votos':
        return {
          results: Object.entries(
            tablas.votos
              .filter((v) => v.estado === 'activo')
              .reduce((acc, v) => ((acc[v.opcion_id] = (acc[v.opcion_id] || 0) + 1), acc), {}),
          ).map(([opcion_id, votos]) => ({ opcion_id, votos })),
        };
      case 'voto_de_votante':
        return { first: tablas.votos.find((v) => v.votante === args[0]) || null };
      case 'opcion_por_id':
        return { first: tablas.voto_opciones.find((o) => o.id === args[0]) || null };
      case 'contar_por_ip':
        return {
          first: { n: tablas.votos.filter((v) => v.ip_hash === args[0] && v.estado === 'activo').length },
        };
      case 'insertar_voto':
        tablas.votos.push({
          id: autoId++, opcion_id: args[0], votante: args[1], ip_hash: args[2], estado: args[3], creado_en: args[4],
        });
        return { success: true };
      case 'insertar_opcion':
        tablas.voto_opciones.push({
          id: args[0], etiqueta: args[1], estado: args[2], propuesta_email: args[3], nota: args[4], creada_en: args[5],
        });
        return { success: true };
      case 'propuesta_pendiente_de_votante':
        return {
          first:
            tablas.votos.find(
              (v) => v.votante === args[0] && v.estado === 'en_espera',
            ) || null,
        };
      case 'propuestas_pendientes':
        return {
          results: tablas.voto_opciones
            .filter((o) => o.estado === 'pendiente')
            .map((o) => ({ id: o.id, etiqueta: o.etiqueta, propuesta_email: o.propuesta_email, nota: o.nota, creada_en: o.creada_en })),
        };
      case 'actualizar_estado_opcion': {
        const o = tablas.voto_opciones.find((x) => x.id === args[1]);
        if (o) o.estado = args[0];
        return { success: true };
      }
      case 'activar_voto_en_espera': {
        const v = tablas.votos.find((x) => x.opcion_id === args[0] && x.estado === 'en_espera');
        if (v) v.estado = 'activo';
        return { success: true };
      }
      case 'borrar_voto_en_espera':
        tablas.votos = tablas.votos.filter((v) => !(v.opcion_id === args[0] && v.estado === 'en_espera'));
        return { success: true };
      case 'insertar_devolucion':
        tablas.devoluciones.push({
          id: autoId++, ruta_id: args[0], order_id: args[1], idioma: args[2],
          valoracion: args[3], categoria: args[4], texto: args[5], email: args[6], creado_en: args[7],
        });
        return { success: true };
      default:
        throw new Error(`etiqueta desconocida en fake-d1: ${etiqueta}`);
    }
  }

  const DB = {
    _tablas: tablas,
    prepare(sql) {
      const etiqueta = tag(sql);
      let bound = [];
      const stmt = {
        bind(...a) { bound = a; return stmt; },
        async first(col) {
          const r = ejecutar(etiqueta, bound);
          const row = r.first ?? (r.results ? r.results[0] : null) ?? null;
          return col && row ? row[col] : row;
        },
        async all() {
          const r = ejecutar(etiqueta, bound);
          return { results: r.results || [], success: true };
        },
        async run() { return ejecutar(etiqueta, bound); },
      };
      return stmt;
    },
  };
  return DB;
}
```

- [ ] **Step 2: Escribir los tests de db.js (votación)**

Create `worker/tests/db.test.js`:
```js
// worker/tests/db.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearD1Falsa } from './helpers/fake-d1.js';
import {
  listarOpcionesVotables, recuentoVotos, votoDeVotante, opcionPorId, votosConMismaIp,
  registrarVoto, crearPropuestaConVoto, listarPropuestasPendientes, aprobarPropuesta, rechazarPropuesta,
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

test('rechazarPropuesta la marca rechazada y borra el voto en espera', async () => {
  const DB = crearD1Falsa(SEMILLA);
  await crearPropuestaConVoto({ DB }, { opcionId: 'oporto', etiquetaJson: '{"es":"Oporto"}', email: null, nota: null, votante: 'u9', ipHash: 'h9', ahora: 5 });
  await rechazarPropuesta({ DB }, 'oporto');
  assert.equal(await votoDeVotante({ DB }, 'u9'), null);
  const pend = await listarPropuestasPendientes({ DB });
  assert.deepEqual(pend, []);
});

test('listarPropuestasPendientes devuelve las pendientes con sus metadatos', async () => {
  const DB = crearD1Falsa(SEMILLA);
  await crearPropuestaConVoto({ DB }, { opcionId: 'oporto', etiquetaJson: '{"es":"Oporto"}', email: 'a@b.com', nota: 'n', votante: 'u9', ipHash: 'h9', ahora: 5 });
  const pend = await listarPropuestasPendientes({ DB });
  assert.equal(pend.length, 1);
  assert.equal(pend[0].id, 'oporto');
  assert.equal(pend[0].propuesta_email, 'a@b.com');
});
```

- [ ] **Step 3: Ejecutar los tests y verlos fallar**

Run: `node --test worker/tests/db.test.js`
Expected: FAIL — `Cannot find module '../src/db.js'`.

- [ ] **Step 4: Escribir `worker/src/db.js` (parte votación)**

Create `worker/src/db.js`:
```js
// worker/src/db.js
//
// El ÚNICO archivo del Worker que contiene SQL. Los handlers lo reciben como
// dependencia inyectable ({ db }) para poder probarse con un doble en memoria
// (worker/tests/helpers/fake-d1.js).
//
// Cada consulta empieza con un comentario `/* tag:NOMBRE */`. El doble de
// tests conmuta sobre esa etiqueta en vez de interpretar SQL: si añades o
// cambias una consulta, actualiza también fake-d1.js.

/** Opciones que se pueden ver y votar (oficiales + propuestas aprobadas). */
export async function listarOpcionesVotables({ DB }) {
  const { results } = await DB.prepare(
    `/* tag:opciones_votables */
     SELECT id, etiqueta FROM voto_opciones
     WHERE estado IN ('oficial','aprobada')`,
  ).all();
  return results;
}

/** { opcionId: nVotos } contando solo votos activos. */
export async function recuentoVotos({ DB }) {
  const { results } = await DB.prepare(
    `/* tag:recuento_votos */
     SELECT opcion_id, COUNT(*) AS votos FROM votos
     WHERE estado = 'activo' GROUP BY opcion_id`,
  ).all();
  const out = {};
  for (const fila of results) out[fila.opcion_id] = Number(fila.votos);
  return out;
}

/** El voto de este votante (activo o en_espera), o null. */
export async function votoDeVotante({ DB }, votante) {
  return DB.prepare(
    `/* tag:voto_de_votante */
     SELECT opcion_id, estado FROM votos WHERE votante = ?`,
  ).bind(votante).first();
}

export async function opcionPorId({ DB }, id) {
  return DB.prepare(
    `/* tag:opcion_por_id */
     SELECT id, estado FROM voto_opciones WHERE id = ?`,
  ).bind(id).first();
}

/** Nº de votos activos ya emitidos desde este hash de IP. */
export async function votosConMismaIp({ DB }, ipHash) {
  const fila = await DB.prepare(
    `/* tag:contar_por_ip */
     SELECT COUNT(*) AS n FROM votos WHERE ip_hash = ? AND estado = 'activo'`,
  ).bind(ipHash).first();
  return Number(fila?.n || 0);
}

export async function registrarVoto({ DB }, { opcionId, votante, ipHash, ahora }) {
  await DB.prepare(
    `/* tag:insertar_voto */
     INSERT INTO votos (opcion_id, votante, ip_hash, estado, creado_en)
     VALUES (?, ?, ?, ?, ?)`,
  ).bind(opcionId, votante, ipHash, 'activo', ahora).run();
}

/** Inserta la opción como `pendiente` y el voto del proponente como `en_espera`. */
export async function crearPropuestaConVoto({ DB }, { opcionId, etiquetaJson, email, nota, votante, ipHash, ahora }) {
  await DB.prepare(
    `/* tag:insertar_opcion */
     INSERT INTO voto_opciones (id, etiqueta, estado, propuesta_email, nota, creada_en)
     VALUES (?, ?, ?, ?, ?, ?)`,
  ).bind(opcionId, etiquetaJson, 'pendiente', email, nota, ahora).run();
  await DB.prepare(
    `/* tag:insertar_voto */
     INSERT INTO votos (opcion_id, votante, ip_hash, estado, creado_en)
     VALUES (?, ?, ?, ?, ?)`,
  ).bind(opcionId, votante, ipHash, 'en_espera', ahora).run();
}

export async function propuestaPendienteDeVotante({ DB }, votante) {
  return DB.prepare(
    `/* tag:propuesta_pendiente_de_votante */
     SELECT opcion_id FROM votos WHERE votante = ? AND estado = 'en_espera'`,
  ).bind(votante).first();
}

export async function listarPropuestasPendientes({ DB }) {
  const { results } = await DB.prepare(
    `/* tag:propuestas_pendientes */
     SELECT id, etiqueta, propuesta_email, nota, creada_en FROM voto_opciones
     WHERE estado = 'pendiente' ORDER BY creada_en ASC`,
  ).all();
  return results;
}

export async function aprobarPropuesta({ DB }, opcionId) {
  await DB.prepare(
    `/* tag:actualizar_estado_opcion */
     UPDATE voto_opciones SET estado = ? WHERE id = ?`,
  ).bind('aprobada', opcionId).run();
  await DB.prepare(
    `/* tag:activar_voto_en_espera */
     UPDATE votos SET estado = 'activo' WHERE opcion_id = ? AND estado = 'en_espera'`,
  ).bind(opcionId).run();
}

export async function rechazarPropuesta({ DB }, opcionId) {
  await DB.prepare(
    `/* tag:actualizar_estado_opcion */
     UPDATE voto_opciones SET estado = ? WHERE id = ?`,
  ).bind('rechazada', opcionId).run();
  await DB.prepare(
    `/* tag:borrar_voto_en_espera */
     DELETE FROM votos WHERE opcion_id = ? AND estado = 'en_espera'`,
  ).bind(opcionId).run();
}
```

- [ ] **Step 5: Ejecutar los tests y verlos pasar**

Run: `node --test worker/tests/db.test.js`
Expected: PASS — 8 tests.

- [ ] **Step 6: Commit**

```bash
git add worker/src/db.js worker/tests/db.test.js worker/tests/helpers/fake-d1.js
git commit -m "$(printf 'D1: worker/src/db.js — capa de acceso para votacion\n\nFunciones con nombre sobre env.DB; doble en memoria en tests para\nprobar sin wrangler.\n\nCo-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>')"
```

---

### Task A3: `worker/src/hash.js` — hash de IP

**Files:**
- Create: `worker/src/hash.js`
- Create: `worker/tests/hash.test.js`

- [ ] **Step 1: Escribir el test**

Create `worker/tests/hash.test.js`:
```js
// worker/tests/hash.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hashIp } from '../src/hash.js';

test('hashIp devuelve 64 hex y es determinista para misma ip+sal', async () => {
  const a = await hashIp('203.0.113.7', 'sal-de-prueba');
  const b = await hashIp('203.0.113.7', 'sal-de-prueba');
  assert.match(a, /^[0-9a-f]{64}$/);
  assert.equal(a, b);
});

test('hashIp cambia con la sal y con la ip', async () => {
  const base = await hashIp('203.0.113.7', 'sal-1');
  assert.notEqual(base, await hashIp('203.0.113.7', 'sal-2'));
  assert.notEqual(base, await hashIp('203.0.113.8', 'sal-1'));
});

test('hashIp con ip vacía o desconocida no lanza', async () => {
  assert.match(await hashIp('', 'sal'), /^[0-9a-f]{64}$/);
});
```

- [ ] **Step 2: Ejecutar y ver fallar**

Run: `node --test worker/tests/hash.test.js`
Expected: FAIL — módulo no encontrado.

- [ ] **Step 3: Implementar**

Create `worker/src/hash.js`:
```js
// worker/src/hash.js
//
// Hash de la IP del votante para deduplicar sin guardar la IP en claro.
// Web Crypto: disponible en el runtime de Workers y en Node >= 19.

export async function hashIp(ip, sal) {
  const datos = new TextEncoder().encode(`${sal}:${ip || ''}`);
  const buffer = await crypto.subtle.digest('SHA-256', datos);
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
```

- [ ] **Step 4: Ejecutar y ver pasar**

Run: `node --test worker/tests/hash.test.js`
Expected: PASS — 3 tests.

- [ ] **Step 5: Commit**

```bash
git add worker/src/hash.js worker/tests/hash.test.js
git commit -m "$(printf 'Worker: hashIp — hash SHA-256 de IP+sal para deduplicar votos\n\nCo-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>')"
```

---

### Task A4: Follow-ups de la revisión de calidad de la Fase A

La revisión de calidad de la Fase A pidió, antes de que los handlers dependan
de `db.js`: (1) `CHECK` en las columnas enum; (2) mutaciones compuestas
atómicas con `env.DB.batch()`; (3) un smoke test con SQL real; (4)
`rechazarPropuesta` que no deje votos huérfanos; (5) `hashIp` que falle si
falta la sal. La migración `0001` **nunca se ha aplicado en remoto**, así que
se puede editar y recrear la D1 local.

**Files:**
- Modify: `worker/migrations/0001_votacion_devoluciones.sql`
- Modify: `worker/src/db.js`, `worker/src/hash.js`
- Modify: `worker/tests/helpers/fake-d1.js`, `worker/tests/hash.test.js`, `worker/tests/db.test.js`
- Create: `worker/tests/db-sqlite.test.js`
- Modify: `worker/package.json` (script `test:sqlite` si hace falta el flag)

- [ ] **Step 1: `CHECK` y comentarios en `0001`**

En `worker/migrations/0001_votacion_devoluciones.sql`:
- `voto_opciones.estado` → `TEXT NOT NULL CHECK (estado IN ('oficial','aprobada','pendiente','rechazada'))`
- `voto_opciones.creada_en` → añadir `-- epoch ms` al comentario
- `votos.estado` → `TEXT NOT NULL CHECK (estado IN ('activo','en_espera'))`
- `votos.creado_en` → `-- epoch ms`
- `devoluciones.valoracion` → `INTEGER NOT NULL CHECK (valoracion BETWEEN 1 AND 5)`
- `devoluciones.categoria` → `TEXT NOT NULL CHECK (categoria IN ('enigmas','dificultad','recorrido','error','precio','otro'))`
- `devoluciones.creado_en` → `-- epoch ms`

- [ ] **Step 2: `db.js` — `batch()` en las mutaciones compuestas**

Reescribir estas tres funciones para usar `DB.batch([...])` (una sola
transacción implícita en D1). `rechazarPropuesta` borra **todos** los votos
de la opción, no solo los `en_espera`, para no dejar un voto `activo`
huérfano si la opción se aprobó y luego se rechaza:

```js
export async function crearPropuestaConVoto({ DB }, { opcionId, etiquetaJson, email, nota, votante, ipHash, ahora }) {
  await DB.batch([
    DB.prepare(
      `/* tag:insertar_opcion */
       INSERT INTO voto_opciones (id, etiqueta, estado, propuesta_email, nota, creada_en)
       VALUES (?, ?, ?, ?, ?, ?)`,
    ).bind(opcionId, etiquetaJson, 'pendiente', email, nota, ahora),
    DB.prepare(
      `/* tag:insertar_voto */
       INSERT INTO votos (opcion_id, votante, ip_hash, estado, creado_en)
       VALUES (?, ?, ?, ?, ?)`,
    ).bind(opcionId, votante, ipHash, 'en_espera', ahora),
  ]);
}

export async function aprobarPropuesta({ DB }, opcionId) {
  await DB.batch([
    DB.prepare(
      `/* tag:actualizar_estado_opcion */
       UPDATE voto_opciones SET estado = ? WHERE id = ?`,
    ).bind('aprobada', opcionId),
    DB.prepare(
      `/* tag:activar_voto_en_espera */
       UPDATE votos SET estado = 'activo' WHERE opcion_id = ? AND estado = 'en_espera'`,
    ).bind(opcionId),
  ]);
}

export async function rechazarPropuesta({ DB }, opcionId) {
  await DB.batch([
    DB.prepare(
      `/* tag:actualizar_estado_opcion */
       UPDATE voto_opciones SET estado = ? WHERE id = ?`,
    ).bind('rechazada', opcionId),
    DB.prepare(
      `/* tag:borrar_votos_de_opcion */
       DELETE FROM votos WHERE opcion_id = ?`,
    ).bind(opcionId),
  ]);
}
```

(La etiqueta `borrar_voto_en_espera` pasa a `borrar_votos_de_opcion`.)

- [ ] **Step 3: `fake-d1.js` — soportar `batch()` y la etiqueta nueva**

En `crearD1Falsa`, añadir al objeto `DB`:
```js
    async batch(stmts) {
      const salida = [];
      for (const s of stmts) salida.push(await s.run());
      return salida;
    },
```
Y en `ejecutar`, renombrar el `case 'borrar_voto_en_espera'` a
`case 'borrar_votos_de_opcion'` cambiando el filtro a
`tablas.votos = tablas.votos.filter((v) => v.opcion_id !== args[0]);`.
(El `case 'activar_voto_en_espera'` y `'insertar_opcion'`/`'insertar_voto'`
no cambian: `batch` los invoca vía `s.run()`.)

- [ ] **Step 4: `hashIp` — exigir sal**

En `worker/src/hash.js`:
```js
export async function hashIp(ip, sal) {
  if (!sal) throw new Error('hashIp requiere una sal (env.IP_SALT)');
  const datos = new TextEncoder().encode(`${sal}:${ip || ''}`);
  const buffer = await crypto.subtle.digest('SHA-256', datos);
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
```
Añadir a `worker/tests/hash.test.js`:
```js
test('hashIp lanza si falta la sal', async () => {
  await assert.rejects(() => hashIp('1.2.3.4', ''));
  await assert.rejects(() => hashIp('1.2.3.4', undefined));
});
```

- [ ] **Step 5: Smoke test con SQL real (`worker/tests/db-sqlite.test.js`)**

Corre la migración `0001` real en una BD `node:sqlite` en memoria y ejecuta
las funciones reales de `db.js` a través de un adaptador que expone la misma
API que D1 (`prepare().bind().first()/all()/run()` + `batch()`). Si
`node:sqlite` no está disponible en el runtime, el test se **salta** (no
rompe la suite).

```js
// worker/tests/db-sqlite.test.js
//
// Comprobación de que las consultas de db.js son SQL válido contra el
// esquema real de la migración (no solo contra el doble de fake-d1.js).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import * as db from '../src/db.js';

let DatabaseSync;
try { ({ DatabaseSync } = await import('node:sqlite')); } catch { /* runtime sin node:sqlite */ }

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const SQL = readFileSync(path.join(AQUI, '../migrations/0001_votacion_devoluciones.sql'), 'utf8');

/** Adaptador node:sqlite → API de D1 usada por db.js. */
function d1(sdb) {
  const mk = (sql) => {
    let params = [];
    const s = {
      bind(...p) { params = p; return s; },
      async first(col) {
        const row = sdb.prepare(sql).get(...params) ?? null;
        return col && row ? row[col] : row;
      },
      async all() { return { results: sdb.prepare(sql).all(...params), success: true }; },
      async run() {
        const r = sdb.prepare(sql).run(...params);
        return { success: true, meta: { changes: r.changes, last_row_id: Number(r.lastInsertRowid) } };
      },
    };
    return s;
  };
  return {
    prepare: mk,
    async batch(stmts) {
      sdb.exec('BEGIN');
      try {
        const out = [];
        for (const st of stmts) out.push(await st.run());
        sdb.exec('COMMIT');
        return out;
      } catch (e) { sdb.exec('ROLLBACK'); throw e; }
    },
  };
}

function nuevaDB() {
  const sdb = new DatabaseSync(':memory:');
  sdb.exec(SQL);
  return { DB: d1(sdb) };
}

test('la migración 0001 crea el esquema y siembra 6 opciones oficiales', { skip: !DatabaseSync }, () => {
  const env = nuevaDB();
  // acceso directo para contar
  const sdb = new DatabaseSync(':memory:');
  sdb.exec(SQL);
  assert.equal(sdb.prepare("SELECT COUNT(*) AS n FROM voto_opciones WHERE estado='oficial'").get().n, 6);
});

test('flujo completo contra SQL real: proponer → aprobar → contar', { skip: !DatabaseSync }, async () => {
  const env = nuevaDB();
  await db.crearPropuestaConVoto(env, { opcionId: 'oporto', etiquetaJson: '{"es":"Oporto"}', email: 'a@b.com', nota: 'n', votante: 'u1', ipHash: 'h1', ahora: 10 });
  assert.equal((await db.listarOpcionesVotables(env)).some((o) => o.id === 'oporto'), false);
  await db.aprobarPropuesta(env, 'oporto');
  assert.equal((await db.listarOpcionesVotables(env)).some((o) => o.id === 'oporto'), true);
  assert.deepEqual(await db.recuentoVotos(env), { oporto: 1 });
});

test('flujo contra SQL real: proponer → rechazar borra la opción y sus votos', { skip: !DatabaseSync }, async () => {
  const env = nuevaDB();
  await db.crearPropuestaConVoto(env, { opcionId: 'lyon', etiquetaJson: '{"es":"Lyon"}', email: null, nota: null, votante: 'u2', ipHash: 'h2', ahora: 11 });
  await db.rechazarPropuesta(env, 'lyon');
  assert.equal(await db.votoDeVotante(env, 'u2'), null);
  assert.deepEqual(await db.listarPropuestasPendientes(env), []);
});

test('registrarVoto respeta UNIQUE(votante) del esquema real', { skip: !DatabaseSync }, async () => {
  const env = nuevaDB();
  await db.registrarVoto(env, { opcionId: 'praga', votante: 'u3', ipHash: 'h', ahora: 1 });
  await assert.rejects(() => db.registrarVoto(env, { opcionId: 'viena', votante: 'u3', ipHash: 'h', ahora: 2 }));
});

test('guardarDevolucion respeta los CHECK de valoración y categoría', { skip: !DatabaseSync }, async () => {
  const env = nuevaDB();
  await assert.rejects(() => db.guardarDevolucion(env, { rutaId: 'r', orderId: 'o', idioma: 'es', valoracion: 9, categoria: 'enigmas', texto: 'x', email: null, ahora: 1 }));
  await assert.rejects(() => db.guardarDevolucion(env, { rutaId: 'r', orderId: 'o', idioma: 'es', valoracion: 3, categoria: 'inventada', texto: 'x', email: null, ahora: 1 }));
});
```

Nota: la última prueba (`guardarDevolucion`) depende de que exista esa
función — se añade en Task D1. Si ejecutas A4 antes que D1, **omite ese
único `test`** y añádelo al hacer D1.

- [ ] **Step 6: Verificar `node:sqlite` y ejecutar**

Run: `node -e "require('node:sqlite')"` (desde `worker/`).
- Si no da error: `node --test` (raíz) corre el smoke test como uno más.
- Si pide `--experimental-sqlite`: añade a `worker/package.json` un script
  `"test:sqlite": "node --experimental-sqlite --test worker/tests/db-sqlite.test.js"`,
  y deja el `import('node:sqlite')` en try/catch para que `node --test`
  normal lo salte sin ruido.

- [ ] **Step 7: Recrear la D1 local y aplicar la migración editada**

```bash
cd worker
rm -rf .wrangler/state/v3/d1
npx wrangler d1 migrations apply vestigia-db --local
npx wrangler d1 execute vestigia-db --local --command "SELECT count(*) AS n FROM voto_opciones"
```
Expected: aplica `0001` (ya con los `CHECK`); `n = 6`.

- [ ] **Step 8: Suite completa + commit**

Run: `node --test` (raíz) → PASS. Si añadiste `test:sqlite`, córrelo también.

```bash
git add worker/migrations/0001_votacion_devoluciones.sql worker/src/db.js worker/src/hash.js worker/tests/
git commit -m "$(printf 'D1: CHECK en el esquema, mutaciones atomicas con batch(), smoke test SQL real\n\nFollow-ups de la revision de calidad de la Fase A.\n\nCo-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>')"
```

---

## FASE B — API de votación

> **IMPORTANTE — leer "Infraestructura de seguridad YA presente en `master`"
> antes de esta fase.** El código de ejemplo de B1–B6 se escribió contra un
> `index.js` anterior. Al implementar, aplica estos deltas sobre los ejemplos:
>
> | Ejemplo del plan | Forma real |
> |---|---|
> | `handleX(request, env, cors, db = dbPorDefecto)` (POST) | `handleX(request, env, cors, ip, db = dbPorDefecto)` |
> | `const { ... } = await request.json();` | `const leido = await leerJsonAcotado(request); if (leido.error) return jsonRes({ error: leido.error }, cors, leido.status); const { ... } = leido.datos || {};` (import de `./entrada.js`) |
> | `ipDe(request)` helper local | usar el parámetro `ip` (ya es `CF-Connecting-IP`); borrar `ipDe` |
> | (voto) sin throttle | `consumirCupo(env.KV, { ip, accion: 'voto', limite: 20, ventanaSegundos: 900 })` → 429 con `Retry-After` si `!permitido` |
> | (propuesta) sin throttle | `consumirCupo(env.KV, { ip, accion: 'propuesta', limite: 3, ventanaSegundos: 900 })` |
> | `handleObtenerVotacion(req, env, cors, db)` (GET) | **sin cambios** (los GET no llevan `ip` ni throttle) |
> | tests: `handleX(req(...), { DB }, CORS, dbReal)` | añadir el `ip` posicional: `handleX(req(...), { DB, IP_SALT:'sal' }, CORS, '1.1.1.1', dbReal)` |
>
> `consumirCupo` falla en abierto: los tests que no pasan `env.KV` lo
> ignoran, así que solo los tests de 429 por throttle necesitan un KV falso.

### Task B1: `handleObtenerVotacion` — leer estado (oculta recuentos antes de votar)

**Files:**
- Create: `worker/src/votacion.js`
- Create: `worker/tests/votacion.test.js`

- [ ] **Step 1: Escribir el test**

Create `worker/tests/votacion.test.js`:
```js
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
```

- [ ] **Step 2: Ejecutar y ver fallar**

Run: `node --test worker/tests/votacion.test.js`
Expected: FAIL — `../src/votacion.js` no existe.

- [ ] **Step 3: Implementar `handleObtenerVotacion`**

Create `worker/src/votacion.js`:
```js
// worker/src/votacion.js
//
// Handlers de la votación de próxima ciudad. Reciben `db` (el módulo
// worker/src/db.js) como último argumento para poder inyectar un doble en
// los tests — mismo patrón que sendEmail(fetchFn) en resend.js.
import * as dbPorDefecto from './db.js';
import { hashIp } from './hash.js';

const RE_ID = /^[a-z0-9-]{1,40}$/;

function jsonRes(cuerpo, cors, status = 200) {
  return Response.json(cuerpo, { status, headers: cors });
}

/** Estado del votante a partir de su fila en `votos`. */
function estadoDesdeVoto(voto) {
  if (!voto) return 'sin_voto';
  return voto.estado === 'en_espera' ? 'propuesta_pendiente' : 'voto_activo';
}

export async function handleObtenerVotacion(request, env, cors, db = dbPorDefecto) {
  const url = new URL(request.url);
  const votante = url.searchParams.get('votante');
  if (!votante || !RE_ID.test(votante.replace(/-/g, ''))) {
    return jsonRes({ error: 'Falta el identificador de votante' }, cors, 400);
  }

  const [opciones, voto] = await Promise.all([
    db.listarOpcionesVotables(env),
    db.votoDeVotante(env, votante),
  ]);
  const estadoVotante = estadoDesdeVoto(voto);
  const miVoto = voto && voto.estado === 'activo' ? voto.opcion_id : null;

  const salida = opciones.map((o) => ({ id: o.id, etiqueta: parseEtiqueta(o.etiqueta) }));
  if (estadoVotante === 'voto_activo') {
    const rec = await db.recuentoVotos(env);
    for (const o of salida) o.votos = rec[o.id] || 0;
  }
  return jsonRes({ opciones: salida, estadoVotante, miVoto }, cors);
}

/** La etiqueta se guarda como JSON `{es,en,...}`; si viene mal formada, se
 *  devuelve como `{es: <texto>}` para no romper la página. */
export function parseEtiqueta(raw) {
  try {
    const o = JSON.parse(raw);
    return o && typeof o === 'object' ? o : { es: String(raw) };
  } catch {
    return { es: String(raw) };
  }
}
```

Nota: `db.listarOpcionesVotables` etc. reciben `env` (que trae `env.DB`); en los tests se pasa `{ DB }` como `env`.

- [ ] **Step 4: Ejecutar y ver pasar**

Run: `node --test worker/tests/votacion.test.js`
Expected: PASS — 4 tests.

- [ ] **Step 5: Commit**

```bash
git add worker/src/votacion.js worker/tests/votacion.test.js
git commit -m "$(printf 'Votacion: handleObtenerVotacion — recuentos solo tras votar\n\nCo-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>')"
```

---

### Task B2: `handleEmitirVoto` — un voto por votante + guard de IP

**Files:**
- Modify: `worker/src/votacion.js`
- Modify: `worker/tests/votacion.test.js`

- [ ] **Step 1: Añadir tests**

Añadir a `worker/tests/votacion.test.js` (importar `handleEmitirVoto` en la línea de import de `../src/votacion.js`):
```js
import { handleObtenerVotacion, handleEmitirVoto } from '../src/votacion.js';

const ENV = (DB) => ({ DB, IP_SALT: 'sal' });

test('POST voto válido: registra y devuelve recuentos', async () => {
  const DB = crearD1Falsa(SEMILLA);
  const res = await handleEmitirVoto(
    req('/api/votacion/voto', { body: { opcionId: 'praga', votante: 'u1' }, headers: { 'cf-connecting-ip': '1.1.1.1' } }),
    ENV(DB), CORS, dbReal,
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
    req('/api/votacion/voto', { body: { opcionId: 'viena', votante: 'u1' }, headers: { 'cf-connecting-ip': '1.1.1.1' } }),
    ENV(DB), CORS, dbReal,
  );
  assert.equal(res.status, 409);
});

test('POST voto: opción inexistente o no votable → 400', async () => {
  const DB = crearD1Falsa(SEMILLA);
  const res = await handleEmitirVoto(
    req('/api/votacion/voto', { body: { opcionId: 'no-existe', votante: 'u1' }, headers: { 'cf-connecting-ip': '1.1.1.1' } }),
    ENV(DB), CORS, dbReal,
  );
  assert.equal(res.status, 400);
});

test('POST voto: 4º voto desde la misma IP → 429', async () => {
  const DB = crearD1Falsa(SEMILLA);
  for (const u of ['a', 'b', 'c']) {
    await dbReal.registrarVoto({ DB }, { opcionId: 'praga', votante: u, ipHash: await (await import('../src/hash.js')).hashIp('9.9.9.9', 'sal'), ahora: 1 });
  }
  const res = await handleEmitirVoto(
    req('/api/votacion/voto', { body: { opcionId: 'viena', votante: 'nuevo' }, headers: { 'cf-connecting-ip': '9.9.9.9' } }),
    ENV(DB), CORS, dbReal,
  );
  assert.equal(res.status, 429);
});
```

- [ ] **Step 2: Ejecutar y ver fallar**

Run: `node --test worker/tests/votacion.test.js`
Expected: FAIL — `handleEmitirVoto` no exportado.

- [ ] **Step 3: Implementar**

Añadir a `worker/src/votacion.js`:
```js
const MAX_VOTOS_POR_IP = 3;

function ipDe(request) {
  return request.headers.get('CF-Connecting-IP') || request.headers.get('x-forwarded-for') || '';
}

export async function handleEmitirVoto(request, env, cors, db = dbPorDefecto) {
  const { opcionId, votante } = await request.json();
  if (!opcionId || !RE_ID.test(opcionId) || !votante) {
    return jsonRes({ error: 'Datos de voto incompletos' }, cors, 400);
  }

  const yaVoto = await db.votoDeVotante(env, votante);
  if (yaVoto) return jsonRes({ error: 'Ya has votado' }, cors, 409);

  const opcion = await db.opcionPorId(env, opcionId);
  if (!opcion || (opcion.estado !== 'oficial' && opcion.estado !== 'aprobada')) {
    return jsonRes({ error: 'Esa opción no se puede votar' }, cors, 400);
  }

  const ipHash = await hashIp(ipDe(request), env.IP_SALT);
  if ((await db.votosConMismaIp(env, ipHash)) >= MAX_VOTOS_POR_IP) {
    return jsonRes({ error: 'Demasiados votos desde esta red' }, cors, 429);
  }

  await db.registrarVoto(env, { opcionId, votante, ipHash, ahora: Date.now() });

  const [opciones, rec] = await Promise.all([db.listarOpcionesVotables(env), db.recuentoVotos(env)]);
  const salida = opciones.map((o) => ({ id: o.id, etiqueta: parseEtiqueta(o.etiqueta), votos: rec[o.id] || 0 }));
  return jsonRes({ ok: true, opciones: salida, miVoto: opcionId }, cors);
}
```

- [ ] **Step 4: Ejecutar y ver pasar**

Run: `node --test worker/tests/votacion.test.js`
Expected: PASS — 8 tests.

- [ ] **Step 5: Commit**

```bash
git add worker/src/votacion.js worker/tests/votacion.test.js
git commit -m "$(printf 'Votacion: handleEmitirVoto — dedup por votante y guard de IP\n\nCo-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>')"
```

---

### Task B3: `handleEnviarPropuesta` — cola moderada + email al propietario

**Files:**
- Modify: `worker/src/votacion.js`
- Modify: `worker/tests/votacion.test.js`

- [ ] **Step 1: Añadir tests**

Añadir a `worker/tests/votacion.test.js` (import `handleEnviarPropuesta`; `ENV` pasa a incluir campos de email):
```js
import { handleObtenerVotacion, handleEmitirVoto, handleEnviarPropuesta } from '../src/votacion.js';

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
      headers: { 'cf-connecting-ip': '2.2.2.2' },
    }),
    ENV2(DB, envios), CORS, dbReal,
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
    req('/api/votacion/propuesta', { body: { ciudad: 'Oporto', votante: 'u5' }, headers: { 'cf-connecting-ip': '2.2.2.2' } }),
    ENV2(DB, []), CORS, dbReal,
  );
  assert.equal(res.status, 409);
});

test('POST propuesta: ciudad vacía o demasiado larga → 400', async () => {
  const DB = crearD1Falsa(SEMILLA);
  const res1 = await handleEnviarPropuesta(
    req('/api/votacion/propuesta', { body: { ciudad: '   ', votante: 'u6' }, headers: {} }),
    ENV2(DB, []), CORS, dbReal,
  );
  assert.equal(res1.status, 400);
  const res2 = await handleEnviarPropuesta(
    req('/api/votacion/propuesta', { body: { ciudad: 'x'.repeat(121), votante: 'u6' }, headers: {} }),
    ENV2(DB, []), CORS, dbReal,
  );
  assert.equal(res2.status, 400);
});
```

- [ ] **Step 2: Ejecutar y ver fallar**

Run: `node --test worker/tests/votacion.test.js`
Expected: FAIL — `handleEnviarPropuesta` no exportado.

- [ ] **Step 3: Implementar**

Añadir a `worker/src/votacion.js` (import de resend arriba del archivo):
```js
import { buildPropuestaEmail, sendEmail } from './resend.js';
```
```js
const MAX_CIUDAD = 120;
const MAX_NOTA = 500;

/** slug estable a partir del texto de la ciudad, con sufijo aleatorio para
 *  no colisionar si dos personas proponen lo mismo escrito distinto. */
function slugPropuesta(ciudad) {
  const base = ciudad.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 24) || 'propuesta';
  return `${base}-${crypto.randomUUID().slice(0, 6)}`;
}

export async function handleEnviarPropuesta(request, env, cors, db = dbPorDefecto) {
  const { ciudad, nota, email, votante } = await request.json();
  if (!votante) return jsonRes({ error: 'Falta el identificador de votante' }, cors, 400);

  const ciudadLimpia = typeof ciudad === 'string' ? ciudad.trim() : '';
  if (!ciudadLimpia || ciudadLimpia.length > MAX_CIUDAD) {
    return jsonRes({ error: 'Escribe el nombre de la ciudad (máx. 120 caracteres)' }, cors, 400);
  }
  const notaLimpia = typeof nota === 'string' ? nota.trim().slice(0, MAX_NOTA) : null;
  const emailLimpio = typeof email === 'string' && email.trim() ? email.trim().slice(0, 254) : null;

  if (await db.votoDeVotante(env, votante)) {
    return jsonRes({ error: 'Ya has participado' }, cors, 409);
  }

  const opcionId = slugPropuesta(ciudadLimpia);
  const ipHash = await hashIp(ipDe(request), env.IP_SALT);
  await db.crearPropuestaConVoto(env, {
    opcionId,
    etiquetaJson: JSON.stringify({ es: ciudadLimpia }),
    email: emailLimpio,
    nota: notaLimpia,
    votante,
    ipHash,
    ahora: Date.now(),
  });

  const enviar = env._enviar || ((p) => sendEmail(p, env.RESEND_API_KEY));
  await enviar(buildPropuestaEmail({ ciudad: ciudadLimpia, nota: notaLimpia, email: emailLimpio }, env.OWNER_EMAIL, env.SITE_URL));

  return jsonRes({ ok: true }, cors);
}
```

Nota: `env._enviar` es un punto de inyección solo para tests (igual espíritu que `fetchFn` en `sendEmail`). En producción `env._enviar` no existe y se usa `sendEmail`.

- [ ] **Step 4: Ejecutar** — fallará en `buildPropuestaEmail` (no existe aún). Continuar a Task B4 y volver.

Run: `node --test worker/tests/votacion.test.js`
Expected: FAIL — `buildPropuestaEmail` no exportado por resend.js.

- [ ] **Step 5:** (sin commit todavía — depende de B4)

---

### Task B4: `buildPropuestaEmail` en resend.js

**Files:**
- Modify: `worker/src/resend.js`
- Modify: `worker/tests/resend.test.js`

- [ ] **Step 1: Añadir test**

Añadir a `worker/tests/resend.test.js` (import `buildPropuestaEmail`):
```js
test('buildPropuestaEmail va al propietario, incluye ciudad, nota y email, y escapa HTML', () => {
  const email = buildPropuestaEmail(
    { ciudad: 'Oporto <b>', nota: 'la Ribeira', email: 'fan@ejemplo.com' },
    'owner@example.com',
    'https://vestigia.fun',
  );
  assert.deepEqual(email.to, ['owner@example.com']);
  assert.match(email.subject, /propuesta/i);
  assert.match(email.html, /Oporto &lt;b&gt;/);
  assert.match(email.html, /la Ribeira/);
  assert.match(email.html, /fan@ejemplo\.com/);
  assert.match(email.html, /\/admin\/votos\.html/);
});

test('buildPropuestaEmail funciona sin nota ni email', () => {
  const email = buildPropuestaEmail({ ciudad: 'Oporto', nota: null, email: null }, 'owner@example.com', 'https://vestigia.fun');
  assert.match(email.html, /Oporto/);
  assert.ok(!email.html.includes('null'));
});
```

- [ ] **Step 2: Ejecutar y ver fallar**

Run: `node --test worker/tests/resend.test.js`
Expected: FAIL — `buildPropuestaEmail` no exportado.

- [ ] **Step 3: Implementar**

Añadir a `worker/src/resend.js` (usa `escapeHtml`, `FROM_ADDRESS` ya presentes):
```js
export function buildPropuestaEmail({ ciudad, nota, email }, ownerEmail, siteUrl) {
  return {
    from: FROM_ADDRESS,
    to: [ownerEmail],
    subject: `Nueva propuesta de ciudad: ${ciudad}`,
    html: `
      <h2>Nueva propuesta de ciudad</h2>
      <ul>
        <li>Ciudad / barrio: <strong>${escapeHtml(ciudad)}</strong></li>
        <li>Nota: ${nota ? escapeHtml(nota) : '(sin nota)'}</li>
        <li>Email de quien propone: ${email ? escapeHtml(email) : '(no proporcionado)'}</li>
      </ul>
      <p>Modérala (aprobar / rechazar) en <a href="${escapeHtml(siteUrl)}/admin/votos.html">${escapeHtml(siteUrl)}/admin/votos.html</a></p>
    `,
  };
}
```

- [ ] **Step 4: Ejecutar y ver pasar (resend + votacion)**

Run: `node --test worker/tests/resend.test.js worker/tests/votacion.test.js`
Expected: PASS — resend con los 2 tests nuevos; votacion con 11 tests.

- [ ] **Step 5: Commit (B3 + B4 juntos)**

```bash
git add worker/src/votacion.js worker/src/resend.js worker/tests/votacion.test.js worker/tests/resend.test.js
git commit -m "$(printf 'Votacion: handleEnviarPropuesta + email de propuesta al propietario\n\nCola moderada: la propuesta entra como opcion pendiente + voto en\nespera; se avisa por Resend con enlace al panel de moderacion.\n\nCo-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>')"
```

---

### Task B3b: Guard por IP en las propuestas (vector de email-bombing)

**Files:**
- Modify: `worker/src/db.js`
- Modify: `worker/src/votacion.js`
- Modify: `worker/tests/helpers/fake-d1.js`
- Modify: `worker/tests/db.test.js`, `worker/tests/votacion.test.js`

> El endurecimiento de seguridad **ya está en `master`**, así que
> `handleEnviarPropuesta` (Task B3) ya lleva `consumirCupo` con
> `accion: 'propuesta'`, `limite: 3`. **Esta task sigue siendo útil**: el
> guard en D1 impide que se acumulen varias propuestas *pendientes* de la
> misma IP aunque el throttle de KV se reinicie o falle en abierto. Se
> mantiene, tal cual. El check en `handleEnviarPropuesta` va **después** de
> `consumirCupo` y del guard por `votante`, usando el `ipHash` que ya se
> calcula en ese handler.

- [ ] **Step 1: Test de `db.js`**

Añadir a `worker/tests/db.test.js` (import `propuestasPendientesDeIp`):
```js
test('propuestasPendientesDeIp cuenta opciones pendientes cuyo voto en espera es de esa ip', async () => {
  const DB = crearD1Falsa(SEMILLA);
  await crearPropuestaConVoto({ DB }, { opcionId: 'a', etiquetaJson: '{"es":"A"}', email: null, nota: null, votante: 'u1', ipHash: 'ip-x', ahora: 1 });
  assert.equal(await propuestasPendientesDeIp({ DB }, 'ip-x'), 1);
  assert.equal(await propuestasPendientesDeIp({ DB }, 'ip-otra'), 0);
});
```

- [ ] **Step 2: Añadir la etiqueta al fake-d1**

En `worker/tests/helpers/fake-d1.js`, añadir un `case` en `ejecutar`:
```js
      case 'propuestas_pendientes_de_ip':
        return {
          first: {
            n: tablas.votos.filter(
              (v) => v.ip_hash === args[0] && v.estado === 'en_espera',
            ).length,
          },
        };
```

- [ ] **Step 3: Ejecutar y ver fallar**

Run: `node --test worker/tests/db.test.js`
Expected: FAIL — `propuestasPendientesDeIp` no exportado.

- [ ] **Step 4: Implementar en `db.js`**

```js
export async function propuestasPendientesDeIp({ DB }, ipHash) {
  const fila = await DB.prepare(
    `/* tag:propuestas_pendientes_de_ip */
     SELECT COUNT(*) AS n FROM votos WHERE ip_hash = ? AND estado = 'en_espera'`,
  ).bind(ipHash).first();
  return Number(fila?.n || 0);
}
```

- [ ] **Step 5: Test del handler**

Añadir a `worker/tests/votacion.test.js`:
```js
test('POST propuesta: 2ª propuesta pendiente desde la misma IP → 429', async () => {
  const DB = crearD1Falsa(SEMILLA);
  const { hashIp } = await import('../src/hash.js');
  const ipHash = await hashIp('7.7.7.7', 'sal');
  await dbReal.crearPropuestaConVoto({ DB }, { opcionId: 'previa', etiquetaJson: '{"es":"Previa"}', email: null, nota: null, votante: 'otro', ipHash, ahora: 1 });
  const res = await handleEnviarPropuesta(
    req('/api/votacion/propuesta', { body: { ciudad: 'Oporto', votante: 'nuevo' }, headers: { 'cf-connecting-ip': '7.7.7.7' } }),
    ENV2(DB, []), CORS, dbReal,
  );
  assert.equal(res.status, 429);
});
```

- [ ] **Step 6: Añadir el guard en `handleEnviarPropuesta`**

En `worker/src/votacion.js`, en `handleEnviarPropuesta`, tras calcular `ipHash` y antes de `db.crearPropuestaConVoto`:
```js
  if ((await db.propuestasPendientesDeIp(env, ipHash)) >= 1) {
    return jsonRes({ error: 'Ya tienes una propuesta en revisión' }, cors, 429);
  }
```
(Mover el cálculo de `const ipHash = await hashIp(...)` por encima de este check si hace falta.)

- [ ] **Step 7: Ejecutar y ver pasar**

Run: `node --test worker/tests/db.test.js worker/tests/votacion.test.js`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add worker/src/db.js worker/src/votacion.js worker/tests/
git commit -m "$(printf 'Votacion: maximo 1 propuesta pendiente por IP (anti email-bombing)\n\nCo-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>')"
```

---

### Task B5: Endpoints de moderación (admin) con `Authorization: Bearer`

**Files:**
- Modify: `worker/src/votacion.js`
- Modify: `worker/tests/votacion.test.js`

- [ ] **Step 1: Añadir tests**

Añadir a `worker/tests/votacion.test.js` (import `handleListarPropuestas`, `handleModerarPropuesta`):
```js
const ADMIN_ENV = (DB) => ({ DB, ADMIN_SECRET: 'secreto-largo' });
const bearer = (t) => ({ authorization: `Bearer ${t}` });

test('admin: sin bearer correcto → 401 en listar y moderar', async () => {
  const DB = crearD1Falsa(SEMILLA);
  const r1 = await handleListarPropuestas(req('/api/admin/propuestas', { headers: bearer('malo') }), ADMIN_ENV(DB), CORS, dbReal);
  assert.equal(r1.status, 401);
  const r2 = await handleModerarPropuesta(
    req('/api/admin/propuestas/oporto', { body: { accion: 'aprobar' }, headers: bearer('malo') }),
    ADMIN_ENV(DB), CORS, dbReal, 'oporto',
  );
  assert.equal(r2.status, 401);
});

test('admin: listar devuelve las pendientes', async () => {
  const DB = crearD1Falsa(SEMILLA);
  await dbReal.crearPropuestaConVoto({ DB }, { opcionId: 'oporto', etiquetaJson: '{"es":"Oporto"}', email: 'a@b', nota: 'n', votante: 'u', ipHash: 'h', ahora: 3 });
  const res = await handleListarPropuestas(req('/api/admin/propuestas', { headers: bearer('secreto-largo') }), ADMIN_ENV(DB), CORS, dbReal);
  const cuerpo = await res.json();
  assert.equal(cuerpo.propuestas.length, 1);
  assert.equal(cuerpo.propuestas[0].id, 'oporto');
  assert.deepEqual(cuerpo.propuestas[0].etiqueta, { es: 'Oporto' });
});

test('admin: aprobar vuelve la opción votable; rechazar la descarta', async () => {
  const DB = crearD1Falsa(SEMILLA);
  await dbReal.crearPropuestaConVoto({ DB }, { opcionId: 'oporto', etiquetaJson: '{"es":"Oporto"}', email: null, nota: null, votante: 'u', ipHash: 'h', ahora: 3 });
  await handleModerarPropuesta(
    req('/api/admin/propuestas/oporto', { body: { accion: 'aprobar' }, headers: bearer('secreto-largo') }),
    ADMIN_ENV(DB), CORS, dbReal, 'oporto',
  );
  assert.ok((await dbReal.listarOpcionesVotables({ DB })).some((o) => o.id === 'oporto'));

  await dbReal.crearPropuestaConVoto({ DB }, { opcionId: 'lyon', etiquetaJson: '{"es":"Lyon"}', email: null, nota: null, votante: 'u2', ipHash: 'h2', ahora: 4 });
  await handleModerarPropuesta(
    req('/api/admin/propuestas/lyon', { body: { accion: 'rechazar' }, headers: bearer('secreto-largo') }),
    ADMIN_ENV(DB), CORS, dbReal, 'lyon',
  );
  assert.equal(await dbReal.votoDeVotante({ DB }, 'u2'), null);
});

test('admin: acción desconocida → 400', async () => {
  const DB = crearD1Falsa(SEMILLA);
  const res = await handleModerarPropuesta(
    req('/api/admin/propuestas/x', { body: { accion: 'explotar' }, headers: bearer('secreto-largo') }),
    ADMIN_ENV(DB), CORS, dbReal, 'x',
  );
  assert.equal(res.status, 400);
});
```

- [ ] **Step 2: Ejecutar y ver fallar**

Run: `node --test worker/tests/votacion.test.js`
Expected: FAIL — handlers admin no exportados.

- [ ] **Step 3: Implementar**

Añadir a `worker/src/votacion.js`:
```js
/** Comparación en tiempo (casi) constante para el secreto de admin. */
function secretoOk(recibido, esperado) {
  if (typeof recibido !== 'string' || typeof esperado !== 'string' || recibido.length !== esperado.length) return false;
  let dif = 0;
  for (let i = 0; i < recibido.length; i += 1) dif |= recibido.charCodeAt(i) ^ esperado.charCodeAt(i);
  return dif === 0;
}

function autorizadoAdmin(request, env) {
  const cabecera = request.headers.get('Authorization') || '';
  const token = cabecera.startsWith('Bearer ') ? cabecera.slice(7) : '';
  return secretoOk(token, env.ADMIN_SECRET || '');
}

export async function handleListarPropuestas(request, env, cors, db = dbPorDefecto) {
  if (!autorizadoAdmin(request, env)) return jsonRes({ error: 'No autorizado' }, cors, 401);
  const filas = await db.listarPropuestasPendientes(env);
  const propuestas = filas.map((f) => ({
    id: f.id,
    etiqueta: parseEtiqueta(f.etiqueta),
    email: f.propuesta_email,
    nota: f.nota,
    creada_en: f.creada_en,
  }));
  return jsonRes({ propuestas }, cors);
}

export async function handleModerarPropuesta(request, env, cors, db = dbPorDefecto, opcionId) {
  if (!autorizadoAdmin(request, env)) return jsonRes({ error: 'No autorizado' }, cors, 401);
  const { accion } = await request.json();
  if (accion === 'aprobar') {
    await db.aprobarPropuesta(env, opcionId);
  } else if (accion === 'rechazar') {
    await db.rechazarPropuesta(env, opcionId);
  } else {
    return jsonRes({ error: 'Acción no válida' }, cors, 400);
  }
  return jsonRes({ ok: true }, cors);
}
```

- [ ] **Step 4: Ejecutar y ver pasar**

Run: `node --test worker/tests/votacion.test.js`
Expected: PASS — 15 tests.

- [ ] **Step 5: Commit**

```bash
git add worker/src/votacion.js worker/tests/votacion.test.js
git commit -m "$(printf 'Votacion: endpoints admin de moderacion con Authorization Bearer\n\nCo-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>')"
```

---

### Task B6: Enrutar la votación en `index.js` + CORS del header Authorization

**Files:**
- Modify: `worker/src/index.js`
- Modify: `worker/src/cors.js`
- Modify: `worker/tests/index.test.js`
- Modify: `worker/tests/acceso.test.js` (no — solo si aplica; ver paso)

- [ ] **Step 1: Test del router para las rutas nuevas**

Añadir a `worker/tests/index.test.js` (ya usa dobles de request a mano; añade el helper `Request` solo si no existe uno equivalente):
```js
import worker from '../src/index.js';
import { crearD1Falsa } from './helpers/fake-d1.js';

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
  const res = await worker.fetch(peticion('GET', '/api/votacion?votante=u1'), entorno(DB));
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
```

- [ ] **Step 2: Ejecutar y ver fallar**

Run: `node --test worker/tests/index.test.js`
Expected: FAIL — rutas devuelven 404 / header sin Authorization.

- [ ] **Step 3: Actualizar `cors.js`**

En `worker/src/cors.js`, cambiar la línea de `Access-Control-Allow-Headers`:
```js
'Access-Control-Allow-Headers': 'Content-Type, Authorization',
```

- [ ] **Step 4: Enrutar en `index.js`**

En `worker/src/index.js`, junto a los `import` existentes:
```js
import { handleObtenerVotacion, handleEmitirVoto, handleEnviarPropuesta, handleListarPropuestas, handleModerarPropuesta } from './votacion.js';
import { handleEnviarDevolucion } from './devoluciones.js';
```

`fetch` ya calcula `const ip = request.headers.get('CF-Connecting-IP') || '';`.
Dentro del `try { ... }`, tras el `if` de `/api/confirm-payment` y antes del
`catch`, añadir (mismo estilo que los `if` existentes):
```js
      if (request.method === 'GET' && url.pathname === '/api/votacion') {
        return await handleObtenerVotacion(request, env, cors);
      }
      if (request.method === 'POST' && url.pathname === '/api/votacion/voto') {
        return await handleEmitirVoto(request, env, cors, ip);
      }
      if (request.method === 'POST' && url.pathname === '/api/votacion/propuesta') {
        return await handleEnviarPropuesta(request, env, cors, ip);
      }
      if (request.method === 'GET' && url.pathname === '/api/admin/propuestas') {
        return await handleListarPropuestas(request, env, cors);
      }
      const modera = url.pathname.match(/^\/api\/admin\/propuestas\/([a-z0-9-]{1,40})$/);
      if (request.method === 'POST' && modera) {
        return await handleModerarPropuesta(request, env, cors, undefined, modera[1]);
      }
      if (request.method === 'POST' && url.pathname === '/api/devolucion') {
        return await handleEnviarDevolucion(request, url, env, cors, ip);
      }
```

Notas:
- `handleEmitirVoto` / `handleEnviarPropuesta` / `handleEnviarDevolucion`
  reciben `ip` como último argumento posicional antes de `db` (que va por
  defecto). Ver los deltas del recuadro al inicio de la Fase B.
- `handleModerarPropuesta` recibe `db` por defecto cuando se le pasa
  `undefined` como 4º argumento; el `opcionId` va detrás. Los endpoints
  admin NO llevan `ip` ni throttle (van tras el bearer).

- [ ] **Step 5: Crear un stub temporal de devoluciones para no romper el import**

Para que `index.js` importe sin error antes de la Fase D, crear `worker/src/devoluciones.js` mínimo:
```js
// worker/src/devoluciones.js
export async function handleEnviarDevolucion() {
  return new Response('no implementado', { status: 501 });
}
```
(Se completa en Task D1.)

- [ ] **Step 6: Ejecutar y ver pasar**

Run: `node --test worker/tests/index.test.js`
Expected: PASS.

- [ ] **Step 7: Ejecutar toda la batería del worker**

Run: `node --test`  (desde la raíz)
Expected: PASS — todos los tests existentes + los nuevos.

- [ ] **Step 8: Commit**

```bash
git add worker/src/index.js worker/src/cors.js worker/src/devoluciones.js worker/tests/index.test.js
git commit -m "$(printf 'Worker: enrutar votacion y moderacion; CORS admite Authorization\n\nCo-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>')"
```

---

### Task B7: Smoke test manual contra D1 local

**Files:** ninguno (verificación)

- [ ] **Step 1: Arrancar el Worker con D1 local**

Run desde `worker/`:
```bash
printf 'IP_SALT = "sal-local"\nADMIN_SECRET = "admin-local"\n' >> .dev.vars
npm run dev
```
(`.dev.vars` no se commitea. Si ya tiene `TOKEN_SECRET`, solo se añaden las dos líneas nuevas.)

- [ ] **Step 2: Probar el flujo de voto**

En otra terminal:
```bash
curl 'http://127.0.0.1:8787/api/votacion?votante=test-1'
curl -X POST 'http://127.0.0.1:8787/api/votacion/voto' -H 'Content-Type: application/json' -d '{"opcionId":"praga","votante":"test-1"}'
curl 'http://127.0.0.1:8787/api/votacion?votante=test-1'
```
Expected: la 1ª llamada devuelve 6 opciones sin `votos`; la 2ª devuelve `ok:true` con recuentos; la 3ª ya incluye `votos` y `miVoto:"praga"`.

- [ ] **Step 3: Probar propuesta + moderación**

```bash
curl -X POST 'http://127.0.0.1:8787/api/votacion/propuesta' -H 'Content-Type: application/json' -d '{"ciudad":"Oporto","votante":"test-2"}'
curl 'http://127.0.0.1:8787/api/admin/propuestas' -H 'Authorization: Bearer admin-local'
```
Expected: la propuesta se lista como pendiente. (El email fallará en local sin `RESEND_API_KEY` — es esperado; anota que en local la propuesta se crea aunque el email lance.)

Nota: si el `sendEmail` que lanza impide crear la propuesta, envolver la llamada a `enviar(...)` en `handleEnviarPropuesta` con `try/catch` que solo registre `console.error` — la propuesta ya está en D1 y no debe perderse por un fallo de email. **Aplicar ese try/catch ahora** si el smoke test lo revela, con su test correspondiente en `votacion.test.js` (`env._enviar` que lanza → la respuesta sigue siendo `ok:true`).

- [ ] **Step 4: Commit (si se aplicó el try/catch)**

```bash
git add worker/src/votacion.js worker/tests/votacion.test.js
git commit -m "$(printf 'Votacion: un fallo de email no pierde la propuesta ya guardada\n\nCo-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>')"
```

---

## FASE C — Front de votación

### Task C1: Funciones de API en `js/api.js`

**Files:**
- Modify: `js/api.js`

- [ ] **Step 1: Añadir las funciones**

Añadir al final de `js/api.js`:
```js
/** Estado de la votación para un votante. Devuelve
 *  { opciones:[{id,etiqueta,votos?}], estadoVotante, miVoto }. */
export async function obtenerVotacion(votante) {
  const url = new URL('/api/votacion', API_BASE_URL);
  url.searchParams.set('votante', votante);
  const respuesta = await fetch(url);
  const cuerpo = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) throw new Error(cuerpo.error || `Error ${respuesta.status}`);
  return cuerpo;
}

export async function emitirVoto(opcionId, votante) {
  const respuesta = await fetch(new URL('/api/votacion/voto', API_BASE_URL), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ opcionId, votante }),
  });
  const cuerpo = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) throw new Error(cuerpo.error || `Error ${respuesta.status}`);
  return cuerpo;
}

export async function enviarPropuesta({ ciudad, nota, email, votante }) {
  const respuesta = await fetch(new URL('/api/votacion/propuesta', API_BASE_URL), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ciudad, nota, email, votante }),
  });
  const cuerpo = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) throw new Error(cuerpo.error || `Error ${respuesta.status}`);
  return cuerpo;
}

/** Envía una devolución. Requiere el token de acceso de la partida. */
export async function enviarDevolucion(token, { rutaId, valoracion, categoria, texto, email }) {
  const url = new URL('/api/devolucion', API_BASE_URL);
  url.searchParams.set('t', token);
  const respuesta = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rutaId, valoracion, categoria, texto, email }),
  });
  const cuerpo = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) throw new Error(cuerpo.error || `Error ${respuesta.status}`);
  return cuerpo;
}
```

- [ ] **Step 2: Verificar que no rompe la suite**

Run: `node --test`
Expected: PASS (api.js no tiene tests; solo comprobamos que el `import` no rompe otros).

- [ ] **Step 3: Commit**

```bash
git add js/api.js
git commit -m "$(printf 'API cliente: obtenerVotacion, emitirVoto, enviarPropuesta, enviarDevolucion\n\nCo-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>')"
```

---

### Task C2: Claves i18n en español (votación + portada + devolución)

**Files:**
- Modify: `js/i18n.js`

Solo se añade el bloque **es** ahora; EN/FR/IT en Task E1. El test de paridad i18n fallará hasta entonces — se acepta durante esta fase y se arregla en E1. Para no dejar `master` con tests rojos entre commits, **este commit va acompañado de un `test.skip` temporal** (ver Step 3).

- [ ] **Step 1: Añadir claves al diccionario `es` de `js/i18n.js`**

Dentro de `DICT.es`, tras el bloque de "Pantalla de juego", añadir:
```js
    // Enlace a la votación (portada)
    votar_portada_titulo: '¿Qué ciudad preparamos después?',
    votar_portada_texto: 'Vota la próxima ciudad de Vestigia — o propón una que no esté.',
    votar_portada_cta: 'Ir a la votación',

    // Página de votación (/votar)
    votar_titulo: 'Vota la próxima ciudad',
    votar_subtitulo: 'Elige la ciudad que más te gustaría recorrer. Verás los resultados en cuanto votes.',
    votar_btn_votar: 'Votar',
    votar_tu_voto: 'Tu voto',
    votar_resultados_titulo: 'Así va la votación',
    votar_gracias: '¡Gracias por votar!',
    votar_propuesta_titulo: '¿Falta una ciudad?',
    votar_propuesta_texto: 'Propón una ciudad o un barrio concreto. La revisamos y, si entra, tu voto ya cuenta para ella.',
    votar_propuesta_ciudad_label: 'Ciudad o barrio',
    votar_propuesta_ciudad_ph: 'Ej.: Oporto, o «Sevilla — Santa Cruz»',
    votar_propuesta_nota_label: 'Por qué (opcional)',
    votar_propuesta_nota_ph: 'Cuéntanos qué la haría buena para una ruta',
    votar_propuesta_email_label: 'Tu email (opcional)',
    votar_propuesta_email_ph: 'nombre@ejemplo.com',
    votar_propuesta_btn: 'Enviar propuesta',
    votar_propuesta_enviada: 'Propuesta recibida. La revisaremos; tu voto queda reservado para esa ciudad.',
    votar_error_generico: 'No se ha podido completar. Inténtalo de nuevo en un momento.',
    votar_cargando: 'Cargando la votación…',

    // Devolución al terminar la ruta (jugar/index.html)
    devol_titulo: '¿Qué te ha parecido?',
    devol_valoracion_label: 'Tu valoración',
    devol_categoria_label: '¿Sobre qué?',
    devol_cat_enigmas: 'Los enigmas',
    devol_cat_dificultad: 'La dificultad',
    devol_cat_recorrido: 'El recorrido o el mapa',
    devol_cat_error: 'Un error (un dato, una respuesta)',
    devol_cat_precio: 'El precio',
    devol_cat_otro: 'Otra cosa',
    devol_texto_label: 'Cuéntanos',
    devol_texto_ph: 'Qué falló, qué mejorarías, qué te gustó…',
    devol_email_label: 'Tu email (si quieres que te respondamos)',
    devol_email_ph: 'nombre@ejemplo.com',
    devol_btn_enviar: 'Enviar',
    devol_enviando: 'Enviando…',
    devol_gracias: '¡Gracias! Lo leemos todo.',
    devol_error: 'No se ha podido enviar. Inténtalo de nuevo.',
```

- [ ] **Step 2: Skip temporal del test de paridad**

En `tests/i18n.test.js`, cambiar `test('todos los idiomas tienen exactamente las mismas claves...` y `test('los placeholders {var} de cada string coinciden...` a `test.skip(` **con un comentario**:
```js
// TEMPORAL (plan 2026-09-02): claves nuevas de votación/devolución solo en ES
// hasta Task E1. Restaurar a test( en ese commit.
test.skip('todos los idiomas tienen exactamente las mismas claves que el idioma por defecto', () => {
```

- [ ] **Step 3: Ejecutar**

Run: `node --test tests/i18n.test.js`
Expected: PASS (con 2 tests marcados como skipped).

- [ ] **Step 4: Commit**

```bash
git add js/i18n.js tests/i18n.test.js
git commit -m "$(printf 'i18n (es): claves de votacion, devolucion y enlace de portada\n\nParidad EN/FR/IT en Task E1; 2 tests de paridad en skip temporal.\n\nCo-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>')"
```

---

### Task C3: `votar/index.html`

**Files:**
- Create: `votar/index.html`
- Modify: `css/styles.css`

- [ ] **Step 1: Crear la página**

Create `votar/index.html` (mismo esqueleto que `jugar/gracias.html`, cabecera incluida):
```html
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Vota la próxima ciudad — Vestigia</title>
<meta name="description" content="Vota qué ciudad tendrá el próximo recorrido de Vestigia, o propón una nueva.">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='46' fill='%23f4ead0' stroke='%239c2b1f' stroke-width='5'/%3E%3Cpath d='M50 14 L60 45 L50 86 L40 45 Z' fill='%239c2b1f'/%3E%3Cpath d='M14 50 L45 40 L86 50 L45 60 Z' fill='%23241a10' opacity='0.65'/%3E%3C/svg%3E">
<link rel="stylesheet" href="../css/styles.css">
</head>
<body>

<header class="cabecera">
  <div class="contenedor">
    <a class="marca" href="../index.html" aria-label="Vestigia — inicio">
      <svg class="marca__icono" viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" stroke-width="2.5"/>
        <circle cx="50" cy="50" r="3" fill="currentColor"/>
        <path d="M50 10 L58 42 L50 50 L42 42 Z" fill="currentColor"/>
        <path d="M50 90 L58 58 L50 50 L42 58 Z" fill="currentColor" opacity="0.35"/>
        <path d="M10 50 L42 42 L50 50 L42 58 Z" fill="currentColor" opacity="0.35"/>
        <path d="M90 50 L58 58 L50 50 L58 42 Z" fill="currentColor" opacity="0.35"/>
      </svg>
      <span class="marca__texto"><span class="marca__nombre">Vestigia</span></span>
    </a>
  </div>
</header>

<main class="contenedor votar">
  <h1 class="votar__titulo" data-i18n="votar_titulo">Vota la próxima ciudad</h1>
  <p class="votar__subtitulo" data-i18n="votar_subtitulo"></p>

  <section id="votar-cargando" class="votar__cargando">
    <div class="girando" role="status" aria-label="Cargando"></div>
    <p data-i18n="votar_cargando"></p>
  </section>

  <p id="votar-error" class="votar__error" hidden></p>

  <ul id="votar-lista" class="votar-lista" hidden></ul>

  <p id="votar-gracias" class="votar__gracias" data-i18n="votar_gracias" hidden></p>

  <section id="votar-propuesta" class="votar-propuesta" hidden>
    <h2 data-i18n="votar_propuesta_titulo"></h2>
    <p data-i18n="votar_propuesta_texto"></p>
    <form id="form-propuesta" class="votar-propuesta__form">
      <label>
        <span data-i18n="votar_propuesta_ciudad_label"></span>
        <input name="ciudad" type="text" maxlength="120" required
               data-i18n-attr="placeholder:votar_propuesta_ciudad_ph">
      </label>
      <label>
        <span data-i18n="votar_propuesta_nota_label"></span>
        <textarea name="nota" maxlength="500" rows="2"
                  data-i18n-attr="placeholder:votar_propuesta_nota_ph"></textarea>
      </label>
      <label>
        <span data-i18n="votar_propuesta_email_label"></span>
        <input name="email" type="email" maxlength="254"
               data-i18n-attr="placeholder:votar_propuesta_email_ph">
      </label>
      <button type="submit" class="btn btn-lacre" data-i18n="votar_propuesta_btn"></button>
    </form>
  </section>

  <p id="votar-propuesta-ok" class="votar__gracias" data-i18n="votar_propuesta_enviada" hidden></p>
</main>

<script type="module" src="../js/votar.js"></script>
</body>
</html>
```

- [ ] **Step 2: Estilos mínimos**

Añadir al final de `css/styles.css`:
```css
/* Página de votación (/votar) */
.votar { max-width: 640px; padding-block: 2.5rem 4rem; }
.votar__subtitulo { color: var(--tinta-suave, #5b4c36); margin-bottom: 2rem; }
.votar__cargando { display: flex; align-items: center; gap: .75rem; }
.votar__error { color: #9c2b1f; }
.votar-lista { list-style: none; padding: 0; margin: 0 0 2.5rem; display: grid; gap: .6rem; }
.votar-opcion { display: flex; align-items: center; gap: 1rem; padding: .85rem 1rem;
  border: 1px solid #e0d5bd; border-radius: 10px; background: #fffدf; }
.votar-opcion__nombre { font-weight: 600; flex: 1; }
.votar-opcion__barra { position: relative; height: 8px; border-radius: 999px; background: #ece1c8; overflow: hidden; }
.votar-opcion__relleno { position: absolute; inset: 0 auto 0 0; background: #9c2b1f; }
.votar-opcion__votos { font-variant-numeric: tabular-nums; color: #5b4c36; min-width: 3ch; text-align: right; }
.votar-opcion--mio { border-color: #9c2b1f; box-shadow: 0 0 0 1px #9c2b1f inset; }
.votar-propuesta__form { display: grid; gap: 1rem; margin-top: 1rem; }
.votar-propuesta__form label { display: grid; gap: .3rem; font-size: .9rem; }
.votar-propuesta__form input, .votar-propuesta__form textarea {
  font: inherit; padding: .6rem .7rem; border: 1px solid #d8ccb2; border-radius: 8px; }
.votar__gracias { font-weight: 600; color: #2e7d32; }
```
(Ajustar `#fffدf` → `#fffdf7`: escribir el hex correcto `#fffdf7`. El typo está a propósito para que lo corrijas al teclear — usa `#fffdf7`.)

- [ ] **Step 3: Verificar carga (manual)**

Con el sitio estático servido (`npx http-server -p 8743 .`) y el Worker en local, abrir `http://127.0.0.1:8743/votar/`. Se hará en Task C4 cuando exista `js/votar.js`; por ahora solo se comprueba que el HTML valida (sin errores en consola salvo el 404 de `votar.js`).

- [ ] **Step 4: Commit**

```bash
git add votar/index.html css/styles.css
git commit -m "$(printf 'Votacion: pagina /votar (markup y estilos)\n\nCo-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>')"
```

---

### Task C4: `js/votar.js` — máquina de estados

**Files:**
- Create: `js/votar.js`

- [ ] **Step 1: Implementar**

Create `js/votar.js`:
```js
// js/votar.js
// Página de votación (/votar). Idioma en runtime, como jugar/*.
import { obtenerVotacion, emitirVoto, enviarPropuesta } from './api.js';
import { aplicarI18n, detectarIdioma, t, localizarClave } from './i18n.js';
import { localizar } from './catalogo.js';

const CLAVE_VOTANTE = 'vestigia_voto_id';

function idVotante() {
  let id = null;
  try { id = localStorage.getItem(CLAVE_VOTANTE); } catch { /* modo privado */ }
  if (!id) {
    id = (crypto.randomUUID && crypto.randomUUID()) || `v_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    try { localStorage.setItem(CLAVE_VOTANTE, id); } catch { /* no persiste, vale igual para esta sesión */ }
  }
  return id;
}

const els = {};
const app = { lang: 'es', votante: null, estado: null };

function ref() {
  ['votar-cargando', 'votar-error', 'votar-lista', 'votar-gracias', 'votar-propuesta', 'votar-propuesta-ok', 'form-propuesta']
    .forEach((id) => { els[id] = document.getElementById(id); });
}

function mostrarError(msg) {
  els['votar-error'].textContent = msg || t(app.lang, 'votar_error_generico');
  els['votar-error'].hidden = false;
}

function pintarLista({ opciones, estadoVotante, miVoto }) {
  const votado = estadoVotante === 'voto_activo';
  const maxVotos = Math.max(1, ...opciones.map((o) => o.votos || 0));
  els['votar-lista'].innerHTML = opciones.map((o) => {
    const nombre = localizar(o.etiqueta, app.lang);
    if (!votado) {
      return `<li class="votar-opcion">
        <span class="votar-opcion__nombre">${escape(nombre)}</span>
        <button class="btn btn-lacre" data-opcion="${escape(o.id)}" data-i18n="votar_btn_votar"></button>
      </li>`;
    }
    const pct = Math.round(((o.votos || 0) / maxVotos) * 100);
    const mio = o.id === miVoto;
    return `<li class="votar-opcion ${mio ? 'votar-opcion--mio' : ''}">
      <span class="votar-opcion__nombre">${escape(nombre)}${mio ? ` — ${t(app.lang, 'votar_tu_voto')}` : ''}</span>
      <span class="votar-opcion__barra" style="flex-basis:40%"><span class="votar-opcion__relleno" style="width:${pct}%"></span></span>
      <span class="votar-opcion__votos">${o.votos || 0}</span>
    </li>`;
  }).join('');
  els['votar-lista'].hidden = false;
  aplicarI18n(els['votar-lista'], app.lang);

  els['votar-lista'].querySelectorAll('button[data-opcion]').forEach((btn) => {
    btn.addEventListener('click', () => votar(btn.dataset.opcion));
  });
}

function render() {
  const { estadoVotante } = app.estado;
  els['votar-cargando'].hidden = true;
  els['votar-gracias'].hidden = estadoVotante !== 'voto_activo';
  els['votar-propuesta'].hidden = estadoVotante !== 'sin_voto';
  els['votar-propuesta-ok'].hidden = estadoVotante !== 'propuesta_pendiente';
  if (estadoVotante === 'propuesta_pendiente') {
    els['votar-lista'].hidden = true;
  } else {
    pintarLista(app.estado);
  }
}

async function votar(opcionId) {
  els['votar-error'].hidden = true;
  els['votar-lista'].querySelectorAll('button').forEach((b) => { b.disabled = true; });
  try {
    const res = await emitirVoto(opcionId, app.votante);
    app.estado = { opciones: res.opciones, estadoVotante: 'voto_activo', miVoto: res.miVoto };
    render();
  } catch (e) {
    mostrarError(e.message);
    els['votar-lista'].querySelectorAll('button').forEach((b) => { b.disabled = false; });
  }
}

async function enviarFormPropuesta(evento) {
  evento.preventDefault();
  els['votar-error'].hidden = true;
  const datos = new FormData(els['form-propuesta']);
  const boton = els['form-propuesta'].querySelector('button');
  boton.disabled = true;
  try {
    await enviarPropuesta({
      ciudad: (datos.get('ciudad') || '').trim(),
      nota: (datos.get('nota') || '').trim() || null,
      email: (datos.get('email') || '').trim() || null,
      votante: app.votante,
    });
    app.estado = { ...app.estado, estadoVotante: 'propuesta_pendiente' };
    render();
  } catch (e) {
    mostrarError(e.message);
    boton.disabled = false;
  }
}

function escape(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

async function init() {
  ref();
  app.lang = detectarIdioma();
  document.documentElement.lang = app.lang;
  aplicarI18n(document, app.lang);
  app.votante = idVotante();
  els['form-propuesta'].addEventListener('submit', enviarFormPropuesta);
  try {
    app.estado = await obtenerVotacion(app.votante);
    render();
  } catch (e) {
    els['votar-cargando'].hidden = true;
    mostrarError(e.message);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
```

Nota: `localizarClave` no existe en `i18n.js` — **eliminar ese import**; `js/votar.js` usa solo `aplicarI18n, detectarIdioma, t`. `localizar` viene de `catalogo.js` y sirve para el objeto `etiqueta` `{es,en,...}`.

- [ ] **Step 2: Corregir el import**

En `js/votar.js` Step 1, la línea de import correcta es:
```js
import { aplicarI18n, detectarIdioma, t } from './i18n.js';
```

- [ ] **Step 3: Prueba manual del flujo completo**

Con Worker local (Task B7) y `js/config.js` apuntando a `http://127.0.0.1:8787` (revertir después):
1. Abrir `http://127.0.0.1:8743/votar/` → lista de 6 ciudades con botón "Votar", sin números.
2. Votar una → aparecen barras, recuentos, "Tu voto" y "¡Gracias por votar!".
3. Recargar → sigue mostrando resultados (persistencia por `localStorage` + servidor).
4. En una ventana privada nueva: proponer "Oporto" → "Propuesta recibida…".

Expected: los 4 pasos funcionan. Revertir `js/config.js`.

- [ ] **Step 4: Ejecutar la suite**

Run: `node --test`
Expected: PASS (sin cambios respecto a C2).

- [ ] **Step 5: Commit**

```bash
git add js/votar.js
git commit -m "$(printf 'Votacion: js/votar.js — maquina de estados de la pagina\n\nCo-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>')"
```

---

### Task C5: Enlace a `/votar` desde la portada

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Añadir el bloque tras la sección de ciudades**

En `index.html`, justo después de `</section>` que cierra `<section class="seccion-ciudades contenedor" id="ciudades">` (línea ~110), añadir:
```html
  <section class="contenedor bloque-votar">
    <h2 data-i18n="votar_portada_titulo">¿Qué ciudad preparamos después?</h2>
    <p data-i18n="votar_portada_texto"></p>
    <a class="btn btn-lacre" href="votar/" data-i18n="votar_portada_cta">Ir a la votación</a>
  </section>
```

- [ ] **Step 2: Estilo mínimo**

Añadir a `css/styles.css`:
```css
.bloque-votar { text-align: center; padding-block: 3rem; }
.bloque-votar p { color: #5b4c36; margin-bottom: 1.25rem; }
```

- [ ] **Step 3: Verificación manual**

Servir el sitio y abrir la portada: el bloque aparece bajo las ciudades, el enlace lleva a `/votar/`, y los textos se traducen al cambiar de idioma (probar con `?idioma=en` no aplica en portada ES — se valida de verdad en Task E2 con la portada `en/` regenerada).

- [ ] **Step 4: Commit**

```bash
git add index.html css/styles.css
git commit -m "$(printf 'Portada: bloque con enlace a la votacion de proxima ciudad\n\nCo-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>')"
```

---

### Task C6: Panel de moderación `admin/votos.html` + `js/admin-votos.js`

**Files:**
- Create: `admin/votos.html`
- Create: `js/admin-votos.js`

- [ ] **Step 1: Crear la página**

Create `admin/votos.html`:
```html
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Moderación de propuestas — Vestigia</title>
<meta name="robots" content="noindex, nofollow">
<link rel="stylesheet" href="../css/styles.css">
</head>
<body>
<main class="contenedor" style="max-width:720px; padding-block:2.5rem;">
  <h1>Propuestas de ciudad</h1>

  <form id="form-clave">
    <label>Frase secreta
      <input id="clave" type="password" autocomplete="off" style="font:inherit;padding:.5rem;">
    </label>
    <button class="btn btn-lacre" type="submit">Entrar</button>
  </form>

  <p id="msg" hidden></p>
  <ul id="lista" class="votar-lista" hidden></ul>
</main>
<script type="module" src="../js/admin-votos.js"></script>
</body>
</html>
```

- [ ] **Step 2: Crear la lógica**

Create `js/admin-votos.js`:
```js
// js/admin-votos.js — panel de moderación de propuestas. Sin i18n.
import { API_BASE_URL } from './config.js';

const CLAVE_SESION = 'vestigia_admin_clave';
const els = {};
['form-clave', 'clave', 'msg', 'lista'].forEach((id) => { els[id] = document.getElementById(id); });

function auth() {
  return { Authorization: `Bearer ${sessionStorage.getItem(CLAVE_SESION) || ''}` };
}

function msg(texto, error = false) {
  els.msg.textContent = texto;
  els.msg.hidden = !texto;
  els.msg.style.color = error ? '#9c2b1f' : '#2e7d32';
}

async function cargar() {
  const res = await fetch(new URL('/api/admin/propuestas', API_BASE_URL), { headers: auth() });
  if (res.status === 401) {
    sessionStorage.removeItem(CLAVE_SESION);
    els['form-clave'].hidden = false;
    els.lista.hidden = true;
    msg('Frase secreta incorrecta.', true);
    return;
  }
  const { propuestas } = await res.json();
  els['form-clave'].hidden = true;
  msg(propuestas.length ? '' : 'No hay propuestas pendientes.');
  els.lista.hidden = false;
  els.lista.innerHTML = propuestas.map((p) => `
    <li class="votar-opcion" data-id="${p.id}">
      <span class="votar-opcion__nombre">
        ${p.etiqueta.es || p.id}
        ${p.nota ? `<br><small>${escape(p.nota)}</small>` : ''}
        ${p.email ? `<br><small>${escape(p.email)}</small>` : ''}
      </span>
      <button class="btn btn-lacre" data-accion="aprobar">Aprobar</button>
      <button class="btn btn-fantasma" data-accion="rechazar">Rechazar</button>
    </li>`).join('');
  els.lista.querySelectorAll('button[data-accion]').forEach((b) => {
    b.addEventListener('click', () => moderar(b.closest('li').dataset.id, b.dataset.accion));
  });
}

async function moderar(id, accion) {
  const res = await fetch(new URL(`/api/admin/propuestas/${id}`, API_BASE_URL), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...auth() },
    body: JSON.stringify({ accion }),
  });
  if (!res.ok) { msg(`Error ${res.status}`, true); return; }
  cargar();
}

function escape(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

els['form-clave'].addEventListener('submit', (e) => {
  e.preventDefault();
  sessionStorage.setItem(CLAVE_SESION, els.clave.value);
  cargar();
});

if (sessionStorage.getItem(CLAVE_SESION)) cargar();
```

- [ ] **Step 3: Prueba manual**

Worker local con `ADMIN_SECRET="admin-local"` en `.dev.vars`. Abrir `http://127.0.0.1:8743/admin/votos.html`, meter `admin-local`, ver la propuesta "Oporto" creada en Task C4, aprobarla. Recargar `/votar/` en ventana privada → "Oporto" aparece como votable.

- [ ] **Step 4: Commit**

```bash
git add admin/votos.html js/admin-votos.js
git commit -m "$(printf 'Votacion: panel de moderacion /admin/votos.html\n\nCo-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>')"
```

---

## FASE D — Devoluciones

### Task D1: `guardarDevolucion` en db.js

**Files:**
- Modify: `worker/src/db.js`
- Modify: `worker/tests/db.test.js`

- [ ] **Step 1: Test**

Añadir a `worker/tests/db.test.js` (import `guardarDevolucion`, `listarDevoluciones` no hace falta; se verifica leyendo `DB._tablas`):
```js
import { /* …existentes… */ guardarDevolucion } from '../src/db.js';

test('guardarDevolucion inserta una fila con todos los campos', async () => {
  const DB = crearD1Falsa();
  await guardarDevolucion({ DB }, {
    rutaId: 'roma-centro', orderId: 'ord_9', idioma: 'es',
    valoracion: 4, categoria: 'enigmas', texto: 'muy bien', email: 'x@y.com', ahora: 123,
  });
  assert.equal(DB._tablas.devoluciones.length, 1);
  assert.deepEqual(DB._tablas.devoluciones[0], {
    id: 1, ruta_id: 'roma-centro', order_id: 'ord_9', idioma: 'es',
    valoracion: 4, categoria: 'enigmas', texto: 'muy bien', email: 'x@y.com', creado_en: 123,
  });
});
```

- [ ] **Step 2: Ejecutar y ver fallar**

Run: `node --test worker/tests/db.test.js`
Expected: FAIL — `guardarDevolucion` no exportado.

- [ ] **Step 3: Implementar**

Añadir a `worker/src/db.js`:
```js
export async function guardarDevolucion({ DB }, { rutaId, orderId, idioma, valoracion, categoria, texto, email, ahora }) {
  await DB.prepare(
    `/* tag:insertar_devolucion */
     INSERT INTO devoluciones (ruta_id, order_id, idioma, valoracion, categoria, texto, email, creado_en)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  ).bind(rutaId, orderId, idioma, valoracion, categoria, texto, email, ahora).run();
}
```

- [ ] **Step 4: Ejecutar y ver pasar**

Run: `node --test worker/tests/db.test.js`
Expected: PASS — 9 tests.

- [ ] **Step 5: Commit**

```bash
git add worker/src/db.js worker/tests/db.test.js
git commit -m "$(printf 'D1: guardarDevolucion en db.js\n\nCo-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>')"
```

---

### Task D2: `buildDevolucionEmail` en resend.js

**Files:**
- Modify: `worker/src/resend.js`
- Modify: `worker/tests/resend.test.js`

- [ ] **Step 1: Test**

Añadir a `worker/tests/resend.test.js` (import `buildDevolucionEmail`):
```js
test('buildDevolucionEmail: asunto con estrellas y ruta, cuerpo con categoría/texto/email', () => {
  const email = buildDevolucionEmail(
    { rutaId: 'napoles-spaccanapoli', valoracion: 2, categoria: 'recorrido', texto: 'el mapa <no> ayudaba', email: 'cli@ente.com' },
    'owner@example.com',
  );
  assert.deepEqual(email.to, ['owner@example.com']);
  assert.match(email.subject, /napoles-spaccanapoli/);
  assert.match(email.subject, /★★☆☆☆/);
  assert.match(email.html, /recorrido/);
  assert.match(email.html, /el mapa &lt;no&gt; ayudaba/);
  assert.match(email.html, /cli@ente\.com/);
});

test('buildDevolucionEmail sin email del cliente no imprime "null"', () => {
  const email = buildDevolucionEmail(
    { rutaId: 'roma-centro', valoracion: 5, categoria: 'otro', texto: 'genial', email: null },
    'owner@example.com',
  );
  assert.ok(!email.html.includes('null'));
  assert.match(email.subject, /★★★★★/);
});
```

- [ ] **Step 2: Ejecutar y ver fallar**

Run: `node --test worker/tests/resend.test.js`
Expected: FAIL — `buildDevolucionEmail` no exportado.

- [ ] **Step 3: Implementar**

Añadir a `worker/src/resend.js`:
```js
function estrellas(n) {
  const llenas = Math.max(0, Math.min(5, Math.round(n)));
  return '★'.repeat(llenas) + '☆'.repeat(5 - llenas);
}

export function buildDevolucionEmail({ rutaId, valoracion, categoria, texto, email }, ownerEmail) {
  return {
    from: FROM_ADDRESS,
    to: [ownerEmail],
    subject: `${estrellas(valoracion)} ${rutaId} — nueva devolución`,
    html: `
      <h2>Nueva devolución</h2>
      <ul>
        <li>Ruta: ${escapeHtml(rutaId)}</li>
        <li>Valoración: ${estrellas(valoracion)} (${escapeHtml(String(valoracion))}/5)</li>
        <li>Categoría: ${escapeHtml(categoria)}</li>
        <li>Email del cliente: ${email ? escapeHtml(email) : '(no proporcionado)'}</li>
      </ul>
      <p style="white-space:pre-wrap;">${escapeHtml(texto)}</p>
    `,
  };
}
```

- [ ] **Step 4: Ejecutar y ver pasar**

Run: `node --test worker/tests/resend.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add worker/src/resend.js worker/tests/resend.test.js
git commit -m "$(printf 'Devoluciones: buildDevolucionEmail — aviso al propietario\n\nCo-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>')"
```

---

### Task D3: `handleEnviarDevolucion` (exige token de acceso)

**Files:**
- Modify: `worker/src/devoluciones.js` (reemplaza el stub de B6)
- Create: `worker/tests/devoluciones.test.js`

- [ ] **Step 1: Test**

Create `worker/tests/devoluciones.test.js`:
```js
// worker/tests/devoluciones.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearD1Falsa } from './helpers/fake-d1.js';
import * as dbReal from '../src/db.js';
import { firmarToken } from '../src/acceso.js';
import { handleEnviarDevolucion } from '../src/devoluciones.js';

const CORS = { 'Access-Control-Allow-Origin': '*' };
const SECRET = 'secreto-token';

function req(body) {
  return { json: async () => body };
}
function url(t) {
  const u = new URL('https://api.test/api/devolucion');
  if (t) u.searchParams.set('t', t);
  return u;
}
function env(DB, envios) {
  // sin KV → throttle abierto. `_enviar` intercepta el email en tests.
  return { DB, TOKEN_SECRET: SECRET, RESEND_API_KEY: 'k', OWNER_EMAIL: 'o@t', _enviar: async (p) => envios.push(p) };
}
const IP = '1.1.1.1';
/** doble de request con body JSON y Content-Length coherente (leerJsonAcotado
 *  lee la cabecera). */
function req(body) {
  const s = JSON.stringify(body ?? {});
  return { headers: { get: (h) => (h.toLowerCase() === 'content-length' ? String(s.length) : null) }, json: async () => body };
}

test('devolución válida: guarda en D1 y envía email', async () => {
  const DB = crearD1Falsa();
  const envios = [];
  const token = await firmarToken({ rutaId: 'roma-centro', orderId: 'ord_1' }, SECRET);
  const res = await handleEnviarDevolucion(
    req({ rutaId: 'roma-centro', valoracion: 4, categoria: 'enigmas', texto: 'gran ruta', email: 'x@y.com', idioma: 'es' }),
    url(token), env(DB, envios), CORS, IP, dbReal,
  );
  assert.equal((await res.json()).ok, true);
  assert.equal(DB._tablas.devoluciones.length, 1);
  assert.equal(DB._tablas.devoluciones[0].order_id, 'ord_1');
  assert.equal(envios.length, 1);
});

test('sin token válido → 401 y no toca D1', async () => {
  const DB = crearD1Falsa();
  const res = await handleEnviarDevolucion(
    req({ rutaId: 'roma-centro', valoracion: 4, categoria: 'enigmas', texto: 'x' }),
    url('token-basura'), env(DB, []), CORS, IP, dbReal,
  );
  assert.equal(res.status, 401);
  assert.equal(DB._tablas.devoluciones.length, 0);
});

test('rutaId del cuerpo que no coincide con el del token → 400', async () => {
  const DB = crearD1Falsa();
  const token = await firmarToken({ rutaId: 'roma-centro', orderId: 'ord_1' }, SECRET);
  const res = await handleEnviarDevolucion(
    req({ rutaId: 'paris-marais', valoracion: 4, categoria: 'enigmas', texto: 'x' }),
    url(token), env(DB, []), CORS, IP, dbReal,
  );
  assert.equal(res.status, 400);
});

test('valoración fuera de 1..5 / categoría desconocida / texto vacío → 400', async () => {
  const DB = crearD1Falsa();
  const token = await firmarToken({ rutaId: 'roma-centro', orderId: 'ord_1' }, SECRET);
  for (const cuerpo of [
    { rutaId: 'roma-centro', valoracion: 0, categoria: 'enigmas', texto: 'x' },
    { rutaId: 'roma-centro', valoracion: 6, categoria: 'enigmas', texto: 'x' },
    { rutaId: 'roma-centro', valoracion: 3, categoria: 'inventada', texto: 'x' },
    { rutaId: 'roma-centro', valoracion: 3, categoria: 'enigmas', texto: '   ' },
  ]) {
    const res = await handleEnviarDevolucion(req(cuerpo), url(token), env(DB, []), CORS, IP, dbReal);
    assert.equal(res.status, 400, JSON.stringify(cuerpo));
  }
  assert.equal(DB._tablas.devoluciones.length, 0);
});

test('email con formato inválido → 400', async () => {
  const DB = crearD1Falsa();
  const token = await firmarToken({ rutaId: 'roma-centro', orderId: 'ord_1' }, SECRET);
  const res = await handleEnviarDevolucion(
    req({ rutaId: 'roma-centro', valoracion: 3, categoria: 'otro', texto: 'ok', email: 'no-es-email' }),
    url(token), env(DB, []), CORS, IP, dbReal,
  );
  assert.equal(res.status, 400);
});
```

- [ ] **Step 2: Ejecutar y ver fallar**

Run: `node --test worker/tests/devoluciones.test.js`
Expected: FAIL — el stub devuelve 501.

- [ ] **Step 3: Implementar**

Reemplazar `worker/src/devoluciones.js` completo:
```js
// worker/src/devoluciones.js
//
// Devolución del jugador al terminar una ruta. Exige el mismo token de
// acceso firmado que /api/ruta: solo quien compró (o accedió gratis) puede
// dejar una. `db` y `env._enviar` son inyectables para los tests.
import * as dbPorDefecto from './db.js';
import { verificarToken } from './acceso.js';
import { buildDevolucionEmail, sendEmail, emailValidoBasico } from './resend.js';
import { leerJsonAcotado } from './entrada.js';
import { consumirCupo } from './throttle.js';

const CATEGORIAS = new Set(['enigmas', 'dificultad', 'recorrido', 'error', 'precio', 'otro']);
const MAX_TEXTO = 2000;

function jsonRes(cuerpo, cors, status = 200) {
  return Response.json(cuerpo, { status, headers: cors });
}

export async function handleEnviarDevolucion(request, url, env, cors, ip, db = dbPorDefecto) {
  const token = url.searchParams.get('t');
  const payload = await verificarToken(token, env.TOKEN_SECRET);
  if (!payload) return jsonRes({ error: 'Token inválido o caducado' }, cors, 401);

  const cupo = await consumirCupo(env.KV, { ip, accion: 'devolucion', limite: 5, ventanaSegundos: 900 });
  if (!cupo.permitido) {
    return Response.json(
      { error: 'Demasiadas solicitudes, prueba de nuevo en unos minutos' },
      { status: 429, headers: { ...cors, 'Retry-After': String(cupo.reintentarEn) } },
    );
  }

  const leido = await leerJsonAcotado(request);
  if (leido.error) return jsonRes({ error: leido.error }, cors, leido.status);
  const { rutaId, valoracion, categoria, texto, email, idioma } = leido.datos || {};

  if (rutaId && rutaId !== payload.rutaId) {
    return jsonRes({ error: 'La ruta no coincide con el acceso' }, cors, 400);
  }
  const val = Number(valoracion);
  if (!Number.isInteger(val) || val < 1 || val > 5) {
    return jsonRes({ error: 'Valoración no válida' }, cors, 400);
  }
  if (!CATEGORIAS.has(categoria)) {
    return jsonRes({ error: 'Categoría no válida' }, cors, 400);
  }
  const textoLimpio = typeof texto === 'string' ? texto.trim() : '';
  if (!textoLimpio || textoLimpio.length > MAX_TEXTO) {
    return jsonRes({ error: 'El comentario no puede estar vacío' }, cors, 400);
  }
  const emailLimpio = typeof email === 'string' && email.trim() ? email.trim() : null;
  if (emailLimpio && !emailValidoBasico(emailLimpio)) {
    return jsonRes({ error: 'Email no válido' }, cors, 400);
  }

  const idiomaLimpio = ['es', 'en', 'fr', 'it'].includes(idioma) ? idioma : 'es';
  await db.guardarDevolucion(env, {
    rutaId: payload.rutaId,
    orderId: payload.orderId,
    idioma: idiomaLimpio,
    valoracion: val,
    categoria,
    texto: textoLimpio,
    email: emailLimpio,
    ahora: Date.now(),
  });

  const enviar = env._enviar || ((p) => sendEmail(p, env.RESEND_API_KEY));
  try {
    await enviar(buildDevolucionEmail({ rutaId: payload.rutaId, valoracion: val, categoria, texto: textoLimpio, email: emailLimpio }, env.OWNER_EMAIL));
  } catch (e) {
    console.error('Devolución guardada pero el email falló:', e.message);
  }

  return jsonRes({ ok: true }, cors);
}
```

- [ ] **Step 4: Ejecutar y ver pasar**

Run: `node --test worker/tests/devoluciones.test.js`
Expected: PASS — 5 tests.

- [ ] **Step 5: Verificar el enrutado en index.js**

La llamada añadida en B6 ya es:
```js
      if (request.method === 'POST' && url.pathname === '/api/devolucion') {
        return await handleEnviarDevolucion(request, url, env, cors, ip);
      }
```
`url` e `ip` están en scope (se declaran al principio de `fetch`). Sin cambios si ya coincide.

- [ ] **Step 6: Suite completa**

Run: `node --test`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add worker/src/devoluciones.js worker/tests/devoluciones.test.js
git commit -m "$(printf 'Devoluciones: handleEnviarDevolucion — exige token, valida y guarda en D1\n\nCo-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>')"
```

---

### Task D4: Campo `devolucionEnviada` en el progreso

**Files:**
- Modify: `js/juego/progreso.js`
- Modify: `tests/progreso.test.js`

- [ ] **Step 1: Test**

Añadir a `tests/progreso.test.js`:
```js
test('estadoInicial trae devolucionEnviada en false', () => {
  assert.equal(estadoInicial().devolucionEnviada, false);
});

test('cargarProgreso conserva devolucionEnviada guardado', () => {
  globalThis.localStorage = new LocalStorageDeMentira();
  guardarProgreso('roma-centro', 'ord_7', { ...estadoInicial(), completada: true, devolucionEnviada: true });
  assert.equal(cargarProgreso('roma-centro', 'ord_7').devolucionEnviada, true);
});
```

- [ ] **Step 2: Ejecutar y ver fallar**

Run: `node --test tests/progreso.test.js`
Expected: FAIL — `devolucionEnviada` es `undefined`.

- [ ] **Step 3: Implementar**

En `js/juego/progreso.js`, en `estadoInicial()` añadir la propiedad:
```js
  return {
    paradaActual: 1,
    pistasUsadas: {},
    completada: false,
    iniciadoEn: Date.now(),
    completadoEn: null,
    devolucionEnviada: false,
  };
```

- [ ] **Step 4: Ejecutar y ver pasar**

Run: `node --test tests/progreso.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add js/juego/progreso.js tests/progreso.test.js
git commit -m "$(printf 'Progreso: campo devolucionEnviada para no repetir el formulario\n\nCo-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>')"
```

---

### Task D5: Bloque de devolución en `jugar/index.html`

**Files:**
- Modify: `jugar/index.html`
- Modify: `css/juego.css`

- [ ] **Step 1: Añadir el markup dentro de `#vista-completada`**

En `jugar/index.html`, dentro de `<section id="vista-completada" ...>`, **antes** de `<div class="pantalla-final__acciones">`, añadir:
```html
    <form id="form-devolucion" class="devolucion" hidden>
      <h2 class="devolucion__titulo" data-i18n="devol_titulo">¿Qué te ha parecido?</h2>

      <fieldset class="devolucion__estrellas">
        <legend data-i18n="devol_valoracion_label">Tu valoración</legend>
        <label><input type="radio" name="valoracion" value="1"><span aria-hidden="true">★</span><span class="sr-only">1</span></label>
        <label><input type="radio" name="valoracion" value="2"><span aria-hidden="true">★</span><span class="sr-only">2</span></label>
        <label><input type="radio" name="valoracion" value="3"><span aria-hidden="true">★</span><span class="sr-only">3</span></label>
        <label><input type="radio" name="valoracion" value="4"><span aria-hidden="true">★</span><span class="sr-only">4</span></label>
        <label><input type="radio" name="valoracion" value="5"><span aria-hidden="true">★</span><span class="sr-only">5</span></label>
      </fieldset>

      <label class="devolucion__campo">
        <span data-i18n="devol_categoria_label">¿Sobre qué?</span>
        <select name="categoria" required>
          <option value="enigmas" data-i18n="devol_cat_enigmas"></option>
          <option value="dificultad" data-i18n="devol_cat_dificultad"></option>
          <option value="recorrido" data-i18n="devol_cat_recorrido"></option>
          <option value="error" data-i18n="devol_cat_error"></option>
          <option value="precio" data-i18n="devol_cat_precio"></option>
          <option value="otro" data-i18n="devol_cat_otro"></option>
        </select>
      </label>

      <label class="devolucion__campo">
        <span data-i18n="devol_texto_label">Cuéntanos</span>
        <textarea name="texto" rows="4" maxlength="2000" required
                  data-i18n-attr="placeholder:devol_texto_ph"></textarea>
      </label>

      <label class="devolucion__campo">
        <span data-i18n="devol_email_label">Tu email (si quieres que te respondamos)</span>
        <input type="email" name="email" maxlength="254"
               data-i18n-attr="placeholder:devol_email_ph">
      </label>

      <button type="submit" class="btn btn-lacre" id="btn-devolucion" data-i18n="devol_btn_enviar">Enviar</button>
      <p id="devolucion-msg" class="devolucion__msg" hidden></p>
    </form>
```

Nota: `data-i18n` en `<option>` funciona con `aplicarI18n` (usa `textContent`).

- [ ] **Step 2: Estilos**

Añadir al final de `css/juego.css`:
```css
.devolucion { text-align: left; display: grid; gap: 1rem; margin: 2rem auto 1.5rem;
  max-width: 30rem; padding: 1.25rem; border: 1px solid rgba(241,230,207,.25); border-radius: 12px; }
.devolucion__titulo { font-size: 1.1rem; margin: 0; }
.devolucion__estrellas { border: 0; padding: 0; margin: 0; display: flex; gap: .25rem; }
.devolucion__estrellas legend { float: left; width: 100%; margin-bottom: .35rem; font-size: .9rem; }
.devolucion__estrellas label { cursor: pointer; font-size: 1.5rem; color: #6b5c44; line-height: 1; }
.devolucion__estrellas label:has(input:checked),
.devolucion__estrellas label:hover { color: #d4483a; }
.devolucion__estrellas input { position: absolute; opacity: 0; width: 1px; height: 1px; }
.devolucion__campo { display: grid; gap: .3rem; font-size: .9rem; }
.devolucion__campo select, .devolucion__campo textarea, .devolucion__campo input {
  font: inherit; padding: .55rem .65rem; border-radius: 8px; border: 1px solid rgba(241,230,207,.3);
  background: rgba(0,0,0,.15); color: inherit; }
.devolucion__msg { margin: 0; font-size: .9rem; }
.devolucion__msg--ok { color: #7bc47f; }
.devolucion__msg--error { color: #e88; }
```
(Nota: `:has()` — si el objetivo de navegadores del proyecto no lo garantiza, el resaltado de estrellas al marcar se hará también por JS en Task D6 añadiendo una clase. Comprobar `css/` para ver si ya se usa `:has()`.)

- [ ] **Step 3: Commit**

```bash
git add jugar/index.html css/juego.css
git commit -m "$(printf 'Devoluciones: formulario en la pantalla final del juego (markup)\n\nCo-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>')"
```

---

### Task D6: Lógica de la devolución en `js/jugar.js`

**Files:**
- Modify: `js/jugar.js`

- [ ] **Step 1: Importar `enviarDevolucion` y referenciar los elementos nuevos**

En `js/jugar.js`:
- En el import de `./api.js`: `import { obtenerRuta, enviarDevolucion } from './api.js';`
- En `refEls()`, añadir al array `ids`: `'form-devolucion', 'btn-devolucion', 'devolucion-msg',`

- [ ] **Step 2: Añadir el manejo del formulario**

Añadir estas funciones a `js/jugar.js` (antes de `function renderCompletada`):
```js
function mostrarMsgDevolucion(clave, tipo) {
  const el = els['devolucion-msg'];
  el.textContent = t(app.lang, clave);
  el.className = `devolucion__msg devolucion__msg--${tipo}`;
  el.hidden = false;
}

async function manejarEnvioDevolucion(evento) {
  evento.preventDefault();
  const form = els['form-devolucion'];
  const datos = new FormData(form);
  const valoracion = Number(datos.get('valoracion'));
  if (!valoracion) { mostrarMsgDevolucion('devol_error', 'error'); return; }
  const texto = (datos.get('texto') || '').trim();
  if (!texto) { mostrarMsgDevolucion('devol_error', 'error'); return; }

  els['btn-devolucion'].disabled = true;
  els['btn-devolucion'].textContent = t(app.lang, 'devol_enviando');
  try {
    await enviarDevolucion(app.tokenActual, {
      rutaId: app.rutaId,
      valoracion,
      categoria: datos.get('categoria') || 'otro',
      texto,
      email: (datos.get('email') || '').trim() || null,
    });
    app.estado = { ...app.estado, devolucionEnviada: true };
    guardar();
    form.hidden = true;
    mostrarMsgDevolucion('devol_gracias', 'ok');
    els['devolucion-msg'].hidden = false;
  } catch (e) {
    els['btn-devolucion'].disabled = false;
    els['btn-devolucion'].textContent = t(app.lang, 'devol_btn_enviar');
    mostrarMsgDevolucion('devol_error', 'error');
  }
}
```

Nota: cuando `form.hidden = true`, el `<p id="devolucion-msg">` está dentro del form y también se ocultaría. Solución: en Task D5 el `<p>` está dentro del `<form>` — moverlo **fuera**, justo después de `</form>`, para que el "¡Gracias!" siga visible. Ajustar el markup de D5 en consecuencia (mover la línea `<p id="devolucion-msg" ...>` justo tras `</form>`).

- [ ] **Step 3: Mostrar/ocultar el bloque en `renderCompletada`**

En `renderCompletada()`, antes de `mostrarVista('vista-completada')`, añadir:
```js
  const form = els['form-devolucion'];
  if (app.estado.devolucionEnviada) {
    form.hidden = true;
    els['devolucion-msg'].textContent = t(app.lang, 'devol_gracias');
    els['devolucion-msg'].className = 'devolucion__msg devolucion__msg--ok';
    els['devolucion-msg'].hidden = false;
  } else {
    form.hidden = false;
    aplicarI18n(form, app.lang);
    form.onsubmit = manejarEnvioDevolucion;
  }
```

Nota: la devolución no se puede enviar en modo offline (necesita el Worker). Si `app.tokenActual` existe pero la ruta se cargó de caché, el envío fallará con el error de red y mostrará `devol_error` — comportamiento aceptable.

- [ ] **Step 4: Prueba manual**

Worker local + `js/config.js` al local. Minar un token de una ruta gratis:
```bash
cd worker && node scripts/mint-dev-token.mjs barcelona-born
```
Abrir la URL, completar la ruta (o usar una ruta corta), y en la pantalla final: valorar, elegir categoría, escribir texto, enviar → "¡Gracias! Lo leemos todo." Recargar la página del juego → la pantalla final ya no muestra el formulario. Revertir `js/config.js`.

- [ ] **Step 5: Suite**

Run: `node --test`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add js/jugar.js jugar/index.html
git commit -m "$(printf 'Devoluciones: envio desde la pantalla final + no repetir si ya enviada\n\nCo-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>')"
```

---

## FASE E — Traducciones, legal, SSG y despliegue

### Task E1: Traducir a EN / FR / IT y restaurar los tests de paridad

**Files:**
- Modify: `js/i18n.js`
- Modify: `tests/i18n.test.js`

- [ ] **Step 1: Añadir las mismas claves de C2 a `DICT.en`, `DICT.fr`, `DICT.it`**

Traducción fiel (revisar en contexto). Bloques a insertar en la posición equivalente de cada diccionario:

**en:**
```js
    votar_portada_titulo: 'Which city should we build next?',
    votar_portada_texto: 'Vote for the next Vestigia city — or suggest one that isn’t listed.',
    votar_portada_cta: 'Go to the vote',
    votar_titulo: 'Vote for the next city',
    votar_subtitulo: 'Pick the city you’d most like to explore. You’ll see the results as soon as you vote.',
    votar_btn_votar: 'Vote',
    votar_tu_voto: 'Your vote',
    votar_resultados_titulo: 'How the vote is going',
    votar_gracias: 'Thanks for voting!',
    votar_propuesta_titulo: 'Is a city missing?',
    votar_propuesta_texto: 'Suggest a city or a specific neighbourhood. We’ll review it, and if it makes the list your vote already counts for it.',
    votar_propuesta_ciudad_label: 'City or neighbourhood',
    votar_propuesta_ciudad_ph: 'e.g. Porto, or “Seville — Santa Cruz”',
    votar_propuesta_nota_label: 'Why (optional)',
    votar_propuesta_nota_ph: 'Tell us what would make it a good route',
    votar_propuesta_email_label: 'Your email (optional)',
    votar_propuesta_email_ph: 'name@example.com',
    votar_propuesta_btn: 'Send suggestion',
    votar_propuesta_enviada: 'Suggestion received. We’ll review it; your vote is reserved for that city.',
    votar_error_generico: 'Something went wrong. Please try again in a moment.',
    votar_cargando: 'Loading the vote…',
    devol_titulo: 'How was it?',
    devol_valoracion_label: 'Your rating',
    devol_categoria_label: 'About what?',
    devol_cat_enigmas: 'The puzzles',
    devol_cat_dificultad: 'The difficulty',
    devol_cat_recorrido: 'The route or the map',
    devol_cat_error: 'A mistake (a fact, an answer)',
    devol_cat_precio: 'The price',
    devol_cat_otro: 'Something else',
    devol_texto_label: 'Tell us',
    devol_texto_ph: 'What went wrong, what you’d improve, what you liked…',
    devol_email_label: 'Your email (if you’d like a reply)',
    devol_email_ph: 'name@example.com',
    devol_btn_enviar: 'Send',
    devol_enviando: 'Sending…',
    devol_gracias: 'Thank you! We read every one.',
    devol_error: 'Couldn’t send it. Please try again.',
```

**fr:**
```js
    votar_portada_titulo: 'Quelle ville préparer ensuite  ?',
    votar_portada_texto: 'Votez pour la prochaine ville de Vestigia — ou proposez-en une qui n’est pas listée.',
    votar_portada_cta: 'Aller au vote',
    votar_titulo: 'Votez pour la prochaine ville',
    votar_subtitulo: 'Choisissez la ville que vous aimeriez le plus parcourir. Vous verrez les résultats dès votre vote.',
    votar_btn_votar: 'Voter',
    votar_tu_voto: 'Votre vote',
    votar_resultados_titulo: 'Où en est le vote',
    votar_gracias: 'Merci d’avoir voté !',
    votar_propuesta_titulo: 'Une ville manque ?',
    votar_propuesta_texto: 'Proposez une ville ou un quartier précis. Nous l’examinons, et si elle est retenue votre vote compte déjà pour elle.',
    votar_propuesta_ciudad_label: 'Ville ou quartier',
    votar_propuesta_ciudad_ph: 'ex. : Porto, ou « Séville — Santa Cruz »',
    votar_propuesta_nota_label: 'Pourquoi (facultatif)',
    votar_propuesta_nota_ph: 'Dites-nous ce qui en ferait un bon parcours',
    votar_propuesta_email_label: 'Votre e-mail (facultatif)',
    votar_propuesta_email_ph: 'nom@exemple.com',
    votar_propuesta_btn: 'Envoyer la proposition',
    votar_propuesta_enviada: 'Proposition reçue. Nous l’examinerons ; votre vote est réservé pour cette ville.',
    votar_error_generico: 'Une erreur est survenue. Réessayez dans un instant.',
    votar_cargando: 'Chargement du vote…',
    devol_titulo: 'Alors, ce parcours ?',
    devol_valoracion_label: 'Votre note',
    devol_categoria_label: 'À propos de quoi ?',
    devol_cat_enigmas: 'Les énigmes',
    devol_cat_dificultad: 'La difficulté',
    devol_cat_recorrido: 'Le parcours ou la carte',
    devol_cat_error: 'Une erreur (un fait, une réponse)',
    devol_cat_precio: 'Le prix',
    devol_cat_otro: 'Autre chose',
    devol_texto_label: 'Dites-nous',
    devol_texto_ph: 'Ce qui n’a pas marché, ce que vous amélioreriez, ce qui vous a plu…',
    devol_email_label: 'Votre e-mail (si vous souhaitez une réponse)',
    devol_email_ph: 'nom@exemple.com',
    devol_btn_enviar: 'Envoyer',
    devol_enviando: 'Envoi…',
    devol_gracias: 'Merci ! Nous lisons tout.',
    devol_error: 'Envoi impossible. Réessayez.',
```

**it:**
```js
    votar_portada_titulo: 'Quale città prepariamo dopo?',
    votar_portada_texto: 'Vota la prossima città di Vestigia — o proponine una che non c’è.',
    votar_portada_cta: 'Vai al voto',
    votar_titulo: 'Vota la prossima città',
    votar_subtitulo: 'Scegli la città che più ti piacerebbe percorrere. Vedrai i risultati appena voti.',
    votar_btn_votar: 'Vota',
    votar_tu_voto: 'Il tuo voto',
    votar_resultados_titulo: 'Come sta andando il voto',
    votar_gracias: 'Grazie per aver votato!',
    votar_propuesta_titulo: 'Manca una città?',
    votar_propuesta_texto: 'Proponi una città o un quartiere preciso. La valutiamo e, se entra, il tuo voto conta già per lei.',
    votar_propuesta_ciudad_label: 'Città o quartiere',
    votar_propuesta_ciudad_ph: 'es.: Porto, o «Siviglia — Santa Cruz»',
    votar_propuesta_nota_label: 'Perché (facoltativo)',
    votar_propuesta_nota_ph: 'Dicci cosa la renderebbe un buon percorso',
    votar_propuesta_email_label: 'La tua email (facoltativo)',
    votar_propuesta_email_ph: 'nome@esempio.com',
    votar_propuesta_btn: 'Invia la proposta',
    votar_propuesta_enviada: 'Proposta ricevuta. La valuteremo; il tuo voto resta riservato per quella città.',
    votar_error_generico: 'Qualcosa è andato storto. Riprova tra un momento.',
    votar_cargando: 'Caricamento del voto…',
    devol_titulo: 'Com’è andata?',
    devol_valoracion_label: 'La tua valutazione',
    devol_categoria_label: 'Riguardo a cosa?',
    devol_cat_enigmas: 'Gli enigmi',
    devol_cat_dificultad: 'La difficoltà',
    devol_cat_recorrido: 'Il percorso o la mappa',
    devol_cat_error: 'Un errore (un dato, una risposta)',
    devol_cat_precio: 'Il prezzo',
    devol_cat_otro: 'Altro',
    devol_texto_label: 'Raccontaci',
    devol_texto_ph: 'Cosa non ha funzionato, cosa miglioreresti, cosa ti è piaciuto…',
    devol_email_label: 'La tua email (se vuoi una risposta)',
    devol_email_ph: 'nome@esempio.com',
    devol_btn_enviar: 'Invia',
    devol_enviando: 'Invio…',
    devol_gracias: 'Grazie! Leggiamo tutto.',
    devol_error: 'Invio non riuscito. Riprova.',
```

- [ ] **Step 2: Restaurar los tests de paridad**

En `tests/i18n.test.js`, volver `test.skip(` a `test(` en los dos tests que se saltaron en C2 y borrar el comentario TEMPORAL.

- [ ] **Step 3: Ejecutar**

Run: `node --test tests/i18n.test.js`
Expected: PASS — sin skips. (Ninguna clave nueva lleva placeholders `{var}`, así que el test de placeholders pasa trivialmente.)

- [ ] **Step 4: Commit**

```bash
git add js/i18n.js tests/i18n.test.js
git commit -m "$(printf 'i18n: traducciones EN/FR/IT de votacion y devolucion; paridad restaurada\n\nCo-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>')"
```

---

### Task E2: Regenerar las páginas `en/` y verificar el enlace de portada

**Files:**
- Modify: `en/index.html` (generado), `sitemap.xml` (regenerado, sin cambios de contenido esperados)

- [ ] **Step 1: Regenerar**

Run desde la raíz:
```bash
node scripts/generar-seo.mjs && node scripts/generar-i18n.mjs
```
Expected: sin errores; `en/index.html` se reescribe.

- [ ] **Step 2: Verificar que el bloque de votación se tradujo**

Run: `node --test tests/catalogo-i18n.test.js` (u observar el archivo)
Y comprobar manualmente en `en/index.html` que aparece `Which city should we build next?` y el enlace `href="votar/"`.

Nota: `scripts/generar-i18n.mjs` procesa `data-i18n` sobre el HTML de `index.html`, así que el bloque nuevo de Task C5 se traduce solo. El enlace `href="votar/"` es relativo: desde `en/index.html` resuelve a `en/votar/`, que **no existe**. Cambiar el `href` del bloque en `index.html` a **`/votar/`** (absoluto) para que funcione desde cualquier idioma. Aplicar ese cambio ahora y volver a regenerar.

- [ ] **Step 3: Corregir el href y regenerar**

En `index.html`, el enlace del bloque de votación: `href="/votar/"`.
```bash
node scripts/generar-seo.mjs && node scripts/generar-i18n.mjs
```

- [ ] **Step 4: Suite completa**

Run: `node --test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add index.html en/ sitemap.xml
git commit -m "$(printf 'Portada: enlace absoluto a /votar/ y regeneracion de en/\n\nCo-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>')"
```

---

### Task E3: Renglón en la política de privacidad

**Files:**
- Modify: `legal/privacidad.html`

- [ ] **Step 1: Localizar la sección de datos recogidos**

Abrir `legal/privacidad.html` y localizar la lista/sección que enumera qué datos se tratan (email de compra, etc.).

- [ ] **Step 2: Añadir el párrafo**

Añadir un punto con este contenido (adaptando al formato de la página):
> **Votación de próximas ciudades.** Si votas o propones una ciudad, guardamos tu elección junto a un identificador aleatorio generado en tu navegador y un valor derivado (con función hash irreversible) de tu dirección IP, únicamente para evitar votos duplicados. No guardamos la IP. Si añades un email a una propuesta o a una devolución, lo usamos solo para responderte.
>
> **Devoluciones.** Cuando terminas una ruta puedes enviarnos una valoración y un comentario; los guardamos asociados a la referencia de tu pedido para poder mejorar esa ruta.

- [ ] **Step 3: Commit**

```bash
git add legal/privacidad.html
git commit -m "$(printf 'Legal: privacidad cubre votos (id de navegador, hash de IP) y devoluciones\n\nCo-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>')"
```

---

### Task E4: Despliegue

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Aplicar la migración en la D1 remota**

Run desde `worker/`:
```bash
npx wrangler d1 migrations apply vestigia-db --remote
npx wrangler d1 execute vestigia-db --remote --command "SELECT count(*) AS n FROM voto_opciones"
```
Expected: aplica `0001`; la consulta devuelve `n = 6`.

- [ ] **Step 2: Configurar los secretos nuevos**

Run desde `worker/`:
```bash
npx wrangler secret put IP_SALT        # pegar: openssl rand -hex 16
npx wrangler secret put ADMIN_SECRET   # pegar: una frase larga y única
```

- [ ] **Step 3: Desplegar el Worker**

```bash
npx wrangler deploy
```
Expected: despliega sin error y lista el binding `DB` y las vars.

- [ ] **Step 4: Publicar el sitio estático**

Commit + push a `master` (GitHub Pages sirve la raíz). Verificar que `votar/index.html`, `admin/votos.html`, `js/votar.js`, `js/admin-votos.js` están en el commit.

- [ ] **Step 5: Humo en producción**

- `https://vestigia.fun/votar/` → carga, vota, ve resultados.
- Propón una ciudad → llega el email a `pierorepp90@gmail.com`.
- `https://vestigia.fun/admin/votos.html` → entra con `ADMIN_SECRET`, aprueba la propuesta.
- Termina una ruta real → envía una devolución → llega el email.

- [ ] **Step 6: Actualizar el README**

En `README.md`, sección "Poner en marcha el pago de verdad" / "Desplegar", añadir:
```markdown
## Base de datos (votación y devoluciones)

La votación de próxima ciudad y las devoluciones post-ruta se guardan en
Cloudflare D1 (`vestigia-db`, plan gratuito). Binding `DB` en
`worker/wrangler.toml`.

- Crear: `npx wrangler d1 create vestigia-db` (una vez; pegar el `database_id`).
- Migraciones: `npx wrangler d1 migrations apply vestigia-db --local` (dev) y
  `--remote` (producción). Viven en `worker/migrations/`.
- Secretos nuevos del Worker:
  - `IP_SALT` — `openssl rand -hex 16`, sal del hash de IP de los votos.
  - `ADMIN_SECRET` — frase larga para el panel `/admin/votos.html`.
- En local, `worker/.dev.vars` necesita `IP_SALT` y `ADMIN_SECRET` de pruebas.

Moderación de propuestas: `https://vestigia.fun/admin/votos.html` (noindex,
protegida por `ADMIN_SECRET`).
```

Y en "Tests", subir el recuento de tests al nuevo total.

- [ ] **Step 7: Commit**

```bash
git add README.md
git commit -m "$(printf 'Docs: README cubre D1, migraciones y secretos de votacion/devoluciones\n\nCo-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>')"
```

---

## Self-review del plan

**Cobertura de la spec:**
- §1 D1 + esquema + `db.js` → A1, A2, D1. ✓
- §1 semilla 6 capitales → A1 Step 3. ✓
- §2 página `/votar` runtime i18n, 3 estados, identidad UUID, reconciliación → C3, C4. ✓ (la reconciliación la da el servidor devolviendo `sin_voto` cuando ya no hay fila `en_espera` tras un rechazo — cubierto por `estadoDesdeVoto` + `rechazarPropuesta` que borra el voto).
- §2 endpoints (recuentos solo tras votar; voto con dedup+IP; propuesta) → B1, B2, B3. ✓
- §3 moderación `/admin/votos.html` + bearer + endpoints → B5, C6. ✓
- §3 anti-abuso: una propuesta pendiente por votante → B3 (`votoDeVotante` bloquea si ya hay voto o propuesta); una por IP → B3b. ✓ Límites de longitud → B3. ✓
- §8 coordinación con el endurecimiento de seguridad (throttle KV, token `v:1`, email-bombing de propuesta/devolución) → nota "Coordinación" + B3b + avisos en B6/D3. ✓
- §4 devolución en `vista-completada`, estrellas+categoría+texto+email, marca en progreso → D4, D5, D6. ✓
- §4 endpoint exige token, saca orderId, valida, guarda + email → D3. ✓
- §5 archivos nuevos/tocados → cubiertos en sus fases. ✓
- §6 tests (no revelar recuentos, un voto por votante, propuesta pendiente, aprobar/rechazar, admin bearer; devolución sin token/validación; db.js) → B1, B2, B5, D3, A2. ✓
- §7 privacidad → E3; hash de IP con sal → A3. ✓

**Escaneo de placeholders:** el plan contiene un typo deliberado señalado (`#fffدf` → `#fffdf7`) con instrucción de corregirlo; no quedan `TODO`/`TBD`. El texto de `legal/privacidad.html` se da literal. Traducciones dadas literales.

**Consistencia de tipos/nombres:**
- `db.*` reciben `env` (con `.DB`); tests pasan `{ DB }`. Handlers llaman `db.listarOpcionesVotables(env)` — coherente. ✓
- `handleModerarPropuesta(request, env, cors, db, opcionId)` — en `index.js` se llama con `undefined` en la posición de `db`; el `= dbPorDefecto` cubre. ✓
- `handleEnviarDevolucion(request, url, env, cors, db)` — firma consistente entre D3 y B6/index.js. ✓
- `estadoVotante` valores: `sin_voto` | `voto_activo` | `propuesta_pendiente` — consistentes entre `votacion.js`, tests y `votar.js`. ✓
- `parseEtiqueta` (servidor) vs `localizar` (cliente, de catalogo.js) — el servidor manda `etiqueta` ya como objeto; `votar.js` usa `localizar(o.etiqueta, lang)`. ✓
- Etiqueta-tags de SQL en `db.js` ↔ `fake-d1.js`: `opciones_votables`, `recuento_votos`, `voto_de_votante`, `opcion_por_id`, `contar_por_ip`, `insertar_voto`, `insertar_opcion`, `propuesta_pendiente_de_votante`, `propuestas_pendientes`, `actualizar_estado_opcion`, `activar_voto_en_espera`, `borrar_voto_en_espera`, `insertar_devolucion` — todas presentes en ambos. ✓

**Riesgo conocido:** `db.js` no se ejecuta contra SQLite real en los tests unitarios (doble en memoria). Mitigación: smoke tests manuales contra D1 local (B7, C4, C6, D6) y remota (E4) antes de dar por cerrado. Si en el futuro se quiere cobertura real de SQL, añadir un test con `wrangler d1 execute` o miniflare — fuera del alcance de este plan.

---

## Execution Handoff

Ver el mensaje del asistente para elegir modo de ejecución.

# Blog de historias — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Añadir un hub de 11 artículos de historia/curiosidades (uno por ciudad activa, en ES/EN/FR/IT) que capten búsquedas informativas y enlacen a la ruta de pago de cada ciudad.

**Architecture:** Mismo patrón que ya usa el resto del sitio — datos en `js/catalogo.js` (`HISTORIAS`), render cliente en dos módulos nuevos (`js/historias.js` para el índice, `js/historia.js` para la ficha de un post), páginas HTML estáticas por idioma generadas con `scripts/generar-historias.mjs` (ES) y una extensión de `scripts/generar-i18n.mjs` (EN/FR/IT) — sin Markdown, sin dependencias nuevas, sin build step.

**Tech Stack:** HTML/CSS/JS vanilla + Node (`node --test`), mismo patrón que `ciudad.js`/`ruta.js` y `generar-seo.mjs`/`generar-i18n.mjs`.

**Spec:** `docs/superpowers/specs/2026-08-24-blog-historias-design.md` (ya aprobado, incluida validación visual).

---

## Parte A — Datos y traducciones fijas

### Task 1: `HISTORIAS` en catalogo.js + test de integridad

**Files:**
- Modify: `js/catalogo.js` (añadir al final, después de `ciudadesRelacionadas`)
- Create: `tests/catalogo-historias.test.js`

- [ ] **Step 1: Añadir el array (vacío por ahora) y el helper al final de `js/catalogo.js`**

```js
/**
 * Un post de blog por ciudad — curiosidades reales que enlazan a la ruta
 * de pago correspondiente. `id` coincide con `ciudadSlug` (un post por
 * ciudad). `enlacesRutas` son 1 o 2 ids de RUTAS; `cierre` es el párrafo
 * final con placeholders {ruta1}/{ruta2} que el renderizador sustituye
 * por el enlace editorial real (ver js/historia.js).
 */
export const HISTORIAS = [];

export function historiaPorSlug(slug) {
  return HISTORIAS.find((h) => h.id === slug) || null;
}
```

- [ ] **Step 2: Escribir el test de integridad**

```js
// tests/catalogo-historias.test.js
//
// HISTORIAS (js/catalogo.js) tiene una forma distinta a CIUDADES/RUTAS:
// cada post lleva un array `secciones`, cada sección con sus propios
// campos traducibles. Este test evita que un post se añada con una
// traducción a medias o un enlace a una ruta que no existe.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HISTORIAS, RUTAS, CIUDADES, historiaPorSlug } from '../js/catalogo.js';
import { LANGS } from '../js/i18n.js';

const CAMPOS_HISTORIA = ['titulo', 'resumen', 'cierre'];
const CAMPOS_SECCION = ['titulo', 'texto'];

function assertCampoTraducido(objeto, etiqueta) {
  assert.ok(objeto && typeof objeto === 'object', `${etiqueta} no es un objeto {es,en,fr,it}`);
  for (const lang of LANGS) {
    assert.ok(typeof objeto[lang] === 'string' && objeto[lang].trim().length > 0, `${etiqueta}.${lang} está vacío o falta`);
  }
}

test('cada historia tiene los 4 idiomas, sin vacíos, en sus campos y en cada sección', () => {
  for (const historia of HISTORIAS) {
    for (const campo of CAMPOS_HISTORIA) {
      assertCampoTraducido(historia[campo], `${historia.id}.${campo}`);
    }
    assert.ok(Array.isArray(historia.secciones) && historia.secciones.length >= 4 && historia.secciones.length <= 6, `${historia.id}: debe tener entre 4 y 6 secciones`);
    historia.secciones.forEach((seccion, i) => {
      for (const campo of CAMPOS_SECCION) {
        assertCampoTraducido(seccion[campo], `${historia.id}.secciones[${i}].${campo}`);
      }
    });
  }
});

test('cada historia apunta a una ciudad y a 1-2 rutas que existen de verdad', () => {
  for (const historia of HISTORIAS) {
    assert.ok(CIUDADES.some((c) => c.slug === historia.ciudadSlug), `${historia.id}: ciudadSlug "${historia.ciudadSlug}" no existe en CIUDADES`);
    assert.ok(Array.isArray(historia.enlacesRutas) && historia.enlacesRutas.length >= 1 && historia.enlacesRutas.length <= 2, `${historia.id}: enlacesRutas debe tener 1 o 2 elementos`);
    for (const rutaId of historia.enlacesRutas) {
      assert.ok(RUTAS.some((r) => r.id === rutaId), `${historia.id}: enlacesRutas incluye "${rutaId}", que no existe en RUTAS`);
    }
  }
});

test('historiaPorSlug() encuentra por id y devuelve null si no existe', () => {
  if (HISTORIAS.length > 0) {
    assert.equal(historiaPorSlug(HISTORIAS[0].id), HISTORIAS[0]);
  }
  assert.equal(historiaPorSlug('ciudad-inventada-que-no-existe'), null);
});
```

- [ ] **Step 3: Correr los tests — deben pasar (vacuamente, `HISTORIAS` está vacío)**

Run: `npm test`
Expected: PASS — `tests/catalogo-historias.test.js` pasa sus 3 tests (los dos primeros no iteran nada todavía). Esto deja el test de integridad listo como red de seguridad *antes* de escribir contenido — cada tarea de contenido (Parte C) se valida contra él.

- [ ] **Step 4: Commit**

```bash
git add js/catalogo.js tests/catalogo-historias.test.js
git commit -m "Añade HISTORIAS (vacío) y su test de integridad"
```

### Task 2: Textos fijos de interfaz en js/i18n.js

**Files:**
- Modify: `js/i18n.js` (añadir 4 claves en cada uno de los 4 bloques de `DICT`)

- [ ] **Step 1: Añadir las claves al bloque `es` (después de `nav_idioma_label`)**

```js
    nav_idioma_label: 'Idioma',
    nav_historias: 'Historias',
```

Y después de `ciudad_ruta_cta` (ya existe `ciudad_otras_titulo` ahí desde la tarea de enlaces cruzados):

```js
    ciudad_otras_titulo: 'Otras ciudades',
    historias_titulo: 'Historias',
    historias_subtitulo: 'Curiosidades reales de cada ciudad, antes de pisarla.',
    historias_volver: 'Todas las historias',
```

- [ ] **Step 2: Añadir las mismas 4 claves al bloque `en`**

```js
    nav_idioma_label: 'Language',
    nav_historias: 'Stories',
```

```js
    ciudad_otras_titulo: 'Other cities',
    historias_titulo: 'Stories',
    historias_subtitulo: 'Real curiosities about each city, before you set foot in it.',
    historias_volver: 'All stories',
```

- [ ] **Step 3: Añadir las mismas 4 claves al bloque `fr`**

```js
    nav_idioma_label: 'Langue',
    nav_historias: 'Histoires',
```

```js
    ciudad_otras_titulo: 'Autres villes',
    historias_titulo: 'Histoires',
    historias_subtitulo: 'Des curiosités réelles sur chaque ville, avant d\'y poser le pied.',
    historias_volver: 'Toutes les histoires',
```

- [ ] **Step 4: Añadir las mismas 4 claves al bloque `it`**

```js
    nav_idioma_label: 'Lingua',
    nav_historias: 'Storie',
```

```js
    ciudad_otras_titulo: 'Altre città',
    historias_titulo: 'Storie',
    historias_subtitulo: 'Curiosità reali su ogni città, prima di metterci piede.',
    historias_volver: 'Tutte le storie',
```

- [ ] **Step 5: Correr los tests — la paridad de claves entre idiomas ya la cubre `tests/i18n.test.js`, sin cambios**

Run: `npm test`
Expected: PASS — si alguna de las 4 claves falta en algún idioma, `tests/i18n.test.js` ("todos los idiomas tienen exactamente las mismas claves") falla con el nombre exacto de la clave y el idioma.

- [ ] **Step 6: Commit**

```bash
git add js/i18n.js
git commit -m "Añade textos de interfaz para el blog de historias"
```

---

## Parte B — CSS

### Task 3: Estilos nuevos en css/styles.css

**Files:**
- Modify: `css/styles.css` (añadir al final del archivo)

- [ ] **Step 1: Añadir las clases nuevas**

```css
/* ---------- 13. Blog de historias ---------- */
.grid-historias {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 22px;
  margin-top: 30px;
}

.tarjeta-historia {
  display: block;
  text-decoration: none;
  color: inherit;
}

.tarjeta-historia__foto {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border-radius: var(--radio);
  margin-bottom: 10px;
}

.tarjeta-historia__titulo {
  font-size: 1.05rem;
  margin: 4px 0 0;
}

.historia-destacada {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 30px;
  align-items: center;
  margin-bottom: 50px;
  padding-bottom: 40px;
  border-bottom: 1px solid var(--paper-edge);
  text-decoration: none;
  color: inherit;
}

.historia-destacada__foto {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border-radius: var(--radio);
}

.historia-destacada__titulo {
  font-size: 1.9rem;
  margin: 6px 0 12px;
}

.historia-destacada__resumen {
  color: var(--ink-soft);
}

.seccion-relato {
  margin: 26px 0;
  padding: 22px 26px;
  background: var(--paper);
  border: 1px solid var(--paper-edge);
  border-left: 3px solid var(--lacre);
}

.seccion-relato__titulo {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--lacre);
  margin-bottom: 10px;
}

.seccion-relato__texto {
  margin: 0;
  color: var(--ink-soft);
}

.enlace-editorial {
  font-family: var(--font-display);
  font-style: italic;
  color: var(--lacre);
  text-decoration: underline;
  text-decoration-color: var(--paper-edge);
  text-underline-offset: 3px;
}

@media (max-width: 980px) {
  .grid-historias {
    grid-template-columns: 1fr 1fr;
  }
  .historia-destacada {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .grid-historias {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add css/styles.css
git commit -m "CSS para el índice y la ficha del blog de historias"
```

---

## Parte C — Render cliente

### Task 4: js/historias.js — índice (destacado + cuadrícula)

**Files:**
- Create: `js/historias.js`

- [ ] **Step 1: Escribir el módulo completo**

```js
// js/historias.js
// Índice del blog: un post destacado (el primero en HISTORIAS) + el resto
// en cuadrícula. Mismo patrón que js/portada.js.
import { HISTORIAS, ciudadPorSlug, localizar } from './catalogo.js';
import { aplicarI18n, detectarIdioma, poblarSelectorIdioma, t, urlRecurso } from './i18n.js';

// urlRecurso(relativo, prefijoDesdeRaiz) — el segundo argumento es cuánto
// subir para llegar a la raíz desde ESTA página cuando no lleva prefijo
// de idioma. historias/index.html está a la misma profundidad que
// ciudad/*.html o ruta/*.html (una carpeta bajo la raíz), así que usa
// '../', igual que ellas — no el valor por defecto ''.
export function tarjetaHistoria(historia, lang) {
  const ciudad = ciudadPorSlug(historia.ciudadSlug);
  const titulo = localizar(historia.titulo, lang);
  return `
  <a class="tarjeta-historia" href="${historia.id}.html">
    <img class="tarjeta-historia__foto" src="${urlRecurso(historia.imgHero, '../')}" alt="${titulo}" loading="lazy" width="900" height="675">
    <p class="eyebrow">${localizar(ciudad.nombre, lang)}</p>
    <h3 class="tarjeta-historia__titulo">${titulo}</h3>
  </a>`;
}

function historiaDestacadaHTML(historia, lang) {
  const ciudad = ciudadPorSlug(historia.ciudadSlug);
  return `
  <a class="historia-destacada" href="${historia.id}.html">
    <img class="historia-destacada__foto" src="${urlRecurso(historia.imgHero, '../')}" alt="${localizar(historia.titulo, lang)}">
    <div>
      <p class="eyebrow">${localizar(ciudad.nombre, lang)}</p>
      <h2 class="historia-destacada__titulo">${localizar(historia.titulo, lang)}</h2>
      <p class="historia-destacada__resumen">${localizar(historia.resumen, lang)}</p>
    </div>
  </a>`;
}

function init() {
  const lang = detectarIdioma();
  document.documentElement.lang = lang;
  aplicarI18n(document, lang);
  poblarSelectorIdioma(lang);

  if (HISTORIAS.length === 0) return;
  const [destacada, ...resto] = HISTORIAS;
  document.getElementById('historia-destacada').innerHTML = historiaDestacadaHTML(destacada, lang);
  document.getElementById('grid-historias').innerHTML = resto.map((h) => tarjetaHistoria(h, lang)).join('');
}

// Solo se ejecuta en el navegador — este módulo también se importa desde
// scripts/generar-i18n.mjs (Node, sin `document`) para reutilizar
// tarjetaHistoria() al generar las páginas estáticas.
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}
```

- [ ] **Step 2: Verificar que la firma real de `urlRecurso` coincide con lo usado arriba**

Run: `grep -n "export function urlRecurso" js/i18n.js`
Expected: `export function urlRecurso(relativo, prefijoDesdeRaiz = '')` — dos argumentos, coincide con las llamadas de este archivo.

- [ ] **Step 3: Commit**

```bash
git add js/historias.js
git commit -m "Añade js/historias.js: render del índice del blog"
```

### Task 5: js/historia.js — ficha de un post

**Files:**
- Create: `js/historia.js`

- [ ] **Step 1: Escribir el módulo completo**

```js
// js/historia.js
// Ficha de un post individual. Lee `data-historia` del <body>, busca los
// datos en el catálogo y arma el cuerpo del artículo, incluido el enlace
// editorial de cierre (sin botón — ver spec, sección "Diseño visual").
import { ciudadPorSlug, historiaPorSlug, localizar, rutaPorId } from './catalogo.js';
import { aplicarI18n, detectarIdioma, poblarSelectorIdioma, t, urlRecurso } from './i18n.js';

/** Sustituye {ruta1}/{ruta2} en `cierre` por el enlace editorial real a esa ruta. */
export function cierreConEnlaces(historia, lang) {
  let texto = localizar(historia.cierre, lang);
  historia.enlacesRutas.forEach((rutaId, i) => {
    const ruta = rutaPorId(rutaId);
    const enlace = `<a class="enlace-editorial" href="../ruta/${rutaId}.html">${localizar(ruta.titulo, lang)}</a>`;
    texto = texto.replace(`{ruta${i + 1}}`, enlace);
  });
  return texto;
}

function seccionHTML(seccion, lang) {
  return `
    <div class="seccion-relato">
      <p class="seccion-relato__titulo">${localizar(seccion.titulo, lang)}</p>
      <p class="seccion-relato__texto">${localizar(seccion.texto, lang)}</p>
    </div>`;
}

function init() {
  const slug = document.body.dataset.historia;
  const historia = historiaPorSlug(slug);
  const lang = detectarIdioma();
  document.documentElement.lang = lang;

  if (!historia) {
    document.getElementById('historia-contenido').innerHTML = '<p class="contenedor">Historia no encontrada.</p>';
    return;
  }

  aplicarI18n(document, lang);
  poblarSelectorIdioma(lang);

  const ciudad = ciudadPorSlug(historia.ciudadSlug);
  const titulo = localizar(historia.titulo, lang);
  const nombreCiudad = localizar(ciudad.nombre, lang);

  document.title = `${titulo} — Vestigia`;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content', localizar(historia.resumen, lang));

  document.getElementById('migas-ciudad').textContent = nombreCiudad;
  document.getElementById('migas-historia').textContent = titulo;

  document.getElementById('historia-foto').src = urlRecurso(historia.imgHero, '../');
  document.getElementById('historia-foto').alt = titulo;
  document.getElementById('historia-eyebrow').textContent = nombreCiudad;
  document.getElementById('historia-titulo').textContent = titulo;
  document.getElementById('historia-resumen').textContent = localizar(historia.resumen, lang);
  document.getElementById('historia-secciones').innerHTML = historia.secciones.map((s) => seccionHTML(s, lang)).join('');
  document.getElementById('historia-cierre').innerHTML = cierreConEnlaces(historia, lang);
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add js/historia.js
git commit -m "Añade js/historia.js: render de la ficha de un post"
```

---

## Parte D — Páginas HTML estáticas (español)

### Task 6: historias/index.html

**Files:**
- Create: `historias/index.html`

- [ ] **Step 1: Leer `ciudad/roma.html` para copiar exactamente el header/footer/selector-idioma (no reinventar la estructura)**

Run: `cat ciudad/roma.html`

- [ ] **Step 2: Crear `historias/index.html` con esa misma cabecera/pie, y el cuerpo propio del índice**

```html
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Historias — Vestigia</title>
<meta name="description" content="Curiosidades reales de cada ciudad, antes de pisarla.">
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
      <span class="marca__texto">
        <span class="marca__nombre">Vestigia</span>
        <span class="marca__tagline" data-i18n="brand_tagline">Una manera divertida de conocer la ciudad</span>
      </span>
    </a>
    <nav class="nav-principal" aria-label="Navegación principal">
      <a href="../index.html#ciudades" data-i18n="nav_ciudades">Ciudades</a>
      <a href="../index.html#como-funciona" data-i18n="nav_como_funciona">Cómo funciona</a>
      <a href="index.html" data-i18n="nav_historias">Historias</a>
      <div class="selector-idioma" id="selector-idioma" role="group" data-i18n-attr="aria-label:nav_idioma_label"></div>
    </nav>
  </div>
</header>

<main>
  <div class="contenedor" style="padding-top:36px;">
    <p class="eyebrow" data-i18n="historias_titulo">Historias</p>
    <p class="seccion-ciudades__subtitulo" data-i18n="historias_subtitulo">Curiosidades reales de cada ciudad, antes de pisarla.</p>

    <div id="historia-destacada"></div>
    <div class="grid-historias" id="grid-historias"></div>
  </div>
</main>

<footer class="pie">
  <div class="contenedor">
    <p class="pie__derechos" id="pie-derechos"></p>
    <nav class="pie__enlaces" aria-label="Legal">
      <a href="../legal/aviso.html" data-i18n="footer_legal_aviso">Aviso legal</a>
      <a href="../legal/privacidad.html" data-i18n="footer_legal_privacidad">Privacidad</a>
      <a href="../legal/condiciones.html" data-i18n="footer_legal_condiciones">Condiciones</a>
      <a href="../assets/img/ciudades/CREDITOS.md" data-i18n="footer_creditos">Créditos de imágenes</a>
    </nav>
  </div>
</footer>

<script type="module" src="../js/historias.js"></script>
<script type="module">
  import { tf, detectarIdioma } from '../js/i18n.js';
  document.getElementById('pie-derechos').textContent = tf(detectarIdioma(), 'footer_rights', { year: new Date().getFullYear() });
</script>
</body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add historias/index.html
git commit -m "Añade historias/index.html"
```

### Task 7: historias/<slug>.html — plantilla + 11 páginas

**Files:**
- Create: `historias/barcelona.html`, `historias/roma.html`, `historias/paris.html`, `historias/lisboa.html`, `historias/florencia.html`, `historias/madrid.html`, `historias/valencia.html`, `historias/napoles.html`, `historias/toulouse.html`, `historias/berlin.html`, `historias/istanbul.html`

- [ ] **Step 1: Leer `ruta/roma-centro.html` para copiar el patrón de migas de pan + hero + secciones + footer**

Run: `cat ruta/roma-centro.html`

- [ ] **Step 2: Crear `historias/barcelona.html` (la plantilla canónica) con `data-historia="barcelona"`**

```html
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Historia — Vestigia</title>
<meta name="description" content="Ficha de la historia.">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='46' fill='%23f4ead0' stroke='%239c2b1f' stroke-width='5'/%3E%3Cpath d='M50 14 L60 45 L50 86 L40 45 Z' fill='%239c2b1f'/%3E%3Cpath d='M14 50 L45 40 L86 50 L45 60 Z' fill='%23241a10' opacity='0.65'/%3E%3C/svg%3E">
<link rel="stylesheet" href="../css/styles.css">
</head>
<body data-historia="barcelona">

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
      <span class="marca__texto">
        <span class="marca__nombre">Vestigia</span>
        <span class="marca__tagline" data-i18n="brand_tagline">Una manera divertida de conocer la ciudad</span>
      </span>
    </a>
    <nav class="nav-principal" aria-label="Navegación principal">
      <a href="../index.html#ciudades" data-i18n="nav_ciudades">Ciudades</a>
      <a href="../index.html#como-funciona" data-i18n="nav_como_funciona">Cómo funciona</a>
      <a href="index.html" data-i18n="nav_historias">Historias</a>
      <div class="selector-idioma" id="selector-idioma" role="group" data-i18n-attr="aria-label:nav_idioma_label"></div>
    </nav>
  </div>
</header>

<main id="historia-contenido">
  <nav class="migas contenedor" aria-label="Migas de pan">
    <a href="index.html" data-i18n="historias_volver">Todas las historias</a>
    <span class="separador">/</span>
    <span class="actual" id="migas-ciudad">Ciudad</span>
    <span class="separador">/</span>
    <span class="actual" id="migas-historia">Historia</span>
  </nav>

  <div class="contenedor" style="max-width:720px;">
    <img class="ruta-detalle__foto" id="historia-foto" src="" alt="">
    <p class="eyebrow" id="historia-eyebrow"></p>
    <h1 class="ruta-detalle__titulo" id="historia-titulo"></h1>
    <p class="ruta-detalle__resumen" id="historia-resumen"></p>

    <div id="historia-secciones"></div>

    <p id="historia-cierre"></p>
  </div>
</main>

<footer class="pie">
  <div class="contenedor">
    <p class="pie__derechos" id="pie-derechos"></p>
    <nav class="pie__enlaces" aria-label="Legal">
      <a href="../legal/aviso.html" data-i18n="footer_legal_aviso">Aviso legal</a>
      <a href="../legal/privacidad.html" data-i18n="footer_legal_privacidad">Privacidad</a>
      <a href="../legal/condiciones.html" data-i18n="footer_legal_condiciones">Condiciones</a>
      <a href="../assets/img/ciudades/CREDITOS.md" data-i18n="footer_creditos">Créditos de imágenes</a>
    </nav>
  </div>
</footer>

<script type="module" src="../js/historia.js"></script>
<script type="module">
  import { tf, detectarIdioma } from '../js/i18n.js';
  document.getElementById('pie-derechos').textContent = tf(detectarIdioma(), 'footer_rights', { year: new Date().getFullYear() });
</script>
</body>
</html>
```

- [ ] **Step 3: Duplicar para las otras 10 ciudades vía sed**

```bash
for slug in roma paris lisboa florencia madrid valencia napoles toulouse berlin istanbul; do
  sed "s/data-historia=\"barcelona\"/data-historia=\"$slug\"/" historias/barcelona.html > "historias/$slug.html"
done
```

- [ ] **Step 4: Verificar que las 11 páginas existen y cada una tiene el `data-historia` correcto**

Run: `grep -o 'data-historia="[a-z]*"' historias/*.html`
Expected: 11 líneas, una por archivo, cada `data-historia` coincidiendo con el nombre del archivo (barcelona.html → `data-historia="barcelona"`, etc.)

- [ ] **Step 5: Commit**

```bash
git add historias/*.html
git commit -m "Añade las 11 páginas historias/<ciudad>.html"
```

### Task 8: Enlace "Historias" en la navegación de las páginas existentes

**Files:**
- Modify: `index.html`, `ciudad/*.html` (11), `ruta/*.html` (16)

- [ ] **Step 1: Insertar el enlace en `index.html` (nav sin prefijo `../`, apunta a `historias/index.html`)**

```bash
perl -0pi -e 's{(<a href="#como-funciona" data-i18n="nav_como_funciona">Cómo funciona</a>)}{$1\n      <a href="historias/index.html" data-i18n="nav_historias">Historias</a>}' index.html
```

- [ ] **Step 2: Insertar el enlace en `ciudad/*.html` y `ruta/*.html` (nav con prefijo `../historias/`)**

```bash
for f in ciudad/*.html ruta/*.html; do
  perl -0pi -e 's{(<a href="\.\./index\.html#como-funciona" data-i18n="nav_como_funciona">Cómo funciona</a>)}{$1\n      <a href="../historias/index.html" data-i18n="nav_historias">Historias</a>}' "$f"
done
```

- [ ] **Step 3: Verificar que las 28 páginas (1 + 11 + 16) tienen el enlace nuevo**

Run: `grep -lc 'nav_historias' index.html ciudad/*.html ruta/*.html | wc -l`
Expected: `28`

- [ ] **Step 4: Commit**

```bash
git add index.html ciudad/*.html ruta/*.html
git commit -m "Añade el enlace \"Historias\" a la navegación principal"
```

---

## Parte E — Generación estática y SEO técnico

### Task 9: 'historia' y 'historia-indice' en scripts/sitio-i18n.mjs

Va antes que la Task 10 porque `generar-historias.mjs` depende de estos
dos tipos de página nuevos.

**Files:**
- Modify: `scripts/sitio-i18n.mjs`

- [ ] **Step 1: Añadir los dos tipos de página (el índice del blog y cada post)**

```js
export function rutaRelativa(tipo, params = {}) {
  if (tipo === 'index') return 'index.html';
  if (tipo === 'ciudad') return `ciudad/${params.slug}.html`;
  if (tipo === 'ruta') return `ruta/${params.id}.html`;
  if (tipo === 'historia-indice') return 'historias/index.html';
  if (tipo === 'historia') return `historias/${params.id}.html`;
  throw new Error(`Tipo de página desconocido: ${tipo}`);
}
```

- [ ] **Step 2: Confirmar que el módulo sigue cargando sin errores de sintaxis**

Run: `node -e "import('./scripts/sitio-i18n.mjs').then(() => console.log('ok'))"`
Expected: `ok`

- [ ] **Step 3: Commit**

```bash
git add scripts/sitio-i18n.mjs
git commit -m "sitio-i18n.mjs: añade los tipos de página 'historia' y 'historia-indice'"
```

### Task 10: scripts/generar-historias.mjs

**Files:**
- Create: `scripts/generar-historias.mjs`

- [ ] **Step 1: Escribir el script (mismo patrón que `scripts/generar-seo.mjs`, adaptado al esquema de HISTORIAS)**

```js
#!/usr/bin/env node
// scripts/generar-historias.mjs
//
// Rellena <title>/<meta description>/canonical+hreflang/JSON-LD de cada
// historias/<slug>.html (español) con los datos reales de js/catalogo.js.
// Se ejecuta a mano cada vez que se añade o cambia un post — igual que
// generar-seo.mjs con las rutas. No toca sitemap.xml: lo genera
// generar-i18n.mjs, que sabe si las variantes /en/ /fr/ /it/ existen.
//
// Uso (en este orden — generar-i18n.mjs reutiliza el resultado de este):
//   node scripts/generar-historias.mjs && node scripts/generar-i18n.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { HISTORIAS } from '../js/catalogo.js';
import { BASE_URL, bloqueCanonicalYHreflang } from './sitio-i18n.mjs';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.join(AQUI, '..');

function escaparTexto(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
}
function escaparAtributo(s) {
  return escaparTexto(s).replace(/"/g, '&quot;');
}
function truncar(texto, maxLen) {
  if (texto.length <= maxLen) return texto;
  const cortado = texto.slice(0, maxLen);
  const i = cortado.lastIndexOf(' ');
  return `${cortado.slice(0, i)}…`;
}

function jsonLdHistoria(historia) {
  const datos = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: historia.titulo.es,
    description: historia.resumen.es,
    image: `${BASE_URL}/${historia.imgHero}`,
    author: { '@type': 'Organization', name: 'Vestigia' },
    publisher: { '@type': 'Organization', name: 'Vestigia' },
  };
  return `<script type="application/ld+json" id="ld-articulo">\n${JSON.stringify(datos, null, 2)}\n</script>`;
}

function actualizarHistoria(historia) {
  const destino = path.join(RAIZ, 'historias', `${historia.id}.html`);
  let html = readFileSync(destino, 'utf8');

  html = html.replace(/<title>.*?<\/title>/, `<title>${escaparTexto(historia.titulo.es)} — Vestigia</title>`);
  html = html.replace(/<meta name="description" content=".*?">/, `<meta name="description" content="${escaparAtributo(truncar(historia.resumen.es, 155))}">`);

  const idCanonical = 'canonical-hreflang';
  const bloqueCanonical = `<!-- ${idCanonical} -->\n${bloqueCanonicalYHreflang('es', 'historia', { id: historia.id })}\n<!-- /${idCanonical} -->`;
  const marcador = new RegExp(`<!-- ${idCanonical} -->[\\s\\S]*?<!-- /${idCanonical} -->`);
  html = marcador.test(html) ? html.replace(marcador, bloqueCanonical) : html.replace('</head>', `${bloqueCanonical}\n</head>`);

  const ldTag = jsonLdHistoria(historia);
  const idLd = /<script type="application\/ld\+json" id="ld-articulo">[\s\S]*?<\/script>/;
  html = idLd.test(html) ? html.replace(idLd, ldTag) : html.replace('</head>', `${ldTag}\n</head>`);

  writeFileSync(destino, html, 'utf8');
  console.log(`historias/${historia.id}.html: título, descripción, canonical/hreflang y JSON-LD actualizados`);
}

for (const historia of HISTORIAS) {
  actualizarHistoria(historia);
}
```

- [ ] **Step 2: Correr contra el índice vacío de HISTORIAS actual (no debe fallar aunque no haga nada todavía)**

Run: `node scripts/generar-historias.mjs`
Expected: sin salida (el `for` no itera nada porque `HISTORIAS` sigue vacío hasta la Parte F) y sin errores.

- [ ] **Step 3: Commit**

```bash
git add scripts/generar-historias.mjs
git commit -m "Añade scripts/generar-historias.mjs"
```

### Task 11: /en/ /fr/ /it/ para historias/ en scripts/generar-i18n.mjs

**Files:**
- Modify: `scripts/generar-i18n.mjs`

- [ ] **Step 1: Importar lo necesario de catalogo.js y de los nuevos módulos cliente**

```js
import { CIUDADES, RUTAS, HISTORIAS, ciudadPorSlug, ciudadesRelacionadas, localizar, rutaPorId, rutasHermanas, rutasPorCiudad } from '../js/catalogo.js';
import { tarjetaHistoria } from '../js/historias.js';
import { cierreConEnlaces } from '../js/historia.js';
```

- [ ] **Step 2: Añadir `generarHistoriasIndice(lang)` (mismo patrón que `generarIndice`)**

```js
function generarHistoriasIndice(lang) {
  const plantilla = readFileSync(path.join(RAIZ, 'historias', 'index.html'), 'utf8');
  let html = quitarBloqueCanonicalExistente(plantilla.replace(/<html lang="es">/, `<html lang="${lang}" data-idioma-pagina="${lang}">`));

  html = html.replace(/<title>.*?<\/title>/, `<title>${escaparTexto(t(lang, 'historias_titulo'))} — Vestigia</title>`);
  html = html.replace(/<meta name="description" content=".*?">/, `<meta name="description" content="${escaparAtributo(truncar(t(lang, 'historias_subtitulo'), 155))}">`);

  const bloque = bloqueCanonicalYHreflang(lang, 'historia-indice', {});
  html = html.replace('<link rel="stylesheet" href="../css/styles.css">', `<link rel="stylesheet" href="${BASE_URL}/css/styles.css">\n${bloque}`);

  html = aplicarI18nAtributos(aplicarI18nTexto(html, lang), lang);
  html = reescribirEnlacesInicio(html, lang);

  if (HISTORIAS.length > 0) {
    const [destacada, ...resto] = HISTORIAS;
    const destacadaHTML = absolutizarImagenesDeTarjetas(`
      <a class="historia-destacada" href="${destacada.id}.html">
        <img class="historia-destacada__foto" src="../${destacada.imgHero}" alt="${escaparAtributo(localizar(destacada.titulo, lang))}">
        <div>
          <p class="eyebrow">${escaparTexto(localizar(ciudadPorSlug(destacada.ciudadSlug).nombre, lang))}</p>
          <h2 class="historia-destacada__titulo">${escaparTexto(localizar(destacada.titulo, lang))}</h2>
          <p class="historia-destacada__resumen">${escaparTexto(localizar(destacada.resumen, lang))}</p>
        </div>
      </a>`);
    html = conHTML(html, 'historia-destacada', destacadaHTML);

    const gridHTML = resto.map((h) => absolutizarImagenesDeTarjetas(tarjetaHistoria(h, lang))).join('');
    html = conHTML(html, 'grid-historias', gridHTML);
  }

  html = conTexto(html, 'pie-derechos', tf(lang, 'footer_rights', { year: new Date().getFullYear() }));
  html = quitarScriptPieDerechos(html);
  html = absolutizarRecursosCompartidos(html);

  const destino = path.join(RAIZ, lang, 'historias', 'index.html');
  mkdirSync(path.dirname(destino), { recursive: true });
  writeFileSync(destino, html, 'utf8');
}
```

- [ ] **Step 3: Añadir `generarHistoria(historia, lang)` (mismo patrón que `generarRuta`, pero sin panel de precio ni CTA de compra — solo foto, eyebrow, título, resumen, secciones y cierre)**

```js
function generarHistoria(historia, lang) {
  const plantilla = readFileSync(path.join(RAIZ, 'historias', `${historia.id}.html`), 'utf8');
  const ciudad = ciudadPorSlug(historia.ciudadSlug);

  let html = quitarBloqueCanonicalExistente(plantilla.replace(/<html lang="es">/, `<html lang="${lang}" data-idioma-pagina="${lang}">`));

  const titulo = localizar(historia.titulo, lang);
  const nombreCiudad = localizar(ciudad.nombre, lang);

  html = html.replace(/<title>.*?<\/title>/, `<title>${escaparTexto(`${titulo} — Vestigia`)}</title>`);
  html = html.replace(/<meta name="description" content=".*?">/, `<meta name="description" content="${escaparAtributo(truncar(localizar(historia.resumen, lang), 155))}">`);

  const bloque = bloqueCanonicalYHreflang(lang, 'historia', { id: historia.id });
  html = html.replace('<link rel="stylesheet" href="../css/styles.css">', `<link rel="stylesheet" href="${BASE_URL}/css/styles.css">\n${bloque}`);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: titulo,
    description: localizar(historia.resumen, lang),
    image: `${BASE_URL}/${historia.imgHero}`,
    author: { '@type': 'Organization', name: 'Vestigia' },
    publisher: { '@type': 'Organization', name: 'Vestigia' },
  };
  const ldTag = `<script type="application/ld+json" id="ld-articulo">\n${JSON.stringify(jsonLd, null, 2)}\n</script>`;
  const idLd = /<script type="application\/ld\+json" id="ld-articulo">[\s\S]*?<\/script>/;
  html = idLd.test(html) ? html.replace(idLd, ldTag) : html.replace('</head>', `${ldTag}\n</head>`);

  html = aplicarI18nAtributos(aplicarI18nTexto(html, lang), lang);
  html = reescribirEnlacesInicio(html, lang);

  html = conTexto(html, 'migas-ciudad', nombreCiudad);
  html = conTexto(html, 'migas-historia', titulo);
  html = conAtributo(html, 'historia-foto', 'src', `${BASE_URL}/${historia.imgHero}`);
  html = conAtributo(html, 'historia-foto', 'alt', titulo);
  html = conTexto(html, 'historia-eyebrow', nombreCiudad);
  html = conTexto(html, 'historia-titulo', titulo);
  html = conTexto(html, 'historia-resumen', localizar(historia.resumen, lang));

  const seccionesHTML = historia.secciones
    .map((s) => `<div class="seccion-relato"><p class="seccion-relato__titulo">${escaparTexto(localizar(s.titulo, lang))}</p><p class="seccion-relato__texto">${escaparTexto(localizar(s.texto, lang))}</p></div>`)
    .join('');
  html = conHTML(html, 'historia-secciones', seccionesHTML);
  html = conHTML(html, 'historia-cierre', cierreConEnlaces(historia, lang));

  html = conTexto(html, 'pie-derechos', tf(lang, 'footer_rights', { year: new Date().getFullYear() }));
  html = quitarScriptPieDerechos(html);
  html = absolutizarRecursosCompartidos(html);

  const destino = path.join(RAIZ, lang, 'historias', `${historia.id}.html`);
  mkdirSync(path.dirname(destino), { recursive: true });
  writeFileSync(destino, html, 'utf8');
}
```

**Nota:** `cierreConEnlaces()` (importado de `js/historia.js`) construye el `href` como `../ruta/${rutaId}.html` — correcto para `historias/<slug>.html` (profundidad 1) y también para `en/historias/<slug>.html` (misma profundidad relativa dentro de su propio árbol de idioma, igual que ya pasa con `ciudad/`/`ruta/`). No hace falta adaptarlo.

- [ ] **Step 4: Añadir hreflang a `historias/index.html` en español (mismo patrón que `agregarHreflangIndiceEs`/`agregarHreflangCiudadEs`)**

```js
function agregarHreflangHistoriasIndiceEs() {
  const destino = path.join(RAIZ, 'historias', 'index.html');
  let html = readFileSync(destino, 'utf8');
  html = insertarBloqueIdempotente(html, '<link rel="stylesheet" href="../css/styles.css">', bloqueCanonicalYHreflang(DEFAULT_LANG, 'historia-indice', {}));
  writeFileSync(destino, html, 'utf8');
}
```

- [ ] **Step 5: Añadir `historias/<slug>.html` a `generarSitemap()`**

```js
function generarSitemap() {
  const paginas = [{ tipo: 'index', params: {} }, { tipo: 'historia-indice', params: {} }];
  for (const c of CIUDADES_ACTIVAS) paginas.push({ tipo: 'ciudad', params: { slug: c.slug } });
  for (const r of RUTAS) paginas.push({ tipo: 'ruta', params: { id: r.id } });
  for (const h of HISTORIAS) paginas.push({ tipo: 'historia', params: { id: h.id } });
  // resto de la función sin cambios
```

- [ ] **Step 6: Llamar a las funciones nuevas en la ejecución del script (junto a `generarIndice`/`generarCiudad`/`generarRuta`)**

```js
agregarHreflangIndiceEs();
agregarHreflangHistoriasIndiceEs();
console.log('index.html + historias/index.html (es): canonical/hreflang añadidos');
for (const ciudad of CIUDADES_ACTIVAS) {
  agregarHreflangCiudadEs(ciudad);
}

for (const lang of IDIOMAS_NUEVOS) {
  generarIndice(lang);
  generarHistoriasIndice(lang);
  for (const ciudad of CIUDADES_ACTIVAS) generarCiudad(ciudad, lang);
  for (const ruta of RUTAS) generarRuta(ruta, lang);
  for (const historia of HISTORIAS) generarHistoria(historia, lang);
  console.log(`${lang}/: portada + historias + ${CIUDADES_ACTIVAS.length} ciudades + ${RUTAS.length} rutas + ${HISTORIAS.length} historias generadas`);
}
```

- [ ] **Step 7: Correr con HISTORIAS todavía vacío — no debe fallar**

Run: `node scripts/sitio-i18n.mjs` primero para confirmar que exporta sin error de sintaxis (`node -e "import('./scripts/sitio-i18n.mjs').then(() => console.log('ok'))"`), luego `node scripts/generar-historias.mjs && node scripts/generar-i18n.mjs`
Expected: genera `en/historias/index.html`, `fr/historias/index.html`, `it/historias/index.html` (vacíos de tarjetas porque `HISTORIAS` sigue vacío) sin errores; `sitemap.xml` pasa a listar `historias/index.html` en los 4 idiomas (116 URLs: 112 + 4).

- [ ] **Step 8: Commit**

```bash
git add scripts/generar-i18n.mjs
git commit -m "generar-i18n.mjs: genera /en/ /fr/ /it/ para historias/"
```

---

## Parte F — Contenido: los 11 posts en español

### Task 12: Brief de hechos reales por ciudad (preparación, sin despachar todavía)

**Files:** ninguno — este task es investigación, no código. El resultado son los 11 briefs de abajo, ya con ángulos reales y distintos de los que usa cada ruta como respuesta de enigma.

**Regla dura de todo el lote:** antes de escribir cada post, releer el/los archivo(s) `worker/src/contenido/<rutaId>.es.json` de esa ciudad y confirmar que ninguno de los hechos elegidos abajo coincide con una respuesta de enigma. Si hay solape, cambiar el ángulo.

| Ciudad (id) | Ruta(s) enlazada(s) | Ángulo real, distinto del enigma |
|---|---|---|
| `barcelona` | barcelona-gotic, barcelona-born o barcelona-raval (elegir 1-2 según qué facilite el cierre) | Buena parte del Barri Gòtic "medieval" es en realidad de los años 1920-30: un revival neogótico construido de cara a la Exposición Internacional de 1929 (ejemplo verificable: el Pont del Bisbe, que parece del s. XV, es de 1928) |
| `roma` | roma-trastevere | Trastevere ("al otro lado del Tíber") tuvo un dialecto propio (romanesco) y sus vecinos se consideraban los "verdaderos" romanos, distintos del resto de la ciudad; barrio históricamente popular/de comunidades judía y siria en la Antigüedad, no aristocrático |
| `paris` | paris-montmartre | **Ángulo revisado tras verificar contra el enigma real (ver nota debajo de la tabla): la Comuna de París de 1871**, no el Bateau-Lavoir. Montmartre fue donde empezó la revuelta (marzo de 1871, el ejército intentó requisar los cañones de la Guardia Nacional guardados en la colina, la población se resistió, dos generales fueron fusilados ahí mismo); la Comuna duró dos meses y terminó con miles de muertos en la "Semana Sangrienta". Sacré-Cœur se construyó después, oficialmente como acto de "reparación nacional" — un monumento que hoy se ve como símbolo turístico blanco y sereno nació, en buena parte, como penitencia por una derrota sangrienta en ese mismo sitio. **Título revisado**: "Por qué Sacré-Cœur es un monumento a una derrota, no una victoria" |
| `lisboa` | lisboa-alfama | **Ángulo ajustado tras verificar contra el enigma real** (la ruta ya cuenta, en la historia de una parada, el contraste Pombal/cuadrícula vs. Alfama/trazado medieval — no repetir eso tal cual). Angulo principal: origen disputado del fado (¿marineros? ¿esclavos liberados? ¿exiliados brasileños que volvían de Brasil?) y la etimología del propio nombre "Alfama", del árabe *al-hamma* ("los baños termales" — hubo baños públicos árabes ahí). Si se menciona el terremoto de 1755, un detalle MÁS TÉCNICO y distinto del que ya cuenta la ruta: la razón por la que Alfama no se derrumbó no fue solo "poca destrucción" sino la geología — está construida sobre roca firme, mientras la Baixa (que sí se reconstruyó en cuadrícula) estaba sobre suelo aluvial blando que se licuó con el temblor. Título sin cambios: "Alfama sobrevivió al terremoto que borró media Lisboa: así se nota todavía" (el título sigue encajando con el ángulo geológico, más técnico y específico que lo que ya cuenta la ruta) |
| `florencia` | florencia-centro y/o florencia-santacroce | Brunelleschi ganó el concurso de la cúpula ocultando su método incluso durante la obra (miedo a que se lo copiaran); la anécdota del huevo partido en la mesa para demostrar que nadie más tenía la solución; rivalidad de gremios tallada en las hornacinas de Orsanmichele |
| `madrid` | madrid-austrias | **Verificar antes de escribir** — el escudo actual de Madrid (oso y madroño) tuvo versiones heráldicas anteriores distintas; confirmar con una fuente fiable el detalle exacto antes de afirmar qué animal aparecía y cuándo desapareció. Si no se puede verificar con solidez, cambiar el ángulo a la evolución documentada del escudo en general, sin nombrar un animal concreto no confirmado |
| `valencia` | valencia-carmen | El cáliz de la Catedral de Valencia es uno de los candidatos a Santo Grial con mejor rastro documental (ágata/sardónice del s. I, con registro de custodia que se remonta a época temprana; llega a la catedral en 1436); Benedicto XVI ofició misa con él en 2006 |
| `napoles` | napoles-spaccanapoli | Nápoles tuvo una ciudad griega predecesora, Paleópolis, antes de Neápolis ("ciudad nueva"); la red de canteras/túneles bajo la ciudad, cavada por griegos, reutilizada como acueducto romano y como refugio antiaéreo en la Segunda Guerra Mundial |
| `toulouse` | toulouse-capitole | El ladrillo no fue elección estética sino necesidad: la cuenca del Garona no tiene canteras de piedra cercanas pero sí arcilla; el apodo "Ciudad Rosa" describe específicamente el color al atardecer, no el material en sí; Toulouse fue capital de un condado semi-independiente hasta la cruzada albigense (s. XIII) |
| `berlin` | berlin-mitte | Los Stolpersteine ("piedras de tropiezo"): placas de latón incrustadas en la propia acera frente al último domicilio conocido de víctimas del Holocausto — el memorial descentralizado más grande del mundo (más de 100.000 en toda Europa), que se pisa a diario sin que la mayoría note qué es |
| `istanbul` | istanbul-sultanahmet | La ciudad tuvo tres nombres oficiales en su historia (Bizancio → Constantinopla → Estambul, este último oficial recién en 1930); teoría del origen del nombre "Estambul" en la expresión griega *eis tin polin* ("hacia la ciudad"), no en una palabra turca |

- [x] **Step 1: Confirmar que ninguno de los ángulos de arriba aparece en el archivo `.es.json` correspondiente**

Run: `grep -il "pombal\|1929\|romanesco\|bateau-lavoir\|paleopoli\|stolperstein" worker/src/contenido/*.es.json`

**Ejecutado — encontró 2 solapes reales, ya corregidos en la tabla de arriba:**
- `paris-montmartre.es.json`: el Bateau-Lavoir no es una mención de paso — es la parada 3 completa ("El barco que nunca flotó"), enigma e historia incluidos. Ángulo y título de `paris` reemplazados por la Comuna de París de 1871 (ver tabla).
- `lisboa-alfama.es.json`: mención de paso dentro de la `historia` de otra parada (contraste Pombal/cuadrícula vs. Alfama/trazado medieval) — no es la respuesta de un enigma, pero es el mismo hecho que iba a liderar el post. Ángulo de `lisboa` ajustado para llevar el fado y la etimología árabe como eje principal, con un detalle geológico distinto (no repetido) si se menciona el terremoto. Título sin cambios.

El resto de las 9 filas no tuvo coincidencias — sus ángulos originales siguen en pie sin cambios.

### Task 13: Despachar y escribir los 11 posts en español

**Files:**
- Modify: `js/catalogo.js` (once entradas nuevas en `HISTORIAS`)

- [ ] **Step 1: Despachar un subagente por ciudad, en paralelo, con este prompt (sustituyendo `<CIUDAD>`, `<ÁNGULO>` y `<RUTA(S)>` por los de la tabla de la Task 12)**

```
Tarea: escribir un post de blog en español para Vestigia sobre <CIUDAD>,
en el archivo js/catalogo.js (array HISTORIAS, al final).

Título ya fijado (no cambiar): "<TÍTULO YA APROBADO DE LA TABLA DEL SPEC>"

Ángulo real a desarrollar: <ÁNGULO>

Esquema exacto de la entrada a añadir a HISTORIAS (ver también las
entradas ya existentes en CIUDADES/RUTAS del mismo archivo para el tono):

{
  id: '<slug-ciudad>',
  ciudadSlug: '<slug-ciudad>',
  imgHero: '<ruta a una foto YA EXISTENTE en assets/img/ciudades/ — de
             la ciudad o de una de sus rutas, revisa el archivo para
             elegir una que encaje>',
  titulo: { es: '<el título ya fijado, arriba>', en: '', fr: '', it: '' },
  resumen: { es: '<1-2 frases, será el excerpt del índice y la meta
              description — no puede pasar de 155 caracteres>', en: '', fr: '', it: '' },
  secciones: [
    { titulo: { es: '...', en: '', fr: '', it: '' }, texto: { es: '...', en: '', fr: '', it: '' } },
    // 4 a 6 secciones en total
  ],
  enlacesRutas: ['<id de RUTAS>'],  // 1 o 2 ids reales
  cierre: { es: '...menciona {ruta1} (y {ruta2} si aplica) de forma natural...', en: '', fr: '', it: '' },
}

Deja los campos en/fr/it como strings vacíos '' por ahora — se traducen
en una tarea aparte. Escribe solo el es.

Reglas:
- Todos los hechos deben ser reales y verificables — si algo no puedes
  confirmarlo con solidez, no lo incluyas.
- NINGÚN hecho puede coincidir con la respuesta de un enigma de
  worker/src/contenido/<rutaId>.es.json para las rutas de esta ciudad —
  léelo primero y evita superposición.
- Tono: el mismo de las fichas de ruta ya escritas — directo, sin
  relleno de guía turística, cada frase aporta un dato o una conexión.
- 4-6 secciones, ~500-700 palabras en total repartidas entre resumen y
  secciones.
- El cierre menciona la ruta (o las dos) con naturalidad, invitando a
  jugarla — sin tono de venta ("comprá ahora"), es una recomendación
  editorial, no un anuncio.
- No toques ningún otro archivo — solo añade tu entrada al array
  HISTORIAS en js/catalogo.js (usa el separador de coma correcto si no
  eres el único subagente escribiendo a la vez; coordínate revisando el
  archivo antes de guardar).

Al terminar, reporta: título, resumen, primera sección completa (para
que se pueda revisar el tono), y qué ruta(s) de worker/src/contenido/
revisaste para confirmar que no hay superposición.
```

- [ ] **Step 2: Revisar cada entrada devuelta — confirmar tono, longitud, y que `enlacesRutas` apunta a ids reales de `RUTAS`**

- [ ] **Step 3: Correr los tests — deben fallar solo en la parte de idiomas (en/fr/it vacíos), no en estructura**

Run: `npm test`
Expected: FAIL en `tests/catalogo-historias.test.js` ("cada historia tiene los 4 idiomas...") — esperado, se corrige en la Task 14. El resto de tests (estructura, ids de rutas válidos) debe pasar.

- [ ] **Step 4: Commit**

```bash
git add js/catalogo.js
git commit -m "Contenido en español de los 11 posts del blog"
```

### Task 14: Traducir los 11 posts a EN/FR/IT

**Files:**
- Modify: `js/catalogo.js` (rellenar los campos `en`/`fr`/`it` de las 11 entradas)

- [ ] **Step 1: Despachar un subagente por idioma (3 en paralelo — no por ciudad, para mantener consistencia de tono dentro de cada idioma) con este prompt**

```
Tarea: traducir al <IDIOMA> los 11 posts nuevos del array HISTORIAS en
js/catalogo.js (ya escritos en español). Para cada entrada, rellena el
campo <idioma> de: titulo, resumen, cada seccion.titulo, cada
seccion.texto, y cierre (cierre debe conservar literalmente los
placeholders {ruta1} y {ruta2} donde existan en el español — no los
traduzcas ni los muevas de posición si no es necesario).

Antes de traducir, lee worker/src/contenido/<alguna ruta>.{idioma}.json
para calibrar el tono ya usado en ese idioma en este proyecto.

No es traducción literal palabra por palabra — es reescritura idiomática
que sea igual de natural que el español, manteniendo todos los hechos
exactos (fechas, nombres propios, cifras) sin alterarlos.

No toques ningún otro archivo ni ningún otro campo.

Al terminar, reporta el título de los 11 posts en <idioma> para revisión
rápida.
```

- [ ] **Step 2: Correr los tests — ahora deben pasar completos**

Run: `npm test`
Expected: PASS — `tests/catalogo-historias.test.js` pasa sus 3 tests con las 11 entradas completas en los 4 idiomas.

- [ ] **Step 3: Commit**

```bash
git add js/catalogo.js
git commit -m "Traduce los 11 posts del blog a EN/FR/IT"
```

---

## Parte G — Generar, verificar, publicar

### Task 15: Regenerar todo, verificar y publicar

**Files:** ninguno nuevo — regenera lo ya creado en las Partes D-E con el contenido real de la Parte F.

- [ ] **Step 1: Regenerar SEO español y las 3 variantes de idioma**

Run: `node scripts/generar-historias.mjs && node scripts/generar-i18n.mjs`
Expected: `historias/*.html` (ES) con título/meta/JSON-LD reales; `en/historias/`, `fr/historias/`, `it/historias/` con las 11 fichas + índice completos; `sitemap.xml` con 160 URLs (40 páginas × 4 idiomas: 1 portada + 11 ciudad + 16 ruta + 1 índice de historias + 11 posts = 40).

- [ ] **Step 2: Correr toda la batería de tests**

Run: `npm test`
Expected: PASS (todos, incluidos los ya existentes — confirma que nada de lo anterior se rompió).

- [ ] **Step 3: Verificación manual con Playwright — arrancar un servidor estático local**

Run: `npx http-server -p 8743 .` (en segundo plano)

- [ ] **Step 4: Navegar a `http://127.0.0.1:8743/historias/index.html` — confirmar visualmente el destacado + cuadrícula, y cero errores de consola**

- [ ] **Step 5: Navegar a `http://127.0.0.1:8743/historias/roma.html` (o cualquier otra) — confirmar secciones, cierre con el enlace editorial (sin botón, cursiva, rojo lacre) apuntando a la ruta correcta, y cero errores de consola**

- [ ] **Step 6: Repetir el check del cierre en una ciudad con dos rutas (`historias/roma.html`, `historias/florencia.html` o `historias/paris.html`) — confirmar que, si el post menciona las dos, ambos enlaces resuelven a rutas reales**

- [ ] **Step 7: Click en el selector de idioma desde una ficha de historia — confirmar que navega a `/en/historias/<slug>.html` (o fr/it) con el contenido ya traducido, sin error 404**

- [ ] **Step 8: Confirmar el enlace "Historias" del menú principal en una página de ciudad y una de ruta**

- [ ] **Step 9: Parar el servidor local**

Run: matar el proceso de `http-server`

- [ ] **Step 10: Repasar `git status` — confirmar que TODO lo tocado está listado y que `js/config.js` NO está entre lo que se va a subir**

Run: `git status --short`
Expected: solo archivos de este plan (Parte A-G) más los `en/historias/`, `fr/historias/`, `it/historias/`, `historias/*.html`, `sitemap.xml` regenerados — nunca `js/config.js`.

- [ ] **Step 11: Stage, commit y push final**

```bash
git add historias/ en/historias/ fr/historias/ it/historias/ sitemap.xml index.html ciudad/*.html ruta/*.html
git commit -m "Regenera SEO/i18n del blog con el contenido real de los 11 posts"
git push
```

- [ ] **Step 12: Esperar el rebuild de GitHub Pages y verificar en vivo**

Run: sondear `gh api repos/pierorepp90/vestigia/pages/builds/latest -q '.status'` hasta `built`, luego repetir los checks de los Steps 4-8 contra `https://pierorepp90.github.io/vestigia/historias/...` en vez de `127.0.0.1:8743`.

---

## Self-Review

**Cobertura del spec:** contenido (Task 12-14) ✓, datos (Task 1) ✓, índice destacado+cuadrícula (Task 4, 6) ✓, ficha de post estilo `ruta-detalle` (Task 5, 7) ✓, cierre sin botón (Task 5's `cierreConEnlaces` + CSS `.enlace-editorial`) ✓, reutilizar fotos existentes (Task 12's brief, sin tarea de sourcing nueva) ✓, regla de no-solape con enigmas (Task 12's tabla + verificación explícita) ✓, nav "Historias" (Task 8) ✓, JSON-LD Article (Task 10, 11) ✓, sitemap 156 URLs (Task 11 Step 5) ✓, sin tocar `worker/src/contenido/` (ninguna tarea lo toca — el blog es contenido público, vive en catalogo.js) ✓.

**Placeholders:** ninguno queda — cada bloque de código de las Partes A-E es completo y ejecutable; la Parte F da 11 ángulos reales y un prompt de despacho completo, no "escribir contenido interesante" genérico.

**Consistencia de tipos:** `historiaPorSlug(slug)` (Task 1) es la firma que usa `js/historia.js` (Task 5); `HISTORIAS`/`ciudadPorSlug`/`rutaPorId` importados igual en Task 4/5/11; `urlRecurso(relativo, prefijo)` usado con la firma real de dos argumentos en Task 4, verificada contra `js/i18n.js`; los tipos de página `'historia'`/`'historia-indice'` se definen en Task 9 antes de que Task 10/11 los consuman (orden corregido en la revisión: `generar-historias.mjs` depende de `sitio-i18n.mjs`, no al revés).

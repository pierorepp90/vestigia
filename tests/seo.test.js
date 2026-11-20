// tests/seo.test.js
//
// Invariantes SEO de las páginas estáticas generadas por
// scripts/generar-i18n.mjs. Lo que comprueba es lo que ven Bing, los bots de
// IA y las vistas previas de WhatsApp, que NO ejecutan JavaScript: si una
// página sale sin contenido en el HTML, o con el idioma equivocado, para
// ellos no existe. Si este test falla tras tocar el catálogo, normalmente
// basta con correr `node scripts/generar-i18n.mjs`.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CIUDADES, RUTAS, HISTORIAS, localizar } from '../js/catalogo.js';
import { LANGS } from '../js/i18n.js';
import { archivoPagina, urlPagina, BASE_URL } from '../scripts/sitio-i18n.mjs';
import { reemplazarInterior } from '../scripts/seo.mjs';

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const PAGINAS = [
  { tipo: 'index', params: {} },
  { tipo: 'historia-indice', params: {} },
  ...CIUDADES.filter((c) => c.activa).map((c) => ({ tipo: 'ciudad', params: { slug: c.slug } })),
  ...RUTAS.map((r) => ({ tipo: 'ruta', params: { id: r.id } })),
  ...HISTORIAS.map((h) => ({ tipo: 'historia', params: { id: h.id } })),
].flatMap((p) => LANGS.map((lang) => ({ ...p, lang })));

const leer = ({ lang, tipo, params }) => readFileSync(path.join(RAIZ, archivoPagina(lang, tipo, params)), 'utf8');
const textoVisible = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

test('reemplazarInterior respeta etiquetas anidadas y es idempotente', () => {
  const html = '<div id="a"><div>viejo</div><div>más</div></div><div id="b">b</div>';
  const una = reemplazarInterior(html, 'a', '<div>nuevo</div><div>x</div>');
  assert.equal(una, '<div id="a"><div>nuevo</div><div>x</div></div><div id="b">b</div>');
  assert.equal(reemplazarInterior(una, 'a', '<div>nuevo</div><div>x</div>'), una);
  // <p> no debe confundirse con <path>
  assert.equal(reemplazarInterior('<p id="p"><svg><path d="M0"/></svg></p>', 'p', 'ok'), '<p id="p">ok</p>');
});

test('cada página fija su idioma: el JS no la vuelve a pintar en otro (Googlebot navega en inglés)', () => {
  for (const pagina of PAGINAS) {
    const html = leer(pagina);
    assert.match(html, new RegExp(`<html lang="${pagina.lang}" data-idioma-pagina="${pagina.lang}">`), archivoPagina(pagina.lang, pagina.tipo, pagina.params));
  }
});

test('cada página trae su contenido en el HTML, sin depender de JavaScript', () => {
  for (const pagina of PAGINAS) {
    const archivo = archivoPagina(pagina.lang, pagina.tipo, pagina.params);
    const html = leer(pagina);
    const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
    assert.ok(h1 && textoVisible(h1[1]).length > 0, `${archivo}: <h1> vacío o ausente`);
    // Umbrales contra páginas VACÍAS (antes del prerender, ciudad/barcelona tenía 25
    // palabras), no objetivos de contenido: una ciudad con una sola ruta ronda
    // las 130 y es una página fina (ver docs/crecimiento/plan-trafico-organico.md).
    const minimo = { index: 300, 'historia-indice': 120, ciudad: 100, ruta: 200, historia: 400 }[pagina.tipo];
    const palabras = textoVisible(html).split(' ').length;
    assert.ok(palabras >= minimo, `${archivo}: solo ${palabras} palabras visibles (mínimo ${minimo})`);
  }
});

test('cada página tiene un título, una descripción, una canonical y un bloque SEO', () => {
  for (const pagina of PAGINAS) {
    const archivo = archivoPagina(pagina.lang, pagina.tipo, pagina.params);
    const html = leer(pagina);
    assert.equal(html.match(/<title>/g)?.length, 1, `${archivo}: <title>`);
    assert.equal(html.match(/<meta name="description"/g)?.length, 1, `${archivo}: description`);
    assert.equal(html.match(/rel="canonical"/g)?.length, 1, `${archivo}: canonical`);
    assert.ok(html.includes(`<link rel="canonical" href="${urlPagina(pagina.lang, pagina.tipo, pagina.params)}">`), `${archivo}: canonical apunta a otra URL`);
    assert.equal(html.match(/hreflang=/g)?.length, LANGS.length + 1, `${archivo}: hreflang`);
    assert.equal(html.match(/<!-- seo -->/g)?.length, 1, `${archivo}: bloque SEO`);
    const titulo = html.match(/<title>([^<]*)<\/title>/)[1];
    assert.ok(titulo.length <= 95, `${archivo}: título demasiado largo (${titulo.length})`);
    assert.ok(!/Vestigia — Vestigia/.test(titulo), `${archivo}: marca duplicada en el título`);
  }
});

test('Open Graph apunta a una imagen que existe', () => {
  for (const pagina of PAGINAS) {
    const html = leer(pagina);
    const og = html.match(/<meta property="og:image" content="([^"]+)">/);
    assert.ok(og, `${archivoPagina(pagina.lang, pagina.tipo, pagina.params)}: falta og:image`);
    assert.ok(existsSync(path.join(RAIZ, og[1].replace(`${BASE_URL}/`, ''))), `no existe ${og[1]}`);
  }
});

test('el JSON-LD es JSON válido y describe la página', () => {
  const tipoEsperado = { index: 'Organization', 'historia-indice': 'CollectionPage', ciudad: 'ItemList', ruta: 'Product', historia: 'Article' };
  for (const pagina of PAGINAS) {
    const archivo = archivoPagina(pagina.lang, pagina.tipo, pagina.params);
    const bloques = [...leer(pagina).matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
    assert.equal(bloques.length, 1, `${archivo}: un solo bloque JSON-LD`);
    const datos = JSON.parse(bloques[0][1]);
    const tipos = datos['@graph'].map((n) => n['@type']);
    assert.ok(tipos.includes(tipoEsperado[pagina.tipo]), `${archivo}: falta ${tipoEsperado[pagina.tipo]} en ${tipos}`);
    if (pagina.tipo === 'historia') {
      const articulo = datos['@graph'].find((n) => n['@type'] === 'Article');
      assert.match(articulo.datePublished, /^\d{4}-\d{2}-\d{2}$/, `${archivo}: datePublished`);
      assert.equal(articulo.headline, localizar(HISTORIAS.find((h) => h.id === pagina.params.id).titulo, pagina.lang));
    }
  }
});

test('el sitemap lista cada página una vez, con lastmod, y cada URL tiene su archivo', () => {
  const xml = readFileSync(path.join(RAIZ, 'sitemap.xml'), 'utf8');
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  assert.equal(urls.length, PAGINAS.length);
  assert.equal(new Set(urls).size, urls.length);
  assert.equal(xml.match(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/g)?.length, urls.length);
  for (const pagina of PAGINAS) assert.ok(urls.includes(urlPagina(pagina.lang, pagina.tipo, pagina.params)));
});

test('ninguna página pública carga el favicon como data: URI (Google no lo puede rastrear)', () => {
  for (const pagina of PAGINAS) assert.ok(!leer(pagina).includes('rel="icon" href="data:'));
  assert.ok(existsSync(path.join(RAIZ, 'favicon.ico')) && existsSync(path.join(RAIZ, 'favicon.svg')));
});

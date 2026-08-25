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

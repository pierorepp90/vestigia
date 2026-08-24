#!/usr/bin/env node
// scripts/generar-seo.mjs
//
// Rellena el <title>, el <meta description>, el canonical/hreflang y el
// JSON-LD de cada ruta/*.html (español) con los datos reales de
// js/catalogo.js. Se ejecuta a mano cada vez que se añade o cambia una
// ruta (igual que scripts/generar-mapas.mjs) — sin esto, el HTML estático
// de cada ficha se queda con el título/descripción genéricos que solo se
// corrigen después, por JS, cuando el navegador ya ejecutó el script:
// buscadores y bots que no ejecutan JS (vistas previas de WhatsApp,
// Twitter/X, Facebook, Slack) ven siempre el genérico.
//
// No toca sitemap.xml: lo genera scripts/generar-i18n.mjs, que es quien
// sabe si las variantes /en/ /fr/ /it/ de cada página existen de verdad.
//
// Uso (en este orden — generar-i18n.mjs reutiliza el resultado de este):
//   node scripts/generar-seo.mjs && node scripts/generar-i18n.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { RUTAS } from '../js/catalogo.js';
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
  const ultimoEspacio = cortado.lastIndexOf(' ');
  return `${cortado.slice(0, ultimoEspacio)}…`;
}

function jsonLdRuta(ruta) {
  const datos = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: ruta.titulo.es,
    description: ruta.resumen.es,
    image: `${BASE_URL}/${ruta.imgHero}`,
    brand: { '@type': 'Brand', name: 'Vestigia' },
    offers: {
      '@type': 'Offer',
      url: `${BASE_URL}/ruta/${ruta.id}.html`,
      priceCurrency: ruta.moneda,
      price: ruta.precio.toFixed(2),
      availability: 'https://schema.org/InStock',
    },
  };
  return `<script type="application/ld+json" id="ld-producto">\n${JSON.stringify(datos, null, 2)}\n</script>`;
}

function actualizarRuta(ruta) {
  const destino = path.join(RAIZ, 'ruta', `${ruta.id}.html`);
  let html = readFileSync(destino, 'utf8');

  const tituloTag = `<title>${escaparTexto(ruta.titulo.es)} — Vestigia</title>`;
  html = html.replace(/<title>.*?<\/title>/, tituloTag);

  const descripcionTag = `<meta name="description" content="${escaparAtributo(truncar(ruta.resumen.es, 155))}">`;
  html = html.replace(/<meta name="description" content=".*?">/, descripcionTag);

  const idCanonical = 'canonical-hreflang';
  const bloqueCanonical = `<!-- ${idCanonical} -->\n${bloqueCanonicalYHreflang('es', 'ruta', { id: ruta.id })}\n<!-- /${idCanonical} -->`;
  const marcador = new RegExp(`<!-- ${idCanonical} -->[\\s\\S]*?<!-- /${idCanonical} -->`);
  html = marcador.test(html) ? html.replace(marcador, bloqueCanonical) : html.replace('</head>', `${bloqueCanonical}\n</head>`);

  const ldTag = jsonLdRuta(ruta);
  if (/<script type="application\/ld\+json" id="ld-producto">[\s\S]*?<\/script>/.test(html)) {
    html = html.replace(/<script type="application\/ld\+json" id="ld-producto">[\s\S]*?<\/script>/, ldTag);
  } else {
    html = html.replace('</head>', `${ldTag}\n</head>`);
  }

  writeFileSync(destino, html, 'utf8');
  console.log(`ruta/${ruta.id}.html: título, descripción, canonical/hreflang y JSON-LD actualizados`);
}

for (const ruta of RUTAS) {
  actualizarRuta(ruta);
}

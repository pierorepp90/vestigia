#!/usr/bin/env node
// scripts/generar-seo.mjs
//
// Rellena el <title>, el <meta description> y el JSON-LD de cada
// ruta/*.html con los datos reales de js/catalogo.js, y regenera
// sitemap.xml. Se ejecuta a mano cada vez que se añade o cambia una ruta
// (igual que scripts/generar-mapas.mjs) — sin esto, el HTML estático de
// cada ficha de ruta se queda con el título/descripción genéricos que solo
// se corrigen después, por JS, cuando el navegador ya ejecutó el script:
// buscadores y bots que no ejecutan JS (vistas previas de WhatsApp,
// Twitter/X, Facebook, Slack) ven siempre el genérico.
//
// Uso:
//   node scripts/generar-seo.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { CIUDADES, RUTAS } from '../js/catalogo.js';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.join(AQUI, '..');

// TODO: actualizar junto con SITE_URL/ALLOWED_ORIGIN en worker/wrangler.toml
// cuando haya dominio propio (ver README, "Pendiente, con dueño claro").
const BASE_URL = 'https://pierorepp90.github.io/vestigia';

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

  const ldTag = jsonLdRuta(ruta);
  if (/<script type="application\/ld\+json" id="ld-producto">[\s\S]*?<\/script>/.test(html)) {
    html = html.replace(/<script type="application\/ld\+json" id="ld-producto">[\s\S]*?<\/script>/, ldTag);
  } else {
    html = html.replace('</head>', `${ldTag}\n</head>`);
  }

  writeFileSync(destino, html, 'utf8');
  console.log(`ruta/${ruta.id}.html: título, descripción y JSON-LD actualizados`);
}

function generarSitemap() {
  const urls = [`${BASE_URL}/`];
  for (const ciudad of CIUDADES.filter((c) => c.activa)) {
    urls.push(`${BASE_URL}/ciudad/${ciudad.slug}.html`);
  }
  for (const ruta of RUTAS) {
    urls.push(`${BASE_URL}/ruta/${ruta.id}.html`);
  }

  const cuerpo = urls.map((url) => `  <url>\n    <loc>${escaparTexto(url)}</loc>\n  </url>`).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${cuerpo}\n</urlset>\n`;

  const destino = path.join(RAIZ, 'sitemap.xml');
  writeFileSync(destino, xml, 'utf8');
  console.log(`sitemap.xml: ${urls.length} URLs`);
}

for (const ruta of RUTAS) {
  actualizarRuta(ruta);
}
generarSitemap();

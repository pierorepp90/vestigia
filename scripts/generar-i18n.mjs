#!/usr/bin/env node
// scripts/generar-i18n.mjs
//
// Genera las versiones estáticas en inglés, francés e italiano de las
// páginas de marketing (portada, ciudad/*, ruta/*): contenido real ya
// traducido en el HTML, no solo metadatos, para que cualquier buscador
// indexe cada idioma sin depender de que ejecute JS. Español sigue siendo
// la raíz del sitio, sin prefijo; en/fr/it viven bajo /en/ /fr/ /it/, con
// la misma estructura de carpetas que el español. Las pantallas de juego
// y pago (jugar/*) no entran aquí — no necesitan SEO y siguen resolviendo
// el idioma en tiempo de ejecución (ver js/i18n.js).
//
// También añade canonical/hreflang a las páginas en español existentes
// (index.html, ciudad/*.html — ruta/*.html ya las lleva, las pone
// generar-seo.mjs) y regenera sitemap.xml con las 4 versiones de cada
// página.
//
// Requiere haber corrido antes generar-seo.mjs (título/descripción/JSON-LD
// de las rutas en español, que este script reutiliza como referencia de
// contenido). Es idempotente: se puede volver a correr cada vez que se
// añade una ciudad o ruta.
//
// Uso:
//   node scripts/generar-seo.mjs && node scripts/generar-i18n.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { CIUDADES, RUTAS, HISTORIAS, ciudadPorSlug, ciudadesRelacionadas, historiaPorSlug, localizar, rutaPorId, rutasHermanas, rutasPorCiudad } from '../js/catalogo.js';
import { LANGS, LANG_NAMES, DEFAULT_LANG, t, tf } from '../js/i18n.js';
import { tarjetaCiudad } from '../js/portada.js';
import { tarjetaRuta } from '../js/ciudad.js';
import { tarjetaHistoria } from '../js/historias.js';
import { cierreConEnlaces } from '../js/historia.js';
import { BASE_URL, urlPagina, bloqueCanonicalYHreflang } from './sitio-i18n.mjs';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.join(AQUI, '..');
const IDIOMAS_NUEVOS = LANGS.filter((l) => l !== DEFAULT_LANG);
const CIUDADES_ACTIVAS = CIUDADES.filter((c) => c.activa);

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

// ---- Traduce el HTML fijo marcado con data-i18n / data-i18n-attr --------
// Mismo contrato que aplicarI18n() en js/i18n.js, pero sobre un string en
// vez de un DOM — así la plantilla no necesita mantenerse dos veces.

function aplicarI18nTexto(html, lang) {
  return html.replace(
    /<([a-zA-Z0-9]+)([^>]*)\sdata-i18n="([^"]+)"([^>]*)>([\s\S]*?)<\/\1>/g,
    (_m, tag, antes, key, despues) => `<${tag}${antes} data-i18n="${key}"${despues}>${escaparTexto(t(lang, key))}</${tag}>`,
  );
}

function aplicarI18nAtributos(html, lang) {
  return html.replace(/<([a-zA-Z0-9]+)([^>]*)\sdata-i18n-attr="([^"]+)"([^>]*)>/g, (_m, tag, antes, spec, despues) => {
    let attrs = `${antes} data-i18n-attr="${spec}"${despues}`;
    for (const par of spec.split('|')) {
      const [attr, key] = par.split(':').map((s) => s.trim());
      if (!attr || !key) continue;
      const valor = escaparAtributo(t(lang, key));
      const reAttr = new RegExp(`${attr}="[^"]*"`);
      attrs = reAttr.test(attrs) ? attrs.replace(reAttr, `${attr}="${valor}"`) : `${attrs} ${attr}="${valor}"`;
    }
    return `<${tag}${attrs}>`;
  });
}

// ---- Rellenar un elemento por id -----------------------------------------

function conTexto(html, id, texto) {
  const re = new RegExp(`(<([a-zA-Z0-9]+)([^>]*\\bid="${id}"[^>]*)>)([\\s\\S]*?)(<\\/\\2>)`);
  return html.replace(re, (_m, apertura, _tag, _attrs, _viejo, cierre) => `${apertura}${escaparTexto(texto)}${cierre}`);
}

function conHTML(html, id, htmlInterno) {
  const re = new RegExp(`(<([a-zA-Z0-9]+)([^>]*\\bid="${id}"[^>]*)>)([\\s\\S]*?)(<\\/\\2>)`);
  return html.replace(re, (_m, apertura, _tag, _attrs, _viejo, cierre) => `${apertura}${htmlInterno}${cierre}`);
}

function conAtributo(html, id, atributo, valor) {
  const reEtiqueta = new RegExp(`<([a-zA-Z0-9]+)([^>]*\\bid="${id}"[^>]*)>`);
  return html.replace(reEtiqueta, (_m, tag, attrs) => {
    const valorEscapado = escaparAtributo(valor);
    const reAttr = new RegExp(`${atributo}="[^"]*"`);
    const nuevos = reAttr.test(attrs) ? attrs.replace(reAttr, `${atributo}="${valorEscapado}"`) : `${attrs} ${atributo}="${valorEscapado}"`;
    return `<${tag}${nuevos}>`;
  });
}

function sinAtributo(html, id, atributo) {
  const reEtiqueta = new RegExp(`<([a-zA-Z0-9]+)([^>]*\\bid="${id}"[^>]*)>`);
  return html.replace(reEtiqueta, (_m, tag, attrs) => `<${tag}${attrs.replace(new RegExp(`\\s${atributo}\\b`), '')}>`);
}

// ---- Reescritura de rutas para las variantes de idioma -------------------
//
// Los enlaces entre páginas del mismo tipo de relación (tarjeta de ciudad
// → ficha de ruta, ficha → volver a ciudad) no necesitan tocarse: al
// espejar la MISMA estructura de carpetas bajo /en/ /fr/ /it/, un href
// relativo como "../ruta/x.html" resuelve igual de bien un nivel más
// adentro. Lo que sí hay que arreglar son las referencias a recursos que
// NO se duplican por idioma (css, js, assets, legal) y los enlaces de
// vuelta a portada, que deben apuntar a la portada de ESE idioma.

function absolutizarRecursosCompartidos(html) {
  return html
    .replace(/href="\.\.\/css\//g, `href="${BASE_URL}/css/`)
    .replace(/href="css\//g, `href="${BASE_URL}/css/`)
    .replace(/src="\.\.\/js\//g, `src="${BASE_URL}/js/`)
    .replace(/src="js\//g, `src="${BASE_URL}/js/`)
    .replace(/href="\.\.\/legal\//g, `href="${BASE_URL}/legal/`)
    .replace(/href="legal\//g, `href="${BASE_URL}/legal/`)
    .replace(/href="\.\.\/assets\//g, `href="${BASE_URL}/assets/`)
    .replace(/href="assets\//g, `href="${BASE_URL}/assets/`);
}

function absolutizarImagenesDeTarjetas(html) {
  return html.replace(/src="\.\.\/assets\//g, `src="${BASE_URL}/assets/`).replace(/src="assets\//g, `src="${BASE_URL}/assets/`);
}

function reescribirEnlacesInicio(html, lang) {
  // Solo "../index.html" (subir a la raíz) se reescribe aquí. Un
  // "index.html" a secas es un enlace relativo DENTRO de la misma familia
  // de páginas (p. ej. historias/<slug>.html → historias/index.html, o
  // historias/index.html consigo misma): al espejar la misma estructura de
  // carpetas por idioma, ya resuelve bien sin tocarlo — igual que
  // "${id}.html" entre rutas hermanas. Antes esta función también
  // reescribía ese caso a secas, pero nada lo necesitaba (ciudad/ruta no
  // tienen ningún "index.html" a secas en sus plantillas) y, al añadir
  // historias/, sí rompía el enlace "Historias" / "Todas las historias":
  // pasaban a apuntar a la portada del sitio en vez de al índice del blog.
  const inicio = urlPagina(lang, 'index', {});
  return html.replace(/href="\.\.\/index\.html(#[\w-]+)?"/g, (_m, hash) => `href="${inicio}${hash || ''}"`);
}

function quitarScriptPieDerechos(html) {
  return html.replace(/<script type="module">\s*import \{ tf, detectarIdioma \}[\s\S]*?<\/script>\s*/, '');
}

// Las plantillas en español ya pueden llevar su propio bloque de
// canonical/hreflang (lo añade agregarHreflangIndiceEs/Ciudad más abajo, o
// generar-seo.mjs en el caso de las rutas) — hay que quitarlo antes de
// insertar el de este idioma, o se acumulan dos bloques.
const ID_MARCADOR = 'canonical-hreflang';
const marcadorRe = new RegExp(`\\s*<!-- ${ID_MARCADOR} -->[\\s\\S]*?<!-- /${ID_MARCADOR} -->`);

function quitarBloqueCanonicalExistente(html) {
  return html.replace(marcadorRe, '');
}

function insertarCabecera(html, lang, tipo, params) {
  html = html.replace(/<html lang="es">/, `<html lang="${lang}" data-idioma-pagina="${lang}">`);
  html = quitarBloqueCanonicalExistente(html);
  const bloque = bloqueCanonicalYHreflang(lang, tipo, params);
  return html.replace('<link rel="stylesheet" href="../css/styles.css">', `<link rel="stylesheet" href="${BASE_URL}/css/styles.css">\n${bloque}`);
}

// ---- Página de índice -----------------------------------------------------

function generarIndice(lang) {
  const plantilla = readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
  let html = plantilla.replace(/<html lang="es">/, `<html lang="${lang}" data-idioma-pagina="${lang}">`);

  const titulo = `Vestigia — ${t(lang, 'hero_eyebrow')}`;
  html = html.replace(/<title>.*?<\/title>/, `<title>${escaparTexto(titulo)}</title>`);
  const descripcion = truncar(t(lang, 'hero_subtitle'), 155);
  html = html.replace(/<meta name="description" content=".*?">/, `<meta name="description" content="${escaparAtributo(descripcion)}">`);
  html = html.replace(/<meta property="og:title" content=".*?">/, `<meta property="og:title" content="${escaparAtributo(`Vestigia — ${t(lang, 'brand_tagline')}`)}">`);
  html = html.replace(/<meta property="og:description" content=".*?">/, `<meta property="og:description" content="${escaparAtributo(t(lang, 'hero_eyebrow'))}">`);

  html = quitarBloqueCanonicalExistente(html);
  const bloque = bloqueCanonicalYHreflang(lang, 'index', {});
  html = html.replace('<link rel="stylesheet" href="css/styles.css">', `<link rel="stylesheet" href="${BASE_URL}/css/styles.css">\n${bloque}`);

  html = aplicarI18nAtributos(aplicarI18nTexto(html, lang), lang);

  const gridCiudades = CIUDADES.map((c, i) => absolutizarImagenesDeTarjetas(tarjetaCiudad(c, i, lang))).join('');
  html = conHTML(html, 'grid-ciudades', gridCiudades);

  const derechos = tf(lang, 'footer_rights', { year: new Date().getFullYear() });
  html = conTexto(html, 'pie-derechos', derechos);
  html = quitarScriptPieDerechos(html);

  html = html.replace(/href="legal\//g, `href="${BASE_URL}/legal/`).replace(/href="assets\//g, `href="${BASE_URL}/assets/`).replace(/src="js\//g, `src="${BASE_URL}/js/`);

  const destino = path.join(RAIZ, lang, 'index.html');
  mkdirSync(path.dirname(destino), { recursive: true });
  writeFileSync(destino, html, 'utf8');
}

// ---- Páginas de ciudad ------------------------------------------------

function generarCiudad(ciudad, lang) {
  const plantilla = readFileSync(path.join(RAIZ, 'ciudad', `${ciudad.slug}.html`), 'utf8');
  let html = insertarCabecera(plantilla, lang, 'ciudad', { slug: ciudad.slug });

  const nombre = localizar(ciudad.nombre, lang);
  const resumen = localizar(ciudad.resumen, lang);
  html = html.replace(/<title>.*?<\/title>/, `<title>${escaparTexto(`${nombre} — Vestigia`)}</title>`);
  html = html.replace(/<meta name="description" content=".*?">/, `<meta name="description" content="${escaparAtributo(truncar(resumen, 155))}">`);

  html = aplicarI18nAtributos(aplicarI18nTexto(html, lang), lang);
  html = reescribirEnlacesInicio(html, lang);

  const heroHTML = `
    <img class="ciudad-hero__foto" src="${BASE_URL}/${ciudad.imgHero}" alt="${escaparAtributo(nombre)}">
    <div class="ciudad-hero__velo" aria-hidden="true"></div>
    <div class="ciudad-hero__contenido">
      <p class="eyebrow">${escaparTexto(t(lang, 'hero_eyebrow'))}</p>
      <p class="ciudad-hero__pais">${escaparTexto(localizar(ciudad.pais, lang))}</p>
      <h1 class="ciudad-hero__nombre">${escaparTexto(nombre)}</h1>
      <p class="ciudad-hero__resumen">${escaparTexto(resumen)}</p>
    </div>`;
  html = conHTML(html, 'ciudad-hero', heroHTML);

  html = conTexto(html, 'rutas-titulo', tf(lang, 'ciudad_rutas_disponibles', { ciudad: nombre }));

  const rutas = rutasPorCiudad(ciudad.slug);
  const gridRutas = rutas.map((r) => absolutizarImagenesDeTarjetas(tarjetaRuta(r, lang))).join('');
  html = conHTML(html, 'grid-rutas', gridRutas);

  const otrasCiudades = ciudadesRelacionadas(ciudad.slug);
  if (otrasCiudades.length > 0) {
    const enlaces = otrasCiudades.map((c) => `<a class="btn btn-fantasma" href="${c.slug}.html">${escaparTexto(localizar(c.nombre, lang))}</a>`).join('');
    html = conHTML(html, 'ciudades-relacionadas', `<h2 class="seccion-relacionadas__titulo">${escaparTexto(t(lang, 'ciudad_otras_titulo'))}</h2><div class="seccion-relacionadas__lista">${enlaces}</div>`);
  }

  const historiaCiudad = historiaPorSlug(ciudad.slug);
  const enlaceHistoriaCiudad = historiaCiudad
    ? `<p><a class="enlace-editorial" href="../historias/${historiaCiudad.id}.html">${escaparTexto(tf(lang, 'ruta_leer_historia', { ciudad: nombre }))}</a></p>`
    : '';
  html = conHTML(
    html,
    'ciudad-enlaces-finales',
    `<p><a class="btn btn-fantasma" href="../index.html">${escaparTexto(t(lang, 'ruta_todas_ciudades'))}</a></p>${enlaceHistoriaCiudad}`,
  );

  html = conTexto(html, 'pie-derechos', tf(lang, 'footer_rights', { year: new Date().getFullYear() }));
  html = quitarScriptPieDerechos(html);
  html = absolutizarRecursosCompartidos(html);

  const destino = path.join(RAIZ, lang, 'ciudad', `${ciudad.slug}.html`);
  mkdirSync(path.dirname(destino), { recursive: true });
  writeFileSync(destino, html, 'utf8');
}

// ---- Páginas de ruta --------------------------------------------------

function jsonLdRuta(ruta, lang) {
  const datos = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: localizar(ruta.titulo, lang),
    description: localizar(ruta.resumen, lang),
    image: `${BASE_URL}/${ruta.imgHero}`,
    brand: { '@type': 'Brand', name: 'Vestigia' },
    offers: {
      '@type': 'Offer',
      url: urlPagina(lang, 'ruta', { id: ruta.id }),
      priceCurrency: ruta.moneda,
      price: ruta.precio.toFixed(2),
      availability: 'https://schema.org/InStock',
    },
  };
  // Mismo arreglo que generarHistoria() más abajo y que generar-seo.mjs/
  // generar-historias.mjs (commit aa37e36): JSON.stringify no escapa '<',
  // y un texto real que contuviera el cierre de <script> rompería la
  // página y el reemplazo idempotente de la próxima ejecución.
  const json = JSON.stringify(datos, null, 2).replace(/</g, '\\u003c');
  return `<script type="application/ld+json" id="ld-producto">\n${json}\n</script>`;
}

function generarRuta(ruta, lang) {
  const plantilla = readFileSync(path.join(RAIZ, 'ruta', `${ruta.id}.html`), 'utf8');
  const ciudad = ciudadPorSlug(ruta.ciudadSlug);

  let html = plantilla.replace(/<html lang="es">/, `<html lang="${lang}" data-idioma-pagina="${lang}">`);

  const tituloRuta = localizar(ruta.titulo, lang);
  const nombreCiudad = localizar(ciudad.nombre, lang);
  const resumen = localizar(ruta.resumen, lang);

  html = html.replace(/<title>.*?<\/title>/, `<title>${escaparTexto(`${tituloRuta} — Vestigia`)}</title>`);
  html = html.replace(/<meta name="description" content=".*?">/, `<meta name="description" content="${escaparAtributo(truncar(resumen, 155))}">`);

  html = quitarBloqueCanonicalExistente(html);
  const bloque = bloqueCanonicalYHreflang(lang, 'ruta', { id: ruta.id });
  html = html.replace('<link rel="stylesheet" href="../css/styles.css">', `<link rel="stylesheet" href="${BASE_URL}/css/styles.css">\n${bloque}`);
  html = html.replace(/<script type="application\/ld\+json" id="ld-producto">[\s\S]*?<\/script>/, jsonLdRuta(ruta, lang));

  html = aplicarI18nAtributos(aplicarI18nTexto(html, lang), lang);
  html = reescribirEnlacesInicio(html, lang);

  html = conAtributo(html, 'ruta-foto', 'src', `${BASE_URL}/${ruta.imgHero}`);
  html = conAtributo(html, 'ruta-foto', 'alt', tituloRuta);
  html = conTexto(html, 'ruta-zona-eyebrow', ruta.zona);
  html = conTexto(html, 'ruta-titulo', tituloRuta);
  html = conTexto(html, 'ruta-resumen', resumen);
  html = conTexto(html, 'adelanto-texto', `“${localizar(ruta.acertijoMuestra, lang)}”`);
  html = conAtributo(html, 'mapa-zona-img', 'src', `${BASE_URL}/${ruta.imgMapa}`);
  html = conAtributo(html, 'mapa-zona-img', 'alt', tf(lang, 'ruta_mapa_alt', { zona: ruta.zona }));
  html = conTexto(html, 'mapa-zona-caption', ruta.zona);

  html = conAtributo(html, 'migas-ciudad', 'href', `../ciudad/${ciudad.slug}.html`);
  html = conTexto(html, 'migas-ciudad', nombreCiudad);
  html = conTexto(html, 'migas-ruta', tituloRuta);

  html = conAtributo(html, 'ruta-volver', 'href', `../ciudad/${ciudad.slug}.html`);
  html = conTexto(html, 'ruta-volver', tf(lang, 'ruta_volver', { ciudad: nombreCiudad }));

  const hermanas = rutasHermanas(ruta.id);
  if (hermanas.length > 0) {
    const enlaces = hermanas.map((r) => `<a class="btn btn-fantasma" href="${r.id}.html">${escaparTexto(localizar(r.titulo, lang))}</a>`).join('');
    const titulo = escaparTexto(tf(lang, 'ruta_otras_titulo', { ciudad: nombreCiudad }));
    html = conHTML(html, 'rutas-relacionadas', `<h2 class="seccion-relacionadas__titulo">${titulo}</h2><div class="seccion-relacionadas__lista">${enlaces}</div>`);
  }

  const historia = historiaPorSlug(ciudad.slug);
  const enlaceHistoria = historia
    ? `<p><a class="enlace-editorial" href="../historias/${historia.id}.html">${escaparTexto(tf(lang, 'ruta_leer_historia', { ciudad: nombreCiudad }))}</a></p>`
    : '';
  html = conHTML(
    html,
    'ruta-enlaces-finales',
    `<p><a class="btn btn-fantasma" href="../index.html">${escaparTexto(t(lang, 'ruta_todas_ciudades'))}</a></p>${enlaceHistoria}`,
  );

  html = conTexto(html, 'panel-duracion', tf(lang, 'meta_duracion', { h: Math.round(ruta.duracionMin / 60) }));
  html = conTexto(html, 'panel-jugadores', tf(lang, 'meta_jugadores', { min: ruta.jugadoresMin, max: ruta.jugadoresMax }));
  html = conHTML(html, 'panel-dificultad', `<span class="badge-dificultad badge-dificultad--${ruta.dificultad}">${escaparTexto(t(lang, `dificultad_${ruta.dificultad}`))}</span>`);
  html = conTexto(html, 'panel-zona', ruta.zona);
  html = conTexto(html, 'panel-partida', localizar(ruta.puntoPartida, lang));
  html = conTexto(html, 'panel-idiomas', ruta.idiomas.map((c) => LANG_NAMES[c]).join(' · '));

  const esGratis = ruta.precio === 0;
  const precioHTML = esGratis ? escaparTexto(t(lang, 'precio_gratis')) : `${ruta.precio} €<small>${escaparTexto(t(lang, 'precio_por_equipo'))}</small>`;
  html = conHTML(html, 'panel-precio', precioHTML);
  if (esGratis) html = sinAtributo(html, 'panel-email', 'hidden');

  const ctaTexto = esGratis ? t(lang, 'ruta_jugar_gratis_cta') : tf(lang, 'ruta_reservar_cta', { precio: ruta.precio });
  html = conTexto(html, 'cta-reservar', ctaTexto);

  html = conTexto(html, 'pie-derechos', tf(lang, 'footer_rights', { year: new Date().getFullYear() }));
  html = quitarScriptPieDerechos(html);
  html = absolutizarRecursosCompartidos(html);

  const destino = path.join(RAIZ, lang, 'ruta', `${ruta.id}.html`);
  mkdirSync(path.dirname(destino), { recursive: true });
  writeFileSync(destino, html, 'utf8');
}

// ---- Páginas de historias ----------------------------------------------

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
  // Mismo arreglo que jsonLdHistoria() en generar-historias.mjs (ver commit
  // aa37e36): JSON.stringify no escapa '<', y un texto real que contuviera
  // "</script>" cerraría la etiqueta antes de tiempo.
  const json = JSON.stringify(jsonLd, null, 2).replace(/</g, '\\u003c');
  const ldTag = `<script type="application/ld+json" id="ld-articulo">\n${json}\n</script>`;
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

// ---- Canonical/hreflang en las páginas en español existentes ----------
// (ruta/*.html ya las lleva — las pone generar-seo.mjs)

function insertarBloqueIdempotente(html, hojaEstilo, bloqueInterno) {
  const limpio = quitarBloqueCanonicalExistente(html);
  const bloque = `<!-- ${ID_MARCADOR} -->\n${bloqueInterno}\n<!-- /${ID_MARCADOR} -->`;
  return limpio.replace(hojaEstilo, `${hojaEstilo}\n${bloque}`);
}

function agregarHreflangIndiceEs() {
  const destino = path.join(RAIZ, 'index.html');
  let html = readFileSync(destino, 'utf8');
  html = insertarBloqueIdempotente(html, '<link rel="stylesheet" href="css/styles.css">', bloqueCanonicalYHreflang(DEFAULT_LANG, 'index', {}));
  writeFileSync(destino, html, 'utf8');
}

function agregarHreflangCiudadEs(ciudad) {
  const destino = path.join(RAIZ, 'ciudad', `${ciudad.slug}.html`);
  let html = readFileSync(destino, 'utf8');
  html = insertarBloqueIdempotente(html, '<link rel="stylesheet" href="../css/styles.css">', bloqueCanonicalYHreflang(DEFAULT_LANG, 'ciudad', { slug: ciudad.slug }));
  writeFileSync(destino, html, 'utf8');
}

function agregarHreflangHistoriasIndiceEs() {
  const destino = path.join(RAIZ, 'historias', 'index.html');
  let html = readFileSync(destino, 'utf8');
  html = insertarBloqueIdempotente(html, '<link rel="stylesheet" href="../css/styles.css">', bloqueCanonicalYHreflang(DEFAULT_LANG, 'historia-indice', {}));
  writeFileSync(destino, html, 'utf8');
}

// ---- sitemap.xml (todas las páginas × los 4 idiomas) --------------------

function generarSitemap() {
  const paginas = [{ tipo: 'index', params: {} }, { tipo: 'historia-indice', params: {} }];
  for (const c of CIUDADES_ACTIVAS) paginas.push({ tipo: 'ciudad', params: { slug: c.slug } });
  for (const r of RUTAS) paginas.push({ tipo: 'ruta', params: { id: r.id } });
  for (const h of HISTORIAS) paginas.push({ tipo: 'historia', params: { id: h.id } });

  const urls = paginas.flatMap(({ tipo, params }) => LANGS.map((lang) => urlPagina(lang, tipo, params)));
  const cuerpo = urls.map((url) => `  <url>\n    <loc>${escaparTexto(url)}</loc>\n  </url>`).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${cuerpo}\n</urlset>\n`;

  writeFileSync(path.join(RAIZ, 'sitemap.xml'), xml, 'utf8');
  console.log(`sitemap.xml: ${urls.length} URLs (${paginas.length} páginas × ${LANGS.length} idiomas)`);
}

// ---- Ejecución --------------------------------------------------------

agregarHreflangIndiceEs();
agregarHreflangHistoriasIndiceEs();
console.log('index.html + historias/index.html (es): canonical/hreflang añadidos');
for (const ciudad of CIUDADES_ACTIVAS) {
  agregarHreflangCiudadEs(ciudad);
}
console.log(`ciudad/*.html (es): canonical/hreflang añadidos en ${CIUDADES_ACTIVAS.length} páginas`);

for (const lang of IDIOMAS_NUEVOS) {
  generarIndice(lang);
  generarHistoriasIndice(lang);
  for (const ciudad of CIUDADES_ACTIVAS) generarCiudad(ciudad, lang);
  for (const ruta of RUTAS) generarRuta(ruta, lang);
  for (const historia of HISTORIAS) generarHistoria(historia, lang);
  console.log(`${lang}/: portada + historias + ${CIUDADES_ACTIVAS.length} ciudades + ${RUTAS.length} rutas + ${HISTORIAS.length} historias generadas`);
}

generarSitemap();

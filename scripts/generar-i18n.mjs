#!/usr/bin/env node
// scripts/generar-i18n.mjs
//
// Genera las páginas de marketing estáticas (portada, historias, ciudad/*,
// ruta/*, historias/*) en los CUATRO idiomas, con el contenido real ya
// escrito en el HTML. Bing, los bots de los asistentes de IA (GPTBot,
// ClaudeBot, PerplexityBot…) y las vistas previas de WhatsApp no ejecutan
// JavaScript: lo que no esté en el HTML que sirve GitHub Pages, para ellos
// no existe.
//
// Español sigue siendo la raíz del sitio, sin prefijo; en/fr/it viven bajo
// /en/ /fr/ /it/ con la misma estructura de carpetas. Los archivos en
// español hacen de plantilla Y de resultado: el script los lee, rellena por
// `id` cada zona dinámica y los vuelve a escribir. Por eso el relleno tiene
// que ser idempotente (ver reemplazarInterior): correr el script dos veces
// seguidas no cambia nada.
//
// Cada página lleva `<html data-idioma-pagina="xx">`: el JS del navegador
// (js/i18n.js → detectarIdioma) respeta ese idioma fijo y nunca vuelve a
// pintar una URL en otro idioma. Sin eso, Googlebot —que renderiza con el
// navegador en inglés— veía las URLs en español traducidas al inglés.
//
// También regenera sitemap.xml (con <lastmod> real, ver
// scripts/sitemap-fechas.json) con las 4 versiones de cada página.
//
// Uso (idempotente; correrlo cada vez que cambie js/catalogo.js o js/i18n.js):
//   node scripts/generar-i18n.mjs
// generar-seo.mjs y generar-historias.mjs se mantienen como alias de este.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { CIUDADES, RUTAS, HISTORIAS, ciudadPorSlug, historiaPorSlug, localizar, rutasHermanas, rutasPorCiudad } from '../js/catalogo.js';
import { LANGS, LANG_NAMES, DEFAULT_LANG, t, tf } from '../js/i18n.js';
import { tarjetaCiudad } from '../js/portada.js';
import { tarjetaRuta } from '../js/ciudad.js';
import { tarjetaHistoria, historiaDestacadaHTML } from '../js/historias.js';
import { cierreConEnlaces, seccionHTML } from '../js/historia.js';
import { BASE_URL, archivoPagina, urlPagina } from './sitio-i18n.mjs';
import {
  aplicarCabecera,
  escaparAtributo,
  escaparTexto,
  ldArticulo,
  ldListaRutas,
  ldMigas,
  ldOrganizacion,
  ldProductoRuta,
  ldWeb,
  reemplazarInterior,
  seoCiudad,
  seoHistoria,
  seoHistoriasIndice,
  seoPortada,
  seoRuta,
  textoFecha,
} from './seo.mjs';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.join(AQUI, '..');
const CIUDADES_ACTIVAS = CIUDADES.filter((c) => c.activa);
const OG = 'assets/img/og';

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

// ---- Rellenar un elemento por id (ver reemplazarInterior en seo.mjs) ------

const conTexto = (html, id, texto) => reemplazarInterior(html, id, escaparTexto(texto));
const conHTML = (html, id, interior) => reemplazarInterior(html, id, interior);

function conAtributo(html, id, atributo, valor) {
  const reEtiqueta = new RegExp(`<([a-zA-Z0-9]+)([^>]*\\bid="${id}"[^>]*)>`);
  return html.replace(reEtiqueta, (_m, tag, attrs) => {
    const valorEscapado = escaparAtributo(valor);
    const reAttr = new RegExp(`\\s${atributo}="[^"]*"`);
    const nuevos = reAttr.test(attrs) ? attrs.replace(reAttr, ` ${atributo}="${valorEscapado}"`) : `${attrs} ${atributo}="${valorEscapado}"`;
    return `<${tag}${nuevos}>`;
  });
}

function sinAtributo(html, id, atributo) {
  const reEtiqueta = new RegExp(`<([a-zA-Z0-9]+)([^>]*\\bid="${id}"[^>]*)>`);
  return html.replace(reEtiqueta, (_m, tag, attrs) => `<${tag}${attrs.replace(new RegExp(`\\s${atributo}\\b`), '')}>`);
}

// ---- Reescritura de rutas para las variantes de idioma -------------------
//
// Los enlaces entre páginas del mismo tipo (tarjeta de ciudad → ficha de
// ruta, ficha → volver a ciudad) no necesitan tocarse: al espejar la MISMA
// estructura de carpetas bajo /en/ /fr/ /it/, un href relativo como
// "../ruta/x.html" resuelve igual de bien un nivel más adentro. Lo que sí
// hay que arreglar son las referencias a recursos que NO se duplican por
// idioma (css, js, assets, legal) y los enlaces de vuelta a la portada, que
// deben apuntar a la portada de ESE idioma. Nada de esto se aplica al
// español, que vive en la raíz y conserva sus rutas relativas.

function absolutizarRecursosCompartidos(html) {
  return html.replace(/(href|src)="(?:\.\.\/)?(css|js|legal|assets)\//g, `$1="${BASE_URL}/$2/`);
}

function reescribirEnlacesInicio(html, lang) {
  // Solo "../index.html" (subir a la raíz) se reescribe. Un "index.html" a
  // secas es un enlace DENTRO de la misma familia de páginas (historias/x →
  // historias/index.html) y ya resuelve bien en cada idioma.
  const inicio = urlPagina(lang, 'index', {});
  return html.replace(/href="\.\.\/index\.html(#[\w-]+)?"/g, (_m, hash) => `href="${inicio}${hash || ''}"`);
}

function quitarScriptPieDerechos(html) {
  return html.replace(/<script type="module">\s*import \{ tf, detectarIdioma \}[\s\S]*?<\/script>\s*/, '');
}

/** Pasos comunes a todas las páginas, después de rellenar su contenido. */
function finalizar(html, lang) {
  html = conTexto(html, 'pie-derechos', tf(lang, 'footer_rights', { year: new Date().getFullYear() }));
  if (lang === DEFAULT_LANG) return html;
  return absolutizarRecursosCompartidos(reescribirEnlacesInicio(quitarScriptPieDerechos(html), lang));
}

const generadas = [];

function escribir(lang, tipo, params, html) {
  const destino = path.join(RAIZ, archivoPagina(lang, tipo, params));
  mkdirSync(path.dirname(destino), { recursive: true });
  writeFileSync(destino, html, 'utf8');
  generadas.push({ url: urlPagina(lang, tipo, params), html });
}

function leerPlantilla(tipo, params) {
  return readFileSync(path.join(RAIZ, archivoPagina(DEFAULT_LANG, tipo, params)), 'utf8');
}

const migaInicio = (lang) => ({ nombre: 'Vestigia', url: urlPagina(lang, 'index', {}) });

// ---- Portada ----------------------------------------------------------

function generarIndice(lang) {
  let html = aplicarCabecera(leerPlantilla('index', {}), lang, 'index', {}, {
    ...seoPortada(lang),
    imagenOg: `${OG}/portada.jpg`,
    ld: [ldOrganizacion(lang), ldWeb(lang)],
  });
  html = aplicarI18nAtributos(aplicarI18nTexto(html, lang), lang);
  html = conHTML(html, 'grid-ciudades', CIUDADES.map((c, i) => tarjetaCiudad(c, i, lang)).join(''));
  escribir(lang, 'index', {}, finalizar(html, lang));
}

// ---- Páginas de ciudad ------------------------------------------------

function generarCiudad(ciudad, lang) {
  const params = { slug: ciudad.slug };
  const nombre = localizar(ciudad.nombre, lang);
  const resumen = localizar(ciudad.resumen, lang);

  let html = aplicarCabecera(leerPlantilla('ciudad', params), lang, 'ciudad', params, {
    ...seoCiudad(ciudad, lang),
    imagenOg: `${OG}/ciudad-${ciudad.slug}.jpg`,
    ld: [ldListaRutas(ciudad, lang), ldMigas(lang, [migaInicio(lang), { nombre, url: urlPagina(lang, 'ciudad', params) }])],
  });
  html = aplicarI18nAtributos(aplicarI18nTexto(html, lang), lang);

  html = conHTML(html, 'ciudad-hero', `
    <img class="ciudad-hero__foto" src="../${ciudad.imgHero}" alt="${escaparAtributo(nombre)}">
    <div class="ciudad-hero__velo" aria-hidden="true"></div>
    <div class="ciudad-hero__contenido">
      <p class="eyebrow">${escaparTexto(t(lang, 'hero_eyebrow'))}</p>
      <p class="ciudad-hero__pais">${escaparTexto(localizar(ciudad.pais, lang))}</p>
      <h1 class="ciudad-hero__nombre">${escaparTexto(nombre)}</h1>
      <p class="ciudad-hero__resumen">${escaparTexto(resumen)}</p>
    </div>`);
  html = conTexto(html, 'rutas-titulo', tf(lang, 'ciudad_rutas_disponibles', { ciudad: nombre }));
  html = conHTML(html, 'grid-rutas', rutasPorCiudad(ciudad.slug).map((r) => tarjetaRuta(r, lang)).join(''));

  const historia = historiaPorSlug(ciudad.slug);
  const enlaceHistoria = historia
    ? `<p><a class="enlace-editorial" href="../historias/${historia.id}.html">${escaparTexto(tf(lang, 'ruta_leer_historia', { ciudad: nombre }))}</a></p>`
    : '';
  html = conHTML(html, 'ciudad-enlaces-finales', `<p><a class="btn btn-fantasma" href="../index.html">${escaparTexto(t(lang, 'ruta_todas_ciudades'))}</a></p>${enlaceHistoria}`);

  escribir(lang, 'ciudad', params, finalizar(html, lang));
}

// ---- Páginas de ruta --------------------------------------------------

function generarRuta(ruta, lang) {
  const params = { id: ruta.id };
  const ciudad = ciudadPorSlug(ruta.ciudadSlug);
  const tituloRuta = localizar(ruta.titulo, lang);
  const nombre = localizar(ciudad.nombre, lang);

  let html = aplicarCabecera(leerPlantilla('ruta', params), lang, 'ruta', params, {
    ...seoRuta(ruta, lang),
    imagenOg: `${OG}/ruta-${ruta.id}.jpg`,
    ld: [
      ldProductoRuta(ruta, lang),
      ldMigas(lang, [migaInicio(lang), { nombre, url: urlPagina(lang, 'ciudad', { slug: ciudad.slug }) }, { nombre: tituloRuta, url: urlPagina(lang, 'ruta', params) }]),
    ],
  });
  html = aplicarI18nAtributos(aplicarI18nTexto(html, lang), lang);

  html = conAtributo(html, 'ruta-foto', 'src', `../${ruta.imgHero}`);
  html = conAtributo(html, 'ruta-foto', 'alt', tituloRuta);
  html = conTexto(html, 'ruta-zona-eyebrow', ruta.zona);
  html = conTexto(html, 'ruta-titulo', tituloRuta);
  html = conTexto(html, 'ruta-resumen', localizar(ruta.resumen, lang));
  html = conTexto(html, 'adelanto-texto', `“${localizar(ruta.acertijoMuestra, lang)}”`);
  html = conAtributo(html, 'mapa-zona-img', 'src', `../${ruta.imgMapa}`);
  html = conAtributo(html, 'mapa-zona-img', 'alt', tf(lang, 'ruta_mapa_alt', { zona: ruta.zona }));
  html = conTexto(html, 'mapa-zona-caption', ruta.zona);

  html = conAtributo(html, 'migas-ciudad', 'href', `../ciudad/${ciudad.slug}.html`);
  html = conTexto(html, 'migas-ciudad', nombre);
  html = conTexto(html, 'migas-ruta', tituloRuta);
  html = conAtributo(html, 'ruta-volver', 'href', `../ciudad/${ciudad.slug}.html`);
  html = conTexto(html, 'ruta-volver', tf(lang, 'ruta_volver', { ciudad: nombre }));

  const hermanas = rutasHermanas(ruta.id);
  if (hermanas.length > 0) {
    const enlaces = hermanas.map((r) => `<a class="btn btn-fantasma" href="${r.id}.html">${escaparTexto(localizar(r.titulo, lang))}</a>`).join('');
    const titulo = escaparTexto(tf(lang, 'ruta_otras_titulo', { ciudad: nombre }));
    html = conHTML(html, 'rutas-relacionadas', `<h2 class="seccion-relacionadas__titulo">${titulo}</h2><div class="seccion-relacionadas__lista">${enlaces}</div>`);
  }

  const historia = historiaPorSlug(ciudad.slug);
  const enlaceHistoria = historia
    ? `<p><a class="enlace-editorial" href="../historias/${historia.id}.html">${escaparTexto(tf(lang, 'ruta_leer_historia', { ciudad: nombre }))}</a></p>`
    : '';
  html = conHTML(html, 'ruta-enlaces-finales', `<p><a class="btn btn-fantasma" href="../index.html">${escaparTexto(t(lang, 'ruta_todas_ciudades'))}</a></p>${enlaceHistoria}`);

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
  html = conTexto(html, 'cta-reservar', esGratis ? t(lang, 'ruta_jugar_gratis_cta') : tf(lang, 'ruta_reservar_cta', { precio: ruta.precio }));

  escribir(lang, 'ruta', params, finalizar(html, lang));
}

// ---- Historias ----------------------------------------------------------

function generarHistoriasIndice(lang) {
  const seo = seoHistoriasIndice(lang);
  let html = aplicarCabecera(leerPlantilla('historia-indice', {}), lang, 'historia-indice', {}, {
    ...seo,
    imagenOg: `${OG}/portada.jpg`,
    ld: [
      {
        '@type': 'CollectionPage',
        name: seo.titulo,
        url: urlPagina(lang, 'historia-indice', {}),
        inLanguage: lang,
        hasPart: HISTORIAS.map((h) => ({ '@type': 'Article', headline: localizar(h.titulo, lang), url: urlPagina(lang, 'historia', { id: h.id }) })),
      },
      ldMigas(lang, [migaInicio(lang), { nombre: t(lang, 'historias_titulo'), url: urlPagina(lang, 'historia-indice', {}) }]),
    ],
  });
  html = aplicarI18nAtributos(aplicarI18nTexto(html, lang), lang);

  if (HISTORIAS.length > 0) {
    const [destacada, ...resto] = HISTORIAS;
    html = conHTML(html, 'historia-destacada', historiaDestacadaHTML(destacada, lang));
    html = conHTML(html, 'grid-historias', resto.map((h) => tarjetaHistoria(h, lang)).join(''));
  }
  escribir(lang, 'historia-indice', {}, finalizar(html, lang));
}

// Fecha de publicación de cada historia: la del commit que creó su página
// (git), o `publicada` en js/catalogo.js si se quiere fijar a mano. Cuando
// se revise el texto de una historia, se pone `actualizada: 'AAAA-MM-DD'`
// en su entrada del catálogo: sale en la página y en el JSON-LD, y es lo que
// los asistentes de IA miran para decidir si una fuente está al día.
const cacheFechas = new Map();
function fechasHistoria(historia) {
  if (cacheFechas.has(historia.id)) return cacheFechas.get(historia.id);
  let publicada = historia.publicada || null;
  if (!publicada) {
    try {
      const salida = execFileSync('git', ['log', '--diff-filter=A', '--follow', '--format=%cs', '--', `historias/${historia.id}.html`], { cwd: RAIZ, encoding: 'utf8' });
      publicada = salida.trim().split('\n').filter(Boolean).pop() || null;
    } catch {
      publicada = null;
    }
  }
  // Una historia nueva todavía sin commit: se publica hoy.
  if (!publicada) publicada = new Date().toISOString().slice(0, 10);
  const fechas = { publicada, actualizada: historia.actualizada || null };
  cacheFechas.set(historia.id, fechas);
  return fechas;
}

function generarHistoria(historia, lang) {
  const params = { id: historia.id };
  const titulo = localizar(historia.titulo, lang);
  const nombre = localizar(ciudadPorSlug(historia.ciudadSlug).nombre, lang);
  const fechas = fechasHistoria(historia);

  let html = aplicarCabecera(leerPlantilla('historia', params), lang, 'historia', params, {
    ...seoHistoria(historia, lang),
    tipoOg: 'article',
    imagenOg: `${OG}/ciudad-${historia.ciudadSlug}.jpg`,
    ld: [
      ldArticulo(historia, lang, fechas),
      ldMigas(lang, [
        migaInicio(lang),
        { nombre: t(lang, 'historias_titulo'), url: urlPagina(lang, 'historia-indice', {}) },
        { nombre: titulo, url: urlPagina(lang, 'historia', params) },
      ]),
    ],
  });
  html = aplicarI18nAtributos(aplicarI18nTexto(html, lang), lang);

  // La línea de fecha llegó después que las primeras historias: si la
  // plantilla aún no la tiene, se inserta tras el resumen.
  if (!/id="historia-fecha"/.test(html)) {
    html = html.replace(/(<p[^>]*id="historia-resumen"[^>]*>[\s\S]*?<\/p>)/, '$1\n    <p class="historia-fecha" id="historia-fecha"></p>');
  }
  const fechaVisible = fechas.actualizada || fechas.publicada;
  html = conHTML(html, 'historia-fecha', `<time datetime="${fechaVisible}">${escaparTexto(textoFecha(fechas.publicada, fechas.actualizada, lang))}</time>`);

  html = conTexto(html, 'migas-ciudad', nombre);
  html = conTexto(html, 'migas-historia', titulo);
  html = conAtributo(html, 'historia-foto', 'src', `../${historia.imgHero}`);
  html = conAtributo(html, 'historia-foto', 'alt', titulo);
  html = conTexto(html, 'historia-eyebrow', nombre);
  html = conTexto(html, 'historia-titulo', titulo);
  html = conTexto(html, 'historia-resumen', localizar(historia.resumen, lang));
  html = conHTML(html, 'historia-secciones', historia.secciones.map((s) => seccionHTML(s, lang)).join(''));
  html = conHTML(html, 'historia-cierre', cierreConEnlaces(historia, lang));

  escribir(lang, 'historia', params, finalizar(html, lang));
}

// ---- sitemap.xml ------------------------------------------------------
//
// <lastmod> solo sirve si es fiable: Google y Bing lo ignoran en un sitio
// que lo pone siempre a "hoy". Se guarda en scripts/sitemap-fechas.json un
// hash del HTML de cada URL; la fecha cambia solo cuando el HTML cambia.

const ARCHIVO_FECHAS = path.join(AQUI, 'sitemap-fechas.json');

function generarSitemap() {
  const hoy = new Date().toISOString().slice(0, 10);
  const previas = existsSync(ARCHIVO_FECHAS) ? JSON.parse(readFileSync(ARCHIVO_FECHAS, 'utf8')) : {};
  const fechas = {};
  for (const { url, html } of generadas) {
    // El año del pie cambia cada enero en todas las páginas a la vez sin que
    // cambie el contenido: no cuenta como modificación.
    const sha = createHash('sha256').update(html.replace(/©\s*\d{4}/g, '©')).digest('hex').slice(0, 16);
    fechas[url] = previas[url]?.sha === sha ? previas[url] : { sha, fecha: hoy };
  }
  const ordenadas = Object.fromEntries(Object.keys(fechas).sort().map((u) => [u, fechas[u]]));
  writeFileSync(ARCHIVO_FECHAS, `${JSON.stringify(ordenadas, null, 2)}\n`, 'utf8');

  const cuerpo = generadas
    .map(({ url }) => `  <url>\n    <loc>${escaparTexto(url)}</loc>\n    <lastmod>${fechas[url].fecha}</lastmod>\n  </url>`)
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${cuerpo}\n</urlset>\n`;
  writeFileSync(path.join(RAIZ, 'sitemap.xml'), xml, 'utf8');
  console.log(`sitemap.xml: ${generadas.length} URLs`);
}

// ---- Ejecución --------------------------------------------------------
// Español primero: es la plantilla de los otros tres idiomas, así que tiene
// que estar al día antes de que ellos la lean.

const ORDEN = [DEFAULT_LANG, ...LANGS.filter((l) => l !== DEFAULT_LANG)];
for (const lang of ORDEN) {
  generarIndice(lang);
  generarHistoriasIndice(lang);
  for (const ciudad of CIUDADES_ACTIVAS) generarCiudad(ciudad, lang);
  for (const ruta of RUTAS) generarRuta(ruta, lang);
  for (const historia of HISTORIAS) generarHistoria(historia, lang);
  console.log(`${lang}: portada + historias + ${CIUDADES_ACTIVAS.length} ciudades + ${RUTAS.length} rutas + ${HISTORIAS.length} historias`);
}

generarSitemap();

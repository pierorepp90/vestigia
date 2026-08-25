// js/ciudad.js
// Motor compartido por ciudad/*.html. Cada HTML es una página real y propia
// (una URL por ciudad), pero delega el renderizado al mismo módulo: lee
// `data-ciudad` del <body>, busca los datos en el catálogo y pinta el banner
// y la lista de rutas disponibles.
import { ciudadPorSlug, ciudadesRelacionadas, localizar, rutasPorCiudad } from './catalogo.js';
import { aplicarI18n, detectarIdioma, escaparHtml, poblarSelectorIdioma, t, tf, urlRecurso } from './i18n.js';

export const ICONO_RELOJ =
  '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="8" cy="8" r="6.3"/><path d="M8 4.6V8l2.6 1.6"/></svg>';
export const ICONO_PERSONAS =
  '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="5.6" cy="5.2" r="2"/><path d="M1.6 13c.4-2.4 2-3.6 4-3.6s3.6 1.2 4 3.6"/><circle cx="11.2" cy="5.6" r="1.6"/><path d="M10.2 9.6c1.7.2 2.9 1.4 3.2 3.4"/></svg>';
const ICONO_MAPA =
  '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M8 14.5s5-4.6 5-8.5a5 5 0 1 0-10 0c0 3.9 5 8.5 5 8.5Z"/><circle cx="8" cy="6" r="1.8"/></svg>';

export function tarjetaRuta(ruta, lang) {
  const titulo = escaparHtml(localizar(ruta.titulo, lang));
  const precioTexto = ruta.precio === 0
    ? t(lang, 'precio_gratis')
    : `${ruta.precio} € <small>${t(lang, 'precio_por_equipo')}</small>`;
  return `
  <a class="tarjeta-ruta" href="../ruta/${ruta.id}.html">
    <div class="tarjeta-ruta__foto-envoltorio">
      <img class="tarjeta-ruta__foto" src="${urlRecurso(ruta.imgCard, '../')}" alt="${titulo}" loading="lazy" width="900" height="600">
    </div>
    <div class="tarjeta-ruta__cuerpo">
      <span class="tarjeta-ruta__zona">${ICONO_MAPA} ${escaparHtml(ruta.zona)}</span>
      <h3 class="tarjeta-ruta__titulo">${titulo}</h3>
      <p class="tarjeta-ruta__resumen">${escaparHtml(localizar(ruta.resumen, lang))}</p>
      <div class="tarjeta-ruta__pie">
        <span class="meta-item">${ICONO_RELOJ} ${tf(lang, 'meta_duracion', { h: Math.round(ruta.duracionMin / 60) })}</span>
        <span class="meta-item">${ICONO_PERSONAS} ${tf(lang, 'meta_jugadores', { min: ruta.jugadoresMin, max: ruta.jugadoresMax })}</span>
        <span class="badge-dificultad badge-dificultad--${ruta.dificultad}">${t(lang, 'dificultad_' + ruta.dificultad)}</span>
        <span class="tarjeta-ruta__precio">${precioTexto}</span>
      </div>
    </div>
  </a>`;
}

function init() {
  const slug = document.body.dataset.ciudad;
  const ciudad = ciudadPorSlug(slug);
  const lang = detectarIdioma();
  document.documentElement.lang = lang;

  if (!ciudad) {
    document.getElementById('ciudad-contenido').innerHTML = '<p class="contenedor">Ciudad no encontrada.</p>';
    return;
  }

  aplicarI18n(document, lang);
  poblarSelectorIdioma(lang);

  const nombre = localizar(ciudad.nombre, lang);
  const resumen = localizar(ciudad.resumen, lang);

  document.title = `${nombre} — Vestigia`;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content', resumen);

  const hero = document.getElementById('ciudad-hero');
  hero.innerHTML = `
    <img class="ciudad-hero__foto" src="${urlRecurso(ciudad.imgHero, '../')}" alt="${escaparHtml(nombre)}">
    <div class="ciudad-hero__velo" aria-hidden="true"></div>
    <div class="ciudad-hero__contenido">
      <p class="eyebrow">${t(lang, 'hero_eyebrow')}</p>
      <p class="ciudad-hero__pais">${escaparHtml(localizar(ciudad.pais, lang))}</p>
      <h1 class="ciudad-hero__nombre">${escaparHtml(nombre)}</h1>
      <p class="ciudad-hero__resumen">${escaparHtml(resumen)}</p>
    </div>`;

  const rutas = rutasPorCiudad(slug);
  document.getElementById('rutas-titulo').textContent = tf(lang, 'ciudad_rutas_disponibles', { ciudad: nombre });
  document.getElementById('grid-rutas').innerHTML = rutas.map((r) => tarjetaRuta(r, lang)).join('');

  const otras = ciudadesRelacionadas(slug);
  if (otras.length > 0) {
    document.getElementById('ciudades-relacionadas').innerHTML = `
      <h2 class="seccion-relacionadas__titulo">${t(lang, 'ciudad_otras_titulo')}</h2>
      <div class="seccion-relacionadas__lista">
        ${otras.map((c) => `<a class="btn btn-fantasma" href="${c.slug}.html">${escaparHtml(localizar(c.nombre, lang))}</a>`).join('')}
      </div>`;
  }
}

// Solo se ejecuta en el navegador — este módulo también se importa desde
// scripts/generar-i18n.mjs (Node, sin `document`) para reutilizar
// tarjetaRuta() al generar las páginas estáticas.
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}

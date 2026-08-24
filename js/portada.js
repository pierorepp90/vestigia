// js/portada.js
// Renderiza la cuadrícula de ciudades de la portada a partir del catálogo
// público (js/catalogo.js) y aplica el idioma activo.
import { CIUDADES, localizar, rutasPorCiudad } from './catalogo.js';
import { LANGS, aplicarI18n, detectarIdioma, guardarIdioma, t, tf } from './i18n.js';

const ICONO_RELOJ =
  '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="8" cy="8" r="6.3"/><path d="M8 4.6V8l2.6 1.6"/></svg>';
const ICONO_PERSONAS =
  '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="5.6" cy="5.2" r="2"/><path d="M1.6 13c.4-2.4 2-3.6 4-3.6s3.6 1.2 4 3.6"/><circle cx="11.2" cy="5.6" r="1.6"/><path d="M10.2 9.6c1.7.2 2.9 1.4 3.2 3.4"/></svg>';

/** SVG de matasellos circular con el país curvado arriba y "VESTIGIA" abajo. */
function matasellosSVG(pais, indice) {
  const idArriba = `curva-arriba-${indice}`;
  const idAbajo = `curva-abajo-${indice}`;
  return `
  <svg class="matasellos" viewBox="0 0 84 84" aria-hidden="true">
    <defs>
      <path id="${idArriba}" d="M 10,44 A 34,34 0 0 1 74,44" />
      <path id="${idAbajo}" d="M 12,46 A 32,32 0 0 0 72,46" />
    </defs>
    <circle cx="42" cy="42" r="38" stroke-width="1.4" />
    <circle cx="42" cy="42" r="33" stroke-width="0.8" stroke-dasharray="1 3" />
    <line x1="42" y1="14" x2="42" y2="20" stroke-width="1.2" />
    <line x1="42" y1="64" x2="42" y2="70" stroke-width="1.2" />
    <text><textPath href="#${idArriba}" startOffset="50%" text-anchor="middle">${pais}</textPath></text>
    <text y="60"><textPath href="#${idAbajo}" startOffset="50%" text-anchor="middle">· VESTIGIA ·</textPath></text>
  </svg>`;
}

function tarjetaCiudad(ciudad, indice, lang) {
  const activa = ciudad.activa;
  const rutas = activa ? rutasPorCiudad(ciudad.slug) : [];
  const primera = rutas[0];
  const href = activa ? `ciudad/${ciudad.slug}.html` : undefined;
  const Tag = activa ? 'a' : 'div';
  const nombre = localizar(ciudad.nombre, lang);
  const pais = localizar(ciudad.pais, lang);

  const metaHtml = primera
    ? `<div class="tarjeta-ciudad__meta">
         <span class="meta-item">${ICONO_RELOJ} ${tf(lang, 'meta_duracion', { h: Math.round(primera.duracionMin / 60) })}</span>
         <span class="meta-item">${ICONO_PERSONAS} ${tf(lang, 'meta_jugadores', { min: primera.jugadoresMin, max: primera.jugadoresMax })}</span>
         <span class="badge-dificultad badge-dificultad--${primera.dificultad}">${t(lang, 'dificultad_' + primera.dificultad)}</span>
       </div>`
    : '';

  return `
  <${Tag} class="tarjeta-ciudad ${activa ? 'tarjeta-ciudad--activa' : 'tarjeta-ciudad--inactiva'}"
     style="--retraso:${(indice * 90)}ms" ${href ? `href="${href}"` : ''}>
    <div class="tarjeta-ciudad__marco">
      <img class="tarjeta-ciudad__foto" src="${ciudad.imgCard}" alt="${nombre}" loading="lazy" width="900" height="600">
      ${matasellosSVG(pais, indice)}
      <div class="tarjeta-ciudad__solapa" aria-hidden="true"></div>
      ${!activa ? `<div class="cinta-proximamente">${t(lang, 'badge_proximamente')}</div>` : ''}
    </div>
    <div class="tarjeta-ciudad__cuerpo">
      <span class="tarjeta-ciudad__pais">${pais}</span>
      <h3 class="tarjeta-ciudad__nombre">${nombre}</h3>
      <p class="tarjeta-ciudad__resumen">${localizar(ciudad.resumen, lang)}</p>
      ${metaHtml}
    </div>
  </${Tag}>`;
}

function renderCiudades(lang) {
  const contenedor = document.getElementById('grid-ciudades');
  if (!contenedor) return;
  contenedor.innerHTML = CIUDADES.map((c, i) => tarjetaCiudad(c, i, lang)).join('');
}

function poblarSelectorIdioma(lang) {
  const cont = document.getElementById('selector-idioma');
  if (!cont) return;
  cont.innerHTML = LANGS.map((code, i) => {
    const separador = i > 0 ? '<span class="selector-idioma__separador" aria-hidden="true">·</span>' : '';
    const activa = code === lang ? ' activa' : '';
    return `${separador}<button type="button" class="selector-idioma__opcion${activa}" data-lang="${code}" aria-pressed="${code === lang}">${code.toUpperCase()}</button>`;
  }).join('');
  cont.querySelectorAll('button').forEach((boton) => {
    boton.addEventListener('click', () => {
      guardarIdioma(boton.dataset.lang);
      location.reload();
    });
  });
}

function init() {
  const lang = detectarIdioma();
  document.documentElement.lang = lang;
  aplicarI18n(document, lang);
  poblarSelectorIdioma(lang);
  renderCiudades(lang);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

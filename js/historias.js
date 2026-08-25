// js/historias.js
// Índice del blog: un post destacado (el primero en HISTORIAS) + el resto
// en cuadrícula. Mismo patrón que js/portada.js.
import { HISTORIAS, ciudadPorSlug, localizar } from './catalogo.js';
import { aplicarI18n, detectarIdioma, escaparHtml, poblarSelectorIdioma, t, urlRecurso } from './i18n.js';

// urlRecurso(relativo, prefijoDesdeRaiz) — el segundo argumento es cuánto
// subir para llegar a la raíz desde ESTA página cuando no lleva prefijo
// de idioma. historias/index.html está a la misma profundidad que
// ciudad/*.html o ruta/*.html (una carpeta bajo la raíz), así que usa
// '../', igual que ellas — no el valor por defecto ''.
export function tarjetaHistoria(historia, lang) {
  const ciudad = ciudadPorSlug(historia.ciudadSlug);
  const titulo = escaparHtml(localizar(historia.titulo, lang));
  return `
  <a class="tarjeta-historia" href="${historia.id}.html">
    <img class="tarjeta-historia__foto" src="${urlRecurso(historia.imgHero, '../')}" alt="${titulo}" loading="lazy" width="900" height="675">
    <p class="eyebrow">${escaparHtml(localizar(ciudad.nombre, lang))}</p>
    <h3 class="tarjeta-historia__titulo">${titulo}</h3>
  </a>`;
}

function historiaDestacadaHTML(historia, lang) {
  const ciudad = ciudadPorSlug(historia.ciudadSlug);
  const titulo = escaparHtml(localizar(historia.titulo, lang));
  return `
  <a class="historia-destacada" href="${historia.id}.html">
    <img class="historia-destacada__foto" src="${urlRecurso(historia.imgHero, '../')}" alt="${titulo}">
    <div>
      <p class="eyebrow">${escaparHtml(localizar(ciudad.nombre, lang))}</p>
      <h2 class="historia-destacada__titulo">${titulo}</h2>
      <p class="historia-destacada__resumen">${escaparHtml(localizar(historia.resumen, lang))}</p>
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

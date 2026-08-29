// js/imprimir.js
// Genera la versión imprimible de una ruta: cada parada trae su enigma,
// casilla de respuesta e historia seguidos, para leer la recompensa nada
// más resolver sin saltar de página. Las pistas y "sobre este lugar" —lo
// único que sí sería spoiler ver "sin querer" antes de intentarlo— viven en
// una sección final agrupada por parada, que css/print.css arranca en su
// propia página al imprimir. Comparte token, caché y patrón de carga con
// js/jugar.js, pero no hay estado de partida que guardar — esto es solo lectura.
import { obtenerRuta } from './api.js';
import { DEFAULT_LANG, LANGS, aplicarI18n, detectarIdioma, guardarIdioma, t, tf } from './i18n.js';
import { figuraSvg } from './juego/figuras.js';
import { tieneSubpreguntas } from './juego/respuestas.js';

const els = {};
function refEls() {
  ['vista-cargando', 'vista-error', 'txt-error', 'hoja', 'txt-titulo', 'txt-intro', 'txt-punto-partida', 'lista-paradas', 'lista-respuestas', 'btn-imprimir']
    .forEach((id) => { els[id] = document.getElementById(id); });
}

function mostrar(idVisible) {
  for (const id of ['vista-cargando', 'vista-error', 'hoja']) els[id].hidden = id !== idVisible;
}

/** Una casilla por pregunta: las paradas con figura pueden pedir varias cosas. */
function renderCasillas(parada, lang) {
  if (!tieneSubpreguntas(parada)) {
    return `<div class="parada-impresa__casilla">${t(lang, 'imprimir_casilla_placeholder')}</div>`;
  }
  return parada.subpreguntas
    .map(
      (sub) => `
      <div class="parada-impresa__casilla parada-impresa__casilla--etiquetada">
        <span class="parada-impresa__casilla-texto">${sub.texto}</span>
      </div>`,
    )
    .join('');
}

function renderParadas(ruta, lang) {
  els['lista-paradas'].innerHTML = ruta.paradas
    .map(
      (p) => `
    <div class="parada-impresa">
      <span class="parada-impresa__numero">Parada ${p.n} / ${ruta.paradas.length}</span>
      <h2 class="parada-impresa__titulo">${p.titulo}</h2>
      <div class="parada-impresa__bloque">
        <span class="parada-impresa__etiqueta">${t(lang, 'imprimir_llegada_label')}</span>
        <p class="parada-impresa__texto">${p.llegada}</p>
      </div>
      <div class="parada-impresa__bloque">
        <span class="parada-impresa__etiqueta">${t(lang, 'imprimir_enigma_label')}</span>
        <p class="parada-impresa__texto">${p.enigma}</p>
        ${p.figuraId ? `<figure class="figura-impresa">${figuraSvg(p.figuraId)}</figure>` : ''}
      </div>
      ${renderCasillas(p, lang)}
      <div class="parada-impresa__bloque parada-impresa__bloque--historia">
        <span class="parada-impresa__etiqueta">${t(lang, 'imprimir_historia_label')}</span>
        <p class="parada-impresa__texto">${p.historia}</p>
      </div>
    </div>`,
    )
    .join('');
}

/**
 * Pistas de una parada, una por bloque: numeradas, y la última —siempre lo
 * bastante reveladora como para dar la respuesta (ver tests/contenido.test.js)—
 * relabeleada "Solución" en vez de seguir contando como pista.
 */
function renderPistasImpresas(parada, lang) {
  return parada.pistas
    .map((pista, i) => {
      const esUltima = i === parada.pistas.length - 1;
      const etiqueta = esUltima ? t(lang, 'imprimir_solucion_label') : tf(lang, 'imprimir_pista_label', { n: i + 1 });
      const clase = esUltima ? 'respuesta-impresa__pista respuesta-impresa__pista--solucion' : 'respuesta-impresa__pista';
      return `
      <div class="${clase}">
        <span class="parada-impresa__etiqueta">${etiqueta}</span>
        <p class="parada-impresa__texto">${pista}</p>
      </div>`;
    })
    .join('');
}

function renderRespuestas(ruta, lang) {
  els['lista-respuestas'].innerHTML = ruta.paradas
    .map(
      (p) => `
    <div class="respuesta-impresa">
      <h3 class="respuesta-impresa__titulo">${p.n}. ${p.titulo}</h3>
      ${p.saberMas ? `<p class="respuesta-impresa__sabermas"><strong>${t(lang, 'imprimir_sabermas_label')}:</strong> ${p.saberMas}</p>` : ''}
      ${renderPistasImpresas(p, lang)}
    </div>`,
    )
    .join('');
}

async function init() {
  refEls();

  const params = new URLSearchParams(location.search);
  const idiomaEnUrl = params.get('idioma');
  // Igual que en jugar.js: el enlace de compra manda sobre el idioma
  // detectado, para que la interfaz y el contenido nunca queden en
  // idiomas distintos entre sí.
  let lang;
  if (idiomaEnUrl && LANGS.includes(idiomaEnUrl)) {
    lang = idiomaEnUrl;
    guardarIdioma(idiomaEnUrl);
  } else {
    lang = detectarIdioma();
  }
  document.documentElement.lang = lang;
  aplicarI18n(els['vista-cargando'], lang);
  mostrar('vista-cargando');

  const token = params.get('t');
  const idioma = lang;

  if (!token) {
    aplicarI18n(els['vista-error'], lang);
    els['txt-error'].textContent = t(lang, 'juego_error_texto');
    mostrar('vista-error');
    return;
  }

  let datos;
  try {
    datos = await obtenerRuta(token, idioma);
  } catch (error) {
    aplicarI18n(els['vista-error'], lang);
    els['txt-error'].textContent = error.message;
    mostrar('vista-error');
    return;
  }

  const ruta = datos.ruta;
  aplicarI18n(els['hoja'], lang);
  els['txt-titulo'].textContent = ruta.titulo;
  els['txt-intro'].textContent = ruta.intro;
  els['txt-punto-partida'].textContent = `${t(lang, 'ruta_punto_partida_label')}: ${ruta.puntoPartida}`;
  renderParadas(ruta, lang);
  renderRespuestas(ruta, lang);
  els['btn-imprimir'].addEventListener('click', () => window.print());
  mostrar('hoja');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

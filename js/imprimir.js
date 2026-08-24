// js/imprimir.js
// Genera la versión imprimible de una ruta: enigmas primero, respuestas y
// pistas en una sección final (que css/print.css gira 180° al imprimir).
// Comparte token, caché y patrón de carga con js/jugar.js, pero no hay
// estado de partida que guardar — esto es solo lectura.
import { obtenerRuta } from './api.js';
import { DEFAULT_LANG, LANGS, aplicarI18n, detectarIdioma, guardarIdioma, t, tf } from './i18n.js';

const els = {};
function refEls() {
  ['vista-cargando', 'vista-error', 'txt-error', 'hoja', 'txt-titulo', 'txt-intro', 'txt-punto-partida', 'lista-paradas', 'lista-respuestas', 'btn-imprimir']
    .forEach((id) => { els[id] = document.getElementById(id); });
}

function mostrar(idVisible) {
  for (const id of ['vista-cargando', 'vista-error', 'hoja']) els[id].hidden = id !== idVisible;
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
      </div>
      <div class="parada-impresa__casilla">${t(lang, 'imprimir_casilla_placeholder')}</div>
    </div>`,
    )
    .join('');
}

function renderRespuestas(ruta, lang) {
  els['lista-respuestas'].innerHTML = ruta.paradas
    .map(
      (p) => `
    <div class="respuesta-impresa">
      <h3 class="respuesta-impresa__titulo">${p.n}. ${p.titulo} — <span class="respuesta-impresa__valor">${p.respuestas[0]}</span></h3>
      <p class="parada-impresa__etiqueta">${t(lang, 'imprimir_pistas_label')}</p>
      <ul class="respuesta-impresa__pistas">${p.pistas.map((pista) => `<li>${pista}</li>`).join('')}</ul>
      <p class="respuesta-impresa__historia"><strong>${t(lang, 'imprimir_historia_label')}:</strong> ${p.historia}</p>
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

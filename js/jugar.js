// js/jugar.js
// Orquesta la pantalla de juego (jugar/index.html): carga la ruta, aplica
// las respuestas del jugador contra js/juego/motor.js y redibuja el DOM a
// partir de un único objeto de estado. La lógica de verdad (evaluar
// respuestas, avanzar de parada, calcular el progreso) vive en js/juego/*;
// este archivo es solo el pegamento con el DOM.
import { obtenerRuta } from './api.js';
import { DEFAULT_LANG, LANGS, aplicarI18n, detectarIdioma, guardarIdioma, t, tf } from './i18n.js';
import { obtenerParada, responder, progresoPorcentaje } from './juego/motor.js';
import { tieneSubpreguntas } from './juego/respuestas.js';
import { figuraSvg } from './juego/figuras.js';
import { cargarProgreso, guardarProgreso, estadoInicial } from './juego/progreso.js';
import { pedirPista, pistasReveladas, quedanPistas } from './juego/pistas.js';
import { tiempoTranscurridoMs, formatearDuracion } from './juego/cronometro.js';

const CLAVE_TOKEN = (rutaId) => `vestigia:token:${rutaId}`;
const CLAVE_CONTENIDO = (rutaId, idioma) => `vestigia:contenido:${rutaId}:${idioma}`;

const els = {};
function refEls() {
  const ids = [
    'barra-superior', 'txt-parada', 'txt-tiempo', 'barra-relleno', 'aviso-offline',
    'vista-cargando', 'vista-error', 'txt-error',
    'vista-jugando', 'txt-parada-numero', 'txt-parada-titulo', 'txt-llegada', 'txt-enigma',
    'figura-enigma', 'feedback', 'form-respuesta', 'campos-respuesta', 'lista-pistas', 'btn-pista',
    'vista-revelando', 'txt-historia', 'txt-fuente', 'bloque-sabermas', 'txt-sabermas', 'btn-siguiente',
    'vista-completada', 'txt-final-titulo', 'txt-final-texto', 'txt-final-tiempo', 'link-imprimir',
  ];
  for (const id of ids) els[id] = document.getElementById(id);
}

/** Decodifica la parte de datos del token SIN verificar la firma — solo
 * para saber a qué ruta/pedido pertenece y poder cachear localmente. La
 * verificación real (¿es válido? ¿ha caducado?) la hace siempre el Worker. */
function payloadSinVerificar(token) {
  try {
    const [payloadB64] = token.split('.');
    const conRelleno = payloadB64.replace(/-/g, '+').replace(/_/g, '/').padEnd(payloadB64.length + ((4 - (payloadB64.length % 4)) % 4), '=');
    return JSON.parse(atob(conRelleno));
  } catch {
    return null;
  }
}

function mostrarVista(nombre) {
  const vistas = ['vista-cargando', 'vista-error', 'vista-jugando', 'vista-revelando', 'vista-completada'];
  for (const v of vistas) els[v].hidden = v !== nombre;
  els['barra-superior'].hidden = nombre === 'vista-cargando' || nombre === 'vista-error';
}

function mostrarError(lang, mensaje) {
  aplicarI18n(els['vista-error'], lang);
  els['txt-error'].textContent = mensaje || t(lang, 'juego_error_texto');
  mostrarVista('vista-error');
}

const app = {
  lang: DEFAULT_LANG,
  ruta: null,
  rutaId: null,
  orderId: null,
  estado: null,
  cronometroId: null,
};

function guardar() {
  guardarProgreso(app.rutaId, app.orderId, app.estado);
}

function renderPistas() {
  const parada = obtenerParada(app.ruta, app.estado);
  const reveladas = pistasReveladas(parada, app.estado);
  els['lista-pistas'].innerHTML = reveladas
    .map((texto, i) => `<div class="pista"><span class="pista__numero">#${i + 1}</span><span>${texto}</span></div>`)
    .join('');

  const quedan = quedanPistas(parada, app.estado);
  els['btn-pista'].disabled = !quedan;
  els['btn-pista'].textContent = quedan ? t(app.lang, 'juego_btn_pista') : t(app.lang, 'juego_btn_pista_agotadas');
}

/** Dibuja (o esconde) la figura del enigma: patrones, siluetas, esquemas. */
function renderFigura(parada) {
  const svg = figuraSvg(parada.figuraId);
  els['figura-enigma'].innerHTML = svg;
  els['figura-enigma'].hidden = !svg;
}

/**
 * Construye los campos de respuesta de la parada actual: uno solo en las
 * paradas normales, o uno por pregunta en las que piden varias cosas a la vez.
 * Se generan aquí en vez de vivir en el HTML porque su número cambia con cada
 * parada; el `<form>` de alrededor y el botón son siempre los mismos.
 */
function renderCampos(parada) {
  const contenedor = els['campos-respuesta'];
  const multiple = tieneSubpreguntas(parada);
  els['form-respuesta'].classList.toggle('form-respuesta--multiple', multiple);

  if (!multiple) {
    contenedor.innerHTML = `
      <label class="sr-only" for="respuesta-0">${t(app.lang, 'juego_input_placeholder')}</label>
      <input id="respuesta-0" class="input-respuesta" type="text" autocomplete="off"
             autocapitalize="off" spellcheck="false"
             placeholder="${t(app.lang, 'juego_input_placeholder')}">`;
    return;
  }

  contenedor.innerHTML = parada.subpreguntas
    .map(
      (sub, i) => `
      <div class="campo-multiple" data-indice="${i}">
        <label class="campo-multiple__etiqueta" for="respuesta-${i}">${sub.texto}</label>
        <input id="respuesta-${i}" class="input-respuesta input-respuesta--corta" type="text"
               autocomplete="off" autocapitalize="off" spellcheck="false"
               placeholder="${t(app.lang, 'juego_input_placeholder_corto')}">
      </div>`,
    )
    .join('');
}

/** Lee lo tecleado: un string, o un array cuando la parada tiene varias preguntas. */
function leerEntrada(parada) {
  const inputs = [...els['campos-respuesta'].querySelectorAll('input')];
  if (!tieneSubpreguntas(parada)) return inputs[0]?.value ?? '';
  return inputs.map((input) => input.value);
}

/** Marca en verde los huecos ya acertados cuando la respuesta es parcial. */
function marcarDetalle(detalle) {
  if (!Array.isArray(detalle)) return;
  els['campos-respuesta'].querySelectorAll('.campo-multiple').forEach((campo, i) => {
    campo.classList.toggle('campo-multiple--ok', detalle[i] === 'correcto');
  });
}

function renderBarraSuperior() {
  const total = app.ruta.paradas.length;
  const actual = Math.min(app.estado.paradaActual, total);
  els['txt-parada'].textContent = tf(app.lang, 'juego_parada_de', { actual, total });
  els['barra-relleno'].style.width = `${progresoPorcentaje(app.ruta, app.estado)}%`;
}

function actualizarCronometro() {
  els['txt-tiempo'].textContent = formatearDuracion(tiempoTranscurridoMs(app.estado));
}

function iniciarCronometro() {
  if (app.cronometroId) clearInterval(app.cronometroId);
  actualizarCronometro();
  app.cronometroId = setInterval(actualizarCronometro, 1000);
}

function detenerCronometro() {
  if (app.cronometroId) clearInterval(app.cronometroId);
  app.cronometroId = null;
}

function renderJugando() {
  const parada = obtenerParada(app.ruta, app.estado);
  aplicarI18n(els['vista-jugando'], app.lang);
  els['txt-parada-numero'].textContent = tf(app.lang, 'juego_parada_de', { actual: parada.n, total: app.ruta.paradas.length });
  els['txt-parada-titulo'].textContent = parada.titulo;
  els['txt-llegada'].textContent = parada.llegada;
  els['txt-enigma'].textContent = parada.enigma;
  renderFigura(parada);
  els['feedback'].className = 'feedback';
  els['feedback'].textContent = '';
  renderCampos(parada);
  renderPistas();
  renderBarraSuperior();
  mostrarVista('vista-jugando');
  iniciarCronometro();
  els['campos-respuesta'].querySelector('input')?.focus({ preventScroll: true });
}

function renderRevelando(paradaCompletada) {
  els['txt-historia'].textContent = paradaCompletada.historia;
  els['txt-fuente'].textContent = paradaCompletada.fuente ? `Fuente: ${paradaCompletada.fuente}` : '';
  els['bloque-sabermas'].hidden = !paradaCompletada.saberMas;
  els['bloque-sabermas'].open = false;
  els['txt-sabermas'].textContent = paradaCompletada.saberMas || '';
  const esFinal = app.estado.completada;
  els['btn-siguiente'].textContent = t(app.lang, esFinal ? 'juego_btn_siguiente_final' : 'juego_btn_siguiente');
  renderBarraSuperior();
  mostrarVista('vista-revelando');
}

function renderCompletada() {
  detenerCronometro();
  actualizarCronometro(); // sincroniza la barra superior con el tiempo final exacto antes de congelarla
  els['txt-final-titulo'].textContent = app.ruta.final?.titulo || '';
  els['txt-final-texto'].textContent = app.ruta.final?.texto || '';
  els['txt-final-tiempo'].textContent = tf(app.lang, 'juego_final_tiempo', {
    tiempo: formatearDuracion(tiempoTranscurridoMs(app.estado)),
  });
  els['link-imprimir'].href = `imprimir.html?ruta=${app.rutaId}&t=${encodeURIComponent(app.tokenActual)}`;
  mostrarVista('vista-completada');
}

function render() {
  if (app.estado.completada) {
    renderCompletada();
  } else {
    renderJugando();
  }
}

function manejarEnvioRespuesta(evento) {
  evento.preventDefault();
  const parada = obtenerParada(app.ruta, app.estado);
  const entrada = leerEntrada(parada);

  // En las paradas de varias preguntas exigimos que estén todas rellenas: si
  // no, el jugador recibiría un "incorrecto" por un hueco que solo olvidó.
  const vacia = Array.isArray(entrada)
    ? entrada.some((valor) => !valor.trim())
    : !entrada.trim();
  if (vacia) return;

  const { resultado, estado: nuevoEstado, detalle } = responder(app.ruta, app.estado, entrada);
  marcarDetalle(detalle);

  const feedback = els['feedback'];
  feedback.className = `feedback visible feedback--${resultado}`;
  feedback.textContent = t(app.lang, `juego_feedback_${resultado}`);

  if (resultado === 'correcto') {
    app.estado = nuevoEstado;
    guardar();
    detenerCronometro();
    renderRevelando(parada);
  }
}

function manejarPedirPista() {
  const parada = obtenerParada(app.ruta, app.estado);
  const resultado = pedirPista(parada, app.estado);
  if (!resultado) return;
  app.estado = resultado.estado;
  guardar();
  renderPistas();
}

function manejarSiguiente() {
  render();
}

function cargarContenidoCacheado(rutaId, idioma) {
  try {
    const crudo = localStorage.getItem(CLAVE_CONTENIDO(rutaId, idioma));
    return crudo ? JSON.parse(crudo) : null;
  } catch {
    return null;
  }
}

function guardarContenidoEnCache(rutaId, idioma, ruta) {
  try {
    localStorage.setItem(CLAVE_CONTENIDO(rutaId, idioma), JSON.stringify(ruta));
  } catch {
    // Sin espacio o localStorage inaccesible: la partida sigue jugable en memoria.
  }
}

function guardarTokenEnCache(rutaId, token) {
  try {
    localStorage.setItem(CLAVE_TOKEN(rutaId), token);
  } catch {
    // No pasa nada si no se puede persistir: el enlace del email siempre lo trae de vuelta.
  }
}

function leerTokenDeCache(rutaId) {
  try {
    return localStorage.getItem(CLAVE_TOKEN(rutaId));
  } catch {
    return null;
  }
}

async function init() {
  refEls();

  const params = new URLSearchParams(location.search);
  const idiomaEnUrl = params.get('idioma');
  // El enlace de compra/email lleva el idioma que el cliente eligió al
  // pagar: manda sobre cualquier idioma detectado o guardado antes, para
  // que la interfaz y el contenido de la ruta nunca queden en idiomas
  // distintos entre sí.
  if (idiomaEnUrl && LANGS.includes(idiomaEnUrl)) {
    app.lang = idiomaEnUrl;
    guardarIdioma(idiomaEnUrl);
  } else {
    app.lang = detectarIdioma();
  }
  document.documentElement.lang = app.lang;
  aplicarI18n(els['vista-cargando'], app.lang);
  mostrarVista('vista-cargando');

  const idiomaSolicitado = app.lang;
  let token = params.get('t');
  let rutaIdDesdeUrl = params.get('ruta');

  if (!token && rutaIdDesdeUrl) {
    token = leerTokenDeCache(rutaIdDesdeUrl);
  }

  if (!token) {
    mostrarError(app.lang);
    return;
  }

  const payload = payloadSinVerificar(token);
  const rutaId = payload?.rutaId || rutaIdDesdeUrl;
  if (!rutaId) {
    mostrarError(app.lang);
    return;
  }

  app.tokenActual = token;
  guardarTokenEnCache(rutaId, token);

  let datosApi = null;
  try {
    datosApi = await obtenerRuta(token, idiomaSolicitado);
  } catch (error) {
    const cacheado = cargarContenidoCacheado(rutaId, idiomaSolicitado) || cargarContenidoCacheado(rutaId, DEFAULT_LANG);
    if (cacheado) {
      app.ruta = cacheado.ruta;
      app.rutaId = cacheado.rutaId;
      app.orderId = cacheado.orderId;
      els['aviso-offline'].classList.add('visible');
      aplicarI18n(els['aviso-offline'], app.lang);
    } else {
      mostrarError(app.lang, error.message);
      return;
    }
  }

  if (datosApi) {
    app.ruta = datosApi.ruta;
    app.rutaId = datosApi.rutaId;
    app.orderId = datosApi.orderId;
    guardarContenidoEnCache(app.rutaId, datosApi.idiomaServido, datosApi);
  }

  app.estado = cargarProgreso(app.rutaId, app.orderId) || estadoInicial();
  if (!cargarProgreso(app.rutaId, app.orderId)) guardar();

  aplicarI18n(document, app.lang);
  els['form-respuesta'].addEventListener('submit', manejarEnvioRespuesta);
  els['btn-pista'].addEventListener('click', manejarPedirPista);
  els['btn-siguiente'].addEventListener('click', manejarSiguiente);

  render();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

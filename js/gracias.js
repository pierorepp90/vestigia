// js/gracias.js
// Verifica el pago tras volver de Stripe Checkout y entrega el acceso a la
// ruta: un enlace directo a jugar/ (el email con el mismo enlace ya se ha
// enviado desde el Worker en la propia llamada a /api/confirm-payment).
import { confirmarPago } from './api.js';
import { LANGS, aplicarI18n, detectarIdioma } from './i18n.js';

const els = {};
function refEls() {
  ['vista-verificando', 'vista-exito', 'vista-no-pagado', 'vista-error', 'txt-error', 'link-jugar', 'link-imprimir']
    .forEach((id) => { els[id] = document.getElementById(id); });
}

function mostrar(idVisible) {
  for (const id of ['vista-verificando', 'vista-exito', 'vista-no-pagado', 'vista-error']) {
    els[id].hidden = id !== idVisible;
  }
}

async function init() {
  refEls();
  const lang = detectarIdioma();
  document.documentElement.lang = lang;
  aplicarI18n(document, lang);
  mostrar('vista-verificando');

  const params = new URLSearchParams(location.search);

  // Ruta gratis: no hay pago que verificar. El propio enlace ya trae el
  // token, acuñado por /api/acceso-gratuito en el momento de pedirlo.
  if (params.get('gratis') === '1') {
    const rutaId = params.get('ruta');
    const token = params.get('t');
    const idiomaParam = params.get('idioma');
    const idioma = LANGS.includes(idiomaParam) ? idiomaParam : lang;

    if (!rutaId || !token) {
      els['txt-error'].textContent = 'Falta la referencia del acceso gratuito.';
      mostrar('vista-error');
      return;
    }

    if (idioma !== lang) {
      document.documentElement.lang = idioma;
      aplicarI18n(document, idioma);
    }
    els['link-jugar'].href = `index.html?ruta=${rutaId}&t=${encodeURIComponent(token)}&idioma=${idioma}`;
    els['link-imprimir'].href = `imprimir.html?ruta=${rutaId}&t=${encodeURIComponent(token)}&idioma=${idioma}`;
    mostrar('vista-exito');
    return;
  }

  const sessionId = params.get('session_id');

  if (!sessionId) {
    els['txt-error'].textContent = 'Falta la referencia de la sesión de pago.';
    mostrar('vista-error');
    return;
  }

  let resultado;
  try {
    resultado = await confirmarPago(sessionId);
  } catch (error) {
    els['txt-error'].textContent = error.message;
    mostrar('vista-error');
    return;
  }

  if (!resultado.paid) {
    mostrar('vista-no-pagado');
    return;
  }

  const idioma = LANGS.includes(resultado.idioma) ? resultado.idioma : lang;
  // El idioma de la compra (guardado en el pedido) manda sobre el
  // detectado al cargar la página: si alguien compró en italiano con el
  // navegador en español, esta pantalla — y las dos siguientes — deben
  // verse en italiano.
  if (idioma !== lang) {
    document.documentElement.lang = idioma;
    aplicarI18n(document, idioma);
  }
  els['link-jugar'].href = `index.html?ruta=${resultado.rutaId}&t=${encodeURIComponent(resultado.token)}&idioma=${idioma}`;
  els['link-imprimir'].href = `imprimir.html?ruta=${resultado.rutaId}&t=${encodeURIComponent(resultado.token)}&idioma=${idioma}`;
  mostrar('vista-exito');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

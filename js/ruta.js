// js/ruta.js
// Motor compartido por ruta/*.html — la ficha de producto de cada escape
// room. Lee `data-ruta` del <body>, busca los datos en el catálogo
// (js/catalogo.js) y pinta la ficha completa: hero, adelanto del enigma,
// qué incluye y el panel de reserva.
//
// El botón de reservar crea una sesión de Stripe Checkout (worker/src/
// stripe.js) y redirige allí; a la vuelta, jugar/gracias.html confirma el
// pago y entrega el acceso.
import { ciudadPorSlug, historiaPorSlug, localizar, rutaPorId, rutasHermanas } from './catalogo.js';
import { LANG_NAMES, aplicarI18n, detectarIdioma, escaparHtml, poblarSelectorIdioma, t, tf, urlRecurso } from './i18n.js';
import { crearAccesoGratuito, crearCheckoutSession } from './api.js';

function init() {
  const id = document.body.dataset.ruta;
  const ruta = rutaPorId(id);
  const lang = detectarIdioma();
  document.documentElement.lang = lang;

  if (!ruta) {
    document.getElementById('ruta-contenido').innerHTML = '<p class="contenedor">Ruta no encontrada.</p>';
    return;
  }
  const ciudad = ciudadPorSlug(ruta.ciudadSlug);

  aplicarI18n(document, lang);
  poblarSelectorIdioma(lang);

  const tituloRuta = localizar(ruta.titulo, lang);
  const nombreCiudad = localizar(ciudad.nombre, lang);

  document.title = `${tituloRuta} — Vestigia`;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content', localizar(ruta.resumen, lang));

  // Migas de pan
  document.getElementById('migas-ciudad').textContent = nombreCiudad;
  document.getElementById('migas-ciudad').href = `../ciudad/${ciudad.slug}.html`;
  document.getElementById('migas-ruta').textContent = tituloRuta;

  // Cuerpo principal
  document.getElementById('ruta-foto').src = urlRecurso(ruta.imgHero, '../');
  document.getElementById('ruta-foto').alt = tituloRuta;
  document.getElementById('ruta-zona-eyebrow').textContent = ruta.zona;
  document.getElementById('ruta-titulo').textContent = tituloRuta;
  document.getElementById('ruta-resumen').textContent = localizar(ruta.resumen, lang);
  document.getElementById('adelanto-texto').textContent = `“${localizar(ruta.acertijoMuestra, lang)}”`;
  document.getElementById('mapa-zona-img').src = urlRecurso(ruta.imgMapa, '../');
  document.getElementById('mapa-zona-img').alt = tf(lang, 'ruta_mapa_alt', { zona: ruta.zona });
  document.getElementById('mapa-zona-caption').textContent = ruta.zona;

  // Panel ficha
  document.getElementById('panel-duracion').textContent = tf(lang, 'meta_duracion', { h: Math.round(ruta.duracionMin / 60) });
  document.getElementById('panel-jugadores').textContent = tf(lang, 'meta_jugadores', { min: ruta.jugadoresMin, max: ruta.jugadoresMax });
  document.getElementById('panel-dificultad').innerHTML = `<span class="badge-dificultad badge-dificultad--${ruta.dificultad}">${t(lang, 'dificultad_' + ruta.dificultad)}</span>`;
  document.getElementById('panel-zona').textContent = ruta.zona;
  document.getElementById('panel-partida').textContent = localizar(ruta.puntoPartida, lang);
  document.getElementById('panel-idiomas').textContent = ruta.idiomas.map((c) => LANG_NAMES[c]).join(' · ');
  const esGratis = ruta.precio === 0;
  document.getElementById('panel-precio').innerHTML = esGratis
    ? t(lang, 'precio_gratis')
    : `${ruta.precio} €<small>${t(lang, 'precio_por_equipo')}</small>`;

  const panelEmail = document.getElementById('panel-email');
  const inputEmail = document.getElementById('input-email-gratis');
  panelEmail.hidden = !esGratis;

  const cta = document.getElementById('cta-reservar');
  const textoOriginal = esGratis
    ? t(lang, 'ruta_jugar_gratis_cta')
    : tf(lang, 'ruta_reservar_cta', { precio: ruta.precio });
  cta.textContent = textoOriginal;
  cta.href = '#';
  cta.addEventListener('click', async (evento) => {
    evento.preventDefault();
    if (cta.getAttribute('aria-busy') === 'true') return; // evita doble clic mientras carga
    if (esGratis && !inputEmail.reportValidity()) return;

    cta.setAttribute('aria-busy', 'true');
    cta.textContent = t(lang, esGratis ? 'ruta_enviando_acceso' : 'ruta_reservando');
    try {
      if (esGratis) {
        const resultado = await crearAccesoGratuito(ruta.id, lang, inputEmail.value.trim());
        const paginaGracias = urlRecurso('jugar/gracias.html', '../');
        location.href = `${paginaGracias}?ruta=${resultado.rutaId}&idioma=${encodeURIComponent(resultado.idioma)}&t=${encodeURIComponent(resultado.token)}&gratis=1`;
      } else {
        const url = await crearCheckoutSession(ruta.id, lang);
        location.href = url;
      }
    } catch {
      cta.removeAttribute('aria-busy');
      cta.textContent = t(lang, esGratis ? 'ruta_error_acceso_gratuito' : 'ruta_error_reserva');
      setTimeout(() => {
        cta.textContent = textoOriginal;
      }, 3000);
    }
  });

  document.getElementById('ruta-volver').textContent = tf(lang, 'ruta_volver', { ciudad: nombreCiudad });
  document.getElementById('ruta-volver').href = `../ciudad/${ciudad.slug}.html`;

  const hermanas = rutasHermanas(ruta.id);
  if (hermanas.length > 0) {
    document.getElementById('rutas-relacionadas').innerHTML = `
      <h2 class="seccion-relacionadas__titulo">${escaparHtml(tf(lang, 'ruta_otras_titulo', { ciudad: nombreCiudad }))}</h2>
      <div class="seccion-relacionadas__lista">
        ${hermanas.map((r) => `<a class="btn btn-fantasma" href="${r.id}.html">${escaparHtml(localizar(r.titulo, lang))}</a>`).join('')}
      </div>`;
  }

  // Cierre de la página: siempre se puede volver a ver todas las ciudades;
  // el enlace a la historia del blog solo aparece si esta ciudad tiene una
  // (hoy las 11 activas la tienen, pero una ciudad nueva podría no tenerla
  // todavía el día que se publique su primera ruta).
  const historia = historiaPorSlug(ciudad.slug);
  document.getElementById('ruta-enlaces-finales').innerHTML = `
    <p><a class="btn btn-fantasma" href="../index.html">${t(lang, 'ruta_todas_ciudades')}</a></p>
    ${historia ? `<p><a class="enlace-editorial" href="../historias/${historia.id}.html">${escaparHtml(tf(lang, 'ruta_leer_historia', { ciudad: nombreCiudad }))}</a></p>` : ''}`;
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}

// js/historia.js
// Ficha de un post individual. Lee `data-historia` del <body>, busca los
// datos en el catálogo y arma el cuerpo del artículo, incluido el enlace
// editorial de cierre (sin botón — ver spec, sección "Diseño visual").
import { ciudadPorSlug, historiaPorSlug, localizar, rutaPorId } from './catalogo.js';
import { aplicarI18n, detectarIdioma, poblarSelectorIdioma, t, urlRecurso } from './i18n.js';

/** Sustituye {ruta1}/{ruta2} en `cierre` por el enlace editorial real a esa ruta. */
export function cierreConEnlaces(historia, lang) {
  let texto = localizar(historia.cierre, lang);
  historia.enlacesRutas.forEach((rutaId, i) => {
    const ruta = rutaPorId(rutaId);
    const enlace = `<a class="enlace-editorial" href="../ruta/${rutaId}.html">${localizar(ruta.titulo, lang)}</a>`;
    texto = texto.replace(`{ruta${i + 1}}`, enlace);
  });
  return texto;
}

function seccionHTML(seccion, lang) {
  return `
    <div class="seccion-relato">
      <p class="seccion-relato__titulo">${localizar(seccion.titulo, lang)}</p>
      <p class="seccion-relato__texto">${localizar(seccion.texto, lang)}</p>
    </div>`;
}

function init() {
  const slug = document.body.dataset.historia;
  const historia = historiaPorSlug(slug);
  const lang = detectarIdioma();
  document.documentElement.lang = lang;

  if (!historia) {
    document.getElementById('historia-contenido').innerHTML = '<p class="contenedor">Historia no encontrada.</p>';
    return;
  }

  aplicarI18n(document, lang);
  poblarSelectorIdioma(lang);

  const ciudad = ciudadPorSlug(historia.ciudadSlug);
  const titulo = localizar(historia.titulo, lang);
  const nombreCiudad = localizar(ciudad.nombre, lang);

  document.title = `${titulo} — Vestigia`;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content', localizar(historia.resumen, lang));

  document.getElementById('migas-ciudad').textContent = nombreCiudad;
  document.getElementById('migas-historia').textContent = titulo;

  document.getElementById('historia-foto').src = urlRecurso(historia.imgHero, '../');
  document.getElementById('historia-foto').alt = titulo;
  document.getElementById('historia-eyebrow').textContent = nombreCiudad;
  document.getElementById('historia-titulo').textContent = titulo;
  document.getElementById('historia-resumen').textContent = localizar(historia.resumen, lang);
  document.getElementById('historia-secciones').innerHTML = historia.secciones.map((s) => seccionHTML(s, lang)).join('');
  document.getElementById('historia-cierre').innerHTML = cierreConEnlaces(historia, lang);
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}

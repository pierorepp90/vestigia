// scripts/sitio-i18n.mjs
//
// Utilidades compartidas por los generadores de páginas: un único sitio
// donde calcular la URL de cualquier página en cualquier idioma, para que el
// cálculo no se desincronice entre scripts.
import { DEFAULT_LANG } from '../js/i18n.js';

// Debe coincidir con SITE_URL/ALLOWED_ORIGIN en worker/wrangler.toml y con
// BASE_URL_SITIO en js/i18n.js — mismo dominio, tres sitios.
export const BASE_URL = 'https://vestigia.fun';

/** Archivo de la página relativo a la raíz de SU idioma (sin prefijo /en/ …). */
export function rutaRelativa(tipo, params = {}) {
  if (tipo === 'index') return 'index.html';
  if (tipo === 'ciudad') return `ciudad/${params.slug}.html`;
  if (tipo === 'ruta') return `ruta/${params.id}.html`;
  if (tipo === 'historia-indice') return 'historias/index.html';
  if (tipo === 'historia') return `historias/${params.id}.html`;
  throw new Error(`Tipo de página desconocido: ${tipo}`);
}

/** Archivo de la página relativo a la raíz del repo, con prefijo de idioma. */
export function archivoPagina(lang, tipo, params = {}) {
  const relativa = rutaRelativa(tipo, params);
  return lang === DEFAULT_LANG ? relativa : `${lang}/${relativa}`;
}

/**
 * URL absoluta (canónica) de una página en un idioma concreto. Español no
 * lleva prefijo. Los índices de carpeta se publican como directorio
 * ("/", "/en/", "/historias/") y no como ".../index.html": es la forma que
 * enlaza la gente y la que muestran los buscadores. GitHub Pages sirve las
 * dos con un 200, así que es la canónica la que decide cuál cuenta.
 */
export function urlPagina(lang, tipo, params = {}) {
  return `${BASE_URL}/${archivoPagina(lang, tipo, params).replace(/(^|\/)index\.html$/, '$1')}`;
}

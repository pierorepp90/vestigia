// scripts/sitio-i18n.mjs
//
// Utilidades compartidas por generar-seo.mjs y generar-i18n.mjs: un único
// sitio donde calcular la URL de cualquier página en cualquier idioma, para
// que el cálculo no se desincronice entre los dos scripts.
import { LANGS, DEFAULT_LANG } from '../js/i18n.js';

// TODO: actualizar junto con SITE_URL/ALLOWED_ORIGIN en worker/wrangler.toml
// cuando haya dominio propio (ver README, "Pendiente, con dueño claro").
export const BASE_URL = 'https://pierorepp90.github.io/vestigia';

export function rutaRelativa(tipo, params = {}) {
  if (tipo === 'index') return 'index.html';
  if (tipo === 'ciudad') return `ciudad/${params.slug}.html`;
  if (tipo === 'ruta') return `ruta/${params.id}.html`;
  throw new Error(`Tipo de página desconocido: ${tipo}`);
}

/** URL absoluta de una página en un idioma concreto. Español no lleva prefijo. */
export function urlPagina(lang, tipo, params = {}) {
  const relativa = rutaRelativa(tipo, params);
  return lang === DEFAULT_LANG ? `${BASE_URL}/${relativa}` : `${BASE_URL}/${lang}/${relativa}`;
}

/** Bloque <link rel="canonical"> + hreflang (4 idiomas + x-default) para una página. */
export function bloqueCanonicalYHreflang(lang, tipo, params = {}) {
  const canonical = `<link rel="canonical" href="${urlPagina(lang, tipo, params)}">`;
  const alternativas = LANGS.map((l) => `<link rel="alternate" hreflang="${l}" href="${urlPagina(l, tipo, params)}">`);
  const xDefault = `<link rel="alternate" hreflang="x-default" href="${urlPagina(DEFAULT_LANG, tipo, params)}">`;
  return [canonical, ...alternativas, xDefault].join('\n');
}

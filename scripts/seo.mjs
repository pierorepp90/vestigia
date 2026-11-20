// scripts/seo.mjs
//
// Todo lo que las páginas estáticas llevan en el <head> para buscadores,
// asistentes de IA y vistas previas al compartir (WhatsApp, Telegram, X…):
// título, descripción, canonical/hreflang, Open Graph y JSON-LD. Lo usa
// scripts/generar-i18n.mjs para los cuatro idiomas, español incluido.
//
// Las fórmulas de título usan el vocabulario que la gente escribe de verdad
// en cada idioma (autocompletado de Google y volúmenes de búsqueda, ver
// docs/crecimiento/plan-trafico-organico.md): en español "escape room al aire
// libre", en inglés "scavenger hunt", en francés "jeu de piste", en italiano
// "caccia al tesoro". Si se cambian, que sea con datos.
import { CIUDADES, RUTAS, localizar, rutasPorCiudad, ciudadPorSlug } from '../js/catalogo.js';
import { LANGS, DEFAULT_LANG } from '../js/i18n.js';
import { BASE_URL, urlPagina } from './sitio-i18n.mjs';

export const MARCA = 'Vestigia';

export function escaparTexto(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
}
export function escaparAtributo(s) {
  return escaparTexto(s).replace(/"/g, '&quot;');
}
export function truncar(texto, maxLen) {
  if (texto.length <= maxLen) return texto;
  const cortado = texto.slice(0, maxLen);
  return `${cortado.slice(0, cortado.lastIndexOf(' '))}…`;
}

/**
 * Sustituye el contenido de la etiqueta con `id`, contando aperturas y
 * cierres de la misma etiqueta para encontrar SU cierre. Una búsqueda
 * perezosa hasta el primer `</div>` rompería en cuanto la zona ya trae
 * contenido anidado, y las páginas en español se rellenan en el sitio: a
 * partir de la segunda pasada, siempre lo traen.
 */
export function reemplazarInterior(html, id, interior) {
  const apertura = new RegExp(`<([a-zA-Z0-9]+)\\b[^>]*\\bid="${id}"[^>]*>`).exec(html);
  if (!apertura) return html;
  const tag = apertura[1].toLowerCase();
  const inicio = apertura.index + apertura[0].length;
  const reTag = new RegExp(`<(/?)${tag}\\b[^>]*>`, 'gi');
  reTag.lastIndex = inicio;
  let profundidad = 1;
  for (let m = reTag.exec(html); m; m = reTag.exec(html)) {
    profundidad += m[1] ? -1 : 1;
    if (profundidad === 0) return html.slice(0, inicio) + interior + html.slice(m.index);
  }
  throw new Error(`Etiqueta sin cerrar: id="${id}"`);
}

const CIUDADES_ACTIVAS = CIUDADES.filter((c) => c.activa);
const N_CIUDADES = CIUDADES_ACTIVAS.length;
const HAY_RUTAS_GRATIS = RUTAS.some((r) => r.precio === 0);

const OG_LOCALE = { es: 'es_ES', en: 'en_GB', fr: 'fr_FR', it: 'it_IT' };

function listaNatural(items, lang) {
  if (items.length <= 1) return items.join('');
  const y = { es: 'y', en: 'and', fr: 'et', it: 'e' }[lang];
  return `${items.slice(0, -1).join(', ')} ${y} ${items[items.length - 1]}`;
}

// ---- Frase de posicionamiento ------------------------------------------
// La MISMA frase en el JSON-LD de la organización, en la descripción de la
// portada y en cualquier perfil externo (directorios, redes): así los
// asistentes de IA consolidan una sola entidad "Vestigia".
export function frasePosicionamiento(lang) {
  return {
    es: `Vestigia son escape rooms urbanos al aire libre: rutas de enigmas por el centro histórico de ${N_CIUDADES} ciudades europeas que se juegan con el móvil, a tu ritmo y sin guía.`,
    en: `Vestigia makes outdoor escape games: self-guided puzzle trails through the historic centres of ${N_CIUDADES} European cities, played on your phone at your own pace.`,
    fr: `Vestigia propose des escape games en plein air : des jeux de piste dans le centre historique de ${N_CIUDADES} villes européennes, à faire sur son téléphone, à son rythme et sans guide.`,
    it: `Vestigia crea escape room all'aperto: cacce al tesoro tra gli enigmi del centro storico di ${N_CIUDADES} città europee, da giocare con il telefono, al proprio ritmo e senza guida.`,
  }[lang];
}

// ---- Títulos y descripciones -------------------------------------------

export function seoPortada(lang) {
  const destacadas = ['barcelona', 'madrid', 'roma', 'paris'].map((s) => localizar(ciudadPorSlug(s).nombre, lang));
  const resto = N_CIUDADES - destacadas.length;
  const ciudades = destacadas.join(', ');
  const titulo = {
    es: `Escape room al aire libre en ${N_CIUDADES} ciudades de Europa`,
    en: `Outdoor escape games and scavenger hunts in ${N_CIUDADES} European cities`,
    fr: `Escape games et jeux de piste dans ${N_CIUDADES} villes d'Europe`,
    it: `Cacce al tesoro ed escape room all'aperto in ${N_CIUDADES} città europee`,
  }[lang];
  const gratis = HAY_RUTAS_GRATIS ? { es: ' Hay rutas gratis.', en: ' Some are free.', fr: ' Certains sont gratuits.', it: ' Alcuni sono gratis.' }[lang] : '';
  const descripcion = {
    es: `Rutas de enigmas por el centro histórico de ${ciudades} y ${resto} ciudades más. Con el móvil, a tu ritmo y sin guía.${gratis}`,
    en: `Puzzle trails through the old towns of ${ciudades} and ${resto} more cities. On your phone, at your own pace, no guide.${gratis}`,
    fr: `Des énigmes dans le centre historique de ${ciudades} et ${resto} autres villes. Sur téléphone, à votre rythme, sans guide.${gratis}`,
    it: `Enigmi nel centro storico di ${ciudades} e altre ${resto} città. Con il telefono, al proprio ritmo e senza guida.${gratis}`,
  }[lang];
  return { titulo, descripcion };
}

export function seoCiudad(ciudad, lang) {
  const nombre = localizar(ciudad.nombre, lang);
  const rutas = rutasPorCiudad(ciudad.slug);
  const n = rutas.length;
  const zonas = listaNatural(rutas.map((r) => r.zona.split(' · ')[0]), lang);
  const jugMin = Math.min(...rutas.map((r) => r.jugadoresMin));
  const jugMax = Math.max(...rutas.map((r) => r.jugadoresMax));
  const gratis = rutas.filter((r) => r.precio === 0).length;

  const titulo = {
    es: `Escape room al aire libre en ${nombre}`,
    en: `${nombre} scavenger hunt and outdoor escape game`,
    fr: `Jeu de piste et escape game en plein air à ${nombre}`,
    it: `Caccia al tesoro ed escape room all'aperto a ${nombre}`,
  }[lang];

  const cuantas = {
    es: n === 1 ? 'Una ruta de enigmas' : `${n} rutas de enigmas`,
    en: n === 1 ? 'A puzzle trail' : `${n} puzzle trails`,
    fr: n === 1 ? "Un parcours d'énigmes" : `${n} parcours d'énigmes`,
    it: n === 1 ? 'Un percorso di enigmi' : `${n} percorsi di enigmi`,
  }[lang];
  const notaGratis = gratis === 0 ? '' : {
    es: gratis === n ? ' Gratis.' : ' Una es gratis.',
    en: gratis === n ? ' Free to play.' : ' One is free.',
    fr: gratis === n ? ' Gratuit.' : ' Un parcours est gratuit.',
    it: gratis === n ? ' Gratis.' : ' Uno è gratis.',
  }[lang];
  const descripcion = {
    es: `${cuantas} al aire libre por ${zonas}. Se juega con el móvil y sin guía: unas 2 h, de ${jugMin} a ${jugMax} jugadores.${notaGratis}`,
    en: `${cuantas} through ${zonas}. Self-guided on your phone: about 2 hours, ${jugMin}–${jugMax} players.${notaGratis}`,
    fr: `${cuantas} en plein air : ${zonas}. Sur téléphone et sans guide, environ 2 h, de ${jugMin} à ${jugMax} joueurs.${notaGratis}`,
    it: `${cuantas} all'aperto tra ${zonas}. Con il telefono e senza guida: circa 2 ore, da ${jugMin} a ${jugMax} giocatori.${notaGratis}`,
  }[lang];
  return { titulo, descripcion };
}

export function seoRuta(ruta, lang) {
  const nombreCiudad = localizar(ciudadPorSlug(ruta.ciudadSlug).nombre, lang);
  const sufijo = {
    es: `Escape room en ${nombreCiudad}`,
    en: `${nombreCiudad} scavenger hunt`,
    fr: `Jeu de piste à ${nombreCiudad}`,
    it: `Caccia al tesoro a ${nombreCiudad}`,
  }[lang];
  return {
    titulo: `${localizar(ruta.titulo, lang)} · ${sufijo}`,
    descripcion: truncar(localizar(ruta.resumen, lang), 155),
  };
}

// <title> de cada historia con el lugar delante. El <h1> visible sigue siendo
// el título editorial del catálogo; aquí solo cambia lo que sale en Google.
// El nombre del sitio es lo que la gente busca y la dificultad es casi nula
// (España, nov. 2026): "pont del bisbe" 40.500/mes, "trastevere" 18.100,
// "sacre coeur" 5.400, "spaccanapoli" 5.400, "escudo de madrid" 1.900,
// "stolpersteine" 1.900, "cupula de brunelleschi" 1.600, "santo grial
// valencia" 1.300. Una historia sin entrada aquí usa su título del catálogo.
const TITULOS_HISTORIA = {
  barcelona: {
    es: 'Pont del Bisbe: por qué el Barrio Gótico no es tan gótico como parece',
    en: "Pont del Bisbe: why the Gothic Quarter isn't as Gothic as it looks",
    fr: "Pont del Bisbe : pourquoi le Barri Gòtic n'est pas si gothique",
    it: 'Pont del Bisbe: perché il Quartiere Gotico non è così gotico',
  },
  paris: {
    es: 'Sacré-Cœur: un monumento a una derrota, no a una victoria',
    en: 'Sacré-Cœur: a monument to a defeat, not a victory',
    fr: 'Sacré-Cœur : un monument à une défaite, pas à une victoire',
    it: 'Sacré-Cœur: un monumento a una sconfitta, non a una vittoria',
  },
  florencia: {
    es: 'La cúpula de Brunelleschi y la rivalidad que Florencia construyó en piedra',
    en: "Brunelleschi's dome and the rivalry Florence built in stone",
    fr: 'La coupole de Brunelleschi et la rivalité que Florence a bâtie en pierre',
    it: 'La cupola del Brunelleschi e la rivalità che Firenze costruì in pietra',
  },
  madrid: {
    es: 'Escudo de Madrid: el animal mitológico que ya no está',
    en: "Madrid's coat of arms: the mythical beast that disappeared",
    fr: "Les armoiries de Madrid : l'animal mythologique disparu",
    it: "Lo stemma di Madrid: l'animale mitologico scomparso",
  },
  valencia: {
    es: 'El Santo Cáliz de Valencia: la copa de la Última Cena (o eso dicen)',
    en: 'The Holy Chalice of Valencia: the Last Supper cup (or so they say)',
    fr: 'Le Saint Calice de Valence : la coupe de la Cène (du moins, on le dit)',
    it: "Il Santo Calice di Valencia: la coppa dell'Ultima Cena (o così si dice)",
  },
  napoles: {
    es: 'Spaccanapoli: la calle griega de 2.500 años que parte Nápoles en dos',
    en: 'Spaccanapoli: the 2,500-year-old Greek street that splits Naples in two',
    fr: 'Spaccanapoli : la rue grecque de 2 500 ans qui coupe Naples en deux',
    it: 'Spaccanapoli: la strada greca di 2.500 anni che divide Napoli in due',
  },
  berlin: {
    es: 'Stolpersteine: Berlín deja su historia del siglo XX tallada en la calle',
    en: 'Stolpersteine: how Berlin carves its 20th-century history into the street',
    fr: "Stolpersteine : Berlin grave l'histoire du XXe siècle dans la rue",
    it: 'Stolpersteine: Berlino incide la storia del Novecento nella strada',
  },
  istanbul: {
    es: 'Bizancio, Constantinopla, Estambul: la ciudad capital de dos imperios',
    en: 'Byzantium, Constantinople, Istanbul: one city, capital of two empires',
    fr: 'Byzance, Constantinople, Istanbul : une ville, capitale de deux empires',
    it: 'Bisanzio, Costantinopoli, Istanbul: una città, capitale di due imperi',
  },
};

export function seoHistoria(historia, lang) {
  return {
    titulo: TITULOS_HISTORIA[historia.id]?.[lang] ?? localizar(historia.titulo, lang),
    descripcion: truncar(localizar(historia.resumen, lang), 155),
  };
}

export function seoHistoriasIndice(lang) {
  return {
    titulo: {
      es: `Historias y curiosidades de ${N_CIUDADES} ciudades europeas`,
      en: `Hidden stories and curiosities from ${N_CIUDADES} European cities`,
      fr: `Histoires et curiosités de ${N_CIUDADES} villes européennes`,
      it: `Storie e curiosità di ${N_CIUDADES} città europee`,
    }[lang],
    descripcion: {
      es: 'Lo que casi nadie cuenta de los barrios históricos de Europa: por qué el Gótico de Barcelona es de 1928 y otras curiosidades reales, ciudad por ciudad.',
      en: "What almost nobody tells you about Europe's old quarters: why Barcelona's Gothic Quarter dates from 1928, and other true stories, city by city.",
      fr: "Ce que presque personne ne raconte sur les vieux quartiers d'Europe : pourquoi le Gothique de Barcelone date de 1928, et d'autres histoires vraies.",
      it: "Quello che quasi nessuno racconta dei quartieri storici d'Europa: perché il Gotico di Barcellona è del 1928 e altre storie vere, città per città.",
    }[lang],
  };
}

// ---- Fechas visibles ----------------------------------------------------

export function fechaLegible(isoFecha, lang) {
  const fecha = new Date(`${isoFecha}T12:00:00Z`);
  return new Intl.DateTimeFormat(lang, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(fecha);
}

export function textoFecha(publicada, actualizada, lang) {
  if (actualizada && actualizada !== publicada) {
    return { es: 'Actualizado el', en: 'Updated', fr: 'Mis à jour le', it: 'Aggiornato il' }[lang] + ` ${fechaLegible(actualizada, lang)}`;
  }
  return { es: 'Publicado el', en: 'Published', fr: 'Publié le', it: 'Pubblicato il' }[lang] + ` ${fechaLegible(publicada, lang)}`;
}

// ---- JSON-LD ------------------------------------------------------------

const ID_ORGANIZACION = `${BASE_URL}/#organizacion`;
const ID_WEB = `${BASE_URL}/#web`;
const LOGO = `${BASE_URL}/assets/img/marca/logo-512.png`;

export function ldOrganizacion(lang) {
  return {
    '@type': 'Organization',
    '@id': ID_ORGANIZACION,
    name: MARCA,
    url: `${BASE_URL}/`,
    logo: { '@type': 'ImageObject', url: LOGO, width: 512, height: 512 },
    description: frasePosicionamiento(lang),
    slogan: { es: 'Una manera divertida de conocer la ciudad', en: 'A fun way to get to know the city', fr: 'Une façon ludique de découvrir la ville', it: 'Un modo divertente di scoprire la città' }[lang],
    areaServed: CIUDADES_ACTIVAS.map((c) => ({ '@type': 'City', name: localizar(c.nombre, lang) })),
  };
}

export function ldWeb(lang) {
  return {
    '@type': 'WebSite',
    '@id': ID_WEB,
    name: MARCA,
    url: `${BASE_URL}/`,
    inLanguage: LANGS,
    publisher: { '@id': ID_ORGANIZACION },
  };
}

export function ldMigas(lang, pasos) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: pasos.map((p, i) => ({ '@type': 'ListItem', position: i + 1, name: p.nombre, item: p.url })),
  };
}

export function ldListaRutas(ciudad, lang) {
  return {
    '@type': 'ItemList',
    name: seoCiudad(ciudad, lang).titulo,
    itemListElement: rutasPorCiudad(ciudad.slug).map((r, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: urlPagina(lang, 'ruta', { id: r.id }),
      name: localizar(r.titulo, lang),
    })),
  };
}

export function ldProductoRuta(ruta, lang) {
  return {
    '@type': 'Product',
    '@id': `${urlPagina(lang, 'ruta', { id: ruta.id })}#ruta`,
    name: localizar(ruta.titulo, lang),
    description: localizar(ruta.resumen, lang),
    image: `${BASE_URL}/${ruta.imgHero}`,
    category: { es: 'Escape room al aire libre', en: 'Outdoor escape game', fr: 'Escape game en plein air', it: "Escape room all'aperto" }[lang],
    brand: { '@type': 'Brand', name: MARCA },
    offers: {
      '@type': 'Offer',
      url: urlPagina(lang, 'ruta', { id: ruta.id }),
      priceCurrency: ruta.moneda,
      price: ruta.precio.toFixed(2),
      availability: 'https://schema.org/InStock',
      seller: { '@id': ID_ORGANIZACION },
    },
  };
}

export function ldArticulo(historia, lang, { publicada, actualizada }) {
  const url = urlPagina(lang, 'historia', { id: historia.id });
  return {
    '@type': 'Article',
    '@id': `${url}#articulo`,
    headline: localizar(historia.titulo, lang),
    description: localizar(historia.resumen, lang),
    image: `${BASE_URL}/${historia.imgHero}`,
    inLanguage: lang,
    datePublished: publicada,
    dateModified: actualizada || publicada,
    mainEntityOfPage: url,
    about: { '@type': 'City', name: localizar(ciudadPorSlug(historia.ciudadSlug).nombre, lang) },
    author: { '@id': ID_ORGANIZACION, '@type': 'Organization', name: MARCA, url: `${BASE_URL}/` },
    publisher: { '@id': ID_ORGANIZACION },
  };
}

/** Un único <script type="application/ld+json"> con un @graph. */
export function scriptLd(nodos) {
  const datos = { '@context': 'https://schema.org', '@graph': nodos };
  // JSON.stringify no escapa "<": un texto que contuviera "</script>"
  // cerraría la etiqueta antes de tiempo (ver commit aa37e36).
  const json = JSON.stringify(datos, null, 2).replace(/</g, '\\u003c');
  return `<script type="application/ld+json">\n${json}\n</script>`;
}

// ---- Bloque <head> completo ----------------------------------------------

export const MARCADOR_SEO = 'seo';
const reMarcador = new RegExp(`[ \\t]*<!-- ${MARCADOR_SEO} -->[\\s\\S]*?<!-- /${MARCADOR_SEO} -->\\n?`);

/** Bloque idempotente: canonical + hreflang + Open Graph + Twitter + JSON-LD. */
export function bloqueSeo(lang, tipo, params, { titulo, descripcion, imagenOg, tipoOg = 'website', ld }) {
  const url = urlPagina(lang, tipo, params);
  const lineas = [
    `<link rel="canonical" href="${url}">`,
    ...LANGS.map((l) => `<link rel="alternate" hreflang="${l}" href="${urlPagina(l, tipo, params)}">`),
    `<link rel="alternate" hreflang="x-default" href="${urlPagina(DEFAULT_LANG, tipo, params)}">`,
    `<meta property="og:site_name" content="${MARCA}">`,
    `<meta property="og:type" content="${tipoOg}">`,
    `<meta property="og:title" content="${escaparAtributo(titulo)}">`,
    `<meta property="og:description" content="${escaparAtributo(descripcion)}">`,
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:locale" content="${OG_LOCALE[lang]}">`,
    ...LANGS.filter((l) => l !== lang).map((l) => `<meta property="og:locale:alternate" content="${OG_LOCALE[l]}">`),
    `<meta property="og:image" content="${BASE_URL}/${imagenOg}">`,
    '<meta property="og:image:width" content="1200">',
    '<meta property="og:image:height" content="630">',
    `<meta property="og:image:alt" content="${escaparAtributo(titulo)}">`,
    '<meta name="twitter:card" content="summary_large_image">',
    scriptLd(ld),
  ];
  return `<!-- ${MARCADOR_SEO} -->\n${lineas.join('\n')}\n<!-- /${MARCADOR_SEO} -->\n`;
}

/**
 * Deja el <head> con un título, una descripción y un único bloque SEO.
 * Retira además los restos de versiones anteriores del generador (bloque
 * canonical-hreflang, JSON-LD sueltos, og:* sueltos de la portada) para que
 * nunca convivan dos canonical en la misma página.
 */
export function aplicarCabecera(html, lang, tipo, params, datos) {
  html = html.replace(/<html[^>]*>/, `<html lang="${lang}" data-idioma-pagina="${lang}">`);
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${escaparTexto(datos.titulo)} — ${MARCA}</title>`);
  html = html.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${escaparAtributo(truncar(datos.descripcion, 160))}">`);
  html = html
    .replace(/\s*<!-- canonical-hreflang -->[\s\S]*?<!-- \/canonical-hreflang -->/, '')
    .replace(/\s*<script type="application\/ld\+json" id="ld-[a-z]+">[\s\S]*?<\/script>/g, '')
    .replace(/\s*<meta property="og:(title|description|type)" content="[^"]*">/g, '')
    .replace(reMarcador, '');
  return html.replace('</head>', `${bloqueSeo(lang, tipo, params, datos)}</head>`);
}

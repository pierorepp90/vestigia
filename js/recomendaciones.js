// js/recomendaciones.js
//
// Recomendaciones gratuitas de cada zona/ciudad — mirador, comida típica,
// pases de entradas oficiales y movilidad — que se añaden al email de
// confirmación (worker/src/resend.js). Es contenido PÚBLICO como catalogo.js
// (nada de spoilers de enigmas), así que vive aquí y no en
// worker/src/contenido/.
//
// Cada dato lleva su fuente en un comentario junto al campo: esto sale en un
// email real a gente que ha pagado, así que nada aquí debería ser un dato
// inventado ni una URL adivinada. Antes de añadir o cambiar una entrada,
// verificar la fuente — no basta con que "suene bien".
//
// TODO: solo está en español por ahora (prototipo para revisar el contenido
// antes de traducir). Cuando se apruebe, traducir cada campo a en/fr/it
// siguiendo el mismo patrón { es, en, fr, it } que catalogo.js.

/**
 * Recomendaciones por ruta (zona). Claves = `id` de js/catalogo.js.
 * Cada categoría es opcional: si una zona no tiene mirador razonable, se
 * omite el campo en vez de forzar una recomendación floja.
 */
export const RECOMENDACIONES_POR_RUTA = {
  'barcelona-gotic': {
    mirador: {
      nombre: 'Terraza de El Corte Inglés (Plaça Catalunya)',
      texto: 'Novena planta, a 5 min de la Catedral. Se sube gratis (es un centro comercial, no hace falta entrada) y desde la terraza de La Rotonda hay vistas directas sobre toda la Plaça Catalunya — solo se espera que os toméis algo, un café basta. Abierto de lunes a sábado, cerrado domingos. Si preferís una vista 360° de toda la ciudad en vez de la plaza, los Bunkers del Carmel son la mejor gratis de Barcelona, pero quedan unos 25-30 min de aquí.',
      // Fuente: confirmado por el usuario (conoce el sitio) + verificado con
      // búsquedas: terraza "La Rotonda" / Plaça Gastro Mercat, 9ª planta,
      // acceso libre al centro comercial, consumición esperada en la terraza
      // (no es una entrada de pago tipo La Pedrera). Horario habitual L-S
      // 9:30-22:00, cerrado domingos — comprobar antes de enviar si cambia.
    },
    comida: {
      nombre: 'Can Culleretes',
      texto: 'Carrer d\'en Quintana, 5. El restaurante más antiguo de Catalunya (desde 1786, récord Guinness), cocina catalana tradicional a pocos pasos de la ruta.',
      url: 'https://culleretes.com/',
    },
    movilidad: {
      texto: 'Metro Jaume I (L4, amarilla), a un par de minutos de la Catedral.',
    },
  },

  'barcelona-born': {
    mirador: {
      nombre: 'Moll de la Fusta / Port Vell',
      texto: 'Paseo junto al puerto con vistas al mar, gratis, unos 10-12 min a pie desde el Born. Si os sobra tiempo, los Bunkers del Carmel (ver ruta del Gòtic) tienen la mejor vista de la ciudad, pero está más lejos.',
    },
    comida: {
      nombre: 'El Xampanyet',
      texto: 'Carrer de Montcada, 22, junto al Museu Picasso. Bar de tapas y cava desde 1929, icónico del Born — anchoas, tortilla y cava por copas. No reservan mesa, así que armaos de paciencia si hay cola.',
    },
    movilidad: {
      texto: 'Metro Arc de Triomf (L1, roja), junto al punto de partida de la ruta. También conecta con Rodalies R1/R3/R4.',
    },
  },

  'barcelona-raval': {
    mirador: {
      nombre: 'Las Arenas (antigua plaza de toros)',
      texto: 'Subiendo por dentro del centro comercial en Plaça Espanya se llega gratis a una pasarela circular con vistas 360°: Montjuïc, la Font Màgica, Sagrada Família al fondo. Solo cobran 1€ si usáis el ascensor directo en vez de las escaleras mecánicas. Unos 10-15 min desde el Raval (metro L1/L3 hasta Espanya).',
    },
    comida: {
      nombre: 'Granja M. Viader',
      texto: 'Carrer d\'en Xuclà, 4-6. Granja centenaria (desde 1870), cuna del Cacaolat — perfecta para probar un "suís" (chocolate caliente con nata) como merienda a media ruta.',
    },
    movilidad: {
      texto: 'Metro Liceu (L3, verde), sale justo al lado del Mercat de la Boqueria.',
    },
  },
};

/**
 * Pases oficiales por ciudad (`ciudadSlug` de js/catalogo.js). Solo pases
 * verificados en la web oficial del operador — nunca revendedores.
 */
export const PASES_POR_CIUDAD = {
  barcelona: [
    {
      nombre: 'Hola Barcelona Travel Card',
      texto: 'Transporte público ilimitado (metro, bus, FGC, Rodalies zona 1) durante 24 a 120 horas. El pase turístico oficial de TMB.',
      url: 'https://www.tmb.cat/en/barcelona-fares-metro-bus/tickets-visit-barcelona/barcelona-travel-card-hola-bcn',
    },
    {
      nombre: 'Articket BCN',
      texto: 'Una entrada para 6 museos (Picasso, MNAC, MACBA, CCCB, Fundació Miró, Fundació Tàpies) sin colas, con ahorro sobre el precio suelto.',
      url: 'https://articketbcn.org',
    },
    {
      nombre: 'Barcelona Card',
      texto: 'Transporte ilimitado + entrada a más de 25 museos y monumentos + descuentos, emitida por Turisme de Barcelona (el consorcio oficial del ayuntamiento).',
      url: 'https://thisisbarcelona.com/tickets/barcelona-card',
    },
  ],
};

/**
 * Recomendaciones completas para una ruta: la zona (si existe) más los pases
 * de la ciudad a la que pertenece. Devuelve `null` si no hay nada que
 * mostrar, para que el email pueda omitir la sección entera sin comprobar
 * cada campo por separado.
 */
export function recomendacionesDeRuta(rutaId, ciudadSlug) {
  const zona = RECOMENDACIONES_POR_RUTA[rutaId] || null;
  const pases = (ciudadSlug && PASES_POR_CIUDAD[ciudadSlug]) || [];
  if (!zona && pases.length === 0) return null;
  return { zona, pases };
}

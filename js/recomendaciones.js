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
 * Enlace de Google Maps para un lugar, usando el esquema de URL público y
 * documentado de Google (Maps URLs — Search Action):
 * https://developers.google.com/maps/documentation/urls/get-started#search-action
 * No hace falta API key ni coordenadas: Maps resuelve la búsqueda igual que
 * si el usuario la escribiera a mano, y en móvil abre la app nativa.
 */
function mapsUrl(query) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

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
      mapsUrl: mapsUrl('El Corte Inglés, Plaça Catalunya, Barcelona'),
    },
    comida: {
      nombre: 'Can Culleretes',
      texto: 'Carrer d\'en Quintana, 5. El restaurante más antiguo de Catalunya (desde 1786, récord Guinness), cocina catalana tradicional a pocos pasos de la ruta.',
      url: 'https://culleretes.com/',
      mapsUrl: mapsUrl("Can Culleretes, Carrer d'en Quintana 5, Barcelona"),
    },
    movilidad: {
      // Mismo lugar que `puntoPartida` de esta ruta en js/catalogo.js.
      nombre: 'Plaça Nova (Catedral de Barcelona)',
      texto: 'Metro Jaume I (L4, amarilla), a un par de minutos de la Catedral.',
      mapsUrl: mapsUrl('Plaça Nova, Barcelona'),
    },
  },

  'barcelona-born': {
    mirador: {
      nombre: 'Moll de la Fusta / Port Vell',
      texto: 'Paseo junto al puerto con vistas al mar, gratis, unos 10-12 min a pie desde el Born. Si os sobra tiempo, los Bunkers del Carmel (ver ruta del Gòtic) tienen la mejor vista de la ciudad, pero está más lejos.',
      mapsUrl: mapsUrl('Moll de la Fusta, Barcelona'),
    },
    comida: {
      nombre: 'El Xampanyet',
      texto: 'Carrer de Montcada, 22, junto al Museu Picasso. Bar de tapas y cava desde 1929, icónico del Born — anchoas, tortilla y cava por copas. No reservan mesa, así que armaos de paciencia si hay cola.',
      mapsUrl: mapsUrl('El Xampanyet, Carrer de Montcada 22, Barcelona'),
    },
    movilidad: {
      // Mismo lugar que `puntoPartida` de esta ruta en js/catalogo.js.
      nombre: 'Arc de Triomf',
      texto: 'Metro Arc de Triomf (L1, roja), junto al punto de partida de la ruta. También conecta con Rodalies R1/R3/R4.',
      mapsUrl: mapsUrl('Arc de Triomf, Barcelona'),
    },
  },

  'barcelona-raval': {
    mirador: {
      nombre: 'Las Arenas (antigua plaza de toros)',
      texto: 'Subiendo por dentro del centro comercial en Plaça Espanya se llega gratis a una pasarela circular con vistas 360°: Montjuïc, la Font Màgica, Sagrada Família al fondo. Solo cobran 1€ si usáis el ascensor directo en vez de las escaleras mecánicas. Unos 10-15 min desde el Raval (metro L1/L3 hasta Espanya).',
      mapsUrl: mapsUrl("Las Arenas de Barcelona, Plaça d'Espanya"),
    },
    comida: {
      nombre: 'Granja M. Viader',
      texto: 'Carrer d\'en Xuclà, 4-6. Granja centenaria (desde 1870), cuna del Cacaolat — perfecta para probar un "suís" (chocolate caliente con nata) como merienda a media ruta.',
      mapsUrl: mapsUrl("Granja M. Viader, Carrer d'en Xuclà 4, Barcelona"),
    },
    movilidad: {
      // Mismo lugar que `puntoPartida` de esta ruta en js/catalogo.js.
      nombre: 'Mercat de la Boqueria',
      texto: 'Metro Liceu (L3, verde), sale justo al lado del Mercat de la Boqueria.',
      mapsUrl: mapsUrl('Mercat de la Boqueria, Barcelona'),
    },
  },

  'toulouse-capitole': {
    mirador: {
      nombre: 'Quai Lucien Lombard (orilla del Garona)',
      texto: 'Paseo gratuito junto al río, en el tramo entre el Pont Neuf y el Pont Saint-Pierre — el más bonito de la ciudad. Al otro lado del agua se ve la silueta del Hôtel-Dieu Saint-Jacques y su cúpula ("dôme de la Grave"), sobre todo espectacular a la puesta de sol. Unos 10 min a pie desde el Capitole.',
      // Fuente: Toulouse Tourisme (toulouse-tourisme.com/nos-incontournables/
      // les-bords-de-garonne) sobre la vista del Hôtel-Dieu Saint-Jacques y
      // el dôme de la Grave desde el Garona, y krisporelmundo.com sobre el
      // Quai Lucien Lombard como mejor tramo (entre Pont Neuf y Pont
      // Saint-Pierre) y punto popular al atardecer.
      mapsUrl: mapsUrl('Quai Lucien Lombard, Toulouse'),
    },
    comida: {
      nombre: 'Restaurant Emile',
      texto: '13 Place Saint-Georges, a un par de minutos del Capitole. Institución tolosana desde los años 40, célebre por su cassoulet.',
      url: 'https://www.restaurant-emile.com/',
      // Fuente: web oficial del restaurante (restaurant-emile.com) — abierto
      // en los años 40, especialidad cassoulet, dirección confirmada en
      // Place Saint-Georges (junto al Capitole).
      mapsUrl: mapsUrl('Restaurant Emile, 13 Place Saint-Georges, Toulouse'),
    },
    movilidad: {
      // Mismo lugar que `puntoPartida` de esta ruta en js/catalogo.js.
      nombre: 'Place du Capitole',
      texto: 'Metro Capitole (Línea A), sale directamente a la plaza.',
      mapsUrl: mapsUrl('Place du Capitole, Toulouse'),
    },
  },

  'madrid-austrias': {
    mirador: {
      nombre: 'Terraza de El Corte Inglés (Plaza de Callao)',
      texto: 'Novena planta, unos 5-7 min a pie desde Sol por la calle Preciados. Acceso libre en ascensor hasta el espacio Gourmet Experience, sin consumición mínima, con vistas a la Gran Vía, las torres de Plaza de España, la cúpula del Teatro Real, el Palacio Real y la Catedral de la Almudena.',
      // Fuente: verificado con búsquedas (miradormadrid.com, tranbel.com):
      // terraza gratuita en la 9ª planta de El Corte Inglés de Callao (Plaza
      // de Callao, 2), acceso directo por ascensor, sin consumición
      // obligatoria — mismo modelo que la terraza de Plaça Catalunya en
      // Barcelona. Comprobar horario antes de enviar si cambia.
      mapsUrl: mapsUrl('El Corte Inglés, Plaza de Callao 2, Madrid'),
    },
    comida: {
      nombre: 'Chocolatería San Ginés',
      texto: 'Pasadizo de San Ginés, 5, a unos 5 min de Sol. Churrería desde 1894, abierta 24 horas, la más famosa de Madrid — chocolate con churros junto a la iglesia de San Ginés.',
      url: 'https://chocolateriasangines.com/',
      // Fuente: web oficial (chocolateriasangines.com/historia) — abierta en
      // 1894, ubicación en el Pasadizo de San Ginés junto a la iglesia del
      // mismo nombre, muy cerca de Puerta del Sol.
      mapsUrl: mapsUrl('Chocolatería San Ginés, Pasadizo de San Ginés 5, Madrid'),
    },
    movilidad: {
      // Mismo lugar que `puntoPartida` de esta ruta en js/catalogo.js.
      nombre: 'Puerta del Sol',
      texto: 'Estación de Sol (Metro líneas 1, 2 y 3, y Cercanías C-3/C-4), justo debajo de la plaza.',
      mapsUrl: mapsUrl('Puerta del Sol, Madrid'),
    },
  },

  'valencia-carmen': {
    mirador: {
      nombre: 'Torres de Serranos',
      texto: 'En el borde del Carmen, junto al antiguo cauce del Turia, unos 15 min a pie desde la Lonja. Subir a las almenas cuesta 2€ entre semana y sábados, pero la entrada es gratis los domingos y festivos (10:00-14:00) — vistas 360° sobre el Carmen y la ciudad.',
      // Fuente: verificado con búsquedas — entrada general 2€/reducida 1€,
      // gratis domingos y festivos de 10:00 a 14:00 (horario habitual L-S
      // 10:00-19:00). Comprobar horario antes de enviar si cambia.
      mapsUrl: mapsUrl('Torres de Serranos, Valencia'),
    },
    comida: {
      nombre: 'Horchatería Santa Catalina',
      texto: 'Plaza de Santa Catalina, 6, junto a la Plaza Redonda y la Catedral. Horchatería centenaria (desde principios del s. XX, cuarta generación de la familia Gargallo) — horchata y fartons, o chocolate con churros, en un local de azulejo valenciano clásico.',
      // Fuente: verificado con búsquedas (valenciasecreta.com) — fundada por
      // Vicente Gargallo, edificio de 1890, hoy regentada por la cuarta
      // generación de la familia; dirección Plaza Santa Catalina 6.
      mapsUrl: mapsUrl('Horchatería Santa Catalina, Plaza Santa Catalina 6, Valencia'),
    },
    movilidad: {
      // Mismo lugar que `puntoPartida` de esta ruta en js/catalogo.js.
      nombre: 'La Lonja de la Seda',
      texto: 'Metro Xàtiva (líneas 3, 5 y 9), frente a la Estación del Norte, unos 10 min a pie.',
      mapsUrl: mapsUrl('La Lonja de la Seda, Valencia'),
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

  toulouse: [
    {
      nombre: 'Pass Tourisme',
      texto: 'Entrada a 13 museos y monumentos (Museo de Historia Natural, Museo de Bellas Artes, Convento de los Jacobinos...), una visita guiada gratis a elegir y un billete de 10 viajes con tarifa reducida en metro, tranvía y bus. Válido 24h, 48h o 72h, emitido por la Oficina de Turismo de Toulouse.',
      url: 'https://www.toulouse-tourisme.com/en/what-to-see-and-do/pass-tourisme/',
      // Fuente: web oficial de Toulouse Tourisme (toulouse-tourisme.com),
      // el organismo oficial de turismo de la ciudad — mismo criterio que
      // Barcelona Card (consorcio oficial, no revendedor).
    },
  ],

  madrid: [
    {
      nombre: 'Madrid City Card',
      texto: 'Transporte ilimitado (bus EMT y metro zona A) + entrada gratis o con descuento a museos como el Prado, el Reina Sofía o el Thyssen, además de acceso sin colas a varias atracciones. Emitida por el Ayuntamiento de Madrid, válida de 1 a 5 días.',
      url: 'https://citycard.esmadrid.com/',
      // Fuente: web oficial (citycard.esmadrid.com), la tarjeta turística
      // del Ayuntamiento de Madrid a través de Madrid Destino — mismo
      // criterio que Barcelona Card (consorcio oficial, no revendedor).
    },
  ],

  valencia: [
    {
      nombre: 'Valencia Tourist Card',
      texto: 'Transporte ilimitado (EMT, metro, tranvía, Metrobus y Cercanías, incluido el trayecto al aeropuerto) + entrada gratis a museos y monumentos municipales — entre ellos la propia Lonja de la Seda y las Torres de Serranos — más descuentos en atracciones como la Ciudad de las Artes y las Ciencias. Válida 24h, 48h o 72h.',
      url: 'https://www.visitvalencia.com/valencia-tourist-card/valencia-tourist-card',
      // Fuente: web oficial de Visit València (visitvalencia.com), la
      // agencia de turismo del Ayuntamiento de Valencia — mismo criterio
      // que Barcelona Card (consorcio oficial, no revendedor).
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

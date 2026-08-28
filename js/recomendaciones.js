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
// Los campos `nombre` y `texto` están traducidos a los 4 idiomas del
// catálogo: { es, en, fr, it }, mismo patrón que js/catalogo.js. `mapsUrl` y
// `url` no se traducen (son enlaces). worker/src/resend.js elige el idioma
// correcto según el `idioma` del pedido, con fallback a español.

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
      nombre: {
        es: 'Terraza de El Corte Inglés (Plaça Catalunya)',
        en: 'El Corte Inglés Terrace (Plaça Catalunya)',
        fr: "Terrasse d'El Corte Inglés (Plaça Catalunya)",
        it: 'Terrazza di El Corte Inglés (Plaça Catalunya)',
      },
      texto: {
        es: 'Novena planta, a 5 min de la Catedral. Se sube gratis (es un centro comercial, no hace falta entrada) y desde la terraza de La Rotonda hay vistas directas sobre toda la Plaça Catalunya — solo se espera que os toméis algo, un café basta. Abierto de lunes a sábado, cerrado domingos. Si preferís una vista 360° de toda la ciudad en vez de la plaza, los Bunkers del Carmel son la mejor gratis de Barcelona, pero quedan unos 25-30 min de aquí.',
        en: "Ninth floor, 5 min from the Cathedral. Free to go up (it's a department store, no ticket needed) and from La Rotonda terrace you get direct views over the whole Plaça Catalunya — you're just expected to buy something, a coffee is enough. Open Monday to Saturday, closed Sundays. If you'd rather have a 360° view of the whole city instead of the square, the Bunkers del Carmel are the best free viewpoint in Barcelona, but they're about 25-30 min from here.",
        fr: "Neuvième étage, à 5 min de la cathédrale. On y monte gratuitement (c'est un grand magasin, pas besoin de billet) et depuis la terrasse de La Rotonda, la vue donne directement sur toute la Plaça Catalunya — on s'attend juste à ce que vous preniez quelque chose, un café suffit. Ouvert du lundi au samedi, fermé le dimanche. Si vous préférez une vue à 360° sur toute la ville plutôt que sur la place, les Bunkers del Carmel offrent la meilleure vue gratuite de Barcelone, mais ils sont à 25-30 min d'ici.",
        it: "Nono piano, a 5 min dalla Cattedrale. Si sale gratis (è un grande magazzino, non serve biglietto) e dalla terrazza de La Rotonda si vede direttamente tutta la Plaça Catalunya — ci si aspetta solo che prendiate qualcosa, basta un caffè. Aperto dal lunedì al sabato, chiuso la domenica. Se preferite una vista a 360° su tutta la città invece che sulla piazza, i Bunkers del Carmel sono il miglior punto panoramico gratuito di Barcellona, ma sono a 25-30 min da qui.",
      },
      // Fuente: confirmado por el usuario (conoce el sitio) + verificado con
      // búsquedas: terraza "La Rotonda" / Plaça Gastro Mercat, 9ª planta,
      // acceso libre al centro comercial, consumición esperada en la terraza
      // (no es una entrada de pago tipo La Pedrera). Horario habitual L-S
      // 9:30-22:00, cerrado domingos — comprobar antes de enviar si cambia.
      mapsUrl: mapsUrl('El Corte Inglés, Plaça Catalunya, Barcelona'),
    },
    comida: {
      nombre: { es: 'Can Culleretes', en: 'Can Culleretes', fr: 'Can Culleretes', it: 'Can Culleretes' },
      texto: {
        es: 'Carrer d\'en Quintana, 5. El restaurante más antiguo de Catalunya (desde 1786, récord Guinness), cocina catalana tradicional a pocos pasos de la ruta.',
        en: "Carrer d'en Quintana, 5. Catalonia's oldest restaurant (since 1786, a Guinness World Record), traditional Catalan cuisine just steps from the route.",
        fr: "Carrer d'en Quintana, 5. Le plus ancien restaurant de Catalogne (depuis 1786, record Guinness), cuisine catalane traditionnelle à quelques pas du parcours.",
        it: "Carrer d'en Quintana, 5. Il ristorante più antico della Catalogna (dal 1786, record Guinness), cucina catalana tradizionale a pochi passi dal percorso.",
      },
      url: 'https://culleretes.com/',
      mapsUrl: mapsUrl("Can Culleretes, Carrer d'en Quintana 5, Barcelona"),
    },
    movilidad: {
      // Mismo lugar que `puntoPartida` de esta ruta en js/catalogo.js.
      nombre: {
        es: 'Plaça Nova (Catedral de Barcelona)',
        en: 'Plaça Nova (Barcelona Cathedral)',
        fr: 'Plaça Nova (cathédrale de Barcelone)',
        it: 'Plaça Nova (Cattedrale di Barcellona)',
      },
      texto: {
        es: 'Metro Jaume I (L4, amarilla), a un par de minutos de la Catedral.',
        en: 'Jaume I metro station (L4, yellow line), a couple of minutes from the Cathedral.',
        fr: 'Métro Jaume I (L4, jaune), à quelques minutes de la cathédrale.',
        it: 'Metro Jaume I (L4, gialla), a un paio di minuti dalla Cattedrale.',
      },
      mapsUrl: mapsUrl('Plaça Nova, Barcelona'),
    },
  },

  'barcelona-born': {
    mirador: {
      nombre: {
        es: 'Moll de la Fusta / Port Vell',
        en: 'Moll de la Fusta / Port Vell',
        fr: 'Moll de la Fusta / Port Vell',
        it: 'Moll de la Fusta / Port Vell',
      },
      texto: {
        es: 'Paseo junto al puerto con vistas al mar, gratis, unos 10-12 min a pie desde el Born. Si os sobra tiempo, los Bunkers del Carmel (ver ruta del Gòtic) tienen la mejor vista de la ciudad, pero está más lejos.',
        en: "Free waterfront promenade with sea views, about 10-12 min on foot from the Born. If you have time to spare, the Bunkers del Carmel (see the Gòtic route) have the best view in the city, but they're further away.",
        fr: "Promenade gratuite le long du port avec vue sur la mer, à 10-12 min à pied du Born. Si vous avez du temps, les Bunkers del Carmel (voir le parcours du Gòtic) offrent la meilleure vue de la ville, mais c'est plus loin.",
        it: "Passeggiata gratuita lungo il porto con vista sul mare, a 10-12 min a piedi dal Born. Se avete tempo, i Bunkers del Carmel (vedi il percorso del Gòtic) hanno la vista migliore della città, ma sono più lontani.",
      },
      mapsUrl: mapsUrl('Moll de la Fusta, Barcelona'),
    },
    comida: {
      nombre: { es: 'El Xampanyet', en: 'El Xampanyet', fr: 'El Xampanyet', it: 'El Xampanyet' },
      texto: {
        es: 'Carrer de Montcada, 22, junto al Museu Picasso. Bar de tapas y cava desde 1929, icónico del Born — anchoas, tortilla y cava por copas. No reservan mesa, así que armaos de paciencia si hay cola.',
        en: "Carrer de Montcada, 22, next to the Museu Picasso. Tapas and cava bar since 1929, iconic in the Born — anchovies, tortilla and cava by the glass. They don't take table reservations, so be patient if there's a queue.",
        fr: "Carrer de Montcada, 22, à côté du Museu Picasso. Bar à tapas et cava depuis 1929, une institution du Born — anchois, tortilla et cava au verre. Pas de réservation de table, alors armez-vous de patience s'il y a la queue.",
        it: "Carrer de Montcada, 22, accanto al Museu Picasso. Bar di tapas e cava dal 1929, un'icona del Born — acciughe, tortilla e cava al calice. Non si prenota tavolo, quindi armatevi di pazienza se c'è coda.",
      },
      mapsUrl: mapsUrl('El Xampanyet, Carrer de Montcada 22, Barcelona'),
    },
    movilidad: {
      // Mismo lugar que `puntoPartida` de esta ruta en js/catalogo.js.
      nombre: { es: 'Arc de Triomf', en: 'Arc de Triomf', fr: 'Arc de Triomf', it: 'Arc de Triomf' },
      texto: {
        es: 'Metro Arc de Triomf (L1, roja), junto al punto de partida de la ruta. También conecta con Rodalies R1/R3/R4.',
        en: "Arc de Triomf metro station (L1, red line), right by the route's starting point. Also connects with Rodalies commuter trains R1/R3/R4.",
        fr: "Métro Arc de Triomf (L1, rouge), juste à côté du point de départ du parcours. Correspondance également avec les trains de banlieue Rodalies R1/R3/R4.",
        it: "Metro Arc de Triomf (L1, rossa), proprio accanto al punto di partenza del percorso. Coincidenza anche con i treni regionali Rodalies R1/R3/R4.",
      },
      mapsUrl: mapsUrl('Arc de Triomf, Barcelona'),
    },
  },

  'barcelona-raval': {
    mirador: {
      nombre: {
        es: 'Las Arenas (antigua plaza de toros)',
        en: 'Las Arenas (former bullring)',
        fr: 'Las Arenas (ancienne arène)',
        it: 'Las Arenas (ex arena per corride)',
      },
      texto: {
        es: 'Subiendo por dentro del centro comercial en Plaça Espanya se llega gratis a una pasarela circular con vistas 360°: Montjuïc, la Font Màgica, Sagrada Família al fondo. Solo cobran 1€ si usáis el ascensor directo en vez de las escaleras mecánicas. Unos 10-15 min desde el Raval (metro L1/L3 hasta Espanya).',
        en: "Going up inside the shopping centre at Plaça Espanya gets you, for free, to a circular walkway with 360° views: Montjuïc, the Font Màgica, Sagrada Família in the distance. They only charge €1 if you use the direct lift instead of the escalators. About 10-15 min from the Raval (L1/L3 metro to Espanya).",
        fr: "En montant à l'intérieur du centre commercial de la Plaça Espanya, on accède gratuitement à une passerelle circulaire avec vue à 360° : Montjuïc, la Font Màgica, la Sagrada Família au loin. Seul l'ascenseur direct est payant (1€), sinon les escalators sont gratuits. À 10-15 min du Raval (métro L1/L3 jusqu'à Espanya).",
        it: "Salendo all'interno del centro commerciale in Plaça Espanya si arriva gratis a una passerella circolare con vista a 360°: Montjuïc, la Font Màgica, la Sagrada Família sullo sfondo. Si paga solo 1€ se si usa l'ascensore diretto invece delle scale mobili. Circa 10-15 min dal Raval (metro L1/L3 fino a Espanya).",
      },
      mapsUrl: mapsUrl("Las Arenas de Barcelona, Plaça d'Espanya"),
    },
    comida: {
      nombre: { es: 'Granja M. Viader', en: 'Granja M. Viader', fr: 'Granja M. Viader', it: 'Granja M. Viader' },
      texto: {
        es: 'Carrer d\'en Xuclà, 4-6. Granja centenaria (desde 1870), cuna del Cacaolat — perfecta para probar un "suís" (chocolate caliente con nata) como merienda a media ruta.',
        en: 'Carrer d\'en Xuclà, 4-6. A century-old dairy café (since 1870), birthplace of Cacaolat — the perfect spot to try a "suís" (hot chocolate with whipped cream) as a snack halfway through the route.',
        fr: 'Carrer d\'en Xuclà, 4-6. Salon de dégustation centenaire (depuis 1870), berceau du Cacaolat — parfait pour goûter un « suís » (chocolat chaud à la crème fouettée) en pause à mi-parcours.',
        it: 'Carrer d\'en Xuclà, 4-6. Latteria centenaria (dal 1870), culla del Cacaolat — perfetta per provare un "suís" (cioccolata calda con panna) come merenda a metà percorso.',
      },
      mapsUrl: mapsUrl("Granja M. Viader, Carrer d'en Xuclà 4, Barcelona"),
    },
    movilidad: {
      // Mismo lugar que `puntoPartida` de esta ruta en js/catalogo.js.
      nombre: {
        es: 'Mercat de la Boqueria',
        en: 'Mercat de la Boqueria',
        fr: 'Mercat de la Boqueria',
        it: 'Mercat de la Boqueria',
      },
      texto: {
        es: 'Metro Liceu (L3, verde), sale justo al lado del Mercat de la Boqueria.',
        en: 'Liceu metro station (L3, green line), comes out right next to the Mercat de la Boqueria.',
        fr: 'Métro Liceu (L3, verte), sortie juste à côté du Mercat de la Boqueria.',
        it: 'Metro Liceu (L3, verde), l\'uscita è proprio accanto al Mercat de la Boqueria.',
      },
      mapsUrl: mapsUrl('Mercat de la Boqueria, Barcelona'),
    },
  },

  'toulouse-capitole': {
    mirador: {
      nombre: {
        es: 'Quai Lucien Lombard (orilla del Garona)',
        en: 'Quai Lucien Lombard (Garonne riverbank)',
        fr: 'Quai Lucien Lombard (bords de Garonne)',
        it: 'Quai Lucien Lombard (riva della Garonna)',
      },
      texto: {
        es: 'Paseo gratuito junto al río, en el tramo entre el Pont Neuf y el Pont Saint-Pierre — el más bonito de la ciudad. Al otro lado del agua se ve la silueta del Hôtel-Dieu Saint-Jacques y su cúpula ("dôme de la Grave"), sobre todo espectacular a la puesta de sol. Unos 10 min a pie desde el Capitole.',
        en: 'A free riverside walk, in the stretch between the Pont Neuf and the Pont Saint-Pierre — the prettiest in the city. Across the water you can see the silhouette of the Hôtel-Dieu Saint-Jacques and its dome (the "dôme de la Grave"), especially striking at sunset. About 10 min on foot from the Capitole.',
        fr: 'Promenade gratuite le long du fleuve, sur le tronçon entre le Pont Neuf et le Pont Saint-Pierre — le plus beau de la ville. De l\'autre côté de l\'eau se dessine la silhouette de l\'Hôtel-Dieu Saint-Jacques et son dôme (le « dôme de la Grave »), particulièrement spectaculaire au coucher du soleil. Environ 10 min à pied du Capitole.',
        it: 'Passeggiata gratuita lungo il fiume, nel tratto tra il Pont Neuf e il Pont Saint-Pierre — il più bello della città. Dall\'altra parte dell\'acqua si vede la sagoma dell\'Hôtel-Dieu Saint-Jacques e la sua cupola (il "dôme de la Grave"), particolarmente spettacolare al tramonto. Circa 10 min a piedi dal Capitole.',
      },
      // Fuente: Toulouse Tourisme (toulouse-tourisme.com/nos-incontournables/
      // les-bords-de-garonne) sobre la vista del Hôtel-Dieu Saint-Jacques y
      // el dôme de la Grave desde el Garona, y krisporelmundo.com sobre el
      // Quai Lucien Lombard como mejor tramo (entre Pont Neuf y Pont
      // Saint-Pierre) y punto popular al atardecer.
      mapsUrl: mapsUrl('Quai Lucien Lombard, Toulouse'),
    },
    comida: {
      nombre: { es: 'Restaurant Emile', en: 'Restaurant Emile', fr: 'Restaurant Emile', it: 'Restaurant Emile' },
      texto: {
        es: '13 Place Saint-Georges, a un par de minutos del Capitole. Institución tolosana desde los años 40, célebre por su cassoulet.',
        en: "13 Place Saint-Georges, a couple of minutes from the Capitole. A Toulouse institution since the 1940s, famous for its cassoulet.",
        fr: "13 Place Saint-Georges, à quelques minutes du Capitole. Institution toulousaine depuis les années 40, réputée pour son cassoulet.",
        it: "13 Place Saint-Georges, a un paio di minuti dal Capitole. Istituzione tolosana dagli anni '40, famosa per il suo cassoulet.",
      },
      url: 'https://www.restaurant-emile.com/',
      // Fuente: web oficial del restaurante (restaurant-emile.com) — abierto
      // en los años 40, especialidad cassoulet, dirección confirmada en
      // Place Saint-Georges (junto al Capitole).
      mapsUrl: mapsUrl('Restaurant Emile, 13 Place Saint-Georges, Toulouse'),
    },
    movilidad: {
      // Mismo lugar que `puntoPartida` de esta ruta en js/catalogo.js.
      nombre: { es: 'Place du Capitole', en: 'Place du Capitole', fr: 'Place du Capitole', it: 'Place du Capitole' },
      texto: {
        es: 'Metro Capitole (Línea A), sale directamente a la plaza.',
        en: 'Capitole metro station (Line A), comes out directly onto the square.',
        fr: 'Métro Capitole (Ligne A), sortie directe sur la place.',
        it: 'Metro Capitole (Linea A), l\'uscita è direttamente sulla piazza.',
      },
      mapsUrl: mapsUrl('Place du Capitole, Toulouse'),
    },
  },

  'madrid-austrias': {
    mirador: {
      nombre: {
        es: 'Terraza de El Corte Inglés (Plaza de Callao)',
        en: 'El Corte Inglés Terrace (Plaza de Callao)',
        fr: "Terrasse d'El Corte Inglés (Plaza de Callao)",
        it: 'Terrazza di El Corte Inglés (Plaza de Callao)',
      },
      texto: {
        es: 'Novena planta, unos 5-7 min a pie desde Sol por la calle Preciados. Acceso libre en ascensor hasta el espacio Gourmet Experience, sin consumición mínima, con vistas a la Gran Vía, las torres de Plaza de España, la cúpula del Teatro Real, el Palacio Real y la Catedral de la Almudena.',
        en: 'Ninth floor, about 5-7 min on foot from Sol along Calle Preciados. Free lift access to the Gourmet Experience space, no minimum purchase, with views over the Gran Vía, the Plaza de España towers, the dome of the Teatro Real, the Royal Palace and the Almudena Cathedral.',
        fr: "Neuvième étage, à 5-7 min à pied de Sol par la rue Preciados. Accès libre en ascenseur jusqu'à l'espace Gourmet Experience, sans consommation minimale, avec vue sur la Gran Vía, les tours de la Plaza de España, la coupole du Teatro Real, le Palais Royal et la cathédrale de la Almudena.",
        it: "Nono piano, a 5-7 min a piedi da Sol lungo la calle Preciados. Accesso libero in ascensore fino allo spazio Gourmet Experience, senza consumazione minima, con vista sulla Gran Vía, le torri di Plaza de España, la cupola del Teatro Real, il Palazzo Reale e la Cattedrale dell'Almudena.",
      },
      // Fuente: verificado con búsquedas (miradormadrid.com, tranbel.com):
      // terraza gratuita en la 9ª planta de El Corte Inglés de Callao (Plaza
      // de Callao, 2), acceso directo por ascensor, sin consumición
      // obligatoria — mismo modelo que la terraza de Plaça Catalunya en
      // Barcelona. Comprobar horario antes de enviar si cambia.
      mapsUrl: mapsUrl('El Corte Inglés, Plaza de Callao 2, Madrid'),
    },
    comida: {
      nombre: {
        es: 'Chocolatería San Ginés',
        en: 'Chocolatería San Ginés',
        fr: 'Chocolatería San Ginés',
        it: 'Chocolatería San Ginés',
      },
      texto: {
        es: 'Pasadizo de San Ginés, 5, a unos 5 min de Sol. Churrería desde 1894, abierta 24 horas, la más famosa de Madrid — chocolate con churros junto a la iglesia de San Ginés.',
        en: "Pasadizo de San Ginés, 5, about 5 min from Sol. A churrería open since 1894, open 24 hours, the most famous in Madrid — hot chocolate with churros next to the San Ginés church.",
        fr: "Pasadizo de San Ginés, 5, à environ 5 min de Sol. Churrería ouverte depuis 1894, ouverte 24h/24, la plus célèbre de Madrid — chocolat chaud et churros à côté de l'église San Ginés.",
        it: "Pasadizo de San Ginés, 5, a circa 5 min da Sol. Churrería aperta dal 1894, aperta 24 ore su 24, la più famosa di Madrid — cioccolata calda con churros accanto alla chiesa di San Ginés.",
      },
      url: 'https://chocolateriasangines.com/',
      // Fuente: web oficial (chocolateriasangines.com/historia) — abierta en
      // 1894, ubicación en el Pasadizo de San Ginés junto a la iglesia del
      // mismo nombre, muy cerca de Puerta del Sol.
      mapsUrl: mapsUrl('Chocolatería San Ginés, Pasadizo de San Ginés 5, Madrid'),
    },
    movilidad: {
      // Mismo lugar que `puntoPartida` de esta ruta en js/catalogo.js.
      nombre: { es: 'Puerta del Sol', en: 'Puerta del Sol', fr: 'Puerta del Sol', it: 'Puerta del Sol' },
      texto: {
        es: 'Estación de Sol (Metro líneas 1, 2 y 3, y Cercanías C-3/C-4), justo debajo de la plaza.',
        en: 'Sol station (Metro lines 1, 2 and 3, and Cercanías commuter trains C-3/C-4), right beneath the square.',
        fr: 'Station Sol (métro lignes 1, 2 et 3, et trains de banlieue Cercanías C-3/C-4), juste sous la place.',
        it: 'Stazione di Sol (Metro linee 1, 2 e 3, e treni regionali Cercanías C-3/C-4), proprio sotto la piazza.',
      },
      mapsUrl: mapsUrl('Puerta del Sol, Madrid'),
    },
  },

  'valencia-carmen': {
    mirador: {
      nombre: { es: 'Torres de Serranos', en: 'Torres de Serranos', fr: 'Torres de Serranos', it: 'Torres de Serranos' },
      texto: {
        es: 'En el borde del Carmen, junto al antiguo cauce del Turia, unos 15 min a pie desde la Lonja. Subir a las almenas cuesta 2€ entre semana y sábados, pero la entrada es gratis los domingos y festivos (10:00-14:00) — vistas 360° sobre el Carmen y la ciudad.',
        en: "On the edge of the Carmen, right by the old Turia riverbed, about 15 min on foot from the Lonja. Climbing to the battlements costs €2 on weekdays and Saturdays, but entry is free on Sundays and public holidays (10:00-14:00) — 360° views over the Carmen and the city.",
        fr: "En bordure du Carmen, le long de l'ancien lit du Turia, à environ 15 min à pied de la Lonja. Monter sur les remparts coûte 2€ en semaine et le samedi, mais l'entrée est gratuite le dimanche et les jours fériés (10h-14h) — vue à 360° sur le Carmen et la ville.",
        it: "Ai margini del Carmen, lungo l'antico letto del Turia, a circa 15 min a piedi dalla Lonja. Salire sui bastioni costa 2€ nei giorni feriali e il sabato, ma l'ingresso è gratuito la domenica e nei giorni festivi (10:00-14:00) — vista a 360° sul Carmen e sulla città.",
      },
      // Fuente: verificado con búsquedas — entrada general 2€/reducida 1€,
      // gratis domingos y festivos de 10:00 a 14:00 (horario habitual L-S
      // 10:00-19:00). Comprobar horario antes de enviar si cambia.
      mapsUrl: mapsUrl('Torres de Serranos, Valencia'),
    },
    comida: {
      nombre: {
        es: 'Horchatería Santa Catalina',
        en: 'Horchatería Santa Catalina',
        fr: 'Horchatería Santa Catalina',
        it: 'Horchatería Santa Catalina',
      },
      texto: {
        es: 'Plaza de Santa Catalina, 6, junto a la Plaza Redonda y la Catedral. Horchatería centenaria (desde principios del s. XX, cuarta generación de la familia Gargallo) — horchata y fartons, o chocolate con churros, en un local de azulejo valenciano clásico.',
        en: "Plaza de Santa Catalina, 6, next to the Plaza Redonda and the Cathedral. A century-old horchatería (running since the early 20th century, now in the Gargallo family's fourth generation) — horchata and fartons, or hot chocolate with churros, in a classic Valencian-tile shop.",
        fr: "Plaza de Santa Catalina, 6, à côté de la Plaza Redonda et de la cathédrale. Horchatería centenaire (depuis le début du XXe siècle, quatrième génération de la famille Gargallo) — horchata et fartons, ou chocolat chaud et churros, dans un local aux azulejos valenciens classiques.",
        it: "Plaza de Santa Catalina, 6, accanto alla Plaza Redonda e alla Cattedrale. Horchatería centenaria (dall'inizio del '900, quarta generazione della famiglia Gargallo) — horchata e fartons, oppure cioccolata calda con churros, in un locale con le classiche piastrelle valenciane.",
      },
      // Fuente: verificado con búsquedas (valenciasecreta.com) — fundada por
      // Vicente Gargallo, edificio de 1890, hoy regentada por la cuarta
      // generación de la familia; dirección Plaza Santa Catalina 6.
      mapsUrl: mapsUrl('Horchatería Santa Catalina, Plaza Santa Catalina 6, Valencia'),
    },
    movilidad: {
      // Mismo lugar que `puntoPartida` de esta ruta en js/catalogo.js.
      nombre: {
        es: 'La Lonja de la Seda',
        en: 'La Lonja de la Seda',
        fr: 'La Lonja de la Seda',
        it: 'La Lonja de la Seda',
      },
      texto: {
        es: 'Metro Xàtiva (líneas 3, 5 y 9), frente a la Estación del Norte, unos 10 min a pie.',
        en: 'Xàtiva metro station (lines 3, 5 and 9), across from the Estación del Norte, about 10 min on foot.',
        fr: 'Métro Xàtiva (lignes 3, 5 et 9), en face de la gare du Nord (Estación del Norte), à environ 10 min à pied.',
        it: 'Metro Xàtiva (linee 3, 5 e 9), di fronte alla Estación del Norte, circa 10 min a piedi.',
      },
      mapsUrl: mapsUrl('La Lonja de la Seda, Valencia'),
    },
  },
  'paris-marais': {
    mirador: {
      nombre: {
        es: 'Terraza panorámica del Institut du Monde Arabe',
        en: 'Institut du Monde Arabe panoramic terrace',
        fr: "Terrasse panoramique de l'Institut du Monde Arabe",
        it: "Terrazza panoramica dell'Institut du Monde Arabe",
      },
      texto: {
        es: 'Noveno y último piso, a 11 min andando desde Notre-Dame. Acceso libre y gratuito de martes a domingo, de 10h a 18h — no hace falta entrada ni consumición. Vistas directas sobre la cabecera de Notre-Dame, la Île Saint-Louis y el Sena.',
        en: "Ninth and top floor, an 11 min walk from Notre-Dame. Free access Tuesday to Sunday, 10am to 6pm — no ticket or purchase needed. Direct views over the apse of Notre-Dame, the Île Saint-Louis and the Seine.",
        fr: "Neuvième et dernier étage, à 11 min à pied de Notre-Dame. Accès libre et gratuit du mardi au dimanche, de 10h à 18h — pas besoin de billet ni de consommation. Vue directe sur le chevet de Notre-Dame, l'Île Saint-Louis et la Seine.",
        it: "Nono e ultimo piano, a 11 min a piedi da Notre-Dame. Accesso libero e gratuito dal martedì alla domenica, dalle 10 alle 18 — non serve biglietto né consumazione. Vista diretta sull'abside di Notre-Dame, l'Île Saint-Louis e la Senna.",
      },
      // Fuente: web oficial del Institut du Monde Arabe
      // (imarabe.org/fr/terrasse) — "L'accès à la terrasse panoramique est
      // libre et gratuit", horario martes-domingo 10h-18h.
      mapsUrl: mapsUrl('Institut du Monde Arabe, 1 Rue des Fossés Saint-Bernard, Paris'),
    },
    comida: {
      nombre: {
        es: "L'As du Fallafel",
        en: "L'As du Fallafel",
        fr: "L'As du Fallafel",
        it: "L'As du Fallafel",
      },
      texto: {
        es: '34 rue des Rosiers, en pleno Pletzl (barrio judío del Marais), a unos 13 min andando de Notre-Dame. Institución del barrio desde 1979, famosa por su pita de falafel con berenjena y hummus; suele haber cola en la puerta. Cierra los viernes por la tarde y todo el sábado por el Shabbat.',
        en: "34 rue des Rosiers, right in the Pletzl (the Marais' Jewish quarter), about 13 min on foot from Notre-Dame. A neighbourhood institution since 1979, famous for its falafel pita with eggplant and hummus; there's usually a queue at the door. Closes Friday afternoon and all day Saturday for Shabbat.",
        fr: "34 rue des Rosiers, en plein Pletzl (le quartier juif du Marais), à environ 13 min à pied de Notre-Dame. Institution du quartier depuis 1979, réputée pour sa pita falafel à l'aubergine et au houmous ; il y a souvent la queue devant. Fermé le vendredi après-midi et tout le samedi pour le Shabbat.",
        it: "34 rue des Rosiers, nel cuore del Pletzl (il quartiere ebraico del Marais), a circa 13 min a piedi da Notre-Dame. Istituzione del quartiere dal 1979, famosa per la sua pita di falafel con melanzane e hummus; di solito c'è coda all'entrata. Chiude il venerdì pomeriggio e tutto il sabato per lo Shabbat.",
      },
      // Fuente: Wikipedia (L'As du Fallafel), parisjetaime.com — horarios
      // confirmados por búsqueda (dom-jue 11h-23h30, vie 11h-16h, sáb
      // cerrado). Sin web oficial localizable, se omite el campo `url`.
      mapsUrl: mapsUrl("L'As du Fallafel, 34 Rue des Rosiers, Paris"),
    },
    movilidad: {
      // Mismo lugar que `puntoPartida` de esta ruta en js/catalogo.js.
      nombre: {
        es: 'Cité (línea 4)',
        en: 'Cité (line 4)',
        fr: 'Cité (ligne 4)',
        it: 'Cité (linea 4)',
      },
      texto: {
        es: 'A 3 minutos a pie de la entrada de la catedral. Es la única estación del metro parisino situada bajo una isla (Île de la Cité), con andenes a 25 m bajo el Sena.',
        en: "A 3-minute walk from the cathedral entrance. It's the only Paris metro station located under an island (Île de la Cité), with platforms 25 m below the Seine.",
        fr: "À 3 minutes à pied de l'entrée de la cathédrale. C'est la seule station du métro parisien située sous une île (Île de la Cité), avec des quais à 25 m sous la Seine.",
        it: "A 3 minuti a piedi dall'ingresso della cattedrale. È l'unica stazione della metropolitana parigina situata sotto un'isola (Île de la Cité), con banchine a 25 m sotto la Senna.",
      },
      // Fuente: verificado con búsquedas — estación Cité (línea 4) como la
      // más cercana a Notre-Dame, a 3 min a pie.
      mapsUrl: mapsUrl('Métro Cité, Paris'),
    },
  },

  'paris-montmartre': {
    mirador: {
      nombre: {
        es: 'Parvis de la Sacré-Cœur',
        en: 'Parvis of the Sacré-Cœur',
        fr: 'Parvis de la Sacré-Cœur',
        it: 'Sagrato del Sacré-Cœur',
      },
      texto: {
        es: 'El propio punto de partida ya es el mejor mirador gratuito de la zona: a 130 m de altura, con acceso libre a cualquier hora del día. En un día despejado la vista alcanza los domos dorados de los Inválides y el Panteón.',
        en: "The starting point itself is already the best free viewpoint in the area: 130 m up, with free access at any time of day. On a clear day the view reaches the golden domes of Les Invalides and the Panthéon.",
        fr: "Le point de départ lui-même est déjà le meilleur point de vue gratuit du quartier : à 130 m d'altitude, en accès libre à toute heure du jour. Par temps clair, la vue porte jusqu'aux dômes dorés des Invalides et au Panthéon.",
        it: "Il punto di partenza stesso è già il miglior punto panoramico gratuito della zona: a 130 m di altezza, con accesso libero a qualsiasi ora del giorno. Nelle giornate limpide la vista arriva fino alle cupole dorate degli Invalides e al Panthéon.",
      },
      // Fuente: verificado con varias guías turísticas coincidentes en
      // "acceso libre y gratuito" y la altura de 130 m del parvis.
      mapsUrl: mapsUrl('Parvis du Sacré-Cœur, Paris'),
    },
    comida: {
      nombre: {
        es: 'La Bonne Franquette',
        en: 'La Bonne Franquette',
        fr: 'La Bonne Franquette',
        it: 'La Bonne Franquette',
      },
      texto: {
        es: 'Rue Saint-Rustique, a 2-3 min del parvis. Casa del siglo XVI que fue punto de encuentro de Pissarro, Cézanne, Renoir, Toulouse-Lautrec y Van Gogh; Renoir pintó aquí "Le Bal du Moulin de la Galette" (1876).',
        en: 'Rue Saint-Rustique, 2-3 min from the parvis. A 16th-century house that was once a meeting place for Pissarro, Cézanne, Renoir, Toulouse-Lautrec and Van Gogh; Renoir painted "Le Bal du Moulin de la Galette" (1876) here.',
        fr: 'Rue Saint-Rustique, à 2-3 min du parvis. Maison du XVIe siècle qui fut un lieu de rendez-vous pour Pissarro, Cézanne, Renoir, Toulouse-Lautrec et Van Gogh ; Renoir y peignit « Le Bal du Moulin de la Galette » (1876).',
        it: 'Rue Saint-Rustique, a 2-3 min dal sagrato. Casa del XVI secolo che fu punto d\'incontro di Pissarro, Cézanne, Renoir, Toulouse-Lautrec e Van Gogh; qui Renoir dipinse "Le Bal du Moulin de la Galette" (1876).',
      },
      url: 'https://www.labonnefranquette.com/',
      // Fuente: sitio oficial labonnefranquette.com/histoire-de-la-bonne-franquette
      // (historia, artistas, cuadros citados).
      mapsUrl: mapsUrl('La Bonne Franquette, 18 Rue Saint-Rustique, Paris'),
    },
    movilidad: {
      // Mismo lugar que `puntoPartida` de esta ruta en js/catalogo.js.
      nombre: {
        es: 'Anvers (línea 2) + funicular de Montmartre',
        en: 'Anvers (line 2) + Montmartre funicular',
        fr: 'Anvers (ligne 2) + funiculaire de Montmartre',
        it: 'Anvers (linea 2) + funicolare di Montmartre',
      },
      texto: {
        es: 'Es la estación de metro más cercana a la Sacré-Cœur, a 2 min a pie del funicular. El funicular sube en 1 min 30 s hasta el parvis y el billete está incluido en el ticket normal de metro.',
        en: "It's the metro station closest to the Sacré-Cœur, a 2-minute walk from the funicular. The funicular climbs to the parvis in 1 min 30 sec and the fare is included in a normal metro ticket.",
        fr: "C'est la station de métro la plus proche de la Sacré-Cœur, à 2 min à pied du funiculaire. Le funiculaire monte jusqu'au parvis en 1 min 30, et le trajet est inclus dans le ticket de métro normal.",
        it: "È la stazione della metropolitana più vicina al Sacré-Cœur, a 2 min a piedi dalla funicolare. La funicolare sale fino al sagrato in 1 min e 30 sec e la corsa è inclusa nel normale biglietto della metropolitana.",
      },
      // Fuente: verificado con búsquedas (parisjetaime.com) — Anvers como
      // estación más próxima, tarifa del funicular incluida en el billete
      // estándar de metro.
      mapsUrl: mapsUrl('Métro Anvers, Paris'),
    },
  },

  'lisboa-alfama': {
    mirador: {
      nombre: {
        es: 'Miradouro de Santa Luzia',
        en: 'Miradouro de Santa Luzia',
        fr: 'Miradouro de Santa Luzia',
        it: 'Miradouro de Santa Luzia',
      },
      texto: {
        es: 'A un par de minutos cuesta arriba desde la Sé (por la Rua do Limoeiro), camino del Castelo de São Jorge. Plaza pública con pérgola de buganvillas y paneles de azulejos históricos, vistas sobre los tejados de Alfama y el Tajo, entrada libre las 24 horas — parada del icónico tranvía 28.',
        en: 'A couple of minutes uphill from the Sé (via Rua do Limoeiro), on the way to the Castelo de São Jorge. A public square with a bougainvillea pergola and historic tile panels, views over the rooftops of Alfama and the Tagus, free entry 24 hours a day — a stop on the iconic tram 28.',
        fr: 'À quelques minutes en montée depuis la Sé (par la Rua do Limoeiro), en direction du Castelo de São Jorge. Place publique avec pergola de bougainvillées et panneaux d\'azulejos historiques, vue sur les toits d\'Alfama et le Tage, entrée libre 24h/24 — arrêt de l\'emblématique tramway 28.',
        it: 'A un paio di minuti in salita dalla Sé (per Rua do Limoeiro), verso il Castelo de São Jorge. Piazza pubblica con pergola di buganvillee e pannelli di azulejos storici, vista sui tetti di Alfama e sul Tago, ingresso libero 24 ore su 24 — fermata dell\'iconico tram 28.',
      },
      // Fuente: visitlisboa.com/en/places/miradouro-de-santa-luzia,
      // golisbon.com — confirmado como gratuito, junto a la Sé y camino del
      // Castillo, servido por el tranvía 28.
      mapsUrl: mapsUrl('Miradouro de Santa Luzia, Lisboa'),
    },
    comida: {
      nombre: { es: 'Alfama Doce', en: 'Alfama Doce', fr: 'Alfama Doce', it: 'Alfama Doce' },
      texto: {
        es: 'Rua da Regueira, 39, en pleno corazón de Alfama, bajando desde la Sé. Pastelaria familiar minúscula donde vecinos y algún turista avispado hacen cola por sus pastéis de nata recién horneados (menos de 1€ cada uno) — solo efectivo.',
        en: 'Rua da Regueira, 39, right in the heart of Alfama, downhill from the Sé. A tiny family-run pastelaria where locals and the odd savvy tourist queue for freshly baked pastéis de nata (under €1 each) — cash only.',
        fr: "Rua da Regueira, 39, en plein cœur d'Alfama, en descendant depuis la Sé. Minuscule pâtisserie familiale où les habitants et quelques touristes avisés font la queue pour ses pastéis de nata tout juste sortis du four (moins d'1€ pièce) — paiement en espèces uniquement.",
        it: 'Rua da Regueira, 39, nel cuore di Alfama, scendendo dalla Sé. Piccola pasticceria a conduzione familiare dove i residenti e qualche turista informato fanno la coda per i pastéis de nata appena sfornati (meno di 1€ l\'uno) — solo contanti.',
      },
      // Fuente: reseñas consistentes en Tripadvisor y Wanderlog: "tiny
      // family-run pastelaria", "cash only", precio <1€/nata. Sin web
      // oficial localizable (negocio familiar pequeño), se omite `url`.
      mapsUrl: mapsUrl('Alfama Doce, Rua da Regueira 39, Lisboa'),
    },
    movilidad: {
      // Mismo lugar que `puntoPartida` de esta ruta en js/catalogo.js.
      nombre: {
        es: 'Sé (Tranvía 28)',
        en: 'Sé (Tram 28)',
        fr: 'Sé (tramway 28)',
        it: 'Sé (tram 28)',
      },
      texto: {
        es: 'El tranvía 28 para justo en Largo da Sé, frente a la Catedral. Si preferís metro, la estación más cercana es Terreiro do Paço (Línea Azul), unos 7 min andando cuesta abajo.',
        en: 'Tram 28 stops right at Largo da Sé, facing the Cathedral. If you prefer the metro, the closest station is Terreiro do Paço (Blue Line), about a 7-minute downhill walk.',
        fr: 'Le tramway 28 s\'arrête juste à Largo da Sé, en face de la cathédrale. Si vous préférez le métro, la station la plus proche est Terreiro do Paço (ligne bleue), à environ 7 min à pied en descente.',
        it: 'Il tram 28 si ferma proprio a Largo da Sé, di fronte alla Cattedrale. Se preferite la metro, la stazione più vicina è Terreiro do Paço (Linea Blu), circa 7 min a piedi in discesa.',
      },
      // Fuente: lisbonportugaltourism.com — parada del tranvía 28 "right at
      // the stop of the same name" junto a la Sé.
      mapsUrl: mapsUrl('Largo da Sé, Lisboa'),
    },
  },

  'roma-centro': {
    mirador: {
      nombre: {
        es: 'Terrazza Caffarelli (Musei Capitolini)',
        en: 'Terrazza Caffarelli (Capitoline Museums)',
        fr: 'Terrazza Caffarelli (musées du Capitole)',
        it: 'Terrazza Caffarelli (Musei Capitolini)',
      },
      texto: {
        es: 'A unos 10-12 min andando desde el Pantheon, subiendo al Campidoglio. Tiene acceso externo directo desde la escalinata de Piazzale Caffarelli, independiente del museo — no hace falta entrada para asomarse a la terraza y ver el Foro Romano. Hay cafetería en la propia terraza por si os apetece algo, pero mirar es gratis.',
        en: "About 10-12 min on foot from the Pantheon, up on the Campidoglio. It has direct outdoor access from the Piazzale Caffarelli steps, separate from the museum — no ticket needed to step onto the terrace and see the Roman Forum. There's a café right on the terrace if you fancy something, but looking is free.",
        fr: "À environ 10-12 min à pied du Panthéon, en montant au Capitole. Un accès extérieur direct depuis l'escalier de la Piazzale Caffarelli, indépendant du musée — pas besoin de billet pour aller sur la terrasse et voir le Forum romain. Un café est installé sur la terrasse même si l'envie vous prend, mais regarder est gratuit.",
        it: "A circa 10-12 min a piedi dal Pantheon, salendo al Campidoglio. Ha un accesso esterno diretto dalla scalinata di Piazzale Caffarelli, indipendente dal museo — non serve biglietto per affacciarsi sulla terrazza e vedere il Foro Romano. C'è un caffè proprio sulla terrazza se vi va qualcosa, ma guardare è gratis.",
      },
      // Fuente: turismoroma.it (ficha oficial "Caffetteria dei Musei
      // Capitolini - Terrazza Caffarelli") + museicapitolini.org, que
      // confirman el acceso externo desde la escalinata del Campidoglio,
      // separado del acceso al museo.
      mapsUrl: mapsUrl('Terrazza Caffarelli, Piazzale Caffarelli 4, Roma'),
    },
    comida: {
      nombre: {
        es: "Sant'Eustachio Il Caffè",
        en: "Sant'Eustachio Il Caffè",
        fr: "Sant'Eustachio Il Caffè",
        it: "Sant'Eustachio Il Caffè",
      },
      texto: {
        es: 'Piazza di Sant\'Eustachio, 82, a 3-4 min andando del Pantheon. Torrefacción histórica desde 1938, con el famoso "gran caffè" batido con azúcar, hecho con tueste artesanal a leña.',
        en: 'Piazza di Sant\'Eustachio, 82, a 3-4 min walk from the Pantheon. A historic roastery since 1938, known for its famous "gran caffè" whipped with sugar, made with artisanal wood-fired roasting.',
        fr: 'Piazza di Sant\'Eustachio, 82, à 3-4 min à pied du Panthéon. Torréfacteur historique depuis 1938, célèbre pour son "gran caffè" fouetté au sucre, torréfié artisanalement au feu de bois.',
        it: 'Piazza di Sant\'Eustachio, 82, a 3-4 min a piedi dal Pantheon. Torrefazione storica dal 1938, famosa per il suo "gran caffè" montato con lo zucchero, tostato artigianalmente a legna.',
      },
      url: 'https://caffesanteustachio.com/',
      // Fuente: web oficial (caffesanteustachio.com) para dirección,
      // horarios e historia; fundación en 1938 corroborada por italia.it.
      mapsUrl: mapsUrl("Sant'Eustachio Il Caffè, Piazza di Sant'Eustachio 82, Roma"),
    },
    movilidad: {
      // Mismo lugar que `puntoPartida` de esta ruta en js/catalogo.js.
      nombre: {
        es: 'Piazza della Rotonda (Panteón)',
        en: 'Piazza della Rotonda (Pantheon)',
        fr: 'Piazza della Rotonda (Panthéon)',
        it: 'Piazza della Rotonda (Pantheon)',
      },
      texto: {
        es: 'El Pantheon está en zona peatonal sin metro directo — el hub de transporte más cercano es Largo di Torre Argentina, a 400 m / 5 min andando, con varias líneas de bus y el tram 8.',
        en: "The Pantheon is in a pedestrian zone with no direct metro — the nearest transport hub is Largo di Torre Argentina, 400 m / 5 min on foot, with several bus lines and tram 8.",
        fr: "Le Panthéon se trouve dans une zone piétonne sans métro direct — le pôle de transport le plus proche est Largo di Torre Argentina, à 400 m / 5 min à pied, avec plusieurs lignes de bus et le tram 8.",
        it: "Il Pantheon si trova in una zona pedonale senza metro diretta — lo snodo di trasporto più vicino è Largo di Torre Argentina, a 400 m / 5 min a piedi, con diverse linee di bus e il tram 8.",
      },
      // Fuente: amicinvacanza.it — líneas de bus con parada en Largo di
      // Torre Argentina a 400 m del Pantheon.
      mapsUrl: mapsUrl('Largo di Torre Argentina, Roma'),
    },
  },

  'roma-trastevere': {
    mirador: {
      nombre: {
        es: 'Piazzale di San Pietro in Montorio',
        en: 'Piazzale di San Pietro in Montorio',
        fr: 'Piazzale di San Pietro in Montorio',
        it: 'Piazzale di San Pietro in Montorio',
      },
      texto: {
        es: 'Subiendo desde la plaza por Via della Paglia y la escalinata hasta Via Garibaldi (unos 10-15 min a pie, cuesta arriba), se llega a la pequeña terraza pública frente a la iglesia de San Pietro in Montorio, con vistas sobre Trastevere y Roma — acceso libre y gratuito.',
        en: "Walking up from the square via Via della Paglia and the steps to Via Garibaldi (about 10-15 min on foot, uphill), you reach the small public terrace facing the church of San Pietro in Montorio, with views over Trastevere and Rome — free, open access.",
        fr: "En montant depuis la place par la Via della Paglia et l'escalier jusqu'à la Via Garibaldi (environ 10-15 min à pied, en côte), on atteint la petite terrasse publique face à l'église San Pietro in Montorio, avec vue sur Trastevere et Rome — accès libre et gratuit.",
        it: "Salendo dalla piazza per Via della Paglia e la scalinata fino a Via Garibaldi (circa 10-15 min a piedi, in salita), si arriva alla piccola terrazza pubblica di fronte alla chiesa di San Pietro in Montorio, con vista su Trastevere e Roma — accesso libero e gratuito.",
      },
      // Fuente: turismoroma.it (ficha oficial del Tempietto de Bramante,
      // confirma entrada gratuita y ubicación en el Gianicolo); la terraza
      // frente a la iglesia es espacio público exterior.
      mapsUrl: mapsUrl('Piazzale di San Pietro in Montorio, Roma'),
    },
    comida: {
      nombre: { es: 'Bar San Calisto', en: 'Bar San Calisto', fr: 'Bar San Calisto', it: 'Bar San Calisto' },
      texto: {
        es: 'Piazza di San Calisto, 3, a 2 min de la basílica. Bar familiar desde 1969, "el bar de la Roma auténtica": mesas en la plaza, precios de otra época (café a 1€) y su famosa granita di caffè con panna.',
        en: 'Piazza di San Calisto, 3, 2 min from the basilica. A family-run bar since 1969, "the bar of authentic Rome": tables out on the square, prices from another era (coffee for €1) and its famous granita di caffè con panna.',
        fr: "Piazza di San Calisto, 3, à 2 min de la basilique. Bar familial depuis 1969, « le bar de la Rome authentique » : tables sur la place, prix d'une autre époque (café à 1€) et sa fameuse granita di caffè con panna.",
        it: 'Piazza di San Calisto, 3, a 2 min dalla basilica. Bar a conduzione familiare dal 1969, "il bar della Roma autentica": tavoli in piazza, prezzi di un\'altra epoca (caffè a 1€) e la sua famosa granita di caffè con panna.',
      },
      url: 'https://barsancalisto.it/',
      // Fuente: web oficial (barsancalisto.it) — fundación en 1969 por
      // Marcello Forti; dirección confirmada en Piazza di San Calisto 3.
      mapsUrl: mapsUrl('Bar San Calisto, Piazza di San Calisto 3, Roma'),
    },
    movilidad: {
      // Mismo lugar que `puntoPartida` de esta ruta en js/catalogo.js.
      nombre: {
        es: 'Piazza di Santa Maria in Trastevere',
        en: 'Piazza di Santa Maria in Trastevere',
        fr: 'Piazza di Santa Maria in Trastevere',
        it: 'Piazza di Santa Maria in Trastevere',
      },
      texto: {
        es: 'No hay metro en Trastevere; la línea 8 de tram (Largo Argentina - Stazione Trastevere) para en la parada Belli, a unos 5 min andando de la plaza.',
        en: "There's no metro in Trastevere; tram line 8 (Largo Argentina - Stazione Trastevere) stops at Belli, about a 5-minute walk from the square.",
        fr: "Il n'y a pas de métro à Trastevere ; la ligne de tram 8 (Largo Argentina - Stazione Trastevere) s'arrête à Belli, à environ 5 min à pied de la place.",
        it: "A Trastevere non c'è la metro; la linea 8 del tram (Largo Argentina - Stazione Trastevere) ferma a Belli, a circa 5 min a piedi dalla piazza.",
      },
      // Fuente: viaggiamo.it — tram 8, parada Belli, a 5 min a pie de la
      // plaza de Santa Maria in Trastevere.
      mapsUrl: mapsUrl('Fermata Belli, Viale di Trastevere, Roma'),
    },
  },

  'florencia-centro': {
    mirador: {
      nombre: {
        es: 'Terrazza de La Rinascente (Piazza della Repubblica)',
        en: 'La Rinascente Terrace (Piazza della Repubblica)',
        fr: 'Terrasse de La Rinascente (Piazza della Repubblica)',
        it: 'Terrazza de La Rinascente (Piazza della Repubblica)',
      },
      texto: {
        es: 'Última planta de los grandes almacenes La Rinascente, a unos 5 min a pie del Duomo. Entrada libre (es un centro comercial) y desde la terraza-café se ve el Duomo y el Campanile de Giotto asomando entre los tejados. Un café en mesa cuesta unos 3€. Abierto de lunes a sábado 9:00-21:00, domingos 10:30-20:00.',
        en: "Top floor of the La Rinascente department store, about 5 min on foot from the Duomo. Free entry (it's a shopping centre) and from the café-terrace you can see the Duomo and Giotto's Campanile peeking above the rooftops. A table coffee costs about €3. Open Monday to Saturday 9am-9pm, Sundays 10:30am-8pm.",
        fr: "Dernier étage du grand magasin La Rinascente, à environ 5 min à pied du Duomo. Entrée libre (c'est un centre commercial) et depuis la terrasse-café, on aperçoit le Duomo et le Campanile de Giotto qui dépassent des toits. Un café en salle coûte environ 3€. Ouvert du lundi au samedi de 9h à 21h, le dimanche de 10h30 à 20h.",
        it: "Ultimo piano dei grandi magazzini La Rinascente, a circa 5 min a piedi dal Duomo. Ingresso libero (è un centro commerciale) e dalla terrazza-caffè si vedono il Duomo e il Campanile di Giotto spuntare tra i tetti. Un caffè al tavolo costa circa 3€. Aperto dal lunedì al sabato 9:00-21:00, domenica 10:30-20:00.",
      },
      // Fuente: verificado con búsquedas (theflorentine.net,
      // visitflorence.com) — terraza en la 5ª planta del edificio Trianon,
      // Piazza della Repubblica, entrada libre, horarios confirmados.
      mapsUrl: mapsUrl('La Rinascente, Piazza della Repubblica, Firenze'),
    },
    comida: {
      nombre: {
        es: 'I Fratellini (I Due Fratellini)',
        en: 'I Fratellini (I Due Fratellini)',
        fr: 'I Fratellini (I Due Fratellini)',
        it: 'I Fratellini (I Due Fratellini)',
      },
      texto: {
        es: 'Via dei Cimatori, 38r, a 2 min de Piazza della Signoria. Un "hueco en la pared" sin mesas desde 1875: panini con embutidos y quesos toscanos, acompañados de un vaso de vino, de pie en la propia calle. Institución fiorentina, no una trampa turística.',
        en: 'Via dei Cimatori, 38r, 2 min from Piazza della Signoria. A tiny hole-in-the-wall with no tables, open since 1875: panini with Tuscan cured meats and cheeses, paired with a glass of wine, eaten standing in the street. A Florentine institution, not a tourist trap.',
        fr: "Via dei Cimatori, 38r, à 2 min de la Piazza della Signoria. Un minuscule comptoir sans tables, ouvert depuis 1875 : panini à la charcuterie et aux fromages toscans, accompagnés d'un verre de vin, à déguster debout dans la rue. Une institution florentine, pas un piège à touristes.",
        it: 'Via dei Cimatori, 38r, a 2 min da Piazza della Signoria. Un piccolo buco nel muro senza tavoli, aperto dal 1875: panini con salumi e formaggi toscani, accompagnati da un bicchiere di vino, in piedi per strada. Un\'istituzione fiorentina, non una trappola per turisti.',
      },
      // Fuente: verificado con búsquedas — origen de 1875 y ubicación en
      // Via dei Cimatori confirmados en varias fuentes independientes.
      // Sin web oficial localizable, se omite el campo `url`.
      mapsUrl: mapsUrl('I Fratellini, Via dei Cimatori 38r, Firenze'),
    },
    movilidad: {
      // Mismo lugar que `puntoPartida` de esta ruta en js/catalogo.js.
      nombre: {
        es: 'Piazza del Duomo (Santa Maria del Fiore)',
        en: 'Piazza del Duomo (Santa Maria del Fiore)',
        fr: 'Piazza del Duomo (Santa Maria del Fiore)',
        it: 'Piazza del Duomo (Santa Maria del Fiore)',
      },
      texto: {
        es: 'El centro histórico es peatonal: son 10 min a pie desde la estación de tren de Santa Maria Novella. El minibús eléctrico línea C1, que recorre el centro, para en Via Roma, a un paso del Duomo.',
        en: "The historic centre is pedestrian: it's a 10-minute walk from Santa Maria Novella train station. The electric minibus line C1, which crosses the centre, stops on Via Roma, right by the Duomo.",
        fr: "Le centre historique est piéton : comptez 10 min à pied depuis la gare de Santa Maria Novella. La navette électrique C1, qui traverse le centre, s'arrête Via Roma, à deux pas du Duomo.",
        it: "Il centro storico è pedonale: sono 10 min a piedi dalla stazione di Santa Maria Novella. Il minibus elettrico linea C1, che attraversa il centro, ferma in Via Roma, a due passi dal Duomo.",
      },
      // Fuente: verificado con búsquedas (at-bus.it, comune.firenze.it) —
      // parada de la línea C1 en Via Roma, cerca del Duomo.
      mapsUrl: mapsUrl('Piazza del Duomo, Firenze'),
    },
  },

  'florencia-santacroce': {
    mirador: {
      nombre: {
        es: 'Piazzale Michelangelo',
        en: 'Piazzale Michelangelo',
        fr: 'Piazzale Michelangelo',
        it: 'Piazzale Michelangelo',
      },
      texto: {
        es: 'El mejor mirador gratuito de Florencia, con el Duomo, Palazzo Vecchio y el Arno de fondo. Desde Piazza Santa Croce hay que cruzar el Ponte alle Grazie y subir la cuesta, unos 25-30 min a pie — queda más lejos, pero merece la pena. Acceso libre, abierto las 24 horas.',
        en: "The best free viewpoint in Florence, with the Duomo, Palazzo Vecchio and the Arno in the background. From Piazza Santa Croce you need to cross the Ponte alle Grazie and climb the hill, about 25-30 min on foot — it's further away, but worth it. Free access, open 24 hours.",
        fr: "Le meilleur point de vue gratuit de Florence, avec le Duomo, le Palazzo Vecchio et l'Arno en toile de fond. Depuis la Piazza Santa Croce, il faut traverser le Ponte alle Grazie et monter la côte, environ 25-30 min à pied — c'est plus loin, mais ça en vaut la peine. Accès libre, ouvert 24h/24.",
        it: "Il miglior punto panoramico gratuito di Firenze, con il Duomo, Palazzo Vecchio e l'Arno sullo sfondo. Da Piazza Santa Croce bisogna attraversare il Ponte alle Grazie e salire la collina, circa 25-30 min a piedi — è più lontano, ma ne vale la pena. Accesso libero, aperto 24 ore su 24.",
      },
      // Fuente: verificado con búsquedas (thetuscanmom.com, alltrails.com) —
      // ruta y tiempo de subida real desde Santa Croce (25-30 min, cuesta),
      // acceso gratuito y sin horario de cierre.
      mapsUrl: mapsUrl('Piazzale Michelangelo, Firenze'),
    },
    comida: {
      nombre: { es: 'Gelateria Vivoli', en: 'Gelateria Vivoli', fr: 'Gelateria Vivoli', it: 'Gelateria Vivoli' },
      texto: {
        es: 'Via Isola delle Stinche, a un par de minutos de Piazza Santa Croce. La heladería artesanal más antigua de Florencia, fundada en 1929-30 por la familia Vivoli y en el mismo local desde entonces, con suelos de terracota y decoración art nouveau originales.',
        en: "Via Isola delle Stinche, a couple of minutes from Piazza Santa Croce. Florence's oldest artisanal gelateria, founded in 1929-30 by the Vivoli family and in the same premises ever since, with original terracotta floors and art nouveau decor.",
        fr: "Via Isola delle Stinche, à quelques minutes de la Piazza Santa Croce. La plus ancienne gelateria artisanale de Florence, fondée en 1929-1930 par la famille Vivoli et installée dans les mêmes murs depuis lors, avec ses sols en terre cuite et sa décoration art nouveau d'origine.",
        it: "Via Isola delle Stinche, a un paio di minuti da Piazza Santa Croce. La gelateria artigianale più antica di Firenze, fondata nel 1929-30 dalla famiglia Vivoli e nello stesso locale da allora, con pavimenti in cotto e decorazioni liberty originali.",
      },
      url: 'https://vivoli.it/en/',
      // Fuente: web oficial (vivoli.it) — fundación 1929-30, mismo local
      // desde entonces, regentada por la misma familia.
      mapsUrl: mapsUrl('Gelateria Vivoli, Via Isola delle Stinche, Firenze'),
    },
    movilidad: {
      // Mismo lugar que `puntoPartida` de esta ruta en js/catalogo.js.
      nombre: {
        es: 'Piazza Santa Croce',
        en: 'Piazza Santa Croce',
        fr: 'Piazza Santa Croce',
        it: 'Piazza Santa Croce',
      },
      texto: {
        es: 'El minibús eléctrico línea C1, que recorre el centro histórico, para directamente en la plaza. A pie, son unos 15 min desde la estación de Santa Maria Novella.',
        en: "The electric minibus line C1, which crosses the historic centre, stops right on the square. On foot, it's about 15 min from Santa Maria Novella station.",
        fr: "La navette électrique C1, qui traverse le centre historique, s'arrête directement sur la place. À pied, comptez environ 15 min depuis la gare de Santa Maria Novella.",
        it: "Il minibus elettrico linea C1, che attraversa il centro storico, ferma direttamente in piazza. A piedi, sono circa 15 min dalla stazione di Santa Maria Novella.",
      },
      // Fuente: verificado con búsquedas (at-bus.it) — parada de la línea
      // C1 en Piazza Santa Croce.
      mapsUrl: mapsUrl('Piazza Santa Croce, Firenze'),
    },
  },

  'berlin-mitte': {
    mirador: {
      nombre: {
        es: 'Kuppel del Deutscher Dom',
        en: 'Deutscher Dom Cupola',
        fr: 'Coupole du Deutscher Dom',
        it: 'Cupola del Deutscher Dom',
      },
      texto: {
        es: 'Es literalmente uno de los dos edificios entre los que arranca la ruta. Entrada gratuita (alberga una exposición permanente del Bundestag sobre la historia del parlamentarismo alemán) y se puede subir hasta la plataforma mirador de la cúpula, a 40 m de altura, con vistas sobre toda la plaza. Abierto de martes a domingo, 10:00-18:00 (hasta las 19:00 de mayo a septiembre), cerrado los lunes.',
        en: "It's literally one of the two buildings the route starts between. Free entry (it houses a permanent Bundestag exhibition on the history of German parliamentarism) and you can climb up to the cupola's viewing platform, 40 m high, with views over the whole square. Open Tuesday to Sunday, 10am-6pm (until 7pm May to September), closed Mondays.",
        fr: "C'est littéralement l'un des deux bâtiments entre lesquels démarre le parcours. Entrée gratuite (il abrite une exposition permanente du Bundestag sur l'histoire du parlementarisme allemand) et on peut monter jusqu'à la plateforme panoramique de la coupole, à 40 m de haut, avec vue sur toute la place. Ouvert du mardi au dimanche, 10h-18h (jusqu'à 19h de mai à septembre), fermé le lundi.",
        it: "È letteralmente uno dei due edifici tra cui parte il percorso. Ingresso gratuito (ospita una mostra permanente del Bundestag sulla storia del parlamentarismo tedesco) e si può salire fino alla piattaforma panoramica della cupola, a 40 m di altezza, con vista su tutta la piazza. Aperto dal martedì alla domenica, 10:00-18:00 (fino alle 19:00 da maggio a settembre), chiuso il lunedì.",
      },
      // Fuente: gendarmenmarkt.de (entrada gratuita, torre "begehbar",
      // plataforma a 40 m) + bundestag.de/besuche/ausstellungen/deutscher_dom.
      // No confundir con el Französischer Dom (el otro edificio de la
      // plaza), cuya torre sí cobra entrada (7€) — descartado por eso.
      mapsUrl: mapsUrl('Deutscher Dom, Gendarmenmarkt, Berlin'),
    },
    comida: {
      nombre: {
        es: 'Lutter & Wegner am Gendarmenmarkt',
        en: 'Lutter & Wegner am Gendarmenmarkt',
        fr: 'Lutter & Wegner am Gendarmenmarkt',
        it: 'Lutter & Wegner am Gendarmenmarkt',
      },
      texto: {
        es: 'Charlottenstraße 56, en la propia plaza. Vinoteca-restaurante desde 1811, cuna del uso alemán de la palabra "Sekt" para el vino espumoso y antiguo punto de encuentro de E.T.A. Hoffmann, que vivía justo al lado; hoy sirve cocina alemana-austriaca con una carta de más de 750 vinos.',
        en: 'Charlottenstraße 56, right on the square. A wine-bar-restaurant since 1811, birthplace of the German use of the word "Sekt" for sparkling wine and once a meeting place for E.T.A. Hoffmann, who lived right next door; today it serves German-Austrian cuisine with a wine list of over 750 bottles.',
        fr: 'Charlottenstraße 56, sur la place même. Bar à vins-restaurant depuis 1811, berceau de l\'usage allemand du mot « Sekt » pour le vin mousseux et ancien lieu de rendez-vous d\'E.T.A. Hoffmann, qui vivait juste à côté ; aujourd\'hui, cuisine allemande-autrichienne avec une carte de plus de 750 vins.',
        it: 'Charlottenstraße 56, sulla piazza stessa. Enoteca-ristorante dal 1811, culla dell\'uso tedesco della parola "Sekt" per il vino spumante e antico luogo d\'incontro di E.T.A. Hoffmann, che viveva proprio accanto; oggi serve cucina tedesco-austriaca con una carta di oltre 750 vini.',
      },
      // Fuente: l-w-berlin.de/geschichte (historia oficial: fundación 1811,
      // vínculo con E.T.A. Hoffmann) + gendarmenmarkt.de (dirección en la
      // propia plaza).
      url: 'https://l-w-berlin.de/',
      mapsUrl: mapsUrl('Lutter & Wegner, Charlottenstraße 56, Berlin'),
    },
    movilidad: {
      // Mismo lugar que `puntoPartida` de esta ruta en js/catalogo.js.
      nombre: {
        es: 'U Stadtmitte (U2 / U6)',
        en: 'U Stadtmitte (U2 / U6)',
        fr: 'U Stadtmitte (U2 / U6)',
        it: 'U Stadtmitte (U2 / U6)',
      },
      texto: {
        es: 'A unos 5 minutos a pie de Gendarmenmarkt, es el intercambiador más cercano con dos líneas de metro.',
        en: "About a 5-minute walk from Gendarmenmarkt, it's the nearest interchange with two U-Bahn lines.",
        fr: "À environ 5 minutes à pied du Gendarmenmarkt, c'est la correspondance la plus proche avec deux lignes de métro.",
        it: "A circa 5 minuti a piedi dal Gendarmenmarkt, è l'interscambio più vicino con due linee della metropolitana.",
      },
      // Fuente: verificado por búsqueda de distancias reales a
      // Gendarmenmarkt (Stadtmitte ~360 m / 5 min).
      mapsUrl: mapsUrl('U Stadtmitte, Berlin'),
    },
  },

  'istanbul-sultanahmet': {
    mirador: {
      nombre: { es: 'Gülhane Park', en: 'Gülhane Park', fr: 'Parc Gülhane', it: 'Gülhane Park' },
      texto: {
        es: 'Parque público gratuito justo detrás de Topkapı, a 5-10 min a pie de la plaza (entrada por Alay Köşkü). En el extremo noreste hay terrazas elevadas con vistas panorámicas a la confluencia del Bósforo, el Cuerno de Oro y el mar de Mármara — el mismo mirador que usaban los sultanes otomanos. Acceso 100% libre.',
        en: 'A free public park right behind Topkapı, 5-10 min on foot from the square (enter via Alay Köşkü). At the northeastern end there are raised terraces with panoramic views over where the Bosphorus, the Golden Horn and the Sea of Marmara meet — the very same viewpoint the Ottoman sultans used. 100% free access.',
        fr: "Parc public gratuit juste derrière Topkapı, à 5-10 min à pied de la place (entrée par Alay Köşkü). À l'extrémité nord-est se trouvent des terrasses surélevées avec vue panoramique sur la confluence du Bosphore, de la Corne d'Or et de la mer de Marmara — le même point de vue qu'utilisaient les sultans ottomans. Accès 100% libre.",
        it: 'Parco pubblico gratuito proprio dietro Topkapı, a 5-10 min a piedi dalla piazza (ingresso da Alay Köşkü). All\'estremità nord-orientale ci sono terrazze rialzate con vista panoramica sulla confluenza del Bosforo, del Corno d\'Oro e del Mar di Marmara — lo stesso punto panoramico usato dai sultani ottomani. Accesso 100% libero.',
      },
      // Fuente: verificado con búsquedas (Lonely Planet, Cornucopia) —
      // entrada pública gratuita y terrazas en el extremo noreste con
      // vistas al Bósforo/Cuerno de Oro.
      mapsUrl: mapsUrl('Gülhane Park, Istanbul'),
    },
    comida: {
      nombre: {
        es: 'Tarihi Sultanahmet Köftecisi',
        en: 'Tarihi Sultanahmet Köftecisi',
        fr: 'Tarihi Sultanahmet Köftecisi',
        it: 'Tarihi Sultanahmet Köftecisi',
      },
      texto: {
        es: 'Divan Yolu Caddesi, 12, a unos 400 m de la plaza. Köftecisi histórico fundado en 1920, regentado por la misma familia desde 1964. Sirven solo köfte de carne a la parrilla sin especias ni aditivos, con piyaz (ensalada de alubias) — un clásico local, no una trampa turística.',
        en: "Divan Yolu Caddesi, 12, about 400 m from the square. A historic köfte house founded in 1920, run by the same family since 1964. They serve just grilled beef köfte with no spices or additives, with piyaz (bean salad) on the side — a local classic, not a tourist trap.",
        fr: "Divan Yolu Caddesi, 12, à environ 400 m de la place. Rôtisserie de köfte historique fondée en 1920, tenue par la même famille depuis 1964. On y sert uniquement du köfte de bœuf grillé sans épices ni additifs, accompagné de piyaz (salade de haricots) — un classique local, pas un piège à touristes.",
        it: "Divan Yolu Caddesi, 12, a circa 400 m dalla piazza. Storica köfteria fondata nel 1920, gestita dalla stessa famiglia dal 1964. Servono solo köfte di manzo alla griglia senza spezie né additivi, con piyaz (insalata di fagioli) — un classico locale, non una trappola per turisti.",
      },
      url: 'https://sultanahmetkoftesi.com/',
      // Fuente: web oficial del restaurante (sultanahmetkoftesi.com/en/about-us)
      // — fundación en 1920, historia familiar.
      mapsUrl: mapsUrl('Tarihi Sultanahmet Köftecisi, Divan Yolu Caddesi 12, Istanbul'),
    },
    movilidad: {
      // Mismo lugar que `puntoPartida` de esta ruta en js/catalogo.js.
      nombre: {
        es: 'Plaza de Sultanahmet',
        en: 'Sultanahmet Square',
        fr: 'Place de Sultanahmet',
        it: 'Piazza Sultanahmet',
      },
      texto: {
        es: 'Parada "Sultanahmet" del tranvía línea T1 (Kabataş-Bağcılar), la más concurrida de toda la línea, a un par de minutos a pie de la plaza.',
        en: 'The "Sultanahmet" stop on tram line T1 (Kabataş-Bağcılar), the busiest on the whole line, a couple of minutes on foot from the square.',
        fr: 'Arrêt « Sultanahmet » du tramway T1 (Kabataş-Bağcılar), le plus fréquenté de toute la ligne, à quelques minutes à pied de la place.',
        it: 'Fermata "Sultanahmet" della linea tranviaria T1 (Kabataş-Bağcılar), la più trafficata di tutta la linea, a un paio di minuti a piedi dalla piazza.',
      },
      // Fuente: metro.istanbul (página oficial de la línea T1) — parada
      // "Sultanahmet" sirve directamente esta plaza.
      mapsUrl: mapsUrl('Sultanahmet Tram Station, Istanbul'),
    },
  },

  'napoles-spaccanapoli': {
    // Sin mirador: la única terraza gratis cercana al Duomo ("500 Cupole",
    // sobre los tejados de la Catedral) es en realidad de pago (10€, gratis
    // solo para residentes/menores de 6). Los miradores gratis de verdad
    // (Certosa di San Martino, Castel Sant'Elmo) están en el Vomero, a
    // 30-40 min — demasiado lejos para presentarlos como "cerca de la ruta".
    // Se omite el campo antes que forzar algo engañoso.
    comida: {
      nombre: {
        es: 'Pasticceria Scaturchio',
        en: 'Pasticceria Scaturchio',
        fr: 'Pasticceria Scaturchio',
        it: 'Pasticceria Scaturchio',
      },
      texto: {
        es: 'Piazza San Domenico Maggiore, 19, a unos 8 min a pie desde el Duomo, dentro del propio recorrido de Spaccanapoli. Pastelería histórica desde 1903, célebre por el "ministeriale" (bombón de chocolate negro relleno de crema, inventado aquí) y por su sfogliatella. Abierta todos los días.',
        en: 'Piazza San Domenico Maggiore, 19, about 8 min on foot from the Duomo, right along the Spaccanapoli route. A historic pastry shop since 1903, famous for the "ministeriale" (a dark chocolate, cream-filled bonbon invented here) and its sfogliatella. Open every day.',
        fr: 'Piazza San Domenico Maggiore, 19, à environ 8 min à pied du Duomo, sur le tracé même de Spaccanapoli. Pâtisserie historique depuis 1903, célèbre pour le "ministeriale" (bonbon au chocolat noir fourré de crème, inventé ici) et sa sfogliatella. Ouvert tous les jours.',
        it: 'Piazza San Domenico Maggiore, 19, a circa 8 min a piedi dal Duomo, proprio lungo il percorso di Spaccanapoli. Pasticceria storica dal 1903, celebre per il "ministeriale" (cioccolatino al cioccolato fondente ripieno di crema, inventato qui) e per la sua sfogliatella. Aperta tutti i giorni.',
      },
      // Fuente: scaturchio.it/storia (fundación 1903, origen del
      // "ministeriale"); dirección confirmada en Piazza San Domenico
      // Maggiore 19, Napoli.
      url: 'https://scaturchio.it/',
      mapsUrl: mapsUrl('Scaturchio, Piazza San Domenico Maggiore 19, Napoli'),
    },
    movilidad: {
      // Mismo lugar que `puntoPartida` de esta ruta en js/catalogo.js.
      nombre: {
        es: 'Piazza Duomo (Cattedrale di San Gennaro)',
        en: 'Piazza Duomo (Cattedrale di San Gennaro)',
        fr: 'Piazza Duomo (Cattedrale di San Gennaro)',
        it: 'Piazza Duomo (Cattedrale di San Gennaro)',
      },
      texto: {
        es: 'Estación Duomo de la Metro Línea 1 (morada), con salida directa a Via Duomo, a un par de minutos de la fachada de la Catedral.',
        en: 'Duomo station on Metro Line 1 (purple), with an exit straight onto Via Duomo, a couple of minutes from the Cathedral façade.',
        fr: 'Station Duomo de la ligne 1 du métro (violette), avec une sortie directe sur Via Duomo, à quelques minutes de la façade de la cathédrale.',
        it: 'Stazione Duomo della Metro Linea 1 (viola), con uscita diretta su Via Duomo, a un paio di minuti dalla facciata della Cattedrale.',
      },
      // Fuente: metrodinapoli.it/linea-1/metro-duomo/ — confirma que la
      // parada Duomo (L1) es la más cercana a la Catedral.
      mapsUrl: mapsUrl('Stazione Duomo, Metro Linea 1, Napoli'),
    },
  },
};

/**
 * Pases oficiales por ciudad (`ciudadSlug` de js/catalogo.js). Solo pases
 * verificados en la web oficial del operador — nunca revendedores.
 */
export const PASES_POR_CIUDAD = {
  napoles: [
    {
      nombre: {
        es: 'Campania Artecard (Napoli 3 giorni)',
        en: 'Campania Artecard (Napoli 3 giorni)',
        fr: 'Campania Artecard (Napoli 3 giorni)',
        it: 'Campania Artecard (Napoli 3 giorni)',
      },
      texto: {
        es: 'El pase turístico oficial de la Región Campania para visitar más de 80 lugares de arte y cultura en Nápoles y alrededores, incluido el Museo Archeologico Nazionale. La versión "Napoli 3 giorni" cuesta 27€ (16€ de 18 a 25 años) e incluye 3 entradas gratuitas a elegir, más transporte público UnicoCampania ilimitado (bus, tranvía, funiculares, Metro Línea 1 y 6) durante 3 días.',
        en: 'The official tourist pass of the Campania Region for visiting more than 80 art and culture sites in and around Naples, including the Museo Archeologico Nazionale. The "Napoli 3 giorni" version costs €27 (€16 for ages 18-25) and includes 3 free entries of your choice, plus unlimited UnicoCampania public transport (bus, tram, funiculars, Metro Line 1 and 6) for 3 days.',
        fr: "Le pass touristique officiel de la Région Campanie pour visiter plus de 80 sites d'art et de culture à Naples et ses environs, dont le Museo Archeologico Nazionale. La version « Napoli 3 giorni » coûte 27€ (16€ de 18 à 25 ans) et inclut 3 entrées gratuites au choix, plus les transports publics UnicoCampania illimités (bus, tram, funiculaires, métro lignes 1 et 6) pendant 3 jours.",
        it: 'Il pass turistico ufficiale della Regione Campania per visitare più di 80 luoghi d\'arte e cultura a Napoli e dintorni, incluso il Museo Archeologico Nazionale. La versione "Napoli 3 giorni" costa 27€ (16€ dai 18 ai 25 anni) e include 3 ingressi gratuiti a scelta, più il trasporto pubblico UnicoCampania illimitato (bus, tram, funicolari, Metro Linea 1 e 6) per 3 giorni.',
      },
      url: 'https://www.campaniartecard.it/',
      // Fuente: campaniartecard.it (sitio oficial, gestionado por Scabec,
      // empresa de la Región Campania) — precios y cobertura cruzados con
      // scabec.it/progetti/campania-artecard.
    },
  ],

  roma: [
    {
      nombre: { es: 'Roma Pass', en: 'Roma Pass', fr: 'Roma Pass', it: 'Roma Pass' },
      texto: {
        es: 'Tarjeta turística oficial de Roma Capitale: dos versiones, 48h (38€, con 1 entrada gratis a museo o monumento) o 72h (62,90€, con 2 entradas gratis), más transporte público ilimitado (metro, tram, bus) durante toda su validez. Se activa sola al primer uso, y da descuento en más de 100 museos y monumentos — el Vaticano NO está incluido, requiere entrada aparte.',
        en: "The official tourist card of Roma Capitale: two versions, 48h (€38, with 1 free entry to a museum or monument) or 72h (€62.90, with 2 free entries), plus unlimited public transport (metro, tram, bus) for its whole validity. It activates itself on first use, and gives a discount at over 100 museums and monuments — the Vatican is NOT included, it requires a separate ticket.",
        fr: "La carte touristique officielle de Roma Capitale : deux versions, 48h (38€, avec 1 entrée gratuite dans un musée ou monument) ou 72h (62,90€, avec 2 entrées gratuites), plus les transports publics illimités (métro, tram, bus) pendant toute sa validité. Elle s'active seule à la première utilisation, et donne une réduction dans plus de 100 musées et monuments — le Vatican n'est PAS inclus, il faut un billet à part.",
        it: "La tessera turistica ufficiale di Roma Capitale: due versioni, 48h (38€, con 1 ingresso gratuito a museo o monumento) o 72h (62,90€, con 2 ingressi gratuiti), più trasporto pubblico illimitato (metro, tram, bus) per tutta la sua validità. Si attiva da sola al primo utilizzo, e dà sconto in più di 100 musei e monumenti — il Vaticano NON è incluso, richiede un biglietto a parte.",
      },
      url: 'https://www.turismoroma.it/en/page/roma-pass',
      // Fuente: turismoroma.it (portal oficial de turismo de Roma
      // Capitale) — precios y cobertura confirmados directamente.
    },
  ],

  florencia: [
    {
      nombre: { es: 'Firenze Card', en: 'Firenze Card', fr: 'Firenze Card', it: 'Firenze Card' },
      texto: {
        es: 'El pase turístico oficial de la ciudad de Florencia: acceso a más de 70 museos y monumentos (Uffizi, Galleria dell\'Accademia, Palazzo Pitti, Boboli, Bargello, Capillas Medici...) una sola vez cada uno, con cola prioritaria. Cuesta 85€, válida 72h desde el primer uso, y es gratuita para menores de 18 años del mismo grupo familiar.',
        en: "The official tourist pass of the city of Florence: access to over 70 museums and monuments (Uffizi, Galleria dell'Accademia, Palazzo Pitti, Boboli, Bargello, Medici Chapels...), once each, with priority queuing. It costs €85, is valid for 72h from first use, and is free for under-18s in the same family group.",
        fr: "Le pass touristique officiel de la ville de Florence : accès à plus de 70 musées et monuments (Uffizi, Galleria dell'Accademia, Palazzo Pitti, Boboli, Bargello, chapelles Médicis...), une fois chacun, avec file prioritaire. Il coûte 85€, valable 72h à partir de la première utilisation, et gratuit pour les moins de 18 ans du même groupe familial.",
        it: 'Il pass turistico ufficiale della città di Firenze: accesso a oltre 70 musei e monumenti (Uffizi, Galleria dell\'Accademia, Palazzo Pitti, Boboli, Bargello, Cappelle Medicee...), una volta ciascuno, con accesso prioritario. Costa 85€, valido 72h dal primo utilizzo, ed è gratuito per i minori di 18 anni dello stesso nucleo familiare.',
      },
      url: 'https://www.firenzecard.it/en',
      // Fuente: firenzecard.it (sitio oficial). Precio y condiciones
      // confirmados también en feelflorence.it (portal oficial de turismo
      // de Florencia).
    },
  ],

  istanbul: [
    {
      nombre: {
        es: 'Museum Pass İstanbul',
        en: 'Museum Pass İstanbul',
        fr: 'Museum Pass İstanbul',
        it: 'Museum Pass İstanbul',
      },
      texto: {
        es: 'Pase oficial emitido por el Ministerio de Cultura y Turismo de Turquía. Válido 5 días consecutivos desde el primer uso y da una entrada gratuita a más de 10 museos y sitios estatales de Estambul — incluye Topkapı + Harem, los Museos Arqueológicos, Kariye (Chora) y el Hagia Sophia History and Experience Museum (no incluye la sala de oración de Santa Sofía, que es gratis y aparte). Precio de referencia: en torno a 105€.',
        en: 'An official pass issued by the Turkish Ministry of Culture and Tourism. Valid for 5 consecutive days from first use, giving one free entry to more than 10 museums and state sites in Istanbul — including Topkapı + Harem, the Archaeological Museums, Kariye (Chora) and the Hagia Sophia History and Experience Museum (it does not include the Hagia Sophia prayer hall, which is free and separate). Reference price: around €105.',
        fr: "Pass officiel délivré par le ministère turc de la Culture et du Tourisme. Valable 5 jours consécutifs à partir de la première utilisation, il donne une entrée gratuite dans plus de 10 musées et sites d'État d'Istanbul — dont Topkapı + Harem, les musées archéologiques, Kariye (Chora) et le Hagia Sophia History and Experience Museum (n'inclut pas la salle de prière de Sainte-Sophie, gratuite et à part). Prix de référence : environ 105€.",
        it: "Pass ufficiale emesso dal Ministero della Cultura e del Turismo turco. Valido 5 giorni consecutivi dal primo utilizzo e dà un ingresso gratuito a più di 10 musei e siti statali di Istanbul — incluso Topkapı + Harem, i Musei Archeologici, Kariye (Chora) e l'Hagia Sophia History and Experience Museum (non include la sala di preghiera di Santa Sofia, che è gratuita e separata). Prezzo di riferimento: circa 105€.",
      },
      url: 'https://muze.gov.tr/',
      // Fuente: muze.gov.tr (sitio oficial del Ministerio de Cultura y
      // Turismo). Se descartó deliberadamente el "Istanbul Tourist Pass"
      // (istanbultouristpass.com): es un producto comercial privado de una
      // empresa (Cityberry), no un pase oficial — no encaja con el criterio
      // de "solo pases oficiales".
    },
  ],

  berlin: [
    {
      nombre: {
        es: 'Berlin WelcomeCard',
        en: 'Berlin WelcomeCard',
        fr: 'Berlin WelcomeCard',
        it: 'Berlin WelcomeCard',
      },
      texto: {
        es: 'El pase turístico oficial de visitBerlin: transporte público ilimitado en las zonas elegidas (AB o ABC) más hasta un 50% de descuento en más de 170 atracciones, museos y tours. La versión con transporte va desde 28,50€ (48h, zona AB) hasta 58,50€ (6 días); también hay una versión solo de descuentos, sin transporte, desde 10€ (72h).',
        en: "visitBerlin's official tourist pass: unlimited public transport in the chosen zones (AB or ABC) plus up to 50% off more than 170 attractions, museums and tours. The version with transport ranges from €28.50 (48h, zone AB) to €58.50 (6 days); there's also a discounts-only version, without transport, from €10 (72h).",
        fr: "Le pass touristique officiel de visitBerlin : transports publics illimités dans les zones choisies (AB ou ABC) plus jusqu'à 50% de réduction sur plus de 170 attractions, musées et visites. La version avec transports va de 28,50€ (48h, zone AB) à 58,50€ (6 jours) ; il existe aussi une version réductions uniquement, sans transports, à partir de 10€ (72h).",
        it: "Il pass turistico ufficiale di visitBerlin: trasporto pubblico illimitato nelle zone scelte (AB o ABC) più fino al 50% di sconto su oltre 170 attrazioni, musei e tour. La versione con trasporto va da 28,50€ (48h, zona AB) a 58,50€ (6 giorni); esiste anche una versione solo sconti, senza trasporto, da 10€ (72h).",
      },
      url: 'https://www.visitberlin.de/en/berlin-welcome-card',
      // Fuente: visitberlin.de/en/berlin-welcome-card (página oficial),
      // emisor visitBerlin, la oficina oficial de turismo de la ciudad.
    },
  ],

  lisboa: [
    {
      nombre: { es: 'Lisboa Card', en: 'Lisboa Card', fr: 'Lisboa Card', it: 'Lisboa Card' },
      texto: {
        es: 'Transporte público ilimitado (metro, autobuses, tranvías, elevadores y algunos trenes como Sintra-Rossio o Cascais-Cais do Sodré) + entrada gratuita a más de 50 museos y monumentos (Castelo de São Jorge, Torre de Belém, Mosteiro dos Jerónimos...) y descuentos adicionales. Emitida por Turismo de Lisboa, en versiones de 24h, 48h o 72h (62€), activa desde el primer uso.',
        en: 'Unlimited public transport (metro, buses, trams, funiculars and some trains such as Sintra-Rossio or Cascais-Cais do Sodré) + free entry to more than 50 museums and monuments (Castelo de São Jorge, Torre de Belém, Mosteiro dos Jerónimos...) and further discounts. Issued by Turismo de Lisboa, in 24h, 48h or 72h (€62) versions, active from first use.',
        fr: "Transports publics illimités (métro, bus, tramways, funiculaires et certains trains comme Sintra-Rossio ou Cascais-Cais do Sodré) + entrée gratuite dans plus de 50 musées et monuments (Castelo de São Jorge, Torre de Belém, Mosteiro dos Jerónimos...) et réductions supplémentaires. Délivrée par Turismo de Lisboa, en versions 24h, 48h ou 72h (62€), active dès la première utilisation.",
        it: 'Trasporto pubblico illimitato (metro, autobus, tram, funicolari e alcuni treni come Sintra-Rossio o Cascais-Cais do Sodré) + ingresso gratuito a più di 50 musei e monumenti (Castelo de São Jorge, Torre de Belém, Mosteiro dos Jerónimos...) e ulteriori sconti. Emessa da Turismo de Lisboa, in versioni da 24h, 48h o 72h (62€), attiva dal primo utilizzo.',
      },
      url: 'https://shop.visitlisboa.com/products/lisboa-card',
      // Fuente: visitlisboa.com/en/p/lisboa-card (emisor oficial: Turismo
      // de Lisboa) + shop.visitlisboa.com/products/lisboa-card (precio 72h
      // confirmado directamente: 62€). Cuidado al buscar: existen dominios
      // parecidos (lisboa-card.com, lisboncard.com...) que NO son oficiales.
    },
  ],

  paris: [
    {
      nombre: {
        es: "Paris Passlib'",
        en: "Paris Passlib'",
        fr: "Paris Passlib'",
        it: "Paris Passlib'",
      },
      texto: {
        es: 'El pase turístico oficial de Paris je t\'aime – Office du Tourisme de Paris, 100% digital. Tres niveles: Discover (59€, 3 días, 3 actividades a elegir), City (109€, 5 días, 5 actividades) y Explore (179€, 10 días, 6 actividades), entre museos (Louvre, Orsay, Centre Pompidou), monumentos (Arco del Triunfo, Panteón, 2º piso de la Torre Eiffel), cruceros por el Sena y visitas guiadas. No incluye transporte público.',
        en: "The official tourist pass of Paris je t'aime – Office du Tourisme de Paris, 100% digital. Three tiers: Discover (€59, 3 days, 3 activities of your choice), City (€109, 5 days, 5 activities) and Explore (€179, 10 days, 6 activities), covering museums (Louvre, Orsay, Centre Pompidou), monuments (Arc de Triomphe, Panthéon, 2nd floor of the Eiffel Tower), Seine river cruises and guided tours. Does not include public transport.",
        fr: "Le pass touristique officiel de Paris je t'aime – Office du Tourisme de Paris, 100% digital. Trois niveaux : Discover (59€, 3 jours, 3 activités au choix), City (109€, 5 jours, 5 activités) et Explore (179€, 10 jours, 6 activités), entre musées (Louvre, Orsay, Centre Pompidou), monuments (Arc de Triomphe, Panthéon, 2e étage de la tour Eiffel), croisières sur la Seine et visites guidées. N'inclut pas les transports publics.",
        it: "Il pass turistico ufficiale di Paris je t'aime – Office du Tourisme de Paris, 100% digitale. Tre livelli: Discover (59€, 3 giorni, 3 attività a scelta), City (109€, 5 giorni, 5 attività) ed Explore (179€, 10 giorni, 6 attività), tra musei (Louvre, Orsay, Centre Pompidou), monumenti (Arco di Trionfo, Panthéon, 2° piano della Torre Eiffel), crociere sulla Senna e visite guidate. Non include il trasporto pubblico.",
      },
      url: 'https://parisjetaime.com/eng/article/paris-passlib-a978',
      // Fuente: parisjetaime.com (Office de Tourisme de Paris oficial) —
      // página del Passlib; precios/duraciones verificados vía
      // sortiraparis.com. El pase cubre actividades/entradas, no incluye
      // billete de transporte (RATP).
    },
  ],

  barcelona: [
    {
      nombre: {
        es: 'Hola Barcelona Travel Card',
        en: 'Hola Barcelona Travel Card',
        fr: 'Hola Barcelona Travel Card',
        it: 'Hola Barcelona Travel Card',
      },
      texto: {
        es: 'Transporte público ilimitado (metro, bus, FGC, Rodalies zona 1) durante 24 a 120 horas. El pase turístico oficial de TMB.',
        en: "Unlimited public transport (metro, bus, FGC, Rodalies zone 1) for 24 to 120 hours. TMB's official tourist pass.",
        fr: "Transports publics illimités (métro, bus, FGC, Rodalies zone 1) pendant 24 à 120 heures. Le pass touristique officiel de TMB.",
        it: "Trasporto pubblico illimitato (metro, bus, FGC, Rodalies zona 1) da 24 a 120 ore. Il pass turistico ufficiale di TMB.",
      },
      url: 'https://www.tmb.cat/en/barcelona-fares-metro-bus/tickets-visit-barcelona/barcelona-travel-card-hola-bcn',
    },
    {
      nombre: { es: 'Articket BCN', en: 'Articket BCN', fr: 'Articket BCN', it: 'Articket BCN' },
      texto: {
        es: 'Una entrada para 6 museos (Picasso, MNAC, MACBA, CCCB, Fundació Miró, Fundació Tàpies) sin colas, con ahorro sobre el precio suelto.',
        en: 'One ticket for 6 museums (Picasso, MNAC, MACBA, CCCB, Fundació Miró, Fundació Tàpies) with no queuing, at a saving over individual admission.',
        fr: 'Un seul billet pour 6 musées (Picasso, MNAC, MACBA, CCCB, Fundació Miró, Fundació Tàpies) sans faire la queue, avec une économie par rapport au prix individuel.',
        it: 'Un unico biglietto per 6 musei (Picasso, MNAC, MACBA, CCCB, Fundació Miró, Fundació Tàpies) senza fare la coda, con un risparmio rispetto al prezzo singolo.',
      },
      url: 'https://articketbcn.org',
    },
    {
      nombre: { es: 'Barcelona Card', en: 'Barcelona Card', fr: 'Barcelona Card', it: 'Barcelona Card' },
      texto: {
        es: 'Transporte ilimitado + entrada a más de 25 museos y monumentos + descuentos, emitida por Turisme de Barcelona (el consorcio oficial del ayuntamiento).',
        en: 'Unlimited transport + entry to more than 25 museums and monuments + discounts, issued by Turisme de Barcelona (the city council\'s official consortium).',
        fr: "Transports illimités + entrée dans plus de 25 musées et monuments + réductions, délivrée par Turisme de Barcelona (le consortium officiel de la mairie).",
        it: "Trasporto illimitato + ingresso a più di 25 musei e monumenti + sconti, emessa da Turisme de Barcelona (il consorzio ufficiale del comune).",
      },
      url: 'https://thisisbarcelona.com/tickets/barcelona-card',
    },
  ],

  toulouse: [
    {
      nombre: { es: 'Pass Tourisme', en: 'Pass Tourisme', fr: 'Pass Tourisme', it: 'Pass Tourisme' },
      texto: {
        es: 'Entrada a 13 museos y monumentos (Museo de Historia Natural, Museo de Bellas Artes, Convento de los Jacobinos...), una visita guiada gratis a elegir y un billete de 10 viajes con tarifa reducida en metro, tranvía y bus. Válido 24h, 48h o 72h, emitido por la Oficina de Turismo de Toulouse.',
        en: 'Entry to 13 museums and monuments (the Natural History Museum, the Fine Arts Museum, the Couvent des Jacobins...), one free guided tour of your choice, and a 10-trip ticket at a reduced fare on metro, tram and bus. Valid for 24h, 48h or 72h, issued by the Toulouse Tourist Office.',
        fr: "Entrée dans 13 musées et monuments (le Muséum d'Histoire Naturelle, le Musée des Augustins, le Couvent des Jacobins...), une visite guidée gratuite au choix et un carnet de 10 voyages à tarif réduit en métro, tramway et bus. Valable 24h, 48h ou 72h, délivré par l'Office de Tourisme de Toulouse.",
        it: "Ingresso a 13 musei e monumenti (il Museo di Storia Naturale, il Museo delle Belle Arti, il Convento dei Giacobini...), una visita guidata gratuita a scelta e un biglietto da 10 corse a tariffa ridotta su metro, tram e bus. Valido 24h, 48h o 72h, emesso dall'Ufficio del Turismo di Tolosa.",
      },
      url: 'https://www.toulouse-tourisme.com/en/what-to-see-and-do/pass-tourisme/',
      // Fuente: web oficial de Toulouse Tourisme (toulouse-tourisme.com),
      // el organismo oficial de turismo de la ciudad — mismo criterio que
      // Barcelona Card (consorcio oficial, no revendedor).
    },
  ],

  madrid: [
    {
      nombre: { es: 'Madrid City Card', en: 'Madrid City Card', fr: 'Madrid City Card', it: 'Madrid City Card' },
      texto: {
        es: 'Transporte ilimitado (bus EMT y metro zona A) + entrada gratis o con descuento a museos como el Prado, el Reina Sofía o el Thyssen, además de acceso sin colas a varias atracciones. Emitida por el Ayuntamiento de Madrid, válida de 1 a 5 días.',
        en: "Unlimited transport (EMT bus and zone A metro) + free or discounted entry to museums such as the Prado, the Reina Sofía or the Thyssen, plus skip-the-line access to several attractions. Issued by the Madrid City Council, valid for 1 to 5 days.",
        fr: "Transports illimités (bus EMT et métro zone A) + entrée gratuite ou à tarif réduit dans des musées comme le Prado, le Reina Sofía ou le Thyssen, ainsi qu'un accès coupe-file à plusieurs attractions. Délivrée par la Mairie de Madrid, valable de 1 à 5 jours.",
        it: "Trasporto illimitato (bus EMT e metro zona A) + ingresso gratuito o scontato a musei come il Prado, il Reina Sofía o il Thyssen, oltre all'accesso prioritario a diverse attrazioni. Emessa dal Comune di Madrid, valida da 1 a 5 giorni.",
      },
      url: 'https://citycard.esmadrid.com/',
      // Fuente: web oficial (citycard.esmadrid.com), la tarjeta turística
      // del Ayuntamiento de Madrid a través de Madrid Destino — mismo
      // criterio que Barcelona Card (consorcio oficial, no revendedor).
    },
  ],

  valencia: [
    {
      nombre: {
        es: 'Valencia Tourist Card',
        en: 'Valencia Tourist Card',
        fr: 'Valencia Tourist Card',
        it: 'Valencia Tourist Card',
      },
      texto: {
        es: 'Transporte ilimitado (EMT, metro, tranvía, Metrobus y Cercanías, incluido el trayecto al aeropuerto) + entrada gratis a museos y monumentos municipales — entre ellos la propia Lonja de la Seda y las Torres de Serranos — más descuentos en atracciones como la Ciudad de las Artes y las Ciencias. Válida 24h, 48h o 72h.',
        en: "Unlimited transport (EMT, metro, tram, Metrobus and Cercanías, including the airport route) + free entry to municipal museums and monuments — including the Lonja de la Seda and the Torres de Serranos themselves — plus discounts at attractions such as the City of Arts and Sciences. Valid for 24h, 48h or 72h.",
        fr: "Transports illimités (EMT, métro, tramway, Metrobus et Cercanías, y compris la liaison avec l'aéroport) + entrée gratuite dans les musées et monuments municipaux — dont la Lonja de la Seda et les Torres de Serranos elles-mêmes — plus des réductions sur des attractions comme la Cité des Arts et des Sciences. Valable 24h, 48h ou 72h.",
        it: "Trasporto illimitato (EMT, metro, tram, Metrobus e Cercanías, incluso il tragitto per l'aeroporto) + ingresso gratuito a musei e monumenti comunali — tra cui la stessa Lonja de la Seda e le Torres de Serranos — più sconti su attrazioni come la Città delle Arti e delle Scienze. Valida 24h, 48h o 72h.",
      },
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

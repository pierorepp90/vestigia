// js/catalogo.js
//
// Catálogo PÚBLICO del sitio: todo lo que hay aquí se sirve como archivo
// estático y puede leerlo cualquiera. Por eso nunca contiene enigmas,
// respuestas ni pistas — eso vive en worker/src/contenido/ y solo se entrega
// con un token de compra válido (ver docs/superpowers/specs).
//
// Los precios de aquí son de ESCAPARATE. El cobro real lo decide siempre
// worker/src/precios.js; un test de tests/precios.test.js falla si un precio
// de escaparate y el precio de cobro no coinciden exactamente.
//
// Los campos de texto que ve el visitante (pais, nombre, resumen, titulo,
// acertijoMuestra, puntoPartida) están en los 4 idiomas — { es, en, fr, it }
// — y se leen con localizar(). `zona` es la excepción deliberada: son
// nombres de lugar (Piazza Navona, Le Marais) que no se traducen, igual que
// hace cualquier guía turística.

/** @typedef {'facil'|'media'|'dificil'} Dificultad */

export const DIFICULTADES = /** @type {const} */ (['facil', 'media', 'dificil']);

/** Precio de escaparate por nivel de dificultad — la única tabla que decide
 * cuánto cuesta cada ruta. worker/src/precios.js importa esta misma
 * constante para cobrar exactamente lo que aquí se muestra: catálogo y
 * cobro no pueden desincronizarse porque son, literalmente, el mismo dato. */
export const PRECIOS_POR_DIFICULTAD = {
  facil: { importe: 0, moneda: 'EUR' },
  media: { importe: 4.99, moneda: 'EUR' },
  dificil: { importe: 7.99, moneda: 'EUR' },
};

/** Devuelve `campo[lang]`, cayendo a español si falta esa traducción. */
export function localizar(campo, lang) {
  if (campo == null) return '';
  if (typeof campo === 'string') return campo; // valores no traducidos (p. ej. `zona`)
  return campo[lang] ?? campo.es ?? '';
}

/**
 * Ciudades del catálogo. Las que tienen `activa: false` se muestran en la
 * portada como «próximamente»: aparecen, pero no enlazan a ninguna ficha.
 */
export const CIUDADES = [
  {
    slug: 'barcelona',
    activa: true,
    imgHero: 'assets/img/ciudades/barcelona-hero.webp',
    imgCard: 'assets/img/ciudades/barcelona-card.webp',
    pais: { es: 'España', en: 'Spain', fr: 'Espagne', it: 'Spagna' },
    nombre: { es: 'Barcelona', en: 'Barcelona', fr: 'Barcelone', it: 'Barcellona' },
    resumen: {
      es: 'Bajo el Barri Gòtic hay dos mil años de capas: muralla romana, call jueu y las cicatrices de una guerra civil que aún se leen en la piedra.',
      en: 'Beneath the Barri Gòtic lie two thousand years of layers: a Roman wall, the old Jewish quarter, and the scars of a civil war that can still be read in the stone.',
      fr: 'Sous le Barri Gòtic se cachent deux mille ans de strates : un mur romain, l\'ancien quartier juif et les cicatrices d\'une guerre civile encore lisibles dans la pierre.',
      it: 'Sotto il Barri Gòtic si nascondono duemila anni di strati: una cinta romana, l\'antico quartiere ebraico e le cicatrici di una guerra civile ancora leggibili nella pietra.',
    },
  },
  {
    slug: 'roma',
    activa: true,
    imgHero: 'assets/img/ciudades/roma-hero.webp',
    imgCard: 'assets/img/ciudades/roma-card.webp',
    pais: { es: 'Italia', en: 'Italy', fr: 'Italie', it: 'Italia' },
    nombre: { es: 'Roma', en: 'Rome', fr: 'Rome', it: 'Roma' },
    resumen: {
      es: 'El Centro Storico es un museo sin vitrinas: columnas romanas reutilizadas, plazas barrocas y fuentes que esconden más de lo que muestran.',
      en: 'The Centro Storico is a museum with no display cases: reused Roman columns, baroque squares and fountains hiding more than they show.',
      fr: 'Le Centro Storico est un musée sans vitrines : colonnes romaines réemployées, places baroques et fontaines qui cachent plus qu\'elles ne montrent.',
      it: 'Il Centro Storico è un museo senza vetrine: colonne romane di reimpiego, piazze barocche e fontane che nascondono più di quanto mostrano.',
    },
  },
  {
    slug: 'paris',
    activa: true,
    imgHero: 'assets/img/ciudades/paris-hero.webp',
    imgCard: 'assets/img/ciudades/paris-card.webp',
    pais: { es: 'Francia', en: 'France', fr: 'France', it: 'Francia' },
    nombre: { es: 'París', en: 'Paris', fr: 'Paris', it: 'Parigi' },
    resumen: {
      es: 'Le Marais sobrevivió a Haussmann casi intacto: mansiones aristocráticas, plazas reales y un barrio judío con memoria propia.',
      en: 'Le Marais survived Haussmann almost untouched: aristocratic mansions, royal squares and a Jewish quarter with a memory all its own.',
      fr: 'Le Marais a survécu à Haussmann presque intact : hôtels particuliers aristocratiques, places royales et un quartier juif à la mémoire propre.',
      it: 'Le Marais è sopravvissuto a Haussmann quasi intatto: palazzi aristocratici, piazze reali e un quartiere ebraico con una memoria tutta sua.',
    },
  },
  {
    slug: 'lisboa',
    activa: true,
    imgHero: 'assets/img/ciudades/lisboa-hero.webp',
    imgCard: 'assets/img/ciudades/lisboa-card.webp',
    pais: { es: 'Portugal', en: 'Portugal', fr: 'Portugal', it: 'Portogallo' },
    nombre: { es: 'Lisboa', en: 'Lisbon', fr: 'Lisbonne', it: 'Lisbona' },
    resumen: {
      es: 'Alfama es un laberinto de callejones que ni el gran terremoto de 1755 logró enderezar: aquí nació el fado, y cada azulejo parece guardar una historia.',
      en: "Alfama is a maze of alleys not even the great 1755 earthquake could straighten out: fado was born here, and every tile seems to hold a story.",
      fr: "Alfama est un labyrinthe de ruelles que même le grand séisme de 1755 n'a pas réussi à redresser : le fado y est né, et chaque azulejo semble garder une histoire.",
      it: 'Alfama è un labirinto di vicoli che nemmeno il grande terremoto del 1755 riuscì a raddrizzare: qui nacque il fado, e ogni azulejo sembra custodire una storia.',
    },
  },
  {
    slug: 'praga',
    activa: false,
    imgHero: 'assets/img/ciudades/praga-hero.webp',
    imgCard: 'assets/img/ciudades/praga-card.webp',
    pais: { es: 'Chequia', en: 'Czechia', fr: 'Tchéquie', it: 'Cechia' },
    nombre: { es: 'Praga', en: 'Prague', fr: 'Prague', it: 'Praga' },
    resumen: {
      es: 'La Ciudad Vieja y su astrónomo de piedra esconden más de un secreto. Próximamente.',
      en: 'The Old Town and its stone astronomer hide more than one secret. Coming soon.',
      fr: 'La Vieille Ville et son astronome de pierre cachent plus d\'un secret. Bientôt disponible.',
      it: 'La Città Vecchia e il suo astronomo di pietra nascondono più di un segreto. Prossimamente.',
    },
  },
  {
    slug: 'florencia',
    activa: true,
    imgHero: 'assets/img/ciudades/florencia-hero.webp',
    imgCard: 'assets/img/ciudades/florencia-card.webp',
    pais: { es: 'Italia', en: 'Italy', fr: 'Italie', it: 'Italia' },
    nombre: { es: 'Florencia', en: 'Florence', fr: 'Florence', it: 'Firenze' },
    resumen: {
      es: 'Cuna del Renacimiento: cada cúpula, cada estatua y cada torre del centro es, en el fondo, la respuesta a una rivalidad entre gremios, familias y arquitectos.',
      en: 'Birthplace of the Renaissance: every dome, statue and tower downtown is, at bottom, the answer to a rivalry between guilds, families and architects.',
      fr: "Berceau de la Renaissance : chaque coupole, chaque statue et chaque tour du centre est, au fond, la réponse à une rivalité entre corporations, familles et architectes.",
      it: 'Culla del Rinascimento: ogni cupola, statua e torre del centro è, in fondo, la risposta a una rivalità tra corporazioni, famiglie e architetti.',
    },
  },
  {
    slug: 'madrid',
    activa: true,
    imgHero: 'assets/img/ciudades/madrid-hero.webp',
    imgCard: 'assets/img/ciudades/madrid-card.webp',
    pais: { es: 'España', en: 'Spain', fr: 'Espagne', it: 'Spagna' },
    nombre: { es: 'Madrid', en: 'Madrid', fr: 'Madrid', it: 'Madrid' },
    resumen: {
      es: 'El Madrid de los Austrias esconde sus mejores detalles a la altura de los ojos: un animal fantástico que ya no aparece en el escudo de la ciudad, una bola que solo cae una noche al año, un oso que posa distinto en cada esquina.',
      en: "Habsburg Madrid keeps its best details at eye level: a mythical animal that no longer appears on the city's own coat of arms, a ball that only drops once a year, a bear that poses differently on every corner.",
      fr: "Le Madrid des Habsbourg garde ses meilleurs détails à hauteur d'yeux : un animal fantastique qui n'apparaît plus sur le blason de la ville, une boule qui ne tombe qu'une nuit par an, un ours qui prend une pose différente à chaque coin de rue.",
      it: "La Madrid degli Asburgo custodisce i suoi dettagli migliori all'altezza degli occhi: un animale fantastico che non compare più nello stemma della città, una sfera che cade solo una notte all'anno, un orso che posa in modo diverso a ogni angolo.",
    },
  },
  {
    slug: 'valencia',
    activa: true,
    imgHero: 'assets/img/ciudades/valencia-hero.webp',
    imgCard: 'assets/img/ciudades/valencia-card.webp',
    pais: { es: 'España', en: 'Spain', fr: 'Espagne', it: 'Spagna' },
    nombre: { es: 'Valencia', en: 'Valencia', fr: 'Valence', it: 'Valencia' },
    resumen: {
      es: 'El Carmen es el barrio más antiguo de Valencia, entre la Lonja de la Seda y una Catedral que guarda una copa que algunos creen que fue el Santo Grial.',
      en: "El Carmen is Valencia's oldest neighbourhood, between the Silk Exchange and a Cathedral that guards a cup some believe was the Holy Grail.",
      fr: 'El Carmen est le plus ancien quartier de Valence, entre la Bourse de la soie et une cathédrale qui garde une coupe que certains croient être le Saint Graal.',
      it: 'El Carmen è il quartiere più antico di Valencia, tra la Borsa della seta e una Cattedrale che custodisce una coppa che alcuni credono sia il Santo Graal.',
    },
  },
  {
    slug: 'napoles',
    activa: true,
    imgHero: 'assets/img/ciudades/napoles-hero.webp',
    imgCard: 'assets/img/ciudades/napoles-card.webp',
    pais: { es: 'Italia', en: 'Italy', fr: 'Italie', it: 'Italia' },
    nombre: { es: 'Nápoles', en: 'Naples', fr: 'Naples', it: 'Napoli' },
    resumen: {
      es: 'Spaccanapoli corta en dos el centro histórico siguiendo el trazado de una calle griega de hace 2.500 años, entre un Duomo con un rosetón sin cristales y una fachada que nadie ha terminado de leer.',
      en: "Spaccanapoli cuts the historic centre in half, following the line of a Greek street laid out 2,500 years ago, between a Duomo with a glassless rose window and a facade nobody has ever fully read.",
      fr: "Spaccanapoli coupe en deux le centre historique en suivant le tracé d'une rue grecque vieille de 2500 ans, entre un Duomo à la rosace sans vitraux et une façade que personne n'a jamais réussi à lire entièrement.",
      it: 'Spaccanapoli taglia in due il centro storico seguendo il tracciato di una strada greca di 2.500 anni fa, tra un Duomo con un rosone senza vetri e una facciata che nessuno è mai riuscito a leggere fino in fondo.',
    },
  },
  {
    slug: 'toulouse',
    activa: true,
    imgHero: 'assets/img/ciudades/toulouse-hero.webp',
    imgCard: 'assets/img/ciudades/toulouse-card.webp',
    pais: { es: 'Francia', en: 'France', fr: 'France', it: 'Francia' },
    nombre: { es: 'Toulouse', en: 'Toulouse', fr: 'Toulouse', it: 'Tolosa' },
    resumen: {
      es: 'La Ville Rose debe su apodo al ladrillo que cubre casi todos sus edificios desde hace ocho siglos, de la plaza de los antiguos capitouls a la basílica románica más grande de Europa.',
      en: "The Ville Rose owes its nickname to the brick covering nearly all its buildings for eight centuries, from the square of the old capitouls to Europe's largest Romanesque basilica.",
      fr: "La Ville Rose doit son surnom à la brique qui recouvre presque tous ses bâtiments depuis huit siècles, de la place des anciens capitouls à la plus grande basilique romane d'Europe.",
      it: "La Ville Rose deve il suo soprannome al mattone che ricopre quasi tutti i suoi edifici da otto secoli, dalla piazza degli antichi capitouls alla più grande basilica romanica d'Europa.",
    },
  },
  {
    slug: 'berlin',
    activa: true,
    imgHero: 'assets/img/ciudades/berlin-hero.webp',
    imgCard: 'assets/img/ciudades/berlin-card.webp',
    pais: { es: 'Alemania', en: 'Germany', fr: 'Allemagne', it: 'Germania' },
    nombre: { es: 'Berlín', en: 'Berlin', fr: 'Berlin', it: 'Berlino' },
    resumen: {
      es: 'Berlín no guarda su historia del siglo XX en vitrinas: la deja grabada en la piedra, el metal y el cristal de sus propias calles, entre dos cúpulas gemelas que en realidad no se parecen y una biblioteca vacía escondida bajo el empedrado.',
      en: "Berlin doesn't keep its 20th-century history behind glass: it leaves it carved into the stone, metal and glass of its own streets, between two twin domes that actually don't match and a hidden library that lost every one of its books.",
      fr: 'Berlin ne garde pas son histoire du XXe siècle sous vitrine : elle la laisse gravée dans la pierre, le métal et le verre de ses propres rues, entre deux coupoles jumelles qui en réalité ne se ressemblent pas et une bibliothèque vide cachée sous les pavés.',
      it: 'Berlino non custodisce la sua storia del Novecento dietro una vetrina: la lascia incisa nella pietra, nel metallo e nel vetro delle proprie strade, tra due cupole gemelle che in realtà non si somigliano e una biblioteca vuota nascosta sotto il selciato.',
    },
  },
  {
    slug: 'istanbul',
    activa: true,
    imgHero: 'assets/img/ciudades/istanbul-hero.webp',
    imgCard: 'assets/img/ciudades/istanbul-card.webp',
    pais: { es: 'Turquía', en: 'Turkey', fr: 'Turquie', it: 'Turchia' },
    nombre: { es: 'Estambul', en: 'Istanbul', fr: 'Istanbul', it: 'Istanbul' },
    resumen: {
      es: 'La única ciudad del mundo que fue capital de dos imperios sin cambiar de sitio: Constantinopla y Estambul se pisan la una a la otra en cada esquina de Sultanahmet, entre cabezas de serpiente que ya no están y un grafiti vikingo tallado hace mil años.',
      en: 'The only city in the world that was capital to two empires without ever changing location: Constantinople and Istanbul tread on each other at every corner of Sultanahmet, between serpent heads that are long gone and a thousand-year-old Viking graffito.',
      fr: "La seule ville au monde à avoir été la capitale de deux empires sans jamais changer d'emplacement : Constantinople et Istanbul se marchent dessus à chaque coin de rue de Sultanahmet, entre des têtes de serpent disparues depuis longtemps et un graffiti viking gravé il y a mille ans.",
      it: "L'unica città al mondo che è stata capitale di due imperi senza mai cambiare posto: Costantinopoli e Istanbul si calpestano a vicenda a ogni angolo di Sultanahmet, tra teste di serpente scomparse da tempo e un graffito vichingo inciso mille anni fa.",
    },
  },
];

/**
 * Rutas jugables. Cada ruta pertenece a una ciudad (`ciudadSlug`) y una
 * ciudad puede tener varias rutas en el futuro; en esta primera versión hay
 * exactamente una por ciudad activa.
 */
export const RUTAS = [
  {
    id: 'barcelona-gotic',
    ciudadSlug: 'barcelona',
    zona: 'Barri Gòtic',
    duracionMin: 120,
    jugadoresMin: 1,
    jugadoresMax: 6,
    dificultad: /** @type {Dificultad} */ ('media'),
    numParadas: 8,
    moneda: 'EUR',
    idiomas: ['es', 'en', 'fr', 'it'],
    imgHero: 'assets/img/ciudades/barcelona-hero.webp',
    imgCard: 'assets/img/ciudades/barcelona-card.webp',
    imgMapa: 'assets/img/mapas/barcelona-gotic.svg',
    titulo: {
      es: 'El secreto del Barrio Gótico',
      en: 'The Secret of the Gothic Quarter',
      fr: 'Le secret du quartier gothique',
      it: 'Il segreto del Barrio Gótico',
    },
    puntoPartida: {
      es: 'Plaça Nova, junto a la fachada de la Catedral de Barcelona',
      en: 'Plaça Nova, next to the façade of Barcelona Cathedral',
      fr: 'Plaça Nova, à côté de la façade de la cathédrale de Barcelone',
      it: 'Plaça Nova, accanto alla facciata della Cattedrale di Barcellona',
    },
    resumen: {
      es: 'Ocho paradas entre la Catedral y la Plaça Sant Jaume para leer lo que la piedra del Gótico lleva siglos contando: muralla romana, un puente que no es tan medieval como parece y las huellas de un bombardeo de 1938.',
      en: "Eight stops between the Cathedral and Plaça Sant Jaume to read what the stone of the Gothic Quarter has been telling for centuries: a Roman wall, a bridge that's not as medieval as it looks, and the marks of a 1938 bombing.",
      fr: "Huit étapes entre la cathédrale et la Plaça Sant Jaume pour lire ce que la pierre du quartier gothique raconte depuis des siècles : un mur romain, un pont moins médiéval qu'il n'y paraît, et les traces d'un bombardement de 1938.",
      it: "Otto tappe tra la Cattedrale e la Plaça Sant Jaume per leggere ciò che la pietra del Gotico racconta da secoli: una cinta romana, un ponte meno medievale di quanto sembri e i segni di un bombardamento del 1938.",
    },
    acertijoMuestra: {
      es: 'En el Pont del Bisbe, bajo el arco que cruza la calle, hay una pequeña calavera de piedra atravesada por un arma blanca. ¿Qué arma es exactamente? La respuesta abre la siguiente parada.',
      en: 'On the Pont del Bisbe, under the arch that crosses the street, there\'s a small stone skull pierced by a bladed weapon. What weapon is it exactly? The answer unlocks the next stop.',
      fr: 'Sur le Pont del Bisbe, sous l\'arc qui enjambe la rue, se trouve un petit crâne de pierre transpercé par une arme blanche. Quelle est exactement cette arme ? La réponse débloque l\'étape suivante.',
      it: 'Sul Pont del Bisbe, sotto l\'arco che attraversa la strada, c\'è un piccolo teschio di pietra trafitto da un\'arma bianca. Che arma è esattamente? La risposta sblocca la tappa successiva.',
    },
  },
  {
    id: 'roma-centro',
    ciudadSlug: 'roma',
    zona: 'Pantheon · Piazza Navona · Campo de’ Fiori',
    duracionMin: 120,
    jugadoresMin: 1,
    jugadoresMax: 6,
    dificultad: /** @type {Dificultad} */ ('dificil'),
    numParadas: 8,
    moneda: 'EUR',
    idiomas: ['es', 'en', 'fr', 'it'],
    imgHero: 'assets/img/ciudades/roma-hero.webp',
    imgCard: 'assets/img/ciudades/roma-card.webp',
    imgMapa: 'assets/img/mapas/roma-centro.svg',
    titulo: {
      es: 'Los enigmas del Centro Storico',
      en: 'The Puzzles of the Centro Storico',
      fr: 'Les énigmes du Centro Storico',
      it: 'Gli enigmi del Centro Storico',
    },
    puntoPartida: {
      es: 'Piazza della Rotonda, frente a la fachada del Panteón',
      en: 'Piazza della Rotonda, facing the Pantheon',
      fr: 'Piazza della Rotonda, face au Panthéon',
      it: 'Piazza della Rotonda, di fronte al Pantheon',
    },
    resumen: {
      es: 'Del Panteón a Campo de’ Fiori atravesando plazas barrocas construidas sobre cimientos romanos. Ocho enigmas que obligan a mirar los frisos, contar columnas y descifrar por qué una plaza ovalada esconde un estadio entero debajo.',
      en: 'From the Pantheon to Campo de\' Fiori through baroque squares built on Roman foundations. Eight puzzles that make you study friezes, count columns, and work out why an oval square hides a whole stadium underneath.',
      fr: "Du Panthéon à Campo de' Fiori à travers des places baroques bâties sur des fondations romaines. Huit énigmes qui obligent à observer les frises, compter les colonnes et comprendre pourquoi une place ovale cache un stade entier en dessous.",
      it: "Dal Pantheon a Campo de' Fiori attraverso piazze barocche costruite su fondamenta romane. Otto enigmi che costringono a guardare i fregi, contare le colonne e scoprire perché una piazza ovale nasconde uno stadio intero.",
    },
    acertijoMuestra: {
      es: 'En el friso del pórtico del Panteón, una inscripción de bronce dice que lo construyó un cónsul llamado Marco Agripa — aunque el edificio que veis hoy es en realidad muy posterior. Contad cuántas veces dice la inscripción que fue cónsul.',
      en: 'On the frieze of the Pantheon\'s portico, a bronze inscription says it was built by a consul named Marcus Agrippa — though the building you see today is actually much later. Count how many times the inscription says he was consul.',
      fr: "Sur la frise du portique du Panthéon, une inscription en bronze indique qu'il fut construit par un consul nommé Marcus Agrippa — bien que le bâtiment que vous voyez aujourd'hui soit en réalité bien postérieur. Comptez combien de fois l'inscription dit qu'il fut consul.",
      it: 'Sul fregio del pronao del Pantheon, un\'iscrizione in bronzo dice che fu costruito da un console di nome Marco Agrippa — anche se l\'edificio che vedete oggi è in realtà molto posteriore. Contate quante volte l\'iscrizione dice che fu console.',
    },
  },
  {
    id: 'paris-marais',
    ciudadSlug: 'paris',
    zona: 'Le Marais · Place des Vosges · Île de la Cité',
    duracionMin: 120,
    jugadoresMin: 1,
    jugadoresMax: 6,
    dificultad: /** @type {Dificultad} */ ('media'),
    numParadas: 8,
    moneda: 'EUR',
    idiomas: ['es', 'en', 'fr', 'it'],
    imgHero: 'assets/img/ciudades/paris-hero.webp',
    imgCard: 'assets/img/ciudades/paris-card.webp',
    imgMapa: 'assets/img/mapas/paris-marais.svg',
    titulo: {
      es: 'Los códigos de Le Marais',
      en: 'The Codes of Le Marais',
      fr: 'Les codes du Marais',
      it: 'I codici di Le Marais',
    },
    puntoPartida: {
      es: 'Parvis Notre-Dame — Place Jean-Paul II',
      en: 'Parvis Notre-Dame — Place Jean-Paul II',
      fr: 'Parvis Notre-Dame — Place Jean-Paul II',
      it: 'Parvis Notre-Dame — Place Jean-Paul II',
    },
    resumen: {
      es: 'De la Île de la Cité a la Place des Vosges por las callejuelas que Haussmann nunca llegó a ensanchar. Ocho paradas entre mansiones aristocráticas, el antiguo barrio judío y las placas que recuerdan a quienes vivieron aquí.',
      en: "From Île de la Cité to Place des Vosges through the narrow streets Haussmann never got around to widening. Eight stops among aristocratic mansions, the old Jewish quarter, and plaques remembering those who lived here.",
      fr: "De l'Île de la Cité à la Place des Vosges par les ruelles qu'Haussmann n'a jamais eu le temps d'élargir. Huit étapes entre hôtels particuliers aristocratiques, l'ancien quartier juif et les plaques qui rappellent ceux qui ont vécu ici.",
      it: "Dall'Île de la Cité a Place des Vosges attraverso le stradine che Haussmann non fece in tempo ad allargare. Otto tappe tra palazzi aristocratici, l'antico quartiere ebraico e le targhe che ricordano chi ha vissuto qui.",
    },
    acertijoMuestra: {
      es: 'En el suelo del atrio de Notre-Dame hay un pequeño medallón de bronce con un símbolo grabado en el centro. Todas las distancias por carretera de Francia se miden oficialmente desde este punto exacto. ¿Qué símbolo es?',
      en: "In the pavement in front of Notre-Dame there's a small bronze medallion with a symbol engraved at its centre. Every road distance in France is officially measured from this exact point. What symbol is it?",
      fr: "Dans le sol du parvis de Notre-Dame se trouve un petit médaillon de bronze avec un symbole gravé en son centre. Toutes les distances routières de France se mesurent officiellement depuis ce point exact. Quel est ce symbole ?",
      it: "Nel selciato del sagrato di Notre-Dame c'è un piccolo medaglione di bronzo con un simbolo inciso al centro. Tutte le distanze stradali della Francia si misurano ufficialmente da questo punto esatto. Che simbolo è?",
    },
  },
  {
    id: 'barcelona-born',
    ciudadSlug: 'barcelona',
    zona: 'El Born · La Ribera',
    duracionMin: 120,
    jugadoresMin: 1,
    jugadoresMax: 6,
    dificultad: /** @type {Dificultad} */ ('facil'),
    numParadas: 11,
    moneda: 'EUR',
    idiomas: ['es', 'en', 'fr', 'it'],
    imgHero: 'assets/img/ciudades/barcelona-born-hero.webp',
    imgCard: 'assets/img/ciudades/barcelona-born-card.webp',
    imgMapa: 'assets/img/mapas/barcelona-born.svg',
    titulo: {
      es: 'Los mercaderes de La Ribera',
      en: 'The Merchants of La Ribera',
      fr: 'Les marchands de la Ribera',
      it: 'I mercanti della Ribera',
    },
    puntoPartida: {
      es: 'Arc de Triomf, extremo del Passeig de Lluís Companys',
      en: 'Arc de Triomf, at the end of Passeig de Lluís Companys',
      fr: "Arc de Triomf, à l'extrémité du Passeig de Lluís Companys",
      it: "Arc de Triomf, all'estremità del Passeig de Lluís Companys",
    },
    resumen: {
      es: 'Del Arc de Triomf a los palacios góticos de Carrer Montcada, atravesando el barrio que financió su propia basílica a pulso y pagó por ello con la destrucción total de sus calles en 1714.',
      en: 'From the Arc de Triomf to the Gothic palaces of Carrer Montcada, through the district that financed its own basilica by hand and paid for it with the total destruction of its streets in 1714.',
      fr: "De l'Arc de Triomf aux palais gothiques de la carrer Montcada, à travers le quartier qui a financé sa propre basilique de ses propres mains et l'a payé par la destruction totale de ses rues en 1714.",
      it: 'Dall\'Arc de Triomf ai palazzi gotici di Carrer Montcada, attraverso il quartiere che finanziò di tasca propria la sua basilica e lo pagò con la distruzione totale delle sue strade nel 1714.',
    },
    acertijoMuestra: {
      es: 'En los pilares del Arc de Triomf hay tallado un animal alado, emblema heráldico de Jaume I. ¿Qué animal es?',
      en: "Carved into the pillars of the Arc de Triomf is a winged animal, the heraldic emblem of King Jaume I. What animal is it?",
      fr: "Sur les piliers de l'Arc de Triomf est sculpté un animal ailé, emblème héraldique du roi Jaume Ier. Quel est cet animal ?",
      it: "Sui pilastri dell'Arc de Triomf è scolpito un animale alato, emblema araldico di re Giacomo I. Che animale è?",
    },
  },
  {
    id: 'barcelona-raval',
    ciudadSlug: 'barcelona',
    zona: 'El Raval',
    duracionMin: 120,
    jugadoresMin: 1,
    jugadoresMax: 6,
    dificultad: /** @type {Dificultad} */ ('dificil'),
    numParadas: 8,
    moneda: 'EUR',
    idiomas: ['es', 'en', 'fr', 'it'],
    imgHero: 'assets/img/ciudades/barcelona-raval-hero.webp',
    imgCard: 'assets/img/ciudades/barcelona-raval-card.webp',
    imgMapa: 'assets/img/mapas/barcelona-raval.svg',
    titulo: {
      es: 'Los bajos fondos y los santos del Raval',
      en: 'The Underworld and Saints of the Raval',
      fr: 'Les bas-fonds et les saints du Raval',
      it: 'I bassifondi e i santi del Raval',
    },
    puntoPartida: {
      es: 'Mercat de la Boqueria, entrada principal desde La Rambla',
      en: 'Mercat de la Boqueria, main entrance from La Rambla',
      fr: 'Mercat de la Boqueria, entrée principale depuis La Rambla',
      it: 'Mercat de la Boqueria, ingresso principale da La Rambla',
    },
    resumen: {
      es: 'Del mosaico de Miró en la Boqueria al bar más antiguo de la ciudad, pasando por la iglesia más vieja de Barcelona y un palacio de Gaudí escondido en pleno antiguo Barrio Chino.',
      en: "From Miró's mosaic at the Boqueria to the city's oldest bar, by way of Barcelona's oldest church and a Gaudí palace hidden in the former red-light district.",
      fr: "De la mosaïque de Miró à la Boqueria au plus vieux bar de la ville, en passant par la plus ancienne église de Barcelone et un palais de Gaudí caché dans l'ancien quartier chaud.",
      it: 'Dal mosaico di Miró alla Boqueria al bar più antico della città, passando per la chiesa più vecchia di Barcellona e un palazzo di Gaudí nascosto nell\'antico quartiere a luci rosse.',
    },
    acertijoMuestra: {
      es: 'Entre las dos puertas del Palau Güell hay una celosía de hierro con el escudo de Cataluña, coronado por una criatura alada. ¿Qué criatura es?',
      en: "Between the two doors of the Palau Güell there's an iron lattice bearing the coat of arms of Catalonia, crowned by a winged creature. What creature is it?",
      fr: "Entre les deux portes du Palau Güell se trouve une grille en fer ornée des armoiries de la Catalogne, couronnées d'une créature ailée. Quelle est cette créature ?",
      it: 'Tra le due porte del Palau Güell c\'è una grata di ferro con lo stemma della Catalogna, sormontato da una creatura alata. Che creatura è?',
    },
  },
  {
    id: 'lisboa-alfama',
    ciudadSlug: 'lisboa',
    zona: 'Alfama',
    duracionMin: 120,
    jugadoresMin: 1,
    jugadoresMax: 6,
    dificultad: /** @type {Dificultad} */ ('dificil'),
    numParadas: 8,
    moneda: 'EUR',
    idiomas: ['es', 'en', 'fr', 'it'],
    imgHero: 'assets/img/ciudades/lisboa-hero.webp',
    imgCard: 'assets/img/ciudades/lisboa-card.webp',
    imgMapa: 'assets/img/mapas/lisboa-alfama.svg',
    titulo: {
      es: 'Los ecos de Alfama',
      en: 'The Echoes of Alfama',
      fr: "Les échos d'Alfama",
      it: 'Gli echi di Alfama',
    },
    puntoPartida: {
      es: 'Sé de Lisboa (Catedral), Largo da Sé',
      en: 'Sé de Lisboa (Cathedral), Largo da Sé',
      fr: 'Sé de Lisbonne (cathédrale), Largo da Sé',
      it: 'Sé di Lisbona (Cattedrale), Largo da Sé',
    },
    resumen: {
      es: 'Del laberinto de callejones que ni el terremoto de 1755 logró enderezar a la cuna del fado, pasando por una catedral construida sobre una mezquita y una obra que tardó 284 años en terminarse.',
      en: "From the maze of alleys not even the 1755 earthquake could straighten out to the birthplace of fado, by way of a cathedral built on a mosque and a construction that took 284 years to finish.",
      fr: "Du labyrinthe de ruelles que même le séisme de 1755 n'a pas réussi à redresser jusqu'au berceau du fado, en passant par une cathédrale bâtie sur une mosquée et un chantier qui a duré 284 ans.",
      it: 'Dal labirinto di vicoli che nemmeno il terremoto del 1755 riuscì a raddrizzare alla culla del fado, passando per una cattedrale costruita su una moschea e un cantiere durato 284 anni.',
    },
    acertijoMuestra: {
      es: 'La Sé de Lisboa se construyó en 1147 sobre el edificio religioso que ocupaba este lugar durante el dominio musulmán. ¿Qué tipo de edificio había aquí antes?',
      en: "Lisbon's Sé Cathedral was built in 1147 on top of the religious building that stood here during Muslim rule. What kind of building was here before?",
      fr: "La cathédrale Sé de Lisbonne fut construite en 1147 sur l'édifice religieux qui occupait ce lieu sous la domination musulmane. Quel type de bâtiment s'y trouvait avant ?",
      it: 'La Sé di Lisbona fu costruita nel 1147 sopra l\'edificio religioso che occupava questo luogo durante il dominio musulmano. Che tipo di edificio c\'era prima?',
    },
  },
  {
    id: 'florencia-centro',
    ciudadSlug: 'florencia',
    zona: 'Duomo · Piazza della Signoria · Ponte Vecchio',
    duracionMin: 120,
    jugadoresMin: 1,
    jugadoresMax: 6,
    dificultad: /** @type {Dificultad} */ ('facil'),
    numParadas: 10,
    moneda: 'EUR',
    idiomas: ['es', 'en', 'fr', 'it'],
    imgHero: 'assets/img/ciudades/florencia-hero.webp',
    imgCard: 'assets/img/ciudades/florencia-card.webp',
    imgMapa: 'assets/img/mapas/florencia-centro.svg',
    titulo: {
      es: 'Los rivales de Florencia',
      en: "Florence's Rivals",
      fr: 'Les rivaux de Florence',
      it: 'I rivali di Firenze',
    },
    puntoPartida: {
      es: 'Piazza del Duomo, frente a la fachada de Santa Maria del Fiore',
      en: 'Piazza del Duomo, facing the façade of Santa Maria del Fiore',
      fr: 'Piazza del Duomo, face à la façade de Santa Maria del Fiore',
      it: 'Piazza del Duomo, di fronte alla facciata di Santa Maria del Fiore',
    },
    resumen: {
      es: 'De una cúpula construida sin andamios a una puerta bautizada por Miguel Ángel, del David que es solo una copia a un puente que cambió de oficio por decreto ducal.',
      en: "From a dome built without scaffolding to a door nicknamed by Michelangelo, from a David that's only a copy to a bridge that changed trade by ducal decree.",
      fr: "D'une coupole construite sans échafaudage à une porte surnommée par Michel-Ange, d'un David qui n'est qu'une copie à un pont qui a changé de métier par décret ducal.",
      it: 'Da una cupola costruita senza impalcature a una porta soprannominata da Michelangelo, da un David che è solo una copia a un ponte che cambiò mestiere per decreto ducale.',
    },
    acertijoMuestra: {
      es: 'La fachada de la catedral parece medieval, pero es del siglo XIX. Contad los colores de mármol distintos que forman su patrón geométrico.',
      en: "The cathedral's façade looks medieval, but it's actually from the 19th century. Count the different marble colours that make up its geometric pattern.",
      fr: "La façade de la cathédrale semble médiévale, mais elle date en réalité du XIXe siècle. Comptez les différentes couleurs de marbre qui composent son motif géométrique.",
      it: "La facciata della cattedrale sembra medievale, ma è in realtà dell'Ottocento. Contate i diversi colori di marmo che formano il suo motivo geometrico.",
    },
  },
  {
    id: 'madrid-austrias',
    ciudadSlug: 'madrid',
    zona: 'Puerta del Sol · Plaza Mayor · Plaza de la Villa',
    duracionMin: 120,
    jugadoresMin: 1,
    jugadoresMax: 6,
    dificultad: /** @type {Dificultad} */ ('dificil'),
    numParadas: 8,
    moneda: 'EUR',
    idiomas: ['es', 'en', 'fr', 'it'],
    imgHero: 'assets/img/ciudades/madrid-hero.webp',
    imgCard: 'assets/img/ciudades/madrid-card.webp',
    imgMapa: 'assets/img/mapas/madrid-austrias.svg',
    titulo: {
      es: 'Los testigos de la Villa y Corte',
      en: 'The Witnesses of Villa y Corte',
      fr: 'Les témoins de la Villa y Corte',
      it: 'I testimoni della Villa y Corte',
    },
    puntoPartida: {
      es: 'Puerta del Sol, frente a la Real Casa de Correos, bajo el reloj de las campanadas',
      en: 'Puerta del Sol, facing the Real Casa de Correos, under the clock',
      fr: "Puerta del Sol, face à la Real Casa de Correos, sous l'horloge",
      it: "Puerta del Sol, di fronte alla Real Casa de Correos, sotto l'orologio",
    },
    resumen: {
      es: 'Vais a arrancar en la plaza más fotografiada de España, la que sale en todas las postales, y vais a descubrir que casi nadie se fija en lo que tiene delante: un segundo animal en un escudo que todo el mundo pisa, una bola que solo se mueve una noche al año, un oso que no posa igual que en los carteles de la ciudad. El Madrid de los Austrias —Puerta del Sol, Plaza Mayor, Plaza de la Villa— guarda sus mejores detalles a la altura de los ojos, no en una vitrina. Son algo más de un kilómetro y medio en total.',
      en: "You're about to start in the most photographed square in Spain, the one on every postcard, and you're about to discover that almost no one looks closely at what's right in front of them: a second animal on a shield that everyone walks over, a ball that only moves once a year, a bear that doesn't pose the way it does on the city's own street signs. Habsburg Madrid — Puerta del Sol, Plaza Mayor, Plaza de la Villa — keeps its best details at eye level, not behind glass. It's a little over a kilometre and a half in total.",
      fr: "Vous allez commencer sur la place la plus photographiée d'Espagne, celle qui figure sur toutes les cartes postales, et vous allez découvrir que presque personne ne remarque ce qu'il a pourtant sous les yeux : un second animal sur un blason que tout le monde piétine, une boule qui ne bouge qu'une nuit par an, un ours qui ne prend pas la même pose que sur les panneaux de la ville. Le Madrid des Habsbourg — Puerta del Sol, Plaza Mayor, Plaza de la Villa — garde ses meilleurs détails à hauteur d'yeux, pas derrière une vitrine. Comptez un peu plus d'un kilomètre et demi au total.",
      it: "State per iniziare nella piazza più fotografata di Spagna, quella che compare su ogni cartolina, e scoprirete che quasi nessuno si accorge di ciò che ha davanti: un secondo animale su uno stemma che tutti calpestano, una sfera che si muove solo una notte all'anno, un orso che non posa come sugli stemmi della città. La Madrid degli Asburgo — Puerta del Sol, Plaza Mayor, Plaza de la Villa — custodisce i suoi dettagli migliori all'altezza degli occhi, non dietro una vetrina. Sono poco più di un chilometro e mezzo in totale.",
    },
    acertijoMuestra: {
      es: 'Es el Kilómetro Cero: el punto desde el que históricamente se miden las carreteras radiales de España y la numeración de las calles de Madrid. En el centro lleva grabada la silueta de España con las rutas que salen de aquí, y justo debajo, dos escudos. Uno es el del Colegio de Ingenieros de Caminos. El otro es un escudo antiguo de la Villa de Madrid con una corona, el oso y el madroño... y un segundo animal, fantástico, que ya no aparece en el escudo actual. ¿Qué animal es?',
      en: "This is Kilometre Zero: the point from which Spain's radial highways and Madrid's street numbering have historically been measured. At its centre it carries an engraved outline of Spain with the routes radiating outward, and just below that, two coats of arms. One belongs to the Civil Engineers' Association. The other is an old coat of arms of the City of Madrid with a crown, the bear and the strawberry tree... and a second, mythical animal that no longer appears on the current coat of arms. What animal is it?",
      fr: "C'est le kilomètre zéro : le point depuis lequel on mesure historiquement les routes radiales d'Espagne et la numérotation des rues de Madrid. En son centre est gravé le contour de l'Espagne avec les routes qui en rayonnent, et juste en dessous, deux blasons. L'un est celui du collège des ingénieurs des Ponts et Chaussées. L'autre est un ancien blason de la ville de Madrid avec une couronne, l'ours et l'arbousier... et un second animal, fantastique, qui n'apparaît plus sur le blason actuel. Quel est cet animal ?",
      it: "È il Chilometro Zero: il punto da cui storicamente si misurano le strade radiali di Spagna e la numerazione delle vie di Madrid. Al centro porta incisa la sagoma della Spagna con le strade che ne partono, e subito sotto, due stemmi. Uno è quello del Collegio degli Ingegneri delle Strade. L'altro è un antico stemma della città di Madrid con una corona, l'orso e il corbezzolo... e un secondo animale, fantastico, che non compare più nello stemma attuale. Che animale è?",
    },
  },
  {
    id: 'valencia-carmen',
    ciudadSlug: 'valencia',
    zona: 'Barrio del Carmen · La Lonja',
    duracionMin: 120,
    jugadoresMin: 1,
    jugadoresMax: 6,
    dificultad: /** @type {Dificultad} */ ('facil'),
    numParadas: 8,
    moneda: 'EUR',
    idiomas: ['es', 'en', 'fr', 'it'],
    imgHero: 'assets/img/ciudades/valencia-hero.webp',
    imgCard: 'assets/img/ciudades/valencia-card.webp',
    imgMapa: 'assets/img/mapas/valencia-carmen.svg',
    titulo: {
      es: 'El grial de los mercaderes',
      en: "The Merchants' Grail",
      fr: 'Le Graal des marchands',
      it: 'Il Graal dei mercanti',
    },
    puntoPartida: {
      es: 'La Lonja de la Seda, fachada principal, Calle de la Lonja',
      en: 'La Lonja de la Seda (the Silk Exchange), main façade, Calle de la Lonja',
      fr: 'La Lonja de la Seda (la Bourse de la soie), façade principale, Calle de la Lonja',
      it: 'La Lonja de la Seda (la Borsa della seta), facciata principale, Calle de la Lonja',
    },
    resumen: {
      es: 'El Carmen es el barrio más antiguo de Valencia: creció pegado primero a la muralla árabe y luego a la cristiana, entre mercaderes de seda, artesanos de gremio y frailes. A un lado, la Lonja levantó un templo de piedra dedicado al comercio; al otro, la Catedral guarda una copa que algunos creen que Cristo usó en la Última Cena. Son cerca de 3 km, llanos, por el corazón del casco histórico.',
      en: "El Carmen is Valencia's oldest neighbourhood: it grew up hard against the old Arab wall, and later the Christian one, among silk merchants, guild craftsmen and friars. On one side, the Lonja raised a stone temple to trade; on the other, the Cathedral guards a cup some believe Christ used at the Last Supper. It's about 3 km, flat, right through the heart of the old town.",
      fr: "El Carmen est le plus vieux quartier de Valence : il s'est développé collé d'abord au rempart arabe, puis au rempart chrétien, parmi les marchands de soie, les artisans de corporation et les moines. D'un côté, la Lonja a élevé un temple de pierre dédié au commerce ; de l'autre, la cathédrale garde une coupe que certains croient utilisée par le Christ lors de la Cène. Comptez environ 3 km, à plat, en plein cœur du centre historique.",
      it: "El Carmen è il quartiere più antico di Valencia: crebbe addossato prima alle mura arabe e poi a quelle cristiane, tra mercanti di seta, artigiani delle corporazioni e frati. Da un lato, la Lonja ha eretto un tempio di pietra dedicato al commercio; dall'altro, la Cattedrale custodisce una coppa che alcuni credono usata da Cristo nell'Ultima Cena. Sono circa 3 km, pianeggianti, nel cuore del centro storico.",
    },
    acertijoMuestra: {
      es: 'Este edificio no es una iglesia, aunque lo parezca: es un templo gótico dedicado al comercio de la seda, construido entre 1482 y 1548. Sus muros exteriores están cubiertos de gárgolas y figuras talladas, unas 28 en total, entre animales fantásticos, frailes, soldados y escenas cotidianas. En la pared del Consulado del Mar, entre dos medallones, hay tallada una anciana que sostiene un animal en brazos. ¿Qué animal es?',
      en: "This building isn't a church, even though it looks like one: it's a Gothic temple dedicated to the silk trade, built between 1482 and 1548. Its outer walls are covered in gargoyles and carved figures, around 28 in total, ranging from fantastical animals to friars, soldiers and everyday scenes. On the wall of the Consulado del Mar, between two medallions, an old woman is carved holding an animal in her arms. What animal is it?",
      fr: "Ce bâtiment n'est pas une église, même s'il y ressemble : c'est un temple gothique dédié au commerce de la soie, construit entre 1482 et 1548. Ses murs extérieurs sont couverts de gargouilles et de figures sculptées, environ 28 au total, entre animaux fantastiques, moines, soldats et scènes du quotidien. Sur le mur du Consulado del Mar, entre deux médaillons, une vieille femme est sculptée, tenant un animal dans ses bras. Quel est cet animal ?",
      it: "Questo edificio non è una chiesa, anche se lo sembra: è un tempio gotico dedicato al commercio della seta, costruito tra il 1482 e il 1548. Le sue pareti esterne sono coperte di doccioni e figure scolpite, circa 28 in totale, tra animali fantastici, frati, soldati e scene quotidiane. Sulla parete del Consulado del Mar, tra due medaglioni, è scolpita un'anziana che tiene in braccio un animale. Che animale è?",
    },
  },
  {
    id: 'napoles-spaccanapoli',
    ciudadSlug: 'napoles',
    zona: 'Spaccanapoli · Duomo',
    duracionMin: 120,
    jugadoresMin: 1,
    jugadoresMax: 6,
    dificultad: /** @type {Dificultad} */ ('media'),
    numParadas: 8,
    moneda: 'EUR',
    idiomas: ['es', 'en', 'fr', 'it'],
    imgHero: 'assets/img/ciudades/napoles-hero.webp',
    imgCard: 'assets/img/ciudades/napoles-card.webp',
    imgMapa: 'assets/img/mapas/napoles-spaccanapoli.svg',
    titulo: {
      es: 'El filo de Spaccanapoli',
      en: 'The Blade of Spaccanapoli',
      fr: 'La lame de Spaccanapoli',
      it: 'La lama di Spaccanapoli',
    },
    puntoPartida: {
      es: 'Piazza Duomo, frente a la fachada de la Cattedrale di San Gennaro (il Duomo di Napoli)',
      en: 'Piazza Duomo, in front of the facade of the Cattedrale di San Gennaro (the Duomo di Napoli)',
      fr: 'Piazza Duomo, face à la façade de la Cattedrale di San Gennaro (le Duomo di Napoli)',
      it: 'Piazza Duomo, davanti alla facciata della Cattedrale di San Gennaro (il Duomo di Napoli)',
    },
    resumen: {
      es: 'Nápoles esconde tres ciudades superpuestas —la griega, la romana y la barroca— y las tres se pisan, literalmente, al caminar por Spaccanapoli, la calle recta que corta en dos el centro histórico desde hace 2.500 años. Vais a buscar un rosetón sin cristales, contar ángeles de mármol sobre un antiguo ágora griega y descifrar una fachada que nadie ha terminado de leer, mientras bajo vuestros pies sigue latiendo la Nápoles subterránea. Son algo menos de 2 km, casi todos llanos.',
      en: "Naples hides three cities stacked on top of one another — Greek, Roman and Baroque — and you'll literally walk over all three along Spaccanapoli, the straight street that has cut the historic centre in half for 2,500 years. You'll hunt for a rose window with no glass, count marble angels above an ancient Greek agora, and decode a facade nobody has ever fully read, while underground Naples keeps beating beneath your feet. It's a little under 2 km, mostly flat.",
      fr: "Naples cache trois villes superposées — la grecque, la romaine et la baroque — et vous les foulez toutes les trois, littéralement, en marchant le long de Spaccanapoli, la rue rectiligne qui coupe en deux le centre historique depuis 2500 ans. Vous allez chercher une rosace sans vitraux, compter des anges de marbre au-dessus d'une ancienne agora grecque et décrypter une façade que personne n'a jamais réussi à lire entièrement, tandis que sous vos pieds continue de battre la Naples souterraine. Comptez un peu moins de 2 km, presque tout à plat.",
      it: "Napoli nasconde tre città sovrapposte — quella greca, quella romana e quella barocca — e le attraversate tutte e tre, letteralmente, camminando lungo Spaccanapoli, la strada dritta che taglia in due il centro storico da 2500 anni. Cercherete un rosone senza vetri, conterete angeli di marmo sopra un'antica agorà greca e decifrerete una facciata che nessuno è mai riuscito a leggere fino in fondo, mentre sotto i vostri piedi continua a pulsare la Napoli sotterranea. Sono poco meno di 2 km, quasi tutti in piano.",
    },
    acertijoMuestra: {
      es: "La mayoría de los rosetones góticos son de vidrio de colores, para dejar pasar la luz. Este es un 'rosone cieco': está cerrado y tallado en piedra maciza, con una figura esculpida en su centro en lugar de un cristal. ¿A quién representa esa figura, con la mano derecha alzada en gesto de bendición?",
      en: "Most Gothic rose windows are made of coloured glass, to let the light through. This one is a 'rosone cieco' — a blind rose window: sealed and carved from solid stone, with a sculpted figure at its centre instead of glass. Who does that figure represent, its right hand raised in blessing?",
      fr: "La plupart des rosaces gothiques sont en verre coloré, pour laisser passer la lumière. Celle-ci est un 'rosone cieco' — une rosace aveugle : elle est fermée et taillée dans la pierre massive, avec une figure sculptée en son centre à la place d'un vitrail. Qui représente cette figure, la main droite levée en signe de bénédiction ?",
      it: "La maggior parte dei rosoni gotici è di vetro colorato, per far passare la luce. Questo è un 'rosone cieco': è chiuso e scolpito nella pietra massiccia, con una figura al centro al posto del vetro. Chi rappresenta quella figura, con la mano destra alzata in gesto di benedizione?",
    },
  },
  {
    id: 'toulouse-capitole',
    ciudadSlug: 'toulouse',
    zona: 'Capitole · Basilique Saint-Sernin',
    duracionMin: 120,
    jugadoresMin: 1,
    jugadoresMax: 6,
    dificultad: /** @type {Dificultad} */ ('media'),
    numParadas: 8,
    moneda: 'EUR',
    idiomas: ['es', 'en', 'fr', 'it'],
    imgHero: 'assets/img/ciudades/toulouse-hero.webp',
    imgCard: 'assets/img/ciudades/toulouse-card.webp',
    imgMapa: 'assets/img/mapas/toulouse-capitole.svg',
    titulo: {
      es: 'La cruz de la Ciudad Rosa',
      en: 'The Cross of the Pink City',
      fr: 'La croix de la Ville Rose',
      it: 'La croce della Città Rosa',
    },
    puntoPartida: {
      es: 'Place du Capitole',
      en: 'Place du Capitole',
      fr: 'Place du Capitole',
      it: 'Place du Capitole',
    },
    resumen: {
      es: 'Toulouse se llama a sí misma la Ville Rose, la Ciudad Rosa, por el ladrillo que cubre casi todos sus edificios desde hace ochocientos años. Esta ruta recorre su centro histórico: desde la plaza donde gobernaban los antiguos capitouls hasta la basílica que guardaba reliquias para los peregrinos camino de Santiago, pasando por una iglesia con forma de fortaleza y un convento con una palmera de piedra en el techo. Son unos 2,5 km, todos llanos, por el corazón de la ciudad.',
      en: "Toulouse calls itself the Ville Rose, the Pink City, after the brick that has covered nearly all its buildings for eight hundred years. This route crosses its historic centre: from the square where the old capitouls once governed to the basilica that kept relics for pilgrims bound for Santiago de Compostela, by way of a church shaped like a fortress and a convent with a stone palm tree on its ceiling. It's about 2.5 km, all flat, through the heart of the city.",
      fr: "Toulouse se surnomme elle-même la Ville Rose, à cause de la brique qui recouvre presque tous ses bâtiments depuis huit siècles. Ce parcours traverse son centre historique : de la place où siégeaient les anciens capitouls jusqu'à la basilique qui conservait des reliques pour les pèlerins en route vers Compostelle, en passant par une église en forme de forteresse et un couvent avec un palmier de pierre au plafond. Comptez environ 2,5 km, tout à plat, en plein cœur de la ville.",
      it: "Toulouse si definisce da sé la Ville Rose, la Città Rosa, per il mattone che ricopre quasi tutti i suoi edifici da ottocento anni. Questo percorso attraversa il suo centro storico: dalla piazza dove un tempo governavano gli antichi capitouls fino alla basilica che custodiva reliquie per i pellegrini diretti a Santiago di Compostela, passando per una chiesa a forma di fortezza e un convento con una palma di pietra sul soffitto. Sono circa 2,5 km, tutti pianeggianti, nel cuore della città.",
    },
    acertijoMuestra: {
      es: 'Este medallón, de casi 18 metros de diámetro y 20 toneladas de bronce, lo instaló en 1995 el pintor y escultor tolosano Raymond Moretti. En el centro hay una cruz occitana —el símbolo de los antiguos condes de Toulouse—, y alrededor, un anillo con los doce signos del zodiaco. Fijaos solo en la cruz del centro: contad cuántas puntas tiene en total.',
      en: 'This medallion, nearly 18 metres across and cast from 20 tonnes of bronze, was installed in 1995 by the Toulouse-born painter and sculptor Raymond Moretti. At its centre is an Occitan cross — the symbol of the old counts of Toulouse — surrounded by a ring bearing the twelve signs of the zodiac. Look just at the cross in the middle: count how many points it has in total.',
      fr: "Ce médaillon, de près de 18 mètres de diamètre et coulé dans 20 tonnes de bronze, a été installé en 1995 par le peintre et sculpteur toulousain Raymond Moretti. En son centre se trouve une croix occitane — le symbole des anciens comtes de Toulouse —, entourée d'un anneau portant les douze signes du zodiaque. Regardez uniquement la croix au centre : comptez combien de pointes elle compte au total.",
      it: 'Questo medaglione, di quasi 18 metri di diametro e realizzato con 20 tonnellate di bronzo, fu installato nel 1995 dal pittore e scultore tolosano Raymond Moretti. Al centro c\'è una croce occitana — il simbolo degli antichi conti di Tolosa —, circondata da un anello con i dodici segni dello zodiaco. Osservate solo la croce al centro: contate quante punte ha in totale.',
    },
  },
  {
    id: 'berlin-mitte',
    ciudadSlug: 'berlin',
    zona: 'Gendarmenmarkt · Bebelplatz · Unter den Linden',
    duracionMin: 120,
    jugadoresMin: 1,
    jugadoresMax: 6,
    dificultad: /** @type {Dificultad} */ ('dificil'),
    numParadas: 8,
    moneda: 'EUR',
    idiomas: ['es', 'en', 'fr', 'it'],
    imgHero: 'assets/img/ciudades/berlin-hero.webp',
    imgCard: 'assets/img/ciudades/berlin-card.webp',
    imgMapa: 'assets/img/mapas/berlin-mitte.svg',
    titulo: {
      es: 'La memoria de Mitte',
      en: 'The Memory of Mitte',
      fr: 'La mémoire de Mitte',
      it: 'La memoria di Mitte',
    },
    puntoPartida: {
      es: 'Gendarmenmarkt, entre el Deutscher Dom y el Konzerthaus',
      en: 'Gendarmenmarkt, between the Deutscher Dom and the Konzerthaus',
      fr: 'Gendarmenmarkt, entre le Deutscher Dom et le Konzerthaus',
      it: 'Gendarmenmarkt, tra il Deutscher Dom e il Konzerthaus',
    },
    resumen: {
      es: 'Vais a caminar entre dos cúpulas gemelas que en realidad no se parecen en nada, por encima de una biblioteca vacía escondida bajo el empedrado, y frente a una diosa que sostiene un símbolo militar en lo alto de una puerta. Berlín no guarda su historia del siglo XX en vitrinas: la deja grabada en la piedra, el metal y el cristal de sus propias calles, a la altura de los ojos de quien se pare a mirar. Son casi 5 km, todo llano.',
      en: "You're about to walk between two twin domes that actually have nothing in common, over a hidden library that lost every one of its books, and face a goddess holding a military emblem high above a gate. Berlin doesn't keep its 20th-century history behind glass: it leaves it carved into the stone, metal and glass of its own streets, right at eye level for anyone who stops to look. It's nearly 5 km, all flat.",
      fr: "Vous allez marcher entre deux coupoles jumelles qui, en réalité, n'ont rien en commun, au-dessus d'une bibliothèque vide cachée sous les pavés, et face à une déesse qui tient un symbole militaire tout en haut d'une porte. Berlin ne garde pas son histoire du XXe siècle sous vitrine : elle la laisse gravée dans la pierre, le métal et le verre de ses propres rues, à hauteur des yeux de quiconque s'arrête pour regarder. Comptez près de 5 km, tout à plat.",
      it: "State per camminare tra due cupole gemelle che in realtà non si somigliano affatto, sopra una biblioteca vuota nascosta sotto il selciato, e davanti a una dea che regge un simbolo militare in cima a una porta. Berlino non custodisce la sua storia del Novecento dietro una vetrina: la lascia incisa nella pietra, nel metallo e nel vetro delle proprie strade, all'altezza degli occhi di chi si ferma a guardare. Sono quasi 5 km, tutti pianeggianti.",
    },
    acertijoMuestra: {
      es: 'Las dos iglesias que tenéis alrededor —la Französischer Dom a un lado, la Deutscher Dom al otro— no nacieron juntas ni se parecen en planta: la francesa se levantó en 1701-1705 para la comunidad de hugonotes que huía de Francia, y la alemana en 1701-1708 para la congregación luterana, cada una con su propio arquitecto. Y sin embargo, desde donde estáis, sus dos torres con cúpula son indistinguibles la una de la otra. Es porque se añadieron casi 80 años más tarde, por encargo del mismo rey y obra del mismo arquitecto, solo para que la plaza pareciera simétrica. Buscad el año en el rótulo o panel informativo junto a la entrada de una de las dos torres: ¿en qué año se terminaron?',
      en: "The two churches around you — the Französischer Dom on one side, the Deutscher Dom on the other — weren't born together and don't even share the same floor plan: the French one went up in 1701-1705 for the Huguenot community fleeing France, the German one in 1701-1708 for the Lutheran congregation, each with its own architect. And yet, from where you're standing, their two domed towers are indistinguishable from one another. That's because they were added almost 80 years later, commissioned by the same king and built by the same architect, purely so the square would look symmetrical. Find the year on the sign or information panel by the entrance of either tower: what year were they completed?",
      fr: "Les deux églises qui vous entourent — la Französischer Dom d'un côté, la Deutscher Dom de l'autre — ne sont pas nées ensemble et n'ont même pas le même plan : la française fut construite en 1701-1705 pour la communauté huguenote fuyant la France, l'allemande en 1701-1708 pour la congrégation luthérienne, chacune avec son propre architecte. Et pourtant, depuis où vous êtes, leurs deux tours à coupole sont impossibles à distinguer l'une de l'autre. C'est qu'elles ont été ajoutées près de 80 ans plus tard, commandées par le même roi et réalisées par le même architecte, uniquement pour donner à la place un air symétrique. Cherchez l'année indiquée sur le panneau d'information près de l'entrée de l'une des deux tours : en quelle année ont-elles été achevées ?",
      it: "Le due chiese che vi circondano — la Französischer Dom da un lato, la Deutscher Dom dall'altro — non sono nate insieme e non hanno nemmeno la stessa pianta: quella francese fu costruita nel 1701-1705 per la comunità ugonotta in fuga dalla Francia, quella tedesca nel 1701-1708 per la congregazione luterana, ciascuna con il proprio architetto. Eppure, da dove siete, le loro due torri con cupola sono indistinguibili l'una dall'altra. È perché furono aggiunte quasi 80 anni dopo, commissionate dallo stesso re e realizzate dallo stesso architetto, solo per dare alla piazza un aspetto simmetrico. Cercate l'anno riportato sul cartello o sul pannello informativo vicino all'ingresso di una delle due torri: in che anno furono completate?",
    },
  },
  {
    id: 'istanbul-sultanahmet',
    ciudadSlug: 'istanbul',
    zona: 'Sultanahmet',
    duracionMin: 120,
    jugadoresMin: 1,
    jugadoresMax: 6,
    dificultad: /** @type {Dificultad} */ ('media'),
    numParadas: 8,
    moneda: 'EUR',
    idiomas: ['es', 'en', 'fr', 'it'],
    imgHero: 'assets/img/ciudades/istanbul-hero.webp',
    imgCard: 'assets/img/ciudades/istanbul-card.webp',
    imgMapa: 'assets/img/mapas/istanbul-sultanahmet.svg',
    titulo: {
      es: 'La serpiente de Constantinopla',
      en: 'The Serpent of Constantinople',
      fr: 'Le serpent de Constantinople',
      it: 'Il serpente di Costantinopoli',
    },
    puntoPartida: {
      es: 'Plaza de Sultanahmet, en la explanada ajardinada entre Santa Sofía (Ayasofya) y la Mezquita Azul (Sultan Ahmed Camii)',
      en: 'Sultanahmet Square, on the landscaped ground between Hagia Sophia (Ayasofya) and the Blue Mosque (Sultan Ahmed Camii)',
      fr: 'Place de Sultanahmet, sur l\'esplanade plantée entre Sainte-Sophie (Ayasofya) et la Mosquée bleue (Sultan Ahmed Camii)',
      it: 'Piazza Sultanahmet, nello spiazzo verde tra Santa Sofia (Ayasofya) e la Moschea Blu (Sultan Ahmed Camii)',
    },
    resumen: {
      es: 'Estambul es la única ciudad del mundo que fue capital de dos imperios sin cambiar de sitio: Constantinopla y Estambul se pisan la una a la otra en cada esquina de Sultanahmet. Vais a contar cabezas que ya no están, descifrar un grafiti vikingo tallado por un mercenario de la guardia imperial bizantina, y encontrar un águila cristiana escondida sobre una puerta otomana. Son algo más de 3 km en total, con una única cuesta suave de subida hacia el Gran Bazar y la misma bajada de vuelta.',
      en: "Istanbul is the only city in the world that was capital to two empires without ever changing location: Constantinople and Istanbul tread on each other at every corner of Sultanahmet. You'll count heads that are no longer there, decode a Viking runic graffito carved by a mercenary of the Byzantine imperial guard, and track down a Christian eagle hiding above an Ottoman gate. It's just over 3 km all told, with one gentle climb up toward the Grand Bazaar and the same easy walk back down.",
      fr: "Istanbul est la seule ville au monde à avoir été la capitale de deux empires sans jamais changer d'emplacement : Constantinople et Istanbul se marchent dessus à chaque coin de rue de Sultanahmet. Vous allez compter des têtes qui ont disparu, déchiffrer un graffiti runique viking gravé par un mercenaire de la garde impériale byzantine, et débusquer un aigle chrétien caché au-dessus d'une porte ottomane. Comptez un peu plus de 3 km au total, avec une seule montée douce vers le Grand Bazar et la même descente au retour.",
      it: "Istanbul è l'unica città al mondo che è stata capitale di due imperi senza mai cambiare posto: Costantinopoli e Istanbul si calpestano a vicenda a ogni angolo di Sultanahmet. Conterete teste che non ci sono più, decifrerete un graffito runico vichingo inciso da un mercenario della guardia imperiale bizantina, e scoverete un'aquila cristiana nascosta sopra una porta ottomana. Sono poco più di 3 km in totale, con un'unica salita dolce verso il Gran Bazar e la stessa discesa al ritorno.",
    },
    acertijoMuestra: {
      es: 'Santa Sofía fue catedral cristiana durante casi mil años antes de convertirse en mezquita en 1453: los cuatro minaretes son un añadido otomano posterior, construidos en épocas distintas por sultanes distintos. Comparad los cuatro con calma: tres son iguales entre sí, del mismo color y material, pero el cuarto desentona claramente. ¿De qué color es el minarete que no combina con los otros tres?',
      en: "Hagia Sophia was a Christian cathedral for almost a thousand years before becoming a mosque in 1453: its four minarets are a later Ottoman addition, built at different times by different sultans. Compare all four carefully — three match each other in colour and material, but the fourth clearly doesn't fit. What colour is the minaret that doesn't match the other three?",
      fr: "Sainte-Sophie fut une cathédrale chrétienne pendant près de mille ans avant de devenir une mosquée en 1453 : ses quatre minarets sont un ajout ottoman plus tardif, construits à des époques différentes par des sultans différents. Comparez-les tous les quatre calmement : trois sont identiques entre eux, de même couleur et de même matériau, mais le quatrième détonne clairement. De quelle couleur est le minaret qui ne s'accorde pas avec les trois autres ?",
      it: "Santa Sofia fu cattedrale cristiana per quasi mille anni prima di diventare moschea nel 1453: i quattro minareti sono un'aggiunta ottomana successiva, costruiti in epoche diverse da sultani diversi. Confrontateli tutti e quattro con calma: tre sono identici tra loro, dello stesso colore e materiale, ma il quarto stona chiaramente. Di che colore è il minareto che non si intona con gli altri tre?",
    },
  },
  {
    id: 'roma-trastevere',
    ciudadSlug: 'roma',
    zona: 'Trastevere',
    duracionMin: 120,
    jugadoresMin: 1,
    jugadoresMax: 6,
    dificultad: /** @type {Dificultad} */ ('facil'),
    numParadas: 8,
    moneda: 'EUR',
    idiomas: ['es', 'en', 'fr', 'it'],
    imgHero: 'assets/img/ciudades/roma-trastevere-hero.webp',
    imgCard: 'assets/img/ciudades/roma-trastevere-card.webp',
    imgMapa: 'assets/img/mapas/roma-trastevere.svg',
    titulo: {
      es: 'La proa de Trastevere',
      en: 'The Prow of Trastevere',
      fr: 'La proue de Trastevere',
      it: 'La prua di Trastevere',
    },
    puntoPartida: {
      es: 'Piazza di Santa Maria in Trastevere, frente a la fachada de la basílica',
      en: "Piazza di Santa Maria in Trastevere, facing the basilica's façade",
      fr: 'Piazza di Santa Maria in Trastevere, face à la façade de la basilique',
      it: 'Piazza di Santa Maria in Trastevere, davanti alla facciata della basilica',
    },
    resumen: {
      es: 'Trastevere significa «al otro lado del Tíber», y este barrio ha vivido siempre así: de espaldas al poder de la otra orilla, con sus propios santos, su propio dios de la medicina y una isla con forma de barco en mitad del río. Vais a contar los lados de la fuente más vieja de Roma, a buscar una serpiente tallada en piedra y a mirar de cerca a una santa que lleva siglos durmiendo en mármol. Son unos 3 km, llanos, casi siempre junto al agua.',
      en: 'Trastevere means "across the Tiber," and this district has always lived that way: with its back to the power on the other bank, with its own saints, its own god of medicine, and an island shaped like a ship in the middle of the river. You\'ll count the sides of Rome\'s oldest fountain, hunt for a snake carved in stone, and look closely at a saint who has been sleeping in marble for centuries. It\'s about 3 km, flat, almost always by the water.',
      fr: 'Trastevere signifie « de l\'autre côté du Tibre », et ce quartier a toujours vécu ainsi : tournant le dos au pouvoir de l\'autre rive, avec ses propres saints, son propre dieu de la médecine et une île en forme de bateau au milieu du fleuve. Vous allez compter les côtés de la plus vieille fontaine de Rome, chercher un serpent gravé dans la pierre et regarder de près une sainte qui dort dans le marbre depuis des siècles. Comptez environ 3 km, plats, presque toujours au bord de l\'eau.',
      it: 'Trastevere significa "di là dal Tevere", e questo rione ha sempre vissuto così: con le spalle al potere dell\'altra sponda, con i suoi santi, il suo dio della medicina e un\'isola a forma di nave in mezzo al fiume. Conterete i lati della fontana più antica di Roma, cercherete un serpente scolpito nella pietra e guarderete da vicino una santa che dorme nel marmo da secoli. Sono circa 3 km, pianeggianti, quasi sempre lungo l\'acqua.',
    },
    acertijoMuestra: {
      es: 'Ese mosaico, del siglo XIII, muestra a la Virgen entronizada amamantando al Niño. A su alrededor hay una fila de mujeres, cada una con una lámpara de aceite en las manos: dos la llevan apagada, el resto encendida. Sin contar a la Virgen, ¿cuántas mujeres hay en total?',
      en: 'That 13th-century mosaic shows the enthroned Virgin nursing the Child. Around her stands a row of women, each holding an oil lamp: two hold theirs unlit, the rest lit. Not counting the Virgin, how many women are there in total?',
      fr: 'Cette mosaïque du XIIIe siècle montre la Vierge en majesté allaitant l\'Enfant. Autour d\'elle se tient une rangée de femmes, chacune tenant une lampe à huile : deux la portent éteinte, les autres allumée. Sans compter la Vierge, combien de femmes voyez-vous en tout ?',
      it: 'Quel mosaico, del XIII secolo, raffigura la Vergine in trono che allatta il Bambino. Intorno a lei si allinea una fila di donne, ciascuna con una lampada a olio in mano: due la portano spenta, le altre accesa. Senza contare la Vergine, quante donne ci sono in tutto?',
    },
  },
  {
    id: 'florencia-santacroce',
    ciudadSlug: 'florencia',
    zona: 'Santa Croce · Oltrarno',
    duracionMin: 120,
    jugadoresMin: 1,
    jugadoresMax: 6,
    dificultad: /** @type {Dificultad} */ ('dificil'),
    numParadas: 8,
    moneda: 'EUR',
    idiomas: ['es', 'en', 'fr', 'it'],
    imgHero: 'assets/img/ciudades/florencia-santacroce-hero.webp',
    imgCard: 'assets/img/ciudades/florencia-santacroce-card.webp',
    imgMapa: 'assets/img/mapas/florencia-santacroce.svg',
    titulo: {
      es: 'Las manos que hicieron Florencia',
      en: 'The Hands That Made Florence',
      fr: 'Les mains qui ont fait Florence',
      it: 'Le mani che hanno fatto Firenze',
    },
    puntoPartida: {
      es: 'Piazza Santa Croce, frente a la fachada de la Basilica di Santa Croce',
      en: 'Piazza Santa Croce, facing the facade of the Basilica di Santa Croce',
      fr: 'Piazza Santa Croce, face à la façade de la Basilica di Santa Croce',
      it: 'Piazza Santa Croce, davanti alla facciata della Basilica di Santa Croce',
    },
    resumen: {
      es: 'Cruzáis el río hacia el barrio que Florencia usaba para trabajar, no para posar en las fotos. Detrás de la fachada neogótica de Santa Croce hay una estrella que nadie plantó ahí por casualidad, y en una plaza donde antes corría sangre a puñetazos hay una fecha grabada en un disco de mármol que casi nadie mira. Cruzaréis el Ponte Vecchio de paso, sin deteneros —esa historia ya la cuenta otra ruta de esta misma ciudad—, para entrar en Oltrarno, el barrio de los artesanos. Son casi 2,5 km y ocho paradas: aquí la dificultad está en fijarse en lo pequeño, no en lo monumental.',
      en: "You're crossing the river into the district Florence used for work, not for photographs. Behind Santa Croce's neo-Gothic facade there's a star nobody put there by accident, and in a square where fists once drew blood, a date is carved into a marble disc that almost nobody notices. You'll cross the Ponte Vecchio along the way, without stopping — that story already belongs to another route in this same city — to enter Oltrarno, the artisans' district. It's just under 2.5 km and eight stops: here, the difficulty lies in noticing the small things, not the monumental ones.",
      fr: "Vous traversez le fleuve vers le quartier que Florence utilisait pour travailler, pas pour poser devant les photos. Derrière la façade néogothique de Santa Croce se cache une étoile que personne n'a placée là par hasard, et sur une place où l'on se battait autrefois à coups de poing, une date est gravée sur un disque de marbre que presque personne ne remarque. Vous traverserez le Ponte Vecchio en chemin, sans vous y arrêter — cette histoire, un autre parcours de cette même ville la raconte déjà —, pour entrer dans l'Oltrarno, le quartier des artisans. Comptez près de 2,5 km et huit étapes : ici, la difficulté est de remarquer les petits détails, pas les monuments.",
      it: "Attraversate il fiume verso il quartiere che Firenze usava per lavorare, non per posare nelle fotografie. Dietro la facciata neogotica di Santa Croce si nasconde una stella che nessuno ha messo lì per caso, e in una piazza dove un tempo si menavano pugni c'è una data incisa su un disco di marmo che quasi nessuno nota. Attraverserete il Ponte Vecchio di passaggio, senza fermarvi — quella storia la racconta già un altro percorso di questa stessa città —, per entrare nell'Oltrarno, il quartiere degli artigiani. Sono quasi 2,5 km e otto tappe: qui la difficoltà sta nel notare i dettagli piccoli, non i monumenti.",
    },
    acertijoMuestra: {
      es: 'Esta fachada parece medieval, a juego con el resto de la iglesia gótica, pero es en realidad del siglo XIX: la terminó en 1863 el arquitecto Niccolò Matas, de origen judío, casi 600 años después de que empezara a construirse la basílica. En el centro exacto del triángulo que corona la fachada, entre la decoración geométrica de mármol, Matas incluyó una figura que nadie esperaría encontrar en la portada de una iglesia franciscana: una estrella formada por dos triángulos superpuestos, uno invertido sobre el otro. ¿Cuántas puntas tiene esa estrella?',
      en: "This facade looks medieval, matching the rest of the Gothic church, but it's actually 19th-century: it was finished in 1863 by architect Niccolò Matas, who was Jewish, almost 600 years after construction of the basilica began. Right at the centre of the triangular gable, amid the geometric marble decoration, Matas included a figure nobody would expect to find on the front of a Franciscan church: a star formed by two overlapping triangles, one inverted over the other. How many points does that star have?",
      fr: "Cette façade semble médiévale, assortie au reste de l'église gothique, mais elle date en réalité du XIXe siècle : elle fut achevée en 1863 par l'architecte Niccolò Matas, d'origine juive, près de 600 ans après le début de la construction de la basilique. Au centre exact du triangle qui couronne la façade, au milieu du décor géométrique de marbre, Matas a glissé une figure que personne ne s'attendrait à trouver sur le portail d'une église franciscaine : une étoile formée de deux triangles superposés, l'un inversé sur l'autre. Combien de pointes compte cette étoile ?",
      it: "Questa facciata sembra medievale, in tono con il resto della chiesa gotica, ma è in realtà ottocentesca: fu completata nel 1863 dall'architetto Niccolò Matas, di origine ebraica, quasi 600 anni dopo l'inizio della costruzione della basilica. Al centro esatto del triangolo che corona la facciata, tra la decorazione geometrica di marmo, Matas inserì una figura che nessuno si aspetterebbe di trovare sul portale di una chiesa francescana: una stella formata da due triangoli sovrapposti, uno capovolto sull'altro. Quante punte ha quella stella?",
    },
  },
  {
    id: 'paris-montmartre',
    ciudadSlug: 'paris',
    zona: 'Montmartre',
    duracionMin: 120,
    jugadoresMin: 1,
    jugadoresMax: 6,
    dificultad: /** @type {Dificultad} */ ('facil'),
    numParadas: 8,
    moneda: 'EUR',
    idiomas: ['es', 'en', 'fr', 'it'],
    imgHero: 'assets/img/ciudades/paris-montmartre-hero.webp',
    imgCard: 'assets/img/ciudades/paris-montmartre-card.webp',
    imgMapa: 'assets/img/mapas/paris-montmartre.svg',
    titulo: {
      es: 'La colina blanca de Montmartre',
      en: 'The White Hill of Montmartre',
      fr: 'La Butte blanche de Montmartre',
      it: 'La collina bianca di Montmartre',
    },
    puntoPartida: {
      es: 'Parvis de la Basílica del Sagrado Corazón (Sacré-Cœur), en lo alto de la escalinata monumental',
      en: 'Parvis of the Basilica of the Sacré-Cœur, at the top of the monumental staircase',
      fr: "Parvis de la basilique du Sacré-Cœur, en haut de l'escalier monumental",
      it: 'Sagrato della Basilica del Sacro Cuore (Sacré-Cœur), in cima alla scalinata monumentale',
    },
    resumen: {
      es: 'Montmartre fue un pueblo independiente, con ayuntamiento y viñedos propios, hasta que París se lo anexionó en 1860 para convertirlo en su distrito 18. Sobre esta colina, la más alta de la ciudad, se instalaron después pintores sin apenas dinero, un cabaret con un conejo por emblema y el único viñedo que todavía se cultiva dentro de París, mientras una basílica blanca crecía despacio en la cima. Son cerca de 2,5 km, con cuestas y tramos de escalera: Montmartre es, literalmente, una colina.',
      en: "Montmartre was an independent village, with its own town hall and vineyards, until Paris annexed it in 1860 to make it the 18th arrondissement. On this hill, the highest point in the city, painters with barely any money later moved in, along with a cabaret with a rabbit for an emblem and the only vineyard still growing inside Paris, while a white basilica slowly rose on the summit. It's about 2.5 km, with some slopes and stretches of stairs: Montmartre is, literally, a hill.",
      fr: "Montmartre fut un village indépendant, avec sa propre mairie et ses propres vignes, jusqu'à son annexion par Paris en 1860, qui en fit le 18e arrondissement. Sur cette colline, le point culminant de la capitale, s'installèrent ensuite des peintres sans le sou, un cabaret avec un lapin pour emblème et l'unique vigne encore cultivée à l'intérieur de Paris, tandis qu'une basilique blanche s'élevait lentement à son sommet. Comptez environ 2,5 km, avec quelques côtes et des escaliers : Montmartre est, au sens propre, une colline.",
      it: "Montmartre fu un villaggio indipendente, con un proprio municipio e proprie vigne, finché Parigi non lo annesse nel 1860 per farne il suo 18° arrondissement. Su questa collina, il punto più alto della città, si stabilirono poi pittori squattrinati, un cabaret con un coniglio come emblema e l'unica vigna ancora coltivata dentro Parigi, mentre una basilica bianca cresceva lentamente sulla cima. Sono circa 2,5 km, con qualche salita e tratti di scalinata: Montmartre è, letteralmente, una collina.",
    },
    acertijoMuestra: {
      es: 'Esta basílica es más joven de lo que parece: se empezó a construir en 1875 y no se consagró hasta 1919, así que es casi tan reciente como la Torre Eiffel. Se levantó con una piedra caliza especial traída de Château-Landon que, cada vez que llueve, segrega su propia cal y se limpia sola: por eso sigue tan blanca más de un siglo después, casi sin restauraciones. Fijaos ahora en el pórtico de la entrada principal: sobre él hay dos estatuas de bronce, cada una montada a caballo. ¿Cuántas estatuas ecuestres flanquean la entrada?',
      en: "This basilica is younger than it looks: construction began in 1875 and it wasn't consecrated until 1919, making it almost as recent as the Eiffel Tower. It was built with a special limestone brought from Château-Landon that secretes its own calcite every time it rains and effectively cleans itself, which is why it's still this white more than a century later, with barely any restoration. Now look at the portico of the main entrance: above it stand two bronze statues, each mounted on horseback. How many equestrian statues flank the entrance?",
      fr: "Cette basilique est plus jeune qu'il n'y paraît : sa construction a commencé en 1875 et elle n'a été consacrée qu'en 1919, ce qui en fait un édifice presque aussi récent que la tour Eiffel. Elle a été bâtie dans une pierre calcaire très particulière, extraite à Château-Landon, qui sécrète sa propre calcite à chaque pluie et se nettoie ainsi toute seule : voilà pourquoi elle reste aussi blanche plus d'un siècle après, presque sans restauration. Regardez maintenant le portique de l'entrée principale : au-dessus se dressent deux statues de bronze, chacune à cheval. Combien de statues équestres encadrent l'entrée ?",
      it: "Questa basilica è più giovane di quanto sembri: la costruzione iniziò nel 1875 e fu consacrata solo nel 1919, il che la rende quasi coetanea della Torre Eiffel. Fu costruita con una particolare pietra calcarea proveniente da Château-Landon che, ogni volta che piove, secerne la propria calcite e si pulisce da sola: per questo resta così bianca più di un secolo dopo, quasi senza restauri. Guardate ora il portico dell'ingresso principale: sopra di esso si trovano due statue di bronzo, ciascuna a cavallo. Quante statue equestri affiancano l'ingresso?",
    },
  },
];

// El precio se deriva de dificultad automáticamente: así es estructuralmente
// imposible que un precio se desincronice de su nivel.
for (const ruta of RUTAS) {
  ruta.precio = PRECIOS_POR_DIFICULTAD[ruta.dificultad].importe;
}

export function ciudadPorSlug(slug) {
  return CIUDADES.find((c) => c.slug === slug) || null;
}

export function rutasPorCiudad(slug) {
  return RUTAS.filter((r) => r.ciudadSlug === slug);
}

export function rutaPorId(id) {
  return RUTAS.find((r) => r.id === id) || null;
}

/** Otras rutas de la misma ciudad, sin incluir `rutaId`. */
export function rutasHermanas(rutaId) {
  const ruta = rutaPorId(rutaId);
  if (!ruta) return [];
  return rutasPorCiudad(ruta.ciudadSlug).filter((r) => r.id !== rutaId);
}

/**
 * `cantidad` ciudades activas distintas de `slugActual`, para enlaces
 * cruzados entre ciudades. Determinista: siempre las siguientes en el
 * catálogo tras la actual (con vuelta al principio), así cada ciudad
 * enlaza a un grupo distinto sin lógica de "cercanía" que mantener.
 */
export function ciudadesRelacionadas(slugActual, cantidad = 3) {
  const activas = CIUDADES.filter((c) => c.activa);
  const indiceActual = activas.findIndex((c) => c.slug === slugActual);
  if (indiceActual === -1) return activas.filter((c) => c.slug !== slugActual).slice(0, cantidad);

  const resultado = [];
  for (let i = 1; resultado.length < cantidad && i <= activas.length - 1; i++) {
    resultado.push(activas[(indiceActual + i) % activas.length]);
  }
  return resultado;
}

/**
 * Un post de blog por ciudad — curiosidades reales que enlazan a la ruta
 * de pago correspondiente. `id` coincide con `ciudadSlug` (un post por
 * ciudad). `enlacesRutas` son 1 o 2 ids de RUTAS; `cierre` es el párrafo
 * final con placeholders {ruta1}/{ruta2} que el renderizador sustituye
 * por el enlace editorial real (ver js/historia.js).
 */
export const HISTORIAS = [
  {
    id: 'barcelona',
    ciudadSlug: 'barcelona',
    imgHero: 'assets/img/ciudades/barcelona-hero.webp',
    titulo: { es: '¿Por qué el Barrio Gótico no es tan gótico como parece?', en: "Why Isn't the Gothic Quarter as Gothic as It Looks?", fr: "Pourquoi le Barri Gòtic n'est-il pas aussi gothique qu'il en a l'air ?", it: 'Perché il Quartiere Gotico non è così gotico come sembra?' },
    resumen: {
      es: 'El Pont del Bisbe parece gótico del siglo XV, pero es de 1928: buena parte del Barri Gòtic se construyó para la Exposición de 1929.',
      en: 'The Pont del Bisbe looks like 15th-century Gothic, but it dates from 1928: much of the Barri Gòtic was built for the 1929 Exposition.',
      fr: "Le Pont del Bisbe a l'air gothique du XVe siècle, mais il date de 1928 : une bonne partie du Barri Gòtic a été construite pour l'Exposition de 1929.",
      it: "Il Pont del Bisbe sembra un ponte gotico del Quattrocento, ma è del 1928: buona parte del Barri Gòtic fu costruita per l'Esposizione del 1929.",
    },
    secciones: [
      {
        titulo: { es: 'Un puente que nació en 1928', en: 'A bridge born in 1928', fr: 'Un pont né en 1928', it: 'Un ponte nato nel 1928' },
        texto: {
          es: 'El Pont del Bisbe es la imagen más fotografiada del Barri Gòtic: arco calado, gárgolas y, bajo el arco central, una calavera de piedra que nadie ha explicado nunca del todo. Parece del siglo XV. Es de 1928. Lo diseñó Joan Rubió i Bellver, discípulo de Gaudí, en estilo gótico flamígero, para dar un paso elevado y privado entre el Palau de la Generalitat y la Casa dels Canonges, donde vivían los presidentes catalanes. Cuando presentó el proyecto, parte de Barcelona ya lo criticó por falso: la ciudad entera se preparaba para recibir la Exposición Internacional de 1929 y necesitaba un barrio medieval fotogénico a tiempo.',
          en: "The Pont del Bisbe is the most photographed image in the Barri Gòtic: pierced tracery, gargoyles, and, under the central arch, a stone skull that no one has ever fully explained. It looks like it's from the 15th century. It's from 1928. It was designed by Joan Rubió i Bellver, a disciple of Gaudí, in Flamboyant Gothic style, to create a private elevated walkway between the Palau de la Generalitat and the Casa dels Canonges, where Catalan presidents lived. When he unveiled the project, part of Barcelona already criticized it as fake: the whole city was getting ready for the 1929 International Exposition and needed a photogenic medieval quarter in time.",
          fr: "Le Pont del Bisbe est l'image la plus photographiée du Barri Gòtic : arc ajouré, gargouilles et, sous l'arche centrale, un crâne de pierre que personne n'a jamais tout à fait expliqué. Il semble dater du XVe siècle. Il date en réalité de 1928. C'est Joan Rubió i Bellver, disciple de Gaudí, qui l'a dessiné dans un style gothique flamboyant, pour créer un passage surélevé et privé entre le Palau de la Generalitat et la Casa dels Canonges, où logeaient les présidents catalans. Quand il présenta le projet, une partie de Barcelone le critiqua déjà comme un faux : la ville entière se préparait à accueillir l'Exposition internationale de 1929 et avait besoin d'un quartier médiéval photogénique, et vite.",
          it: "Il Pont del Bisbe è l'immagine più fotografata del Barri Gòtic: arco traforato, doccioni e, sotto l'arcata centrale, un teschio di pietra che nessuno ha mai spiegato del tutto. Sembra del Quattrocento. È del 1928. Lo progettò Joan Rubió i Bellver, allievo di Gaudí, in stile gotico fiammeggiante, per creare un passaggio sopraelevato e privato tra il Palau de la Generalitat e la Casa dels Canonges, dove vivevano i presidenti catalani. Quando presentò il progetto, una parte di Barcellona lo criticò già come falso: l'intera città si preparava ad accogliere l'Esposizione Internazionale del 1929 e aveva bisogno di un quartiere medievale fotogenico, in tempo per l'evento.",
        },
      },
      {
        titulo: { es: 'El arquitecto que lo desmintió', en: 'The architect who debunked it', fr: "L'architecte qui l'a démenti", it: "L'architetto che lo smentì" },
        texto: {
          es: 'Rubió i Bellver no se hacía ilusiones sobre lo que estaba construyendo. Él mismo escribió, años más tarde, que «en el Barrio Gótico no hay más de seis casas que con buena voluntad pueden denominarse góticas». Lo dijo el hombre que había firmado uno de los edificios más fotografiados del barrio, y que sabía, mejor que nadie, cuánto de ese aire medieval era piedra nueva cortada para parecer vieja.',
          en: 'Rubió i Bellver had no illusions about what he was building. He himself wrote, years later, that "in the Gothic Quarter there are no more than six houses that can, with any good will, be called Gothic." Those words came from the very man who had signed off on one of the district\'s most photographed buildings, and who knew, better than anyone, how much of that medieval air was new stone cut to look old.',
          fr: "Rubió i Bellver ne se faisait aucune illusion sur ce qu'il était en train de construire. Il écrivit lui-même, des années plus tard, que « dans le Barri Gòtic, il n'y a pas plus de six maisons qu'on puisse, de bonne volonté, qualifier de gothiques ». Ces mots venaient de l'homme qui avait signé l'un des édifices les plus photographiés du quartier, et qui savait, mieux que quiconque, combien de cet air médiéval n'était que pierre neuve taillée pour paraître ancienne.",
          it: "Rubió i Bellver non si faceva illusioni su cosa stesse costruendo. Fu lui stesso a scrivere, anni dopo, che «nel Quartiere Gotico non ci sono più di sei case che, con un po' di buona volontà, si possano definire gotiche». Lo disse l'uomo che aveva firmato uno degli edifici più fotografati del quartiere, e che sapeva, meglio di chiunque altro, quanto di quell'aria medievale fosse pietra nuova tagliata per sembrare vecchia.",
        },
      },
      {
        titulo: { es: 'Un plano de 1408 que se construyó en el siglo XX', en: 'A 1408 blueprint built in the 20th century', fr: 'Un plan de 1408 construit au XXe siècle', it: 'Un progetto del 1408 costruito nel Novecento' },
        texto: {
          es: 'La Catedral de Barcelona sí es gótica, del siglo XIV. Su fachada principal —la que da a la Plaça Nova— no lo es: se construyó entre 1906 y 1913, financiada por el banquero Manuel Girona, sobre un diseño de 1408 firmado por el maestro Carlí que en su momento jamás se llegó a levantar por falta de dinero. Es decir: la fachada "gótica" más fotografiada de Barcelona no es la copia de un edificio medieval real, es la construcción tardía de un plano medieval que nunca fue más que un plano. Durante quinientos años la Catedral tuvo ahí un muro desnudo; hoy tiene agujas, rosetón y santos de piedra recién tallada.',
          en: 'Barcelona Cathedral is genuinely Gothic, from the 14th century. Its main façade — the one facing Plaça Nova — is not: it was built between 1906 and 1913, financed by banker Manuel Girona, following a 1408 design by master builder Carlí that was never actually raised at the time for lack of money. In other words: Barcelona\'s most photographed "Gothic" façade isn\'t a copy of a real medieval building, it\'s the late construction of a medieval blueprint that had never been more than a blueprint. For five hundred years the Cathedral had a bare wall there; today it has spires, a rose window, and saints carved in freshly cut stone.',
          fr: "La cathédrale de Barcelone, elle, est bien gothique, du XIVe siècle. Sa façade principale — celle qui donne sur la Plaça Nova — ne l'est pas : elle fut construite entre 1906 et 1913, financée par le banquier Manuel Girona, d'après un dessin de 1408 signé par le maître Carlí, un projet qui, à l'époque, ne fut jamais réalisé faute d'argent. Autrement dit : la façade « gothique » la plus photographiée de Barcelone n'est pas la copie d'un édifice médiéval réel, c'est la construction tardive d'un plan médiéval qui n'avait jamais été autre chose qu'un plan. Pendant cinq cents ans, la cathédrale n'eut là qu'un mur nu ; aujourd'hui, elle a des flèches, une rosace et des saints de pierre à peine taillée.",
          it: 'La Cattedrale di Barcellona è davvero gotica, del Trecento. La sua facciata principale — quella che dà sulla Plaça Nova — no: fu costruita tra il 1906 e il 1913, finanziata dal banchiere Manuel Girona, su un progetto del 1408 firmato dal maestro Carlí che a suo tempo non venne mai realizzato per mancanza di fondi. In altre parole: la facciata "gotica" più fotografata di Barcellona non è la copia di un edificio medievale reale, è la costruzione tardiva di un disegno medievale che non era mai stato altro che un disegno su carta. Per cinquecento anni la Cattedrale ebbe lì un muro spoglio; oggi ha guglie, rosone e santi di pietra appena scolpita.',
        },
      },
      {
        titulo: { es: 'La casa que cambió de dirección', en: 'The house that changed address', fr: "La maison qui a changé d'adresse", it: 'La casa che cambiò indirizzo' },
        texto: {
          es: 'No todo es maquillaje de los años veinte: la Casa Padellàs, en la Plaça del Rei, es un palacio auténtico del siglo XVI. Pero tampoco estuvo siempre ahí. La desmontaron piedra por piedra de su ubicación original, en el carrer dels Mercaders, y la reconstruyeron en 1931 para salvarla de la apertura de la Via Laietana. Al levantar sus nuevos cimientos aparecieron restos de la Barcino romana — el hallazgo que hoy se recorre bajo tierra en el Museu d\'Història de Barcelona. Ni los edificios genuinamente antiguos están donde los construyeron.',
          en: "Not everything is 1920s makeup: Casa Padellàs, on Plaça del Rei, is a genuine 16th-century palace. But it wasn't always there either. It was taken apart stone by stone from its original site, on Carrer dels Mercaders, and rebuilt in 1931 to save it from the opening of Via Laietana. Digging its new foundations turned up remains of Roman Barcino — the find you can now walk through underground at the Museu d'Història de Barcelona. Even the genuinely old buildings aren't where they were built.",
          fr: "Tout n'est pas du maquillage des années vingt : la Casa Padellàs, sur la Plaça del Rei, est un authentique palais du XVIe siècle. Mais elle non plus n'a pas toujours été là. On l'a démontée pierre par pierre de son emplacement d'origine, sur le carrer dels Mercaders, pour la reconstruire en 1931 et la sauver du percement de la Via Laietana. En creusant ses nouvelles fondations apparurent des vestiges de la Barcino romaine — la découverte que l'on parcourt aujourd'hui sous terre, au Museu d'Història de Barcelona. Même les édifices authentiquement anciens ne se trouvent pas là où on les a construits.",
          it: "Non tutto è trucco anni Venti: la Casa Padellàs, nella Plaça del Rei, è un palazzo autentico del Cinquecento. Ma non è sempre stata lì. Fu smontata pietra per pietra dalla sua posizione originale, nel carrer dels Mercaders, e ricostruita nel 1931 per salvarla dall'apertura della Via Laietana. Scavando le nuove fondamenta emersero resti della Barcino romana — il ritrovamento che oggi si visita sottoterra nel Museu d'Història de Barcelona. Nemmeno gli edifici genuinamente antichi sono rimasti dove furono costruiti.",
        },
      },
      {
        titulo: { es: 'Una ciudad maquillada para una Exposición', en: 'A city made up for an Exposition', fr: 'Une ville maquillée pour une Exposition', it: "Una città truccata per un'Esposizione" },
        texto: {
          es: 'Nada de esto fue improvisado. La Sociedad de Atracción de Forasteros, el organismo que promocionaba Barcelona desde 1908, necesitaba un barrio antiguo presentable antes de 1929; el ayuntamiento reubicó portadas, ventanales y remates góticos de otros edificios de la ciudad y encargó piezas nuevas donde faltaban. Décadas después, en 1958, el propio arquitecto municipal responsable de buena parte de esas reformas, Adolf Florensa, admitió por escrito que el nombre "Barrio Gótico" había sido, sobre todo, un reclamo turístico.',
          en: 'None of this was improvised. The Sociedad de Atracción de Forasteros, the body that had been promoting Barcelona since 1908, needed a presentable old quarter before 1929; the city council relocated Gothic doorways, windows and finials from other buildings around the city and commissioned new pieces to fill the gaps. Decades later, in 1958, Adolf Florensa, the municipal architect responsible for much of that work, admitted in writing that the name "Barrio Gótico" had been, above all, a tourist marketing device.',
          fr: "Rien de tout cela ne fut improvisé. La Sociedad de Atracción de Forasteros, l'organisme qui faisait la promotion de Barcelone depuis 1908, avait besoin d'un quartier ancien présentable avant 1929 ; la mairie fit déplacer des portails, des fenêtres et des couronnements gothiques provenant d'autres édifices de la ville, et commanda des pièces neuves là où il en manquait. Des décennies plus tard, en 1958, l'architecte municipal lui-même responsable d'une bonne partie de ces travaux, Adolf Florensa, reconnut par écrit que l'appellation « quartier gothique » avait été, avant tout, un argument touristique.",
          it: 'Niente di tutto questo fu improvvisato. La Sociedad de Atracción de Forasteros, l\'ente che promuoveva Barcellona dal 1908, aveva bisogno di un quartiere antico presentabile prima del 1929; il comune ricollocò portali, finestre e coronamenti gotici presi da altri edifici della città e commissionò pezzi nuovi dove mancavano. Decenni dopo, nel 1958, lo stesso architetto comunale responsabile di buona parte di quei restauri, Adolf Florensa, ammise per iscritto che il nome "Quartiere Gotico" era stato, soprattutto, un richiamo turistico.',
        },
      },
      {
        titulo: { es: 'Lo auténtico, camuflado entre lo falso', en: 'The real thing, hidden among the fake', fr: 'Le authentique, camouflé parmi le faux', it: "L'autentico, camuffato tra il falso" },
        texto: {
          es: 'La confusión no es que el Barri Gòtic sea falso de principio a fin: es que mezcla capas reales de dos mil años con un barniz de los años veinte que las iguala todas a simple vista. Bajo ese barniz hay una puerta romana de la Barcino de Augusto, un antiguo call judío anterior a 1391 y muros que todavía muestran el impacto de bombas de 1938. Lo gótico auténtico existe en el barrio, pero es minoría; lo romano y lo medieval real conviven, sin cartel que lo anuncie, con la fachada que se construyó pensando en los visitantes de 1929.',
          en: "The confusion isn't that the Barri Gòtic is fake from start to finish: it's that it mixes two thousand years of real layers with a 1920s varnish that makes them all look alike at first glance. Under that varnish lies a Roman gate from Augustus's Barcino, an old Jewish quarter dating from before 1391, and walls that still show the impact of 1938 bombs. Genuine Gothic architecture does exist in the district, but it's a minority; the real Roman and medieval remains sit, with no sign announcing it, alongside the façade that was built with 1929's visitors in mind.",
          fr: "La confusion n'est pas que le Barri Gòtic soit faux de bout en bout : c'est qu'il mélange des strates réelles de deux mille ans avec un vernis des années vingt qui les uniformise toutes à l'œil nu. Sous ce vernis se cachent une porte romaine de la Barcino d'Auguste, un ancien call juif antérieur à 1391 et des murs qui portent encore l'empreinte des bombes de 1938. Le gothique authentique existe bien dans le quartier, mais il est minoritaire ; le romain et le médiéval réel cohabitent, sans la moindre pancarte pour le signaler, avec la façade construite en pensant aux visiteurs de 1929.",
          it: "L'equivoco non è che il Barri Gòtic sia falso dall'inizio alla fine: è che mescola strati reali di duemila anni con una verniciatura anni Venti che li rende tutti uguali a prima vista. Sotto quella verniciatura c'è una porta romana della Barcino di Augusto, un antico call ebraico anteriore al 1391 e muri che mostrano ancora i segni delle bombe del 1938. Il gotico autentico esiste nel quartiere, ma è minoranza; il romano e il medievale veri convivono, senza un cartello che lo annunci, con la facciata costruita pensando ai visitatori del 1929.",
        },
      },
    ],
    enlacesRutas: ['barcelona-gotic'],
    cierre: {
      es: 'Nada de esto le resta encanto al Gòtic: solo reparte el misterio en más capas de las que parece a primera vista. {ruta1} recorre ocho paradas por este mismo barrio, entre piedra romana, judía, gótica de verdad y gótica de 1928, y no avisa de antemano cuál es cuál: eso hay que descubrirlo caminando.',
      en: "None of this makes the Gòtic any less charming: it just spreads the mystery across more layers than it seems to have at first sight. {ruta1} covers eight stops through this same district, moving between Roman stone, Jewish stone, real Gothic and 1928 Gothic, and it never tells you upfront which is which — that's something you have to discover on foot.",
      fr: "Rien de tout cela n'enlève de charme au Gòtic : cela ne fait que répartir le mystère sur davantage de strates qu'il n'y paraît au premier regard. {ruta1} parcourt huit étapes dans ce même quartier, entre pierre romaine, juive, gothique pour de vrai et gothique de 1928, sans jamais annoncer à l'avance laquelle est laquelle : cela, il faut le découvrir en marchant.",
      it: 'Nulla di tutto questo toglie fascino al Gòtic: distribuisce solo il mistero su più strati di quanto sembri a prima vista. {ruta1} attraversa otto tappe in questo stesso quartiere, tra pietra romana, ebraica, gotica vera e gotica del 1928, senza avvisare in anticipo quale sia quale: questo bisogna scoprirlo camminando.',
    },
  },
  {
    id: 'roma',
    ciudadSlug: 'roma',
    imgHero: 'assets/img/ciudades/roma-trastevere-hero.webp',
    titulo: {
      es: 'Lo que Trastevere lleva siglos mostrando sin que nadie mire',
      en: 'What Trastevere Has Been Showing for Centuries, Unnoticed', fr: 'Ce que Trastevere expose depuis des siècles sans que personne ne regarde', it: 'Quello che Trastevere mostra da secoli senza che nessuno guardi',
    },
    resumen: {
      es: 'Trastevere quedó fuera de las murallas de Roma durante siglos, y sus vecinos aún hoy se sienten más trasteverinos que romanos.',
      en: 'Trastevere sat outside Rome\'s walls for centuries, and its residents still feel more Trasteverino than Roman.', fr: 'Trastevere est resté hors des murailles de Rome pendant des siècles, et ses habitants se sentent aujourd\'hui encore plus trasteverini que romains.', it: 'Trastevere restò fuori dalle mura di Roma per secoli, e ancora oggi i suoi abitanti si sentono più trasteverini che romani.',
    },
    secciones: [
      {
        titulo: { es: 'Romanos, pero fuera de las murallas', en: 'Roman, but outside the walls', fr: 'Romains, mais hors des murailles', it: 'Romani, ma fuori dalle mura' },
        texto: {
          es: 'Cuando Augusto organizó Roma en catorce regiones administrativas, hacia el año 7 a.C., Trastevere entró en el mapa como la Regio XIV, la de mayor perímetro de las catorce. Y aun así quedó fuera de la muralla Serviana, la primera gran muralla de la ciudad, y fuera del pomerium, el límite sagrado que separaba lo que contaba oficialmente como Roma de lo que no. El barrio no quedó cerrado dentro de una muralla hasta que el emperador Aureliano levantó la suya, entre los años 270 y 275 d.C. Generaciones enteras de trasteverinos vivieron y murieron siendo romanos sobre el papel, pero fuera de Roma en los hechos.',
          en: 'When Augustus organized Rome into fourteen administrative regions, around 7 BC, Trastevere made the map as Regio XIV, the largest in area of the fourteen. And yet it stood outside the Servian Wall, the city\'s first great wall, and outside the pomerium, the sacred boundary that separated what officially counted as Rome from what didn\'t. The district wasn\'t enclosed within a wall until Emperor Aurelian built his own, between 270 and 275 AD. Whole generations of Trasteverini lived and died Roman on paper, but outside Rome in practice.', fr: "Quand Auguste organisa Rome en quatorze régions administratives, vers l'an 7 av. J.-C., Trastevere entra sur la carte comme la Regio XIV, celle qui avait le plus grand périmètre des quatorze. Et pourtant, il resta hors de la muraille servienne, la première grande enceinte de la ville, et hors du pomerium, la limite sacrée qui séparait ce qui comptait officiellement comme Rome de ce qui n'en faisait pas partie. Le quartier ne fut enfermé dans une muraille que lorsque l'empereur Aurélien éleva la sienne, entre 270 et 275 apr. J.-C. Des générations entières de trasteverini vécurent et moururent romaines sur le papier, mais hors de Rome dans les faits.", it: "Quando Augusto organizzò Roma in quattordici regioni amministrative, verso il 7 a.C., Trastevere entrò nella mappa come Regio XIV, quella con il perimetro maggiore delle quattordici. Eppure rimase fuori dalle Mura Serviane, la prima grande cinta muraria della città, e fuori dal pomerium, il confine sacro che separava ciò che contava ufficialmente come Roma da ciò che non contava. Il quartiere non fu racchiuso dentro una cinta muraria fino a quando l'imperatore Aureliano non costruì la sua, tra il 270 e il 275 d.C. Intere generazioni di trasteverini vissero e morirono romani sulla carta, ma fuori da Roma nei fatti.",
        },
      },
      {
        titulo: { es: 'Un barrio de puerto, no de patricios', en: 'A port district, not a patrician one', fr: 'Un quartier de port, pas de patriciens', it: 'Un quartiere di porto, non di patrizi' },
        texto: {
          es: 'Mientras las colinas de la otra orilla se llenaban de foros, templos y residencias patricias, Trastevere creció alrededor del agua: pescadores, marineros y estibadores que descargaban en el Ripa Grande las mercancías que subían desde el puerto de Ostia. Ya en tiempos de la República era, sobre todo, un barrio de trabajadores del río, no el lugar donde un romano con ambiciones políticas elegía construir su casa. Esa vocación portuaria y artesanal marcó su carácter durante siglos: Trastevere fue, desde el principio, el barrio que hacía funcionar a Roma, no el que la representaba.',
          en: 'While the hills on the other bank filled up with forums, temples and patrician residences, Trastevere grew up around the water: fishermen, sailors and dockworkers unloading at the Ripa Grande the goods shipped up from the port of Ostia. Already in Republican times it was, above all, a district of river workers, not the place where a Roman with political ambitions chose to build his house. That working, portside character shaped it for centuries: from the start, Trastevere was the district that made Rome run, not the one that represented it.', fr: "Tandis que les collines de l'autre rive se couvraient de forums, de temples et de résidences patriciennes, Trastevere grandissait autour de l'eau : pêcheurs, marins et dockers qui déchargeaient au Ripa Grande les marchandises remontées depuis le port d'Ostie. Dès l'époque de la République, c'était avant tout un quartier de travailleurs du fleuve, pas l'endroit où un Romain aux ambitions politiques choisissait de bâtir sa maison. Cette vocation portuaire et artisanale a marqué son caractère pendant des siècles : Trastevere fut, dès le départ, le quartier qui faisait fonctionner Rome, pas celui qui la représentait.", it: 'Mentre le colline sull\'altra sponda si riempivano di fori, templi e residenze patrizie, Trastevere cresceva intorno all\'acqua: pescatori, marinai e scaricatori che scaricavano al Ripa Grande le merci che risalivano dal porto di Ostia. Già in epoca repubblicana era, soprattutto, un quartiere di lavoratori del fiume, non il luogo dove un romano con ambizioni politiche sceglieva di costruire la propria casa. Questa vocazione portuale e artigiana ne segnò il carattere per secoli: Trastevere fu, fin dall\'inizio, il quartiere che faceva funzionare Roma, non quello che la rappresentava.',
        },
      },
      {
        titulo: { es: 'Los primeros extranjeros de Roma', en: "Rome's first foreigners", fr: 'Les premiers étrangers de Rome', it: 'I primi stranieri di Roma' },
        texto: {
          es: 'Los primeros judíos de Roma se instalaron en Trastevere en el siglo II a.C., como parte de una embajada comercial enviada desde Judea; con los siglos formaron aquí una de las comunidades judías más antiguas y continuas de toda la diáspora, mucho antes de que, en 1555, el papado obligara a trasladarse al Ghetto, en la otra orilla. El barrio recibió también a mercaderes, soldados y marineros sirios, que trajeron consigo a sus propios dioses: en la ladera del Janículo se ha excavado un santuario dedicado a Júpiter Heliopolitano, la principal divinidad siria, con una primera fase de mediados del siglo I d.C. y una reconstrucción fechada entre los años 176 y 180 d.C.',
          en: "Rome's first Jews settled in Trastevere in the 2nd century BC, as part of a trade delegation sent from Judea; over the centuries they formed here one of the oldest, most continuous Jewish communities in the entire diaspora, long before the papacy forced a move to the Ghetto, on the other bank, in 1555. The district also took in Syrian merchants, soldiers and sailors, who brought their own gods with them: on the slope of the Janiculum, excavations have uncovered a sanctuary dedicated to Jupiter Heliopolitanus, the chief Syrian deity, with an initial phase from the mid-1st century AD and a rebuild dated between 176 and 180 AD.", fr: "Les premiers juifs de Rome s'installèrent à Trastevere au IIe siècle av. J.-C., dans le cadre d'une ambassade commerciale envoyée depuis la Judée ; au fil des siècles, ils y formèrent l'une des communautés juives les plus anciennes et les plus continues de toute la diaspora, bien avant que la papauté, en 1555, n'impose leur transfert vers le Ghetto, sur l'autre rive. Le quartier accueillit aussi des marchands, des soldats et des marins syriens, qui apportèrent avec eux leurs propres dieux : sur le flanc du Janicule, on a mis au jour un sanctuaire dédié à Jupiter Héliopolitain, la principale divinité syrienne, avec une première phase datant du milieu du Ier siècle apr. J.-C. et une reconstruction datée entre 176 et 180 apr. J.-C.", it: "I primi ebrei di Roma si stabilirono a Trastevere nel II secolo a.C., come parte di un'ambasciata commerciale inviata dalla Giudea; nei secoli formarono qui una delle comunità ebraiche più antiche e continue di tutta la diaspora, molto prima che, nel 1555, il papato imponesse il trasferimento forzato nel Ghetto, sull'altra sponda. Il quartiere accolse anche mercanti, soldati e marinai siriani, che portarono con sé i propri dèi: sul versante del Gianicolo è stato scavato un santuario dedicato a Giove Eliopolitano, la principale divinità siriaca, con una prima fase risalente alla metà del I secolo d.C. e una ricostruzione datata tra il 176 e il 180 d.C.",
        },
      },
      {
        titulo: { es: 'Una lengua que no es la de enfrente', en: "A language that isn't the one across the river", fr: "Une langue qui n'est pas celle d'en face", it: 'Una lingua diversa da quella di fronte' },
        texto: {
          es: 'De esa mezcla salió, con los siglos, una variante propia del habla romana: el trasteverino, con matices de pronunciación y vocabulario que un oído local todavía distingue del romanesco que se habla al otro lado del río. La diferencia nunca fue solo lingüística. Durante generaciones, los trasteverinos se consideraron a sí mismos los romanos más auténticos, más «de Roma» que los propios romanos del centro, y hoy sigue habiendo quien se presenta primero como trasteverino y solo después, si acaso, como romano.',
          en: 'Out of that mix came, over the centuries, its own variant of Roman speech: Trasteverino, with shades of pronunciation and vocabulary that a local ear can still tell apart from the Romanesco spoken on the other side of the river. The difference was never just linguistic. For generations, Trasteverini considered themselves the most authentic Romans, more "of Rome" than the Romans of the center itself, and there are still people today who introduce themselves as Trasteverino first, and only afterward, if at all, as Roman.', fr: "De ce mélange naquit, avec les siècles, une variante propre du parler romain : le trasteverino, avec des nuances de prononciation et de vocabulaire qu'une oreille locale distingue encore du romanesco parlé de l'autre côté du fleuve. La différence n'a jamais été seulement linguistique. Pendant des générations, les trasteverini se sont considérés comme les Romains les plus authentiques, plus « de Rome » que les Romains du centre eux-mêmes, et aujourd'hui encore, certains se présentent d'abord comme trasteverini, et seulement ensuite, si besoin, comme romains.", it: 'Da quella mescolanza nacque, con i secoli, una variante propria della parlata romana: il trasteverino, con sfumature di pronuncia e vocabolario che un orecchio locale distingue ancora dal romanesco che si parla sull\'altra sponda del fiume. La differenza non fu mai solo linguistica. Per generazioni, i trasteverini si sono considerati i romani più autentici, più «di Roma» degli stessi romani del centro, e ancora oggi c\'è chi si presenta prima come trasteverino e solo dopo, semmai, come romano.',
        },
      },
      {
        titulo: { es: 'Noantri: nosotros, los otros', en: 'Noantri: we, the others', fr: 'Noantri : nous, les autres', it: 'Noantri: noi, gli altri' },
        texto: {
          es: 'Esa manera de marcar distancia tiene hasta nombre propio: la Festa de Noantri, que cada julio llena de procesiones y mesas en la calle las plazas del barrio. «Noantri» viene de noi altri, «nosotros, los otros», un nombre que declara, sin rodeos, que los de Trastevere forman un «nosotros» aparte del resto de Roma. La fiesta arrancó en 1535, cuando unos pescadores encontraron en la desembocadura del Tíber una imagen de la Virgen tallada en madera de cedro, la Madonna Fiumarola, que desde entonces es la patrona del barrio.',
          en: 'That way of marking distance even has its own name: the Festa de Noantri, which fills the district\'s squares with processions and street tables every July. "Noantri" comes from noi altri, "we others," a name that flatly declares that the people of Trastevere form a "we" apart from the rest of Rome. The festival began in 1535, when fishermen found a cedar-wood image of the Virgin at the mouth of the Tiber, the Madonna Fiumarola, who has been the district\'s patron saint ever since.', fr: "Cette manière de marquer la distance a même un nom : la Festa de Noantri, qui remplit chaque juillet les places du quartier de processions et de tables dressées dans la rue. « Noantri » vient de noi altri, « nous, les autres », un nom qui proclame, sans détour, que les gens de Trastevere forment un « nous » à part du reste de Rome. La fête a débuté en 1535, quand des pêcheurs trouvèrent à l'embouchure du Tibre une statue de la Vierge taillée dans du bois de cèdre, la Madonna Fiumarola, patronne du quartier depuis lors.", it: 'Questo modo di marcare le distanze ha perfino un nome proprio: la Festa de Noantri, che ogni luglio riempie le piazze del quartiere di processioni e tavolate in strada. «Noantri» viene da noi altri, «noi, gli altri»: un nome che dichiara, senza giri di parole, che quelli di Trastevere formano un «noi» a parte rispetto al resto di Roma. La festa nacque nel 1535, quando alcuni pescatori trovarono alla foce del Tevere un\'immagine della Vergine scolpita in legno di cedro, la Madonna Fiumarola, che da allora è la patrona del quartiere.',
        },
      },
    ],
    enlacesRutas: ['roma-trastevere'],
    cierre: {
      es: 'Nada de esto se explica en una placa. Se nota en cómo hablan algunos vecinos mayores, en la fecha en que Trastevere se pone de fiesta cada julio y en el trazado de un barrio que Roma tardó siglos en dejar entrar del todo. {ruta1} recorre sus calles con esa misma idea en mente: mirar de cerca lo que este barrio lleva contando desde siempre, para quien se pare a leerlo.',
      en: 'None of this is explained on a plaque. You notice it in how some older residents still speak, in the date Trastevere breaks into festival every July, and in the layout of a district that took Rome centuries to fully let in. {ruta1} walks its streets with that same idea in mind: looking closely at what this district has been telling anyone who stops to read it, all along.', fr: "Rien de tout cela ne s'explique sur une plaque. Cela s'entend dans la façon de parler de certains habitants âgés, dans la date où Trastevere fait la fête chaque juillet, et dans le tracé d'un quartier que Rome a mis des siècles à laisser entrer tout à fait. {ruta1} parcourt ses rues avec cette même idée en tête : regarder de près ce que ce quartier raconte depuis toujours, pour qui s'arrête pour le lire.", it: "Niente di tutto questo è spiegato su una targa. Si nota in come parlano alcuni residenti più anziani, nella data in cui Trastevere fa festa ogni luglio e nel tracciato di un quartiere che Roma ha impiegato secoli a lasciar entrare del tutto. {ruta1} percorre le sue strade con la stessa idea in mente: guardare da vicino quello che questo quartiere racconta da sempre, per chi si ferma a leggerlo.",
    },
  },
  {
    id: 'paris',
    ciudadSlug: 'paris',
    imgHero: 'assets/img/ciudades/paris-montmartre-hero.webp',
    titulo: { es: 'Por qué Sacré-Cœur es un monumento a una derrota, no una victoria', en: 'Why Sacré-Cœur Is a Monument to a Defeat, Not a Victory', fr: 'Pourquoi le Sacré-Cœur est un monument à une défaite, pas à une victoire', it: 'Perché il Sacré-Cœur è un monumento a una sconfitta, non a una vittoria' },
    resumen: {
      es: 'Montmartre fue la chispa de la Comuna de París en 1871. El Sacré-Cœur se construyó después, en el mismo sitio, como penitencia por la derrota.',
      en: 'Montmartre was the spark that set off the Paris Commune in 1871. Sacré-Cœur was built afterward, on the very same spot, as penance for the defeat.', fr: "Montmartre fut l'étincelle de la Commune de Paris en 1871. Le Sacré-Cœur fut construit après, au même endroit, comme pénitence pour la défaite.", it: 'Montmartre fu la scintilla della Comune di Parigi nel 1871. Il Sacré-Cœur fu costruito dopo, nello stesso luogo, come penitenza per la sconfitta.',
    },
    secciones: [
      {
        titulo: { es: 'El amanecer de los cañones', en: 'The dawn of the cannons', fr: 'L\'aube des canons', it: "L'alba dei cannoni" },
        texto: {
          es: 'Al terminar el asedio prusiano de París, la Guardia Nacional tenía repartidos por la ciudad unos 400 cañones, pagados en buena parte por suscripción popular: dinero de los propios parisinos, no del Estado. Unos 170 de esas piezas quedaron aparcadas en lo alto de Montmartre, lejos del alcance del nuevo gobierno de Adolphe Thiers, instalado en Versalles y desconfiado de una capital todavía armada. Antes del amanecer del 18 de marzo de 1871, dos brigadas del ejército subieron la colina para requisarlos por sorpresa. El plan falló por un detalle logístico: llegaron los soldados, pero no los caballos para arrastrar los cañones cuesta abajo. Mientras esperaban, salió el sol, y con él las vecinas de Montmartre, camino de comprar leche y pan, que se plantaron entre las tropas y la artillería.',
          en: "When the Prussian siege of Paris ended, the National Guard had some 400 cannons scattered around the city, largely paid for by public subscription: money from ordinary Parisians, not the state. About 170 of those guns sat parked at the top of Montmartre, out of reach of Adolphe Thiers's new government, based in Versailles and wary of a capital that was still armed. Before dawn on 18 March 1871, two army brigades climbed the hill to seize them by surprise. The plan failed over a logistical detail: the soldiers showed up, but not the horses needed to drag the cannons back downhill. While they waited, the sun came up, and with it the women of Montmartre, on their way to buy milk and bread, who planted themselves between the troops and the artillery.", fr: "À la fin du siège prussien de Paris, la Garde nationale avait réparti dans la ville environ 400 canons, payés en bonne partie par souscription populaire : de l'argent des Parisiens eux-mêmes, pas de l'État. Environ 170 de ces pièces se trouvaient garées en haut de Montmartre, hors de portée du nouveau gouvernement d'Adolphe Thiers, installé à Versailles et méfiant envers une capitale encore armée. Avant l'aube du 18 mars 1871, deux brigades de l'armée montèrent sur la colline pour les réquisitionner par surprise. Le plan échoua sur un détail logistique : les soldats arrivèrent, mais pas les chevaux censés tirer les canons pour les faire descendre. Pendant qu'ils attendaient, le soleil se leva, et avec lui les femmes de Montmartre, parties acheter du lait et du pain, qui se placèrent entre les troupes et l'artillerie.", it: "Alla fine dell'assedio prussiano di Parigi, la Guardia Nazionale aveva sparsi per la città circa 400 cannoni, pagati in buona parte con una sottoscrizione popolare: soldi dei parigini stessi, non dello Stato. Circa 170 di quei pezzi erano parcheggiati in cima a Montmartre, fuori dalla portata del nuovo governo di Adolphe Thiers, insediato a Versailles e diffidente verso una capitale ancora armata. Prima dell'alba del 18 marzo 1871, due brigate dell'esercito salirono la collina per requisirli di sorpresa. Il piano fallì per un dettaglio logistico: arrivarono i soldati, ma non i cavalli per trascinare i cannoni a valle. Mentre aspettavano, sorse il sole, e con esso le donne di Montmartre, dirette a comprare latte e pane, che si piazzarono tra le truppe e l'artiglieria.",
        },
      },
      {
        titulo: { es: 'Dos generales, una misma tarde', en: 'Two generals, one afternoon', fr: 'Deux généraux, un même après-midi', it: 'Due generali, lo stesso pomeriggio' },
        texto: {
          es: 'La tropa, rodeada por la multitud, terminó fraternizando con la Guardia Nacional en lugar de disparar. Al general Claude Lecomte, que sí había ordenado abrir fuego contra la gente, lo detuvieron sus propios hombres. Cerca de la Place Pigalle reconocieron, vestido de civil, a otro general, Clément-Thomas, odiado desde que en 1848 reprimió a tiros una revuelta obrera anterior. A los dos los llevaron a una casa del número 6 de la rue des Rosiers, en la propia Montmartre, y esa misma tarde los fusilaron en el jardín, sin juicio. La noticia llegó a Versalles antes de que cayera la noche: el gobierno de Thiers evacuó París, y con esa fuga empezó la Comuna.',
          en: "Surrounded by the crowd, the troops ended up fraternizing with the National Guard instead of opening fire. General Claude Lecomte, who had in fact ordered his men to shoot at the crowd, was arrested by his own soldiers. Near Place Pigalle, they recognized another general, Clément-Thomas, out of uniform in civilian clothes — hated ever since he had put down an earlier workers' uprising with gunfire in 1848. Both men were taken to a house at number 6, rue des Rosiers, in Montmartre itself, and shot in the garden that same afternoon, without trial. The news reached Versailles before nightfall: Thiers's government evacuated Paris, and that flight is what started the Commune.", fr: "Encerclée par la foule, la troupe finit par fraterniser avec la Garde nationale au lieu de tirer. Le général Claude Lecomte, qui avait bel et bien ordonné d'ouvrir le feu sur la foule, fut arrêté par ses propres hommes. Près de la Place Pigalle, on reconnut, habillé en civil, un autre général, Clément-Thomas, honni depuis qu'il avait réprimé par les armes, en 1848, une précédente révolte ouvrière. Tous deux furent conduits dans une maison au numéro 6 de la rue des Rosiers, à Montmartre même, et fusillés dans le jardin ce même après-midi, sans jugement. La nouvelle parvint à Versailles avant la tombée de la nuit : le gouvernement Thiers évacua Paris, et cette fuite marqua le début de la Commune.", it: "La truppa, circondata dalla folla, finì per fraternizzare con la Guardia Nazionale invece di sparare. Il generale Claude Lecomte, che aveva effettivamente ordinato di aprire il fuoco sulla gente, fu arrestato dai suoi stessi uomini. Vicino a Place Pigalle riconobbero, vestito in borghese, un altro generale, Clément-Thomas, odiato da quando nel 1848 aveva represso a colpi d'arma da fuoco una precedente rivolta operaia. Entrambi furono portati in una casa al numero 6 di rue des Rosiers, nella stessa Montmartre, e quello stesso pomeriggio furono fucilati in giardino, senza processo. La notizia arrivò a Versailles prima che scendesse la notte: il governo Thiers evacuò Parigi, e con quella fuga iniziò la Comune.",
        },
      },
      {
        titulo: { es: 'Setenta y dos días y una semana de sangre', en: 'Seventy-two days and a week of blood', fr: 'Soixante-douze jours et une semaine de sang', it: 'Settantadue giorni e una settimana di sangue' },
        texto: {
          es: 'La Comuna gobernó París de forma autónoma desde ese 18 de marzo hasta el 28 de mayo de 1871: unas diez semanas, casi siempre resumidas como «dos meses». Terminó con la Semaine sanglante, la Semana Sangrienta, cuando el ejército de Versalles reconquistó la ciudad calle a calle. La cifra exacta de muertos sigue discutida siglo y medio después: los recuentos clásicos hablan de hasta 20.000 personas, entre combatientes y fusilados sin proceso; las revisiones más recientes, con archivos más completos, la bajan a un rango de 6.000 a 7.500. Sea cual sea el número correcto, fue posiblemente la represión más letal que ha vivido nunca una calle de París.',
          en: 'The Commune governed Paris independently from that 18 March until 28 May 1871: about ten weeks, almost always rounded off to "two months." It ended with the Semaine sanglante, the Bloody Week, when the Versailles army retook the city street by street. The exact death toll is still disputed a century and a half later: the classic counts put it as high as 20,000 people, combatants and those shot without trial combined; more recent reviews, drawing on fuller archives, bring it down to a range of 6,000 to 7,500. Whatever the true number, it was possibly the deadliest crackdown any street in Paris has ever seen.', fr: "La Commune gouverna Paris de façon autonome de ce 18 mars jusqu'au 28 mai 1871 : une dizaine de semaines, presque toujours résumées en « deux mois ». Elle s'acheva avec la Semaine sanglante, quand l'armée de Versailles reconquit la ville rue par rue. Le nombre exact de morts reste discuté un siècle et demi plus tard : les décomptes classiques parlent de jusqu'à 20 000 personnes, entre combattants et fusillés sans procès ; les révisions les plus récentes, à partir d'archives plus complètes, l'abaissent à une fourchette de 6 000 à 7 500. Quel que soit le chiffre exact, ce fut sans doute la répression la plus meurtrière qu'ait jamais connue une rue de Paris.", it: 'La Comune governò Parigi in modo autonomo da quel 18 marzo fino al 28 maggio 1871: circa dieci settimane, quasi sempre riassunte come «due mesi». Finì con la Semaine sanglante, la Settimana di sangue, quando l\'esercito di Versailles riconquistò la città strada per strada. Il numero esatto dei morti resta discusso ancora oggi, un secolo e mezzo dopo: i conteggi classici parlano di fino a 20.000 persone, tra combattenti e fucilati senza processo; le revisioni più recenti, con archivi più completi, lo abbassano a un intervallo tra 6.000 e 7.500. Qualunque sia il numero corretto, fu probabilmente la repressione più letale mai vissuta da una strada di Parigi.',
        },
      },
      {
        titulo: { es: 'Un voto anterior a la propia Comuna', en: 'A vow that predates the Commune itself', fr: 'Un vœu antérieur à la Commune elle-même', it: 'Un voto anteriore alla stessa Comune' },
        texto: {
          es: 'La idea de una basílica en Montmartre no nació de la Comuna: la propuso, en septiembre de 1870, el católico Alexandre Legentil, en plena guerra franco-prusiana y antes de que existiera ningún levantamiento, como voto religioso si Francia salía indemne de la invasión. Pero la Comuna le dio al proyecto un motivo nuevo y muy concreto. En 1873, con Francia derrotada y la Comuna ya aplastada, la Asamblea Nacional, de mayoría monárquica y católica, declaró la basílica «de utilidad pública» por ley. El lugar elegido para construirla no fue una casualidad geográfica: es, literalmente, la misma colina donde había empezado la revuelta y donde habían muerto Lecomte y Clément-Thomas.',
          en: 'The idea of a basilica on Montmartre didn\'t come from the Commune: it was proposed in September 1870 by the Catholic Alexandre Legentil, in the middle of the Franco-Prussian War and before any uprising existed, as a religious vow in case France came through the invasion unscathed. But the Commune gave the project a new, very specific motive. In 1873, with France defeated and the Commune already crushed, the National Assembly, with its monarchist and Catholic majority, declared the basilica of "public utility" by law. The site chosen to build it was no geographic accident: it is, literally, the same hill where the uprising had begun and where Lecomte and Clément-Thomas had died.', fr: "L'idée d'une basilique à Montmartre n'est pas née de la Commune : elle fut proposée, en septembre 1870, par le catholique Alexandre Legentil, en pleine guerre franco-prussienne et avant même qu'aucun soulèvement n'existe, comme vœu religieux au cas où la France sortirait indemne de l'invasion. Mais la Commune donna au projet un motif nouveau et bien concret. En 1873, la France vaincue et la Commune déjà écrasée, l'Assemblée nationale, à majorité monarchiste et catholique, déclara la basilique « d'utilité publique » par une loi. Le lieu choisi pour la construire ne fut pas un hasard géographique : c'est, littéralement, la même colline où le soulèvement avait commencé et où Lecomte et Clément-Thomas étaient morts.", it: "L'idea di una basilica a Montmartre non nacque dalla Comune: la propose, nel settembre 1870, il cattolico Alexandre Legentil, in piena guerra franco-prussiana e prima che scoppiasse qualsiasi rivolta, come voto religioso nel caso la Francia fosse uscita indenne dall'invasione. Ma la Comune diede al progetto un motivo nuovo e molto concreto. Nel 1873, con la Francia sconfitta e la Comune già schiacciata, l'Assemblea Nazionale, a maggioranza monarchica e cattolica, dichiarò per legge la basilica «di utilità pubblica». Il luogo scelto per costruirla non fu un caso geografico: è, letteralmente, la stessa collina dove era iniziata la rivolta e dove erano morti Lecomte e Clément-Thomas.",
        },
      },
      {
        titulo: { es: 'La piedra que debía tapar la memoria', en: 'The stone meant to bury the memory', fr: 'La pierre censée recouvrir la mémoire', it: 'La pietra che doveva coprire la memoria' },
        texto: {
          es: 'La primera piedra se colocó el 16 de junio de 1875, bendecida por el cardenal Guibert, arzobispo de París. Ese mismo día se dijo sin rodeos que el emplazamiento no era arbitrario: se construía ahí porque ahí había empezado la Comuna. La basílica tardaría más de cuatro décadas en consagrarse, en 1919, ya con otra guerra mundial recién terminada, pero desde el primer momento funcionó como lo que era: un monumento de penitencia católica y conservadora, levantado a propósito sobre la herida todavía abierta de una insurrección obrera aplastada a tiros. Hoy la suben cada año millones de personas que ni sospechan que pisan, literalmente, el escenario de una ejecución sumaria.',
          en: 'The first stone was laid on 16 June 1875, blessed by Cardinal Guibert, Archbishop of Paris. That same day, it was stated plainly that the location was no accident: it was being built there because that was where the Commune had begun. The basilica would take more than four decades to be consecrated, in 1919, with a different world war just over, but from the very first day it functioned as what it was: a monument to Catholic, conservative penance, deliberately raised over the still-open wound of a workers\' uprising crushed by gunfire. Today, millions of people climb up to it every year, with no idea that they are literally standing on the site of a summary execution.', fr: "La première pierre fut posée le 16 juin 1875, bénie par le cardinal Guibert, archevêque de Paris. Ce jour-là même, on affirma sans détour que l'emplacement n'avait rien d'arbitraire : on construisait ici précisément parce que c'était ici que la Commune avait commencé. La basilique mettrait plus de quatre décennies à être consacrée, en 1919, une autre guerre mondiale à peine terminée, mais dès le premier instant elle fonctionna comme ce qu'elle était : un monument de pénitence catholique et conservatrice, dressé à dessein sur la blessure encore ouverte d'une insurrection ouvrière écrasée par les armes. Aujourd'hui, des millions de personnes la gravissent chaque année sans même soupçonner qu'elles foulent, littéralement, le lieu d'une exécution sommaire.", it: "La prima pietra fu posata il 16 giugno 1875, benedetta dal cardinale Guibert, arcivescovo di Parigi. Quello stesso giorno si disse senza mezzi termini che la scelta del luogo non era arbitraria: si costruiva lì perché lì era iniziata la Comune. La basilica avrebbe impiegato più di quattro decenni per essere consacrata, nel 1919, a un'altra guerra mondiale appena conclusa, ma fin dal primo momento funzionò per quello che era: un monumento di penitenza cattolica e conservatrice, eretto apposta sulla ferita ancora aperta di un'insurrezione operaia soffocata a colpi d'arma da fuoco. Oggi la salgono ogni anno milioni di persone che nemmeno sospettano di calpestare, letteralmente, il luogo di un'esecuzione sommaria.",
        },
      },
    ],
    enlacesRutas: ['paris-montmartre'],
    cierre: {
      es: 'La colina que hoy suben turistas con cámara en mano escondía, hace siglo y medio, una revuelta armada y dos ejecuciones sumarias. {ruta1} recorre la misma Montmartre siguiendo otras señales del barrio —un pueblo independiente hasta 1860, un viñedo que se salvó de la especulación, un jardín que hoy lleva el nombre de Louise Michel, la comunera que luchó aquí— ocho paradas para quien quiera seguir tirando del hilo.',
      en: 'The hill that tourists climb today, camera in hand, was hiding an armed uprising and two summary executions a century and a half ago. {ruta1} covers the same Montmartre, following other signs the district has left behind — a village that stayed independent until 1860, a vineyard saved from property speculation, a garden that today carries the name of Louise Michel, the Communarde who fought here — eight stops for anyone who wants to keep pulling the thread.', fr: "La colline que gravissent aujourd'hui les touristes appareil photo en main cachait, il y a un siècle et demi, une révolte armée et deux exécutions sommaires. {ruta1} parcourt cette même Montmartre en suivant d'autres traces du quartier — un village indépendant jusqu'en 1860, un vignoble sauvé de la spéculation, un jardin qui porte aujourd'hui le nom de Louise Michel, la communarde qui combattit ici — huit étapes pour qui veut continuer à tirer le fil.", it: "La collina che oggi salgono i turisti con la macchina fotografica in mano nascondeva, un secolo e mezzo fa, una rivolta armata e due esecuzioni sommarie. {ruta1} attraversa la stessa Montmartre seguendo altri segnali del quartiere — un villaggio indipendente fino al 1860, una vigna scampata alla speculazione, un giardino che oggi porta il nome di Louise Michel, la comunarda che qui combatté — otto tappe per chi vuole continuare a tirare il filo.",
    },
  },
  {
    id: 'lisboa',
    ciudadSlug: 'lisboa',
    imgHero: 'assets/img/ciudades/lisboa-hero.webp',
    titulo: { es: 'Alfama sobrevivió al terremoto que borró media Lisboa: así se nota todavía', en: 'Alfama Survived the Earthquake That Wiped Out Half of Lisbon: You Can Still Tell', fr: 'Alfama a survécu au séisme qui a effacé la moitié de Lisbonne : cela se voit encore', it: 'Alfama sopravvisse al terremoto che cancellò mezza Lisbona: si nota ancora oggi' },
    resumen: { es: 'Alfama debe su nombre a unos baños árabes y su canto más célebre, el fado, a un origen que los historiadores aún discuten sin acuerdo.', en: "Alfama owes its name to Arab baths, and its most famous song, fado, to an origin historians still can't agree on.", fr: "Alfama doit son nom à des bains arabes, et son chant le plus célèbre, le fado, à une origine que les historiens continuent de débattre sans jamais s'accorder.", it: "Alfama deve il suo nome a dei bagni arabi, e il suo canto più celebre, il fado, a un'origine su cui gli storici ancora discutono senza essersi messi d'accordo." },
    secciones: [
      {
        titulo: { es: 'El barrio que lleva un baño en el nombre', en: 'The district with a bath in its name', fr: 'Le quartier qui porte un bain dans son nom', it: 'Il quartiere che porta un bagno nel nome' },
        texto: { es: 'Alfama es de los pocos barrios de Lisboa que el terremoto de 1755 dejó en pie casi tal como estaba, y eso incluye algo que no se ve a simple vista pero se explica solo: su nombre no es portugués. Viene del árabe al-hamma, «los baños» o «las fuentes termales». Lisboa estuvo bajo dominio islámico entre el siglo VIII y 1147, y fue en esa época cuando el barrio recibió el nombre que conserva hoy, por los manantiales de aguas minero-medicinales que brotan aquí mismo, sobre una falla geológica documentada en la propia carta geológica de Lisboa. Entre los siglos XVII y XIX llegaron a funcionar aquí varios balnearios con nombre propio —los Baños de Dona Clara, las Aguas do Duque— alimentados por esos mismos manantiales. No fue un uso pasajero: esas aguas se siguieron explotando como baños públicos hasta bien entrado el siglo XX, y durante generaciones alimentaron los chafarizes —las fuentes públicas del barrio— que todavía dan nombre a varias calles de Alfama.', en: "Alfama is one of the few Lisbon districts the 1755 earthquake left standing almost exactly as it was, and that includes something you can't see at a glance but explains itself once you know it: its name isn't Portuguese. It comes from the Arabic al-hamma, \"the baths\" or \"the hot springs.\" Lisbon was under Islamic rule from the 8th century until 1147, and it was in that period that the district got the name it still carries today, after the mineral-medicinal springs that rise right here, over a geological fault documented on Lisbon's own geological map. Between the 17th and 19th centuries, several named bathhouses operated here — the Baños de Dona Clara, the Águas do Duque — fed by those same springs. It wasn't a passing use: those waters kept being tapped as public baths well into the 20th century, and for generations they fed the chafarizes, the district's public fountains, which still lend their name to several streets in Alfama.", fr: "Alfama est l'un des rares quartiers de Lisbonne que le séisme de 1755 a laissés debout presque tels quels, et cela inclut un détail invisible à l'œil nu mais qui s'explique tout seul : son nom n'est pas portugais. Il vient de l'arabe al-hamma, « les bains » ou « les sources thermales ». Lisbonne fut sous domination islamique du VIIIe siècle à 1147, et c'est à cette époque que le quartier reçut le nom qu'il conserve aujourd'hui, à cause des sources d'eaux minéro-médicinales qui jaillissent ici même, au-dessus d'une faille géologique documentée sur la carte géologique de Lisbonne elle-même. Entre le XVIIe et le XIXe siècle, plusieurs bains portant leur propre nom fonctionnèrent ici — les Bains de Dona Clara, les Aguas do Duque — alimentés par ces mêmes sources. Ce ne fut pas un usage passager : ces eaux continuèrent d'être exploitées comme bains publics jusque bien avant dans le XXe siècle, et pendant des générations elles alimentèrent les chafarizes — les fontaines publiques du quartier — qui donnent encore leur nom à plusieurs rues d'Alfama.", it: "Alfama è uno dei pochi quartieri di Lisbona che il terremoto del 1755 lasciò in piedi quasi come si trovava, e questo include qualcosa che non si vede a prima vista ma si spiega da sé: il suo nome non è portoghese. Viene dall'arabo al-hamma, «i bagni» o «le sorgenti termali». Lisbona fu sotto dominio islamico tra l'VIII secolo e il 1147, e fu in quel periodo che il quartiere ricevette il nome che conserva ancora oggi, per le sorgenti di acque minero-medicinali che sgorgano proprio qui, su una faglia geologica documentata nella stessa carta geologica di Lisbona. Tra il Seicento e l'Ottocento arrivarono a funzionare qui diversi stabilimenti termali con nome proprio — i Baños de Dona Clara, le Aguas do Duque — alimentati da quelle stesse sorgenti. Non fu un uso passeggero: quelle acque continuarono a essere sfruttate come bagni pubblici fino a ben dentro il Novecento, e per generazioni alimentarono i chafarizes — le fontane pubbliche del quartiere — che ancora oggi danno il nome a diverse strade di Alfama." },
      },
      {
        titulo: { es: 'Una canción sin acta de nacimiento', en: 'A song with no birth certificate', fr: 'Une chanson sans acte de naissance', it: 'Una canzone senza atto di nascita' },
        texto: { es: 'El fado empieza a documentarse en Lisboa hacia la década de 1820, cantado en las tabernas populares de los barrios junto al río, Alfama entre ellos. Pero a diferencia del nombre del barrio, nadie se puso nunca de acuerdo sobre su verdadero origen. Musicólogos portugueses y extranjeros lo llevan discutiendo más de un siglo, y la disputa sigue abierta hoy: hay al menos tres teorías serias sobre su origen, y ninguna ha logrado imponerse del todo sobre las otras.', en: 'Fado starts showing up in the historical record in Lisbon around the 1820s, sung in the working-class taverns of the riverside districts, Alfama among them. But unlike the district\'s name, no one has ever agreed on where it really came from. Portuguese and foreign musicologists have been arguing about it for over a century, and the dispute is still open today: there are at least three serious theories about its origin, and none has managed to fully win out over the others.', fr: "Le fado commence à être documenté à Lisbonne vers les années 1820, chanté dans les tavernes populaires des quartiers proches du fleuve, Alfama parmi eux. Mais contrairement au nom du quartier, personne ne s'est jamais mis d'accord sur sa véritable origine. Musicologues portugais et étrangers en débattent depuis plus d'un siècle, et la discussion reste ouverte aujourd'hui : il existe au moins trois théories sérieuses sur son origine, et aucune n'a réussi à s'imposer tout à fait sur les autres.", it: 'Il fado inizia a essere documentato a Lisbona verso gli anni 1820, cantato nelle taverne popolari dei quartieri lungo il fiume, Alfama tra questi. Ma a differenza del nome del quartiere, su di esso nessuno si è mai trovato d\'accordo riguardo alla vera origine. Musicologi portoghesi e stranieri ne discutono da più di un secolo, e la disputa resta aperta ancora oggi: esistono almeno tre teorie serie sulla sua origine, e nessuna è riuscita a imporsi del tutto sulle altre.' },
      },
      {
        titulo: { es: 'La melancolía de los que se iban por mar', en: 'The melancholy of those who left by sea', fr: 'La mélancolie de ceux qui partaient par la mer', it: 'La malinconia di chi partiva per mare' },
        texto: { es: 'La teoría más antigua es también la más romántica: el escritor Pinto de Carvalho, en su História do Fado de 1903, lo situó a bordo de las carabelas de los Descubrimientos, cantado por marineros que ponían en verso la separación y la espera. Alfama y la vecina Mouraria, los barrios más pegados al puerto de donde salían y llegaban esos barcos, son justo donde la tradición sitúa a los primeros que lo cantaron ya en tierra.', en: 'The oldest theory is also the most romantic: the writer Pinto de Carvalho, in his 1903 História do Fado, placed it aboard the caravels of the Age of Discovery, sung by sailors putting separation and waiting into verse. Alfama and neighboring Mouraria, the districts closest to the port those ships sailed from and returned to, are exactly where tradition places the first people to sing it back on dry land.', fr: "La théorie la plus ancienne est aussi la plus romantique : l'écrivain Pinto de Carvalho, dans son História do Fado de 1903, le situe à bord des caravelles des Grandes Découvertes, chanté par des marins qui mettaient en vers la séparation et l'attente. Alfama et la Mouraria voisine, les quartiers les plus proches du port d'où partaient et où arrivaient ces navires, sont précisément l'endroit où la tradition situe les premiers à l'avoir chanté, une fois revenus à terre.", it: 'La teoria più antica è anche la più romantica: lo scrittore Pinto de Carvalho, nella sua História do Fado del 1903, lo colloca a bordo delle caravelle delle Scoperte, cantato da marinai che mettevano in versi la separazione e l\'attesa. Alfama e la vicina Mouraria, i quartieri più prossimi al porto da cui partivano e a cui arrivavano quelle navi, sono proprio dove la tradizione colloca i primi a cantarlo già a terra.' },
      },
      {
        titulo: { es: 'La huella de los esclavos libertos', en: 'The mark left by freed slaves', fr: "L'empreinte des esclaves affranchis", it: 'L\'impronta degli schiavi liberati' },
        texto: { es: 'Buena parte de los historiadores portugueses del fado defiende otra hipótesis: que nació de los cantos de esclavos africanos liberados, instalados en los barrios populares de Lisboa a comienzos del siglo XIX. Habrían traído consigo el lundum, un baile-canción de raíz afrobrasileña que ya circulaba entre Lisboa y Río de Janeiro por el intenso tráfico marítimo entre ambos puertos.', en: 'A good number of Portuguese fado historians back a different hypothesis: that it grew out of the songs of freed African slaves, settled in Lisbon\'s working-class districts in the early 19th century. They would have brought with them the lundum, an Afro-Brazilian song-and-dance form already circulating between Lisbon and Rio de Janeiro thanks to the heavy maritime traffic between the two ports.', fr: "Une bonne partie des historiens portugais du fado défendent une autre hypothèse : il serait né des chants d'esclaves africains affranchis, installés dans les quartiers populaires de Lisbonne au début du XIXe siècle. Ils auraient apporté avec eux le lundum, une danse chantée d'origine afro-brésilienne qui circulait déjà entre Lisbonne et Rio de Janeiro grâce à l'intense trafic maritime entre les deux ports.", it: 'Buona parte degli storici portoghesi del fado sostiene un\'altra ipotesi: che sia nato dai canti degli schiavi africani liberati, stabilitisi nei quartieri popolari di Lisbona all\'inizio dell\'Ottocento. Avrebbero portato con sé il lundum, un ballo-canzone di radice afrobrasiliana che già circolava tra Lisbona e Rio de Janeiro grazie all\'intenso traffico marittimo tra i due porti.' },
      },
      {
        titulo: { es: 'Lo que trajo la corte al volver de Brasil', en: 'What the court brought back from Brazil', fr: 'Ce que la cour a ramené du Brésil', it: 'Quello che la corte portò tornando dal Brasile' },
        texto: { es: 'Una tercera teoría mira hacia arriba, a la propia corte portuguesa: a finales de 1807 huyó entera a Río de Janeiro ante la invasión napoleónica, y no regresó a Lisboa hasta 1821. El musicólogo británico Rodney Gallop, de los primeros en estudiar el fado en profundidad, recogía en los años 30 que los propios cantores describían sus fados más antiguos como «de origen brasileño» — probablemente por la modinha, la canción sentimental que la corte trajo consigo de vuelta.', en: 'A third theory looks upward, at the Portuguese court itself: it fled to Rio de Janeiro in its entirety in late 1807 ahead of the Napoleonic invasion, and didn\'t return to Lisbon until 1821. The British musicologist Rodney Gallop, one of the first to study fado in depth, recorded in the 1930s that singers themselves described their oldest fados as "of Brazilian origin" — probably because of the modinha, the sentimental song form the court brought back with it.', fr: "Une troisième théorie regarde plus haut, vers la cour portugaise elle-même : à la fin de 1807, elle s'enfuit tout entière à Rio de Janeiro devant l'invasion napoléonienne, et ne revint à Lisbonne qu'en 1821. Le musicologue britannique Rodney Gallop, l'un des premiers à avoir étudié le fado en profondeur, rapportait dans les années 1930 que les chanteurs eux-mêmes décrivaient leurs fados les plus anciens comme « d'origine brésilienne » — probablement à cause de la modinha, la chanson sentimentale que la cour ramena avec elle.", it: 'Una terza teoria guarda più in alto, alla stessa corte portoghese: alla fine del 1807 fuggì in blocco a Rio de Janeiro di fronte all\'invasione napoleonica, e non tornò a Lisbona fino al 1821. Il musicologo britannico Rodney Gallop, tra i primi a studiare il fado in profondità, riportava negli anni Trenta che gli stessi cantori descrivevano i loro fados più antichi come «di origine brasiliana» — probabilmente per via della modinha, la canzone sentimentale che la corte portò con sé al ritorno.' },
      },
      {
        titulo: { es: 'Tres teorías, ningún ganador', en: 'Three theories, no winner', fr: 'Trois théories, aucun vainqueur', it: 'Tre teorie, nessun vincitore' },
        texto: { es: 'Hoy la mayoría de los especialistas ya no busca un único origen: entiende el fado como una mezcla real de las tres corrientes —marinera, afrobrasileña y cortesana— fundida en los mismos barrios ribereños entre 1820 y 1840, junto con las canciones rurales que los propios migrantes internos llevaban a la ciudad. Marineros, esclavos libertos y cortesanos exiliados discreparían en casi todo, pero coincidieron, sin saberlo, en el mismo puñado de calles.', en: 'Today, most specialists no longer look for a single origin: they understand fado as a genuine blend of all three currents — maritime, Afro-Brazilian and courtly — fused together in the same riverside districts between 1820 and 1840, alongside the rural songs that internal migrants themselves carried into the city. Sailors, freed slaves and exiled courtiers would have disagreed on almost everything, but they converged, without knowing it, on the very same handful of streets.', fr: "Aujourd'hui, la plupart des spécialistes ne cherchent plus une origine unique : ils comprennent le fado comme un véritable mélange des trois courants — marin, afro-brésilien et courtisan — fondus dans les mêmes quartiers riverains entre 1820 et 1840, avec en plus les chansons rurales que les migrants venus de l'intérieur du pays apportaient eux-mêmes en ville. Marins, esclaves affranchis et courtisans exilés auraient été en désaccord sur presque tout, mais ils se sont retrouvés, sans le savoir, dans la même poignée de rues.", it: 'Oggi la maggior parte degli specialisti non cerca più un\'unica origine: intende il fado come una mescolanza reale delle tre correnti — marinara, afrobrasiliana e cortigiana — fusa negli stessi quartieri rivieraschi tra il 1820 e il 1840, insieme ai canti rurali che gli stessi migranti interni portavano in città. Marinai, schiavi liberati e cortigiani esiliati sarebbero stati in disaccordo su quasi tutto, ma coincisero, senza saperlo, nella stessa manciata di strade.' },
      },
    ],
    enlacesRutas: ['lisboa-alfama'],
    cierre: { es: 'Ninguna de las tres teorías sobre el fado se ha impuesto del todo, y esa es la parte más honesta de todo el debate. Lo que sí sigue en pie son las cuestas donde se cantaron esos primeros fados y el nombre árabe que el barrio lleva desde la Lisboa islámica: {ruta1} recorre las dos cosas a la vez, ocho paradas por el Alfama real, no el de postal.', en: "None of the three theories about fado's origin has ever fully won out, and that's the most honest part of the whole debate. What's still standing are the steep streets where those first fados were sung, and the Arabic name the district has carried since Islamic Lisbon: {ruta1} covers both at once, eight stops through the real Alfama, not the postcard one.", fr: "Aucune des trois théories sur le fado ne s'est imposée tout à fait, et c'est bien la partie la plus honnête de tout ce débat. Ce qui, en revanche, tient toujours debout, ce sont les ruelles en pente où furent chantés ces premiers fados et le nom arabe que porte le quartier depuis la Lisbonne islamique : {ruta1} parcourt les deux à la fois, huit étapes dans l'Alfama réelle, pas celle des cartes postales.", it: 'Nessuna delle tre teorie sul fado si è imposta del tutto, ed è questa la parte più onesta di tutto il dibattito. Quello che invece resta in piedi sono le salite dove si cantarono quei primi fados e il nome arabo che il quartiere porta fin dalla Lisbona islamica: {ruta1} percorre entrambe le cose insieme, otto tappe nell\'Alfama vera, non quella da cartolina.' },
  },
  {
    id: 'florencia',
    ciudadSlug: 'florencia',
    imgHero: 'assets/img/ciudades/florencia-hero.webp',
    titulo: { es: 'La rivalidad que Florencia construyó en piedra, cúpula a cúpula', en: 'The Rivalry Florence Built in Stone, Dome by Dome', fr: 'La rivalité que Florence a bâtie en pierre, coupole après coupole', it: 'La rivalità che Firenze costruì in pietra, cupola dopo cupola' },
    resumen: {
      es: 'Brunelleschi escondió su método para levantar la cúpula del Duomo, y los gremios de Florencia libraron la misma pelea a golpe de estatua en Orsanmichele.',
      en: "Brunelleschi hid his method for raising the Duomo's dome, and Florence's guilds fought that same battle one statue at a time at Orsanmichele.", fr: "Brunelleschi a caché sa méthode pour élever la coupole du Duomo, et les corporations de Florence ont livré la même bataille, statue après statue, à Orsanmichele.", it: 'Brunelleschi tenne nascosto il suo metodo per innalzare la cupola del Duomo, e le corporazioni di Firenze combatterono la stessa battaglia a colpi di statue a Orsanmichele.',
    },
    secciones: [
      {
        titulo: { es: 'La puerta que Brunelleschi perdió en 1401', en: 'The door Brunelleschi lost in 1401', fr: 'La porte que Brunelleschi a perdue en 1401', it: 'La porta che Brunelleschi perse nel 1401' },
        texto: {
          es: 'Antes del Duomo, Filippo Brunelleschi y Lorenzo Ghiberti ya se habían medido una vez. En 1401 Florencia convocó un concurso para diseñar unas nuevas puertas de bronce del Baptisterio, y Ghiberti ganó. Los dos relieves de prueba —el mismo episodio bíblico, el sacrificio de Isaac, resuelto de dos formas distintas— se conservan hoy uno junto al otro en el Museo del Bargello. Brunelleschi, derrotado, se marchó a Roma a estudiar ruinas clásicas durante años. Diecisiete años después le llegaría la revancha, con un desafío mucho más difícil que una puerta: una cúpula que nadie sabía cómo construir.',
          en: 'Before the Duomo, Filippo Brunelleschi and Lorenzo Ghiberti had already gone head to head once. In 1401, Florence held a competition to design new bronze doors for the Baptistery, and Ghiberti won. The two trial reliefs — the same biblical scene, the sacrifice of Isaac, resolved in two different ways — are preserved today side by side at the Bargello Museum. Brunelleschi, defeated, left for Rome to study classical ruins for years. Seventeen years later his rematch would arrive, with a challenge far harder than a door: a dome nobody knew how to build.', fr: "Avant le Duomo, Filippo Brunelleschi et Lorenzo Ghiberti s'étaient déjà mesurés une fois. En 1401, Florence organisa un concours pour dessiner de nouvelles portes de bronze pour le Baptistère, et Ghiberti l'emporta. Les deux reliefs de l'épreuve — le même épisode biblique, le sacrifice d'Isaac, résolu de deux manières différentes — sont aujourd'hui conservés côte à côte au Museo del Bargello. Brunelleschi, vaincu, partit pour Rome étudier les ruines antiques pendant des années. Dix-sept ans plus tard viendrait sa revanche, avec un défi bien plus difficile qu'une porte : une coupole que personne ne savait comment construire.", it: "Prima del Duomo, Filippo Brunelleschi e Lorenzo Ghiberti si erano già misurati una volta. Nel 1401 Firenze bandì un concorso per progettare le nuove porte in bronzo del Battistero, e vinse Ghiberti. I due rilievi di prova — lo stesso episodio biblico, il sacrificio di Isacco, risolto in due modi diversi — si conservano oggi uno accanto all'altro al Museo del Bargello. Brunelleschi, sconfitto, partì per Roma a studiare le rovine classiche per anni. Diciassette anni dopo sarebbe arrivata la rivincita, con una sfida molto più difficile di una porta: una cupola che nessuno sapeva come costruire.",
        },
      },
      {
        titulo: { es: 'El concurso que nadie sabía cómo ganar', en: 'The competition no one knew how to win', fr: 'Le concours que personne ne savait comment gagner', it: 'Il concorso che nessuno sapeva come vincere' },
        texto: {
          es: 'La Arte della Lana, el gremio de comerciantes de lana que pagaba las obras de la catedral, convocó en 1418 un concurso desesperado: nadie en Europa sabía cómo cerrar el enorme hueco octogonal que llevaba décadas abierto sobre el crucero de Santa Maria del Fiore. Brunelleschi presentó la única propuesta que convenció al tribunal, y ganó — pero el gremio, desconfiado de un hombre que se negaba a explicar del todo su plan, le impuso una condición que debió sentar como una humillación: compartir el cargo, y el sueldo, con Ghiberti, su rival de 1401.',
          en: 'The Arte della Lana, the wool merchants\' guild that funded the cathedral works, held a desperate competition in 1418: no one in Europe knew how to close the huge octagonal gap that had stood open for decades over the crossing of Santa Maria del Fiore. Brunelleschi submitted the only proposal that convinced the panel, and won — but the guild, wary of a man who refused to fully explain his plan, imposed a condition that must have stung: sharing the post, and the salary, with Ghiberti, his rival from 1401.', fr: "L'Arte della Lana, la corporation des marchands de laine qui finançait les travaux de la cathédrale, organisa en 1418 un concours désespéré : personne en Europe ne savait comment fermer l'immense trou octogonal resté béant depuis des décennies au-dessus de la croisée de Santa Maria del Fiore. Brunelleschi présenta la seule proposition qui convainquit le jury, et il gagna — mais la corporation, méfiante envers un homme qui refusait d'expliquer entièrement son plan, lui imposa une condition qui dut passer pour une humiliation : partager la charge, et le salaire, avec Ghiberti, son rival de 1401.", it: "L'Arte della Lana, la corporazione dei mercanti di lana che finanziava i lavori della cattedrale, bandì nel 1418 un concorso disperato: nessuno in Europa sapeva come chiudere l'enorme vuoto ottagonale che da decenni restava aperto sopra il transetto di Santa Maria del Fiore. Brunelleschi presentò l'unica proposta che convinse la giuria, e vinse — ma la corporazione, diffidente verso un uomo che si rifiutava di spiegare fino in fondo il suo piano, gli impose una condizione che dev'essere suonata come un'umiliazione: condividere l'incarico, e lo stipendio, con Ghiberti, il suo rivale del 1401.",
        },
      },
      {
        titulo: { es: 'La maqueta que no lo explicaba todo', en: "The model that didn't explain everything", fr: "La maquette qui n'expliquait pas tout", it: 'Il modello che non spiegava tutto' },
        texto: {
          es: 'Brunelleschi construyó una maqueta de madera y ladrillo para guiar a los canteros en la obra, con ayuda de Donatello y Nanni di Banco — pero la dejó deliberadamente incompleta. Nunca puso por escrito el sistema completo ni se lo explicó a Ghiberti, que en teoría era su igual en el cargo. Con los años, mientras Ghiberti dedicaba su tiempo a otros encargos por la ciudad, Brunelleschi se fue quedando, en la práctica, como única autoridad sobre la obra: el hombre que tenía la solución seguía siendo el único que la entendía entera.',
          en: "Brunelleschi built a wood-and-brick model to guide the stonemasons on the job, with help from Donatello and Nanni di Banco — but he left it deliberately incomplete. He never wrote down the full system, nor explained it to Ghiberti, who was, in theory, his equal in the post. Over the years, as Ghiberti spent his time on other commissions around the city, Brunelleschi became, in practice, the sole authority over the works: the man who had the solution remained the only one who understood it in full.", fr: "Brunelleschi construisit une maquette en bois et en brique pour guider les tailleurs de pierre sur le chantier, avec l'aide de Donatello et de Nanni di Banco — mais il la laissa délibérément incomplète. Il ne coucha jamais par écrit le système complet et ne l'expliqua jamais à Ghiberti, qui était en théorie son égal dans la charge. Au fil des années, tandis que Ghiberti consacrait son temps à d'autres commandes dans la ville, Brunelleschi devint, dans les faits, la seule autorité sur le chantier : l'homme qui détenait la solution restait le seul à la comprendre en entier.", it: "Brunelleschi costruì un modello in legno e mattoni per guidare gli scalpellini nei lavori, con l'aiuto di Donatello e Nanni di Banco — ma lo lasciò deliberatamente incompleto. Non mise mai per iscritto il sistema completo né lo spiegò a Ghiberti, che in teoria era suo pari nell'incarico. Con gli anni, mentre Ghiberti dedicava il suo tempo ad altre commissioni in città, Brunelleschi rimase, di fatto, come unica autorità sui lavori: l'uomo che aveva la soluzione continuava a essere l'unico a comprenderla per intero.",
        },
      },
      {
        titulo: { es: 'La patente que Brunelleschi pidió por miedo', en: 'The patent Brunelleschi requested out of fear', fr: 'Le brevet que Brunelleschi a demandé par crainte', it: 'Il brevetto che Brunelleschi chiese per paura' },
        texto: {
          es: 'El mismo miedo a que le copiaran llevó a Brunelleschi a algo insólito para su época: en 1421 pidió y obtuvo de la Señoría de Florencia el derecho exclusivo, durante tres años, a usar una barcaza de diseño propio para subir mármol de Carrara por el Arno. Historiadores del derecho consideran esa concesión la primera patente de invención documentada en Occidente —casi cuatro siglos antes de que existiera esa palabra—, y el temor que la motivó era el de siempre: que un rival, empezando por Ghiberti, copiara su ingenio sin haber arriesgado nada.',
          en: 'That same fear of being copied drove Brunelleschi to something unheard of for his time: in 1421 he requested, and obtained, from the Signoria of Florence the exclusive right, for three years, to use a barge of his own design to transport Carrara marble up the Arno. Legal historians consider this grant the first documented invention patent in the West — nearly four centuries before the word itself existed — and the fear behind it was the usual one: that a rival, Ghiberti chief among them, would copy his ingenuity without having risked a thing.', fr: "Cette même peur d'être copié poussa Brunelleschi à un geste insolite pour son époque : en 1421, il demanda et obtint de la Seigneurie de Florence le droit exclusif, pendant trois ans, d'utiliser une barge de sa propre conception pour remonter le long de l'Arno le marbre de Carrare. Des historiens du droit considèrent cette concession comme le premier brevet d'invention documenté en Occident — près de quatre siècles avant que ce mot n'existe —, et la crainte qui la motivait était toujours la même : qu'un rival, à commencer par Ghiberti, copie son ingéniosité sans avoir rien risqué.", it: "Lo stesso timore di essere copiato spinse Brunelleschi a un gesto insolito per la sua epoca: nel 1421 chiese e ottenne dalla Signoria di Firenze il diritto esclusivo, per tre anni, di usare un barcone di sua progettazione per trasportare marmo di Carrara lungo l'Arno. Gli storici del diritto considerano quella concessione il primo brevetto d'invenzione documentato in Occidente — quasi quattro secoli prima che esistesse questa parola — e la paura che lo motivò era sempre la stessa: che un rivale, a cominciare da Ghiberti, copiasse il suo ingegno senza aver rischiato nulla.",
        },
      },
      {
        titulo: { es: 'El huevo que, probablemente, nunca se rompió así', en: 'The egg that probably never broke that way', fr: "L'œuf qui, probablement, ne s'est jamais cassé ainsi", it: 'L\'uovo che, probabilmente, non si ruppe mai così' },
        texto: {
          es: 'Cuenta Giorgio Vasari, más de un siglo después de los hechos, que Brunelleschi retó a los demás maestros a hacer que un huevo se sostuviera de pie sobre una superficie lisa: todos fracasaron, él golpeó suavemente la base contra la mesa para aplanarla y lo dejó de pie, argumentando que cualquiera podría construir la cúpula una vez visto su plan, igual que cualquiera podría sostener el huevo una vez visto el truco. Antonio Manetti, que conoció a Brunelleschi en vida y escribió la primera biografía del arquitecto décadas antes que Vasari, no cuenta esta anécdota, y varios historiadores actuales la consideran una dramatización literaria más que un hecho documentado. Real o no, resume bien al personaje: alguien que prefería demostrar que tenía la solución antes que explicarla.',
          en: "Giorgio Vasari, writing more than a century after the fact, tells how Brunelleschi challenged the other master builders to make an egg stand upright on a smooth surface: they all failed, and he tapped its base gently against the table to flatten it and stood it up, arguing that anyone could build the dome once they'd seen his plan, just as anyone could stand the egg up once they'd seen the trick. Antonio Manetti, who knew Brunelleschi personally and wrote the architect's first biography decades before Vasari, doesn't tell this anecdote at all, and several present-day historians regard it as literary dramatization rather than a documented fact. True or not, it sums up the man well: someone who preferred proving he had the solution to explaining it.", fr: "Giorgio Vasari raconte, plus d'un siècle après les faits, que Brunelleschi mit les autres maîtres au défi de faire tenir un œuf debout sur une surface lisse : tous échouèrent, lui en tapa doucement la base contre la table pour l'aplatir et le laissa debout, arguant que n'importe qui pourrait construire la coupole une fois son plan vu, tout comme n'importe qui pourrait faire tenir l'œuf une fois le truc connu. Antonio Manetti, qui connut Brunelleschi de son vivant et écrivit la première biographie de l'architecte des décennies avant Vasari, ne raconte pas cette anecdote, et plusieurs historiens actuels la considèrent davantage comme une dramatisation littéraire qu'un fait documenté. Vraie ou non, elle résume bien le personnage : quelqu'un qui préférait démontrer qu'il détenait la solution plutôt que de l'expliquer.", it: "Racconta Giorgio Vasari, più di un secolo dopo i fatti, che Brunelleschi sfidò gli altri maestri a far stare in piedi un uovo su una superficie liscia: tutti fallirono, lui batté delicatamente la base contro il tavolo per appiattirla e lo lasciò in piedi, sostenendo che chiunque avrebbe potuto costruire la cupola una volta visto il suo progetto, così come chiunque avrebbe potuto far stare in piedi l'uovo una volta visto il trucco. Antonio Manetti, che conobbe Brunelleschi in vita e scrisse la prima biografia dell'architetto decenni prima di Vasari, non racconta questo aneddoto, e diversi storici attuali lo considerano una drammatizzazione letteraria più che un fatto documentato. Vero o no, riassume bene il personaggio: qualcuno che preferiva dimostrare di avere la soluzione piuttosto che spiegarla.",
        },
      },
      {
        titulo: { es: 'Las catorce hornacinas del mismo pleito', en: 'The fourteen niches of the same rivalry', fr: 'Les quatorze niches du même conflit', it: 'Le quattordici nicchie della stessa contesa' },
        texto: {
          es: 'La misma lógica de competir en público se repetía a pocas calles de allí, en Orsanmichele: la ciudad obligó a las principales corporaciones de oficios a llenar sus catorce hornacinas exteriores con una estatua del santo patrono de cada una, y ningún gremio quería quedar por debajo del de al lado. Los más ricos —banqueros, comerciantes de paños, laneros— pagaron bronce, hasta diez veces más caro que el mármol, y contrataron a Ghiberti; los gremios menores se conformaron con mármol y recurrieron a un Donatello todavía joven. Décadas más tarde, el Tribunale della Mercanzia —el tribunal mercantil que representaba a los grandes comerciantes— encargó a Verrocchio un grupo en bronce para sustituir una estatua de Donatello ya considerada anticuada. La hornacina de los carniceros, según varios historiadores del arte, tiene incluso una firma inesperada: se la atribuyen, con dudas, al propio Brunelleschi.',
          en: "The same logic of competing in public repeated itself just a few streets away, at Orsanmichele: the city required the major trade guilds to fill its fourteen exterior niches with a statue of each one's patron saint, and no guild wanted to be outdone by its neighbor. The richest — bankers, cloth merchants, wool traders — paid for bronze, up to ten times more expensive than marble, and hired Ghiberti; the smaller guilds settled for marble and turned to a still-young Donatello. Decades later, the Tribunale della Mercanzia — the merchants' court representing the big traders — commissioned Verrocchio for a bronze group to replace a Donatello statue already considered outdated. The butchers' niche, according to several art historians, even carries an unexpected signature: it's tentatively attributed to Brunelleschi himself.", fr: "La même logique de compétition publique se répétait à quelques rues de là, à Orsanmichele : la ville obligea les principales corporations de métiers à remplir leurs quatorze niches extérieures d'une statue de leur saint patron respectif, et aucune corporation ne voulait paraître en dessous de sa voisine. Les plus riches — banquiers, marchands de draps, lainiers — payèrent le bronze, jusqu'à dix fois plus cher que le marbre, et engagèrent Ghiberti ; les corporations mineures se contentèrent de marbre et firent appel à un Donatello encore jeune. Des décennies plus tard, le Tribunale della Mercanzia — le tribunal marchand qui représentait les grands commerçants — commanda à Verrocchio un groupe en bronze pour remplacer une statue de Donatello déjà jugée dépassée. La niche des bouchers porte même, selon plusieurs historiens de l'art, une signature inattendue : on l'attribue, avec des réserves, à Brunelleschi lui-même.", it: "La stessa logica della competizione in pubblico si ripeteva a poche strade di distanza, a Orsanmichele: la città obbligò le principali corporazioni di arti e mestieri a riempire le loro quattordici nicchie esterne con una statua del santo patrono di ciascuna, e nessuna corporazione voleva sfigurare rispetto a quella accanto. Le più ricche — banchieri, mercanti di panni, lanaioli — pagarono il bronzo, fino a dieci volte più caro del marmo, e ingaggiarono Ghiberti; le corporazioni minori si accontentarono del marmo e si rivolsero a un Donatello ancora giovane. Decenni dopo, il Tribunale della Mercanzia — il tribunale commerciale che rappresentava i grandi mercanti — commissionò a Verrocchio un gruppo in bronzo per sostituire una statua di Donatello ormai considerata superata. La nicchia dei macellai, secondo diversi storici dell'arte, ha perfino una firma inaspettata: viene attribuita, con qualche dubbio, allo stesso Brunelleschi.",
        },
      },
    ],
    enlacesRutas: ['florencia-centro'],
    cierre: {
      es: 'Nada de todo esto —el concurso de 1418, la maqueta a medias, la patente del miedo, el huevo que probablemente nunca existió— aparece en un cartel junto a la cúpula o las hornacinas. {ruta1} recorre ese mismo triángulo entre el Duomo, la Piazza della Signoria y el Ponte Vecchio siguiendo las señales de rivalidad que sí quedaron talladas en la piedra, a la vista de quien se detenga a mirarlas.',
      en: "None of this — the 1418 competition, the half-finished model, the patent born of fear, the egg that probably never happened — appears on a sign next to the dome or the niches. {ruta1} covers that same triangle between the Duomo, Piazza della Signoria and Ponte Vecchio, following the signs of rivalry that were actually carved into the stone, in plain sight of anyone who stops to look.", fr: "Rien de tout cela — le concours de 1418, la maquette à moitié faite, le brevet né de la peur, l'œuf qui n'a probablement jamais existé — n'apparaît sur un panneau près de la coupole ou des niches. {ruta1} parcourt ce même triangle entre le Duomo, la Piazza della Signoria et le Ponte Vecchio en suivant les traces de rivalité qui, elles, sont restées gravées dans la pierre, à la vue de quiconque s'arrête pour les regarder.", it: "Niente di tutto questo — il concorso del 1418, il modello lasciato a metà, il brevetto nato dalla paura, l'uovo che probabilmente non esistette mai — compare su un cartello accanto alla cupola o alle nicchie. {ruta1} percorre lo stesso triangolo tra il Duomo, Piazza della Signoria e Ponte Vecchio seguendo i segni di rivalità che sono rimasti scolpiti nella pietra, a disposizione di chi si ferma a guardarli.",
    },
  },
  {
    id: 'madrid',
    ciudadSlug: 'madrid',
    imgHero: 'assets/img/ciudades/madrid-hero.webp',
    titulo: { es: 'El animal mitológico que ya no está en el escudo de Madrid', en: "The Mythical Animal That's No Longer on Madrid's Coat of Arms", fr: "L'animal mythologique qui a disparu des armoiries de Madrid", it: "L'animale mitologico che non c'è più nello stemma di Madrid" },
    resumen: {
      es: 'En 1967, la Real Academia de la Historia borró del escudo de Madrid una criatura que llevaba más de un siglo instalada allí por error.',
      en: "In 1967, the Real Academia de la Historia erased a creature from Madrid's coat of arms that had sat there by mistake for over a century.", fr: 'En 1967, la Real Academia de la Historia a effacé des armoiries de Madrid une créature installée là par erreur depuis plus d\'un siècle.', it: 'Nel 1967, la Real Academia de la Historia cancellò dallo stemma di Madrid una creatura che vi era rimasta per più di un secolo per errore.',
    },
    secciones: [
      {
        titulo: { es: 'Un pleito que terminó en escudo', en: 'A dispute that ended up on a coat of arms', fr: 'Un litige qui s\'est terminé en armoiries', it: 'Una controversia finita in stemma' },
        texto: {
          es: 'El símbolo más antiguo que se conserva de Madrid, de 1212, no lleva madroño: es solo una osa caminando con siete estrellas sobre el lomo, la misma enseña que, según la tradición, los milicianos de la villa llevaron a la batalla de las Navas de Tolosa. El árbol se incorporó diez años más tarde, en 1222, para cerrar un pleito entre el Concejo y la Iglesia por el uso de los montes que Alfonso VIII había cedido a Madrid en 1202: la Iglesia se quedó con la osa caminando, el Concejo con una osa empinada contra un árbol —después concretado en madroño— reclamando también el fruto. De ese reparto nació el apodo que la ciudad arrastra desde entonces.',
          en: "The oldest surviving symbol of Madrid, from 1212, has no strawberry tree: it's just a she-bear walking with seven stars on her back, the same emblem that, according to tradition, the town's militia carried into the Battle of Las Navas de Tolosa. The tree was added ten years later, in 1222, to settle a dispute between the Council and the Church over the use of the woodlands Alfonso VIII had granted Madrid in 1202: the Church kept the walking bear, the Council got a bear rearing against a tree — later specified as a strawberry tree — with both sides also claiming its fruit. That division is where the nickname the city has carried ever since was born.", fr: "Le symbole le plus ancien conservé de Madrid, datant de 1212, ne porte pas d'arbousier : ce n'est qu'une ourse marchant avec sept étoiles sur le dos, le même emblème que, selon la tradition, les miliciens de la ville portèrent à la bataille de Las Navas de Tolosa. L'arbre fut ajouté dix ans plus tard, en 1222, pour clore un litige entre le Conseil municipal et l'Église sur l'usage des terrains boisés qu'Alphonse VIII avait cédés à Madrid en 1202 : l'Église garda l'ourse marchante, le Conseil municipal une ourse dressée contre un arbre — précisé plus tard sous la forme d'un arbousier — revendiquant elle aussi le fruit. De ce partage naquit le surnom que la ville traîne depuis lors.", it: "Il simbolo più antico che si conserva di Madrid, del 1212, non ha il corbezzolo: è soltanto un'orsa che cammina con sette stelle sul dorso, la stessa insegna che, secondo la tradizione, i miliziani della città portarono nella battaglia delle Navas de Tolosa. L'albero fu aggiunto dieci anni dopo, nel 1222, per chiudere una controversia tra il Consiglio cittadino e la Chiesa sull'uso dei monti che Alfonso VIII aveva ceduto a Madrid nel 1202: alla Chiesa toccò l'orsa che cammina, al Consiglio un'orsa ritta contro un albero — poi identificato come corbezzolo — che reclamava anche il frutto. Da questa spartizione nacque il soprannome che la città porta ancora oggi.",
        },
      },
      {
        titulo: { es: 'La serpiente que un cronista convirtió en dragón', en: 'The snake a chronicler turned into a dragon', fr: 'Le serpent qu\'un chroniqueur a transformé en dragon', it: 'Il serpente che un cronista trasformò in drago' },
        texto: {
          es: 'En 1569, al derribar la Puerta Cerrada para ensanchar el paso, apareció tallado en la dovela principal un relieve que el cronista de la villa, Juan López de Hoyos —años más tarde, maestro de un joven Cervantes—, describió como "un fiero y espantable dragón". La gente empezó a llamar a aquel acceso la Puerta de la Culebra, y no por casualidad: en el propio dibujo que López de Hoyos incluyó en su crónica, la supuesta bestia no pasa de ser una culebra corriente. La leyenda, aun así, cuajó.',
          en: 'In 1569, when the Puerta Cerrada was torn down to widen the passage, a relief carved into the main keystone came to light. The town chronicler, Juan López de Hoyos — years later the teacher of a young Cervantes — described it as "a fierce and fearsome dragon." People started calling that gateway the Puerta de la Culebra, the Snake Gate, and not by chance: in the very drawing López de Hoyos included in his chronicle, the supposed beast is nothing more than an ordinary grass snake. The legend caught on anyway.', fr: "En 1569, en démolissant la Puerta Cerrada pour élargir le passage, on découvrit, taillé dans le claveau principal, un relief que le chroniqueur de la ville, Juan López de Hoyos — des années plus tard, précepteur d'un jeune Cervantès —, décrivit comme « un féroce et effroyable dragon ». Les gens se mirent à appeler cet accès la Puerta de la Culebra (la Porte de la Couleuvre), et pas par hasard : sur le dessin même que López de Hoyos inclut dans sa chronique, la prétendue bête n'est rien de plus qu'une couleuvre ordinaire. La légende, malgré tout, prit racine.", it: 'Nel 1569, demolendo la Puerta Cerrada per allargare il passaggio, apparve scolpito sulla chiave di volta principale un rilievo che il cronista della città, Juan López de Hoyos — anni dopo maestro di un giovane Cervantes —, descrisse come "un fiero e spaventoso drago". La gente iniziò a chiamare quell\'accesso la Puerta de la Culebra, e non per caso: nello stesso disegno che López de Hoyos incluse nella sua cronaca, la presunta bestia non è altro che una comune biscia. La leggenda, ciò nonostante, attecchì.',
        },
      },
      {
        titulo: { es: 'Corona va, corona viene', en: 'Crown after crown', fr: 'Couronne va, couronne vient', it: 'Corona va, corona viene' },
        texto: {
          es: 'En 1554, Carlos I distinguió a Madrid con el título de villa "coronada e imperial", y el escudo ganó una corona imperial abierta. No fue la última corona que tuvo: en 1822, la Milicia Nacional plantó cara a la Guardia Real en defensa de la Constitución, y Fernando VII premió a la villa con una corona cívica de hojas de roble entrelazadas en granate, que se sumó al escudo décadas después. Dos coronas distintas, dos episodios políticos distintos, en el mismo espacio reducido de un blasón.',
          en: 'In 1554, Charles I honored Madrid with the title of "crowned and imperial" town, and the coat of arms gained an open imperial crown. That wasn\'t the last crown it got: in 1822, the National Militia stood up to the Royal Guard in defense of the Constitution, and Ferdinand VII rewarded the town with a civic crown of oak leaves interwoven in garnet, which was added to the coat of arms decades later. Two different crowns, two different political episodes, crammed into the same small space of a coat of arms.', fr: "En 1554, Charles Quint distingua Madrid du titre de ville « couronnée et impériale », et les armoiries gagnèrent une couronne impériale ouverte. Ce ne fut pas la dernière couronne qu'elles reçurent : en 1822, la Milice nationale tint tête à la Garde royale pour défendre la Constitution, et Ferdinand VII récompensa la ville d'une couronne civique de feuilles de chêne entrelacées sur fond grenat, ajoutée aux armoiries des décennies plus tard. Deux couronnes distinctes, deux épisodes politiques distincts, dans le même espace réduit d'un blason.", it: 'Nel 1554, Carlo I insignì Madrid del titolo di villa "coronata e imperiale", e lo stemma guadagnò una corona imperiale aperta. Non fu l\'ultima corona che ricevette: nel 1822, la Milizia Nazionale tenne testa alla Guardia Reale in difesa della Costituzione, e Ferdinando VII premiò la città con una corona civica di foglie di quercia intrecciate su fondo granata, che si aggiunse allo stemma decenni dopo. Due corone diverse, due episodi politici diversi, nello stesso spazio ridotto di un blasone.',
        },
      },
      {
        titulo: { es: 'Cuanto más antiguo, más recargado', en: 'The older, the more ornate', fr: "Plus c'est ancien, plus c'est chargé", it: 'Più antico, più sovraccarico' },
        texto: {
          es: 'A mediados del siglo XIX, el Ayuntamiento reformó el escudo y lo hizo más complejo que nunca: lo dividió en cuarteles, dejó el oso y el madroño en uno, colocó la corona cívica de 1822 en lo alto y resucitó, dorada y con cuartel propio, la criatura que López de Hoyos había visto tallada en la Puerta Cerrada tres siglos antes. Fue la versión más recargada que ha tenido nunca el escudo de Madrid, y también la que más tiempo aguantó: más de cien años, hasta bien entrado el siglo XX.',
          en: "In the mid-19th century, the City Council reworked the coat of arms and made it more elaborate than ever: it split it into quarters, kept the bear and the strawberry tree in one, placed the 1822 civic crown on top, and revived, gilded and with a quarter all its own, the creature López de Hoyos had seen carved on the Puerta Cerrada three centuries earlier. It was the most ornate version Madrid's coat of arms ever had, and also the one that lasted longest: over a hundred years, well into the 20th century.", fr: "Au milieu du XIXe siècle, la mairie réforma les armoiries et les rendit plus complexes que jamais : elle les divisa en quartiers, laissa l'ours et l'arbousier dans l'un d'eux, plaça la couronne civique de 1822 tout en haut, et ressuscita, dorée et dotée de son propre quartier, la créature que López de Hoyos avait vue taillée sur la Puerta Cerrada trois siècles plus tôt. Ce fut la version la plus chargée qu'aient jamais connue les armoiries de Madrid, et aussi celle qui dura le plus longtemps : plus de cent ans, jusque bien avant dans le XXe siècle.", it: "A metà Ottocento, il Comune riformò lo stemma e lo rese più complesso che mai: lo divise in quarti, lasciò l'orso e il corbezzolo in uno di essi, collocò in alto la corona civica del 1822 e fece rivivere, dorata e con un quarto tutto suo, la creatura che López de Hoyos aveva visto scolpita sulla Puerta Cerrada tre secoli prima. Fu la versione più sovraccarica che lo stemma di Madrid abbia mai avuto, e anche quella che resistette più a lungo: oltre cento anni, fino a ben dentro il Novecento.",
        },
      },
      {
        titulo: { es: '1967, la comisión que dijo que no', en: '1967: the committee that said no', fr: 'Vers 1967, la commission qui a dit non', it: '1967, la commissione che disse di no' },
        texto: {
          es: 'Ese año, el Ayuntamiento encargó un informe a la Real Academia de la Historia. Su presidente, Dalmiro de la Válgoma, rastreó el origen de la criatura hasta aquella dovela de 1569 y concluyó que su presencia en el escudo era, sencillamente, un error sin base histórica. El 28 de abril de 1967, el pleno municipal aprobó el escudo que hoy identifica a Madrid: campo de plata, madroño de sinople, oso empinado de sable, una orla azul con siete estrellas de plata y, al timbre, la corona real antigua. La criatura y la corona cívica desaparecieron esa misma tarde, después de casi un siglo en el escudo oficial de la ciudad.',
          en: 'That year, the City Council commissioned a report from the Real Academia de la Historia. Its president, Dalmiro de la Válgoma, traced the creature\'s origin back to that 1569 keystone and concluded that its presence on the coat of arms was, quite simply, a mistake with no historical basis. On 28 April 1967, the city council in full session approved the coat of arms that identifies Madrid today: a silver field, a strawberry tree in green, a black bear rearing up, a blue border with seven silver stars and, at the crest, the old royal crown. The creature and the civic crown vanished that same afternoon, after nearly a century on the city\'s official coat of arms.', fr: "Cette année-là, la mairie commanda un rapport à la Real Academia de la Historia. Son président, Dalmiro de la Válgoma, remonta l'origine de la créature jusqu'à ce claveau de 1569 et conclut que sa présence dans les armoiries n'était, tout simplement, qu'une erreur sans fondement historique. Le 28 avril 1967, le conseil municipal approuva les armoiries qui identifient aujourd'hui Madrid : champ d'argent, arbousier de sinople, ours dressé de sable, une bordure d'azur à sept étoiles d'argent et, au timbre, l'ancienne couronne royale. La créature et la couronne civique disparurent cet après-midi-là même, après près d'un siècle sur les armoiries officielles de la ville.", it: "Quell'anno, il Comune commissionò un rapporto alla Real Academia de la Historia. Il suo presidente, Dalmiro de la Válgoma, risalì all'origine della creatura fino a quella chiave di volta del 1569 e concluse che la sua presenza nello stemma era semplicemente un errore privo di fondamento storico. Il 28 aprile 1967, il consiglio comunale approvò lo stemma che oggi identifica Madrid: campo d'argento, corbezzolo di verde, orso rampante di nero, una bordura d'azzurro con sette stelle d'argento e, in cima, l'antica corona reale. La creatura e la corona civica scomparvero quello stesso pomeriggio, dopo quasi un secolo nello stemma ufficiale della città.",
        },
      },
    ],
    enlacesRutas: ['madrid-austrias'],
    cierre: {
      es: 'Ese escudo recargado, con corona cívica y la criatura que la Real Academia acabó borrando en 1967, no se esfumó del todo: sigue grabado, hoy mismo, en un rincón muy concreto del centro de Madrid que miles de personas pisan cada día sin agacharse a mirarlo. {ruta1} arranca justo ahí, y ese es solo el primero de ocho detalles que el Madrid de los Austrias guarda a la altura de los ojos, no en una vitrina.',
      en: "That ornate coat of arms, with its civic crown and the creature the Real Academia eventually erased in 1967, didn't vanish completely: it's still carved, right now, into one very specific corner of central Madrid that thousands of people walk over every day without bending down to look. {ruta1} starts right there, and that's only the first of eight details that the Madrid de los Austrias keeps at eye level, not behind glass.", fr: "Ces armoiries chargées, avec leur couronne civique et la créature que la Real Academia a fini par effacer en 1967, n'ont pas totalement disparu : elles restent gravées, aujourd'hui même, dans un coin bien précis du centre de Madrid que des milliers de personnes foulent chaque jour sans se pencher pour les regarder. {ruta1} commence justement là, et ce n'est que le premier de huit détails que le Madrid des Habsbourg garde à hauteur des yeux, pas dans une vitrine.", it: "Quello stemma sovraccarico, con corona civica e la creatura che la Real Academia finì per cancellare nel 1967, non è svanito del tutto: resta inciso, ancora oggi, in un angolo ben preciso del centro di Madrid che migliaia di persone calpestano ogni giorno senza chinarsi a guardarlo. {ruta1} parte esattamente da lì, ed è solo il primo di otto dettagli che la Madrid degli Austrias custodisce all'altezza degli occhi, non dentro una vetrina.",
    },
  },
  {
    id: 'valencia',
    ciudadSlug: 'valencia',
    imgHero: 'assets/img/ciudades/valencia-hero.webp',
    titulo: { es: 'La copa que el Carmen guarda desde la Última Cena (o eso dicen)', en: 'The Cup El Carmen Has Kept Since the Last Supper (Or So They Say)', fr: 'La coupe que le Carmen garde depuis la Cène (du moins on le dit)', it: 'Il calice che il Carmen custodisce dall\'Ultima Cena (o almeno così si dice)' },
    resumen: {
      es: 'En el Carmen, la Catedral guarda una copa de piedra del siglo I que dos papas usaron para dar misa: el candidato a Santo Grial mejor documentado.',
      en: 'In El Carmen, the Cathedral holds a 1st-century stone cup that two popes have used to say Mass: the best-documented candidate for the Holy Grail.', fr: "Dans le Carmen, la cathédrale garde une coupe de pierre du Ier siècle que deux papes ont utilisée pour célébrer la messe : le candidat au Saint Graal le mieux documenté.", it: 'Nel Carmen, la Cattedrale custodisce un calice di pietra del I secolo che due papi hanno usato per celebrare messa: il candidato al Santo Graal meglio documentato.',
    },
    secciones: [
      {
        titulo: { es: 'Una copa de piedra, no de oro', en: 'A cup of stone, not gold', fr: "Une coupe de pierre, pas d'or", it: "Un calice di pietra, non d'oro" },
        texto: {
          es: 'Olvidaos de la copa dorada y cubierta de gemas de las películas. El Santo Cáliz que se venera en la Catedral de Valencia, a un paso de la Lonja y del corazón del Carmen, es un cuenco de ágata pulida de apenas 7 centímetros de alto y 9,5 de diámetro, montado sobre un pie de orfebrería medieval añadido siglos después. Vive en su propia capilla, tras una reja, separado de fieles y curiosos por una vitrina. No impone por tamaño ni por brillo: impone por lo que se lleva escrito sobre él desde hace casi mil años.',
          en: "Forget the gold, gem-covered cup from the movies. The Holy Chalice venerated in Valencia Cathedral, a short walk from the Lonja and the heart of El Carmen, is a bowl of polished agate barely 7 centimeters tall and 9.5 in diameter, mounted on a medieval goldsmith's stem added centuries later. It lives in its own chapel, behind a grille, separated from worshippers and the curious by a glass case. It doesn't impress by size or shine: it impresses because of what's been written about it for close to a thousand years.", fr: "Oubliez la coupe dorée et couverte de gemmes des films. Le Saint Calice vénéré dans la cathédrale de Valence, à deux pas de la Lonja et du cœur du Carmen, est un bol d'agate polie d'à peine 7 centimètres de haut et 9,5 de diamètre, monté sur un pied d'orfèvrerie médiévale ajouté des siècles plus tard. Il vit dans sa propre chapelle, derrière une grille, séparé des fidèles et des curieux par une vitrine. Il n'impressionne ni par sa taille ni par son éclat : il impressionne par ce qui s'est écrit à son sujet depuis près de mille ans.", it: 'Dimenticate il calice dorato e ricoperto di gemme dei film. Il Santo Calice venerato nella Cattedrale di Valencia, a un passo dalla Lonja e dal cuore del Carmen, è una coppa di agata levigata di appena 7 centimetri di altezza e 9,5 di diametro, montata su un piede di oreficeria medievale aggiunto secoli dopo. Vive in una cappella tutta sua, dietro un\'inferriata, separato da fedeli e curiosi da una vetrina. Non impressiona per dimensioni né per splendore: impressiona per quello che si scrive su di lui da quasi mille anni.',
        },
      },
      {
        titulo: { es: 'Lo que la piedra sí puede fechar', en: 'What the stone can actually date', fr: 'Ce que la pierre, elle, peut dater', it: 'Quello che la pietra può davvero datare' },
        texto: {
          es: 'La parte de ágata, la única que podría ser realmente antigua, lleva décadas bajo estudio arqueológico. La referencia clásica, del profesor Antonio Beltrán en 1960, la sitúa en torno al cambio de era, entre el siglo I antes de Cristo y el I después, tallada en un taller del Mediterráneo oriental. Un estudio posterior, de 2019, propone algo más concreto: que es un vaso de bendición judío, del mismo tipo que se usaba en las cenas rituales de la época de Herodes el Grande. Si esa datación se sostiene, el objeto sí pudo estar sobre una mesa como la de la Última Cena. Que estuviera en esa mesa exacta ya no lo puede firmar ningún arqueólogo.',
          en: 'The agate part, the only piece that could genuinely be ancient, has been under archaeological study for decades. The classic reference, from Professor Antonio Beltrán in 1960, places it around the turn of the era, between the 1st century BC and the 1st century AD, carved in a workshop in the eastern Mediterranean. A later study, from 2019, proposes something more specific: that it\'s a Jewish blessing cup, of the same type used at ritual dinners in the time of Herod the Great. If that dating holds up, the object could indeed have stood on a table like the one at the Last Supper. That it stood on that exact table is something no archaeologist can sign off on.', fr: "La partie en agate, la seule qui pourrait être réellement ancienne, fait l'objet d'études archéologiques depuis des décennies. La référence classique, celle du professeur Antonio Beltrán en 1960, la situe autour du changement d'ère, entre le Ier siècle avant J.-C. et le Ier après, taillée dans un atelier de Méditerranée orientale. Une étude ultérieure, de 2019, propose quelque chose de plus précis : ce serait un vase de bénédiction juif, du même type que ceux utilisés lors des repas rituels à l'époque d'Hérode le Grand. Si cette datation se confirme, l'objet a effectivement pu se trouver sur une table telle que celle de la Cène. Qu'il se soit trouvé sur cette table précise, en revanche, aucun archéologue ne peut plus le certifier.", it: 'La parte in agata, l\'unica che potrebbe essere davvero antica, è da decenni oggetto di studio archeologico. Il riferimento classico, del professor Antonio Beltrán nel 1960, la colloca intorno al cambio d\'era, tra il I secolo avanti Cristo e il I dopo Cristo, scolpita in una bottega del Mediterraneo orientale. Uno studio successivo, del 2019, propone qualcosa di più concreto: che si tratti di una coppa di benedizione ebraica, dello stesso tipo usato nelle cene rituali dell\'epoca di Erode il Grande. Se questa datazione regge, l\'oggetto può davvero essere stato su una tavola come quella dell\'Ultima Cena. Che fosse su quella tavola esatta, questo nessun archeologo può più garantirlo.',
        },
      },
      {
        titulo: { es: 'De una cueva en Huesca a la mesa de un rey', en: "From a cave in Huesca to a king's table", fr: "D'une grotte de Huesca à la table d'un roi", it: 'Da una grotta di Huesca alla tavola di un re' },
        texto: {
          es: 'El rastro documentado —al margen de la leyenda sobre cómo salió de Roma— arranca en el Pirineo aragonés. En 1071, el obispo de Jaca lo lleva al monasterio de San Juan de la Peña, y un documento del propio monasterio fechado en 1134 ya lo describe como el cáliz en que Cristo consagró su sangre, guardado entonces en un arca de marfil. De ahí pasa a la capilla real de los reyes de Aragón, hasta que Alfonso el Magnánimo, que ya lo guardaba entre sus objetos personales, lo entrega al Cabildo de la Catedral de Valencia en 1437, como garantía de un préstamo de 40.000 ducados de oro. La deuda se quedó en el papel; la copa, en el Carmen, casi 600 años después.',
          en: 'The documented trail — leaving aside the legend of how it left Rome — begins in the Aragonese Pyrenees. In 1071, the Bishop of Jaca brought it to the monastery of San Juan de la Peña, and a document from that same monastery, dated 1134, already describes it as the chalice in which Christ consecrated his blood, kept at the time in an ivory chest. From there it passed to the royal chapel of the kings of Aragon, until Alfonso the Magnanimous, who already kept it among his personal belongings, handed it over to the Chapter of Valencia Cathedral in 1437, as collateral for a loan of 40,000 gold ducats. The debt stayed on paper; the cup has stayed in El Carmen, almost 600 years later.', fr: "La trace documentée — indépendamment de la légende sur sa sortie de Rome — commence dans les Pyrénées aragonaises. En 1071, l'évêque de Jaca l'apporte au monastère de San Juan de la Peña, et un document du monastère lui-même, daté de 1134, le décrit déjà comme le calice dans lequel le Christ consacra son sang, gardé alors dans un coffre d'ivoire. De là, il passe à la chapelle royale des rois d'Aragon, jusqu'à ce qu'Alphonse le Magnanime, qui le gardait déjà parmi ses objets personnels, le remette au Chapitre de la cathédrale de Valence en 1437, en garantie d'un prêt de 40 000 ducats d'or. La dette est restée sur le papier ; la coupe, elle, est restée dans le Carmen, près de 600 ans plus tard.", it: 'La traccia documentata — al di là della leggenda su come uscì da Roma — inizia nei Pirenei aragonesi. Nel 1071, il vescovo di Jaca lo porta al monastero di San Juan de la Peña, e un documento dello stesso monastero datato 1134 lo descrive già come il calice in cui Cristo consacrò il suo sangue, custodito allora in un\'arca d\'avorio. Da lì passa alla cappella reale dei re d\'Aragona, finché Alfonso il Magnanimo, che già lo custodiva tra i suoi oggetti personali, lo consegna al Capitolo della Cattedrale di Valencia nel 1437, come garanzia di un prestito di 40.000 ducati d\'oro. Il debito rimase sulla carta; il calice, nel Carmen, quasi 600 anni dopo.',
        },
      },
      {
        titulo: { es: 'Dos papas, y solo dos, han dicho misa con ella', en: 'Two popes, and only two, have said Mass with it', fr: 'Deux papes, et seulement deux, ont dit la messe avec elle', it: 'Due papi, e solo due, hanno celebrato messa con esso' },
        texto: {
          es: 'Durante siglos, ningún papa ofició la eucaristía con este cáliz. Eso cambió el 8 de noviembre de 1982: Juan Pablo II, de visita en Valencia, pidió usarlo y se convirtió en el primer papa de la historia en decir misa con él. El segundo fue Benedicto XVI, el 9 de julio de 2006, en la misa de clausura del Encuentro Mundial de las Familias, ante más de un millón de personas reunidas en la Ciudad de las Artes y las Ciencias. Hasta hoy, esos dos siguen siendo los únicos.',
          en: 'For centuries, no pope celebrated the Eucharist with this chalice. That changed on 8 November 1982: John Paul II, visiting Valencia, asked to use it and became the first pope in history to say Mass with it. The second was Benedict XVI, on 9 July 2006, at the closing Mass of the World Meeting of Families, before more than a million people gathered at the City of Arts and Sciences. To this day, those two remain the only ones.', fr: "Pendant des siècles, aucun pape ne célébra l'eucharistie avec ce calice. Cela changea le 8 novembre 1982 : Jean-Paul II, en visite à Valence, demanda à l'utiliser et devint le premier pape de l'histoire à dire la messe avec lui. Le second fut Benoît XVI, le 9 juillet 2006, lors de la messe de clôture de la Rencontre mondiale des familles, devant plus d'un million de personnes réunies à la Cité des Arts et des Sciences. À ce jour, ces deux-là restent les seuls.", it: 'Per secoli, nessun papa celebrò l\'eucaristia con questo calice. Le cose cambiarono l\'8 novembre 1982: Giovanni Paolo II, in visita a Valencia, chiese di usarlo e divenne il primo papa della storia a dire messa con esso. Il secondo fu Benedetto XVI, il 9 luglio 2006, nella messa di chiusura dell\'Incontro Mondiale delle Famiglie, davanti a oltre un milione di persone riunite nella Città delle Arti e delle Scienze. Fino a oggi, questi due restano gli unici.',
        },
      },
      {
        titulo: { es: '¿El Grial? Eso ya depende de a quién le preguntéis', en: 'The Grail? That depends who you ask', fr: 'Le Graal ? Cela dépend à qui vous le demandez', it: 'Il Graal? Dipende a chi lo chiedete' },
        texto: {
          es: 'Nadie puede demostrar que esta copa concreta tocara los labios de Cristo: eso es cuestión de fe, no de arqueología. Lo que sí es verificable es que, de todas las copas que en distintos rincones de Europa se han presentado como el Grial a lo largo de los siglos, esta es la única que dos papas han usado en persona para consagrar en misa. Historiadores y arqueólogos siguen discutiendo los detalles, pero coinciden en lo esencial: es el candidato con mejor rastro documental de todos. El resto, que cada cual lo complete con la fe que le sobre.',
          en: "No one can prove that this particular cup touched Christ's lips: that's a matter of faith, not archaeology. What is verifiable is that, of all the cups presented as the Grail in different corners of Europe over the centuries, this is the only one two popes have personally used to consecrate at Mass. Historians and archaeologists still argue over the details, but they agree on the essential point: it's the candidate with the best documented trail of them all. The rest is for each person to fill in with whatever faith they have to spare.", fr: "Personne ne peut démontrer que cette coupe précise a touché les lèvres du Christ : c'est affaire de foi, pas d'archéologie. Ce qui est vérifiable, en revanche, c'est que, parmi toutes les coupes présentées comme le Graal aux quatre coins de l'Europe au fil des siècles, celle-ci est la seule que deux papes ont utilisée en personne pour consacrer lors d'une messe. Historiens et archéologues continuent de débattre des détails, mais s'accordent sur l'essentiel : c'est le candidat le mieux documenté de tous. Le reste, à chacun de le compléter avec la foi qu'il lui reste.", it: 'Nessuno può dimostrare che questo calice in particolare abbia toccato le labbra di Cristo: questa è una questione di fede, non di archeologia. Quello che è verificabile è che, tra tutti i calici che nei diversi angoli d\'Europa sono stati presentati come il Graal nel corso dei secoli, questo è l\'unico che due papi hanno usato di persona per consacrare durante la messa. Storici e archeologi continuano a discutere i dettagli, ma concordano sull\'essenziale: è il candidato con la migliore traccia documentale di tutti. Il resto, che ciascuno lo completi con la fede che gli avanza.',
        },
      },
    ],
    enlacesRutas: ['valencia-carmen'],
    cierre: {
      es: 'Todo esto —la copa, la capilla, los dos papas que dijeron misa con ella— queda a un paseo corto de la Lonja de la Seda, entre las mismas calles del Carmen donde antes regateaban mercaderes de seda y gremios enteros. Si el asunto os ha dejado con ganas de ver la capilla con vuestros propios ojos, {ruta1} cruza ese mismo triángulo del casco histórico y os lleva, enigma a enigma, hasta la puerta del Santo Cáliz.',
      en: 'All of this — the cup, the chapel, the two popes who said Mass with it — sits a short walk from the Lonja de la Seda, among the same streets of El Carmen where silk merchants and entire guilds once haggled. If this has left you wanting to see the chapel with your own eyes, {ruta1} crosses that same triangle of the old town and takes you, puzzle by puzzle, right up to the door of the Holy Chalice.', fr: "Tout cela — la coupe, la chapelle, les deux papes qui ont dit la messe avec elle — se trouve à une courte marche de la Lonja de la Seda, dans les mêmes rues du Carmen où marchandaient jadis des marchands de soie et des corporations entières. Si tout cela vous a donné envie de voir la chapelle de vos propres yeux, {ruta1} traverse ce même triangle du centre historique et vous mène, énigme après énigme, jusqu'à la porte du Saint Calice.", it: 'Tutto questo — il calice, la cappella, i due papi che vi hanno celebrato messa — si trova a una breve passeggiata dalla Lonja de la Seda, tra le stesse strade del Carmen dove un tempo trattavano mercanti di seta e intere corporazioni. Se la storia vi ha lasciato la voglia di vedere la cappella con i vostri occhi, {ruta1} attraversa lo stesso triangolo del centro storico e vi porta, enigma dopo enigma, fino alla porta del Santo Calice.',
    },
  },
  {
    id: 'napoles',
    ciudadSlug: 'napoles',
    imgHero: 'assets/img/ciudades/napoles-hero.webp',
    titulo: { es: 'Una calle griega de 2.500 años sigue partiendo Nápoles en dos', en: 'A 2,500-Year-Old Greek Street Still Splits Naples in Two', fr: 'Une rue grecque de 2 500 ans continue de couper Naples en deux', it: 'Una strada greca di 2.500 anni continua a dividere Napoli in due' },
    resumen: { es: 'Antes de Nápoles existió Palépolis, una ciudad griega vecina: Spaccanapoli es su avenida principal, y por eso sigue partiendo el centro en dos.', en: "Before Naples there was Palaepolis, a neighboring Greek city: Spaccanapoli is its main avenue, and that's why it still splits the historic center in two.", fr: "Avant Naples exista Palépolis, une cité grecque voisine : Spaccanapoli en est l'avenue principale, et c'est pour cela qu'elle continue de couper le centre en deux.", it: "Prima di Napoli esistette Palepoli, una città greca vicina: Spaccanapoli è il suo asse principale, ed è per questo che continua a dividere in due il centro storico." },
    secciones: [
      {
        titulo: { es: 'La ciudad que hubo antes de Nápoles', en: 'The city that existed before Naples', fr: 'La ville qui a précédé Naples', it: 'La città che c\'era prima di Napoli' },
        texto: { es: "A finales del siglo VIII a.C., colonos de Cumas —la colonia griega más antigua del continente italiano— se instalaron en la colina de Pizzofalcone, junto al islote donde hoy se alza el Castel dell'Ovo, y fundaron un asentamiento que llamaron Parténope, por la sirena que la leyenda decía varada en esa misma orilla. Generaciones más tarde, otro grupo de colonos griegos fundó, justo al lado, una segunda ciudad más grande y mejor planificada: la llamaron Neápolis, 'ciudad nueva'. Para distinguirla de la primera, el asentamiento original empezó a conocerse como Palépolis (Παλαιόπολις), 'ciudad vieja'. Durante décadas, las dos convivieron a poca distancia, hasta que Roma se anexionó la más antigua y solo Neápolis siguió creciendo.", en: "In the late 8th century BC, colonists from Cumae — the oldest Greek colony on the Italian mainland — settled on the hill of Pizzofalcone, next to the small island where the Castel dell'Ovo now stands, and founded a settlement they called Parthenope, after the siren legend said had washed up on that same shore. Generations later, another group of Greek colonists founded a second city right next door, bigger and better planned: they called it Neapolis, 'new city.' To tell it apart from the first, the original settlement came to be known as Palaepolis (Παλαιόπολις), 'old city.' For decades the two coexisted a short distance apart, until Rome annexed the older one and only Neapolis kept growing.", fr: "À la fin du VIIIe siècle av. J.-C., des colons venus de Cumes — la plus ancienne colonie grecque du continent italien — s'installèrent sur la colline de Pizzofalcone, près de l'îlot où s'élève aujourd'hui le Castel dell'Ovo, et fondèrent un établissement qu'ils appelèrent Parthénope, du nom de la sirène que la légende disait échouée sur ce même rivage. Des générations plus tard, un autre groupe de colons grecs fonda, juste à côté, une seconde ville plus grande et mieux planifiée : ils l'appelèrent Néapolis, « ville nouvelle ». Pour la distinguer de la première, l'établissement d'origine se mit à être connu sous le nom de Palépolis (Παλαιόπολις), « vieille ville ». Pendant des décennies, les deux coexistèrent à faible distance l'une de l'autre, jusqu'à ce que Rome annexe la plus ancienne et que seule Néapolis continue de croître.", it: "Alla fine dell'VIII secolo a.C., coloni provenienti da Cuma — la più antica colonia greca del continente italiano — si stabilirono sulla collina di Pizzofalcone, accanto all'isolotto dove oggi sorge il Castel dell'Ovo, e fondarono un insediamento che chiamarono Partenope, dal nome della sirena che la leggenda voleva arenata proprio su quella riva. Generazioni più tardi, un altro gruppo di coloni greci fondò, proprio accanto, una seconda città più grande e meglio pianificata: la chiamarono Neapolis, 'città nuova'. Per distinguerlo dal primo, l'insediamento originale iniziò a essere chiamato Palepoli (Παλαιόπολις), 'città vecchia'. Per decenni le due convissero a poca distanza, finché Roma non annesse la più antica e solo Neapolis continuò a crescere." },
      },
      {
        titulo: { es: 'Neápolis, el nombre que no ha cambiado en 2.500 años', en: "Neapolis, the name that hasn't changed in 2,500 years", fr: "Néapolis, le nom qui n'a pas changé depuis 2 500 ans", it: 'Neapolis, il nome che non è cambiato in 2.500 anni' },
        texto: { es: "Neápolis no creció al azar. Sus fundadores trazaron una cuadrícula regular de calles: tres grandes avenidas paralelas —las plateiai— cruzadas en ángulo recto por otras veintiuna calles más estrechas, los stenopoi. Esa planificación geométrica, con siglos de antelación a las reglas urbanísticas que luego se atribuirían a Hipodamo de Mileto, sigue marcando hoy el plano del centro histórico. Y el nombre tampoco se ha perdido: 'Neápolis' pasó al latín como 'Neapolis', de ahí al italiano como 'Napoli' y al español como 'Nápoles', sin más cambio que el desgaste normal de unos 2.500 años de uso ininterrumpido.", en: "Neapolis didn't grow at random. Its founders laid out a regular grid of streets: three broad parallel avenues — the plateiai — crossed at right angles by twenty-one narrower streets, the stenopoi. That geometric planning, centuries ahead of the urban-planning rules later credited to Hippodamus of Miletus, still shapes the layout of the historic center today. And the name hasn't been lost either: 'Neápolis' passed into Latin as 'Neapolis,' from there into Italian as 'Napoli,' and into English as 'Naples' — with no change beyond the ordinary wear of about 2,500 years of unbroken use.", fr: "Néapolis n'a pas grandi au hasard. Ses fondateurs tracèrent une grille régulière de rues : trois grandes avenues parallèles — les plateiai — croisées à angle droit par vingt et une autres rues plus étroites, les stenopoi. Cette planification géométrique, des siècles avant les règles urbanistiques qu'on attribuera plus tard à Hippodamos de Milet, marque encore aujourd'hui le plan du centre historique. Et le nom ne s'est pas perdu non plus : « Néapolis » est passé au latin sous la forme « Neapolis », de là à l'italien « Napoli » et au français « Naples », sans autre changement que l'usure normale de quelque 2 500 ans d'usage ininterrompu.", it: "Neapolis non crebbe a caso. I suoi fondatori tracciarono una griglia regolare di strade: tre grandi assi paralleli — le plateiai — incrociati ad angolo retto da altre ventuno strade più strette, gli stenopoi. Questa pianificazione geometrica, con secoli di anticipo sulle regole urbanistiche che in seguito si attribuirono a Ippodamo di Mileto, segna ancora oggi la pianta del centro storico. E nemmeno il nome è andato perduto: 'Neapolis' passò al latino come 'Neapolis', da lì all'italiano come 'Napoli' e allo spagnolo come 'Nápoles', senza altro cambiamento che il normale logorio di circa 2.500 anni di uso ininterrotto." },
      },
      {
        titulo: { es: 'Una avenida griega que nunca dejó de ser calle', en: 'A Greek avenue that never stopped being a street', fr: "Une avenue grecque qui n'a jamais cessé d'être une rue", it: 'Un asse greco che non ha mai smesso di essere strada' },
        texto: { es: "De esas tres plateiai originales, la más meridional es la que hoy conocemos como Spaccanapoli, apuntando en línea recta hacia la colina donde se alza el Castel Sant'Elmo. Los romanos la integraron sin tocarla en su propio trazado urbano, y la ciudad medieval y barroca simplemente construyó encima, fachada a fachada, sin enderezar ni un tramo. Por eso, de pie en un extremo, se distingue el otro extremo sin que la vista tropiece con una sola curva: no es una calle pensada para parecer recta, es una calle que nunca ha dejado de ser la misma línea que unos agrimensores griegos tiraron hace 2.500 años.", en: "Of those three original plateiai, the southernmost is the one we know today as Spaccanapoli, pointing in a straight line toward the hill where Castel Sant'Elmo stands. The Romans folded it untouched into their own street plan, and the medieval and Baroque city simply built on top, façade by façade, without straightening out a single stretch. That's why, standing at one end, you can make out the other end without your eye hitting a single curve: this isn't a street designed to look straight, it's a street that has never stopped being the same line a group of Greek surveyors laid out 2,500 years ago.", fr: "De ces trois plateiai d'origine, la plus méridionale est celle que nous connaissons aujourd'hui sous le nom de Spaccanapoli, pointant en ligne droite vers la colline où s'élève le Castel Sant'Elmo. Les Romains l'intégrèrent sans y toucher dans leur propre tracé urbain, et la ville médiévale puis baroque a simplement construit par-dessus, façade après façade, sans redresser le moindre tronçon. C'est pourquoi, debout à une extrémité, on distingue l'autre bout sans que le regard ne bute sur une seule courbe : ce n'est pas une rue pensée pour paraître droite, c'est une rue qui n'a jamais cessé d'être la même ligne que des arpenteurs grecs ont tracée il y a 2 500 ans.", it: "Di quelle tre plateiai originarie, la più meridionale è quella che oggi conosciamo come Spaccanapoli, puntata in linea retta verso la collina dove sorge il Castel Sant'Elmo. I romani la integrarono senza toccarla nel proprio impianto urbano, e la città medievale e barocca costruì semplicemente sopra, facciata dopo facciata, senza raddrizzare nemmeno un tratto. Per questo, in piedi a un'estremità, si distingue l'altra senza che lo sguardo incontri una sola curva: non è una strada pensata per sembrare dritta, è una strada che non ha mai smesso di essere la stessa linea tracciata da agrimensori greci 2.500 anni fa." },
      },
      {
        titulo: { es: 'Cuando Roma conquistó la ciudad y no cambió casi nada', en: 'When Rome conquered the city and changed almost nothing', fr: 'Quand Rome a conquis la ville sans presque rien changer', it: 'Quando Roma conquistò la città e non cambiò quasi nulla' },
        texto: { es: "En el 326 a.C., Roma puso fin a la independencia de Palépolis-Neápolis tras la guerra contra los samnitas. Pero, a diferencia de otras conquistas, no impuso su lengua ni sus costumbres: convirtió a la ciudad en una 'civitas foederata', aliada con estatuto propio, y Nápoles siguió hablando griego y celebrando competiciones atléticas y musicales al estilo heleno durante siglos, ya bajo dominio romano. El propio emperador Nerón eligió Nápoles, y no Roma, para debutar en público como cantante, convencido —según los cronistas romanos de la época— de que un público de raíces griegas sabría apreciar mejor su actuación que uno romano.", en: "In 326 BC, Rome ended the independence of Palaepolis-Neapolis after the war against the Samnites. But unlike other conquests, it didn't impose its language or customs: it made the city a 'civitas foederata,' an allied city with its own special status, and Naples kept speaking Greek and holding athletic and musical competitions in the Hellenic style for centuries, even under Roman rule. Emperor Nero himself chose Naples, not Rome, for his public debut as a singer, convinced — according to Roman chroniclers of the time — that an audience with Greek roots would appreciate his performance better than a Roman one would.", fr: "En 326 av. J.-C., Rome mit fin à l'indépendance de Palépolis-Néapolis à l'issue de la guerre contre les Samnites. Mais, contrairement à d'autres conquêtes, elle n'imposa ni sa langue ni ses coutumes : elle fit de la ville une civitas foederata, une alliée dotée de son propre statut, et Naples continua de parler grec et de célébrer des compétitions athlétiques et musicales à la mode hellène pendant des siècles, déjà sous domination romaine. L'empereur Néron lui-même choisit Naples, et non Rome, pour ses débuts publics en tant que chanteur, convaincu — selon les chroniqueurs romains de l'époque — qu'un public de racines grecques saurait mieux apprécier sa prestation qu'un public romain.", it: "Nel 326 a.C., Roma pose fine all'indipendenza di Palepoli-Neapolis dopo la guerra contro i Sanniti. Ma, a differenza di altre conquiste, non impose la propria lingua né i propri costumi: trasformò la città in una 'civitas foederata', alleata con statuto proprio, e Napoli continuò a parlare greco e a celebrare competizioni atletiche e musicali in stile ellenico per secoli, già sotto il dominio romano. Lo stesso imperatore Nerone scelse Napoli, e non Roma, per debuttare in pubblico come cantante, convinto — secondo i cronisti romani dell'epoca — che un pubblico di radici greche avrebbe saputo apprezzare la sua esibizione meglio di uno romano." },
      },
      {
        titulo: { es: 'Tres capas bajo el asfalto: cantera, acueducto y refugio', en: 'Three layers under the asphalt: quarry, aqueduct and shelter', fr: "Trois strates sous l'asphalte : carrière, aqueduc et abri", it: "Tre strati sotto l'asfalto: cava, acquedotto e rifugio" },
        texto: { es: "El subsuelo de Nápoles está tan estratificado como sus calles. Los griegos empezaron a excavar la toba volcánica bajo Neápolis para extraer los bloques con los que se levantaron murallas y templos, dejando cientos de galerías vacías. Los romanos las ampliaron y conectaron hasta convertirlas en el acueducto della Bolla, la red de cisternas y canales que abasteció de agua potable a la ciudad hasta el siglo XIX. Dejó de funcionar en 1884, cuando el Reino de Italia ordenó su cierre definitivo: una epidemia de cólera del año anterior había demostrado que las aguas residuales se filtraban a través de la toba porosa y contaminaban el agua que bebía la ciudad. Durante casi sesenta años esos túneles no fueron más que un vertedero clandestino, hasta que en 1942, en plena Segunda Guerra Mundial, las autoridades italianas los recuperaron de nuevo: excavaron escaleras de acceso y los acondicionaron como refugio antiaéreo, hasta 40 metros bajo tierra, para los napolitanos que huían de los bombardeos aliados.", en: "The ground beneath Naples is as layered as its streets. The Greeks began digging into the volcanic tuff under Neapolis to quarry the blocks used to build walls and temples, leaving behind hundreds of empty galleries. The Romans expanded and connected them into the Bolla aqueduct, the network of cisterns and channels that supplied the city with drinking water until the 19th century. It stopped operating in 1884, when the Kingdom of Italy ordered it permanently shut down: a cholera outbreak the year before had shown that wastewater was seeping through the porous tuff and contaminating the water the city drank. For nearly sixty years those tunnels served as little more than an illegal dump, until 1942, in the middle of the Second World War, Italian authorities reclaimed them again: they dug access stairways and fitted them out as an air-raid shelter, up to 40 meters underground, for Neapolitans fleeing Allied bombing raids.", fr: "Le sous-sol de Naples est tout aussi stratifié que ses rues. Les Grecs commencèrent à creuser le tuf volcanique sous Néapolis pour en extraire les blocs qui servirent à élever murailles et temples, laissant derrière eux des centaines de galeries vides. Les Romains les agrandirent et les relièrent jusqu'à en faire l'aqueduc della Bolla, le réseau de citernes et de canaux qui approvisionna la ville en eau potable jusqu'au XIXe siècle. Il cessa de fonctionner en 1884, quand le royaume d'Italie ordonna sa fermeture définitive : une épidémie de choléra survenue l'année précédente avait montré que les eaux usées s'infiltraient à travers le tuf poreux et contaminaient l'eau que buvait la ville. Pendant près de soixante ans, ces tunnels ne furent plus qu'une décharge clandestine, jusqu'à ce qu'en 1942, en pleine Seconde Guerre mondiale, les autorités italiennes les récupèrent à nouveau : elles y creusèrent des escaliers d'accès et les aménagèrent en abri antiaérien, jusqu'à 40 mètres sous terre, pour les Napolitains fuyant les bombardements alliés.", it: "Il sottosuolo di Napoli è stratificato quanto le sue strade. I greci iniziarono a scavare il tufo vulcanico sotto Neapolis per estrarre i blocchi con cui si costruirono mura e templi, lasciando centinaia di gallerie vuote. I romani le ampliarono e le collegarono fino a trasformarle nell'acquedotto della Bolla, la rete di cisterne e canali che rifornì d'acqua potabile la città fino all'Ottocento. Smise di funzionare nel 1884, quando il Regno d'Italia ne ordinò la chiusura definitiva: un'epidemia di colera dell'anno precedente aveva dimostrato che le acque reflue filtravano attraverso il tufo poroso e contaminavano l'acqua che la città beveva. Per quasi sessant'anni quei tunnel non furono altro che una discarica clandestina, finché nel 1942, in piena Seconda Guerra Mondiale, le autorità italiane li recuperarono di nuovo: scavarono scale d'accesso e li adattarono a rifugio antiaereo, fino a 40 metri sottoterra, per i napoletani in fuga dai bombardamenti alleati." },
      },
    ],
    enlacesRutas: ['napoles-spaccanapoli'],
    cierre: { es: "Toda esa superposición de capas —Palépolis bajo Neápolis, el decumano romano bajo la calle barroca, la cantera griega bajo el acueducto bajo el refugio de guerra— se recorre a pie, en unas dos horas, en {ruta1}: la manera más directa de sentir, calle a calle, por qué Nápoles nunca ha dejado de tener 2.500 años.", en: "That whole stack of layers — Palaepolis under Neapolis, the Roman decumanus under the Baroque street, the Greek quarry under the aqueduct under the wartime shelter — can be walked on foot, in about two hours, on {ruta1}: the most direct way to feel, street by street, why Naples has never stopped being 2,500 years old.", fr: "Toute cette superposition de strates — Palépolis sous Néapolis, le decumanus romain sous la rue baroque, la carrière grecque sous l'aqueduc sous l'abri de guerre — se parcourt à pied, en environ deux heures, avec {ruta1} : la manière la plus directe de sentir, rue après rue, pourquoi Naples n'a jamais cessé d'avoir 2 500 ans.", it: "Tutta questa sovrapposizione di strati — Palepoli sotto Neapolis, il decumano romano sotto la strada barocca, la cava greca sotto l'acquedotto sotto il rifugio di guerra — si percorre a piedi, in circa due ore, in {ruta1}: il modo più diretto per sentire, strada dopo strada, perché Napoli non ha mai smesso di avere 2.500 anni." },
  },
  {
    id: 'toulouse',
    ciudadSlug: 'toulouse',
    imgHero: 'assets/img/ciudades/toulouse-hero.webp',
    titulo: { es: 'Por qué a Toulouse le dicen la Ciudad Rosa', en: 'Why Toulouse Is Called the Pink City', fr: 'Pourquoi Toulouse est surnommée la Ville Rose', it: 'Perché Tolosa è chiamata la Città Rosa' },
    resumen: {
      es: 'El ladrillo rosa de Toulouse no fue una elección estética: el valle del Garona no tiene canteras de piedra, y ese rosa solo aparece al atardecer.',
      en: "Toulouse's pink brick wasn't an aesthetic choice: the Garonne valley has no stone quarries, and that pink only shows up at sunset.",
      fr: "La brique rose de Toulouse n'a jamais été un choix esthétique : la vallée de la Garonne n'a pas de carrières de pierre, et ce rose n'apparaît qu'au crépuscule.",
      it: 'Il mattone rosa di Tolosa non fu una scelta estetica: la valle della Garonna non ha cave di pietra, e quel rosa compare solo al tramonto.',
    },
    secciones: [
      {
        titulo: { es: 'Una ciudad sin piedra', en: 'A city with no stone', fr: 'Une ville sans pierre', it: 'Una città senza pietra' },
        texto: {
          es: 'Toulouse se construyó en ladrillo por una razón que no tiene nada que ver con el gusto: no había otra opción. La cuenca del Garona, donde se asienta la ciudad, carece de canteras de piedra caliza; la más cercana está a más de 70 km, en las estribaciones de los Pirineos, y traerla hasta aquí exigía bajarla en balsas por el Garona o el Ariège, o, desde finales del siglo XVII, por el Canal du Midi. El resultado: la piedra se volvió un lujo, reservada para dinteles, cornisas y detalles puntuales, mientras que el barro del propio río, abundante y gratis, se convirtió en el material de todo lo demás. Ya los romanos explotaban esa arcilla aluvial en el siglo I a. C. para fabricar ladrillo cocido de medidas estandarizadas: la receta de Toulouse tiene dos mil años.',
          en: "Toulouse was built in brick for a reason that has nothing to do with taste: there was no other option. The Garonne basin, where the city sits, has no limestone quarries; the nearest one is more than 70 km away, in the foothills of the Pyrenees, and getting stone here meant floating it down the Garonne or the Ariège on rafts, or, from the late 17th century on, along the Canal du Midi. The result: stone became a luxury, reserved for lintels, cornices and the odd detail, while the mud of the river itself, plentiful and free, became the material for everything else. The Romans were already working that alluvial clay in the 1st century BC to make fired brick in standardized sizes: Toulouse's recipe is two thousand years old.",
          fr: "Toulouse s'est construite en brique pour une raison qui n'a rien à voir avec le goût : il n'y avait pas d'autre choix. Le bassin de la Garonne, où se trouve la ville, est dépourvu de carrières de pierre calcaire ; la plus proche se trouve à plus de 70 km, dans les contreforts des Pyrénées, et l'acheminer jusqu'ici exigeait de la faire descendre en radeaux sur la Garonne ou l'Ariège, ou, à partir de la fin du XVIIe siècle, par le canal du Midi. Résultat : la pierre devint un luxe, réservée aux linteaux, aux corniches et à quelques détails ponctuels, tandis que la terre du fleuve lui-même, abondante et gratuite, devenait le matériau de tout le reste. Les Romains exploitaient déjà cette argile alluviale au Ier siècle av. J.-C. pour fabriquer une brique cuite aux dimensions standardisées : la recette de Toulouse a deux mille ans.",
          it: "Tolosa si costruì in mattoni per una ragione che non ha nulla a che vedere con il gusto: non c'era altra scelta. Il bacino della Garonna, dove sorge la città, è privo di cave di pietra calcarea; la più vicina si trova a oltre 70 km, alle propaggini dei Pirenei, e portarla fin qui richiedeva farla scendere su zattere lungo la Garonna o l'Ariège, oppure, dalla fine del Seicento, lungo il Canal du Midi. Il risultato: la pietra divenne un lusso, riservata ad architravi, cornicioni e dettagli puntuali, mentre l'argilla dello stesso fiume, abbondante e gratuita, divenne il materiale di tutto il resto. Già i romani sfruttavano quest'argilla alluvionale nel I secolo a.C. per fabbricare mattoni cotti di misure standardizzate: la ricetta di Tolosa ha duemila anni.",
        },
      },
      {
        titulo: { es: 'Un rosa que depende de la hora', en: 'A pink that depends on the hour', fr: "Un rose qui dépend de l'heure", it: "Un rosa che dipende dall'ora" },
        texto: {
          es: 'El apodo Ville Rose no describe el color del ladrillo, sino un efecto de luz muy concreto. A mediodía, ese mismo ladrillo se ve sobre todo rojizo, casi terracota; el rosa de verdad, el intenso, solo aparece al atardecer, cuando el sol cae en ángulo bajo desde el oeste y golpea las fachadas de refilón: es entonces cuando se encienden en un rosa dorado y cálido, un fenómeno tan climático como arquitectónico. Ni siquiera todos los ladrillos son iguales: una cocción más suave da tonos claros, casi salmón, y una cocción más fuerte los oscurece hacia el rojo marrón. El mirador clásico para verlo es el Pont Neuf, mirando hacia el Quai de la Daurade, justo cuando el sol empieza a caer sobre el río.',
          en: "The nickname Ville Rose doesn't describe the color of the brick itself, but a very specific effect of light. At midday, that same brick looks mostly reddish, almost terracotta; the real pink, the intense one, only shows up at sunset, when the sun drops to a low angle in the west and strikes the façades at a slant: that's when they light up in a warm, golden pink, a phenomenon as much about climate as architecture. Not even all the bricks are alike: a gentler firing gives lighter tones, almost salmon, while a stronger firing darkens them toward reddish brown. The classic spot to see it is the Pont Neuf, looking toward the Quai de la Daurade, just as the sun starts to drop over the river.",
          fr: "Le surnom Ville Rose ne décrit pas la couleur de la brique, mais un effet de lumière bien précis. À midi, cette même brique paraît surtout rougeâtre, presque terre cuite ; le vrai rose, l'intense, n'apparaît qu'au crépuscule, quand le soleil descend à angle bas depuis l'ouest et frappe les façades en rasant : c'est alors qu'elles s'embrasent d'un rose doré et chaud, un phénomène tout aussi climatique qu'architectural. Les briques elles-mêmes ne sont pas toutes identiques : une cuisson plus douce donne des teintes claires, presque saumon, et une cuisson plus forte les assombrit vers le rouge brun. Le point de vue classique pour l'observer est le Pont Neuf, en regardant vers le Quai de la Daurade, juste quand le soleil commence à tomber sur le fleuve.",
          it: "Il soprannome Ville Rose non descrive il colore del mattone, ma un effetto di luce molto preciso. A mezzogiorno, lo stesso mattone appare soprattutto rossiccio, quasi terracotta; il rosa vero, quello intenso, compare solo al tramonto, quando il sole scende con un angolo basso da ovest e colpisce le facciate di sbieco: è allora che si accendono di un rosa dorato e caldo, un fenomeno tanto climatico quanto architettonico. Non sono nemmeno tutti i mattoni uguali: una cottura più leggera dà toni chiari, quasi salmone, e una cottura più forte li scurisce verso il rosso bruno. Il punto di osservazione classico è il Pont Neuf, guardando verso il Quai de la Daurade, proprio mentre il sole inizia a calare sul fiume.",
        },
      },
      {
        titulo: { es: 'Un condado casi tan grande como un reino', en: 'A county almost as large as a kingdom', fr: 'Un comté presque aussi grand qu\'un royaume', it: 'Una contea grande quasi quanto un regno' },
        texto: {
          es: 'Antes de ser una ciudad francesa como cualquier otra, Toulouse fue la capital de un estado con peso propio. A comienzos del siglo XIII, bajo el conde Raimundo VI, el Condado de Toulouse no se limitaba a la ciudad: incluía el Rouergue, el Quercy, el ducado de Narbona y los marquesados de Gothia y Provenza, un territorio que en extensión rivalizaba con el dominio directo del propio rey de Francia. El conde rendía homenaje formal a la corona, pero gobernaba, impartía justicia y hacía la guerra por su cuenta: la dependencia era, sobre todo, nominal.',
          en: "Before it was just another French city, Toulouse was the capital of a state with real weight of its own. In the early 13th century, under Count Raymond VI, the County of Toulouse wasn't limited to the city: it included the Rouergue, the Quercy, the Duchy of Narbonne and the marquisates of Gothia and Provence, a territory that rivaled in size the French king's own direct domain. The count paid formal homage to the crown, but governed, dispensed justice and waged war on his own account: the dependency was, above all, nominal.", fr: "Avant d'être une ville française comme les autres, Toulouse fut la capitale d'un État de poids. Au début du XIIIe siècle, sous le comte Raymond VI, le comté de Toulouse ne se limitait pas à la ville : il englobait le Rouergue, le Quercy, le duché de Narbonne et les marquisats de Gothie et de Provence, un territoire dont l'étendue rivalisait avec le domaine direct du roi de France lui-même. Le comte rendait hommage formel à la couronne, mais gouvernait, rendait la justice et faisait la guerre pour son propre compte : la dépendance était, avant tout, nominale.",
          it: "Prima di essere una città francese come tante altre, Tolosa fu la capitale di uno stato con un peso proprio. All'inizio del Duecento, sotto il conte Raimondo VI, la Contea di Tolosa non si limitava alla città: comprendeva il Rouergue, il Quercy, il ducato di Narbona e i marchesati di Gothia e Provenza, un territorio che per estensione rivaleggiava con il dominio diretto dello stesso re di Francia. Il conte rendeva omaggio formale alla corona, ma governava, amministrava la giustizia e faceva la guerra per conto proprio: la dipendenza era, soprattutto, nominale.",
        },
      },
      {
        titulo: { es: 'La cruzada que acabó con la independencia', en: 'The crusade that ended its independence', fr: "La croisade qui a mis fin à l'indépendance", it: "La crociata che pose fine all'indipendenza" },
        texto: {
          es: 'Esa autonomía terminó por una cuestión de fe. La región de Toulouse era el corazón del catarismo, una herejía cristiana que la Iglesia de Roma quiso erradicar a cualquier precio: en 1209 el papa Inocencio III proclamó una cruzada, y durante veinte años un ejército de nobles del norte de Francia, primero bajo el mando de Simón de Montfort, arrasó el Languedoc pueblo a pueblo. No fue solo una guerra religiosa: fue también la manera en que la corona francesa terminó metiendo, por la fuerza, a todo el sur del país bajo su autoridad directa.',
          en: "That autonomy ended over a matter of faith. The Toulouse region was the heartland of Catharism, a Christian heresy the Church of Rome wanted wiped out at any cost: in 1209 Pope Innocent III proclaimed a crusade, and for twenty years an army of nobles from northern France, first under the command of Simon de Montfort, tore through the Languedoc town by town. It wasn't just a religious war: it was also how the French crown ended up forcing the whole south of the country under its direct authority.", fr: "Cette autonomie prit fin pour une question de foi. La région toulousaine était le cœur du catharisme, une hérésie chrétienne que l'Église de Rome voulut éradiquer à tout prix : en 1209, le pape Innocent III proclama une croisade, et pendant vingt ans une armée de nobles du nord de la France, d'abord sous le commandement de Simon de Montfort, ravagea le Languedoc village après village. Ce ne fut pas seulement une guerre religieuse : ce fut aussi la manière dont la couronne française finit par faire entrer, de force, tout le sud du pays sous son autorité directe.",
          it: "Quell'autonomia finì per una questione di fede. La regione di Tolosa era il cuore del catarismo, un'eresia cristiana che la Chiesa di Roma volle sradicare a qualsiasi costo: nel 1209 papa Innocenzo III proclamò una crociata, e per vent'anni un esercito di nobili del nord della Francia, dapprima al comando di Simone di Montfort, devastò la Linguadoca paese dopo paese. Non fu soltanto una guerra religiosa: fu anche il modo in cui la corona francese finì per portare, con la forza, tutto il sud del paese sotto la propria autorità diretta.",
        },
      },
      {
        titulo: { es: 'Una boda sella la anexión', en: 'A wedding seals the annexation', fr: "Un mariage scelle l'annexion", it: "Un matrimonio sancisce l'annessione" },
        texto: {
          es: 'La guerra se cerró en una mesa, no en un campo de batalla. El 12 de abril de 1229, en el tratado de Meaux-París, el conde Raimundo VII se reconcilió con el joven rey Luis IX y aceptó casar a Juana, su única hija y heredera, con Alfonso de Poitiers, hermano del rey. El matrimonio no tuvo hijos, así que a la muerte de Alfonso, en 1271, el condado revirtió íntegro a la corona: cuarenta y dos años después de aquel tratado, Toulouse dejó de ser la capital de nada que no fuera Francia.',
          en: 'The war was settled at a table, not on a battlefield. On 12 April 1229, in the Treaty of Meaux-Paris, Count Raymond VII made peace with the young King Louis IX and agreed to marry off Joan, his only daughter and heir, to Alphonse of Poitiers, the king\'s brother. The marriage produced no children, so when Alphonse died in 1271, the county reverted to the crown in full: forty-two years after that treaty, Toulouse stopped being the capital of anything but France.', fr: "La guerre se conclut à une table, pas sur un champ de bataille. Le 12 avril 1229, dans le traité de Meaux-Paris, le comte Raymond VII se réconcilia avec le jeune roi Louis IX et accepta de marier Jeanne, sa fille unique et héritière, à Alphonse de Poitiers, frère du roi. Le mariage resta sans enfant, si bien qu'à la mort d'Alphonse, en 1271, le comté revint intégralement à la couronne : quarante-deux ans après ce traité, Toulouse cessa d'être la capitale de quoi que ce soit d'autre que la France.",
          it: "La guerra si chiuse a un tavolo, non su un campo di battaglia. Il 12 aprile 1229, nel trattato di Meaux-Parigi, il conte Raimondo VII si riconciliò con il giovane re Luigi IX e accettò di dare in sposa Giovanna, la sua unica figlia ed erede, ad Alfonso di Poitiers, fratello del re. Il matrimonio non ebbe figli, così alla morte di Alfonso, nel 1271, la contea tornò integralmente alla corona: quarantadue anni dopo quel trattato, Tolosa smise di essere la capitale di qualunque cosa che non fosse la Francia.",
        },
      },
    ],
    enlacesRutas: ['toulouse-capitole'],
    cierre: {
      es: 'Todo esto —la arcilla que sustituyó a la piedra, el rosa que solo aparece con la luz baja, el condado que perdió el pulso con París— sigue ahí, en las fachadas del centro histórico. {ruta1} atraviesa esa misma zona a pie, de la plaza que heredó el gobierno de la ciudad a la basílica románica más grande de Europa, y se detiene en el ladrillo con el tiempo que un cartel turístico nunca da.',
      en: "All of this — the clay that stood in for stone, the pink that only appears in low light, the county that lost its power struggle with Paris — is still there, in the façades of the historic center. {ruta1} crosses that same area on foot, from the square that inherited the city's government to the largest Romanesque basilica in Europe, and lingers over the brick with the time a tourist plaque never gives it.",
      fr: "Tout cela — l'argile qui a remplacé la pierre, le rose qui n'apparaît qu'à la lumière rasante, le comté qui a perdu le bras de fer face à Paris — est toujours là, sur les façades du centre historique. {ruta1} traverse cette même zone à pied, de la place qui a hérité du gouvernement de la ville jusqu'à la plus grande basilique romane d'Europe, et s'attarde sur la brique avec le temps qu'un panneau touristique ne donne jamais.",
      it: "Tutto questo — l'argilla che sostituì la pietra, il rosa che compare solo con la luce radente, la contea che perse il braccio di ferro con Parigi — è ancora lì, sulle facciate del centro storico. {ruta1} attraversa a piedi quella stessa zona, dalla piazza che ereditò il governo della città fino alla più grande basilica romanica d'Europa, e si sofferma sul mattone con il tempo che un cartello turistico non concede mai.",
    },
  },
  {
    id: 'berlin',
    ciudadSlug: 'berlin',
    imgHero: 'assets/img/ciudades/berlin-hero.webp',
    titulo: {
      es: 'Berlín no esconde su historia del siglo XX: la deja tallada en la calle',
      en: "Berlin Doesn't Hide Its 20th-Century History: It Leaves It Carved Into the Street", fr: 'Berlin ne cache pas son histoire du XXe siècle : elle la laisse gravée dans la rue', it: 'Berlino non nasconde la sua storia del Novecento: la lascia incisa per strada',
    },
    resumen: {
      es: 'Berlín tiene más de 100.000 placas de latón incrustadas en sus aceras, cada una con el nombre de una víctima del nazismo frente a su último hogar.',
      en: "Berlin has more than 100,000 brass plaques set into its sidewalks, each one naming a Nazi victim outside their last home.", fr: "Berlin compte plus de 100 000 plaques de laiton incrustées dans ses trottoirs, chacune portant le nom d'une victime du nazisme, face à son dernier domicile.", it: 'Berlino ha oltre 100.000 targhe di ottone incastonate nei marciapiedi, ciascuna con il nome di una vittima del nazismo davanti alla sua ultima casa.',
    },
    secciones: [
      {
        titulo: { es: 'Piedras, no pedestales', en: 'Stones, not pedestals', fr: 'Des pierres, pas des piédestaux', it: 'Pietre, non piedistalli' },
        texto: {
          es: 'Se llaman Stolpersteine, piedras de tropiezo, y ninguna está sobre un pedestal. Son placas de latón de 10 por 10 centímetros encajadas al ras del pavimento, una por víctima, siempre frente a la casa donde esa persona vivió por última vez antes de que se la llevaran. Cada una lleva grabados a mano un nombre, un año de nacimiento y lo que pasó después: fecha de deportación, campo, fecha de muerte cuando se conoce. Hoy hay más de 100.000 repartidas por más de 30 países europeos: es el memorial descentralizado más grande del mundo, sin sede ni monumento central, solo miles de puntos sueltos cosidos al pavimento de media Europa.',
          en: "They're called Stolpersteine, stumbling stones, and none of them sits on a pedestal. They're brass plaques, 10 by 10 centimeters, set flush into the pavement, one per victim, always outside the house where that person last lived before they were taken away. Each one has a name, a birth year and what happened afterward hand-engraved on it: deportation date, camp, date of death where it's known. There are now more than 100,000 of them scattered across more than 30 European countries: it's the largest decentralized memorial in the world, with no headquarters and no central monument, just thousands of loose points stitched into the pavement of half of Europe.", fr: "On les appelle Stolpersteine — littéralement « pierres sur lesquelles on trébuche » —, et aucune n'est posée sur un piédestal. Ce sont des plaques de laiton de 10 sur 10 centimètres encastrées au ras du pavement, une par victime, toujours face à la maison où cette personne a vécu pour la dernière fois avant d'être emmenée. Chacune porte gravés à la main un nom, une année de naissance et ce qui s'est passé ensuite : date de déportation, camp, date de mort quand elle est connue. On en compte aujourd'hui plus de 100 000, réparties dans plus de 30 pays européens : c'est le mémorial décentralisé le plus grand du monde, sans siège ni monument central, seulement des milliers de points isolés cousus au pavement de la moitié de l'Europe.", it: "Si chiamano Stolpersteine, pietre d'inciampo, e nessuna sta su un piedistallo. Sono targhe di ottone di 10 per 10 centimetri incastonate a filo del selciato, una per vittima, sempre davanti alla casa dove quella persona visse per l'ultima volta prima di essere portata via. Ognuna reca incisi a mano un nome, un anno di nascita e quello che accadde dopo: data di deportazione, campo, data di morte quando è nota. Oggi ce ne sono più di 100.000 sparse in oltre 30 paesi europei: è il memoriale decentralizzato più grande del mondo, senza sede né monumento centrale, solo migliaia di punti isolati cuciti nel selciato di mezza Europa.",
        },
      },
      {
        titulo: { es: 'Empezó en una acera de Berlín', en: 'It started on a Berlin sidewalk', fr: 'Cela a commencé sur un trottoir de Berlin', it: 'Iniziò su un marciapiede di Berlino' },
        texto: {
          es: 'El artista alemán Gunter Demnig probó la idea por primera vez en Colonia, en diciembre de 1992, con una sola placa frente al ayuntamiento, para conmemorar la orden de Heinrich Himmler que mandó deportar a los gitanos sinti y roma a Auschwitz. Pero el proyecto tal como existe hoy —una piedra, un nombre, una dirección real— nació en Berlín. En mayo de 1996, Demnig colocó 51 piedras en las aceras de Oranienstraße y Dresdener Straße, en Kreuzberg, sin pedir permiso a nadie. La primera de todas fue para Lina Friedemann, frente al número 158. Tres meses después, unas obras en Moritzplatz sacaron las piedras a la luz ante el distrito, que optó por legalizarlas en vez de retirarlas. De ahí se extendió al resto de Berlín, luego a toda Alemania y después a más de treinta países.',
          en: "German artist Gunter Demnig first tried out the idea in Cologne, in December 1992, with a single plaque outside the city hall, to mark Heinrich Himmler's order deporting Sinti and Roma people to Auschwitz. But the project as it exists today — one stone, one name, one real address — was born in Berlin. In May 1996, Demnig laid 51 stones in the sidewalks of Oranienstraße and Dresdener Straße, in Kreuzberg, without asking anyone's permission. The very first was for Lina Friedemann, outside number 158. Three months later, roadworks at Moritzplatz brought the stones to the district's attention, and it chose to legalize them rather than remove them. From there it spread to the rest of Berlin, then to all of Germany, and later to more than thirty countries.", fr: "L'artiste allemand Gunter Demnig testa l'idée pour la première fois à Cologne, en décembre 1992, avec une seule plaque devant la mairie, pour commémorer l'ordre de Heinrich Himmler prescrivant la déportation des Sintés et Roms vers Auschwitz. Mais le projet tel qu'il existe aujourd'hui — une pierre, un nom, une adresse réelle — est né à Berlin. En mai 1996, Demnig posa 51 pierres sur les trottoirs d'Oranienstraße et de Dresdener Straße, à Kreuzberg, sans demander la permission à personne. La toute première fut pour Lina Friedemann, face au numéro 158. Trois mois plus tard, des travaux sur Moritzplatz mirent les pierres au jour aux yeux de l'arrondissement, qui choisit de les légaliser plutôt que de les retirer. De là, le projet s'étendit au reste de Berlin, puis à toute l'Allemagne, et ensuite à plus de trente pays.", it: "L'artista tedesco Gunter Demnig provò l'idea per la prima volta a Colonia, nel dicembre 1992, con un'unica targa davanti al municipio, per commemorare l'ordine di Heinrich Himmler che dispose la deportazione ad Auschwitz dei sinti e rom. Ma il progetto così come esiste oggi — una pietra, un nome, un indirizzo reale — nacque a Berlino. Nel maggio 1996, Demnig posò 51 pietre sui marciapiedi di Oranienstraße e Dresdener Straße, a Kreuzberg, senza chiedere il permesso a nessuno. La prima di tutte fu per Lina Friedemann, davanti al numero 158. Tre mesi dopo, alcuni lavori stradali a Moritzplatz portarono le pietre alla luce agli occhi del distretto, che scelse di legalizzarle invece di rimuoverle. Da lì si estese al resto di Berlino, poi a tutta la Germania e in seguito a oltre trenta paesi.",
        },
      },
      {
        titulo: { es: 'Un nombre por piedra', en: 'One name per stone', fr: 'Un nom par pierre', it: 'Un nome per pietra' },
        texto: {
          es: 'El texto grabado en cada placa empieza casi siempre igual: "Hier wohnte" (Aquí vivió), seguido del nombre y el año de nacimiento. La mayoría recuerda a víctimas judías, pero también hay piedras para gitanos sinti y roma, personas homosexuales, testigos de Jehová, disidentes políticos y personas con discapacidad asesinadas por el régimen. La última línea resume el final: "ermordet" (asesinado), "befreit" (liberado) o "überlebt" (sobrevivió), porque no todas conmemoran una muerte. La investigación de cada caso no la hace un comité: la suelen empezar vecinos del edificio, escolares o familiares que rastrean censos y archivos hasta reconstruir una vida entera a partir de una dirección.',
          en: 'The text engraved on each plaque almost always begins the same way: "Hier wohnte" (Here lived), followed by the name and year of birth. Most commemorate Jewish victims, but there are also stones for Sinti and Roma people, homosexuals, Jehovah\'s Witnesses, political dissidents and people with disabilities murdered by the regime. The last line sums up the ending: "ermordet" (murdered), "befreit" (liberated) or "überlebt" (survived), because not all of them mark a death. The research behind each case isn\'t done by a committee: it\'s usually started by neighbors in the building, schoolchildren or family members who dig through census records and archives to reconstruct an entire life from a single address.', fr: "Le texte gravé sur chaque plaque commence presque toujours de la même façon : « Hier wohnte » (Ici vivait), suivi du nom et de l'année de naissance. La plupart honorent des victimes juives, mais il existe aussi des pierres pour des Sintés et des Roms, des personnes homosexuelles, des témoins de Jéhovah, des dissidents politiques et des personnes handicapées assassinées par le régime. La dernière ligne résume le dénouement : « ermordet » (assassiné), « befreit » (libéré) ou « überlebt » (a survécu), car toutes ne commémorent pas une mort. L'enquête sur chaque cas n'est pas menée par un comité : ce sont le plus souvent des voisins de l'immeuble, des écoliers ou des proches qui la commencent, en fouillant recensements et archives jusqu'à reconstituer une vie entière à partir d'une adresse.", it: 'Il testo inciso su ogni targa inizia quasi sempre allo stesso modo: "Hier wohnte" (Qui visse), seguito dal nome e dall\'anno di nascita. La maggior parte ricorda vittime ebree, ma ci sono anche pietre per sinti e rom, persone omosessuali, testimoni di Geova, dissidenti politici e persone con disabilità assassinate dal regime. L\'ultima riga riassume l\'epilogo: "ermordet" (assassinato/a), "befreit" (liberato/a) o "überlebt" (sopravvissuto/a), perché non tutte commemorano una morte. La ricerca su ogni caso non la conduce un comitato: di solito la avviano i vicini dell\'edificio, gli scolari o i familiari che rintracciano censimenti e archivi fino a ricostruire una vita intera a partire da un indirizzo.',
        },
      },
      {
        titulo: { es: 'Lo que las pisadas no consiguieron', en: "What footsteps couldn't do", fr: "Ce que les pas n'ont pas réussi à faire", it: 'Quello che i passi non sono riusciti a fare' },
        texto: {
          es: 'Demnig quiso que fueran las propias pisadas las que mantuvieran el latón brillante, como si caminar sobre una piedra refrescara la memoria cada vez. En la práctica pasó lo contrario: mucha gente las rodea, como si fueran una lápida y no una acera, y el latón se oxida y se oscurece con los años. Por eso en más de 45 ciudades europeas hay grupos de voluntarios, a menudo estudiantes, que salen con un paño y líquido abrillantador a devolverles el brillo, piedra por piedra. No hay ceremonia ni valla alrededor: solo una placa del tamaño de un adoquín, a la altura del zapato, que cualquiera puede pisar sin darse cuenta hasta que se agacha a mirarla de cerca.',
          en: "Demnig wanted the footsteps themselves to keep the brass shining, as if walking over a stone refreshed the memory each time. In practice, the opposite happened: many people walk around them, as if they were a gravestone rather than a sidewalk, and the brass oxidizes and darkens over the years. That's why volunteer groups, often students, go out in more than 45 European cities with a cloth and polishing fluid to restore their shine, stone by stone. There's no ceremony and no fence around them: just a plaque the size of a cobblestone, down at shoe level, that anyone can step on without noticing until they crouch down to look closely.", fr: "Demnig voulait que ce soient les pas eux-mêmes qui maintiennent le laiton brillant, comme si marcher sur une pierre rafraîchissait la mémoire à chaque fois. Dans la pratique, c'est le contraire qui s'est produit : beaucoup de gens les contournent, comme s'il s'agissait d'une pierre tombale et non d'un trottoir, et le laiton s'oxyde et s'assombrit avec les années. C'est pourquoi, dans plus de 45 villes européennes, des groupes de bénévoles, souvent des étudiants, sortent avec un chiffon et un produit lustrant pour leur rendre leur éclat, pierre après pierre. Il n'y a ni cérémonie ni barrière autour : seulement une plaque de la taille d'un pavé, à hauteur de chaussure, que n'importe qui peut fouler sans s'en rendre compte, jusqu'à ce qu'il se penche pour la regarder de près.", it: "Demnig voleva che fossero i passi stessi a mantenere lucido l'ottone, come se camminare su una pietra rinfrescasse la memoria ogni volta. Nella pratica accadde il contrario: molte persone le aggirano, come se fossero una lapide e non un marciapiede, e l'ottone si ossida e si scurisce con gli anni. Per questo in più di 45 città europee ci sono gruppi di volontari, spesso studenti, che escono con un panno e un liquido lucidante a restituire loro la lucentezza, pietra per pietra. Non c'è cerimonia né recinzione intorno: solo una targa delle dimensioni di un sampietrino, all'altezza della scarpa, che chiunque può calpestare senza accorgersene finché non si china a guardarla da vicino.",
        },
      },
      {
        titulo: { es: 'Múnich dice que no', en: 'Munich says no', fr: 'Munich dit non', it: 'Monaco dice di no' },
        texto: {
          es: 'No todo el mundo está de acuerdo con la idea de pisar un nombre. Múnich prohíbe las Stolpersteine en la vía pública desde 2004: la comunidad judía de la ciudad, con la superviviente del Holocausto Charlotte Knobloch a la cabeza, argumentó que las víctimas merecían algo mejor que una placa a ras de la suciedad de la calle. Una petición con casi 99.000 firmas no bastó para revertir la prohibición; hoy Múnich solo permite recordarlas con placas en fachadas o sobre un poste, nunca en el suelo. Demnig ha respondido siempre lo mismo: bajar la vista para leer un nombre a la altura de los pies no es una falta de respeto, es exactamente lo que el proyecto pide.',
          en: "Not everyone agrees with the idea of walking over a name. Munich has banned Stolpersteine from public streets since 2004: the city's Jewish community, led by Holocaust survivor Charlotte Knobloch, argued that victims deserved something better than a plaque flush with the dirt of the street. A petition with almost 99,000 signatures wasn't enough to overturn the ban; today Munich only allows them to be remembered with plaques on façades or mounted on a post, never on the ground. Demnig has always given the same answer: looking down to read a name at foot level isn't disrespectful — it's exactly what the project asks of you.", fr: "Tout le monde n'est pas d'accord avec l'idée de marcher sur un nom. Munich interdit les Stolpersteine sur la voie publique depuis 2004 : la communauté juive de la ville, menée par la survivante de la Shoah Charlotte Knobloch, a fait valoir que les victimes méritaient mieux qu'une plaque au ras de la saleté de la rue. Une pétition rassemblant près de 99 000 signatures n'a pas suffi à faire lever l'interdiction ; aujourd'hui, Munich n'autorise à leur mémoire que des plaques sur des façades ou sur un poteau, jamais au sol. Demnig a toujours répondu la même chose : baisser les yeux pour lire un nom à hauteur des pieds n'est pas un manque de respect, c'est exactement ce que le projet demande.", it: "Non tutti sono d'accordo con l'idea di calpestare un nome. Monaco di Baviera vieta le Stolpersteine sulla pubblica via dal 2004: la comunità ebraica della città, guidata dalla sopravvissuta all'Olocausto Charlotte Knobloch, sostenne che le vittime meritavano qualcosa di meglio di una targa a raso nello sporco della strada. Una petizione con quasi 99.000 firme non è bastata a far revocare il divieto; oggi Monaco permette di ricordarle solo con targhe sulle facciate o su un piedistallo, mai a terra. Demnig ha sempre risposto la stessa cosa: abbassare lo sguardo per leggere un nome all'altezza dei piedi non è una mancanza di rispetto, è esattamente ciò che il progetto chiede.",
        },
      },
    ],
    enlacesRutas: ['berlin-mitte'],
    cierre: {
      es: 'Nada de esto está señalizado como atracción: hay que caminar con la vista puesta en el suelo, no en las fachadas. Esa misma costumbre, parar, agacharse, leer lo que el pavimento tiene para contar, es la que pone a prueba {ruta1}, ocho paradas por Mitte, el distrito histórico de Berlín, donde la ciudad ha decidido, una y otra vez, no esconder su siglo XX sino dejarlo tallado a la altura de los ojos de quien se detenga a mirar.',
      en: "None of this is marked as an attraction: you have to walk with your eyes on the ground, not on the façades. That same habit — stopping, crouching down, reading what the pavement has to say — is what {ruta1} puts to the test, eight stops through Mitte, Berlin's historic district, where the city has decided, over and over, not to hide its 20th century but to leave it carved at eye level for anyone who stops to look.", fr: "Rien de tout cela n'est signalé comme une attraction : il faut marcher le regard posé sur le sol, pas sur les façades. Cette même habitude — s'arrêter, se pencher, lire ce que le pavement a à raconter — est précisément ce que met à l'épreuve {ruta1}, huit étapes à travers Mitte, le quartier historique de Berlin, où la ville a choisi, encore et encore, non pas de cacher son XXe siècle, mais de le laisser gravé à hauteur des yeux de quiconque s'arrête pour regarder.", it: "Niente di tutto questo è segnalato come attrazione: bisogna camminare con lo sguardo rivolto a terra, non alle facciate. Proprio questa abitudine — fermarsi, chinarsi, leggere quello che il selciato ha da raccontare — è quella che mette alla prova {ruta1}, otto tappe per Mitte, il distretto storico di Berlino, dove la città ha deciso, ancora e ancora, di non nascondere il proprio Novecento ma di lasciarlo inciso all'altezza degli occhi di chi si ferma a guardare.",
    },
  },
  {
    id: 'istanbul',
    ciudadSlug: 'istanbul',
    imgHero: 'assets/img/ciudades/istanbul-hero.webp',
    titulo: { es: 'La única ciudad que fue capital de dos imperios sin cambiar de sitio', en: 'The Only City That Was Capital of Two Empires Without Ever Moving', fr: 'La seule ville qui fut capitale de deux empires sans jamais changer de place', it: "L'unica città che fu capitale di due imperi senza mai cambiare posto" },
    resumen: {
      es: 'Bizancio, Constantinopla y Estambul son la misma ciudad bajo tres nombres oficiales distintos: capital de dos imperios sin moverse nunca de sitio.',
      en: 'Byzantium, Constantinople and Istanbul are the same city under three different official names: capital of two empires without ever moving an inch.', fr: 'Byzance, Constantinople et Istanbul sont une seule et même ville sous trois noms officiels différents : capitale de deux empires sans jamais bouger de place.', it: 'Bisanzio, Costantinopoli e Istanbul sono la stessa città sotto tre nomi ufficiali diversi: capitale di due imperi senza mai spostarsi di un metro.',
    },
    secciones: [
      {
        titulo: { es: 'Bizancio, la colonia griega que empezó todo', en: 'Byzantium, the Greek colony that started it all', fr: 'Byzance, la colonie grecque qui a tout commencé', it: 'Bisanzio, la colonia greca che diede inizio a tutto' },
        texto: {
          es: 'La historia oficial arranca hacia el 667 a.C., cuando un grupo de colonos griegos de Megara cruza el Bósforo guiado por un colono llamado Byzas. La leyenda cuenta que antes de partir consultaron el oráculo de Delfos, que les recomendó fundar la ciudad «frente a la tierra de los ciegos» — una pista que solo cobró sentido al llegar: unos colonos anteriores habían fundado Calcedonia en la orilla opuesta, ignorando una posición muchísimo mejor a un paso de distancia. Byzas se quedó con ese sitio mejor y le dio su propio nombre: Bizancio.',
          en: 'The official story begins around 667 BC, when a group of Greek colonists from Megara crossed the Bosphorus led by a colonist named Byzas. Legend has it that before setting out they consulted the oracle at Delphi, who told them to found the city "opposite the land of the blind" — a clue that only made sense once they arrived: earlier colonists had founded Chalcedon on the opposite shore, overlooking a far better spot just a short distance away. Byzas took that better site and gave it his own name: Byzantium.', fr: "L'histoire officielle débute vers 667 av. J.-C., quand un groupe de colons grecs venus de Mégare traverse le Bosphore, guidé par un colon nommé Byzas. La légende raconte qu'avant de partir, ils consultèrent l'oracle de Delphes, qui leur recommanda de fonder la ville « en face du pays des aveugles » — un indice qui ne prit tout son sens qu'à leur arrivée : des colons antérieurs avaient fondé Chalcédoine sur la rive opposée, ignorant une position bien meilleure, à peine à quelques encablures. Byzas s'empara de ce meilleur emplacement et lui donna son propre nom : Byzance.", it: 'La storia ufficiale inizia verso il 667 a.C., quando un gruppo di coloni greci di Megara attraversa il Bosforo guidato da un colono di nome Byzas. La leggenda racconta che prima di partire consultarono l\'oracolo di Delfi, che raccomandò loro di fondare la città «di fronte alla terra dei ciechi» — un indizio che acquistò senso solo all\'arrivo: alcuni coloni precedenti avevano fondato Calcedonia sulla sponda opposta, ignorando una posizione molto migliore a un passo di distanza. Byzas si prese quel sito migliore e gli diede il proprio nome: Bisanzio.',
        },
      },
      {
        titulo: { es: 'Constantinopla: el nombre que ni su fundador quería', en: 'Constantinople: the name not even its founder wanted', fr: 'Constantinople : le nom que son propre fondateur ne voulait pas', it: 'Costantinopoli: il nome che nemmeno il suo fondatore voleva' },
        texto: {
          es: 'En el año 330, el emperador Constantino dedica sobre las ruinas de Bizancio la nueva capital del Imperio romano y la bautiza, oficialmente, «Nova Roma» — Nueva Roma. El nombre nunca cuajó: ya en vida de Constantino, todo el mundo prefería llamarla «la ciudad de Constantino» — Constantinopla. Con ese nombre no oficial pero universal, la ciudad fue durante más de mil años la capital del Imperio romano de Oriente, el que hoy conocemos como Imperio bizantino.',
          en: 'In the year 330 AD, Emperor Constantine dedicated the new capital of the Roman Empire over the ruins of Byzantium and officially named it "Nova Roma" — New Rome. The name never caught on: already in Constantine\'s own lifetime, everyone preferred to call it "the city of Constantine" — Constantinople. Under that name, unofficial but universal, the city was for more than a thousand years the capital of the Eastern Roman Empire, the one we know today as the Byzantine Empire.', fr: "En l'an 330, l'empereur Constantin consacre sur les ruines de Byzance la nouvelle capitale de l'Empire romain et la baptise, officiellement, « Nova Roma » — Nouvelle Rome. Le nom ne prit jamais : du vivant même de Constantin, tout le monde préférait l'appeler « la ville de Constantin » — Constantinople. Sous ce nom non officiel mais universel, la ville fut pendant plus de mille ans la capitale de l'Empire romain d'Orient, celui que nous connaissons aujourd'hui sous le nom d'Empire byzantin.", it: 'Nell\'anno 330, l\'imperatore Costantino inaugura sulle rovine di Bisanzio la nuova capitale dell\'Impero romano e la battezza, ufficialmente, «Nova Roma» — Nuova Roma. Il nome non attecchì mai: già mentre Costantino era in vita, tutti preferivano chiamarla «la città di Costantino» — Costantinopoli. Con questo nome non ufficiale ma universale, la città fu per oltre mille anni la capitale dell\'Impero romano d\'Oriente, quello che oggi conosciamo come Impero bizantino.',
        },
      },
      {
        titulo: { es: '1453: cambia el imperio, no cambia la capital', en: "1453: the empire changes, the capital doesn't", fr: "1453 : l'empire change, la capitale ne change pas", it: '1453: cambia l\'impero, non cambia la capitale' },
        texto: {
          es: 'El 29 de mayo de 1453, el sultán otomano Mehmed II toma Constantinopla y pone fin a más de mil años de continuidad bizantina. Lo insólito no es la conquista, sino lo que Mehmed decide hacer después: en vez de levantar una capital nueva en otro lugar, como habría hecho casi cualquier otro conquistador, se queda con la misma ciudad. Constantinopla pasa a ser, sin moverse un metro, la capital del Imperio otomano. Ningún otro lugar del mundo fue la sede de dos imperios tan distintos, uno detrás de otro, sobre el mismo terreno.',
          en: 'On 29 May 1453, the Ottoman sultan Mehmed II took Constantinople and put an end to more than a thousand years of Byzantine continuity. The unusual part isn\'t the conquest, but what Mehmed decided to do afterward: instead of raising a new capital somewhere else, as almost any other conqueror would have done, he kept the same city. Constantinople became, without moving an inch, the capital of the Ottoman Empire. No other place on earth has been the seat of two such different empires, one after the other, on the very same ground.', fr: "Le 29 mai 1453, le sultan ottoman Mehmed II prend Constantinople et met fin à plus de mille ans de continuité byzantine. Ce qui est insolite, ce n'est pas la conquête, mais ce que Mehmed décide de faire ensuite : au lieu d'élever une nouvelle capitale ailleurs, comme l'aurait fait presque tout autre conquérant, il conserve la même ville. Constantinople devient, sans bouger d'un mètre, la capitale de l'Empire ottoman. Aucun autre endroit au monde n'a été le siège de deux empires aussi différents, l'un après l'autre, sur le même terrain.", it: 'Il 29 maggio 1453, il sultano ottomano Mehmed II conquista Costantinopoli e pone fine a oltre mille anni di continuità bizantina. L\'insolito non è la conquista, ma ciò che Mehmed decide di fare dopo: invece di costruire una nuova capitale altrove, come avrebbe fatto quasi ogni altro conquistatore, tiene la stessa città. Costantinopoli diventa, senza spostarsi di un metro, la capitale dell\'Impero ottomano. Nessun altro luogo al mondo fu sede di due imperi così diversi, uno dopo l\'altro, sullo stesso terreno.',
        },
      },
      {
        titulo: { es: 'El nombre que ya usaba la calle mucho antes que el papel', en: "The name the street used long before the paperwork did", fr: 'Le nom que la rue utilisait bien avant le papier', it: 'Il nome che la strada usava già molto prima della carta' },
        texto: {
          es: 'Durante casi cinco siglos de dominio otomano, los documentos y las monedas oficiales siguen usando «Kostantiniyye», una forma otomana de Constantinopla. En la calle, mientras tanto, corre desde hace generaciones un nombre más corto y coloquial: Estambul. El Imperio otomano se disuelve en 1922 y la nueva República turca nace en 1923 con la capital trasladada a Ankara: por primera vez desde el año 330, la ciudad deja de ser la capital de nadie. Recién en 1930, ya sin ese título, el gobierno de Atatürk formaliza lo que la calle llevaba diciendo generaciones: decreta que el nombre oficial y único pasa a ser Estambul.',
          en: 'For almost five centuries of Ottoman rule, official documents and coinage kept using "Kostantiniyye," an Ottoman form of Constantinople. On the street, meanwhile, a shorter, more colloquial name had been current for generations: Istanbul. The Ottoman Empire dissolved in 1922, and the new Turkish Republic was born in 1923 with the capital moved to Ankara: for the first time since the year 330, the city stopped being anyone\'s capital. Only in 1930, by then without that title, did Atatürk\'s government formalize what the street had been saying for generations: it decreed that the single official name would be Istanbul.', fr: "Pendant presque cinq siècles de domination ottomane, les documents et les monnaies officielles continuent d'utiliser « Kostantiniyye », une forme ottomane de Constantinople. Dans la rue, pendant ce temps, circule depuis des générations un nom plus court et plus familier : Istanbul. L'Empire ottoman se dissout en 1922, et la nouvelle République turque naît en 1923 avec sa capitale transférée à Ankara : pour la première fois depuis l'an 330, la ville cesse d'être la capitale de qui que ce soit. Ce n'est qu'en 1930, une fois ce titre perdu, que le gouvernement d'Atatürk officialise ce que la rue répétait depuis des générations : il décrète que le nom officiel et unique devient Istanbul.", it: 'Per quasi cinque secoli di dominio ottomano, i documenti e le monete ufficiali continuano a usare «Kostantiniyye», una forma ottomana di Costantinopoli. Per strada, intanto, circola da generazioni un nome più corto e colloquiale: Istanbul. L\'Impero ottomano si dissolve nel 1922 e la nuova Repubblica turca nasce nel 1923 con la capitale trasferita ad Ankara: per la prima volta dall\'anno 330, la città smette di essere capitale di alcunché. Solo nel 1930, ormai priva di quel titolo, il governo di Atatürk formalizza quello che la strada diceva da generazioni: decreta che il nome ufficiale e unico diventi Istanbul.',
        },
      },
      {
        titulo: { es: '¿De dónde sale «Estambul»? La teoría con más peso', en: 'Where does "Istanbul" come from? The leading theory', fr: "D'où vient « Istanbul » ? La théorie qui l'emporte", it: 'Da dove viene «Istanbul»? La teoria più accreditata' },
        texto: {
          es: 'La palabra «İstanbul» generó varias hipótesis. Una es una etimología popular otomana, «İslambol» («llena de islam»), que ya recogía como nombre corriente el viajero otomano Evliya Çelebi en el siglo XVII — pero que la lingüística moderna no respalda como origen real de la palabra. La teoría con más consenso académico apunta en otra dirección, mucho más antigua y bastante menos religiosa: derivaría de la expresión griega medieval «eis tin polin» (εἰς τὴν πόλιν), que significa, simplemente, «hacia la ciudad» o «a la ciudad». Para los griegos que vivían alrededor de Constantinopla, esta era sencillamente «la Ciudad» — no hacía falta llamarla de otra forma —, y esa expresión tan repetida se fue deformando en boca de hablantes turcos hasta convertirse en «İstanbul». Si la hipótesis es correcta, el nombre que hoy suena más turco de los tres es, en su raíz, tan griego como el propio Bizancio.',
          en: 'The word "İstanbul" has generated several hypotheses. One is a popular Ottoman etymology, "İslambol" ("full of Islam"), which the Ottoman traveler Evliya Çelebi already recorded as a current name in the 17th century — but which modern linguistics doesn\'t support as the word\'s real origin. The theory with the strongest academic consensus points in another direction, much older and considerably less religious: it would derive from the medieval Greek phrase "eis tin polin" (εἰς τὴν πόλιν), which simply means "toward the city" or "to the city." For the Greeks living around Constantinople, this was simply "the City" — no need to call it anything else — and that endlessly repeated phrase gradually wore down in the mouths of Turkish speakers until it became "İstanbul." If the hypothesis holds, the name that sounds most Turkish of the three is, at its root, as Greek as Byzantium itself.', fr: 'Le mot « İstanbul » a suscité plusieurs hypothèses. L\'une est une étymologie populaire ottomane, « İslambol » (« pleine d\'islam »), que le voyageur ottoman Evliya Çelebi rapportait déjà comme nom courant au XVIIe siècle — mais que la linguistique moderne ne retient pas comme origine réelle du mot. La théorie qui fait le plus consensus académique pointe dans une autre direction, bien plus ancienne et nettement moins religieuse : le mot dériverait de l\'expression grecque médiévale « eis tin polin » (εἰς τὴν πόλιν), qui signifie tout simplement « vers la ville » ou « à la ville ». Pour les Grecs qui vivaient autour de Constantinople, celle-ci était simplement « la Ville » — nul besoin de l\'appeler autrement —, et cette expression tant répétée s\'est peu à peu déformée dans la bouche des locuteurs turcs jusqu\'à devenir « İstanbul ». Si l\'hypothèse est correcte, le nom qui sonne aujourd\'hui le plus turc des trois est, à la racine, tout aussi grec que Byzance elle-même.', it: 'La parola «İstanbul» ha generato diverse ipotesi. Una è un\'etimologia popolare ottomana, «İslambol» («piena d\'islam»), già registrata come nome corrente dal viaggiatore ottomano Evliya Çelebi nel XVII secolo — ma che la linguistica moderna non sostiene come vera origine della parola. La teoria con maggior consenso accademico punta in un\'altra direzione, molto più antica e assai meno religiosa: deriverebbe dall\'espressione greca medievale «eis tin polin» (εἰς τὴν πόλιν), che significa, semplicemente, «verso la città» o «alla città». Per i greci che vivevano intorno a Costantinopoli, questa era semplicemente «la Città» — non c\'era bisogno di chiamarla in altro modo —, e quell\'espressione così ripetuta si deformò sulla bocca dei parlanti turchi fino a diventare «İstanbul». Se l\'ipotesi è corretta, il nome che oggi suona più turco dei tre è, alla radice, greco quanto la stessa Bisanzio.',
        },
      },
    ],
    enlacesRutas: ['istanbul-sultanahmet'],
    cierre: {
      es: 'Sultanahmet es el barrio donde esas tres ciudades se pisan literalmente unas a otras: trazado bizantino bajo el suelo, mezquitas otomanas por encima y el nombre turco en cada cartel de calle. {ruta1} recorre esa superposición a pie, parada a parada, por los mismos puntos exactos donde una capital se convirtió en la siguiente sin mudarse nunca de sitio.',
      en: 'Sultanahmet is the district where those three cities literally sit on top of one another: Byzantine layout underground, Ottoman mosques above it, and the Turkish name on every street sign. {ruta1} covers that overlap on foot, stop by stop, through the very same spots where one capital turned into the next without ever changing location.', fr: "Sultanahmet est le quartier où ces trois villes se marchent littéralement les unes sur les autres : tracé byzantin sous le sol, mosquées ottomanes au-dessus, et le nom turc sur chaque plaque de rue. {ruta1} parcourt cette superposition à pied, étape après étape, par les mêmes points exacts où une capitale est devenue la suivante sans jamais changer de place.", it: 'Sultanahmet è il quartiere dove queste tre città si calpestano letteralmente l\'una con l\'altra: tracciato bizantino sotto il suolo, moschee ottomane sopra e il nome turco su ogni cartello stradale. {ruta1} percorre a piedi questa sovrapposizione, tappa dopo tappa, negli stessi identici punti dove una capitale si trasformò nella successiva senza mai cambiare posto.',
    },
  },
];

export function historiaPorSlug(slug) {
  return HISTORIAS.find((h) => h.id === slug) || null;
}

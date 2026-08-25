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
    jugadoresMin: 2,
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
    jugadoresMin: 2,
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
    jugadoresMin: 2,
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
    jugadoresMin: 2,
    jugadoresMax: 6,
    dificultad: /** @type {Dificultad} */ ('facil'),
    numParadas: 8,
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
    jugadoresMin: 2,
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
    jugadoresMin: 2,
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
    jugadoresMin: 2,
    jugadoresMax: 6,
    dificultad: /** @type {Dificultad} */ ('facil'),
    numParadas: 8,
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
    jugadoresMin: 2,
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
    jugadoresMin: 2,
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
    jugadoresMin: 2,
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
    jugadoresMin: 2,
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
    jugadoresMin: 2,
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
    jugadoresMin: 2,
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
    jugadoresMin: 2,
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
    jugadoresMin: 2,
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
    jugadoresMin: 2,
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
    titulo: { es: '¿Por qué el Barrio Gótico no es tan gótico como parece?', en: '', fr: '', it: '' },
    resumen: {
      es: 'El Pont del Bisbe parece gótico del siglo XV, pero es de 1928: buena parte del Barri Gòtic se construyó para la Exposición de 1929.',
      en: '',
      fr: '',
      it: '',
    },
    secciones: [
      {
        titulo: { es: 'Un puente que nació en 1928', en: '', fr: '', it: '' },
        texto: {
          es: 'El Pont del Bisbe es la imagen más fotografiada del Barri Gòtic: arco calado, gárgolas y, bajo el arco central, una calavera de piedra que nadie ha explicado nunca del todo. Parece del siglo XV. Es de 1928. Lo diseñó Joan Rubió i Bellver, discípulo de Gaudí, en estilo gótico flamígero, para dar un paso elevado y privado entre el Palau de la Generalitat y la Casa dels Canonges, donde vivían los presidentes catalanes. Cuando presentó el proyecto, parte de Barcelona ya lo criticó por falso: la ciudad entera se preparaba para recibir la Exposición Internacional de 1929 y necesitaba un barrio medieval fotogénico a tiempo.',
          en: '',
          fr: '',
          it: '',
        },
      },
      {
        titulo: { es: 'El arquitecto que lo desmintió', en: '', fr: '', it: '' },
        texto: {
          es: 'Rubió i Bellver no se hacía ilusiones sobre lo que estaba construyendo. Él mismo escribió, años más tarde, que «en el Barrio Gótico no hay más de seis casas que con buena voluntad pueden denominarse góticas». Lo dijo el hombre que había firmado uno de los edificios más fotografiados del barrio, y que sabía, mejor que nadie, cuánto de ese aire medieval era piedra nueva cortada para parecer vieja.',
          en: '',
          fr: '',
          it: '',
        },
      },
      {
        titulo: { es: 'Un plano de 1408 que se construyó en el siglo XX', en: '', fr: '', it: '' },
        texto: {
          es: 'La Catedral de Barcelona sí es gótica, del siglo XIV. Su fachada principal —la que da a la Plaça Nova— no lo es: se construyó entre 1906 y 1913, financiada por el banquero Manuel Girona, sobre un diseño de 1408 firmado por el maestro Carlí que en su momento jamás se llegó a levantar por falta de dinero. Es decir: la fachada "gótica" más fotografiada de Barcelona no es la copia de un edificio medieval real, es la construcción tardía de un plano medieval que nunca fue más que un plano. Durante quinientos años la Catedral tuvo ahí un muro desnudo; hoy tiene agujas, rosetón y santos de piedra recién tallada.',
          en: '',
          fr: '',
          it: '',
        },
      },
      {
        titulo: { es: 'La casa que cambió de dirección', en: '', fr: '', it: '' },
        texto: {
          es: 'No todo es maquillaje de los años veinte: la Casa Padellàs, en la Plaça del Rei, es un palacio auténtico del siglo XVI. Pero tampoco estuvo siempre ahí. La desmontaron piedra por piedra de su ubicación original, en el carrer dels Mercaders, y la reconstruyeron en 1931 para salvarla de la apertura de la Via Laietana. Al levantar sus nuevos cimientos aparecieron restos de la Barcino romana — el hallazgo que hoy se recorre bajo tierra en el Museu d\'Història de Barcelona. Ni los edificios genuinamente antiguos están donde los construyeron.',
          en: '',
          fr: '',
          it: '',
        },
      },
      {
        titulo: { es: 'Una ciudad maquillada para una Exposición', en: '', fr: '', it: '' },
        texto: {
          es: 'Nada de esto fue improvisado. La Sociedad de Atracción de Forasteros, el organismo que promocionaba Barcelona desde 1908, necesitaba un barrio antiguo presentable antes de 1929; el ayuntamiento reubicó portadas, ventanales y remates góticos de otros edificios de la ciudad y encargó piezas nuevas donde faltaban. Décadas después, en 1958, el propio arquitecto municipal responsable de buena parte de esas reformas, Adolf Florensa, admitió por escrito que el nombre "Barrio Gótico" había sido, sobre todo, un reclamo turístico.',
          en: '',
          fr: '',
          it: '',
        },
      },
      {
        titulo: { es: 'Lo auténtico, camuflado entre lo falso', en: '', fr: '', it: '' },
        texto: {
          es: 'La confusión no es que el Barri Gòtic sea falso de principio a fin: es que mezcla capas reales de dos mil años con un barniz de los años veinte que las iguala todas a simple vista. Bajo ese barniz hay una puerta romana de la Barcino de Augusto, un antiguo call judío anterior a 1391 y muros que todavía muestran el impacto de bombas de 1938. Lo gótico auténtico existe en el barrio, pero es minoría; lo romano y lo medieval real conviven, sin cartel que lo anuncie, con la fachada que se construyó pensando en los visitantes de 1929.',
          en: '',
          fr: '',
          it: '',
        },
      },
    ],
    enlacesRutas: ['barcelona-gotic'],
    cierre: {
      es: 'Nada de esto le resta encanto al Gòtic: solo reparte el misterio en más capas de las que parece a primera vista. {ruta1} recorre ocho paradas por este mismo barrio, entre piedra romana, judía, gótica de verdad y gótica de 1928, y no avisa de antemano cuál es cuál: eso hay que descubrirlo caminando.',
      en: '',
      fr: '',
      it: '',
    },
  },
  {
    id: 'roma',
    ciudadSlug: 'roma',
    imgHero: 'assets/img/ciudades/roma-trastevere-hero.webp',
    titulo: {
      es: 'Lo que Trastevere lleva siglos mostrando sin que nadie mire',
      en: '', fr: '', it: '',
    },
    resumen: {
      es: 'Trastevere quedó fuera de las murallas de Roma durante siglos, y sus vecinos aún hoy se sienten más trasteverinos que romanos.',
      en: '', fr: '', it: '',
    },
    secciones: [
      {
        titulo: { es: 'Romanos, pero fuera de las murallas', en: '', fr: '', it: '' },
        texto: {
          es: 'Cuando Augusto organizó Roma en catorce regiones administrativas, hacia el año 7 a.C., Trastevere entró en el mapa como la Regio XIV, la de mayor perímetro de las catorce. Y aun así quedó fuera de la muralla Serviana, la primera gran muralla de la ciudad, y fuera del pomerium, el límite sagrado que separaba lo que contaba oficialmente como Roma de lo que no. El barrio no quedó cerrado dentro de una muralla hasta que el emperador Aureliano levantó la suya, entre los años 270 y 275 d.C. Generaciones enteras de trasteverinos vivieron y murieron siendo romanos sobre el papel, pero fuera de Roma en los hechos.',
          en: '', fr: '', it: '',
        },
      },
      {
        titulo: { es: 'Un barrio de puerto, no de patricios', en: '', fr: '', it: '' },
        texto: {
          es: 'Mientras las colinas de la otra orilla se llenaban de foros, templos y residencias patricias, Trastevere creció alrededor del agua: pescadores, marineros y estibadores que descargaban en el Ripa Grande las mercancías que subían desde el puerto de Ostia. Ya en tiempos de la República era, sobre todo, un barrio de trabajadores del río, no el lugar donde un romano con ambiciones políticas elegía construir su casa. Esa vocación portuaria y artesanal marcó su carácter durante siglos: Trastevere fue, desde el principio, el barrio que hacía funcionar a Roma, no el que la representaba.',
          en: '', fr: '', it: '',
        },
      },
      {
        titulo: { es: 'Los primeros extranjeros de Roma', en: '', fr: '', it: '' },
        texto: {
          es: 'Los primeros judíos de Roma se instalaron en Trastevere en el siglo II a.C., como parte de una embajada comercial enviada desde Judea; con los siglos formaron aquí una de las comunidades judías más antiguas y continuas de toda la diáspora, mucho antes de que, en 1555, el papado obligara a trasladarse al Ghetto, en la otra orilla. El barrio recibió también a mercaderes, soldados y marineros sirios, que trajeron consigo a sus propios dioses: en la ladera del Janículo se ha excavado un santuario dedicado a Júpiter Heliopolitano, la principal divinidad siria, con una primera fase de mediados del siglo I d.C. y una reconstrucción fechada entre los años 176 y 180 d.C.',
          en: '', fr: '', it: '',
        },
      },
      {
        titulo: { es: 'Una lengua que no es la de enfrente', en: '', fr: '', it: '' },
        texto: {
          es: 'De esa mezcla salió, con los siglos, una variante propia del habla romana: el trasteverino, con matices de pronunciación y vocabulario que un oído local todavía distingue del romanesco que se habla al otro lado del río. La diferencia nunca fue solo lingüística. Durante generaciones, los trasteverinos se consideraron a sí mismos los romanos más auténticos, más «de Roma» que los propios romanos del centro, y hoy sigue habiendo quien se presenta primero como trasteverino y solo después, si acaso, como romano.',
          en: '', fr: '', it: '',
        },
      },
      {
        titulo: { es: 'Noantri: nosotros, los otros', en: '', fr: '', it: '' },
        texto: {
          es: 'Esa manera de marcar distancia tiene hasta nombre propio: la Festa de Noantri, que cada julio llena de procesiones y mesas en la calle las plazas del barrio. «Noantri» viene de noi altri, «nosotros, los otros», un nombre que declara, sin rodeos, que los de Trastevere forman un «nosotros» aparte del resto de Roma. La fiesta arrancó en 1535, cuando unos pescadores encontraron en la desembocadura del Tíber una imagen de la Virgen tallada en madera de cedro, la Madonna Fiumarola, que desde entonces es la patrona del barrio.',
          en: '', fr: '', it: '',
        },
      },
    ],
    enlacesRutas: ['roma-trastevere'],
    cierre: {
      es: 'Nada de esto se explica en una placa. Se nota en cómo hablan algunos vecinos mayores, en la fecha en que Trastevere se pone de fiesta cada julio y en el trazado de un barrio que Roma tardó siglos en dejar entrar del todo. {ruta1} recorre sus calles con esa misma idea en mente: mirar de cerca lo que este barrio lleva contando desde siempre, para quien se pare a leerlo.',
      en: '', fr: '', it: '',
    },
  },
  {
    id: 'paris',
    ciudadSlug: 'paris',
    imgHero: 'assets/img/ciudades/paris-montmartre-hero.webp',
    titulo: { es: 'Por qué Sacré-Cœur es un monumento a una derrota, no una victoria', en: '', fr: '', it: '' },
    resumen: {
      es: 'Montmartre fue la chispa de la Comuna de París en 1871. El Sacré-Cœur se construyó después, en el mismo sitio, como penitencia por la derrota.',
      en: '', fr: '', it: '',
    },
    secciones: [
      {
        titulo: { es: 'El amanecer de los cañones', en: '', fr: '', it: '' },
        texto: {
          es: 'Al terminar el asedio prusiano de París, la Guardia Nacional tenía repartidos por la ciudad unos 400 cañones, pagados en buena parte por suscripción popular: dinero de los propios parisinos, no del Estado. Unos 170 de esas piezas quedaron aparcadas en lo alto de Montmartre, lejos del alcance del nuevo gobierno de Adolphe Thiers, instalado en Versalles y desconfiado de una capital todavía armada. Antes del amanecer del 18 de marzo de 1871, dos brigadas del ejército subieron la colina para requisarlos por sorpresa. El plan falló por un detalle logístico: llegaron los soldados, pero no los caballos para arrastrar los cañones cuesta abajo. Mientras esperaban, salió el sol, y con él las vecinas de Montmartre, camino de comprar leche y pan, que se plantaron entre las tropas y la artillería.',
          en: '', fr: '', it: '',
        },
      },
      {
        titulo: { es: 'Dos generales, una misma tarde', en: '', fr: '', it: '' },
        texto: {
          es: 'La tropa, rodeada por la multitud, terminó fraternizando con la Guardia Nacional en lugar de disparar. Al general Claude Lecomte, que sí había ordenado abrir fuego contra la gente, lo detuvieron sus propios hombres. Cerca de la Place Pigalle reconocieron, vestido de civil, a otro general, Clément-Thomas, odiado desde que en 1848 reprimió a tiros una revuelta obrera anterior. A los dos los llevaron a una casa del número 6 de la rue des Rosiers, en la propia Montmartre, y esa misma tarde los fusilaron en el jardín, sin juicio. La noticia llegó a Versalles antes de que cayera la noche: el gobierno de Thiers evacuó París, y con esa fuga empezó la Comuna.',
          en: '', fr: '', it: '',
        },
      },
      {
        titulo: { es: 'Setenta y dos días y una semana de sangre', en: '', fr: '', it: '' },
        texto: {
          es: 'La Comuna gobernó París de forma autónoma desde ese 18 de marzo hasta el 28 de mayo de 1871: unas diez semanas, casi siempre resumidas como «dos meses». Terminó con la Semaine sanglante, la Semana Sangrienta, cuando el ejército de Versalles reconquistó la ciudad calle a calle. La cifra exacta de muertos sigue discutida siglo y medio después: los recuentos clásicos hablan de hasta 20.000 personas, entre combatientes y fusilados sin proceso; las revisiones más recientes, con archivos más completos, la bajan a un rango de 6.000 a 7.500. Sea cual sea el número correcto, fue posiblemente la represión más letal que ha vivido nunca una calle de París.',
          en: '', fr: '', it: '',
        },
      },
      {
        titulo: { es: 'Un voto anterior a la propia Comuna', en: '', fr: '', it: '' },
        texto: {
          es: 'La idea de una basílica en Montmartre no nació de la Comuna: la propuso, en septiembre de 1870, el católico Alexandre Legentil, en plena guerra franco-prusiana y antes de que existiera ningún levantamiento, como voto religioso si Francia salía indemne de la invasión. Pero la Comuna le dio al proyecto un motivo nuevo y muy concreto. En 1873, con Francia derrotada y la Comuna ya aplastada, la Asamblea Nacional, de mayoría monárquica y católica, declaró la basílica «de utilidad pública» por ley. El lugar elegido para construirla no fue una casualidad geográfica: es, literalmente, la misma colina donde había empezado la revuelta y donde habían muerto Lecomte y Clément-Thomas.',
          en: '', fr: '', it: '',
        },
      },
      {
        titulo: { es: 'La piedra que debía tapar la memoria', en: '', fr: '', it: '' },
        texto: {
          es: 'La primera piedra se colocó el 16 de junio de 1875, bendecida por el cardenal Guibert, arzobispo de París. Ese mismo día se dijo sin rodeos que el emplazamiento no era arbitrario: se construía ahí porque ahí había empezado la Comuna. La basílica tardaría más de cuatro décadas en consagrarse, en 1919, ya con otra guerra mundial recién terminada, pero desde el primer momento funcionó como lo que era: un monumento de penitencia católica y conservadora, levantado a propósito sobre la herida todavía abierta de una insurrección obrera aplastada a tiros. Hoy la suben cada año millones de personas que ni sospechan que pisan, literalmente, el escenario de una ejecución sumaria.',
          en: '', fr: '', it: '',
        },
      },
    ],
    enlacesRutas: ['paris-montmartre'],
    cierre: {
      es: 'La colina que hoy suben turistas con cámara en mano escondía, hace siglo y medio, una revuelta armada y dos ejecuciones sumarias. {ruta1} recorre la misma Montmartre siguiendo otras señales del barrio —un pueblo independiente hasta 1860, un viñedo que se salvó de la especulación, un jardín que hoy lleva el nombre de Louise Michel, la comunera que luchó aquí— ocho paradas para quien quiera seguir tirando del hilo.',
      en: '', fr: '', it: '',
    },
  },
  {
    id: 'lisboa',
    ciudadSlug: 'lisboa',
    imgHero: 'assets/img/ciudades/lisboa-hero.webp',
    titulo: { es: 'Alfama sobrevivió al terremoto que borró media Lisboa: así se nota todavía', en: '', fr: '', it: '' },
    resumen: { es: 'Alfama debe su nombre a unos baños árabes y su canto más célebre, el fado, a un origen que los historiadores aún discuten sin acuerdo.', en: '', fr: '', it: '' },
    secciones: [
      {
        titulo: { es: 'El barrio que lleva un baño en el nombre', en: '', fr: '', it: '' },
        texto: { es: 'Alfama es de los pocos barrios de Lisboa que el terremoto de 1755 dejó en pie casi tal como estaba, y eso incluye algo que no se ve a simple vista pero se explica solo: su nombre no es portugués. Viene del árabe al-hamma, «los baños» o «las fuentes termales». Lisboa estuvo bajo dominio islámico entre el siglo VIII y 1147, y fue en esa época cuando el barrio recibió el nombre que conserva hoy, por los manantiales de aguas minero-medicinales que brotan aquí mismo, sobre una falla geológica documentada en la propia carta geológica de Lisboa. Entre los siglos XVII y XIX llegaron a funcionar aquí varios balnearios con nombre propio —los Baños de Dona Clara, las Aguas do Duque— alimentados por esos mismos manantiales. No fue un uso pasajero: esas aguas se siguieron explotando como baños públicos hasta bien entrado el siglo XX, y durante generaciones alimentaron los chafarizes —las fuentes públicas del barrio— que todavía dan nombre a varias calles de Alfama.', en: '', fr: '', it: '' },
      },
      {
        titulo: { es: 'Una canción sin acta de nacimiento', en: '', fr: '', it: '' },
        texto: { es: 'El fado empieza a documentarse en Lisboa hacia la década de 1820, cantado en las tabernas populares de los barrios junto al río, Alfama entre ellos. Pero a diferencia del nombre del barrio, nadie se puso nunca de acuerdo sobre su verdadero origen. Musicólogos portugueses y extranjeros lo llevan discutiendo más de un siglo, y la disputa sigue abierta hoy: hay al menos tres teorías serias sobre su origen, y ninguna ha logrado imponerse del todo sobre las otras.', en: '', fr: '', it: '' },
      },
      {
        titulo: { es: 'La melancolía de los que se iban por mar', en: '', fr: '', it: '' },
        texto: { es: 'La teoría más antigua es también la más romántica: el escritor Pinto de Carvalho, en su História do Fado de 1903, lo situó a bordo de las carabelas de los Descubrimientos, cantado por marineros que ponían en verso la separación y la espera. Alfama y la vecina Mouraria, los barrios más pegados al puerto de donde salían y llegaban esos barcos, son justo donde la tradición sitúa a los primeros que lo cantaron ya en tierra.', en: '', fr: '', it: '' },
      },
      {
        titulo: { es: 'La huella de los esclavos libertos', en: '', fr: '', it: '' },
        texto: { es: 'Buena parte de los historiadores portugueses del fado defiende otra hipótesis: que nació de los cantos de esclavos africanos liberados, instalados en los barrios populares de Lisboa a comienzos del siglo XIX. Habrían traído consigo el lundum, un baile-canción de raíz afrobrasileña que ya circulaba entre Lisboa y Río de Janeiro por el intenso tráfico marítimo entre ambos puertos.', en: '', fr: '', it: '' },
      },
      {
        titulo: { es: 'Lo que trajo la corte al volver de Brasil', en: '', fr: '', it: '' },
        texto: { es: 'Una tercera teoría mira hacia arriba, a la propia corte portuguesa: a finales de 1807 huyó entera a Río de Janeiro ante la invasión napoleónica, y no regresó a Lisboa hasta 1821. El musicólogo británico Rodney Gallop, de los primeros en estudiar el fado en profundidad, recogía en los años 30 que los propios cantores describían sus fados más antiguos como «de origen brasileño» — probablemente por la modinha, la canción sentimental que la corte trajo consigo de vuelta.', en: '', fr: '', it: '' },
      },
      {
        titulo: { es: 'Tres teorías, ningún ganador', en: '', fr: '', it: '' },
        texto: { es: 'Hoy la mayoría de los especialistas ya no busca un único origen: entiende el fado como una mezcla real de las tres corrientes —marinera, afrobrasileña y cortesana— fundida en los mismos barrios ribereños entre 1820 y 1840, junto con las canciones rurales que los propios migrantes internos llevaban a la ciudad. Marineros, esclavos libertos y cortesanos exiliados discreparían en casi todo, pero coincidieron, sin saberlo, en el mismo puñado de calles.', en: '', fr: '', it: '' },
      },
    ],
    enlacesRutas: ['lisboa-alfama'],
    cierre: { es: 'Ninguna de las tres teorías sobre el fado se ha impuesto del todo, y esa es la parte más honesta de todo el debate. Lo que sí sigue en pie son las cuestas donde se cantaron esos primeros fados y el nombre árabe que el barrio lleva desde la Lisboa islámica: {ruta1} recorre las dos cosas a la vez, ocho paradas por el Alfama real, no el de postal.', en: '', fr: '', it: '' },
  },
  {
    id: 'florencia',
    ciudadSlug: 'florencia',
    imgHero: 'assets/img/ciudades/florencia-hero.webp',
    titulo: { es: 'La rivalidad que Florencia construyó en piedra, cúpula a cúpula', en: '', fr: '', it: '' },
    resumen: {
      es: 'Brunelleschi escondió su método para levantar la cúpula del Duomo, y los gremios de Florencia libraron la misma pelea a golpe de estatua en Orsanmichele.',
      en: '', fr: '', it: '',
    },
    secciones: [
      {
        titulo: { es: 'La puerta que Brunelleschi perdió en 1401', en: '', fr: '', it: '' },
        texto: {
          es: 'Antes del Duomo, Filippo Brunelleschi y Lorenzo Ghiberti ya se habían medido una vez. En 1401 Florencia convocó un concurso para diseñar unas nuevas puertas de bronce del Baptisterio, y Ghiberti ganó. Los dos relieves de prueba —el mismo episodio bíblico, el sacrificio de Isaac, resuelto de dos formas distintas— se conservan hoy uno junto al otro en el Museo del Bargello. Brunelleschi, derrotado, se marchó a Roma a estudiar ruinas clásicas durante años. Diecisiete años después le llegaría la revancha, con un desafío mucho más difícil que una puerta: una cúpula que nadie sabía cómo construir.',
          en: '', fr: '', it: '',
        },
      },
      {
        titulo: { es: 'El concurso que nadie sabía cómo ganar', en: '', fr: '', it: '' },
        texto: {
          es: 'La Arte della Lana, el gremio de comerciantes de lana que pagaba las obras de la catedral, convocó en 1418 un concurso desesperado: nadie en Europa sabía cómo cerrar el enorme hueco octogonal que llevaba décadas abierto sobre el crucero de Santa Maria del Fiore. Brunelleschi presentó la única propuesta que convenció al tribunal, y ganó — pero el gremio, desconfiado de un hombre que se negaba a explicar del todo su plan, le impuso una condición que debió sentar como una humillación: compartir el cargo, y el sueldo, con Ghiberti, su rival de 1401.',
          en: '', fr: '', it: '',
        },
      },
      {
        titulo: { es: 'La maqueta que no lo explicaba todo', en: '', fr: '', it: '' },
        texto: {
          es: 'Brunelleschi construyó una maqueta de madera y ladrillo para guiar a los canteros en la obra, con ayuda de Donatello y Nanni di Banco — pero la dejó deliberadamente incompleta. Nunca puso por escrito el sistema completo ni se lo explicó a Ghiberti, que en teoría era su igual en el cargo. Con los años, mientras Ghiberti dedicaba su tiempo a otros encargos por la ciudad, Brunelleschi se fue quedando, en la práctica, como única autoridad sobre la obra: el hombre que tenía la solución seguía siendo el único que la entendía entera.',
          en: '', fr: '', it: '',
        },
      },
      {
        titulo: { es: 'La patente que Brunelleschi pidió por miedo', en: '', fr: '', it: '' },
        texto: {
          es: 'El mismo miedo a que le copiaran llevó a Brunelleschi a algo insólito para su época: en 1421 pidió y obtuvo de la Señoría de Florencia el derecho exclusivo, durante tres años, a usar una barcaza de diseño propio para subir mármol de Carrara por el Arno. Historiadores del derecho consideran esa concesión la primera patente de invención documentada en Occidente —casi cuatro siglos antes de que existiera esa palabra—, y el temor que la motivó era el de siempre: que un rival, empezando por Ghiberti, copiara su ingenio sin haber arriesgado nada.',
          en: '', fr: '', it: '',
        },
      },
      {
        titulo: { es: 'El huevo que, probablemente, nunca se rompió así', en: '', fr: '', it: '' },
        texto: {
          es: 'Cuenta Giorgio Vasari, más de un siglo después de los hechos, que Brunelleschi retó a los demás maestros a hacer que un huevo se sostuviera de pie sobre una superficie lisa: todos fracasaron, él golpeó suavemente la base contra la mesa para aplanarla y lo dejó de pie, argumentando que cualquiera podría construir la cúpula una vez visto su plan, igual que cualquiera podría sostener el huevo una vez visto el truco. Antonio Manetti, que conoció a Brunelleschi en vida y escribió la primera biografía del arquitecto décadas antes que Vasari, no cuenta esta anécdota, y varios historiadores actuales la consideran una dramatización literaria más que un hecho documentado. Real o no, resume bien al personaje: alguien que prefería demostrar que tenía la solución antes que explicarla.',
          en: '', fr: '', it: '',
        },
      },
      {
        titulo: { es: 'Las catorce hornacinas del mismo pleito', en: '', fr: '', it: '' },
        texto: {
          es: 'La misma lógica de competir en público se repetía a pocas calles de allí, en Orsanmichele: la ciudad obligó a las principales corporaciones de oficios a llenar sus catorce hornacinas exteriores con una estatua del santo patrono de cada una, y ningún gremio quería quedar por debajo del de al lado. Los más ricos —banqueros, comerciantes de paños, laneros— pagaron bronce, hasta diez veces más caro que el mármol, y contrataron a Ghiberti; los gremios menores se conformaron con mármol y recurrieron a un Donatello todavía joven. Décadas más tarde, el Tribunale della Mercanzia —el tribunal mercantil que representaba a los grandes comerciantes— encargó a Verrocchio un grupo en bronce para sustituir una estatua de Donatello ya considerada anticuada. La hornacina de los carniceros, según varios historiadores del arte, tiene incluso una firma inesperada: se la atribuyen, con dudas, al propio Brunelleschi.',
          en: '', fr: '', it: '',
        },
      },
    ],
    enlacesRutas: ['florencia-centro'],
    cierre: {
      es: 'Nada de todo esto —el concurso de 1418, la maqueta a medias, la patente del miedo, el huevo que probablemente nunca existió— aparece en un cartel junto a la cúpula o las hornacinas. {ruta1} recorre ese mismo triángulo entre el Duomo, la Piazza della Signoria y el Ponte Vecchio siguiendo las señales de rivalidad que sí quedaron talladas en la piedra, a la vista de quien se detenga a mirarlas.',
      en: '', fr: '', it: '',
    },
  },
  {
    id: 'madrid',
    ciudadSlug: 'madrid',
    imgHero: 'assets/img/ciudades/madrid-hero.webp',
    titulo: { es: 'El animal mitológico que ya no está en el escudo de Madrid', en: '', fr: '', it: '' },
    resumen: {
      es: 'En 1967, la Real Academia de la Historia borró del escudo de Madrid una criatura que llevaba más de un siglo instalada allí por error.',
      en: '', fr: '', it: '',
    },
    secciones: [
      {
        titulo: { es: 'Un pleito que terminó en escudo', en: '', fr: '', it: '' },
        texto: {
          es: 'El símbolo más antiguo que se conserva de Madrid, de 1212, no lleva madroño: es solo una osa caminando con siete estrellas sobre el lomo, la misma enseña que, según la tradición, los milicianos de la villa llevaron a la batalla de las Navas de Tolosa. El árbol se incorporó diez años más tarde, en 1222, para cerrar un pleito entre el Concejo y la Iglesia por el uso de los montes que Alfonso VIII había cedido a Madrid en 1202: la Iglesia se quedó con la osa caminando, el Concejo con una osa empinada contra un árbol —después concretado en madroño— reclamando también el fruto. De ese reparto nació el apodo que la ciudad arrastra desde entonces.',
          en: '', fr: '', it: '',
        },
      },
      {
        titulo: { es: 'La serpiente que un cronista convirtió en dragón', en: '', fr: '', it: '' },
        texto: {
          es: 'En 1569, al derribar la Puerta Cerrada para ensanchar el paso, apareció tallado en la dovela principal un relieve que el cronista de la villa, Juan López de Hoyos —años más tarde, maestro de un joven Cervantes—, describió como "un fiero y espantable dragón". La gente empezó a llamar a aquel acceso la Puerta de la Culebra, y no por casualidad: en el propio dibujo que López de Hoyos incluyó en su crónica, la supuesta bestia no pasa de ser una culebra corriente. La leyenda, aun así, cuajó.',
          en: '', fr: '', it: '',
        },
      },
      {
        titulo: { es: 'Corona va, corona viene', en: '', fr: '', it: '' },
        texto: {
          es: 'En 1554, Carlos I distinguió a Madrid con el título de villa "coronada e imperial", y el escudo ganó una corona imperial abierta. No fue la última corona que tuvo: en 1822, la Milicia Nacional plantó cara a la Guardia Real en defensa de la Constitución, y Fernando VII premió a la villa con una corona cívica de hojas de roble entrelazadas en granate, que se sumó al escudo décadas después. Dos coronas distintas, dos episodios políticos distintos, en el mismo espacio reducido de un blasón.',
          en: '', fr: '', it: '',
        },
      },
      {
        titulo: { es: 'Cuanto más antiguo, más recargado', en: '', fr: '', it: '' },
        texto: {
          es: 'A mediados del siglo XIX, el Ayuntamiento reformó el escudo y lo hizo más complejo que nunca: lo dividió en cuarteles, dejó el oso y el madroño en uno, colocó la corona cívica de 1822 en lo alto y resucitó, dorada y con cuartel propio, la criatura que López de Hoyos había visto tallada en la Puerta Cerrada tres siglos antes. Fue la versión más recargada que ha tenido nunca el escudo de Madrid, y también la que más tiempo aguantó: más de cien años, hasta bien entrado el siglo XX.',
          en: '', fr: '', it: '',
        },
      },
      {
        titulo: { es: '1967, la comisión que dijo que no', en: '', fr: '', it: '' },
        texto: {
          es: 'Ese año, el Ayuntamiento encargó un informe a la Real Academia de la Historia. Su presidente, Dalmiro de la Válgoma, rastreó el origen de la criatura hasta aquella dovela de 1569 y concluyó que su presencia en el escudo era, sencillamente, un error sin base histórica. El 28 de abril de 1967, el pleno municipal aprobó el escudo que hoy identifica a Madrid: campo de plata, madroño de sinople, oso empinado de sable, una orla azul con siete estrellas de plata y, al timbre, la corona real antigua. La criatura y la corona cívica desaparecieron esa misma tarde, después de casi un siglo en el escudo oficial de la ciudad.',
          en: '', fr: '', it: '',
        },
      },
    ],
    enlacesRutas: ['madrid-austrias'],
    cierre: {
      es: 'Ese escudo recargado, con corona cívica y la criatura que la Real Academia acabó borrando en 1967, no se esfumó del todo: sigue grabado, hoy mismo, en un rincón muy concreto del centro de Madrid que miles de personas pisan cada día sin agacharse a mirarlo. {ruta1} arranca justo ahí, y ese es solo el primero de ocho detalles que el Madrid de los Austrias guarda a la altura de los ojos, no en una vitrina.',
      en: '', fr: '', it: '',
    },
  },
  {
    id: 'valencia',
    ciudadSlug: 'valencia',
    imgHero: 'assets/img/ciudades/valencia-hero.webp',
    titulo: { es: 'La copa que el Carmen guarda desde la Última Cena (o eso dicen)', en: '', fr: '', it: '' },
    resumen: {
      es: 'En el Carmen, la Catedral guarda una copa de piedra del siglo I que dos papas usaron para dar misa: el candidato a Santo Grial mejor documentado.',
      en: '', fr: '', it: '',
    },
    secciones: [
      {
        titulo: { es: 'Una copa de piedra, no de oro', en: '', fr: '', it: '' },
        texto: {
          es: 'Olvidaos de la copa dorada y cubierta de gemas de las películas. El Santo Cáliz que se venera en la Catedral de Valencia, a un paso de la Lonja y del corazón del Carmen, es un cuenco de ágata pulida de apenas 7 centímetros de alto y 9,5 de diámetro, montado sobre un pie de orfebrería medieval añadido siglos después. Vive en su propia capilla, tras una reja, separado de fieles y curiosos por una vitrina. No impone por tamaño ni por brillo: impone por lo que se lleva escrito sobre él desde hace casi mil años.',
          en: '', fr: '', it: '',
        },
      },
      {
        titulo: { es: 'Lo que la piedra sí puede fechar', en: '', fr: '', it: '' },
        texto: {
          es: 'La parte de ágata, la única que podría ser realmente antigua, lleva décadas bajo estudio arqueológico. La referencia clásica, del profesor Antonio Beltrán en 1960, la sitúa en torno al cambio de era, entre el siglo I antes de Cristo y el I después, tallada en un taller del Mediterráneo oriental. Un estudio posterior, de 2019, propone algo más concreto: que es un vaso de bendición judío, del mismo tipo que se usaba en las cenas rituales de la época de Herodes el Grande. Si esa datación se sostiene, el objeto sí pudo estar sobre una mesa como la de la Última Cena. Que estuviera en esa mesa exacta ya no lo puede firmar ningún arqueólogo.',
          en: '', fr: '', it: '',
        },
      },
      {
        titulo: { es: 'De una cueva en Huesca a la mesa de un rey', en: '', fr: '', it: '' },
        texto: {
          es: 'El rastro documentado —al margen de la leyenda sobre cómo salió de Roma— arranca en el Pirineo aragonés. En 1071, el obispo de Jaca lo lleva al monasterio de San Juan de la Peña, y un documento del propio monasterio fechado en 1134 ya lo describe como el cáliz en que Cristo consagró su sangre, guardado entonces en un arca de marfil. De ahí pasa a la capilla real de los reyes de Aragón, hasta que Alfonso el Magnánimo, que ya lo guardaba entre sus objetos personales, lo entrega al Cabildo de la Catedral de Valencia en 1437, como garantía de un préstamo de 40.000 ducados de oro. La deuda se quedó en el papel; la copa, en el Carmen, casi 600 años después.',
          en: '', fr: '', it: '',
        },
      },
      {
        titulo: { es: 'Dos papas, y solo dos, han dicho misa con ella', en: '', fr: '', it: '' },
        texto: {
          es: 'Durante siglos, ningún papa ofició la eucaristía con este cáliz. Eso cambió el 8 de noviembre de 1982: Juan Pablo II, de visita en Valencia, pidió usarlo y se convirtió en el primer papa de la historia en decir misa con él. El segundo fue Benedicto XVI, el 9 de julio de 2006, en la misa de clausura del Encuentro Mundial de las Familias, ante más de un millón de personas reunidas en la Ciudad de las Artes y las Ciencias. Hasta hoy, esos dos siguen siendo los únicos.',
          en: '', fr: '', it: '',
        },
      },
      {
        titulo: { es: '¿El Grial? Eso ya depende de a quién le preguntéis', en: '', fr: '', it: '' },
        texto: {
          es: 'Nadie puede demostrar que esta copa concreta tocara los labios de Cristo: eso es cuestión de fe, no de arqueología. Lo que sí es verificable es que, de todas las copas que en distintos rincones de Europa se han presentado como el Grial a lo largo de los siglos, esta es la única que dos papas han usado en persona para consagrar en misa. Historiadores y arqueólogos siguen discutiendo los detalles, pero coinciden en lo esencial: es el candidato con mejor rastro documental de todos. El resto, que cada cual lo complete con la fe que le sobre.',
          en: '', fr: '', it: '',
        },
      },
    ],
    enlacesRutas: ['valencia-carmen'],
    cierre: {
      es: 'Todo esto —la copa, la capilla, los dos papas que dijeron misa con ella— queda a un paseo corto de la Lonja de la Seda, entre las mismas calles del Carmen donde antes regateaban mercaderes de seda y gremios enteros. Si el asunto os ha dejado con ganas de ver la capilla con vuestros propios ojos, {ruta1} cruza ese mismo triángulo del casco histórico y os lleva, enigma a enigma, hasta la puerta del Santo Cáliz.',
      en: '', fr: '', it: '',
    },
  },
  {
    id: 'napoles',
    ciudadSlug: 'napoles',
    imgHero: 'assets/img/ciudades/napoles-hero.webp',
    titulo: { es: 'Una calle griega de 2.500 años sigue partiendo Nápoles en dos', en: '', fr: '', it: '' },
    resumen: { es: 'Antes de Nápoles existió Palépolis, una ciudad griega vecina: Spaccanapoli es su avenida principal, y por eso sigue partiendo el centro en dos.', en: '', fr: '', it: '' },
    secciones: [
      {
        titulo: { es: 'La ciudad que hubo antes de Nápoles', en: '', fr: '', it: '' },
        texto: { es: "A finales del siglo VIII a.C., colonos de Cumas —la colonia griega más antigua del continente italiano— se instalaron en la colina de Pizzofalcone, junto al islote donde hoy se alza el Castel dell'Ovo, y fundaron un asentamiento que llamaron Parténope, por la sirena que la leyenda decía varada en esa misma orilla. Generaciones más tarde, otro grupo de colonos griegos fundó, justo al lado, una segunda ciudad más grande y mejor planificada: la llamaron Neápolis, 'ciudad nueva'. Para distinguirla de la primera, el asentamiento original empezó a conocerse como Palépolis (Παλαιόπολις), 'ciudad vieja'. Durante décadas, las dos convivieron a poca distancia, hasta que Roma se anexionó la más antigua y solo Neápolis siguió creciendo.", en: '', fr: '', it: '' },
      },
      {
        titulo: { es: 'Neápolis, el nombre que no ha cambiado en 2.500 años', en: '', fr: '', it: '' },
        texto: { es: "Neápolis no creció al azar. Sus fundadores trazaron una cuadrícula regular de calles: tres grandes avenidas paralelas —las plateiai— cruzadas en ángulo recto por otras veintiuna calles más estrechas, los stenopoi. Esa planificación geométrica, con siglos de antelación a las reglas urbanísticas que luego se atribuirían a Hipodamo de Mileto, sigue marcando hoy el plano del centro histórico. Y el nombre tampoco se ha perdido: 'Neápolis' pasó al latín como 'Neapolis', de ahí al italiano como 'Napoli' y al español como 'Nápoles', sin más cambio que el desgaste normal de unos 2.500 años de uso ininterrumpido.", en: '', fr: '', it: '' },
      },
      {
        titulo: { es: 'Una avenida griega que nunca dejó de ser calle', en: '', fr: '', it: '' },
        texto: { es: "De esas tres plateiai originales, la más meridional es la que hoy conocemos como Spaccanapoli, apuntando en línea recta hacia la colina donde se alza el Castel Sant'Elmo. Los romanos la integraron sin tocarla en su propio trazado urbano, y la ciudad medieval y barroca simplemente construyó encima, fachada a fachada, sin enderezar ni un tramo. Por eso, de pie en un extremo, se distingue el otro extremo sin que la vista tropiece con una sola curva: no es una calle pensada para parecer recta, es una calle que nunca ha dejado de ser la misma línea que unos agrimensores griegos tiraron hace 2.500 años.", en: '', fr: '', it: '' },
      },
      {
        titulo: { es: 'Cuando Roma conquistó la ciudad y no cambió casi nada', en: '', fr: '', it: '' },
        texto: { es: "En el 326 a.C., Roma puso fin a la independencia de Palépolis-Neápolis tras la guerra contra los samnitas. Pero, a diferencia de otras conquistas, no impuso su lengua ni sus costumbres: convirtió a la ciudad en una 'civitas foederata', aliada con estatuto propio, y Nápoles siguió hablando griego y celebrando competiciones atléticas y musicales al estilo heleno durante siglos, ya bajo dominio romano. El propio emperador Nerón eligió Nápoles, y no Roma, para debutar en público como cantante, convencido —según los cronistas romanos de la época— de que un público de raíces griegas sabría apreciar mejor su actuación que uno romano.", en: '', fr: '', it: '' },
      },
      {
        titulo: { es: 'Tres capas bajo el asfalto: cantera, acueducto y refugio', en: '', fr: '', it: '' },
        texto: { es: "El subsuelo de Nápoles está tan estratificado como sus calles. Los griegos empezaron a excavar la toba volcánica bajo Neápolis para extraer los bloques con los que se levantaron murallas y templos, dejando cientos de galerías vacías. Los romanos las ampliaron y conectaron hasta convertirlas en el acueducto della Bolla, la red de cisternas y canales que abasteció de agua potable a la ciudad hasta el siglo XIX. Dejó de funcionar en 1884, cuando el Reino de Italia ordenó su cierre definitivo: una epidemia de cólera del año anterior había demostrado que las aguas residuales se filtraban a través de la toba porosa y contaminaban el agua que bebía la ciudad. Durante casi sesenta años esos túneles no fueron más que un vertedero clandestino, hasta que en 1942, en plena Segunda Guerra Mundial, las autoridades italianas los recuperaron de nuevo: excavaron escaleras de acceso y los acondicionaron como refugio antiaéreo, hasta 40 metros bajo tierra, para los napolitanos que huían de los bombardeos aliados.", en: '', fr: '', it: '' },
      },
    ],
    enlacesRutas: ['napoles-spaccanapoli'],
    cierre: { es: "Toda esa superposición de capas —Palépolis bajo Neápolis, el decumano romano bajo la calle barroca, la cantera griega bajo el acueducto bajo el refugio de guerra— se recorre a pie, en unas dos horas, en {ruta1}: la manera más directa de sentir, calle a calle, por qué Nápoles nunca ha dejado de tener 2.500 años.", en: '', fr: '', it: '' },
  },
  {
    id: 'toulouse',
    ciudadSlug: 'toulouse',
    imgHero: 'assets/img/ciudades/toulouse-hero.webp',
    titulo: { es: 'Por qué a Toulouse le dicen la Ciudad Rosa', en: '', fr: '', it: '' },
    resumen: {
      es: 'El ladrillo rosa de Toulouse no fue una elección estética: el valle del Garona no tiene canteras de piedra, y ese rosa solo aparece al atardecer.',
      en: '',
      fr: '',
      it: '',
    },
    secciones: [
      {
        titulo: { es: 'Una ciudad sin piedra', en: '', fr: '', it: '' },
        texto: {
          es: 'Toulouse se construyó en ladrillo por una razón que no tiene nada que ver con el gusto: no había otra opción. La cuenca del Garona, donde se asienta la ciudad, carece de canteras de piedra caliza; la más cercana está a más de 70 km, en las estribaciones de los Pirineos, y traerla hasta aquí exigía bajarla en balsas por el Garona o el Ariège, o, desde finales del siglo XVII, por el Canal du Midi. El resultado: la piedra se volvió un lujo, reservada para dinteles, cornisas y detalles puntuales, mientras que el barro del propio río, abundante y gratis, se convirtió en el material de todo lo demás. Ya los romanos explotaban esa arcilla aluvial en el siglo I a. C. para fabricar ladrillo cocido de medidas estandarizadas: la receta de Toulouse tiene dos mil años.',
          en: '',
          fr: '',
          it: '',
        },
      },
      {
        titulo: { es: 'Un rosa que depende de la hora', en: '', fr: '', it: '' },
        texto: {
          es: 'El apodo Ville Rose no describe el color del ladrillo, sino un efecto de luz muy concreto. A mediodía, ese mismo ladrillo se ve sobre todo rojizo, casi terracota; el rosa de verdad, el intenso, solo aparece al atardecer, cuando el sol cae en ángulo bajo desde el oeste y golpea las fachadas de refilón: es entonces cuando se encienden en un rosa dorado y cálido, un fenómeno tan climático como arquitectónico. Ni siquiera todos los ladrillos son iguales: una cocción más suave da tonos claros, casi salmón, y una cocción más fuerte los oscurece hacia el rojo marrón. El mirador clásico para verlo es el Pont Neuf, mirando hacia el Quai de la Daurade, justo cuando el sol empieza a caer sobre el río.',
          en: '',
          fr: '',
          it: '',
        },
      },
      {
        titulo: { es: 'Un condado casi tan grande como un reino', en: '', fr: '', it: '' },
        texto: {
          es: 'Antes de ser una ciudad francesa como cualquier otra, Toulouse fue la capital de un estado con peso propio. A comienzos del siglo XIII, bajo el conde Raimundo VI, el Condado de Toulouse no se limitaba a la ciudad: incluía el Rouergue, el Quercy, el ducado de Narbona y los marquesados de Gothia y Provenza, un territorio que en extensión rivalizaba con el dominio directo del propio rey de Francia. El conde rendía homenaje formal a la corona, pero gobernaba, impartía justicia y hacía la guerra por su cuenta: la dependencia era, sobre todo, nominal.',
          en: '',
          fr: '',
          it: '',
        },
      },
      {
        titulo: { es: 'La cruzada que acabó con la independencia', en: '', fr: '', it: '' },
        texto: {
          es: 'Esa autonomía terminó por una cuestión de fe. La región de Toulouse era el corazón del catarismo, una herejía cristiana que la Iglesia de Roma quiso erradicar a cualquier precio: en 1209 el papa Inocencio III proclamó una cruzada, y durante veinte años un ejército de nobles del norte de Francia, primero bajo el mando de Simón de Montfort, arrasó el Languedoc pueblo a pueblo. No fue solo una guerra religiosa: fue también la manera en que la corona francesa terminó metiendo, por la fuerza, a todo el sur del país bajo su autoridad directa.',
          en: '',
          fr: '',
          it: '',
        },
      },
      {
        titulo: { es: 'Una boda sella la anexión', en: '', fr: '', it: '' },
        texto: {
          es: 'La guerra se cerró en una mesa, no en un campo de batalla. El 12 de abril de 1229, en el tratado de Meaux-París, el conde Raimundo VII se reconcilió con el joven rey Luis IX y aceptó casar a Juana, su única hija y heredera, con Alfonso de Poitiers, hermano del rey. El matrimonio no tuvo hijos, así que a la muerte de Alfonso, en 1271, el condado revirtió íntegro a la corona: cuarenta y dos años después de aquel tratado, Toulouse dejó de ser la capital de nada que no fuera Francia.',
          en: '',
          fr: '',
          it: '',
        },
      },
    ],
    enlacesRutas: ['toulouse-capitole'],
    cierre: {
      es: 'Todo esto —la arcilla que sustituyó a la piedra, el rosa que solo aparece con la luz baja, el condado que perdió el pulso con París— sigue ahí, en las fachadas del centro histórico. {ruta1} atraviesa esa misma zona a pie, de la plaza que heredó el gobierno de la ciudad a la basílica románica más grande de Europa, y se detiene en el ladrillo con el tiempo que un cartel turístico nunca da.',
      en: '',
      fr: '',
      it: '',
    },
  },
  {
    id: 'berlin',
    ciudadSlug: 'berlin',
    imgHero: 'assets/img/ciudades/berlin-hero.webp',
    titulo: {
      es: 'Berlín no esconde su historia del siglo XX: la deja tallada en la calle',
      en: '', fr: '', it: '',
    },
    resumen: {
      es: 'Berlín tiene más de 100.000 placas de latón incrustadas en sus aceras, cada una con el nombre de una víctima del nazismo frente a su último hogar.',
      en: '', fr: '', it: '',
    },
    secciones: [
      {
        titulo: { es: 'Piedras, no pedestales', en: '', fr: '', it: '' },
        texto: {
          es: 'Se llaman Stolpersteine, piedras de tropiezo, y ninguna está sobre un pedestal. Son placas de latón de 10 por 10 centímetros encajadas al ras del pavimento, una por víctima, siempre frente a la casa donde esa persona vivió por última vez antes de que se la llevaran. Cada una lleva grabados a mano un nombre, un año de nacimiento y lo que pasó después: fecha de deportación, campo, fecha de muerte cuando se conoce. Hoy hay más de 100.000 repartidas por más de 30 países europeos: es el memorial descentralizado más grande del mundo, sin sede ni monumento central, solo miles de puntos sueltos cosidos al pavimento de media Europa.',
          en: '', fr: '', it: '',
        },
      },
      {
        titulo: { es: 'Empezó en una acera de Berlín', en: '', fr: '', it: '' },
        texto: {
          es: 'El artista alemán Gunter Demnig probó la idea por primera vez en Colonia, en diciembre de 1992, con una sola placa frente al ayuntamiento, para conmemorar la orden de Heinrich Himmler que mandó deportar a los gitanos sinti y roma a Auschwitz. Pero el proyecto tal como existe hoy —una piedra, un nombre, una dirección real— nació en Berlín. En mayo de 1996, Demnig colocó 51 piedras en las aceras de Oranienstraße y Dresdener Straße, en Kreuzberg, sin pedir permiso a nadie. La primera de todas fue para Lina Friedemann, frente al número 158. Tres meses después, unas obras en Moritzplatz sacaron las piedras a la luz ante el distrito, que optó por legalizarlas en vez de retirarlas. De ahí se extendió al resto de Berlín, luego a toda Alemania y después a más de treinta países.',
          en: '', fr: '', it: '',
        },
      },
      {
        titulo: { es: 'Un nombre por piedra', en: '', fr: '', it: '' },
        texto: {
          es: 'El texto grabado en cada placa empieza casi siempre igual: "Hier wohnte" (Aquí vivió), seguido del nombre y el año de nacimiento. La mayoría recuerda a víctimas judías, pero también hay piedras para gitanos sinti y roma, personas homosexuales, testigos de Jehová, disidentes políticos y personas con discapacidad asesinadas por el régimen. La última línea resume el final: "ermordet" (asesinado), "befreit" (liberado) o "überlebt" (sobrevivió), porque no todas conmemoran una muerte. La investigación de cada caso no la hace un comité: la suelen empezar vecinos del edificio, escolares o familiares que rastrean censos y archivos hasta reconstruir una vida entera a partir de una dirección.',
          en: '', fr: '', it: '',
        },
      },
      {
        titulo: { es: 'Lo que las pisadas no consiguieron', en: '', fr: '', it: '' },
        texto: {
          es: 'Demnig quiso que fueran las propias pisadas las que mantuvieran el latón brillante, como si caminar sobre una piedra refrescara la memoria cada vez. En la práctica pasó lo contrario: mucha gente las rodea, como si fueran una lápida y no una acera, y el latón se oxida y se oscurece con los años. Por eso en más de 45 ciudades europeas hay grupos de voluntarios, a menudo estudiantes, que salen con un paño y líquido abrillantador a devolverles el brillo, piedra por piedra. No hay ceremonia ni valla alrededor: solo una placa del tamaño de un adoquín, a la altura del zapato, que cualquiera puede pisar sin darse cuenta hasta que se agacha a mirarla de cerca.',
          en: '', fr: '', it: '',
        },
      },
      {
        titulo: { es: 'Múnich dice que no', en: '', fr: '', it: '' },
        texto: {
          es: 'No todo el mundo está de acuerdo con la idea de pisar un nombre. Múnich prohíbe las Stolpersteine en la vía pública desde 2004: la comunidad judía de la ciudad, con la superviviente del Holocausto Charlotte Knobloch a la cabeza, argumentó que las víctimas merecían algo mejor que una placa a ras de la suciedad de la calle. Una petición con casi 99.000 firmas no bastó para revertir la prohibición; hoy Múnich solo permite recordarlas con placas en fachadas o sobre un poste, nunca en el suelo. Demnig ha respondido siempre lo mismo: bajar la vista para leer un nombre a la altura de los pies no es una falta de respeto, es exactamente lo que el proyecto pide.',
          en: '', fr: '', it: '',
        },
      },
    ],
    enlacesRutas: ['berlin-mitte'],
    cierre: {
      es: 'Nada de esto está señalizado como atracción: hay que caminar con la vista puesta en el suelo, no en las fachadas. Esa misma costumbre, parar, agacharse, leer lo que el pavimento tiene para contar, es la que pone a prueba {ruta1}, ocho paradas por Mitte, el distrito histórico de Berlín, donde la ciudad ha decidido, una y otra vez, no esconder su siglo XX sino dejarlo tallado a la altura de los ojos de quien se detenga a mirar.',
      en: '', fr: '', it: '',
    },
  },
  {
    id: 'istanbul',
    ciudadSlug: 'istanbul',
    imgHero: 'assets/img/ciudades/istanbul-hero.webp',
    titulo: { es: 'La única ciudad que fue capital de dos imperios sin cambiar de sitio', en: '', fr: '', it: '' },
    resumen: {
      es: 'Bizancio, Constantinopla y Estambul son la misma ciudad bajo tres nombres oficiales distintos: capital de dos imperios sin moverse nunca de sitio.',
      en: '', fr: '', it: '',
    },
    secciones: [
      {
        titulo: { es: 'Bizancio, la colonia griega que empezó todo', en: '', fr: '', it: '' },
        texto: {
          es: 'La historia oficial arranca hacia el 667 a.C., cuando un grupo de colonos griegos de Megara cruza el Bósforo guiado por un colono llamado Byzas. La leyenda cuenta que antes de partir consultaron el oráculo de Delfos, que les recomendó fundar la ciudad «frente a la tierra de los ciegos» — una pista que solo cobró sentido al llegar: unos colonos anteriores habían fundado Calcedonia en la orilla opuesta, ignorando una posición muchísimo mejor a un paso de distancia. Byzas se quedó con ese sitio mejor y le dio su propio nombre: Bizancio.',
          en: '', fr: '', it: '',
        },
      },
      {
        titulo: { es: 'Constantinopla: el nombre que ni su fundador quería', en: '', fr: '', it: '' },
        texto: {
          es: 'En el año 330, el emperador Constantino dedica sobre las ruinas de Bizancio la nueva capital del Imperio romano y la bautiza, oficialmente, «Nova Roma» — Nueva Roma. El nombre nunca cuajó: ya en vida de Constantino, todo el mundo prefería llamarla «la ciudad de Constantino» — Constantinopla. Con ese nombre no oficial pero universal, la ciudad fue durante más de mil años la capital del Imperio romano de Oriente, el que hoy conocemos como Imperio bizantino.',
          en: '', fr: '', it: '',
        },
      },
      {
        titulo: { es: '1453: cambia el imperio, no cambia la capital', en: '', fr: '', it: '' },
        texto: {
          es: 'El 29 de mayo de 1453, el sultán otomano Mehmed II toma Constantinopla y pone fin a más de mil años de continuidad bizantina. Lo insólito no es la conquista, sino lo que Mehmed decide hacer después: en vez de levantar una capital nueva en otro lugar, como habría hecho casi cualquier otro conquistador, se queda con la misma ciudad. Constantinopla pasa a ser, sin moverse un metro, la capital del Imperio otomano. Ningún otro lugar del mundo fue la sede de dos imperios tan distintos, uno detrás de otro, sobre el mismo terreno.',
          en: '', fr: '', it: '',
        },
      },
      {
        titulo: { es: 'El nombre que ya usaba la calle mucho antes que el papel', en: '', fr: '', it: '' },
        texto: {
          es: 'Durante casi cinco siglos de dominio otomano, los documentos y las monedas oficiales siguen usando «Kostantiniyye», una forma otomana de Constantinopla. En la calle, mientras tanto, corre desde hace generaciones un nombre más corto y coloquial: Estambul. El Imperio otomano se disuelve en 1922 y la nueva República turca nace en 1923 con la capital trasladada a Ankara: por primera vez desde el año 330, la ciudad deja de ser la capital de nadie. Recién en 1930, ya sin ese título, el gobierno de Atatürk formaliza lo que la calle llevaba diciendo generaciones: decreta que el nombre oficial y único pasa a ser Estambul.',
          en: '', fr: '', it: '',
        },
      },
      {
        titulo: { es: '¿De dónde sale «Estambul»? La teoría con más peso', en: '', fr: '', it: '' },
        texto: {
          es: 'La palabra «İstanbul» generó varias hipótesis. Una es una etimología popular otomana, «İslambol» («llena de islam»), que ya recogía como nombre corriente el viajero otomano Evliya Çelebi en el siglo XVII — pero que la lingüística moderna no respalda como origen real de la palabra. La teoría con más consenso académico apunta en otra dirección, mucho más antigua y bastante menos religiosa: derivaría de la expresión griega medieval «eis tin polin» (εἰς τὴν πόλιν), que significa, simplemente, «hacia la ciudad» o «a la ciudad». Para los griegos que vivían alrededor de Constantinopla, esta era sencillamente «la Ciudad» — no hacía falta llamarla de otra forma —, y esa expresión tan repetida se fue deformando en boca de hablantes turcos hasta convertirse en «İstanbul». Si la hipótesis es correcta, el nombre que hoy suena más turco de los tres es, en su raíz, tan griego como el propio Bizancio.',
          en: '', fr: '', it: '',
        },
      },
    ],
    enlacesRutas: ['istanbul-sultanahmet'],
    cierre: {
      es: 'Sultanahmet es el barrio donde esas tres ciudades se pisan literalmente unas a otras: trazado bizantino bajo el suelo, mezquitas otomanas por encima y el nombre turco en cada cartel de calle. {ruta1} recorre esa superposición a pie, parada a parada, por los mismos puntos exactos donde una capital se convirtió en la siguiente sin mudarse nunca de sitio.',
      en: '', fr: '', it: '',
    },
  },
];

export function historiaPorSlug(slug) {
  return HISTORIAS.find((h) => h.id === slug) || null;
}

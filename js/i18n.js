// js/i18n.js
//
// Mismo patrón que grip-la-seu/js/i18n.js (LANGS + DICT + t()), ampliado con
// dos ayudantes que grip-la-seu no necesitaba porque era una sola página:
//
//   - tf(lang, key, vars)   interpola {placeholders} dentro de un string
//   - aplicarI18n(root, lang)  recorre [data-i18n] y rellena el DOM
//
// `es` es el idioma canónico y el único completo por ahora. `en` / `fr` / `it`
// se rellenan en el paso 7 del plan (Traducciones); hasta entonces t() cae a
// español para cualquier clave que falte, así que nada se rompe si una página
// nueva usa una clave que aún no se ha traducido.

export const LANGS = ['es', 'en', 'fr', 'it'];
export const DEFAULT_LANG = 'es';

export const LANG_NAMES = {
  es: 'Español',
  en: 'English',
  fr: 'Français',
  it: 'Italiano',
};

export const DICT = {
  es: {
    // Marca
    brand_name: 'Vestigia',
    brand_tagline: 'Una manera divertida de conocer la ciudad',

    // Navegación / cabecera
    nav_ciudades: 'Ciudades',
    nav_como_funciona: 'Cómo funciona',
    nav_idioma_label: 'Idioma',
    nav_historias: 'Historias',

    // Portada — hero
    hero_eyebrow: 'Escape rooms urbanos al aire libre',
    hero_title: 'Sigue los vestigios.',
    hero_subtitle:
      'Cada ciudad esconde una historia. Cada historia, un misterio. Recorre sus calles y rincones, descubre pistas ocultas a plena vista y resuelve los enigmas que lo destapan.',
    hero_cta: 'Elige tu ciudad',

    // Portada — cómo funciona
    como_funciona_title: 'Cómo funciona',
    como_1_title: 'Elige ciudad y ruta',
    como_1_texto: 'Selecciona la ciudad en la que quieres jugar y elige entre los recorridos disponibles.',
    como_2_title: 'Reserva tu partida',
    como_2_texto: 'Prueba nuestras rutas gratuitas o compra el acceso permanente para todo el equipo con un pago único.',
    como_3_title: 'Camina, juega y aprende',
    como_3_texto: 'Prepárate para salir a la calle a observar, pensar y resolver enigmas.',
    como_4_title: 'Descubre la historia',
    como_4_texto: 'Cada acierto desbloquea un fragmento de historia real y más información sobre tu entorno.',

    // Portada — sección ciudades
    ciudades_title: 'Destinos por descubrir',
    ciudades_subtitle: 'Explora nuevos escenarios y descubre lo que esconde a tu paso.',
    badge_proximamente: 'Próximamente',
    ciudad_ver_rutas: 'Ver ruta',

    // Metadatos de ruta (compartidos entre portada, ciudad y ficha)
    meta_paradas: '{n} paradas',
    meta_duracion: '≈{h} h',
    meta_duracion_label: 'Duración',
    meta_jugadores: '{min}–{max} jugadores',
    meta_jugadores_label: 'Jugadores',
    dificultad_label: 'Dificultad',
    dificultad_facil: 'Fácil',
    dificultad_media: 'Media',
    dificultad_dificil: 'Difícil',
    precio_desde: 'Desde',
    precio_por_equipo: '/ equipo',
    precio_gratis: 'Gratis',

    // Página de ciudad
    ciudad_volver: 'Todas las ciudades',
    ciudad_rutas_disponibles: 'Rutas en {ciudad}',
    ciudad_ruta_cta: 'Ver detalles',
    ciudad_otras_titulo: 'Otras ciudades',
    historias_titulo: 'Historias',
    historias_subtitulo: 'Curiosidades reales de cada ciudad, antes de pisarla.',
    historias_volver: 'Todas las historias',

    // Ficha de ruta
    ruta_volver: 'Volver a {ciudad}',
    ruta_todas_ciudades: 'Volver a todas las ciudades',
    ruta_leer_historia: 'Leer curiosidades de {ciudad}',
    ruta_zona_label: 'Zona de juego',
    ruta_punto_partida_label: 'Punto de partida',
    ruta_muestra_title: 'Un adelanto',
    ruta_muestra_nota: 'Así son los enigmas. El resto se desbloquea al empezar a jugar.',
    ruta_incluye_1: 'Acceso a la ruta completa durante 1 año desde la compra',
    ruta_incluye_2: 'Sistema de pistas si os quedáis atascados',
    ruta_incluye_3: 'Versión imprimible por si preferís ir sin móvil',
    ruta_incluye_4: 'Sin necesidad de cobertura una vez cargada la ruta',
    ruta_reservar_cta: 'Reservar esta ruta — {precio} € por equipo',
    ruta_jugar_gratis_cta: 'Jugar esta ruta — gratis',
    ruta_mapa_title: 'La zona de juego',
    ruta_mapa_alt: 'Mapa antiguo de la zona: {zona}',
    ruta_email_label: 'Tu email, para enviarte el acceso',
    ruta_email_placeholder: 'nombre@ejemplo.com',
    ruta_condiciones_texto: 'He leído y acepto las {link}, incluida la renuncia al derecho de desistimiento de 14 días para contenido digital de entrega inmediata.',
    ruta_condiciones_enlace: 'condiciones del servicio',
    ruta_idiomas_label: 'Disponible en',
    ruta_otras_titulo: 'Otras rutas en {ciudad}',

    // Pantalla de juego (jugar/index.html)
    juego_cargando: 'Cargando tu ruta…',
    juego_error_titulo: 'No hemos encontrado tu partida',
    juego_error_texto: 'Revisa el enlace de tu email de confirmación, o vuelve a la ficha de la ruta para comprarla.',
    juego_error_cta: 'Ver rutas disponibles',
    juego_parada_de: 'Parada {actual} de {total}',
    juego_llegada_titulo: 'Cómo llegar',
    juego_enigma_titulo: 'El enigma',
    juego_input_placeholder: 'Escribe vuestra respuesta',
    juego_input_placeholder_corto: 'Letra o número',
    juego_btn_comprobar: 'Comprobar',
    juego_btn_pista: 'Pedir una pista',
    juego_btn_pista_agotadas: 'No quedan más pistas',
    juego_pistas_titulo: 'Pistas usadas',
    juego_feedback_correcto: '¡Correcto!',
    juego_feedback_casi: 'Casi... revisad la respuesta, puede que sea un error tipográfico.',
    juego_feedback_incorrecto: 'No es eso. Mirad de nuevo a vuestro alrededor.',
    juego_historia_titulo: 'Lo que acabáis de descubrir',
    juego_saber_mas_btn: 'Saber más sobre este lugar',
    juego_btn_siguiente: 'Siguiente parada',
    juego_btn_siguiente_final: 'Ver el final de la ruta',
    juego_final_tiempo: 'Tiempo total: {tiempo}',
    juego_final_btn_imprimir: 'Descargar versión imprimible',
    juego_final_btn_inicio: 'Volver a Vestigia',
    juego_offline_aviso: 'Sin conexión: seguís jugando con la ruta ya descargada.',

    // Versión imprimible (jugar/imprimir.html)
    imprimir_marca: 'Versión imprimible',
    imprimir_btn_print: 'Imprimir / Guardar como PDF',
    imprimir_llegada_label: 'Cómo llegar',
    imprimir_enigma_label: 'El enigma',
    imprimir_casilla_placeholder: 'Vuestra respuesta:',
    imprimir_aviso_final: 'Las pistas de cada enigma y los datos de "sobre este lugar" están al final del documento, en la última página.',
    imprimir_respuestas_titulo: 'Respuestas y pistas',
    imprimir_respuestas_aviso: 'No leáis esta página hasta que os quedéis atascados de verdad — os vais a estropear la ruta.',
    imprimir_respuesta_label: 'Respuesta',
    imprimir_pista_label: 'Pista {n}',
    imprimir_solucion_label: 'Solución',
    imprimir_historia_label: 'La historia',
    imprimir_sabermas_label: 'Sobre este lugar',

    // Página de gracias tras el pago (jugar/gracias.html)
    gracias_verificando: 'Verificando tu pago…',
    gracias_titulo: '¡Gracias por tu compra!',
    gracias_texto: 'Os hemos enviado el acceso por email, con un enlace que funciona durante un año. Aquí tenéis también un acceso directo:',
    gracias_btn_jugar: 'Empezar a jugar',
    gracias_btn_imprimir: 'Descargar versión imprimible',
    gracias_no_pagado_titulo: 'El pago no se ha completado',
    gracias_no_pagado_texto: 'Si crees que esto es un error, escríbenos indicando la referencia de tu pedido.',
    gracias_error_titulo: 'Algo ha ido mal',
    gracias_error_texto: 'No hemos podido verificar tu pago. Si el cargo se ha realizado, escríbenos y lo resolvemos.',
    gracias_cta_volver: 'Volver a Vestigia',
    ruta_reservando: 'Conectando con la pasarela de pago…',
    ruta_enviando_acceso: 'Enviando el acceso a tu email…',
    ruta_error_reserva: 'No hemos podido iniciar el pago. Inténtalo de nuevo en unos segundos.',
    ruta_error_acceso_gratuito: 'No hemos podido enviarte el acceso. Inténtalo de nuevo en unos segundos.',

    // Footer
    footer_creditos: 'Créditos de imágenes',
    footer_legal_aviso: 'Aviso legal',
    footer_legal_privacidad: 'Privacidad',
    footer_legal_condiciones: 'Condiciones',
    footer_rights: '© {year} Vestigia. Todos los derechos reservados.',
  },

  en: {
    // Brand
    brand_name: 'Vestigia',
    brand_tagline: 'A fun way to get to know the city',

    // Navigation / header
    nav_ciudades: 'Cities',
    nav_como_funciona: 'How it works',
    nav_idioma_label: 'Language',
    nav_historias: 'Stories',

    // Homepage — hero
    hero_eyebrow: 'Outdoor urban escape rooms',
    hero_title: 'Follow the vestiges.',
    hero_subtitle:
      'Every city hides a story. Every story, a mystery. Walk its streets and corners, find clues hidden in plain sight, and solve the puzzles that uncover it.',
    hero_cta: 'Choose your city',

    // Homepage — how it works
    como_funciona_title: 'How it works',
    como_1_title: 'Choose a city and trail',
    como_1_texto: 'Pick the city you want to play in and choose from the available trails.',
    como_2_title: 'Book your game',
    como_2_texto: 'Try our free trails, or buy permanent access for your whole team with a single payment.',
    como_3_title: 'Walk, play, learn',
    como_3_texto: "Get ready to hit the streets to observe, think, and solve puzzles.",
    como_4_title: 'Uncover the history',
    como_4_texto: "Every right answer unlocks a piece of real history and more about the place you're standing in.",

    // Homepage — cities section
    ciudades_title: 'Destinations to discover',
    ciudades_subtitle: 'Explore new settings and discover what they hide as you go.',
    badge_proximamente: 'Coming soon',
    ciudad_ver_rutas: 'See trail',

    // Trail metadata (shared across homepage, city page and trail page)
    meta_paradas: '{n} stops',
    meta_duracion: '≈{h} h',
    meta_duracion_label: 'Duration',
    meta_jugadores: '{min}–{max} players',
    meta_jugadores_label: 'Players',
    dificultad_label: 'Difficulty',
    dificultad_facil: 'Easy',
    dificultad_media: 'Medium',
    dificultad_dificil: 'Hard',
    precio_desde: 'From',
    precio_por_equipo: '/ team',
    precio_gratis: 'Free',

    // City page
    ciudad_volver: 'All cities',
    ciudad_rutas_disponibles: 'Trails in {ciudad}',
    ciudad_ruta_cta: 'See details',
    ciudad_otras_titulo: 'Other cities',
    historias_titulo: 'Stories',
    historias_subtitulo: 'Real curiosities about each city, before you set foot in it.',
    historias_volver: 'All stories',

    // Trail page
    ruta_volver: 'Back to {ciudad}',
    ruta_todas_ciudades: 'Back to all cities',
    ruta_leer_historia: 'Read curiosities about {ciudad}',
    ruta_zona_label: 'Play area',
    ruta_punto_partida_label: 'Starting point',
    ruta_muestra_title: 'A sneak peek',
    ruta_muestra_nota: 'This is what the puzzles are like. The rest unlocks once you start playing.',
    ruta_incluye_1: 'Access to the full trail for 1 year after purchase',
    ruta_incluye_2: 'Built-in hint system if you get stuck',
    ruta_incluye_3: 'Printable version, in case you’d rather go phone-free',
    ruta_incluye_4: 'No signal needed once the trail has loaded',
    ruta_reservar_cta: 'Book this trail — €{precio} per team',
    ruta_jugar_gratis_cta: 'Play this trail — free',
    ruta_mapa_title: 'The playing area',
    ruta_mapa_alt: 'Antique map of the area: {zona}',
    ruta_email_label: 'Your email, so we can send you access',
    ruta_email_placeholder: 'name@example.com',
    ruta_condiciones_texto: 'I have read and accept the {link}, including the waiver of the 14-day withdrawal right for digital content delivered immediately.',
    ruta_condiciones_enlace: 'terms of service',
    ruta_idiomas_label: 'Available in',
    ruta_otras_titulo: 'Other trails in {ciudad}',

    // Game screen (jugar/index.html)
    juego_cargando: 'Loading your trail…',
    juego_error_titulo: "We couldn't find your game",
    juego_error_texto: 'Check the link in your confirmation email, or go back to the trail page to buy it.',
    juego_error_cta: 'See available trails',
    juego_parada_de: 'Stop {actual} of {total}',
    juego_llegada_titulo: 'How to get there',
    juego_enigma_titulo: 'The puzzle',
    juego_input_placeholder: 'Type your answer',
    juego_input_placeholder_corto: 'Letter or number',
    juego_btn_comprobar: 'Check',
    juego_btn_pista: 'Get a hint',
    juego_btn_pista_agotadas: 'No more hints left',
    juego_pistas_titulo: 'Hints used',
    juego_feedback_correcto: 'Correct!',
    juego_feedback_casi: "Almost... double-check your answer, it might just be a typo.",
    juego_feedback_incorrecto: "That's not it. Take another look around you.",
    juego_historia_titulo: 'What you just discovered',
    juego_saber_mas_btn: 'More about this place',
    juego_btn_siguiente: 'Next stop',
    juego_btn_siguiente_final: 'See the end of the trail',
    juego_final_tiempo: 'Total time: {tiempo}',
    juego_final_btn_imprimir: 'Download printable version',
    juego_final_btn_inicio: 'Back to Vestigia',
    juego_offline_aviso: "You're offline: still playing with the trail already downloaded.",

    // Printable version (jugar/imprimir.html)
    imprimir_marca: 'Printable version',
    imprimir_btn_print: 'Print / Save as PDF',
    imprimir_llegada_label: 'How to get there',
    imprimir_enigma_label: 'The puzzle',
    imprimir_casilla_placeholder: 'Your answer:',
    imprimir_aviso_final: 'Each riddle\'s hints and "about this place" trivia are at the end of the document, on the last page.',
    imprimir_respuestas_titulo: 'Answers and hints',
    imprimir_respuestas_aviso: "Don't read this page until you're truly stuck — you'll spoil the trail for yourselves.",
    imprimir_respuesta_label: 'Answer',
    imprimir_pista_label: 'Hint {n}',
    imprimir_solucion_label: 'Solution',
    imprimir_historia_label: 'The story',
    imprimir_sabermas_label: 'About this place',

    // Thank-you page after payment (jugar/gracias.html)
    gracias_verificando: 'Verifying your payment…',
    gracias_titulo: 'Thanks for your purchase!',
    gracias_texto: "We've sent you access by email, with a link that works for a year. Here's a direct one too:",
    gracias_btn_jugar: 'Start playing',
    gracias_btn_imprimir: 'Download printable version',
    gracias_no_pagado_titulo: "Payment wasn't completed",
    gracias_no_pagado_texto: 'If you think this is a mistake, email us with your order reference.',
    gracias_error_titulo: 'Something went wrong',
    gracias_error_texto: "We couldn't verify your payment. If you were charged, email us and we'll sort it out.",
    gracias_cta_volver: 'Back to Vestigia',
    ruta_reservando: 'Connecting to the payment gateway…',
    ruta_enviando_acceso: 'Sending access to your email…',
    ruta_error_reserva: "We couldn't start the payment. Please try again in a few seconds.",
    ruta_error_acceso_gratuito: "We couldn't send you access. Please try again in a few seconds.",

    // Footer
    footer_creditos: 'Photo credits',
    footer_legal_aviso: 'Legal notice',
    footer_legal_privacidad: 'Privacy',
    footer_legal_condiciones: 'Terms',
    footer_rights: '© {year} Vestigia. All rights reserved.',
  },

  fr: {
    // Marque
    brand_name: 'Vestigia',
    brand_tagline: 'Une façon amusante de découvrir la ville',

    // Navigation / en-tête
    nav_ciudades: 'Villes',
    nav_como_funciona: 'Comment ça marche',
    nav_idioma_label: 'Langue',
    nav_historias: 'Histoires',

    // Accueil — hero
    hero_eyebrow: 'Escape games urbains en plein air',
    hero_title: 'Suivez les vestiges.',
    hero_subtitle:
      "Chaque ville cache une histoire. Chaque histoire, un mystère. Parcourez ses rues et ses recoins, trouvez des indices cachés à la vue de tous et résolvez les énigmes qui le révèlent.",
    hero_cta: 'Choisissez votre ville',

    // Accueil — comment ça marche
    como_funciona_title: 'Comment ça marche',
    como_1_title: 'Choisissez ville et parcours',
    como_1_texto: 'Choisissez la ville où vous voulez jouer et sélectionnez parmi les parcours disponibles.',
    como_2_title: 'Réservez votre partie',
    como_2_texto: "Essayez nos parcours gratuits, ou achetez l'accès permanent pour toute l'équipe avec un paiement unique.",
    como_3_title: 'Marchez, jouez, apprenez',
    como_3_texto: "Préparez-vous à descendre dans la rue pour observer, réfléchir et résoudre des énigmes.",
    como_4_title: "Découvrez l'histoire",
    como_4_texto: "Chaque bonne réponse débloque un fragment d'histoire réelle et plus d'informations sur le lieu où vous êtes.",

    // Accueil — section villes
    ciudades_title: 'Destinations à découvrir',
    ciudades_subtitle: "Explorez de nouveaux décors et découvrez ce qu'ils cachent en chemin.",
    badge_proximamente: 'Bientôt disponible',
    ciudad_ver_rutas: 'Voir le parcours',

    // Métadonnées de parcours (page d'accueil, ville et fiche)
    meta_paradas: '{n} étapes',
    meta_duracion: '≈{h} h',
    meta_duracion_label: 'Durée',
    meta_jugadores: '{min}–{max} joueurs',
    meta_jugadores_label: 'Joueurs',
    dificultad_label: 'Difficulté',
    dificultad_facil: 'Facile',
    dificultad_media: 'Moyenne',
    dificultad_dificil: 'Difficile',
    precio_desde: 'À partir de',
    precio_por_equipo: '/ équipe',
    precio_gratis: 'Gratuit',

    // Page de ville
    ciudad_volver: 'Toutes les villes',
    ciudad_rutas_disponibles: 'Parcours à {ciudad}',
    ciudad_ruta_cta: 'Voir les détails',
    ciudad_otras_titulo: 'Autres villes',
    historias_titulo: 'Histoires',
    historias_subtitulo: 'Des curiosités réelles sur chaque ville, avant d\'y poser le pied.',
    historias_volver: 'Toutes les histoires',

    // Fiche de parcours
    ruta_volver: 'Retour à {ciudad}',
    ruta_todas_ciudades: 'Retour à toutes les villes',
    ruta_leer_historia: 'Lire des curiosités sur {ciudad}',
    ruta_zona_label: 'Zone de jeu',
    ruta_punto_partida_label: 'Point de départ',
    ruta_muestra_title: 'Un avant-goût',
    ruta_muestra_nota: 'Voici à quoi ressemblent les énigmes. Le reste se débloque en commençant à jouer.',
    ruta_incluye_1: "Accès au parcours complet pendant 1 an après l'achat",
    ruta_incluye_2: 'Système d\'indices intégré si vous êtes bloqués',
    ruta_incluye_3: 'Version imprimable si vous préférez partir sans téléphone',
    ruta_incluye_4: 'Aucune connexion nécessaire une fois le parcours chargé',
    ruta_reservar_cta: 'Réserver ce parcours — {precio} € par équipe',
    ruta_jugar_gratis_cta: 'Jouer ce parcours — gratuit',
    ruta_mapa_title: 'La zone de jeu',
    ruta_mapa_alt: 'Carte ancienne de la zone : {zona}',
    ruta_email_label: "Votre email, pour vous envoyer l'accès",
    ruta_email_placeholder: 'nom@exemple.com',
    ruta_condiciones_texto: "J'ai lu et j'accepte les {link}, y compris la renonciation au droit de rétractation de 14 jours pour le contenu numérique livré immédiatement.",
    ruta_condiciones_enlace: "conditions d'utilisation",
    ruta_idiomas_label: 'Disponible en',
    ruta_otras_titulo: 'Autres parcours à {ciudad}',

    // Écran de jeu (jugar/index.html)
    juego_cargando: 'Chargement de votre parcours…',
    juego_error_titulo: "Nous n'avons pas trouvé votre partie",
    juego_error_texto: "Vérifiez le lien de votre email de confirmation, ou retournez à la fiche du parcours pour l'acheter.",
    juego_error_cta: 'Voir les parcours disponibles',
    juego_parada_de: 'Étape {actual} sur {total}',
    juego_llegada_titulo: 'Comment y aller',
    juego_enigma_titulo: "L'énigme",
    juego_input_placeholder: 'Écrivez votre réponse',
    juego_input_placeholder_corto: 'Lettre ou chiffre',
    juego_btn_comprobar: 'Vérifier',
    juego_btn_pista: 'Demander un indice',
    juego_btn_pista_agotadas: "Il n'y a plus d'indices",
    juego_pistas_titulo: 'Indices utilisés',
    juego_feedback_correcto: 'Correct !',
    juego_feedback_casi: "Presque... vérifiez votre réponse, c'est peut-être une faute de frappe.",
    juego_feedback_incorrecto: "Ce n'est pas ça. Regardez encore autour de vous.",
    juego_historia_titulo: 'Ce que vous venez de découvrir',
    juego_saber_mas_btn: 'En savoir plus sur ce lieu',
    juego_btn_siguiente: 'Étape suivante',
    juego_btn_siguiente_final: 'Voir la fin du parcours',
    juego_final_tiempo: 'Temps total : {tiempo}',
    juego_final_btn_imprimir: 'Télécharger la version imprimable',
    juego_final_btn_inicio: 'Retour à Vestigia',
    juego_offline_aviso: 'Hors ligne : vous continuez avec le parcours déjà téléchargé.',

    // Version imprimable (jugar/imprimir.html)
    imprimir_marca: 'Version imprimable',
    imprimir_btn_print: 'Imprimer / Enregistrer en PDF',
    imprimir_llegada_label: 'Comment y aller',
    imprimir_enigma_label: "L'énigme",
    imprimir_casilla_placeholder: 'Votre réponse :',
    imprimir_aviso_final: 'Les indices de chaque énigme et les infos « à propos de ce lieu » sont à la fin du document, sur la dernière page.',
    imprimir_respuestas_titulo: 'Réponses et indices',
    imprimir_respuestas_aviso: "Ne lisez cette page que si vous êtes vraiment bloqués — vous allez gâcher le parcours.",
    imprimir_respuesta_label: 'Réponse',
    imprimir_pista_label: 'Indice {n}',
    imprimir_solucion_label: 'Solution',
    imprimir_historia_label: "L'histoire",
    imprimir_sabermas_label: 'À propos de ce lieu',

    // Page de remerciement après paiement (jugar/gracias.html)
    gracias_verificando: 'Vérification de votre paiement…',
    gracias_titulo: 'Merci pour votre achat !',
    gracias_texto: "Nous vous avons envoyé l'accès par email, avec un lien valable un an. En voici aussi un accès direct :",
    gracias_btn_jugar: 'Commencer à jouer',
    gracias_btn_imprimir: 'Télécharger la version imprimable',
    gracias_no_pagado_titulo: "Le paiement n'a pas abouti",
    gracias_no_pagado_texto: "Si vous pensez qu'il s'agit d'une erreur, écrivez-nous en indiquant votre référence de commande.",
    gracias_error_titulo: "Une erreur s'est produite",
    gracias_error_texto: "Nous n'avons pas pu vérifier votre paiement. Si vous avez été débité, écrivez-nous et nous réglerons ça.",
    gracias_cta_volver: 'Retour à Vestigia',
    ruta_reservando: 'Connexion à la plateforme de paiement…',
    ruta_enviando_acceso: "Envoi de l'accès à votre email…",
    ruta_error_reserva: "Nous n'avons pas pu lancer le paiement. Réessayez dans quelques secondes.",
    ruta_error_acceso_gratuito: "Nous n'avons pas pu vous envoyer l'accès. Réessayez dans quelques secondes.",

    // Pied de page
    footer_creditos: 'Crédits photo',
    footer_legal_aviso: 'Mentions légales',
    footer_legal_privacidad: 'Confidentialité',
    footer_legal_condiciones: 'Conditions',
    footer_rights: '© {year} Vestigia. Tous droits réservés.',
  },

  it: {
    // Marchio
    brand_name: 'Vestigia',
    brand_tagline: 'Un modo divertente di scoprire la città',

    // Navigazione / intestazione
    nav_ciudades: 'Città',
    nav_como_funciona: 'Come funziona',
    nav_idioma_label: 'Lingua',
    nav_historias: 'Storie',

    // Homepage — hero
    hero_eyebrow: 'Escape room urbani all’aperto',
    hero_title: 'Seguite i vestigi.',
    hero_subtitle:
      'Ogni città nasconde una storia. Ogni storia, un mistero. Percorrete le sue strade e i suoi angoli, trovate indizi nascosti in bella vista e risolvete gli enigmi che lo svelano.',
    hero_cta: 'Scegli la tua città',

    // Homepage — come funziona
    como_funciona_title: 'Come funziona',
    como_1_title: 'Scegli città e percorso',
    como_1_texto: 'Scegli la città in cui vuoi giocare e seleziona tra i percorsi disponibili.',
    como_2_title: 'Prenota la tua partita',
    como_2_texto: "Prova i nostri percorsi gratuiti, oppure acquista l'accesso permanente per tutta la squadra con un pagamento unico.",
    como_3_title: 'Cammina, gioca, impara',
    como_3_texto: 'Preparati a uscire per strada per osservare, riflettere e risolvere enigmi.',
    como_4_title: 'Scopri la storia',
    como_4_texto: 'Ogni risposta giusta sblocca un frammento di storia reale e altre informazioni sul luogo in cui ti trovi.',

    // Homepage — sezione città
    ciudades_title: 'Destinazioni da scoprire',
    ciudades_subtitle: 'Esplorate nuovi scenari e scoprite cosa nascondono lungo il cammino.',
    badge_proximamente: 'Prossimamente',
    ciudad_ver_rutas: 'Vedi il percorso',

    // Metadati del percorso (condivisi tra home, città e scheda)
    meta_paradas: '{n} tappe',
    meta_duracion: '≈{h} h',
    meta_duracion_label: 'Durata',
    meta_jugadores: '{min}–{max} giocatori',
    meta_jugadores_label: 'Giocatori',
    dificultad_label: 'Difficoltà',
    dificultad_facil: 'Facile',
    dificultad_media: 'Media',
    dificultad_dificil: 'Difficile',
    precio_desde: 'A partire da',
    precio_por_equipo: '/ squadra',
    precio_gratis: 'Gratis',

    // Pagina città
    ciudad_volver: 'Tutte le città',
    ciudad_rutas_disponibles: 'Percorsi a {ciudad}',
    ciudad_ruta_cta: 'Vedi i dettagli',
    ciudad_otras_titulo: 'Altre città',
    historias_titulo: 'Storie',
    historias_subtitulo: 'Curiosità reali su ogni città, prima di metterci piede.',
    historias_volver: 'Tutte le storie',

    // Scheda del percorso
    ruta_volver: 'Torna a {ciudad}',
    ruta_todas_ciudades: 'Torna a tutte le città',
    ruta_leer_historia: 'Leggi curiosità su {ciudad}',
    ruta_zona_label: "Zona di gioco",
    ruta_punto_partida_label: 'Punto di partenza',
    ruta_muestra_title: 'Un assaggio',
    ruta_muestra_nota: 'Gli enigmi sono così. Il resto si sblocca iniziando a giocare.',
    ruta_incluye_1: "Accesso al percorso completo per 1 anno dall'acquisto",
    ruta_incluye_2: 'Sistema di indizi integrato se vi bloccate',
    ruta_incluye_3: 'Versione stampabile per chi preferisce non usare il telefono',
    ruta_incluye_4: 'Nessuna connessione necessaria una volta caricato il percorso',
    ruta_reservar_cta: 'Prenota questo percorso — {precio} € a squadra',
    ruta_jugar_gratis_cta: 'Gioca questo percorso — gratis',
    ruta_mapa_title: 'La zona di gioco',
    ruta_mapa_alt: 'Mappa antica della zona: {zona}',
    ruta_email_label: "La tua email, per inviarti l'accesso",
    ruta_email_placeholder: 'nome@esempio.com',
    ruta_condiciones_texto: 'Ho letto e accetto le {link}, inclusa la rinuncia al diritto di recesso di 14 giorni per i contenuti digitali forniti immediatamente.',
    ruta_condiciones_enlace: 'condizioni del servizio',
    ruta_idiomas_label: 'Disponibile in',
    ruta_otras_titulo: 'Altri percorsi a {ciudad}',

    // Schermata di gioco (jugar/index.html)
    juego_cargando: 'Caricamento del percorso…',
    juego_error_titulo: 'Non abbiamo trovato la tua partita',
    juego_error_texto: "Controlla il link nell'email di conferma, oppure torna alla scheda del percorso per acquistarlo.",
    juego_error_cta: 'Vedi i percorsi disponibili',
    juego_parada_de: 'Tappa {actual} di {total}',
    juego_llegada_titulo: 'Come arrivare',
    juego_enigma_titulo: "L'enigma",
    juego_input_placeholder: 'Scrivete la vostra risposta',
    juego_input_placeholder_corto: 'Lettera o numero',
    juego_btn_comprobar: 'Verifica',
    juego_btn_pista: 'Chiedi un indizio',
    juego_btn_pista_agotadas: 'Non ci sono più indizi',
    juego_pistas_titulo: 'Indizi usati',
    juego_feedback_correcto: 'Corretto!',
    juego_feedback_casi: 'Quasi... controllate la risposta, potrebbe essere un errore di battitura.',
    juego_feedback_incorrecto: 'Non è questo. Guardatevi di nuovo intorno.',
    juego_historia_titulo: 'Cosa avete appena scoperto',
    juego_saber_mas_btn: 'Scopri di più su questo luogo',
    juego_btn_siguiente: 'Tappa successiva',
    juego_btn_siguiente_final: 'Vedi il finale del percorso',
    juego_final_tiempo: 'Tempo totale: {tiempo}',
    juego_final_btn_imprimir: 'Scarica la versione stampabile',
    juego_final_btn_inicio: 'Torna a Vestigia',
    juego_offline_aviso: 'Offline: state ancora giocando con il percorso già scaricato.',

    // Versione stampabile (jugar/imprimir.html)
    imprimir_marca: 'Versione stampabile',
    imprimir_btn_print: 'Stampa / Salva come PDF',
    imprimir_llegada_label: 'Come arrivare',
    imprimir_enigma_label: "L'enigma",
    imprimir_casilla_placeholder: 'La vostra risposta:',
    imprimir_aviso_final: 'Gli indizi di ogni enigma e le curiosità "su questo luogo" sono alla fine del documento, nell\'ultima pagina.',
    imprimir_respuestas_titulo: 'Risposte e indizi',
    imprimir_respuestas_aviso: 'Non leggete questa pagina finché non siete davvero bloccati — rovinerete il percorso.',
    imprimir_respuesta_label: 'Risposta',
    imprimir_pista_label: 'Indizio {n}',
    imprimir_solucion_label: 'Soluzione',
    imprimir_historia_label: 'La storia',
    imprimir_sabermas_label: 'Su questo luogo',

    // Pagina di ringraziamento dopo il pagamento (jugar/gracias.html)
    gracias_verificando: 'Verifica del pagamento…',
    gracias_titulo: 'Grazie per il tuo acquisto!',
    gracias_texto: "Ti abbiamo inviato l'accesso via email, con un link valido un anno. Eccone anche uno diretto:",
    gracias_btn_jugar: 'Inizia a giocare',
    gracias_btn_imprimir: 'Scarica la versione stampabile',
    gracias_no_pagado_titulo: 'Il pagamento non è andato a buon fine',
    gracias_no_pagado_texto: "Se pensi si tratti di un errore, scrivici indicando il riferimento dell'ordine.",
    gracias_error_titulo: 'Qualcosa è andato storto',
    gracias_error_texto: 'Non siamo riusciti a verificare il pagamento. Se hai ricevuto un addebito, scrivici e risolviamo.',
    gracias_cta_volver: 'Torna a Vestigia',
    ruta_reservando: 'Connessione al gateway di pagamento…',
    ruta_enviando_acceso: "Invio dell'accesso alla tua email…",
    ruta_error_reserva: 'Non siamo riusciti ad avviare il pagamento. Riprova tra qualche secondo.',
    ruta_error_acceso_gratuito: "Non siamo riusciti a inviarti l'accesso. Riprova tra qualche secondo.",

    // Footer
    footer_creditos: 'Crediti fotografici',
    footer_legal_aviso: 'Note legali',
    footer_legal_privacidad: 'Privacy',
    footer_legal_condiciones: 'Condizioni',
    footer_rights: '© {year} Vestigia. Tutti i diritti riservati.',
  },
};

/** Devuelve el string de `key` en `lang`, cayendo a DEFAULT_LANG y luego a la propia key. */
export function t(lang, key) {
  const dict = DICT[lang];
  if (dict && key in dict) return dict[key];
  const fallback = DICT[DEFAULT_LANG];
  return (fallback && fallback[key]) ?? key;
}

/** Como t(), pero interpola {placeholders} con los valores de `vars`. */
export function tf(lang, key, vars = {}) {
  const raw = t(lang, key);
  return raw.replace(/\{(\w+)\}/g, (match, name) => (name in vars ? String(vars[name]) : match));
}

/**
 * Escapa un texto para insertarlo con seguridad dentro de HTML — como
 * contenido de texto o como valor de atributo entre comillas dobles. Los
 * textos del catálogo (títulos, resúmenes) se interpolan directamente en
 * plantillas `innerHTML` (tarjetaCiudad, tarjetaRuta, tarjetaHistoria); sin
 * esto, una comilla en un `alt="…"` rompería el atributo, y un "menor que"
 * se leería como el inicio de una etiqueta.
 */
export function escaparHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Recorre `root` buscando [data-i18n] (rellena textContent) y
 * [data-i18n-attr="attr:key|attr2:key2"] (rellena atributos, p. ej.
 * aria-label o placeholder). Pensado para las pantallas de juego/pago, que
 * resuelven el idioma en tiempo de ejecución en vez de generarse por build.
 */
export function aplicarI18n(root, lang) {
  const scope = root || document;
  scope.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (key) el.textContent = t(lang, key);
  });
  scope.querySelectorAll('[data-i18n-attr]').forEach((el) => {
    const spec = el.getAttribute('data-i18n-attr') || '';
    spec.split('|').forEach((pair) => {
      const [attr, key] = pair.split(':');
      if (attr && key) el.setAttribute(attr.trim(), t(lang, key.trim()));
    });
  });
}

// Debe coincidir con BASE_URL en scripts/sitio-i18n.mjs — mismo dato,
// mantenido en dos sitios porque js/ (navegador) y scripts/ (Node) no
// comparten módulo por ahora. Coincide también con SITE_URL/ALLOWED_ORIGIN
// en worker/wrangler.toml.
const BASE_URL_SITIO = 'https://vestigia.fun';

/**
 * URL a un recurso compartido (foto, mapa…) que NO se duplica por idioma.
 * `relativo` es la ruta tal como se guarda en catalogo.js (relativa a la
 * raíz del sitio, p. ej. "assets/img/x.webp"). `prefijoDesdeRaiz` es cuánto
 * hay que subir para llegar a la raíz desde ESTA página cuando NO lleva
 * prefijo de idioma ("../" desde ciudad/ruta, "" desde portada — cada
 * módulo conoce su propia profundidad, es un dato fijo del archivo, no de
 * la petición). En páginas generadas por scripts/generar-i18n.mjs
 * (con `data-idioma-pagina`) hace falta la URL absoluta en su lugar,
 * porque esas páginas viven un nivel más adentro (/en/ciudad/, /en/ruta/)
 * y el mismo "../" ya no llega a la raíz real.
 */
export function urlRecurso(relativo, prefijoDesdeRaiz = '') {
  const paginaConPrefijo = typeof document !== 'undefined' && document.documentElement.getAttribute('data-idioma-pagina');
  return paginaConPrefijo ? `${BASE_URL_SITIO}/${relativo}` : `${prefijoDesdeRaiz}${relativo}`;
}

const STORAGE_KEY = 'vestigia:idioma';

/**
 * Idioma preferido: idioma fijo de la página → localStorage → idioma del
 * navegador → DEFAULT_LANG. El "idioma fijo" lo llevan las páginas
 * generadas por scripts/generar-i18n.mjs (/en/ /fr/ /it/) en
 * `<html data-idioma-pagina="…">`, para que su contenido estático (lo que
 * ve un buscador que no ejecuta JS) y lo que pinta este mismo script en el
 * navegador sean siempre el mismo idioma — nunca depende de una
 * preferencia guardada de una visita anterior. Las páginas en español de
 * siempre (sin ese atributo) no cambian de comportamiento.
 */
export function detectarIdioma() {
  if (typeof document !== 'undefined') {
    const fijo = document.documentElement.getAttribute('data-idioma-pagina');
    if (fijo && LANGS.includes(fijo)) return fijo;
  }
  try {
    const guardado = localStorage.getItem(STORAGE_KEY);
    if (guardado && LANGS.includes(guardado)) return guardado;
  } catch {
    // localStorage inaccesible (modo privado estricto, etc.) — seguimos sin guardado.
  }
  const navegador = (typeof navigator !== 'undefined' && navigator.language) || DEFAULT_LANG;
  const corto = navegador.slice(0, 2).toLowerCase();
  return LANGS.includes(corto) ? corto : DEFAULT_LANG;
}

export function guardarIdioma(lang) {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // Sin persistencia disponible: el idioma solo dura la sesión de navegación actual.
  }
}

/**
 * Calcula la ruta de la misma página en `lang` a partir de un pathname.
 * Español no lleva prefijo; en/fr/it viven bajo /en/ /fr/ /it/ con la
 * misma estructura de carpetas que el español (ver
 * scripts/generar-i18n.mjs). Devuelve null si no hace falta navegar
 * (ya estamos en `lang` y la URL no lleva prefijo que quitar).
 */
export function urlParaIdioma(lang, pathname) {
  const segmentos = pathname.split('/');
  const idxPrefijo = segmentos.findIndex((s) => s === 'en' || s === 'fr' || s === 'it');

  if (idxPrefijo !== -1) {
    if (lang === DEFAULT_LANG) {
      segmentos.splice(idxPrefijo, 1);
    } else {
      segmentos[idxPrefijo] = lang;
    }
    return segmentos.join('/');
  }

  if (lang === DEFAULT_LANG) return null;

  const idxSeccion = segmentos.findIndex((s) => s === 'ciudad' || s === 'ruta' || s === 'historias');
  const posicion = idxSeccion !== -1 ? idxSeccion : segmentos.length - 1;
  segmentos.splice(posicion, 0, lang);
  return segmentos.join('/');
}

/** HTML de las "pastillas" de idioma — compartido con scripts/generar-i18n.mjs. */
export function selectorIdiomaHTML(lang) {
  return LANGS.map((code, i) => {
    const separador = i > 0 ? '<span class="selector-idioma__separador" aria-hidden="true">·</span>' : '';
    const activa = code === lang ? ' activa' : '';
    return `${separador}<button type="button" class="selector-idioma__opcion${activa}" data-lang="${code}" aria-pressed="${code === lang}">${code.toUpperCase()}</button>`;
  }).join('');
}

/**
 * Pinta el selector de idioma y engancha la navegación entre versiones
 * por idioma de la página actual. Compartido por portada.js, ciudad.js y
 * ruta.js (antes cada uno tenía su propia copia idéntica).
 */
export function poblarSelectorIdioma(lang) {
  const cont = document.getElementById('selector-idioma');
  if (!cont) return;
  cont.innerHTML = selectorIdiomaHTML(lang);
  cont.querySelectorAll('button').forEach((boton) => {
    boton.addEventListener('click', () => {
      const destino = boton.dataset.lang;
      guardarIdioma(destino);
      const url = urlParaIdioma(destino, location.pathname);
      if (url) {
        location.href = url + location.hash;
      } else {
        location.reload();
      }
    });
  });
}

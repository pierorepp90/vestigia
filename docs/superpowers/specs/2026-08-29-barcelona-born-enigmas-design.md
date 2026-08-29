# Revisión de enigmas — barcelona-born

Fecha: 2026-08-29

## Objetivo

Reforzar seis enigmas de la ruta `barcelona-born` y añadir un enigma 11 de
cierre. Los enigmas actuales 2 y 9 se resuelven con una observación demasiado
directa; el 7 desvela la respuesta en el enunciado; el 6/7 no aprovechan a los
bastaixos; el 8 y el 10 desperdician material que da para una segunda pregunta.
El 11 no existe: la ruta termina sin un momento que ate cabos.

## Alcance

- `worker/src/contenido/barcelona-born.{es,en,fr,it}.json` — paradas 2, 6, 7, 8,
  9, 10 y nueva parada 11.
- `js/catalogo.js` — `numParadas` de `barcelona-born`: 10 → 11.
- Sin cambios en figuras SVG (ninguna parada nueva usa figura), ni en el mapa de
  zona (es un plano esquemático, no lleva marcadores por parada).

## Restricciones (de los tests de contenido)

- Cada parada: exactamente 3 pistas, última con ≥2 palabras.
- `titulo`, `llegada`, `enigma`, `historia`, `fuente` no vacíos.
- Subpreguntas: `texto` no vacío y `respuestas` con ≥1 entrada no vacía.
- Las 4 versiones de idioma comparten numeración de paradas (1..11).
- Respuestas numéricas y de 1-2 caracteres: solo coincidencia exacta (sin
  tolerancia a erratas). El resto: Levenshtein tolerante.

## Diseño por parada (texto `es`; en/fr/it son traducción fiel)

### Parada 2 — "La cascada que cuenta una historia"

Pasa de respuesta única (color) a lectura de toda la obra: de la cuadriga
dorada de arriba a la Venus que nace del agua en el centro.

- `titulo`: "La cascada que cuenta una historia"
- `llegada`: sin cambios.
- `enigma`: "Esta cascada la diseñó Josep Fontserè en 1875, con la ayuda de un
  estudiante de arquitectura de poco más de veinte años que aún no había
  construido nada célebre: Antoni Gaudí. Pero no es un simple muro de rocas y
  chorros: es una escena mitológica entera, pensada para leerse de arriba abajo.
  En lo más alto, una figura conduce un carro tirado por caballos. En el centro,
  un gran grupo de mármol blanco: una diosa rodeada de ninfas, saliendo del
  agua. Retroceded unos pasos y miradla completa antes de responder."
- `subpreguntas`:
  1. "La diosa del grupo central de mármol, que nace del mar:" →
     `venus`, `afrodita`, `la diosa venus`
  2. "¿De qué color es el carro que corona la cascada, en lo más alto de todo?"
     → `dorado`, `dorada`, `oro`
- `pistas`:
  1. "El grupo central es uno de los temas más repetidos de la historia del
     arte: una mujer que emerge del mar (Botticelli lo pintó)."
  2. "Es la diosa del amor y la belleza; los romanos la llamaban como a un
     planeta."
  3. "Es Venus (Afrodita) naciendo del mar; y el carro de lo más alto es
     dorado."
- `historia`: "Fontserè concibió la cascada como una alegoría: en lo alto, la
  aurora en su carro dorado anuncia el día; abajo, Venus nace de las aguas.
  Amanecer y nacimiento, dos maneras de decir «principio» — un tema a la medida
  de una ciudad que en aquellos años se estaba reinventando entera. Gaudí,
  todavía estudiante, colaboró en la ingeniería hidráulica y en algún motivo
  decorativo, años antes de la Sagrada Família o el Park Güell."
- `saberMas`: sin cambios.
- Se elimina el campo `respuestas`; se añade `subpreguntas`.

### Parada 6 — "Las columnas que se pagaron a hombros"

Se quita de la `historia` la frase que dice *dónde* están tallados los
bastaixos (se traslada a la 7). Subpreguntas y enigma sin cambios.

- `historia`, última frase pasa de:
  > "En los relieves de las puertas se representa a los bastaixos cargando
  > piedra, en homenaje a la gente sin título ni fortuna que construyó,
  > literalmente con su espalda, la iglesia más querida de Barcelona."

  a:
  > "Esa desnudez elegante es un homenaje callado a la gente sin título ni
  > fortuna —comerciantes, artesanos, cargadores— que construyó, literalmente
  > con su espalda, la iglesia más querida de Barcelona."

### Parada 7 — "El otro oficio de la escalera"

Pasa a dos subpreguntas: identificar a los bastaixos (atando con la parada 6) y
qué hace el segundo hombre. Se acepta "la trabaja" y derivados.

- `titulo`: sin cambios.
- `llegada`: sin cambios.
- `enigma`: "Esta escalera lateral sube hacia el altar mayor. A ambos lados hay
  tallas de piedra con figuras humanas: a un lado, un hombre carga un bloque a
  la espalda; al otro, un segundo hombre hace algo distinto con la piedra."
- `subpreguntas`:
  1. "El hombre que carga el bloque tiene el mismo oficio que los que subieron
     toda la piedra desde Montjuïc, y que aparecen también tallados en las
     puertas de la basílica. ¿Cómo se llamaban?" →
     `bastaixos`, `bastaix`, `los bastaixos`, `estibadores`, `descargadores`,
     `cargadores`, `porteadores`
  2. "El segundo hombre, al otro lado, no la carga: ¿qué está haciendo con la
     piedra?" → `la trabaja`, `trabajarla`, `trabajar la piedra`,
     `trabajando la piedra`, `tallar piedra`, `tallando piedra`,
     `esculpir piedra`, `picar piedra`, `labrar piedra`, `cincelar piedra`,
     `cantero`, `picapedrero`, `picapedrer`
- `pistas`:
  1. "El oficio del primer hombre ya salió antes en la basílica: son los mismos
     que cargaron cada sillar desde Montjuïc."
  2. "El segundo no transporta la piedra: la transforma allí mismo, con cincel y
     martillo."
  3. "El primero es un bastaix (estibador); el segundo está tallando —trabajando—
     la piedra: es un cantero."
- `historia`: "La basílica no la levantó un solo gremio: los bastaixos cargaban
  los sillares desde Montjuïc y los picapedrers (canteros) les daban forma antes
  de colocarlos. Esa cadena de oficios anónimos quedó tallada dos veces en la
  propia iglesia: en las puertas de entrada y en esta escalera. Es el homenaje
  de la gente sin título ni fortuna que construyó, con su espalda, la iglesia
  más querida de Barcelona."
- `saberMas`: sin cambios.
- Se elimina el campo `respuestas`; se añade `subpreguntas`.

Nota: se da por buena la ubicación que ya afirmaba el contenido (talla de un
bastaix y de un segundo oficio en la escalera lateral hacia el altar mayor).

### Parada 8 — "La llama por los que no se rindieron"

Dos subpreguntas (año / tipo de persona). El poema deja de mencionarse en el
enigma y pasa a ser la primera pista.

- `enigma`: "Aquí descansan los defensores de Barcelona muertos en el asedio del
  que ya sabéis la fecha. Desde 2001 arde aquí una llama que nunca se apaga."
- `subpreguntas`:
  1. "El año de aquel asedio:" → `1714`
  2. "Un tipo de persona que, según este lugar, nunca encontraríamos enterrada
     aquí:" → `traidor`, `traïdor`, `traidores`, `un traidor`
- `pistas`:
  1. "En el suelo hay un poema grabado. Leedlo entero: una de sus palabras
     responde a la segunda pregunta."
  2. "El poema promete que aquí no yace nadie que traicione su causa o a su
     gente — lo contrario de un defensor. Y el asedio fue el mismo año que se
     conmemora cada 11 de septiembre."
  3. "El asedio fue en 1714; la palabra del poema es «traïdor» (traidor)."
- `historia`, `saberMas`: sin cambios.
- Se elimina el campo `respuestas`; se añade `subpreguntas`.

### Parada 9 — "Los nombres no son casualidad"

Título nuevo (el actual desvela la respuesta). Dos subpreguntas: qué relaciona
las calles-gremio y qué se trabajaba en l'Argenteria.

- `titulo`: "Los nombres no son casualidad"
- `llegada`: sin cambios.
- `enigma`: "Los nombres de muchas calles del Born vienen directamente de su
  época medieval. La que camináis, l'Argenteria, es una de ellas; muy cerca
  están Vidrieria, Espaseria, Mirallers, Sombrerers, Cotoners... Buscad las
  placas y fijaos en lo que significan."
- `subpreguntas`:
  1. "¿Qué tienen en común todas esas calles? ¿Qué las relaciona?" →
     `gremio`, `gremios`, `los gremios`, `oficios`, `los oficios`, `trabajos`
  2. "Traducid «Argenteria»: ¿qué artesanos trabajaban y vendían en esta
     calle?" → `plateros`, `orfebres`, `plata`, `los plateros`,
     `trabajaban la plata`
- `pistas`:
  1. "Probad a traducir los nombres del catalán: Vidrieria, Espaseria,
     Sombrerers..."
  2. "Cada calle llevaba el nombre del grupo de artesanos del mismo _______ que
     se agrupaba allí para trabajar y vender."
  3. "Las relaciona el gremio (el oficio). «Argent» es plata: en esta calle
     estaban los plateros."
- `historia`, `saberMas`: sin cambios.
- Se elimina el campo `respuestas`; se añade `subpreguntas`.

### Parada 10 — "Varios palacios para un solo pintor"

Dos subpreguntas: cuántas casas y en qué siglo la fachada intrusa. El enigma
deja de decir "cinco".

- `enigma`: "El museo ocupa varias casas nobles unidas entre los números 15 y 23
  del carrer Montcada. Contadlas mientras camináis: casi todas son palacios
  medievales (siglos XIII-XV), pero una de las fachadas se construyó mucho
  después, sobre los restos de una villa romana."
- `subpreguntas`:
  1. "¿Cuántas casas nobles unidas forman el museo?" → `5`, `cinco`
  2. "¿En qué siglo se construyó la fachada que no encaja con las demás?" →
     `siglo xviii`, `xviii`, `18`, `dieciocho`, `el siglo xviii`
- `pistas`:
  1. "Hay un portal por cada casa entre el número 15 y el 23 — contadlos."
  2. "Las fachadas medievales tienen arcos apuntados y ventanas góticas; una no
     encaja: es la más reciente, sobre cimientos romanos."
  3. "Son 5 casas; la que no encaja es del siglo XVIII (la Casa Mauri, número
     21)."
- `historia`, `saberMas`: sin cambios.
- Se elimina el campo `respuestas`; se añade `subpreguntas`.

### Parada 11 (nueva) — "El barrio que empezasteis pisando"

Cierre reflexivo, sin desplazamiento. Ata el principio y el final: el Parc de la
Ciutadella (paradas 2-3) es la fortaleza levantada sobre la Ribera arrasada en
1714 (paradas 4 y 8), y en esos terrenos se hizo la Exposición de 1888 cuya
puerta es el Arc de Triomf (parada 1).

- `n`: 11
- `titulo`: "El barrio que empezasteis pisando"
- `llegada`: "No hace falta que os mováis. Quedaos donde estéis y recordad todo
  el recorrido, desde el arco del principio."
- `enigma`: "Empezasteis cruzando un arco que no celebra ninguna batalla, dentro
  de un parque enorme. Habéis terminado en un barrio que una batalla borró del
  mapa en 1714. Las dos cosas están unidas: sobre las casas arrasadas de la
  Ribera, el rey mandó levantar algo para vigilar a la propia ciudad. Un siglo y
  medio después se derribó, y en su lugar quedó justo aquello por donde
  paseasteis esta mañana."
- `subpreguntas`:
  1. "¿Qué se construyó sobre el barrio destruido?" → `la ciudadela`,
     `ciudadela`, `la ciutadella`, `ciutadella`, `una fortaleza`, `fortaleza`,
     `un fuerte`, `la fortaleza militar`
  2. "Ya sin fortaleza, en 1888 esos terrenos acogieron un gran evento cuya
     puerta fue el arco donde empezasteis. ¿Cuál?" → `la exposición universal`,
     `exposición universal`, `la expo`, `exposición universal de 1888`,
     `exposición de 1888`
- `pistas`:
  1. "Piensa en el nombre del parque donde estaban la cascada y los medallones
     de Gaudí."
  2. "Era una fortaleza en forma de estrella, hecha no para defender la ciudad
     de enemigos de fuera, sino para tenerla sometida; fue tan odiada que la
     ciudad la demolió en cuanto pudo."
  3. "Se construyó la Ciutadella; hoy es el Parc de la Ciutadella, donde
     empezasteis, y en 1888 acogió la Exposición Universal."
- `historia`: "El Born cuenta en tres siglos la misma historia dos veces: un
  barrio que se pagó a pulso una basílica piedra a piedra, y que pagó también
  —con su desaparición— haber estado en el bando perdedor. La fortaleza del
  castigo acabó siendo un jardín. Habéis caminado el círculo entero: del parque
  que fue castigo al barrio que fue castigado."
- `fuente`: "El Born Centre de Cultura i Memòria; Ajuntament de Barcelona — Parc
  de la Ciutadella"
- `saberMas`: "La Ciutadella, odiada como símbolo de la ocupación borbónica, se
  cedió a la ciudad en 1869 y se derribó en su mayor parte por impulso del
  general Prim. Los terrenos se convirtieron en el parque que acogió la
  Exposición Universal de 1888 — la misma para la que se levantó el Arc de
  Triomf— y de aquella cita quedaron la cascada, los edificios del actual museo
  de ciencias naturales y el trazado de jardín que se pasea hoy."
- Sin `figuraId`.

## Notas de traducción (en/fr/it)

- Parada 2: "aurora" → dawn / l'aurore / l'aurora. Mantener el juego
  "principio / beginning / commencement / principio". Venus → Venus / Vénus /
  Venere; añadir variantes locales de respuesta (`venere`, `vénus`).
- Parada 7 sub 1: aceptar `bastaixos`/`bastaix` en los cuatro idiomas más el
  término local (`estibadores` / `dockers` / `débardeurs` / `scaricatori`).
- Parada 9: el título traducido tampoco debe desvelar la respuesta. Pista 2
  conserva el hueco `_______`. Sub 2 acepta el metal y el oficio en cada idioma.
- Parada 11 sub 2: aceptar "Exposición Universal" / "Universal Exposition" /
  "Exposition universelle" / "Esposizione Universale" y variantes con 1888.
- Parada 11: en it/en/fr, "Ciutadella" se mantiene en catalán como en el resto
  del contenido; aceptar también la forma local (`cittadella`, `citadel`,
  `citadelle`).

## Verificación

- `npm test` (o el runner del proyecto) — en especial `tests/contenido.test.js`
  y `worker/tests/contenido.test.js`.
- Revisar a mano la ficha de ruta y el flujo de juego de `barcelona-born` en los
  cuatro idiomas (recuento de paradas, render de subpreguntas de la 11).

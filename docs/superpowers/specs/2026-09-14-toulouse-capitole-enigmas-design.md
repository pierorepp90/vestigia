# Revisión de enigmas — toulouse-capitole

Fecha: 2026-09-14

## Objetivo

Dar a la ruta `toulouse-capitole` un enigma integral: cada parada termina en
**una letra**, y las nueve letras, **ordenadas por la fecha** que cada parada
trae en su enunciado o su historia, deletrean **LANGUEDOC** — el nombre
histórico de toda la región, "la lengua de oc". Se añade una parada 10 de
cierre que pide justamente esa ordenación, y una parada 5 nueva (el oro de la
Tolosa romana) para que la palabra tenga sitio.

Los enigmas de partida se resolvían casi todos con una observación directa
(contar columnas, identificar una figura, leer un material). Ahora el
enunciado plantea la situación pero **no explica el método** (contar letras,
pasarlas a número, mirar la posición en un nombre propio, leer una forma como
letra, convertir un número a cifra romana…); el método se descubre con lo que
hay físicamente en el sitio y se destraba con las pistas. Escape room difícil.

## Alcance

- `worker/src/contenido/toulouse-capitole.{es,en,fr,it}.json` — las 8 paradas
  existentes reescritas (todas pasan a `subpreguntas`), una parada nueva (el
  Musée Saint-Raymond) intercalada como parada 5, y una parada de cierre nueva.
  Total: 8 → 10.
- `js/catalogo.js` — `toulouse-capitole`: `numParadas` 8 → 10; `duracionMin`
  120 → 135 (parada real nueva + cierre sin desplazamiento); `resumen` (museo
  romano + "unos 3 km") en los 4 idiomas. `acertijoMuestra` sin cambios (sigue
  siendo un acertijo autónomo válido, no ligado a las subpreguntas actuales).
- Sin cambios en `js/juego/figuras.js`. Ojo con las compartidas: `cruces`
  también la usa `berlin-mitte`, `arcos-mitrado` también `barcelona-raval`
  (parada 4, arco de medio punto = A) y `bovedas` también `valencia-carmen`;
  ninguna de las tres cambia de forma ni de respuesta. `campanarios` sigue
  siendo exclusiva de esta ruta.
- Sin cambios en `js/recomendaciones.js`.

## Restricciones (de los tests de contenido)

- Cada parada: exactamente 3 pistas, la última con ≥2 palabras.
- `titulo`, `llegada`, `enigma`, `historia`, `fuente` no vacíos.
- Subpreguntas: `texto` no vacío y `respuestas` con ≥1 entrada no vacía.
- Las 4 versiones de idioma comparten numeración de paradas (1..10).
- Motor de respuestas: números y respuestas de 1-2 caracteres → solo
  coincidencia exacta (las letras `c/e/a/u/l/n/g/o/d` entran aquí); 3+
  caracteres → Levenshtein tolerante.

## Mapa letra / fecha

| # | Parada (título es) | Letra | Año | Mecánica |
|---|---|---|---|---|
| 1 | La rueda de bronce | **C** | 1995 | 3 pommettes por brazo de la cruz occitana (figura `cruces`, D) → 3ª letra A–Z |
| 2 | El falso Capitolio | **E** | 1522 | 8 columnas = 8 letras de CAPITOLE (nombre real del edificio) → 8ª (última) letra |
| 3 | El nombre del toro | **A** | 250 | Saturnino, primer obispo de Toulouse → puesto 1 en la lista → 1ª letra A–Z |
| 4 | Cinco pisos, dos épocas | **U** | 1478 | cambio de estilo en el 4º piso (figura `arcos-mitrado`, A→C) → 4ª letra de SATURNINO |
| 5 | El oro maldito de Tolosa *(nueva)* | **L** | 106 a.C. | "l'or de Toulouse" (dicho francés) → la "l" elidida pegada al oro |
| 6 | La puerta que prometía reliquias | **N** | 1354 | 12 apóstoles + 2 llaves de San Pedro = 14 → 14ª letra (abecedario de 26) |
| 7 | Todo el techo sobre una columna | **G** | 1369 | deducir el estilo de la bóveda "palmera" (figura `bovedas`, C) = gótico → inicial |
| 8 | La fuente que no debería estar aquí | **O** | 1870 | el anillo que cierran las 4 cariátides sobre la cúpula = forma de la letra |
| 9 | El único superviviente | **D** | 1525 | 500 años en 2025 (1525→2025) → numeral romano de 500 |
| 10 | Nueve piedras, un solo nombre | — | — | cierre: ordenar las 9 letras por año → LANGUEDOC |

Orden de ruta: C·E·A·U·L·N·G·O·D — no forma nada. Orden por fecha: 106 a.C. L ·
250 A · 1354 N · 1369 G · 1478 U · 1522 E · 1525 D · 1870 O · 1995 C →
**LANGUEDOC**.

Nota de geografía: la parada 5 hace circular la ruta alrededor de la basílica
de Saint-Sernin (se llega por el flanco sur para ver el campanario, se rodea
por el ábside hasta la esquina noroeste para el museo, y se vuelve a rodear
por el sur hasta la Porte Miégeville) — un bucle de unos 5 minutos, sin entrar
al museo (el enigma se resuelve desde la fachada).

## Diseño por parada (texto `es`; en/fr/it son traducción fiel)

Todas las paradas 1-9 pasan a `subpreguntas`, con la última subpregunta
siempre "La letra de esta parada:". La 3.ª pista ("Solución") resuelve todas
las subpreguntas de la parada.

### Parada 1 — "La rueda de bronce" (C · 1995)

Título nuevo (el anterior, "La cruz que mide el año", adelantaba que había que
contar algo en la cruz). El enigma mantiene la identificación de la cruz
occitana entre 4 (figura `cruces`) pero ya no dice "contad las bolitas y
sacad una letra": describe cómo terminan los brazos y deja que las pistas
destapen el conteo. Subpreguntas: cruz (d), esferas por brazo (3), letra (c).
Mecánica: 3 pommettes por brazo → 3ª letra del abecedario → C.

### Parada 2 — "El falso Capitolio" (E · 1522)

Título nuevo (antes "Los capitouls de mármol", cantaba el tema). El enigma
anterior era "contad las columnas" a secas; ahora el conteo (8) es solo el
primer paso: hay que llevarlo al nombre real del edificio, Capitole (el de la
plaza, no CAPITOLIUM, la palabra dorada que en 1522 un escribano copió del
Capitolio romano para inventar un origen falso). Subpreguntas: columnas (8),
letra (e). Mecánica: 8 columnas = 8 letras de CAPITOLE → 8ª (última) letra → E.

### Parada 3 — "El nombre del toro" (A · 250)

Título nuevo (antes "Una iglesia con forma de fortaleza", desvelaba la
mecánica de identificar el campanario). Se mantiene la identificación del
clocher-mur (figura `campanarios`, B), pero la letra ya no sale de ahí: sale
de que Saturnino fue el **primer** obispo de Toulouse, cabeza de una lista de
prelados que llega hasta hoy. Se añade una frase a la `historia` ("de aquel
primer obispo arranca una sucesión ininterrumpida... diecisiete siglos") para
sostener la idea de "lista". Subpreguntas: campanario (b), letra (a).
Mecánica: primero de la lista = 1 → 1ª letra → A.

### Parada 4 — "Cinco pisos, dos épocas" (U · 1478)

Título nuevo (antes "La torre que cambia de estilo", cantaba el tema). Se
mantienen las tres subpreguntas ya existentes (remate románico A, remate
gótico C, piso del cambio = 4; figura `arcos-mitrado`) y se añade la letra: el
santo al que está dedicada la basílica —"Sernin" es la forma corta de
Saturnino— esconde la letra en su nombre completo. Mecánica: cambio en el 4º
piso → 4ª letra de SATURNINO (S-A-T-**U**-R-N-I-N-O) → U. Funciona igual en
es/en/fr/it porque las cuatro formas del nombre (Saturnino/Saturninus/
Saturnin/Saturnino) empiezan por SATU-.

### Parada 5 (nueva) — "El oro maldito de Tolosa" (L · 106 a.C.)

Parada nueva, sin figura, en el Musée Saint-Raymond (esquina noroeste de la
Place Saint-Sernin; enigma resoluble desde fuera). Cuenta la leyenda real del
*aurum Tolosanum*: el tesoro sagrado de los volcos tectósages, saqueado por el
cónsul Cepión en 106 a.C., perdido en una emboscada, y el dicho latino *aurum
Tolosanum habet* que recoge Aulo Gelio. La letra sale de un dicho **francés**
que sigue vivo hoy, *l'or de Toulouse* (el oro que arruina a quien lo toca):
la "l" elidida, pegada al oro, es la letra de la parada — se cita literalmente
en francés en los 4 idiomas, como el "BIBLIOTECA" de `barcelona-raval`.
Subpreguntas: nombre romano de la ciudad (Tolosa), qué se llevó Cepión (el
oro/el tesoro), letra (l). El `saberMas` conecta el museo con Viollet-le-Duc,
el arquitecto que también remata el Donjon de la parada 9 (cohesión).

### Parada 6 — "La puerta que prometía reliquias" (N · 1354)

Título nuevo (antes "Doce testigos de piedra", regalaba el "doce"). El
enigma anterior era una identificación directa ("¿qué apóstol es?"); ahora
identificar a San Pedro es el primer paso de una suma. Subpreguntas: apóstoles
en el dintel (12), apóstol de las llaves (San Pedro), letra (n). Mecánica: 12
apóstoles + 2 llaves = 14 → 14ª letra del abecedario internacional de 26
letras → N. Pista 1 guiña a la parada 1 ("los mismos doce que rodeaban la cruz
del suelo").

### Parada 7 — "Todo el techo sobre una columna" (G · 1369)

Título nuevo (antes "El techo que corona la cabecera"). Se mantienen las dos
subpreguntas de observación (bóveda = C, "la palmera"; nervios = 22; figura
`bovedas`) y se añade la letra, que no sale de un número sino de **deducir el
estilo**: la enunciado obliga a comparar con el románico visto en la parada 4
y a nombrar el gótico —palabra que empieza igual en las 4 lenguas de la
ruta— para tomar su inicial. Mecánica: gótico/gothic/gothique/gotico → G.

### Parada 8 — "La fuente que no debería estar aquí" (O · 1870)

Título sin cambios. El enigma anterior era "contad las cariátides" a secas;
ahora el conteo (4) queda como subpregunta aparte y la letra sale de mirar la
**forma** que las cuatro cariátides cierran sobre sus cabezas (un círculo
cerrado = la letra O), no de un número. El año que ancla la parada pasa de
1762 (ejecución de Jean Calas, que se queda en la `historia` como dato
secundario) a **1870** (el año en que Wallace regaló el modelo a París, ya
presente en el enunciado) para que el año y la mecánica hablen de lo mismo.
Subpreguntas: cariátides (4), nombre de las figuras (cariátides), letra (o).

### Parada 9 — "El único superviviente" (D · 1525)

Título sin cambios. El enigma anterior era "¿de qué material es el remate?"
a secas; ahora ese material (pizarra) queda como subpregunta y la letra sale
de una cuenta: 2025 − 1525 = 500, y el número romano para 500 es D.
Subpreguntas: material del remate (pizarra), años cumplidos en 2025 (500),
letra (d). La `historia` ya describía el escudo con la cruz de la parada 1, el
cordero, el castillo desaparecido y la basílica de dos torres — se mantiene
igual, como preparación directa del cierre.

### Parada 10 (nueva) — "Nueve piedras, un solo nombre" (cierre)

Sin desplazamiento. `respuestas: ["languedoc", "el languedoc", "le
languedoc", "lenguadoc", "langue d'oc", "langue d oc", "langue doc",
"lengadoc", "lenga d'oc"]` (variantes equivalentes en en/fr; en it se añaden
además `"linguadoca"` y `"la linguadoca"`, el exónimo italiano tradicional).
Enigma: "nueve paradas, nueve letras, nueve fechas... hay una manera de
ordenarlas y darles sentido". Pistas: 1 = ordenar por año; 2 = las 9 letras
con su año **en orden de ruta** (no de fecha, para no regalarlo); 3 = orden
por fecha → LANGUEDOC. Historia + saberMas: el arco Tolosa → Toulouse → el
condado de la cruz → el Languedoc, y la etimología de *òc* (< lat. *hoc*)
frente a *oïl* (< *hoc ille* → *oui*), con el dato de que "Languedoc" aparece
documentado hacia 1290. `final.texto` reescrito para rematar sobre LANGUEDOC.

## Notas de traducción (en/fr/it)

Las mecánicas de las paradas 3, 5, 7, 8 y 9 portan solas: son ordinales,
juego bilingüe citado literalmente, deducción de estilo con palabra que
empieza igual en las 4 lenguas, lectura de una forma como letra, o numeral
romano — ninguna depende del alfabeto ni de una palabra que se traduce. Cuatro
puntos fijados a mano:

- **Parada 2 (CAPITOLE):** el nombre real del edificio, "Capitole" (el de la
  plaza), es idéntico en los 4 idiomas — es un nombre propio francés que
  ninguna versión traduce (en las 4 el punto de partida se llama "Place du
  Capitole"). 8 letras, 8ª = E, en cualquier idioma.
- **Parada 4 (SATURNINO/SATURNINUS/SATURNIN/SATURNINO):** las 4 formas del
  nombre del santo empiezan por SATU-, así que la 4ª letra es **U** en los 4
  idiomas. Se fija explícitamente en la pista 3 de cada versión (con la
  ortografía local del nombre) para que no quede ambigüedad.
- **Parada 6 (crítica en it):** "12 + 2 = 14 → N" exige fijar el abecedario
  como "internacional de 26 letras" en las 4 pistas; en it se dice explícito
  *"alfabeto internazionale di 26 lettere"* — con el alfabeto italiano nativo
  de 21 letras, la posición 14 daría P, no N.
- **Parada 10 (la palabra meta):** LANGUEDOC es un topónimo francés/occitano
  que se escribe igual en español, inglés y francés. En **italiano** el
  exónimo tradicional es **Linguadoca** (así lo usa ya la `historia` de la
  parada 4 en la versión it: "i campanili di mattoni della Linguadoca"), así
  que la pista "Solución" y el enigma de cierre en it dan siempre la forma
  francesa **LANGUEDOC** (9 letras, las que se han ido ganando) y el
  `saberMas` aclara aparte que el nombre italiano es Linguadoca; `linguadoca`
  se acepta también como respuesta por generosidad, pero no es la que
  deletrean las 9 letras.

## Verificación

- `node --test` (raíz): 218/218. `node --test` en `worker/`: 141/141. Sin
  fallos ajenos a esta ruta en el momento de cerrarla.
- Script de verificación propio (`evaluarRespuesta`/`evaluarSubpreguntas`
  reales de `js/juego/respuestas.js`): para los 4 idiomas, las 9 derivaciones
  de letra en orden de ruta dan CEAULNGOD, y ordenadas por fecha
  (106 a.C./250/1354/1369/1478/1522/1525/1870/1995) deletrean LANGUEDOC;
  todas las variantes de respuesta de cada subpregunta (incluida la parada de
  cierre, con la propia palabra derivada en minúsculas) evalúan `correcto`.
- El contenido `*.json` viaja en el `wrangler deploy` del Worker (gitignore);
  a `master` solo van `js/catalogo.js` y este spec.

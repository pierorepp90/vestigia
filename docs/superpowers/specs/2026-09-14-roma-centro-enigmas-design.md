# Revisión de enigmas — roma-centro

Fecha: 2026-09-14

## Objetivo

Dar a la ruta `roma-centro` un enigma integral: cada parada termina en **una
letra**, y las ocho letras, **ordenadas por la fecha** que cada parada trae en
su enunciado, deletrean **VESTIGIA** — latín, "las huellas, los rastros que
deja algo al pasar", y el nombre del propio juego. Se añade una parada 9 de
cierre que pide justamente esa ordenación.

Los ocho enigmas de partida se resolvían casi todos con una observación
directa (leer un año en un pedestal, identificar un animal o una planta).
Ahora el enunciado plantea la situación pero **no explica el método** (contar
columnas y sumarlas, leer un número romano como letras, tomar la posición N de
una palabra…); el método se descubre con lo que hay físicamente en el sitio y
se destraba con las pistas. Escape room difícil.

## Alcance

- `worker/src/contenido/roma-centro.{es,en,fr,it}.json` — las 8 paradas
  reescritas (todas pasan a `subpreguntas`) y una parada 9 nueva. Total: 9.
- `js/catalogo.js` — `roma-centro`: `numParadas` 8 → 9; `duracionMin`
  120 → 125; `resumen` "Ocho/Eight/Huit/Otto enigmas…" → "Nueve/Nine/Neuf/Nove…"
  en los 4 idiomas.
- Sin cambios en `js/juego/figuras.js`: la parada 1 sigue usando `capiteles`
  (compartida con `barcelona-gotic`, sin tocar) y la parada 3 sigue usando
  `plantas-plaza` (solo de esta ruta).
- Sin cambios en `js/recomendaciones.js` (no depende del número de paradas).
- Sin cambios en `acertijoMuestra` (sigue siendo válido: la parada 1 conserva
  la subpregunta "veces cónsul = 3" que ya usaba el acertijo de muestra).

## Restricciones (de los tests de contenido)

- Cada parada: exactamente 3 pistas, la última con ≥2 palabras.
- `titulo`, `llegada`, `enigma`, `historia`, `fuente` no vacíos.
- Subpreguntas: `texto` no vacío y `respuestas` con ≥1 entrada no vacía.
- Las 4 versiones de idioma comparten numeración de paradas (1..9).
- Motor de respuestas: números y respuestas de 1-2 caracteres (las letras
  `s/a/e/i/t/v/g` entran aquí) → solo coincidencia exacta; 3+ caracteres →
  Levenshtein tolerante.

## Mapa letra / fecha

| # | Parada (título es) | Letra | Fecha (del enunciado) | Mecánica |
|---|---|---|---|---|
| 1 | El edificio que miente sobre su nombre | **S** | 118-125 d.C. | 16 columnas del pórtico + 3 (TERTIVM, consulados) = 19 → 19.ª letra A–Z |
| 2 | El animal que sostiene la sabiduría | **A** | 1667 | la inscripción llama al elefante "el más fuerte de los animales" → rango 1 → 1.ª letra del abecedario |
| 3 | Neptuno contra el mar | **E** | ~86 d.C. (estadio de Domiciano) | planta de la plaza = figura B (2.ª opción) → 2.ª letra de NEPTVNO/Neptune/Nettuno |
| 4 | El río sin cabeza | **I** | 1651 | "Fontana dei Quattro Fiumi" → 4 = IV → primer signo |
| 5 | La estatua que hablaba | **T** | 1501 | de la estatua solo queda un TORSO/torso/torse → inicial |
| 6 | Los templos que fueron testigos de un crimen | **V** | 44 a.C. (idus de marzo) | idus de marzo = día 15 = XV → último signo |
| 7 | Las flores de mármol | **G** | 1626 | el lirio de los Farnese, en italiano GIGLIO → inicial |
| 8 | Donde ardió el hereje | **I** | 1600 (la hoguera; el pedestal es de 1889) | pedestal "IX GIUGNO…" → IX = 9 → 9.ª letra A–Z |
| 9 | Lo que pone el tiempo en orden | — | — | cierre: ordenar las 8 letras por fecha → VESTIGIA |

Orden de ruta: S·A·E·I·T·V·G·I (no forma nada). Orden por fecha: 44 a.C. V ·
86 d.C. E · 118 d.C. S · 1501 T · 1600 I · 1626 G · 1651 I · 1667 A →
**VESTIGIA**.

Dos paradas dan **I** (la 4 y la 8), como en `barcelona-raval` con la O/I.

Familias de operación usadas, sin repetir dos veces seguidas: (1) conteo +
suma → A1Z26; (2) pensamiento lateral → 1.ª letra; (3) geometría/figura +
posición en palabra; (4) número romano leído como letra; (5) inicial de un
nombre común; (6) número romano leído como letra (número distinto: XV en vez
de IV, para no repetir la 4); (7) inicial (nombre local del emblema); (8)
número romano → número → A1Z26.

## Diseño por parada (texto `es`; en/fr/it son traducción fiel)

Todas las paradas 1-8 pasan de `respuestas` única (paradas 2, 4, 5, 6, 7, 8) o
de `subpreguntas` sin letra (paradas 1, 3) a `subpreguntas` con la última
subpregunta siempre "La letra de esta parada:". La 3.ª pista ("Solución")
resuelve todas las subpreguntas de la parada.

### Parada 1 — "El edificio que miente sobre su nombre" (S · 118-125 d.C.)

- Enigma: la inscripción de Agripa en el pórtico del Panteón; pide contar
  **todas** las columnas (no solo las 8 de la fachada) y volver a la palabra
  TERTIVM del latín.
- Subpreguntas: capitel (`c`, figura `capiteles`) · columnas totales (`16`) ·
  veces cónsul (`3`) · letra (`s`).
- Pistas: 1 da capitel + 8+8=16; 2 pide sumar 16+3 y contar sobre el
  abecedario de 26 letras; 3 = solución completa, 16+3=19→S.
- `figuraId: "capiteles"` sin cambios.

### Parada 2 — "El animal que sostiene la sabiduría" (A · 1667)

- Enigma: la inscripción de la base ("BELLVARVM FORTISSIMO") dice que el
  elefante es el más fuerte de los animales; pide averiguar en qué puesto
  queda.
- Subpreguntas: animal (`elefante`) · puesto por fuerza (`1`/`primero`) ·
  letra (`a`).
- Pistas: 1 cita la inscripción; 2 traduce "el primero" a "1.ª posición del
  abecedario"; 3 = solución.

### Parada 3 — "Neptuno contra el mar" (E · ~86 d.C.)

- Enigma: el estadio de Domiciano bajo la plaza (hacia el 86 d.C.); pide mirar
  los dos extremos (recto/curvo) y fijarse en el nombre del dios de la
  fuente.
- Subpreguntas: planta (`b`, figura `plantas-plaza`) · criatura (`pulpo`) ·
  dios (`neptuno`) · letra (`e`).
- Pistas: 1 da la planta B; 2 indica "B = 2.ª opción → 2.ª letra del dios"; 3 =
  solución, Neptuno[2] = E.
- `figuraId: "plantas-plaza"` sin cambios (solo la usa esta ruta).

### Parada 4 — "El río sin cabeza" (I · 1651)

- Título de despiste a propósito: el jugador se fija en el Nilo velado, pero
  la letra sale del nombre de la fuente ("Quattro Fiumi" → 4 → IV → I).
- Subpreguntas: río velado (`nilo`) · número de la fuente (`4`) · letra (`i`).
- Pistas: 1 aparta los ríos y señala "cuatro"; 2 da IV y dice "quedaos con el
  primero"; 3 = solución + guiño a la V que reaparece en la parada 6.

### Parada 5 — "La estatua que hablaba" (T · 1501)

- La `llegada` ya no dice "torso": describe "un bloque de mármol muy
  erosionado" para no regalar la palabra.
- Subpreguntas: nombre de los papeles satíricos (`pasquinadas`) · parte del
  cuerpo que sobrevive, en una palabra (`torso`) · letra (`t`).
- Pistas: 1 hace deducir "torso" describiendo lo que falta (cabeza, brazos,
  piernas); 2 dice que basta la inicial; 3 = solución.

### Parada 6 — "Los templos que fueron testigos de un crimen" (V · 44 a.C.)

- Enigma: los cuatro templos A-B-C-D y el asesinato de César en los idus de
  marzo; pide averiguar qué día del mes son los idus y escribirlo en cifras
  romanas.
- Subpreguntas: templo circular (`b`) · día de los idus (`15`) · letra (`v`).
- Pistas: 1 da el día 15; 2 da XV y dice "quedaos con el último signo"; 3 =
  solución.
- Sin `figuraId` (como en el original).

### Parada 7 — "Las flores de mármol" (G · 1626)

- Enigma: las dos fuentes gemelas de granito de Caracalla, coronadas en 1626
  por Girolamo Rainaldi con el emblema Farnese; pide decir la flor "como la
  dice esta ciudad" (en italiano).
- Subpreguntas: flor (`lirio`/`flor de lis`) · esa flor en italiano
  (`giglio`) · letra (`g`).
- Pistas: 1 identifica la flor de lis; 2 da "giglio" y dice que la letra es su
  inicial; 3 = solución.
- Alternativa de diseño no usada: inicial de **Girolamo** Rainaldi (nombre
  propio, no depende del italiano) — queda anotada por si se quiere blindar
  más el mecanismo en el futuro. En `it`, la parada usa una segunda
  subpregunta distinta (quién coronó las fuentes) ya que el nombre "giglio"
  es nativo del idioma; ver notas de traducción.

### Parada 8 — "Donde ardió el hereje" (I · 1600)

- Enigma: Giordano Bruno, quemado en 1600; el pedestal es de 1889
  (IX GIUGNO MDCCCLXXXIX). Pide descifrar día y año; el año es del monumento,
  el día (IX) lleva la letra.
- Subpreguntas: año del pedestal (`1889`) · día del mes (`9`) · letra (`i`).
- Pistas: 1 descompone MDCCCLXXXIX = 1889 y separa el IX; 2 dice "IX=9,
  contad hasta la 9.ª letra"; 3 = solución.
- **Nota de diseño importante**: la fecha de *ordenación* de esta parada para
  el cierre es **1600** (la hoguera, mencionada primero y con más peso
  narrativo en el enunciado), no 1889 (el año del pedestal, que solo alimenta
  la mecánica de la letra). La parada 9 lo aclara explícitamente en su pista 2
  para que no haya ambigüedad.

### Parada 9 (nueva) — "Lo que pone el tiempo en orden" (cierre)

- Sin desplazamiento, junto a la estatua de Bruno.
- `respuestas`: `["vestigia", "vestigios", "vestigio", "vestige", "vestiges", ...]`
  (variantes por idioma, ver notas de traducción).
- Enigma: da las 8 letras en **orden de ruta** (S,A,E,I,T,V,G,I) y pide
  ordenarlas por la fecha de cada parada.
- Pistas: 1 = ordenar por año, los "a.C." primero; 2 = las 8 letras con su año
  **en orden de ruta** (no de fecha, para no regalarlo); 3 = orden por fecha →
  VESTIGIA, con la traducción latina.
- `historia` + `saberMas`: etimología de *vestigium* (huella, planta del pie)
  y *vestigare* → *investigare* → "investigar"; cierre reflexivo que ata las
  ocho paradas y nombra el juego.
- `final.texto` reescrito para rematar sobre VESTIGIA.

## Notas de traducción (en/fr/it)

Las mecánicas 3, 4, 5 y 8 portan solas o casi solas (nombres propios/latinos,
o palabras cuya letra relevante coincide en los 4 idiomas). Puntos fijados a
mano:

- **Parada 1 (crítico en it):** las pistas fijan "abecedario internacional de
  26 letras (cifrario A1Z26), A=1" en los 4 idiomas. En **it** se dice
  explícito *"alfabeto internazionale di 26 lettere, cifrario A1Z26"* — con
  el alfabeto italiano de 21 letras, la posición 19 daría **U**, no S.
- **Parada 3:** Neptuno/Neptune/Neptune/Nettuno → la 2.ª letra es **E** en los
  4 idiomas (no se traduce el nombre del dios, es prácticamente el mismo).
- **Parada 4:** "Quattro"/"Four"/"Quatre"/"Quattro" → **IV** en números
  romanos en los 4 (los números romanos no se traducen); primer signo = I en
  los 4.
- **Parada 5:** torso (es/it/en) / torse (fr) → inicial **T** en los 4.
  Pasquinadas/pasquinades/pasquinate: variantes locales aceptadas.
- **Parada 6:** los idus de marzo = 15 en los 4 calendarios; XV → **V** en
  los 4 (números romanos, no se traducen).
- **Parada 7 (adaptado por idioma):** la palabra meta de esta parada es
  **"giglio", nombre italiano**, no traducible a G en es/en/fr (lirio, lily,
  lys). Las 4 versiones piden explícitamente "decidlo como lo dice esta
  ciudad / say it the way this city says it / dites-la comme la dit cette
  ville", y en **it**, donde "giglio" ya es la palabra nativa, la 2.ª
  subpregunta cambia a "¿quién coronó las fuentes en 1626?" (Girolamo
  Rainaldi) para no ser trivial. G es la 7.ª letra tanto en el alfabeto de 26
  como en el italiano de 21, así que no hay trampa de alfabeto si en el
  futuro se prefiere la alternativa "inicial de Girolamo".
- **Parada 8:** IX = 9 en los 4 (números romanos); I es la 9.ª letra en el
  alfabeto de 26 y en el italiano de 21 → sin trampa aunque se cuente en
  cualquiera de los dos.
- **Parada 9 (la palabra meta):** la respuesta es **VESTIGIA, palabra
  latina**, idéntica en los 4 idiomas — no hace falta presentarla como
  "palabra española" (a diferencia de HISTORIA en `barcelona-raval`). Se
  aceptan variantes locales de la familia léxica: `vestigios/vestigio` (es),
  `vestige/vestiges` (en/fr), `vestigi/vestigio` (it). Las 8 letras y las 8
  mecánicas son idénticas en los 4 idiomas.

## Verificación

- `node --test` (raíz): 216/218 — los 2 fallos son de `florencia-santacroce`
  (contenido con una parada de más en `en` respecto a `catalogo.js` y a
  `fr`/`it`/`es`; ruta todavía pendiente de revisión, no tocada en este
  trabajo, preexistente a esta sesión).
- `tests/contenido.test.js` en solitario: 7/9 (mismos 2 fallos ajenos a
  `roma-centro`).
- `node --test` en `worker/`: 141/141.
- Script de comprobación ad-hoc (fuera del repo, en el scratchpad de la
  sesión): confirma en los 4 idiomas que (a) `catalogo.js` declara 9 paradas y
  125 min; (b) las 8 letras de las paradas 1-8 son exactamente
  S,A,E,I,T,V,G,I y `evaluarRespuesta` las acepta en minúscula y mayúscula y
  rechaza una letra distinta; (c) el orden por fecha da "vestigia"; (d) la
  parada 9 acepta "vestigia"/"VESTIGIA" y rechaza "historia"; (e)
  `evaluarSubpreguntas` con el combo de respuestas canónicas de cada parada
  (en el idioma correspondiente) resuelve la parada completa.
- El contenido `*.json` viaja en el `wrangler deploy` del Worker (gitignore);
  a `master` solo van `js/catalogo.js` y este spec.

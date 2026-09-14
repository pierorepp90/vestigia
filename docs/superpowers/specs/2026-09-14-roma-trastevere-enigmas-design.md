# Revisión de enigmas — roma-trastevere

Fecha: 2026-09-14

## Objetivo

Dar a la ruta `roma-trastevere` un enigma **integral**: cada parada termina en
**una letra**, y las ocho letras, **ordenadas por la fecha** que cada parada
trae en su enunciado o su historia, deletrean **TIBERINA**. Se añade una
parada 9 de cierre que pide justamente esa ordenación.

Los enigmas de partida eran observación directa (leer una forma, contar un
elemento) sin relación entre paradas. Ahora el enunciado plantea la situación
pero **no explica el método** del todo (el método se termina de descubrir con
lo que hay físicamente en el sitio y con las pistas), y las ocho letras dan
sentido retroactivo a toda la ruta.

## Alcance

- `worker/src/contenido/roma-trastevere.{es,en,fr,it}.json` — las 8 paradas
  reescritas (todas pasan a `subpreguntas`, salvo que ya las tuvieran) y una
  parada 9 nueva. Total: 9.
- `js/catalogo.js` — `roma-trastevere`: `numParadas` 8 → 9; `duracionMin`
  120 → 125.
- Sin cambios en `js/juego/figuras.js`. La parada 2 sigue usando
  `secciones-columna` (compartida con `barcelona-born` y `valencia-carmen`;
  el octógono sigue siendo la opción **C**, el cuadrado la **B**, sin tocar el
  SVG). La parada 6 usa `manos`, exclusiva de esta ruta (mano derecha = **A**,
  tres dedos; mano izquierda = **B**, un dedo).
- Sin cambios en `js/recomendaciones.js` (el bloque de `roma-trastevere` es
  transporte/miradores, no contenido de enigma) ni en `acertijoMuestra` de
  `js/catalogo.js` (sigue siendo un acertijo autónomo válido: no revela la
  mecánica nueva de la parada 1).

## Restricciones (de los tests de contenido)

- Cada parada: exactamente 3 pistas, la última con ≥2 palabras.
- `titulo`, `llegada`, `enigma`, `historia`, `fuente` no vacíos.
- Subpreguntas: `texto` no vacío y `respuestas` con ≥1 entrada no vacía.
- Las 4 versiones de idioma comparten numeración de paradas (1..9).
- Motor de respuestas: números y respuestas de 1-2 caracteres → solo
  coincidencia exacta (las letras `r/b/e/t/i/a/n` y las opciones de figura
  `a/b/c` entran aquí); 3+ caracteres → Levenshtein tolerante.

## Mapa letra / fecha / mecánica

| # | Parada (título es) | Letra | Año | Mecánica |
|---|---|---|---|---|
| 1 | Las mujeres de oro | **R** | 1138 (Inocencio II reconstruye la basílica) | 10 mujeres + 8 con la lámpara encendida = 18 → 18ª letra (alfabeto internacional A1Z26) → R |
| 2 | La taza de piedra tallada | **B** | 109 (Trajano abre el acueducto que aún surte la fuente) | El octágono (figura C) es un cuadrado con las esquinas limadas; la forma de origen = cuadrado = opción **B** del esquema |
| 3 | El ojo que avisa de las crecidas | **E** | 791 (crecida derriba el puente anterior → *pons fractus*) | El puente se llama «Ponte Sisto»; SISTO = 5 letras → 5ª letra → E |
| 4 | La proa de piedra | **T** | 291 a.C. (la serpiente elige la isla) | En «TRASTEVERE», S y T son consecutivas en la palabra y en el abecedario → la 2ª → T |
| 5 | El puente que se rindió al río | **I** | 142 a.C. (se cierran los arcos del Pons Aemilius) | 6 arcos originales + 3 perdidos en la riada de 1598 = 9 → 9ª letra → I |
| 6 | Los dedos que guardan un secreto | **I** | 1600 (Maderno talla a Santa Cecilia) | La mano izquierda extiende 1 dedo = numeral romano **I** → letra I |
| 7 | El número que delata el barrio | **A** | 1744 (Benedicto XIV fija 14 rioni y manda poner 220 placas) | 14 rioni − 13 (Trastevere) = 1 → 1ª letra → A |
| 8 | Los papas de piedra sobre el pórtico | **N** | 1702 (Carlo Fontana añade el pórtico) | En «FONTANA», la consonante repetida (F,N,T,N) → N |
| 9 | *(cierre)* El barco anclado en mitad del Tíber | — | — | ordenar las 8 letras por año → TIBERINA |

**Orden de ruta:** R·B·E·T·I·I·A·N — no dice nada.
**Orden por fecha:** 291 a.C.·**T** → 142 a.C.·**I** → 109·**B** → 791·**E** →
1138·**R** → 1600·**I** → 1702·**N** → 1744·**A** → **TIBERINA** ✅

Cohesión entre paradas: la parada 4 usa el propio nombre del barrio
(«Trastevere», visto desde la isla) para dar la T; la 8 recuerda que Carlo
Fontana ya había firmado la fuente de la parada 2; el 9 (suma de la parada 5)
y el numeral romano I de la 6 se comentan juntos en el cierre; los tres
números romanos de la ruta (mano de la 6, placa de la 7, fechas del cierre)
se señalan en el `saberMas` final.

## Por qué TIBERINA (frente a otras opciones valoradas)

Se barajaron tres palabras de 7-9 letras: **NOANTRI** (7, requería fusionar
paradas y depende más de la convención A1Z26 en italiano, con 4/7 letras
posicionalmente inestables), **ESCULAPIO** (9, requería una parada nueva y la
palabra no es igual en los 4 idiomas: *Aesculapius*/*Esculape*), y
**TIBERINA** (8, encaje exacto con las 8 paradas existentes, nombre propio
idéntico en los 4 idiomas, y la Isola Tiberina es literalmente «la proa» del
título de la ruta). Se eligió TIBERINA.

## Diseño por parada (texto `es`; en/fr/it son traducción fiel)

Todas las paradas 1-8 pasan a `subpreguntas` (la 6 ya las tenía; se le añade
la 3ª, la letra), con la última subpregunta siempre "La letra de esta
parada:". La 3.ª pista ("Solución") resuelve todas las subpreguntas de cada
parada.

### Parada 1 — "Las mujeres de oro" (R · 1138)

- Enigma: Inocencio II reconstruye la basílica en 1138 (sobre la iglesia
  titular de su rival, el antipapa Anacleto II, muerto ese año); el mosaico
  de fachada muestra 10 mujeres, 8 coronadas con la lámpara encendida y 2 sin
  corona con la lámpara apagada.
- Subpreguntas: nº de mujeres (10) · nº de lámparas encendidas (8) · letra (r).
- Mecánica: 10 + 8 = 18 → R (18ª letra, alfabeto internacional de 26).
- Historia reescrita: añade el contexto de Anacleto II / 1138; mantiene la
  parábola de las vírgenes prudentes/necias y la leyenda de Santa Maria in
  Fontibus.

### Parada 2 — "La taza de piedra tallada" (B · 109)

- Enigma: la fuente octogonal, con el agua del acueducto de Trajano (año
  109); la letra sale de identificar que un octógono regular procede de un
  cuadrado con las esquinas limadas, y el cuadrado es la opción **B** del
  esquema `secciones-columna`.
- Subpreguntas: forma de la taza (c) · letra (b).
- `figuraId: "secciones-columna"` sin tocar (compartida).

### Parada 3 — "El ojo que avisa de las crecidas" (E · 791)

- Enigma: la crecida del 791 rompe el puente anterior (→ *pons fractus*); el
  actual, Ponte Sisto, con el *occhialone* circular. La letra sale de contar
  las letras de «Sisto» (nombre del puente, no del papa) = 5 → E.
- Subpreguntas: forma del *occhialone* (circular) · letra (e).
- Ancla i18n: **SISTO**, nombre del puente, idéntico en los 4 idiomas (nunca
  Sixto/Sixtus/Sixte, que sí cambian).

### Parada 4 — "La proa de piedra" (T · 291 a.C.)

- Enigma: la leyenda de la serpiente de Esculapio (291 a.C.) que da forma de
  barco a la isla. La letra sale de «TRASTEVERE»: contiene el par consecutivo
  S-T (en la palabra y en el abecedario); se pide la segunda.
- Subpreguntas: animal tallado (serpiente) · letra (t).
- Se retira del enunciado la fecha «siglo I a.C.» del revestimiento de
  travertino (pasa a `saberMas` sin año) para que 291 a.C. sea el único año
  de la parada.
- Ancla i18n: «Trastevere», idéntico en los 4 idiomas; «ST» es su único par
  consecutivo.

### Parada 5 — "El puente que se rindió al río" (I · 142 a.C.)

- Enigma: el Pons Aemilius (arcos cerrados en 142 a.C.), hoy Ponte Rotto con
  un solo arco en pie. La letra sale de sumar los 6 arcos originales y los 3
  que arrancó la riada de 1598: 6 + 3 = 9 → I.
- Subpreguntas: arcos en pie hoy (1) · letra (i).

### Parada 6 — "Los dedos que guardan un secreto" (I · 1600)

- Enigma: la escultura de Maderno (1600) de Santa Cecilia; la mano derecha
  extiende 3 dedos, la izquierda 1. La letra sale de leer ese dedo único como
  numeral romano: I.
- Subpreguntas: mano derecha (a) · mano izquierda (b) · letra (i). Se añade
  la 3ª subpregunta (letra) que la parada no tenía antes de la revisión.
- `figuraId: "manos"` sin tocar (exclusiva de la ruta).

### Parada 7 — "El número que delata el barrio" (A · 1744)

- Enigma: Benedicto XIV fija en 1744 los 14 rioni de Roma y manda clavar 220
  placas de mármol; la placa de Vicolo del Bologna lleva el numeral XIII
  (Trastevere). La letra sale de 14 − 13 = 1 → A.
- Subpreguntas: numeral romano del rione (xiii) · letra (a).
- Historia reescrita: antepone el quirógrafo de 1743 y las 220 placas de
  1744 (dato verificado, ver más abajo); mantiene el emblema del león y el
  carpintero «il Bologna» como color.

### Parada 8 — "Los papas de piedra sobre el pórtico" (N · 1702)

- Enigma: el pórtico de Carlo Fontana (1702, el mismo arquitecto de la
  fuente de la parada 2); 4 estatuas de papas en la balaustrada. La letra
  sale de la consonante repetida en «FONTANA» (F, N, T, N) → N.
- Subpreguntas: nº de estatuas (4) · letra (n).

### Parada 9 (nueva) — "El barco anclado en mitad del Tíber" (cierre)

- Sin desplazamiento. `respuestas`: variantes de «tiberina» / «isola
  tiberina» en cada idioma (en añade *tiber island*; fr, *île tibérine*).
- Enigma: ocho paradas, ocho letras, ocho fechas —dos de ellas a.C.—; hay que
  ordenarlas por año para leer la palabra.
- Pistas: 1) avisa de que, en las fechas a.C., el número más alto es el más
  antiguo; 2) da las 8 letras con su año **en orden de ruta**; 3) las ordena
  por fecha → TIBERINA, «la isla con forma de barco que rodeasteis a mitad de
  camino».
- Historia + saberMas: recapitula los 8 años; etimología de «Tiberina»
  (Tíber ← Tiberino Silvio, rey de Alba Longa ahogado en el río; antes
  Albula).
- `final.texto` reescrito para aterrizar en TIBERINA.

## Datos verificados antes de fijar el diseño

- **1138**: Inocencio II derriba la basílica de su rival, el antipapa
  Anacleto II (muerto ese año, cuya iglesia titular era esta), y la
  reconstruye entre 1138 y 1148.
- **1744**: Benedicto XIV, con el quirógrafo de 1743 y la bula *Urbis*, fija
  Roma en 14 rioni y manda colocar 220 placas de mármol en 1744 para
  amojonarlos sobre el terreno; Trastevere es el rione XIII.
- **Mosaico de fachada**: 10 mujeres, 8 coronadas con la lámpara encendida y
  2 sin corona con la lámpara apagada (lectura de las vírgenes prudentes y
  necias, Mateo 25).

## Notas de traducción (en/fr/it)

Las mecánicas de las paradas 2 (geometría), 4 (Trastevere/ST), 6 (numeral
romano) y 8 (Fontana) no dependen de la posición en el abecedario y portan
solas en los 4 idiomas. Puntos fijados a mano:

- **Parada 1 (crítico en it):** 10 + 8 = 18. El alfabeto italiano nativo
  tiene 21 letras (sin J, K, W, X, Y) y en él la R es la 16ª, no la 18ª. Las
  pistas en it fijan explícitamente el **alfabeto internazionale di 26
  lettere (cifrario A1Z26)**. Es la única parada de la ruta que necesita esta
  convención: I (parada 5, posición 9) y A (parada 7, posición 1) coinciden
  en ambos alfabetos.
- **Parada 3 (crítico en fr/en):** el conteo es sobre **SISTO**, el nombre
  que lleva el puente en los 4 idiomas («Ponte Sisto»), nunca sobre el
  nombre del papa, que sí cambia (Sixto/Sixtus/Sixte/Sisto).
- **Parada 4:** «Trastevere» es idéntico en los 4 idiomas y contiene un único
  par de letras consecutivas del abecedario, «ST».
- **Parada 9 (la palabra meta):** **TIBERINA**, nombre propio latino-italiano
  con la misma grafía en los 4 idiomas — no requiere tratamiento especial de
  "palabra en español" como sí lo necesitó HISTORIA en `barcelona-raval`.

## Verificación

- `node --test` (raíz): 216/218 — los 2 fallos son preexistentes y ajenos a
  esta ruta (`florencia-santacroce` con una traducción a medias, ver memoria
  `vestigia-revision-enigmas`), no relacionados con `roma-trastevere`.
- `node --test` en `worker/`: 141/141.
- Script de verificación ad hoc: recalcula las 8 letras a partir de las
  mecánicas descritas arriba (sin leerlas del JSON), comprueba que ordenadas
  por fecha dan TIBERINA, que cada JSON coincide con esa letra calculada, y
  que `evaluarRespuesta`/`evaluarSubpreguntas` aceptan todas las respuestas
  canónicas de las 9 paradas en los 4 idiomas. Resultado: todo correcto.
- El contenido `*.json` viaja en el `wrangler deploy` del Worker (gitignore);
  a `master` solo van `js/catalogo.js` y este spec.

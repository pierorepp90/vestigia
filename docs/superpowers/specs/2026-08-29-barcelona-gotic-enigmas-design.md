# Revisión de enigmas — barcelona-gotic

Fecha: 2026-08-29

## Objetivo

Reforzar los ocho enigmas de la ruta `barcelona-gotic` y añadir una parada
de cierre. Los problemas de partida:

- Parada 1: la respuesta ("la piedra oscura es la romana") cae sola.
- Parada 2: el enunciado ya explica el chiste del buzón; solo queda mirar una hoja.
- Parada 3: el enunciado nombra "calavera" y "objeto afilado" — medio regalado.
- Parada 4: "Sant Jordi → dragón" no obliga a mirar nada.
- Parada 5: el sitio se da hecho ("nº 1, a la altura de los ojos").
- Parada 6: la entrada al Temple d'August se da hecha.
- Parada 7: el enunciado cuenta todo el bombardeo; solo queda un número.
- Parada 8: "contar ocas" es un dato suelto.
- No hay parada de cierre que ate cabos; el remate va en la `historia` de la 8.

El hilo de la ruta (de la intro) es *"el Gòtic no es una postal medieval
congelada, es un collage de dos mil años, y mucho de lo 'gótico' es del siglo
XX"*. Los enigmas lo tocaban (puente de 1928, fachada de 1913, columna de 1959)
pero no lo hacían explícito.

## Alcance

- `worker/src/contenido/barcelona-gotic.{es,en,fr,it}.json` — las 8 paradas
  existentes reescritas, una parada nueva intercalada (medallón de Pere Joan) y
  una parada de cierre nueva. Total: 10 paradas.
- `js/catalogo.js` — `barcelona-gotic`: `numParadas` 8 → 10; `duracionMin`
  120 → 150; `resumen` y el artículo de curiosidades ("ocho paradas" → "diez
  paradas") en los 4 idiomas.
- `js/recomendaciones.js` — `barcelona-gotic.movilidad.texto`: frase extra sobre
  el mercado de antigüedades de los jueves en la Plaça Nova (4 idiomas).
- Sin cambios en `js/juego/figuras.js` (se reutilizan `hojas` y `capiteles`).

## Restricciones (de los tests de contenido)

- Cada parada: exactamente 3 pistas, la última con ≥2 palabras.
- `titulo`, `llegada`, `enigma`, `historia`, `fuente` no vacíos.
- Subpreguntas: `texto` no vacío y `respuestas` con ≥1 entrada no vacía.
- Las 4 versiones de idioma comparten numeración de paradas (1..10).
- Respuestas numéricas y de 1-2 caracteres: solo coincidencia exacta. El resto:
  Levenshtein tolerante. Ser generoso con las variantes.

## Numeración final

| #  | Título (es)                              | Núcleo |
|----|------------------------------------------|--------|
| 1  | La puerta que ya no está                 | piedra romana vs. fachada neogótica de 1913 |
| 2  | La tortuga que persigue a las golondrinas| el chiste del buzón + hoja de hiedra (fig. `hojas`) |
| 3  | Lo que cuelga bajo el puente             | calavera + daga (sin nombrarlas en el enunciado) |
| 4  | El caballero de la corona de piedra      | medallón de 1418 (real) vs. puente de 1928 (disfraz) |
| 5  | El santo que nunca pierde                | el mismo caballero "a lo grande" + Jaume I |
| 6  | La luz que arde para siempre             | Call / piedra de Marlet → 1314 (acertijo para ubicarla) |
| 7  | El templo que sobrevivió                 | capitel corintio (C) + 4ª columna 1959 (fig. `capiteles`) |
| 8  | La plaza que no se pudo restaurar        | bombardeo de 1938 + placa de 2007 |
| 9  | Las ocas que cuentan la edad de una santa| 13 + función de vigilancia (ocas del Capitolio) |
| 10 | El barrio con menos años de los que aparenta | cierre: el Gòtic como collage del s. XX |

## Diseño por parada (texto `es`; en/fr/it son traducción fiel)

### Parada 1 — "La puerta que ya no está"

Dos subpreguntas que enfrentan "lo que parece viejo" con "lo que lo es".

- `enigma`: la torre romana + el acueducto reconstruido en 1958 (dos tonos de
  piedra); manda a mirar también la fachada de la Catedral.
- `subpreguntas`:
  1. "En la torre, ¿cuál de los dos tonos de piedra es el auténtico romano?" →
     `el oscuro`, `la oscura`, `el más gastado`, `la de abajo`…
  2. "La fachada de la Catedral … se terminó en 1913 imitando el estilo gótico
     de siglos atrás. ¿Cómo se llama ese estilo…?" → `neogótico`,
     `historicismo`, `neogoticismo`…
- Se elimina `respuestas`; se añade `subpreguntas`.
- El friso de Picasso se queda en `saberMas` (ya estaba), sin pregunta.

### Parada 2 — "La tortuga que persigue a las golondrinas"

Se quita del enunciado la frase que explica el chiste. Dos subpreguntas.

- `enigma`: describe la escena (tortuga que recoge, golondrinas que sueltan,
  planta trepadora en el marco) sin decir de qué se ríe. Menciona el Colegio de
  Abogados que ocupaba el edificio, para dar contexto.
- `subpreguntas`:
  1. "¿Qué es lo que, como la tortuga, va lentísimo?" → `la justicia`,
     `la lentitud de la justicia`, `los juicios`, `los tribunales`,
     `la burocracia`…
  2. "¿Cuál de las cuatro hojas del esquema es la del buzón?" → `a`
- Figura `hojas` sin cambios.

### Parada 3 — "Lo que cuelga bajo el puente"

El enunciado ya no nombra la calavera ni el arma. Dos subpreguntas
(descubrir cada cosa).

- `enigma`: "…Rubió escondió un pequeño relieve de piedra deliberadamente
  macabro. Nunca explicó qué significaba. Miradlo de cerca."
- `subpreguntas`:
  1. "El relieve macabro representa un…" → `calavera`, `cráneo`, `una calavera`…
  2. "¿Qué lo atraviesa?" (no se repite "cráneo": es la respuesta de la sub 1 y
     ambas están visibles a la vez) → `daga`, `puñal`, `espada`, `cuchillo`,
     `navaja`
- Se elimina `respuestas`; se añade `subpreguntas`.

### Parada 4 (nueva) — "El caballero de la corona de piedra"

Sin desplazarse del carrer del Bisbe. Puzzle en clave del hilo de la ruta:
gótico falso vs. gótico de verdad, uno al lado del otro.

- `llegada`: girar hacia la fachada de la Generalitat que da al carrer del
  Bisbe, mirar por debajo del arco.
- `enigma`: "…hay un medallón de piedra redondo dentro de una corona vegetal,
  tallado por Pere Joan. Una de las dos piedras 'góticas' del carrer del Bisbe
  —el puente o el medallón— es medieval de verdad, del siglo XV. La otra es un
  disfraz. ¿Cuál es cuál?" (no se dice que en el medallón hay un jinete; no se
  repite que el puente es de 1928 — eso se reveló en la parada 3).
- `subpreguntas`:
  1. "¿Cuál es la gótica de verdad: el puente o el medallón?" → `el medallón`,
     `el relieve`, `la talla`
  2. "¿Qué figura hay tallada en el medallón? Retenedla para la Plaça de Sant
     Jaume." → `un caballero`, `un jinete`, `lord`, `un hombre a caballo`,
     `sant jordi`, `san jorge`…
- `historia` / `saberMas`: Pere Joan (h. 1418), la réplica de Frederic Marès, el
  puente diseñado para "rimar" con piezas góticas reales como esta.
- Sin `figuraId`.

### Parada 5 — "El santo que nunca pierde"

(La antigua parada 4.) Enunciado más corto, obliga a buscar. Se mantiene la
2ª pregunta (Jaume I).

- `enigma`: "En esta plaza se dan la cara los dos poderes de Cataluña… En uno de
  ellos está el caballero del enigma anterior, pero a lo grande. Buscadlo."
- `subpreguntas`:
  1. "¿Qué está haciendo el caballero, lo que en el medallón no se distinguía?"
     → `matando un dragón`, `matando al dragón`, `venciendo al dragón`,
     `matando un drac`…
  2. "…una es el rey del siglo XIII que conquistó Mallorca y Valencia y da
     nombre a la parada de metro por la que seguramente llegasteis. ¿Quién es?"
     → `jaume i`, `jaime i`, `jaume el conqueridor`…
- Se elimina `respuestas`; se añade `subpreguntas`.

### Parada 6 — "La luz que arde para siempre"

(La antigua parada 5.) Encontrar la piedra es el enigma: un pequeño acertijo
para deducir el número de la casa (1) y el idioma (hebreo). Respuesta única
`1314`.

- `enigma`: "…Su número es el año en que, según el calendario cristiano, el niño
  nacido en Belén cumplió doce meses. Y sabréis que es la piedra correcta porque
  está escrita en la lengua original del Antiguo Testamento, con una placa
  moderna al lado que la traduce… ¿Cuál, en el calendario cristiano?"
- `pistas` 1 = fallback de ubicación (nº 1, en hebreo, en alto en la esquina).
- `respuestas`: `1314`.

### Parada 7 — "El templo que sobrevivió"

(La antigua parada 6.) Encontrar el portal es parte del enigma. Subpreguntas
(C / 1959) sin cambios.

- `llegada` / `enigma`: la piedra de molino del recodo marca la cima del Mont
  Tàber; "un club de gente que por afición sube cumbres muchísimo más altas que
  este montículo guarda un pequeño museo".
- `pistas` 1 = fallback (nº 10, Centre Excursionista de Catalunya).
- Figura `capiteles` sin cambios.

### Parada 8 — "La plaza que no se pudo restaurar"

(La antigua parada 7.) Se cuenta la historia del bombardeo en el enunciado y se
deja la pregunta abierta ("¿qué causó las marcas?"), aceptando variantes
(`bomba`, `metralla`, `balas`, `tiros`…). Segunda pregunta: el año de la placa.

- `pistas` 1 aporta el dato de las casas de gremio trasladadas piedra a piedra.
- `subpreguntas`:
  1. "¿Qué causó las marcas de la fachada?" → `una bomba`, `un bombardeo`,
     `metralla`, `balas`, `municiones`, `tiros`, `disparos`, `proyectiles`…
  2. "En la fachada hay una placa que recuerda a las víctimas. ¿De qué año es?"
     → `2007`
- Se elimina `respuestas`; se añade `subpreguntas`.

### Parada 9 — "Las ocas que cuentan la edad de una santa"

(La antigua parada 8.) Se mantiene el recuento (13) y se añade una 2ª pregunta
que cierra el hilo romano de la ruta (las ocas del Capitolio).

- `subpreguntas`:
  1. "Contad las ocas: esa es la edad de Santa Eulalia." → `13`, `trece`
  2. "…hacen aquí lo mismo que unas aves famosas de la antigua Roma. ¿El qué?" →
     `vigilar`, `avisar`, `dar la alarma`, `montar guardia`…
- Se elimina `respuestas`; se añade `subpreguntas`.
- De la `historia` se saca la frase de cierre ("Habéis llegado caminando desde
  una puerta romana…") → migra a la parada 10.

### Parada 10 (nueva) — "El barrio con menos años de los que aparenta"

Cierre reflexivo, sin desplazamiento. Hace explícito el hilo de la ruta: el
"Barri Gòtic" como conjunto es en buena parte un invento del siglo XX.

- `llegada`: "No hace falta que os mováis. Quedaos en el claustro, o salid al
  Pla de la Seu…"
- `enigma`: recuento de los "engaños" (puente 1928, fachada 1913, columna 1959,
  casas de gremio trasladadas) y el nombre "Barri Gòtic" popularizado en los
  años veinte.
- `subpreguntas`:
  1. "De todo lo que parecía medieval y era del siglo XX, ¿qué cruza por encima
     del carrer del Bisbe?" → `el puente`, `el pont del bisbe`…
  2. "Y al revés: … nombrad una cosa que sí sea tan antigua como parece." →
     `el claustro`, `la puerta romana`, `el templo de augusto`, `la piedra del
     call`, `el medallón`… (lista amplia)
- `historia`: el círculo puerta romana → claustro gótico, con "todo un siglo XX
  vestido de Edad Media" en medio.
- `saberMas`: la Via Laietana (1908), la Exposición de 1929, Rubió i Bellver y
  Jeroni Martorell; el dato: el Pont del Bisbe es más joven que el metro de
  Barcelona.
- Sin `figuraId`.

### `final`

`final.texto` se reescribe para no cantar el número de paradas y para mencionar
la lección de cierre.

## Notas de traducción (en/fr/it)

- Parada 1 sub 2: "neogótico" → `neo-Gothic` / `néogothique` / `neogotico`;
  aceptar `historicism` / `historicisme` / `storicismo`. El título no revela.
- Parada 2 sub 1: aceptar el oficio y el concepto en cada idioma
  (`the law`/`the courts`/`justice`; `la justice`/`les tribunaux`;
  `la giustizia`/`i tribunali`).
- Parada 4 sub 2: aceptar genérico + específico en los cuatro idiomas
  (`a knight`/`a rider`/`Saint George`; `un chevalier`/`un cavalier`/
  `saint Georges`; `un cavaliere`/`san Giorgio`).
- Parada 5 sub 1: "matando un dragón" → `killing a dragon` / `tuant un dragon` /
  `uccidendo un drago` y variantes.
- Parada 6: "calendario cristiano" → `Christian calendar` / `calendrier
  chrétien` / `calendario cristiano`. El acertijo del "niño nacido en Belén" se
  traduce literal. Respuesta `1314` en los cuatro.
- Parada 8 sub 1: aceptar `bomb`/`shrapnel`/`bullets`/`shots` y equivalentes en
  fr/it.
- Parada 10 sub 2: mantener la lista amplia en cada idioma; "Ciutadella" no
  aplica aquí (ruta del Born). Aceptar la forma local de cada término.

## Verificación

- `node --test` — en especial `tests/contenido.test.js` y
  `worker/tests/contenido.test.js`.
- Revisar a mano la ficha de ruta y el flujo de juego de `barcelona-gotic` en
  los cuatro idiomas: recuento de 10 paradas, render de las subpreguntas de las
  paradas 4 y 10, y el email de recomendaciones (renglón del mercado de los
  jueves).

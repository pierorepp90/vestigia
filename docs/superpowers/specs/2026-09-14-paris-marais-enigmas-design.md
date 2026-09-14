# Revisión de enigmas — paris-marais

Fecha: 2026-09-14

## Objetivo

Dar a la ruta `paris-marais` un enigma integral: cada parada termina en **una
letra**, y las ocho letras, **ordenadas por la fecha** que cada parada trae en
su enunciado o su historia, deletrean **VESTIGIO**. Se añade una parada 9 de
cierre que pide justamente esa ordenación.

Los enigmas de partida se resolvían casi todos con una observación directa
(leer un año grabado, contar un elemento suelto, nombrar un animal o un
símbolo). Ahora el enunciado plantea la situación pero **no explica el
método** (sumar cifras, pasarlas a A1Z26, dar la vuelta al abecedario, leer un
número romano…); el método se descubre con lo que hay físicamente en el sitio
y se destraba con las pistas. Escape room difícil.

## Alcance

- `worker/src/contenido/paris-marais.{es,en,fr,it}.json` — las 8 paradas
  reescritas (todas pasan a `subpreguntas`) y una parada 9 nueva. Total: 9.
- `js/catalogo.js` — `paris-marais`: `numParadas` 8 → 9; `duracionMin`
  120 → 125; `resumen` (4 idiomas) pierde la mención expresa "Ocho paradas /
  Eight stops / Huit étapes / Otto tappe" para no tener que actualizarla cada
  vez que cambie el número de paradas de una ruta.
- `ruta/paris-marais.html` + `{en,fr,it}/ruta/paris-marais.html` +
  `{en,fr,it}/ciudad/paris.html` — regenerados con
  `node scripts/generar-seo.mjs && node scripts/generar-i18n.mjs` para que el
  `<meta description>`, el JSON-LD y la tarjeta de la ruta en la ficha de
  ciudad reflejen el `resumen` nuevo. (La versión `es` de `ciudad/paris.html`
  no necesita regeneración: renderiza las tarjetas de ruta en cliente a partir
  de `js/catalogo.js`.)
- Sin cambios en `js/juego/figuras.js`: la parada 6 sigue usando `conchas`
  (comprobado que **no** está compartida con ninguna otra ruta — el "conchas"
  que aparece en `roma-trastevere.es.json` es la palabra en la prosa de una
  parada distinta, no un `figuraId`). La respuesta sigue siendo la B
  (tridacna, borde en zigzag).
- Sin cambios en `js/recomendaciones.js` ni en `acertijoMuestra` (el símbolo
  del Point Zéro sigue siendo el mismo, así que el acertijo de muestra
  continúa siendo válido tal cual).

## Restricciones (de los tests de contenido)

- Cada parada: exactamente 3 pistas, la última con ≥2 palabras.
- `titulo`, `llegada`, `enigma`, `historia`, `fuente` no vacíos.
- Subpreguntas: `texto` no vacío y `respuestas` con ≥1 entrada no vacía.
- Las 4 versiones de idioma comparten numeración de paradas (1..9).
- Motor de respuestas: números y respuestas de 1-2 caracteres (las letras
  entran aquí) → solo coincidencia exacta; texto de 3+ caracteres →
  Levenshtein tolerante.

## Mapa letra / fecha

| # | Parada (título es) | Letra | Año | Mecánica |
|---|---|---|---|---|
| 1 | El punto desde donde se mide Francia | **G** | 1924 | raíz digital del año (1+9+2+4=16→1+6=7) → 7.ª letra A–Z |
| 2 | Los reyes que no eran reyes de Francia | **S** | 1793 | las estatuas actuales son del siglo XIX → 19 → 19.ª letra (A1Z26, 26 letras) |
| 3 | La cicatriz de una revolución | **T** | 1830 | inicial de "tres/trois/three/tre" (la revolución duró tres jornadas) |
| 4 | El animal tallado en la fachada | **O** | 1967 | única letra repetida en MOUTON (nombre de la casa, sin traducir) |
| 5 | Los nombres que no se pueden olvidar | **I** | 1942 | 165 (el nº de la placa) mod 26 = 9 → 9.ª letra |
| 6 | Las conchas de un novelista | **I** | 1843 | dos valvas = un solo animal → 1 → número romano I |
| 7 | El pasadizo de las dos guardianas | **E** | 1624 | letras de SULLY (nombre propio) = 5 → 5.ª letra |
| 8 | Los pabellones idénticos de la plaza | **V** | 1612 | el Pavillon du Roi es el 5.º de 9 → número romano V |
| 9 | Lo que Le Marais no perdió | — | — | cierre: ordenar las 8 letras por año → VESTIGIO |

Orden de ruta: G·S·T·O·I·I·E·V (no forman nada). Orden por fecha: 1612 V ·
1624 E · 1793 S · 1830 T · 1843 I · 1924 G · 1942 I · 1967 O → **VESTIGIO**.

Variedad de operación (orden de recorrido): raíz digital de un año → siglo
convertido a A1Z26 → inicial de un numeral → letra repetida en nombre propio →
A1Z26 modular sobre un número recogido en la propia parada → número romano por
observación lateral → conteo de letras de un nombre propio → posición ordinal
+ número romano. Ningún tipo se repite en paradas consecutivas; los dos
números romanos (parada 6 y 8) no son consecutivos entre sí.

## Diseño por parada (texto `es`; en/fr/it son traducción fiel)

Todas las paradas 1-8 pasan de `respuestas` única a `subpreguntas`, con la
última subpregunta siempre "La letra de esta parada:". La 3.ª pista
("Solución") resuelve todas las subpreguntas de la parada.

### Parada 1 — "El punto desde donde se mide Francia" (G · 1924)

- Enigma: el Point Zéro des routes de France, fijado en 1924; describe el
  medallón (rosa de los vientos, forma octogonal, piedra partida en cuatro
  secciones) pero manda a operar sobre el año, no sobre la forma.
- Subpreguntas: símbolo grabado (`rosa de los vientos`…) · nº de lados del
  medallón (`8`, no alimenta la letra — es un señuelo que las pistas dejan de
  lado) · letra (`g`).
- Pistas: 1 aísla el año; 2 da la raíz digital (16→7); 3 = solución completa.
- `historia` añade que el 1 de julio de 2025 se sustituyó el medallón
  original, demasiado gastado, por una copia fiel.

### Parada 2 — "Los reyes que no eran reyes de Francia" (S · 1793)

- Enigma: las 28 estatuas de la Galerie des Rois; se insiste en que las que se
  ven **no son las medievales decapitadas en 1793** sino una recreación — y
  que lo que importa es de qué siglo.
- Subpreguntas: nº de estatuas (`28`) · siglo de las actuales, en cifras
  (`19`, `xix`…) · letra (`s`).
- Pistas: 1 dice que son de Viollet-le-Duc, siglo XIX; 2 fija el abecedario
  internacional de 26 letras (crítico en it); 3 = solución.
- `historia`: cabezas perdidas 184 años, halladas en 1977 en el sótano de un
  banco, hoy en el Musée de Cluny; recreación restaurada tras el incendio de
  2019, reabierta en diciembre de 2024.

### Parada 3 — "La cicatriz de una revolución" (T · 1830)

- Enigma: la bala de cañón del Hôtel de Sens; la revolución de 1830 duró
  "tres jornadas" — el enunciado empuja a decir el apodo en voz alta y notar
  que empieza igual en varios idiomas, sin nombrar la operación.
- Subpreguntas: año grabado (`1830`) · días que duró la revolución (`3`,
  `tres`) · letra (`t`).
- Pistas: 1 da el nombre en es/fr; 2 aísla la inicial de "tres"; 3 = solución.
- `historia` añade que el Hôtel de Sens es de los pocos edificios civiles
  medievales en pie en París (1475-1519) y que la inscripción junto a la bala
  dice literalmente "28 juillet 1830".

### Parada 4 — "El animal tallado en la fachada" (O · 1967)

- Enigma: las casas de rue François-Miron 11 (Faucheur) y 13 (Mouton),
  ocultas bajo yeso hasta 1967; manda a mirar el nombre francés MOUTON letra
  por letra sin decir "letra repetida".
- Subpreguntas: animal tallado en el nº 13 (`oveja`, `carnero`…) · letra
  (`o`).
- Pistas: 1 = "solo una aparece dos veces"; 2 = posiciones 2.ª y 5.ª; 3 =
  solución.
- `historia` añade el motivo del yeso (tras el incendio de Londres de 1666,
  París ordenó recubrir los entramados de madera).

### Parada 5 — "Los nombres que no se pueden olvidar" (I · 1942)

- Enigma: la placa de los 165 niños judíos deportados de la escuela en la
  redada de julio de 1942; el enunciado mantiene el foco en la historia
  (Joseph Migneret, la placa como acto de memoria) y solo pide llevar el
  número al abecedario "dándole las vueltas que haga falta" — la operación se
  hace sobre un número, nunca sobre el texto de la placa.
- Subpreguntas: número de la placa (`165`) · letra (`i`).
- Pistas: 1 explica el módulo (26, 52, 78…); 2 hace la resta (165−156=9); 3 =
  solución.
- `historia` añade la fecha de la placa (7 de mayo de 1971, la primera de su
  clase en París) y que el 1 de octubre de 1942 solo volvieron 4 alumnos.

### Parada 6 — "Las conchas de un novelista" (I · 1843)

- Enigma: las dos pilas de agua bendita de Saint-Paul-Saint-Louis, regalo de
  Victor Hugo en 1843; insiste en que las dos conchas "encajan" —son las dos
  valvas de un mismo animal— y pide ese número en números romanos.
- Subpreguntas (sin cambios en la mecánica de figura): concha (`b`) · cuántas
  hay (`2`) · letra (`i`).
- Pistas: 1 identifica que es un solo molusco; 2 da la forma del borde +
  anuncia número romano; 3 = solución.
- `historia` añade que Léopoldine, la hija cuya boda se celebraba, murió
  ahogada en el Sena en Villequier el mismo septiembre de 1843.
- `figuraId: "conchas"` sin cambios.

### Parada 7 — "El pasadizo de las dos guardianas" (E · 1624)

- Enigma: el pasadizo del Hôtel de Sully hacia la Place des Vosges, abierto
  en 1624; identifica que el palacio lleva el nombre del comprador, no del
  constructor, y manda a contar las letras de ese apellido.
- Subpreguntas: criaturas (`esfinges`…) · duque (`sully`, `béthune`…) · letra
  (`e`).
- Pistas: 1 nombra a Sully y cuenta sus letras (5); 2 fija A=1; 3 = solución.

### Parada 8 — "Los pabellones idénticos de la plaza" (V · 1612)

- Enigma: los 36 pabellones de la Place des Vosges, inaugurada en 1612; pide
  contar hasta el Pavillon du Roi (el central, más alto) y escribir su puesto
  "con una sola letra".
- Subpreguntas: nº de pabellones (`36`) · puesto del Pavillon du Roi, de 9
  (`5`) · letra (`v`).
- Pistas: 1 sitúa el pabellón en el centro (5.º); 2 anuncia número romano; 3
  = solución.
- Se conserva el guiño cruzado con la parada 6 (Victor Hugo, vecino de ambas).

### Parada 9 (nueva) — "Lo que Le Marais no perdió" (cierre)

- Sin desplazamiento. `respuestas: ["vestigio", "un vestigio", "vestigios"]`
  (+ `vestige/a vestige/vestiges/vestigio` en en, `vestige/un vestige/
  vestiges/vestigio` en fr, `vestigio/un vestigio/vestigia/vestigi` en it).
- Enigma: "ocho paradas, ocho letras, cada una con un año… hay una forma de
  ponerlas en fila que las hace hablar".
- Pistas: 1 = ordenar por año; 2 = las 8 letras con su año **en orden de
  ruta** (no de fecha, para no regalarlo); 3 = orden por fecha → VESTIGIO.
- `historia` + `saberMas`: repaso de las 8 fechas y la etimología latina de
  *vestigium* ("la planta del pie, la huella que deja"), con el guiño a que
  su plural, *vestigia*, da nombre al juego — y a que la propia ruta empieza
  pisando uno, el medallón del Point Zéro.
- `final.texto` reescrito para rematar sobre VESTIGIO.

## Notas de traducción (en/fr/it)

- **Parada 2 (crítico en it):** S = 19.ª letra → pistas fijan "abecedario
  internacional de 26 letras (cifrario A1Z26)"; en it, explícito *"alfabeto
  internazionale di 26 lettere"* — con el alfabeto italiano nativo de 21
  letras, 19 caería en una letra distinta.
- **Parada 3:** T sale de la inicial de "tres/trois/three/tre" — no depende
  de posición en el abecedario, así que no necesita ningún ajuste; el
  enunciado mete la palabra "tres días/jours/days/giorni" en los 4 idiomas
  para que la inicial esté a la vista.
- **Parada 4:** "MOUTON" se deja en francés en los 4 idiomas (es el nombre
  real de la casa, como BIBLIOTECA en `barcelona-raval` o MOUTON... — nombre
  propio, no se traduce). El animal sí se traduce (`sheep`/`mouton`/`pecora`)
  pero no alimenta la letra.
- **Paradas 6 y 8:** números romanos I y V, idénticos en los 4 idiomas — sin
  ajuste alguno.
- **Parada 7:** "SULLY" es nombre propio (el duque), idéntico en los 4
  idiomas; 5 letras → E, 5.ª en todos los alfabetos, sin riesgo.
- **Parada 5:** el 165 de la placa es un número, igual en los 4 idiomas; la
  operación (módulo 26) no depende del idioma.
- **Parada 9 (la palabra meta):** la respuesta es **VESTIGIO, palabra
  española**, presentada como hallazgo etimológico — en en/fr/it el enunciado
  dice explícitamente "en español, pero la reconoceréis al vuelo". En **it**
  se omite esa coletilla porque *vestigio* (pl. *vestigia*) es también
  italiano nativo y las 8 letras coinciden exactamente con la forma
  italiana. Las 8 letras y las 8 mecánicas son idénticas en los 4 idiomas.

## Verificación

- `node --test` (raíz): 216/218. Los 2 fallos son de `toulouse-capitole`
  (otra ruta, a medio revisar por otra sesión en paralelo — `catalogo.js`
  declara 8 paradas pero `toulouse-capitole.en.json` ya tiene 10), no de
  `paris-marais`. `tests/contenido.test.js` sin fallos de esta ruta.
- `node --test` en `worker/`: 141/141.
- Script ad-hoc (`verificar-paris-marais.mjs`) que recalcula las 8
  derivaciones de letra a partir del año/mecánica de cada parada, confirma
  que ordenadas por fecha dan VESTIGIO, y que `evaluarRespuesta` /
  `evaluarSubpreguntas` aceptan como "correcto" todas las variantes
  declaradas en los 4 JSON (incluida la última subpregunta "La letra de esta
  parada"), y siguen rechazando una respuesta arbitraria como "incorrecto".
- El contenido `*.json` viaja en el `wrangler deploy` del Worker (gitignore);
  a master solo van `js/catalogo.js` (aislando el hunk de `paris-marais` con
  `git diff` + `git apply --cached`, porque en el momento de comitear había
  cambios sin terminar de `valencia-carmen` en el mismo archivo, de otra
  sesión en paralelo), las páginas `ruta/paris-marais.html` +
  `{en,fr,it}/ruta/paris-marais.html` + `{en,fr,it}/ciudad/paris.html`
  regeneradas, y este spec.

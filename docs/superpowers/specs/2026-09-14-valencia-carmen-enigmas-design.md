# Revisión de enigmas — valencia-carmen

Fecha: 2026-09-14

## Objetivo

Dar a la ruta `valencia-carmen` un enigma integral: cada parada termina en **una
letra**, y las ocho letras, **ordenadas por la fecha** que cada parada trae en su
enunciado o su historia, deletrean **MERCADER**. Se añade una parada 9 de cierre
que pide justamente esa ordenación.

Los enigmas de partida se resolvían casi todos con una observación directa (leer
un año en un panel, identificar un animal o un color). Ahora el enunciado plantea
la situación pero **no explica el método** (contar cuerpos de un edificio, escribir
un año en números romanos, contar consonantes de un nombre, buscar una letra
repetida...); el método se descubre con lo que hay físicamente en el sitio y se
destraba con las pistas.

## Alcance

- `worker/src/contenido/valencia-carmen.{es,en,fr,it}.json` — las 8 paradas
  reescritas (todas pasan a `subpreguntas`) y una parada 9 nueva. Total: 9.
- `js/catalogo.js` — `valencia-carmen`: `numParadas` 8 → 9; `duracionMin`
  120 → 125; `acertijoMuestra` reescrito como teaser autónomo (antes citaba el
  enigma completo de la parada 1, que ahora incluye la mecánica de la letra).
- Sin cambios en `js/juego/figuras.js`: la parada 2 sigue usando `fustes`
  (exclusiva de esta ruta, respuesta C sin cambios), la parada 4 sigue usando
  `secciones-columna` (compartida con `barcelona-born` y `roma-trastevere`,
  respuesta C sin cambios) y la parada 5 sigue usando `bovedas` (compartida con
  `toulouse-capitole`, respuesta D sin cambios).
- Sin cambios en `js/recomendaciones.js`. El artículo de curiosidades enlazado
  (id `valencia`, `enlacesRutas: ['valencia-carmen']`) no menciona el número de
  paradas en su `cierre`, así que no necesita retoque.

## Restricciones (de los tests de contenido)

- Cada parada: exactamente 3 pistas, la última con ≥2 palabras.
- `titulo`, `llegada`, `enigma`, `historia`, `fuente` no vacíos.
- Subpreguntas: `texto` no vacío y `respuestas` con ≥1 entrada no vacía.
- Las 4 versiones de idioma comparten numeración de paradas (1..9).
- Motor de respuestas: números y respuestas de 1-2 caracteres → solo coincidencia
  exacta (las letras `c/r/a/e/m/d` entran aquí); 3+ caracteres → Levenshtein
  tolerante.

## Mapa letra / fecha

| # | Parada (título es) | Letra | Año | Mecánica |
|---|---|---|---|---|
| 1 | El sermón de la fachada | **C** | 1548 | La Lonja tiene 3 cuerpos vistos desde la plaza (Sala, Torre, Consulado del Mar) → 3ª letra A–Z |
| 2 | La frase que da la vuelta al salón | **R** | 1482 | MERCATOR, en el friso latino de la Sala de Contratación → su letra repetida |
| 3 | La cúpula que no es de piedra | **A** | 1701 | Única cúpula de azulejo de la plaza (1) → 1ª letra A–Z |
| 4 | La torre que tardó un siglo en subir | **E** | 1381 | 1381 en números romanos (MCCCLXXXI) → 5 letras distintas → 5ª letra A–Z |
| 5 | Los apóstoles que custodian la copa | **M** | 1356 | Clave central de la bóveda = Coronación de la Virgen → inicial de María |
| 6 | Las torres que aún llevan las cicatrices | **E** | 1808 | 1808 en números romanos (MDCCCVIII) → 5 letras distintas → 5ª letra A–Z (mismo truco que la parada 4) |
| 7 | La calle de los que cosían el dinero | **D** | 1741 | BOLSERIA: tantas vocales como consonantes → 4 consonantes → 4ª letra A–Z |
| 8 | La que discute con la iglesia de enfrente | **R** | 1928 | COTORRA (mote de la veleta) → letra doblada (espejo de la parada 2) |
| 9 | Lo que faltaba por ordenar | — | — | cierre: ordenar las 8 letras por año → MERCADER |

Orden de ruta: C·R·A·E·M·E·D·R. Orden por fecha: 1356 M · 1381 E · 1482 R ·
1548 C · 1701 A · 1741 D · 1808 E · 1928 R → **MERCADER**.

Ninguna mecánica depende de una posición del abecedario superior a 5, así que
esta ruta **no tiene el riesgo del alfabeto italiano de 21 letras** que afectó a
`barcelona-raval` (posiciones grandes como la R o la M salen de "letra repetida"
o de "inicial de un nombre", no de contar A1Z26).

## Diseño por parada (texto `es`; en/fr/it son traducción fiel)

Todas las paradas 1-8 pasan de `respuestas` única a `subpreguntas`, con la última
subpregunta siempre "La letra de esta parada:". La 3ª pista ("Solución") resuelve
todas las subpreguntas de la parada.

### Parada 1 — "El sermón de la fachada" (C · 1548)

- Enigma: retroceder para ver la Lonja como tres cuerpos distintos (Sala de
  Contratación, Torre, Consulado del Mar); el ala del Consulado se terminó en
  1548; el animal tallado entre los dos medallones sigue siendo el mono.
- Subpreguntas: animal (`mono`…) · cuerpos del edificio (`3`, `tres`) · letra (`c`).
- `acertijoMuestra` de `catalogo.js` se separa de este enigma: pasa a un teaser
  corto y autónomo sobre el mono, sin la mecánica de los tres cuerpos ni la letra.

### Parada 2 — "La frase que da la vuelta al salón" (R · 1482)

- Enigma: la primera piedra de la Sala en 1482; la inscripción latina dorada que
  recorre el salón (el friso real de la Lonja, documentado: *"MERCATOR SIC AGENS
  DIVITIIS REDUNDABIT ET TANDEM VITA FRUETUR AETERNA"*); pide identificar el
  oficio en latín sin nombrar aún la mecánica de la letra repetida.
- Subpreguntas: fuste (`c`, figura `fustes`) · columnas exentas (`8`, `ocho`) ·
  letra (`r`).
- Historia: se añade el contenido del friso latino y la fecha ~1498 de cierre de
  la sala, sin tocar el resto (columnas helicoidales, Torre-cárcel-capilla).

### Parada 3 — "La cúpula que no es de piedra" (A · 1701)

- Título nuevo (el anterior, "La cúpula que se pintó de cielo", insinuaba el
  color). Enigma: la plaza es la primera ruptura no gótica del recorrido; se
  pide contar cuántas cúpulas de azulejo hay en la plaza (1).
- Subpreguntas: color del azulejo (`azul`…, de sabor, no alimenta la letra) ·
  cúpulas de azulejo en la plaza (`1`, `una`) · letra (`a`).
- Es la mecánica más "blanda" de la ruta (excepción → 1); documentado como punto
  a vigilar si en el futuro se retoca la ruta.

### Parada 4 — "La torre que tardó un siglo en subir" (E · 1381)

- Enigma y subpreguntas de figura/año sin cambios (`secciones-columna`, C,
  1381); se añade la mecánica: escribir 1381 en números romanos (MCCCLXXXI) y
  contar las letras distintas (5) → 5ª letra.
- Pistas: 1 apunta a "escríbelo a la manera vieja"; 2 da el numeral romano
  completo; 3 = solución.

### Parada 5 — "Los apóstoles que custodian la copa" (M · 1356)

- Enigma: la sala capitular se fecha ahora en 1356 (antes la parada citaba el
  rango 1356-1369 sin destacar ninguno); se mantiene la bóveda estrellada
  (figura `bovedas`, D) y los doce apóstoles, y se añade que la clave central
  —la Coronación de la Virgen— da la letra por su inicial (María → M).
- Subpreguntas: bóveda (`d`) · a quién representa la clave central (`la
  virgen`, `maria`…) · letra (`m`).
- Nota: 13 claves en total (12 apóstoles + 1 central) también da M por A1Z26,
  así que la mecánica es doblemente consistente aunque el enunciado solo pide
  la inicial del nombre.

### Parada 6 — "Las torres que aún llevan las cicatrices" (E · 1808)

- Enigma y subpregunta de año sin cambios (1808); se añade la mecánica: 1808 en
  números romanos (MDCCCVIII) → 5 letras distintas → E, explícitamente
  presentada como "la misma manera" que la parada 4 (el mismo truco, la misma
  letra, para dar cohesión entre las dos torres de la ruta).
- Subpreguntas: año (`1808`) · letra (`e`).

### Parada 7 — "La calle de los que cosían el dinero" (D · 1741)

- Enigma: se ancla el año 1741 (ordenanzas del gremio) en el propio enunciado; la
  mecánica es BOLSERIA (nombre de la calle, sin traducir en los 4 idiomas) = 4
  vocales + 4 consonantes → 4ª letra.
- Subpreguntas: qué fabricaban los bolseros (`bolsas`…) · letra (`d`).

### Parada 8 — "La que discute con la iglesia de enfrente" (R · 1928)

- Título nuevo (el anterior, "El ave que no calla", cantaba que había un ave).
  Enigma: el mote "la Cotorra" de la veleta esconde la letra de la misma forma
  que MERCATOR en la parada 2 (letra doblada/repetida) — espejo deliberado,
  bookend de la Plaça del Mercat donde empieza y acaba la ruta.
- Subpreguntas: ave de la veleta (`loro`, `cotorra`…) · letra (`r`).

### Parada 9 (nueva) — "Lo que faltaba por ordenar" (cierre)

- Sin desplazamiento. `respuestas: ["mercader", "el mercader", "un mercader",
  "mercaderes", "mercader de seda"]` (+ variantes localizadas en en/fr/it).
- Enigma: "ocho paradas, ocho letras, ocho fechas... el Carmen nunca ordenó sus
  capas, pero el tiempo sí".
- Pistas: 1 = ordenar por año; 2 = las 8 letras con su año **en orden de ruta**
  (no de fecha, para no regalarlo); 3 = orden por fecha → MERCADER, con el
  guiño de que la misma palabra (en latín, MERCATOR) ya estaba en el friso de
  la parada 2.
- Historia + saberMas: recorrido cronológico 1356→1928; etimología latina de
  "mercader" (*mercator* / *mercari* / *merx, mercis*), parentesco con
  *mercado, mercancía, mercería, merced* y *Mercurio* (dios romano del
  comercio — la ruta empezó en un templo al comercio).
- `final.texto` reescrito para rematar sobre MERCADER.

## Notas de traducción (en/fr/it)

Todas las mecánicas de letra son no posicionales o usan posiciones ≤5, así que
ninguna necesita el aviso de "alfabeto internazionale di 26 lettere" en it (a
diferencia de `barcelona-raval`). Puntos fijados a mano:

- **Parada 2 y parada 9 (MERCATOR):** el friso de la Sala de Contratación está
  en latín y no se traduce en ningún idioma; la palabra MERCATOR se cita igual
  en los 4. La glosa ("mercader" / "merchant" / "marchand" / "mercante") va en
  el idioma local, pero la letra sale siempre de MERCATOR → R.
- **Parada 4 y 6 (números romanos):** 1381 = MCCCLXXXI y 1808 = MDCCCVIII usan
  ambos 5 símbolos distintos (M, C, L, X, I y M, D, C, V, I respectivamente) →
  E en los 4 idiomas; los numerales romanos son universales, no hay riesgo de
  traducción.
- **Parada 5 (María):** María / Mary / Marie / Maria — inicial **M** en los
  cuatro idiomas.
- **Parada 7 (BOLSERIA):** el nombre de la calle **no se traduce** en ningún
  idioma (ya era así en el contenido original). 4 consonantes (B, L, S, R) → D
  en los 4.
- **Parada 8 (COTORRA):** el mote se mantiene en los 4 idiomas (ya era así). La
  RR doblada → R en los 4.
- **Parada 9 (la palabra meta):** la respuesta es **MERCADER, palabra
  española**, presentada como hallazgo etimológico ligado al latín MERCATOR del
  friso. En en/fr/it el enigma dice explícitamente que la palabra se lee "en
  español"; se aceptan además las variantes locales (`merchant`, `marchand`,
  `mercante`…) como respuesta sin que eso cambie ninguna de las 8 mecánicas
  letra a letra.

## Verificación

- `node --test` (raíz): 216/218 — los 2 fallos son de `toulouse-capitole`
  (`catalogo.js` ya en 10 paradas por una sesión en paralelo, contenido `it`
  aún en 8), ajenos a esta ruta. `tests/contenido.test.js` no señala ningún
  fallo de `valencia-carmen`.
- `node --test` en `worker/`: 141/141.
- Script ad-hoc (`verifica-valencia-carmen.mjs`, en el scratchpad de la sesión,
  no versionado): deriva las 8 letras de forma independiente (sin leer los
  JSON) a partir de las mismas mecánicas del diseño y confirma que, ordenadas
  por fecha, dan MERCADER; contrasta esa derivación contra las 4 versiones del
  contenido (9 paradas, letras C·R·A·E·M·E·D·R en orden de ruta en los 4
  idiomas); y comprueba con `evaluarRespuesta()` que las respuestas canónicas
  de cada subpregunta —en los 4 idiomas— dan `correcto`, que una errata de 3+
  caracteres da `casi`, y que una letra de 1 carácter no tiene tolerancia
  Levenshtein.
- El contenido `*.json` viaja en el `wrangler deploy` del Worker (gitignore); a
  master solo van `js/catalogo.js` y este spec.

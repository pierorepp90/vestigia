# Revisión de enigmas — barcelona-raval

Fecha: 2026-08-31

## Objetivo

Dar a la ruta `barcelona-raval` un enigma integral: cada parada termina en **una
letra**, y las ocho letras, **ordenadas por la fecha** que cada parada trae en su
enunciado o su historia, deletrean **HISTORIA**. Se añade una parada 9 de cierre
que pide justamente esa ordenación.

Los enigmas de partida se resolvían casi todos con una observación directa (leer
un año en una placa, identificar una figura). Ahora el enunciado plantea la
situación pero **no explica el método** (contar letras, pasarlas a números,
recortar un tramo…); el método se descubre con lo que hay físicamente en el sitio
y se destraba con las pistas. Escape room difícil.

## Alcance

- `worker/src/contenido/barcelona-raval.{es,en,fr,it}.json` — las 8 paradas
  reescritas (todas pasan a `subpreguntas`) y una parada 9 nueva. Total: 9.
- `js/catalogo.js` — `barcelona-raval`: `numParadas` 8 → 9; `duracionMin`
  120 → 125.
- Sin cambios en `js/juego/figuras.js` (la parada 4 sigue usando `arcos-mitrado`,
  compartida con `toulouse-capitole`; el arco de medio punto sigue siendo la
  opción **A**).
- Sin cambios en `js/recomendaciones.js` ni en `acertijoMuestra` (sigue siendo un
  acertijo autónomo válido).

## Restricciones (de los tests de contenido)

- Cada parada: exactamente 3 pistas, la última con ≥2 palabras.
- `titulo`, `llegada`, `enigma`, `historia`, `fuente` no vacíos.
- Subpreguntas: `texto` no vacío y `respuestas` con ≥1 entrada no vacía.
- Las 4 versiones de idioma comparten numeración de paradas (1..9).
- Motor de respuestas: números y respuestas de 1-2 caracteres → solo coincidencia
  exacta (las letras `o/t/i/h/r/s/a` entran aquí); 3+ caracteres → Levenshtein
  tolerante.

## Mapa letra / fecha

| # | Parada (título es) | Letra | Año | Mecánica |
|---|---|---|---|---|
| 1 | El círculo que pintó un vecino | **O** | 1976 | JOAN MIRÓ = 8 letras (= 8 m de diámetro); única vocal repetida → O |
| 2 | El palacio de las dos verjas | **T** | 1888 | E(5) + G(7) + 8 (letras de JOAN MIRÓ) = 20 = chimeneas de la azotea; 20ª letra A–Z → T |
| 3 | El hospital que nació de una vez | **I** | 1401 | 1+4+0+1 = 6 hospitales; 6ª letra **desde el final** de BIBLIOTECA (de la placa "Biblioteca de Catalunya") → I |
| 4 | La iglesia hecha de retales | **H** | 911 | arco de medio punto (A) + capiteles visigodos; ALMANZOR = 8 letras → 8ª letra A–Z → H |
| 5 | El gato que no encontraba casa | **I** | 2003 | 15 años errantes − 6 (letras de BOTERO) = 9 → 9ª letra → I |
| 6 | El cubo que se volvió pista de skate | **R** | 1995 | vocal de las siglas MACBA (A); consonante que la rodea en "arte contemporáneo" (…R-a… / …a-R…) → R |
| 7 | El bar más viejo de la ciudad | **S** | 1820 | MARSELLA contiene "RS" (letras seguidas en el abecedario); la que cierra el tramo → S |
| 8 | El cine donde antes había otra cosa | **A** | 2012 | 2 salas de proyección aplicado a RAVAL (nombre del barrio) → 2ª letra → A |
| 9 | Lo que ordena el tiempo | — | — | cierre: ordenar las 8 letras por año → HISTORIA |

Orden de ruta: O·T·I·H·I·R·S·A. Orden por fecha: 911 H · 1401 I · 1820 S ·
1888 T · 1976 O · 1995 R · 2003 I · 2012 A → **HISTORIA**.

## Diseño por parada (texto `es`; en/fr/it son traducción fiel)

Todas las paradas 1-8 pasan de `respuestas` única a `subpreguntas`, con la última
subpregunta siempre "La letra de esta parada:". La 3.ª pista ("Solución") resuelve
todas las subpreguntas de la parada, **salvo en la parada 4**, donde por decisión
de diseño se queda en "contad las ocho letras de ALMANZOR" sin nombrar la H.

### Parada 1 — "El círculo que pintó un vecino" (O · 1976)

- Enigma: firma de un pintor catalán nacido en el Passatge del Crèdit; círculo de
  8 m instalado en 1976. Pide el nombre y "una vocal que no se comporta como las
  demás".
- Subpreguntas: pintor (`miro`, `joan miró`…) · letra (`o`).
- Pistas: 8 letras = 8 m, mirar solo vocales → una vocal repetida → O.

### Parada 2 — "El palacio de las dos verjas" (T · 1888)

- Título nuevo (el anterior desvelaba la criatura alada).
- Enigma: fachada de 1888; iniciales E·G en el hierro; "sumar esas dos iniciales
  como números con lo que os llevasteis del mosaico de Miró"; el resultado está
  repetido en la azotea.
- Subpreguntas: mecenas (`eusebi güell`…) · figura alada (`dragón`/`fénix`/
  `águila`; no alimenta la letra) · letra (`t`).
- Pistas: E=5, G=7, + 8 → 20 chimeneas → 20ª letra del abecedario A–Z → T.

### Parada 3 — "El hospital que nació de una vez" (I · 1401)

- Título nuevo (el anterior desvelaba la biblioteca, que es la mecánica).
- Enigma: fusión de hospitales en 1401; "sumad las cuatro cifras del año… marca
  también —si contáis desde el final— una letra dentro de la primera palabra de
  la placa de la entrada". La pista subraya "empezando por la última".
- Subpreguntas: nº de hospitales (`6`, `seis`) · letra (`i`).
- Historia reescrita: la unión de los seis hospitales dispersos.
- La placa dice "Biblioteca de Catalunya" — nombre propio catalán, **idéntico en
  los 4 idiomas**. El conteo es sobre BIBLIOTECA (10 letras), 6.ª desde el final = I.

### Parada 4 — "La iglesia hecha de retales" (H · 911)

- Título nuevo.
- Enigma: lápida de 911; arco románico de una sola curva (esquema `arcos-mitrado`);
  capiteles del pueblo anterior al islam; "la letra está en el nombre del enemigo
  del que se salvó en 985".
- Subpreguntas: arco (`a`) · capiteles (`visigoda`…) · letra (`h`).
- Pistas: 1 cubre arco + capiteles; 2 nombra a Almanzor ("de la A a la R", "es una
  sola letra"); 3 = "contad las ocho letras de ALMANZOR en el abecedario A–Z"
  (sin nombrar la H).
- `figuraId: "arcos-mitrado"` sin cambios.

### Parada 5 — "El gato que no encontraba casa" (I · 2003)

- Enigma: escultor colombiano; "quince años" sin sitio fijo hasta 2003;
  "enfrentar esos quince años con el apellido del artista".
- Subpreguntas: escultor (`botero`…) · letra (`i`).
- Historia ajustada: comprado en 1987, primera instalación en la Ciutadella hacia
  1988, hogar definitivo 2003 → "unos quince años". 15 − 6 (BOTERO) = 9 → I.

### Parada 6 — "El cubo que se volvió pista de skate" (R · 1995)

- Título acortado.
- Enigma: MACBA (siglas), museo de arte contemporáneo, 1995; explanada de skate;
  extremo curvo. La letra = "la consonante que, en la definición del museo, va
  justo antes y justo después de la vocal de sus siglas".
- Subpreguntas: qué alberga el cuerpo curvo (`la entrada`…) · letra (`r`).
- Pistas: MACBA → vocal repetida A; en "arte" la A va seguida de R, en
  "contemporáneo" la R va delante de la á → R. Funciona igual en es/en/fr/it
  ("arte/art" siempre lleva "AR").

### Parada 7 — "El bar más viejo de la ciudad" (S · 1820)

- Enigma: bar de 1820; la letra está en el nombre "Marsella", en cómo van
  colocadas sus letras; "un tramo que reconoceréis de algo recitado de memoria";
  "la letra es la que cierra ese tramo".
- Subpreguntas: año (`1820`) · letra (`s`).
- Pistas: el año pasa a la pista 2 (no está en la pista 1); tramo = RS (letras
  seguidas en el abecedario) → segunda letra = S.

### Parada 8 — "El cine donde antes había otra cosa" (A · 2012)

- Enigma: plaza del antiguo Barrio Chino; edificio de vidrio; "buscad el año en
  la fachada/web/entrada" (ya **no** se da en el enunciado); nº de salas de
  proyección aplicado "al nombre del barrio que lleváis toda la mañana
  recorriendo".
- Subpreguntas: nº de salas (`2`, `dos`) · año (`2012`) · letra (`a`).
- Pistas: 1 da año (2012) y nº de salas (2); 2 y 3 → 2ª letra de RAVAL = A.

### Parada 9 (nueva) — "Lo que ordena el tiempo" (cierre)

- Sin desplazamiento. `respuestas: ["historia", "la historia"]` (+ `history` en
  en, `histoire` en fr, `storia` en it).
- Enigma: "ocho paradas, ocho letras, ocho fechas… hay una manera de ordenarlas y
  darles sentido".
- Pistas: 1 = ordenar por año; 2 = las 8 letras con su año **en orden de ruta**
  (no de fecha, para no regalarlo); 3 = orden por fecha → HISTORIA.
- Historia + saberMas: la etimología griega de "historia" (*hístor*, "el que sabe
  porque ha visto"), en guiño al nombre del juego.
- `final.texto` reescrito para rematar sobre HISTORIA.

## Notas de traducción (en/fr/it)

Las mecánicas 1, 4, 5, 6, 7 y 8 portan solas (nombres propios, o "art/arte" con R
pegada a la A). Tres puntos fijados a mano:

- **Parada 2 (crítico en it):** las pistas anclan al "abecedario de la A a la Z,
  A=1" en los 4 idiomas. En **it** se dice explícito *"alfabeto internazionale di
  26 lettere (cifrario A1Z26)"* — con el alfabeto italiano de 21 letras, 20 daría
  V en vez de T. (H y la I de las paradas 4-5 son 8.ª y 9.ª en ambos alfabetos.)
- **Parada 3 (crítico en fr):** el conteo es sobre **BIBLIOTECA** (grafía
  catalana, de la placa "Biblioteca de Catalunya"), **sin traducir**. En fr no
  usar nunca *bibliothèque* (12 letras → daría T).
- **Parada 9 (la palabra meta):** la respuesta es **HISTORIA, palabra española**,
  presentada como hallazgo etimológico. En en/fr/it el enigma dice explícitamente
  que la palabra está "en español"; la Solución añade el origen griego. Las 8
  letras y las 8 mecánicas son idénticas en los 4 idiomas.
- Figura alada de la parada 2: no se ha podido confirmar si es dragón, águila o
  fénix (el dragón/murciélago documentado es la veleta del tejado). Se aceptan
  las tres formas en los 4 idiomas; no afecta a la letra.

## Verificación

- `node --test` (raíz): 111/111. `tests/contenido.test.js`: 9/9.
- `node --test` en `worker/`: 38/38.
- Script de comprobación de las 8 derivaciones de letra + `evaluarRespuesta`
  sobre las respuestas canónicas: todas `correcto`.
- El contenido `*.json` viaja en el `wrangler deploy` del Worker (gitignore); a
  master solo van `js/catalogo.js` y este spec.

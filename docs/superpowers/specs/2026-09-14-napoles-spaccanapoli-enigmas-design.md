# Revisión de enigmas — napoles-spaccanapoli

Fecha: 2026-09-14

## Objetivo

Dar a la ruta `napoles-spaccanapoli` un enigma integral: cada parada termina en
**una letra**, y las ocho letras, **ordenadas por la fecha** que cada parada trae
en su enunciado o su historia, deletrean **NEAPOLIS**. Se añade una parada 9 de
cierre que pide justamente esa ordenación.

Los enigmas de partida se resolvían casi todos con una observación directa
(identificar una figura, contar los 4 ángeles, leer el nombre de una calle).
Ahora el enunciado plantea la situación pero **no explica el método** (partir una
palabra, restar en el abecedario, leer un cero como letra…); el método se
descubre con lo que hay físicamente en el sitio y se destraba con las pistas.

## Alcance

- `worker/src/contenido/napoles-spaccanapoli.{es,en,fr,it}.json` — las 8 paradas
  reescritas (todas pasan a `subpreguntas`) y una parada 9 nueva. Total: 9.
- `js/catalogo.js` — `napoles-spaccanapoli`: `numParadas` 8 → 9; `duracionMin`
  120 → 125.
- Sin cambios en `js/juego/figuras.js`. La parada 6 sigue usando `escudos`
  (única en esta ruta, respuesta **A**: banda en diagonal) y la parada 7 sigue
  usando `almohadillado`, **compartida con `lisboa-alfama` parada 5** (Casa dos
  Bicos) — su respuesta sigue siendo **C** con **4** caras triangulares; no se ha
  tocado la figura ni el significado de sus opciones.

## Restricciones (de los tests de contenido)

- Cada parada: exactamente 3 pistas, la última con ≥2 palabras.
- `titulo`, `llegada`, `enigma`, `historia`, `fuente` no vacíos.
- Subpreguntas: `texto` no vacío y `respuestas` con ≥1 entrada no vacía.
- Las 4 versiones de idioma comparten numeración de paradas (1..9).
- Motor de respuestas: números y respuestas de 1-2 caracteres → solo
  coincidencia exacta (las letras `e/p/n/o/l/s/a/i` y el dígito `0` entran aquí);
  3+ caracteres → Levenshtein tolerante.

## Mapa letra / fecha

| # | Parada (título es) | Letra | Fecha ancla | Mecánica |
|---|---|---|---|---|
| 1 | Todo lo que guarda la puerta | **E** | 1294 | 3 portales + 2 leones de Tino di Camaino = 5 → 5.ª letra A1Z26 |
| 2 | El santo de las llaves y el santo de la espada | **P** | 1527 | San Pedro y San Pablo comparten inicial → P |
| 3 | La calle que no existe | **N** | s. V a.C. | SPACCANAPOLI se parte en SPACCA·NAPOLI → inicial de la mitad que nombra la ciudad |
| 4 | El personaje que no nació en Belén | **O** | 1620 | Pulcinella no tiene nada que ver con el Evangelio → 0 → se lee como O |
| 5 | Los ángeles que vigilan el ágora | **L** | 1656 | reutiliza la P de la parada 2 (16.ª letra) menos los 4 ángeles → 12 → L |
| 6 | El escudo del príncipe alquimista | **S** | 1753 | en CRISTO (Velato), el tramo S·T (consecutivas en el abecedario) → S |
| 7 | La fachada que nadie ha sabido leer | **A** | 1470 | las 4 caras de la punta de diamante convergen en 1 vértice → 1.ª letra A1Z26 |
| 8 | Las flores que llegan por una escalera | **I** | 1747 | plaza, iglesia y estatua comparten advocación (Inmaculada) → inicial I |
| 9 | Lo que el tiempo pone en su sitio | — | — | cierre: ordenar las 8 letras por fecha → NEAPOLIS |

Orden de ruta: E·P·N·O·L·S·A·I → no forma nada.
Orden por fecha: s. V a.C. N · 1294 E · 1470 A · 1527 P · 1620 O · 1656 L ·
1747 I · 1753 S → **NEAPOLIS**.

Huecos entre fechas consecutivas: sin problema salvo dos tramos que hay que leer
con cuidado — **1620/1656** (34 años, paradas 4 y 5) y **1747/1753** (6 años,
paradas 8 y 6). Ambos casos tienen su año explícito en el propio texto de la
parada, y el cierre los lista en su pista 2 (en orden de ruta, no de fecha, para
no regalar el resultado) antes de darlos ya ordenados en la pista 3 — el mismo
recurso que usó `barcelona-raval` con su racimo de cinco fechas en 36 años.

Ninguna operación se repite en dos paradas consecutivas: conteo+A1Z26 (P1) →
inicial compartida (P2) → partir palabra (P3) → pensamiento lateral (P4) →
aritmética alfabética con reutilización (P5) → letras consecutivas en el
abecedario (P6) → geometría+A1Z26 (P7) → advocación/inicial (P8).

## Diseño por parada (texto `es`; en/fr/it son traducción fiel)

Todas las paradas 1-8 pasan de `respuestas` única a `subpreguntas`, con la
última subpregunta siempre "La letra de esta parada:". Las paradas 6 y 7
conservan su `figuraId` y las respuestas de figura (A; C y 4) intactas.

### Parada 1 — "Todo lo que guarda la puerta" (E · 1294)

Título nuevo (el anterior, "El rosetón que no tiene cristales", dirigía la
mirada arriba; la letra está abajo, en los portales). Enunciado: identifica al
Cristo Benedicente del rosetón y pide contar los 3 portales y los 2 leones de
Tino di Camaino de la fachada. 3+2=5 → E. Historia reescrita para que 1294
(fundación angevina del Duomo) sea la fecha ancla, en vez de 1877-1905 (fachada
neogótica), que queda como dato secundario.

### Parada 2 — "El santo de las llaves y el santo de la espada" (P · 1527)

Sin cambio de título. La letra sale de que San Pedro y San Pablo empiezan por la
misma inicial — funciona igual en los 4 idiomas (Pedro/Pablo, Peter/Paul,
Pierre/Paul, Pietro/Paolo). Historia reescrita para anclar en 1527 (fundación de
la Deputazione del Tesoro) en vez de las estatuas de Finelli (h. 1640), que
quedan como detalle.

### Parada 3 — "La calle que no existe" (N · s. V a.C.)

Sin cambio de título. Tras identificar la placa (San Biagio dei Librai), la
letra sale de partir el propio apodo: SPACCANAPOLI → SPACCA·NAPOLI, y quedarse
con la inicial de la mitad que nombra la ciudad → N. "Spaccanapoli" no se
traduce en ningún idioma de la ruta, así que el corte es idéntico en los 4.

### Parada 4 — "El personaje que no nació en Belén" (O · 1620)

Tras identificar a Pulcinella, la letra sale de una vuelta de tuerca: su
aportación al Evangelio es cero, y el 0 se lee como la letra O. Es la mecánica
más atrevida de la ruta (pensamiento lateral puro, sin conteo ni A1Z26
intermedio). Historia reescrita con la fecha de Silvio Fiorillo llevando a
Pulcinella a escena hacia 1620 (antes decía solo "siglo XVII"); el dato del
oficio artesano del siglo XVIII y la fundación del siglo VIII de San Gregorio
Armeno bajan a saberMas.

### Parada 5 — "Los ángeles que vigilan el ágora" (L · 1656)

Tras contar los 4 ángeles del pedestal, la letra reutiliza la de la parada 2: P
es la 16.ª letra del abecedario; 16 − 4 = 12 → L. Es la única parada que exige
la letra de otra parada anterior (cohesión explícita entre paradas, como en
`barcelona-raval`).

### Parada 6 — "El escudo del príncipe alquimista" (S · 1753)

Sin cambio de título; figura `escudos` intacta (respuesta A: banda en
diagonal). La letra ya no está en el escudo sino en el nombre de la escultura
que espera dentro: en CRISTO (Velato) hay un tramo S·T, letras consecutivas
tanto en la palabra como en el abecedario; se toma la primera → S. Historia:
sube la fecha 1753 (Cristo Velato de Sanmartino) del saberMas al cuerpo de la
historia.

### Parada 7 — "La fachada que nadie ha sabido leer" (A · 1470)

Sin cambio de título; figura `almohadillado` intacta (respuestas C y 4,
compartidas con `lisboa-alfama`). Se añade una tercera subpregunta: las 4 caras
triangulares de la punta de diamante convergen en un único vértice → 1 → A.
Historia: se añade la fecha de construcción del Palazzo Sanseverino (1470, por
Novello da San Lucano; verificado), antes ausente del texto, que ahora es la
fecha ancla de la parada.

### Parada 8 — "Las flores que llegan por una escalera" (I · 1747)

Sin cambio de título. Tras identificar a la Inmaculada Concepción, la letra sale
de notar que la plaza, la iglesia y la estatua comparten advocación → inicial I
— funciona igual en los 4 idiomas (Inmaculada/Immaculate/Immaculée/Immacolata).
La llegada cambia "terminada en 1750" por "levantada entre 1747 y 1750" para
poder anclar en 1747 y separar la fecha de la parada 6 (1753).

### Parada 9 (nueva) — "Lo que el tiempo pone en su sitio" (cierre)

Sin desplazamiento. `respuestas`: `["neapolis", "neápolis", "la neapolis"]` (es),
`["neapolis"]` (en/it), `["neapolis", "néapolis", "la neapolis"]` (fr). Enigma:
"ocho paradas, ocho letras, ocho fechas… ordenadlas y leeréis la palabra que ha
estado debajo de todo el recorrido". Pistas: 1 = ordenar por fecha; 2 = las 8
letras con su año **en orden de ruta** (no de fecha); 3 = orden por fecha →
NEAPOLIS. Historia + saberMas: etimología griega de *Neápolis* (*néa pólis*,
"ciudad nueva"), su antecesora Parténope/Palépolis, y cómo el nombre llegó
intacto hasta el napolitano, el italiano, el francés y el español. `final.texto`
reescrito para rematar sobre NEAPOLIS.

## Notas de traducción (en/fr/it)

- **Parada 1 (E):** conteo (3 + 2 = 5) y A1Z26; sin dependencia de idioma.
- **Parada 2 (P):** funciona de forma nativa en los 4 idiomas — Pedro/Pablo,
  Peter/Paul, Pierre/Paul, Pietro/Paolo empiezan todos por P.
- **Parada 3 (N):** "Spaccanapoli" no se traduce en ningún idioma de la ruta
  (es un apodo napolitano que las 4 versiones conservan); el corte
  SPACCA·NAPOLI es idéntico en los 4.
- **Parada 4 (O):** el cero es universal; la idea "no tiene nada que ver con el
  Evangelio" traduce sin fricción. Se acepta `o` y `0` como respuesta en los 4
  idiomas.
- **Parada 5 (L):** ancla "abecedario de la A a la Z, A=1" explícito en las 4
  versiones (16 − 4 = 12). Con el alfabeto italiano de 21 letras (sin J/K/W/X/Y)
  P también cae en la 14.ª posición y L en la 10.ª — la resta da igual el mismo
  resultado (14 − 4 = 10 = L) porque ambas letras se desplazan lo mismo; no ha
  hecho falta ninguna nota especial en `it`.
- **Parada 6 (S):** CRISTO/CHRIST conservan el tramo "ST" en los 4 idiomas
  (es/it "Cristo", fr/en "Christ"), y S y T son consecutivas en cualquiera de
  los dos alfabetos.
- **Parada 7 (A):** geometría pura (4 caras, 1 vértice) y A1Z26(1); sin
  dependencia de idioma.
- **Parada 8 (I):** funciona de forma nativa en los 4 idiomas — Inmaculada,
  Immaculate, Immaculée e Immacolata empiezan todas por I.
- **Parada 9 (la palabra meta):** NEAPOLIS es un topónimo griego/latino
  **idéntico en los 4 idiomas** — no ha hecho falta presentarlo como préstamo de
  otro idioma (a diferencia de HISTORIA en `barcelona-raval` o BIBLIOTECA en su
  parada 3). Es la ruta con la i18n más limpia de las revisadas hasta ahora: dos
  paradas (P2 y P8) resuelven de forma nativa en los 4 idiomas sin ningún ajuste.

## Verificación

- `node --test tests/contenido.test.js` (raíz): 9/9.
- `node --test` (raíz, suite completa): sin fallos nuevos atribuibles a esta
  ruta (dos fallos preexistentes de `roma-centro`, de un trabajo en curso de
  otra sesión sobre contenido no versionado, quedaron resueltos por esa misma
  sesión antes de correr esta verificación).
- `node --test` en `worker/`: 141/141.
- Script propio (`verificar-napoles.mjs`) que reconstruye las 8 derivaciones de
  letra de las 4 versiones de idioma, comprueba que ordenadas por fecha dan
  NEAPOLIS, y que `evaluarRespuesta`/`evaluarSubpreguntas` aceptan como
  `'correcto'` todas las respuestas canónicas de cada subpregunta y del cierre;
  además comprueba que una errata de una letra en "neapolis" sigue dando
  tolerancia y que una respuesta claramente distinta ("barcelona") da
  `'incorrecto'`. Las 4 versiones: todo correcto.
- El contenido `*.json` viaja en el `wrangler deploy` del Worker (gitignore); a
  master solo van `js/catalogo.js` y este spec.

# Revisión de enigmas — florencia-centro

Fecha: 2026-09-14

## Objetivo

Dar a la ruta `florencia-centro` un enigma integral: cada parada termina en
**una letra**, y las nueve letras, **ordenadas por la fecha** que cada parada
trae en su enunciado o su historia, deletrean **RIVALIDAD**. Se añade una
parada 10 de cierre que pide justamente esa ordenación.

Los enigmas de partida se resolvían casi todos con una observación directa o
trivia suelta: contar tres colores de mármol y nombrar la bandera de Italia,
decir quién diseñó el Campanile, decir dónde está guardado el David auténtico,
decir a qué oficio se dedican las tiendas del Ponte Vecchio. Ahora el
enunciado plantea la situación pero **no explica el método** (contar letras,
pasarlas a número, sumar cifras de un año, partir un número romano por la
mitad…); el método se descubre con lo que hay físicamente en el sitio y se
destraba con las pistas.

## Alcance

- `worker/src/contenido/florencia-centro.{es,en,fr,it}.json` — las 10 paradas
  reescritas de cero. La parada del Campanile di Giotto (antigua parada 4, la
  de enigma más flojo: "¿quién lo diseñó?") se **elimina** para que el número
  de paradas de contenido (9) encaje con las letras de RIVALIDAD; las paradas
  5-10 originales se renumeran a 4-9, y se añade una parada 10 de cierre.
  Total: 8 → 9 de contenido + 1 de cierre = **10**, igual que antes.
- `js/catalogo.js` — `florencia-centro`: `numParadas` se queda en **10** (sin
  cambio) y `duracionMin` en **120** (sin cambio: se pierde una parada
  caminando y se gana una estática, efecto neutro). Se reescribe
  `acertijoMuestra` en los 4 idiomas porque el enigma que citaba (contar los
  colores de mármol de la fachada) ya no es el de la parada 1; el nuevo
  acertijo de muestra usa el Ponte Vecchio (parada 8), que sigue siendo un
  enigma autónomo válido fuera del juego.
- Sin cambios en `js/juego/figuras.js`: las cinco figuras de la ruta
  (`aparejo-cupula`, `puerta-paraiso`, `tipos-arco`, `almenas`, `giglio`) son
  exclusivas de `florencia-centro` (verificado que ninguna otra ruta las usa)
  y se reutilizan tal cual.
- Sin cambios en `js/recomendaciones.js` ni en el artículo de blog de
  Florencia en `catalogo.js` (su `cierre` no menciona el número de paradas).

## Restricciones (de los tests de contenido)

- Cada parada: exactamente 3 pistas, la última con ≥2 palabras.
- `titulo`, `llegada`, `enigma`, `historia`, `fuente` no vacíos.
- Subpreguntas: `texto` no vacío y `respuestas` con ≥1 entrada no vacía.
- Las 4 versiones de idioma comparten numeración de paradas (1..10).
- Motor de respuestas: números y respuestas de 1-2 caracteres → solo
  coincidencia exacta (las letras `d/a/l/i/v/r` y las opciones de figura
  `a/b/2` entran aquí); 3+ caracteres → Levenshtein tolerante.

## Mapa letra / fecha

| # | Parada (título es) | Letra | Año | Mecánica |
|---|---|---|---|---|
| 1 | El rostro más joven de la plaza | **D** | 1887 | inicial del apellido del arquitecto, Emilio **D**e Fabris |
| 2 | El muro que trepaba solo | **A** | 1436 | respuesta de la figura del aparejo (ladrillo vertical = **A**) |
| 3 | El escultor que se metió en su propia puerta | **L** | 1452 | inicial del nombre de pila del autor, **L**orenzo Ghiberti |
| 4 | El gigante prestado | **A** | 1873 | primera vocal de DAVID |
| 5 | Cuatro bronces al pie del héroe | **I** | 1554 | 9 años de fundición del Perseo (1545→1554) → 9.ª letra |
| 6 | Los arcos que iban un siglo por delante | **V** | 1382 | el arco romano es media vuelta de compás; mitad de diez (X) en cifra romana = **V** |
| 7 | Lo que un muro decía sin una palabra | **I** | 1314 | cifras del año de conclusión del Palazzo Vecchio: 1+3+1+4=9 → 9.ª letra |
| 8 | El puente que dejó de oler a carne | **D** | 1593 | "cuarto centenario" del nacimiento de Cellini (busto de 1901) → 4.ª letra |
| 9 | La flor que Francia intentó copiar | **R** | 1252 | única R en el nombre de la moneda, florín/fiorino |
| 10 | Lo que Florencia llevaba escrito desde 1252 | — | — | cierre: ordenar las 9 letras por año → RIVALIDAD |

Orden de ruta: D·A·L·A·I·V·I·D·R. Orden por fecha: 1252 R · 1314 I · 1382 V ·
1436 A · 1452 L · 1554 I · 1593 D · 1873 A · 1887 D → **RIVALIDAD**.

Cohesión deliberada: el escultor **Benvenuto Cellini** aparece en las paradas
5 (el Perseo) y 8 (el busto del Ponte Vecchio); las dos **I** (paradas 5 y 7)
salen las dos del número 9, por caminos distintos (una duración, una suma de
cifras); las dos **A** (2 y 4) y las dos **D** (1 y 8) refuerzan que el
jugador reconozca las repeticiones antes del cierre.

Variedad de mecánica en orden de ruta: inicial de nombre propio (1) → patrón
visual de figura (2) → inicial de nombre propio (3) → posición en palabra (4)
→ número histórico → A1Z26 (5) → pensamiento lateral con numeración romana (6)
→ cifras de un año → A1Z26 (7) → ordinal → A1Z26 (8) → letra única en palabra
(9). Ninguna mecánica se repite en dos paradas consecutivas.

## Diseño por parada (texto `es`; en/fr/it son traducción fiel)

Todas las paradas 1-9 usan `subpreguntas`, con la última siempre "La letra de
esta parada:". La 3.ª pista ("Solución") resuelve todas las subpreguntas de
la parada.

### Parada 1 — "El rostro más joven de la plaza" (D · 1887)

Título y enigma nuevos (el anterior pedía contar los tres colores de mármol y
nombrar la bandera de Italia — trivia directa). Ahora el enunciado cuenta que
la fachada neogótica es de 1887, seis siglos más joven que la catedral, y que
su arquitecto (Emilio De Fabris) murió sin verla acabada, como Giotto con el
campanario y Brunelleschi con la linterna — siembra del hilo generacional que
cierra la ruta. Subpreguntas: estilo arquitectónico (`neogótico`,
`historicismo`…) y letra (`d`, inicial de "De Fabris"). Es la parada más
ligera de la ruta, a propósito (calentamiento).

### Parada 2 — "El muro que trepaba solo" (A · 1436)

Enigma de la cúpula de Brunelleschi sin apenas tocar (seguía siendo de los
mejores: la figura `aparejo-cupula` obliga a seguir el patrón diagonal del
ladrillo vertical). Se añade que la pieza que completa el esquema (opción A)
es también la letra de la parada — la "solución" del enigma visual y la letra
coinciden a propósito.

### Parada 3 — "El escultor que se metió en su propia puerta" (L · 1452)

Título nuevo (el anterior, "La puerta que ganó el cielo", ya insinuaba el
apodo de Miguel Ángel). El enunciado ya no nombra a Ghiberti hasta la pista;
se apoya en el detalle de que escondió su autorretrato junto al de su padre
adoptivo Bartoluccio. Subpreguntas: zona del esquema (`2`) y letra (`l`,
inicial de "Lorenzo").

### Parada 4 — "El gigante prestado" (A · 1873)

Antigua parada 5 (David). Ya no pregunta directamente "¿dónde está el
original?" como única cosa que hacer: el enunciado subraya que hay **tres**
Davides en la ciudad y que lo único genuino en la plaza es el nombre; de ahí
sale la letra (primera vocal de DAVID). El `saberMas` añade el detalle
bíblico de las cinco piedras del arroyo — siembra deliberada para la
etimología de la parada de cierre.

### Parada 5 — "Cuatro bronces al pie del héroe" (I · 1554)

Antigua parada 6 (Perseo/Dánae). Se mantiene la identificación de Dánae entre
los cuatro bronces; la letra ahora sale de los nueve años que tardó Cellini
en fundir la pieza (1545→1554), no de un dato suelto.

### Parada 6 — "Los arcos que iban un siglo por delante" (V · 1382)

Antigua parada 7 (arcos Loggia/Palazzo Vecchio). Mecánica de letra nueva:
"pensamiento lateral" con la numeración romana — el arco de medio punto es
media vuelta de compás, y la mitad del número más romano de todos (diez) es
cinco, que los romanos escribían con una sola letra, V. Se prefirió a la
alternativa más segura ("inicial de Palazzo Vecchio") para no repetir un
tercer "nombre propio" en la ruta.

### Parada 7 — "Lo que un muro decía sin una palabra" (I · 1314)

Antigua parada 8 (almenas güelfa/gibelina). Se añade al enunciado la fecha de
conclusión del Palazzo Vecchio (1314, antes solo en `saberMas`) como dato
saliente: la letra sale de sumar sus cuatro cifras (1+3+1+4=9 → I), en eco
directo de la parada 5 (también un 9, por otro camino).

### Parada 8 — "El puente que dejó de oler a carne" (D · 1593)

Antigua parada 9 (Ponte Vecchio). Ya no pregunta "a qué se dedican las
tiendas" como única cosa (trivia). Se apoya en que el busto es de **el mismo
escultor** de la parada 5 (Cellini) y en que se colocó en 1901 para su
"cuarto centenario" — ese ordinal (4) da la letra D.

### Parada 9 — "La flor que Francia intentó copiar" (R · 1252)

Antigua parada 10 (giglio). Reorientada: el enunciado ya no se limita a la
figura giglio/flor de lis (que se mantiene como subpregunta), sino que trae
al primer plano el florín de oro (1252) — con la ironía de que fue Francia
quien copió la moneda de Florencia, no al revés. La letra es la única R del
nombre de la moneda (florín/fiorino), igual en los 4 idiomas.

### Parada 10 (nueva) — "Lo que Florencia llevaba escrito desde 1252" (cierre)

Sin desplazamiento. `respuestas`: `["rivalidad", "la rivalidad",
"rivalidades"]` (+ `rivalry` en en, `rivalité` en fr, `rivalità`/`rivalita`
en it, para ser generosos, aunque la palabra "descubierta" es la española).
Pistas: 1 = ordenar por año; 2 = las 9 letras con su año **en orden de ruta**
(no de fecha); 3 = orden por fecha → RIVALIDAD. `historia` repasa las nueve
fechas como una competición de seis siglos. `saberMas`: etimología de
"rival" (latín *rivalis*, de *rivus*, "arroyo" — los rivales compartían un
cauce), con guiño explícito a las cinco piedras del arroyo de la parada 4.
`final.texto` reescrito para rematar sobre RIVALIDAD sin cantar el número de
paradas.

## Notas de traducción (en/fr/it)

Las nueve mecánicas dan la misma letra en los 4 idiomas:

- **Parada 1 (D):** "De Fabris" es un apellido italiano, no se traduce; su
  inicial es D en los 4 idiomas.
- **Parada 2 (A):** respuesta de figura, neutra por definición.
- **Parada 3 (L):** "Lorenzo" (nombre de pila de Ghiberti) no se traduce.
- **Parada 4 (A):** "DAVID" es idéntico en es/en/fr/it; primera vocal A.
- **Parada 5 (I) — crítico en it:** "nueve años → 9.ª letra" se ancla siempre
  a "el abecedario de la A a la Z, con A=1"; 9 es además la 9.ª letra tanto en
  el alfabeto de 26 como en el italiano de 21 (I es la 9.ª en ambos), así que
  no hay trampa aquí, pero se mantiene la fórmula fija por coherencia con el
  resto de la ruta y con otras rutas ya revisadas.
- **Parada 6 (V):** la numeración romana (X, mitad = cinco = V) es universal;
  no depende del idioma.
- **Parada 7 (I) — mismo aviso que la parada 5:** 1+3+1+4=9 → I, seguro en
  los dos alfabetos por la misma razón (9 ≤ 21).
- **Parada 8 (D):** "cuarto centenario" / "fourth centenary" / "quatrième
  centenaire" / "quarto centenario" → el ordinal 4 es igual en las cuatro
  lenguas, y la 4.ª letra es D en ambos alfabetos.
- **Parada 9 (R):** florín (es), florin (en, fr), fiorino (it) — las cuatro
  grafías tienen **exactamente una R**. Verificado a mano letra por letra.
- **Parada 10 (la palabra meta):** RIVALIDAD se mantiene en español,
  presentada como hallazgo (igual que HISTORIA en `barcelona-raval`); en
  en/fr/it el enigma dice explícitamente "la palabra está en español", y la
  Solución añade la traducción entre paréntesis. El `saberMas` da el origen
  latino en las 4 versiones.

No hay ningún caso, a diferencia de `barcelona-raval` (parada 2, con el
alfabeto italiano de 21 letras), en el que la posición en el abecedario
supere el 21: los números usados son 4 y 9, ambos seguros en cualquiera de
los dos alfabetos.

## Verificación

- `node --test` en la raíz: 218/220 — **2 fallos preexistentes y ajenos a
  esta revisión**, en `tests/contenido.test.js`, sobre `florencia-santacroce`
  (ruta distinta, marcada como "a medias" en la memoria del proyecto; no se
  ha tocado en este trabajo). Los tests específicos de `florencia-centro`
  (numeración 1-10, paridad de idiomas, campos no vacíos, 3 pistas, 4 idiomas
  de `acertijoMuestra`) pasan.
- `node --test` en `worker/`: 141/141.
- Script de verificación puntual (`verificar-florencia-centro.mjs`, en el
  scratchpad de la sesión, no versionado): confirma que las 9 derivaciones de
  letra dan RIVALIDAD ordenadas por año en los 4 idiomas, que
  `evaluarRespuesta` acepta la respuesta canónica de cada subpregunta
  (incluida la letra) en las 4 versiones, que `evaluarSubpreguntas` resuelve
  correctamente con las respuestas canónicas, y que la parada de cierre
  acepta "rivalidad" exacto y una errata de una letra como "casi".
- El contenido `*.json` viaja en el `wrangler deploy` del Worker (gitignore);
  a master solo van `js/catalogo.js` y este spec.

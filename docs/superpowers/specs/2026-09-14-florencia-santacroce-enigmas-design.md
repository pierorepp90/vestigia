# Revisión de enigmas — florencia-santacroce

Fecha: 2026-09-14

## Objetivo

Dar a la ruta `florencia-santacroce` un enigma integral: cada parada termina en
**una letra**, y las ocho letras, **ordenadas por la fecha** que cada parada trae
en su enunciado o su historia, deletrean **OLTRARNO** — el propio barrio donde
termina la ruta ("oltre l'Arno", al otro lado del río). Se añade una parada 9 de
cierre que pide justamente esa ordenación.

Los enigmas de partida se resolvían casi todos con una observación directa (leer
un año grabado, contar estatuas, identificar un apellido en el nombre de una
torre). Ahora el enunciado plantea la situación pero **no explica el método**
(contar letras, partir un número, buscar la letra doblada o la que más se
repite…); el método se descubre con lo que hay físicamente en el sitio y se
destraba con las pistas. Escape room difícil.

## Alcance

- `worker/src/contenido/florencia-santacroce.{es,en,fr,it}.json` — las 8 paradas
  existentes reescritas (todas pasan a `subpreguntas`) y una parada 9 nueva.
  Total: 9.
- `js/catalogo.js` — `florencia-santacroce`: `numParadas` 8 → 9; `duracionMin`
  120 → 125; `resumen` ("ocho paradas" → "nueve paradas") en los 4 idiomas.
  `acertijoMuestra` sin cambios (sigue siendo un acertijo autónomo válido).
- Sin cambios en `js/juego/figuras.js` (la parada 1 sigue usando `estrellas` y
  la parada 6 `ventanas`, ambas exclusivas de esta ruta — no compartidas con
  ninguna otra) ni en `js/recomendaciones.js`.

## Restricciones (de los tests de contenido)

- Cada parada: exactamente 3 pistas, la última con ≥2 palabras.
- `titulo`, `llegada`, `enigma`, `historia`, `fuente` no vacíos.
- Subpreguntas: `texto` no vacío y `respuestas` con ≥1 entrada no vacía.
- Las 4 versiones de idioma comparten numeración de paradas (1..9).
- Motor de respuestas: números y respuestas de 1-2 caracteres → solo
  coincidencia exacta (las letras `l/o/n/r/a/t` entran aquí); 3+ caracteres →
  Levenshtein tolerante.

## Mapa letra / fecha

| # | Parada (título es) | Letra | Año | Mecánica |
|---|---|---|---|---|
| 1 | La estrella que no debería estar ahí | **L** | 1294 | en NICCOLÒ (nombre de pila de Matas), la consonante que va detrás de la O (ni N ni C) → L |
| 2 | El mármol que casi nadie mira | **O** | 1565 | el disco parte el campo en 2 mitades → partir 1565 por la mitad: 15\|65 → 15ª letra A–Z → O |
| 3 | Las artes que velan al escultor | **N** | 1564 | 3 alegorías + el busto de Miguel Ángel = 4 figuras de mármol → 4ª letra de BUONARROTI → N |
| 4 | El retrato que llegó siglos tarde | **R** | 1508 | en VOLTERRA (apellido de Daniele da Volterra), la letra doblada …RR… → R |
| 5 | La torre que no quiso apartarse | **O** | 1250 | en CORRIDOIO (nombre italiano del Corridoio Vasariano), la letra que se repite 3 veces → O |
| 6 | La puerta que se convirtió en ventana | **A** | 1458 | inicial del apellido del arquitecto, AMMANNATI → A |
| 7 | La fachada que Brunelleschi dejó desnuda | **R** | 1446 | el encalado es de finales del siglo XVIII → 18 → 18ª letra A–Z → R |
| 8 | Las manos que todavía trabajan | **T** | 1332 | suma de cifras de 1332 (Porta San Frediano) = 9 → 9ª letra de BUONARROTI → T |
| 9 | Lo que el tiempo pone en su sitio | — | — | cierre: ordenar las 8 letras por año → OLTRARNO |

Orden de ruta: L·O·N·R·O·A·R·T — no forma nada. Orden por fecha: 1250 O · 1294 L ·
1332 T · 1446 R · 1458 A · 1508 R · 1564 N · 1565 O → **OLTRARNO**.

Nota de diseño: 1564 (parada 3) y 1565 (parada 2) quedan deliberadamente
adyacentes — el cuerpo de Miguel Ángel vuelve a Florencia el año antes de que se
marque el campo de Calcio Storico — como único punto donde el enigma de cierre
exige ordenar con cuidado. Cada pista "Solución" de las paradas 1-8 termina con
"(Año de esta parada: XXXX.)" para que el par letra/año quede inequívoco incluso
cuando la parada menciona más de un año (p. ej. parada 1: 1294 del inicio de la
basílica vs. 1863 de la fachada; parada 4: 1508 de la compra de la casa vs. 1875
del busto).

## Diseño por parada (texto `es`; en/fr/it son traducción fiel)

Todas las paradas 1-8 pasan de `respuestas` única a `subpreguntas`, con la
última subpregunta siempre "La letra de esta parada:". La 3.ª pista
("Solución") resuelve todas las subpreguntas de la parada.

### Parada 1 — "La estrella que no debería estar ahí" (L · 1294)

Título sin cambios. El enigma ancla el año 1294 (antes solo en `saberMas`) y no
explica el método: apunta al "nombre de pila" de Niccolò Matas sin decir que hay
que mirar sus consonantes. Tres subpreguntas: estrella (figura `estrellas`, B),
puntas (6), letra (l). Mecánica: en NICCOLÒ las consonantes son N, C, C y L; las
tres primeras van casi juntas al principio, la L queda sola justo detrás de la
O — es la letra. Funciona igual en los 4 idiomas (nombre propio, sin alfabeto
de por medio).

### Parada 2 — "El mármol que casi nadie mira" (O · 1565)

Título nuevo (el anterior, "...el centro del campo", telegrafiaba la mitad).
Dos subpreguntas más la letra: año grabado (1565), en cuántas partes divide el
disco el campo (2). Mecánica: igual que el disco parte el campo en dos mitades
exactas, se parte el año grabado en dos: 15\|65 → la primera mitad, 15, es la
letra número 15 de la A a la Z.

### Parada 3 — "Las artes que velan al escultor" (N · 1564)

Se añade el detalle (verificable: el monumento de Vasari a Miguel Ángel en
Santa Croce lleva tres estatuas alegóricas sentadas —Escultura, Pintura,
Arquitectura— rematadas por un busto-retrato del propio Miguel Ángel) de que hay
un **cuarto** mármol, el busto, además de las tres estatuas. Subpreguntas:
estatuas sentadas (3), figuras de mármol en total (4), letra (n). Mecánica: 4 →
4ª letra de BUONARROTI (el apellido real del artista, que el enunciado no
nombra) → N.

### Parada 4 — "El retrato que llegó siglos tarde" (R · 1508)

El "entre 1612 y 1643" de la reconstrucción baja del enigma a la `historia`,
para dejar 1508 (compra de la casa) como año de esta parada, con 1875 (el
busto) como segundo dato necesario para las subpreguntas pero no para el
cómputo de fecha. Subpreguntas: año del busto (1875), amigo que dejó el modelo
(Daniele da Volterra), letra (r). Mecánica: en VOLTERRA la única letra escrita
dos veces seguidas es …RR… → R. La pista 3 señala que el mismo par se escondía
ya en BUONARROTI, por cohesión con la parada 3.

### Parada 5 — "La torre que no quiso apartarse" (O · 1250)

El "En 1565" del Corridoio Vasariano sale del enigma (para no competir con el
año de la parada 2); se mantiene "hacia 1250" como año de esta parada, ligado
al hecho de que con la piedra sobrante de rebajar las torres se levantó parte
de Oltrarno. Subpreguntas: torres en pie de las 4 (1), familia (Mannelli),
letra (o). Mecánica: en CORRIDOIO (nombre **italiano** del pasillo, que se
mantiene sin traducir en los 4 idiomas) la letra que se repite tres veces —más
que ninguna otra— es la O.

### Parada 6 — "La puerta que se convirtió en ventana" (A · 1458)

Subpreguntas sin cambios de fondo: tipo de ventana (figura `ventanas`, B),
arquitecto (Ammannati), letra (a). Mecánica: inicial del apellido AMMANNATI →
A. (Alfabeto-independiente: A es la 1ª letra en cualquier ordenación.)

### Parada 7 — "La fachada que Brunelleschi dejó desnuda" (R · 1446)

Cambio de mecánica respecto a la propuesta inicial: en vez de apoyarse en la
edad de Miguel Ángel al tallar el crucifijo de dentro (una cifra discutida
entre 17 y 18 años según la fuente), se usa un dato ya afirmado por la
`historia` existente y más sólido: el encalado actual de la fachada es de
**finales del siglo XVIII**. Subpreguntas: elementos decorativos (0), siglo del
encalado (XVIII), letra (r). Mecánica: siglo XVIII → 18 → letra número 18 de la
A a la Z → R. El crucifijo de Miguel Ángel (~1493, con unos dieciocho años)
queda solo en `saberMas`, como color, sin ser parte del cómputo.

### Parada 8 — "Las manos que todavía trabajan" (T · 1332)

Cambio de mecánica respecto a la propuesta inicial: en vez de contar "tantas
letras como paradas tiene la ruta" (dependiente de un metadato externo a la
propia parada), se usa la suma de cifras del año de la Porta San Frediano —el
mismo patrón que ya usaba `barcelona-raval` en su parada 3—, que ahora sube del
`saberMas` al enigma como año de esta parada. Subpreguntas: años mínimos del
registro de talleres históricos (50), apellido seguido toda la ruta
(Buonarroti), letra (t). Mecánica: 1332 → 1+3+3+2 = 9 → 9ª letra de BUONARROTI
→ T.

### Parada 9 (nueva) — "Lo que el tiempo pone en su sitio" (cierre)

Sin desplazamiento. `respuestas: ["oltrarno", "l oltrarno", "loltrarno",
"oltre l arno", "oltrarno firenze/florence"]` (equivalente en los 4 idiomas).
Enigma: "ocho paradas, ocho letras, ocho fechas… hay otro orden, el del tiempo,
y puesto así deletrean una sola palabra. La habéis tenido bajo los pies toda la
segunda mitad del paseo." Pistas: 1 = ordenar por año; 2 = las 8 letras con su
año **en orden de ruta** (no de fecha, para no regalarlo); 3 = orden por fecha
→ OLTRARNO. Historia + saberMas: la etimología de *oltre l'Arno* ("más allá del
Arno", del latín *ultra*) y el origen incierto, prerromano, del propio nombre
del río. `final.texto` reescrito para rematar sobre OLTRARNO.

## Notas de traducción (en/fr/it)

Las mecánicas de las paradas 1, 3, 4, 6 y 8 portan solas: se apoyan en nombres
propios (NICCOLÒ, BUONARROTI, VOLTERRA, AMMANNATI) que son idénticos en los 4
idiomas y en operaciones (posición en el nombre, letra doblada, inicial) que no
dependen del alfabeto. Dos puntos fijados a mano, ambos críticos en **it**:

- **Paradas 2 y 7 (críticas en it):** ambas usan el cifrado A1Z26 (partir un
  número o convertir un siglo en número, y buscar la letra en esa posición del
  abecedario). Las pistas anclan siempre "abecedario de la A a la Z, A=1" /
  "26 letras", y en **it** se dice explícito *"alfabeto internazionale di 26
  lettere (cifrario A1Z26)"* — con el alfabeto italiano de 21 letras, la
  posición 15 de la parada 2 daría P (no O) y la 18 de la parada 7 daría T
  (no R).
- **Parada 5 (crítica en las 4, sobre todo fuera de it):** el conteo es sobre
  **CORRIDOIO**, la grafía **italiana** del Corridoio Vasariano, mantenida sin
  traducir en los 4 idiomas (ya lo hacían los archivos originales). En fr/en,
  "corridor" tiene tres R y solo dos O — daría R, no O. En es, "corredor" tiene
  dos R y dos O — empate, ambigüo. Solo CORRIDOIO (con sus tres O) funciona.
- **Parada 9 (la palabra meta):** **OLTRARNO es idéntica en los 4 idiomas**
  (topónimo italiano, ya usado tal cual en los 4 archivos originales) — a
  diferencia de HISTORIA en `barcelona-raval`, no hace falta presentarla como
  "palabra en español"; el enigma de cierre funciona igual, sin marco
  adicional, en es/en/fr/it.

## Verificación

- `node --test` (raíz): 216/218 — los 2 fallos son de `paris-marais` (ruta
  distinta, a medio revisar por otra sesión en paralelo el mismo día; sin
  relación con este trabajo). `tests/contenido.test.js` sobre
  `florencia-santacroce`: sin fallos.
- `node --test` en `worker/`: 141/141.
- Script de verificación propio: para los 4 idiomas, las 8 derivaciones de
  letra —en el orden de fecha 1250/1294/1332/1446/1458/1508/1564/1565—
  deletrean OLTRARNO; `evaluarRespuesta`/`evaluarSubpreguntas` aceptan todas las
  respuestas canónicas de cada subpregunta (incluida la parada 9) y rechazan una
  respuesta obviamente incorrecta.
- El contenido `*.json` viaja en el `wrangler deploy` del Worker (gitignore); a
  `master` solo van `js/catalogo.js` y este spec.

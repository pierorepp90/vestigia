# Revisión de enigmas — madrid-austrias

Fecha: 2026-09-14

## Objetivo

Dar a la ruta `madrid-austrias` un enigma integral: cada parada termina en **una
letra**, y las ocho letras, **ordenadas por la fecha** que cada parada trae en su
enunciado o su historia, deletrean **IMPERIAL**. Se añade una parada 9 de cierre
que pide justamente esa ordenación.

Los enigmas de partida se resolvían casi todos con una observación directa
(identificar una figura en un escudo, leer un año en una inscripción, contar
patas o columnas). Ahora el enunciado plantea la situación pero **no explica el
método** (posición en una palabra, cifrado A1Z26, conversión a números
romanos...); el método se descubre con lo que hay físicamente en el sitio y se
destraba con las pistas. Escape room difícil.

## Alcance

- `worker/src/contenido/madrid-austrias.{es,en,fr,it}.json` — las 8 paradas
  reescritas (todas pasan a `subpreguntas`) y una parada 9 nueva. Total: 9.
- `js/catalogo.js` — `madrid-austrias`: `numParadas` 8 → 9; `duracionMin`
  120 → 125. El artículo de curiosidades enlazado (`enlacesRutas:
  ['madrid-austrias']`, id `madrid`) cambia "el primero de ocho detalles" por
  "el primero de una ristra/serie de detalles" en los 4 idiomas, para no cantar
  el número de paradas.
- Sin cambios en `js/juego/figuras.js` (la parada 6 sigue usando `plaza-mayor`,
  figura **exclusiva** de esta ruta — comprobado que ningún otro `worker/src/
  contenido/*.json` la referencia).
- Sin cambios en `js/recomendaciones.js`.

## Restricciones (de los tests de contenido)

- Cada parada: exactamente 3 pistas, la última con ≥2 palabras.
- `titulo`, `llegada`, `enigma`, `historia`, `fuente` no vacíos.
- Subpreguntas: `texto` no vacío y `respuestas` con ≥1 entrada no vacía.
- Las 4 versiones de idioma comparten numeración de paradas (1..9).
- Motor de respuestas: números y respuestas de 1-2 caracteres (las letras
  sueltas i/r/a/m/l/e/p) → solo coincidencia exacta; 3+ caracteres → Levenshtein
  tolerante. Se han añadido variantes generosas en las respuestas de texto
  (incluida, en la parada 1, la variante "dragón/sierpe/culebra" que usa el
  artículo de curiosidades enlazado, aunque las pistas fijan "grifo" como forma
  canónica).

## Mapa letra / fecha

| # | Parada (título es) | Letra | Año | Mecánica |
|---|---|---|---|---|
| 1 | La placa que pisa todo el mundo | **I** | 1950 | GRIFO/GRIFFIN/GRIFFON/GRIFONE — 3ª letra en los 4 idiomas |
| 2 | El que solo trabaja una noche al año | **R** | 1866 | primeros 2 dígitos del año (18) → 18ª letra del abecedario A–Z |
| 3 | El oso que no está en el escudo | **A** | 1967 | ALCALÁ (calle que nace en la parada) escrita con una sola vocal repetida |
| 4 | El jinete que llegó con dos siglos de retraso | **M** | 1619 | MÉDICI/MEDICI/MÉDICIS/MEDICI (familia que regaló la estatua) — inicial |
| 5 | La diosa escondida entre cien personajes | **L** | 1992 | 12 signos del zodiaco de la fachada → 12ª letra del abecedario A–Z |
| 6 | Los accesos que nadie cuenta | **E** | 1790 | CUCHILLEROS, 4ª letra desde el final (el 4 = esquina del plano, figura `plaza-mayor`) |
| 7 | La fachada que mira hacia la calle equivocada | **I** | 1537 | 1537 en números romanos, MDXXXVII → símbolo final |
| 8 | La vigilante del cruce | **P** | 1625 | de vuelta en el punto de partida: PUERTA (del Sol) — inicial |
| 9 | Lo que Madrid fue por encima de todo | — | — | cierre: ordenar las 8 letras por año → IMPERIAL |

Orden de ruta: I·R·A·M·L·E·I·P. Orden por fecha: 1537 I · 1619 M · 1625 P ·
1790 E · 1866 R · 1950 I · 1967 A · 1992 L → **IMPERIAL**.

## Diseño por parada (texto `es`; en/fr/it son traducción fiel)

Todas las paradas 1-8 pasan de `respuestas` única a `subpreguntas`, con la
última subpregunta siempre "La letra de esta parada:". La 3.ª pista
("Solución") resuelve todas las subpreguntas de la parada.

- **Parada 1** ("La placa que pisa todo el mundo", I·1950): se mantiene la
  identificación del animal del escudo del Kilómetro Cero (ahora con la placa
  fechada en 1950, no en el siglo XVIII/2023, que pasan a detalle secundario en
  `historia`). Respuestas generosas: `grifo` y variantes, más `dragón`/`sierpe`/
  `culebra` por si el jugador conoce el artículo de curiosidades enlazado (que
  llama "dragón" a la misma criatura). La letra sale de la 3ª letra de GRIFO/
  GRIFFIN/GRIFFON/GRIFONE — idéntica en los 4 idiomas porque las cuatro palabras
  empiezan por G-R-I-.
- **Parada 2** ("El que solo trabaja una noche al año", R·1866): la tradición
  de la bola (1890) se traslada de `historia` a `saberMas` para que 1866 (año
  del reloj) sea la única fecha operativa de la parada. Letra: los dos primeros
  dígitos del año, 18, contados en el abecedario A1Z26.
- **Parada 3** ("El oso que no está en el escudo", A·1967): se añade una frase
  de enlace con la parada 1 ("el mismo año, 1967, en que la Real Academia
  depuró el escudo y borró el grifo"). Letra: ALCALÁ, la calle que nace a los
  pies del oso, escrita con una sola vocal repetida.
- **Parada 4** ("El jinete que llegó con dos siglos de retraso", M·1619):
  título nuevo (el anterior, "tres fechas", adelantaba la mecánica). Se
  mantiene la lectura de la inscripción para 1619. Letra: inicial de MÉDICI,
  la familia que regaló la estatua (ya mencionada en el enunciado); se evita
  depender del año exacto en que la inscripción sitúa el regreso de la corte
  (1606), que no se ha podido verificar carácter a carácter. `saberMas` suma la
  leyenda de los gorriones muertos hallados dentro del caballo hueco en la
  restauración de 1931.
- **Parada 5** ("La diosa escondida entre cien personajes", L·1992): letra a
  partir de los 12 signos del zodiaco de los frescos (A1Z26).
- **Parada 6** ("Los accesos que nadie cuenta", E·1790, figura `plaza-mayor`
  sin cambios): se mantienen las dos subpreguntas existentes (10 accesos,
  esquina 4 de Cuchilleros) y se añade la letra: 4ª letra desde el final de
  CUCHILLEROS, reutilizando el "4" de la esquina que el jugador acaba de
  localizar en la figura. Se realza 1790 (el incendio que obligó a Villanueva a
  reconstruir la plaza) como fecha operativa.
- **Parada 7** ("La fachada que mira hacia la calle equivocada", I·1537):
  letra a partir de convertir 1537 a números romanos (MDXXXVII) y quedarse con
  el símbolo final.
- **Parada 8** ("La vigilante del cruce", P·1625; título nuevo, el anterior
  revelaba "Venus", que ahora es la propia subpregunta): el año operativo es
  1625 (la Venus original, traída de Florencia), no 1986 (año de la réplica,
  que queda expresamente descartado en el enunciado como "no os sirve", para no
  competir como fecha). Letra: inicial de PUERTA (del Sol) — pensamiento
  lateral, el jugador debe notar que ha vuelto al punto de partida.
- **Parada 9** (nueva) — "Lo que Madrid fue por encima de todo": sin
  desplazamiento. `respuestas: ["imperial", "la imperial", "madrid imperial"]`
  (+ variantes locales en en/fr/it). Pistas: 1 = ordenar por año; 2 = las 8
  letras con su año **en orden de ruta** (no de fecha); 3 = orden por fecha →
  IMPERIAL. `historia` resume las 8 fechas y liga los monumentos a Madrid como
  capital imperial de los Austrias. `saberMas`: etimología de "imperial" (lat.
  *imperium*, "poder de mandar", de *imperare*), con guiño al Kilómetro Cero de
  la parada 1 (el punto desde el que un Estado mide sus distancias) y a la
  corona imperial del escudo de Madrid (Carlos I, 1554) depurada en 1967 junto
  con el grifo.
- `final.texto` reescrito para enumerar los 8 hallazgos y rematar en IMPERIAL.

## Notas de traducción (en/fr/it)

Las mecánicas 3 (ALCALÁ), 6 (CUCHILLEROS), 7 (números romanos) y 8 (PUERTA del
Sol) portan solas: son topónimos o conversiones universales, no se traducen.
Puntos fijados a mano:

- **Parada 1:** GRIFO (es) / GRIFFIN (en) / GRIFFON (fr) / GRIFONE (it) — las
  cuatro palabras empiezan por G-R-I-, así que "la 3ª letra" da I en los 4
  idiomas sin necesidad de fijar una única grafía.
- **Paradas 2 y 5 (crítico en it):** las pistas anclan siempre a "abecedario de
  la A a la Z, A=1" / "alfabeto internazionale di 26 lettere (cifrario
  A1Z26)" explícito en it. Con el alfabeto italiano de 21 letras, la parada 2
  (18) daría T en vez de R, y la parada 5 (12) daría N en vez de L.
- **Parada 4:** MÉDICI/MEDICI/MÉDICIS/MEDICI — inicial M en los 4 idiomas.
- **Parada 9 (la palabra meta):** la respuesta es **IMPERIAL**, presentada como
  palabra española pero prácticamente idéntica en los 4 idiomas (`imperial` en
  es/en, `impérial` en fr, `imperiale` en it) — mucho menor fricción de
  reconocimiento que en revisiones anteriores (p. ej. HISTORIA en
  barcelona-raval). Las pistas de en/fr/it lo señalan explícitamente en la
  Solución. Las 8 letras y las 8 mecánicas son idénticas en los 4 idiomas.

## Verificación

- `node --test` (raíz): 218 tests, 216 pass / 2 fail — los 2 fallos son de
  `florencia-santacroce` (contenido `en`/`es` ya con 9 paradas, `fr`/`it` y
  `catalogo.js` todavía en 8; trabajo de otra sesión, ajeno a esta revisión).
  Ningún test de `madrid-austrias` falla.
- `node --test` en `worker/`: 141/141 OK.
- Script de comprobación ad hoc: las 8 derivaciones de letra (en orden de ruta)
  y su reordenación por año dan IMPERIAL en los 4 idiomas; `evaluarRespuesta` y
  `evaluarSubpreguntas` aceptan las respuestas canónicas de cada
  parada/subpregunta, incluida la respuesta final de la parada 9.
- El contenido `*.json` viaja en el `wrangler deploy` del Worker (gitignore); a
  `master` solo van `js/catalogo.js` y este spec.

## Pendiente (fuera de alcance de esta revisión)

`florencia-santacroce`: los archivos `en`/`es` en disco ya tienen 9 paradas
(probablemente una revisión de enigmas en curso de otra sesión) pero `fr`/`it`
y `js/catalogo.js` (`numParadas: 8`) no se actualizaron a la vez, lo que rompe
2 tests de `tests/contenido.test.js`. No se toca en este commit — es contenido
de otra ruta y de otro trabajo en curso; se avisa al usuario por separado.

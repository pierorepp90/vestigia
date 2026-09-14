# Revisión de enigmas — paris-montmartre

Fecha: 2026-09-14

## Objetivo

Dar a la ruta `paris-montmartre` un enigma integral: cada parada termina en
**una letra**, y las ocho letras, **ordenadas por la fecha** que cada parada
trae en su enunciado o su historia, deletrean **BOHEMIOS**. Se añade una
parada 9 de cierre que pide justamente esa ordenación.

Los enigmas de partida se resolvían casi todos con una observación directa
(leer un año en una placa, identificar a Juana de Arco, contar tres
hornacinas). Ahora el enunciado plantea la situación pero **no explica el
método** (numeral romano, cifras de un año, geometría de una planta,
inicial de un nombre propio…); el método se descubre con lo que hay
físicamente en el sitio y se destraba con las pistas. Escape room difícil.

## Alcance

- `worker/src/contenido/paris-montmartre.{es,en,fr,it}.json` — las 8
  paradas reescritas (todas pasan a `subpreguntas`) y una parada 9 nueva.
  Total: 9.
- `js/catalogo.js` — `paris-montmartre`: `numParadas` 8 → 9; `duracionMin`
  120 → 125. `dificultad` se mantiene en `facil` (gratis), como quedó
  `barcelona-born` tras su propia revisión.
- Sin cambios en `js/juego/figuras.js` (la parada 8 sigue usando
  `plantas-iglesia`, figura exclusiva de esta ruta; la opción correcta
  sigue siendo la **B**, la cruz griega).
- Sin cambios en `js/recomendaciones.js`.

## Restricciones (de los tests de contenido)

- Cada parada: exactamente 3 pistas, la última con ≥2 palabras.
- `titulo`, `llegada`, `enigma`, `historia`, `fuente` no vacíos.
- Subpreguntas: `texto` no vacío y `respuestas` con ≥1 entrada no vacía.
- Las 4 versiones de idioma comparten numeración de paradas (1..9).
- Motor de respuestas: números y respuestas de 1-2 caracteres → solo
  coincidencia exacta (las letras `i/o/m/b/e/s/h` entran aquí); 3+
  caracteres → Levenshtein tolerante.

## Mapa letra / fecha

| # | Parada (título es) | Letra | Año | Mecánica |
|---|---|---|---|---|
| 1 | Los jinetes que vigilan la entrada | **I** | 1927 | El segundo jinete es Luis IX (San Luis); IX = 9 → 9.ª letra A–Z → I |
| 2 | El ayuntamiento de un pueblo que ya no existe | **O** | 1860 | La placa marca 1790, pero la letra sale del año de la anexión: 1+8+6+0 = 15 → O |
| 3 | El barco que nunca flotó | **M** | 1907 | *Les Demoiselles d'Avignon* parte la pintura en dos; la letra parte el abecedario en dos mitades de 13 → 13.ª letra → M |
| 4 | El molino que se subió al tejado | **B** | 1809 | De ~30 molinos históricos solo sobreviven 2 → 2.ª letra → B |
| 5 | El conejo que escapó de la cazuela | **E** | 1875 | LAPIN (el animal del cartel de Gill, en francés) mide 5 letras → 5.ª letra → E |
| 6 | La viña que salvó un barrio de artistas | **S** | 1933 | La calle linde del Clos es Saint-Vincent, patrón de los viñadores → inicial → S |
| 7 | Los dioses marinos a los pies de la basílica | **O** | 1932 | La fuente se terminó en 1932: 1+9+3+2 = 15 → O (mismo método que la parada 2) |
| 8 | Las cúpulas que cierran el círculo | **H** | 1873 | Planta de cruz griega (fig. B): 8 esquinas salientes → 8.ª letra → H |
| 9 | Lo que el tiempo pone en fila | — | — | cierre: ordenar las 8 letras por año → BOHEMIOS |

Orden de ruta: I·O·M·B·E·S·O·H. Orden por fecha: 1809 B · 1860 O · 1873 H ·
1875 E · 1907 M · 1927 I · 1932 O · 1933 S → **BOHEMIOS**.

Variedad de operación (ruta 1→8): numeral romano → A1Z26 · cifras de un año
· mitad del abecedario (13.ª letra) · conteo de objetos · conteo de letras
de un nombre propio · inicial de un nombre propio · cifras de un año ·
geometría (vértices de una planta). Ningún método se repite en paradas
consecutivas. Los dos pares que sí se repiten, separados a propósito:
paradas 2 y 7 (cifras de un año, misma suma = 15 = O, rima deliberada
señalada en el enunciado de la 7) y no hay ningún otro par.

Cohesión entre paradas: la rue Saint-Vincent conecta las paradas 5 (Au
Lapin Agile, en esa calle) y 6 (linda con el Clos); el año 1860 reaparece
en la parada 8 (Saboya se anexionó a Francia el mismo año que Montmartre a
París), señalado en su historia aunque no es el año que ordena esa parada
(que usa 1873, el voto de la ley de la basílica).

## Diseño por parada (texto `es`; en/fr/it son traducción fiel)

Las 8 paradas 1-8 pasan de `respuestas` única a `subpreguntas`, con la
última subpregunta siempre "La letra de esta parada:". La 3.ª pista
("Solución") resuelve todas las subpreguntas de la parada.

### Parada 1 — "Los jinetes que vigilan la entrada" (I · 1927)

- Enigma: las dos estatuas ecuestres de bronce del pórtico (1927); Juana de
  Arco y un rey convertido en santo. Pide su nombre, y "la letra... está en
  el número que ese rey lleva siempre pegado al nombre".
- Subpreguntas: guerrera (`juana de arco`…) · rey (`luis ix`, `san luis`…)
  · letra (`i`).
- Pistas: identificar a Luis IX → contar 9 desde la A → I.

### Parada 2 — "El ayuntamiento de un pueblo que ya no existe" (O · 1860)

- Enigma: la placa del primer ayuntamiento (1790) se mantiene como
  observación, pero "la letra... sale del otro año... aquel en que el
  pueblo dejó de existir".
- Subpreguntas: año de la placa (`1790`) · letra (`o`).
- Pistas: cifras de 1860 → 1+8+6+0=15 → O. **Crítico en it**: "alfabeto
  internazionale di 26 lettere" explícito (en italiano la O es la 13.ª de
  21, no la 15.ª).

### Parada 3 — "El barco que nunca flotó" (M · 1907)

- Enigma: el Bateau-Lavoir, *Les Demoiselles d'Avignon* (1907, Picasso),
  reconstrucción en hormigón tras el incendio de 1970. La letra "hace lo
  mismo que aquel cuadro: marca la frontera entre un antes y un después".
- Subpreguntas: material del edificio (`hormigón`…) · letra (`m`).
- Pistas: el abecedario tiene dos mitades de 13; la letra cierra la
  primera → M. **Crítico en it**: "alfabeto internazionale di 26 lettere"
  (en italiano la 13.ª nativa sería otra letra y "la mitad" cae distinta).

### Parada 4 — "El molino que se subió al tejado" (B · 1809)

- Enigma: de ~30 molinos históricos, solo 2 siguen en pie (Radet y
  Blute-fin); el que tenéis delante está sobre un tejado.
- Subpreguntas: dónde está el molino (`sobre el tejado`…) · nº de molinos
  supervivientes (`2`, `dos`) · letra (`b`).
- Historia: se añade el episodio de marzo de 1814 (un Debray muerto
  defendiendo su molino, colgado de las aspas) como color, sin ser el año
  ancla.
- Pistas: 2 molinos → 2.ª letra → B.

### Parada 5 — "El conejo que escapó de la cazuela" (E · 1875)

- Enigma: Au Lapin Agile, cartel de André Gill (1875). "La letra... es lo
  que esa palabra mide", refiriéndose a LAPIN (francés, sin traducir en
  los 4 idiomas).
- Subpreguntas: animal del cartel (`lapin`) · letra (`e`).
- Pistas: LAPIN = 5 letras → 5.ª letra → E.

### Parada 6 — "La viña que salvó un barrio de artistas" (S · 1933)

- Enigma: el Clos Montmartre, plantado en 1933; la letra está "en el
  nombre de la calle que hace de linde... el santo al que los viñadores...
  rezan".
- Subpreguntas: año de plantación (`1933`) · calle linde (`saint
  vincent`…) · letra (`s`).
- Pistas: rue Saint-Vincent (la misma del Lapin Agile, parada 5) → inicial
  → S.
- Historia: se añade que la calle norte del Clos lleva el nombre de San
  Vicente, patrón de los viñadores.

### Parada 7 — "Los dioses marinos a los pies de la basílica" (O · 1932)

- Enigma: la fuente de Paul Gasq (1932), 3 hornacinas con tritones. "Para
  la letra, volved al año... tratadlo igual que... en la plaza del
  ayuntamiento: cae... en la misma letra" (rima con la parada 2).
- Subpreguntas: nº de hornacinas (`3`, `tres`) · letra (`o`).
- Pistas: 1+9+3+2=15 → O. **Crítico en it**: mismo matiz de alfabeto de 26
  letras que la parada 2.

### Parada 8 — "Las cúpulas que cierran el círculo" (H · 1873)

- Enigma: de vuelta al parvis; la ley de 1873 (dos años tras la Comuna);
  planta de cruz griega con 5 cúpulas. "Para la letra... esquinas que
  sobresalen y esquinas que se hunden... el número de las que sobresalen".
- Subpreguntas: planta (`b`) · cúpulas totales (`5`, `cinco`) · letra
  (`h`).
- Historia: se añade el voto de 1873 ("de utilidad pública", desagravio
  tras la Comuna) junto a La Savoyarde (1895) y la coincidencia de 1860
  con Saboya.
- Pistas: cruz griega (fig. B) tiene 12 vértices, 8 salientes y 4
  entrantes → 8.ª letra → H. H es la 8.ª en los alfabetos es/en/fr/it por
  igual: sin matiz i18n.
- `figuraId: "plantas-iglesia"` sin cambios; opción correcta **B**.

### Parada 9 (nueva) — "Lo que el tiempo pone en fila" (cierre)

- Sin desplazamiento. `respuestas: ["bohemios", "los bohemios", "bohemia",
  "la bohemia"]` (+ variantes por idioma, ver abajo).
- Enigma: "ocho paradas, ocho letras, ocho fechas... leeréis, en español,
  quiénes fueron los que hicieron de esta colina lo que es".
- Pistas: 1 = ordenar por año; 2 = las 8 letras con su año **en orden de
  ruta** (no de fecha, para no regalarlo); 3 = orden por fecha → BOHEMIOS.
- Historia + saberMas: la etimología de "bohemio" — *Bohemia* → los
  *bohémiens* (gitanos, Francia s. XV) → los artistas pobres de París
  hacia 1840 → Henry Murger (*Scènes de la vie de bohème*, 1851) → Puccini
  (*La Bohème*, 1896) → subió a Montmartre con el Chat Noir, el
  Bateau-Lavoir y el Lapin Agile. Cierre temático: la basílica del fondo se
  levantó, en parte, para expiar la revuelta de esa misma gente.
- `final.texto` reescrito para rematar sobre BOHEMIOS.

## Notas de traducción (en/fr/it)

Las mecánicas 1 (Luis IX), 4 (2 molinos), 5 (LAPIN, palabra francesa sin
traducir), 6 (inicial de Saint-Vincent) y 8 (geometría, H=8 en los 4
alfabetos) portan solas en los 4 idiomas. Dos puntos fijados a mano:

- **Paradas 2 y 7 (crítico en it):** ambas cuentan hasta 15 (suma de
  cifras de 1860 y de 1932). Las pistas anclan explícitamente al
  "abecedario internacional de 26 letras (A=1)"; en it, *"alfabeto
  internazionale di 26 lettere (cifrario A1Z26)"*. Con el alfabeto
  italiano nativo de 21 letras, 15 caería en una letra distinta.
- **Parada 3 (crítico en it):** la mecánica de "cierra la primera mitad
  del abecedario" (13.ª letra) exige el mismo alfabeto internacional de 26
  explícito en it; con las 21 letras nativas, ni la posición 13 ni "la
  mitad" caen igual.
- **Parada 9 (la palabra meta):** la respuesta es **BOHEMIOS, palabra
  española**, presentada como hallazgo etimológico — igual que HISTORIA en
  `barcelona-raval`. En en/fr/it el enigma dice explícitamente que la
  palabra está "en español"; la Solución añade el origen (Bohemia →
  bohémiens → la bohème). Las 8 letras y las 8 mecánicas son idénticas en
  los 4 idiomas. Se aceptan además variantes locales como respuesta
  (`bohemians`/`the bohemians` en en; `bohémiens`/`la bohème` en fr;
  `bohémien`/`la bohème` en it), sin que eso cambie el mecanismo letra a
  letra.

## Verificación

- `node --test` (raíz): 218 pruebas; 2 fallos preexistentes y ajenos a
  esta ruta en `tests/contenido.test.js`, ambos por `florencia-santacroce`
  (traducción a 9 paradas hecha en es/en pero no en fr/it, y `catalogo.js`
  sin actualizar para esa ruta) — no se toca, es trabajo en curso de otra
  revisión, sin spec propio todavía.
- `worker/`: `node --test` — ver resultado en el commit; sin relación con
  el contenido de `paris-montmartre`.
- Script de comprobación ad-hoc (fuera de la suite): las 8 derivaciones de
  letra de `paris-montmartre` en `es/en/fr/it` ordenadas por fecha
  deletrean BOHEMIOS en los 4 idiomas, y `evaluarRespuesta` acepta la
  respuesta canónica de cada subpregunta (incluida la palabra de cierre).
  Todo `OK`.
- El contenido `*.json` viaja en el `wrangler deploy` del Worker
  (gitignore); a `master` solo van el hunk de `paris-montmartre` en
  `js/catalogo.js` y este spec. El working tree tenía, además, cambios sin
  commitear de `roma-centro` y `madrid-austrias` (numParadas 8→9,
  duracionMin 120→125, contenido ya traducido a 4 idiomas) de una revisión
  anterior sin spec ni commit todavía: se han dejado intactos y fuera de
  este commit — no forman parte de esta tarea.

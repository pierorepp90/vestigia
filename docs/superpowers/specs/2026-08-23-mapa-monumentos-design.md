# Vestigia — viñetas de monumentos en el mapa de ruta

## Contexto

Sobre el mapa antiguo ya construido (ver
[2026-08-22-precios-selector-mapa-design.md](2026-08-22-precios-selector-mapa-design.md),
sección 3), el usuario pide añadir un pequeño dibujo «de fantasía» del
monumento de partida de cada ruta — puso como ejemplo el Arc de Triomf, que
es justamente el punto de partida real de la ruta El Born. La decisión de
estilo se validó con una maqueta en el compañero visual de brainstorming
antes de escribir este documento.

Al calcular las coordenadas reales de los 7 monumentos para poder
colocarlos con precisión, apareció un hallazgo que no estaba previsto: en 4
de las 7 rutas, el monumento de partida real cae fuera (o casi fuera) del
recorte de mapa que ya se generó en la tarea anterior, porque aquel centro
se eligió representando la «zona» general del nombre, no el punto de
partida exacto. Este documento incluye también la corrección de esos 4
encuadres, ya acordada con el usuario.

## Decisiones tomadas

| Tema | Decisión |
|---|---|
| Monumento por ruta | Uno, el `puntoPartida` que ya existe en el catálogo — sin nuevas decisiones de contenido |
| Estilo de dibujo | Boceto a mano: contorno suelto y ligeramente irregular, en tinta sepia (`--ink-soft`), no en rojo lacre |
| Color | El rojo lacre se reserva para el óvalo de zona; el monumento va en tinta sepia para no competir con la marca de «aquí es» |
| Posición | Coordenada real proyectada con la misma `proyectar()` que ya usan calles y edificios — nunca decorativa |
| Tamaño | ≈70 px de alto sobre un lienzo de 480 px — un detalle, no un protagonista |
| Encuadre de 4 rutas | Se recentra el mapa de paris-marais, barcelona-born, lisboa-alfama y florencia-centro para que el monumento de partida quede bien encuadrado; los otros 3 mapas no cambian |

## 1. Corrección de encuadre en 4 rutas

Distancia real entre el centro de mapa actual (`ZONAS` en
`scripts/generar-mapas.mjs`) y el monumento de partida de esa misma ruta:

| Ruta | Monumento | Centro actual | Distancia real | Radio actual |
|---|---|---|---|---|
| paris-marais | Notre-Dame | 48.8575, 2.3605 | ≈924 m | 300 m |
| lisboa-alfama | Sé de Lisboa | 38.7139, -9.1302 | ≈515 m | 280 m |
| florencia-centro | Duomo | 43.7696, 11.2558 | ≈390 m | 280 m |
| barcelona-born | Arc de Triomf | 41.385, 2.1827 | ≈338 m | 250 m |

En los 4 casos el monumento caería fuera del lienzo (o pegado al borde
rasgado) si se coloca en su coordenada real sin tocar el centro. Se corrige
moviendo el centro de `ZONAS` al propio monumento, sin tocar el radio (el
radio ya funcionaba bien visualmente, verificado en la Task 18 anterior;
solo estaba mal situado):

| Ruta | Centro nuevo (≈ coordenadas del monumento) | Radio |
|---|---|---|
| paris-marais | 48.8530, 2.3499 (Notre-Dame / Île de la Cité) | 300 m (sin cambio) |
| barcelona-born | 41.3875, 2.1804 (Arc de Triomf) | 250 m (sin cambio) |
| lisboa-alfama | 38.7099, -9.1332 (Sé de Lisboa) | 280 m (sin cambio) |
| florencia-centro | 43.7731, 11.2560 (Duomo) | 280 m (sin cambio) |

Nota sobre paris-marais: la zona de esta ruta («Le Marais · Place des
Vosges · Île de la Cité») es realista y deliberadamente amplia — Notre-Dame
y Place des Vosges están a más de 1 km entre sí, más de lo que cabe en un
solo recorte de 300 m de radio sin perder legibilidad de calle. Se prioriza
encuadrar bien el punto de partida oficial (Notre-Dame, en Île de la Cité,
que ya es uno de los tres nombres de la zona) sobre intentar abarcar los
tres a la vez — igual que las otras 6 rutas, que tampoco intentan mostrar
el recorrido completo, solo el entorno de salida.

Barcelona-gotic, roma-centro y barcelona-raval no se tocan: su monumento de
partida ya cae dentro del encuadre actual (69 m, 0 m y 245 m de distancia
respectivamente, todos por debajo de su radio).

## 2. Los 7 monumentos y su dibujo

| Ruta | Monumento | Elemento a capturar en el boceto |
|---|---|---|
| barcelona-gotic | Catedral de Barcelona | fachada gótica, rosetón, torres |
| roma-centro | El Panteón | pórtico clásico con columnas y frontón |
| paris-marais | Notre-Dame | las dos torres cuadradas góticas |
| barcelona-born | Arc de Triomf | el arco monumental con cornisa (ya bocetado en la maqueta) |
| barcelona-raval | Mercat de la Boqueria | el arco de entrada con el cartel modernista |
| lisboa-alfama | Sé de Lisboa | fachada románica, dos torres almenadas |
| florencia-centro | Duomo de Florencia | la cúpula — es lo que la hace reconocible, más que la fachada |

Cada uno es un fragmento SVG hecho a mano, en el mismo espíritu que ya usa
este proyecto para sus iconos (el compás de la marca, los iconos de reloj y
personas): contornos vectoriales simples, no una imagen importada. No se
busca precisión arquitectónica — se busca que un vistazo rápido reconozca
«ah, es la Sagrada Familia... digo, la Catedral», igual que las viñetas de
monumentos en los mapas antiguos de verdad nunca fueron fotográficas.

## 3. Integración técnica

**`scripts/generar-mapas.mjs`** gana una tabla nueva, `ICONOS_MONUMENTO`,
con una entrada por ruta: el fragmento SVG del boceto (en coordenadas
locales propias, p. ej. `viewBox 0 0 80 100`) y la coordenada real
(lat/lng) del monumento — separada de `ZONAS`, que sigue siendo solo el
centro/radio del recorte.

Dentro de `dibujarSvg()`, después de dibujar edificios y antes del óvalo de
zona, se proyecta la coordenada del monumento con la misma `proyectar()`
que ya usan calles y edificios, y se inserta el fragmento SVG del icono
envuelto en un `<g transform="translate(...) scale(...)">` que lo sitúa y
escala a los ≈70 px de alto acordados. El óvalo de zona se sigue dibujando
después, así que su trazo discontinuo en rojo lacre queda por encima y
sigue marcando la zona con claridad aunque el icono esté cerca.

## 4. Regenerar y verificar

Se vuelve a ejecutar `node scripts/generar-mapas.mjs` para las 7 rutas
(mismas llamadas reales a Overpass que la primera vez; las 4 rutas
recentradas piden datos de calles nuevos porque cambia el centro). Se
revisan los 7 SVG resultantes a ojo — no solo uno — confirmando que cada
icono cae dentro del recorte rasgado, no se sale del lienzo y no tapa el
óvalo de zona hasta el punto de que deje de leerse. Si un icono queda mal
encajado, se ajusta su `translate`/`scale` en la tabla, no las coordenadas
del monumento (esas son un hecho geográfico).

No hace falta test nuevo: `tests/generar-mapas.test.js` ya cubre la
matemática de `proyectar()`, que es la única lógica no visual de este
cambio; el dibujo en sí se verifica a ojo, igual que las calles y los
edificios.

## Riesgos / pendientes

| Qué falta | Por qué no se resuelve aquí |
|---|---|
| Las coordenadas de los 7 monumentos son una estimación razonable, no verificada sobre el terreno | Es geografía de un edificio conocido y público (no un detalle puntual como los enigmas), así que el riesgo es bajo — pero conviene mirar el resultado y ajustar si algún icono queda descentrado. |
| El nuevo encuadre de las 4 rutas recentradas no se ha visto todavía | Se verifica en el mismo paso de revisión visual que los propios iconos, no por separado. |

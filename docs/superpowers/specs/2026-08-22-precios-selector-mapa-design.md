# Vestigia — precios por dificultad, selector de idioma y mapa de ruta

## Contexto

Tres cambios sobre el sitio ya construido (ver
[2026-08-22-vestigia-design.md](2026-08-22-vestigia-design.md)):

1. Las 7 rutas dejan de tener un precio fijo de 29 € y pasan a cobrarse según
   su dificultad, con las fáciles gratis.
2. El desplegable `<select>` de idioma se sustituye por algo más cuidado
   visualmente.
3. La sección «Qué incluye» de la ficha de ruta se sustituye por un mapa
   antiguo y desgastado con la zona de esa ruta resaltada.

Las decisiones de estilo (2 y 3) se validaron con maquetas en el compañero
visual de brainstorming antes de escribir este documento.

## Decisiones tomadas

| Tema | Decisión |
|---|---|
| Precio — fácil | Gratis (0 €) |
| Precio — media | 4,99 € por equipo |
| Precio — difícil | 7,99 € por equipo |
| Acceso a rutas gratis | Sin Stripe: endpoint propio que acuña el token y envía el email de Resend, igual que hoy |
| Selector de idioma — componente | Pastillas fijas siempre visibles (no desplegable) |
| Selector de idioma — estilo | Subrayado mínimo (ES · EN · FR · IT, activo en rojo lacre con línea inferior) |
| Mapa de ruta — fuente | Imagen estática pregenerada a partir de datos reales de OpenStreetMap |
| Mapa de ruta — estilo | «Pergamino quemado»: silueta rasgada, viñeta oscura, grano, zona rodeada a mano |
| Lista «Qué incluye» | Se conserva, pero reducida, debajo del mapa — no desaparece |

Reparto de dificultad y precio resultante por ruta (la dificultad ya estaba
fijada en el catálogo; aquí solo cambia el precio):

| Ruta | Dificultad | Precio nuevo |
|---|---|---|
| barcelona-born | fácil | Gratis |
| florencia-centro | fácil | Gratis |
| barcelona-gotic | media | 4,99 € |
| paris-marais | media | 4,99 € |
| roma-centro | difícil | 7,99 € |
| barcelona-raval | difícil | 7,99 € |
| lisboa-alfama | difícil | 7,99 € |

## 1. Precios por dificultad

**Catálogo y precio autoritativo.** `js/catalogo.js` actualiza el campo
`precio` de las 7 rutas según la tabla de arriba. `worker/src/precios.js`
actualiza sus 7 `importe` para que coincidan exactamente — sigue siendo la
única fuente que decide cuánto se cobra de verdad, nunca el cliente.
`tests/precios.test.js` gana una comprobación adicional: además del cruce
catálogo↔worker que ya existía, verifica que ambos importes coinciden con la
tabla fácil=0/media=4,99/difícil=7,99 según la `dificultad` de cada ruta, para
que un precio nunca pueda quedar desalineado de su nivel.

**Acceso a rutas gratis, sin Stripe.** Stripe Checkout en modo `payment` no
admite un importe de 0 de forma directa, y meter un cupón del 100% solo para
esquivarlo añade una pieza de Stripe que hay que mantener sin necesidad. En su
lugar:

- Nuevo endpoint del Worker `POST /api/acceso-gratuito`, body
  `{rutaId, idioma, email}`.
- Primer paso: `precioDeRuta(rutaId)` — si no existe o su `importe` no es 0,
  responde 400. Esto impide que el endpoint se use para conseguir gratis una
  ruta de pago cambiando el `rutaId` en la petición.
- Si es gratis de verdad: genera un `orderId` (`crypto.randomUUID()`), acuña
  el token con la misma función de `worker/src/acceso.js` que usa hoy
  `handleConfirmarPago`, envía el mismo email de Resend (enlaces a `jugar/` y
  a la versión imprimible) y devuelve `{token, rutaId, idioma}`.
- Validación de email: formato básico también en el Worker (no solo en el
  formulario), para no depender únicamente de la validación del navegador.

**Front-end.** En `ruta/*.html`, cuando `ruta.precio === 0`:

- El botón de reserva deja de ser un enlace que crea una sesión de Stripe.
  En su lugar, el panel lateral (`panel-ficha`) muestra un campo de email y
  un botón «Jugar gratis».
- Al enviarlo, `js/ruta.js` llama a una nueva función `crearAccesoGratuito()`
  en `js/api.js` (paralela a `crearCheckoutSession()`), y si responde bien
  redirige a `jugar/gracias.html?ruta=<id>&idioma=<lang>&t=<token>&gratis=1`.
- `js/gracias.js` gana una rama al principio: si la URL trae `gratis=1` y un
  `t`, se salta `confirmarPago(sessionId)` por completo (no hay nada que
  verificar) y pasa directo a `vista-exito`, rellenando `link-jugar` /
  `link-imprimir` con los datos que ya vienen en la propia URL. El resto de
  esa pantalla (idioma de la compra, i18n) funciona igual que hoy.
- `panel-precio` muestra el texto localizado de «Gratis» en vez de «0 €»
  cuando `ruta.precio === 0`; el botón `cta-reservar` cambia su texto a
  «Jugar gratis» en ese mismo caso.

**i18n.** Claves nuevas en los 4 idiomas: `ruta_jugar_gratis_cta`,
`ruta_email_label`, `ruta_email_placeholder`, `precio_gratis`.

## 2. Selector de idioma

**HTML.** En `index.html` y en los 5 `ciudad/*.html` + 7 `ruta/*.html` (13
archivos en total), estas dos líneas dentro de `nav-principal`:

```html
<label class="sr-only" for="selector-idioma" data-i18n="nav_idioma_label">Idioma</label>
<select class="selector-idioma" id="selector-idioma"></select>
```

se sustituyen por una sola:

```html
<div class="selector-idioma" id="selector-idioma" role="group" data-i18n-attr="aria-label:nav_idioma_label"></div>
```

Se mantiene el mismo `id`, así que los tres módulos que lo rellenan no
cambian su punto de enganche con el DOM.

**JS.** `poblarSelectorIdioma(lang)` — definida igual en `js/portada.js`,
`js/ciudad.js` y `js/ruta.js` — deja de generar `<option>` y genera 4
`<button type="button">` (ES · EN · FR · IT) separados por un punto medio,
con `aria-pressed="true"` en el activo. El clic hace exactamente lo mismo que
hace hoy el `change` del `<select>`: `guardarIdioma(codigo)` seguido de
`location.reload()`. No cambia nada más de la lógica de idioma.

**CSS.** El bloque `.selector-idioma` actual (borde, fondo transparente,
padding de caja) se sustituye por el estilo validado en la maqueta: fuente
mono, idiomas inactivos en `--ink-faint`, el activo en `--lacre` con un
subrayado — reutilizando la misma transición que ya usan los enlaces del
menú al pasar el ratón (`.nav-principal a::after`).

**Accesibilidad.** Botones reales en vez de un `<select>` con estilos
forzados: foco y activación por teclado nativos. `role="group"` +
`aria-label` (vía `data-i18n-attr`) sustituyen al `<label for>`, que dejaba
de tener sentido al no haber ya un elemento de formulario que etiquetar.

## 3. Mapa envejecido de la zona

**Dato público nuevo.** Cada entrada de `RUTAS` en `js/catalogo.js` gana
`imgMapa: 'assets/img/mapas/<rutaId>.svg'`, mismo patrón que `imgHero` /
`imgCard`. Las coordenadas reales usadas para generar cada mapa no entran en
el catálogo público — no las necesita nadie en tiempo de ejecución — y viven
solo dentro del script de generación.

**Script de generación** (`scripts/generar-mapas.mjs`, se ejecuta una vez
por ruta y se vuelve a ejecutar solo si cambia algo — mismo patrón que ya se
usó para las fotos de Wikimedia Commons):

- Tabla interna `ZONAS` con centro (lat/lng) y radio en metros por ruta.
  Estimación inicial de los 7 centros (a afinar visualmente al generar,
  comprobando que el recorte cubre bien el barrio — esto es geografía
  aproximada de una zona amplia, no un detalle puntual como los enigmas, así
  que no necesita verificación sobre el terreno):

  | Ruta | Centro aprox. | Radio |
  |---|---|---|
  | barcelona-gotic | 41.3833, 2.1763 (Catedral / Pl. Sant Jaume) | 250 m |
  | barcelona-born | 41.3850, 2.1827 (Santa Maria del Mar) | 250 m |
  | barcelona-raval | 41.3800, 2.1700 (Rambla del Raval / MACBA) | 280 m |
  | roma-centro | 41.8986, 12.4769 (Panteón / Pza. Navona) | 300 m |
  | paris-marais | 48.8575, 2.3605 (Place des Vosges) | 300 m |
  | lisboa-alfama | 38.7139, -9.1302 (Sé de Lisboa) | 280 m |
  | florencia-centro | 43.7696, 11.2558 (Pza. della Signoria) | 280 m |

- Para cada ruta: pide a la Overpass API las vías (`way[highway]`) y
  edificios (`way[building]`) dentro del radio, proyecta las coordenadas a
  un plano `<svg>` local (proyección equirectangular — sobra de precisión a
  esta escala de unos cientos de metros) y los dibuja con el mismo lenguaje
  visual aprobado en la maqueta: calles en trazo fino `--ink-faint`,
  edificios como bloques `--paper-3`.
- Encima aplica el marco «pergamino quemado» validado: silueta con
  `clip-path` irregular, viñeta oscura interior, grano vía filtro
  `feTurbulence`, y un óvalo torcido en `--lacre` centrado en el mismo punto
  usado para pedir los datos — así el óvalo siempre coincide con lo que se
  ha dibujado, sin ajuste manual.
- Guarda el resultado como `.svg` autocontenido (sin dependencias externas
  en tiempo de ejecución) en `assets/img/mapas/<rutaId>.svg`.
- Registra la atribución obligatoria («© OpenStreetMap contributors») en
  `assets/img/mapas/CREDITOS.md`, mismo formato que
  `assets/img/ciudades/CREDITOS.md`.

Este script corre una sola vez a mano; su salida (los 7 SVG) se commitea como
archivo estático, igual que las fotos — no añade ninguna dependencia nueva al
sitio en producción ni rompe el criterio de «vanilla sin build step».

**HTML** (los 7 `ruta/*.html`). El bloque actual:

```html
<h2 class="incluye-title" data-i18n="ruta_incluye_title">Qué incluye</h2>
<ul class="lista-incluye">…</ul>
```

pasa a:

```html
<h2 class="mapa-zona-title" data-i18n="ruta_mapa_title">La zona de juego</h2>
<figure class="mapa-zona">
  <img class="mapa-zona__img" id="mapa-zona-img" src="" alt="">
  <figcaption class="mapa-zona__caption" id="mapa-zona-caption"></figcaption>
</figure>
<ul class="lista-incluye lista-incluye--compacta">
  <li data-i18n="ruta_incluye_1">…</li>
  <li data-i18n="ruta_incluye_2">…</li>
  <li data-i18n="ruta_incluye_3">…</li>
  <li data-i18n="ruta_incluye_4">…</li>
</ul>
```

Los 4 puntos de siempre se conservan (acceso 1 año, pistas, imprimible, sin
cobertura) pero bajan de categoría visual: lista más pequeña y discreta justo
debajo del mapa, ya no un bloque con su propio título.

**JS** (`js/ruta.js`). Tres líneas nuevas junto al resto de la ficha:

```js
document.getElementById('mapa-zona-img').src = `../${ruta.imgMapa}`;
document.getElementById('mapa-zona-img').alt = tf(lang, 'ruta_mapa_alt', { zona: ruta.zona });
document.getElementById('mapa-zona-caption').textContent = ruta.zona;
```

**CSS.** `.incluye-title` / `.lista-incluye` (tamaño de título suelto, viñetas
con check) se sustituyen por `.mapa-zona-title`, `.mapa-zona` (recorte
irregular y viñeta iguales a los de la maqueta) y `.mapa-zona__caption`. Se
añade el modificador `.lista-incluye--compacta` (fuente más pequeña, color
más apagado) para la lista reubicada.

**i18n.** Claves nuevas en los 4 idiomas: `ruta_mapa_title` («La zona de
juego» / «The playing area» / …) y `ruta_mapa_alt` (plantilla de alt-text
con `{zona}`). Las 4 claves `ruta_incluye_1..4` no cambian; `ruta_incluye_title`
deja de usarse en el HTML y se elimina de los 4 diccionarios de `js/i18n.js`
en vez de quedar como clave muerta.

## Verificación

- **Precios** — `tests/precios.test.js` ampliado: catálogo↔worker (ya
  existía) + catálogo/worker↔tabla por dificultad (nuevo).
- **Acceso gratuito** — nuevos tests en `worker/tests/`: rechaza `rutaId` de
  pago (400), acuña token válido para `rutaId` gratis, llama a Resend con el
  email recibido, el token resultante pasa la verificación de
  `worker/src/acceso.js` igual que uno nacido de un pago real.
- **Contenido** — el test de integridad de rutas comprueba que las 7 tienen
  `imgMapa` apuntando a un archivo que existe de verdad en `assets/img/mapas/`.
- **i18n** — el test de paridad de traducciones ya existente cubre solo con
  añadir las claves nuevas a los 4 diccionarios; ninguna puede quedar a
  medias sin que falle.
- **Manual con Playwright** — un recorrido por ruta gratis (Barcelona-Born o
  Florencia): pedir el email, llegar a `gracias.html` sin pasar por Stripe,
  abrir `jugar/` con el token recibido. Un recorrido por ruta de pago sin
  tocar nada, para confirmar que Stripe sigue funcionando igual que antes.
  Clic en las pastillas de idioma en las tres plantillas (portada, ciudad,
  ruta) comprobando que recargan en el idioma elegido.

## Pendiente / riesgos

| Qué falta | Por qué no se resuelve aquí |
|---|---|
| Sin límite de envíos en `/api/acceso-gratuito` | Alguien podría pedir el mismo enlace gratis varias veces con emails distintos; el coste es solo volumen de email (Resend), no ingresos perdidos. Se puede añadir un límite más adelante si se observa abuso. |
| Afinar a mano el recorte de cada mapa | Las coordenadas de la tabla son una primera estimación razonable; conviene mirar el SVG generado de cada ruta y ajustar el radio si deja fuera calles relevantes. |
| Disponibilidad de la Overpass API | Es un servicio público compartido y puede dar `429` en horas punta; el script debe poder reintentarse ruta por ruta sin regenerar las demás. |

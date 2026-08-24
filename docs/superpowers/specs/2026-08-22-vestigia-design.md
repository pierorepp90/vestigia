# Vestigia — escape rooms urbanos al aire libre

> **Nota de implementación** (post-build): esta spec es el diseño aprobado
> antes de escribir código. La implementación lo siguió fielmente, con
> estas desviaciones conscientes, documentadas aquí para que el documento
> siga siendo de fiar:
>
> - **`js/juego/respuestas.js` no convierte números escritos a dígitos.**
>   Cada `respuestas: [...]` del contenido lista explícitamente las
>   variantes aceptadas (p. ej. `["2", "dos"]`); el motor solo normaliza y
>   compara texto. Es más simple y predecible que un parser numérico, y
>   ninguna de las 24 paradas escritas necesitó otra cosa.
> - **La i18n de las páginas de marketing usa `data-i18n` en tiempo de
>   ejecución**, no un `scripts/build-i18n.mjs` que genere `/en/ /fr/ /it/`
>   estáticos. Portada, ciudad y ruta ya funcionan con el selector de
>   idioma tal cual; el generador estático (mejor para SEO puro) queda
>   como mejora de la fase de Traducciones, no como bloqueante.
> - **Los pasos 4 (motor) y 5 (pago) se construyeron entrelazados**, no en
>   dos fases separadas: para poder jugar de principio a fin en local hacía
>   falta un Worker mínimo (`acceso.js` + `GET /api/ruta`) antes de tener
>   Stripe. `worker/scripts/mint-dev-token.mjs` firma un token de prueba
>   sin pasar por Stripe para poder probar el motor de juego de forma
>   aislada.
> - **Se añadió `consent_collection` a Stripe Checkout**, no previsto en
>   la spec original: al escribir `legal/condiciones.html` se detectó que
>   vender contenido digital de entrega inmediata exige un consentimiento
>   explícito para renunciar al derecho de desistimiento (art. 103.m RDL
>   1/2007), y Stripe lo resuelve con un parámetro directo.
>
> - **`js/catalogo.js` necesitó su propia internacionalización**, algo que
>   esta spec no había anticipado explícitamente: los campos de texto que
>   ve el visitante (país, nombre de ciudad, resúmenes, título de ruta,
>   acertijo de muestra, punto de partida) pasaron de `string` a
>   `{ es, en, fr, it }`, con un helper `localizar(campo, lang)`. Sin este
>   cambio, cambiar el idioma en el selector traducía la interfaz y el
>   contenido de las paradas, pero no las fichas del catálogo — un hueco
>   real que se detectó al probar la ruta de Roma en inglés y ver el
>   título aún en español.
>
> El paso 7 (Traducciones) está completo: interfaz, catálogo público y las
> 24 paradas de las 3 rutas están en los 4 idiomas, con tests de paridad
> (`tests/i18n.test.js`, `tests/catalogo-i18n.test.js`,
> `tests/contenido.test.js`) que fallan si algún idioma se queda con una
> clave a medias. Sigue pendiente: la generación estática por idioma
> (`/en/ /fr/ /it/`) para SEO, y la verificación en persona de las 3 rutas
> — ver `README.md` en la raíz del proyecto para el estado completo.

## Contexto

No existe la web todavía: se crea de cero en `C:\Users\Administrador\Proyectos\Vestigia`.

La idea es vender rutas de juego autoguiadas por el centro histórico de ciudades
turísticas. El jugador compra una ruta, la abre en el móvil y avanza por paradas
resolviendo acertijos que solo puede contestar **mirando lo que tiene delante**:
una fecha grabada en un dintel, el número de columnas de un claustro, las marcas
de metralla de una fachada. Cada acierto desbloquea la siguiente parada y un
fragmento de historia real del lugar. El objetivo es que recorrer el centro sea
el juego, no el trámite.

El proyecto reutiliza las convenciones que ya existen en
[grip-la-seu](../../../../grip-la-seu/) y
[Siurana Outdoors](../../../../Siurana%20Outdoors/): HTML estático
multipágina, CSS plano, módulos ES sin bundler, backend en un Worker de
Cloudflare, despliegue en GitHub Pages con `CNAME` y tests con `node --test`.

**Marca:** Vestigia · *Una manera divertida de conocer la ciudad*

## Decisiones tomadas

| Tema | Decisión |
|---|---|
| Alcance v1 | Escaparate completo + **3 rutas jugables** (Barcelona, Roma, París) |
| Formato | Web app móvil + versión imprimible |
| Validación | Solo respuestas escritas, **sin GPS** |
| Dispositivos | Un móvil por equipo, progreso en `localStorage` |
| Monetización | Pago online por ruta, **precio fijo por equipo** |
| Idiomas | ES · EN · FR · IT |
| Duración | ~2 h, 8 paradas por ruta |
| Portada | 3 ciudades activas + 3 «próximamente» (Lisboa, Praga, Florencia) |
| Imágenes | Unsplash / Wikimedia con licencia libre, WebP |
| Stack | Vanilla + Cloudflare Worker |

## Riesgo que hay que asumir explícitamente

Cada acertijo depende de un detalle físico que sigue existiendo en la calle. Una
placa que se retira o una fachada en obras rompe una parada y deja al equipo
bloqueado en mitad del recorrido. **Ninguna ruta se pone a la venta sin haberla
caminado entera verificando parada por parada.** El plan trata el contenido que
yo escriba como *borrador a verificar*, no como contenido final.

Consecuencia de diseño: los acertijos se redactan para ser **traducibles** —
observación, conteo, fechas, símbolos — nunca juegos de palabras, que se rompen
al pasar a otro idioma. Y toda parada lleva una pista de nivel 3 que da la
respuesta, para que un detalle desaparecido nunca deje la partida muerta.

---

## Arquitectura

```
Proyectos/Vestigia/
├── index.html                  # portada ES (raíz) — /en/ /fr/ /it/ generados
├── ciudad/{barcelona,roma,paris}.html
├── ruta/{barcelona-gotic,roma-centro,paris-marais}.html
├── jugar/
│   ├── index.html              # motor de juego
│   ├── gracias.html            # retorno de Stripe
│   └── imprimir.html           # versión imprimible
├── legal/{aviso,privacidad,condiciones}.html
├── css/{styles,juego,print}.css
├── js/
│   ├── config.js               # API_BASE_URL  (patrón de grip-la-seu/js/config.js)
│   ├── i18n.js                 # textos de interfaz ×4 idiomas
│   ├── catalogo.js             # datos PÚBLICOS de cada ruta
│   ├── api.js
│   ├── {portada,ciudad,ruta,gracias,imprimir}.js
│   └── juego/
│       ├── motor.js            # máquina de estados de la partida
│       ├── respuestas.js       # normalización + comparación tolerante
│       ├── progreso.js         # persistencia en localStorage
│       ├── pistas.js
│       └── cronometro.js
├── scripts/build-i18n.mjs      # genera /en/ /fr/ /it/ desde las plantillas
├── assets/img/ciudades/*.webp
├── worker/
│   ├── src/
│   │   ├── index.js            # router  (calcado de grip-la-seu/worker/src/index.js)
│   │   ├── cors.js  stripe.js  resend.js
│   │   ├── acceso.js           # firma y verificación de tokens
│   │   ├── precios.js          # precios AUTORITATIVOS
│   │   └── contenido/*.json    # 3 rutas × 4 idiomas = 12 archivos (NO públicos)
│   ├── tests/
│   └── wrangler.toml
├── tests/                      # node --test de los módulos de js/
└── docs/superpowers/specs/
```

### La separación que sostiene todo el negocio

Hay dos cuerpos de datos y **no pueden mezclarse**:

- **Catálogo público** (`js/catalogo.js`): título, ciudad, zona, duración,
  jugadores, dificultad, precio de escaparate, descripción, un acertijo de
  muestra como gancho. Se sirve estático, lo lee cualquiera. Alimenta portada,
  páginas de ciudad y fichas de ruta.
- **Contenido de juego** (`worker/src/contenido/*.json`): los 8 enigmas, sus
  respuestas, las 3 pistas de cada uno y los textos históricos. **Vive dentro
  del Worker**, nunca en el sitio estático, y solo sale con un token válido.

Si el contenido de juego se sirviera como archivo estático, bastaría abrir la
pestaña de red para jugar gratis y el modelo de pago dejaría de existir.

### Esquema de una ruta

```jsonc
{
  "rutaId": "barcelona-gotic",
  "idioma": "es",
  "titulo": "El secreto del Barrio Gótico",
  "intro": "...",
  "paradas": [{
    "n": 1,
    "titulo": "La plaza de los impactos",
    "llegada": "Desde la catedral, toma el callejón de Montjuïc del Bisbe...",
    "enigma": "Cuenta los impactos visibles en el muro de la iglesia...",
    "respuestas": ["1938", "el 1938"],   // variantes aceptadas
    "pistas": [
      "Busca una placa conmemorativa a la altura de los ojos.",
      "La fecha que buscas está en el segundo renglón.",
      "La respuesta es 1938."
    ],
    "historia": "El 30 de enero de 1938 una bomba italiana...",
    "fuente": "Ajuntament de Barcelona, memoria histórica"
  }],
  "final": { "titulo": "...", "texto": "..." }
}
```

### Flujo de pago y acceso, sin base de datos

grip-la-seu resuelve el pago sin persistencia y aquí se puede hacer lo mismo,
sustituyendo la base de datos por un **token firmado**:

1. `POST /api/create-checkout-session` con `{rutaId, idioma}`. El Worker toma el
   precio de `worker/src/precios.js` — **nunca del cliente** — y crea la sesión
   de Stripe con `fetch` plano y `URLSearchParams`, exactamente como
   [worker/src/stripe.js](../../../../grip-la-seu/worker/src/stripe.js).
2. Stripe devuelve a `/jugar/gracias.html?session_id={CHECKOUT_SESSION_ID}`.
3. `GET /api/confirm-payment?session_id=…` verifica contra Stripe que está
   pagado y **acuña un token**: `base64url(payload).base64url(HMAC-SHA256)`,
   con `payload = {rutaId, orderId, exp}` y un año de validez.
4. Resend envía al comprador un email con el enlace de recuperación
   `…/jugar/?t=<token>` y el enlace a la versión imprimible.
5. El front guarda el token en `localStorage` y entra al juego.
6. `GET /api/ruta?t=<token>&idioma=es` verifica firma y caducidad y devuelve el
   JSON completo de la ruta, que se cachea en `localStorage`.

Esto da tres cosas gratis: no hay infraestructura de estado que mantener, el
email de Resend es la vía de recuperación si se pierde el móvil, y **una vez
cargada la ruta la partida funciona sin cobertura**, que es exactamente lo que
hace falta en el Gótico o el Trastevere.

Las respuestas viajan en claro dentro del payload ya protegido por el token.
Es deliberado: permite validar sin conexión y decir «casi, revisa la ortografía»
ante un fallo por una letra, cosa imposible comparando hashes. El único que
puede espiarlas es quien ya ha pagado.

### Validación de respuestas

`js/juego/respuestas.js`, módulo puro y el más testeado del proyecto:
normaliza (minúsculas, sin tildes, sin puntuación, espacios colapsados) y
compara contra las variantes aceptadas que trae el propio contenido; si la
distancia de Levenshtein es ≤ umbral (según longitud) en una respuesta NO
numérica, responde «casi» en vez de «no» para no castigar una errata. Las
respuestas numéricas exigen coincidencia exacta siempre.

### Idiomas y SEO

El buscador es el canal de captación de este negocio, así que las páginas de
marketing se sirven como HTML estático por idioma —`/`, `/en/`, `/fr/`, `/it/`—
con `hreflang` cruzado, siguiendo la carpeta `en/` que ya usa Siurana Outdoors.
Mantener 28 archivos a mano es inviable, así que `scripts/build-i18n.mjs`
(~80 líneas, sin dependencias) los genera desde una plantilla y los diccionarios,
y el resultado se commitea. Las pantallas de juego y pago no necesitan SEO y
resuelven el idioma en tiempo de ejecución con `data-i18n`, igual que
[grip-la-seu/js/i18n.js](../../../../grip-la-seu/js/i18n.js).

### Versión imprimible

No se generan PDFs. `/jugar/imprimir.html` pide la ruta con el mismo token,
la renderiza entera con `css/print.css` y el usuario hace «Guardar como PDF»
desde el navegador. Sin herramientas de PDF, sin archivos que se desincronicen
del contenido, y funciona igual en móvil y escritorio. Si más adelante quieres
un PDF maquetado de verdad, se añade R2 y se sirve firmado.

### Dirección visual

Papel y tinta —crema, sepia, un rojo lacre para las llamadas a la acción— sobre
fotografía grande y contrastada de cada ciudad. Serif con carácter para títulos,
sans neutra para el cuerpo. La pantalla de juego invierte a fondo oscuro: se
juega al aire libre, muchas veces a pleno sol o al atardecer, y el contraste
alto manda sobre la estética. Botonera grande, pensada para el pulgar y para
manos ocupadas. La implementación usará el skill `frontend-design`.

---

## Orden de construcción

1. **Base y portada** — estructura, `catalogo.js`, `i18n.js`, CSS base,
   portada con 3 ciudades activas y 3 en gris. Imágenes WebP con su atribución.
2. **Ciudades y fichas** — 3 páginas de ciudad y 3 fichas de ruta con duración,
   jugadores, dificultad, zona, precio y acertijo de muestra.
3. **Contenido ES** — las 3 rutas escritas en español, 8 paradas cada una,
   contra el esquema JSON. Marcado como borrador pendiente de verificar.
4. **Motor de juego** — `respuestas.js` primero y con tests, luego `motor.js`,
   `progreso.js`, `pistas.js`, `cronometro.js`. Jugable de principio a fin
   con la ruta de Barcelona en ES.
5. **Pago y acceso** — Worker: `precios.js`, `stripe.js`, `acceso.js`,
   `resend.js`, `gracias.html`. Prueba con tarjetas de test de Stripe.
6. **Versión imprimible** — `imprimir.html` + `print.css`.
7. **Traducciones** — EN, FR, IT del catálogo, la interfaz y las 3 rutas;
   `build-i18n.mjs` y `hreflang`.
8. **Cierre** — páginas legales (obligatorias para cobrar en la UE: aviso,
   privacidad, condiciones y política de reembolso), `CNAME`, despliegue.

Los pasos 1-2 ya dejan algo que puedes enseñar. El 4 valida la idea entera. El
5 es el que convierte el proyecto en un negocio.

## Verificación

- **Módulos puros** — `node --test` sobre `respuestas.js` (normalización,
  tildes, números escritos, erratas de una letra), `progreso.js`,
  `cronometro.js` y `acceso.js` (token válido, firma alterada, caducado,
  `rutaId` cruzado).
- **Coherencia de precios** — un test importa `js/catalogo.js` y
  `worker/src/precios.js` y falla si un precio de escaparate no coincide con el
  que se cobra. Es el error más caro posible y el más fácil de cometer.
- **Integridad del contenido** — un test recorre los 12 JSON y verifica que
  cada uno tiene 8 paradas, que ninguna se queda sin respuestas ni sin las 3
  pistas, y que las 4 versiones de una ruta tienen las mismas paradas.
- **Pago de punta a punta** — `wrangler dev` con claves de test, compra con
  `4242 4242 4242 4242`, comprobar que llega el email, que el token entra al
  juego y que un token manipulado se rechaza.
- **Partida completa** — con Playwright MCP: comprar, resolver las 8 paradas,
  pedir pistas, recargar a mitad y confirmar que el progreso sobrevive,
  llegar al final. Repetir en viewport móvil.
- **Sin conexión** — cargar la ruta, poner el navegador en offline y confirmar
  que se puede terminar la partida.
- **Sobre el terreno** — caminar cada ruta con el móvil antes de venderla y
  corregir lo que ya no esté donde dice el enigma. Sin esto no se cobra.

## Pendiente de ti, no bloquea el arranque

- Confirmar el dominio de `vestigia` (no he comprobado disponibilidad todavía).
- Precio por ruta; hasta que lo decidas queda en 29 € configurable en un sitio.
- Cuentas de Stripe y Resend, y el email del propietario para los avisos.

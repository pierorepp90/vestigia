# Vestigia — blog de historias (SEO)

## Contexto

Último ítem de la lista de mejoras SEO que se le presentó al usuario (los
otros dos — SSG multilingüe de portada/ciudad/ruta y enlaces cruzados
entre rutas y ciudades — ya están implementados y en producción). La idea
original: un hub de artículos cortos de historia/curiosidades que capten
búsquedas informativas ("secretos del Barrio Gótico", etc.) además de las
transaccionales que ya cubren `ciudad/` y `ruta/`, y que enlacen desde ahí
a la ruta de pago correspondiente.

A diferencia del SSG y los enlaces cruzados, este ítem tenía preguntas
reales sin resolver — volumen, idiomas, forma visual, tono del enlace de
cierre — que se resolvieron en una sesión de brainstorming con el
compañero visual. Este documento recoge esas decisiones.

## Decisiones tomadas

| Tema | Decisión |
|---|---|
| Volumen | 11 posts, uno por cada ciudad activa (todas menos Praga) |
| Idiomas | Los 4 desde el lanzamiento (ES/EN/FR/IT), mismo patrón que el resto del sitio |
| Título de cada post | Distinto ángulo por ciudad (pregunta, dato sorprendente, afirmación) — nunca la misma plantilla "N secretos de X" repetida 11 veces |
| Diseño del índice | Un post destacado arriba + cuadrícula del resto debajo (validado visualmente, opción C de 3) |
| Diseño de la ficha de post | Reutiliza el patrón de lectura larga de la ficha de ruta (`ruta-detalle`) — misma tipografía, mismo estilo de bloque para cada sección |
| Cierre del artículo | Sin botón — un enlace editorial dentro de la propia frase de cierre, en cursiva serif (rojo lacre), no un CTA tipo "comprar" (validado visualmente: un botón sólido se sentía fuera de tono en contenido editorial) |
| Fotos | Reutiliza fotos ya existentes de `assets/img/ciudades/` (de la ciudad o de una de sus rutas) — no se encargan fotos nuevas para el lanzamiento |
| Contenido pagado | Ninguna curiosidad del blog puede ser la respuesta de un enigma de la ruta correspondiente — mismo principio que ya separa `worker/src/contenido/` del resto del sitio |

## 1. Contenido

Cada post: 4-6 curiosidades reales sobre la ciudad (o sobre el barrio de
una de sus rutas), ~500-700 palabras en total, mismo criterio de rigor que
ya se aplicó a la investigación histórica de las rutas — hechos
verificables, no relleno genérico de guía turística.

**Los 11 títulos** (ES, ya validados con el usuario; EN/FR/IT se traducen
en el mismo paso que traduce el resto del post):

| Ciudad | Título |
|---|---|
| Barcelona | ¿Por qué el Barrio Gótico no es tan gótico como parece? |
| Roma | Lo que Trastevere lleva siglos mostrando sin que nadie mire |
| París | El mito del Bateau-Lavoir que hasta las guías repiten mal |
| Lisboa | Alfama sobrevivió al terremoto que borró media Lisboa: así se nota todavía |
| Florencia | La rivalidad que Florencia construyó en piedra, cúpula a cúpula |
| Madrid | El animal mitológico que ya no está en el escudo de Madrid |
| Valencia | La copa que el Carmen guarda desde la Última Cena (o eso dicen) |
| Nápoles | Una calle griega de 2.500 años sigue partiendo Nápoles en dos |
| Toulouse | Por qué a Toulouse le dicen la Ciudad Rosa |
| Berlín | Berlín no esconde su historia del siglo XX: la deja tallada en la calle |
| Estambul | La única ciudad que fue capital de dos imperios sin cambiar de sitio |

Cada título ya apunta a una ciudad o a un barrio de una de sus rutas —
quien escriba cada post (ver "Flujo de creación") elige libremente si el
ángulo termina siendo sobre la ciudad entera o sobre el barrio específico
de la ruta, según qué hechos reales existan.

**Cierre de cada post:** un párrafo final que menciona, con un enlace
editorial (no un botón), la ruta de esa ciudad. Roma, Florencia y París
tienen dos rutas cada una — el cierre puede mencionar la que mejor encaje
con el tema del post, o ambas si el texto lo permite con naturalidad; no
hace falta forzar las dos siempre.

**Flujo de creación** (mismo patrón que ya funcionó para las 16 rutas):
Claude preselecciona los hechos reales por ciudad — reutilizando en buena
parte la investigación ya hecha para las rutas, más algún dato nuevo
cuando el ángulo del post lo pida — y despacha un subagente por post en
paralelo para escribir el texto en español contra esos hechos. Revisión,
y de ahí se traduce a EN/FR/IT con el mismo patrón usado para el
contenido de las rutas.

## 2. Datos: `HISTORIAS` en `js/catalogo.js`

Nuevo array exportado, mismo espíritu que `CIUDADES`/`RUTAS` — sin
Markdown ni ningún formato nuevo, todo el sitio ya sabe trabajar con este
patrón `{es, en, fr, it}`:

```js
export const HISTORIAS = [
  {
    id: 'roma',                    // = ciudadSlug; un post por ciudad
    ciudadSlug: 'roma',
    imgHero: 'assets/img/ciudades/roma-trastevere-hero.webp', // foto ya existente
    titulo: { es: '...', en: '...', fr: '...', it: '...' },
    resumen: { es: '...', en: '...', fr: '...', it: '...' }, // excerpt en índice + meta description
    secciones: [
      {
        titulo: { es: '1 · La lámpara apagada', en: '...', fr: '...', it: '...' },
        texto: { es: '...', en: '...', fr: '...', it: '...' },
      },
      // 4-6 secciones
    ],
    enlacesRutas: ['roma-trastevere'],       // 1 o 2 ids de RUTAS
    cierre: {                                 // {ruta1}/{ruta2} se interpolan con el título+href real
      es: 'Estos y otros indicios reales del barrio forman parte de {ruta1}, la ruta a pie por Trastevere.',
      en: '...', fr: '...', it: '...',
    },
  },
  // 11 entradas
];

export function historiaPorSlug(slug) {
  return HISTORIAS.find((h) => h.id === slug) || null;
}
```

`{ruta1}`/`{ruta2}` en `cierre` se resuelven igual que `{ciudad}` ya se
resuelve hoy en `tf()` — el renderizador sustituye el placeholder por
`<a class="enlace-editorial" href="...">{título real de la ruta}</a>`
(la clase va directo en el `<a>`, no en un `<span>` envolvente: así el
`text-decoration-color` propio del enlace no compite con el subrayado por
defecto del navegador), así la traducción del cierre es prosa limpia,
nunca HTML incrustado en el diccionario.

## 3. Páginas y generación

```
historias/
├── index.html          # destacado + cuadrícula, análogo a index.html de portada
├── barcelona.html
├── roma.html
├── paris.html
├── lisboa.html
├── florencia.html
├── madrid.html
├── valencia.html
├── napoles.html
├── toulouse.html
├── berlin.html
└── estambul.html
```

- `js/historias.js` (nuevo, mismo patrón que `ciudad.js`/`ruta.js`):
  renderiza el índice (`data-idioma-pagina`-aware igual que el resto) y la
  ficha de cada post a partir de `data-historia` en el `<body>`.
- `scripts/generar-historias.mjs` (nuevo, mismo patrón que
  `generar-seo.mjs`): rellena `<title>`/`<meta description>`/canonical+
  hreflang/JSON-LD (`Article`, no `Product` — ver sección 5) en los 11
  `historias/*.html` en español.
- `scripts/generar-i18n.mjs` se extiende para generar
  `/en/historias/*.html`, `/fr/historias/*.html`, `/it/historias/*.html`
  con el mismo mecanismo ya usado para `ciudad/`/`ruta/` (reutiliza
  `aplicarI18nTexto`/`aplicarI18nAtributos`/`conTexto`/`conHTML` tal
  cual).
- `scripts/sitio-i18n.mjs` gana un tipo de página más en
  `rutaRelativa()`/`urlPagina()`: `'historia'` → `historias/${id}.html`.

**Navegación:** el menú principal pasa de `Ciudades · Cómo funciona` a
`Ciudades · Cómo funciona · Historias`, en `index.html`, `ciudad/*.html` y
`ruta/*.html` (y sus 33 variantes de idioma) — mismo patrón de enlace que
ya usan "Ciudades"/"Cómo funciona" hoy.

## 4. Diseño visual

**Índice** (`historias/index.html`): el post marcado primero en el array
`HISTORIAS` aparece destacado arriba (foto + título + resumen, más
grande); el resto en cuadrícula de tarjetas debajo (foto + eyebrow de
ciudad + título), mismo lenguaje visual que `tarjeta-ciudad`/`tarjeta-ruta`
— clases CSS nuevas (`tarjeta-historia`, `historia-destacada`) pero
reutilizando los mismos tokens (`--paper`, `--ink`, `--lacre`,
tipografía Fraunces/Archivo/IBM Plex Mono) que ya define `styles.css`.

**Ficha de post** (`historias/<slug>.html`): calca la estructura de
`ruta-detalle` — foto hero, eyebrow (ciudad), título, párrafo de
introducción, y cada sección de `secciones[]` en un bloque con el mismo
tratamiento visual que hoy usa `.adelanto` (fondo `--paper`, borde
izquierdo `--lacre` de 3px, eyebrow en mono). Cierra con el párrafo de
`cierre`, el enlace a la ruta como `<a class="enlace-editorial">`
(cursiva Fraunces, rojo lacre, subrayado sutil en `--paper-edge`) — sin
botón.

## 5. SEO técnico

- `<title>`/`<meta description>` reales por post y por idioma (mismo
  patrón que ya corrige `generar-seo.mjs` en las rutas).
- Canonical + hreflang (4 idiomas + x-default) en las 44 URLs, mismo
  mecanismo que `sitio-i18n.mjs` ya provee.
- JSON-LD tipo `Article` (no `Product` — un post no tiene precio):
  `headline`, `description`, `image`, `datePublished` (fecha de
  publicación real, fija, no se recalcula en cada build),
  `author`/`publisher` como `Organization` "Vestigia".
- `sitemap.xml`: pasa de 112 a 160 URLs (índice del blog + 11 posts = 12 páginas nuevas × 4 idiomas).
- `robots.txt`: sin cambios — `historias/` es contenido público, se
  indexa igual que `ciudad/`/`ruta/`.

## Riesgos / pendientes

| Qué falta | Por qué no se resuelve aquí |
|---|---|
| Precisión histórica del contenido del blog | Mismo rigor que las rutas al investigar, pero un riesgo distinto: el contenido de una ruta se vende después de caminarla; un post de blog lo indexa Google el mismo día que se publica. Conviene una revisión de hechos más cuidadosa antes de publicar, no después. |
| Volumen de trabajo de creación (11 posts × 4 idiomas = 44 piezas) | Es un lote grande — en lotes de contenido similares de esta sesión (rutas nuevas) el límite de sesión del propio harness se alcanzó más de una vez a mitad de tarea. Se resuelve igual que entonces (retomar los subagentes cuando el límite se resetea), no es un bloqueo de diseño. |
| Fecha de "próxima entrega" de contenido nuevo del blog | Este spec cubre el lanzamiento con 11 posts fijos, no un calendario editorial continuo — el usuario explícitamente descartó esa opción más grande al elegir el volumen. Si en el futuro se quiere calendario recurrente, es una decisión aparte. |

# Plan de tráfico orgánico y visibilidad en IA: Vestigia

**Actualizado:** 2026-11-20
**Mercados:** España (español) y turistas que buscan en inglés, francés e italiano
**Playbook general:** skill `crecimiento-organico` (`~/.claude/skills/crecimiento-organico/`). Este documento es su aplicación a Vestigia.

## Resumen

- **Hasta hoy, en español el sitio casi no existía para los buscadores.** Las páginas en español eran un cascarón que rellenaba JavaScript: 25 palabras en una ciudad, 38 en una historia. Además, el JS elegía el idioma según el navegador, y Googlebot navega en inglés: **Google veía las URLs en español traducidas al inglés**, como copias de `/en/`. Bing y los bots de IA (que no ejecutan JS) no veían nada. Está arreglado en la rama `seo` (ver *Base técnica*).
- **La categoría tiene poco volumen; los lugares, mucho.** «escape room al aire libre» tiene 110 búsquedas al mes en España. «pont del bisbe» tiene 40.500, «el born barcelona» 27.100, «montmartre» 22.200 y «trastevere» 18.100, todas con dificultad casi nula. Vestigia ya tiene, por cada barrio, una ruta y una historia con datos curiosos y reales: **el crecimiento está en contar los barrios, no en competir por «escape room»**.
- **vestigia.fun no está en Search Console ni en Bing**, y para «vestigia» Google muestra un museo, una editorial y Wikipedia. Sin el alta no se puede medir nada, y sin desambiguar la marca las IA mezclan entidades.
- **El orden:** alta y medición (tú, 30 minutos), fusionar la rama `seo`, y después contenido de barrios y distribución en marketplaces.

## Posicionamiento

Una sola frase en todos lados: sitio, JSON-LD, perfiles, marketplaces y prensa. Así las IA consolidan una única entidad «Vestigia». **Propuesta (pendiente de tu visto bueno):**

> Vestigia son escape rooms urbanos al aire libre: rutas de enigmas por el centro histórico de 11 ciudades europeas que se juegan con el móvil, a tu ritmo y sin guía.

Ya está en el JSON-LD de la organización (`scripts/seo.mjs` → `frasePosicionamiento`), en los cuatro idiomas.

**Desambiguación de la marca.** Para «vestigia» hoy salen el Museo Vestigia (Castilla y León), Editio Vestigia, la entrada de Wikipedia, «Vestigia» de Cortegana, vestigia.net y varias tiendas «Vestigio». Vestigia.fun no aparece. Por eso:
- La primera mención en cualquier sitio externo va siempre con descriptor: «Vestigia, escape rooms al aire libre» o «Vestigia (vestigia.fun)».
- Cuando existan perfiles propios (Instagram, TikTok, GetYourGuide…), se añaden como `sameAs` en `ldOrganizacion()` de `scripts/seo.mjs`.
- **Portada (decisión tuya):** hoy el H1 es «Sigue los vestigios.», un eslogan que no dice qué es Vestigia. La skill recomienda que el H1 describa y el eslogan vaya de bajada. Propuesta:

| | Hoy | Propuesta |
|---|---|---|
| `<title>` | ~~Vestigia — Escape rooms urbanos al aire libre~~ | **Escape room al aire libre en 11 ciudades de Europa — Vestigia** (ya aplicado) |
| H1 | Sigue los vestigios. | **Escape rooms al aire libre por el centro histórico de 11 ciudades** |
| Bajada | Cada ciudad esconde una historia… | **Sigue los vestigios.**, y después el párrafo actual |
| Eyebrow | Escape rooms urbanos al aire libre | Se puede quitar o dejar como está |

## Diagnóstico técnico (vestigia.fun, 2026-11-20)

| Qué | Antes | Ahora (rama `seo`) |
|---|---|---|
| Contenido en el HTML (español) | ❌ Cascarón: ciudad 25 palabras, ruta 103, historia 38. La portada no enlazaba a ninguna ciudad sin JS | ✅ Prerender: ciudad ~240, ruta ~260, historia ~750, portada ~660 |
| Idioma por URL | ❌ Las URLs en español se pintaban en inglés con el navegador en inglés (Googlebot incluido). Verificado con Playwright | ✅ `data-idioma-pagina` en todas las páginas: cada URL, un idioma |
| Título y descripción | ❌ El JS los reescribía al cargar («Barcelona — Vestigia»). La descripción de las ciudades era «Rutas de escape room urbano en Barcelona.». La de la portada nombraba solo 3 ciudades de 11 | ✅ Fórmulas con el vocabulario real de cada idioma, y el JS ya no las toca |
| Open Graph | ❌ Solo en la portada, sin imagen: los enlaces por WhatsApp salían sin foto | ✅ En las 160 páginas, con JPG de 1200×630 por ciudad y por ruta |
| JSON-LD | ⚠️ Product en rutas y Article sin fecha en historias; nada en portada ni ciudades | ✅ Organization + WebSite, ItemList, Product, Article con fechas y BreadcrumbList en todas |
| Canonical de índices | ⚠️ `/index.html`, `/en/index.html` | ✅ `/`, `/en/`, `/historias/` |
| Favicon | ❌ Solo `data:` URI: `/favicon.ico` daba 404 y Google mostraba un globo genérico en los resultados | ✅ `favicon.ico`, `favicon.svg` y `apple-touch-icon.png` |
| Página 404 | ❌ La genérica de GitHub, sin enlaces | ✅ Propia, con `noindex` y enlaces a ciudades e historias |
| Sitemap | ⚠️ 160 URLs sin `lastmod` | ✅ Con `lastmod` fiable: cambia solo si cambia el HTML de esa página |
| `robots.txt` | ✅ Permitía todo salvo `/jugar/` | ✅ Además cierra `/admin/`, y lo comenta |
| Estructura | ⚠️ El índice de historias no tenía H1; las secciones de cada historia eran `<p>` | ✅ Un H1 por página; las secciones son `<h2>` (sin cambio visual) |
| `http://`, `www.` | ✅ 301 a `https://vestigia.fun/` | ✅ |
| Search Console y Bing | ❌ Sin alta | ⏳ Te toca a ti (ver abajo) |
| Analytics | ❌ No hay | ⏳ Decisión tuya |

Todo lo anterior lo protege [tests/seo.test.js](../../tests/seo.test.js): idioma fijo, H1 con texto, mínimo de palabras, una canonical, OG con imagen existente, JSON-LD válido y sitemap completo, en las 160 páginas.

## Qué se busca

Datos de Google España (OpenSEO / DataForSEO, noviembre de 2026) y del autocompletado de Google en cada país.

**La categoría, en cada idioma** (es lo que usan ahora los títulos de ciudad y de ruta):

| Idioma | Cómo lo busca la gente | Volumen y notas |
|---|---|---|
| Español | «escape room al aire libre + ciudad», «escape room urbano», «escape room exterior», «escape room en la calle», «gymkana urbana» | Pequeño: 110/mes la genérica; «escape room exterior barcelona» 70, «escape room al aire libre barcelona» 50 (KD 43, dominan Wonderbox y TripAdvisor) |
| Inglés | «scavenger hunt + city», «treasure hunt + city», «self-guided walking tour + city», «outdoor escape game» | El autocompletado sugiere «rome scavenger hunt free», «…pdf» |
| Francés | «jeu de piste + ville», «escape game extérieur», «escape game urbain», «escape game en plein air» | Muy fuerte la variante **«gratuit»**: «jeu de piste paris gratuit», «…toulouse gratuit», «escape game urbain gratuit» |
| Italiano | «caccia al tesoro + città», «escape room all'aperto» | También **«gratis»** y «adulti»: «caccia al tesoro roma gratis», «…firenze per adulti» |

**Los lugares: aquí está el volumen** (España, búsquedas al mes, dificultad 0–100):

| Búsqueda | Volumen | KD | Qué tiene ya Vestigia |
|---|---|---|---|
| pont del bisbe | 40.500 | 0 | La historia de Barcelona trata justo de él. Los resultados actuales son flojos (TripAdvisor, bancos de fotos) |
| el born barcelona | 27.100 | 13 | Ruta `barcelona-born` (gratis) |
| montmartre | 22.200 | 4 | Ruta `paris-montmartre` (gratis) e historia de París (Sacré-Cœur) |
| trastevere | 18.100 | 0 | Ruta `roma-trastevere` (gratis) e historia de Roma |
| barrio gotico | 12.100 | 2 | Ruta `barcelona-gotic` |
| campo de fiori | 8.100 | 0 | Ruta `roma-centro` |
| el raval barcelona | 8.100 | 0 | Ruta `barcelona-raval` |
| free tour madrid / barcelona | 8.100 / 5.400 | 20 / 3 | Alternativa directa: también es caminar por el centro sin pagar guía |
| barrio de las letras madrid | 6.600 | 0 | Nada todavía |
| alfama | 5.400 | 0 | Ruta `lisboa-alfama` e historia de Lisboa |
| sacre coeur | 5.400 | 8 | Historia de París |
| spaccanapoli | 5.400 | 10 | Ruta `napoles-spaccanapoli` e historia de Nápoles |
| madrid de los austrias | 2.900 | 2 | Ruta `madrid-austrias` |
| barrio del carmen valencia | 2.900 | 0 | Ruta `valencia-carmen` (gratis) |
| escudo de madrid | 1.900 | 0 | Historia de Madrid |
| stolpersteine | 1.900 | 5 | Historia de Berlín |
| terremoto de lisboa | 1.900 | 5 | Historia de Lisboa |
| cupula de brunelleschi | 1.600 | 0 | Historia de Florencia |
| santo grial valencia | 1.300 | 7 | Historia de Valencia |
| que ver en trastevere / montmartre | 880 / 720 | 0 | Encaja con una guía de barrio |
| que hacer en barcelona gratis | 320 | 10 | Encaja con la ruta gratis de El Born |

Ya aplicado: el `<title>` de cada historia pone el lugar delante («Pont del Bisbe: por qué el Barrio Gótico no es tan gótico como parece»). El H1 visible no cambia. Están en `TITULOS_HISTORIA` (`scripts/seo.mjs`), en los cuatro idiomas.

**Lectura:** con un AI Overview en pantalla, quien busca «trastevere» recibe un resumen y se va. Vestigia gana donde la respuesta no basta: **una manera de recorrer el barrio**, con su historia contada en el sitio. Cada guía de barrio termina en la ruta del barrio, y en varias ciudades esa ruta es gratis.

## Fases

### Sin código: alta y medición (tú, ~30 min)

- **Search Console, propiedad de dominio `vestigia.fun`.** El DNS está en **Nominalia**, no en Cloudflare, así que la skill `alta-buscadores` no puede hacerlo sola. Pasos:
  - En [search.google.com/search-console](https://search.google.com/search-console): *Añadir propiedad* → *Dominio* → `vestigia.fun`. Google te da un registro TXT.
  - En el panel de Nominalia: añade ese TXT en la raíz del dominio, sin borrar nada.
  - Verifica y envía `https://vestigia.fun/sitemap.xml` en *Sitemaps*.
  - Si me pasas el valor del TXT, te digo exactamente dónde va y compruebo con `nslookup` que se propagó.
- **Bing Webmaster Tools** ([bing.com/webmasters](https://www.bing.com/webmasters)): *Importar desde Google Search Console*. Así queda verificado sin tocar el DNS. Envía también el sitemap. ChatGPT busca en parte sobre el índice de Bing: sin esto, para ChatGPT no existes.
- **Línea base:** páginas indexadas, impresiones y la consulta «vestigia». Lo esperable hoy es casi cero.
- **Panel de prompts:** la primera pasada de las 10 preguntas (ver *Medición*). Se anota en `docs/crecimiento/panel-prompts.md`.

### Base técnica (rama `seo`, implementada el 2026-11-20)

Hecha y verificada: ver *Diagnóstico técnico*. Cómo funciona:
- `node scripts/generar-i18n.mjs` genera las 160 páginas (4 idiomas × 40), con el español incluido. Los archivos en español son a la vez plantilla y resultado. Es idempotente: dos pasadas dan los mismos bytes.
- `scripts/seo.mjs` concentra títulos, descripciones, frase de posicionamiento, Open Graph y JSON-LD.
- `generar-seo.mjs` y `generar-historias.mjs` quedan como alias, así que los comandos de siempre siguen funcionando.
- Las imágenes OG viven en `assets/img/og/`. Si se añade una ciudad o una ruta, hay que generar su `ciudad-<slug>.jpg` o `ruta-<id>.jpg` (recorte 1200×630 de su `imgHero`). El test avisa si falta.
- Las historias muestran «Publicado el…», con la fecha sacada de git. Cuando se revise una, se pone `actualizada: 'AAAA-MM-DD'` en su entrada de `js/catalogo.js`, y sale como «Actualizado el…» y en el JSON-LD.

**Pendiente técnico menor (opcional):**
- Los precios se muestran «4.99 €». En español, francés e italiano es «4,99 €». No afecta al SEO, sí a la confianza.
- Un aviso discreto «This page is also available in English» para quien llega a una URL en español con el navegador en otro idioma. **No debe redirigir solo**: si redirige, Googlebot nunca vería el español. Hoy no hay nada; antes, el JS traducía la página entera.
- Velocidad: las fotos de cabecera pesan 100–300 KB y no llevan `width`/`height`. Se puede revisar con la skill `web-perf`.

### Contenido (una pieza por semana; las pilares se revisan cada trimestre)

En este orden, por volumen y por lo que ya existe:

- **Guías de barrio, una por ruta**, en `/barrio/<id>.html` o como sección larga de la ficha de ruta (decisión tuya). Ejemplo: «Qué ver en El Born: 8 rincones y lo que casi nadie sabe de ellos». Cada guía:
  - abre con la respuesta: qué es el barrio y por qué merece la pena, en dos oraciones;
  - recorre los rincones **sin revelar los enigmas**: el qué, no la solución;
  - trae datos con fecha y fuente (año de construcción, el arquitecto, la cita textual), que es lo que suben las citas en IA;
  - cierra con «Recórrelo jugando», que lleva a la ruta.

  Orden sugerido por volumen: El Born, Montmartre, Trastevere, Barrio Gótico, Campo de' Fiori / Centro Storico, El Raval, Alfama, Spaccanapoli, Madrid de los Austrias, Barrio del Carmen. **No es contenido en masa con plantilla**: cada guía necesita sus datos propios, o se castiga (core update de marzo de 2026).
- **Historias: ampliar las que ya existen** antes de crear nuevas. Empezar por la de Barcelona: el Pont del Bisbe tiene 40.500 búsquedas y competencia floja. Añadir arriba una respuesta directa («El Pont del Bisbe es de 1928, no del siglo XV: lo diseñó Joan Rubió i Bellver…»), cómo llegar, la leyenda de la calavera, y fuentes enlazadas.
- **Páginas de ciudad menos finas.** Las ciudades con una sola ruta (Lisboa, Madrid, Valencia, Nápoles, Toulouse, Berlín, Estambul) rondan las 130 palabras. Les falta un bloque «Qué vas a ver» y unas preguntas frecuentes visibles.
- **Preguntas frecuentes en cada ruta**, en texto visible (no por el schema FAQ, que Google ya no muestra): ¿hace falta guía?, ¿sirve para niños?, ¿y si llueve?, ¿se puede jugar de noche?, ¿cuánto se camina?, ¿hay que reservar hora? Son los criterios que los asistentes usan para recomendar, y una página que los responde uno por uno es la que pueden citar.
- **Comparativa honesta:** «Free tour, escape room urbano o ir por libre: qué conviene en Barcelona». Reconoce lo que hace mejor un free tour (preguntar a un guía, compañía). «free tour barcelona» tiene 5.400 búsquedas.
- **Una página de ayuda pública** («Cómo funciona», «Qué pasa si me atasco», «Versión imprimible», «Devoluciones»), con una afirmación clara por artículo. Desde agosto de 2026, ChatGPT prefiere citar centros de ayuda y documentación.

Quién revisa: alguien que haya caminado las rutas. El README ya marca como pendiente verificar las 16 rutas en persona; las guías de barrio pueden salir de esa misma caminata, con fotos propias.

### Distribución de costo cero (en paralelo, desde que esté la rama `seo` publicada)

En turismo, las listas de terceros y los marketplaces son las fuentes que más citan las IA (≈85% de las menciones de marca vienen de páginas que no son tuyas). **Dos canales recurrentes**, sostenidos 90 días antes de juzgarlos:

- **Marketplaces de actividades:** GetYourGuide, Civitatis, Viator y las experiencias de TripAdvisor. Cobran comisión por venta, no por estar. Son justo quienes ocupan hoy «escape room al aire libre barcelona». Una ficha por ruta, con la frase de posicionamiento y enlace a vestigia.fun. Cuidado con `TODAS_GRATIS`: una ruta gratis en el sitio y de pago en el marketplace confunde.
- **Video corto** (Reels, TikTok, Shorts): un enigma real por vídeo, grabado en el sitio («¿Por qué este puente gótico es de 1928?»), y la solución en la ficha. YouTube, además, es un buscador en sí mismo.

**Tareas de una sola vez:**
- **Oficinas de turismo:** la de Toulouse ya promociona juegos de pista («jeu de piste toulouse office du tourisme» sale en el autocompletado). Ofrecerles la ruta gratis como recurso.
- **Listas «cosas que hacer en…» y «planes originales en…»** de blogs de viaje en los cuatro idiomas: escribir a quien las mantiene con acceso gratis y un dato concreto.
- **Hostales y alojamientos del centro:** un QR a la ruta gratis de su barrio. Dejan un enlace desde su web y traen grupos.
- **Una nota de prensa con un dato propio** cuando haya partidas suficientes (por ejemplo, «el enigma que más equipos fallan en Barcelona»).

## Medición

- **Search Console:** consultas, páginas, e impresiones en AI Overviews y AI Mode (informe de IA generativa).
- **Bing Webmaster Tools:** el informe AI Performance (citas en Copilot y consultas de grounding).
- **Analytics sin cookies (decisión tuya).** Opciones gratis: GoatCounter o Cloudflare Web Analytics, que funciona con un snippet aunque el sitio no pase por Cloudflare. Lo que importa medir:
  - referrers y UTM (ChatGPT añade `utm_source=chatgpt.com`);
  - el embudo ficha de ruta → «Jugar gratis» / «Reservar».

  Antes de activarlo, hay que actualizar `legal/privacidad.html`.
- **Panel mensual de prompts:** cada pregunta en ChatGPT, Gemini, Claude, Perplexity y Google AI Mode, una conversación nueva cada vez y en chat temporal. Anotar si aparece Vestigia, en qué lugar, quién aparece en su lugar y qué criterios usa el asistente para recomendar.
  1. ¿Qué actividades originales puedo hacer en Barcelona con amigos?
  2. Recomiéndame un escape room al aire libre en Madrid
  3. ¿Hay algún juego para recorrer el Barrio Gótico por mi cuenta?
  4. Plan diferente para un fin de semana en Roma
  5. Self-guided scavenger hunt in Rome: what are the options?
  6. Jeu de piste à Paris pour adultes, gratuit ?
  7. Caccia al tesoro a Firenze per adulti
  8. ¿Qué ver en el Trastevere en dos horas?
  9. ¿Por qué el Pont del Bisbe parece gótico si no lo es?
  10. ¿Qué es Vestigia escape room? (chequeo de la entidad)
- **Indicadores a 90 días:**
  - páginas indexadas (objetivo: las 160);
  - impresiones y clics sin marca;
  - apariciones en el panel (x de 10, por plataforma);
  - partidas iniciadas por fuente.

## Decisiones que te tocan

| Tema | Propuesta | Estado |
|---|---|---|
| Frase de posicionamiento | La de arriba | Pendiente |
| H1 de la portada | Describir qué es; el eslogan, de bajada | Pendiente |
| Títulos SEO de rutas, ciudades e historias | Los de `scripts/seo.mjs` | Aplicados; revisar |
| Search Console y Bing | Alta con TXT en Nominalia | Pendiente (tú) |
| Analytics | GoatCounter o Cloudflare Web Analytics, previa actualización de la privacidad | Pendiente |
| Guías de barrio | Página propia o sección larga de la ruta | Pendiente |
| Quién revisa el contenido | Quien camine las rutas | Pendiente |
| Marketplaces | Sí o no; y cómo encaja con `TODAS_GRATIS` | Pendiente |
| Dos canales recurrentes | Marketplaces + video corto | Pendiente |

**Coordinación con la promoción `TODAS_GRATIS`** (en curso en `master` al escribir esto): cuando se fusione la rama `seo` y se regenere con `node scripts/generar-i18n.mjs`, las descripciones dirán solas «Gratis» o «Free to play» en cada ciudad. Eso es una ventaja en francés e italiano, donde «gratuit» y «gratis» pesan mucho. Si la promoción termina, basta con regenerar.

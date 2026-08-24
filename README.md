# Vestigia

Escape rooms urbanos al aire libre por el centro histórico de grandes
ciudades. *Una manera divertida de conocer la ciudad.*

Sitio estático (HTML/CSS/JS sin build) + un Worker de Cloudflare para pagos
y contenido de juego. Mismo patrón que
[grip-la-seu](../grip-la-seu) y [Siurana Outdoors](../Siurana%20Outdoors).

## Estructura

```
index.html, ciudad/*.html, ruta/*.html   → escaparate (marketing)
jugar/                                    → motor de juego, pago, imprimible
css/  js/                                 → estilos y lógica del sitio estático
worker/                                   → API (Cloudflare Worker): pagos, tokens, contenido
tests/  worker/tests/                     → node --test
docs/superpowers/                         → spec y plan de este proyecto
```

El contenido de los enigmas (`worker/src/contenido/*.json`) vive **solo en
el Worker**, nunca en el sitio estático: es lo único que hay que pagar
para ver, y por eso no se sirve como archivo público.

## Arrancar en local

Necesitas dos servidores a la vez.

**1. Sitio estático** (desde la raíz del proyecto):
```
npx http-server -p 8743 .
```
o cualquier servidor estático equivalente (`python -m http.server 8743`).

**2. Worker** (desde `worker/`):
```
cd worker
npm install
npm run dev            # wrangler dev, sirve en http://127.0.0.1:8787
```

Mientras desarrolles en local, cambia temporalmente
[js/config.js](js/config.js) para que apunte al Worker local:
```js
export const API_BASE_URL = 'http://127.0.0.1:8787';
```
**Recuerda revertirlo a la URL de producción antes de desplegar.**

`worker/.dev.vars` (no se commitea) trae ya un `TOKEN_SECRET` de pruebas.
Para probar el flujo de juego sin pasar por Stripe, mina un token a mano:
```
cd worker
node scripts/mint-dev-token.mjs barcelona-gotic
```
El comando imprime una URL de `jugar/` lista para abrir.

## Tests

```
npm test
```
Corre `node --test` sobre `tests/` y `worker/tests/` a la vez (99 tests):
motor de juego, tokens de acceso, integridad de contenido (16 rutas × 4
idiomas = 64 archivos, cada uno con sus 8 paradas), coherencia de precios,
Stripe y Resend con `fetch` simulado, y paridad de traducciones en
`js/i18n.js` y `js/catalogo.js` — ningún idioma puede quedarse con una
clave a medias sin que un test lo detecte.

## Poner en marcha el pago de verdad

1. **Stripe**: cuenta en modo test, copiar la clave secreta.
2. **Resend**: cuenta, dominio verificado, copiar la API key.
3. Configurar los secretos del Worker (nunca en `wrangler.toml`):
   ```
   cd worker
   npx wrangler secret put TOKEN_SECRET        # openssl rand -hex 32
   npx wrangler secret put STRIPE_SECRET_KEY
   npx wrangler secret put RESEND_API_KEY
   ```
4. En el Dashboard de Stripe (Settings → Business → Public details),
   configurar la **Terms of service URL** apuntando a
   `https://<tu-dominio>/legal/condiciones.html` — si no, la casilla de
   aceptar condiciones del checkout no se activa (ver
   [worker/src/stripe.js](worker/src/stripe.js)).
5. Probar con tarjetas de test de Stripe (`4242 4242 4242 4242`) antes de
   pasar a modo live.

## Desplegar

- **Worker**: `cd worker && npx wrangler deploy`
- **Sitio estático**: GitHub Pages (u otro hosting estático) apuntando a
  la raíz del repo. Falta el `CNAME` — se añade cuando se confirme el
  dominio (ver más abajo).

## Estado del proyecto

Hecho y probado en local end-to-end: portada, páginas de ciudad, fichas de
ruta, motor de juego completo (respuestas con tolerancia a erratas,
pistas, cronómetro, progreso persistente y offline), versión imprimible,
checkout de Stripe + emails de Resend + token de acceso, páginas legales.

**16 rutas jugables en 11 ciudades** (Barcelona tiene tres: Barri Gòtic, El
Born y El Raval; Roma, Florencia y París tienen dos cada una — cada segunda
ruta en un barrio distinto y a una dificultad distinta de la primera, para
quien ya se jugó la primera; Lisboa, Madrid, Valencia, Nápoles, Toulouse,
Berlín y Estambul tienen una cada una), **completas en español,
inglés, francés e italiano** — interfaz, catálogo público y las 128 paradas
(16 rutas × 8) con sus respuestas, pistas e historia. Precio según
dificultad: fácil = gratis, media = 4,99 €, difícil = 7,99 €. Solo Praga
sigue en «próximamente», sin ruta todavía. Probado de
punta a punta en inglés e italiano con Playwright (portada → ficha de
ruta → partida completa → pantalla final) sin mezcla de idiomas en ningún
punto — incluida una corrección real: la interfaz de `jugar/`,
`imprimir.html` y `gracias.html` no leía el `?idioma=` de la URL y podía
mostrar la interfaz en un idioma y los enigmas en otro; ahora el idioma de
la compra manda siempre sobre el detectado por el navegador.

**Pendiente, con dueño claro:**

| Qué falta | Por qué no se ha hecho ya |
|---|---|
| Verificar las 16 rutas caminándolas, **en los 4 idiomas** | Ningún enigma se debe vender sin comprobar en persona que el detalle físico sigue donde el texto dice — y hay que revisar también que cada traducción tenga sentido estando allí delante. Ver la nota de riesgo en la spec. |
| SSG de las páginas de marketing por idioma (`/en/`, `/fr/`, `/it/`) | Mejora de SEO opcional: ahora mismo el idioma se resuelve en tiempo de ejecución (funciona bien para el visitante) en vez de generarse como HTML estático por URL (mejor para buscadores). No bloquea vender. |
| Dominio definitivo | `vestigia.es` es un placeholder en `wrangler.toml`, `worker/.dev.vars` y `worker/src/resend.js` — falta comprobar disponibilidad y decidir. |
| Cuentas Stripe / Resend reales | Necesarias para cobrar y enviar email de verdad; ver sección anterior. |
| Revisión legal de `legal/*.html` | Son plantillas con los apartados habituales pero con placeholders (NIF, domicilio) y sin revisión profesional. |
| Fotos propias (opcional) | Ahora mismo son de Wikimedia Commons con licencia libre y atribución en [assets/img/ciudades/CREDITOS.md](assets/img/ciudades/CREDITOS.md); sirven para lanzar, pero se pueden sustituir cuando haya material propio. |

Ver [docs/superpowers/specs/](docs/superpowers/specs/) para el diseño
completo aprobado y su razonamiento.

// js/promocion.js
//
// Promoción temporal: mientras sea `true`, TODAS las rutas se muestran y se
// entregan gratis por el circuito sin Stripe (/api/acceso-gratuito) y el
// Worker rechaza abrir sesiones de Checkout. La tabla PRECIOS_POR_DIFICULTAD
// y toda la lógica de cobro (worker/src/stripe.js, confirm-payment) quedan
// intactas: para volver a cobrar basta con ponerlo a `false`, regenerar las
// páginas estáticas (node scripts/generar-seo.mjs && node
// scripts/generar-i18n.mjs) y desplegar web y Worker.
//
// Vive en un módulo aparte (y no en catalogo.js) para que i18n.js pueda
// leerlo sin arrastrar el catálogo entero a las pantallas de juego.
export const TODAS_GRATIS = true;

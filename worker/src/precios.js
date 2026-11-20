// worker/src/precios.js
//
// El precio de cada ruta se deriva de su dificultad — nunca se fija a mano
// por rutaId, para que sea imposible que el precio de cobro se desincronice
// del precio que ve el cliente en js/catalogo.js. Mismo patrón que ya usa
// worker/src/index.js: importar directamente del catálogo público, que
// Wrangler empaqueta junto con el resto del Worker al desplegar.
import { PRECIOS_POR_DIFICULTAD, esRutaGratis, rutaPorId } from '../../js/catalogo.js';

/** Tarifa de cobro para `rutaId`, o `null` si la ruta no existe. La moneda
 * se devuelve en minúsculas porque así la exige la API de Stripe. Es la
 * tarifa de la tabla por dificultad, sin aplicar la promoción TODAS_GRATIS:
 * así Stripe (y la validación de pagos ya hechos) no cambia con ella. */
export function precioDeRuta(rutaId) {
  const ruta = rutaPorId(rutaId);
  const nivel = ruta && PRECIOS_POR_DIFICULTAD[ruta.dificultad];
  if (!nivel) return null;
  return { importe: nivel.importe, moneda: nivel.moneda.toLowerCase() };
}

/** true si `rutaId` se entrega ahora mismo sin pasar por Stripe (tarifa 0 €
 * o promoción TODAS_GRATIS activa). `false` si la ruta no existe. */
export function rutaEsGratis(rutaId) {
  const ruta = rutaPorId(rutaId);
  return ruta ? esRutaGratis(ruta) : false;
}

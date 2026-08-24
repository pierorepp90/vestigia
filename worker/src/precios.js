// worker/src/precios.js
//
// El precio de cada ruta se deriva de su dificultad — nunca se fija a mano
// por rutaId, para que sea imposible que el precio de cobro se desincronice
// del precio que ve el cliente en js/catalogo.js. Mismo patrón que ya usa
// worker/src/index.js: importar directamente del catálogo público, que
// Wrangler empaqueta junto con el resto del Worker al desplegar.
import { PRECIOS_POR_DIFICULTAD, rutaPorId } from '../../js/catalogo.js';

/** Precio de cobro para `rutaId`, o `null` si la ruta no existe. La moneda
 * se devuelve en minúsculas porque así la exige la API de Stripe. */
export function precioDeRuta(rutaId) {
  const ruta = rutaPorId(rutaId);
  const nivel = ruta && PRECIOS_POR_DIFICULTAD[ruta.dificultad];
  if (!nivel) return null;
  return { importe: nivel.importe, moneda: nivel.moneda.toLowerCase() };
}

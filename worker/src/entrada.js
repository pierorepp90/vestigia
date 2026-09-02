// worker/src/entrada.js
//
// Validación de entrada compartida por los handlers de index.js: forma de
// `rutaId` / `idioma` y lectura acotada del body JSON. Aísla aquí lo que antes
// estaba disperso o ausente en cada handler.
import { rutaPorId } from '../../js/catalogo.js';

const IDIOMAS = ['es', 'en', 'fr', 'it'];
const RUTA_ID = /^[a-z]+(?:-[a-z]+)+$/;

/** true si `rutaId` existe en el catálogo y `idioma` es soportado (o ausente,
 *  en cuyo caso el handler cae a 'es'). */
export function entradaValida({ rutaId, idioma }) {
  if (idioma != null && !IDIOMAS.includes(idioma)) return false;
  if (typeof rutaId !== 'string' || !RUTA_ID.test(rutaId)) return false;
  return rutaPorId(rutaId) != null;
}

/** Lee el body JSON rechazando cuerpos desmesurados o malformados. Devuelve
 *  { datos } en éxito, o { error, status } listo para responder. */
export async function leerJsonAcotado(request, maxBytes = 2048) {
  const declarado = Number(request.headers.get('Content-Length'));
  if (Number.isFinite(declarado) && declarado > maxBytes) {
    return { error: 'Petición demasiado grande', status: 413 };
  }
  try {
    return { datos: await request.json() };
  } catch {
    return { error: 'JSON inválido', status: 400 };
  }
}

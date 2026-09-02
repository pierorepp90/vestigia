// worker/src/cumplimiento.js
//
// Marca de "pedido ya cumplido" para que /api/confirm-payment envíe los emails
// de acceso UNA sola vez por pedido, aunque el cliente recargue gracias.html.
// Con KV: marca persistente `fulfilled:<orderId>`. Sin KV (dev/tests): cae a un
// criterio por tiempo — solo reenvía si la sesión de Stripe se creó hace < 1h.

const VENTANA_SIN_KV_SEGUNDOS = 3600;
const TTL_MARCA_SEGUNDOS = 60 * 60 * 24 * 32;

export async function debeEnviarEmails(kv, orderId, session, ahoraMs = Date.now()) {
  if (kv) {
    try {
      return (await kv.get(`fulfilled:${orderId}`)) == null;
    } catch {
      // KV caído: decide por tiempo abajo.
    }
  }
  const creadaSeg = typeof session?.created === 'number' ? session.created : 0;
  return Math.floor(ahoraMs / 1000) - creadaSeg < VENTANA_SIN_KV_SEGUNDOS;
}

export async function marcarCumplido(kv, orderId, ahoraMs = Date.now()) {
  if (!kv) return;
  try {
    await kv.put(`fulfilled:${orderId}`, String(ahoraMs), { expirationTtl: TTL_MARCA_SEGUNDOS });
  } catch {
    // Si no se puede escribir, el peor caso es reenviar los emails una vez más.
  }
}

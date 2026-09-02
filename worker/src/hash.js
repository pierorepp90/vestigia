// worker/src/hash.js
//
// Hash de la IP del votante para deduplicar sin guardar la IP en claro.
// Web Crypto: disponible en el runtime de Workers y en Node >= 19.

export async function hashIp(ip, sal) {
  if (!sal) throw new Error('hashIp requiere una sal (env.IP_SALT)');
  const datos = new TextEncoder().encode(`${sal}:${ip || ''}`);
  const buffer = await crypto.subtle.digest('SHA-256', datos);
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

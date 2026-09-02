// worker/src/acceso.js
//
// Token de acceso firmado, sin base de datos — mismo espíritu que el
// checkout de grip-la-seu: el Worker no guarda ningún estado de partidas,
// solo sabe verificar si un token es auténtico y no ha caducado.
//
// Formato: base64url(JSON payload) + '.' + base64url(HMAC-SHA256 de esa parte)
// payload = { rutaId, orderId, exp }  (exp = segundos Unix)
//
// Usa Web Crypto (crypto.subtle), disponible tanto en el runtime de
// Cloudflare Workers como en Node ≥19 — así este módulo se puede probar con
// `node --test` sin necesidad de wrangler ni de mocks.

const UN_ANIO_EN_SEGUNDOS = 365 * 24 * 60 * 60;

function aBase64Url(bytes) {
  let binario = '';
  for (const byte of bytes) binario += String.fromCharCode(byte);
  return btoa(binario).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function deBase64Url(str) {
  const conRelleno = str.replace(/-/g, '+').replace(/_/g, '/').padEnd(str.length + ((4 - (str.length % 4)) % 4), '=');
  const binario = atob(conRelleno);
  const bytes = new Uint8Array(binario.length);
  for (let i = 0; i < binario.length; i += 1) bytes[i] = binario.charCodeAt(i);
  return bytes;
}

async function importarClave(secreto) {
  return crypto.subtle.importKey('raw', new TextEncoder().encode(secreto), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
    'verify',
  ]);
}

/**
 * Firma un token de acceso para `rutaId` + `orderId`, válido durante
 * `duracionSegundos` (por defecto 1 año, igual que "Qué incluye" promete en
 * la ficha de producto).
 */
export async function firmarToken({ rutaId, orderId }, secreto, duracionSegundos = UN_ANIO_EN_SEGUNDOS) {
  if (!rutaId || !orderId) throw new Error('firmarToken requiere rutaId y orderId');
  const payload = {
    v: 1,
    rutaId,
    orderId,
    exp: Math.floor(Date.now() / 1000) + duracionSegundos,
  };
  const payloadB64 = aBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const clave = await importarClave(secreto);
  const firma = await crypto.subtle.sign('HMAC', clave, new TextEncoder().encode(payloadB64));
  const firmaB64 = aBase64Url(new Uint8Array(firma));
  return `${payloadB64}.${firmaB64}`;
}

/**
 * Verifica un token. Devuelve el payload `{ rutaId, orderId, exp }` si la
 * firma es válida y no ha caducado, o `null` en cualquier otro caso
 * (formato inválido, firma alterada, caducado). Nunca lanza.
 */
export async function verificarToken(token, secreto) {
  if (typeof token !== 'string' || token.length === 0) return null;
  const partes = token.split('.');
  if (partes.length !== 2) return null;
  const [payloadB64, firmaB64] = partes;
  if (!payloadB64 || !firmaB64) return null;

  try {
    const clave = await importarClave(secreto);
    const firmaValida = await crypto.subtle.verify(
      'HMAC',
      clave,
      deBase64Url(firmaB64),
      new TextEncoder().encode(payloadB64),
    );
    if (!firmaValida) return null;

    const payload = JSON.parse(new TextDecoder().decode(deBase64Url(payloadB64)));
    if (!payload || typeof payload.exp !== 'number') return null;
    if (payload.v !== 1) return null; // versión del formato: permite invalidar en bloque sin rotar el secreto
    if (Math.floor(Date.now() / 1000) > payload.exp) return null;
    if (typeof payload.rutaId !== 'string' || typeof payload.orderId !== 'string') return null;

    return payload;
  } catch {
    return null; // base64 corrupto, JSON corrupto, etc. — token inválido, no un error del servidor.
  }
}

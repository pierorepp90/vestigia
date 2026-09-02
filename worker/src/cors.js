// worker/src/cors.js — mismo patrón que grip-la-seu/worker/src/cors.js
//
// CORS NO autoriza nada frente a clientes que no sean navegadores (curl,
// scripts): solo impide que JS de otro origen LEA la respuesta. La
// autorización real de estos endpoints son el token firmado (/api/ruta) y el
// rate limit por IP (worker/src/throttle.js).
export function buildCorsHeaders(requestOrigin, allowedOrigin) {
  const headers = {
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'X-Content-Type-Options': 'nosniff',
  };
  if (requestOrigin === allowedOrigin) {
    headers['Access-Control-Allow-Origin'] = allowedOrigin;
  }
  return headers;
}

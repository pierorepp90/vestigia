// worker/src/cors.js — mismo patrón que grip-la-seu/worker/src/cors.js
export function buildCorsHeaders(requestOrigin, allowedOrigin) {
  const headers = {
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
  if (requestOrigin === allowedOrigin) {
    headers['Access-Control-Allow-Origin'] = allowedOrigin;
  }
  return headers;
}

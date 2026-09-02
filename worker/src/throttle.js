// worker/src/throttle.js
//
// Cubo de rate limit por IP + acción sobre Workers KV. Ventana fija: la primera
// petición fija `reset` a `ahora + ventanaSegundos` y hasta ese instante se
// cuentan las peticiones de esa IP para esa acción.
//
// FALLA EN ABIERTO a propósito: sin binding KV (tests, `wrangler dev` sin KV),
// sin IP, o ante cualquier error de KV, devuelve { permitido: true }. Prefiere
// dejar pasar tráfico antes que romper el acceso de un cliente real.
//
// KV es eventualmente consistente y no atómico: dos peticiones casi simultáneas
// de la misma IP pueden leer el mismo contador y colar 1-2 por encima del
// límite. Aceptable para mitigación de abuso; un límite exacto exigiría Durable
// Objects, fuera del alcance de este Worker.

function ahoraSegundos() {
  return Math.floor(Date.now() / 1000);
}

async function guardar(kv, clave, valor, ttlSegundos) {
  try {
    await kv.put(clave, JSON.stringify(valor), { expirationTtl: Math.max(ttlSegundos, 60) });
  } catch {
    // Si no se puede escribir, el peor caso es no limitar esta petición.
  }
}

export async function consumirCupo(kv, { ip, accion, limite, ventanaSegundos }) {
  if (!kv || !ip) return { permitido: true };

  const clave = `rl:${accion}:${ip}`;
  const ahora = ahoraSegundos();

  let registro;
  try {
    registro = await kv.get(clave, 'json');
  } catch {
    return { permitido: true };
  }

  if (!registro || typeof registro.reset !== 'number' || ahora >= registro.reset) {
    await guardar(kv, clave, { n: 1, reset: ahora + ventanaSegundos }, ventanaSegundos);
    return { permitido: true };
  }

  if (registro.n >= limite) {
    return { permitido: false, reintentarEn: registro.reset - ahora };
  }

  await guardar(kv, clave, { n: registro.n + 1, reset: registro.reset }, registro.reset - ahora);
  return { permitido: true };
}

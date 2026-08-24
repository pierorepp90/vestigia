// js/juego/respuestas.js
//
// Módulo puro (sin DOM, sin red) que decide si la respuesta escrita por el
// jugador es correcta. Las variantes aceptadas viven en el propio contenido
// de la ruta (worker/src/contenido/*.json) como una lista de strings — este
// módulo no sabe nada de números en catalán ni de fechas, solo compara
// texto de forma tolerante a errores tipográficos.
//
// Reglas:
//   1. Se normaliza todo: minúsculas, sin tildes/diéresis, sin puntuación,
//      espacios colapsados.
//   2. Coincidencia exacta tras normalizar → 'correcto'.
//   3. Si la variante es puramente numérica, NO se admite tolerancia a
//      errores: "13" y "14" son respuestas distintas, no una errata la una
//      de la otra.
//   4. Si la variante es texto y la distancia de Levenshtein está dentro del
//      umbral (que crece con la longitud), se responde 'casi' en vez de
//      'incorrecto' — importa más no castigar una errata que dar el pie con
//      la solución.

/** Minúsculas, sin diacríticos, sin puntuación, espacios colapsados. */
export function normalizar(texto) {
  return String(texto ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '') // quita marcas diacríticas (acentos, la tilde de la ñ, la diéresis)
    .replace(/[^a-z0-9\s]/g, ' ') // puntuación y símbolos → espacio
    .replace(/\s+/g, ' ')
    .trim();
}

function esNumerica(normalizado) {
  return /^\d+$/.test(normalizado);
}

function umbralTolerancia(normalizado) {
  const longitud = normalizado.replace(/\s/g, '').length;
  if (longitud <= 5) return 1;
  if (longitud <= 11) return 2;
  return 3;
}

/** Distancia de Levenshtein clásica (DP en O(n·m)); las respuestas son cortas. */
export function distanciaLevenshtein(a, b) {
  const filas = a.length + 1;
  const columnas = b.length + 1;
  const dp = Array.from({ length: filas }, () => new Array(columnas).fill(0));

  for (let i = 0; i < filas; i += 1) dp[i][0] = i;
  for (let j = 0; j < columnas; j += 1) dp[0][j] = j;

  for (let i = 1; i < filas; i += 1) {
    for (let j = 1; j < columnas; j += 1) {
      const coste = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1, // borrado
        dp[i][j - 1] + 1, // inserción
        dp[i - 1][j - 1] + coste, // sustitución
      );
    }
  }
  return dp[filas - 1][columnas - 1];
}

/**
 * Evalúa `entrada` contra la lista `respuestasValidas` (strings, tal cual
 * vienen del JSON de la ruta). Devuelve 'correcto' | 'casi' | 'incorrecto'.
 */
export function evaluarRespuesta(entrada, respuestasValidas) {
  const normEntrada = normalizar(entrada);
  if (!normEntrada || !Array.isArray(respuestasValidas) || respuestasValidas.length === 0) {
    return 'incorrecto';
  }

  const normalizadas = respuestasValidas.map(normalizar).filter(Boolean);

  if (normalizadas.includes(normEntrada)) return 'correcto';

  let mejorEsCasi = false;
  for (const normVariante of normalizadas) {
    if (esNumerica(normVariante)) continue; // sin tolerancia en respuestas numéricas
    const distancia = distanciaLevenshtein(normEntrada, normVariante);
    if (distancia > 0 && distancia <= umbralTolerancia(normVariante)) {
      mejorEsCasi = true;
      break;
    }
  }

  return mejorEsCasi ? 'casi' : 'incorrecto';
}

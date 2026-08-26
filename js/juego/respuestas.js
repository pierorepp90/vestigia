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
//      de la otra. Lo mismo con las variantes de una o dos letras: en los
//      enigmas con figura la respuesta es una opción ("A", "B", "2"), y ahí
//      cualquier otra letra está a distancia 1 de la correcta — sin esta
//      excepción, fallar del todo se anunciaría como "casi".
//   4. Si la variante es texto de tres letras o más y la distancia de
//      Levenshtein está dentro del umbral (que crece con la longitud), se
//      responde 'casi' en vez de 'incorrecto' — importa más no castigar una
//      errata que dar el pie con la solución.

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

/**
 * Variantes que se comparan solo por igualdad exacta. Son las que, por cortas,
 * quedarían a distancia 1 de otra respuesta perfectamente válida: los números
 * y las opciones de una figura ("A", "B", "2").
 */
function sinTolerancia(normalizado) {
  const longitud = normalizado.replace(/\s/g, '').length;
  return /^\d+$/.test(normalizado) || longitud < 3;
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
    if (sinTolerancia(normVariante)) continue; // números y opciones de figura: solo coincidencia exacta
    const distancia = distanciaLevenshtein(normEntrada, normVariante);
    if (distancia > 0 && distancia <= umbralTolerancia(normVariante)) {
      mejorEsCasi = true;
      break;
    }
  }

  return mejorEsCasi ? 'casi' : 'incorrecto';
}

/** ¿Esta parada se responde con varias respuestas en vez de una sola? */
export function tieneSubpreguntas(parada) {
  return Array.isArray(parada?.subpreguntas) && parada.subpreguntas.length > 0;
}

/**
 * Evalúa una parada de varias respuestas (p. ej. "¿qué arco tiene A? ¿y B?").
 * `entradas` es un array paralelo a `subpreguntas`.
 *
 * Solo se da por buena la parada si TODAS aciertan; si alguna cae pero otras
 * no, se responde 'casi' — el jugador va bien encaminado y merece saberlo sin
 * que le regalemos cuál falla. `detalle` sí lleva el resultado por hueco, para
 * que la interfaz pueda marcar los aciertos ya conseguidos.
 */
export function evaluarSubpreguntas(entradas, subpreguntas) {
  const lista = Array.isArray(subpreguntas) ? subpreguntas : [];
  if (lista.length === 0) return { resultado: 'incorrecto', detalle: [] };

  const detalle = lista.map((sub, i) => evaluarRespuesta(entradas?.[i], sub.respuestas));

  if (detalle.every((r) => r === 'correcto')) return { resultado: 'correcto', detalle };
  const algunaEncaminada = detalle.some((r) => r === 'correcto' || r === 'casi');
  return { resultado: algunaEncaminada ? 'casi' : 'incorrecto', detalle };
}

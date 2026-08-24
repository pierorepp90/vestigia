// js/juego/pistas.js
//
// Selección de pistas para la parada actual. Cada parada trae hasta 3
// pistas en orden creciente de explicitud (la última siempre revela la
// respuesta) — este módulo solo decide cuál toca dar a continuación según
// cuántas se han pedido ya, no conoce el DOM ni el resto del estado del juego.

export function pistasDeParada(parada) {
  return Array.isArray(parada?.pistas) ? parada.pistas : [];
}

export function cantidadUsadas(estado, numeroParada) {
  return estado?.pistasUsadas?.[numeroParada] || 0;
}

export function quedanPistas(parada, estado) {
  if (!parada) return false;
  return cantidadUsadas(estado, parada.n) < pistasDeParada(parada).length;
}

/** Devuelve la pista y el nuevo estado, o `null` si ya no quedan pistas para esta parada. */
export function pedirPista(parada, estado) {
  if (!parada) return null;
  const usadas = cantidadUsadas(estado, parada.n);
  const disponibles = pistasDeParada(parada);
  if (usadas >= disponibles.length) return null;

  const nuevoEstado = {
    ...estado,
    pistasUsadas: { ...estado.pistasUsadas, [parada.n]: usadas + 1 },
  };
  return { pista: disponibles[usadas], numero: usadas + 1, total: disponibles.length, estado: nuevoEstado };
}

/** Pistas ya reveladas para la parada actual, en orden — para redibujar tras recargar la página. */
export function pistasReveladas(parada, estado) {
  const usadas = cantidadUsadas(estado, parada?.n);
  return pistasDeParada(parada).slice(0, usadas);
}

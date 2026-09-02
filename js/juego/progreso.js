// js/juego/progreso.js
//
// Persistencia de la partida en localStorage. La clave incluye rutaId +
// orderId para que dos compras (o dos rutas distintas) en el mismo
// navegador nunca se pisen entre sí.

const PREFIJO = 'vestigia:progreso:';

export function claveProgreso(rutaId, orderId) {
  // encodeURIComponent escapa cualquier ':' dentro de rutaId/orderId, así
  // 'a' + 'b:c' nunca puede colisionar con 'a:b' + 'c' en la clave final.
  return `${PREFIJO}${encodeURIComponent(rutaId)}:${encodeURIComponent(orderId)}`;
}

export function estadoInicial() {
  return {
    paradaActual: 1,
    pistasUsadas: {},
    completada: false,
    iniciadoEn: Date.now(),
    completadoEn: null,
    devolucionEnviada: false,
  };
}

export function cargarProgreso(rutaId, orderId) {
  try {
    const raw = localStorage.getItem(claveProgreso(rutaId, orderId));
    if (!raw) return null;
    const datos = JSON.parse(raw);
    // Saneado mínimo: si el JSON guardado no tiene la forma esperada, se
    // descarta en vez de dejar que rompa el motor más adelante.
    if (typeof datos !== 'object' || datos === null || typeof datos.paradaActual !== 'number') {
      return null;
    }
    return { ...estadoInicial(), ...datos };
  } catch {
    return null; // localStorage inaccesible o JSON corrupto: se empieza de cero.
  }
}

export function guardarProgreso(rutaId, orderId, estado) {
  try {
    localStorage.setItem(claveProgreso(rutaId, orderId), JSON.stringify(estado));
    return true;
  } catch {
    return false; // Modo privado estricto, cuota llena, etc. — la partida sigue jugable, solo no persiste.
  }
}

export function borrarProgreso(rutaId, orderId) {
  try {
    localStorage.removeItem(claveProgreso(rutaId, orderId));
  } catch {
    // No hay nada que hacer si localStorage no está disponible.
  }
}

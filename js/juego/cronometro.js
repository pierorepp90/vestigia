// js/juego/cronometro.js
//
// El tiempo transcurrido se deriva siempre de `estado.iniciadoEn`
// (un timestamp guardado una única vez al empezar la partida) — nunca de un
// contador que corre en memoria. Así, si el jugador cierra el móvil a media
// partida, al volver el cronómetro sigue exactamente donde debería, sin
// necesidad de guardar "segundos acumulados" en cada tick.

export function tiempoTranscurridoMs(estado, ahora = Date.now()) {
  if (!estado || !estado.iniciadoEn) return 0;
  const fin = estado.completada && estado.completadoEn ? estado.completadoEn : ahora;
  return Math.max(0, fin - estado.iniciadoEn);
}

/** "mm:ss" o "h:mm:ss" si dura una hora o más. */
export function formatearDuracion(ms) {
  const totalSegundos = Math.floor(ms / 1000);
  const horas = Math.floor(totalSegundos / 3600);
  const minutos = Math.floor((totalSegundos % 3600) / 60);
  const segundos = totalSegundos % 60;
  const dosDigitos = (n) => String(n).padStart(2, '0');
  return horas > 0
    ? `${horas}:${dosDigitos(minutos)}:${dosDigitos(segundos)}`
    : `${minutos}:${dosDigitos(segundos)}`;
}

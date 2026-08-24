// js/juego/motor.js
//
// Máquina de estados de la partida. Funciones puras: reciben `ruta` (el
// contenido completo devuelto por el Worker) y `estado` (ver progreso.js) y
// devuelven un `estado` nuevo — nunca mutan el que reciben, así progreso.js
// puede guardar el resultado directamente y jugar.js puede redibujar la UI
// a partir de un solo objeto.
import { evaluarRespuesta } from './respuestas.js';

export function obtenerParada(ruta, estado) {
  return ruta.paradas.find((p) => p.n === estado.paradaActual) || null;
}

export function esUltimaParada(ruta, estado) {
  return estado.paradaActual >= ruta.paradas.length;
}

/**
 * Evalúa la respuesta del jugador para la parada actual.
 * Devuelve { resultado: 'correcto'|'casi'|'incorrecto', estado, avanzo }.
 * `estado` es el mismo objeto recibido si la respuesta no era correcta —
 * solo cambia (y solo entonces) cuando se acierta.
 */
export function responder(ruta, estado, entrada) {
  if (estado.completada) {
    return { resultado: 'incorrecto', estado, avanzo: false };
  }
  const parada = obtenerParada(ruta, estado);
  if (!parada) {
    return { resultado: 'incorrecto', estado, avanzo: false };
  }

  const resultado = evaluarRespuesta(entrada, parada.respuestas);
  if (resultado !== 'correcto') {
    return { resultado, estado, avanzo: false };
  }

  const esFinal = esUltimaParada(ruta, estado);
  const nuevoEstado = {
    ...estado,
    paradaActual: esFinal ? estado.paradaActual : estado.paradaActual + 1,
    completada: esFinal,
    completadoEn: esFinal ? Date.now() : estado.completadoEn,
  };
  return { resultado, estado: nuevoEstado, avanzo: true, completoLaRuta: esFinal };
}

export function progresoPorcentaje(ruta, estado) {
  const total = ruta.paradas.length;
  if (total === 0) return 0;
  const resueltas = estado.completada ? total : estado.paradaActual - 1;
  return Math.round((resueltas / total) * 100);
}

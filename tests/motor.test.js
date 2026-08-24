// tests/motor.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { obtenerParada, responder, progresoPorcentaje, esUltimaParada } from '../js/juego/motor.js';
import { estadoInicial } from '../js/juego/progreso.js';

function rutaDePrueba(numParadas = 3) {
  return {
    rutaId: 'test-ruta',
    paradas: Array.from({ length: numParadas }, (_, i) => ({
      n: i + 1,
      enigma: `enigma ${i + 1}`,
      respuestas: [`respuesta${i + 1}`],
      pistas: ['pista 1', 'pista 2', 'pista 3'],
    })),
  };
}

test('obtenerParada devuelve la parada actual según el estado', () => {
  const ruta = rutaDePrueba();
  const estado = estadoInicial();
  assert.equal(obtenerParada(ruta, estado).n, 1);
  assert.equal(obtenerParada(ruta, { ...estado, paradaActual: 3 }).n, 3);
  assert.equal(obtenerParada(ruta, { ...estado, paradaActual: 99 }), null);
});

test('responder con respuesta incorrecta no avanza ni muta el estado', () => {
  const ruta = rutaDePrueba();
  const estado = estadoInicial();
  const { resultado, estado: nuevoEstado, avanzo } = responder(ruta, estado, 'esto no es');
  assert.equal(resultado, 'incorrecto');
  assert.equal(avanzo, false);
  assert.equal(nuevoEstado, estado); // mismo objeto: no hay mutación ni copia innecesaria
});

test('responder con la respuesta correcta avanza a la siguiente parada', () => {
  const ruta = rutaDePrueba(3);
  const estado = estadoInicial();
  const { resultado, estado: e1, avanzo, completoLaRuta } = responder(ruta, estado, 'respuesta1');
  assert.equal(resultado, 'correcto');
  assert.equal(avanzo, true);
  assert.equal(completoLaRuta, false); // no es la última parada
  assert.equal(e1.paradaActual, 2);
  assert.equal(e1.completada, false);
  // el estado original no se mutó
  assert.equal(estado.paradaActual, 1);
});

test('responder en la última parada marca la ruta como completada', () => {
  const ruta = rutaDePrueba(2);
  let estado = estadoInicial();
  ({ estado } = responder(ruta, estado, 'respuesta1'));
  assert.equal(estado.paradaActual, 2);

  const resultado2 = responder(ruta, estado, 'respuesta2');
  assert.equal(resultado2.resultado, 'correcto');
  assert.equal(resultado2.completoLaRuta, true);
  assert.equal(resultado2.estado.completada, true);
  assert.ok(resultado2.estado.completadoEn > 0);
  assert.equal(esUltimaParada(ruta, resultado2.estado), true);
});

test('responder después de completada no reabre el juego', () => {
  const ruta = rutaDePrueba(1);
  let estado = estadoInicial();
  ({ estado } = responder(ruta, estado, 'respuesta1'));
  assert.equal(estado.completada, true);

  const otraVez = responder(ruta, estado, 'respuesta1');
  assert.equal(otraVez.resultado, 'incorrecto');
  assert.equal(otraVez.avanzo, false);
});

test('progresoPorcentaje refleja paradas resueltas, no la parada actual sin más', () => {
  const ruta = rutaDePrueba(4);
  const estado = estadoInicial();
  assert.equal(progresoPorcentaje(ruta, estado), 0);
  assert.equal(progresoPorcentaje(ruta, { ...estado, paradaActual: 3 }), 50);
  assert.equal(progresoPorcentaje(ruta, { ...estado, paradaActual: 4, completada: false }), 75);
  assert.equal(progresoPorcentaje(ruta, { ...estado, completada: true }), 100);
});

test('evaluación tolerante a errata también hace avanzar la partida vía "casi" no cuenta como acierto', () => {
  const ruta = rutaDePrueba(1);
  const estado = estadoInicial();
  const { resultado, avanzo } = responder(ruta, estado, 'respuesta1x'); // errata deliberada
  assert.equal(resultado, 'casi');
  assert.equal(avanzo, false); // "casi" no es "correcto": no debe destrabar la siguiente parada
});

// tests/pistas.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pedirPista, quedanPistas, pistasReveladas, cantidadUsadas } from '../js/juego/pistas.js';
import { estadoInicial } from '../js/juego/progreso.js';

function paradaDePrueba() {
  return { n: 1, pistas: ['pista uno', 'pista dos', 'pista tres (la respuesta)'] };
}

test('pedirPista devuelve las pistas en orden, una por llamada', () => {
  const parada = paradaDePrueba();
  let estado = estadoInicial();

  const r1 = pedirPista(parada, estado);
  assert.equal(r1.pista, 'pista uno');
  assert.equal(r1.numero, 1);
  assert.equal(r1.total, 3);
  estado = r1.estado;

  const r2 = pedirPista(parada, estado);
  assert.equal(r2.pista, 'pista dos');
  estado = r2.estado;

  const r3 = pedirPista(parada, estado);
  assert.equal(r3.pista, 'pista tres (la respuesta)');
  estado = r3.estado;
});

test('pedirPista devuelve null cuando ya no quedan pistas', () => {
  const parada = paradaDePrueba();
  let estado = estadoInicial();
  for (let i = 0; i < 3; i += 1) {
    estado = pedirPista(parada, estado).estado;
  }
  assert.equal(pedirPista(parada, estado), null);
  assert.equal(quedanPistas(parada, estado), false);
});

test('quedanPistas y cantidadUsadas reflejan el estado actual', () => {
  const parada = paradaDePrueba();
  let estado = estadoInicial();
  assert.equal(quedanPistas(parada, estado), true);
  assert.equal(cantidadUsadas(estado, 1), 0);

  estado = pedirPista(parada, estado).estado;
  assert.equal(cantidadUsadas(estado, 1), 1);
  assert.equal(quedanPistas(parada, estado), true);
});

test('las pistas de una parada no afectan el contador de otra', () => {
  const parada1 = { n: 1, pistas: ['a', 'b'] };
  const parada2 = { n: 2, pistas: ['x', 'y'] };
  let estado = estadoInicial();
  estado = pedirPista(parada1, estado).estado;
  assert.equal(cantidadUsadas(estado, 1), 1);
  assert.equal(cantidadUsadas(estado, 2), 0);
});

test('pistasReveladas devuelve exactamente las pistas ya pedidas, en orden', () => {
  const parada = paradaDePrueba();
  let estado = estadoInicial();
  assert.deepEqual(pistasReveladas(parada, estado), []);

  estado = pedirPista(parada, estado).estado;
  estado = pedirPista(parada, estado).estado;
  assert.deepEqual(pistasReveladas(parada, estado), ['pista uno', 'pista dos']);
});

test('pedirPista con parada nula no revienta', () => {
  assert.equal(pedirPista(null, estadoInicial()), null);
});

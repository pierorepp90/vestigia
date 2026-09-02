// tests/progreso.test.js
//
// Node no trae `localStorage` global (es una API de navegador), así que
// para probar el camino feliz se instala aquí un polyfill mínimo en
// memoria. progreso.js resuelve el identificador `localStorage` en el
// cuerpo de cada función, no en el momento de importar el módulo, así que
// basta con que el polyfill exista antes de LLAMAR a esas funciones — no
// hace falta que exista antes del `import` de arriba.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { claveProgreso, estadoInicial, cargarProgreso, guardarProgreso, borrarProgreso } from '../js/juego/progreso.js';

class LocalStorageDeMentira {
  #datos = new Map();
  getItem(clave) {
    return this.#datos.has(clave) ? this.#datos.get(clave) : null;
  }
  setItem(clave, valor) {
    this.#datos.set(clave, String(valor));
  }
  removeItem(clave) {
    this.#datos.delete(clave);
  }
}

test('claveProgreso combina rutaId y orderId sin ambigüedad', () => {
  assert.equal(claveProgreso('barcelona-gotic', 'ord_123'), 'vestigia:progreso:barcelona-gotic:ord_123');
  assert.notEqual(claveProgreso('a', 'b:c'), claveProgreso('a:b', 'c'));
});

test('sin localStorage disponible, cargarProgreso no revienta y devuelve null', () => {
  const anterior = globalThis.localStorage;
  delete globalThis.localStorage;
  try {
    assert.equal(cargarProgreso('barcelona-gotic', 'ord_1'), null);
    assert.equal(guardarProgreso('barcelona-gotic', 'ord_1', estadoInicial()), false);
  } finally {
    if (anterior) globalThis.localStorage = anterior;
  }
});

test('guardarProgreso + cargarProgreso hacen ida y vuelta con datos completos', () => {
  globalThis.localStorage = new LocalStorageDeMentira();
  const estado = { ...estadoInicial(), paradaActual: 3, pistasUsadas: { 1: 2 } };

  guardarProgreso('roma-centro', 'ord_42', estado);
  const recuperado = cargarProgreso('roma-centro', 'ord_42');

  assert.equal(recuperado.paradaActual, 3);
  assert.deepEqual(recuperado.pistasUsadas, { 1: 2 });
  assert.equal(recuperado.completada, false);
});

test('cargarProgreso sin nada guardado devuelve null (no un estado vacío)', () => {
  globalThis.localStorage = new LocalStorageDeMentira();
  assert.equal(cargarProgreso('roma-centro', 'ord_nuevo'), null);
});

test('cargarProgreso descarta JSON con forma inesperada en vez de propagarlo', () => {
  const fake = new LocalStorageDeMentira();
  fake.setItem(claveProgreso('paris-marais', 'ord_9'), JSON.stringify({ algoQueNoEsUnEstado: true }));
  globalThis.localStorage = fake;
  assert.equal(cargarProgreso('paris-marais', 'ord_9'), null);
});

test('cargarProgreso descarta JSON corrupto sin lanzar', () => {
  const fake = new LocalStorageDeMentira();
  fake.setItem(claveProgreso('paris-marais', 'ord_9'), '{ esto no es JSON válido');
  globalThis.localStorage = fake;
  assert.equal(cargarProgreso('paris-marais', 'ord_9'), null);
});

test('borrarProgreso elimina exactamente la clave de esa ruta+pedido', () => {
  const fake = new LocalStorageDeMentira();
  globalThis.localStorage = fake;
  guardarProgreso('barcelona-gotic', 'ord_1', estadoInicial());
  guardarProgreso('roma-centro', 'ord_2', estadoInicial());

  borrarProgreso('barcelona-gotic', 'ord_1');

  assert.equal(cargarProgreso('barcelona-gotic', 'ord_1'), null);
  assert.notEqual(cargarProgreso('roma-centro', 'ord_2'), null);
});

test('estadoInicial trae paradaActual 1 y completada false', () => {
  const estado = estadoInicial();
  assert.equal(estado.paradaActual, 1);
  assert.equal(estado.completada, false);
  assert.deepEqual(estado.pistasUsadas, {});
  assert.ok(estado.iniciadoEn > 0);
});

test('estadoInicial trae devolucionEnviada en false', () => {
  assert.equal(estadoInicial().devolucionEnviada, false);
});

test('cargarProgreso conserva devolucionEnviada guardado', () => {
  globalThis.localStorage = new LocalStorageDeMentira();
  guardarProgreso('roma-centro', 'ord_7', { ...estadoInicial(), completada: true, devolucionEnviada: true });
  assert.equal(cargarProgreso('roma-centro', 'ord_7').devolucionEnviada, true);
});

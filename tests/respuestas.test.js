// tests/respuestas.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizar, evaluarRespuesta, distanciaLevenshtein } from '../js/juego/respuestas.js';

test('normalizar quita tildes, diéresis y la tilde de la ñ', () => {
  assert.equal(normalizar('Año Gótico'), 'ano gotico');
  assert.equal(normalizar('François'), 'francois');
  assert.equal(normalizar('Düsseldorf'), 'dusseldorf');
});

test('normalizar quita puntuación y colapsa espacios', () => {
  assert.equal(normalizar('¡Daga!!'), 'daga');
  assert.equal(normalizar('  rosa   de los   vientos  '), 'rosa de los vientos');
  assert.equal(normalizar('flor-de-lis'), 'flor de lis');
});

test('normalizar es estable ante undefined/null/números', () => {
  assert.equal(normalizar(undefined), '');
  assert.equal(normalizar(null), '');
  assert.equal(normalizar(13), '13');
});

test('distanciaLevenshtein casos básicos', () => {
  assert.equal(distanciaLevenshtein('daga', 'daga'), 0);
  assert.equal(distanciaLevenshtein('daga', 'dagaa'), 1);
  assert.equal(distanciaLevenshtein('daga', 'ninguna'), 5);
  assert.equal(distanciaLevenshtein('', 'abc'), 3);
});

test('evaluarRespuesta: coincidencia exacta tras normalizar', () => {
  assert.equal(evaluarRespuesta('Daga', ['daga', 'puñal', 'cuchillo']), 'correcto');
  assert.equal(evaluarRespuesta('  PUÑAL  ', ['daga', 'puñal', 'cuchillo']), 'correcto');
  assert.equal(evaluarRespuesta('13', ['13', 'trece']), 'correcto');
  assert.equal(evaluarRespuesta('Trece', ['13', 'trece']), 'correcto');
});

test('evaluarRespuesta: errata leve en una palabra → casi', () => {
  assert.equal(evaluarRespuesta('dagga', ['daga']), 'casi');
  assert.equal(evaluarRespuesta('elefnte', ['elefante']), 'casi');
  assert.equal(evaluarRespuesta('pasquinada', ['pasquinadas', 'pasquinada', 'pasquinate']), 'correcto');
  assert.equal(evaluarRespuesta('pasquinadaz', ['pasquinadas']), 'casi');
});

test('evaluarRespuesta: frase larga con una palabra distinta → casi', () => {
  assert.equal(evaluarRespuesta('rosa de los vientoz', ['rosa de los vientos']), 'casi');
});

test('evaluarRespuesta: números NUNCA admiten tolerancia (una cifra de más es otra respuesta)', () => {
  assert.equal(evaluarRespuesta('14', ['13', 'trece']), 'incorrecto');
  assert.equal(evaluarRespuesta('1889', ['1830']), 'incorrecto');
  assert.equal(evaluarRespuesta('366', ['36', 'treinta y seis']), 'incorrecto');
});

test('evaluarRespuesta: claramente incorrecto', () => {
  assert.equal(evaluarRespuesta('espada', ['daga', 'puñal', 'cuchillo']), 'incorrecto');
  assert.equal(evaluarRespuesta('', ['daga']), 'incorrecto');
  assert.equal(evaluarRespuesta('   ', ['daga']), 'incorrecto');
});

test('evaluarRespuesta: entradas degeneradas no explotan', () => {
  assert.equal(evaluarRespuesta('daga', []), 'incorrecto');
  assert.equal(evaluarRespuesta('daga', undefined), 'incorrecto');
  assert.equal(evaluarRespuesta(undefined, ['daga']), 'incorrecto');
});

// tests/cronometro.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tiempoTranscurridoMs, formatearDuracion } from '../js/juego/cronometro.js';

test('tiempoTranscurridoMs calcula la diferencia contra "ahora"', () => {
  const estado = { iniciadoEn: 1000, completada: false };
  assert.equal(tiempoTranscurridoMs(estado, 1000), 0);
  assert.equal(tiempoTranscurridoMs(estado, 5000), 4000);
});

test('tiempoTranscurridoMs se congela en completadoEn una vez terminada la ruta', () => {
  const estado = { iniciadoEn: 1000, completada: true, completadoEn: 4000 };
  // "ahora" avanza mucho más allá, pero el tiempo mostrado no debe crecer
  assert.equal(tiempoTranscurridoMs(estado, 999_999), 3000);
});

test('tiempoTranscurridoMs nunca da negativo ni revienta sin iniciadoEn', () => {
  assert.equal(tiempoTranscurridoMs(null), 0);
  assert.equal(tiempoTranscurridoMs({}), 0);
  assert.equal(tiempoTranscurridoMs({ iniciadoEn: 5000 }, 1000), 0);
});

test('formatearDuracion en mm:ss por debajo de una hora', () => {
  assert.equal(formatearDuracion(0), '0:00');
  assert.equal(formatearDuracion(59_000), '0:59');
  assert.equal(formatearDuracion(60_000), '1:00');
  assert.equal(formatearDuracion(125_000), '2:05');
});

test('formatearDuracion cambia a h:mm:ss a partir de una hora', () => {
  assert.equal(formatearDuracion(3_600_000), '1:00:00');
  assert.equal(formatearDuracion(3_725_000), '1:02:05');
});

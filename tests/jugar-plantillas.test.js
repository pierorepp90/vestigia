// tests/jugar-plantillas.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { filaPista } from '../js/jugar.js';

test('filaPista escapa el texto de la pista antes de meterlo en innerHTML', () => {
  const html = filaPista('<img src=x onerror=alert(1)>', 0);
  assert.ok(!html.includes('<img'));
  assert.match(html, /&lt;img/);
  assert.match(html, /#1/);
});

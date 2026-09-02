// tests/imprimir-plantillas.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bloqueParada } from '../js/imprimir.js';

test('bloqueParada escapa titulo, llegada, enigma e historia', () => {
  const p = { n: 1, titulo: '<b>t</b>', llegada: '<i>l</i>', enigma: '<u>e</u>', historia: '<s>h</s>' };
  const html = bloqueParada(p, { paradas: [p] }, 'es');
  for (const frag of ['<b>t</b>', '<i>l</i>', '<u>e</u>', '<s>h</s>']) assert.ok(!html.includes(frag));
  assert.match(html, /&lt;b&gt;t&lt;\/b&gt;/);
});

// worker/tests/cors.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildCorsHeaders } from '../src/cors.js';

test('siempre incluye X-Content-Type-Options: nosniff', () => {
  const h = buildCorsHeaders('https://otro.com', 'https://vestigia.fun');
  assert.equal(h['X-Content-Type-Options'], 'nosniff');
});

test('refleja el Origin solo si coincide con el permitido', () => {
  assert.equal(
    buildCorsHeaders('https://vestigia.fun', 'https://vestigia.fun')['Access-Control-Allow-Origin'],
    'https://vestigia.fun',
  );
  assert.equal(
    buildCorsHeaders('https://malo.com', 'https://vestigia.fun')['Access-Control-Allow-Origin'],
    undefined,
  );
});

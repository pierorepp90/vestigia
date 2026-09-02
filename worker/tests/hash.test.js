// worker/tests/hash.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hashIp } from '../src/hash.js';

test('hashIp devuelve 64 hex y es determinista para misma ip+sal', async () => {
  const a = await hashIp('203.0.113.7', 'sal-de-prueba');
  const b = await hashIp('203.0.113.7', 'sal-de-prueba');
  assert.match(a, /^[0-9a-f]{64}$/);
  assert.equal(a, b);
});

test('hashIp cambia con la sal y con la ip', async () => {
  const base = await hashIp('203.0.113.7', 'sal-1');
  assert.notEqual(base, await hashIp('203.0.113.7', 'sal-2'));
  assert.notEqual(base, await hashIp('203.0.113.8', 'sal-1'));
});

test('hashIp con ip vacía o desconocida no lanza', async () => {
  assert.match(await hashIp('', 'sal'), /^[0-9a-f]{64}$/);
});

test('hashIp lanza si falta la sal', async () => {
  await assert.rejects(() => hashIp('1.2.3.4', ''));
  await assert.rejects(() => hashIp('1.2.3.4', undefined));
});

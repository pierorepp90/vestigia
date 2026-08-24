// tests/i18n.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DICT, LANGS, DEFAULT_LANG, t, tf } from '../js/i18n.js';

test('los 4 idiomas declarados en LANGS tienen entrada en DICT', () => {
  for (const lang of LANGS) {
    assert.ok(DICT[lang], `Falta DICT.${lang}`);
  }
});

test('todos los idiomas tienen exactamente las mismas claves que el idioma por defecto', () => {
  const clavesReferencia = new Set(Object.keys(DICT[DEFAULT_LANG]));
  for (const lang of LANGS) {
    if (lang === DEFAULT_LANG) continue;
    const claves = new Set(Object.keys(DICT[lang]));
    const faltan = [...clavesReferencia].filter((k) => !claves.has(k));
    const sobran = [...claves].filter((k) => !clavesReferencia.has(k));
    assert.deepEqual(faltan, [], `${lang}: faltan claves respecto a ${DEFAULT_LANG}`);
    assert.deepEqual(sobran, [], `${lang}: tiene claves que no existen en ${DEFAULT_LANG}`);
  }
});

test('ninguna traducción está vacía ni es idéntica sin más al placeholder de la clave', () => {
  for (const lang of LANGS) {
    for (const [clave, valor] of Object.entries(DICT[lang])) {
      assert.ok(typeof valor === 'string' && valor.trim().length > 0, `${lang}.${clave} está vacío`);
    }
  }
});

test('los placeholders {var} de cada string coinciden entre todos los idiomas', () => {
  const extraerPlaceholders = (str) => [...str.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
  for (const clave of Object.keys(DICT[DEFAULT_LANG])) {
    const referencia = extraerPlaceholders(DICT[DEFAULT_LANG][clave]);
    for (const lang of LANGS) {
      if (lang === DEFAULT_LANG) continue;
      const actuales = extraerPlaceholders(DICT[lang][clave]);
      assert.deepEqual(actuales, referencia, `${lang}.${clave}: placeholders ${actuales} no coinciden con ${DEFAULT_LANG} ${referencia}`);
    }
  }
});

test('t() devuelve la traducción correcta y cae a DEFAULT_LANG si falta la clave', () => {
  assert.equal(t('en', 'juego_btn_comprobar'), 'Check');
  assert.equal(t('fr', 'juego_btn_comprobar'), 'Vérifier');
  assert.equal(t('it', 'juego_btn_comprobar'), 'Verifica');
  assert.equal(t('en', 'clave_que_no_existe'), 'clave_que_no_existe');
});

test('tf() interpola placeholders correctamente en cada idioma', () => {
  assert.equal(tf('es', 'juego_parada_de', { actual: 3, total: 8 }), 'Parada 3 de 8');
  assert.equal(tf('en', 'juego_parada_de', { actual: 3, total: 8 }), 'Stop 3 of 8');
  assert.equal(tf('fr', 'juego_parada_de', { actual: 3, total: 8 }), 'Étape 3 sur 8');
  assert.equal(tf('it', 'juego_parada_de', { actual: 3, total: 8 }), 'Tappa 3 di 8');
});

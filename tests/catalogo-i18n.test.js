// tests/catalogo-i18n.test.js
//
// js/catalogo.js es el catálogo público (portada, ciudad, ficha de ruta).
// Sus campos traducibles son objetos { es, en, fr, it }; este test evita
// que una ciudad o ruta nueva se añada con una traducción a medias, algo
// que localizar() no detectaría solo (cae a español en silencio).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CIUDADES, RUTAS, localizar } from '../js/catalogo.js';
import { LANGS } from '../js/i18n.js';

const CAMPOS_CIUDAD = ['pais', 'nombre', 'resumen'];
const CAMPOS_RUTA = ['titulo', 'puntoPartida', 'resumen', 'acertijoMuestra'];

test('cada ciudad tiene los 4 idiomas, sin vacíos, en sus campos traducibles', () => {
  for (const ciudad of CIUDADES) {
    for (const campo of CAMPOS_CIUDAD) {
      const valor = ciudad[campo];
      assert.ok(valor && typeof valor === 'object', `${ciudad.slug}.${campo} no es un objeto {es,en,fr,it}`);
      for (const lang of LANGS) {
        assert.ok(
          typeof valor[lang] === 'string' && valor[lang].trim().length > 0,
          `${ciudad.slug}.${campo}.${lang} está vacío o falta`,
        );
      }
    }
  }
});

test('cada ruta tiene los 4 idiomas, sin vacíos, en sus campos traducibles', () => {
  for (const ruta of RUTAS) {
    for (const campo of CAMPOS_RUTA) {
      const valor = ruta[campo];
      assert.ok(valor && typeof valor === 'object', `${ruta.id}.${campo} no es un objeto {es,en,fr,it}`);
      for (const lang of LANGS) {
        assert.ok(
          typeof valor[lang] === 'string' && valor[lang].trim().length > 0,
          `${ruta.id}.${campo}.${lang} está vacío o falta`,
        );
      }
    }
  }
});

test('localizar() devuelve el idioma pedido y cae a español si falta', () => {
  const campo = { es: 'Hola', en: 'Hello' };
  assert.equal(localizar(campo, 'en'), 'Hello');
  assert.equal(localizar(campo, 'fr'), 'Hola'); // fr no existe en este campo de prueba: cae a es
  assert.equal(localizar(campo, 'es'), 'Hola');
});

test('localizar() no revienta con valores no traducidos (strings planos) ni con null', () => {
  assert.equal(localizar('Piazza Navona', 'en'), 'Piazza Navona');
  assert.equal(localizar(null, 'en'), '');
  assert.equal(localizar(undefined, 'en'), '');
});

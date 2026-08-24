// tests/catalogo-mapas.test.js
//
// Cada ruta debe declarar imgMapa apuntando a un SVG que existe de verdad
// en disco — generado por scripts/generar-mapas.mjs. Sin este test, una
// ruta podría quedarse sin mapa (o con la ruta del archivo mal escrita) y
// no se notaría hasta que alguien abriera la ficha de producto a mano.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { RUTAS } from '../js/catalogo.js';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.join(AQUI, '..');

test('cada ruta tiene un mapa de zona que existe de verdad en disco', () => {
  for (const ruta of RUTAS) {
    assert.ok(ruta.imgMapa, `"${ruta.id}" no declara imgMapa en el catálogo`);
    assert.ok(existsSync(path.join(RAIZ, ruta.imgMapa)), `"${ruta.id}": no existe el archivo ${ruta.imgMapa}`);
  }
});

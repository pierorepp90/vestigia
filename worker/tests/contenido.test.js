// worker/tests/contenido.test.js
//
// worker/src/contenido/*.json es la fuente de verdad (y tests/contenido.test.js
// ya valida su integridad interna), pero el Worker en tiempo de ejecución solo
// puede servir lo que worker/src/contenido.js importa y registra a mano en
// CONTENIDO — no hay filesystem en el runtime de Cloudflare Workers. Este test
// existe para que un archivo JSON nuevo que se olvide de registrar ahí dé un
// fallo de test en vez de un 404 silencioso en producción (así se rompió
// /api/ruta para 9 de las 16 rutas: el JSON existía, pero contenido.js nunca
// lo importaba).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { cargarContenido } from '../src/contenido.js';
import { RUTAS } from '../../js/catalogo.js';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const DIR_CONTENIDO = path.join(AQUI, '..', 'src', 'contenido');

test('cargarContenido() sirve contenido para cada ruta del catálogo en español', () => {
  for (const ruta of RUTAS) {
    const resultado = cargarContenido(ruta.id, 'es');
    assert.ok(resultado, `"${ruta.id}" tiene JSON de contenido pero no está registrado en worker/src/contenido.js`);
  }
});

test('cargarContenido() sirve cada archivo .json de worker/src/contenido/ en su propio idioma', () => {
  const archivos = readdirSync(DIR_CONTENIDO).filter((f) => f.endsWith('.json'));
  for (const archivo of archivos) {
    const [rutaId, idioma] = archivo.replace(/\.json$/, '').split('.');
    const resultado = cargarContenido(rutaId, idioma);
    assert.ok(resultado, `${archivo} existe en disco pero no está registrado en worker/src/contenido.js`);
    assert.equal(resultado.idiomaServido, idioma, `${archivo}: se sirvió en "${resultado.idiomaServido}" en vez de "${idioma}"`);
  }
});

// tests/contenido.test.js
//
// Verifica la integridad de worker/src/contenido/*.json: la fuente de
// verdad de los enigmas. Corre contra lo que exista en el momento —
// de momento solo hay versión `es`; cuando el paso 7 del plan (Traducciones)
// añada en/fr/it, este mismo test empieza a comprobar también que las
// cuatro versiones de cada ruta coinciden en estructura sin tocar una línea.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { RUTAS } from '../js/catalogo.js';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const DIR_CONTENIDO = path.join(AQUI, '..', 'worker', 'src', 'contenido');

function cargarContenido() {
  const archivos = readdirSync(DIR_CONTENIDO).filter((f) => f.endsWith('.json'));
  return archivos.map((archivo) => {
    const [rutaId, idioma] = archivo.replace(/\.json$/, '').split('.');
    const datos = JSON.parse(readFileSync(path.join(DIR_CONTENIDO, archivo), 'utf8'));
    return { archivo, rutaId, idioma, datos };
  });
}

test('existe al menos un archivo de contenido por cada ruta del catálogo', () => {
  const contenidos = cargarContenido();
  const idsConContenido = new Set(contenidos.map((c) => c.rutaId));
  for (const ruta of RUTAS) {
    assert.ok(idsConContenido.has(ruta.id), `Falta contenido para la ruta "${ruta.id}"`);
  }
});

test('el nombre de archivo coincide con el rutaId y el idioma declarados dentro del JSON', () => {
  for (const { archivo, rutaId, idioma, datos } of cargarContenido()) {
    assert.equal(datos.rutaId, rutaId, `${archivo}: rutaId interno no coincide con el nombre de archivo`);
    assert.equal(datos.idioma, idioma, `${archivo}: idioma interno no coincide con el nombre de archivo`);
  }
});

test('cada ruta tiene el número de paradas declarado en el catálogo', () => {
  for (const { archivo, rutaId, datos } of cargarContenido()) {
    const enCatalogo = RUTAS.find((r) => r.id === rutaId);
    assert.ok(enCatalogo, `${archivo}: "${rutaId}" no existe en js/catalogo.js`);
    assert.equal(
      datos.paradas.length,
      enCatalogo.numParadas,
      `${archivo}: tiene ${datos.paradas.length} paradas, catalogo.js declara ${enCatalogo.numParadas}`,
    );
  }
});

test('las paradas están numeradas 1..N sin huecos ni repeticiones', () => {
  for (const { archivo, datos } of cargarContenido()) {
    const numeros = datos.paradas.map((p) => p.n);
    const esperados = Array.from({ length: datos.paradas.length }, (_, i) => i + 1);
    assert.deepEqual(numeros, esperados, `${archivo}: numeración de paradas inesperada: ${numeros.join(',')}`);
  }
});

test('cada parada tiene respuestas, exactamente 3 pistas, y ningún campo de texto vacío', () => {
  const camposTexto = ['titulo', 'llegada', 'enigma', 'historia', 'fuente'];
  for (const { archivo, datos } of cargarContenido()) {
    for (const parada of datos.paradas) {
      const etiqueta = `${archivo} parada ${parada.n}`;

      for (const campo of camposTexto) {
        assert.ok(typeof parada[campo] === 'string' && parada[campo].trim().length > 0, `${etiqueta}: falta "${campo}"`);
      }

      assert.ok(Array.isArray(parada.respuestas) && parada.respuestas.length > 0, `${etiqueta}: sin respuestas válidas`);
      for (const r of parada.respuestas) {
        assert.ok(typeof r === 'string' && r.trim().length > 0, `${etiqueta}: respuesta vacía en la lista`);
      }

      assert.equal(Array.isArray(parada.pistas) && parada.pistas.length, 3, `${etiqueta}: debe tener exactamente 3 pistas`);
      for (const p of parada.pistas) {
        assert.ok(typeof p === 'string' && p.trim().length > 0, `${etiqueta}: pista vacía en la lista`);
      }
    }
  }
});

test('la última pista de cada parada es lo bastante larga como para poder revelar la respuesta', () => {
  // No podemos verificar semánticamente que "da la respuesta", pero una
  // pista final de una sola palabra es casi con certeza un placeholder
  // olvidado en vez de una pista real — este test detecta ese error barato.
  for (const { archivo, datos } of cargarContenido()) {
    for (const parada of datos.paradas) {
      const ultima = parada.pistas[parada.pistas.length - 1];
      assert.ok(ultima.trim().split(/\s+/).length >= 2, `${archivo} parada ${parada.n}: la pista final parece incompleta: "${ultima}"`);
    }
  }
});

test('intro, puntoPartida y final están presentes y no vacíos', () => {
  for (const { archivo, datos } of cargarContenido()) {
    assert.ok(datos.intro?.trim().length > 0, `${archivo}: falta intro`);
    assert.ok(datos.puntoPartida?.trim().length > 0, `${archivo}: falta puntoPartida`);
    assert.ok(datos.final?.titulo?.trim().length > 0, `${archivo}: falta final.titulo`);
    assert.ok(datos.final?.texto?.trim().length > 0, `${archivo}: falta final.texto`);
  }
});

test('todas las versiones de idioma de una misma ruta comparten la numeración de paradas', () => {
  const contenidos = cargarContenido();
  const porRuta = new Map();
  for (const c of contenidos) {
    if (!porRuta.has(c.rutaId)) porRuta.set(c.rutaId, []);
    porRuta.get(c.rutaId).push(c);
  }

  for (const [rutaId, versiones] of porRuta) {
    if (versiones.length < 2) continue; // aún no hay traducciones para esta ruta
    const [referencia, ...resto] = versiones;
    const numerosReferencia = referencia.datos.paradas.map((p) => p.n);
    for (const version of resto) {
      const numeros = version.datos.paradas.map((p) => p.n);
      assert.deepEqual(
        numeros,
        numerosReferencia,
        `${rutaId}: "${version.idioma}" tiene paradas distintas de "${referencia.idioma}" (${numeros} vs ${numerosReferencia})`,
      );
    }
  }
});

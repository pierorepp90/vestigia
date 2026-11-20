// tests/precios.test.js
//
// El error más caro posible: que el precio de escaparate (js/catalogo.js,
// lo que el cliente VE) y el precio de cobro (worker/src/precios.js, lo que
// el cliente PAGA) diverjan. Ambos derivan de la misma PRECIOS_POR_DIFICULTAD,
// así que esta prueba comprueba que esa garantía se sostiene de verdad.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PRECIOS_POR_DIFICULTAD, RUTAS, TODAS_GRATIS, esRutaGratis } from '../js/catalogo.js';
import { precioDeRuta, rutaEsGratis } from '../worker/src/precios.js';

test('cada ruta activa en el catálogo tiene un precio de cobro definido', () => {
  for (const ruta of RUTAS) {
    assert.ok(precioDeRuta(ruta.id), `worker/src/precios.js no define precio para "${ruta.id}"`);
  }
});

test('el precio de escaparate coincide con lo que cobra el Worker (0 € si la ruta va gratis)', () => {
  for (const ruta of RUTAS) {
    const cobro = precioDeRuta(ruta.id);
    const esperado = rutaEsGratis(ruta.id) ? 0 : cobro.importe;
    assert.equal(
      ruta.precio,
      esperado,
      `"${ruta.id}": catalogo.js muestra ${ruta.precio}€ pero el Worker cobraría ${esperado}€`,
    );
    assert.equal(
      ruta.moneda?.toLowerCase(),
      cobro.moneda,
      `"${ruta.id}": moneda de escaparate (${ruta.moneda}) no coincide con la de cobro (${cobro.moneda})`,
    );
  }
});

test('el precio de cada ruta coincide con la tabla por dificultad salvo que vaya gratis', () => {
  for (const ruta of RUTAS) {
    const nivel = PRECIOS_POR_DIFICULTAD[ruta.dificultad];
    const esperado = esRutaGratis(ruta) ? 0 : nivel.importe;
    assert.equal(
      ruta.precio,
      esperado,
      `"${ruta.id}" (${ruta.dificultad}): precio ${ruta.precio}€ no coincide con el esperado (${esperado}€)`,
    );
  }
});

test('con la promoción TODAS_GRATIS ninguna ruta se cobra', { skip: !TODAS_GRATIS }, () => {
  for (const ruta of RUTAS) {
    assert.equal(ruta.precio, 0, `"${ruta.id}" debería mostrarse gratis`);
    assert.equal(rutaEsGratis(ruta.id), true, `"${ruta.id}" debería ir por el circuito gratuito`);
  }
});

test('precioDeRuta devuelve null para una ruta que no existe', () => {
  assert.equal(precioDeRuta('ruta-que-no-existe'), null);
});

test('la tabla de precios por dificultad coincide con la decisión de negocio', () => {
  assert.equal(PRECIOS_POR_DIFICULTAD.facil.importe, 0);
  assert.equal(PRECIOS_POR_DIFICULTAD.media.importe, 4.99);
  assert.equal(PRECIOS_POR_DIFICULTAD.dificil.importe, 7.99);
  for (const nivel of Object.values(PRECIOS_POR_DIFICULTAD)) assert.equal(nivel.moneda, 'EUR');
});

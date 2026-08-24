// tests/precios.test.js
//
// El error más caro posible: que el precio de escaparate (js/catalogo.js,
// lo que el cliente VE) y el precio de cobro (worker/src/precios.js, lo que
// el cliente PAGA) diverjan. Ambos derivan de la misma PRECIOS_POR_DIFICULTAD,
// así que esta prueba comprueba que esa garantía se sostiene de verdad.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PRECIOS_POR_DIFICULTAD, RUTAS } from '../js/catalogo.js';
import { precioDeRuta } from '../worker/src/precios.js';

test('cada ruta activa en el catálogo tiene un precio de cobro definido', () => {
  for (const ruta of RUTAS) {
    assert.ok(precioDeRuta(ruta.id), `worker/src/precios.js no define precio para "${ruta.id}"`);
  }
});

test('el precio de escaparate coincide exactamente con el precio de cobro', () => {
  for (const ruta of RUTAS) {
    const cobro = precioDeRuta(ruta.id);
    assert.equal(
      ruta.precio,
      cobro.importe,
      `"${ruta.id}": catalogo.js muestra ${ruta.precio}€ pero el Worker cobraría ${cobro.importe}€`,
    );
    assert.equal(
      ruta.moneda?.toLowerCase(),
      cobro.moneda,
      `"${ruta.id}": moneda de escaparate (${ruta.moneda}) no coincide con la de cobro (${cobro.moneda})`,
    );
  }
});

test('el precio de cada ruta coincide con la tabla por dificultad', () => {
  for (const ruta of RUTAS) {
    const nivel = PRECIOS_POR_DIFICULTAD[ruta.dificultad];
    assert.equal(
      ruta.precio,
      nivel.importe,
      `"${ruta.id}" (${ruta.dificultad}): precio ${ruta.precio}€ no coincide con el nivel (${nivel.importe}€)`,
    );
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

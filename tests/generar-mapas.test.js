// tests/generar-mapas.test.js
//
// La única lógica realmente nueva de scripts/generar-mapas.mjs (todo lo
// demás es fetch + plantilla de texto): la proyección de lat/lng a
// coordenadas del lienzo SVG. Un error de signo aquí produciría un mapa con
// aspecto plausible pero mal orientado, sin que nada lo detectara — por eso
// tiene test propio aunque el resto del script (herramienta de un solo uso)
// no lo tenga.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { metrosPorGrado, proyectar } from '../scripts/generar-mapas.mjs';

const ANCHO = 640;
const ALTO = 480;

test('metrosPorGrado: en el ecuador, un grado de longitud mide lo mismo que uno de latitud', () => {
  const { gradosLat, gradosLng } = metrosPorGrado(0);
  assert.ok(Math.abs(gradosLat - gradosLng) < 1e-12);
});

test('metrosPorGrado: a 60° de latitud, un grado de longitud mide aprox. la mitad (cos 60° = 0.5)', () => {
  const { gradosLat, gradosLng } = metrosPorGrado(60);
  assert.ok(Math.abs(gradosLng / gradosLat - 2) < 0.01);
});

test('proyectar: el propio centro cae exactamente en el centro del lienzo', () => {
  const centro = { lat: 41.3833, lng: 2.1763, radioM: 250 };
  const punto = proyectar(centro.lat, centro.lng, centro);
  assert.ok(Math.abs(punto.x - ANCHO / 2) < 1e-9);
  assert.ok(Math.abs(punto.y - ALTO / 2) < 1e-9);
});

test('proyectar: un punto al norte del centro tiene menor y (arriba en SVG), misma x', () => {
  const centro = { lat: 41.3833, lng: 2.1763, radioM: 250 };
  const puntoNorte = proyectar(centro.lat + 0.001, centro.lng, centro);
  assert.ok(puntoNorte.y < ALTO / 2);
  assert.ok(Math.abs(puntoNorte.x - ANCHO / 2) < 1e-9);
});

test('proyectar: un punto al este del centro tiene mayor x, misma y', () => {
  const centro = { lat: 41.3833, lng: 2.1763, radioM: 250 };
  const puntoEste = proyectar(centro.lat, centro.lng + 0.001, centro);
  assert.ok(puntoEste.x > ANCHO / 2);
  assert.ok(Math.abs(puntoEste.y - ALTO / 2) < 1e-9);
});

test('proyectar: un punto a exactamente radioM metros al norte cae en el desplazamiento de píxeles esperado', () => {
  const centro = { lat: 41.3833, lng: 2.1763, radioM: 250 };
  const { gradosLat } = metrosPorGrado(centro.lat);
  const puntoNorte = proyectar(centro.lat + centro.radioM * gradosLat, centro.lng, centro);
  const escala = (ANCHO * 0.42) / centro.radioM;
  const yEsperada = ALTO / 2 - centro.radioM * escala;
  assert.ok(Math.abs(puntoNorte.y - yEsperada) < 1e-6);
});

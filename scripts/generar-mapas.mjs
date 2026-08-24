#!/usr/bin/env node
// scripts/generar-mapas.mjs
//
// Genera una vez por ruta un mapa antiguo y desgastado ("pergamino quemado")
// a partir de datos reales de calles de OpenStreetMap. Se ejecuta a mano
// cuando se añade o cambia una ruta; el resultado (los SVG) se commitea
// como archivo estático, igual que las fotos de assets/img/ciudades/.
//
// Uso:
//   node scripts/generar-mapas.mjs                  (las 7 rutas)
//   node scripts/generar-mapas.mjs barcelona-gotic   (solo una — útil si
//                                                      Overpass da 429)
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { rutaPorId } from '../js/catalogo.js';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const DIR_SALIDA = path.join(AQUI, '..', 'assets', 'img', 'mapas');

// Centro real (lat, lng) y radio en metros de la zona de cada ruta. Es
// geografía aproximada de un barrio entero — no un detalle puntual como los
// enigmas — así que no hace falta verificarla sobre el terreno, pero conviene
// mirar el SVG resultante y ajustar el radio si deja fuera calles relevantes.
const ZONAS = {
  'barcelona-gotic': { lat: 41.3833, lng: 2.1763, radioM: 250 },
  'barcelona-born': { lat: 41.385, lng: 2.1827, radioM: 250 },
  'barcelona-raval': { lat: 41.38, lng: 2.17, radioM: 280 },
  'roma-centro': { lat: 41.8986, lng: 12.4769, radioM: 300 },
  'paris-marais': { lat: 48.8575, lng: 2.3605, radioM: 300 },
  'lisboa-alfama': { lat: 38.7139, lng: -9.1302, radioM: 280 },
  'florencia-centro': { lat: 43.7696, lng: 11.2558, radioM: 280 },
  'madrid-austrias': { lat: 40.4169, lng: -3.7033, radioM: 280 },
  'valencia-carmen': { lat: 39.4744, lng: -0.3782, radioM: 280 },
  'napoles-spaccanapoli': { lat: 40.8525, lng: 14.2596, radioM: 280 },
  'toulouse-capitole': { lat: 43.6042, lng: 1.4439, radioM: 280 },
  'berlin-mitte': { lat: 52.5136, lng: 13.3928, radioM: 280 },
  'istanbul-sultanahmet': { lat: 41.006, lng: 28.978, radioM: 280 },
  'roma-trastevere': { lat: 41.8895, lng: 12.4703, radioM: 280 },
  'florencia-santacroce': { lat: 43.7689, lng: 11.2614, radioM: 280 },
  'paris-montmartre': { lat: 48.8867, lng: 2.3431, radioM: 280 },
};

const ANCHO = 640;
const ALTO = 480;

// Silueta rasgada compartida por los 7 mapas — el contenido de dentro
// cambia, el marco de "pergamino quemado" es siempre el mismo.
const RECORTE_RASGADO =
  '13,29 90,10 166,24 243,5 320,19 397,5 473,24 550,10 627,29 614,86 634,144 608,202 627,259 602,317 621,374 596,432 614,466 538,451 461,470 384,447 307,466 230,442 154,461 77,437 26,455 6,394 32,336 13,278 38,221 6,163 26,106';

export function metrosPorGrado(lat) {
  const gradosLat = 1 / 111_320;
  const gradosLng = 1 / (111_320 * Math.cos((lat * Math.PI) / 180));
  return { gradosLat, gradosLng };
}

async function pedirOverpass(lat, lng, radioM) {
  const query = `
    [out:json][timeout:25];
    (
      way["highway"](around:${radioM},${lat},${lng});
      way["building"](around:${radioM},${lat},${lng});
    );
    out geom;
  `;
  const respuesta = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      // Overpass (vía Apache) responde 406 Not Acceptable a peticiones sin
      // User-Agent — el fetch nativo de Node no manda uno por defecto.
      'User-Agent': 'vestigia-generar-mapas/1.0 (script de un solo uso; ver scripts/generar-mapas.mjs)',
    },
    body: `data=${encodeURIComponent(query)}`,
  });
  if (!respuesta.ok) {
    throw new Error(`Overpass respondió ${respuesta.status} — reintenta en unos minutos`);
  }
  return respuesta.json();
}

export function proyectar(lat, lng, centro) {
  const { gradosLat, gradosLng } = metrosPorGrado(centro.lat);
  const dxM = (lng - centro.lng) / gradosLng;
  const dyM = (lat - centro.lat) / gradosLat;
  const escala = (ANCHO * 0.42) / centro.radioM;
  return {
    x: ANCHO / 2 + dxM * escala,
    y: ALTO / 2 - dyM * escala,
  };
}

function puntosDeVia(via, centro) {
  return via.geometry.map((p) => proyectar(p.lat, p.lon, centro));
}

function dibujarSvg(datos, centro, rutaId, zona) {
  const vias = datos.elements.filter((e) => e.type === 'way' && e.tags?.highway && e.geometry);
  const edificios = datos.elements.filter((e) => e.type === 'way' && e.tags?.building && e.geometry);

  const trazosCalles = vias
    .map((via) => {
      const puntos = puntosDeVia(via, centro);
      return `<path d="M${puntos.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L')}" />`;
    })
    .join('\n      ');

  const bloquesEdificios = edificios
    .map((edificio) => {
      const puntos = puntosDeVia(edificio, centro);
      return `<polygon points="${puntos.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')}" />`;
    })
    .join('\n      ');

  return `<svg viewBox="0 0 ${ANCHO} ${ALTO}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Mapa antiguo de ${zona}">
  <defs>
    <clipPath id="recorte-rasgado">
      <polygon points="${RECORTE_RASGADO}" />
    </clipPath>
    <filter id="grano-${rutaId}">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" result="ruido" />
      <feColorMatrix in="ruido" type="matrix" values="0 0 0 0 0.14  0 0 0 0 0.1  0 0 0 0 0.06  0 0 0 0.5 0" />
    </filter>
    <radialGradient id="vineta-${rutaId}" cx="50%" cy="50%" r="72%">
      <stop offset="60%" stop-color="#241a10" stop-opacity="0" />
      <stop offset="100%" stop-color="#241a10" stop-opacity="0.8" />
    </radialGradient>
  </defs>
  <g clip-path="url(#recorte-rasgado)">
    <rect width="${ANCHO}" height="${ALTO}" fill="#e2d0a3" />
    <g stroke="#83714f" stroke-width="1.6" fill="none" opacity="0.85">
      ${trazosCalles}
    </g>
    <g fill="#d6bf8c" stroke="#83714f" stroke-width="0.8" opacity="0.75">
      ${bloquesEdificios}
    </g>
    <ellipse cx="${ANCHO / 2}" cy="${ALTO / 2}" rx="${ANCHO * 0.16}" ry="${ALTO * 0.16}" fill="none" stroke="#9c2b1f" stroke-width="3.5" stroke-dasharray="5 6" transform="rotate(-4 ${ANCHO / 2} ${ALTO / 2})" />
    <rect width="${ANCHO}" height="${ALTO}" fill="url(#grano-${rutaId})" opacity="0.3" style="mix-blend-mode:multiply" />
    <rect width="${ANCHO}" height="${ALTO}" fill="url(#vineta-${rutaId})" />
  </g>
</svg>
`;
}

async function generarUna(rutaId) {
  const centro = ZONAS[rutaId];
  if (!centro) throw new Error(`No hay coordenadas para "${rutaId}" en ZONAS`);
  const ruta = rutaPorId(rutaId);
  if (!ruta) throw new Error(`"${rutaId}" no existe en js/catalogo.js`);

  console.log(`${rutaId}: pidiendo datos a Overpass…`);
  const datos = await pedirOverpass(centro.lat, centro.lng, centro.radioM);
  const svg = dibujarSvg(datos, centro, rutaId, ruta.zona);
  const destino = path.join(DIR_SALIDA, `${rutaId}.svg`);
  writeFileSync(destino, svg, 'utf8');
  console.log(`${rutaId}: guardado en ${destino} (${datos.elements.length} elementos de OSM)`);
}

// Solo dispara las llamadas reales a Overpass cuando el archivo se ejecuta
// como script (`node scripts/generar-mapas.mjs`), nunca al importarlo — sin
// esto, tests/generar-mapas.test.js importando metrosPorGrado/proyectar
// dispararía las 7 peticiones de red como efecto secundario de cargar el
// módulo, hundiendo `npm test` con la red y los límites de Overpass.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [, , rutaIdArg] = process.argv;
  const idsAGenerar = rutaIdArg ? [rutaIdArg] : Object.keys(ZONAS);

  for (const rutaId of idsAGenerar) {
    await generarUna(rutaId);
    // Overpass pide no encadenar peticiones sin pausa entre ellas.
    await new Promise((resuelve) => setTimeout(resuelve, 1500));
  }
}

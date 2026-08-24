#!/usr/bin/env node
// worker/scripts/mint-dev-token.mjs
//
// Herramienta SOLO de desarrollo: firma un token de acceso sin pasar por
// Stripe, para poder probar la partida completa (jugar/index.html) contra
// un `wrangler dev` local. En producción, el único sitio que firma tokens
// es el endpoint /api/confirm-payment (paso 5 del plan), después de
// verificar un pago real contra la API de Stripe.
//
// Uso:
//   node scripts/mint-dev-token.mjs <rutaId> [orderId]
//   node scripts/mint-dev-token.mjs barcelona-gotic
//
// Lee TOKEN_SECRET de worker/.dev.vars (el mismo archivo que usa `wrangler
// dev`), así que el token generado aquí es válido contra ese mismo servidor
// local sin ningún paso extra.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { firmarToken } from '../src/acceso.js';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RUTA_DEV_VARS = path.join(AQUI, '..', '.dev.vars');

function leerTokenSecretDeDevVars() {
  const contenido = readFileSync(RUTA_DEV_VARS, 'utf8');
  const linea = contenido.split('\n').find((l) => l.startsWith('TOKEN_SECRET='));
  if (!linea) throw new Error(`No se encontró TOKEN_SECRET en ${RUTA_DEV_VARS}`);
  return linea.slice('TOKEN_SECRET='.length).trim();
}

const [, , rutaId, orderIdArg] = process.argv;
if (!rutaId) {
  console.error('Uso: node scripts/mint-dev-token.mjs <rutaId> [orderId]');
  console.error('Ejemplo: node scripts/mint-dev-token.mjs barcelona-gotic');
  process.exit(1);
}

const orderId = orderIdArg || `dev_${Date.now()}`;
const secreto = leerTokenSecretDeDevVars();
const token = await firmarToken({ rutaId, orderId }, secreto);

console.log('');
console.log(`rutaId:  ${rutaId}`);
console.log(`orderId: ${orderId}`);
console.log('');
console.log('Token:');
console.log(token);
console.log('');
console.log('URL de juego (con wrangler dev + servidor estático corriendo):');
console.log(`  http://localhost:8743/jugar/?ruta=${rutaId}&t=${encodeURIComponent(token)}`);
console.log('');

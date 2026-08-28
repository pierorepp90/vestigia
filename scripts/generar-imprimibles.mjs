#!/usr/bin/env node
// scripts/generar-imprimibles.mjs
//
// Genera en lote la versión imprimible (PDF) de cada ruta, para no tener que
// abrir jugar/imprimir.html una por una y darle a "Guardar como PDF". Usa la
// página real —mismo HTML, mismo js/imprimir.js, mismo css/print.css— servida
// por un servidor estático de usar y tirar; lo único que se sustituye es la
// llamada al Worker (/api/ruta), que se responde con el JSON de contenido
// leído de disco. Así el PDF sale idéntico al que vería un comprador.
//
// El contenido de pago (worker/src/contenido/) no está en git: este script
// solo funciona en la máquina que tiene esos JSON, y su salida (dist/) está
// en .gitignore por la misma razón.
//
// Requiere el navegador de Playwright una vez: `npx playwright install chromium`.
//
// Uso:
//   npm run imprimibles                 # todas las rutas, en español
//   node scripts/generar-imprimibles.mjs roma-centro florencia-centro
//   IDIOMA=en node scripts/generar-imprimibles.mjs   # otro idioma (si existe)
import { createServer } from 'node:http';
import { readFile, readdir, mkdir } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR_CONTENIDO = path.join(RAIZ, 'worker', 'src', 'contenido');
const DIR_SALIDA = path.join(RAIZ, 'dist', 'imprimibles');
const IDIOMA = process.env.IDIOMA || 'es';

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
};

/** Servidor estático mínimo sobre la raíz del repo. Sin dependencias. */
function arrancarServidorEstatico() {
  const servidor = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      const rel = path.normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, '');
      let archivo = path.join(RAIZ, rel);
      if (!archivo.startsWith(RAIZ)) { res.writeHead(403).end(); return; }
      if (archivo.endsWith(path.sep)) archivo = path.join(archivo, 'index.html');
      res.writeHead(200, { 'Content-Type': TIPOS[path.extname(archivo)] || 'application/octet-stream' });
      createReadStream(archivo).on('error', () => res.writeHead(404).end()).pipe(res);
    } catch {
      res.writeHead(500).end();
    }
  });
  return new Promise((resolve) => {
    servidor.listen(0, '127.0.0.1', () => resolve({ servidor, puerto: servidor.address().port }));
  });
}

async function rutasDisponibles() {
  const archivos = await readdir(DIR_CONTENIDO);
  return [...new Set(
    archivos
      .filter((f) => f.endsWith(`.${IDIOMA}.json`))
      .map((f) => f.slice(0, -`.${IDIOMA}.json`.length)),
  )].sort();
}

async function main() {
  const pedidas = process.argv.slice(2);
  const todas = await rutasDisponibles();
  const rutas = pedidas.length ? todas.filter((r) => pedidas.includes(r)) : todas;

  if (!rutas.length) {
    console.error(`No hay contenido en ${IDIOMA}. Rutas disponibles: ${todas.join(', ') || '(ninguna)'}`);
    process.exit(1);
  }

  await mkdir(DIR_SALIDA, { recursive: true });
  const { servidor, puerto } = await arrancarServidorEstatico();
  const navegador = await chromium.launch();

  let ok = 0;
  try {
    for (const rutaId of rutas) {
      const contenido = JSON.parse(
        await readFile(path.join(DIR_CONTENIDO, `${rutaId}.${IDIOMA}.json`), 'utf8'),
      );

      const pagina = await navegador.newPage({ viewport: { width: 1024, height: 1400 } });
      await pagina.route('**/api/ruta*', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ rutaId, orderId: 'preview', idiomaServido: IDIOMA, ruta: contenido }),
        }),
      );

      await pagina.goto(
        `http://127.0.0.1:${puerto}/jugar/imprimir.html?t=preview&idioma=${IDIOMA}`,
        { waitUntil: 'load' },
      );
      await pagina.waitForSelector('#hoja:not([hidden])', { timeout: 15000 });
      await pagina.evaluate(() => document.fonts.ready);

      const figuras = await pagina.locator('#lista-paradas svg').count();
      const salida = path.join(DIR_SALIDA, `${rutaId}.${IDIOMA}.pdf`);
      // A4 (no US Letter) y márgenes de css/print.css (@page { margin: 18mm 16mm }).
      await pagina.pdf({ path: salida, format: 'A4', printBackground: true, preferCSSPageSize: true });
      await pagina.close();

      ok += 1;
      console.log(`  ✓ ${rutaId}.${IDIOMA}.pdf  (${contenido.paradas.length} paradas, ${figuras} figuras)`);
    }
  } finally {
    await navegador.close();
    servidor.close();
  }

  console.log(`\n${ok}/${rutas.length} PDF en ${path.relative(RAIZ, DIR_SALIDA)}/`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

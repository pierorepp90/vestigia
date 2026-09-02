// worker/tests/db-sqlite.test.js
//
// Comprobación de que las consultas de db.js son SQL válido contra el
// esquema real de la migración (no solo contra el doble de fake-d1.js).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import * as db from '../src/db.js';

let DatabaseSync;
try { ({ DatabaseSync } = await import('node:sqlite')); } catch { /* runtime sin node:sqlite */ }

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const SQL = readFileSync(path.join(AQUI, '../migrations/0001_votacion_devoluciones.sql'), 'utf8');

/** Adaptador node:sqlite → API de D1 usada por db.js. */
function d1(sdb) {
  const mk = (sql) => {
    let params = [];
    const s = {
      bind(...p) { params = p; return s; },
      async first(col) {
        const row = sdb.prepare(sql).get(...params) ?? null;
        return col && row ? row[col] : row;
      },
      async all() { return { results: sdb.prepare(sql).all(...params), success: true }; },
      async run() {
        const r = sdb.prepare(sql).run(...params);
        return { success: true, meta: { changes: r.changes, last_row_id: Number(r.lastInsertRowid) } };
      },
    };
    return s;
  };
  return {
    prepare: mk,
    async batch(stmts) {
      sdb.exec('BEGIN');
      try {
        const out = [];
        for (const st of stmts) out.push(await st.run());
        sdb.exec('COMMIT');
        return out;
      } catch (e) { sdb.exec('ROLLBACK'); throw e; }
    },
  };
}

function nuevaDB() {
  const sdb = new DatabaseSync(':memory:');
  sdb.exec(SQL);
  return { DB: d1(sdb) };
}

test('la migración 0001 crea el esquema y siembra 6 opciones oficiales', { skip: !DatabaseSync }, () => {
  const env = nuevaDB();
  // acceso directo para contar
  const sdb = new DatabaseSync(':memory:');
  sdb.exec(SQL);
  assert.equal(sdb.prepare("SELECT COUNT(*) AS n FROM voto_opciones WHERE estado='oficial'").get().n, 6);
});

test('flujo completo contra SQL real: proponer → aprobar → contar', { skip: !DatabaseSync }, async () => {
  const env = nuevaDB();
  await db.crearPropuestaConVoto(env, { opcionId: 'oporto', etiquetaJson: '{"es":"Oporto"}', email: 'a@b.com', nota: 'n', votante: 'u1', ipHash: 'h1', ahora: 10 });
  assert.equal((await db.listarOpcionesVotables(env)).some((o) => o.id === 'oporto'), false);
  await db.aprobarPropuesta(env, 'oporto');
  assert.equal((await db.listarOpcionesVotables(env)).some((o) => o.id === 'oporto'), true);
  assert.deepEqual(await db.recuentoVotos(env), { oporto: 1 });
});

test('flujo contra SQL real: proponer → rechazar borra la opción y sus votos', { skip: !DatabaseSync }, async () => {
  const env = nuevaDB();
  await db.crearPropuestaConVoto(env, { opcionId: 'lyon', etiquetaJson: '{"es":"Lyon"}', email: null, nota: null, votante: 'u2', ipHash: 'h2', ahora: 11 });
  await db.rechazarPropuesta(env, 'lyon');
  assert.equal(await db.votoDeVotante(env, 'u2'), null);
  assert.deepEqual(await db.listarPropuestasPendientes(env), []);
});

test('registrarVoto respeta UNIQUE(votante) del esquema real', { skip: !DatabaseSync }, async () => {
  const env = nuevaDB();
  await db.registrarVoto(env, { opcionId: 'praga', votante: 'u3', ipHash: 'h', ahora: 1 });
  await assert.rejects(() => db.registrarVoto(env, { opcionId: 'viena', votante: 'u3', ipHash: 'h', ahora: 2 }));
});

// TODO(D1): añadir aquí el test
//   'guardarDevolucion respeta los CHECK de valoración y categoría'
// cuando Task D1 implemente db.guardarDevolucion. Debe rechazar valoración
// fuera de 1..5 y categoría fuera de la lista blanca del esquema real.

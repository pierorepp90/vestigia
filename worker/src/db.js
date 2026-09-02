// worker/src/db.js
//
// El ÚNICO archivo del Worker que contiene SQL. Los handlers lo reciben como
// dependencia inyectable ({ db }) para poder probarse con un doble en memoria
// (worker/tests/helpers/fake-d1.js).
//
// Cada consulta empieza con un comentario `/* tag:NOMBRE */`. El doble de
// tests conmuta sobre esa etiqueta en vez de interpretar SQL: si añades o
// cambias una consulta, actualiza también fake-d1.js.

/** Opciones que se pueden ver y votar (oficiales + propuestas aprobadas). */
export async function listarOpcionesVotables({ DB }) {
  const { results } = await DB.prepare(
    `/* tag:opciones_votables */
     SELECT id, etiqueta FROM voto_opciones
     WHERE estado IN ('oficial','aprobada')`,
  ).all();
  return results;
}

/** { opcionId: nVotos } contando solo votos activos. */
export async function recuentoVotos({ DB }) {
  const { results } = await DB.prepare(
    `/* tag:recuento_votos */
     SELECT opcion_id, COUNT(*) AS votos FROM votos
     WHERE estado = 'activo' GROUP BY opcion_id`,
  ).all();
  const out = {};
  for (const fila of results) out[fila.opcion_id] = Number(fila.votos);
  return out;
}

/** El voto de este votante (activo o en_espera), o null. */
export async function votoDeVotante({ DB }, votante) {
  return DB.prepare(
    `/* tag:voto_de_votante */
     SELECT opcion_id, estado FROM votos WHERE votante = ?`,
  ).bind(votante).first();
}

export async function opcionPorId({ DB }, id) {
  return DB.prepare(
    `/* tag:opcion_por_id */
     SELECT id, estado FROM voto_opciones WHERE id = ?`,
  ).bind(id).first();
}

/** Nº de votos activos ya emitidos desde este hash de IP. */
export async function votosConMismaIp({ DB }, ipHash) {
  const fila = await DB.prepare(
    `/* tag:contar_por_ip */
     SELECT COUNT(*) AS n FROM votos WHERE ip_hash = ? AND estado = 'activo'`,
  ).bind(ipHash).first();
  return Number(fila?.n || 0);
}

export async function registrarVoto({ DB }, { opcionId, votante, ipHash, ahora }) {
  await DB.prepare(
    `/* tag:insertar_voto */
     INSERT INTO votos (opcion_id, votante, ip_hash, estado, creado_en)
     VALUES (?, ?, ?, ?, ?)`,
  ).bind(opcionId, votante, ipHash, 'activo', ahora).run();
}

/** Inserta la opción como `pendiente` y el voto del proponente como `en_espera`. */
export async function crearPropuestaConVoto({ DB }, { opcionId, etiquetaJson, email, nota, votante, ipHash, ahora }) {
  await DB.batch([
    DB.prepare(
      `/* tag:insertar_opcion */
       INSERT INTO voto_opciones (id, etiqueta, estado, propuesta_email, nota, creada_en)
       VALUES (?, ?, ?, ?, ?, ?)`,
    ).bind(opcionId, etiquetaJson, 'pendiente', email, nota, ahora),
    DB.prepare(
      `/* tag:insertar_voto */
       INSERT INTO votos (opcion_id, votante, ip_hash, estado, creado_en)
       VALUES (?, ?, ?, ?, ?)`,
    ).bind(opcionId, votante, ipHash, 'en_espera', ahora),
  ]);
}

export async function propuestaPendienteDeVotante({ DB }, votante) {
  return DB.prepare(
    `/* tag:propuesta_pendiente_de_votante */
     SELECT opcion_id FROM votos WHERE votante = ? AND estado = 'en_espera'`,
  ).bind(votante).first();
}

export async function listarPropuestasPendientes({ DB }) {
  const { results } = await DB.prepare(
    `/* tag:propuestas_pendientes */
     SELECT id, etiqueta, propuesta_email, nota, creada_en FROM voto_opciones
     WHERE estado = 'pendiente' ORDER BY creada_en ASC`,
  ).all();
  return results;
}

export async function aprobarPropuesta({ DB }, opcionId) {
  await DB.batch([
    DB.prepare(
      `/* tag:actualizar_estado_opcion */
       UPDATE voto_opciones SET estado = ? WHERE id = ?`,
    ).bind('aprobada', opcionId),
    DB.prepare(
      `/* tag:activar_voto_en_espera */
       UPDATE votos SET estado = 'activo' WHERE opcion_id = ? AND estado = 'en_espera'`,
    ).bind(opcionId),
  ]);
}

export async function rechazarPropuesta({ DB }, opcionId) {
  await DB.batch([
    DB.prepare(
      `/* tag:actualizar_estado_opcion */
       UPDATE voto_opciones SET estado = ? WHERE id = ?`,
    ).bind('rechazada', opcionId),
    DB.prepare(
      `/* tag:borrar_votos_de_opcion */
       DELETE FROM votos WHERE opcion_id = ?`,
    ).bind(opcionId),
  ]);
}

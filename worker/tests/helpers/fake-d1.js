// worker/tests/helpers/fake-d1.js
//
// Doble mínimo de la API de D1 (env.DB.prepare().bind().first()/all()/run()).
// No interpreta SQL: cada consulta de db.js empieza con un comentario-etiqueta
// `/* tag:NOMBRE */` y este doble conmuta sobre esa etiqueta. Mantener
// sincronizado con las etiquetas de worker/src/db.js.

export function crearD1Falsa(inicial = {}) {
  const tablas = {
    voto_opciones: [...(inicial.voto_opciones || [])],
    votos: [...(inicial.votos || [])],
    devoluciones: [...(inicial.devoluciones || [])],
  };
  let autoId = 1;

  function tag(sql) {
    const m = sql.match(/\/\* tag:(\w+) \*\//);
    if (!m) throw new Error(`SQL sin etiqueta en fake-d1: ${sql}`);
    return m[1];
  }

  function ejecutar(etiqueta, args) {
    switch (etiqueta) {
      case 'opciones_votables':
        return {
          results: tablas.voto_opciones
            .filter((o) => o.estado === 'oficial' || o.estado === 'aprobada')
            .map((o) => ({ id: o.id, etiqueta: o.etiqueta })),
        };
      case 'recuento_votos':
        return {
          results: Object.entries(
            tablas.votos
              .filter((v) => v.estado === 'activo')
              .reduce((acc, v) => ((acc[v.opcion_id] = (acc[v.opcion_id] || 0) + 1), acc), {}),
          ).map(([opcion_id, votos]) => ({ opcion_id, votos })),
        };
      case 'voto_de_votante':
        return { first: tablas.votos.find((v) => v.votante === args[0]) || null };
      case 'opcion_por_id':
        return { first: tablas.voto_opciones.find((o) => o.id === args[0]) || null };
      case 'contar_por_ip':
        return {
          first: { n: tablas.votos.filter((v) => v.ip_hash === args[0] && v.estado === 'activo').length },
        };
      case 'insertar_voto':
        tablas.votos.push({
          id: autoId++, opcion_id: args[0], votante: args[1], ip_hash: args[2], estado: args[3], creado_en: args[4],
        });
        return { success: true };
      case 'insertar_opcion':
        tablas.voto_opciones.push({
          id: args[0], etiqueta: args[1], estado: args[2], propuesta_email: args[3], nota: args[4], creada_en: args[5],
        });
        return { success: true };
      case 'propuesta_pendiente_de_votante':
        return {
          first:
            tablas.votos.find(
              (v) => v.votante === args[0] && v.estado === 'en_espera',
            ) || null,
        };
      case 'propuestas_pendientes':
        return {
          results: tablas.voto_opciones
            .filter((o) => o.estado === 'pendiente')
            .map((o) => ({ id: o.id, etiqueta: o.etiqueta, propuesta_email: o.propuesta_email, nota: o.nota, creada_en: o.creada_en })),
        };
      case 'actualizar_estado_opcion': {
        const o = tablas.voto_opciones.find((x) => x.id === args[1]);
        if (o) o.estado = args[0];
        return { success: true };
      }
      case 'activar_voto_en_espera': {
        const v = tablas.votos.find((x) => x.opcion_id === args[0] && x.estado === 'en_espera');
        if (v) v.estado = 'activo';
        return { success: true };
      }
      case 'borrar_voto_en_espera':
        tablas.votos = tablas.votos.filter((v) => !(v.opcion_id === args[0] && v.estado === 'en_espera'));
        return { success: true };
      case 'insertar_devolucion':
        tablas.devoluciones.push({
          id: autoId++, ruta_id: args[0], order_id: args[1], idioma: args[2],
          valoracion: args[3], categoria: args[4], texto: args[5], email: args[6], creado_en: args[7],
        });
        return { success: true };
      default:
        throw new Error(`etiqueta desconocida en fake-d1: ${etiqueta}`);
    }
  }

  const DB = {
    _tablas: tablas,
    prepare(sql) {
      const etiqueta = tag(sql);
      let bound = [];
      const stmt = {
        bind(...a) { bound = a; return stmt; },
        async first(col) {
          const r = ejecutar(etiqueta, bound);
          const row = r.first ?? (r.results ? r.results[0] : null) ?? null;
          return col && row ? row[col] : row;
        },
        async all() {
          const r = ejecutar(etiqueta, bound);
          return { results: r.results || [], success: true };
        },
        async run() { return ejecutar(etiqueta, bound); },
      };
      return stmt;
    },
  };
  return DB;
}

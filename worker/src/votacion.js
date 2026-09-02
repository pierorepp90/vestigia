// worker/src/votacion.js
//
// Handlers de la votación de próxima ciudad. Reciben `db` (el módulo
// worker/src/db.js) como último argumento para poder inyectar un doble en
// los tests — mismo patrón que sendEmail(fetchFn) en resend.js.
import * as dbPorDefecto from './db.js';

const RE_ID = /^[a-z0-9-]{1,40}$/;

function jsonRes(cuerpo, cors, status = 200) {
  return Response.json(cuerpo, { status, headers: cors });
}

/** Estado del votante a partir de su fila en `votos`. */
function estadoDesdeVoto(voto) {
  if (!voto) return 'sin_voto';
  return voto.estado === 'en_espera' ? 'propuesta_pendiente' : 'voto_activo';
}

/** La etiqueta se guarda como JSON `{es,en,...}`; si viene mal formada, se
 *  devuelve como `{es: <texto>}` para no romper la página. */
export function parseEtiqueta(raw) {
  try {
    const o = JSON.parse(raw);
    return o && typeof o === 'object' ? o : { es: String(raw) };
  } catch {
    return { es: String(raw) };
  }
}

export async function handleObtenerVotacion(request, env, cors, db = dbPorDefecto) {
  const url = new URL(request.url);
  const votante = url.searchParams.get('votante');
  if (!votante || !RE_ID.test(votante.replace(/-/g, ''))) {
    return jsonRes({ error: 'Falta el identificador de votante' }, cors, 400);
  }

  const [opciones, voto] = await Promise.all([
    db.listarOpcionesVotables(env),
    db.votoDeVotante(env, votante),
  ]);
  const estadoVotante = estadoDesdeVoto(voto);
  const miVoto = voto && voto.estado === 'activo' ? voto.opcion_id : null;

  const salida = opciones.map((o) => ({ id: o.id, etiqueta: parseEtiqueta(o.etiqueta) }));
  if (estadoVotante === 'voto_activo') {
    const rec = await db.recuentoVotos(env);
    for (const o of salida) o.votos = rec[o.id] || 0;
  }
  return jsonRes({ opciones: salida, estadoVotante, miVoto }, cors);
}

// worker/src/contenido.js
//
// Carga el contenido de juego (enigmas, respuestas, pistas) — el único
// sitio del proyecto donde ese contenido existe. Se importa de forma
// estática porque el runtime de Cloudflare Workers no tiene sistema de
// archivos: wrangler empaqueta estos JSON dentro del propio Worker en el
// build, igual que cualquier otro módulo.
//
// Si el idioma pedido todavía no existe para una ruta (ver plan, paso 7:
// Traducciones), se sirve la versión en español en su lugar en vez de
// fallar — mejor un enigma en el idioma "equivocado" que una ruta rota.
import barcelonaGoticEs from './contenido/barcelona-gotic.es.json' with { type: 'json' };
import barcelonaGoticEn from './contenido/barcelona-gotic.en.json' with { type: 'json' };
import barcelonaGoticFr from './contenido/barcelona-gotic.fr.json' with { type: 'json' };
import barcelonaGoticIt from './contenido/barcelona-gotic.it.json' with { type: 'json' };
import romaCentroEs from './contenido/roma-centro.es.json' with { type: 'json' };
import romaCentroEn from './contenido/roma-centro.en.json' with { type: 'json' };
import romaCentroFr from './contenido/roma-centro.fr.json' with { type: 'json' };
import romaCentroIt from './contenido/roma-centro.it.json' with { type: 'json' };
import parisMaraisEs from './contenido/paris-marais.es.json' with { type: 'json' };
import parisMaraisEn from './contenido/paris-marais.en.json' with { type: 'json' };
import parisMaraisFr from './contenido/paris-marais.fr.json' with { type: 'json' };
import parisMaraisIt from './contenido/paris-marais.it.json' with { type: 'json' };
import barcelonaBornEs from './contenido/barcelona-born.es.json' with { type: 'json' };
import barcelonaBornEn from './contenido/barcelona-born.en.json' with { type: 'json' };
import barcelonaBornFr from './contenido/barcelona-born.fr.json' with { type: 'json' };
import barcelonaBornIt from './contenido/barcelona-born.it.json' with { type: 'json' };
import barcelonaRavalEs from './contenido/barcelona-raval.es.json' with { type: 'json' };
import barcelonaRavalEn from './contenido/barcelona-raval.en.json' with { type: 'json' };
import barcelonaRavalFr from './contenido/barcelona-raval.fr.json' with { type: 'json' };
import barcelonaRavalIt from './contenido/barcelona-raval.it.json' with { type: 'json' };
import lisboaAlfamaEs from './contenido/lisboa-alfama.es.json' with { type: 'json' };
import lisboaAlfamaEn from './contenido/lisboa-alfama.en.json' with { type: 'json' };
import lisboaAlfamaFr from './contenido/lisboa-alfama.fr.json' with { type: 'json' };
import lisboaAlfamaIt from './contenido/lisboa-alfama.it.json' with { type: 'json' };
import florenciaCentroEs from './contenido/florencia-centro.es.json' with { type: 'json' };
import florenciaCentroEn from './contenido/florencia-centro.en.json' with { type: 'json' };
import florenciaCentroFr from './contenido/florencia-centro.fr.json' with { type: 'json' };
import florenciaCentroIt from './contenido/florencia-centro.it.json' with { type: 'json' };

const CONTENIDO = {
  'barcelona-gotic.es': barcelonaGoticEs,
  'barcelona-gotic.en': barcelonaGoticEn,
  'barcelona-gotic.fr': barcelonaGoticFr,
  'barcelona-gotic.it': barcelonaGoticIt,
  'roma-centro.es': romaCentroEs,
  'roma-centro.en': romaCentroEn,
  'roma-centro.fr': romaCentroFr,
  'roma-centro.it': romaCentroIt,
  'paris-marais.es': parisMaraisEs,
  'paris-marais.en': parisMaraisEn,
  'paris-marais.fr': parisMaraisFr,
  'paris-marais.it': parisMaraisIt,
  'barcelona-born.es': barcelonaBornEs,
  'barcelona-born.en': barcelonaBornEn,
  'barcelona-born.fr': barcelonaBornFr,
  'barcelona-born.it': barcelonaBornIt,
  'barcelona-raval.es': barcelonaRavalEs,
  'barcelona-raval.en': barcelonaRavalEn,
  'barcelona-raval.fr': barcelonaRavalFr,
  'barcelona-raval.it': barcelonaRavalIt,
  'lisboa-alfama.es': lisboaAlfamaEs,
  'lisboa-alfama.en': lisboaAlfamaEn,
  'lisboa-alfama.fr': lisboaAlfamaFr,
  'lisboa-alfama.it': lisboaAlfamaIt,
  'florencia-centro.es': florenciaCentroEs,
  'florencia-centro.en': florenciaCentroEn,
  'florencia-centro.fr': florenciaCentroFr,
  'florencia-centro.it': florenciaCentroIt,
};

const IDIOMA_POR_DEFECTO = 'es';

/** Devuelve { contenido, idiomaServido } o null si la ruta no existe en absoluto. */
export function cargarContenido(rutaId, idioma) {
  const clave = `${rutaId}.${idioma}`;
  if (CONTENIDO[clave]) return { contenido: CONTENIDO[clave], idiomaServido: idioma };

  const claveDefecto = `${rutaId}.${IDIOMA_POR_DEFECTO}`;
  if (CONTENIDO[claveDefecto]) return { contenido: CONTENIDO[claveDefecto], idiomaServido: IDIOMA_POR_DEFECTO };

  return null;
}

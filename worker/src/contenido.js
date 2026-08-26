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
import berlinMitteEs from './contenido/berlin-mitte.es.json' with { type: 'json' };
import berlinMitteEn from './contenido/berlin-mitte.en.json' with { type: 'json' };
import berlinMitteFr from './contenido/berlin-mitte.fr.json' with { type: 'json' };
import berlinMitteIt from './contenido/berlin-mitte.it.json' with { type: 'json' };
import florenciaSantacroceEs from './contenido/florencia-santacroce.es.json' with { type: 'json' };
import florenciaSantacroceEn from './contenido/florencia-santacroce.en.json' with { type: 'json' };
import florenciaSantacroceFr from './contenido/florencia-santacroce.fr.json' with { type: 'json' };
import florenciaSantacroceIt from './contenido/florencia-santacroce.it.json' with { type: 'json' };
import istanbulSultanahmetEs from './contenido/istanbul-sultanahmet.es.json' with { type: 'json' };
import istanbulSultanahmetEn from './contenido/istanbul-sultanahmet.en.json' with { type: 'json' };
import istanbulSultanahmetFr from './contenido/istanbul-sultanahmet.fr.json' with { type: 'json' };
import istanbulSultanahmetIt from './contenido/istanbul-sultanahmet.it.json' with { type: 'json' };
import madridAustriasEs from './contenido/madrid-austrias.es.json' with { type: 'json' };
import madridAustriasEn from './contenido/madrid-austrias.en.json' with { type: 'json' };
import madridAustriasFr from './contenido/madrid-austrias.fr.json' with { type: 'json' };
import madridAustriasIt from './contenido/madrid-austrias.it.json' with { type: 'json' };
import napolesSpaccanapoliEs from './contenido/napoles-spaccanapoli.es.json' with { type: 'json' };
import napolesSpaccanapoliEn from './contenido/napoles-spaccanapoli.en.json' with { type: 'json' };
import napolesSpaccanapoliFr from './contenido/napoles-spaccanapoli.fr.json' with { type: 'json' };
import napolesSpaccanapoliIt from './contenido/napoles-spaccanapoli.it.json' with { type: 'json' };
import parisMontmartreEs from './contenido/paris-montmartre.es.json' with { type: 'json' };
import parisMontmartreEn from './contenido/paris-montmartre.en.json' with { type: 'json' };
import parisMontmartreFr from './contenido/paris-montmartre.fr.json' with { type: 'json' };
import parisMontmartreIt from './contenido/paris-montmartre.it.json' with { type: 'json' };
import romaTrastevereEs from './contenido/roma-trastevere.es.json' with { type: 'json' };
import romaTrastevereEn from './contenido/roma-trastevere.en.json' with { type: 'json' };
import romaTrastevereFr from './contenido/roma-trastevere.fr.json' with { type: 'json' };
import romaTrastevereIt from './contenido/roma-trastevere.it.json' with { type: 'json' };
import toulouseCapitoleEs from './contenido/toulouse-capitole.es.json' with { type: 'json' };
import toulouseCapitoleEn from './contenido/toulouse-capitole.en.json' with { type: 'json' };
import toulouseCapitoleFr from './contenido/toulouse-capitole.fr.json' with { type: 'json' };
import toulouseCapitoleIt from './contenido/toulouse-capitole.it.json' with { type: 'json' };
import valenciaCarmenEs from './contenido/valencia-carmen.es.json' with { type: 'json' };
import valenciaCarmenEn from './contenido/valencia-carmen.en.json' with { type: 'json' };
import valenciaCarmenFr from './contenido/valencia-carmen.fr.json' with { type: 'json' };
import valenciaCarmenIt from './contenido/valencia-carmen.it.json' with { type: 'json' };

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
  'berlin-mitte.es': berlinMitteEs,
  'berlin-mitte.en': berlinMitteEn,
  'berlin-mitte.fr': berlinMitteFr,
  'berlin-mitte.it': berlinMitteIt,
  'florencia-santacroce.es': florenciaSantacroceEs,
  'florencia-santacroce.en': florenciaSantacroceEn,
  'florencia-santacroce.fr': florenciaSantacroceFr,
  'florencia-santacroce.it': florenciaSantacroceIt,
  'istanbul-sultanahmet.es': istanbulSultanahmetEs,
  'istanbul-sultanahmet.en': istanbulSultanahmetEn,
  'istanbul-sultanahmet.fr': istanbulSultanahmetFr,
  'istanbul-sultanahmet.it': istanbulSultanahmetIt,
  'madrid-austrias.es': madridAustriasEs,
  'madrid-austrias.en': madridAustriasEn,
  'madrid-austrias.fr': madridAustriasFr,
  'madrid-austrias.it': madridAustriasIt,
  'napoles-spaccanapoli.es': napolesSpaccanapoliEs,
  'napoles-spaccanapoli.en': napolesSpaccanapoliEn,
  'napoles-spaccanapoli.fr': napolesSpaccanapoliFr,
  'napoles-spaccanapoli.it': napolesSpaccanapoliIt,
  'paris-montmartre.es': parisMontmartreEs,
  'paris-montmartre.en': parisMontmartreEn,
  'paris-montmartre.fr': parisMontmartreFr,
  'paris-montmartre.it': parisMontmartreIt,
  'roma-trastevere.es': romaTrastevereEs,
  'roma-trastevere.en': romaTrastevereEn,
  'roma-trastevere.fr': romaTrastevereFr,
  'roma-trastevere.it': romaTrastevereIt,
  'toulouse-capitole.es': toulouseCapitoleEs,
  'toulouse-capitole.en': toulouseCapitoleEn,
  'toulouse-capitole.fr': toulouseCapitoleFr,
  'toulouse-capitole.it': toulouseCapitoleIt,
  'valencia-carmen.es': valenciaCarmenEs,
  'valencia-carmen.en': valenciaCarmenEn,
  'valencia-carmen.fr': valenciaCarmenFr,
  'valencia-carmen.it': valenciaCarmenIt,
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

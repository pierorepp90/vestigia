// worker/src/resend.js — mismo patrón que grip-la-seu/worker/src/resend.js.
//
// vestigia.fun ya está verificado en Resend (DKIM en resend._domainkey +
// SPF/MX en send.vestigia.fun), así que se puede enviar directo desde el
// dominio propio en vez del remitente de pruebas.
import { recomendacionesDeRuta } from '../../js/recomendaciones.js';
import { rutaPorId } from '../../js/catalogo.js';

const FROM_ADDRESS = 'Vestigia <hola@vestigia.fun>';

/** Idiomas soportados por catalogo.js / recomendaciones.js. Cualquier otro
 * valor de `idioma` (o su ausencia) cae en español. */
const IDIOMAS_SOPORTADOS = ['es', 'en', 'fr', 'it'];

function idiomaValido(idioma) {
  return IDIOMAS_SOPORTADOS.includes(idioma) ? idioma : 'es';
}

/** Extrae el campo del idioma pedido de un objeto `{ es, en, fr, it }`,
 * con fallback a español. Si `campo` ya es un string plano (contenido
 * todavía sin traducir), lo devuelve tal cual — así conviven entradas
 * traducidas y sin traducir mientras se migra recomendaciones.js. */
function loc(campo, idioma) {
  if (campo == null) return campo;
  if (typeof campo === 'string') return campo;
  return campo[idioma] || campo.es;
}

/** Textos fijos del email de confirmación, en los 4 idiomas del catálogo. */
const UI = {
  es: {
    subject: (titulo) => `Vuestro acceso a "${titulo}" — Vestigia`,
    heading: '¡Ya tenéis acceso a vuestra ruta!',
    orderRef: 'Referencia del pedido:',
    playButton: 'Empezar a jugar →',
    keepEmail:
      'Guardad este email: el enlace de arriba es vuestra llave de acceso durante un año. Funciona incluso sin cobertura una vez lo hayáis abierto una primera vez.',
    printButton: '🖨️ Descargar la versión imprimible',
    beforeYouGo: 'Antes de ir: unas recomendaciones gratis de la zona',
    howToGetThere: 'Cómo llegar',
    freeView: 'Mirador gratis',
    whereToEat: 'Para comer',
    officialPasses: 'Pases oficiales',
    disclaimer:
      'Esto no es publicidad pagada: son sitios que nos gustan de verdad. Comprobad horarios antes de ir, que a veces cambian.',
    closing: '¡Que disfrutéis la ruta!',
  },
  en: {
    subject: (titulo) => `Your access to "${titulo}" — Vestigia`,
    heading: 'You now have access to your route!',
    orderRef: 'Order reference:',
    playButton: 'Start playing →',
    keepEmail:
      "Keep this email: the link above is your access key for a year. It works even without signal once you've opened it for the first time.",
    printButton: '🖨️ Download the printable version',
    beforeYouGo: 'Before you go: free recommendations for the area',
    howToGetThere: 'Getting there',
    freeView: 'Free viewpoint',
    whereToEat: 'Where to eat',
    officialPasses: 'Official passes',
    disclaimer:
      "This isn't paid advertising: these are places we genuinely like. Check opening hours before you go, as they sometimes change.",
    closing: 'Enjoy the route!',
  },
  fr: {
    subject: (titulo) => `Votre accès à « ${titulo} » — Vestigia`,
    heading: 'Vous avez maintenant accès à votre parcours !',
    orderRef: 'Référence de commande :',
    playButton: 'Commencer à jouer →',
    keepEmail:
      "Conservez cet email : le lien ci-dessus est votre clé d'accès pendant un an. Il fonctionne même sans réseau une fois ouvert une première fois.",
    printButton: '🖨️ Télécharger la version imprimable',
    beforeYouGo: 'Avant de partir : quelques recommandations gratuites du quartier',
    howToGetThere: 'Comment y aller',
    freeView: 'Point de vue gratuit',
    whereToEat: 'Où manger',
    officialPasses: 'Pass officiels',
    disclaimer:
      "Ce n'est pas de la publicité payante : ce sont des adresses que nous aimons vraiment. Vérifiez les horaires avant d'y aller, ils changent parfois.",
    closing: 'Bon parcours !',
  },
  it: {
    subject: (titulo) => `Il vostro accesso a "${titulo}" — Vestigia`,
    heading: 'Ora avete accesso al vostro percorso!',
    orderRef: 'Riferimento ordine:',
    playButton: 'Inizia a giocare →',
    keepEmail:
      'Conservate questa email: il link qui sopra è la vostra chiave di accesso per un anno. Funziona anche senza connessione una volta apertolo la prima volta.',
    printButton: '🖨️ Scarica la versione stampabile',
    beforeYouGo: 'Prima di partire: alcuni consigli gratuiti sulla zona',
    howToGetThere: 'Come arrivare',
    freeView: 'Punto panoramico gratuito',
    whereToEat: 'Dove mangiare',
    officialPasses: 'Pass ufficiali',
    disclaimer:
      'Non è pubblicità a pagamento: sono posti che ci piacciono davvero. Controllate gli orari prima di andare, a volte cambiano.',
    closing: 'Buon percorso!',
  },
};

function t(idioma) {
  return UI[idiomaValido(idioma)];
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[char]);
}

/** Comprobación de formato básica — no valida que el email exista de verdad,
 * solo descarta valores claramente inválidos antes de gastar una llamada a
 * la API de Resend. */
export function emailValidoBasico(email) {
  return typeof email === 'string' && email.length <= 254 && /^[^\s@\x00-\x1F\x7F]+@[^\s@\x00-\x1F\x7F]+\.[^\s@\x00-\x1F\x7F]+$/.test(email);
}

function enlaceJuego(siteUrl, rutaId, token, idioma) {
  const url = new URL(`${siteUrl}/jugar/`);
  url.searchParams.set('ruta', rutaId);
  url.searchParams.set('t', token);
  if (idioma) url.searchParams.set('idioma', idioma);
  return url.toString();
}

function enlaceImprimir(siteUrl, rutaId, token, idioma) {
  const url = new URL(`${siteUrl}/jugar/imprimir.html`);
  url.searchParams.set('ruta', rutaId);
  url.searchParams.set('t', token);
  if (idioma) url.searchParams.set('idioma', idioma);
  return url.toString();
}

/** Email de aviso al owner para incidencias que requieren revisión manual
 *  (p. ej. una sesión pagada con un importe inesperado). */
export function buildAvisoOwner(texto, ownerEmail) {
  return {
    from: FROM_ADDRESS,
    to: [ownerEmail],
    subject: 'Vestigia: revisión manual',
    html: `<p>${escapeHtml(texto)}</p>`,
  };
}

export function buildOwnerEmail({ rutaId, orderId, email, importe }, ownerEmail) {
  return {
    from: FROM_ADDRESS,
    to: [ownerEmail],
    subject: `Nueva reserva: ${rutaId} (${orderId})`,
    html: `
      <h2>Nueva reserva</h2>
      <ul>
        <li>Ruta: ${escapeHtml(rutaId)}</li>
        <li>Pedido: ${escapeHtml(orderId)}</li>
        <li>Email del cliente: ${escapeHtml(email || '(no proporcionado)')}</li>
        <li>Importe: ${importe?.toFixed ? importe.toFixed(2) : importe}€</li>
      </ul>
    `,
  };
}

/** Un mirador, una comida o la movilidad: misma maquetación de tarjeta para
 * los tres. Si `item.mapsUrl` existe, el nombre se convierte en enlace a
 * Google Maps con un pin al lado — para "Cómo llegar" apunta al punto de
 * partida de la ruta; para mirador/comida, al propio sitio. */
function bloqueRecomendacion(emoji, etiqueta, item, idioma) {
  if (!item) return '';
  const enlace = item.url
    ? ` — <a href="${escapeHtml(item.url)}" style="color:#9c2b1f;">${item.url.replace(/^https?:\/\//, '')}</a>`
    : '';
  const nombreTexto = loc(item.nombre, idioma);
  const nombre = nombreTexto
    ? item.mapsUrl
      ? `<p style="margin:0; font-weight:600;"><a href="${escapeHtml(item.mapsUrl)}" style="color:#241a10; text-decoration:none;">📍 ${escapeHtml(nombreTexto)}</a></p>`
      : `<p style="margin:0; font-weight:600;">${escapeHtml(nombreTexto)}</p>`
    : '';
  return `
    <tr>
      <td style="padding:10px 0; border-bottom:1px solid #e6ddc8;">
        <p style="margin:0 0 2px; font-size:12px; letter-spacing:.05em; text-transform:uppercase; color:#83714f;">${escapeHtml(etiqueta)} ${emoji}</p>
        ${nombre}
        <p style="margin:4px 0 0; color:#4d3f2c;">${escapeHtml(loc(item.texto, idioma))}${enlace}</p>
      </td>
    </tr>`;
}

/** Los pases oficiales de la ciudad, unificados bajo una sola cabecera
 * "Pases oficiales 🎫" en vez de repetir la etiqueta por cada pase. */
function bloquePases(pases, etiqueta, idioma) {
  if (!pases || pases.length === 0) return '';
  const filas = pases
    .map(
      (pase) => `
        <tr>
          <td style="padding:8px 0 8px 16px; border-bottom:1px solid #e6ddc8;">
            <p style="margin:0; font-weight:600;">${escapeHtml(loc(pase.nombre, idioma))}</p>
            <p style="margin:4px 0 0; color:#4d3f2c;">${escapeHtml(loc(pase.texto, idioma))} — <a href="${escapeHtml(pase.url)}" style="color:#9c2b1f;">${pase.url.replace(/^https?:\/\//, '')}</a></p>
          </td>
        </tr>`,
    )
    .join('');
  return `
    <tr>
      <td style="padding:10px 0 4px;">
        <p style="margin:0 0 4px; font-size:12px; letter-spacing:.05em; text-transform:uppercase; color:#83714f;">${escapeHtml(etiqueta)} 🎫</p>
        <table role="presentation" width="100%" style="border-collapse:collapse;">${filas}</table>
      </td>
    </tr>`;
}

/** Sección "recomendaciones gratis de la zona" del email — vacía (string
 * vacío) si la ruta no tiene datos en js/recomendaciones.js, para que las
 * ciudades sin este contenido todavía reciban el email de siempre. */
function seccionRecomendaciones(rutaId, idioma) {
  const ruta = rutaPorId(rutaId);
  const recomendaciones = recomendacionesDeRuta(rutaId, ruta?.ciudadSlug);
  if (!recomendaciones) return '';

  const ui = t(idioma);

  const filasZona = recomendaciones.zona
    ? [
        bloqueRecomendacion('🗺️', ui.howToGetThere, recomendaciones.zona.movilidad, idioma),
        bloqueRecomendacion('🔭', ui.freeView, recomendaciones.zona.mirador, idioma),
        bloqueRecomendacion('🍽️', ui.whereToEat, recomendaciones.zona.comida, idioma),
      ].join('')
    : '';

  const filasPases = bloquePases(recomendaciones.pases, ui.officialPasses, idioma);

  return `
    <h3 style="margin-top:28px;">${escapeHtml(ui.beforeYouGo)}</h3>
    <table role="presentation" width="100%" style="border-collapse:collapse;">
      ${filasZona}${filasPases}
    </table>
    <p style="font-size:12px; color:#83714f;">${escapeHtml(ui.disclaimer)}</p>
  `;
}

export function buildCustomerEmail({ rutaId, orderId, idioma, email, token, tituloRuta }, siteUrl) {
  const jugarUrl = enlaceJuego(siteUrl, rutaId, token, idioma);
  const imprimirUrl = enlaceImprimir(siteUrl, rutaId, token, idioma);
  const ui = t(idioma);

  return {
    from: FROM_ADDRESS,
    to: [email],
    subject: ui.subject(tituloRuta || rutaId),
    html: `
      <h2>${escapeHtml(ui.heading)}</h2>
      <p>${escapeHtml(ui.orderRef)} <strong>${escapeHtml(orderId)}</strong></p>
      <p style="margin:24px 0;">
        <a href="${jugarUrl}" style="display:inline-block; background:#9c2b1f; color:#fbe9df; font-family:Arial, 'Segoe UI', sans-serif; font-weight:700; font-size:16px; text-decoration:none; padding:14px 28px; border-radius:999px;">${escapeHtml(ui.playButton)}</a>
      </p>
      <p>${escapeHtml(ui.keepEmail)}</p>
      <p style="margin:16px 0 24px;">
        <a href="${imprimirUrl}" style="display:inline-block; background:transparent; color:#241a10; font-family:Arial, 'Segoe UI', sans-serif; font-weight:700; font-size:14px; text-decoration:none; padding:10px 22px; border-radius:999px; border:1px solid #241a10;">${escapeHtml(ui.printButton)}</a>
      </p>
      ${seccionRecomendaciones(rutaId, idioma)}
      <p>${escapeHtml(ui.closing)}</p>
    `,
  };
}

/** Aviso al propietario de que ha entrado una propuesta de ciudad nueva a la
 *  cola de moderación. Enlaza directo al panel `/admin/votos.html`. */
export function buildPropuestaEmail({ ciudad, nota, email }, ownerEmail, siteUrl) {
  return {
    from: FROM_ADDRESS,
    to: [ownerEmail],
    subject: `Nueva propuesta de ciudad: ${ciudad}`,
    html: `
      <h2>Nueva propuesta de ciudad</h2>
      <ul>
        <li>Ciudad / barrio: <strong>${escapeHtml(ciudad)}</strong></li>
        <li>Nota: ${nota ? escapeHtml(nota) : '(sin nota)'}</li>
        <li>Email de quien propone: ${email ? escapeHtml(email) : '(no proporcionado)'}</li>
      </ul>
      <p>Modérala (aprobar / rechazar) en <a href="${escapeHtml(siteUrl)}/admin/votos.html">${escapeHtml(siteUrl)}/admin/votos.html</a></p>
    `,
  };
}

export async function sendEmail(payload, apiKey, fetchFn = fetch) {
  const response = await fetchFn('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error('Resend rechazó el envío del email');
  }
  return response.json();
}

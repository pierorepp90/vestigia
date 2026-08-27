// worker/src/resend.js — mismo patrón que grip-la-seu/worker/src/resend.js.
//
// vestigia.fun ya está verificado en Resend (DKIM en resend._domainkey +
// SPF/MX en send.vestigia.fun), así que se puede enviar directo desde el
// dominio propio en vez del remitente de pruebas.
import { recomendacionesDeRuta } from '../../js/recomendaciones.js';
import { rutaPorId } from '../../js/catalogo.js';

const FROM_ADDRESS = 'Vestigia <hola@vestigia.fun>';

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
function bloqueRecomendacion(emoji, etiqueta, item) {
  if (!item) return '';
  const enlace = item.url
    ? ` — <a href="${escapeHtml(item.url)}" style="color:#9c2b1f;">${item.url.replace(/^https?:\/\//, '')}</a>`
    : '';
  const nombre = item.nombre
    ? item.mapsUrl
      ? `<p style="margin:0; font-weight:600;"><a href="${escapeHtml(item.mapsUrl)}" style="color:#241a10; text-decoration:none;">📍 ${escapeHtml(item.nombre)}</a></p>`
      : `<p style="margin:0; font-weight:600;">${escapeHtml(item.nombre)}</p>`
    : '';
  return `
    <tr>
      <td style="padding:10px 0; border-bottom:1px solid #e6ddc8;">
        <p style="margin:0 0 2px; font-size:12px; letter-spacing:.05em; text-transform:uppercase; color:#83714f;">${emoji} ${escapeHtml(etiqueta)}</p>
        ${nombre}
        <p style="margin:4px 0 0; color:#4d3f2c;">${escapeHtml(item.texto)}${enlace}</p>
      </td>
    </tr>`;
}

/** Los pases oficiales de la ciudad, unificados bajo una sola cabecera
 * "🎫 Pases oficiales" en vez de repetir la etiqueta por cada pase. */
function bloquePases(pases) {
  if (!pases || pases.length === 0) return '';
  const filas = pases
    .map(
      (pase) => `
        <tr>
          <td style="padding:8px 0 8px 16px; border-bottom:1px solid #e6ddc8;">
            <p style="margin:0; font-weight:600;">${escapeHtml(pase.nombre)}</p>
            <p style="margin:4px 0 0; color:#4d3f2c;">${escapeHtml(pase.texto)} — <a href="${escapeHtml(pase.url)}" style="color:#9c2b1f;">${pase.url.replace(/^https?:\/\//, '')}</a></p>
          </td>
        </tr>`,
    )
    .join('');
  return `
    <tr>
      <td style="padding:10px 0 4px;">
        <p style="margin:0 0 4px; font-size:12px; letter-spacing:.05em; text-transform:uppercase; color:#83714f;">🎫 Pases oficiales</p>
        <table role="presentation" width="100%" style="border-collapse:collapse;">${filas}</table>
      </td>
    </tr>`;
}

/** Sección "recomendaciones gratis de la zona" del email — vacía (string
 * vacío) si la ruta no tiene datos en js/recomendaciones.js, para que las
 * ciudades sin este contenido todavía reciban el email de siempre. */
function seccionRecomendaciones(rutaId) {
  const ruta = rutaPorId(rutaId);
  const recomendaciones = recomendacionesDeRuta(rutaId, ruta?.ciudadSlug);
  if (!recomendaciones) return '';

  const filasZona = recomendaciones.zona
    ? [
        bloqueRecomendacion('📍', 'Cómo llegar', recomendaciones.zona.movilidad),
        bloqueRecomendacion('🔭', 'Mirador gratis', recomendaciones.zona.mirador),
        bloqueRecomendacion('🍽️', 'Para comer', recomendaciones.zona.comida),
      ].join('')
    : '';

  const filasPases = bloquePases(recomendaciones.pases);

  return `
    <h3 style="margin-top:28px;">Antes de ir: unas recomendaciones gratis de la zona</h3>
    <table role="presentation" width="100%" style="border-collapse:collapse;">
      ${filasZona}${filasPases}
    </table>
    <p style="font-size:12px; color:#83714f;">Esto no es publicidad pagada: son sitios que nos gustan de verdad. Comprobad horarios antes de ir, que a veces cambian.</p>
  `;
}

export function buildCustomerEmail({ rutaId, orderId, idioma, email, token, tituloRuta }, siteUrl) {
  const jugarUrl = enlaceJuego(siteUrl, rutaId, token, idioma);
  const imprimirUrl = enlaceImprimir(siteUrl, rutaId, token, idioma);

  return {
    from: FROM_ADDRESS,
    to: [email],
    subject: `Vuestro acceso a "${tituloRuta || rutaId}" — Vestigia`,
    html: `
      <h2>¡Ya tenéis acceso a vuestra ruta!</h2>
      <p>Referencia del pedido: <strong>${escapeHtml(orderId)}</strong></p>
      <p style="margin:24px 0;">
        <a href="${jugarUrl}" style="display:inline-block; background:#9c2b1f; color:#fbe9df; font-family:Arial, 'Segoe UI', sans-serif; font-weight:700; font-size:16px; text-decoration:none; padding:14px 28px; border-radius:999px;">Empezar a jugar →</a>
      </p>
      <p>Guardad este email: el enlace de arriba es vuestra llave de acceso durante un año.
         Funciona incluso sin cobertura una vez lo hayáis abierto una primera vez.</p>
      <p style="margin:16px 0 24px;">
        <a href="${imprimirUrl}" style="display:inline-block; background:transparent; color:#241a10; font-family:Arial, 'Segoe UI', sans-serif; font-weight:700; font-size:14px; text-decoration:none; padding:10px 22px; border-radius:999px; border:1px solid #241a10;">🖨️ Descargar la versión imprimible</a>
      </p>
      ${seccionRecomendaciones(rutaId)}
      <p>¡Que disfrutéis la ruta!</p>
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

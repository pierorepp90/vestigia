// worker/src/resend.js — mismo patrón que grip-la-seu/worker/src/resend.js.
//
// TODO: cambiar FROM_ADDRESS cuando se confirme el dominio definitivo (ver
// wrangler.toml). Resend exige que el dominio del remitente esté
// verificado en su panel antes de poder enviar con él.
const FROM_ADDRESS = 'Vestigia <hola@vestigia.es>';

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
      <p><a href="${jugarUrl}">Empezar a jugar →</a></p>
      <p>Guardad este email: el enlace de arriba es vuestra llave de acceso durante un año.
         Funciona incluso sin cobertura una vez lo hayáis abierto una primera vez.</p>
      <p>¿Preferís ir sin móvil? <a href="${imprimirUrl}">Descargad la versión imprimible</a>.</p>
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

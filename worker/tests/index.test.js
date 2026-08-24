// worker/tests/index.test.js
//
// Solo cubre las dos barreras de seguridad de index.js que el resto de la
// interfaz nunca puede ejercitar por sí sola (la UI siempre llama al
// endpoint correcto para cada ruta): que /api/create-checkout-session
// rechace una ruta gratis y que /api/acceso-gratuito rechace una ruta de
// pago, ambas ANTES de tocar Stripe, acuñar un token o enviar un email. El
// resto de los handlers de este router se sigue verificando a mano — esto
// es la excepción, no la norma, justificada porque el cruce ruta-de-pago /
// endpoint-gratis es imposible de alcanzar navegando la interfaz.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handleAccesoGratuito, handleCrearCheckoutSession } from '../src/index.js';

const CORS_FALSO = { 'Access-Control-Allow-Origin': '*' };

function requestFalso(cuerpo) {
  return { json: async () => cuerpo };
}

test('handleCrearCheckoutSession rechaza una ruta gratuita antes de llamar a Stripe', async () => {
  const respuesta = await handleCrearCheckoutSession(
    requestFalso({ rutaId: 'barcelona-born', idioma: 'es' }), // ruta gratis real del catálogo
    { STRIPE_SECRET_KEY: 'no-deberia-usarse', SITE_URL: 'https://vestigia.es' },
    CORS_FALSO,
  );
  assert.equal(respuesta.status, 400);
  const cuerpo = await respuesta.json();
  assert.match(cuerpo.error, /gratuita/);
});

test('handleAccesoGratuito rechaza una ruta de pago antes de acuñar token o enviar email', async () => {
  const respuesta = await handleAccesoGratuito(
    requestFalso({ rutaId: 'barcelona-gotic', idioma: 'es', email: 'cliente@example.com' }), // ruta de pago real
    { TOKEN_SECRET: 'no-deberia-usarse', RESEND_API_KEY: 'no-deberia-usarse', OWNER_EMAIL: 'owner@example.com', SITE_URL: 'https://vestigia.es' },
    CORS_FALSO,
  );
  assert.equal(respuesta.status, 400);
  const cuerpo = await respuesta.json();
  assert.match(cuerpo.error, /no es una ruta gratuita/);
});

test('handleAccesoGratuito rechaza un email con formato inválido para una ruta gratis real', async () => {
  const respuesta = await handleAccesoGratuito(
    requestFalso({ rutaId: 'barcelona-born', idioma: 'es', email: 'esto-no-es-un-email' }),
    { TOKEN_SECRET: 'no-deberia-usarse', RESEND_API_KEY: 'no-deberia-usarse', OWNER_EMAIL: 'owner@example.com', SITE_URL: 'https://vestigia.es' },
    CORS_FALSO,
  );
  assert.equal(respuesta.status, 400);
  const cuerpo = await respuesta.json();
  assert.match(cuerpo.error, /[Ee]mail/);
});

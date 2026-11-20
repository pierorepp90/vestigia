#!/usr/bin/env node
// scripts/generar-seo.mjs
//
// Alias de scripts/generar-i18n.mjs, que ahora genera TODAS las páginas de
// marketing en los cuatro idiomas (español incluido): título, descripción,
// canonical/hreflang, Open Graph, JSON-LD y el contenido completo en el HTML.
// Se conserva para que el comando de siempre siga funcionando:
//   node scripts/generar-seo.mjs && node scripts/generar-i18n.mjs
// equivale ahora a correr dos veces generar-i18n.mjs, que es idempotente.
import './generar-i18n.mjs';

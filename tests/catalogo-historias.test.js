// tests/catalogo-historias.test.js
//
// HISTORIAS (js/catalogo.js) tiene una forma distinta a CIUDADES/RUTAS:
// cada post lleva un array `secciones`, cada sección con sus propios
// campos traducibles. Este test evita que un post se añada con una
// traducción a medias o un enlace a una ruta que no existe.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HISTORIAS, RUTAS, CIUDADES, historiaPorSlug } from '../js/catalogo.js';
import { LANGS } from '../js/i18n.js';

const CAMPOS_HISTORIA = ['titulo', 'resumen', 'cierre'];
const CAMPOS_SECCION = ['titulo', 'texto'];

function assertCampoTraducido(objeto, etiqueta) {
  assert.ok(objeto && typeof objeto === 'object', `${etiqueta} no es un objeto {es,en,fr,it}`);
  for (const lang of LANGS) {
    assert.ok(typeof objeto[lang] === 'string' && objeto[lang].trim().length > 0, `${etiqueta}.${lang} está vacío o falta`);
  }
}

test('cada historia tiene los 4 idiomas, sin vacíos, en sus campos y en cada sección', () => {
  for (const historia of HISTORIAS) {
    for (const campo of CAMPOS_HISTORIA) {
      assertCampoTraducido(historia[campo], `${historia.id}.${campo}`);
    }
    assert.ok(Array.isArray(historia.secciones) && historia.secciones.length >= 4 && historia.secciones.length <= 6, `${historia.id}: debe tener entre 4 y 6 secciones`);
    historia.secciones.forEach((seccion, i) => {
      for (const campo of CAMPOS_SECCION) {
        assertCampoTraducido(seccion[campo], `${historia.id}.secciones[${i}].${campo}`);
      }
    });
  }
});

test('cada historia apunta a una ciudad y a 1-2 rutas que existen de verdad', () => {
  for (const historia of HISTORIAS) {
    assert.ok(CIUDADES.some((c) => c.slug === historia.ciudadSlug), `${historia.id}: ciudadSlug "${historia.ciudadSlug}" no existe en CIUDADES`);
    assert.ok(Array.isArray(historia.enlacesRutas) && historia.enlacesRutas.length >= 1 && historia.enlacesRutas.length <= 2, `${historia.id}: enlacesRutas debe tener 1 o 2 elementos`);
    for (const rutaId of historia.enlacesRutas) {
      assert.ok(RUTAS.some((r) => r.id === rutaId), `${historia.id}: enlacesRutas incluye "${rutaId}", que no existe en RUTAS`);
    }
  }
});

test('cierre contiene un placeholder {rutaN} por cada entrada de enlacesRutas, en los 4 idiomas', () => {
  // js/historia.js#cierreConEnlaces() sustituye {ruta1}/{ruta2} por el
  // enlace real — si el placeholder falta en algún idioma, String.replace
  // no encuentra nada que sustituir y esa ruta deja de promocionarse en
  // esa traducción, en silencio. Este test convierte ese despiste de
  // autoría en un fallo de test, no en un enlace que falta sin avisar.
  for (const historia of HISTORIAS) {
    for (const lang of LANGS) {
      historia.enlacesRutas.forEach((_, i) => {
        assert.ok(
          historia.cierre[lang].includes(`{ruta${i + 1}}`),
          `${historia.id}.cierre.${lang} no contiene el placeholder {ruta${i + 1}}`,
        );
      });
    }
  }
});

test('historiaPorSlug() encuentra por id y devuelve null si no existe', () => {
  if (HISTORIAS.length > 0) {
    assert.equal(historiaPorSlug(HISTORIAS[0].id), HISTORIAS[0]);
  }
  assert.equal(historiaPorSlug('ciudad-inventada-que-no-existe'), null);
});

// js/votar.js
// Página de votación (/votar). Idioma en runtime, como jugar/*.
import { obtenerVotacion, emitirVoto, enviarPropuesta } from './api.js';
import { aplicarI18n, detectarIdioma, t } from './i18n.js';
import { localizar } from './catalogo.js';

const CLAVE_VOTANTE = 'vestigia_voto_id';

function idVotante() {
  let id = null;
  try { id = localStorage.getItem(CLAVE_VOTANTE); } catch { /* modo privado */ }
  if (!id) {
    id = (crypto.randomUUID && crypto.randomUUID()) || `v_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    try { localStorage.setItem(CLAVE_VOTANTE, id); } catch { /* no persiste, vale igual para esta sesión */ }
  }
  return id;
}

const els = {};
const app = { lang: 'es', votante: null, estado: null };

function ref() {
  ['votar-cargando', 'votar-error', 'votar-lista', 'votar-gracias', 'votar-propuesta', 'votar-propuesta-ok', 'form-propuesta']
    .forEach((id) => { els[id] = document.getElementById(id); });
}

function mostrarError(msg) {
  els['votar-error'].textContent = msg || t(app.lang, 'votar_error_generico');
  els['votar-error'].hidden = false;
}

function pintarLista({ opciones, estadoVotante, miVoto }) {
  const votado = estadoVotante === 'voto_activo';
  const maxVotos = Math.max(1, ...opciones.map((o) => o.votos || 0));
  els['votar-lista'].innerHTML = opciones.map((o) => {
    const nombre = localizar(o.etiqueta, app.lang);
    if (!votado) {
      return `<li class="votar-opcion">
        <span class="votar-opcion__nombre">${escape(nombre)}</span>
        <button class="btn btn-lacre" data-opcion="${escape(o.id)}" data-i18n="votar_btn_votar"></button>
      </li>`;
    }
    const pct = Math.round(((o.votos || 0) / maxVotos) * 100);
    const mio = o.id === miVoto;
    return `<li class="votar-opcion ${mio ? 'votar-opcion--mio' : ''}">
      <span class="votar-opcion__nombre">${escape(nombre)}${mio ? ` — ${t(app.lang, 'votar_tu_voto')}` : ''}</span>
      <span class="votar-opcion__barra" style="flex-basis:40%"><span class="votar-opcion__relleno" style="width:${pct}%"></span></span>
      <span class="votar-opcion__votos">${o.votos || 0}</span>
    </li>`;
  }).join('');
  els['votar-lista'].hidden = false;
  aplicarI18n(els['votar-lista'], app.lang);

  els['votar-lista'].querySelectorAll('button[data-opcion]').forEach((btn) => {
    btn.addEventListener('click', () => votar(btn.dataset.opcion));
  });
}

function render() {
  const { estadoVotante } = app.estado;
  els['votar-cargando'].hidden = true;
  els['votar-gracias'].hidden = estadoVotante !== 'voto_activo';
  els['votar-propuesta'].hidden = estadoVotante !== 'sin_voto';
  els['votar-propuesta-ok'].hidden = estadoVotante !== 'propuesta_pendiente';
  if (estadoVotante === 'propuesta_pendiente') {
    els['votar-lista'].hidden = true;
  } else {
    pintarLista(app.estado);
  }
}

async function votar(opcionId) {
  els['votar-error'].hidden = true;
  els['votar-lista'].querySelectorAll('button').forEach((b) => { b.disabled = true; });
  try {
    const res = await emitirVoto(opcionId, app.votante);
    app.estado = { opciones: res.opciones, estadoVotante: 'voto_activo', miVoto: res.miVoto };
    render();
  } catch (e) {
    mostrarError(e.message);
    els['votar-lista'].querySelectorAll('button').forEach((b) => { b.disabled = false; });
  }
}

async function enviarFormPropuesta(evento) {
  evento.preventDefault();
  els['votar-error'].hidden = true;
  const datos = new FormData(els['form-propuesta']);
  const boton = els['form-propuesta'].querySelector('button');
  boton.disabled = true;
  try {
    await enviarPropuesta({
      ciudad: (datos.get('ciudad') || '').trim(),
      nota: (datos.get('nota') || '').trim() || null,
      email: (datos.get('email') || '').trim() || null,
      votante: app.votante,
    });
    app.estado = { ...app.estado, estadoVotante: 'propuesta_pendiente' };
    render();
  } catch (e) {
    mostrarError(e.message);
    boton.disabled = false;
  }
}

function escape(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

async function init() {
  ref();
  app.lang = detectarIdioma();
  document.documentElement.lang = app.lang;
  aplicarI18n(document, app.lang);
  app.votante = idVotante();
  els['form-propuesta'].addEventListener('submit', enviarFormPropuesta);
  try {
    app.estado = await obtenerVotacion(app.votante);
    render();
  } catch (e) {
    els['votar-cargando'].hidden = true;
    mostrarError(e.message);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// js/admin-votos.js — panel de moderación de propuestas. Sin i18n.
import { API_BASE_URL } from './config.js';

const CLAVE_SESION = 'vestigia_admin_clave';
const els = {};
['form-clave', 'clave', 'msg', 'lista'].forEach((id) => { els[id] = document.getElementById(id); });

function auth() {
  return { Authorization: `Bearer ${sessionStorage.getItem(CLAVE_SESION) || ''}` };
}

function msg(texto, error = false) {
  els.msg.textContent = texto;
  els.msg.hidden = !texto;
  els.msg.style.color = error ? '#9c2b1f' : '#2e7d32';
}

function fecha(ms) {
  const d = new Date(ms);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('es-ES');
}

async function cargar() {
  try {
    const res = await fetch(new URL('/api/admin/propuestas', API_BASE_URL), { headers: auth() });
    if (res.status === 401) {
      sessionStorage.removeItem(CLAVE_SESION);
      els['form-clave'].hidden = false;
      els.lista.hidden = true;
      msg('Frase secreta incorrecta.', true);
      return;
    }
    if (!res.ok) {
      msg('No se ha podido cargar. Reintenta.', true);
      return;
    }
    const { propuestas } = await res.json();
    els['form-clave'].hidden = true;
    msg(propuestas.length ? '' : 'No hay propuestas pendientes.');
    els.lista.hidden = false;
    els.lista.innerHTML = propuestas.map((p) => `
      <li class="votar-opcion" data-id="${escape(p.id)}">
        <span class="votar-opcion__nombre">
          ${escape(p.etiqueta.es || p.id)}
          ${p.nota ? `<br><small>${escape(p.nota)}</small>` : ''}
          ${p.email ? `<br><small>${escape(p.email)}</small>` : ''}
          ${p.creada_en ? `<br><small>${escape(fecha(p.creada_en))}</small>` : ''}
        </span>
        <button class="btn btn-lacre" data-accion="aprobar">Aprobar</button>
        <button class="btn btn-fantasma" data-accion="rechazar">Rechazar</button>
      </li>`).join('');
    els.lista.querySelectorAll('button[data-accion]').forEach((b) => {
      b.addEventListener('click', () => moderar(b.closest('li').dataset.id, b.dataset.accion));
    });
  } catch (e) {
    console.warn(e.message);
    msg('No se ha podido cargar. Reintenta.', true);
  }
}

async function moderar(id, accion) {
  const res = await fetch(new URL(`/api/admin/propuestas/${id}`, API_BASE_URL), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...auth() },
    body: JSON.stringify({ accion }),
  });
  if (!res.ok) { msg(`Error ${res.status}`, true); return; }
  cargar();
}

function escape(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

els['form-clave'].addEventListener('submit', (e) => {
  e.preventDefault();
  sessionStorage.setItem(CLAVE_SESION, els.clave.value);
  cargar();
});

if (sessionStorage.getItem(CLAVE_SESION)) cargar();

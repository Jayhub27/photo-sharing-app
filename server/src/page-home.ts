import { layout } from './ui.js'

export function homePage(apiBase: string): string {
  const body = `
<a class="skip-link" href="#main">Skip to content</a>
<div id="toast-container" aria-live="polite" role="status"></div>
<div class="topbar">
  <div class="topbar-inner">
    <a class="nav-logo" href="/"><div class="logo-icon"><i class="ico ico-camera"></i></div><div class="logo-text">Take the shot</div></a>
    <div class="topbar-actions" id="navRight"></div>
  </div>
</div>
<div class="wrap" id="main">
  <div id="authed" class="hidden">
    <div class="hero">
      <h1>Collections</h1>
      <p class="sub">Add photos, share a QR code, or set a price and let Stripe handle the sale.</p>
      <form class="create-bar" id="createForm">
        <input type="text" id="name" placeholder="Name a new collection" autocomplete="off" aria-label="New collection name">
        <button class="btn" type="submit"><i class="ico ico-plus"></i>Create</button>
      </form>
    </div>
    <div class="section-label">Your collections</div>
    <div class="controls">
      <input type="search" id="search" placeholder="Search collections" aria-label="Search collections" style="flex:1;min-width:170px">
      <select id="sortSelect" aria-label="Sort collections">
        <option value="newest">Newest</option>
        <option value="name">Name A\u2013Z</option>
      </select>
      <div class="chips" role="group" aria-label="Filter collections">
        <button class="chip active" data-filter="all" type="button">All</button>
        <button class="chip" data-filter="owned" type="button">Owned</button>
        <button class="chip" data-filter="shared" type="button">Shared</button>
      </div>
      <button class="icon-btn" id="viewToggle" type="button" aria-label="Toggle grid or list view" style="margin-left:auto"></button>
    </div>
    <div id="list"></div>
    <div class="load-wrap"><button class="btn outline small hidden" id="loadMore">Load more</button></div>
  </div>
  <div id="guest" class="hidden">
    <div class="hero" style="text-align:center;margin:0 auto;padding-top:clamp(48px,9vw,96px)">
      <h1>Your photos, shared or sold.</h1>
      <p class="sub" style="margin:12px auto 28px">Free to share with a QR code. Add a price whenever you want to sell the originals \u2014 buyers pay by card and downloads unlock instantly.</p>
      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
        <a class="btn" href="/signup">Create an account</a>
        <a class="btn outline" href="/login">Log in</a>
      </div>
    </div>
  </div>
</div>
`

  const script = `
const BASE = ${JSON.stringify(apiBase)};
let currentUser = null;
async function checkAuth() {
  try {
    const res = await fetch(BASE + '/api/auth/me', { credentials: 'include' });
    if (res.ok) {
      const { user } = await res.json();
      currentUser = user;
      document.getElementById('authed').classList.remove('hidden');
      document.getElementById('navRight').innerHTML =
        '<span class="nav-user">Hi, <strong>' + esc(user.name) + '</strong></span>' +
        '<button class="btn small outline" onclick="logout()">Log out</button>';
      load();
    } else {
      document.getElementById('guest').classList.remove('hidden');
      document.getElementById('navRight').innerHTML =
        '<a class="btn small ghost" href="/login">Log in</a>' +
        '<a class="btn small" href="/signup">Sign up</a>';
    }
  } catch {
    document.getElementById('guest').classList.remove('hidden');
  }
}
async function logout() {
  await fetch(BASE + '/api/auth/logout', { method: 'POST' });
  window.location.href = '/login';
}
let offset = 0, limit = 12, total = 0, q = '', sort = 'newest', filter = 'all', view = 'list';
try {
  sort = localStorage.getItem('tts.sort') || 'newest';
  filter = localStorage.getItem('tts.filter') || 'all';
  view = localStorage.getItem('tts.view') || 'list';
} catch (e) {}
function applyView() {
  const el = document.getElementById('list');
  if (el) el.className = 'card-list' + (view === 'grid' ? ' grid' : '');
  const btn = document.getElementById('viewToggle');
  if (btn) btn.innerHTML = '<i class="ico ' + (view === 'grid' ? 'ico-list' : 'ico-grid') + '"></i>';
}
async function load(append) {
  const el = document.getElementById('list');
  if (!append) { offset = 0; el.className = ''; el.innerHTML = '<div class="skeleton-card"></div><div class="skeleton-card"></div><div class="skeleton-card"></div>'; }
  try {
    const res = await fetch(BASE + '/api/collections?q=' + encodeURIComponent(q) + '&limit=' + limit + '&offset=' + offset + '&sort=' + sort + '&filter=' + filter, { credentials: 'include' });
    if (res.status === 401) { window.location.href = '/login'; return; }
    const data = await res.json();
    const collections = data.collections;
    total = data.total;
    if (!collections.length) {
      document.getElementById('loadMore').classList.add('hidden');
      const msg = q ? 'No collections match that search.' : filter === 'shared' ? 'Nothing has been shared with you yet.' : filter === 'owned' ? 'You have not made a collection yet.' : 'No collections yet. Create one above.';
      el.innerHTML = '<div class="empty"><i class="ico ico-folder"></i><div class="empty-text">' + msg + '</div></div>';
      return;
    }
    applyView();
    const html = collections.map((c, i) =>
      '<a class="card" href="/c/' + c.id + '" style="animation-delay:' + (i * 40) + 'ms">' +
        '<div class="card-left">' +
          '<div class="card-thumb">' + (c.cover_filename ? '<img src="' + BASE + '/api/photos/' + c.cover_filename + '?thumb=1" alt="" loading="lazy">' : '<i class="ico ico-image"></i>') + '</div>' +
          '<div class="card-info">' +
            '<div class="card-title"><span class="nm">' + esc(c.name) + '</span>' +
              (c.price_cents ? '<span class="badge price">' + esc(money(c.price_cents, c.currency)) + '</span>' : '') +
              (c.is_public === false ? '<span class="badge"><i class="ico ico-lock"></i>Private</span>' : '') +
              (c.role && c.role !== 'owner' ? '<span class="badge ' + c.role + '">' + esc(c.role) + '</span>' : '') +
            '</div>' +
            '<div class="card-sub">' + c.photo_count + ' photo' + (c.photo_count === 1 ? '' : 's') + '</div>' +
          '</div>' +
        '</div>' +
        '<span class="card-arrow"><i class="ico ico-arrow"></i></span>' +
      '</a>'
    ).join('');
    if (append) el.insertAdjacentHTML('beforeend', html); else el.innerHTML = html;
    offset += collections.length;
    const lm = document.getElementById('loadMore');
    lm.classList.toggle('hidden', !data.hasMore);
    lm.textContent = 'Load more (' + offset + ' of ' + total + ')';
  } catch {
    el.innerHTML = '<div class="empty"><i class="ico ico-alert"></i><div class="empty-text">Could not reach the server.<br><button class="btn small outline" style="margin-top:14px" onclick="load()">Try again</button></div></div>';
  }
}
document.getElementById('createForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const input = document.getElementById('name');
  const name = input.value.trim();
  if (!name) { toast('Give the collection a name', 'error'); return; }
  const btn = e.target.querySelector('button');
  btn.innerHTML = '<span class="spinner"></span>';
  btn.disabled = true;
  try {
    const res = await fetch(BASE + '/api/collections', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ name }) });
    if (res.status === 401) { window.location.href = '/login'; return; }
    const { id } = await res.json();
    toast('Collection created', 'success');
    setTimeout(() => window.location.href = '/c/' + id, 350);
  } catch {
    toast('Could not create the collection', 'error');
    btn.innerHTML = '<i class="ico ico-plus"></i>Create'; btn.disabled = false;
  }
});
const searchInput = document.getElementById('search');
let searchTimer;
searchInput.addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => { q = searchInput.value.trim(); load(false); }, 300);
});
document.getElementById('loadMore').addEventListener('click', () => load(true));
const sortSelect = document.getElementById('sortSelect');
sortSelect.value = sort;
sortSelect.addEventListener('change', () => {
  sort = sortSelect.value;
  try { localStorage.setItem('tts.sort', sort); } catch (e) {}
  load(false);
});
document.querySelectorAll('.chip').forEach((ch) => {
  ch.classList.toggle('active', ch.dataset.filter === filter);
  ch.addEventListener('click', () => {
    filter = ch.dataset.filter;
    document.querySelectorAll('.chip').forEach((c) => c.classList.toggle('active', c === ch));
    try { localStorage.setItem('tts.filter', filter); } catch (e) {}
    load(false);
  });
});
document.getElementById('viewToggle').addEventListener('click', () => {
  view = view === 'grid' ? 'list' : 'grid';
  try { localStorage.setItem('tts.view', view); } catch (e) {}
  applyView();
});
applyView();
checkAuth();
`

  return layout('Take the shot', '', body, script)
}

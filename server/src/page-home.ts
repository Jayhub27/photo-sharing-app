import { layout } from './ui.js'

export function homePage(apiBase: string): string {
  const body = `
<a class="skip-link" href="#main">Skip to content</a>
<div id="toast-container" aria-live="polite" role="status"></div>
<div class="wrap" id="main">
  <div class="nav topbar" style="border:none;background:transparent;margin-bottom:8px">
    <div class="topbar-inner" style="padding:14px 0">
      <a class="nav-logo" href="/"><div class="logo-icon">\ud83d\udcf8</div><div class="logo-text">Take the shot</div></a>
      <div class="nav-right topbar-actions" id="navRight"></div>
    </div>
  </div>
  <div id="authed" class="hidden">
    <div class="hero">
      <h1>Share, <span class="grad">and sell</span>, your shots</h1>
      <p class="sub">Create a collection, add your photos, then share a QR code — or put a price on it and get paid with Stripe when people buy your originals.</p>
      <form class="create-bar" id="createForm">
        <input type="text" id="name" placeholder="Collection name (e.g. Iceland Trip)" autocomplete="off">
        <button class="btn" type="submit">Create</button>
      </form>
    </div>
    <div class="section-label">Your Collections</div>
    <div class="search-bar controls">
      <input type="search" id="search" placeholder="Search collections by name..." style="flex:1;min-width:180px;background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:12px 14px;font-size:16px;color:var(--text);min-height:46px">
    </div>
    <div class="controls">
      <select id="sortSelect" aria-label="Sort collections">
        <option value="newest">Newest first</option>
        <option value="name">Name (A\u2013Z)</option>
      </select>
      <div class="chips" role="group" aria-label="Filter collections">
        <button class="chip active" data-filter="all" type="button">All</button>
        <button class="chip" data-filter="owned" type="button">Owned</button>
        <button class="chip" data-filter="shared" type="button">Shared</button>
      </div>
      <button class="icon-btn" id="viewToggle" type="button" aria-label="Toggle grid or list view">\u25a6</button>
    </div>
    <div id="list"></div>
    <div class="load-wrap"><button class="btn outline small hidden" id="loadMore">Load more</button></div>
  </div>
  <div id="guest" class="hidden">
    <div class="hero" style="text-align:center;padding-top:clamp(40px,8vw,90px)">
      <h1>Share a QR. <span class="grad">Sell the originals.</span></h1>
      <p class="sub" style="margin:0 auto 32px">Take the shot is a paid photo-sharing service: drop your photos in a collection, send a QR code to friends, or set a price and let Stripe handle checkout and payouts.</p>
      <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
        <a class="btn" href="/signup">Start free</a>
        <a class="btn outline" href="/login">Log in</a>
      </div>
      <div class="note" style="max-width:560px;margin:32px auto 0;text-align:left">
        <span><strong>Free to share.</strong> Add a price only if you want to sell your shots \u2014 buyers pay with card, downloads unlock instantly.</span>
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
        '<a class="btn small outline" href="/login">Log in</a>' +
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
  if (btn) btn.textContent = view === 'grid' ? '\\u2630' : '\\u25a6';
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
      el.innerHTML = '<div class="empty"><div class="empty-icon">\\ud83d\\udcc2</div><div class="empty-text">' + (q ? 'No collections match your search.' : filter === 'shared' ? 'No collections are shared with you yet.' : filter === 'owned' ? 'You have not created any collections yet.' : 'No collections yet.<br>Create one above to get started.') + '</div></div>';
      return;
    }
    applyView();
    const html = collections.map((c, i) =>
      '<a class="card" href="/c/' + c.id + '" style="animation-delay:' + (i * 60) + 'ms">' +
        '<div class="card-left">' +
          '<div class="card-thumb">' + (c.cover_thumb_filename ? '<img src="' + BASE + '/api/photos/' + c.cover_thumb_filename + '?thumb=1" alt="" loading="lazy">' : '\\ud83d\\udcc1') + '</div>' +
          '<div class="card-info">' +
            '<div class="card-title">' + esc(c.name) +
              (c.price_cents ? '<span class="badge price">' + esc(money(c.price_cents, c.currency)) + '</span>' : '') +
              (c.is_public === false ? '<span class="badge">\\ud83d\\udd12 private</span>' : '') +
              (c.role && c.role !== 'owner' ? '<span class="badge ' + c.role + '">' + c.role + '</span>' : '') +
            '</div>' +
            '<div class="card-sub">' + c.photo_count + ' photo' + (c.photo_count === 1 ? '' : 's') + '</div>' +
          '</div>' +
        '</div>' +
        '<span class="card-arrow">\\u203a</span>' +
      '</a>'
    ).join('');
    if (append) el.insertAdjacentHTML('beforeend', html); else el.innerHTML = html;
    offset += collections.length;
    const lm = document.getElementById('loadMore');
    lm.classList.toggle('hidden', !data.hasMore);
    lm.textContent = 'Load more (' + offset + '/' + total + ')';
  } catch {
    el.innerHTML = '<div class="empty"><div class="empty-icon">\\u26a0\\ufe0f</div><div class="empty-text">Could not reach server.<br><button class="btn small" style="margin-top:16px" onclick="load()">Retry</button></div></div>';
  }
}
document.getElementById('createForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const input = document.getElementById('name');
  const name = input.value.trim();
  if (!name) { toast('Enter a collection name', 'error'); return; }
  const btn = e.target.querySelector('button');
  btn.innerHTML = '<span class="spinner"></span>';
  btn.disabled = true;
  try {
    const res = await fetch(BASE + '/api/collections', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ name }) });
    if (res.status === 401) { window.location.href = '/login'; return; }
    const { id } = await res.json();
    toast('Collection created', 'success');
    setTimeout(() => window.location.href = '/c/' + id, 400);
  } catch {
    toast('Could not create collection', 'error');
    btn.innerHTML = 'Create'; btn.disabled = false;
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
const viewToggle = document.getElementById('viewToggle');
viewToggle.addEventListener('click', () => {
  view = view === 'grid' ? 'list' : 'grid';
  try { localStorage.setItem('tts.view', view); } catch (e) {}
  applyView();
});
applyView();
checkAuth();
`

  return layout('Take the shot \u00b7 Share and sell your photos', '', body, script)
}

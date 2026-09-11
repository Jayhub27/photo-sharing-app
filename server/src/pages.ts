const SHARED_CSS = `
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --bg:#0a0a0f;--surface:#13131a;--surface2:#1a1a24;--border:rgba(255,255,255,.08);
  --text:#f1f5f9;--muted:#94a3b8;--accent:#6366f1;--accent2:#a855f7;--accent3:#ec4899;
  --grad:linear-gradient(135deg,#6366f1 0%,#a855f7 50%,#ec4899 100%);
  --grad-soft:linear-gradient(135deg,rgba(99,102,241,.15),rgba(168,85,247,.15),rgba(236,72,153,.15));
  --radius:16px;--shadow:0 8px 32px rgba(0,0,0,.4);--shadow-lg:0 24px 64px rgba(0,0,0,.5);
  --transition:cubic-bezier(.22,1,.36,1);
}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;background:var(--bg);color:var(--text);min-height:100vh;overflow-x:hidden}
body::before{content:'';position:fixed;inset:0;background:radial-gradient(ellipse at top left,rgba(99,102,241,.12),transparent 50%),radial-gradient(ellipse at bottom right,rgba(236,72,153,.08),transparent 50%);pointer-events:none;z-index:0}
.wrap{max-width:720px;margin:0 auto;padding:0 20px;position:relative;z-index:1}
/* Animations */
@keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes scaleIn{from{opacity:0;transform:scale(.92)}to{opacity:1;transform:scale(1)}}
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
@keyframes slideDown{from{opacity:0;max-height:0;transform:translateY(-8px)}to{opacity:1;max-height:600px;transform:translateY(0)}}
@keyframes toastIn{from{opacity:0;transform:translateY(20px) scale(.95)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes glow{0%,100%{box-shadow:0 0 20px rgba(99,102,241,.3)}50%{box-shadow:0 0 40px rgba(168,85,247,.5)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes progressGrow{from{width:0}to{width:100%}}
/* Components */
.hero{padding:48px 0 32px;animation:fadeUp .6s var(--transition)}
.logo{display:flex;align-items:center;gap:12px;margin-bottom:28px}
.logo-icon{width:44px;height:44px;border-radius:12px;background:var(--grad);display:flex;align-items:center;justify-content:center;font-size:22px;box-shadow:0 4px 20px rgba(99,102,241,.4)}
.logo-text{font-size:22px;font-weight:700;letter-spacing:-.5px}
h1{font-size:34px;font-weight:800;letter-spacing:-1.5px;line-height:1.15;margin-bottom:8px}
h1 .grad{background:var(--grad);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.sub{color:var(--muted);font-size:16px;line-height:1.6;margin-bottom:32px;max-width:520px}
.create-bar{display:flex;gap:10px;margin-bottom:32px;animation:fadeUp .6s .1s var(--transition) both}
.create-bar input{flex:1;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:16px 20px;font-size:16px;color:var(--text);transition:border-color .3s var(--transition),box-shadow .3s var(--transition)}
.create-bar input:focus{outline:none;border-color:var(--accent);box-shadow:0 0 0 3px rgba(99,102,241,.2)}
.create-bar input::placeholder{color:#64748b}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;background:var(--grad);color:#fff;border:none;padding:16px 28px;border-radius:var(--radius);font-size:15px;font-weight:600;cursor:pointer;text-decoration:none;transition:transform .2s var(--transition),box-shadow .2s var(--transition);white-space:nowrap}
.btn:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(99,102,241,.35)}
.btn:active{transform:translateY(0)}
.btn.outline{background:transparent;border:1.5px solid var(--border);color:var(--text)}
.btn.outline:hover{border-color:var(--accent);box-shadow:0 4px 16px rgba(99,102,241,.2)}
.btn.danger{background:rgba(239,68,68,.15);color:#f87171;border:1px solid rgba(239,68,68,.3)}
.btn.danger:hover{background:rgba(239,68,68,.25)}
.btn.small{padding:10px 18px;font-size:14px}
.section-label{font-size:13px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:16px;animation:fadeIn .4s .2s both}
/* Collection cards */
.card-list{display:flex;flex-direction:column;gap:12px;padding-bottom:48px}
.card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:20px 24px;text-decoration:none;color:inherit;display:flex;align-items:center;justify-content:space-between;transition:transform .25s var(--transition),border-color .25s var(--transition),box-shadow .25s var(--transition);animation:fadeUp .5s var(--transition) both}
.card:hover{transform:translateY(-3px);border-color:rgba(99,102,241,.3);box-shadow:var(--shadow)}
.card-left{display:flex;align-items:center;gap:16px;flex:1;min-width:0}
.card-thumb{width:52px;height:52px;border-radius:12px;background:var(--grad-soft);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0}
.card-info{min-width:0}
.card-title{font-size:17px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.card-sub{font-size:14px;color:var(--muted);margin-top:3px}
.card-arrow{color:var(--muted);font-size:20px;transition:transform .25s var(--transition),color .25s}
.card:hover .card-arrow{transform:translateX(4px);color:var(--accent)}
/* Empty state */
.empty{text-align:center;padding:64px 24px;animation:fadeIn .4s}
.empty-icon{font-size:56px;margin-bottom:16px;opacity:.4}
.empty-text{color:var(--muted);font-size:16px;line-height:1.6}
/* Skeleton */
.skeleton-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:20px 24px;height:72px;overflow:hidden;position:relative}
.skeleton-card::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,.04),transparent);background-size:200% 100%;animation:shimmer 1.5s infinite}
/* Back link */
.back{display:inline-flex;align-items:center;gap:6px;color:var(--muted);text-decoration:none;font-size:14px;font-weight:500;margin-bottom:24px;transition:color .2s}
.back:hover{color:var(--text)}
/* Collection header */
.col-header{animation:fadeUp .5s var(--transition)}
.col-header h1{font-size:28px}
.col-stats{display:flex;gap:16px;margin-bottom:28px}
.stat-chip{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:8px 16px;font-size:14px;color:var(--muted)}
.stat-chip strong{color:var(--text);font-weight:600}
/* Action buttons */
.actions{display:flex;gap:12px;margin-bottom:24px;flex-wrap:wrap}
.actions .btn{flex:1;min-width:140px}
/* Collapsible sections */
.section{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);margin-bottom:20px;overflow:hidden;animation:slideDown .35s var(--transition)}
.section-head{padding:20px 24px;display:flex;align-items:center;justify-content:space-between;cursor:pointer;user-select:none}
.section-head h2{font-size:17px;font-weight:600;display:flex;align-items:center;gap:10px}
.section-head .chev{color:var(--muted);transition:transform .3s var(--transition)}
.section.open .chev{transform:rotate(180deg)}
.section-body{padding:0 24px 24px;overflow:hidden}
.section-body.anim{animation:slideDown .3s var(--transition)}
/* Upload zone */
.dropzone{border:2px dashed var(--border);border-radius:14px;padding:36px 24px;text-align:center;transition:border-color .25s,background .25s;cursor:pointer}
.dropzone:hover,.dropzone.drag{border-color:var(--accent);background:rgba(99,102,241,.06)}
.dropzone-icon{font-size:40px;margin-bottom:12px;opacity:.6}
.dropzone-text{color:var(--muted);font-size:15px}
.dropzone-text strong{color:var(--text)}
.dropzone input{display:none}
/* Progress bar */
.progress{height:6px;background:var(--surface2);border-radius:3px;overflow:hidden;margin-top:16px}
.progress-bar{height:100%;background:var(--grad);border-radius:3px;transition:width .3s ease}
/* Photo grid */
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:24px}
.photo-wrap{position:relative;aspect-ratio:1;border-radius:10px;overflow:hidden;border:1px solid var(--border);animation:scaleIn .4s var(--transition) both;cursor:pointer}
.photo-wrap img{width:100%;height:100%;object-fit:cover;transition:transform .3s var(--transition)}
.photo-wrap:hover img{transform:scale(1.08)}
.photo-wrap:hover .photo-overlay{opacity:1}
.photo-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.7) 0%,transparent 60%);opacity:0;transition:opacity .25s var(--transition);display:flex;align-items:flex-end;justify-content:flex-end;padding:8px;gap:6px}
.photo-btn{width:34px;height:34px;border-radius:9px;border:none;background:rgba(255,255,255,.15);backdrop-filter:blur(8px);color:#fff;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s,transform .15s}
.photo-btn:hover{background:rgba(255,255,255,.3);transform:scale(1.1)}
.photo-btn.danger:hover{background:rgba(239,68,68,.7)}
/* QR */
.qr-wrap{text-align:center;padding:8px 0}
.qr-wrap img{width:260px;height:260px;border-radius:20px;border:1px solid var(--border);animation:scaleIn .4s var(--transition),glow 3s ease-in-out infinite}
.share-link{display:flex;gap:8px;margin-top:20px;align-items:center}
.share-link input{flex:1;background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:12px 14px;font-size:14px;color:var(--muted)}
.copy-btn{background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:12px 16px;color:var(--text);cursor:pointer;font-size:14px;transition:background .2s}
.copy-btn:hover{background:rgba(99,102,241,.15)}
/* Lightbox */
.lightbox{position:fixed;inset:0;background:rgba(0,0,0,.92);display:none;align-items:center;justify-content:center;z-index:100;animation:fadeIn .2s}
.lightbox.open{display:flex}
.lightbox img{max-width:92vw;max-height:88vh;border-radius:12px;animation:scaleIn .3s var(--transition)}
.lightbox-close{position:absolute;top:20px;right:20px;width:44px;height:44px;border-radius:12px;background:rgba(255,255,255,.1);border:none;color:#fff;font-size:22px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s}
.lightbox-close:hover{background:rgba(255,255,255,.2)}
/* Toast */
#toast-container{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:200;display:flex;flex-direction:column;gap:8px;align-items:center}
.toast{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:14px 24px;font-size:15px;box-shadow:var(--shadow-lg);animation:toastIn .3s var(--transition);display:flex;align-items:center;gap:10px}
.toast.success{border-color:rgba(34,197,94,.3)}
.toast.success .dot{color:#22c55e}
.toast.error{border-color:rgba(239,68,68,.3)}
.toast.error .dot{color:#ef4444}
.toast .dot{font-size:18px}
/* Spinner */
.spinner{width:24px;height:24px;border:2.5px solid rgba(255,255,255,.2);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite}
.spinner.dark{border-color:rgba(99,102,241,.2);border-top-color:var(--accent)}
/* Hidden */
.hidden{display:none!important}
/* Responsive */
@media(max-width:480px){h1{font-size:26px}.grid{grid-template-columns:repeat(2,1fr)}.wrap{padding:0 16px}.create-bar{flex-direction:column}.create-bar .btn{width:100%}}
/* Search + load more + members */
.search-bar{display:flex;gap:10px;margin-bottom:20px;animation:fadeIn .3s}
.search-bar input{flex:1;background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:13px 16px;font-size:15px;color:var(--text);transition:border-color .3s,box-shadow .3s}
.search-bar input:focus{outline:none;border-color:var(--accent);box-shadow:0 0 0 3px rgba(99,102,241,.2)}
.load-wrap{text-align:center;padding:8px 0 48px}
.badge{display:inline-block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;padding:3px 8px;border-radius:999px;background:var(--surface2);border:1px solid var(--border);color:var(--muted);margin-left:8px}
.badge.owner{color:#a5b4fc;border-color:rgba(99,102,241,.4)}
.badge.editor{color:#86efac;border-color:rgba(34,197,94,.35)}
.member-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 0;border-bottom:1px solid var(--border)}
.member-row:last-child{border-bottom:none}
.member-name{font-weight:600;font-size:15px}
.member-email{font-size:13px;color:var(--muted)}
select.copy-btn{min-width:110px;background:var(--surface2);color:var(--text)}
.live-dot{width:9px;height:9px;border-radius:50%;background:#22c55e;align-self:center;animation:pulse 2s infinite}
/* Nav bar */
.nav{display:flex;align-items:center;justify-content:space-between;padding:20px 0;animation:fadeIn .3s}
.nav-logo{display:flex;align-items:center;gap:10px;text-decoration:none;color:var(--text)}
.nav-logo .logo-icon{width:36px;height:36px;border-radius:10px;font-size:18px}
.nav-logo .logo-text{font-size:18px;font-weight:700}
.nav-right{display:flex;align-items:center;gap:12px}
.nav-user{font-size:14px;color:var(--muted)}
.nav-user strong{color:var(--text);font-weight:600}
/* Auth pages */
.auth-wrap{max-width:400px;margin:0 auto;padding:24px 20px;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;z-index:1}
.auth-card{width:100%;background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:36px 32px;animation:fadeUp .5s var(--transition);box-shadow:var(--shadow)}
.auth-logo{width:56px;height:56px;border-radius:16px;background:var(--grad);display:flex;align-items:center;justify-content:center;font-size:28px;margin:0 auto 24px;box-shadow:0 4px 24px rgba(99,102,241,.4)}
.auth-title{font-size:24px;font-weight:800;text-align:center;margin-bottom:6px;letter-spacing:-.5px}
.auth-sub{color:var(--muted);font-size:15px;text-align:center;margin-bottom:28px}
.auth-field{margin-bottom:16px}
.auth-field label{display:block;font-size:13px;font-weight:600;color:var(--muted);margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px}
.auth-field input{width:100%;background:var(--surface2);border:1px solid var(--border);border-radius:12px;padding:14px 16px;font-size:16px;color:var(--text);transition:border-color .3s,box-shadow .3s}
.auth-field input:focus{outline:none;border-color:var(--accent);box-shadow:0 0 0 3px rgba(99,102,241,.2)}
.auth-field input::placeholder{color:#64748b}
.auth-btn{width:100%;margin-top:8px}
.auth-footer{text-align:center;margin-top:24px;font-size:15px;color:var(--muted)}
.auth-footer a{color:var(--accent);text-decoration:none;font-weight:600}
.auth-footer a:hover{text-decoration:underline}
.auth-back{display:inline-flex;align-items:center;gap:6px;color:var(--muted);text-decoration:none;font-size:14px;margin-bottom:20px;transition:color .2s}
.auth-back:hover{color:var(--text)}
`

function TOAST_JS(): string {
  return `
function toast(msg, type) {
  let c = document.getElementById('toast-container');
  if (!c) { c = document.createElement('div'); c.id = 'toast-container'; document.body.appendChild(c); }
  const t = document.createElement('div');
  t.className = 'toast ' + (type||'');
  const icon = type === 'success' ? '\\u2713' : type === 'error' ? '\\u2717' : '\\u2022';
  t.innerHTML = '<span class="dot">' + icon + '</span><span>' + esc(msg) + '</span>';
  c.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateY(10px)'; t.style.transition = 'all .3s'; setTimeout(() => t.remove(), 300); }, 3000);
}
function esc(s) { return String(s).replace(/[<>&"']/g, c => ({ '<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#39;' }[c])); }
`
}

export function homePage(apiBase: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>PhotoShare</title>
<style>${SHARED_CSS}</style>
</head>
<body>
<div id="toast-container"></div>
<div class="wrap">
  <div class="nav">
    <a class="nav-logo" href="/"><div class="logo-icon">\\ud83d\\udcf7</div><div class="logo-text">PhotoShare</div></a>
    <div class="nav-right" id="navRight"></div>
  </div>
  <div id="authed" class="hidden">
    <div class="hero">
      <h1>Share photos with a <span class="grad">QR code</span></h1>
      <p class="sub">Create a collection, add your photos, and share a QR code. Anyone who scans it instantly sees your gallery.</p>
      <form class="create-bar" id="createForm">
        <input type="text" id="name" placeholder="Collection name (e.g. Iceland Trip)" autocomplete="off">
        <button class="btn" type="submit">Create</button>
      </form>
    </div>
    <div class="section-label">Your Collections</div>
    <div class="search-bar"><input type="search" id="search" placeholder="Search collections by name..."></div>
    <div id="list"></div>
    <div class="load-wrap"><button class="btn outline small hidden" id="loadMore">Load more</button></div>
  </div>
  <div id="guest" class="hidden">
    <div class="hero" style="text-align:center;padding-top:80px">
      <h1>Share photos with a <span class="grad">QR code</span></h1>
      <p class="sub" style="margin:0 auto 32px">Create a collection, add your photos, and share a QR code. Anyone who scans it instantly sees your gallery \\u2014 no app required.</p>
      <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
        <a class="btn" href="/signup">Get Started</a>
        <a class="btn outline" href="/login">Log in</a>
      </div>
    </div>
  </div>
</div>
<script>
const BASE = ${JSON.stringify(apiBase)};
${TOAST_JS()}
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
let offset = 0, limit = 12, total = 0, q = '';
async function load(append) {
  const el = document.getElementById('list');
  if (!append) { offset = 0; el.className = ''; el.innerHTML = '<div class="skeleton-card"></div><div class="skeleton-card"></div><div class="skeleton-card"></div>'; }
  try {
    const res = await fetch(BASE + '/api/collections?q=' + encodeURIComponent(q) + '&limit=' + limit + '&offset=' + offset, { credentials: 'include' });
    if (res.status === 401) { window.location.href = '/login'; return; }
    const data = await res.json();
    const collections = data.collections;
    total = data.total;
    if (!collections.length) {
      el.innerHTML = '<div class="empty"><div class="empty-icon">\\ud83d\\udcc2</div><div class="empty-text">No collections yet.<br>Create one above to get started.</div></div>';
      return;
    }
    el.className = 'card-list';
    const html = collections.map((c, i) =>
      '<a class="card" href="/c/' + c.id + '" style="animation-delay:' + (i * 60) + 'ms">' +
        '<div class="card-left">' +
          '<div class="card-thumb">\\ud83d\\udcc1</div>' +
          '<div class="card-info">' +
            '<div class="card-title">' + esc(c.name) + (c.role && c.role !== 'owner' ? '<span class="badge ' + c.role + '">' + c.role + '</span>' : '') + '</div>' +
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
checkAuth();
</script>
</body>
</html>`
}

export function collectionPage(id: string, apiBase: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>PhotoShare</title>
<style>${SHARED_CSS}</style>
</head>
<body>
<div id="toast-container"></div>
<div class="lightbox" id="lightbox">
  <button class="lightbox-close" onclick="closeLightbox()">\\u2715</button>
  <img id="lightboxImg" alt="">
</div>
<div class="wrap">
  <div class="nav">
    <a class="nav-logo" href="/"><div class="logo-icon">\\ud83d\\udcf7</div><div class="logo-text">PhotoShare</div></a>
    <div class="nav-right" id="navRight"></div>
  </div>
  <a class="back" href="/">&larr; All collections</a>
  <div class="col-header">
    <h1 id="title"><span class="spinner dark" style="width:20px;height:20px"></span></h1>
    <div class="col-stats" id="stats"></div>
  </div>
  <div id="authBanner" class="section hidden">
    <div class="section-body anim" style="padding:20px 24px;display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap">
      <div style="font-size:15px;color:var(--muted)">Log in or sign up to save this collection to your account.</div>
      <div style="display:flex;gap:10px">
        <a class="btn small outline" href="/login">Log in</a>
        <a class="btn small" href="/signup">Sign up</a>
      </div>
    </div>
  </div>
  <div id="saveBar" class="section hidden">
    <div class="section-body anim" style="padding:20px 24px;display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap">
      <div style="font-size:15px;color:var(--muted)">Like this collection? Save a copy to your own account.</div>
      <button class="btn small" id="saveBtn" onclick="saveCollection()">\\ud83d\\udcbe Save to my account</button>
    </div>
  </div>
  <div class="actions" id="actions">
    <button class="btn" id="uploadToggle">\\ud83d\\udcf7 Add Photos</button>
    <button class="btn outline" id="qrToggle">\\ud83d\\udd04 Show QR</button>
    <button class="btn outline hidden" id="membersToggle">\\ud83d\\udc65 Members</button>
    <a class="btn outline" id="downloadAllBtn" href="/api/collections/${id}/zip" style="display:none">\\u2b07 Download All</a>
  </div>
  <div id="uploadSection" class="section hidden">
    <div class="section-body anim" style="padding-top:24px">
      <div class="dropzone" id="dropzone">
        <div class="dropzone-icon">\\ud83d\\udce4</div>
        <div class="dropzone-text"><strong>Click to browse</strong> or drag photos here</div>
        <input type="file" id="files" accept="image/*" multiple>
      </div>
      <div id="uploadProgress" class="hidden">
        <div class="progress"><div class="progress-bar" id="progressBar" style="width:0"></div></div>
        <p style="text-align:center;color:var(--muted);font-size:14px;margin-top:10px" id="progressText">Uploading...</p>
      </div>
    </div>
  </div>
  <div id="qrSection" class="section hidden">
    <div class="section-body anim" style="padding-top:24px">
      <div class="qr-wrap"><img id="qrImg" alt="QR code"></div>
      <div class="share-link">
        <input id="shareUrl" readonly>
        <button class="copy-btn" onclick="copyLink()">Copy</button>
      </div>
    </div>
  </div>
  <div class="search-bar"><input type="search" id="photoSearch" placeholder="Search photos by filename..."><span class="live-dot" title="Live updates on"></span></div>
  <div id="membersSection" class="section hidden">
    <div class="section-body anim" style="padding:24px">
      <h2 style="font-size:17px;margin-bottom:8px">\\ud83d\\udc65 Members</h2>
      <div id="membersList"></div>
      <div class="share-link" id="inviteBox" style="margin-top:16px">
        <input id="inviteEmail" placeholder="teammate@email.com">
        <select id="inviteRole" class="copy-btn"><option value="viewer">Viewer</option><option value="editor">Editor</option></select>
        <button class="copy-btn" id="inviteBtn">Invite</button>
      </div>
    </div>
  </div>
  <div class="grid" id="photos"></div>
  <div class="load-wrap"><button class="btn outline small hidden" id="loadMore">Load more</button></div>
</div>
<script>
const BASE = ${JSON.stringify(apiBase)};
const CID = ${JSON.stringify(id)};
${TOAST_JS()}
let photos = [];
let isOwner = false;
let canEdit = false;
let canManage = false;
let role = null;
let loggedIn = false;
let total = 0, offset = 0, pageSize = 60, q = '', newestTs = '';
async function checkAuth() {
  try {
    const res = await fetch(BASE + '/api/auth/me', { credentials: 'include' });
    if (res.ok) {
      const { user } = await res.json();
      loggedIn = true;
      document.getElementById('navRight').innerHTML =
        '<span class="nav-user">Hi, <strong>' + esc(user.name) + '</strong></span>' +
        '<a class="btn small outline" href="/">My collections</a>';
    } else {
      loggedIn = false;
      document.getElementById('navRight').innerHTML =
        '<a class="btn small outline" href="/login">Log in</a>' +
        '<a class="btn small" href="/signup">Sign up</a>';
    }
  } catch {
    loggedIn = false;
    document.getElementById('navRight').innerHTML =
      '<a class="btn small outline" href="/login">Log in</a>' +
      '<a class="btn small" href="/signup">Sign up</a>';
  }
}
function updateChrome() {
  document.getElementById('authBanner').classList.toggle('hidden', !(isOwner === false && loggedIn === false));
  document.getElementById('saveBar').classList.toggle('hidden', !(isOwner === false && loggedIn === true));
  document.getElementById('uploadToggle').classList.toggle('hidden', !canEdit);
  document.getElementById('qrToggle').classList.toggle('hidden', !canEdit);
  document.getElementById('membersToggle').classList.toggle('hidden', !role);
  document.getElementById('downloadAllBtn').style.display = photos.length ? '' : 'none';
  const actions = document.getElementById('actions');
  if (actions) actions.classList.toggle('hidden', !canEdit && !role && photos.length === 0);
}
async function load(append) {
  try {
    const res = await fetch(BASE + '/api/collections/' + CID + '?q=' + encodeURIComponent(q) + '&limit=' + pageSize + '&offset=' + offset, { credentials: 'include' });
    if (!res.ok) throw new Error();
    const data = await res.json();
    document.getElementById('title').innerHTML = '<span class="grad">' + esc(data.collection.name) + '</span>';
    total = data.total;
    isOwner = !!data.isOwner;
    canEdit = !!data.canEdit;
    canManage = !!data.canManage;
    role = data.role || null;
    photos = append ? photos.concat(data.photos) : data.photos;
    offset = photos.length;
    newestTs = photos.reduce((m, p) => (p.created_at > m ? p.created_at : m), '');
    document.getElementById('stats').innerHTML =
      '<div class="stat-chip"><strong>' + total + '</strong> photo' + (total === 1 ? '' : 's') + '</div>' +
      (role ? '<div class="stat-chip">Your role: <strong>' + role + '</strong></div>' : '') +
      '<div class="stat-chip">Created ' + (data.collection.created_at || '').split(' ')[0] + '</div>';
    updateChrome();
    renderPhotos();
    const lm = document.getElementById('loadMore');
    lm.classList.toggle('hidden', !data.hasMore);
    lm.textContent = 'Load more (' + photos.length + '/' + total + ')';
  } catch {
    document.getElementById('title').textContent = 'Collection not found';
    document.getElementById('stats').innerHTML = '';
    document.getElementById('photos').innerHTML = '<div class="empty"><div class="empty-icon">\\u26a0\\ufe0f</div><div class="empty-text">This collection could not be loaded.</div></div>';
  }
}
async function saveCollection() {
  const btn = document.getElementById('saveBtn');
  btn.disabled = true; btn.innerHTML = '<span class="spinner"></span>';
  try {
    const res = await fetch(BASE + '/api/collections/' + CID + '/save', { method: 'POST', credentials: 'include' });
    if (res.status === 401) { window.location.href = '/login'; return; }
    if (!res.ok) throw new Error();
    const { id } = await res.json();
    toast('Collection saved to your account', 'success');
    setTimeout(() => window.location.href = '/c/' + id, 400);
  } catch {
    toast('Could not save collection', 'error');
    btn.disabled = false; btn.innerHTML = '\\ud83d\\udcbe Save to my account';
  }
}
function renderPhotos() {
  const el = document.getElementById('photos');
  if (!photos.length) {
    el.innerHTML = '<div class="empty" style="grid-column:1/-1"><div class="empty-icon">\\ud83d\\udd0c</div><div class="empty-text">' + (q ? 'No photos match your search.' : 'No photos yet.<br>' + (canEdit ? 'Tap "Add Photos" to add some.' : 'Check back later.')) + '</div></div>';
    return;
  }
  el.innerHTML = photos.map((p, i) =>
    '<div class="photo-wrap" style="animation-delay:' + (i * 50) + 'ms" onclick="openLightbox(\\'' + BASE + '/api/photos/' + p.filename + '\\')">' +
      '<img src="' + BASE + '/api/photos/' + p.filename + '?thumb=1" loading="lazy" decoding="async">' +
      '<div class="photo-overlay">' +
        '<button class="photo-btn" onclick="event.stopPropagation();downloadPhoto(\\'' + p.filename + '\\',\\'' + esc(p.original_name).replace(/'/g,"\\\\'") + '\\')" title="Download">\\u2b07</button>' +
        (canEdit ? '<button class="photo-btn danger" onclick="event.stopPropagation();deletePhoto(\\'' + p.id + '\\',\\'' + esc(p.original_name).replace(/'/g,"\\\\'") + '\\')" title="Delete">\\u2715</button>' : '') +
      '</div>' +
    '</div>'
  ).join('');
}
async function downloadPhoto(filename, name) {
  const a = document.createElement('a');
  a.href = BASE + '/api/photos/' + filename + '?download=1';
  a.download = name || filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  toast('Downloading ' + (name || filename), 'success');
}
async function deletePhoto(id, name) {
  if (!confirm('Delete "' + name + '"? This cannot be undone.')) return;
  try {
    const res = await fetch(BASE + '/api/photos/' + id, { method: 'DELETE', credentials: 'include' });
    if (!res.ok) throw new Error();
    photos = photos.filter(p => p.id !== id);
    renderPhotos();
    toast('Photo deleted', 'success');
  } catch {
    toast('Could not delete photo', 'error');
  }
}
/* Sections */
function toggleSection(id) {
  const sec = document.getElementById(id);
  sec.classList.toggle('hidden');
  sec.classList.toggle('open');
  if (id === 'qrSection' && !sec.classList.contains('hidden')) {
    document.getElementById('qrImg').src = BASE + '/api/collections/' + CID + '/qr';
    document.getElementById('shareUrl').value = window.location.origin + '/c/' + CID;
  }
}
document.getElementById('uploadToggle').addEventListener('click', () => toggleSection('uploadSection'));
document.getElementById('qrToggle').addEventListener('click', () => toggleSection('qrSection'));
/* Upload */
const dz = document.getElementById('dropzone');
const fileInput = document.getElementById('files');
dz.addEventListener('click', () => fileInput.click());
dz.addEventListener('dragover', (e) => { e.preventDefault(); dz.classList.add('drag'); });
dz.addEventListener('dragleave', () => dz.classList.remove('drag'));
dz.addEventListener('drop', (e) => { e.preventDefault(); dz.classList.remove('drag'); if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files); });
fileInput.addEventListener('change', () => { if (fileInput.files.length) uploadFiles(fileInput.files); });
async function uploadFiles(files) {
  const prog = document.getElementById('uploadProgress');
  const bar = document.getElementById('progressBar');
  prog.classList.remove('hidden');
  bar.style.width = '0';
  const fd = new FormData();
  for (const f of files) fd.append('photos', f);
  try {
    const res = await fetch(BASE + '/api/collections/' + CID + '/photos', { method: 'POST', credentials: 'include', body: fd });
    if (!res.ok) throw new Error();
    bar.style.width = '100%';
    toast(files.length + ' photo' + (files.length === 1 ? '' : 's') + ' uploaded', 'success');
    fileInput.value = '';
    setTimeout(() => prog.classList.add('hidden'), 800);
    load();
  } catch {
    toast('Upload failed', 'error');
    prog.classList.add('hidden');
  }
}
/* Copy */
function copyLink() {
  const input = document.getElementById('shareUrl');
  input.select();
  navigator.clipboard.writeText(input.value).then(() => toast('Link copied', 'success')).catch(() => toast('Copy failed', 'error'));
}
/* Lightbox */
function openLightbox(src) {
  document.getElementById('lightboxImg').src = src;
  document.getElementById('lightbox').classList.add('open');
}
function closeLightbox() { document.getElementById('lightbox').classList.remove('open'); }
document.getElementById('lightbox').addEventListener('click', (e) => { if (e.target.id === 'lightbox') closeLightbox(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });
/* Members / collaboration */
async function toggleMembers() {
  const sec = document.getElementById('membersSection');
  sec.classList.toggle('hidden');
  if (!sec.classList.contains('hidden')) loadMembers();
}
async function loadMembers() {
  try {
    const res = await fetch(BASE + '/api/collections/' + CID + '/members', { credentials: 'include' });
    if (!res.ok) { document.getElementById('membersList').innerHTML = '<div class="member-email">Could not load members.</div>'; return; }
    const data = await res.json();
    document.getElementById('membersList').innerHTML = data.members.map(function (m) {
      const badge = m.role === 'owner' ? '<span class="badge owner">owner</span>' : m.role === 'editor' ? '<span class="badge editor">editor</span>' : '<span class="badge">viewer</span>';
      const remove = (data.canManage && m.role !== 'owner') ? '<button class="copy-btn" onclick="removeMember(\\'' + m.user_id + '\\')">Remove</button>' : '';
      return '<div class="member-row"><div><div class="member-name">' + esc(m.name) + badge + '</div><div class="member-email">' + esc(m.email) + '</div></div>' + remove + '</div>';
    }).join('');
    document.getElementById('inviteBox').classList.toggle('hidden', !data.canManage);
  } catch {}
}
async function inviteMember() {
  const email = document.getElementById('inviteEmail').value.trim();
  const inviteRole = document.getElementById('inviteRole').value;
  if (!email) { toast('Enter an email', 'error'); return; }
  try {
    const res = await fetch(BASE + '/api/collections/' + CID + '/members', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ email: email, role: inviteRole }) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not invite');
    toast('Invited ' + email, 'success');
    document.getElementById('inviteEmail').value = '';
    loadMembers();
  } catch (err) { toast(err.message, 'error'); }
}
async function removeMember(userId) {
  if (!confirm('Remove this member?')) return;
  try {
    const res = await fetch(BASE + '/api/collections/' + CID + '/members/' + userId, { method: 'DELETE', credentials: 'include' });
    if (!res.ok) throw new Error();
    toast('Member removed', 'success');
    loadMembers();
  } catch { toast('Could not remove member', 'error'); }
}
/* Live updates */
let polling = null;
async function pollNew() {
  if (document.hidden || !newestTs) return;
  try {
    const res = await fetch(BASE + '/api/collections/' + CID + '?since=' + encodeURIComponent(newestTs) + '&limit=200' + (q ? '&q=' + encodeURIComponent(q) : ''), { credentials: 'include' });
    if (!res.ok) return;
    const data = await res.json();
    const known = new Set(photos.map(function (p) { return p.id; }));
    const fresh = (data.photos || []).filter(function (p) { return !known.has(p.id); });
    if (!fresh.length) return;
    photos = fresh.concat(photos);
    total = photos.length;
    newestTs = photos.reduce(function (m, p) { return p.created_at > m ? p.created_at : m; }, '');
    renderPhotos();
    toast(fresh.length + ' new photo' + (fresh.length === 1 ? '' : 's') + ' added', 'success');
  } catch {}
}
/* Search + wiring */
const photoSearch = document.getElementById('photoSearch');
let searchTimer;
photoSearch.addEventListener('input', function () {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(function () { q = photoSearch.value.trim(); offset = 0; load(false); }, 300);
});
document.getElementById('membersToggle').addEventListener('click', toggleMembers);
document.getElementById('inviteBtn').addEventListener('click', inviteMember);
document.getElementById('inviteEmail').addEventListener('keydown', function (e) { if (e.key === 'Enter') inviteMember(); });
document.getElementById('loadMore').addEventListener('click', function () { load(true); });
(async () => { await checkAuth(); await load(false); polling = setInterval(pollNew, 5000); })();
</script>
</body>
</html>`
}

export function loginPage(_apiBase: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Log in \\u00b7 PhotoShare</title>
<style>${SHARED_CSS}</style>
</head>
<body>
<div id="toast-container"></div>
<div class="auth-wrap">
  <a class="auth-back" href="/">&larr; Back</a>
  <div class="auth-card">
    <div class="auth-logo">\\ud83d\\udcf7</div>
    <div class="auth-title">Welcome back</div>
    <div class="auth-sub">Log in to manage your photo collections</div>
    <form id="loginForm">
      <div class="auth-field">
        <label for="email">Email</label>
        <input type="email" id="email" placeholder="you@example.com" autocomplete="email" required>
      </div>
      <div class="auth-field">
        <label for="password">Password</label>
        <input type="password" id="password" placeholder="Your password" autocomplete="current-password" required>
      </div>
      <button class="btn auth-btn" type="submit">Log in</button>
    </form>
    <div class="auth-footer">New here? <a href="/signup">Create an account</a></div>
  </div>
</div>
<script>
${TOAST_JS()}
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const btn = e.target.querySelector('button');
  btn.disabled = true; btn.innerHTML = '<span class="spinner"></span>';
  try {
    const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ email, password }) });
    if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error || 'Login failed'); }
    const { user } = await res.json();
    toast('Welcome back, ' + user.name, 'success');
    setTimeout(() => window.location.href = '/', 400);
  } catch (err) {
    toast(err.message, 'error');
    btn.disabled = false; btn.innerHTML = 'Log in';
  }
});
</script>
</body>
</html>`
}

export function signupPage(_apiBase: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Sign up \\u00b7 PhotoShare</title>
<style>${SHARED_CSS}</style>
</head>
<body>
<div id="toast-container"></div>
<div class="auth-wrap">
  <a class="auth-back" href="/">&larr; Back</a>
  <div class="auth-card">
    <div class="auth-logo">\\ud83d\\udcf7</div>
    <div class="auth-title">Create your account</div>
    <div class="auth-sub">Start sharing photos with a QR code in seconds</div>
    <form id="signupForm">
      <div class="auth-field">
        <label for="name">Name</label>
        <input type="text" id="name" placeholder="Your name" autocomplete="name" required>
      </div>
      <div class="auth-field">
        <label for="email">Email</label>
        <input type="email" id="email" placeholder="you@example.com" autocomplete="email" required>
      </div>
      <div class="auth-field">
        <label for="password">Password</label>
        <input type="password" id="password" placeholder="At least 6 characters" autocomplete="new-password" required>
      </div>
      <button class="btn auth-btn" type="submit">Create account</button>
    </form>
    <div class="auth-footer">Already have an account? <a href="/login">Log in</a></div>
  </div>
</div>
<script>
${TOAST_JS()}
document.getElementById('signupForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const btn = e.target.querySelector('button');
  btn.disabled = true; btn.innerHTML = '<span class="spinner"></span>';
  try {
    const res = await fetch('/api/auth/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ name, email, password }) });
    if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error || 'Sign up failed'); }
    const { user } = await res.json();
    toast('Welcome, ' + user.name, 'success');
    setTimeout(() => window.location.href = '/', 400);
  } catch (err) {
    toast(err.message, 'error');
    btn.disabled = false; btn.innerHTML = 'Create account';
  }
});
</script>
</body>
</html>`
}
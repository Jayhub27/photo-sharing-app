import { htmlEscape, layout, type PageMeta } from './ui.js'

export function collectionPage(id: string, apiBase: string, meta?: PageMeta): string {
  const og = meta
    ? `<meta property="og:type" content="website">
<meta property="og:title" content="${htmlEscape(meta.title)}">
<meta property="og:description" content="${htmlEscape(meta.description || 'View this shared photo collection.')}">
${meta.image ? `<meta property="og:image" content="${htmlEscape(meta.image)}">` : ''}
<meta name="twitter:card" content="summary_large_image">
`
    : ''

  const body = `
<a class="skip-link" href="#main">Skip to content</a>
<div id="toast-container" aria-live="polite" role="status"></div>

<div class="topbar">
  <div class="topbar-inner">
    <a class="back-pill" href="/" aria-label="Back to all collections">&larr; Collections</a>
    <span class="topbar-title" id="topbarTitle"></span>
    <div class="topbar-actions">
      <span class="nav-user" id="navUser"></span>
      <a class="nav-logo" href="/" aria-label="Take the shot home"><div class="logo-icon">\ud83d\udcf8</div></a>
      <span id="navRight"></span>
    </div>
  </div>
</div>

<div class="wrap" id="main">
  <div class="col-head">
    <h1 id="title"><span class="spinner dark" style="width:20px;height:20px"></span></h1>
    <div class="meta-line" id="metaLine"></div>
  </div>

  <div id="authBanner" class="note hidden">
    <span>Log in or sign up to save this collection to your account.</span>
    <span style="display:flex;gap:10px"><a class="btn small outline" href="/login">Log in</a><a class="btn small" href="/signup">Sign up</a></span>
  </div>
  <div id="saveBar" class="note hidden">
    <span>Like this collection? Save a copy to your own account.</span>
    <button class="btn small" id="saveBtn">Save to my account</button>
  </div>

  <div id="paywall" class="paywall hidden">
    <div>
      <strong id="paywallTitle">Unlock the originals</strong>
      <div class="hint" id="paywallHint"></div>
    </div>
    <button class="btn" id="buyBtn">Buy <span class="price" id="buyPrice"></span></button>
  </div>

  <div id="salesStrip" class="sales-strip hidden">
    <span id="salesSummary"></span>
    <span style="display:flex;gap:8px"><button class="btn small outline" id="salesBtn">Sales details</button></span>
  </div>

  <div class="bar actions" id="actions">
    <button class="btn" id="uploadToggle">\uff0b Add photos</button>
    <button class="btn outline hidden" id="sellBtn">Sell</button>
    <button class="btn outline hidden" id="qrToggle">Share</button>
    <div class="menu-wrap">
      <button class="btn outline icon" id="moreBtn" aria-haspopup="true" aria-expanded="false" title="More actions">\u22ef</button>
      <div class="menu" id="moreMenu" role="menu">
        <button id="miImport" role="menuitem">\ud83d\udd17 Import from link</button>
        <button id="miDownload" role="menuitem">\u2b07 Download all (ZIP)</button>
        <button id="miMembers" role="menuitem">\ud83d\udc65 Members</button>
        <button id="miSell" role="menuitem">\ud83c\udff7\ufe0f Pricing &amp; sales</button>
        <button id="miExpiry" role="menuitem">\u23f3 Auto-delete</button>
        <div class="sep"></div>
        <button id="miRename" role="menuitem">\u270f\ufe0f Rename collection</button>
        <button id="miVisibility" role="menuitem">\ud83d\udd12 Make private</button>
        <button id="miDelete" class="danger" role="menuitem">\ud83d\uddd1\ufe0f Delete collection</button>
      </div>
    </div>
  </div>

  <div class="toolbar">
    <input class="grow" type="search" id="photoSearch" placeholder="Search photos by name...">
    <select id="photoSort" aria-label="Sort photos">
      <option value="newest">Newest first</option>
      <option value="oldest">Oldest first</option>
      <option value="name">Name (A\u2013Z)</option>
    </select>
    <button class="icon-btn" id="photoViewToggle" type="button" aria-label="Toggle grid or list view" title="Grid / list">\u25a6</button>
    <button class="icon-btn" id="selectToggle" type="button" aria-label="Select photos" title="Select photos">\u2611</button>
    <span class="live-dot" title="Live updates on"></span>
  </div>

  <div class="grid" id="photos"></div>
  <div class="load-wrap"><button class="btn outline small hidden" id="loadMore">Load more</button></div>
</div>

<div class="mobile-bar" id="mobileBar">
  <button class="btn" data-act="upload"><span class="ico">\uff0b</span>Add</button>
  <button class="btn outline hidden" data-act="sell"><span class="ico">\ud83c\udff7\ufe0f</span>Sell</button>
  <button class="btn outline hidden" data-act="share"><span class="ico">\ud83d\udd17</span>Share</button>
  <button class="btn outline" data-act="more"><span class="ico">\u22ef</span>More</button>
</div>

<div class="select-bar" id="selectBar">
  <span class="count" id="selectCount">0 selected</span>
  <button class="btn small outline" id="selDownload">\u2b07 ZIP</button>
  <button class="btn small danger hidden" id="selDelete">Delete</button>
  <button class="btn small outline" id="selAll">All</button>
  <button class="btn small outline" id="selClear">Cancel</button>
</div>

<div class="marquee" id="marquee"></div>

<div class="context-menu" id="photoMenu">
  <button data-cmd="open">\ud83d\udd0d Open</button>
  <button data-cmd="download">\u2b07 Download</button>
  <button data-cmd="pick">\u2611 Select</button>
  <button data-cmd="all">\u2b1a Select all</button>
  <button data-cmd="delete" class="danger hidden">\ud83d\uddd1\ufe0f Delete</button>
</div>

<div class="lightbox" id="lightbox">
  <button class="lightbox-close" id="lbClose" aria-label="Close image">\u2715</button>
  <button class="lightbox-nav prev" id="lbPrev" aria-label="Previous photo">\u2039</button>
  <button class="lightbox-nav next" id="lbNext" aria-label="Next photo">\u203a</button>
  <img id="lightboxImg" alt="Photo preview">
</div>

<div class="modal" id="uploadModal">
  <div class="modal-card">
    <div class="modal-head"><h2>Add photos</h2><button class="modal-close" data-close="uploadModal" aria-label="Close">\u2715</button></div>
    <div class="dropzone" id="dropzone">
      <div class="dropzone-icon">\ud83d\udce4</div>
      <div class="dropzone-text"><strong>Click to browse</strong> or drag photos here</div>
      <input type="file" id="files" accept="image/*" multiple style="display:none">
    </div>
    <div id="uploadProgress" class="hidden" style="margin-top:14px">
      <div class="progress" style="height:6px;background:var(--surface2);border-radius:3px;overflow:hidden"><div class="progress-bar" id="progressBar" style="height:100%;width:0;background:var(--grad);transition:width .3s"></div></div>
      <p class="hint" style="text-align:center;margin-top:10px" id="progressText">Uploading...</p>
    </div>
    <div class="note" style="margin:16px 0 0">
      <span>Photos in Google Drive or Google Photos? <strong>Any direct image link works.</strong></span>
      <button class="btn small outline" id="importFromUpload">Import from link</button>
    </div>
  </div>
</div>

<div class="modal" id="importModal">
  <div class="modal-card">
    <div class="modal-head"><h2>Import from a link</h2><button class="modal-close" data-close="importModal" aria-label="Close">\u2715</button></div>
    <div class="field">
      <label for="importUrls">Image links (one per line)</label>
      <textarea id="importUrls" placeholder="https://drive.google.com/file/d/FILE_ID/view&#10;https://example.com/photo.jpg"></textarea>
    </div>
    <div class="hint" style="margin-bottom:14px">Works with direct image URLs, Google Drive file links and pages with an <strong>og:image</strong> tag. Google Photos <em>album</em> links only expose the cover \u2014 use the share link of a single photo instead.</div>
    <button class="btn" id="importBtn">Import photos</button>
    <div id="importResults" class="hint" style="margin-top:12px"></div>
  </div>
</div>

<div class="modal" id="shareModal">
  <div class="modal-card">
    <div class="modal-head"><h2>Share collection</h2><button class="modal-close" data-close="shareModal" aria-label="Close">\u2715</button></div>
    <div class="qr-wrap"><img id="qrImg" alt="QR code for this collection"></div>
    <div class="share-link">
      <input id="shareUrl" readonly>
      <button class="copy-btn" id="copyLink" aria-label="Copy share link">Copy</button>
    </div>
    <div class="share-link">
      <button class="btn outline small" id="nativeShare">Share\u2026</button>
      <a class="btn outline small" id="qrDownload" download="qr.png">Download QR</a>
    </div>
  </div>
</div>

<div class="modal" id="sellModal">
  <div class="modal-card">
    <div class="modal-head"><h2>Pricing &amp; sales</h2><button class="modal-close" data-close="sellModal" aria-label="Close">\u2715</button></div>
    <div id="sellSetup" class="note warn hidden"></div>
    <div class="field">
      <label for="priceInput">Price per collection</label>
      <div class="price-row">
        <input type="number" id="priceInput" min="0" step="0.01" placeholder="0.00 = free">
        <select id="currencySelect" aria-label="Currency">
          <option value="usd">USD $</option>
          <option value="eur">EUR \u20ac</option>
          <option value="gbp">GBP \u00a3</option>
          <option value="cad">CAD $</option>
          <option value="aud">AUD $</option>
          <option value="mxn">MXN $</option>
          <option value="brl">BRL R$</option>
          <option value="inr">INR \u20b9</option>
        </select>
      </div>
    </div>
    <div class="hint" style="margin-bottom:14px">Set a price to sell the original files. Buyers see the thumbnails, pay with card via Stripe, and immediately unlock downloads. Leave 0 to share for free.</div>
    <button class="btn" id="savePrice">Save pricing</button>
    <div id="salesBox" class="hidden" style="margin-top:20px"></div>
  </div>
</div>

<div class="modal" id="expiryModal">
  <div class="modal-card">
    <div class="modal-head"><h2>Auto-delete this collection</h2><button class="modal-close" data-close="expiryModal" aria-label="Close">\u2715</button></div>
    <div class="field">
      <label for="expirySelect">Delete after</label>
      <select id="expirySelect">
        <option value="">Never (keep forever)</option>
        <option value="1">1 day</option>
        <option value="7">7 days</option>
        <option value="30">30 days</option>
        <option value="90">90 days</option>
        <option value="365">1 year</option>
        <option value="custom">Custom\u2026</option>
      </select>
    </div>
    <div class="field hidden" id="expiryCustomWrap">
      <label for="expiryDays">Number of days</label>
      <input type="number" id="expiryDays" min="1" max="3650" step="1" placeholder="14">
    </div>
    <div class="note warn hidden" id="expirySellWarning">
      <span><strong>Heads up:</strong> this collection has a price. When it auto-deletes, buyers lose access and the purchase records are removed too.</span>
    </div>
    <div class="hint" style="margin-bottom:14px">Photos are removed from storage and the database. The server sweeps hourly, so deletion happens within an hour of the deadline. You can trigger it early with the maintenance endpoint.</div>
    <button class="btn" id="saveExpiry">Save schedule</button>
    <div id="expiryStatus" class="hint" style="margin-top:12px"></div>
  </div>
</div>

<div class="modal" id="membersModal">
  <div class="modal-card">
    <div class="modal-head"><h2>Members</h2><button class="modal-close" data-close="membersModal" aria-label="Close">\u2715</button></div>
    <div id="membersList"></div>
    <div class="share-link" id="inviteBox">
      <input id="inviteEmail" placeholder="teammate@email.com">
      <select id="inviteRole" class="copy-btn"><option value="viewer">Viewer</option><option value="editor">Editor</option></select>
      <button class="copy-btn" id="inviteBtn">Invite</button>
    </div>
  </div>
</div>
`

  const script = `
const BASE = ${JSON.stringify(apiBase)};
const CID = ${JSON.stringify(id)};

let photos = [];
let pricing = { locked: false, price_cents: null, currency: 'usd', purchased: false, stripeConfigured: false, schemaReady: true };
let isOwner = false, canEdit = false, canManage = false, role = null, loggedIn = false;
let total = 0, offset = 0, pageSize = 60, q = '', newestTs = '', createdAt = '', isPublic = true, photoSort = 'newest', photoView = 'grid';
let expiresAt = null;
let selected = new Set();
let selectMode = false;
let lastIndex = -1;
let lightboxIndex = -1;
let dragging = false;

try {
  photoSort = localStorage.getItem('tts.photoSort') || 'newest';
  photoView = localStorage.getItem('tts.photoView') || 'grid';
} catch (e) {}

function applyPhotoView() {
  const el = document.getElementById('photos');
  if (el) el.className = 'grid' + (photoView === 'list' ? ' photo-list' : '');
  const btn = document.getElementById('photoViewToggle');
  if (btn) btn.textContent = photoView === 'list' ? '\\u25a6' : '\\u2630';
}

function renderMeta() {
  const parts = [];
  parts.push('<span><strong>' + total + '</strong> photo' + (total === 1 ? '' : 's') + '</span>');
  if (pricing.price_cents) {
    parts.push('<span class="price-tag">' + esc(money(pricing.price_cents, pricing.currency)) + '</span>');
    if (pricing.purchased) parts.push('<span>\u2713 purchased</span>');
  } else {
    parts.push('<span>Free to view</span>');
  }
  if (!isPublic) parts.push('<span>\ud83d\udd12 Private</span>');
  if (expiresAt) {
    const ms = new Date(expiresAt).getTime() - Date.now();
    const days = Math.ceil(ms / 86400000);
    parts.push('<span>\u23f3 ' + (days <= 0 ? 'deleting soon' : days === 1 ? 'deletes in 1 day' : 'deletes in ' + days + ' days') + '</span>');
  }
  if (role && role !== 'owner') parts.push('<span>You are ' + esc(role) + '</span>');
  if (canManage && pricing.price_cents) parts.push('<span>\ud83d\udcb0 Selling</span>');
  if (createdAt) parts.push('<span>Created ' + esc(createdAt) + '</span>');
  document.getElementById('metaLine').innerHTML = parts.join('<span class="dot">\u00b7</span>');
}

function updateChrome() {
  document.getElementById('authBanner').classList.toggle('hidden', !(isOwner === false && loggedIn === false));
  document.getElementById('saveBar').classList.toggle('hidden', !(isOwner === false && loggedIn === true && !pricing.locked));
  document.getElementById('uploadToggle').classList.toggle('hidden', !canEdit);
  document.getElementById('sellBtn').classList.toggle('hidden', !canManage);
  document.getElementById('qrToggle').classList.toggle('hidden', !canEdit && !role);
  document.getElementById('miImport').classList.toggle('hidden', !canEdit);
  document.getElementById('miDownload').classList.toggle('hidden', !photos.length || pricing.locked);
  document.getElementById('miMembers').classList.toggle('hidden', !role);
  document.getElementById('miSell').classList.toggle('hidden', !canManage);
  document.getElementById('miExpiry').classList.toggle('hidden', !canManage);
  document.getElementById('miRename').classList.toggle('hidden', !canManage);
  document.getElementById('miVisibility').classList.toggle('hidden', !canManage);
  document.getElementById('miDelete').classList.toggle('hidden', !canManage);
  document.getElementById('miVisibility').textContent = isPublic ? '\ud83d\udd12 Make private' : '\ud83d\udd13 Make public';
  document.querySelectorAll('[data-act="sell"]').forEach((b) => b.classList.toggle('hidden', !canManage));
  document.querySelectorAll('[data-act="share"]').forEach((b) => b.classList.toggle('hidden', !canEdit && !role));
  const menu = document.getElementById('moreMenu');
  if (menu) menu.querySelectorAll('button').forEach((b) => { if (b.classList.contains('hidden')) b.style.display = 'none'; else b.style.display = ''; });
  document.getElementById('selDelete').classList.toggle('hidden', !canEdit);
  document.getElementById('navUser').innerHTML = loggedIn ? 'Hi, <strong>' + esc(window.__userName || '') + '</strong>' : '';
  document.getElementById('navRight').innerHTML = loggedIn
    ? '<a class="btn small outline" href="/">My collections</a>'
    : '<a class="btn small outline" href="/login">Log in</a><a class="btn small" href="/signup">Sign up</a>';
  const paywall = document.getElementById('paywall');
  paywall.classList.toggle('hidden', !pricing.locked);
  if (pricing.locked) {
    document.getElementById('buyPrice').textContent = money(pricing.price_cents, pricing.currency);
    document.getElementById('paywallHint').textContent = total + ' original photo' + (total === 1 ? '' : 's') + ' \u00b7 instant download after payment';
  }
  const strip = document.getElementById('salesStrip');
  strip.classList.toggle('hidden', !(canManage && pricing.price_cents));
  renderMeta();
}

function photoSrc(p) {
  const suffix = pricing.locked ? '?thumb=1' : '';
  return BASE + '/api/photos/' + p.filename + suffix;
}

function renderPhotos() {
  const el = document.getElementById('photos');
  applyPhotoView();
  if (!photos.length) {
    el.innerHTML = '<div class="empty" style="grid-column:1/-1"><div class="empty-icon">\ud83d\udd0c</div><div class="empty-text">' + (q ? 'No photos match your search.' : 'No photos yet.<br>' + (canEdit ? 'Use "Add photos" to add some.' : 'Check back later.')) + '</div></div>';
    return;
  }
  el.innerHTML = photos.map(function (p, i) {
    const isSel = selected.has(p.id);
    return '<div class="photo-wrap' + (isSel ? ' selected' : '') + '" data-id="' + p.id + '" data-index="' + i + '" data-name="' + esc(p.original_name) + '" style="animation-delay:' + Math.min(i, 20) * 30 + 'ms" role="button" tabindex="0" aria-label="Photo ' + esc(p.original_name) + (isSel ? ' (selected)' : '') + '">' +
      '<img src="' + photoSrc(p) + '" alt="' + esc(p.original_name) + '" loading="lazy" decoding="async">' +
      (pricing.locked ? '<span class="photo-lock">\ud83d\udd12</span>' : '') +
      '<span class="check">\u2713</span>' +
      '<div class="photo-overlay">' +
        '<button class="photo-btn" data-act="download" aria-label="Download ' + esc(p.original_name) + '" title="Download">\u2b07</button>' +
        (canEdit ? '<button class="photo-btn danger" data-act="delete" aria-label="Delete ' + esc(p.original_name) + '" title="Delete">\u2715</button>' : '') +
      '</div>' +
    '</div>';
  }).join('');
  if (selectMode) updateSelectBar();
}

/* ------------------------------------------------------------- selection */

function setSelectMode(on) {
  selectMode = on;
  document.body.classList.toggle('selecting', on);
  document.getElementById('selectBar').classList.toggle('open', on);
  if (!on) selected.clear();
  renderPhotos();
}
function updateSelectBar() {
  document.getElementById('selectCount').textContent = selected.size + ' selected';
  document.querySelectorAll('.photo-wrap').forEach(function (w) {
    w.classList.toggle('selected', selected.has(w.dataset.id));
  });
}
function togglePick(id, index) {
  if (selected.has(id)) selected.delete(id); else selected.add(id);
  if (typeof index === 'number') lastIndex = index;
  updateSelectBar();
}
function selectRange(index) {
  if (lastIndex < 0 || lastIndex === index) return;
  const [from, to] = lastIndex < index ? [lastIndex, index] : [index, lastIndex];
  for (let i = from; i <= to; i++) selected.add(photos[i].id);
  lastIndex = index;
  updateSelectBar();
}
function selectAll() {
  photos.forEach(function (p) { selected.add(p.id); });
  updateSelectBar();
}
function clearSelection() {
  selected.clear();
  updateSelectBar();
}
function batchDownload() {
  if (!selected.size) { toast('Select some photos first', 'error'); return; }
  if (pricing.locked) { toast('Buy this collection to download the originals', 'error'); return; }
  const ids = Array.from(selected).join(',');
  window.location.href = BASE + '/api/collections/' + CID + '/zip?ids=' + encodeURIComponent(ids);
}
async function batchDelete() {
  if (!selected.size) return;
  if (!confirm('Delete ' + selected.size + ' photo' + (selected.size === 1 ? '' : 's') + '? This cannot be undone.')) return;
  const ids = Array.from(selected);
  try {
    const res = await fetch(BASE + '/api/collections/' + CID + '/photos/delete', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ ids: ids })
    });
    if (!res.ok) throw new Error();
    const { deleted } = await res.json();
    photos = photos.filter(function (p) { return !selected.has(p.id); });
    total = Math.max(0, total - deleted);
    offset = Math.max(0, offset - deleted);
    selected.clear();
    renderPhotos(); renderMeta();
    toast('Deleted ' + deleted + ' photo' + (deleted === 1 ? '' : 's'), 'success');
  } catch { toast('Could not delete photos', 'error'); }
}

/* ---------------------------------------------------------- drag & menus */

const grid = document.getElementById('photos');
const marquee = document.getElementById('marquee');
let startX = 0, startY = 0, draggingNow = false;

function photosInRect(x1, y1, x2, y2) {
  const left = Math.min(x1, x2), right = Math.max(x1, x2), top = Math.min(y1, y2), bottom = Math.max(y1, y2);
  return Array.from(document.querySelectorAll('.photo-wrap')).filter(function (w) {
    const r = w.getBoundingClientRect();
    return r.left < right && r.right > left && r.top < bottom && r.bottom > top;
  });
}
grid.addEventListener('pointerdown', function (e) {
  if (e.button === 1) return;
  if (e.button === 2 && !selectMode) setSelectMode(true);
  draggingNow = true;
  startX = e.clientX; startY = e.clientY;
  marquee.style.display = 'block';
  marquee.style.left = startX + 'px'; marquee.style.top = startY + 'px';
  marquee.style.width = '0px'; marquee.style.height = '0px';
  document.body.style.userSelect = 'none';
  if (e.button === 2) e.preventDefault();
});
window.addEventListener('pointermove', function (e) {
  if (!draggingNow) return;
  const x = Math.min(startX, e.clientX), y = Math.min(startY, e.clientY);
  marquee.style.left = x + 'px'; marquee.style.top = y + 'px';
  marquee.style.width = Math.abs(e.clientX - startX) + 'px';
  marquee.style.height = Math.abs(e.clientY - startY) + 'px';
});
window.addEventListener('pointerup', function (e) {
  if (draggingNow) {
    draggingNow = false;
    marquee.style.display = 'none';
    document.body.style.userSelect = '';
    const w = Math.abs(e.clientX - startX), h = Math.abs(e.clientY - startY);
    if (w + h > 12) {
      photosInRect(startX, startY, e.clientX, e.clientY).forEach(function (el) { selected.add(el.dataset.id); });
      updateSelectBar();
      return;
    }
  }
  const wrap = e.target.closest && e.target.closest('.photo-wrap');
  if (wrap && e.button === 0) {
    const i = Number(wrap.dataset.index);
    if (selectMode) {
      if (e.shiftKey) selectRange(i); else togglePick(wrap.dataset.id, i);
    } else if (e.metaKey || e.ctrlKey) {
      setSelectMode(true); togglePick(wrap.dataset.id, i);
    } else {
      openLightbox(i);
    }
  }
});
grid.addEventListener('dblclick', function (e) {
  const wrap = e.target.closest('.photo-wrap');
  if (wrap && selectMode) openLightbox(Number(wrap.dataset.index));
});
grid.addEventListener('keydown', function (e) {
  const wrap = e.target.closest('.photo-wrap');
  if (!wrap) return;
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(Number(wrap.dataset.index)); }
});
grid.addEventListener('click', function (e) {
  const btn = e.target.closest('.photo-btn');
  if (!btn) return;
  e.stopPropagation();
  const wrap = btn.closest('.photo-wrap');
  const p = photos[Number(wrap.dataset.index)];
  if (btn.dataset.act === 'download') downloadPhoto(p.filename, p.original_name);
  if (btn.dataset.act === 'delete') deletePhoto(p.id, p.original_name);
});

const photoMenu = document.getElementById('photoMenu');
let menuPhotoIndex = -1;
grid.addEventListener('contextmenu', function (e) {
  const wrap = e.target.closest('.photo-wrap');
  if (!wrap) return;
  e.preventDefault();
  menuPhotoIndex = Number(wrap.dataset.index);
  const p = photos[menuPhotoIndex];
  photoMenu.querySelector('[data-cmd="delete"]').classList.toggle('hidden', !canEdit);
  photoMenu.querySelector('[data-cmd="pick"]').textContent = selected.has(p.id) ? '\u2610 Deselect' : '\u2611 Select';
  photoMenu.classList.add('open');
  const menuW = 220, menuH = 260;
  photoMenu.style.left = Math.max(8, Math.min(e.clientX, window.innerWidth - menuW - 8)) + 'px';
  photoMenu.style.top = Math.max(8, Math.min(e.clientY, window.innerHeight - menuH - 8)) + 'px';
});
document.addEventListener('click', function (e) {
  if (!e.target.closest('#photoMenu')) photoMenu.classList.remove('open');
  if (!e.target.closest('#moreMenu') && !e.target.closest('#moreBtn')) document.getElementById('moreMenu').classList.remove('open');
});
photoMenu.addEventListener('click', function (e) {
  const cmd = e.target.closest('button')?.dataset.cmd;
  if (!cmd || menuPhotoIndex < 0) return;
  const p = photos[menuPhotoIndex];
  photoMenu.classList.remove('open');
  if (cmd === 'open') openLightbox(menuPhotoIndex);
  if (cmd === 'download') downloadPhoto(p.filename, p.original_name);
  if (cmd === 'pick') { setSelectMode(true); togglePick(p.id, menuPhotoIndex); }
  if (cmd === 'all') { setSelectMode(true); selectAll(); }
  if (cmd === 'delete') deletePhoto(p.id, p.original_name);
});

/* ---------------------------------------------------------------- photos */

async function downloadPhoto(filename, name) {
  if (pricing.locked) { toast('Buy this collection to download the originals', 'error'); return; }
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
    photos = photos.filter(function (p) { return p.id !== id; });
    total = Math.max(0, total - 1);
    offset = Math.max(0, offset - 1);
    selected.delete(id);
    renderPhotos(); renderMeta();
    toast('Photo deleted', 'success');
  } catch {
    toast('Could not delete photo', 'error');
  }
}

function openLightbox(i) {
  if (!photos.length) return;
  lightboxIndex = (i + photos.length) % photos.length;
  const p = photos[lightboxIndex];
  const img = document.getElementById('lightboxImg');
  img.src = photoSrc(p);
  img.alt = 'Photo: ' + p.original_name;
  document.getElementById('lightbox').classList.add('open');
}
function closeLightbox() { document.getElementById('lightbox').classList.remove('open'); }

/* ------------------------------------------------------------------ data */

async function checkAuth() {
  try {
    const res = await fetch(BASE + '/api/auth/me', { credentials: 'include' });
    if (res.ok) {
      const { user } = await res.json();
      loggedIn = true;
      window.__userName = user.name;
    }
  } catch {}
}

async function load(append) {
  try {
    const res = await fetch(BASE + '/api/collections/' + CID + '?q=' + encodeURIComponent(q) + '&limit=' + pageSize + '&offset=' + offset + '&sort=' + photoSort, { credentials: 'include' });
    if (res.status === 403) {
      document.getElementById('title').textContent = '\ud83d\udd12 Private collection';
      document.getElementById('metaLine').textContent = '';
      document.getElementById('actions').classList.add('hidden');
      document.getElementById('mobileBar').classList.add('hidden');
      document.querySelector('.toolbar').classList.add('hidden');
      document.getElementById('loadMore').classList.add('hidden');
      document.getElementById('photos').innerHTML = '<div class="empty" style="grid-column:1/-1"><div class="empty-icon">\ud83d\udd12</div><div class="empty-text">This collection is private.<br>Ask the owner for an invite, then log in to view it.</div></div>';
      return;
    }
    if (res.status === 410) {
      document.getElementById('title').textContent = '\u23f3 Collection expired';
      document.getElementById('metaLine').innerHTML = 'These photos reached their expiry date and were removed.';
      document.getElementById('actions').classList.add('hidden');
      document.getElementById('mobileBar').classList.add('hidden');
      document.querySelector('.toolbar').classList.add('hidden');
      document.getElementById('loadMore').classList.add('hidden');
      document.getElementById('photos').innerHTML = '<div class="empty" style="grid-column:1/-1"><div class="empty-icon">\u23f3</div><div class="empty-text">This collection was set to auto-delete and is now gone.<br>Create a new collection to share more photos.</div></div>';
      return;
    }
    if (!res.ok) throw new Error();
    const data = await res.json();
    document.getElementById('title').innerHTML = '<span class="grad">' + esc(data.collection.name) + '</span>';
    document.getElementById('topbarTitle').textContent = data.collection.name;
    document.title = data.collection.name + ' \u00b7 Take the shot';
    total = data.total;
    isOwner = !!data.isOwner;
    canEdit = !!data.canEdit;
    canManage = !!data.canManage;
    role = data.role || null;
    isPublic = data.collection.is_public !== false;
    expiresAt = data.collection.expires_at || null;
    pricing = data.pricing || pricing;
    photos = append ? photos.concat(data.photos) : data.photos;
    offset = photos.length;
    newestTs = photos.reduce(function (m, p) { return p.created_at > m ? p.created_at : m; }, '');
    createdAt = (data.collection.created_at || '').slice(0, 10);
    updateChrome();
    renderPhotos();
    const lm = document.getElementById('loadMore');
    lm.classList.toggle('hidden', !data.hasMore);
    lm.textContent = 'Load more (' + photos.length + '/' + total + ')';
    if (canManage && pricing.price_cents) loadSales();
  } catch {
    document.getElementById('title').textContent = 'Collection not found';
    document.getElementById('metaLine').textContent = '';
    document.getElementById('photos').innerHTML = '<div class="empty"><div class="empty-icon">\u26a0\ufe0f</div><div class="empty-text">This collection could not be loaded.</div></div>';
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
    setTimeout(function () { window.location.href = '/c/' + id; }, 400);
  } catch {
    toast('Could not save collection', 'error');
    btn.disabled = false; btn.innerHTML = 'Save to my account';
  }
}

/* --------------------------------------------------------------- selling */

async function buy() {
  const btn = document.getElementById('buyBtn');
  btn.disabled = true;
  try {
    const res = await fetch(BASE + '/api/collections/' + CID + '/checkout', { method: 'POST', credentials: 'include' });
    const data = await res.json().catch(function () { return {}; });
    if (data.url) { window.location.href = data.url; return; }
    if (data.alreadyPurchased) { toast('You already own this collection', 'success'); location.reload(); return; }
    const hint = data.code === 'schema_missing'
      ? 'Database setup needed: run the selling section of supabase/schema.sql in the Supabase SQL editor.'
      : data.code === 'stripe_not_configured'
        ? 'Payments are not configured yet: set STRIPE_SECRET_KEY on the server.'
        : data.error || 'Could not start checkout';
    toast(hint, 'error');
  } catch {
    toast('Could not start checkout', 'error');
  }
  btn.disabled = false;
}

async function loadSales() {
  try {
    const res = await fetch(BASE + '/api/collections/' + CID + '/sales', { credentials: 'include' });
    if (!res.ok) return;
    const data = await res.json();
    const box = document.getElementById('salesBox');
    box.classList.remove('hidden');
    if (!data.schemaReady) {
      box.innerHTML = '<div class="note warn"><span><strong>Database setup needed.</strong> Run the selling section of supabase/schema.sql to store prices and purchases.</span></div>';
    }
    if (!data.stripeConfigured) {
      box.innerHTML += '<div class="note warn" style="margin-top:10px"><span><strong>Stripe keys missing.</strong> Set STRIPE_SECRET_KEY (and STRIPE_WEBHOOK_SECRET) to accept payments.</span></div>';
    }
    const rows = (data.sales || []).map(function (s) {
      return '<div class="sale-row"><span>' + esc(s.buyer_email || 'Buyer') + '<br><span class="hint">' + new Date(s.created_at).toLocaleDateString() + '</span></span><span class="amount">' + money(s.amount_cents, s.currency) + (s.status === 'paid' ? '' : ' \u00b7 ' + esc(s.status)) + '</span></div>';
    }).join('');
    box.innerHTML += '<h2 style="font-size:16px;margin:18px 0 6px">' + (data.count || 0) + ' sale' + (data.count === 1 ? '' : 's') + ' \u00b7 ' + money(data.gross_cents, data.currency) + '</h2>' + (rows || '<div class="hint">No sales yet. Share the link to start selling.</div>');
    document.getElementById('salesSummary').innerHTML = '<strong>' + (data.count || 0) + ' sale' + (data.count === 1 ? '' : 's') + '</strong> \u00b7 ' + money(data.gross_cents, data.currency) + ' earned';
  } catch {}
}

function openSell() {
  document.getElementById('priceInput').value = pricing.price_cents ? (pricing.price_cents / 100).toFixed(2) : '';
  document.getElementById('currencySelect').value = pricing.currency || 'usd';
  const setup = document.getElementById('sellSetup');
  if (!pricing.schemaReady) {
    setup.classList.remove('hidden');
    setup.innerHTML = '<span><strong>Database setup needed.</strong> Run the selling section of supabase/schema.sql in the Supabase SQL editor to store prices and purchases.</span>';
  } else if (!pricing.stripeConfigured) {
    setup.classList.remove('hidden');
    setup.innerHTML = '<span><strong>Stripe keys missing.</strong> Set STRIPE_SECRET_KEY (and STRIPE_WEBHOOK_SECRET) on the server to accept payments.</span>';
  } else {
    setup.classList.add('hidden');
  }
  openModal('sellModal');
  loadSales();
}

async function savePrice() {
  const raw = document.getElementById('priceInput').value.trim();
  const currency = document.getElementById('currencySelect').value;
  const cents = raw === '' ? null : Math.round(Number(raw) * 100);
  if (cents !== null && (!Number.isFinite(cents) || cents < 0)) { toast('Enter a valid price', 'error'); return; }
  const btn = document.getElementById('savePrice');
  btn.disabled = true; btn.innerHTML = '<span class="spinner"></span>';
  try {
    const res = await fetch(BASE + '/api/collections/' + CID, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ price_cents: cents, currency: currency }),
    });
    const data = await res.json().catch(function () { return {}; });
    if (!res.ok) throw new Error(data.hint || data.error || 'Could not save pricing');
    toast(cents ? 'Pricing saved: ' + money(cents, currency) : 'Collection is free again', 'success');
    await load(false);
    openSell();
  } catch (err) {
    toast(err.message, 'error');
  }
  btn.disabled = false; btn.innerHTML = 'Save pricing';
}

/* --------------------------------------------------------------- import */

async function runImport() {
  const raw = document.getElementById('importUrls').value.trim();
  if (!raw) { toast('Paste a link first', 'error'); return; }
  const urls = raw.split(/\\n+/).map(function (s) { return s.trim(); }).filter(Boolean);
  const btn = document.getElementById('importBtn');
  const out = document.getElementById('importResults');
  btn.disabled = true; btn.innerHTML = '<span class="spinner"></span>';
  out.textContent = 'Downloading ' + urls.length + ' link' + (urls.length === 1 ? '' : 's') + '...';
  try {
    const res = await fetch(BASE + '/api/collections/' + CID + '/import', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ urls: urls }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Import failed');
    out.innerHTML = data.results.map(function (r) {
      return (r.photo ? '\u2713 imported' : '\u2717 ' + esc(r.error || 'failed')) + ' \u2014 <span class="hint">' + esc(r.url.slice(0, 80)) + '</span>';
    }).join('<br>');
    if (data.imported) {
      toast('Imported ' + data.imported + ' photo' + (data.imported === 1 ? '' : 's'), 'success');
      document.getElementById('importUrls').value = '';
      await load(false);
    }
  } catch (err) {
    out.textContent = err.message;
    toast(err.message, 'error');
  }
  btn.disabled = false; btn.innerHTML = 'Import photos';
}

/* -------------------------------------------------------------- upload */

async function uploadFiles(files, done) {
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
    document.getElementById('files').value = '';
    setTimeout(function () { prog.classList.add('hidden'); }, 800);
    await load(false);
    if (done) done();
  } catch {
    toast('Upload failed', 'error');
    prog.classList.add('hidden');
  }
}

/* ---------------------------------------------------------------- expiry */

function openExpiry() {
  const sel = document.getElementById('expirySelect');
  const custom = document.getElementById('expiryCustomWrap');
  const status = document.getElementById('expiryStatus');
  if (expiresAt) {
    const daysLeft = Math.max(1, Math.round((new Date(expiresAt).getTime() - Date.now()) / 86400000));
    const known = ['1', '7', '30', '90', '365'];
    if (known.includes(String(daysLeft))) {
      sel.value = String(daysLeft);
      custom.classList.add('hidden');
    } else {
      sel.value = 'custom';
      document.getElementById('expiryDays').value = String(daysLeft);
      custom.classList.remove('hidden');
    }
    status.textContent = 'Currently scheduled for ' + new Date(expiresAt).toLocaleString();
  } else {
    sel.value = '';
    custom.classList.add('hidden');
    status.textContent = 'No auto-delete scheduled.';
  }
  document.getElementById('expirySellWarning').classList.toggle('hidden', !pricing.price_cents);
  openModal('expiryModal');
}

async function saveExpiry() {
  const sel = document.getElementById('expirySelect');
  let days = sel.value;
  if (days === 'custom') days = document.getElementById('expiryDays').value;
  const payload = days === '' ? null : Number(days);
  if (payload !== null && (!Number.isFinite(payload) || payload < 1 || payload > 3650)) {
    toast('Enter a number of days between 1 and 3650', 'error');
    return;
  }
  const btn = document.getElementById('saveExpiry');
  btn.disabled = true; btn.innerHTML = '<span class="spinner"></span>';
  try {
    const res = await fetch(BASE + '/api/collections/' + CID, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ expires_in_days: payload }),
    });
    const data = await res.json().catch(function () { return {}; });
    if (!res.ok) throw new Error(data.hint || data.error || 'Could not save the schedule');
    toast(payload ? 'Auto-delete scheduled in ' + payload + ' day' + (payload === 1 ? '' : 's') : 'Auto-delete removed', 'success');
    closeModal('expiryModal');
    await load(false);
  } catch (err) {
    toast(err.message, 'error');
  }
  btn.disabled = false; btn.innerHTML = 'Save schedule';
}

/* -------------------------------------------------------------- members */

async function loadMembers() {
  try {
    const res = await fetch(BASE + '/api/collections/' + CID + '/members', { credentials: 'include' });
    if (!res.ok) { document.getElementById('membersList').innerHTML = '<div class="hint">Could not load members.</div>'; return; }
    const data = await res.json();
    document.getElementById('membersList').innerHTML = data.members.map(function (m) {
      const badge = m.role === 'owner' ? '<span class="badge owner">owner</span>' : m.role === 'editor' ? '<span class="badge editor">editor</span>' : '<span class="badge">viewer</span>';
      const remove = (data.canManage && m.role !== 'owner') ? '<button class="copy-btn" data-remove="' + m.user_id + '">Remove</button>' : '';
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

/* ----------------------------------------------------------- collection ops */

async function toggleVisibility() {
  const next = !isPublic;
  try {
    const res = await fetch(BASE + '/api/collections/' + CID, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ is_public: next }) });
    if (!res.ok) throw new Error();
    isPublic = next;
    updateChrome();
    toast(next ? 'Collection is now public' : 'Collection is now private', 'success');
  } catch {
    toast('Could not update visibility', 'error');
  }
}
async function renameCollection() {
  const name = prompt('Collection name', document.getElementById('topbarTitle').textContent || '');
  if (!name || !name.trim()) return;
  try {
    const res = await fetch(BASE + '/api/collections/' + CID, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ name: name.trim() }) });
    if (!res.ok) throw new Error();
    await load(false);
    toast('Collection renamed', 'success');
  } catch { toast('Could not rename collection', 'error'); }
}
async function deleteCollection() {
  if (!confirm('Delete this collection and all its photos? This cannot be undone.')) return;
  try {
    const res = await fetch(BASE + '/api/collections/' + CID, { method: 'DELETE', credentials: 'include' });
    if (!res.ok) throw new Error();
    toast('Collection deleted', 'success');
    setTimeout(function () { window.location.href = '/'; }, 500);
  } catch { toast('Could not delete collection', 'error'); }
}

/* ------------------------------------------------------------ live updates */

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
    total += fresh.length;
    offset += fresh.length;
    newestTs = photos.reduce(function (m, p) { return p.created_at > m ? p.created_at : m; }, '');
    renderPhotos(); renderMeta();
    toast(fresh.length + ' new photo' + (fresh.length === 1 ? '' : 's') + ' added', 'success');
  } catch {}
}

/* ---------------------------------------------------------------- wiring */

document.getElementById('uploadToggle').addEventListener('click', function () { openModal('uploadModal'); });
document.querySelectorAll('[data-act="upload"]').forEach(function (b) { b.addEventListener('click', function () { openModal('uploadModal'); }); });
document.querySelectorAll('[data-act="share"]').forEach(function (b) { b.addEventListener('click', function () { openShare(); }); });
document.querySelectorAll('[data-act="sell"]').forEach(function (b) { b.addEventListener('click', openSell); });
document.getElementById('sellBtn').addEventListener('click', openSell);
document.getElementById('salesBtn').addEventListener('click', function () { openSell(); });
document.getElementById('qrToggle').addEventListener('click', openShare);
document.getElementById('miSell').addEventListener('click', function () { document.getElementById('moreMenu').classList.remove('open'); openSell(); });
document.getElementById('miExpiry').addEventListener('click', function () { document.getElementById('moreMenu').classList.remove('open'); openExpiry(); });
document.getElementById('saveExpiry').addEventListener('click', saveExpiry);
document.getElementById('expirySelect').addEventListener('change', function () {
  document.getElementById('expiryCustomWrap').classList.toggle('hidden', this.value !== 'custom');
});
document.getElementById('miImport').addEventListener('click', function () { document.getElementById('moreMenu').classList.remove('open'); openModal('importModal'); });
document.getElementById('importFromUpload').addEventListener('click', function () { closeModal('uploadModal'); openModal('importModal'); });
document.getElementById('miDownload').addEventListener('click', function () { document.getElementById('moreMenu').classList.remove('open'); window.location.href = BASE + '/api/collections/' + CID + '/zip'; });
document.getElementById('miMembers').addEventListener('click', function () { document.getElementById('moreMenu').classList.remove('open'); openModal('membersModal'); loadMembers(); });
document.getElementById('miRename').addEventListener('click', function () { document.getElementById('moreMenu').classList.remove('open'); renameCollection(); });
document.getElementById('miVisibility').addEventListener('click', function () { document.getElementById('moreMenu').classList.remove('open'); toggleVisibility(); });
document.getElementById('miDelete').addEventListener('click', function () { document.getElementById('moreMenu').classList.remove('open'); deleteCollection(); });
document.querySelectorAll('[data-act="more"]').forEach(function (b) { b.addEventListener('click', function () { document.getElementById('moreMenu').classList.toggle('open'); }); });
document.getElementById('moreBtn').addEventListener('click', function (e) { e.stopPropagation(); document.getElementById('moreMenu').classList.toggle('open'); });

document.getElementById('saveBtn').addEventListener('click', saveCollection);
document.getElementById('buyBtn').addEventListener('click', buy);
document.getElementById('savePrice').addEventListener('click', savePrice);
document.getElementById('importBtn').addEventListener('click', runImport);
document.getElementById('inviteBtn').addEventListener('click', inviteMember);
document.getElementById('inviteEmail').addEventListener('keydown', function (e) { if (e.key === 'Enter') inviteMember(); });
document.getElementById('membersList').addEventListener('click', function (e) {
  const btn = e.target.closest('[data-remove]');
  if (btn) removeMember(btn.dataset.remove);
});
document.querySelectorAll('[data-close]').forEach(function (b) { b.addEventListener('click', function () { closeModal(b.dataset.close); }); });

document.getElementById('copyLink').addEventListener('click', function () {
  const input = document.getElementById('shareUrl');
  input.select();
  navigator.clipboard.writeText(input.value).then(function () { toast('Link copied', 'success'); }).catch(function () { toast('Copy failed', 'error'); });
});
document.getElementById('nativeShare').addEventListener('click', function () {
  if (navigator.share) navigator.share({ title: document.title, url: document.getElementById('shareUrl').value }).catch(function () {});
  else toast('Copy the link to share', 'error');
});
function openShare() {
  document.getElementById('qrImg').src = BASE + '/api/collections/' + CID + '/qr';
  document.getElementById('qrDownload').href = BASE + '/api/collections/' + CID + '/qr';
  document.getElementById('shareUrl').value = window.location.origin + '/c/' + CID;
  openModal('shareModal');
}

const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('files');
dropzone.addEventListener('click', function () { fileInput.click(); });
dropzone.addEventListener('dragover', function (e) { e.preventDefault(); dropzone.classList.add('drag'); });
dropzone.addEventListener('dragleave', function () { dropzone.classList.remove('drag'); });
dropzone.addEventListener('drop', function (e) { e.preventDefault(); dropzone.classList.remove('drag'); if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files, function () { closeModal('uploadModal'); }); });
fileInput.addEventListener('change', function () { if (fileInput.files.length) uploadFiles(fileInput.files, function () { closeModal('uploadModal'); }); });

document.getElementById('lightbox').addEventListener('click', function (e) { if (e.target.id === 'lightbox') closeLightbox(); });
document.getElementById('lbClose').addEventListener('click', closeLightbox);
document.getElementById('lbPrev').addEventListener('click', function (e) { e.stopPropagation(); openLightbox(lightboxIndex - 1); });
document.getElementById('lbNext').addEventListener('click', function (e) { e.stopPropagation(); openLightbox(lightboxIndex + 1); });
document.addEventListener('keydown', function (e) {
  if (document.getElementById('lightbox').classList.contains('open')) {
    if (e.key === 'ArrowLeft') openLightbox(lightboxIndex - 1);
    if (e.key === 'ArrowRight') openLightbox(lightboxIndex + 1);
  }
});

document.getElementById('selectToggle').addEventListener('click', function () { setSelectMode(!selectMode); });
document.getElementById('selClear').addEventListener('click', function () { setSelectMode(false); });
document.getElementById('selAll').addEventListener('click', selectAll);
document.getElementById('selDownload').addEventListener('click', batchDownload);
document.getElementById('selDelete').addEventListener('click', batchDelete);

const photoSearch = document.getElementById('photoSearch');
let searchTimer;
photoSearch.addEventListener('input', function () {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(function () { q = photoSearch.value.trim(); offset = 0; load(false); }, 300);
});
const photoSortSelect = document.getElementById('photoSort');
photoSortSelect.value = photoSort;
photoSortSelect.addEventListener('change', function () {
  photoSort = photoSortSelect.value;
  try { localStorage.setItem('tts.photoSort', photoSort); } catch (e) {}
  offset = 0; load(false);
});
document.getElementById('photoViewToggle').addEventListener('click', function () {
  photoView = photoView === 'list' ? 'grid' : 'list';
  try { localStorage.setItem('tts.photoView', photoView); } catch (e) {}
  applyPhotoView();
});
document.getElementById('loadMore').addEventListener('click', function () { load(true); });

(async function () {
  wireModals();
  applyPhotoView();
  await checkAuth();
  const params = new URLSearchParams(location.search);
  if (params.get('purchased') === '1') {
    const sessionId = params.get('session_id');
    if (sessionId) {
      try {
        await fetch(BASE + '/api/collections/' + CID + '/access?session_id=' + encodeURIComponent(sessionId), { credentials: 'include' });
      } catch (e) {}
    }
    toast('Payment received \u2014 downloads unlocked', 'success');
    history.replaceState({}, '', location.pathname);
  } else if (params.get('canceled') === '1') {
    toast('Checkout canceled', 'error');
    history.replaceState({}, '', location.pathname);
  }
  await load(false);
  setInterval(pollNew, 5000);
})();
`

  return layout(meta ? `${meta.title} \u00b7 Take the shot` : 'Take the shot', og, body, script, 'has-mobile-bar')
}

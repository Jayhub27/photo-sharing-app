import { SHARED_CSS } from './theme.js'
export interface PageMeta {
  title: string
  description?: string
  image?: string
}



export function TOAST_JS(): string {
  return `
function toast(msg, type) {
  let c = document.getElementById('toast-container');
  if (!c) { c = document.createElement('div'); c.id = 'toast-container'; document.body.appendChild(c); }
  const t = document.createElement('div');
  t.className = 'toast ' + (type||'');
  const icon = type === 'success' ? '\\u2713' : type === 'error' ? '\\u2717' : '\\u2022';
  t.innerHTML = '<span class="dot">' + icon + '</span><span>' + esc(msg) + '</span>';
  c.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateY(10px)'; t.style.transition = 'all .3s'; setTimeout(() => t.remove(), 300); }, 3200);
}
function esc(s) { return String(s).replace(/[<>&"']/g, c => ({ '<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#39;' }[c])); }
function money(cents, currency) {
  const c = String(currency || 'usd').toUpperCase();
  const amount = (Number(cents) || 0) / 100;
  const whole = amount % 1 === 0;
  try { return new Intl.NumberFormat(undefined, { style: 'currency', currency: c, minimumFractionDigits: whole ? 0 : 2 }).format(amount); }
  catch (e) { return '$' + amount.toFixed(whole ? 0 : 2); }
}
function openModal(id) { const m = document.getElementById(id); if (m) m.classList.add('open'); }
function closeModal(id) { const m = document.getElementById(id); if (m) m.classList.remove('open'); }
function wireModals() {
  document.querySelectorAll('.modal').forEach(function (m) {
    m.addEventListener('click', function (e) { if (e.target === m) m.classList.remove('open'); });
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') document.querySelectorAll('.modal.open').forEach(function (m) { m.classList.remove('open'); }); });
}
`
}

export function THEME_JS(): string {
  return `
function applyTheme(theme){
  document.documentElement.dataset.theme = theme;
  try { localStorage.setItem('tts.theme', theme); } catch(e){}
  var color = theme === 'light' ? '#f7f4ec' : '#0e0d0b';
  document.querySelectorAll('meta[name="theme-color"]').forEach(function(m){ m.setAttribute('content', color); });
}
function toggleTheme(){ applyTheme(document.documentElement.dataset.theme === 'light' ? 'dark' : 'light'); }
(function(){
  var saved = null; try { saved = localStorage.getItem('tts.theme') || localStorage.getItem('photoshare.theme'); } catch(e){}
  var prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
  document.documentElement.dataset.theme = saved || (prefersLight ? 'light' : 'dark');
  var btn = document.createElement('button');
  btn.className = 'theme-toggle';
  btn.type = 'button';
  btn.setAttribute('aria-label', 'Toggle light and dark theme');
  var sync = function(){ btn.textContent = document.documentElement.dataset.theme === 'light' ? '\\u2600\\ufe0f' : '\\ud83c\\udf19'; };
  btn.addEventListener('click', function(){ toggleTheme(); sync(); });
  sync();
  document.body.appendChild(btn);
})();
`
}

export function PWA_JS(): string {
  return `
function isStandalone(){
  try { return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true; }
  catch(e){ return false; }
}
function isIOS(){
  return /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}
function installedFlag(cb){
  try { cb(localStorage.getItem('tts.installed') === '1'); } catch(e){ cb(false); }
}
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function(){
    navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).catch(function(){});
  });
}
(function(){
  if (isStandalone()) return;
  var installBtn = document.createElement('button');
  installBtn.type = 'button';
  installBtn.className = 'pwa-install';
  installBtn.innerHTML = '\\u2b07 Install app';
  installBtn.setAttribute('aria-label', 'Install Take the shot as an app');
  document.body.appendChild(installBtn);
  var deferred = null;
  var dismissed = false;
  try { dismissed = localStorage.getItem('tts.install.dismissed') === '1'; } catch(e){}
  window.addEventListener('beforeinstallprompt', function(e){
    e.preventDefault();
    deferred = e;
    if (!dismissed) setTimeout(function(){ installBtn.classList.add('show'); }, 1500);
  });
  installBtn.addEventListener('click', function(){
    if (!deferred) return;
    deferred.prompt();
    deferred.userChoice.then(function(choice){
      deferred = null;
      installBtn.classList.remove('show');
      try { localStorage.setItem('tts.install.dismissed', choice && choice.outcome === 'dismissed' ? '1' : '0'); } catch(e){}
    });
  });
  window.addEventListener('appinstalled', function(){
    installBtn.classList.remove('show');
    try { localStorage.setItem('tts.installed', '1'); } catch(e){}
  });

  if (!isIOS()) return;
  var visits = 0;
  try {
    visits = Number(localStorage.getItem('tts.visits') || '0') + 1;
    localStorage.setItem('tts.visits', String(visits));
    if (localStorage.getItem('tts.ioshint.dismissed') === '1') return;
  } catch(e){}
  if (visits < 2) return;
  var hint = document.createElement('div');
  hint.className = 'ios-hint';
  hint.innerHTML = '<span><strong>Install Take the shot</strong>Tap Share, then \\u201cAdd to Home Screen\\u201d for a full-screen app.</span>' +
    '<button type="button" aria-label="Dismiss install hint">\\u2715</button>';
  hint.querySelector('button').addEventListener('click', function(){
    hint.remove();
    try { localStorage.setItem('tts.ioshint.dismissed', '1'); } catch(e){}
  });
  setTimeout(function(){ document.body.appendChild(hint); hint.classList.add('show'); }, 2500);
})();
`
}

export function htmlEscape(value: string): string {
  return String(value).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string
  ))
}

export function layout(title: string, head: string, body: string, script: string, bodyClass = ''): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#0e0d0b" media="(prefers-color-scheme: dark)">
<meta name="theme-color" content="#f7f4ec" media="(prefers-color-scheme: light)">
<meta name="color-scheme" content="dark light">
<meta name="format-detection" content="telephone=no">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Take the shot">
<link rel="manifest" href="/manifest.webmanifest">
<link rel="icon" href="/icons/icon.svg" type="image/svg+xml">
<link rel="icon" href="/icons/icon-192.png" type="image/png" sizes="192x192">
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">
<title>${htmlEscape(title)}</title>
${head}
<style>${SHARED_CSS}</style>
</head>
<body${bodyClass ? ` class="${bodyClass}"` : ''}>
${body}
<script>
${TOAST_JS()}${THEME_JS()}${PWA_JS()}
${script}
</script>
</body>
</html>`
}

export interface PageMeta {
  title: string
  description?: string
  image?: string
}

const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
<link rel="manifest" href="/manifest.webmanifest">
<link rel="icon" href="/icons/icon.svg" type="image/svg+xml">`

/* Inline SVG icons used via mask-image so markup stays tiny: <i class="ico ico-plus"></i> */
const svg = (paths: string) => {
  const raw = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'>${paths}</svg>`
  return `url("data:image/svg+xml,${encodeURIComponent(raw)}")`
}

export const ICON_CSS = `
.ico{display:inline-block;width:20px;height:20px;flex:none;background:currentColor;-webkit-mask:var(--i) center/contain no-repeat;mask:var(--i) center/contain no-repeat}
.ico-sm{width:16px;height:16px}
.ico-lg{width:24px;height:24px}
.ico-camera{--i:${svg('<path d="M4 8.5h3l1.6-2.5h6.8L17 8.5h3V19H4z"/><circle cx="12" cy="13.2" r="3.4"/>')}}
.ico-plus{--i:${svg('<path d="M12 5v14M5 12h14"/>')}}
.ico-share{--i:${svg('<path d="M12 15V4M8 8l4-4 4 4M5 14v6h14v-6"/>')}}
.ico-tag{--i:${svg('<path d="M3.5 12.2 12 3.7h8.3v8.3l-8.5 8.5z"/><circle cx="16.6" cy="7.4" r="1.4"/>')}}
.ico-dots{--i:${svg('<circle cx="5.5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="18.5" cy="12" r="1.5"/>')}}
.ico-trash{--i:${svg('<path d="M4 7h16M9.5 7V4.8h5V7M6.5 7l.9 13h9.2l.9-13"/>')}}
.ico-download{--i:${svg('<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 20h14"/>')}}
.ico-import{--i:${svg('<path d="M12 16V5M8 9l4-4 4 4M5 20h14"/>')}}
.ico-lock{--i:${svg('<rect x="5" y="10.5" width="14" height="9.5" rx="2.2"/><path d="M8.2 10.5V8a3.8 3.8 0 0 1 7.6 0v2.5"/>')}}
.ico-unlock{--i:${svg('<rect x="5" y="10.5" width="14" height="9.5" rx="2.2"/><path d="M8.2 10.5V8a3.8 3.8 0 0 1 7.1-1.9"/>')}}
.ico-clock{--i:${svg('<circle cx="12" cy="12" r="8.3"/><path d="M12 7.2V12l3.3 2"/>')}}
.ico-users{--i:${svg('<circle cx="9.4" cy="8.6" r="3.1"/><path d="M3.4 19c.4-2.9 3-4.7 6-4.7s5.6 1.8 6 4.7"/><circle cx="17" cy="9.4" r="2.4"/><path d="M15.8 14.5c2.6.4 4.3 2 4.7 4.5"/>')}}
.ico-link{--i:${svg('<path d="M10 14a4 4 0 0 0 5.7 0l2.5-2.5A4 4 0 0 0 12.5 5.8L11 7.3"/><path d="M14 10a4 4 0 0 0-5.7 0l-2.5 2.5a4 4 0 0 0 5.7 5.7L13 16.7"/>')}}
.ico-search{--i:${svg('<circle cx="11" cy="11" r="6.3"/><path d="m15.8 15.8 4.2 4.2"/>')}}
.ico-check{--i:${svg('<path d="m5 12.5 4.5 4.5L19 7"/>')}}
.ico-grid{--i:${svg('<rect x="4" y="4" width="6.5" height="6.5" rx="1.4"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.4"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.4"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.4"/>')}}
.ico-list{--i:${svg('<path d="M9 6.5h11M9 12h11M9 17.5h11"/><circle cx="4.8" cy="6.5" r="1.1"/><circle cx="4.8" cy="12" r="1.1"/><circle cx="4.8" cy="17.5" r="1.1"/>')}}
.ico-wallet{--i:${svg('<path d="M3.5 8.2A2.7 2.7 0 0 1 6.2 5.5h11.6a2.7 2.7 0 0 1 2.7 2.7v8.1a2.7 2.7 0 0 1-2.7 2.7H6.2a2.7 2.7 0 0 1-2.7-2.7z"/><path d="M3.5 9.5h17"/><circle cx="16.6" cy="14.2" r="1.2"/>')}}
.ico-chevr{--i:${svg('<path d="M14.5 6 8.5 12l6 6"/>')}}
.ico-arrow{--i:${svg('<path d="M5 12h13M12.5 6.5 18 12l-5.5 5.5"/>')}}
.ico-x{--i:${svg('<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>')}}
.ico-image{--i:${svg('<rect x="3.8" y="5" width="16.4" height="14" rx="2.4"/><circle cx="9" cy="10" r="1.6"/><path d="m5 17 4.6-4.4L14 17l2.8-2.6L19.5 17"/>')}}
.ico-alert{--i:${svg('<path d="M12 4.5 3.6 19h16.8z"/><path d="M12 10v4.2M12 16.8v.6"/>')}}
.ico-sun{--i:${svg('<circle cx="12" cy="12" r="4.2"/><path d="M12 3v2.2M12 18.8V21M3 12h2.2M18.8 12H21M5.6 5.6l1.6 1.6M16.8 16.8l1.6 1.6M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6"/>')}}
.ico-moon{--i:${svg('<path d="M20 14.2A8 8 0 0 1 9.8 4a8.2 8.2 0 1 0 10.2 10.2z"/>')}}
.ico-user{--i:${svg('<circle cx="12" cy="8.6" r="3.4"/><path d="M5 19.2c.5-3 3.4-4.9 7-4.9s6.5 1.9 7 4.9"/>')}}
.ico-folder{--i:${svg('<path d="M4 7.4A2.4 2.4 0 0 1 6.4 5h3.3l1.6 2.2h6.3A2.4 2.4 0 0 1 20 9.6v7A2.4 2.4 0 0 1 17.6 19H6.4A2.4 2.4 0 0 1 4 16.6z"/>')}}
.ico-sell{--i:${svg('<path d="M12 4.5c3.6 0 6.3 2.4 6.3 5.4 0 3.4-3.6 4.3-6.3 6.1-2.7-1.8-6.3-2.7-6.3-6.1 0-3 2.7-5.4 6.3-5.4z"/><path d="M12 9v6M10.4 10.4h3.2M10.4 13.6h3.2"/>')}}
.ico-eye{--i:${svg('<path d="M2.8 12S6.5 5.8 12 5.8 21.2 12 21.2 12 17.5 18.2 12 18.2 2.8 12 2.8 12z"/><circle cx="12" cy="12" r="3"/>')}}
.ico-edit{--i:${svg('<path d="M4 20h4l10-10-4-4L4 16z"/><path d="m14.5 5.5 4 4"/>')}}
.ico-flip{transform:rotate(180deg)}
`

export const SHARED_CSS = ICON_CSS + `
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --bg:#f9f4ec;--surface:#fffdf9;--surface-2:#f1e9dd;--elevated:#fffdf9;
  --text:#2a2119;--muted:#7d6b5c;--border:rgba(74,52,34,.14);--border-strong:rgba(74,52,34,.30);
  --accent:#e9a63a;--accent-soft:rgba(233,166,58,.18);--accent-text:#8a5a16;--on-accent:#2a2119;
  --danger:#b8452f;--danger-soft:rgba(184,69,47,.12);--ok:#4c7a3f;
  --r-sm:10px;--r:14px;--r-lg:22px;--r-pill:999px;
  --shadow-1:0 1px 2px rgba(74,52,34,.06);
  --shadow-2:0 2px 6px rgba(74,52,34,.08),0 16px 40px rgba(74,52,34,.12);
  --ease:cubic-bezier(.2,.7,.3,1);--wrap:1120px;
  --font-ui:'Inter',system-ui,-apple-system,'Segoe UI',sans-serif;
  --font-display:'Space Grotesk','Inter',system-ui,sans-serif;
}
html[data-theme="dark"]{
  --bg:#16110d;--surface:#211a15;--surface-2:#2b221b;--elevated:#261e18;
  --text:#f4ece1;--muted:#a89a8b;--border:rgba(255,238,220,.11);--border-strong:rgba(255,238,220,.26);
  --accent:#f0b558;--accent-soft:rgba(240,181,88,.18);--accent-text:#f3c477;--on-accent:#241a10;
  --danger:#e5795c;--danger-soft:rgba(229,121,92,.14);--ok:#7fae6a;
  --shadow-1:0 1px 2px rgba(0,0,0,.4);
  --shadow-2:0 2px 8px rgba(0,0,0,.45),0 20px 48px rgba(0,0,0,.5);
}
body{font-family:var(--font-ui);background:var(--bg);color:var(--text);min-height:100vh;overflow-x:hidden;font-size:15px;line-height:1.5;-webkit-font-smoothing:antialiased;-webkit-tap-highlight-color:transparent}
h1,h2,h3,.display{font-family:var(--font-display);letter-spacing:-.02em;line-height:1.12}
h1{font-size:clamp(25px,4.6vw,38px);font-weight:700}
h2{font-size:clamp(18px,2.6vw,22px);font-weight:600}
a{color:inherit}
.wrap{max-width:var(--wrap);margin:0 auto;padding:0 20px}
.hidden{display:none!important}
:focus-visible{outline:2px solid var(--accent);outline-offset:2px;border-radius:6px}
.skip-link{position:absolute;left:-9999px;top:0;background:var(--surface);color:var(--text);padding:10px 16px;border-radius:0 0 10px 0;z-index:400}
.skip-link:focus{left:0}
::selection{background:var(--accent-soft)}

/* ---------------------------------------------------------------- buttons */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;background:var(--accent);color:var(--on-accent);border:1px solid transparent;padding:0 18px;height:44px;border-radius:var(--r-pill);font-size:14.5px;font-weight:600;font-family:var(--font-ui);cursor:pointer;text-decoration:none;transition:transform .16s var(--ease),background .16s,border-color .16s,opacity .16s;white-space:nowrap}
.btn:hover{transform:translateY(-1px)}
.btn:active{transform:translateY(0)}
.btn.outline{background:transparent;color:var(--text);border-color:var(--border-strong)}
.btn.outline:hover{border-color:var(--text);background:var(--surface)}
.btn.ghost{background:transparent;color:var(--muted);border-color:transparent}
.btn.ghost:hover{background:var(--surface);color:var(--text)}
.btn.danger{background:transparent;color:var(--danger);border-color:var(--border-strong)}
.btn.danger:hover{background:var(--danger-soft);border-color:transparent}
.btn.small{height:38px;padding:0 14px;font-size:13.5px}
.btn.icon{padding:0;width:44px}
.btn[disabled]{opacity:.5;cursor:not-allowed;transform:none}
.icon-btn{width:44px;height:44px;border-radius:var(--r-pill);border:1px solid var(--border);background:var(--surface);color:var(--text);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;transition:background .16s,border-color .16s;flex:none}
.icon-btn:hover{border-color:var(--border-strong)}
.icon-btn[aria-pressed="true"]{background:var(--text);color:var(--bg);border-color:var(--text)}

/* ------------------------------------------------------------------ topbar */
.topbar{position:sticky;top:0;z-index:60;background:var(--bg);border-bottom:1px solid var(--border)}
@supports (backdrop-filter:blur(14px)){.topbar{background:color-mix(in srgb,var(--bg) 86%,transparent);backdrop-filter:blur(14px)}}
.topbar-inner{max-width:var(--wrap);margin:0 auto;padding:10px 20px;display:flex;align-items:center;gap:14px}
.nav-logo{display:flex;align-items:center;gap:10px;text-decoration:none;color:var(--text)}
.logo-icon{width:34px;height:34px;border-radius:10px;background:var(--accent);color:var(--on-accent);display:flex;align-items:center;justify-content:center;flex:none}
.logo-icon .ico{width:19px;height:19px}
.logo-text{font-family:var(--font-display);font-size:16.5px;font-weight:600;letter-spacing:-.02em}
.topbar-title{font-size:14px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.topbar-actions{margin-left:auto;display:flex;align-items:center;gap:10px}
.nav-user{font-size:14px;color:var(--muted);display:none}
.nav-user strong{color:var(--text);font-weight:600}
@media(min-width:720px){.nav-user{display:inline}}
.back-pill{display:inline-flex;align-items:center;gap:6px;height:38px;padding:0 14px 0 10px;border-radius:var(--r-pill);border:1px solid var(--border);background:var(--surface);color:var(--text);text-decoration:none;font-weight:600;font-size:13.5px;transition:border-color .16s;flex:none}
.back-pill:hover{border-color:var(--border-strong)}
.back-pill .ico{width:17px;height:17px}

/* --------------------------------------------------------------- home page */
.hero{padding:clamp(28px,5vw,56px) 0 22px;max-width:640px}
.hero h1{margin-bottom:10px}
.hero h1 em{font-style:normal;color:var(--muted)}
.sub{color:var(--muted);font-size:clamp(14.5px,2vw,16.5px);line-height:1.6;margin-bottom:26px}
.create-bar{display:flex;gap:10px;margin-bottom:8px}
.create-bar input{flex:1;background:var(--surface);border:1px solid var(--border-strong);border-radius:var(--r-pill);padding:0 20px;height:46px;font-size:15.5px;font-family:inherit;color:var(--text);transition:border-color .16s,box-shadow .16s}
.create-bar input:focus{outline:none;border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-soft)}
.create-bar input::placeholder{color:var(--muted)}
.section-label{display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:13.5px;font-weight:600;color:var(--muted);margin:26px 0 14px}
.card-list{display:flex;flex-direction:column;gap:10px;padding-bottom:40px}
.card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);padding:12px;text-decoration:none;color:inherit;display:flex;align-items:center;gap:14px;transition:border-color .16s,transform .16s var(--ease);animation:fadeUp .4s var(--ease) both}
.card:hover{border-color:var(--border-strong);transform:translateY(-1px)}
.card-left{display:flex;align-items:center;gap:14px;flex:1;min-width:0}
.card-thumb{width:62px;height:62px;border-radius:var(--r);background:var(--surface-2);display:flex;align-items:center;justify-content:center;color:var(--muted);flex:none;overflow:hidden}
.card-thumb img{width:100%;height:100%;object-fit:cover;transition:transform .3s var(--ease)}
.card:hover .card-thumb img{transform:scale(1.05)}
.card-info{min-width:0}
.card-title{font-size:16px;font-weight:600;display:flex;align-items:center;gap:8px;min-width:0}
.card-title span.nm{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.card-sub{font-size:13.5px;color:var(--muted);margin-top:2px}
.card-arrow{color:var(--muted);flex:none}
.badge{display:inline-flex;align-items:center;gap:4px;font-size:11.5px;font-weight:600;padding:3px 8px;border-radius:var(--r-pill);background:var(--surface-2);border:1px solid var(--border);color:var(--muted);white-space:nowrap}
.badge .ico{width:12px;height:12px}
.badge.price{background:var(--accent-soft);border-color:transparent;color:var(--accent-text)}
.badge.owner,.badge.editor{background:var(--surface-2);color:var(--text)}
.card-list.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:14px}
.card-list.grid .card{flex-direction:column;align-items:stretch;gap:0;padding:0;overflow:hidden}
.card-list.grid .card-left{flex-direction:column;align-items:stretch;gap:0}
.card-list.grid .card-thumb{width:100%;height:170px;border-radius:0;border-bottom:1px solid var(--border)}
.card-list.grid .card-info{padding:12px 14px 14px}
.card-list.grid .card-arrow{display:none}
.controls{display:flex;gap:10px;align-items:center;margin-bottom:16px;flex-wrap:wrap}
.controls input,.controls select,.toolbar input,.toolbar select{background:var(--surface);border:1px solid var(--border);border-radius:var(--r-pill);height:44px;padding:0 16px;font-size:15px;font-family:inherit;color:var(--text);min-width:0}
.controls input:focus,.controls select:focus,.toolbar input:focus,.toolbar select:focus{outline:none;border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-soft)}
.chips{display:flex;gap:6px;flex-wrap:wrap}
.chip{height:40px;padding:0 15px;border-radius:var(--r-pill);border:1px solid var(--border);background:var(--surface);color:var(--muted);font-size:13.5px;font-weight:500;cursor:pointer;font-family:inherit;transition:background .16s,color .16s,border-color .16s}
.chip:hover{color:var(--text);border-color:var(--border-strong)}
.chip.active{background:var(--text);color:var(--bg);border-color:var(--text)}
.live-dot{width:8px;height:8px;border-radius:50%;background:var(--ok);flex:none}
.empty{text-align:center;padding:56px 24px;color:var(--muted)}
.empty .ico{width:30px;height:30px;opacity:.5;margin-bottom:12px}
.empty-text{font-size:15px;line-height:1.6}
.skeleton-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);height:86px;animation:pulse 1.4s ease-in-out infinite}
.load-wrap{text-align:center;padding:6px 0 40px}

/* ------------------------------------------------------- collection header */
.col-head{padding:clamp(18px,3vw,30px) 0 14px}
.col-head h1{margin-bottom:6px}
.meta-line{color:var(--muted);font-size:13.5px;display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.meta-line .dot{opacity:.4}
.meta-line .price-tag{color:var(--text);font-weight:600}
.bar{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:16px}
.menu-wrap{position:relative;margin-left:auto}
.menu{position:absolute;right:0;top:calc(100% + 8px);min-width:250px;background:var(--elevated);border:1px solid var(--border);border-radius:var(--r);box-shadow:var(--shadow-2);padding:6px;z-index:80;display:none}
.menu.open{display:block;animation:pop .14s var(--ease)}
.menu button,.menu a{display:flex;align-items:center;gap:11px;width:100%;text-align:left;background:none;border:none;color:var(--text);font-size:14.5px;font-family:inherit;padding:0 12px;height:44px;border-radius:var(--r-sm);cursor:pointer;text-decoration:none}
.menu button:hover,.menu a:hover{background:var(--surface-2)}
.menu .ico{color:var(--muted)}
.menu .sep{height:1px;background:var(--border);margin:6px 8px}
.menu .danger{color:var(--danger)}
.menu .danger .ico{color:var(--danger)}
.toolbar{display:flex;gap:8px;align-items:center;margin-bottom:14px;flex-wrap:wrap}
.toolbar input{flex:1;min-width:180px}
.toolbar .ico{color:var(--muted)}

/* ------------------------------------------------------------------ photos */
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:22px}
.photo-wrap{position:relative;aspect-ratio:1;border-radius:var(--r);overflow:hidden;background:var(--surface-2);cursor:pointer;user-select:none;-webkit-user-select:none}
.photo-wrap img{width:100%;height:100%;object-fit:cover;transition:transform .35s var(--ease);pointer-events:none}
.photo-wrap:hover img{transform:scale(1.04)}
.photo-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.55),transparent 55%);opacity:0;transition:opacity .18s;display:flex;align-items:flex-end;justify-content:flex-end;padding:8px;gap:6px}
.photo-wrap:hover .photo-overlay{opacity:1}
body.selecting .photo-overlay{display:none}
.photo-btn{width:36px;height:36px;border-radius:var(--r-pill);border:none;background:rgba(255,255,255,.9);color:#17181a;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:transform .14s}
.photo-btn:hover{transform:scale(1.06)}
.photo-btn.danger:hover{background:#f06a63;color:#fff}
.photo-btn .ico{width:17px;height:17px}
.photo-lock{position:absolute;left:8px;top:8px;background:rgba(24,17,12,.72);color:#fff;border-radius:var(--r-pill);padding:4px 9px;display:flex;align-items:center;gap:4px;font-size:11px;font-weight:600;pointer-events:none}
.photo-lock .ico{width:13px;height:13px}
.photo-wrap.selected{outline:3px solid var(--accent);outline-offset:-3px}
.photo-wrap .check{position:absolute;right:8px;top:8px;width:26px;height:26px;border-radius:var(--r-pill);background:rgba(16,17,20,.5);border:1.5px solid rgba(255,255,255,.85);color:transparent;display:none;align-items:center;justify-content:center;pointer-events:none}
.photo-wrap .check .ico{width:14px;height:14px}
body.selecting .photo-wrap .check{display:flex}
.photo-wrap.selected .check{background:var(--accent);border-color:var(--accent);color:var(--on-accent)}
.grid.photo-list{grid-template-columns:1fr}
.grid.photo-list .photo-wrap{aspect-ratio:auto;height:74px;border-radius:var(--r-sm)}
.grid.photo-list .photo-wrap img{height:74px}
.grid.photo-list .photo-wrap::after{content:attr(data-name);position:absolute;left:12px;bottom:8px;font-size:12.5px;color:#fff;text-shadow:0 1px 4px rgba(0,0,0,.7);pointer-events:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:72%}
.marquee{position:fixed;border:1.5px solid var(--accent);background:var(--accent-soft);border-radius:8px;pointer-events:none;z-index:90;display:none}
.select-bar{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(18px + env(safe-area-inset-bottom));background:var(--elevated);border:1px solid var(--border);box-shadow:var(--shadow-2);border-radius:var(--r-pill);padding:7px 9px;display:none;gap:8px;align-items:center;z-index:120;max-width:calc(100vw - 20px)}
.select-bar.open{display:flex}
.select-bar .count{font-weight:600;font-size:13.5px;padding:0 8px;white-space:nowrap;color:var(--muted)}
.context-menu{position:fixed;min-width:210px;background:var(--elevated);border:1px solid var(--border);border-radius:var(--r);box-shadow:var(--shadow-2);padding:6px;z-index:160;display:none}
.context-menu.open{display:block;animation:pop .13s var(--ease)}
.context-menu button{display:flex;align-items:center;gap:11px;width:100%;background:none;border:none;color:var(--text);font-size:14.5px;font-family:inherit;padding:0 12px;height:44px;border-radius:var(--r-sm);cursor:pointer;text-align:left}
.context-menu button:hover{background:var(--surface-2)}
.context-menu .ico{color:var(--muted)}

/* --------------------------------------------------------- notes + selling */
.note{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:14px 16px;font-size:14px;color:var(--muted);display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;margin-bottom:14px}
.note strong{color:var(--text);font-weight:600}
.note.warn{border-color:color-mix(in srgb,var(--accent) 45%,var(--border));background:var(--accent-soft)}
.note.warn strong{color:var(--text)}
.paywall{display:flex;gap:16px;align-items:center;justify-content:space-between;flex-wrap:wrap;background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);padding:16px 18px;margin-bottom:16px}
.paywall strong{font-family:var(--font-display);font-size:16.5px;display:block;margin-bottom:2px}
.paywall .price{font-weight:700}
.sales-strip{display:flex;align-items:center;justify-content:space-between;gap:12px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:12px 16px;margin-bottom:14px;font-size:14px;color:var(--muted);flex-wrap:wrap}
.sales-strip strong{color:var(--text)}
.hint{font-size:13.5px;color:var(--muted);line-height:1.6}
.member-row,.sale-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 0;border-bottom:1px solid var(--border);font-size:14.5px}
.member-row:last-child,.sale-row:last-child{border-bottom:none}
.member-name{font-weight:600}
.member-email{font-size:13px;color:var(--muted)}
.sale-row .amount{font-weight:600;font-family:var(--font-display)}

/* ------------------------------------------------------------------ modals */
.modal{position:fixed;inset:0;background:rgba(42,30,20,.5);display:none;align-items:center;justify-content:center;z-index:150;padding:20px;animation:fadeIn .16s}
@supports (backdrop-filter:blur(3px)){.modal{backdrop-filter:blur(3px)}}
.modal.open{display:flex}
.modal-card{width:100%;max-width:520px;max-height:86vh;overflow:auto;background:var(--elevated);border:1px solid var(--border);border-radius:var(--r-lg);padding:24px;box-shadow:var(--shadow-2);animation:pop .18s var(--ease)}
.modal-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:18px}
.modal-head h2{font-size:18px}
.modal-close{width:38px;height:38px;border-radius:var(--r-pill);border:1px solid var(--border);background:transparent;color:var(--muted);cursor:pointer;display:flex;align-items:center;justify-content:center;flex:none}
.modal-close:hover{color:var(--text);border-color:var(--border-strong)}
.field{margin-bottom:14px}
.field label{display:block;font-size:13px;font-weight:600;color:var(--muted);margin-bottom:6px}
.modal input,.modal textarea,.modal select{width:100%;background:var(--surface);border:1px solid var(--border);border-radius:var(--r-sm);padding:12px 14px;font-size:15px;font-family:inherit;color:var(--text);min-height:44px}
.modal textarea{min-height:120px;resize:vertical}
.modal input:focus,.modal textarea:focus,.modal select:focus{outline:none;border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-soft)}
.price-row{display:flex;gap:10px}
.price-row input{flex:1}
.price-row select{width:130px}
.qr-wrap{text-align:center;padding:4px 0 8px}
.qr-wrap img{width:min(260px,72vw);height:auto;border-radius:var(--r)}
.share-link{display:flex;gap:8px;margin-top:14px;align-items:center;flex-wrap:wrap}
.share-link input{flex:1;min-width:180px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r-sm);padding:0 14px;height:44px;font-size:14px;color:var(--muted);font-family:inherit}
.copy-btn{background:var(--surface);border:1px solid var(--border-strong);border-radius:var(--r-pill);height:44px;padding:0 16px;color:var(--text);cursor:pointer;font-size:14px;font-family:inherit;font-weight:500}
.copy-btn:hover{background:var(--surface-2)}
select.copy-btn{min-width:110px}

/* --------------------------------------------------------------- lightbox */
.lightbox{position:fixed;inset:0;background:rgba(24,17,12,.95);display:none;align-items:center;justify-content:center;z-index:140;animation:fadeIn .16s}
.lightbox.open{display:flex}
.lightbox img{max-width:94vw;max-height:84vh;border-radius:var(--r);animation:pop .2s var(--ease)}
.lightbox-close{position:absolute;top:calc(14px + env(safe-area-inset-top));right:14px;width:44px;height:44px;border-radius:var(--r-pill);background:rgba(255,255,255,.12);border:none;color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center}
.lightbox-nav{position:absolute;top:50%;transform:translateY(-50%);width:46px;height:46px;border-radius:var(--r-pill);background:rgba(255,255,255,.12);border:none;color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center}
.lightbox-nav.prev{left:12px}.lightbox-nav.next{right:12px}
.lightbox-close:hover,.lightbox-nav:hover{background:rgba(255,255,255,.22)}

/* ------------------------------------------------------------ drop + toast */
.dropzone{border:1.5px dashed var(--border-strong);border-radius:var(--r);padding:30px 20px;text-align:center;cursor:pointer;transition:border-color .16s,background .16s}
.dropzone:hover,.dropzone.drag{border-color:var(--accent);background:var(--accent-soft)}
.dropzone-icon{color:var(--muted);margin-bottom:10px}
.dropzone-icon .ico{width:28px;height:28px}
.dropzone-text{color:var(--muted);font-size:14.5px}
.dropzone-text strong{color:var(--text)}
.progress{height:5px;background:var(--surface-2);border-radius:var(--r-pill);overflow:hidden}
.progress-bar{height:100%;background:var(--accent);border-radius:var(--r-pill);transition:width .25s ease}
#toast-container{position:fixed;bottom:calc(22px + env(safe-area-inset-bottom));left:50%;transform:translateX(-50%);z-index:200;display:flex;flex-direction:column;gap:8px;align-items:center;max-width:calc(100vw - 20px)}
.toast{background:var(--elevated);border:1px solid var(--border);border-radius:var(--r-pill);padding:12px 20px;font-size:14.5px;box-shadow:var(--shadow-2);display:flex;align-items:center;gap:10px;animation:toastIn .24s var(--ease)}
.toast .ico{color:var(--muted)}
.toast.success .ico{color:var(--ok)}
.toast.error .ico{color:var(--danger)}
.spinner{width:20px;height:20px;border:2.2px solid color-mix(in srgb,var(--text) 25%,transparent);border-top-color:var(--text);border-radius:50%;animation:spin .7s linear infinite}
.btn .spinner{border-color:rgba(0,0,0,.25);border-top-color:#000}
html[data-theme="light"] .btn .spinner{border-color:rgba(0,0,0,.22);border-top-color:#000}

/* --------------------------------------------------------------- auth */
.auth-wrap{max-width:400px;margin:0 auto;padding:24px 20px;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center}
.auth-card{width:100%;background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);padding:clamp(24px,5vw,34px)}
.auth-logo{width:46px;height:46px;border-radius:14px;background:var(--accent);color:var(--on-accent);display:flex;align-items:center;justify-content:center;margin-bottom:20px}
.auth-logo .ico{width:24px;height:24px}
.auth-title{font-family:var(--font-display);font-size:24px;font-weight:700;margin-bottom:4px}
.auth-sub{color:var(--muted);font-size:14.5px;margin-bottom:24px}
.auth-field{margin-bottom:14px}
.auth-field label{display:block;font-size:13px;font-weight:600;color:var(--muted);margin-bottom:6px}
.auth-field input{width:100%;background:var(--surface);border:1px solid var(--border-strong);border-radius:var(--r-sm);padding:0 14px;height:46px;font-size:15px;font-family:inherit;color:var(--text)}
.auth-field input:focus{outline:none;border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-soft)}
.auth-btn{width:100%;margin-top:6px}
.auth-footer{text-align:center;margin-top:20px;font-size:14px;color:var(--muted)}
.auth-footer a{color:var(--text);font-weight:600;text-decoration:none;border-bottom:1.5px solid var(--accent)}
.auth-back{display:inline-flex;align-items:center;gap:6px;color:var(--muted);text-decoration:none;font-size:14px;margin-bottom:16px;height:44px;align-items:center}
.auth-back:hover{color:var(--text)}

/* ------------------------------------------------------- misc controls */
.theme-toggle{position:fixed;bottom:calc(18px + env(safe-area-inset-bottom));right:18px;z-index:130;width:44px;height:44px;border-radius:var(--r-pill);border:1px solid var(--border);background:var(--surface);color:var(--text);cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:var(--shadow-1)}
.theme-toggle:hover{border-color:var(--border-strong)}
.mobile-bar{position:fixed;left:0;right:0;bottom:0;z-index:70;display:none;gap:8px;padding:10px 12px calc(10px + env(safe-area-inset-bottom));background:var(--bg);border-top:1px solid var(--border)}
@supports (backdrop-filter:blur(14px)){.mobile-bar{background:color-mix(in srgb,var(--bg) 90%,transparent);backdrop-filter:blur(14px)}}
.mobile-bar .btn{flex:1;height:52px;flex-direction:column;gap:3px;font-size:11.5px;border-radius:var(--r);padding:0 6px}
.mobile-bar .btn .ico{width:20px;height:20px}

/* ------------------------------------------------- camera QR import + PWA */
.qr-video-wrap{position:relative;aspect-ratio:1;background:#0b0b0d;border:1px solid var(--border);border-radius:var(--r);overflow:hidden;margin-bottom:12px}
.qr-video-wrap video{width:100%;height:100%;object-fit:cover;display:block}
.kv-row{display:flex;align-items:center;justify-content:space-between;gap:12px;background:var(--surface-2);border:1px solid var(--border);border-radius:var(--r-sm);padding:12px 14px;margin-bottom:10px}
.kv-row .kv-meta{min-width:0}
.kv-label{display:block;font-size:11.5px;font-weight:600;color:var(--muted);margin-bottom:2px}
.kv-value{display:block;font-weight:600;font-size:15px;word-break:break-all}
.qr-steps{margin:0 0 12px;padding-left:20px;color:var(--muted);font-size:14px;line-height:1.6}
.qr-steps li{margin-bottom:4px}
.dropzone-actions{display:flex;gap:10px;justify-content:center;margin-top:16px;flex-wrap:wrap}
.empty-icon{color:var(--muted);margin-bottom:12px}
.empty-icon .ico,.empty-icon i{width:30px;height:30px}
.grad{color:inherit}
.spinner.dark{border-color:color-mix(in srgb,var(--text) 22%,transparent);border-top-color:var(--text)}
.pwa-install{position:fixed;left:18px;bottom:calc(18px + env(safe-area-inset-bottom));z-index:130;display:none;align-items:center;gap:8px;height:46px;padding:0 18px;border-radius:var(--r-pill);border:none;background:var(--text);color:var(--bg);font-size:14px;font-weight:600;font-family:inherit;cursor:pointer;box-shadow:var(--shadow-2)}
.pwa-install.show{display:inline-flex}
.ios-hint{position:fixed;left:12px;right:12px;bottom:calc(12px + env(safe-area-inset-bottom));z-index:140;display:none;gap:12px;align-items:flex-start;background:var(--elevated);border:1px solid var(--border);border-radius:var(--r);padding:14px 16px;box-shadow:var(--shadow-2);font-size:14px;line-height:1.5}
.ios-hint.show{display:flex}
.ios-hint strong{display:block;margin-bottom:2px}
.ios-hint button{margin-left:auto;background:none;border:1px solid var(--border);color:var(--text);border-radius:var(--r-pill);font-size:16px;cursor:pointer;min-width:36px;min-height:36px;flex-shrink:0}
body.has-mobile-bar .pwa-install,body.has-mobile-bar .ios-hint{bottom:calc(94px + env(safe-area-inset-bottom))}
@media(min-width:641px){.ios-hint{left:auto;right:18px;max-width:360px}}

/* --------------------------------------------------------------- onboarding */
.onboard{position:fixed;inset:0;z-index:300;background:var(--bg);display:none;align-items:center;justify-content:center;padding:16px}
.onboard.open{display:flex;animation:fadeIn .2s}
.onboard-card{width:100%;max-width:520px;background:var(--surface);border:1px solid var(--border);border-radius:26px;box-shadow:var(--shadow-2);padding:clamp(20px,4vw,30px);position:relative;overflow:hidden}
.onboard-skip{position:absolute;top:14px;right:14px;height:38px;padding:0 14px;border-radius:var(--r-pill);border:1px solid var(--border);background:transparent;color:var(--muted);font:inherit;font-size:13.5px;font-weight:600;cursor:pointer;z-index:2}
.onboard-skip:hover{color:var(--text);border-color:var(--border-strong)}
.onboard-art{height:168px;border-radius:20px;background:var(--accent-soft);display:flex;align-items:center;justify-content:center;margin-bottom:22px;overflow:hidden}
.onboard-art .logo-icon{width:62px;height:62px;border-radius:18px}
.onboard-art .logo-icon .ico{width:30px;height:30px}
.onboard-tiles{display:grid;grid-template-columns:repeat(3,52px);gap:8px}
.onboard-tiles i{display:block;width:52px;height:52px;border-radius:12px;background:var(--surface);border:1px solid var(--border);animation:pop .45s var(--ease) both}
.onboard-tiles i:nth-child(2){animation-delay:.06s}
.onboard-tiles i:nth-child(3){animation-delay:.12s}
.onboard-tiles i:nth-child(4){animation-delay:.18s}
.onboard-tiles i:nth-child(5){animation-delay:.24s}
.onboard-tiles i:nth-child(6){animation-delay:.3s;background:var(--accent);border-color:transparent}
.onboard-chips{display:flex;flex-direction:column;gap:10px;align-items:center}
.onboard-chip{display:inline-flex;align-items:center;gap:9px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r-pill);padding:11px 18px;font-size:15px;font-weight:600;color:var(--text);animation:pop .45s var(--ease) both}
.onboard-chip .ico{color:var(--accent-text)}
.onboard-chip:nth-child(2){animation-delay:.1s}
.onboard-step h2{margin-bottom:8px}
.onboard-step p{color:var(--muted);font-size:15px;line-height:1.6;margin-bottom:20px}
.onboard-dots{display:flex;gap:6px;justify-content:center;margin-bottom:18px}
.onboard-dots button{width:7px;height:7px;padding:0;border:none;border-radius:var(--r-pill);background:var(--border-strong);cursor:pointer;transition:width .25s var(--ease),background .25s}
.onboard-dots button.on{width:20px;background:var(--accent)}
.onboard-actions{display:flex;gap:10px}
.onboard-actions .btn{flex:1}

@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes pop{from{opacity:0;transform:scale(.97)}to{opacity:1;transform:none}}
@keyframes toastIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.55}}
@keyframes spin{to{transform:rotate(360deg)}}

@media(max-width:640px){
  .wrap{padding:0 14px}
  .nav-user{display:none!important}
  .grid{grid-template-columns:repeat(3,1fr);gap:6px}
  .card-list.grid{grid-template-columns:repeat(2,1fr);gap:10px}
  .card-list.grid .card-thumb{height:130px}
  .bar{display:none}
  .mobile-bar{display:flex}
  body.has-mobile-bar{padding-bottom:84px}
  body.has-mobile-bar .theme-toggle{bottom:calc(86px + env(safe-area-inset-bottom))}
  body.selecting .theme-toggle{display:none}
  .topbar-title{display:none}
  .topbar-actions .nav-logo{display:none}
  .modal{padding:0;align-items:flex-end}
  .modal-card{max-width:none;max-height:92vh;border-radius:var(--r-lg) var(--r-lg) 0 0;padding-bottom:calc(22px + env(safe-area-inset-bottom))}
  .select-bar{bottom:calc(88px + env(safe-area-inset-bottom));width:calc(100vw - 20px);justify-content:space-between;padding:6px 8px}
  .select-bar .count{font-size:12.5px;padding:0 4px}
  .select-bar .btn.small{height:36px;padding:0 12px;font-size:12.5px}
  .toolbar .grow{flex:1 1 100%}
  .toolbar input,.toolbar select{flex:1;min-width:0}
  .photo-btn{width:40px;height:40px}
  .create-bar{flex-direction:column}
  .create-bar .btn{width:100%}
}
@media(max-width:420px){.grid{grid-template-columns:repeat(2,1fr)}#selAll{display:none}}
@media(min-width:641px){.grid{grid-template-columns:repeat(4,1fr)}}
@media(min-width:1000px){
  .grid{grid-template-columns:repeat(5,1fr)}
  .card-list:not(.grid){display:grid;grid-template-columns:repeat(2,1fr)}
}
@media(prefers-reduced-motion:reduce){*{animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.001ms!important}}
`

export function TOAST_JS(): string {
  return `
function toast(msg, type) {
  let c = document.getElementById('toast-container');
  if (!c) { c = document.createElement('div'); c.id = 'toast-container'; document.body.appendChild(c); }
  const t = document.createElement('div');
  t.className = 'toast ' + (type || '');
  const glyph = type === 'success' ? 'ico-check' : type === 'error' ? 'ico-alert' : 'ico-image';
  t.innerHTML = '<i class="ico ' + glyph + '"></i><span>' + esc(msg) + '</span>';
  c.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateY(8px)'; t.style.transition = 'all .25s'; setTimeout(() => t.remove(), 250); }, 3200);
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
function applyTheme(theme){ document.documentElement.dataset.theme = theme; try { localStorage.setItem('tts.theme', theme); } catch(e){} }
function toggleTheme(){ applyTheme(document.documentElement.dataset.theme === 'light' ? 'dark' : 'light'); }
(function(){
  var saved = null; try { saved = localStorage.getItem('tts.theme') || localStorage.getItem('photoshare.theme'); } catch(e){}
  var prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
  document.documentElement.dataset.theme = saved || (prefersLight ? 'light' : 'dark');
  var btn = document.createElement('button');
  btn.className = 'theme-toggle';
  btn.type = 'button';
  btn.setAttribute('aria-label', 'Toggle light and dark theme');
  var sync = function(){ btn.innerHTML = '<i class="ico ' + (document.documentElement.dataset.theme === 'light' ? 'ico-moon' : 'ico-sun') + '"></i>'; };
  btn.addEventListener('click', function(){ toggleTheme(); sync(); });
  sync();
  document.body.appendChild(btn);
})();
`
}

export function PWA_JS(): string {
  return `
(function(){
  var standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  if (standalone) return;
  var btn = null;
  window.addEventListener('beforeinstallprompt', function(e){
    e.preventDefault();
    if (!btn) {
      btn = document.createElement('button');
      btn.className = 'pwa-install';
      btn.type = 'button';
      btn.textContent = 'Install app';
      btn.addEventListener('click', function(){ try { e.prompt(); } catch(err){} btn.classList.remove('show'); });
      document.body.appendChild(btn);
      window.addEventListener('appinstalled', function(){ btn.remove(); });
    }
    btn.classList.add('show');
  });
  var ua = navigator.userAgent || '';
  var isIos = /iPad|iPhone|iPod/.test(ua);
  var isSafari = isIos && /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
  if (!isSafari) return;
  try { if (sessionStorage.getItem('tts.ioshint')) return; } catch(e){}
  var hint = document.createElement('div');
  hint.className = 'ios-hint';
  hint.innerHTML = '<span><strong>Add to Home Screen</strong>Tap Share, then “Add to Home Screen”.</span>';
  var close = document.createElement('button');
  close.type = 'button';
  close.setAttribute('aria-label', 'Dismiss install hint');
  close.textContent = '\\u2715';
  close.addEventListener('click', function(){ hint.remove(); try { sessionStorage.setItem('tts.ioshint','1'); } catch(e){} });
  hint.appendChild(close);
  document.body.appendChild(hint);
  setTimeout(function(){ hint.classList.add('show'); }, 1500);
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
<meta name="theme-color" content="#16110d" media="(prefers-color-scheme: dark)">
<meta name="theme-color" content="#f9f4ec" media="(prefers-color-scheme: light)">
<title>${htmlEscape(title)}</title>
${FONTS}
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

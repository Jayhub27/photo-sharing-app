export interface PageMeta {
  title: string
  description?: string
  image?: string
}

export const SHARED_CSS = `
@font-face{font-family:'Orbitron';font-style:normal;font-weight:400 900;font-display:swap;src:url('/fonts/orbitron-latin.woff2') format('woff2')}
@font-face{font-family:'Share Tech Mono';font-style:normal;font-weight:400;font-display:swap;src:url('/fonts/sharetechmono-latin.woff2') format('woff2')}
*{margin:0;padding:0;box-sizing:border-box}
input,select,textarea,button{font-family:inherit}
:root{
  --bg:#05010f;--surface:rgba(12,5,32,.78);--surface2:#0d0526;--card:rgba(12,5,32,.9);
  --border:rgba(0,240,255,.28);
  --text:#e8f6ff;--muted:#9fb3d0;--accent:#00f0ff;--accent2:#9d4bff;--accent3:#ff2bd6;
  --grad:linear-gradient(135deg,#00f0ff 0%,#9d4bff 50%,#ff2bd6 100%);
  --grad-soft:linear-gradient(135deg,rgba(0,240,255,.14),rgba(157,75,255,.14),rgba(255,43,214,.14));
  --glow:0 0 8px rgba(0,240,255,.55),0 0 26px rgba(0,240,255,.22);
  --glow-magenta:0 0 8px rgba(255,43,214,.55),0 0 26px rgba(255,43,214,.2);
  --shadow:0 0 18px rgba(0,240,255,.12);--shadow-lg:0 0 34px rgba(157,75,255,.22);
  --display:'Orbitron','Arial Black',Impact,sans-serif;
  --mono:'Share Tech Mono',ui-monospace,SFMono-Regular,Menlo,monospace;
  --radius:4px;
  --transition:cubic-bezier(.22,1,.36,1);--wrap:1080px;
}
html[data-theme="light"]{
  --bg:#eef4ff;--surface:rgba(255,255,255,.94);--surface2:#e2ecfb;--card:#ffffff;
  --border:rgba(0,120,170,.32);--text:#08122b;--muted:#4a5d7d;
  --accent:#008fb3;--accent2:#6d28d9;--accent3:#d61fae;
  --grad:linear-gradient(135deg,#008fb3 0%,#6d28d9 50%,#d61fae 100%);
  --grad-soft:linear-gradient(135deg,rgba(0,143,179,.12),rgba(109,40,217,.12),rgba(214,31,174,.12));
  --glow:0 0 8px rgba(0,143,179,.35),0 0 22px rgba(0,143,179,.15);
  --glow-magenta:0 0 8px rgba(214,31,174,.35),0 0 22px rgba(214,31,174,.15);
  --shadow:0 0 16px rgba(0,120,170,.14);--shadow-lg:0 0 30px rgba(109,40,217,.16);
}
body{font-family:var(--mono);background-color:var(--bg);color:var(--text);min-height:100vh;min-height:100dvh;overflow-x:hidden;-webkit-tap-highlight-color:transparent;font-size:16px;line-height:1.55}
body::before{content:'';position:fixed;inset:0;background:radial-gradient(ellipse at 50% -10%,rgba(157,75,255,.30),transparent 55%),radial-gradient(ellipse at 90% 110%,rgba(255,43,214,.14),transparent 50%);pointer-events:none;z-index:0}
body::after{content:'';position:fixed;inset:-46px;background-image:linear-gradient(rgba(0,240,255,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(255,43,214,.06) 1px,transparent 1px);background-size:46px 46px;animation:neonGrid 14s linear infinite;pointer-events:none;z-index:0}
@keyframes neonGrid{to{transform:translate(46px,46px)}}
.wrap{max-width:var(--wrap);margin:0 auto;padding:0 20px;position:relative;z-index:1}
@keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes scaleIn{from{opacity:0;transform:scale(.92)}to{opacity:1;transform:scale(1)}}
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
@keyframes slideDown{from{opacity:0;max-height:0;transform:translateY(-8px)}to{opacity:1;max-height:600px;transform:translateY(0)}}
@keyframes toastIn{from{opacity:0;transform:translateY(20px) scale(.95)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes glow{0%,100%{box-shadow:0 0 20px rgba(0,240,255,.35)}50%{box-shadow:0 0 40px rgba(255,43,214,.55)}}
@keyframes spin{to{transform:rotate(360deg)}}
.hero{padding:clamp(28px,5vw,48px) 0 clamp(20px,3vw,32px);animation:fadeUp .6s var(--transition)}
.logo{display:flex;align-items:center;gap:12px;margin-bottom:28px}
.logo-icon{width:44px;height:44px;border-radius:4px;background:var(--grad);display:flex;align-items:center;justify-content:center;font-size:22px;box-shadow:var(--glow)}
.logo-text{font-family:var(--display);font-size:20px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}
h1{font-family:var(--display);font-size:clamp(22px,4.2vw,34px);font-weight:800;letter-spacing:.02em;line-height:1.18;margin-bottom:8px;text-transform:uppercase;text-shadow:0 0 12px rgba(0,240,255,.3),0 0 34px rgba(157,75,255,.25)}
h1 .grad{background:var(--grad);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;filter:drop-shadow(0 0 10px rgba(0,240,255,.35))}
.sub{color:var(--muted);font-size:clamp(14px,2.2vw,17px);line-height:1.6;margin-bottom:28px;max-width:560px}
.create-bar{display:flex;gap:10px;margin-bottom:28px;animation:fadeUp .6s .1s var(--transition) both}
.create-bar input{flex:1;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:15px 18px;font-size:16px;color:var(--text);min-height:48px;transition:border-color .3s var(--transition),box-shadow .3s var(--transition)}
.create-bar input:focus{outline:none;border-color:var(--accent);box-shadow:0 0 0 3px rgba(0,240,255,.22)}
.create-bar input::placeholder{color:#7f93b3}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;background:rgba(0,240,255,.07);color:var(--accent);border:1px solid rgba(0,240,255,.55);padding:14px 24px;min-height:46px;border-radius:var(--radius);font-family:var(--display);font-size:13px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;text-shadow:0 0 8px rgba(0,240,255,.55);box-shadow:0 0 12px rgba(0,240,255,.18),inset 0 0 14px rgba(0,240,255,.08);cursor:pointer;text-decoration:none;transition:transform .2s var(--transition),box-shadow .2s var(--transition),background .2s,color .2s;white-space:nowrap}
.btn:hover{transform:translateY(-2px);color:#fff;background:linear-gradient(90deg,rgba(0,240,255,.22),rgba(255,43,214,.22));box-shadow:0 0 26px rgba(0,240,255,.5),inset 0 0 20px rgba(255,43,214,.16)}
.btn:active{transform:translateY(0) scale(.99)}
.btn.outline{background:transparent;border:1px solid rgba(255,43,214,.55);color:var(--accent3);text-shadow:0 0 8px rgba(255,43,214,.55);box-shadow:0 0 12px rgba(255,43,214,.15),inset 0 0 14px rgba(255,43,214,.07)}
.btn.outline:hover{border-color:var(--accent3);background:rgba(255,43,214,.14);color:#fff;box-shadow:0 0 26px rgba(255,43,214,.45)}
.btn.danger{background:rgba(255,77,109,.12);color:#ff6b81;border:1px solid rgba(255,77,109,.5);box-shadow:0 0 12px rgba(255,77,109,.15)}
.btn.danger:hover{background:rgba(255,77,109,.25);box-shadow:0 0 22px rgba(255,77,109,.4)}
.btn.small{padding:9px 15px;font-size:11px;min-height:40px;letter-spacing:.1em}
.btn.icon{padding:12px;min-width:46px}
.btn[disabled]{opacity:.55;cursor:not-allowed;transform:none!important}
.section-label{font-family:var(--display);font-size:12px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.24em;margin-bottom:16px;animation:fadeIn .4s .2s both}
.card-list{display:flex;flex-direction:column;gap:12px;padding-bottom:48px}
.card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:20px 24px;text-decoration:none;color:inherit;display:flex;align-items:center;justify-content:space-between;transition:transform .25s var(--transition),border-color .25s var(--transition),box-shadow .25s var(--transition);animation:fadeUp .5s var(--transition) both}
.card:hover{transform:translateY(-3px);border-color:rgba(0,240,255,.35);box-shadow:var(--shadow)}
.card-left{display:flex;align-items:center;gap:16px;flex:1;min-width:0}
.card-thumb{width:52px;height:52px;border-radius:4px;background:var(--grad-soft);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0}
.card-info{min-width:0}
.card-title{font-size:17px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.card-sub{font-size:14px;color:var(--muted);margin-top:3px}
.card-arrow{color:var(--muted);font-size:20px;transition:transform .25s var(--transition),color .25s}
.card:hover .card-arrow{transform:translateX(4px);color:var(--accent)}
.empty{text-align:center;padding:56px 24px;animation:fadeIn .4s}
.empty-icon{font-size:52px;margin-bottom:16px;opacity:.4}
.empty-text{color:var(--muted);font-size:16px;line-height:1.6}
.skeleton-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:20px 24px;height:72px;overflow:hidden;position:relative}
.skeleton-card::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,.04),transparent);background-size:200% 100%;animation:shimmer 1.5s infinite}
/* top bar + prominent back pill */
.topbar{position:sticky;top:0;z-index:60;background:var(--bg);border-bottom:1px solid rgba(0,240,255,.3);box-shadow:0 0 18px rgba(0,240,255,.12)}
@supports (backdrop-filter:blur(14px)){.topbar{background:color-mix(in srgb,var(--bg) 82%,transparent);backdrop-filter:blur(14px)}}
.topbar-inner{max-width:var(--wrap);margin:0 auto;padding:calc(10px + env(safe-area-inset-top)) 20px 10px;display:flex;align-items:center;gap:12px}
.back-pill{display:inline-flex;align-items:center;gap:8px;padding:11px 18px;min-height:46px;border-radius:4px;background:rgba(0,240,255,.08);color:var(--accent);border:1px solid rgba(0,240,255,.5);text-decoration:none;font-family:var(--display);font-weight:700;font-size:11px;letter-spacing:.12em;text-transform:uppercase;text-shadow:0 0 8px rgba(0,240,255,.55);box-shadow:0 0 12px rgba(0,240,255,.18),inset 0 0 14px rgba(0,240,255,.08);transition:transform .2s var(--transition),box-shadow .2s var(--transition)}
.back-pill:hover{transform:translateX(-2px);box-shadow:0 0 22px rgba(0,240,255,.45)}
.topbar-title{font-weight:700;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0;color:var(--muted)}
.topbar-actions{margin-left:auto;display:flex;align-items:center;gap:10px}
.nav-logo{display:flex;align-items:center;gap:10px;text-decoration:none;color:var(--text)}
.nav-logo .logo-icon{width:38px;height:38px;border-radius:4px;font-size:19px}
.nav-logo .logo-text{font-size:18px;font-weight:700}
.nav-user{font-size:14px;color:var(--muted);display:none}
.nav-user strong{color:var(--text);font-weight:600}
@media(min-width:720px){.nav-user{display:inline}}
/* collection header: one title + one meta line */
.col-head{padding:clamp(18px,3vw,28px) 0 12px;animation:fadeUp .45s var(--transition)}
.col-head h1{margin-bottom:6px}
.meta-line{color:var(--muted);font-size:14px;display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.meta-line .dot{opacity:.45}
.meta-line .price-tag{color:var(--text);font-weight:700}
.bar{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:14px}
.menu-wrap{position:relative;margin-left:auto}
@media(max-width:640px){.menu-wrap{margin-left:0}}
.menu{position:absolute;right:0;top:calc(100% + 8px);min-width:250px;background:var(--surface);border:1px solid var(--border);border-radius:6px;padding:6px;box-shadow:var(--shadow-lg);z-index:80;display:none}
.menu.open{display:block;animation:scaleIn .16s var(--transition)}
.menu button,.menu a{display:flex;align-items:center;gap:10px;width:100%;text-align:left;background:none;border:none;color:var(--text);font-size:15px;padding:12px 14px;border-radius:4px;cursor:pointer;text-decoration:none;min-height:46px;font-family:inherit}
.menu button:hover,.menu a:hover{background:var(--surface2)}
.menu .sep{height:1px;background:var(--border);margin:6px 8px}
.menu .danger{color:#ff6b81}
.toolbar{display:flex;gap:8px;align-items:center;margin-bottom:14px;flex-wrap:wrap}
.toolbar .grow{flex:1;min-width:200px}
.toolbar input,.toolbar select{background:var(--surface);border:1px solid var(--border);border-radius:4px;padding:11px 14px;font-size:16px;color:var(--text);min-height:46px}
.toolbar input:focus,.toolbar select:focus{outline:none;border-color:var(--accent);box-shadow:0 0 0 3px rgba(0,240,255,.22)}
select.copy-btn{min-width:110px;background:var(--surface2);color:var(--text);border:1px solid var(--border);border-radius:4px;padding:12px 14px;font-size:15px;min-height:44px}
.live-dot{width:9px;height:9px;border-radius:50%;background:#a6ff00;align-self:center;animation:pulse 2s infinite;flex-shrink:0;box-shadow:0 0 8px rgba(166,255,0,.9)}
/* paywall + sales */
.paywall{display:flex;gap:14px;align-items:center;justify-content:space-between;flex-wrap:wrap;background:var(--grad-soft);border:1px solid rgba(0,240,255,.4);border-radius:6px;padding:16px 18px;margin-bottom:16px;animation:fadeUp .4s var(--transition)}
.paywall strong{font-size:17px}
.paywall .price{font-weight:800;font-size:19px}
.sales-strip{display:flex;align-items:center;justify-content:space-between;gap:12px;background:var(--surface);border:1px solid var(--border);border-radius:6px;padding:12px 16px;margin-bottom:14px;font-size:14px;color:var(--muted);flex-wrap:wrap}
.sales-strip strong{color:var(--text)}
/* photo grid + lock + selection */
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:24px}
.photo-wrap{position:relative;aspect-ratio:1;border-radius:4px;overflow:hidden;border:1px solid var(--border);animation:scaleIn .4s var(--transition) both;cursor:pointer;user-select:none;-webkit-user-select:none}
.photo-wrap img{width:100%;height:100%;object-fit:cover;transition:transform .3s var(--transition);pointer-events:none}
.photo-wrap:hover img{transform:scale(1.06)}
.photo-wrap:hover .photo-overlay{opacity:1}
.photo-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.7) 0%,transparent 60%);opacity:0;transition:opacity .25s var(--transition);display:flex;align-items:flex-end;justify-content:flex-end;padding:8px;gap:6px}
.photo-btn{width:38px;height:38px;border-radius:4px;border:none;background:rgba(255,255,255,.18);backdrop-filter:blur(8px);color:#fff;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s,transform .15s}
.photo-btn:hover{background:rgba(255,255,255,.32);transform:scale(1.08)}
.photo-btn.danger:hover{background:rgba(255,77,109,.8)}
.photo-lock{position:absolute;left:8px;top:8px;background:rgba(0,0,0,.62);backdrop-filter:blur(6px);color:#fff;border-radius:999px;padding:4px 10px;font-size:12px;font-weight:700;display:flex;gap:5px;align-items:center;pointer-events:none}
.photo-wrap.selected{outline:2px solid var(--accent);outline-offset:-2px;box-shadow:0 0 16px rgba(0,240,255,.45)}
.photo-wrap .check{position:absolute;right:8px;top:8px;width:28px;height:28px;border-radius:3px;background:rgba(0,0,0,.55);border:1.5px solid rgba(255,255,255,.8);color:#fff;font-size:16px;display:none;align-items:center;justify-content:center;pointer-events:none}
body.selecting .photo-wrap .check{display:flex}
body.selecting .photo-overlay{display:none}
.photo-wrap.selected .check{background:var(--accent);border-color:var(--accent)}
.marquee{position:fixed;border:1.5px solid var(--accent);background:rgba(0,240,255,.2);border-radius:6px;pointer-events:none;z-index:90;display:none}
.select-bar{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(18px + env(safe-area-inset-bottom));background:var(--surface);border:1px solid var(--border);box-shadow:var(--shadow-lg);border-radius:999px;padding:10px 12px;display:none;gap:8px;align-items:center;z-index:120;animation:toastIn .25s var(--transition);max-width:calc(100vw - 24px);overflow:auto}
.select-bar.open{display:flex}
.select-bar .count{font-weight:700;font-size:14px;padding:0 8px;white-space:nowrap}
.context-menu{position:fixed;min-width:210px;background:var(--surface);border:1px solid var(--border);border-radius:6px;padding:6px;box-shadow:var(--shadow-lg);z-index:160;display:none}
.context-menu.open{display:block;animation:scaleIn .14s var(--transition)}
/* modals */
.modal{position:fixed;inset:0;background:rgba(2,0,10,.8);display:none;align-items:center;justify-content:center;z-index:150;padding:20px;animation:fadeIn .18s}
@supports (backdrop-filter:blur(4px)){.modal{backdrop-filter:blur(4px)}}
.modal.open{display:flex}
.modal-card{width:100%;max-width:540px;max-height:86vh;overflow:auto;background:var(--surface);border:1px solid var(--border);border-radius:6px;padding:24px;box-shadow:var(--shadow-lg);animation:scaleIn .22s var(--transition);position:relative}
.modal-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:16px}
.modal-head h2{font-size:19px;font-weight:700}
.modal-close{width:42px;height:42px;border-radius:4px;border:1px solid var(--border);background:var(--surface2);color:var(--text);font-size:18px;cursor:pointer;flex-shrink:0}
.modal .field{margin-bottom:14px}
.modal label{display:block;font-size:13px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px}
.modal input,.modal textarea,.modal select{width:100%;background:var(--surface2);border:1px solid var(--border);border-radius:4px;padding:13px 14px;font-size:16px;color:var(--text);font-family:inherit}
.modal input:focus,.modal textarea:focus{outline:none;border-color:var(--accent);box-shadow:0 0 0 3px rgba(0,240,255,.22)}
.modal textarea{min-height:120px;resize:vertical}
.hint{font-size:13px;color:var(--muted);line-height:1.55}
.note{background:var(--surface2);border:1px solid var(--border);border-radius:4px;padding:12px 14px;font-size:14px;color:var(--muted);display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:14px}
.note strong{color:var(--text)}
.note.warn{border-color:rgba(255,209,102,.5)}
.note.warn strong{color:#ffd166}
.price-row{display:flex;gap:10px}
.price-row input{flex:1}
.price-row select{width:130px}
/* QR + share */
.qr-wrap{text-align:center;padding:8px 0}
.qr-wrap img{width:min(260px,70vw);height:auto;border-radius:6px;border:1px solid var(--border);animation:scaleIn .4s var(--transition)}
.share-link{display:flex;gap:8px;margin-top:18px;align-items:center;flex-wrap:wrap}
.share-link input{flex:1;min-width:180px;background:var(--surface2);border:1px solid var(--border);border-radius:4px;padding:12px 14px;font-size:15px;color:var(--muted)}
.copy-btn{background:var(--surface2);border:1px solid var(--border);border-radius:4px;padding:12px 16px;color:var(--text);cursor:pointer;font-size:14px;min-height:44px;font-family:inherit}
.copy-btn:hover{background:rgba(0,240,255,.16)}
/* lightbox */
.lightbox{position:fixed;inset:0;background:rgba(0,0,0,.94);display:none;align-items:center;justify-content:center;z-index:140;animation:fadeIn .2s}
.lightbox.open{display:flex}
.lightbox img{max-width:94vw;max-height:86vh;border-radius:4px;animation:scaleIn .3s var(--transition)}
.lightbox-close{position:absolute;top:calc(16px + env(safe-area-inset-top));right:16px;width:46px;height:46px;border-radius:4px;background:rgba(255,255,255,.12);border:none;color:#fff;font-size:22px;cursor:pointer;display:flex;align-items:center;justify-content:center}
.lightbox-nav{position:absolute;top:50%;transform:translateY(-50%);width:48px;height:48px;border-radius:999px;background:rgba(255,255,255,.12);border:none;color:#fff;font-size:22px;cursor:pointer;display:flex;align-items:center;justify-content:center}
.lightbox-nav.prev{left:14px}.lightbox-nav.next{right:14px}
.lightbox-nav:hover,.lightbox-close:hover{background:rgba(255,255,255,.24)}
/* toast */
#toast-container{position:fixed;bottom:calc(24px + env(safe-area-inset-bottom));left:50%;transform:translateX(-50%);z-index:200;display:flex;flex-direction:column;gap:8px;align-items:center;max-width:calc(100vw - 24px)}
.toast{background:var(--surface);border:1px solid var(--border);border-radius:4px;padding:14px 22px;font-size:15px;box-shadow:var(--shadow-lg);animation:toastIn .3s var(--transition);display:flex;align-items:center;gap:10px}
.toast.success{border-color:rgba(166,255,0,.35)}
.toast.success .dot{color:#a6ff00}
.toast.error{border-color:rgba(255,77,109,.35)}
.toast.error .dot{color:#ef4444}
.toast .dot{font-size:18px}
.spinner{width:24px;height:24px;border:2.5px solid rgba(255,255,255,.2);border-top-color:var(--accent);border-radius:50%;animation:spin .7s linear infinite}
.spinner.dark{border-color:rgba(0,240,255,.22);border-top-color:var(--accent)}
.hidden{display:none!important}
/* home extras */
.controls{display:flex;gap:10px;align-items:center;margin-bottom:20px;flex-wrap:wrap}
.controls select{background:var(--surface);border:1px solid var(--border);border-radius:4px;padding:10px 12px;color:var(--text);font-size:14px;cursor:pointer;min-height:44px}
.chips{display:flex;gap:6px;flex-wrap:wrap}
.chip{background:var(--surface);border:1px solid var(--border);border-radius:999px;padding:9px 15px;font-size:13px;color:var(--muted);cursor:pointer;font-weight:600;transition:background .2s,color .2s;min-height:42px}
.chip:hover{color:var(--text)}
.chip.active{background:var(--accent);color:var(--bg);border-color:var(--accent);font-weight:700;box-shadow:var(--glow)}
.icon-btn{width:44px;height:44px;border-radius:4px;border:1px solid var(--border);background:var(--surface);color:var(--text);font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s;flex-shrink:0}
.icon-btn:hover{background:var(--surface2)}
.card-list.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:16px}
.card-list.grid .card{flex-direction:column;align-items:stretch;gap:0;padding:0;overflow:hidden}
.card-list.grid .card-left{flex-direction:column;align-items:stretch;gap:0}
.card-list.grid .card-thumb{width:100%;height:150px;border-radius:0;border:none;border-bottom:1px solid var(--border)}
.card-list.grid .card-info{padding:14px 16px 16px}
.card-list.grid .card .card-arrow{display:none}
.card-list.grid .card:hover .card-thumb img{transform:scale(1.06)}
.card-thumb img{width:100%;height:100%;object-fit:cover;border-radius:4px;transition:transform .3s var(--transition)}
.load-wrap{text-align:center;padding:8px 0 48px}
.badge{display:inline-block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;padding:3px 8px;border-radius:999px;background:var(--surface2);border:1px solid var(--border);color:var(--muted);margin-left:8px}
.badge.owner{color:#7df9ff;border-color:rgba(0,240,255,.45)}
.badge.editor{color:#a6ff00;border-color:rgba(166,255,0,.4)}
.badge.price{color:#ffd166;border-color:rgba(255,209,102,.45)}
.member-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 0;border-bottom:1px solid var(--border)}
.member-row:last-child{border-bottom:none}
.member-name{font-weight:600;font-size:15px}
.member-email{font-size:13px;color:var(--muted)}
.sale-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 0;border-bottom:1px solid var(--border);font-size:14px}
.sale-row:last-child{border-bottom:none}
.sale-row .amount{font-weight:700}
/* theme toggle */
.theme-toggle{position:fixed;bottom:calc(18px + env(safe-area-inset-bottom));right:18px;z-index:130;width:46px;height:46px;border-radius:4px;border:1px solid var(--border);background:var(--surface);color:var(--text);font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:transform .2s var(--transition),background .2s;box-shadow:var(--shadow)}
.theme-toggle:hover{transform:translateY(-2px);box-shadow:var(--glow)}
:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.skip-link{position:absolute;left:-9999px;top:0;background:var(--surface);color:var(--text);padding:10px 16px;border-radius:0 0 4px 0;z-index:400}
.skip-link:focus{left:0}
/* auth pages */
.auth-wrap{max-width:420px;margin:0 auto;padding:calc(24px + env(safe-area-inset-top)) 20px 24px;min-height:100vh;min-height:100dvh;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;z-index:1}
.auth-card{width:100%;background:var(--surface);border:1px solid var(--border);border-radius:6px;padding:clamp(24px,5vw,36px);animation:fadeUp .5s var(--transition);box-shadow:var(--shadow)}
.auth-logo{width:56px;height:56px;border-radius:6px;background:var(--grad);display:flex;align-items:center;justify-content:center;font-size:28px;margin:0 auto 24px;box-shadow:var(--glow)}
.auth-title{font-size:24px;font-weight:800;text-align:center;margin-bottom:6px;letter-spacing:-.5px}
.auth-sub{color:var(--muted);font-size:15px;text-align:center;margin-bottom:28px}
.auth-field{margin-bottom:16px}
.auth-field label{display:block;font-size:13px;font-weight:600;color:var(--muted);margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px}
.auth-field input{width:100%;background:var(--surface2);border:1px solid var(--border);border-radius:4px;padding:14px 16px;font-size:16px;color:var(--text);transition:border-color .3s,box-shadow .3s}
.auth-field input:focus{outline:none;border-color:var(--accent);box-shadow:0 0 0 3px rgba(0,240,255,.22)}
.auth-field input::placeholder{color:#7f93b3}
.auth-btn{width:100%;margin-top:8px}
.auth-footer{text-align:center;margin-top:24px;font-size:15px;color:var(--muted)}
.auth-footer a{color:var(--accent);text-decoration:none;font-weight:600}
.auth-footer a:hover{text-decoration:underline}
.auth-back{display:inline-flex;align-items:center;gap:6px;color:var(--muted);text-decoration:none;font-size:14px;margin-bottom:20px;transition:color .2s;min-height:44px}
.auth-back:hover{color:var(--text)}
/* mobile optimizations */
.mobile-bar{position:fixed;left:0;right:0;bottom:0;z-index:70;display:none;gap:8px;padding:10px 12px calc(10px + env(safe-area-inset-bottom));background:var(--bg);border-top:1px solid var(--border)}
@supports (backdrop-filter:blur(14px)){.mobile-bar{background:color-mix(in srgb,var(--bg) 88%,transparent);backdrop-filter:blur(14px)}}
.mobile-bar .btn{flex:1;min-height:48px;padding:10px 8px;flex-direction:column;gap:2px;font-size:12px;border-radius:6px}
.mobile-bar .btn .ico{font-size:19px;line-height:1}
@media(max-width:640px){
  .wrap{padding:0 14px}
  .grid{grid-template-columns:repeat(3,1fr);gap:8px}
  .card-list.grid{grid-template-columns:repeat(2,1fr);gap:12px}
  .card-list:not(.grid) .card{padding:16px}
  .bar{display:none}
  .mobile-bar{display:flex}
  body.has-mobile-bar{padding-bottom:86px}
  body.has-mobile-bar .theme-toggle{bottom:calc(88px + env(safe-area-inset-bottom))}
  body.selecting .theme-toggle{display:none}
  .topbar-title{display:none}
  .topbar-inner{padding:calc(10px + env(safe-area-inset-top)) 14px 10px;gap:8px}
  .topbar-actions .nav-logo{display:none}
  .back-pill{padding:10px 14px;font-size:13px}
  .modal{padding:0;align-items:flex-end}
  .modal-card{max-width:none;max-height:92vh;border-radius:6px 6px 0 0;padding-bottom:calc(24px + env(safe-area-inset-bottom))}
  .select-bar{bottom:calc(90px + env(safe-area-inset-bottom));width:calc(100vw - 20px);justify-content:space-between;padding:8px 10px}
  .select-bar .count{font-size:13px;padding:0 4px}
  .select-bar .btn.small{padding:8px 10px;font-size:13px;min-height:38px}
  .toolbar .grow{flex:1 1 100%}
  .toolbar input,.toolbar select{flex:1;min-width:0}
  .photo-btn{width:42px;height:42px}
  .col-head{padding-top:16px}
}
@media(max-width:420px){.grid{grid-template-columns:repeat(2,1fr)}#selAll{display:none}}
@media(min-width:641px){.grid{grid-template-columns:repeat(4,1fr)}}
@media(min-width:1000px){
  .grid{grid-template-columns:repeat(5,1fr)}
  .card-list.grid{grid-template-columns:repeat(auto-fill,minmax(210px,1fr))}
  .card-list:not(.grid){display:grid;grid-template-columns:repeat(2,1fr)}
}
@media(prefers-reduced-motion:reduce){*{animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.001ms!important;scroll-behavior:auto!important}}
/* PWA install + iOS add-to-home-screen hint */
.pwa-install{position:fixed;left:18px;bottom:calc(18px + env(safe-area-inset-bottom));z-index:130;display:none;align-items:center;gap:8px;padding:12px 18px;min-height:46px;border-radius:999px;border:1px solid var(--border);background:var(--surface);color:var(--text);font-size:14px;font-weight:600;font-family:inherit;cursor:pointer;box-shadow:var(--shadow);transition:transform .2s var(--transition)}
.pwa-install.show{display:inline-flex}
.pwa-install:active{transform:scale(.97)}
.pwa-install:hover{box-shadow:var(--glow)}
.ios-hint{position:fixed;left:12px;right:12px;bottom:calc(12px + env(safe-area-inset-bottom));z-index:140;display:none;gap:12px;align-items:flex-start;background:var(--surface);border:1px solid var(--border);border-radius:6px;padding:14px 16px;box-shadow:var(--shadow-lg);font-size:14px;line-height:1.5;animation:toastIn .3s var(--transition)}
.ios-hint.show{display:flex}
.ios-hint strong{display:block;margin-bottom:2px}
.ios-hint button{margin-left:auto;background:none;border:none;color:var(--muted);font-size:17px;cursor:pointer;padding:4px;min-width:36px;min-height:36px;flex-shrink:0}
body.has-mobile-bar .pwa-install{bottom:calc(88px + env(safe-area-inset-bottom))}
body.has-mobile-bar .ios-hint{bottom:calc(88px + env(safe-area-inset-bottom))}
@media(min-width:641px){.ios-hint{left:auto;right:18px;max-width:340px}}
/* upload dropzone */
.dropzone{border:2px dashed var(--border);border-radius:6px;padding:24px 16px;text-align:center;cursor:pointer;transition:border-color .2s,background .2s}
.dropzone:hover,.dropzone.drag{border-color:var(--accent);background:var(--grad-soft)}
.dropzone-icon{font-size:34px;margin-bottom:8px}
.dropzone-text{color:var(--muted);font-size:14px}
.dropzone-actions{display:flex;gap:10px;justify-content:center;margin-top:16px;flex-wrap:wrap}
.dropzone-actions .btn{min-height:46px}
`

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
  var color = theme === 'light' ? '#eef4ff' : '#05010f';
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
<meta name="theme-color" content="#05010f" media="(prefers-color-scheme: dark)">
<meta name="theme-color" content="#eef4ff" media="(prefers-color-scheme: light)">
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

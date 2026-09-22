export interface PageMeta {
  title: string
  description?: string
  image?: string
}

export const SHARED_CSS = `
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --bg:#0a0a0f;--surface:#13131a;--surface2:#1a1a24;--border:rgba(255,255,255,.08);
  --text:#f1f5f9;--muted:#94a3b8;--accent:#6366f1;--accent2:#a855f7;--accent3:#ec4899;
  --grad:linear-gradient(135deg,#6366f1 0%,#a855f7 50%,#ec4899 100%);
  --grad-soft:linear-gradient(135deg,rgba(99,102,241,.15),rgba(168,85,247,.15),rgba(236,72,153,.15));
  --radius:16px;--shadow:0 8px 32px rgba(0,0,0,.4);--shadow-lg:0 24px 64px rgba(0,0,0,.5);
  --transition:cubic-bezier(.22,1,.36,1);--wrap:1080px;
}
html[data-theme="light"]{
  --bg:#f4f5fb;--surface:#ffffff;--surface2:#eef0f7;--card:#ffffff;
  --border:rgba(15,23,42,.1);--text:#0f172a;--muted:#5b6478;
  --shadow:0 8px 32px rgba(15,23,42,.08);--shadow-lg:0 24px 64px rgba(15,23,42,.12);
}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;background:var(--bg);color:var(--text);min-height:100vh;overflow-x:hidden;-webkit-tap-highlight-color:transparent}
body::before{content:'';position:fixed;inset:0;background:radial-gradient(ellipse at top left,rgba(99,102,241,.12),transparent 50%),radial-gradient(ellipse at bottom right,rgba(236,72,153,.08),transparent 50%);pointer-events:none;z-index:0}
.wrap{max-width:var(--wrap);margin:0 auto;padding:0 20px;position:relative;z-index:1}
@keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes scaleIn{from{opacity:0;transform:scale(.92)}to{opacity:1;transform:scale(1)}}
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
@keyframes slideDown{from{opacity:0;max-height:0;transform:translateY(-8px)}to{opacity:1;max-height:600px;transform:translateY(0)}}
@keyframes toastIn{from{opacity:0;transform:translateY(20px) scale(.95)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes glow{0%,100%{box-shadow:0 0 20px rgba(99,102,241,.3)}50%{box-shadow:0 0 40px rgba(168,85,247,.5)}}
@keyframes spin{to{transform:rotate(360deg)}}
.hero{padding:clamp(28px,5vw,48px) 0 clamp(20px,3vw,32px);animation:fadeUp .6s var(--transition)}
.logo{display:flex;align-items:center;gap:12px;margin-bottom:28px}
.logo-icon{width:44px;height:44px;border-radius:12px;background:var(--grad);display:flex;align-items:center;justify-content:center;font-size:22px;box-shadow:0 4px 20px rgba(99,102,241,.4)}
.logo-text{font-size:22px;font-weight:700;letter-spacing:-.5px}
h1{font-size:clamp(24px,4.4vw,36px);font-weight:800;letter-spacing:-1.2px;line-height:1.15;margin-bottom:8px}
h1 .grad{background:var(--grad);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.sub{color:var(--muted);font-size:clamp(14px,2.2vw,17px);line-height:1.6;margin-bottom:28px;max-width:560px}
.create-bar{display:flex;gap:10px;margin-bottom:28px;animation:fadeUp .6s .1s var(--transition) both}
.create-bar input{flex:1;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:15px 18px;font-size:16px;color:var(--text);min-height:48px;transition:border-color .3s var(--transition),box-shadow .3s var(--transition)}
.create-bar input:focus{outline:none;border-color:var(--accent);box-shadow:0 0 0 3px rgba(99,102,241,.2)}
.create-bar input::placeholder{color:#64748b}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;background:var(--grad);color:#fff;border:none;padding:14px 24px;min-height:46px;border-radius:var(--radius);font-size:15px;font-weight:600;cursor:pointer;text-decoration:none;transition:transform .2s var(--transition),box-shadow .2s var(--transition);white-space:nowrap}
.btn:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(99,102,241,.35)}
.btn:active{transform:translateY(0)}
.btn.outline{background:transparent;border:1.5px solid var(--border);color:var(--text)}
.btn.outline:hover{border-color:var(--accent);box-shadow:0 4px 16px rgba(99,102,241,.2)}
.btn.danger{background:rgba(239,68,68,.15);color:#f87171;border:1px solid rgba(239,68,68,.3)}
.btn.danger:hover{background:rgba(239,68,68,.25)}
.btn.small{padding:9px 15px;font-size:14px;min-height:40px}
.btn.icon{padding:12px;min-width:46px}
.btn[disabled]{opacity:.55;cursor:not-allowed;transform:none!important}
.section-label{font-size:13px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:16px;animation:fadeIn .4s .2s both}
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
.empty{text-align:center;padding:56px 24px;animation:fadeIn .4s}
.empty-icon{font-size:52px;margin-bottom:16px;opacity:.4}
.empty-text{color:var(--muted);font-size:16px;line-height:1.6}
.skeleton-card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:20px 24px;height:72px;overflow:hidden;position:relative}
.skeleton-card::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,.04),transparent);background-size:200% 100%;animation:shimmer 1.5s infinite}
/* top bar + prominent back pill */
.topbar{position:sticky;top:0;z-index:60;background:var(--bg);border-bottom:1px solid var(--border)}
@supports (backdrop-filter:blur(14px)){.topbar{background:color-mix(in srgb,var(--bg) 82%,transparent);backdrop-filter:blur(14px)}}
.topbar-inner{max-width:var(--wrap);margin:0 auto;padding:10px 20px;display:flex;align-items:center;gap:12px}
.back-pill{display:inline-flex;align-items:center;gap:8px;padding:11px 18px;min-height:46px;border-radius:999px;background:var(--grad);color:#fff;text-decoration:none;font-weight:700;font-size:14px;box-shadow:0 6px 20px rgba(99,102,241,.35);transition:transform .2s var(--transition)}
.back-pill:hover{transform:translateX(-2px)}
.topbar-title{font-weight:700;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0;color:var(--muted)}
.topbar-actions{margin-left:auto;display:flex;align-items:center;gap:10px}
.nav-logo{display:flex;align-items:center;gap:10px;text-decoration:none;color:var(--text)}
.nav-logo .logo-icon{width:38px;height:38px;border-radius:11px;font-size:19px}
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
.menu{position:absolute;right:0;top:calc(100% + 8px);min-width:250px;background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:6px;box-shadow:var(--shadow-lg);z-index:80;display:none}
.menu.open{display:block;animation:scaleIn .16s var(--transition)}
.menu button,.menu a{display:flex;align-items:center;gap:10px;width:100%;text-align:left;background:none;border:none;color:var(--text);font-size:15px;padding:12px 14px;border-radius:10px;cursor:pointer;text-decoration:none;min-height:46px;font-family:inherit}
.menu button:hover,.menu a:hover{background:var(--surface2)}
.menu .sep{height:1px;background:var(--border);margin:6px 8px}
.menu .danger{color:#f87171}
.toolbar{display:flex;gap:8px;align-items:center;margin-bottom:14px;flex-wrap:wrap}
.toolbar .grow{flex:1;min-width:200px}
.toolbar input,.toolbar select{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:11px 14px;font-size:16px;color:var(--text);min-height:46px}
.toolbar input:focus,.toolbar select:focus{outline:none;border-color:var(--accent);box-shadow:0 0 0 3px rgba(99,102,241,.2)}
select.copy-btn{min-width:110px;background:var(--surface2);color:var(--text);border:1px solid var(--border);border-radius:10px;padding:12px 14px;font-size:15px;min-height:44px}
.live-dot{width:9px;height:9px;border-radius:50%;background:#22c55e;align-self:center;animation:pulse 2s infinite;flex-shrink:0}
/* paywall + sales */
.paywall{display:flex;gap:14px;align-items:center;justify-content:space-between;flex-wrap:wrap;background:var(--grad-soft);border:1px solid rgba(99,102,241,.35);border-radius:16px;padding:16px 18px;margin-bottom:16px;animation:fadeUp .4s var(--transition)}
.paywall strong{font-size:17px}
.paywall .price{font-weight:800;font-size:19px}
.sales-strip{display:flex;align-items:center;justify-content:space-between;gap:12px;background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:12px 16px;margin-bottom:14px;font-size:14px;color:var(--muted);flex-wrap:wrap}
.sales-strip strong{color:var(--text)}
/* photo grid + lock + selection */
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:24px}
.photo-wrap{position:relative;aspect-ratio:1;border-radius:10px;overflow:hidden;border:1px solid var(--border);animation:scaleIn .4s var(--transition) both;cursor:pointer;user-select:none;-webkit-user-select:none}
.photo-wrap img{width:100%;height:100%;object-fit:cover;transition:transform .3s var(--transition);pointer-events:none}
.photo-wrap:hover img{transform:scale(1.06)}
.photo-wrap:hover .photo-overlay{opacity:1}
.photo-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.7) 0%,transparent 60%);opacity:0;transition:opacity .25s var(--transition);display:flex;align-items:flex-end;justify-content:flex-end;padding:8px;gap:6px}
.photo-btn{width:38px;height:38px;border-radius:10px;border:none;background:rgba(255,255,255,.18);backdrop-filter:blur(8px);color:#fff;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s,transform .15s}
.photo-btn:hover{background:rgba(255,255,255,.32);transform:scale(1.08)}
.photo-btn.danger:hover{background:rgba(239,68,68,.7)}
.photo-lock{position:absolute;left:8px;top:8px;background:rgba(0,0,0,.62);backdrop-filter:blur(6px);color:#fff;border-radius:999px;padding:4px 10px;font-size:12px;font-weight:700;display:flex;gap:5px;align-items:center;pointer-events:none}
.photo-wrap.selected{outline:3px solid var(--accent);outline-offset:-3px}
.photo-wrap .check{position:absolute;right:8px;top:8px;width:28px;height:28px;border-radius:9px;background:rgba(0,0,0,.55);border:1.5px solid rgba(255,255,255,.8);color:#fff;font-size:16px;display:none;align-items:center;justify-content:center;pointer-events:none}
body.selecting .photo-wrap .check{display:flex}
body.selecting .photo-overlay{display:none}
.photo-wrap.selected .check{background:var(--accent);border-color:var(--accent)}
.marquee{position:fixed;border:1.5px solid var(--accent);background:rgba(99,102,241,.18);border-radius:6px;pointer-events:none;z-index:90;display:none}
.select-bar{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(18px + env(safe-area-inset-bottom));background:var(--surface);border:1px solid var(--border);box-shadow:var(--shadow-lg);border-radius:999px;padding:10px 12px;display:none;gap:8px;align-items:center;z-index:120;animation:toastIn .25s var(--transition);max-width:calc(100vw - 24px);overflow:auto}
.select-bar.open{display:flex}
.select-bar .count{font-weight:700;font-size:14px;padding:0 8px;white-space:nowrap}
.context-menu{position:fixed;min-width:210px;background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:6px;box-shadow:var(--shadow-lg);z-index:160;display:none}
.context-menu.open{display:block;animation:scaleIn .14s var(--transition)}
/* modals */
.modal{position:fixed;inset:0;background:rgba(3,3,8,.72);display:none;align-items:center;justify-content:center;z-index:150;padding:20px;animation:fadeIn .18s}
@supports (backdrop-filter:blur(4px)){.modal{backdrop-filter:blur(4px)}}
.modal.open{display:flex}
.modal-card{width:100%;max-width:540px;max-height:86vh;overflow:auto;background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:24px;box-shadow:var(--shadow-lg);animation:scaleIn .22s var(--transition);position:relative}
.modal-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:16px}
.modal-head h2{font-size:19px;font-weight:700}
.modal-close{width:42px;height:42px;border-radius:12px;border:1px solid var(--border);background:var(--surface2);color:var(--text);font-size:18px;cursor:pointer;flex-shrink:0}
.modal .field{margin-bottom:14px}
.modal label{display:block;font-size:13px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px}
.modal input,.modal textarea,.modal select{width:100%;background:var(--surface2);border:1px solid var(--border);border-radius:12px;padding:13px 14px;font-size:16px;color:var(--text);font-family:inherit}
.modal input:focus,.modal textarea:focus{outline:none;border-color:var(--accent);box-shadow:0 0 0 3px rgba(99,102,241,.2)}
.modal textarea{min-height:120px;resize:vertical}
.hint{font-size:13px;color:var(--muted);line-height:1.55}
.note{background:var(--surface2);border:1px solid var(--border);border-radius:12px;padding:12px 14px;font-size:14px;color:var(--muted);display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:14px}
.note strong{color:var(--text)}
.note.warn{border-color:rgba(245,158,11,.45)}
.note.warn strong{color:#fbbf24}
.price-row{display:flex;gap:10px}
.price-row input{flex:1}
.price-row select{width:130px}
/* QR + share */
.qr-wrap{text-align:center;padding:8px 0}
.qr-wrap img{width:min(260px,70vw);height:auto;border-radius:20px;border:1px solid var(--border);animation:scaleIn .4s var(--transition)}
.share-link{display:flex;gap:8px;margin-top:18px;align-items:center;flex-wrap:wrap}
.share-link input{flex:1;min-width:180px;background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:12px 14px;font-size:15px;color:var(--muted)}
.copy-btn{background:var(--surface2);border:1px solid var(--border);border-radius:10px;padding:12px 16px;color:var(--text);cursor:pointer;font-size:14px;min-height:44px;font-family:inherit}
.copy-btn:hover{background:rgba(99,102,241,.15)}
/* lightbox */
.lightbox{position:fixed;inset:0;background:rgba(0,0,0,.94);display:none;align-items:center;justify-content:center;z-index:140;animation:fadeIn .2s}
.lightbox.open{display:flex}
.lightbox img{max-width:94vw;max-height:86vh;border-radius:12px;animation:scaleIn .3s var(--transition)}
.lightbox-close{position:absolute;top:calc(16px + env(safe-area-inset-top));right:16px;width:46px;height:46px;border-radius:12px;background:rgba(255,255,255,.12);border:none;color:#fff;font-size:22px;cursor:pointer;display:flex;align-items:center;justify-content:center}
.lightbox-nav{position:absolute;top:50%;transform:translateY(-50%);width:48px;height:48px;border-radius:999px;background:rgba(255,255,255,.12);border:none;color:#fff;font-size:22px;cursor:pointer;display:flex;align-items:center;justify-content:center}
.lightbox-nav.prev{left:14px}.lightbox-nav.next{right:14px}
.lightbox-nav:hover,.lightbox-close:hover{background:rgba(255,255,255,.24)}
/* toast */
#toast-container{position:fixed;bottom:calc(24px + env(safe-area-inset-bottom));left:50%;transform:translateX(-50%);z-index:200;display:flex;flex-direction:column;gap:8px;align-items:center;max-width:calc(100vw - 24px)}
.toast{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:14px 22px;font-size:15px;box-shadow:var(--shadow-lg);animation:toastIn .3s var(--transition);display:flex;align-items:center;gap:10px}
.toast.success{border-color:rgba(34,197,94,.3)}
.toast.success .dot{color:#22c55e}
.toast.error{border-color:rgba(239,68,68,.3)}
.toast.error .dot{color:#ef4444}
.toast .dot{font-size:18px}
.spinner{width:24px;height:24px;border:2.5px solid rgba(255,255,255,.2);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite}
.spinner.dark{border-color:rgba(99,102,241,.2);border-top-color:var(--accent)}
.hidden{display:none!important}
/* home extras */
.controls{display:flex;gap:10px;align-items:center;margin-bottom:20px;flex-wrap:wrap}
.controls select{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:10px 12px;color:var(--text);font-size:14px;cursor:pointer;min-height:44px}
.chips{display:flex;gap:6px;flex-wrap:wrap}
.chip{background:var(--surface);border:1px solid var(--border);border-radius:999px;padding:9px 15px;font-size:13px;color:var(--muted);cursor:pointer;font-weight:600;transition:background .2s,color .2s;min-height:42px}
.chip:hover{color:var(--text)}
.chip.active{background:var(--grad);color:#fff;border-color:transparent}
.icon-btn{width:44px;height:44px;border-radius:10px;border:1px solid var(--border);background:var(--surface);color:var(--text);font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s;flex-shrink:0}
.icon-btn:hover{background:var(--surface2)}
.card-list.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:16px}
.card-list.grid .card{flex-direction:column;align-items:stretch;gap:0;padding:0;overflow:hidden}
.card-list.grid .card-left{flex-direction:column;align-items:stretch;gap:0}
.card-list.grid .card-thumb{width:100%;height:150px;border-radius:0;border:none;border-bottom:1px solid var(--border)}
.card-list.grid .card-info{padding:14px 16px 16px}
.card-list.grid .card .card-arrow{display:none}
.card-list.grid .card:hover .card-thumb img{transform:scale(1.06)}
.card-thumb img{width:100%;height:100%;object-fit:cover;border-radius:12px;transition:transform .3s var(--transition)}
.load-wrap{text-align:center;padding:8px 0 48px}
.badge{display:inline-block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;padding:3px 8px;border-radius:999px;background:var(--surface2);border:1px solid var(--border);color:var(--muted);margin-left:8px}
.badge.owner{color:#a5b4fc;border-color:rgba(99,102,241,.4)}
.badge.editor{color:#86efac;border-color:rgba(34,197,94,.35)}
.badge.price{color:#fcd34d;border-color:rgba(245,158,11,.4)}
.member-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 0;border-bottom:1px solid var(--border)}
.member-row:last-child{border-bottom:none}
.member-name{font-weight:600;font-size:15px}
.member-email{font-size:13px;color:var(--muted)}
.sale-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 0;border-bottom:1px solid var(--border);font-size:14px}
.sale-row:last-child{border-bottom:none}
.sale-row .amount{font-weight:700}
/* theme toggle */
.theme-toggle{position:fixed;bottom:calc(18px + env(safe-area-inset-bottom));right:18px;z-index:130;width:46px;height:46px;border-radius:12px;border:1px solid var(--border);background:var(--surface);color:var(--text);font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:transform .2s var(--transition),background .2s;box-shadow:var(--shadow)}
.theme-toggle:hover{transform:translateY(-2px)}
:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.skip-link{position:absolute;left:-9999px;top:0;background:var(--surface);color:var(--text);padding:10px 16px;border-radius:0 0 10px 0;z-index:400}
.skip-link:focus{left:0}
/* auth pages */
.auth-wrap{max-width:420px;margin:0 auto;padding:24px 20px;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;z-index:1}
.auth-card{width:100%;background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:clamp(24px,5vw,36px);animation:fadeUp .5s var(--transition);box-shadow:var(--shadow)}
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
.auth-back{display:inline-flex;align-items:center;gap:6px;color:var(--muted);text-decoration:none;font-size:14px;margin-bottom:20px;transition:color .2s;min-height:44px}
.auth-back:hover{color:var(--text)}
/* mobile optimizations */
.mobile-bar{position:fixed;left:0;right:0;bottom:0;z-index:70;display:none;gap:8px;padding:10px 12px calc(10px + env(safe-area-inset-bottom));background:var(--bg);border-top:1px solid var(--border)}
@supports (backdrop-filter:blur(14px)){.mobile-bar{background:color-mix(in srgb,var(--bg) 88%,transparent);backdrop-filter:blur(14px)}}
.mobile-bar .btn{flex:1;min-height:48px;padding:10px 8px;flex-direction:column;gap:2px;font-size:12px;border-radius:14px}
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
  .topbar-inner{padding:10px 14px;gap:8px}
  .topbar-actions .nav-logo{display:none}
  .back-pill{padding:10px 14px;font-size:13px}
  .modal{padding:0;align-items:flex-end}
  .modal-card{max-width:none;max-height:92vh;border-radius:20px 20px 0 0;padding-bottom:calc(24px + env(safe-area-inset-bottom))}
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
  var sync = function(){ btn.textContent = document.documentElement.dataset.theme === 'light' ? '\\u2600\\ufe0f' : '\\ud83c\\udf19'; };
  btn.addEventListener('click', function(){ toggleTheme(); sync(); });
  sync();
  document.body.appendChild(btn);
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
<meta name="theme-color" content="#0a0a0f">
<title>${htmlEscape(title)}</title>
${head}
<style>${SHARED_CSS}</style>
</head>
<body${bodyClass ? ` class="${bodyClass}"` : ''}>
${body}
<script>
${TOAST_JS()}${THEME_JS()}
${script}
</script>
</body>
</html>`
}

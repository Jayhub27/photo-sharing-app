// Brutalist-flat theme: bold blocks, thick borders, hard offset shadows and amplified type.
// One CSS string is shared by every server-rendered page (see ui.ts).

export const SHARED_CSS = `
*{margin:0;padding:0;box-sizing:border-box}
input,select,textarea,button{font-family:inherit}
:root{
  --bg:#f7f4ec;--surface:#ffffff;--surface2:#f0ece1;--card:#ffffff;
  --border:#111111;
  --text:#111111;--muted:#5a564d;
  --accent:#ffd43b;--accent2:#2f6bff;--accent3:#ff5a4d;--ok:#16a34a;
  --grad:var(--accent);--grad-soft:#fff3c4;--glow:none;
  --shadow:4px 4px 0 var(--border);--shadow-lg:8px 8px 0 var(--border);
  --radius:0px;
  --sans:ui-sans-serif,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;
  --mono:ui-monospace,SFMono-Regular,Menlo,monospace;
  --transition:cubic-bezier(.2,.8,.2,1);--wrap:1080px;
}
html[data-theme="dark"]{
  --bg:#0e0d0b;--surface:#171613;--surface2:#211f1a;--card:#1b1a16;
  --border:#f4f1e8;
  --text:#f4f1e8;--muted:#b6b0a3;
  --grad-soft:#2a2410;
}
body{font-family:var(--sans);background:var(--bg);color:var(--text);min-height:100vh;min-height:100dvh;overflow-x:hidden;-webkit-tap-highlight-color:transparent;font-size:17px;line-height:1.5;font-weight:500}
.wrap{max-width:var(--wrap);margin:0 auto;padding:0 20px;position:relative;z-index:1}
@keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes scaleIn{from{opacity:0;transform:scale(.92)}to{opacity:1;transform:scale(1)}}
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
@keyframes slideDown{from{opacity:0;max-height:0;transform:translateY(-8px)}to{opacity:1;max-height:600px;transform:translateY(0)}}
@keyframes toastIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes spin{to{transform:rotate(360deg)}}
.hero{padding:clamp(30px,5vw,54px) 0 clamp(22px,3vw,34px);animation:fadeUp .45s var(--transition)}
.logo{display:flex;align-items:center;gap:12px;margin-bottom:28px}
.logo-icon{width:46px;height:46px;border-radius:0;background:var(--accent);color:#111;border:2px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:22px;box-shadow:3px 3px 0 var(--border)}
.logo-text{font-size:22px;font-weight:900;letter-spacing:-.02em;text-transform:uppercase}
h1{font-size:clamp(30px,6vw,52px);font-weight:900;letter-spacing:-.025em;line-height:1;margin-bottom:12px;text-transform:uppercase}
h1 .grad{background:var(--accent);color:#111;-webkit-text-fill-color:#111;border:2px solid var(--border);box-shadow:4px 4px 0 var(--border);display:inline-block;padding:0 10px}
.sub{color:var(--muted);font-size:clamp(16px,2.4vw,19px);line-height:1.55;margin-bottom:28px;max-width:620px}
.create-bar{display:flex;gap:10px;margin-bottom:28px;animation:fadeUp .45s .08s var(--transition) both}
.create-bar input{flex:1;background:var(--surface);border:2px solid var(--border);border-radius:0;padding:15px 18px;font-size:17px;color:var(--text);min-height:52px}
.create-bar input:focus{outline:3px solid var(--accent2);outline-offset:1px}
.create-bar input::placeholder{color:var(--muted)}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;background:var(--accent);color:#111;border:2px solid var(--border);padding:15px 26px;min-height:52px;border-radius:0;font-size:16px;font-weight:900;letter-spacing:.01em;text-transform:uppercase;cursor:pointer;text-decoration:none;box-shadow:var(--shadow);transition:transform .15s var(--transition),box-shadow .15s var(--transition),background .15s;white-space:nowrap}
.btn:hover{transform:translate(-2px,-2px);box-shadow:6px 6px 0 var(--border)}
.btn:active{transform:translate(2px,2px);box-shadow:0 0 0 var(--border)}
.btn.outline{background:var(--surface);color:var(--text)}
.btn.outline:hover{background:var(--surface2);color:var(--text)}
.btn.danger{background:var(--accent3);color:#111}
.btn.small{padding:10px 14px;font-size:13px;min-height:44px;box-shadow:3px 3px 0 var(--border)}
.btn.small:hover{transform:translate(-1px,-1px);box-shadow:4px 4px 0 var(--border)}
.btn.icon{padding:12px;min-width:52px}
.btn[disabled]{opacity:.45;cursor:not-allowed;box-shadow:none;transform:none!important}
.section-label{font-size:13px;font-weight:900;color:var(--text);text-transform:uppercase;letter-spacing:.18em;margin-bottom:16px;animation:fadeIn .35s .1s both}
.card-list{display:flex;flex-direction:column;gap:14px;padding-bottom:48px}
.card{background:var(--surface);border:2px solid var(--border);border-radius:0;padding:20px 24px;text-decoration:none;color:inherit;display:flex;align-items:center;justify-content:space-between;box-shadow:var(--shadow);transition:transform .15s var(--transition),box-shadow .15s var(--transition);animation:fadeUp .4s var(--transition) both}
.card:hover{transform:translate(-2px,-2px);box-shadow:6px 6px 0 var(--border)}
.card-left{display:flex;align-items:center;gap:16px;flex:1;min-width:0}
.card-thumb{width:54px;height:54px;border-radius:0;background:var(--grad-soft);border:2px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0}
.card-info{min-width:0}
.card-title{font-size:19px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.card-sub{font-size:15px;color:var(--muted);margin-top:3px}
.card-arrow{color:var(--text);font-size:24px;font-weight:900;transition:transform .2s var(--transition),color .2s}
.card:hover .card-arrow{transform:translateX(4px)}
.empty{text-align:center;padding:56px 24px;animation:fadeIn .35s}
.empty-icon{font-size:52px;margin-bottom:16px;opacity:.5}
.empty-text{color:var(--muted);font-size:17px;line-height:1.55}
.skeleton-card{background:var(--surface);border:2px solid var(--border);border-radius:0;padding:20px 24px;height:76px;overflow:hidden;position:relative}
.skeleton-card::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(17,17,17,.07),transparent);background-size:200% 100%;animation:shimmer 1.5s infinite}
html[data-theme="dark"] .skeleton-card::after{background:linear-gradient(90deg,transparent,rgba(244,241,232,.08),transparent);background-size:200% 100%}
/* top bar */
.topbar{position:sticky;top:0;z-index:60;background:var(--bg);border-bottom:3px solid var(--border)}
.topbar-inner{max-width:var(--wrap);margin:0 auto;padding:calc(10px + env(safe-area-inset-top)) 20px 10px;display:flex;align-items:center;gap:12px}
.back-pill{display:inline-flex;align-items:center;gap:8px;padding:10px 16px;min-height:48px;border-radius:0;background:var(--surface);color:var(--text);border:2px solid var(--border);text-decoration:none;font-weight:900;font-size:13px;letter-spacing:.04em;text-transform:uppercase;box-shadow:3px 3px 0 var(--border);transition:transform .15s var(--transition),box-shadow .15s var(--transition)}
.back-pill:hover{transform:translate(-1px,-1px);box-shadow:4px 4px 0 var(--border)}
.topbar-title{font-weight:800;font-size:16px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0;color:var(--muted)}
.topbar-actions{margin-left:auto;display:flex;align-items:center;gap:10px}
.nav-logo{display:flex;align-items:center;gap:10px;text-decoration:none;color:var(--text)}
.nav-logo .logo-icon{width:40px;height:40px;font-size:19px;box-shadow:2px 2px 0 var(--border)}
.nav-logo .logo-text{font-size:18px}
.nav-user{font-size:15px;color:var(--muted);display:none}
.nav-user strong{color:var(--text);font-weight:800}
@media(min-width:720px){.nav-user{display:inline}}
/* collection header */
.col-head{padding:clamp(18px,3vw,28px) 0 12px;animation:fadeUp .35s var(--transition)}
.col-head h1{margin-bottom:8px}
.meta-line{color:var(--muted);font-size:15px;display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.meta-line .dot{opacity:.5}
.meta-line .price-tag{color:var(--text);font-weight:800}
.bar{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:14px}
.menu-wrap{position:relative;margin-left:auto}
@media(max-width:640px){.menu-wrap{margin-left:0}}
.menu{position:absolute;right:0;top:calc(100% + 8px);min-width:252px;background:var(--surface);border:2px solid var(--border);border-radius:0;padding:6px;box-shadow:var(--shadow-lg);z-index:80;display:none}
.menu.open{display:block;animation:scaleIn .14s var(--transition)}
.menu button,.menu a{display:flex;align-items:center;gap:10px;width:100%;text-align:left;background:none;border:none;color:var(--text);font-size:16px;font-weight:600;padding:12px 14px;border-radius:0;cursor:pointer;text-decoration:none;min-height:48px;font-family:inherit}
.menu button:hover,.menu a:hover{background:var(--grad-soft)}
.menu .sep{height:2px;background:var(--border);margin:6px 8px}
.menu .danger{color:var(--accent3);font-weight:800}
.toolbar{display:flex;gap:8px;align-items:center;margin-bottom:14px;flex-wrap:wrap}
.toolbar .grow{flex:1;min-width:200px}
.toolbar input,.toolbar select{background:var(--surface);border:2px solid var(--border);border-radius:0;padding:11px 14px;font-size:16px;color:var(--text);min-height:48px}
.toolbar input:focus,.toolbar select:focus{outline:3px solid var(--accent2);outline-offset:1px}
select.copy-btn{min-width:110px;background:var(--surface);color:var(--text);border:2px solid var(--border);border-radius:0;padding:12px 14px;font-size:15px;min-height:46px;font-weight:600}
.live-dot{width:10px;height:10px;border-radius:0;background:var(--ok);align-self:center;animation:pulse 2s infinite;flex-shrink:0}
/* paywall + sales */
.paywall{display:flex;gap:14px;align-items:center;justify-content:space-between;flex-wrap:wrap;background:var(--accent2);color:#fff;border:2px solid var(--border);border-radius:0;box-shadow:var(--shadow);padding:18px;margin-bottom:18px;animation:fadeUp .35s var(--transition)}
.paywall strong{font-size:19px;font-weight:900;text-transform:uppercase}
.paywall .price{font-weight:900;font-size:21px}
.paywall .hint{color:rgba(255,255,255,.85)}
.sales-strip{display:flex;align-items:center;justify-content:space-between;gap:12px;background:var(--surface);border:2px solid var(--border);border-radius:0;padding:12px 16px;margin-bottom:14px;font-size:15px;color:var(--muted);flex-wrap:wrap}
.sales-strip strong{color:var(--text);font-weight:800}
/* photo grid + lock + selection */
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:24px}
.photo-wrap{position:relative;aspect-ratio:1;border-radius:0;overflow:hidden;border:2px solid var(--border);animation:scaleIn .3s var(--transition) both;cursor:pointer;user-select:none;-webkit-user-select:none}
.photo-wrap img{width:100%;height:100%;object-fit:cover;transition:transform .25s var(--transition);pointer-events:none}
.photo-wrap:hover img{transform:scale(1.05)}
.photo-wrap:hover .photo-overlay{opacity:1}
.photo-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,.7) 0%,transparent 60%);opacity:0;transition:opacity .2s var(--transition);display:flex;align-items:flex-end;justify-content:flex-end;padding:8px;gap:6px}
.photo-btn{width:40px;height:40px;border-radius:0;border:2px solid #111;background:#fff;color:#111;font-size:16px;font-weight:900;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:transform .12s,background .12s}
.photo-btn:hover{transform:translate(-1px,-1px);background:var(--accent)}
.photo-btn.danger:hover{background:var(--accent3)}
.photo-lock{position:absolute;left:0;top:0;background:#fff;color:#111;border-right:2px solid #111;border-bottom:2px solid #111;border-radius:0;padding:5px 10px;font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:.04em;display:flex;gap:5px;align-items:center;pointer-events:none}
.photo-wrap.selected{border-color:var(--accent2);box-shadow:0 0 0 3px var(--accent2)}
.photo-wrap .check{position:absolute;right:8px;top:8px;width:30px;height:30px;border-radius:0;background:#fff;border:2px solid #111;color:#111;font-size:17px;font-weight:900;display:none;align-items:center;justify-content:center;pointer-events:none}
body.selecting .photo-wrap .check{display:flex}
body.selecting .photo-overlay{display:none}
.photo-wrap.selected .check{background:var(--accent2);border-color:#111;color:#fff}
.marquee{position:fixed;border:2px solid var(--accent2);background:rgba(47,107,255,.18);border-radius:0;pointer-events:none;z-index:90;display:none}
.select-bar{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(18px + env(safe-area-inset-bottom));background:var(--surface);border:2px solid var(--border);box-shadow:var(--shadow-lg);border-radius:0;padding:10px 12px;display:none;gap:8px;align-items:center;z-index:120;animation:toastIn .2s var(--transition);max-width:calc(100vw - 24px);overflow:auto}
.select-bar.open{display:flex}
.select-bar .count{font-weight:900;font-size:15px;padding:0 8px;white-space:nowrap}
.context-menu{position:fixed;min-width:212px;background:var(--surface);border:2px solid var(--border);border-radius:0;padding:6px;box-shadow:var(--shadow-lg);z-index:160;display:none}
.context-menu.open{display:block;animation:scaleIn .12s var(--transition)}
/* modals */
.modal{position:fixed;inset:0;background:rgba(17,17,17,.6);display:none;align-items:center;justify-content:center;z-index:150;padding:20px;animation:fadeIn .15s}
.modal.open{display:flex}
.modal-card{width:100%;max-width:560px;max-height:86vh;overflow:auto;background:var(--surface);border:3px solid var(--border);border-radius:0;padding:26px;box-shadow:var(--shadow-lg);animation:scaleIn .18s var(--transition);position:relative}
.modal-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:18px}
.modal-head h2{font-size:22px;font-weight:900;text-transform:uppercase;letter-spacing:-.01em}
.modal-close{width:46px;height:46px;border-radius:0;border:2px solid var(--border);background:var(--surface);color:var(--text);font-size:18px;font-weight:900;cursor:pointer;flex-shrink:0;box-shadow:3px 3px 0 var(--border)}
.modal-close:hover{background:var(--accent3);color:#111}
.modal .field{margin-bottom:16px}
.modal label{display:block;font-size:13px;font-weight:800;color:var(--text);text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px}
.modal input,.modal textarea,.modal select{width:100%;background:var(--surface);border:2px solid var(--border);border-radius:0;padding:13px 14px;font-size:16px;color:var(--text);font-family:inherit}
.modal input:focus,.modal textarea:focus{outline:3px solid var(--accent2);outline-offset:1px}
.modal textarea{min-height:120px;resize:vertical}
.hint{font-size:15px;color:var(--muted);line-height:1.5}
.note{background:var(--surface);border:2px solid var(--border);border-radius:0;padding:14px 16px;font-size:16px;color:var(--muted);display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:14px}
.note strong{color:var(--text);font-weight:800}
.note.warn{background:var(--grad-soft)}
.note.warn strong{color:var(--text)}
.price-row{display:flex;gap:10px}
.price-row input{flex:1}
.price-row select{width:130px}
/* QR + share */
.qr-wrap{text-align:center;padding:8px 0}
.qr-wrap img{width:min(260px,70vw);height:auto;border-radius:0;border:3px solid var(--border);animation:scaleIn .3s var(--transition)}
.share-link{display:flex;gap:8px;margin-top:18px;align-items:center;flex-wrap:wrap}
.share-link input{flex:1;min-width:180px;background:var(--surface);border:2px solid var(--border);border-radius:0;padding:12px 14px;font-size:15px;color:var(--text)}
.copy-btn{background:var(--surface);border:2px solid var(--border);border-radius:0;padding:12px 16px;color:var(--text);cursor:pointer;font-size:15px;font-weight:800;min-height:46px;font-family:inherit;box-shadow:3px 3px 0 var(--border)}
.copy-btn:hover{background:var(--accent);color:#111}
/* lightbox */
.lightbox{position:fixed;inset:0;background:rgba(17,17,17,.95);display:none;align-items:center;justify-content:center;z-index:140;animation:fadeIn .18s}
.lightbox.open{display:flex}
.lightbox img{max-width:94vw;max-height:86vh;border-radius:0;border:3px solid #fff;animation:scaleIn .25s var(--transition)}
.lightbox-close{position:absolute;top:calc(16px + env(safe-area-inset-top));right:16px;width:48px;height:48px;border-radius:0;background:#fff;border:2px solid #111;color:#111;font-size:22px;font-weight:900;cursor:pointer;display:flex;align-items:center;justify-content:center}
.lightbox-nav{position:absolute;top:50%;transform:translateY(-50%);width:50px;height:50px;border-radius:0;background:#fff;border:2px solid #111;color:#111;font-size:22px;font-weight:900;cursor:pointer;display:flex;align-items:center;justify-content:center}
.lightbox-nav.prev{left:14px}.lightbox-nav.next{right:14px}
.lightbox-nav:hover,.lightbox-close:hover{background:var(--accent)}
/* toast */
#toast-container{position:fixed;bottom:calc(24px + env(safe-area-inset-bottom));left:50%;transform:translateX(-50%);z-index:200;display:flex;flex-direction:column;gap:8px;align-items:center;max-width:calc(100vw - 24px)}
.toast{background:var(--surface);border:2px solid var(--border);border-radius:0;padding:14px 20px;font-size:16px;font-weight:700;box-shadow:var(--shadow);animation:toastIn .25s var(--transition);display:flex;align-items:center;gap:10px}
.toast.success{background:var(--ok);color:#fff;border-color:#111}
.toast.success .dot{color:#fff}
.toast.error{background:var(--accent3);color:#111}
.toast.error .dot{color:#111}
.toast .dot{font-size:18px;font-weight:900}
.spinner{width:24px;height:24px;border:3px solid var(--surface2);border-top-color:var(--accent2);border-radius:50%;animation:spin .7s linear infinite}
.spinner.dark{border-color:var(--surface2);border-top-color:var(--accent2)}
.hidden{display:none!important}
/* home extras */
.controls{display:flex;gap:10px;align-items:center;margin-bottom:20px;flex-wrap:wrap}
.controls select{background:var(--surface);border:2px solid var(--border);border-radius:0;padding:10px 12px;color:var(--text);font-size:15px;font-weight:600;cursor:pointer;min-height:46px}
.chips{display:flex;gap:8px;flex-wrap:wrap}
.chip{background:var(--surface);border:2px solid var(--border);border-radius:0;padding:10px 16px;font-size:14px;color:var(--text);cursor:pointer;font-weight:800;text-transform:uppercase;letter-spacing:.03em;transition:background .15s,color .15s,transform .15s;min-height:46px}
.chip:hover{transform:translate(-1px,-1px);box-shadow:3px 3px 0 var(--border)}
.chip.active{background:var(--text);color:var(--bg);border-color:var(--border)}
.icon-btn{width:48px;height:48px;border-radius:0;border:2px solid var(--border);background:var(--surface);color:var(--text);font-size:17px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .15s;flex-shrink:0;box-shadow:3px 3px 0 var(--border)}
.icon-btn:hover{background:var(--accent);color:#111}
.card-list.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:18px}
.card-list.grid .card{flex-direction:column;align-items:stretch;gap:0;padding:0;overflow:hidden}
.card-list.grid .card-left{flex-direction:column;align-items:stretch;gap:0}
.card-list.grid .card-thumb{width:100%;height:150px;border-radius:0;border:none;border-bottom:2px solid var(--border)}
.card-list.grid .card-info{padding:14px 16px 16px}
.card-list.grid .card .card-arrow{display:none}
.card-list.grid .card:hover .card-thumb img{transform:scale(1.05)}
.card-thumb img{width:100%;height:100%;object-fit:cover;border-radius:0;transition:transform .25s var(--transition)}
.load-wrap{text-align:center;padding:8px 0 48px}
.badge{display:inline-block;font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:.04em;padding:4px 8px;border-radius:0;background:var(--surface2);border:2px solid var(--border);color:var(--text);margin-left:8px}
.badge.owner{background:var(--accent2);color:#fff}
.badge.editor{background:var(--ok);color:#fff}
.badge.price{background:var(--accent)}
.member-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 0;border-bottom:2px solid var(--border)}
.member-row:last-child{border-bottom:none}
.member-name{font-weight:800;font-size:16px}
.member-email{font-size:14px;color:var(--muted)}
.sale-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 0;border-bottom:2px solid var(--border);font-size:15px}
.sale-row:last-child{border-bottom:none}
.sale-row .amount{font-weight:900}
/* theme toggle */
.theme-toggle{position:fixed;bottom:calc(18px + env(safe-area-inset-bottom));right:18px;z-index:130;width:50px;height:50px;border-radius:0;border:2px solid var(--border);background:var(--surface);color:var(--text);font-size:19px;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:3px 3px 0 var(--border);transition:transform .15s var(--transition)}
.theme-toggle:hover{transform:translate(-1px,-1px);box-shadow:4px 4px 0 var(--border)}
:focus-visible{outline:3px solid var(--accent2);outline-offset:2px}
.skip-link{position:absolute;left:-9999px;top:0;background:var(--accent);color:#111;padding:10px 16px;border:2px solid var(--border);border-radius:0;z-index:400;font-weight:800}
.skip-link:focus{left:0}
/* auth pages */
.auth-wrap{max-width:440px;margin:0 auto;padding:calc(24px + env(safe-area-inset-top)) 20px 24px;min-height:100vh;min-height:100dvh;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;z-index:1}
.auth-card{width:100%;background:var(--surface);border:3px solid var(--border);border-radius:0;padding:clamp(26px,5vw,38px);animation:fadeUp .35s var(--transition);box-shadow:var(--shadow-lg)}
.auth-logo{width:60px;height:60px;border-radius:0;background:var(--accent);color:#111;border:2px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:28px;margin:0 auto 24px;box-shadow:4px 4px 0 var(--border)}
.auth-title{font-size:30px;font-weight:900;text-align:center;margin-bottom:8px;letter-spacing:-.02em;text-transform:uppercase}
.auth-sub{color:var(--muted);font-size:16px;text-align:center;margin-bottom:28px}
.auth-field{margin-bottom:16px}
.auth-field label{display:block;font-size:13px;font-weight:800;color:var(--text);margin-bottom:6px;text-transform:uppercase;letter-spacing:.08em}
.auth-field input{width:100%;background:var(--surface);border:2px solid var(--border);border-radius:0;padding:14px 16px;font-size:16px;color:var(--text)}
.auth-field input:focus{outline:3px solid var(--accent2);outline-offset:1px}
.auth-field input::placeholder{color:var(--muted)}
.auth-btn{width:100%;margin-top:8px}
.auth-footer{text-align:center;margin-top:24px;font-size:16px;color:var(--muted)}
.auth-footer a{color:var(--text);text-decoration:underline;text-underline-offset:3px;font-weight:800}
.auth-footer a:hover{background:var(--accent);color:#111}
.auth-back{display:inline-flex;align-items:center;gap:6px;color:var(--text);text-decoration:none;font-size:15px;font-weight:800;margin-bottom:20px;min-height:44px;text-transform:uppercase;letter-spacing:.04em}
.auth-back:hover{text-decoration:underline;text-underline-offset:3px}
/* mobile optimizations */
.mobile-bar{position:fixed;left:0;right:0;bottom:0;z-index:70;display:none;gap:8px;padding:10px 12px calc(10px + env(safe-area-inset-bottom));background:var(--bg);border-top:3px solid var(--border)}
.mobile-bar .btn{flex:1;min-height:52px;padding:10px 8px;flex-direction:column;gap:2px;font-size:11px;box-shadow:3px 3px 0 var(--border)}
.mobile-bar .btn .ico{font-size:20px;line-height:1}
@media(max-width:640px){
  .wrap{padding:0 14px}
  .grid{grid-template-columns:repeat(3,1fr);gap:8px}
  .card-list.grid{grid-template-columns:repeat(2,1fr);gap:14px}
  .card-list:not(.grid) .card{padding:16px}
  .bar{display:none}
  .mobile-bar{display:flex}
  body.has-mobile-bar{padding-bottom:92px}
  body.has-mobile-bar .theme-toggle{bottom:calc(94px + env(safe-area-inset-bottom))}
  body.selecting .theme-toggle{display:none}
  .topbar-title{display:none}
  .topbar-inner{padding:calc(10px + env(safe-area-inset-top)) 14px 10px;gap:8px}
  .topbar-actions .nav-logo{display:none}
  .modal{padding:0;align-items:flex-end}
  .modal-card{max-width:none;max-height:92vh;border-radius:0;border-bottom:none;padding-bottom:calc(26px + env(safe-area-inset-bottom))}
  .select-bar{bottom:calc(96px + env(safe-area-inset-bottom));width:calc(100vw - 20px);justify-content:space-between;padding:8px 10px}
  .select-bar .count{font-size:14px;padding:0 4px}
  .select-bar .btn.small{padding:8px 10px;font-size:12px;min-height:40px}
  .toolbar .grow{flex:1 1 100%}
  .toolbar input,.toolbar select{flex:1;min-width:0}
  .photo-btn{width:44px;height:44px}
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
.pwa-install{position:fixed;left:18px;bottom:calc(18px + env(safe-area-inset-bottom));z-index:130;display:none;align-items:center;gap:8px;padding:12px 18px;min-height:50px;border-radius:0;border:2px solid var(--border);background:var(--accent);color:#111;font-size:15px;font-weight:900;text-transform:uppercase;letter-spacing:.03em;font-family:inherit;cursor:pointer;box-shadow:var(--shadow);transition:transform .15s var(--transition)}
.pwa-install.show{display:inline-flex}
.pwa-install:active{transform:translate(2px,2px);box-shadow:none}
.pwa-install:hover{transform:translate(-2px,-2px);box-shadow:6px 6px 0 var(--border)}
.ios-hint{position:fixed;left:12px;right:12px;bottom:calc(12px + env(safe-area-inset-bottom));z-index:140;display:none;gap:12px;align-items:flex-start;background:var(--surface);border:3px solid var(--border);border-radius:0;padding:14px 16px;box-shadow:var(--shadow-lg);font-size:16px;line-height:1.45;animation:toastIn .25s var(--transition)}
.ios-hint.show{display:flex}
.ios-hint strong{display:block;margin-bottom:2px;font-weight:900}
.ios-hint button{margin-left:auto;background:none;border:2px solid var(--border);color:var(--text);font-size:17px;font-weight:900;cursor:pointer;padding:4px;min-width:40px;min-height:40px;flex-shrink:0}
body.has-mobile-bar .pwa-install{bottom:calc(94px + env(safe-area-inset-bottom))}
body.has-mobile-bar .ios-hint{bottom:calc(94px + env(safe-area-inset-bottom))}
@media(min-width:641px){.ios-hint{left:auto;right:18px;max-width:360px}}
/* upload dropzone */
.dropzone{border:3px dashed var(--border);border-radius:0;padding:26px 16px;text-align:center;cursor:pointer;transition:border-color .15s,background .15s}
.dropzone:hover,.dropzone.drag{border-style:solid;border-color:var(--border);background:var(--grad-soft)}
.dropzone-icon{font-size:36px;margin-bottom:10px}
.dropzone-text{color:var(--muted);font-size:16px}
.dropzone-text strong{color:var(--text)}
.dropzone-actions{display:flex;gap:10px;justify-content:center;margin-top:18px;flex-wrap:wrap}
.dropzone-actions .btn{min-height:50px}
`

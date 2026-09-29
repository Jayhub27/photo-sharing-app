import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import multer from 'multer'
import { fileURLToPath } from 'node:url'
import api, { stripeWebhookHandler } from './routes.js'
import auth, { resolveUser, type AuthedRequest } from './auth.js'
import { supabase } from './db.js'
import { publicBaseUrl } from './utils.js'
import { startSweeper } from './maintenance.js'
import { createPendingShare } from './share-store.js'
import { layout, htmlEscape } from './ui.js'
import { homePage, collectionPage, loginPage, signupPage, type PageMeta } from './pages.js'

const PORT = process.env.PORT || 3000
const publicDir = fileURLToPath(new URL('../public', import.meta.url))
const app = express()

app.disable('x-powered-by')
app.set('trust proxy', true)

const extraOrigins = (process.env.APP_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=(self)')
  if (req.secure) res.setHeader('Strict-Transport-Security', 'max-age=15552000; includeSubDomains')
  next()
})

// PWA assets: manifest, service worker, icons and the offline page.
app.use(
  express.static(publicDir, {
    index: false,
    maxAge: '1h',
    setHeaders(res, filePath) {
      if (filePath.endsWith('sw.js')) res.setHeader('Cache-Control', 'no-cache')
      if (filePath.endsWith('.webmanifest')) res.setHeader('Content-Type', 'application/manifest+json')
    },
  })
)

app.use((req, res, next) => {
  cors({
    credentials: true,
    origin(origin, cb) {
      if (!origin) return cb(null, true)
      try {
        const host = new URL(origin).host
        const sameHost = host === req.headers.host
        const local = /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host)
        if (sameHost || local || extraOrigins.includes(origin)) return cb(null, true)
      } catch {}
      cb(null, false)
    },
  })(req, res, next)
})

// Stripe webhooks need the raw body, so this route is mounted before the JSON parser.
app.post('/api/stripe/webhook', express.raw({ type: 'application/json', limit: '1mb' }), stripeWebhookHandler)

app.use(express.json({ limit: '100kb' }))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.use('/api/auth', auth)
app.use('/api', api)

/* ------------------------------------------------------- PWA share target */

// Photos shared from the camera app's gallery (Android share sheet) land here,
// then the user picks the collection that should receive them.
const shareUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024, files: 20 },
  fileFilter: (_req, file, cb) => cb(null, file.mimetype.startsWith('image/')),
})

function shareMessagePage(title: string, message: string, cta?: { href: string; label: string }): string {
  const body = `
<div class="wrap">
  <div class="col-head"><h1>${htmlEscape(title)}</h1></div>
  <div class="note">
    <span>${htmlEscape(message)}</span>
    ${cta ? `<a class="btn" href="${htmlEscape(cta.href)}">${htmlEscape(cta.label)}</a>` : ''}
  </div>
</div>`
  return layout('Share photos · Take the shot', '', body, '')
}

async function editableCollections(userId: string): Promise<{ id: string; name: string }[]> {
  const { data: owned } = await supabase
    .from('collections')
    .select('id, name')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)

  const { data: memberships } = await supabase
    .from('collection_members')
    .select('collection_id, role')
    .eq('user_id', userId)
  const ids = (memberships || []).filter((m) => m.role !== 'viewer').map((m) => m.collection_id)

  let shared: { id: string; name: string }[] = []
  if (ids.length) {
    const { data } = await supabase.from('collections').select('id, name').in('id', ids)
    shared = (data as { id: string; name: string }[]) || []
  }
  return [...((owned as { id: string; name: string }[]) || []), ...shared].filter((c) => c?.id)
}

function sharePickerPage(token: string, count: number, collections: { id: string; name: string }[]): string {
  const items = collections
    .map(
      (c) => `<button class="card" type="button" data-id="${htmlEscape(c.id)}" style="width:100%;text-align:left;cursor:pointer;font-family:inherit">
      <span class="card-left">
        <span class="card-thumb">\ud83d\udcf7</span>
        <span class="card-info">
          <span class="card-title">${htmlEscape(c.name)}</span>
          <span class="card-sub">Add ${count} photo${count === 1 ? '' : 's'}</span>
        </span>
      </span>
      <span class="card-arrow">\u2192</span>
    </button>`
    )
    .join('')

  const body = `
<div class="topbar">
  <div class="topbar-inner">
    <a class="back-pill" href="/">&larr; Collections</a>
    <span class="topbar-title">Share to&hellip;</span>
  </div>
</div>
<div class="wrap">
  <div class="col-head">
    <h1>Send ${count} photo${count === 1 ? '' : 's'} to&hellip;</h1>
    <div class="meta-line"><span>Pick the collection that should receive them.</span></div>
  </div>
  <div class="card-list" id="shareList">${items}</div>
</div>`

  const script = `
const SHARE_TOKEN = ${JSON.stringify(token)};
let shareBusy = false;
document.getElementById('shareList').addEventListener('click', function (e) {
  const btn = e.target.closest('[data-id]');
  if (!btn || shareBusy) return;
  shareBusy = true;
  btn.style.opacity = '0.6';
  fetch('/api/share/' + SHARE_TOKEN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ collectionId: btn.dataset.id }),
  })
    .then(function (res) { return res.json().then(function (data) { return { ok: res.ok, data: data || {} }; }); })
    .then(function (r) {
      if (!r.ok) throw new Error(r.data.error || 'Could not add the photos');
      toast('Photos added', 'success');
      location.href = '/c/' + btn.dataset.id;
    })
    .catch(function (err) {
      shareBusy = false;
      btn.style.opacity = '';
      toast(err.message, 'error');
    });
});
`
  return layout('Share photos · Take the shot', '', body, script)
}

app.post('/share', shareUpload.array('photos', 20), async (req, res) => {
  const files = ((req.files as Express.Multer.File[]) || []).filter((f) => f.size > 0)
  if (!files.length) {
    res.type('html').send(shareMessagePage('Nothing to import', 'No photos arrived in that share. Try sharing them again.'))
    return
  }

  const user = await resolveUser(req as AuthedRequest)
  if (!user) {
    res.type('html').send(
      shareMessagePage('Log in first', 'Log in to your account, then share the photos again so they land in a collection.', {
        href: '/login',
        label: 'Log in',
      })
    )
    return
  }

  const collections = await editableCollections(user.id)
  if (!collections.length) {
    res.type('html').send(
      shareMessagePage('No collections yet', 'Create a collection first — shared photos go straight into it.', {
        href: '/',
        label: 'Create a collection',
      })
    )
    return
  }

  const token = createPendingShare(
    files.map((f) => ({ buffer: f.buffer, name: f.originalname || 'photo.jpg', mime: f.mimetype || 'image/jpeg' }))
  )
  if (!token) {
    res.type('html').send(shareMessagePage('Nothing to import', 'Those photos could not be buffered. Try sharing them again.'))
    return
  }

  res.type('html').send(sharePickerPage(token, files.length, collections))
})

app.get('/login', (_req, res) => {
  res.type('html').send(loginPage(''))
})

app.get('/signup', (_req, res) => {
  res.type('html').send(signupPage(''))
})

app.get('/', (_req, res) => {
  res.type('html').send(homePage(''))
})

app.get('/c/:id', async (req, res) => {
  let meta: PageMeta | undefined
  try {
    const { data: col } = await supabase
      .from('collections')
      .select('name, is_public, cover_filename')
      .eq('id', req.params.id)
      .maybeSingle()
    if (col && col.is_public !== false) {
      const image = col.cover_filename
        ? `${publicBaseUrl(req)}/api/photos/${col.cover_filename}`
        : undefined
      meta = { title: col.name, description: `View "${col.name}" on Take the shot.`, image }
    }
  } catch {}
  res.type('html').send(collectionPage(req.params.id, '', meta))
})

export default app

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Take the shot server running on http://localhost:${PORT}`)
  })
  startSweeper()
}
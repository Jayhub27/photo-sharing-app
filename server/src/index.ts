import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import api from './routes.js'
import auth from './auth.js'
import { supabase } from './db.js'
import { homePage, collectionPage, loginPage, signupPage, type PageMeta } from './pages.js'

const PORT = process.env.PORT || 3000
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

app.use(express.json({ limit: '100kb' }))

app.use('/api/auth', auth)
app.use('/api', api)

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
        ? `${req.protocol}://${req.get('host')}/api/photos/${col.cover_filename}`
        : undefined
      meta = { title: col.name, description: `View "${col.name}" on PhotoShare.`, image }
    }
  } catch {}
  res.type('html').send(collectionPage(req.params.id, '', meta))
})

export default app

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`PhotoShare server running on http://localhost:${PORT}`)
  })
}
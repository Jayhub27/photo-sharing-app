import { Router, type Request, type Response, type NextFunction } from 'express'
import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'
import { supabase } from './db.js'
import { generateId } from './utils.js'
import { rateLimit } from './ratelimit.js'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const SESSION_TTL_DAYS = Number(process.env.SESSION_TTL_DAYS) || 30
const SESSION_TTL_MS = SESSION_TTL_DAYS * 24 * 60 * 60 * 1000

const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  message: 'Too many login attempts. Please try again in a few minutes.',
})

export interface AuthedRequest extends Request {
  userId?: string
  userName?: string
}

const router = Router()

function parseCookies(header: string | undefined): Record<string, string> {
  const cookies: Record<string, string> = {}
  if (!header) return cookies
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=')
    if (k) cookies[k] = v.join('=')
  }
  return cookies
}

function getToken(req: AuthedRequest): string | null {
  const auth = req.headers.authorization
  if (auth?.startsWith('Bearer ')) return auth.slice(7)
  const cookies = parseCookies(req.headers.cookie)
  return cookies.session || null
}

async function userForToken(token: string | null): Promise<{ id: string; name: string } | null> {
  if (!token) return null
  const { data: session } = await supabase
    .from('sessions')
    .select('user_id, created_at')
    .eq('token', token)
    .maybeSingle()
  if (!session) return null

  if (session.created_at && Date.now() - new Date(session.created_at).getTime() > SESSION_TTL_MS) {
    await supabase.from('sessions').delete().eq('token', token)
    return null
  }

  const { data: user } = await supabase
    .from('users')
    .select('id, name')
    .eq('id', session.user_id)
    .maybeSingle()
  if (!user) return null
  return { id: user.id, name: user.name }
}

export async function authMiddleware(req: AuthedRequest, res: Response, next: NextFunction) {
  const user = await userForToken(getToken(req))
  if (!user) return res.status(401).json({ error: 'Not authenticated' })
  req.userId = user.id
  req.userName = user.name
  next()
}

export async function optionalAuth(req: AuthedRequest, _res: Response, next: NextFunction) {
  const user = await userForToken(getToken(req))
  if (user) {
    req.userId = user.id
    req.userName = user.name
  }
  next()
}

router.post('/signup', authLimiter, async (req: AuthedRequest, res) => {
  const email = String(req.body.email || '').trim().toLowerCase()
  const name = String(req.body.name || '').trim()
  const password = String(req.body.password || '')

  if (!email || !name || !password) return res.status(400).json({ error: 'Email, name, and password are required' })
  if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'Enter a valid email address' })
  if (name.length > 80) return res.status(400).json({ error: 'Name is too long (max 80 characters)' })
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' })

  const { data: existing } = await supabase.from('users').select('id').eq('email', email).maybeSingle()
  if (existing) return res.status(409).json({ error: 'Email already registered' })

  const id = generateId()
  const hash = bcrypt.hashSync(password, 10)
  const { error } = await supabase.from('users').insert({ id, email, name, password_hash: hash })
  if (error) return res.status(500).json({ error: 'Could not create account' })

  const token = await createSession(id)
  setCookie(req, res, token)
  res.json({ token, user: { id, name, email } })
})

router.post('/login', authLimiter, async (req: AuthedRequest, res) => {
  const email = String(req.body.email || '').trim().toLowerCase()
  const password = String(req.body.password || '')

  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' })

  const { data: user } = await supabase.from('users').select('*').eq('email', email).maybeSingle()
  if (!user) return res.status(401).json({ error: 'Invalid email or password' })

  if (!bcrypt.compareSync(password, user.password_hash))
    return res.status(401).json({ error: 'Invalid email or password' })

  const token = await createSession(user.id)
  setCookie(req, res, token)
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } })
})

router.post('/logout', async (req: AuthedRequest, res) => {
  const token = getToken(req)
  if (token) await supabase.from('sessions').delete().eq('token', token)
  res.json({ ok: true })
})

router.get('/me', authMiddleware, async (req: AuthedRequest, res) => {
  const { data: user } = await supabase.from('users').select('id, name, email').eq('id', req.userId).maybeSingle()
  res.json({ user })
})

async function createSession(userId: string): Promise<string> {
  const token = randomBytes(32).toString('hex')
  await supabase.from('sessions').insert({ token, user_id: userId })
  return token
}

function setCookie(req: AuthedRequest, res: Response, token: string) {
  const secure = req.secure || req.headers['x-forwarded-proto'] === 'https'
  res.setHeader(
    'Set-Cookie',
    `session=${token}; Path=/; HttpOnly; Max-Age=${60 * 60 * 24 * SESSION_TTL_DAYS}; SameSite=Lax${secure ? '; Secure' : ''}`
  )
}

export default router

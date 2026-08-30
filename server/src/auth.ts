import { Router, type Request, type Response, type NextFunction } from 'express'
import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'
import db from './db.js'
import { generateId } from './utils.js'

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

export function authMiddleware(req: AuthedRequest, res: Response, next: NextFunction) {
  const token = getToken(req)
  if (!token) return res.status(401).json({ error: 'Not authenticated' })

  const session = db.prepare('SELECT user_id FROM sessions WHERE token = ?').get(token) as
    | { user_id: string }
    | undefined
  if (!session) return res.status(401).json({ error: 'Invalid session' })

  const user = db.prepare('SELECT id, name FROM users WHERE id = ?').get(session.user_id) as
    | { id: string; name: string }
    | undefined
  if (!user) return res.status(401).json({ error: 'Invalid session' })

  req.userId = user.id
  req.userName = user.name
  next()
}

export function optionalAuth(req: AuthedRequest, _res: Response, next: NextFunction) {
  const token = getToken(req)
  if (token) {
    const session = db.prepare('SELECT user_id FROM sessions WHERE token = ?').get(token) as
      | { user_id: string }
      | undefined
    if (session) {
      const user = db.prepare('SELECT id, name FROM users WHERE id = ?').get(session.user_id) as
        | { id: string; name: string }
        | undefined
      if (user) {
        req.userId = user.id
        req.userName = user.name
      }
    }
  }
  next()
}

router.post('/signup', (req: AuthedRequest, res) => {
  const email = String(req.body.email || '').trim().toLowerCase()
  const name = String(req.body.name || '').trim()
  const password = String(req.body.password || '')

  if (!email || !name || !password) return res.status(400).json({ error: 'Email, name, and password are required' })
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' })

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email)
  if (existing) return res.status(409).json({ error: 'Email already registered' })

  const id = generateId()
  const hash = bcrypt.hashSync(password, 10)
  db.prepare('INSERT INTO users (id, email, name, password_hash) VALUES (?, ?, ?, ?)').run(id, email, name, hash)

  const token = createSession(id)
  setCookie(req, res, token)
  res.json({ token, user: { id, name, email } })
})

router.post('/login', (req: AuthedRequest, res) => {
  const email = String(req.body.email || '').trim().toLowerCase()
  const password = String(req.body.password || '')

  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' })

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as
    | { id: string; name: string; email: string; password_hash: string }
    | undefined
  if (!user) return res.status(401).json({ error: 'Invalid email or password' })

  if (!bcrypt.compareSync(password, user.password_hash))
    return res.status(401).json({ error: 'Invalid email or password' })

  const token = createSession(user.id)
  setCookie(req, res, token)
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } })
})

router.post('/logout', (req: AuthedRequest, res) => {
  const token = getToken(req)
  if (token) db.prepare('DELETE FROM sessions WHERE token = ?').run(token)
  res.json({ ok: true })
})

router.get('/me', authMiddleware, (req: AuthedRequest, res) => {
  const user = db.prepare('SELECT id, name, email FROM users WHERE id = ?').get(req.userId) as
    | { id: string; name: string; email: string }
    | undefined
  res.json({ user })
})

function createSession(userId: string): string {
  const token = randomBytes(32).toString('hex')
  db.prepare('INSERT INTO sessions (token, user_id) VALUES (?, ?)').run(token, userId)
  return token
}

function setCookie(req: AuthedRequest, res: Response, token: string) {
  const secure = req.secure || req.headers['x-forwarded-proto'] === 'https'
  res.setHeader('Set-Cookie', `session=${token}; Path=/; HttpOnly; Max-Age=${60 * 60 * 24 * 30}; SameSite=Lax${secure ? '; Secure' : ''}`)
}

export default router
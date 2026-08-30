import { Router } from 'express'
import multer from 'multer'
import { mkdirSync, unlinkSync, copyFileSync } from 'fs'
import { join, extname } from 'path'
import QRCode from 'qrcode'
import db from './db.js'
import { generateId } from './utils.js'
import { authMiddleware, optionalAuth, type AuthedRequest } from './auth.js'

const PHOTOS_DIR = process.env.PHOTOS_DIR || 'photos'
mkdirSync(PHOTOS_DIR, { recursive: true })

const router = Router()

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, PHOTOS_DIR),
  filename: (_req, file, cb) => {
    const id = generateId()
    const ext = extname(file.originalname) || `.${file.mimetype.split('/')[1]}`
    cb(null, `${id}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true)
    else cb(null, false)
  },
})

router.get('/collections', authMiddleware, (req: AuthedRequest, res) => {
  const rows = db.prepare(`
    SELECT c.id, c.name, c.created_at, COUNT(p.id) AS photo_count
    FROM collections c
    LEFT JOIN photos p ON p.collection_id = c.id
    WHERE c.user_id = ?
    GROUP BY c.id
    ORDER BY c.created_at DESC
  `).all(req.userId)
  res.json({ collections: rows })
})

router.post('/collections', authMiddleware, (req: AuthedRequest, res) => {
  const name = String(req.body.name || 'Untitled').slice(0, 120)
  const id = generateId()
  db.prepare('INSERT INTO collections (id, user_id, name) VALUES (?, ?, ?)').run(id, req.userId, name)
  res.json({ id, name })
})

router.get('/collections/:id', (req: AuthedRequest, res) => {
  const col = db.prepare('SELECT * FROM collections WHERE id = ?').get(req.params.id) as
    | { id: string; user_id: string | null; name: string; created_at: string }
    | undefined
  if (!col) return res.status(404).json({ error: 'Collection not found' })
  const photos = db.prepare('SELECT id, filename, original_name, mime_type, size, created_at FROM photos WHERE collection_id = ? ORDER BY created_at DESC').all(req.params.id)
  const isOwner = col.user_id === req.userId
  res.json({ collection: col, photos, isOwner })
})

router.get('/collections/:id/qr', async (req, res) => {
  const col = db.prepare('SELECT * FROM collections WHERE id = ?').get(req.params.id)
  if (!col) return res.status(404).json({ error: 'Collection not found' })

  const host = `${req.protocol}://${req.get('host')}`
  const url = `${host}/c/${req.params.id}`
  const qrPng = await QRCode.toBuffer(url, { width: 600 })
  res.type('png').send(qrPng)
})

router.post('/collections/:id/save', authMiddleware, (req: AuthedRequest, res) => {
  const col = db.prepare('SELECT * FROM collections WHERE id = ?').get(req.params.id) as
    | { id: string; user_id: string | null; name: string }
    | undefined
  if (!col) return res.status(404).json({ error: 'Collection not found' })
  if (col.user_id === req.userId) return res.status(400).json({ error: 'This is already your collection' })

  const photos = db.prepare('SELECT filename, original_name, mime_type, size FROM photos WHERE collection_id = ?').all(req.params.id) as
    | { filename: string; original_name: string; mime_type: string; size: number }[]
    | undefined

  const newId = generateId()
  const name = `${col.name} (saved)`.slice(0, 120)
  db.prepare('INSERT INTO collections (id, user_id, name) VALUES (?, ?, ?)').run(newId, req.userId, name)

  const insertPhoto = db.prepare(
    'INSERT INTO photos (id, collection_id, filename, original_name, mime_type, size) VALUES (?, ?, ?, ?, ?, ?)'
  )
  for (const p of photos || []) {
    const newFilename = generateId() + (p.filename.includes('.') ? '.' + p.filename.split('.').pop() : '')
    try {
      copyFileSync(join(PHOTOS_DIR, p.filename), join(PHOTOS_DIR, newFilename))
      insertPhoto.run(generateId(), newId, newFilename, p.original_name, p.mime_type, p.size)
    } catch {}
  }

  res.json({ id: newId, name })
})

router.post('/collections/:id/photos', authMiddleware, upload.array('photos', 20), (req: AuthedRequest, res) => {
  const col = db.prepare('SELECT * FROM collections WHERE id = ?').get(req.params.id) as
    | { id: string; user_id: string | null }
    | undefined
  if (!col) return res.status(404).json({ error: 'Collection not found' })
  if (col.user_id !== req.userId) return res.status(403).json({ error: 'Not your collection' })

  const files = req.files as Express.Multer.File[]
  if (!files || files.length === 0) return res.status(400).json({ error: 'No photos uploaded' })

  const insert = db.prepare(
    'INSERT INTO photos (id, collection_id, filename, original_name, mime_type, size) VALUES (?, ?, ?, ?, ?, ?)'
  )
  const photos = files.map((f) => {
    const id = generateId()
    insert.run(id, req.params.id, f.filename, f.originalname, f.mimetype, f.size)
    return {
      id,
      filename: f.filename,
      original_name: f.originalname,
      mime_type: f.mimetype,
      size: f.size,
    }
  })
  res.json({ photos })
})

router.delete('/photos/:id', authMiddleware, (req: AuthedRequest, res) => {
  const photo = db.prepare('SELECT * FROM photos WHERE id = ?').get(req.params.id) as
    | { id: string; filename: string; collection_id: string }
    | undefined
  if (!photo) return res.status(404).json({ error: 'Photo not found' })

  const col = db.prepare('SELECT user_id FROM collections WHERE id = ?').get(photo.collection_id) as
    | { user_id: string | null }
    | undefined
  if (col?.user_id !== req.userId) return res.status(403).json({ error: 'Not your photo' })

  db.prepare('DELETE FROM photos WHERE id = ?').run(req.params.id)
  try { unlinkSync(join(resolveCwd(), PHOTOS_DIR, photo.filename)) } catch {}
  res.json({ ok: true })
})

router.get('/photos/:filename', (req, res) => {
  const photo = db.prepare('SELECT * FROM photos WHERE filename = ?').get(
    req.params.filename
  ) as { filename: string; mime_type: string; original_name: string } | undefined
  if (!photo) return res.status(404).json({ error: 'Photo not found' })

  if (req.query.download === '1') {
    res.download(join(resolveCwd(), PHOTOS_DIR, photo.filename), photo.original_name)
  } else {
    res.type(photo.mime_type).sendFile(join(resolveCwd(), PHOTOS_DIR, photo.filename))
  }
})

function resolveCwd() {
  return process.cwd()
}

export default router
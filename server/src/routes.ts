import { Router } from 'express'
import multer from 'multer'
import { mkdirSync, unlinkSync } from 'fs'
import { join, extname } from 'path'
import QRCode from 'qrcode'
import db from './db.js'
import { generateId } from './utils.js'

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

router.get('/collections', (_req, res) => {
  const rows = db.prepare(`
    SELECT c.id, c.name, c.created_at, COUNT(p.id) AS photo_count
    FROM collections c
    LEFT JOIN photos p ON p.collection_id = c.id
    GROUP BY c.id
    ORDER BY c.created_at DESC
  `).all()
  res.json({ collections: rows })
})

router.post('/collections', (req, res) => {
  const name = String(req.body.name || 'Untitled').slice(0, 120)
  const id = generateId()
  db.prepare('INSERT INTO collections (id, name) VALUES (?, ?)').run(id, name)
  res.json({ id, name })
})

router.get('/collections/:id', (req, res) => {
  const col = db.prepare('SELECT * FROM collections WHERE id = ?').get(req.params.id)
  if (!col) return res.status(404).json({ error: 'Collection not found' })
  const photos = db.prepare('SELECT id, filename, original_name, mime_type, size, created_at FROM photos WHERE collection_id = ? ORDER BY created_at DESC').all(req.params.id)
  res.json({ collection: col, photos })
})

router.get('/collections/:id/qr', async (req, res) => {
  const col = db.prepare('SELECT * FROM collections WHERE id = ?').get(req.params.id)
  if (!col) return res.status(404).json({ error: 'Collection not found' })

  const host = `${req.protocol}://${req.get('host')}`
  const url = `${host}/c/${req.params.id}`
  const qrPng = await QRCode.toBuffer(url, { width: 600 })
  res.type('png').send(qrPng)
})

router.post('/collections/:id/photos', upload.array('photos', 20), (req, res) => {
  const col = db.prepare('SELECT * FROM collections WHERE id = ?').get(req.params.id)
  if (!col) return res.status(404).json({ error: 'Collection not found' })

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

router.delete('/photos/:id', (req, res) => {
  const photo = db.prepare('SELECT * FROM photos WHERE id = ?').get(req.params.id) as
    | { id: string; filename: string }
    | undefined
  if (!photo) return res.status(404).json({ error: 'Photo not found' })

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
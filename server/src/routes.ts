import { Router } from 'express'
import multer from 'multer'
import QRCode from 'qrcode'
import { supabase, BUCKET } from './db.js'
import { generateId } from './utils.js'
import { createZip } from './zip.js'
import { authMiddleware, optionalAuth, type AuthedRequest } from './auth.js'

const router = Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => cb(null, file.mimetype.startsWith('image/')),
})

async function photoCount(collectionId: string): Promise<number> {
  const { count } = await supabase.from('photos').select('*', { count: 'exact', head: true }).eq('collection_id', collectionId)
  return count || 0
}

router.get('/collections', authMiddleware, async (req: AuthedRequest, res) => {
  const { data, error } = await supabase
    .from('collections')
    .select('id, name, created_at')
    .eq('user_id', req.userId)
    .order('created_at', { ascending: false })
  if (error) return res.status(500).json({ error: 'Could not load collections' })
  const collections = await Promise.all(
    (data || []).map(async (c) => ({ ...c, photo_count: await photoCount(c.id) }))
  )
  res.json({ collections })
})

router.post('/collections', authMiddleware, async (req: AuthedRequest, res) => {
  const name = String(req.body.name || 'Untitled').slice(0, 120)
  const id = generateId()
  const { error } = await supabase.from('collections').insert({ id, user_id: req.userId, name })
  if (error) return res.status(500).json({ error: 'Could not create collection' })
  res.json({ id, name })
})

router.get('/collections/:id', optionalAuth, async (req: AuthedRequest, res) => {
  const { data: col } = await supabase.from('collections').select('*').eq('id', req.params.id).maybeSingle()
  if (!col) return res.status(404).json({ error: 'Collection not found' })
  const { data: photos } = await supabase
    .from('photos')
    .select('id, filename, original_name, mime_type, size, created_at')
    .eq('collection_id', req.params.id)
    .order('created_at', { ascending: false })
  const isOwner = col.user_id != null && col.user_id === req.userId
  res.json({ collection: col, photos: photos || [], isOwner })
})

router.get('/collections/:id/qr', async (req, res) => {
  const { data: col } = await supabase.from('collections').select('id').eq('id', req.params.id).maybeSingle()
  if (!col) return res.status(404).json({ error: 'Collection not found' })
  const host = `${req.protocol}://${req.get('host')}`
  const url = `${host}/c/${req.params.id}`
  const qrPng = await QRCode.toBuffer(url, { width: 600 })
  res.type('png').send(qrPng)
})

router.post('/collections/:id/save', authMiddleware, async (req: AuthedRequest, res) => {
  const { data: col } = await supabase.from('collections').select('*').eq('id', req.params.id).maybeSingle()
  if (!col) return res.status(404).json({ error: 'Collection not found' })
  if (col.user_id === req.userId) return res.status(400).json({ error: 'This is already your collection' })

  const { data: photos } = await supabase
    .from('photos')
    .select('filename, original_name, mime_type, size')
    .eq('collection_id', req.params.id)

  const newId = generateId()
  const name = `${col.name} (saved)`.slice(0, 120)
  const { error } = await supabase.from('collections').insert({ id: newId, user_id: req.userId, name })
  if (error) return res.status(500).json({ error: 'Could not save collection' })

  for (const p of photos || []) {
    try {
      const { data: blob } = await supabase.storage.from(BUCKET).download(p.filename)
      if (!blob) continue
      const buf = Buffer.from(await blob.arrayBuffer())
      const ext = p.filename.includes('.') ? '.' + p.filename.split('.').pop() : ''
      const newFilename = generateId() + ext
      await supabase.storage.from(BUCKET).upload(newFilename, buf, { contentType: p.mime_type, upsert: true })
      await supabase.from('photos').insert({
        id: generateId(),
        collection_id: newId,
        filename: newFilename,
        original_name: p.original_name,
        mime_type: p.mime_type,
        size: p.size,
      })
    } catch {}
  }
  res.json({ id: newId, name })
})

router.get('/collections/:id/zip', async (req, res) => {
  const { data: col } = await supabase.from('collections').select('name').eq('id', req.params.id).maybeSingle()
  if (!col) return res.status(404).json({ error: 'Collection not found' })
  const { data: photos } = await supabase
    .from('photos')
    .select('filename, original_name')
    .eq('collection_id', req.params.id)
  if (!photos || photos.length === 0) return res.status(404).json({ error: 'No photos in this collection' })

  const entries: { name: string; data: Buffer }[] = []
  const used = new Set<string>()
  for (const p of photos) {
    const { data: blob } = await supabase.storage.from(BUCKET).download(p.filename)
    if (!blob) continue
    const buf = Buffer.from(await blob.arrayBuffer())
    let name = p.original_name || p.filename
    let i = 1
    while (used.has(name)) {
      const dot = name.lastIndexOf('.')
      name = dot > 0 ? `${name.slice(0, dot)} (${i})${name.slice(dot)}` : `${name} (${i})`
      i++
    }
    used.add(name)
    entries.push({ name, data: buf })
  }
  if (!entries.length) return res.status(404).json({ error: 'No photos in this collection' })

  const zip = createZip(entries)
  const safeName = (col.name.replace(/[^a-zA-Z0-9 _-]/g, '').trim() || 'photos').slice(0, 80)
  res.setHeader('Content-Type', 'application/zip')
  res.setHeader('Content-Disposition', `attachment; filename="${safeName}.zip"`)
  res.send(zip)
})

router.post('/collections/:id/photos', authMiddleware, upload.array('photos', 20), async (req: AuthedRequest, res) => {
  const { data: col } = await supabase.from('collections').select('user_id').eq('id', req.params.id).maybeSingle()
  if (!col) return res.status(404).json({ error: 'Collection not found' })
  if (col.user_id !== req.userId) return res.status(403).json({ error: 'Not your collection' })

  const files = req.files as Express.Multer.File[]
  if (!files || files.length === 0) return res.status(400).json({ error: 'No photos uploaded' })

  const photos = []
  for (const f of files) {
    const ext = (f.originalname.includes('.') ? '.' + f.originalname.split('.').pop() : '') || `.${f.mimetype.split('/')[1]}`
    const filename = generateId() + ext
    const { error } = await supabase.storage.from(BUCKET).upload(filename, f.buffer, { contentType: f.mimetype, upsert: true })
    if (error) continue
    const { data: row } = await supabase
      .from('photos')
      .insert({ id: generateId(), collection_id: req.params.id, filename, original_name: f.originalname, mime_type: f.mimetype, size: f.size })
      .select('id, filename, original_name, mime_type, size')
      .single()
    if (row) photos.push(row)
  }
  res.json({ photos })
})

router.delete('/photos/:id', authMiddleware, async (req: AuthedRequest, res) => {
  const { data: photo } = await supabase.from('photos').select('*').eq('id', req.params.id).maybeSingle()
  if (!photo) return res.status(404).json({ error: 'Photo not found' })
  const { data: col } = await supabase.from('collections').select('user_id').eq('id', photo.collection_id).maybeSingle()
  if (col?.user_id !== req.userId) return res.status(403).json({ error: 'Not your photo' })

  await supabase.storage.from(BUCKET).remove([photo.filename])
  await supabase.from('photos').delete().eq('id', req.params.id)
  res.json({ ok: true })
})

router.get('/photos/:filename', async (req, res) => {
  const { data: photo } = await supabase.from('photos').select('original_name, mime_type').eq('filename', req.params.filename).maybeSingle()
  if (!photo) return res.status(404).json({ error: 'Photo not found' })
  const { data: blob, error } = await supabase.storage.from(BUCKET).download(req.params.filename)
  if (error || !blob) return res.status(404).json({ error: 'Photo not found' })
  const buf = Buffer.from(await blob.arrayBuffer())
  if (req.query.download === '1') {
    res.setHeader('Content-Disposition', `attachment; filename="${photo.original_name}"`)
  }
  res.type(photo.mime_type).send(buf)
})

export default router

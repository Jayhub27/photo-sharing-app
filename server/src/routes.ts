import { Router, type Response } from 'express'
import multer from 'multer'
import QRCode from 'qrcode'
import sharp from 'sharp'
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

type Role = 'owner' | 'editor' | 'viewer'

const PHOTO_FIELDS = 'id, filename, thumb_filename, original_name, mime_type, size, width, height, created_at'
const THUMB_WIDTH = 640

interface Access {
  col: any | null
  role: Role | null
  isOwner: boolean
  canEdit: boolean
  canManage: boolean
}

async function getAccess(collectionId: string, userId?: string): Promise<Access> {
  const { data: col } = await supabase.from('collections').select('*').eq('id', collectionId).maybeSingle()
  if (!col) return { col: null, role: null, isOwner: false, canEdit: false, canManage: false }
  const isOwner = !!userId && col.user_id === userId
  let role: Role | null = isOwner ? 'owner' : null
  if (!role && userId) {
    const { data: m } = await supabase
      .from('collection_members')
      .select('role')
      .eq('collection_id', collectionId)
      .eq('user_id', userId)
      .maybeSingle()
    if (m) role = m.role as Role
  }
  const canEdit = role === 'owner' || role === 'editor'
  return { col, role, isOwner, canEdit, canManage: role === 'owner' }
}

function clampInt(value: unknown, fallback: number, min: number, max: number): number {
  const n = Number(value)
  if (!Number.isFinite(n)) return fallback
  return Math.min(max, Math.max(min, Math.floor(n)))
}

async function countsFor(ids: string[]): Promise<Record<string, number>> {
  if (!ids.length) return {}
  const { data } = await supabase.rpc('collection_photo_counts', { ids })
  const map: Record<string, number> = {}
  for (const row of data || []) map[row.collection_id] = Number(row.cnt)
  return map
}

async function makeThumb(buffer: Buffer): Promise<{ thumb: Buffer; width?: number; height?: number } | null> {
  try {
    const image = sharp(buffer).rotate()
    const meta = await image.metadata()
    const thumb = await image
      .resize({ width: THUMB_WIDTH, height: THUMB_WIDTH, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 72, mozjpeg: true })
      .toBuffer()
    return { thumb, width: meta.width, height: meta.height }
  } catch {
    return null
  }
}

/* ---------------------------------------------------------------- collections */

router.get('/collections', authMiddleware, async (req: AuthedRequest, res) => {
  const q = String(req.query.q || '').trim()
  const limit = clampInt(req.query.limit, 30, 1, 100)
  const offset = clampInt(req.query.offset, 0, 0, 100000)

  const { data: memberships } = await supabase
    .from('collection_members')
    .select('collection_id, role')
    .eq('user_id', req.userId)
  const memberIds = (memberships || []).map((m) => m.collection_id)
  const memberRoles = new Map((memberships || []).map((m) => [m.collection_id, m.role as Role]))

  let query = supabase
    .from('collections')
    .select('id, name, created_at, user_id', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (memberIds.length) {
    query = query.or(`user_id.eq.${req.userId},id.in.(${memberIds.join(',')})`)
  } else {
    query = query.eq('user_id', req.userId)
  }
  if (q) query = query.ilike('name', `%${q}%`)

  const { data, error, count } = await query.range(offset, offset + limit - 1)
  if (error) return res.status(500).json({ error: 'Could not load collections' })

  const ownIds = new Set((data || []).filter((c) => c.user_id === req.userId).map((c) => c.id))
  const counts = await countsFor((data || []).map((c) => c.id))
  const collections = (data || []).map((c) => ({
    id: c.id,
    name: c.name,
    created_at: c.created_at,
    photo_count: counts[c.id] || 0,
    role: ownIds.has(c.id) ? 'owner' : memberRoles.get(c.id) || 'viewer',
    is_owner: ownIds.has(c.id),
  }))

  res.json({ collections, total: count || 0, hasMore: offset + collections.length < (count || 0) })
})

router.post('/collections', authMiddleware, async (req: AuthedRequest, res) => {
  const name = String(req.body.name || 'Untitled').slice(0, 120)
  const id = generateId()
  const { error } = await supabase.from('collections').insert({ id, user_id: req.userId, name })
  if (error) return res.status(500).json({ error: 'Could not create collection' })
  res.json({ id, name })
})

router.get('/collections/:id', optionalAuth, async (req: AuthedRequest, res) => {
  const access = await getAccess(req.params.id, req.userId)
  if (!access.col) return res.status(404).json({ error: 'Collection not found' })

  const q = String(req.query.q || '').trim()
  const since = String(req.query.since || '').trim()
  const limit = clampInt(req.query.limit, 60, 1, 200)
  const offset = clampInt(req.query.offset, 0, 0, 100000)

  let query = supabase
    .from('photos')
    .select(PHOTO_FIELDS, { count: 'exact' })
    .eq('collection_id', req.params.id)
    .order('created_at', since ? { ascending: true } : { ascending: false })
  if (q) query = query.ilike('original_name', `%${q}%`)
  if (since) query = query.gt('created_at', since)

  const { data: photos, count } = await query.range(offset, offset + limit - 1)

  res.json({
    collection: access.col,
    photos: photos || [],
    total: count || 0,
    hasMore: offset + (photos || []).length < (count || 0),
    isOwner: access.isOwner,
    role: access.role,
    canEdit: access.canEdit,
    canManage: access.canManage,
  })
})

router.patch('/collections/:id', authMiddleware, async (req: AuthedRequest, res) => {
  const access = await getAccess(req.params.id, req.userId)
  if (!access.col) return res.status(404).json({ error: 'Collection not found' })
  if (!access.canManage) return res.status(403).json({ error: 'Not your collection' })
  const name = String(req.body.name || '').trim().slice(0, 120)
  if (!name) return res.status(400).json({ error: 'Name is required' })
  const { error } = await supabase.from('collections').update({ name }).eq('id', req.params.id)
  if (error) return res.status(500).json({ error: 'Could not rename collection' })
  res.json({ id: req.params.id, name })
})

router.delete('/collections/:id', authMiddleware, async (req: AuthedRequest, res) => {
  const access = await getAccess(req.params.id, req.userId)
  if (!access.col) return res.status(404).json({ error: 'Collection not found' })
  if (!access.canManage) return res.status(403).json({ error: 'Not your collection' })

  const { data: photos } = await supabase
    .from('photos')
    .select('filename, thumb_filename')
    .eq('collection_id', req.params.id)
  const keys = (photos || []).flatMap((p) => [p.filename, p.thumb_filename]).filter(Boolean) as string[]
  if (keys.length) await supabase.storage.from(BUCKET).remove(keys)
  await supabase.from('photos').delete().eq('collection_id', req.params.id)
  await supabase.from('collection_members').delete().eq('collection_id', req.params.id)
  await supabase.from('collections').delete().eq('id', req.params.id)
  res.json({ ok: true })
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
    .select('filename, thumb_filename, original_name, mime_type, size, width, height')
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

      let newThumb: string | null = null
      if (p.thumb_filename) {
        const { data: t } = await supabase.storage.from(BUCKET).download(p.thumb_filename)
        if (t) {
          const tbuf = Buffer.from(await t.arrayBuffer())
          newThumb = generateId() + '.jpg'
          await supabase.storage.from(BUCKET).upload(newThumb, tbuf, { contentType: 'image/jpeg', upsert: true })
        }
      }
      await supabase.from('photos').insert({
        id: generateId(),
        collection_id: newId,
        filename: newFilename,
        thumb_filename: newThumb,
        original_name: p.original_name,
        mime_type: p.mime_type,
        size: p.size,
        width: p.width,
        height: p.height,
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

/* --------------------------------------------------------------------- photos */

router.post(
  '/collections/:id/photos',
  authMiddleware,
  upload.array('photos', 20),
  async (req: AuthedRequest, res) => {
    const access = await getAccess(req.params.id, req.userId)
    if (!access.col) return res.status(404).json({ error: 'Collection not found' })
    if (!access.canEdit) return res.status(403).json({ error: 'Not your collection' })

    const files = req.files as Express.Multer.File[]
    if (!files || files.length === 0) return res.status(400).json({ error: 'No photos uploaded' })

    const photos = []
    for (const f of files) {
      const ext = (f.originalname.includes('.') ? '.' + f.originalname.split('.').pop() : '') || `.${f.mimetype.split('/')[1]}`
      const filename = generateId() + ext

      let thumbFilename: string | null = null
      let width: number | undefined
      let height: number | undefined
      const made = await makeThumb(f.buffer)
      if (made) {
        width = made.width
        height = made.height
        thumbFilename = generateId() + '.jpg'
        const { error: thumbErr } = await supabase.storage
          .from(BUCKET)
          .upload(thumbFilename, made.thumb, { contentType: 'image/jpeg', upsert: true })
        if (thumbErr) thumbFilename = null
      }

      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(filename, f.buffer, { contentType: f.mimetype, upsert: true })
      if (error) continue

      const { data: row } = await supabase
        .from('photos')
        .insert({
          id: generateId(),
          collection_id: req.params.id,
          filename,
          thumb_filename: thumbFilename,
          original_name: f.originalname,
          mime_type: f.mimetype,
          size: f.size,
          width,
          height,
        })
        .select(PHOTO_FIELDS)
        .single()
      if (row) photos.push(row)
    }
    res.json({ photos })
  }
)

router.delete('/photos/:id', authMiddleware, async (req: AuthedRequest, res) => {
  const { data: photo } = await supabase.from('photos').select('*').eq('id', req.params.id).maybeSingle()
  if (!photo) return res.status(404).json({ error: 'Photo not found' })
  const access = await getAccess(photo.collection_id, req.userId)
  if (!access.canEdit) return res.status(403).json({ error: 'Not your photo' })

  const keys = [photo.filename, photo.thumb_filename].filter(Boolean) as string[]
  await supabase.storage.from(BUCKET).remove(keys)
  await supabase.from('photos').delete().eq('id', req.params.id)
  res.json({ ok: true })
})

router.get('/photos/:filename', async (req, res) => {
  const { data: photo } = await supabase
    .from('photos')
    .select('filename, thumb_filename, original_name, mime_type')
    .eq('filename', req.params.filename)
    .maybeSingle()
  if (!photo) return res.status(404).json({ error: 'Photo not found' })

  const useThumb = req.query.thumb === '1' && !!photo.thumb_filename
  const key = useThumb ? photo.thumb_filename : photo.filename
  const { data: blob, error } = await supabase.storage.from(BUCKET).download(key as string)
  if (error || !blob) return res.status(404).json({ error: 'Photo not found' })
  const buf = Buffer.from(await blob.arrayBuffer())

  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
  if (req.query.download === '1') {
    res.setHeader('Content-Disposition', `attachment; filename="${photo.original_name}"`)
  }
  res.type(useThumb ? 'image/jpeg' : photo.mime_type).send(buf)
})

/* -------------------------------------------------------------------- members */

router.get('/collections/:id/members', authMiddleware, async (req: AuthedRequest, res) => {
  const access = await getAccess(req.params.id, req.userId)
  if (!access.col) return res.status(404).json({ error: 'Collection not found' })
  if (!access.role) return res.status(403).json({ error: 'Not a member' })

  const { data: owner } = await supabase
    .from('users')
    .select('id, name, email')
    .eq('id', access.col.user_id)
    .maybeSingle()
  const { data: rows } = await supabase
    .from('collection_members')
    .select('user_id, role, created_at')
    .eq('collection_id', req.params.id)

  const ids = (rows || []).map((m) => m.user_id)
  let users: Record<string, { name: string; email: string }> = {}
  if (ids.length) {
    const { data } = await supabase.from('users').select('id, name, email').in('id', ids)
    for (const u of data || []) users[u.id] = { name: u.name, email: u.email }
  }

  res.json({
    members: [
      ...(owner ? [{ user_id: owner.id, name: owner.name, email: owner.email, role: 'owner', created_at: access.col.created_at }] : []),
      ...(rows || [])
        .filter((m) => m.user_id !== access.col.user_id)
        .map((m) => ({ user_id: m.user_id, name: users[m.user_id]?.name || 'Unknown', email: users[m.user_id]?.email || '', role: m.role, created_at: m.created_at })),
    ],
    canManage: access.canManage,
  })
})

router.post('/collections/:id/members', authMiddleware, async (req: AuthedRequest, res) => {
  const access = await getAccess(req.params.id, req.userId)
  if (!access.col) return res.status(404).json({ error: 'Collection not found' })
  if (!access.canManage) return res.status(403).json({ error: 'Only the owner can invite' })

  const email = String(req.body.email || '').trim().toLowerCase()
  const role = req.body.role === 'editor' ? 'editor' : 'viewer'
  if (!email) return res.status(400).json({ error: 'Email is required' })

  const { data: user } = await supabase.from('users').select('id, name, email').eq('email', email).maybeSingle()
  if (!user) return res.status(404).json({ error: 'No PhotoShare account with that email' })
  if (user.id === access.col.user_id) return res.status(400).json({ error: 'That is the owner' })

  const { error } = await supabase
    .from('collection_members')
    .upsert({ collection_id: req.params.id, user_id: user.id, role }, { onConflict: 'collection_id,user_id' })
  if (error) return res.status(500).json({ error: 'Could not add member' })
  res.json({ user_id: user.id, name: user.name, email: user.email, role })
})

router.patch('/collections/:id/members/:userId', authMiddleware, async (req: AuthedRequest, res) => {
  const access = await getAccess(req.params.id, req.userId)
  if (!access.col) return res.status(404).json({ error: 'Collection not found' })
  if (!access.canManage) return res.status(403).json({ error: 'Only the owner can change roles' })
  const role = req.body.role === 'editor' ? 'editor' : 'viewer'
  const { error } = await supabase
    .from('collection_members')
    .update({ role })
    .eq('collection_id', req.params.id)
    .eq('user_id', req.params.userId)
  if (error) return res.status(500).json({ error: 'Could not update member' })
  res.json({ ok: true, role })
})

router.delete('/collections/:id/members/:userId', authMiddleware, async (req: AuthedRequest, res) => {
  const access = await getAccess(req.params.id, req.userId)
  if (!access.col) return res.status(404).json({ error: 'Collection not found' })
  const removingSelf = req.params.userId === req.userId
  if (!access.canManage && !removingSelf) return res.status(403).json({ error: 'Only the owner can remove members' })
  await supabase
    .from('collection_members')
    .delete()
    .eq('collection_id', req.params.id)
    .eq('user_id', req.params.userId)
  res.json({ ok: true })
})

export default router

import { Router, type Request, type Response } from 'express'
import multer from 'multer'
import QRCode from 'qrcode'
import sharp from 'sharp'
import { supabase, BUCKET } from './db.js'
import { generateId, publicBaseUrl } from './utils.js'
import { createZip } from './zip.js'
import { authMiddleware, optionalAuth, type AuthedRequest } from './auth.js'
import { rateLimit } from './ratelimit.js'
import {
  CURRENCIES,
  applicationFeePercent,
  isStripeConfigured,
  sellingSchemaReady,
  refreshSellingSchema,
  stripe,
  stripeWebhookSecret,
  type Currency,
} from './stripe.js'

const router = Router()

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 120,
  message: 'Upload limit reached. Please try again later.',
})

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

async function refreshCover(collectionId: string) {
  const { data: photos } = await supabase
    .from('photos')
    .select('filename, thumb_filename')
    .eq('collection_id', collectionId)
    .order('created_at', { ascending: true })
    .limit(1)
  const cover = (photos || [])[0]
  await supabase
    .from('collections')
    .update({
      cover_filename: cover ? cover.filename : null,
      cover_thumb_filename: cover ? cover.thumb_filename : null,
    })
    .eq('id', collectionId)
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

async function storePhoto(
  collectionId: string,
  buffer: Buffer,
  originalName: string,
  mime: string,
): Promise<Record<string, unknown> | null> {
  const ext = (originalName.includes('.') ? '.' + originalName.split('.').pop() : '') || `.${mime.split('/')[1] || 'jpg'}`
  const filename = generateId() + ext

  let thumbFilename: string | null = null
  let width: number | undefined
  let height: number | undefined
  const made = await makeThumb(buffer)
  if (made) {
    width = made.width
    height = made.height
    thumbFilename = generateId() + '.jpg'
    const { error: thumbErr } = await supabase.storage
      .from(BUCKET)
      .upload(thumbFilename, made.thumb, { contentType: 'image/jpeg', upsert: true })
    if (thumbErr) thumbFilename = null
  }

  const { error } = await supabase.storage.from(BUCKET).upload(filename, buffer, { contentType: mime, upsert: true })
  if (error) return null

  const { data: row } = await supabase
    .from('photos')
    .insert({
      id: generateId(),
      collection_id: collectionId,
      filename,
      thumb_filename: thumbFilename,
      original_name: originalName,
      mime_type: mime,
      size: buffer.length,
      width,
      height,
    })
    .select(PHOTO_FIELDS)
    .single()
  return row || null
}

/* ----------------------------------------------------------------- selling */

const PRICE_MAX_CENTS = 5_000_000

function normalizePrice(value: unknown): number | null | undefined {
  if (value === null || value === '') return null
  const n = Number(value)
  if (!Number.isFinite(n)) return undefined
  const cents = Math.round(n)
  if (cents < 0 || cents > PRICE_MAX_CENTS) return undefined
  return cents
}

function normalizeCurrency(value: unknown): Currency | undefined {
  const c = String(value || '').trim().toLowerCase()
  return (CURRENCIES as readonly string[]).includes(c) ? (c as Currency) : undefined
}

async function hasPurchased(collectionId: string, userId?: string, email?: string): Promise<boolean> {
  if (!(await sellingSchemaReady())) return false
  if (userId) {
    const { data } = await supabase
      .from('purchases')
      .select('id')
      .eq('collection_id', collectionId)
      .eq('buyer_user_id', userId)
      .eq('status', 'paid')
      .limit(1)
    if (data && data.length) return true
  }
  if (email) {
    const { data } = await supabase
      .from('purchases')
      .select('id')
      .eq('collection_id', collectionId)
      .eq('buyer_email', email.toLowerCase())
      .eq('status', 'paid')
      .limit(1)
    if (data && data.length) return true
  }
  return false
}

function isLocked(col: any, access: Access, purchased: boolean): boolean {
  const price = Number(col?.price_cents)
  if (!Number.isFinite(price) || price <= 0) return false
  return !access.canEdit && !purchased
}

async function accessState(col: any, access: Access, userId?: string, email?: string) {
  const price = Number.isFinite(Number(col?.price_cents)) ? Number(col.price_cents) : null
  const priced = price !== null && price > 0
  if (priced && userId && !email) {
    const { data: buyer } = await supabase.from('users').select('email').eq('id', userId).maybeSingle()
    email = buyer?.email
  }
  const purchased = priced ? await hasPurchased(col.id, userId, email) : false
  return {
    price_cents: priced ? price : null,
    currency: (col?.currency as string) || 'usd',
    purchased,
    locked: priced && !access.canEdit && !purchased,
    stripeConfigured: isStripeConfigured(),
    schemaReady: await sellingSchemaReady(),
  }
}

/* ------------------------------------------------------------ import (URLs) */

const PRIVATE_HOST_RE =
  /^(localhost|.*\.local|.*\.internal|0\.0\.0\.0|127\.|10\.|192\.168\.|169\.254\.|\[?::1\]?$|172\.(1[6-9]|2\d|3[01])\.)/i

function assertPublicUrl(raw: string): URL {
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    throw new Error('Not a valid URL')
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new Error('Only http(s) links are supported')
  if (PRIVATE_HOST_RE.test(url.hostname)) throw new Error('That host is not reachable from the server')
  return url
}

/** Turn Google Drive/Photos share links into something the server can fetch. */
function normalizeImportUrl(raw: string): string {
  const url = new URL(raw)
  const host = url.hostname.replace(/^www\./, '')
  if (host === 'drive.google.com' || host === 'docs.google.com') {
    const id = url.pathname.match(/\/d\/([^/]+)/)?.[1] || url.searchParams.get('id') || ''
    if (id) return `https://drive.google.com/uc?export=download&id=${id}`
  }
  return raw
}

async function fetchImage(
  raw: string,
): Promise<{ buffer: Buffer; mime: string; name: string } | { error: string }> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 20_000)
  try {
    const url = assertPublicUrl(raw)
    const res = await fetch(normalizeImportUrl(url.toString()), {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'user-agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36',
        accept: 'image/*,text/html;q=0.8,*/*;q=0.5',
      },
    })
    if (!res.ok) return { error: `Server responded ${res.status}` }
    const type = (res.headers.get('content-type') || '').split(';')[0].trim()
    if (type.startsWith('image/')) {
      const buffer = Buffer.from(await res.arrayBuffer())
      if (buffer.length > 25 * 1024 * 1024) return { error: 'Image is larger than 25 MB' }
      const name = decodeURIComponent(url.pathname.split('/').pop() || 'imported.jpg').slice(0, 120) || 'imported.jpg'
      return { buffer, mime: type, name }
    }
    if (type.includes('text/html')) {
      const html = await res.text()
      const match =
        html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
        html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)
      if (!match) return { error: 'No image found on that page (album links often need direct photo links)' }
      const imageUrl = new URL(match[1], url).toString()
      const imgRes = await fetch(imageUrl, { signal: controller.signal, headers: { 'user-agent': 'Mozilla/5.0' } })
      if (!imgRes.ok) return { error: `Could not load the page image (${imgRes.status})` }
      const mime = (imgRes.headers.get('content-type') || 'image/jpeg').split(';')[0].trim()
      const buffer = Buffer.from(await imgRes.arrayBuffer())
      if (buffer.length > 25 * 1024 * 1024) return { error: 'Image is larger than 25 MB' }
      return { buffer, mime, name: 'imported.jpg' }
    }
    return { error: `Unsupported content type (${type || 'unknown'})` }
  } catch (err: any) {
    return { error: err?.name === 'AbortError' ? 'Timed out while downloading' : err?.message || 'Download failed' }
  } finally {
    clearTimeout(timer)
  }
}

/* ---------------------------------------------------------------- collections */

router.get('/collections', authMiddleware, async (req: AuthedRequest, res) => {
  const q = String(req.query.q || '').trim()
  const sort = String(req.query.sort || 'newest') === 'name' ? 'name' : 'newest'
  const filter = ['owned', 'shared'].includes(String(req.query.filter)) ? String(req.query.filter) : 'all'
  const limit = clampInt(req.query.limit, 30, 1, 100)
  const offset = clampInt(req.query.offset, 0, 0, 100000)

  const { data: memberships } = await supabase
    .from('collection_members')
    .select('collection_id, role')
    .eq('user_id', req.userId)
  const memberIds = (memberships || []).map((m) => m.collection_id)
  const memberRoles = new Map((memberships || []).map((m) => [m.collection_id, m.role as Role]))

  const BASE_FIELDS = 'id, name, created_at, user_id, is_public, cover_filename, cover_thumb_filename'
  const SELLING_FIELDS = BASE_FIELDS + ', price_cents, currency'

  if (filter === 'shared' && !memberIds.length) {
    return res.json({ collections: [], total: 0, hasMore: false })
  }

  const build = (fields: string) => {
    let query = supabase
      .from('collections')
      .select(fields, { count: 'exact' })
      .order(sort === 'name' ? 'name' : 'created_at', { ascending: sort === 'name' })
    if (filter === 'owned') {
      query = query.eq('user_id', req.userId)
    } else if (filter === 'shared') {
      query = query.in('id', memberIds)
    } else if (memberIds.length) {
      query = query.or(`user_id.eq.${req.userId},id.in.(${memberIds.join(',')})`)
    } else {
      query = query.eq('user_id', req.userId)
    }
    if (q) query = query.ilike('name', `%${q}%`)
    return query.range(offset, offset + limit - 1)
  }

  // Price columns only exist after the selling migration, so fall back when they are missing.
  let result: { data: any[] | null; error: unknown; count: number | null } = await build(SELLING_FIELDS)
  if (result.error) result = await build(BASE_FIELDS)
  if (result.error) return res.status(500).json({ error: 'Could not load collections' })
  const data = result.data
  const count = result.count

  const ownIds = new Set((data || []).filter((c) => c.user_id === req.userId).map((c) => c.id))
  const counts = await countsFor((data || []).map((c) => c.id))
  const collections = (data || []).map((c) => ({
    id: c.id,
    name: c.name,
    created_at: c.created_at,
    is_public: c.is_public !== false,
    cover_filename: c.cover_filename,
    cover_thumb_filename: c.cover_thumb_filename,
    price_cents: Number.isFinite(Number(c.price_cents)) && Number(c.price_cents) > 0 ? Number(c.price_cents) : null,
    currency: c.currency || 'usd',
    photo_count: counts[c.id] || 0,
    role: ownIds.has(c.id) ? 'owner' : memberRoles.get(c.id) || 'viewer',
    is_owner: ownIds.has(c.id),
  }))

  res.json({ collections, total: count || 0, hasMore: offset + collections.length < (count || 0) })
})

router.post('/collections', authMiddleware, async (req: AuthedRequest, res) => {
  const name = String(req.body.name || '').trim().slice(0, 120) || 'Untitled'
  const id = generateId()
  const { error } = await supabase.from('collections').insert({ id, user_id: req.userId, name })
  if (error) return res.status(500).json({ error: 'Could not create collection' })
  res.json({ id, name })
})

router.get('/collections/:id', optionalAuth, async (req: AuthedRequest, res) => {
  const access = await getAccess(req.params.id, req.userId)
  if (!access.col) return res.status(404).json({ error: 'Collection not found' })
  if (access.col.is_public === false && !access.role) {
    return res.status(403).json({ error: 'This collection is private', private: true })
  }

  const q = String(req.query.q || '').trim()
  const since = String(req.query.since || '').trim()
  const sort = String(req.query.sort || 'newest')
  const limit = clampInt(req.query.limit, 60, 1, 200)
  const offset = clampInt(req.query.offset, 0, 0, 100000)

  const orderBy = since || sort === 'oldest'
    ? { column: 'created_at', ascending: true }
    : sort === 'name'
      ? { column: 'original_name', ascending: true }
      : { column: 'created_at', ascending: false }

  let query = supabase
    .from('photos')
    .select(PHOTO_FIELDS, { count: 'exact' })
    .eq('collection_id', req.params.id)
    .order(orderBy.column, { ascending: orderBy.ascending })
  if (q) query = query.ilike('original_name', `%${q}%`)
  if (since) query = query.gt('created_at', since)

  const { data: photos, count } = await query.range(offset, offset + limit - 1)

  const pricing = await accessState(access.col, access, req.userId)

  res.json({
    collection: access.col,
    photos: photos || [],
    total: count || 0,
    hasMore: offset + (photos || []).length < (count || 0),
    isOwner: access.isOwner,
    role: access.role,
    canEdit: access.canEdit,
    canManage: access.canManage,
    pricing,
  })
})

router.patch('/collections/:id', authMiddleware, async (req: AuthedRequest, res) => {
  const access = await getAccess(req.params.id, req.userId)
  if (!access.col) return res.status(404).json({ error: 'Collection not found' })
  if (!access.canManage) return res.status(403).json({ error: 'Not your collection' })

  const patch: { name?: string; is_public?: boolean; price_cents?: number | null; currency?: string } = {}
  if (typeof req.body.name === 'string') {
    const name = req.body.name.trim().slice(0, 120)
    if (!name) return res.status(400).json({ error: 'Name is required' })
    patch.name = name
  }
  if (typeof req.body.is_public === 'boolean') patch.is_public = req.body.is_public
  if ('price_cents' in req.body) {
    const price = normalizePrice(req.body.price_cents)
    if (price === undefined) return res.status(400).json({ error: 'Enter a valid price' })
    if (price !== null && !(await sellingSchemaReady())) {
      await refreshSellingSchema()
      return res.status(503).json({
        error: 'Selling is not enabled in the database yet',
        code: 'schema_missing',
        hint: 'Run the selling section of supabase/schema.sql in the Supabase SQL editor',
      })
    }
    patch.price_cents = price
  }
  if ('currency' in req.body) {
    const currency = normalizeCurrency(req.body.currency)
    if (!currency) return res.status(400).json({ error: 'Unsupported currency' })
    patch.currency = currency
  }
  if (!Object.keys(patch).length) return res.status(400).json({ error: 'Nothing to update' })

  const { error } = await supabase.from('collections').update(patch).eq('id', req.params.id)
  if (error) {
    await refreshSellingSchema()
    return res.status(500).json({ error: 'Could not update collection' })
  }
  res.json({ id: req.params.id, ...patch })
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
  const url = `${publicBaseUrl(req)}/c/${req.params.id}`
  const qrPng = await QRCode.toBuffer(url, { width: 600 })
  res.type('png').send(qrPng)
})

router.post('/collections/:id/save', authMiddleware, async (req: AuthedRequest, res) => {
  const { data: col } = await supabase.from('collections').select('*').eq('id', req.params.id).maybeSingle()
  if (!col) return res.status(404).json({ error: 'Collection not found' })
  if (col.user_id === req.userId) return res.status(400).json({ error: 'This is already your collection' })
  if (col.is_public === false) {
    const access = await getAccess(req.params.id, req.userId)
    if (!access.role) return res.status(403).json({ error: 'This collection is private' })
  }

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
  await refreshCover(newId)
  res.json({ id: newId, name })
})

router.get('/collections/:id/zip', optionalAuth, async (req: AuthedRequest, res) => {
  const access = await getAccess(req.params.id, req.userId)
  if (!access.col) return res.status(404).json({ error: 'Collection not found' })
  if (access.col.is_public === false && !access.role) {
    return res.status(403).json({ error: 'This collection is private' })
  }
  const col = access.col
  const pricing = await accessState(col, access, req.userId)
  if (pricing.locked) {
    return res.status(402).json({
      error: 'Purchase required',
      price_cents: pricing.price_cents,
      currency: pricing.currency,
      code: 'purchase_required',
    })
  }
  const ids = String(req.query.ids || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 500)
  let photosQuery = supabase
    .from('photos')
    .select('filename, original_name')
    .eq('collection_id', req.params.id)
  if (ids.length) photosQuery = photosQuery.in('id', ids)
  const { data: photos } = await photosQuery
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
  uploadLimiter,
  upload.array('photos', 20),
  async (req: AuthedRequest, res) => {
    const access = await getAccess(req.params.id, req.userId)
    if (!access.col) return res.status(404).json({ error: 'Collection not found' })
    if (!access.canEdit) return res.status(403).json({ error: 'Not your collection' })

    const files = req.files as Express.Multer.File[]
    if (!files || files.length === 0) return res.status(400).json({ error: 'No photos uploaded' })

    const photos = []
    for (const f of files) {
      const row = await storePhoto(req.params.id, f.buffer, f.originalname, f.mimetype)
      if (row) photos.push(row)
    }
    if (photos.length) await refreshCover(req.params.id)
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
  await refreshCover(photo.collection_id)
  res.json({ ok: true })
})

router.get('/photos/:filename', optionalAuth, async (req: AuthedRequest, res) => {
  const { data: photo } = await supabase
    .from('photos')
    .select('filename, thumb_filename, original_name, mime_type, collection_id')
    .eq('filename', req.params.filename)
    .maybeSingle()
  if (!photo) return res.status(404).json({ error: 'Photo not found' })

  const access = await getAccess(photo.collection_id, req.userId)
  const isPrivate = access.col ? access.col.is_public === false : false
  if (isPrivate && !access.role) return res.status(403).json({ error: 'This photo is private' })

  let useThumb = req.query.thumb === '1' && !!photo.thumb_filename
  if (!useThumb && access.col) {
    const pricing = await accessState(access.col, access, req.userId)
    if (pricing.locked) {
      if (!photo.thumb_filename || req.query.download === '1') {
        return res.status(402).json({
          error: 'Purchase required',
          code: 'purchase_required',
          price_cents: pricing.price_cents,
          currency: pricing.currency,
        })
      }
      // Locked collections stream the low-res thumbnail instead of the original.
      useThumb = true
    }
  }
  const key = useThumb ? photo.thumb_filename : photo.filename
  const { data: blob, error } = await supabase.storage.from(BUCKET).download(key as string)
  if (error || !blob) return res.status(404).json({ error: 'Photo not found' })
  const buf = Buffer.from(await blob.arrayBuffer())

  res.setHeader('Cache-Control', isPrivate ? 'private, max-age=3600' : 'public, max-age=31536000, immutable')
  if (req.query.download === '1') {
    const safeName = String(photo.original_name || 'photo').replace(/[\r\n"\\]/g, '').slice(0, 200)
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`)
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
  if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'Enter a valid email address' })

  const { data: user } = await supabase.from('users').select('id, name, email').eq('email', email).maybeSingle()
  if (!user) return res.status(404).json({ error: 'No Take the shot account with that email' })
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

/* ------------------------------------------------------------------- import */

router.post('/collections/:id/import', authMiddleware, uploadLimiter, async (req: AuthedRequest, res) => {
  const access = await getAccess(req.params.id, req.userId)
  if (!access.col) return res.status(404).json({ error: 'Collection not found' })
  if (!access.canEdit) return res.status(403).json({ error: 'Not your collection' })

  const raw = Array.isArray(req.body.urls) ? req.body.urls : [req.body.url]
  const urls = raw
    .map((u: unknown) => String(u || '').trim())
    .filter(Boolean)
    .slice(0, 10)
  if (!urls.length) return res.status(400).json({ error: 'Paste at least one image link' })

  const results: { url: string; photo?: unknown; error?: string }[] = []
  for (const url of urls) {
    const fetched = await fetchImage(url)
    if ('error' in fetched) {
      results.push({ url, error: fetched.error })
      continue
    }
    const row = await storePhoto(req.params.id, fetched.buffer, fetched.name, fetched.mime)
    results.push(row ? { url, photo: row } : { url, error: 'Could not store that image' })
  }
  const imported = results.filter((r) => r.photo).length
  if (imported) await refreshCover(req.params.id)
  res.json({ results, imported })
})

/* ------------------------------------------------------------ batch actions */

router.post('/collections/:id/photos/delete', authMiddleware, async (req: AuthedRequest, res) => {
  const access = await getAccess(req.params.id, req.userId)
  if (!access.col) return res.status(404).json({ error: 'Collection not found' })
  if (!access.canEdit) return res.status(403).json({ error: 'Not your collection' })

  const ids = (Array.isArray(req.body.ids) ? req.body.ids : [])
    .map((v: unknown) => String(v || ''))
    .filter(Boolean)
    .slice(0, 200)
  if (!ids.length) return res.status(400).json({ error: 'No photos selected' })

  const { data: photos } = await supabase
    .from('photos')
    .select('id, filename, thumb_filename')
    .eq('collection_id', req.params.id)
    .in('id', ids)
  const keys = (photos || []).flatMap((p) => [p.filename, p.thumb_filename]).filter(Boolean) as string[]
  if (keys.length) await supabase.storage.from(BUCKET).remove(keys)
  await supabase.from('photos').delete().eq('collection_id', req.params.id).in('id', ids)
  await refreshCover(req.params.id)
  res.json({ deleted: (photos || []).length })
})

/* ------------------------------------------------------------------- selling */

async function recordPurchase(session: any) {
  const collectionId = session?.metadata?.collection_id
  if (!collectionId) return
  const paid = session.payment_status === 'paid'
  const { data: existing } = await supabase
    .from('purchases')
    .select('id')
    .eq('stripe_session_id', session.id)
    .maybeSingle()
  const payload = {
    status: paid ? 'paid' : 'pending',
    paid_at: paid ? new Date().toISOString() : null,
    buyer_email: session.customer_details?.email || session.customer_email || null,
    stripe_payment_intent:
      typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id || null,
  }
  if (existing) {
    await supabase.from('purchases').update(payload).eq('id', existing.id)
    return
  }
  await supabase.from('purchases').insert({
    id: generateId(),
    collection_id: collectionId,
    buyer_user_id: session.metadata?.buyer_user_id || null,
    amount_cents: session.amount_total || 0,
    currency: session.currency || 'usd',
    stripe_session_id: session.id,
    ...payload,
  })
}

router.post('/collections/:id/checkout', optionalAuth, async (req: AuthedRequest, res) => {
  const access = await getAccess(req.params.id, req.userId)
  if (!access.col) return res.status(404).json({ error: 'Collection not found' })
  if (access.col.is_public === false && !access.role) return res.status(403).json({ error: 'This collection is private' })

  const price = Number(access.col.price_cents)
  if (!Number.isFinite(price) || price <= 0) return res.status(400).json({ error: 'This collection is not for sale' })
  if (access.canEdit) return res.status(400).json({ error: 'You already own this collection' })

  if (!(await sellingSchemaReady())) {
    return res.status(503).json({
      error: 'Selling is not enabled in the database yet',
      code: 'schema_missing',
      hint: 'Run the selling section of supabase/schema.sql in the Supabase SQL editor',
    })
  }
  const s = stripe()
  if (!s) {
    return res.status(503).json({
      error: 'Payments are not configured',
      code: 'stripe_not_configured',
      hint: 'Set STRIPE_SECRET_KEY on the server',
    })
  }

  let email: string | undefined
  if (req.userId) {
    const { data: buyer } = await supabase.from('users').select('email').eq('id', req.userId).maybeSingle()
    email = buyer?.email
  }
  if (await hasPurchased(access.col.id, req.userId, email)) return res.json({ alreadyPurchased: true })

  const currency = normalizeCurrency(access.col.currency) || 'usd'
  const base = publicBaseUrl(req)
  const { count } = await supabase
    .from('photos')
    .select('id', { count: 'exact', head: true })
    .eq('collection_id', access.col.id)

  const params: any = {
    mode: 'payment',
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency,
          unit_amount: price,
          product_data: {
            name: String(access.col.name || 'Photo collection').slice(0, 120),
            description: `${count || 0} original photo${count === 1 ? '' : 's'} · Take the shot`,
          },
        },
      },
    ],
    success_url: `${base}/c/${access.col.id}?purchased=1&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/c/${access.col.id}?canceled=1`,
    metadata: { collection_id: access.col.id, buyer_user_id: req.userId || '' },
  }
  if (email) params.customer_email = email

  const { data: owner } = await supabase
    .from('users')
    .select('stripe_account_id')
    .eq('id', access.col.user_id)
    .maybeSingle()
  const destination = owner?.stripe_account_id
  if (destination) {
    params.payment_intent_data = { transfer_data: { destination } }
    const fee = applicationFeePercent()
    if (fee > 0) params.payment_intent_data.application_fee_amount = Math.round((price * fee) / 100)
  }

  try {
    const session = await s.checkout.sessions.create(params)
    res.json({ url: session.url, id: session.id })
  } catch (err: any) {
    res.status(502).json({ error: err?.message || 'Could not start checkout' })
  }
})

router.get('/collections/:id/access', optionalAuth, async (req: AuthedRequest, res) => {
  const access = await getAccess(req.params.id, req.userId)
  if (!access.col) return res.status(404).json({ error: 'Collection not found' })

  const sessionId = String(req.query.session_id || '').trim()
  if (sessionId && (await sellingSchemaReady())) {
    const s = stripe()
    if (s) {
      try {
        const session = await s.checkout.sessions.retrieve(sessionId)
        if (session.payment_status === 'paid' && session.metadata?.collection_id === req.params.id) {
          await recordPurchase(session)
        }
      } catch {}
    }
  }

  const pricing = await accessState(access.col, access, req.userId)
  res.json({ pricing, isOwner: access.isOwner, role: access.role, canEdit: access.canEdit })
})

router.get('/collections/:id/sales', authMiddleware, async (req: AuthedRequest, res) => {
  const access = await getAccess(req.params.id, req.userId)
  if (!access.col) return res.status(404).json({ error: 'Collection not found' })
  if (!access.canManage) return res.status(403).json({ error: 'Only the owner can see sales' })

  const schemaReady = await sellingSchemaReady()
  const { data: owner } = await supabase
    .from('users')
    .select('stripe_account_id')
    .eq('id', req.userId)
    .maybeSingle()
  if (!schemaReady) {
    return res.json({ sales: [], count: 0, gross_cents: 0, currency: 'usd', schemaReady, stripeConfigured: isStripeConfigured(), payoutAccount: owner?.stripe_account_id || null })
  }

  const { data: sales } = await supabase
    .from('purchases')
    .select('id, buyer_email, amount_cents, currency, status, created_at, paid_at')
    .eq('collection_id', req.params.id)
    .order('created_at', { ascending: false })
    .limit(200)
  const paid = (sales || []).filter((s) => s.status === 'paid')
  res.json({
    sales: sales || [],
    count: paid.length,
    gross_cents: paid.reduce((sum, s) => sum + (s.amount_cents || 0), 0),
    currency: paid[0]?.currency || normalizeCurrency(access.col.currency) || 'usd',
    schemaReady,
    stripeConfigured: isStripeConfigured(),
    payoutAccount: owner?.stripe_account_id || null,
  })
})

export async function stripeWebhookHandler(req: Request, res: Response) {
  const s = stripe()
  const secret = stripeWebhookSecret()
  if (!s || !secret) return res.status(503).json({ error: 'Stripe webhook is not configured' })
  const signature = String(req.headers['stripe-signature'] || '')
  if (!signature) return res.status(400).json({ error: 'Missing Stripe signature' })
  try {
    const event = s.webhooks.constructEvent(req.body as Buffer, signature, secret)
    if (
      event.type === 'checkout.session.completed' ||
      event.type === 'checkout.session.async_payment_succeeded'
    ) {
      await recordPurchase(event.data.object)
    }
    res.json({ received: true })
  } catch {
    res.status(400).json({ error: 'Invalid Stripe signature' })
  }
}

export default router

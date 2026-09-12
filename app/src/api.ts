export const API_BASE = 'http://192.168.1.100:3000'

let authToken: string | null = null

export function setAuthToken(token: string | null) {
  authToken = token
}

export interface Photo {
  id: string
  filename: string
  thumb_filename?: string | null
  original_name: string
  mime_type: string
  size: number
  width?: number | null
  height?: number | null
  created_at?: string
}

export interface Collection {
  id: string
  name: string
  created_at?: string
  photo_count?: number
  cover_filename?: string | null
  cover_thumb_filename?: string | null
  role?: MemberRole | null
  is_owner?: boolean
}

export interface CollectionResponse {
  collection: Collection
  photos: Photo[]
  total: number
  hasMore: boolean
  isOwner: boolean
  role: MemberRole | null
  canEdit: boolean
  canManage: boolean
}

export type MemberRole = 'owner' | 'editor' | 'viewer'

export interface Member {
  user_id: string
  name: string
  email: string
  role: MemberRole
}

export interface User {
  id: string
  name: string
  email: string
}

export interface AuthResponse {
  token: string
  user: User
}

export interface Page<T> {
  items: T[]
  total: number
  hasMore: boolean
}

export type RootStackParamList = {
  Home: undefined
  Login: undefined
  Signup: undefined
  CreateCollection: undefined
  Collection: { id: string; name?: string }
  QRDisplay: { id: string; name?: string }
  Scan: undefined
  Gallery: { collectionId: string }
  Members: { id: string; name?: string }
}

function resolveBase(): string {
  if (typeof process !== 'undefined' && process.env && process.env.EXPO_PUBLIC_API_BASE) {
    return process.env.EXPO_PUBLIC_API_BASE
  }
  return API_BASE
}

function headers(extra?: Record<string, string>): Record<string, string> {
  const h: Record<string, string> = { ...(extra || {}) }
  if (authToken) h.Authorization = `Bearer ${authToken}`
  return h
}

async function errorFrom(res: Response, fallback: string): Promise<Error> {
  try {
    const data = await res.json()
    return new Error(data.error || fallback)
  } catch {
    return new Error(fallback)
  }
}

/* ------------------------------------------------------------------- auth */

export async function signup(name: string, email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${resolveBase()}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  })
  if (!res.ok) throw await errorFrom(res, 'Sign up failed')
  return res.json()
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${resolveBase()}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) throw await errorFrom(res, 'Invalid email or password')
  return res.json()
}

export async function logout(): Promise<void> {
  await fetch(`${resolveBase()}/api/auth/logout`, { method: 'POST', headers: headers() }).catch(() => {})
}

export async function me(): Promise<{ user: User }> {
  const res = await fetch(`${resolveBase()}/api/auth/me`, { headers: headers() })
  if (!res.ok) throw await errorFrom(res, 'Not authenticated')
  return res.json()
}

/* ------------------------------------------------------------ collections */

export async function listCollections(opts: { q?: string; limit?: number; offset?: number } = {}): Promise<{
  collections: Collection[]
  total: number
  hasMore: boolean
}> {
  const params = new URLSearchParams()
  if (opts.q) params.set('q', opts.q)
  params.set('limit', String(opts.limit ?? 20))
  params.set('offset', String(opts.offset ?? 0))
  const res = await fetch(`${resolveBase()}/api/collections?${params.toString()}`, { headers: headers() })
  if (res.status === 401) throw new Error('Not authenticated')
  if (!res.ok) throw new Error('Failed to load collections')
  return res.json()
}

export async function createCollection(name: string): Promise<Collection> {
  const res = await fetch(`${resolveBase()}/api/collections`, {
    method: 'POST',
    headers: headers({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ name }),
  })
  if (!res.ok) throw await errorFrom(res, 'Failed to create collection')
  return res.json()
}

export async function getCollection(
  id: string,
  opts: { q?: string; limit?: number; offset?: number; since?: string } = {}
): Promise<CollectionResponse> {
  const params = new URLSearchParams()
  if (opts.q) params.set('q', opts.q)
  if (opts.since) params.set('since', opts.since)
  params.set('limit', String(opts.limit ?? 60))
  params.set('offset', String(opts.offset ?? 0))
  const res = await fetch(`${resolveBase()}/api/collections/${id}?${params.toString()}`, { headers: headers() })
  if (!res.ok) throw await errorFrom(res, 'Collection not found')
  return res.json()
}

export async function renameCollection(id: string, name: string): Promise<void> {
  const res = await fetch(`${resolveBase()}/api/collections/${id}`, {
    method: 'PATCH',
    headers: headers({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ name }),
  })
  if (!res.ok) throw await errorFrom(res, 'Could not rename collection')
}

export async function deleteCollection(id: string): Promise<void> {
  const res = await fetch(`${resolveBase()}/api/collections/${id}`, { method: 'DELETE', headers: headers() })
  if (!res.ok) throw await errorFrom(res, 'Could not delete collection')
}

/* ---------------------------------------------------------------- members */

export async function getMembers(id: string): Promise<{ members: Member[]; canManage: boolean }> {
  const res = await fetch(`${resolveBase()}/api/collections/${id}/members`, { headers: headers() })
  if (!res.ok) throw await errorFrom(res, 'Could not load members')
  return res.json()
}

export async function addMember(id: string, email: string, role: MemberRole): Promise<Member> {
  const res = await fetch(`${resolveBase()}/api/collections/${id}/members`, {
    method: 'POST',
    headers: headers({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ email, role }),
  })
  if (!res.ok) throw await errorFrom(res, 'Could not add member')
  return res.json()
}

export async function removeMember(id: string, userId: string): Promise<void> {
  const res = await fetch(`${resolveBase()}/api/collections/${id}/members/${userId}`, {
    method: 'DELETE',
    headers: headers(),
  })
  if (!res.ok) throw await errorFrom(res, 'Could not remove member')
}

/* ----------------------------------------------------------------- photos */

export function photoUrl(
  filename: string,
  opts: { thumb?: boolean; download?: boolean } = {}
): string {
  const params = new URLSearchParams()
  if (opts.thumb) params.set('thumb', '1')
  if (opts.download) params.set('download', '1')
  const qs = params.toString()
  return `${resolveBase()}/api/photos/${filename}${qs ? `?${qs}` : ''}`
}

export function qrUrl(id: string): string {
  return `${resolveBase()}/api/collections/${id}/qr`
}

export function collectionUrl(id: string): string {
  return `${resolveBase()}/c/${id}`
}

function mimeForName(name: string): string {
  const ext = (name.split('.').pop() || '').toLowerCase()
  if (ext === 'png') return 'image/png'
  if (ext === 'gif') return 'image/gif'
  if (ext === 'webp') return 'image/webp'
  if (ext === 'heic' || ext === 'heif') return 'image/heic'
  return 'image/jpeg'
}

export async function uploadPhotos(collectionId: string, uris: string[]): Promise<{ photos: Photo[] }> {
  const form = new FormData()
  uris.forEach((uri) => {
    const name = uri.split('/').pop() || 'photo.jpg'
    form.append('photos', { uri, name, type: mimeForName(name) } as unknown as Blob)
  })
  const res = await fetch(`${resolveBase()}/api/collections/${collectionId}/photos`, {
    method: 'POST',
    headers: headers(),
    body: form,
  })
  if (!res.ok) throw await errorFrom(res, 'Upload failed')
  return res.json()
}

export async function uploadPhoto(collectionId: string, uri: string): Promise<{ photos: Photo[] }> {
  const form = new FormData()
  const name = uri.split('/').pop() || 'photo.jpg'
  form.append('photos', { uri, name, type: mimeForName(name) } as unknown as Blob)
  const res = await fetch(`${resolveBase()}/api/collections/${collectionId}/photos`, {
    method: 'POST',
    headers: headers(),
    body: form,
  })
  if (!res.ok) throw await errorFrom(res, 'Upload failed')
  return res.json()
}

export async function deletePhoto(photoId: string): Promise<void> {
  const res = await fetch(`${resolveBase()}/api/photos/${photoId}`, { method: 'DELETE', headers: headers() })
  if (!res.ok) throw await errorFrom(res, 'Delete failed')
}

export function parseCollectionUrl(url: string): string | null {
  const m = url.match(/\/c\/([a-z0-9]+)/i)
  return m ? m[1] : null
}

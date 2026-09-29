import { Platform } from 'react-native'
import { getValue, setValue } from './storage'

const API_BASE_KEY = 'photoshare.apiBase'

let authToken: string | null = null

export function setAuthToken(token: string | null) {
  authToken = token
}

function normalizeBase(value: string): string {
  return value.trim().replace(/\/+$/, '')
}

function envBase(): string | null {
  try {
    if (typeof process !== 'undefined' && process.env && process.env.EXPO_PUBLIC_API_BASE) {
      return normalizeBase(String(process.env.EXPO_PUBLIC_API_BASE))
    }
  } catch {}
  return null
}

let configuredBase: string | null = envBase() || (Platform.OS === 'web' ? 'http://localhost:3000' : null)

/** The API base currently in use, or null when nothing is configured yet. */
export function getApiBase(): string | null {
  return configuredBase
}

/** Point the app at a server at runtime (stored on the device). */
export async function setApiBase(value: string | null): Promise<void> {
  if (value) {
    configuredBase = normalizeBase(value)
    await setValue(API_BASE_KEY, configuredBase)
    return
  }
  await setValue(API_BASE_KEY, null)
  configuredBase = envBase() || (Platform.OS === 'web' ? 'http://localhost:3000' : null)
}

/** Restore the saved server URL. Call once before the first request. */
export async function loadApiBase(): Promise<void> {
  if (envBase()) return
  const stored = await getValue(API_BASE_KEY)
  if (stored) configuredBase = normalizeBase(stored)
}

function resolveBase(): string {
  if (!configuredBase) {
    throw new Error(
      'No server URL configured. Set EXPO_PUBLIC_API_BASE in app/.env or enter your server URL on the login screen.'
    )
  }
  return configuredBase
}

export function imageHeaders(): Record<string, string> | undefined {
  return authToken ? { Authorization: `Bearer ${authToken}` } : undefined
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
  is_public?: boolean
  cover_filename?: string | null
  cover_thumb_filename?: string | null
  price_cents?: number | null
  currency?: string
  expires_at?: string | null
  role?: MemberRole | null
  is_owner?: boolean
}

export interface Pricing {
  price_cents: number | null
  currency: string
  purchased: boolean
  locked: boolean
  stripeConfigured: boolean
  schemaReady: boolean
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
  pricing?: Pricing
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

export async function listCollections(
  opts: { q?: string; limit?: number; offset?: number; sort?: 'newest' | 'name'; filter?: 'all' | 'owned' | 'shared' } = {}
): Promise<{
  collections: Collection[]
  total: number
  hasMore: boolean
}> {
  const params = new URLSearchParams()
  if (opts.q) params.set('q', opts.q)
  if (opts.sort) params.set('sort', opts.sort)
  if (opts.filter) params.set('filter', opts.filter)
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
  opts: { q?: string; limit?: number; offset?: number; since?: string; sort?: 'newest' | 'oldest' | 'name' } = {}
): Promise<CollectionResponse> {
  const params = new URLSearchParams()
  if (opts.q) params.set('q', opts.q)
  if (opts.since) params.set('since', opts.since)
  if (opts.sort) params.set('sort', opts.sort)
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

export async function setCollectionVisibility(id: string, isPublic: boolean): Promise<void> {
  const res = await fetch(`${resolveBase()}/api/collections/${id}`, {
    method: 'PATCH',
    headers: headers({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ is_public: isPublic }),
  })
  if (!res.ok) throw await errorFrom(res, 'Could not update visibility')
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

async function appendPhoto(form: FormData, uri: string): Promise<void> {
  const name = uri.split('/').pop() || 'photo.jpg'
  const type = mimeForName(name)
  if (Platform.OS === 'web') {
    // On web the picker returns a blob:/data: URL, so fetch it and append a real File.
    const blob = await (await fetch(uri)).blob()
    form.append('photos', new File([blob], name, { type: blob.type || type }))
    return
  }
  form.append('photos', { uri, name, type } as unknown as Blob)
}

export async function uploadPhotos(collectionId: string, uris: string[]): Promise<{ photos: Photo[] }> {
  const form = new FormData()
  for (const uri of uris) await appendPhoto(form, uri)
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
  await appendPhoto(form, uri)
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

/* ------------------------------------------------------- import + selling */

export async function importFromLinks(
  collectionId: string,
  urls: string[]
): Promise<{ imported: number; results: { url: string; error?: string }[] }> {
  const res = await fetch(`${resolveBase()}/api/collections/${collectionId}/import`, {
    method: 'POST',
    headers: headers({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ urls }),
  })
  if (!res.ok) throw await errorFrom(res, 'Import failed')
  return res.json()
}

/* ------------------------------------------------------------- camera QR */

export interface CameraQrAppInfo {
  label: string
  apps: string[]
  storeUrl: string
  transferHint: string
}

export interface CameraQrPayload {
  kind: 'wifi' | 'url' | 'text'
  vendor?: string
  app?: CameraQrAppInfo
  ssid?: string
  password?: string
  security?: string
  url?: string
  host?: string
  lan?: boolean
  imageLike?: boolean
  appStore?: boolean
  text?: string
}

/** Classify a decoded QR string (camera Wi-Fi, photo link, …). */
export async function decodeCameraQr(raw: string): Promise<{ raw: string; payload: CameraQrPayload }> {
  const res = await fetch(`${resolveBase()}/api/qr/decode`, {
    method: 'POST',
    headers: headers({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ raw }),
  })
  if (res.status === 401) throw new Error('Log in to scan camera QR codes')
  if (!res.ok) throw await errorFrom(res, 'Could not read that QR code')
  return res.json()
}

export async function setCollectionPrice(
  collectionId: string,
  priceCents: number | null,
  currency = 'usd'
): Promise<void> {
  const res = await fetch(`${resolveBase()}/api/collections/${collectionId}`, {
    method: 'PATCH',
    headers: headers({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ price_cents: priceCents, currency }),
  })
  if (!res.ok) throw await errorFrom(res, 'Could not save pricing')
}

export async function setCollectionExpiry(
  collectionId: string,
  expiresInDays: number | null
): Promise<void> {
  const res = await fetch(`${resolveBase()}/api/collections/${collectionId}`, {
    method: 'PATCH',
    headers: headers({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ expires_in_days: expiresInDays }),
  })
  if (!res.ok) throw await errorFrom(res, 'Could not save the schedule')
}

export async function startCheckout(
  collectionId: string
): Promise<{ url?: string; alreadyPurchased?: boolean; error?: string }> {
  const res = await fetch(`${resolveBase()}/api/collections/${collectionId}/checkout`, {
    method: 'POST',
    headers: headers(),
  })
  return res.json()
}

/* ------------------------------------------------------- stripe connect */

export interface PayoutStatus {
  configured: boolean
  accountId: string | null
  chargesEnabled?: boolean
  payoutsEnabled: boolean
  detailsSubmitted?: boolean
  requirementsDue?: string[]
}

export async function getPayoutStatus(): Promise<PayoutStatus> {
  const res = await fetch(`${resolveBase()}/api/stripe/connect`, { headers: headers() })
  if (res.status === 401) throw new Error('Not authenticated')
  if (!res.ok) throw await errorFrom(res, 'Could not check payout status')
  return res.json()
}

export async function startPayoutOnboarding(collectionId: string): Promise<{ url: string; accountId: string }> {
  const res = await fetch(`${resolveBase()}/api/stripe/connect`, {
    method: 'POST',
    headers: headers({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ collection_id: collectionId }),
  })
  if (!res.ok) throw await errorFrom(res, 'Could not start payout setup')
  return res.json()
}

export function parseCollectionUrl(url: string): string | null {
  const m = url.match(/\/c\/([a-z0-9]+)/i)
  return m ? m[1] : null
}

export const API_BASE = 'http://192.168.1.100:3000'

export interface Photo {
  id: string
  filename: string
  original_name: string
  mime_type: string
  size: number
}

export interface Collection {
  id: string
  name: string
  created_at?: string
  photo_count?: number
}

export interface CollectionResponse {
  collection: Collection
  photos: Photo[]
}

function resolveBase(): string {
  if (typeof process !== 'undefined' && process.env && process.env.EXPO_PUBLIC_API_BASE) {
    return process.env.EXPO_PUBLIC_API_BASE
  }
  return API_BASE
}

export async function listCollections(): Promise<{ collections: Collection[] }> {
  const res = await fetch(`${resolveBase()}/api/collections`)
  if (!res.ok) throw new Error('Failed to load collections')
  return res.json()
}

export async function createCollection(name: string): Promise<Collection> {
  const res = await fetch(`${resolveBase()}/api/collections`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })
  if (!res.ok) throw new Error('Failed to create collection')
  return res.json()
}

export async function getCollection(id: string): Promise<CollectionResponse> {
  const res = await fetch(`${resolveBase()}/api/collections/${id}`)
  if (!res.ok) throw new Error('Collection not found')
  return res.json()
}

export function photoUrl(filename: string): string {
  return `${resolveBase()}/api/photos/${filename}`
}

export function qrUrl(id: string): string {
  return `${resolveBase()}/api/collections/${id}/qr`
}

export async function uploadPhotos(
  collectionId: string,
  uris: string[]
): Promise<{ photos: Photo[] }> {
  const form = new FormData()
  uris.forEach((uri) => {
    const name = uri.split('/').pop() || 'photo.jpg'
    form.append('photos', { uri, name, type: 'image/jpeg' } as unknown as Blob)
  })
  const res = await fetch(`${resolveBase()}/api/collections/${collectionId}/photos`, {
    method: 'POST',
    body: form,
  })
  if (!res.ok) throw new Error('Upload failed')
  return res.json()
}

export function parseCollectionUrl(url: string): string | null {
  const m = url.match(/\/c\/([a-z0-9]+)/i)
  return m ? m[1] : null
}

export async function deletePhoto(photoId: string): Promise<void> {
  const res = await fetch(`${resolveBase()}/api/photos/${photoId}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Delete failed')
}
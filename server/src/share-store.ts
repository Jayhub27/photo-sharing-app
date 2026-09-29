/**
 * Short-lived buffer for photos handed over by the PWA share target.
 *
 * `POST /share` stores the files here and renders a collection picker. The
 * picker then calls `POST /api/share/:token` to move them into a collection.
 * Entries expire after 15 minutes and the server is long-running, so a plain
 * in-memory map is enough.
 */

import { generateId } from './utils.js'

export interface PendingShareFile {
  buffer: Buffer
  name: string
  mime: string
}

interface PendingShare {
  files: PendingShareFile[]
  createdAt: number
}

const TTL_MS = 15 * 60 * 1000
const shares = new Map<string, PendingShare>()

function cleanup() {
  const cutoff = Date.now() - TTL_MS
  for (const [token, share] of shares) {
    if (share.createdAt < cutoff) shares.delete(token)
  }
}

export function createPendingShare(files: PendingShareFile[]): string | null {
  if (!files.length) return null
  cleanup()
  const token = generateId()
  shares.set(token, { files, createdAt: Date.now() })
  return token
}

export function takePendingShare(token: string): PendingShare | null {
  cleanup()
  const share = shares.get(token)
  if (!share) return null
  shares.delete(token)
  return share
}

// Expire leftovers even if no new share arrives; unref so it never blocks exit.
setInterval(cleanup, 5 * 60 * 1000).unref()

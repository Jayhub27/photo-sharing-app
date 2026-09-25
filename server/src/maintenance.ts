import { timingSafeEqual } from 'crypto'
import { supabase, BUCKET } from './db.js'

/**
 * Auto-delete needs `collections.expires_at` (supabase/migrations). The probe is
 * cached so the server degrades gracefully until the migration is applied:
 * setting an expiry returns 503 schema_missing instead of crashing.
 */
let schemaState: boolean | null = null

export async function expiringSchemaReady(): Promise<boolean> {
  if (schemaState !== null) return schemaState
  const { error } = await supabase.from('collections').select('expires_at').limit(1)
  schemaState = !error
  return schemaState
}

export async function refreshExpiringSchema(): Promise<boolean> {
  schemaState = null
  return expiringSchemaReady()
}

export function isExpired(expiresAt: unknown): boolean {
  if (!expiresAt) return false
  const t = new Date(String(expiresAt)).getTime()
  return Number.isFinite(t) && t <= Date.now()
}

export interface SweepResult {
  swept: number
  collections: { id: string; name: string; photos: number }[]
}

/**
 * Deletes collections whose expires_at has passed: storage objects first, then
 * rows. Purchases are removed with the collection (buyers lose access), which is
 * why the UI warns before putting a price on a time-limited collection.
 */
export async function sweepExpiredCollections(): Promise<SweepResult> {
  const result: SweepResult = { swept: 0, collections: [] }
  if (!(await expiringSchemaReady())) return result

  const { data: cols } = await supabase
    .from('collections')
    .select('id, name')
    .not('expires_at', 'is', null)
    .lte('expires_at', new Date().toISOString())
    .limit(100)

  for (const col of cols || []) {
    const { data: photos } = await supabase
      .from('photos')
      .select('filename, thumb_filename')
      .eq('collection_id', col.id)
    const keys = (photos || []).flatMap((p) => [p.filename, p.thumb_filename]).filter(Boolean) as string[]
    if (keys.length) await supabase.storage.from(BUCKET).remove(keys)
    await supabase.from('photos').delete().eq('collection_id', col.id)
    await supabase.from('collection_members').delete().eq('collection_id', col.id)
    // purchases may not exist yet (selling migration); ignore the error
    await supabase.from('purchases').delete().eq('collection_id', col.id)
    await supabase.from('collections').delete().eq('id', col.id)
    result.swept++
    result.collections.push({ id: col.id, name: col.name, photos: (photos || []).length })
  }
  return result
}

/**
 * Runs an initial sweep shortly after boot, then on an interval. Only useful on
 * a long-running host; on serverless use POST /api/maintenance/sweep from a cron.
 */
export function startSweeper(): ReturnType<typeof setInterval> {
  const minutes = Number(process.env.MAINTENANCE_SWEEP_INTERVAL_MINUTES || 60)
  const intervalMs = Math.max(5, Number.isFinite(minutes) ? minutes : 60) * 60 * 1000
  const run = () => {
    sweepExpiredCollections()
      .then((r) => {
        if (r.swept) console.log(`[sweep] deleted ${r.swept} expired collection(s)`)
      })
      .catch(() => {})
  }
  setTimeout(run, 10_000).unref?.()
  const timer = setInterval(run, intervalMs)
  timer.unref?.()
  return timer
}

export function maintenanceAuthorized(header: unknown): boolean {
  const secret = process.env.MAINTENANCE_SECRET || ''
  if (!secret) return false
  const value = Buffer.from(String(header || ''))
  const expected = Buffer.from(secret)
  return value.length === expected.length && timingSafeEqual(value, expected)
}

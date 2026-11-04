/**
 * Tiny TTL cache with in-flight de-duplication.
 *
 * The photo grid asks "may this viewer see this collection?" once per image.
 * Without sharing, a 60-tile grid runs the same 4-8 queries 60 times. A short
 * TTL plus de-duplication collapses a burst into one round-trip per key.
 * Serverless instances are isolated, so this is a local optimisation; writes
 * invalidate the keys they touch and the TTL bounds the rest.
 */
type Entry = { value: unknown; expires: number }

const MAX_ENTRIES = 500
const store = new Map<string, Entry>()
const inflight = new Map<string, Promise<unknown>>()

export async function cached<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
  const hit = store.get(key)
  if (hit && hit.expires > Date.now()) return hit.value as T
  const pending = inflight.get(key)
  if (pending) return pending as Promise<T>

  const promise = load()
    .then((value) => {
      if (store.size >= MAX_ENTRIES) {
        const oldest = store.keys().next().value
        if (oldest) store.delete(oldest)
      }
      store.set(key, { value, expires: Date.now() + ttlMs })
      return value
    })
    .finally(() => inflight.delete(key))

  inflight.set(key, promise)
  return promise as Promise<T>
}

/** Drop every key that starts with the prefix (e.g. `state:<collection>:`). */
export function invalidate(prefix: string): void {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key)
  }
}

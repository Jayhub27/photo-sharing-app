import type { Request, Response, NextFunction } from 'express'

interface Bucket {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

// Opportunistically evict expired buckets so the map does not grow unbounded.
const sweeper = setInterval(() => {
  const now = Date.now()
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key)
  }
}, 60_000)
if (typeof sweeper.unref === 'function') sweeper.unref()

export interface RateLimitOptions {
  windowMs: number
  max: number
  key?: (req: Request) => string
  message?: string
}

/**
 * Minimal fixed-window rate limiter. In-memory, so it protects a single
 * process well but is per-instance (serverless/multi-instance deployments
 * should back this with Redis or the platform's WAF).
 */
export function rateLimit(opts: RateLimitOptions) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = opts.key ? opts.key(req) : req.ip || 'unknown'
    const now = Date.now()
    let bucket = buckets.get(key)
    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + opts.windowMs }
      buckets.set(key, bucket)
    }
    bucket.count += 1

    res.setHeader('X-RateLimit-Limit', String(opts.max))
    res.setHeader('X-RateLimit-Remaining', String(Math.max(0, opts.max - bucket.count)))
    res.setHeader('X-RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)))

    if (bucket.count > opts.max) {
      res.setHeader('Retry-After', String(Math.ceil((bucket.resetAt - now) / 1000)))
      res.status(429).json({ error: opts.message || 'Too many requests. Please slow down.' })
      return
    }
    next()
  }
}

import * as Sentry from '@sentry/node'

let ready = false

/** Error tracking is opt-in: without SENTRY_DSN every call is a no-op. */
export function initObservability(): void {
  const dsn = process.env.SENTRY_DSN
  if (!dsn || ready) return
  Sentry.init({
    dsn,
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'development',
    release: process.env.VERCEL_GIT_COMMIT_SHA || process.env.GIT_COMMIT,
    tracesSampleRate: 0.05,
  })
  ready = true
}

export function captureException(err: unknown, context?: Record<string, unknown>): void {
  if (!ready) return
  Sentry.captureException(err, context ? { extra: context } : undefined)
}

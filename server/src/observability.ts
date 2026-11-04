import * as Sentry from '@sentry/node'

let ready = false
let lastAlertAt = 0

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

/**
 * Report an error. Sentry when configured; otherwise a plain webhook (Discord
 * accepts {content}) so a deployment without Sentry still shouts. One message
 * per 30 s keeps a broken loop from flooding the channel.
 */
export function captureException(err: unknown, context?: Record<string, unknown>): void {
  if (ready) {
    Sentry.captureException(err, context ? { extra: context } : undefined)
    return
  }
  const hook = process.env.ALERT_WEBHOOK_URL
  if (!hook) return
  const now = Date.now()
  if (now - lastAlertAt < 30_000) return
  lastAlertAt = now
  const where = [context?.method, context?.path].filter(Boolean).join(' ') || 'server'
  const detail = String(err instanceof Error ? err.message : err).slice(0, 400)
  fetch(hook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: `**${where}** ${detail}` }),
  }).catch(() => {})
}

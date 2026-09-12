import { randomUUID } from 'crypto'
import type { Request } from 'express'

export function generateId(): string {
  return randomUUID().replace(/-/g, '').slice(0, 24)
}

/**
 * Base URL for absolute links (QR codes, Open Graph images).
 * Prefers an explicit config, then the tunnel URL injected by `kimaki tunnel`,
 * then forwarded headers, then the request host.
 */
export function publicBaseUrl(req: Request): string {
  const configured = process.env.PUBLIC_BASE_URL || process.env.TRAFORO_URL
  if (configured) return configured.replace(/\/+$/, '')

  const fwdHost = String(req.headers['x-forwarded-host'] || '').split(',')[0].trim()
  const fwdProto = String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim()
  const host = fwdHost || req.get('host') || 'localhost'
  const proto = fwdProto || req.protocol
  return `${proto}://${host}`
}
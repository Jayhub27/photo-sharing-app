import Stripe from 'stripe'
import { supabase } from './db.js'

const SECRET = process.env.STRIPE_SECRET_KEY || ''
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || ''

export const CURRENCIES = ['usd', 'eur', 'gbp', 'cad', 'aud', 'mxn', 'brl', 'inr'] as const
export type Currency = (typeof CURRENCIES)[number]

let client: Stripe | null = null

export function isStripeConfigured(): boolean {
  return !!SECRET
}

export function stripe(): Stripe | null {
  if (!SECRET) return null
  if (!client) client = new Stripe(SECRET)
  return client
}

export function stripeWebhookSecret(): string | null {
  return WEBHOOK_SECRET || null
}

/**
 * Optional platform fee (percent) kept when paying out to a connected account.
 * Set STRIPE_APPLICATION_FEE_PERCENT=10 to keep 10% of each sale.
 */
export function applicationFeePercent(): number {
  const n = Number(process.env.STRIPE_APPLICATION_FEE_PERCENT || 0)
  return Number.isFinite(n) && n > 0 ? Math.min(50, n) : 0
}

export interface ConnectAccountStatus {
  accountId: string
  chargesEnabled: boolean
  payoutsEnabled: boolean
  detailsSubmitted: boolean
  requirementsDue: string[]
}

/** Live status of a connected account, or null when Stripe is off or the lookup fails. */
export async function connectAccountStatus(accountId: string): Promise<ConnectAccountStatus | null> {
  const s = stripe()
  if (!s || !accountId) return null
  try {
    const account = await s.accounts.retrieve(accountId)
    return {
      accountId: account.id,
      chargesEnabled: !!account.charges_enabled,
      payoutsEnabled: !!account.payouts_enabled,
      detailsSubmitted: !!account.details_submitted,
      requirementsDue: account.requirements?.currently_due || [],
    }
  } catch {
    return null
  }
}

let schemaState: boolean | null = null

/**
 * Selling needs additive columns/tables from supabase/schema.sql. When they are
 * missing the server degrades gracefully: pricing stays disabled and the UI
 * tells the owner to run the SQL instead of crashing.
 */
export async function sellingSchemaReady(): Promise<boolean> {
  if (schemaState !== null) return schemaState
  const [cols, table] = await Promise.all([
    supabase.from('collections').select('price_cents').limit(1),
    supabase.from('purchases').select('id').limit(1),
  ])
  schemaState = !cols.error && !table.error
  return schemaState
}

export async function refreshSellingSchema(): Promise<boolean> {
  schemaState = null
  return sellingSchemaReady()
}

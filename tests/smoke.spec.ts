import { expect, test } from '@playwright/test'

/** The four things a deploy must never break. */

test('health reports ok, version and commit', async ({ request }) => {
  const res = await request.get('/api/health')
  expect(res.status()).toBe(200)
  const body = await res.json()
  expect(body.ok).toBe(true)
  expect(body.version).toMatch(/^\d+\.\d+\.\d+/)
  expect(String(body.commit)).toMatch(/^(dev|[0-9a-f]{7,40})$/)
})

test('login page renders the form', async ({ page }) => {
  const res = await page.goto('/login')
  expect(res?.status()).toBe(200)
  await expect(page.locator('input[type=email]')).toBeVisible()
  await expect(page.locator('input[type=password]')).toBeVisible()
  await expect(page.getByText('Welcome back')).toBeVisible()
})

test('home page renders for a guest', async ({ page }) => {
  const res = await page.goto('/')
  expect(res?.status()).toBe(200)
  await expect(page.getByText('Take the shot').first()).toBeVisible()
})

test('collections API rejects anonymous callers', async ({ request }) => {
  const res = await request.get('/api/collections')
  expect(res.status()).toBe(401)
})

test('security headers are set', async ({ request }) => {
  const res = await request.get('/api/health')
  expect(res.headers()['x-content-type-options']).toBe('nosniff')
  expect(res.headers()['x-frame-options']).toBe('DENY')
})

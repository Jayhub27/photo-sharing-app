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

test('privacy policy, robots and sitemap are served', async ({ request }) => {
  const privacy = await request.get('/privacy')
  expect(privacy.status()).toBe(200)
  expect(await privacy.text()).toContain('Privacy policy')

  const robots = await request.get('/robots.txt')
  expect(robots.status()).toBe(200)
  expect(await robots.text()).toContain('Sitemap:')

  const sitemap = await request.get('/sitemap.xml')
  expect(sitemap.status()).toBe(200)
  expect(await sitemap.text()).toContain('<urlset')
})

test('unknown pages get the branded 404', async ({ page }) => {
  const res = await page.goto('/this-page-does-not-exist')
  expect(res?.status()).toBe(404)
  await expect(page.getByText('This page went missing')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Go to collections' })).toBeVisible()
})

test('home page has description and Open Graph image', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('meta[name=description]')).toHaveAttribute('content', /.+/)
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /\/og-image\.jpg$/)
  await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', /\/$/)
})

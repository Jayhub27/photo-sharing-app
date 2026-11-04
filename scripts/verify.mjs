#!/usr/bin/env node
/**
 * Verify a deployed URL against ship.verify.json.
 *
 *   node scripts/verify.mjs
 *   node scripts/verify.mjs --url https://preview.example.com
 *   node scripts/verify.mjs --config ship.verify.json --json
 */
import { readFileSync } from 'node:fs'

const args = process.argv.slice(2)
const flag = (name, fallback) => {
  const i = args.indexOf(name)
  return i >= 0 ? args[i + 1] : fallback
}
const json = args.includes('--json')
const configPath = flag('--config', 'ship.verify.json')

let config
try {
  config = JSON.parse(readFileSync(configPath, 'utf8'))
} catch (err) {
  console.error(`verify: cannot read ${configPath}: ${err.message}`)
  process.exit(2)
}

const base = (flag('--url', process.env.SHIP_URL || config.url) || '').replace(/\/$/, '')
if (!base) {
  console.error('verify: no url in config and no --url given')
  process.exit(2)
}

const timeoutMs = Number(config.timeoutMs) || 10_000
const checks = Array.isArray(config.checks) ? config.checks : []
if (!checks.length) {
  console.error('verify: config has no checks[]')
  process.exit(2)
}

const subset = (want, got) =>
  Object.entries(want).every(([key, value]) =>
    value && typeof value === 'object'
      ? subset(value, got?.[key])
      : got?.[key] === value
  )

const results = []
for (const check of checks) {
  const name = check.name || check.path || '/'
  const url = base + (check.path || '/')
  const started = Date.now()
  const result = { name, url, ok: false, status: 0, ms: 0, errors: [] }
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, { signal: controller.signal, redirect: 'follow' })
    const body = await res.text()
    result.status = res.status
    result.ms = Date.now() - started
    if (check.status && res.status !== check.status) {
      result.errors.push(`expected ${check.status}, got ${res.status}`)
    }
    if (check.contains && !body.includes(check.contains)) {
      result.errors.push(`body does not contain ${JSON.stringify(check.contains)}`)
    }
    if (check.json) {
      let parsed
      try {
        parsed = JSON.parse(body)
      } catch {
        result.errors.push('body is not JSON')
      }
      if (parsed && !subset(check.json, parsed)) {
        result.errors.push(`JSON missing ${JSON.stringify(check.json)}`)
      }
    }
    if (check.maxMs && result.ms > check.maxMs) {
      result.errors.push(`took ${result.ms}ms, limit ${check.maxMs}ms`)
    }
  } catch (err) {
    result.ms = Date.now() - started
    result.errors.push(err?.name === 'AbortError' ? `timed out after ${timeoutMs}ms` : err.message)
  } finally {
    clearTimeout(timer)
  }
  result.ok = result.errors.length === 0
  results.push(result)
}

const failed = results.filter((r) => !r.ok)
if (json) {
  console.log(JSON.stringify({ url: base, ok: failed.length === 0, results }, null, 2))
} else {
  for (const r of results) {
    console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.status || '---'}  ${r.ms}ms  ${r.name}`)
    for (const error of r.errors) console.log(`      ${error}`)
  }
  console.log(`\n${results.length - failed.length}/${results.length} checks passed against ${base}`)
}
process.exit(failed.length ? 1 : 0)

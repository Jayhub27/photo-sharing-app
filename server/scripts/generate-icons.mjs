// Generates the PWA and favicon set from the source SVGs.
// Usage: node scripts/generate-icons.mjs   (run from server/)
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { copyFile, writeFile } from 'node:fs/promises'
import sharp from 'sharp'

const here = dirname(fileURLToPath(import.meta.url))
const publicDir = join(here, '..', 'public')
const icons = join(publicDir, 'icons')
const siteDir = join(here, '..', '..', 'website-v3')
const icon = join(icons, 'icon.svg')
const maskable = join(icons, 'icon-maskable.svg')

const jobs = [
  { input: icon, output: 'icon-192.png', size: 192 },
  { input: icon, output: 'icon-512.png', size: 512 },
  { input: icon, output: 'apple-touch-icon.png', size: 180 },
  { input: maskable, output: 'icon-maskable-512.png', size: 512 },
]

for (const job of jobs) {
  await sharp(job.input, { density: 512 })
    .resize(job.size, job.size)
    .png({ compressionLevel: 9 })
    .toFile(join(icons, job.output))
  console.log('wrote', job.output)
}

async function render(input, size) {
  return sharp(input, { density: 512 })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toBuffer()
}

const favicon16 = await render(icon, 16)
const favicon32 = await render(icon, 32)
const favicon48 = await render(icon, 48)
const appleTouch = await render(icon, 180)

await writeFile(join(publicDir, 'favicon-16.png'), favicon16)
await writeFile(join(publicDir, 'favicon-32.png'), favicon32)
await writeFile(join(publicDir, 'apple-touch-icon.png'), appleTouch)
await copyFile(icon, join(publicDir, 'favicon.svg'))

/** Build a multi-size ICO from PNG payloads (ICO supports embedded PNG). */
function buildIco(images) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(images.length, 4)

  const entries = Buffer.alloc(16 * images.length)
  let offset = 6 + entries.length
  images.forEach(({ size, buffer }, index) => {
    const at = index * 16
    entries.writeUInt8(size >= 256 ? 0 : size, at)
    entries.writeUInt8(size >= 256 ? 0 : size, at + 1)
    entries.writeUInt8(0, at + 2)
    entries.writeUInt8(0, at + 3)
    entries.writeUInt16LE(1, at + 4)
    entries.writeUInt16LE(32, at + 6)
    entries.writeUInt32LE(buffer.length, at + 8)
    entries.writeUInt32LE(offset, at + 12)
    offset += buffer.length
  })

  return Buffer.concat([header, entries, ...images.map((image) => image.buffer)])
}

const ico = buildIco([
  { size: 16, buffer: favicon16 },
  { size: 32, buffer: favicon32 },
  { size: 48, buffer: favicon48 },
])
await writeFile(join(publicDir, 'favicon.ico'), ico)
console.log('wrote favicon.ico')

// The static landing site gets the same browser icons so both origins match.
await writeFile(join(siteDir, 'favicon.ico'), ico)
await writeFile(join(siteDir, 'favicon-32.png'), favicon32)
await writeFile(join(siteDir, 'apple-touch-icon.png'), appleTouch)
await copyFile(icon, join(siteDir, 'favicon.svg'))
console.log('wrote website-v3 favicon set')

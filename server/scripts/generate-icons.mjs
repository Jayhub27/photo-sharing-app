// Generates the PWA icon set from the source SVGs.
// Usage: node scripts/generate-icons.mjs   (run from server/)
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import sharp from 'sharp'

const here = dirname(fileURLToPath(import.meta.url))
const icons = join(here, '..', 'public', 'icons')
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

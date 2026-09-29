/**
 * QR decoding for photos of camera screens and screenshots.
 *
 * sharp decodes the upload (any format the server supports, EXIF-rotated) to
 * raw RGBA, then jsQR finds a code. The full frame is tried first, then the
 * center crop, because camera screens and videos often show a small code
 * surrounded by dark UI.
 */

import sharp from 'sharp'
import jsQR from 'jsqr'

function findCode(data: Buffer, width: number, height: number): string | null {
  const code = jsQR(new Uint8ClampedArray(data.buffer, data.byteOffset, data.byteLength), width, height, {
    inversionAttempts: 'attemptBoth',
  })
  return code?.data || null
}

export async function decodeQrFromImage(buffer: Buffer): Promise<string | null> {
  try {
    const { data, info } = await sharp(buffer)
      .rotate()
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })
    if (!info.width || !info.height || info.channels !== 4) return null

    const full = findCode(data, info.width, info.height)
    if (full) return full

    const crop = Math.round(Math.min(info.width, info.height) * 0.72)
    if (crop < 80) return null
    const left = Math.round((info.width - crop) / 2)
    const top = Math.round((info.height - crop) / 2)
    const { data: cropped, info: cropInfo } = await sharp(buffer)
      .rotate()
      .ensureAlpha()
      .extract({ left, top, width: crop, height: crop })
      .raw()
      .toBuffer({ resolveWithObject: true })
    if (!cropInfo.width || cropInfo.channels !== 4) return null

    return findCode(cropped, cropInfo.width, cropInfo.height)
  } catch {
    return null
  }
}

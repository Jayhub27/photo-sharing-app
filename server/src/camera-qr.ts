/**
 * Camera QR/link classification.
 *
 * Camera apps show QR codes that carry connection data (Wi-Fi SSID and
 * password) rather than photos: Canon Camera Connect, Panasonic LUMIX Sync,
 * OM Image Share, Leica FOTOS and others. Some codes point at an image or a
 * cloud share page instead, and those can be imported like any other link.
 *
 * `classifyCameraQr` turns a decoded QR string into a small JSON-safe payload
 * the collection page can render.
 */

export type CameraVendor =
  | 'canon'
  | 'sony'
  | 'nikon'
  | 'fujifilm'
  | 'panasonic'
  | 'om-system'
  | 'leica'
  | 'gopro'
  | 'dji'
  | 'insta360'

export interface CameraApp {
  label: string
  apps: string[]
  storeUrl: string
  /** What to do once the phone is on the camera's Wi-Fi. */
  transferHint: string
}

export const CAMERA_APPS: Record<CameraVendor, CameraApp> = {
  canon: {
    label: 'Canon',
    apps: ['Canon Camera Connect'],
    storeUrl: 'https://www.usa.canon.com/mobile-apps/camera-connect',
    transferHint:
      'Open Canon Camera Connect, tap "Images on camera", select the shots and save them to your phone. Then add them here with Add photos.',
  },
  sony: {
    label: 'Sony',
    apps: ["Creators' App", 'Imaging Edge Mobile'],
    storeUrl: 'https://www.sony.net/cc/',
    transferHint:
      'Open the Sony app, choose "Transfer to smartphone", save the shots to your phone, then add them here.',
  },
  nikon: {
    label: 'Nikon',
    apps: ['SnapBridge'],
    storeUrl: 'https://www.nikonusa.com/snapbridge',
    transferHint:
      'Open SnapBridge, tap "Download pictures", save the shots to your phone, then add them here.',
  },
  fujifilm: {
    label: 'Fujifilm',
    apps: ['FUJIFILM XApp', 'Camera Remote'],
    storeUrl: 'https://www.fujifilm-x.com/en-us/products/software/xapp/',
    transferHint:
      'Open the Fujifilm app, transfer the images to your phone, then add them here.',
  },
  panasonic: {
    label: 'Panasonic',
    apps: ['LUMIX Sync', 'Image App'],
    storeUrl: 'https://av.jpn.support.panasonic.com/support/global/cs/soft/lumix_sync/',
    transferHint:
      'Open LUMIX Sync, start "Image transfer", save the shots to your phone, then add them here.',
  },
  'om-system': {
    label: 'OM System / Olympus',
    apps: ['OM Image Share (OI.Share)'],
    storeUrl: 'https://software.omsystem.com/oishare/en/',
    transferHint:
      'Open OI.Share, tap "Import Photos", save the images to your phone, then add them here.',
  },
  leica: {
    label: 'Leica',
    apps: ['Leica FOTOS'],
    storeUrl: 'https://leica-camera.com/en-int/photography/leica-apps/leica-fotos',
    transferHint:
      'Open Leica FOTOS, select the camera, download the shots to your phone, then add them here.',
  },
  gopro: {
    label: 'GoPro',
    apps: ['GoPro Quik'],
    storeUrl: 'https://gopro.com/en/us/shop/quik-app',
    transferHint:
      'Open Quik, connect to the camera, save the media to your phone, then add it here.',
  },
  dji: {
    label: 'DJI',
    apps: ['DJI Mimo', 'DJI Fly'],
    storeUrl: 'https://www.dji.com/downloads/djiapp',
    transferHint:
      'Open the DJI app, download the shots to your phone, then add them here.',
  },
  insta360: {
    label: 'Insta360',
    apps: ['Insta360 app'],
    storeUrl: 'https://www.insta360.com/download',
    transferHint:
      'Open the Insta360 app, export the photos to your phone, then add them here.',
  },
}

const SSID_PATTERNS: { vendor: CameraVendor; pattern: RegExp }[] = [
  { vendor: 'canon', pattern: /(?:^|_)canon|_canon0a/i },
  { vendor: 'panasonic', pattern: /^DC-|^LUMIX/i },
  { vendor: 'om-system', pattern: /^E-M\d|^OM-\d|^PEN-|^TG-\d|^STYLUS/i },
  { vendor: 'leica', pattern: /^LEICA/i },
  { vendor: 'sony', pattern: /^ILCE-|^DSC-|^ZV-|^DIRECT-.*(ILCE|DSC|ZV)/i },
  { vendor: 'nikon', pattern: /^NIKON/i },
  { vendor: 'fujifilm', pattern: /^FUJIFILM|^X-T\d|^X100|^GFX/i },
  { vendor: 'gopro', pattern: /^HERO|^GOPRO|^MAX/i },
  { vendor: 'dji', pattern: /^DJI|^OSMO|^MAVIC|^AVATA|^MINI ?\d/i },
  { vendor: 'insta360', pattern: /^INSTA360|^GO ?\d/i },
]

const HOST_PATTERNS: { vendor: CameraVendor; pattern: RegExp }[] = [
  { vendor: 'canon', pattern: /canon|ccapi/i },
  { vendor: 'sony', pattern: /sony|imagingedge/i },
  { vendor: 'nikon', pattern: /nikon|snapbridge/i },
  { vendor: 'fujifilm', pattern: /fujifilm|xapp/i },
  { vendor: 'panasonic', pattern: /panasonic|lumix/i },
  { vendor: 'om-system', pattern: /omsystem|olympus|oishare/i },
  { vendor: 'leica', pattern: /leica/i },
  { vendor: 'gopro', pattern: /gopro/i },
  { vendor: 'dji', pattern: /dji/i },
  { vendor: 'insta360', pattern: /insta360/i },
]

const APP_STORE_HOSTS = /^(?:apps\.apple\.com|itunes\.apple\.com|play\.google\.com)$/i
const IMAGE_EXTENSION = /\.(?:jpe?g|png|webp|gif|avif|heic|heif|bmp|tiff?)(?:$|[?#])/i
const IMAGE_CDN_HOSTS = /images\.|img\.|cdn\.|media\.|photo|thumbnail/i

export interface CameraQrPayload {
  kind: 'wifi' | 'url' | 'text'
  vendor?: CameraVendor
  app?: CameraApp
  /** Wi-Fi payload. */
  ssid?: string
  password?: string
  security?: string
  hidden?: boolean
  /** URL payload. */
  url?: string
  host?: string
  lan?: boolean
  imageLike?: boolean
  appStore?: boolean
  /** Anything unrecognised. */
  text?: string
}

export function ssidToVendor(ssid: string): CameraVendor | undefined {
  return SSID_PATTERNS.find((entry) => entry.pattern.test(ssid))?.vendor
}

function hostToVendor(host: string, path = ''): CameraVendor | undefined {
  const haystack = path ? `${host}${path}` : host
  return HOST_PATTERNS.find((entry) => entry.pattern.test(haystack))?.vendor
}

export function detectVendor(text: string): CameraVendor | undefined {
  try {
    const url = new URL(text.startsWith('http') ? text : `https://${text}`)
    const vendor = hostToVendor(url.hostname, url.pathname)
    if (vendor) return vendor
  } catch {
    // not a URL — fall through to SSID detection
  }
  return ssidToVendor(text)
}

/** True for hosts that only exist on the local network (camera access point). */
export function isLanHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, '')
  if (!host) return true
  if (host === 'localhost' || host.endsWith('.local') || host.endsWith('.internal')) return true
  if (!host.includes('.') && !host.includes(':')) return true

  const ipv4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/)
  if (ipv4) {
    const [a, b] = ipv4.slice(1).map(Number)
    if (a === 10 || a === 127 || a === 0) return true
    if (a === 172 && b >= 16 && b <= 31) return true
    if (a === 192 && b === 168) return true
    if (a === 169 && b === 254) return true
    return false
  }

  if (host.includes(':')) {
    if (host === '::1' || host === '::') return true
    if (/^fe[89ab][0-9a-f]:/i.test(host)) return true
    if (/^f[cd][0-9a-f]{2}:/i.test(host)) return true
    return false
  }

  return false
}

function trimField(value: string): string {
  return value.trim().replace(/^["']|["']$/g, '')
}

/** Parse the standard `WIFI:T:WPA;S:ssid;P:pass;H:true;;` scheme. */
export function parseWifiQr(raw: string): Pick<CameraQrPayload, 'ssid' | 'password' | 'security' | 'hidden'> | null {
  if (!/^WIFI:/i.test(raw.trim())) return null
  const body = raw.trim().slice(5)
  const fields: string[] = []
  let current = ''
  for (let i = 0; i < body.length; i++) {
    const char = body[i]
    if (char === '\\' && i + 1 < body.length) {
      current += body[i + 1]
      i += 1
      continue
    }
    if (char === ';') {
      fields.push(current)
      current = ''
      continue
    }
    current += char
  }
  if (current) fields.push(current)

  let ssid = ''
  let password: string | undefined
  let security: string | undefined
  let hidden: boolean | undefined
  for (const field of fields) {
    const separator = field.indexOf(':')
    if (separator <= 0) continue
    const key = field.slice(0, separator).toUpperCase()
    const value = trimField(field.slice(separator + 1))
    if (key === 'S') ssid = value
    else if (key === 'P') password = value
    else if (key === 'T') security = value ? value.toUpperCase() : 'nopass'
    else if (key === 'H') hidden = /^true$/i.test(value)
  }
  if (!ssid) return null
  return { ssid, password, security, hidden }
}

/** Fallback for camera screens that print `SSID: ... Password: ...` as text. */
export function parseWifiText(raw: string): Pick<CameraQrPayload, 'ssid' | 'password'> | null {
  const ssidMatch = raw.match(/(?:SSID|NETWORK(?:\s*NAME)?|ネットワーク名)\s*[:：]\s*(.+)/i)
  if (!ssidMatch) return null
  const passMatch = raw.match(
    /(?:PASS(?:WORD)?|PWD|KEY|ENCRYPTION(?:\s*KEY)?|パスワード)\s*[:：]\s*(.+)/i,
  )
  const ssid = trimField(ssidMatch[1])
  if (!ssid) return null
  return { ssid, password: passMatch ? trimField(passMatch[1]) : undefined }
}

export function classifyCameraQr(rawInput: string): CameraQrPayload {
  const raw = rawInput.trim()
  if (!raw) return { kind: 'text', text: '' }

  const wifi = parseWifiQr(raw) ?? parseWifiText(raw)
  if (wifi && wifi.ssid) {
    const vendor = ssidToVendor(wifi.ssid)
    return {
      kind: 'wifi',
      ...wifi,
      vendor,
      app: vendor ? CAMERA_APPS[vendor] : undefined,
    }
  }

  if (/^https?:\/\//i.test(raw)) {
    try {
      const url = new URL(raw)
      const vendor = hostToVendor(url.hostname, url.pathname)
      return {
        kind: 'url',
        url: raw,
        host: url.hostname,
        lan: isLanHost(url.hostname),
        imageLike: IMAGE_EXTENSION.test(url.pathname) || IMAGE_CDN_HOSTS.test(url.hostname),
        appStore: APP_STORE_HOSTS.test(url.hostname),
        vendor,
        app: vendor ? CAMERA_APPS[vendor] : undefined,
      }
    } catch {
      // fall through to text
    }
  }

  const bareLan = raw.match(/^((?:\d{1,3}\.){3}\d{1,3}(?::\d+)?(?:\/\S*)?)$/)
  if (bareLan) {
    const vendor = detectVendor(bareLan[1])
    return {
      kind: 'url',
      url: `http://${bareLan[1]}`,
      host: bareLan[1].split(':')[0],
      lan: true,
      imageLike: false,
      appStore: false,
      vendor,
      app: vendor ? CAMERA_APPS[vendor] : undefined,
    }
  }

  const vendor = detectVendor(raw)
  return { kind: 'text', text: raw, vendor, app: vendor ? CAMERA_APPS[vendor] : undefined }
}

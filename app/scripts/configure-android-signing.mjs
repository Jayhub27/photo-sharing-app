import { readFileSync, writeFileSync, existsSync } from 'fs'

/**
 * Wires the release keystore and ABI splits into the Gradle project that
 * `expo prebuild` just generated. Runs in CI with cwd = app/.
 * Without the keystore secret it exits quietly so the debug build still works.
 */

const b64 = process.env.ANDROID_KEYSTORE_BASE64 || ''
const storePassword = process.env.ANDROID_KEYSTORE_PASSWORD || ''
const keyPassword = process.env.ANDROID_KEY_PASSWORD || ''
const keyAlias = process.env.ANDROID_KEY_ALIAS || 'take-the-shot'

if (!b64 || !storePassword || !keyPassword) {
  console.log('No release keystore configured — keeping the default debug signing.')
  process.exit(0)
}

const gradlePath = 'android/app/build.gradle'
if (!existsSync(gradlePath)) {
  console.error(`Missing ${gradlePath}; run expo prebuild first.`)
  process.exit(1)
}

writeFileSync('android/app/release.p12', Buffer.from(b64, 'base64'))

const groovy = (value) => String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"')

let gradle = readFileSync(gradlePath, 'utf8')

if (gradle.includes('release.p12')) {
  console.log('Signing already configured.')
  process.exit(0)
}

const block = `
    signingConfigs {
        release {
            storeFile file("release.p12")
            storePassword "${groovy(storePassword)}"
            keyAlias "${groovy(keyAlias)}"
            keyPassword "${groovy(keyPassword)}"
        }
    }
    splits {
        abi {
            enable true
            reset()
            include "arm64-v8a", "armeabi-v7a", "x86_64"
            universalApk false
        }
    }
`

if (!/android\s*\{/.test(gradle)) {
  console.error('Could not find the android block in build.gradle')
  process.exit(1)
}
gradle = gradle.replace(/android\s*\{/, (match) => `${match}\n${block}`)

const before = gradle
gradle = gradle.replace(/signingConfig\s+signingConfigs\.debug/g, 'signingConfig signingConfigs.release')
if (gradle === before) {
  console.warn('No debug signingConfig reference found; the release block may need manual wiring.')
}

writeFileSync(gradlePath, gradle)
console.log('Release signing and ABI splits configured.')

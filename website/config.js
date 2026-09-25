/* TAKE THE SHOT — download targets.
   Edit this file after you publish a release or deploy the web app. Nothing else needs to change. */

window.TTS_CONFIG = {
  // Shown in the status rail and footer
  version: '0.1.0',
  status: 'Shipping',

  // Android APK. The GitHub Actions workflow (.github/workflows/android-apk.yml)
  // builds this file and attaches it to a release named exactly like the asset below.
  apkUrl: 'https://github.com/Jayhub27/photo-sharing-app/releases/latest/download/take-the-shot-android.apk',

  // Optional iOS distribution (TestFlight public link, App Store, or an EAS build page).
  // Leave null to show the EAS build guide instead.
  iosUrl: null,
  iosGuideUrl: 'https://docs.expo.dev/build/introduction/',

  // Deployed web app. Leave null to hide the "OPEN WEB APP" button
  // (people can still deploy their own copy with deployUrl).
  webAppUrl: null,

  // One-click deploy of this repository to Vercel
  deployUrl: 'https://vercel.com/new/clone?repository-url=https://github.com/Jayhub27/photo-sharing-app',

  // Source code + project links
  sourceUrl: 'https://github.com/Jayhub27/photo-sharing-app/archive/refs/heads/main.zip',
  repoUrl: 'https://github.com/Jayhub27/photo-sharing-app',
  releasesUrl: 'https://github.com/Jayhub27/photo-sharing-app/releases',

  // Credit line in the footer
  year: new Date().getFullYear(),
}

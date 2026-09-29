# Take the shot — mobile app

Expo / React Native client for the Take the shot API. The web app in `../server`
also runs as an installable PWA, which is usually the fastest way to use Take the
shot from a phone. This native app is for people who want a home-screen app and
native camera access.

## Configure the server URL

The app does not ship with a hardcoded server address. Pick one of:

1. Environment file (recommended):

   ```bash
   cp .env.example .env
   # set EXPO_PUBLIC_API_BASE to a URL reachable from the device, e.g.
   # http://192.168.1.50:3000 or https://photos.example.com
   ```

2. On the login screen, tap **Server: … · change** and enter the URL. It is
   stored on the device, so a phone can point at any deployment without a
   rebuild.

`localhost` only works for Expo web on the same machine. Use a LAN address for a
device on your Wi-Fi, or a tunnel (for example `kimaki tunnel` or ngrok) when the
API is not publicly reachable.

## Run

```bash
npm install                 # from the repo root
npm run app                 # expo start
npm run android             # or: npm run --workspace app android
```

## Screens

- **Home** — your collections, search, sort and filter
- **Collection** — add from the library or take a photo, import from links, set a
  price, schedule auto-delete, toggle visibility, remove photos, show the QR
- **Gallery** — full-screen swipe viewer
- **Scan** — scan a collection QR code, or a camera QR: Wi-Fi codes (Canon,
  LUMIX, OI.Share, …) show copyable details, and photo links import straight
  into a collection
- **Members** — invite viewers/editors

## Note on versions

The app targets Expo SDK 51. Check the [Expo upgrade guide](https://docs.expo.dev/workflow/upgrade-to-sdk-52/)
before bumping the SDK: `expo-camera` and the image picker have breaking API
changes in later releases and should be tested on a real device.

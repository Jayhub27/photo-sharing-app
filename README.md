# PhotoShare

A mobile photo sharing app. Create a collection of photos, share a QR code, and
anyone who scans it with the app sees your photos.

- **Mobile app** — Expo / React Native (iOS + Android)
- **Backend** — Express + TypeScript, SQLite for metadata, photos on disk, QR code generation

## Architecture

```
┌──────────────┐   HTTP   ┌──────────────┐
│  Expo app    │ ───────▶ │  Express API │
│  (RN screens)│ ◀────────│  + photos/   │
└──────────────┘  photos  │  + SQLite     │
                          └──────────────┘
```

```
photo-sharing-app/
├─ server/            Express backend (TypeScript)
│  ├─ src/
│  │  ├─ db.ts        SQLite setup + schema
│  │  ├─ routes.ts    collections, photos, QR endpoints
│  │  ├─ utils.ts     ID generation
│  │  └─ index.ts     Express app entry
│  └─ package.json
├─ app/               Expo mobile app (React Native)
│  ├─ src/
│  │  ├─ api.ts       REST client + URL helpers
│  │  ├─ App.tsx      React Navigation stack
│  │  ├─ styles.ts    shared theme
│  │  └─ screens/
│  │     ├─ HomeScreen.tsx
│  │     ├─ CreateCollectionScreen.tsx
│  │     ├─ CollectionScreen.tsx
│  │     ├─ QRDisplayScreen.tsx
│  │     ├─ ScanScreen.tsx
│  │     └─ GalleryScreen.tsx
│  ├─ app.json        Expo config + permissions
│  └─ package.json
└─ package.json       npm workspaces root
```

## Prerequisites

- Node.js 18+
- npm 9+ (workspaces)
- For running on a device: the **Expo Go** app installed on your iOS/Android device

## Setup

Install dependencies for both packages from the repo root:

```bash
npm install
```

## Run the backend

From the repo root:

```bash
npm run server
# -> PhotoShare server running on http://localhost:3000
```

The server stores the SQLite database in `server/data/photos.db` and uploaded
photos in `server/photos/`.

### Environment variables

| Variable     | Default             | Description                                  |
| ------------ | ------------------- | -------------------------------------------- |
| `PORT`       | `3000`              | Server port                                   |
| `PHOTOS_DIR` | `photos`            | Folder for stored image files                 |
| `DB_PATH`    | `data/photos.db`    | SQLite database file path                     |

## Run the mobile app

The phone and the computer running the server must be on the **same Wi-Fi
network**, because the app talks to the server over your LAN IP.

1. Find your computer's LAN IP (e.g. `192.168.1.100`).
2. Point the app at the server. Set the API base URL before starting Expo:

   ```bash
   export EXPO_PUBLIC_API_BASE="http://192.168.1.100:3000"
   ```
   (or edit `API_BASE` in `app/src/api.ts`)

3. Start the app from the repo root:

   ```bash
   npm run app
   ```

   This runs `expo start`. Open the QR it prints in the Expo Go app on your
   phone (or press `i` / `a` for an iOS / Android simulator).

## How to use

1. Open PhotoShare on your phone.
2. Tap **+ New Collection** and give it a name.
3. In the collection, tap **+ Add Photos** and pick photos from your library.
4. Tap **Show QR** to display a QR code for the collection.
5. On another phone (or the same one), open PhotoShare and tap **Scan a QR Code**.
6. Point the camera at the QR — the gallery of photos from that collection opens.

## API reference

| Method | Endpoint                              | Description                         |
| ------ | ------------------------------------- | ----------------------------------- |
| GET    | `/api/collections`                    | List all collections                |
| POST   | `/api/collections`                    | Create a collection (JSON `name`)   |
| GET    | `/api/collections/:id`                 | Get a collection + its photos       |
| GET    | `/api/collections/:id/qr`             | PNG QR code linking to the collection |
| POST   | `/api/collections/:id/photos`         | Upload photos (multipart `photos`) |
| GET    | `/api/photos/:filename`               | Serve a stored photo                |
| DELETE | `/api/photos/:id`                     | Delete a photo                      |

The QR code encodes `<server-url>/c/<collection-id>`. The mobile app parses a
scanned URL containing `/c/<id>` and opens the gallery for that collection.
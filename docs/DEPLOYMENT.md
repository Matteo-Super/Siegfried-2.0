# Deployment

The site is a static Vite build served by **Firebase Hosting** (site
`siegfried-app`, free Spark plan).

## Prerequisites

```bash
npm install
firebase login        # if not already authenticated
```

## Build & deploy

```bash
# Build the static site → dist/
npm run build

# Deploy hosting only
firebase deploy --only hosting

# …or both in one step
npm run deploy

# Deploy Firestore security rules (after the DB exists — see FIREBASE_SETUP.md)
firebase deploy --only firestore:rules
```

Live URL: **https://siegfried-app.web.app**

## How it's configured (`firebase.json`)

- `public: "dist"` — serves the Vite build output.
- SPA rewrite — all routes → `/index.html`.
- Long-cache immutable headers for `/media/**` and hashed JS/CSS/fonts/svg.

## Media

Source photos live **outside the repo** (`C:/Users/mpera/Downloads/Auto`). The
optimizer downscales them to web-friendly WebP/JPG variants in `public/media/`
(committed) with blur-up placeholders. Re-run after adding photos:

```bash
npm run optimize-media
# or point at a different folder:
SOURCE_DIR="D:/photos" npm run optimize-media
```

## CI note

`dist/` is git-ignored — always build fresh before deploying. Environment
overrides (`.env`) are git-ignored too; set `VITE_*` vars in your CI if needed.

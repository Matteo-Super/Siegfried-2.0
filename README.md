<div align="center">

# Siegfried 2.0

### Faster. Better. Open-source automotive intelligence.

A premium, futuristic web experience for the **Siegfried 2.0** autonomous Arduino robotics platform — featuring a real-time **3D simulator**, **Firebase Google Sign-In**, and **Stripe payments**, all on a glassmorphism UI.

[Live Demo](https://siegfried-app.web.app) · [Report Bug](https://github.com/Matteo-Super/Siegfried-2.0/issues) · [Request Feature](https://github.com/Matteo-Super/Siegfried-2.0/issues)

</div>

---

## ✨ Features

- **Cinematic glassmorphism UI** — backdrop blur, floating panels, gradient branding, smooth Framer Motion animations.
- **Interactive 3D simulator** (React Three Fiber) — drive the rover manually (WASD / D-pad) or watch the autopilot avoid obstacles, with reflections, bloom, lighting, and a chase/orbit camera.
- **Cinematic media showcase** — Ken Burns motion + parallax over optimized photography, with a lightbox gallery.
- **Firebase Google Sign-In** — auth state handling + per-user Firestore profile + premium-gated content.
- **Stripe payments** — a €0.99 premium unlock + selectable/custom tips via serverless **Payment Links** (no backend, no Blaze plan).
- **Open-source firmware** — full Arduino `.ino` source, copy-to-clipboard + download.
- **Responsive & accessible** — mobile-first, `prefers-reduced-motion` aware, light/dark themes.

## 🧱 Tech Stack

| Area | Tech |
|------|------|
| Framework | Vite + React 18 + TypeScript |
| Styling | Tailwind CSS, custom glass design system |
| Animation | Framer Motion |
| 3D | three.js · @react-three/fiber · drei · postprocessing |
| Auth & DB | Firebase Authentication + Cloud Firestore (Spark/free plan) |
| Payments | Stripe Payment Links (serverless) |
| Hosting | Firebase Hosting |
| Media | sharp (build-time image optimization) |

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. (Optional) optimize source photos into public/media
#    Source dir defaults to C:/Users/mpera/Downloads/Auto
npm run optimize-media

# 3. Run the dev server
npm run dev            # → http://localhost:5173

# 4. Build for production
npm run build          # → dist/

# 5. Deploy to Firebase Hosting
npm run deploy
```

## ⚙️ Configuration

The Firebase web config ships with safe public defaults, so the app builds and
runs out of the box. To connect auth, payments and your own project, see:

- **[docs/FIREBASE_SETUP.md](docs/FIREBASE_SETUP.md)** — enable Firestore + Google Sign-In.
- **[docs/STRIPE_SETUP.md](docs/STRIPE_SETUP.md)** — create the €0.99 + tip Payment Links.
- **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** — build & deploy pipeline.
- **[docs/CONTRIBUTING.md](docs/CONTRIBUTING.md)** — how to contribute.

Copy `.env.example` → `.env` to override config via `VITE_*` variables.

## 📁 Project Structure

```
src/
├── components/
│   ├── layout/     Navbar, Footer
│   ├── sections/   Hero, Features, Simulation, MediaShowcase, Pricing, OpenSource, Community
│   ├── three/      3D simulator (Scene, SiegfriedCar, Arena, physics)
│   ├── auth/       UserMenu, PremiumGate
│   └── ui/         GlassCard, GlowButton, Reveal, SmartImage, Background…
├── context/        AuthContext (Firebase auth state)
├── lib/            firebase.ts, stripe.ts
├── data/           firmware.ts, site.ts, media-manifest.json
scripts/            optimize-media.mjs (sharp), shot.mjs (screenshots)
```

## 📄 License

MIT — free to fork, modify and build on. See [LICENSE](LICENSE).

<div align="center">
<sub>Built for the future. · Powered by Firebase 🔥</sub>
</div>

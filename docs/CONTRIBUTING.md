# Contributing to Siegfried 2.0

Thanks for your interest in improving Siegfried 2.0! This is an open-source
project — contributions of all kinds are welcome.

## Ways to contribute

- 🐛 **Report bugs** via [Issues](https://github.com/Matteo-Super/Siegfried-2.0/issues).
- 💡 **Suggest features** — open an issue describing the idea and use case.
- 🔧 **Submit code** — fix bugs, improve the UI, extend the simulator, refine the firmware.
- 📖 **Improve docs** — clarity fixes and examples are always appreciated.

## Development workflow

1. **Fork** the repo and clone your fork.
2. Create a branch: `git checkout -b feature/my-change`.
3. Install deps and run the dev server:
   ```bash
   npm install
   npm run dev
   ```
4. Make your change. Keep the existing code style (TypeScript, functional React
   components, Tailwind utility classes, the glass design system in `index.css`).
5. Verify it builds cleanly — this also type-checks:
   ```bash
   npm run build
   ```
6. Commit with a clear message, push, and open a **Pull Request** against `master`.

## Code guidelines

- **TypeScript** everywhere; avoid `any`.
- **Components** are small and focused; reuse `ui/` primitives (`GlassCard`,
  `GlowButton`, `Reveal`, `SmartImage`).
- **Animations** via Framer Motion; respect `prefers-reduced-motion`.
- **3D**: keep the physics loop in `useFrame` and out of React state; gate heavy
  effects (bloom, reflections) behind the `quality` flag for low-end devices.
- **No secrets** in the repo. Stripe uses public Payment Links; Firebase web
  keys are public client identifiers.

## Firmware

The Arduino firmware lives in `src/data/firmware.ts`. If you change pin mappings
or behavior, update both the firmware string and the simulator logic in
`src/components/three/` so the on-site demo stays representative.

## Code of conduct

Be respectful and constructive. We're here to build cool open-source robotics
together. 🤖

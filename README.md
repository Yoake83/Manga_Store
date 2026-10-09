# YOAKE 夜明け — Sakura Manga World

## Run it locally
Requires Node.js 18.17+ (20 LTS recommended) and a browser with WebGL.

    unzip yoake-r3f.zip && cd yoake
    npm install
    npm run dev            # open http://localhost:3000

Production build: `npm run build && npm start`.
Different port: `npm run dev -- -p 3001`.
Test on your phone (same Wi-Fi): `npm run dev -- -H 0.0.0.0`, then open `http://<your-computer-LAN-IP>:3000`.

## Config
Copy `.env.example` to `.env.local`. `MANGA_SOURCE=both|mangadex|original` (default both; falls back to original if MangaDex fails).

## Notes
- `lib/sources/*` is the adapter layer (implement `Source` to add licensed content).
- `/api/img` is an allow-listed proxy for MangaDex images only.
- Sound is procedural (WebAudio), starts after you press "Enter the path", mute button top-right.
- Bloom auto-disables if the frame rate stays low; mobile and reduced-motion get lighter settings.
- MangaDex content is mostly fan-translated: fine for a local/portfolio demo, review their terms before a public launch.

## Architecture (React Three Fiber port)
- `components/World.tsx`: UI (hero, HUD, modal, reader) + flow state. Shares a mutable `rig` ref with the scene.
- `components/world/*`: the R3F scene. `Scene` (Canvas, bloom, perf guard), `CameraRig`, `Backdrop`, `Gates`, `Trees`, `Atmosphere` (petals, mist), `Interactives` (type cards, lanterns, shelf).
- `lib/textures.ts`: all procedural canvas art. `lib/rig.ts`: shared state and camera targets. `lib/sources/*`: data adapters.
- Rendering uses `legacy linear flat` on the Canvas with three r152 so colours and lighting match the look you approved. Tuning knobs: light intensities in `Backdrop.tsx`/`CameraRig.tsx`, bloom in `Scene.tsx`.

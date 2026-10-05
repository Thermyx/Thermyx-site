# Thermyx site

The Thermyx product site. Home: a hero with the insole and power pack in 3D, a scroll that turns and takes them apart beside five chapters on how it works, an explorable exploded view (hover a part for what it does, click to pin, drag the cards), then the pair, the app, safety, and a waitlist. App (`/app`) is its own cream page: a tour of the iPhone app beside a 3D phone. Team, Validation, News, and Contact are placeholder pages for now.

## Run

```sh
npm install
npm run dev          # http://localhost:5173
npm run build        # production build to dist/
npm run lint
```

## Waitlist

The form posts `{ "email": "…" }` as JSON to the URL in `VITE_WAITLIST_ENDPOINT` (Formspree-compatible). Put it in `.env.local`:

```sh
VITE_WAITLIST_ENDPOINT=https://formspree.io/f/yourFormId
```

Until it's set, the form tells visitors sign-ups aren't connected yet; it never pretends to succeed.

## The model

The page loads one file, `public/hardware-model.glb` (all 20 bodies, both products, shared coordinate frame), exported from Fusion with `ExportGLB.py`. After re-exporting:

```sh
npm run check:model  # fails on missing bodies, names that no longer match the manifest or explode offsets, or glass without transmission
```

Body names come from Fusion and the site matches them by prefix, so keep them stable when re-exporting.

## The app page

- **Palette:** pages pick a theme in `src/site/pages.js` (`theme: "cream"` for `/app`). The shell sets `data-theme` on `<html>`, and `src/styles/tokens.css` redefines the colors for cream, so the header, footer, and buttons follow automatically. `index.html` applies the cream theme before first paint on `/app`.
- **Backdrop:** React Bits' Prism (patched: blue and orange palette, lower render resolution, can hold still), multiplied onto the cream. The home page's 3D canvas is hidden and stopped there.
- **The phone** is built in code (`src/app/phone/phoneModel.js`): no model file, no license to credit, and the Thermyx mark on the back (`public/app/phone-back-mark.png`). Until the demo recording exists, its screen shows placeholder screens drawn from the real app's layouts and labels, with skeleton bars where readings would go (`src/app/phone/screens.js`).
- **Demo recording:** put a portrait screen recording in `public/app/` (an iPhone's own, 1290 × 2796, is the screen's exact shape) and set `DEMO_VIDEO_SRC` in `src/app/demo.js`.
- **App Store:** the badge says "Coming soon" and leads to the waitlist until `APP_STORE_URL` is set in `src/app/AppStoreBadge.jsx`.
- **Copy** comes from the app repo (README, the Swift views and models); keep it that way.
- **App icon:** `public/brand/thermyx-app-icon.png` is the full-bleed 1024 × 1024 master (no transparency, as App Store Connect wants); the 256 px copy is for the site.

## Hosting

Pages are client-side routes (`/app`, `/team`, …), so the host must serve `index.html` for any path it doesn't have a file for. `firebase.json` has that rewrite; `npm run dev` and `npm run preview` already do it.

## Layout

```
src/
  App.jsx          the shell every page shares (canvas, header, routes, footer, glow, blur)
  site/            header, footer, page list, cursor glow, scroll on navigation
  pages/           placeholder and not-found pages
  app/             the app page: tour, phone (model, screens), sections, Prism backdrop
  home/            the home page: the 3D stage and chapters, then each section
  explorer/        the 3D scene: backdrop, model, camera path, explode, part cards
  ui/              shared text pieces (section heads, word-by-word rise)
  components/      React Bits components (verbatim, apart from marked "Thermyx patch" fixes)
  data/            part descriptions, chapters, explode offsets
  styles/          tokens (dark and cream palettes, type), base, buttons
public/brand/      badge, wordmarks (light ink for dark pages), app icon
public/app/        the mark on the phone's back (and the demo recording, once there is one)
scripts/           dev tools (model check)
```

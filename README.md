# Thermyx site

The Thermyx product site. Home: a hero with the insole and power pack in 3D, a scroll that turns and takes them apart beside five chapters on how it works, an explorable exploded view (hover a part for what it does, click to pin, drag the cards), then the pair, the app, safety, and a waitlist. App, Team, Validation, News, and Contact are placeholder pages for now. `CLAUDE.md` is the spec and source of truth.

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

The page loads one file, `public/model_whole.glb` (all 20 bodies, both products, shared coordinate frame), exported from Fusion with `ExportGLB.py`. After re-exporting:

```sh
npm run check:model  # fails on missing bodies, names that no longer match the manifest or explode offsets, or glass without transmission
```

Body names come from Fusion and the site matches them by prefix, so keep them stable when re-exporting.

## Hosting

Pages are client-side routes (`/team`, `/news`, …), so configure the host to serve `index.html` for any path it doesn't have a file for (an SPA fallback or rewrite). `npm run dev` and `npm run preview` already do.

## Layout

```
src/
  App.jsx          the shell every page shares (canvas, header, routes, footer, glow, blur)
  site/            header, footer, page list, cursor glow, scroll on navigation
  pages/           placeholder and not-found pages
  home/            the home page: the 3D stage and chapters, then each section
  explorer/        the 3D scene: backdrop, model, camera path, explode, part cards
  ui/              shared text pieces (section heads, word-by-word rise)
  components/      React Bits components (verbatim, apart from marked "Thermyx patch" fixes)
  data/            part descriptions, chapters, explode offsets
  styles/          tokens (the app's palette and type), base, buttons
public/brand/      badge, wordmark, and the light wordmark used on dark
scripts/           dev tools (model check)
reference/         original vanilla three.js showcase, for comparison only
```

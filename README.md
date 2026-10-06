# Thermyx site

The Thermyx product site. Home: a hero with the insole and power pack in 3D, a scroll that turns and takes them apart beside five chapters on how it works, an explorable exploded view (hover a part for what it does, click to pin, drag the cards), then the pair, the app, safety, and a waitlist. App (`/app`) is its own cream page: a tour of the iPhone app beside a 3D phone. Team, Validation, Media, and Contact are built and filled with clearly marked examples until real content arrives (see "Editing content").

## Run

```sh
npm install
npm run dev          # http://localhost:5173
npm run build        # production build to dist/
npm run lint
```

## Waitlist

The form posts `{ "email": "…", "_subject": "…" }` as JSON to the URL in `VITE_WAITLIST_ENDPOINT`. Sign-ups go to whichever inbox that service sends to (thermyx.contact@gmail.com). Two ways to set it up, both free and both work with the form as it is:

- **Formspree** (recommended: a dashboard, a CSV export, spam filtering). Sign up at formspree.io with thermyx.contact@gmail.com, create a form, and copy its endpoint (`https://formspree.io/f/abcdwxyz`). The free plan covers 50 submissions a month.
- **FormSubmit** (no account). Use `https://formsubmit.co/ajax/thermyx.contact@gmail.com`, submit the form once yourself, and click the activation link FormSubmit emails you. The address is visible in the site's code this way; FormSubmit can give you a random alias to use instead.

Put the endpoint in `.env.local` (development) and `.env.production` (what `npm run build` uses for the deploy), then rebuild and redeploy:

```sh
VITE_WAITLIST_ENDPOINT=https://formspree.io/f/abcdwxyz
```

Until it's set, the form tells visitors sign-ups aren't connected yet; it never pretends to succeed. A hidden honeypot field quietly drops form-filling bots.

## Contact form

The Contact page posts `{ name, email, topic, message, _subject, _replyto }` to `VITE_CONTACT_ENDPOINT`, or to the waitlist's endpoint if that's the only one set (Formspree or FormSubmit, as above; `_replyto` lets you reply straight to the sender). With neither set, "Mail the card" opens the visitor's own email app with the message filled in, addressed to thermyx.contact@gmail.com, so nothing is lost.

## Editing content

Each page reads plain data files; edit them and the page follows.

- **Socials** (`src/data/socials.js`): the email and every channel, used by the footer's "Follow the build" loop, the Contact page, and Media's channel tiles.
- **Media** (`src/data/media.js`): two sections. *Thermyx Media* is the channel tiles (`CHANNELS`) and the posts, press, and recognition list (`POSTS`). *Selected Sources* (`SOURCES`) is research, guidance, articles, and collaborations; the first five are the references the app's Learning Center cites, with checked links. Entries with `example: true` are templates. `/media?section=sources` opens the second section.
- **Team** (`src/data/team.js`): five people, as crystal cards at the points of a slowly turning star (numbered in this order; Shuffle only moves them round the star). Add a photo by putting it in `public/team/` and setting `photo: "/team/<file>"`: it fills the card, and the name's letters are cut from it. Portrait photos work best (about 5:7, face in the upper half). Until then each card shows an etched bust. Clicking a card opens the big card with the bio paragraphs, focus, background, and links.
- **Validation** is a placeholder. A masonry version (React Bits' Masonry, tiles that open draggable detail cards) is built in `src/pages/validation/` with its data in `src/data/validation.js`; to bring it back, route it in `src/App.jsx`.

## The model

The page loads one file, `public/hardware-model.glb` (all 20 bodies, both products, shared coordinate frame), exported from Fusion with `ExportGLB.py`. After re-exporting:

```sh
npm run check:model  # fails on missing bodies, names that no longer match the manifest or explode offsets, or glass without transmission
```

Body names come from Fusion and the site matches them by prefix, so keep them stable when re-exporting.

## The app page

- **Palette:** pages pick a theme in `src/site/pages.js` (`theme: "cream"` for `/app`). The shell sets `data-theme` on `<html>`, and `src/styles/tokens.css` redefines the colors for cream, so the header, footer, and buttons follow automatically. `index.html` applies the cream theme before first paint on `/app`.
- **Backdrop:** React Bits' Prism (patched: blue and orange palette, lower render resolution, can hold still), multiplied onto the cream. The home page's 3D canvas is hidden and stopped there.
- **The phone** is built in code (`src/app/phone/phoneModel.js`): no model file and no license to credit. It turns at most to a side view either way, so its back never shows. Until the demo recording exists, its screen shows placeholder screens drawn from the real app's layouts and labels, with skeleton bars where readings would go (`src/app/phone/screens.js`).
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
  pages/           Team, Validation, Media, Contact, and the placeholder and not-found pages
  app/             the app page: tour, phone (model, screens), sections, Prism backdrop
  home/            the home page: the 3D stage and chapters, then each section
  explorer/        the 3D scene: backdrop, model, camera path, explode, part cards
  ui/              shared pieces: page and section heads, pills, social chips and loop, floating cards
  components/      React Bits components (verbatim, apart from marked "Thermyx patch" fixes)
  data/            part descriptions, chapters, explode offsets, and each page's content
  styles/          tokens (dark and cream palettes, type), base, buttons
public/brand/      badge, wordmarks (light ink for dark pages), app icon
public/app/        the mark on the phone's back (and the demo recording, once there is one)
scripts/           dev tools (model check)
```

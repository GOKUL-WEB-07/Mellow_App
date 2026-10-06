# Mellow_App

Soft Day — productivity without pressure.

Productivity without pressure. A local-first, responsive React app built around one thing to **Finish**, one moment of **Care**, and something to **Enjoy**.

> Soft Day is not about doing more.
>
> It is about choosing what matters, giving it a little attention, taking care of yourself, and ending the day feeling that it was enough.

## Run locally

Node.js 22 or newer is recommended. Development was verified with Node 24.

```sh
npm install
npm run dev
```

On Windows PowerShell with script execution disabled, use `npm.cmd` instead of `npm`.

```sh
npm run build
npm run preview
npm test
```

The development server uses `http://127.0.0.1:5173`. The production preview defaults to port 4173. The service worker is enabled in the production build, not the development server.

## Screens and features

| Screen  | Implemented behavior                                                                                                                                                                      |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Today   | Date-aware greeting, exactly three editable intentions, reversible completion, duration shortcuts, tea ritual, original companion artwork, evening reflection invitation                  |
| Focus   | 15/25/45-minute and custom 1–180-minute sessions; tea selector; eight ambient choices including silence; volume; pause, resume, ±5 minutes, finish early; completion reflection and notes |
| Journal | Daily journal and quick note types; seven optional moods; reflection prompts; up to three compressed photos per entry; create, read, edit, delete; reload warning for unsaved edits       |
| Room    | Original cozy room illustration, four gentle unlocks, persistent decoration visibility                                                                                                    |
| Profile | Name, drink, duration, ambience, volume, automatic/morning/evening/night theme, reduced motion, in-app daily reminder, privacy explanation                                                |
| History | Days collected as intention and memory cards, mood labels and optional quiet minutes, with no scores or charts                                                                            |
| Welcome | Optional three-step introduction to the ritual and the three-intention philosophy                                                                                                         |

Routes: `/today`, `/focus`, `/focus/active`, `/focus/complete`, `/journal`, `/journal/new`, `/journal/:entryId`, `/room`, `/profile`, `/settings`, `/history`. `/` redirects to Today. Unknown routes offer a way home.

## Architecture and folders

```text
src/
  app/
    App.tsx             Router, navigation, theme, reminder, welcome flow
    Store.tsx           Shared state and service-backed mutations
  components/
    ui.tsx              Cup, RoomScene, Modal, EmptyState, SectionTitle
  features/
    today/Today.tsx     Daily intentions and emotional history
    focus/Focus.tsx     Setup, active timer, completion
    focus/audio.ts     Offline Web Audio sound synthesis
    journal/Journal.tsx Journal list and editor
    room/Room.tsx       Room and gentle decorations
    profile/Profile.tsx Preferences and privacy
  services/
    data.ts             Typed models, storage adapter, feature services
    data.test.ts        Persistence, timer, and unlock tests
  styles/
    tokens.css          Shared palette, spacing, radii, motion, layers
    globals.css         Components, responsive layouts, reduced motion
public/
  room.webp             Original locally bundled illustration
  icon.svg              Soft Day sun mark
  icon-192.png
  icon-512.png
scripts/
  prepare-assets.mjs    WebP optimization and PNG icon generation
  browser-*.cjs         Playwright CLI verification flows
```

React Context holds application state. Feature routes are lazy-loaded. The UI calls `dailyPlanService`, `focusService`, `journalService`, `roomService`, and `settingsService`; only the storage adapter accesses localStorage. Those service boundaries are the integration points for a future backend. No authentication, backend, analytics, or external runtime asset requests are included.

## Data model and persistence

- **Settings / local user**: local ID, name, preferred tea and ambience, default duration, theme, motion, volume, reminder, onboarding status, creation time.
- **DailyPlan**: local user ID, local calendar date, exactly three intention objects (`text`, `completed`), timestamps.
- **FocusSession**: task and plan/date reference, planned and actual seconds, tea, ambience, status, start/end timestamps, optional reflection and note.
- **ActiveSession**: task, planned and remaining seconds, elapsed seconds, absolute deadline or paused state, original start time, ritual and date. The absolute deadline prevents background-tab timer drift.
- **JournalEntry**: ID, user, date, text, mood, note type, compressed photo data URLs, timestamps. Prompt responses remain part of the freeform text.
- **RoomState**: unlocked decoration IDs, selected decoration IDs, timestamp.

All records use the `soft-day:` localStorage namespace. Photos are resized to at most 1000 pixels and compressed to JPEG before storage. Write failures produce a visible message rather than reporting a successful save. Invalid JSON falls back to defaults. Date keys use the device's local calendar day.

Journal content stays on this browser and device. It is not encrypted or PIN-protected. Clearing browser data deletes it; another person who can open this browser can view it. There is no backup or cross-device synchronization.

## Design system

Warm cream and paper surfaces, dark sage actions, peach Care and muted rose Enjoy cards. DM Sans is bundled locally at four weights; Lucide supplies consistent outline icons. Shared tokens define spacing, color, radii, motion, and layering. Cards use quiet borders and soft shadows; the original painted room is the visual centerpiece. The ceramic cup has restrained steam animation.

The desktop experience has centered navigation and a two-column day composition. Below 768 pixels, views stack and navigation moves to a fixed bottom bar with safe-area padding. Focus remains dominated by the circular timer. Keyboard focus, a skip link, named form controls, a focus-trapped dialog, status messages, and both system and app-level reduced motion are supported.

## Room unlocks

- Favorite cup: three sessions with at least one actual focused minute each.
- Plant: three saved journal entries.
- Candle: Care completed on two days.
- Artwork: Enjoy completed on two days.

Unlocks stay unlocked, even when entries are later deleted or intentions reopened. No currency, streak, penalty, or competitive score is used. Decorations are simple selectable visual accents layered over the room; they are not a full room editor.

## PWA and offline

### GitHub Pages deployment

The repository uses `.github/workflows/deploy-pages.yml` to test, build, and publish the contents of `dist/` on pushes to `main`. GitHub Pages must use **GitHub Actions** as its source rather than serving source files from the branch. This follows [Vite's GitHub Pages deployment guide](https://vite.dev/guide/static-deploy.html#github-pages).

`npm run build:pages` builds for `/Mellow_App/`, including the illustration, icons, manifest, service-worker scope, and cached navigation fallback. Pages uses hash URLs such as `/Mellow_App/#/journal` so direct links and refreshes work on static hosting. Root hosting and normal local development continue to use the standard routes.

To check the repository build locally:

```sh
npm run build:pages
npm run preview -- --mode pages
```

Open `http://127.0.0.1:4173/Mellow_App/`. The public app is at `https://gokul-web-07.github.io/Mellow_App/`.

Use **Download app** in the header or Profile to add Soft Day to your device. When the browser offers a native install prompt, the button opens it; otherwise a dialog explains browser-menu installation, Safari Add to Dock, or iPhone/iPad Add to Home Screen. Both buttons share installation state and stop prompting after the browser confirms installation. An Apple touch icon is included for home-screen shortcuts. Browser behavior follows the [PWA installation guidance](https://web.dev/learn/pwa/installation-prompt/) and [Apple home-screen instructions](https://support.apple.com/en-lamr/guide/iphone/iphea86e5236/ios).

The automatic browser install flow requires the production build on localhost or HTTPS. Run `npm run build` and `npm run preview`; the development server can show guidance but does not register the production service worker.

Vite PWA / Workbox generates the service worker and standalone manifest. The app shell, lazy route chunks, local fonts, illustration, and icons are precached. Ambient audio is synthesized locally, so it needs no audio download. All core views can load offline after the initial successful production load, and local records remain editable.

Deploy `dist/` using HTTPS with SPA fallback to `index.html`. Install prompts depend on browser support and engagement rules. Actual OS installation has not been verified on a physical phone. Background notifications and operating-system alarms are intentionally absent; reminders only appear while the app is open. Timers reconcile against wall-clock time when the focus screen runs again.

## Verification

See [TESTING.md](TESTING.md) for performed checks and practical limits. The production build, strict TypeScript check, 11 unit tests, browser interaction flows, responsive layouts, automated accessibility checks, and production offline behavior were verified. Screenshots are saved in `output/playwright/` (gitignored).

## Known limitations and sensible next improvements

- Local-only data has browser quota limits; move photos and journals to IndexedDB before supporting large archives.
- Save journal edits with **Keep this memory**. The editor is not an autosaving notebook.
- A single static original companion scene is shared across views; future scenes can quietly reflect focus, journaling, and nighttime.
- Ambient choices are lightweight synthesized interpretations, not field recordings. Their controls were tested, but listening quality needs human review.
- Room additions are basic icons, not individually rendered furniture or freely positioned objects.
- The active session is designed for one app tab. Concurrent edits across tabs are not synchronized.
- Screen-reader testing, physical-device installation, Safari/iOS behavior, and subjective audio review remain follow-up validation.
- Future work should prioritize resilient photo storage, private backups, richer room objects, and optional authenticated sync only when needed.

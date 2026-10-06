# Verification record

## GitHub Pages deployment fix — October 6, 2026

- Confirmed Pages was serving the source branch root rather than a Vite build.
- Added a test/build/deploy workflow and a dedicated `/Mellow_App/` build mode.
- Strict TypeScript compilation, the Pages production build, and all 11 unit tests passed.
- At 430 × 932 pixels, verified navigation and reloads across the five main tabs under the repository subfolder, loaded room artwork, checked the manifest icon/start/scope paths and scoped service worker, and created/reloaded a journal note offline.
- No failed HTTP responses or runtime errors were recorded during the Pages browser flow.
- `scripts/browser-pages.cjs` can run against either the local Pages preview or the hosted repository root in a dedicated test browser.

## Browser download option — October 6, 2026

- Production build and strict TypeScript compilation passed.
- Added header and Profile Download app buttons with one shared install event handler.
- Playwright verified simulated native prompt acceptance, dismissal, one-time use, prompt failure with fallback guidance, and `appinstalled` state shared between both buttons.
- Checked 390, 768, and 1440 pixel widths. Fixed tablet header overflow found at 768 pixels.
- Profile accessibility scan reported zero WCAG A/AA violations; the exercised install flow had no runtime errors.
- These checks use controlled browser events. Actual OS installation and physical-device Safari installation remain untested.

Verified on October 4, 2026 using Windows, Chromium via Playwright CLI, Node 24, and the local development/production servers.

## Build and dependency checks

- `npm.cmd run build`: strict TypeScript compilation and production bundling passed; Workbox generated the service worker and a precache of approximately 714 KiB.
- `npm.cmd test`: 11 tests passed with Vitest 4.1.11.
- Dependency installation audit after updates: 0 reported vulnerabilities.
- The development server briefly reported a Fast Refresh context error and connection interruptions while all source files were formatted and its configuration restarted. Reload recovered normally; subsequent interaction flows passed. A separate final production console check covers uncaught errors on seven routes.

## Unit coverage

1. Create, edit, and complete the three intention types; isolate new days.
2. Save and update journal text, mood, photos; delete without leaving duplicate entries.
3. Persist preferences and selected room objects.
4. Recover from invalid JSON and surface quota/write failure.
5. Construct local-calendar date keys.
6. Reconcile a timer after elapsed wall-clock time; persist active state.
7. Pause and resume without counting paused time.
8. Cap remaining time at zero and avoid counting time beyond the deadline.
9. Preserve actual focused time when planned minutes change.
10. Upsert completed sessions without duplicates and clear active state.
11. Verify all four unlock rules and exclude zero-length sessions from cup unlocks.

## Browser interaction checks

- Create Finish, Care, and Enjoy; edit Care; complete and reopen controls; reload persistence.
- Complete all three onboarding steps and persist chosen tea.
- Exercise all seven non-silent ambient choices through play/pause, adjust volume, and choose tea. This verifies Web Audio initialization and UI behavior, not subjective audio quality.
- Begin a focus session; pause; advance the browser clock while paused; add and subtract five minutes; reload and resume; finish early; record reflection and note.
- Run a custom one-minute session to automatic completion using a controlled browser clock. Mark Done and verify the corresponding Finish intention completes.
- Reload the focus completion route and recover the saved session.
- Create a journal entry with a mood and PNG upload; edit its text and mood; reload; verify the saved photo and mood.
- Create three entries and verify the plant unlock; hide the plant and reload to verify room preference persistence.
- Delete an entry through its confirmation dialog.
- Change name, default duration, drink, theme, and motion settings; reload preferences.
- Trigger and disable the in-app reminder using the controlled browser clock.
- Navigate through the mobile bottom bar.

## Responsive and accessibility checks

- Today, Focus, Journal, Room, Profile, and History checked at 390, 768, 1024, 1280, and 1440 pixels: no horizontal overflow.
- Desktop and mobile screenshots captured and representative Today, Focus, and Journal views visually inspected.
- Automated axe WCAG 2 A/AA and 2.1 AA scans run on Today, Focus, Journal, Journal editor, Room, Profile, and History in Morning, Evening, and Night themes.
- Initial secondary-text contrast failures corrected in the token system; the affected Evening Today view was rechecked with no violations. Other screen/theme combinations had no remaining violations in the previous pass.
- Tab sequence, skip link to main content, dialog focus loop, and Escape dismissal verified. A dialog focus escape found during testing was fixed and retested.
- Both operating-system reduced motion emulation and the in-app reduced-motion setting stop the cup steam animation.

Automated scans do not prove complete WCAG conformance. Screen-reader and physical-device checks have not been performed.

## Production offline checks

The production preview on port 4173 was loaded, the service worker became ready and controlled the page, and then the browser context was set offline.

- All six primary views loaded by direct navigation while offline.
- An intention was created/edited offline and remained after reload.
- The original room illustration loaded from cache.
- The manifest had standalone display and both PNG icon sizes.

Actual operating-system installation and background execution were not tested. Production deployment must use HTTPS and a SPA fallback. Offline functionality is available after the initial successful load/cache.

## Replaying browser flows

The `scripts/browser-*.cjs` files are Playwright CLI `run-code` functions, not Node executables or independent tests. They use a dedicated test browser and some depend on preceding test data.

```powershell
.\node_modules\.bin\playwright-cli.cmd -s=softday open http://127.0.0.1:5173
.\node_modules\.bin\playwright-cli.cmd -s=softday snapshot
```

Open the Add Finish dialog, then run `browser-core.cjs`, `browser-focus.cjs`, open a new journal entry, run `browser-journal.cjs`, and follow the remaining flows with their documented starting screen. The layout flow starts on Profile. The accessibility flow navigates itself. The offline flow uses a separate production-browser session on port 4173. Do not run these flows against personal journal data.

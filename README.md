# TYPEPLAY

TYPEPLAY is a browser-based touch-typing application built around deliberate practice. It combines guided lessons, configurable practice sessions, timed tests, persistent local progress, and an optional original procedural piano typing mode.

No account, backend, database, or third-party music is required. User data is stored only in the browser through `localStorage`.

## Implemented features

- **Practice mode** with six original passages and 15, 30, 60, or 120 second sessions.
- **Timed typing tests** with 15, 30, 60, 120, or 300 second durations and continuously generated original test text.
- **Nine-lesson touch-typing curriculum** with prerequisites, saved lesson progress, attempt history, best scores, and unlocks.
- **Shared typing engine** that tracks per-character correctness, backspace corrections, elapsed time, WPM, accuracy, and completion state.
- **Persistent session history** for genuinely completed Practice and Timed Test sessions, including a progress dashboard with aggregates, a recent-performance chart, and recent attempts.
- **Settings** for locally saved audio volumes, selected music mode, reduced motion, and theme preference.
- **Music / Play mode** that reuses the typing engine and generates original piano-like feedback with the browser Web Audio API.
- **Responsive, keyboard-accessible UI** with a shared page shell, interactive keyboard guidance, and touch-typing finger guidance.
- **Automated regression tests** for core typing, metrics, persistence stores, safe audio catalog/mapping logic, and focused Progress page behavior.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Home page and primary navigation |
| `/practice` | Configurable typing-practice sessions |
| `/learn` | Nine-lesson touch-typing curriculum |
| `/learn/:lessonId` | Individual lesson session |
| `/test` | Timed typing test |
| `/progress` | Saved session history and lesson progress |
| `/settings` | Local audio, motion, and theme preferences |
| `/music` | Original procedural piano typing mode |

Unknown client-side routes render the not-found page.

## Technology

- **React 19** and **TypeScript**
- **Vite 8** for development and production builds
- **React Router** for client-side routes
- **Zustand** with persistence middleware for browser-local state
- **Tailwind CSS v4** through the Vite plugin, plus project CSS tokens and component styles
- **Lucide React** and **React Icons** for interface icons
- Native **Web Audio API** for procedural piano feedback
- **Vitest**, **jsdom**, and **React Testing Library** for automated tests
- **Oxlint** for linting

## Getting started

### Prerequisites

Install a supported Node.js release and npm. This project was last verified with Node.js 24 and npm 11.

### Install and run

```bash
npm install
npm run dev
```

Vite prints the local development URL in the terminal, commonly `http://localhost:5173`.

## Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check the project and create a production build in `dist/` |
| `npm run preview` | Serve the existing production build locally |
| `npm run lint` | Run Oxlint |
| `npm test` | Run Vitest in watch mode |
| `npm run test:run` | Run the test suite once |

Run the complete verification sequence with:

```bash
npm run test:run
npm run build
npm run lint
```

## Project structure

```text
src/
├── audio/        # Web Audio wrapper, procedural piano synth, key map, track catalog
├── components/   # Shared layout, home, and learning UI components
├── data/         # Original passages, lessons, and keyboard/finger mappings
├── engines/      # Framework-independent TypingEngine
├── hooks/        # React integrations for the engine, learning, and media preferences
├── pages/        # Route-level screens
├── stores/       # Persisted Zustand settings, learning, and history stores
├── styles/       # Global styles and design tokens
├── test/         # Shared jsdom setup
├── types/        # Domain and application type definitions
└── utils/        # Typing metric helpers
public/
└── favicon.svg   # Application favicon
```

Tests live alongside the modules they exercise, with a shared browser-like setup in `src/test/setup.ts`.

## Typing engine and metrics

`src/engines/TypingEngine.ts` is intentionally independent of React. React pages use it through `src/hooks/useTypingEngine.ts`.

The engine tracks the authoritative status of every character. Both correct and incorrect printable input advance the cursor; backspace reopens the prior character and counts as a keystroke. A session completes only when the configured timer completes or the public `complete()` API is used.

Current metric definitions are:

- **WPM:** `(correct characters × 12) / elapsed seconds`
- **Accuracy:** `(correct characters / total keystrokes) × 100`

Both values are rounded to one decimal place by the metric helpers.

## Local persistence

Zustand persistence writes data to browser `localStorage` under these keys:

- `typeplay:settings`
- `typeplay:learning`
- `typeplay:history`

Only serializable data fields are persisted; store action functions are not. The history store validates and normalizes persisted attempt records during hydration, ignores malformed records, sorts valid records newest first, and retains at most 200 attempts.

Clearing browser storage resets locally saved settings, learning progress, and session history.

## Audio architecture

Music / Play mode uses only original, procedural browser audio:

- `AudioEngine` creates and resumes an `AudioContext` lazily.
- `PianoSynth` builds piano-like notes from oscillator and gain nodes, then disconnects them after release.
- `keyNoteMap.ts` maps supported keyboard characters deterministically to notes.
- `tracks.ts` is a metadata catalog; it does not contain downloaded music or copyrighted recordings.

Audio is intentionally not created or played on page load. It is unlocked only after a user interaction such as enabling sound, starting a session, or typing. Browser autoplay policies and audio-device behavior vary, so audible output requires a manual browser check.

## Testing

The test suite uses Vitest with jsdom. It covers:

- `TypingEngine` lifecycle, input, correction, timing, and reset behavior
- WPM, accuracy, session-stat, and consistency helpers
- Settings, learning, and history-store persistence behavior
- History hydration safeguards for malformed stored records
- Deterministic piano key mapping and track catalog logic
- Progress-page empty and populated session-history states

Tests deliberately do **not** assert that audible Web Audio output was physically heard. That remains a manual browser test.

Vitest runs in a single forked worker as configured in `vite.config.ts` for stable execution in this environment.

## Current limits and future ideas

The following are deliberately not implemented in the current application:

- A completed Finger Visualization experience
- Backend services, accounts, authentication, cloud sync, or a database
- Achievements, XP, AI/adaptive learning, falling-letter gameplay, or 3D/Three.js features
- Recorded, copyrighted, downloaded, or streaming music
- A fully applied light or system theme palette; the preference is stored for future styling work
- Full original background-track playback; the currently available sound mode is procedural typing-piano feedback

These are future considerations, not promised features.

## Verification status

The automated suite, production build, and linter should be run after changes using the commands above. Automated checks validate source behavior but do not substitute for a manual browser walkthrough.

**Not runtime verified.** In particular, visual route behavior and actual audible piano output need manual browser verification.

# 🎹 TYPEPLAY

### An interactive typing experience built around learning, music, and experimentation.

[🚀 Live Demo](https://typeplay-omega.vercel.app/)

TYPEPLAY is a browser-based touch-typing learning and practice platform built around deliberate practice.

It combines guided lessons, configurable practice sessions, timed tests, persistent local progress, performance tracking, and an optional original procedural piano typing mode.

> **TYPEPLAY isn't just another typing test. It's an experiment in combining technology, learning, interaction, and music to build something of my own.**

---

## 🎵 Why I Built TYPEPLAY

I wanted to build something that was more than just another conventional typing-test website.

I've always been interested in **music, technology, interactive experiences, and experimenting with ideas**. TYPEPLAY became a way to bring those interests together into one project.

The original idea was simple:

> **What if typing could feel less like simply pressing keys and more like interacting with an instrument?**

That idea gradually evolved into a complete typing platform with structured lessons, practice sessions, timed challenges, performance tracking, persistent progress, and a piano-inspired audio experience.

A major part of the project was also about learning by building. Rather than simply following a tutorial and reproducing an existing application, I wanted to take an idea, experiment with it, solve the problems that came along the way, and turn it into something people could actually use.

TYPEPLAY is still an evolving project. There are ideas I want to explore further, especially around music, interaction, learning, and making the experience feel more engaging.

---

## ✨ What TYPEPLAY Offers

### ⌨️ Touch Typing

- Interactive touch-typing lessons
- Nine structured lessons
- Home-row practice
- Left and right hand training
- Top and bottom row training
- Key combinations
- Words
- Sentences
- Speed practice
- Visual keyboard guidance
- Finger guidance
- Lesson prerequisites and unlocks
- Saved lesson progress
- Best scores and attempt history

### ⚡ Practice & Testing

- Configurable Practice Mode
- Six original practice passages
- 15, 30, 60, or 120 second practice sessions
- Timed Typing Tests
- 15, 30, 60, 120, or 300 second test durations
- Continuously generated original test text
- WPM calculation
- Accuracy calculation
- Correct / wrong / total keystroke statistics
- Missed typing metrics where supported
- Completion tracking

### 📊 Progress

- Persistent learning progress
- Practice history
- Timed-test history
- Completed sessions
- Average WPM
- Best WPM
- Average accuracy
- Total typing time
- Recent attempts
- Performance visualization

### ⚙️ Settings

- Music/audio enable or disable
- Music volume
- Typing sound volume
- Reduced-motion preference
- Theme preference
- Browser-local persistence

### 🎹 Music / Play Mode

TYPEPLAY also includes an experimental Music / Play mode that combines typing with procedural piano-like audio.

Instead of relying on downloaded recordings or copyrighted music, the application generates the audio directly in the browser using the native **Web Audio API**.

Different keyboard characters can map deterministically to different musical notes, creating a typing experience that feels closer to interacting with an instrument.

---

# 🎵 The Music Experiment

This is one of the parts of TYPEPLAY that I personally enjoyed experimenting with the most.

I didn't want to simply add a background music file and call it a music feature.

Instead, I experimented with the **Web Audio API** to generate piano-like sounds programmatically inside the browser.

The system uses:

- Oscillators
- Gain envelopes
- Harmonic synthesis
- Deterministic key-to-note mapping
- Lazy audio initialization
- Browser-native audio processing

The idea was:

**Typing + Music + Interaction = a more interesting learning experience.**

The audio system is intentionally based on original procedural synthesis rather than recorded or copyrighted music.

The project is designed so the music/audio system can continue evolving in the future.

---

## 🧠 Learning Experience

TYPEPLAY is designed around gradual touch-typing development.

The current curriculum contains nine lessons:

| # | Lesson |
|---|---|
| 1 | Home Row |
| 2 | Left Hand |
| 3 | Right Hand |
| 4 | Top Row |
| 5 | Bottom Row |
| 6 | Combinations |
| 7 | Words |
| 8 | Sentences |
| 9 | Speed Practice |

Lessons build progressively from individual keys toward words, sentences, and speed-oriented practice.

Prerequisites and lesson progress are stored locally so the learning experience can continue across browser sessions.

---

## 📊 Progress & History

TYPEPLAY keeps performance data locally in the browser.

Users can view:

- Completed sessions
- Average WPM
- Best WPM
- Accuracy
- Total typing time
- Recent attempts
- Practice history
- Timed-test history
- Learning progress

> Current progress, settings, and history use browser-local storage. There is currently no account, backend, database, or cloud synchronization system.

This means a new browser or device starts with a fresh local state.

---

## 🛠️ Technology

| Technology | Purpose |
|---|---|
| **React 19** | Frontend UI |
| **TypeScript** | Type-safe development |
| **Vite 8** | Development and production builds |
| **React Router** | Client-side routing |
| **Zustand** | State management and persistence |
| **Tailwind CSS v4** | Styling |
| **Lucide React / React Icons** | Interface icons |
| **Web Audio API** | Procedural piano/audio synthesis |
| **Vitest** | Automated testing |
| **jsdom** | Browser-like testing environment |
| **React Testing Library** | UI testing |
| **Oxlint** | Linting |
| **Vercel** | Deployment |

---

## 🏗️ Project Architecture

```text
src/
├── audio/        # Web Audio wrapper, piano synth, key mapping, track catalog
├── components/   # Shared layout, home, and learning UI components
├── data/         # Original passages, lessons, keyboard/finger mappings
├── engines/      # Framework-independent TypingEngine
├── hooks/        # React integrations for engine, learning, and preferences
├── pages/        # Route-level screens
├── stores/       # Persisted Zustand settings, learning, and history stores
├── styles/       # Global styles and design tokens
├── test/         # Shared jsdom setup
├── types/        # Domain and application type definitions
└── utils/        # Typing metric helpers

public/
└── favicon.svg

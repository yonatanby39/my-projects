# Spanish app (ספרדית ביום)

## Goal
A mobile-first PWA for a native Hebrew speaker to learn everyday **Argentine (Rioplatense) Spanish** in 10–15 minutes a day. The learner already has some basics. Personal use first; may be opened to others later.

MVP features: vocabulary flashcards with SM-2 spaced repetition, pronunciation via the Web Speech API, present-tense conjugation practice, an end-of-lesson quiz (multiple choice + typing), and progress tracking (streak, words learned, due today).

Out of scope for now: accounts, login, backend, payments, AI features. Everything runs locally in the browser.

## Stack
- React + Vite + TypeScript, Tailwind CSS v4 (`@tailwindcss/vite`)
- Vitest for unit tests
- Persistence in `localStorage` (versioned schema)
- PWA (installable, offline) – added in a later step

## How to run
All commands run from `spanish-app/`:

```bash
npm install
npm run dev        # dev server (add --host to open from a phone on the same Wi-Fi)
npm test           # run Vitest once
npm run test:watch # Vitest in watch mode
npm run build      # type-check + production build into dist/
npm run lint       # oxlint
```

## Folder structure
```
src/
  content/     learning content as JSON (words per topic, verbs). Never hard-code content in components.
  lib/         pure logic with no React (srs, answer checking, progress, storage, speech, dates)
               each module has a *.test.ts next to it
  components/  reusable UI pieces
  screens/     full screens (Home, Lesson, Review, Quiz, Conjugation, Progress)
```

## Conventions
- **UI language is Hebrew, RTL.** `<html dir="rtl" lang="he">`. Use logical Tailwind utilities (`ps-*`, `pe-*`, `ms-*`, `me-*`, `start-*`, `end-*`) rather than left/right.
- **Spanish text is LTR.** Always wrap it with the `<Es>` component (`src/components/Es.tsx`), which sets `dir="ltr"` and `lang="es-AR"`.
- **Dialect:** Rioplatense Spanish. Conjugations use *vos* (vos tenés, vos hablás) and *ustedes*; no vosotros. Prefer Argentine vocabulary (colectivo, auto, celular, frutilla, palta, computadora). Speech prefers an `es-AR` voice and falls back to other Latin American voices.
- **Typed answers:** compare ignoring case, accents and extra spaces, but always show the correct spelling. Provide quick-insert buttons for á é í ó ú ñ ü ¿ ¡.
- **Dates:** use local calendar date keys `YYYY-MM-DD` (`src/lib/date.ts`) for streaks and due dates, never raw timestamps.
- Mobile-first: tap targets at least 48px tall (`min-h-12`+), large readable text.
- Keep logic in `src/lib` pure and tested; components stay thin.
- Build one small step at a time; each step must pass `npm test`, `npm run build` and `npm run lint`.

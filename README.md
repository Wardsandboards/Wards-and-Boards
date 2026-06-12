# Wards & Boards — app foundation

The "build to last" rebuild of [wardsandboards.com](https://wardsandboards.com): the single-file
React-via-CDN prototype, re-poured as a real **Vite + React + TypeScript** project with a **Vitest**
test suite. This is the slab a developer (or a future AI session) can build the Supabase backend on.

> The live site still runs from the original `wardsandboards/` repo. Nothing here is deployed yet.
> This folder matures to feature-parity first, then we cut over (see "Cutover" below).

## Status

- ✅ Real toolchain: Vite build, TypeScript type-checking, Vitest tests — all green.
- ✅ Forge gate (`boardLint`) ported to typed, unit-tested code (incl. a regression test
  asserting every shipped board question passes the gate).
- ✅ **Full UI ported** — all ~30 components, the CSS, and `cases.js` / `learning-points.js`
  converted to typed modules. Type-check clean, build green.
- ✅ **26 tests** across 6 files: the Forge gate, the contribution pipeline (`lib/contribute`),
  pure logic, the Quiz flow, Practice scoring, and a whole-app render smoke test.
- ✅ **Deploy-ready:** the build carries the custom domain (`public/CNAME` + `.nojekyll`), a
  favicon, a social card, and full `<head>` metadata. See [CUTOVER.md](CUTOVER.md).
- ⏳ Pending: the cutover itself (move into the repo, flip Pages to GitHub Actions, push).

## Running it (Node lives in the sandbox)

This machine has no system Node. A self-contained Node LTS lives at
`../tools/node` — put it on PATH first:

```bash
export PATH="/Users/af/Desktop/Claude Code/tools/node/bin:$PATH"

npm install      # first time only
npm run dev      # local preview with hot reload -> http://localhost:5173
npm run test     # run the Vitest suite
npm run typecheck# tsc --noEmit, no type errors
npm run build    # production build -> dist/
```

## Structure

```
src/
  main.tsx              React entry
  App.tsx               foundation smoke screen (temporary; replaced by the real UI)
  types.ts              BoardQuestion, LintInput, LintResult
  lib/boardLint.ts      the Forge gate, ported verbatim and typed
  data/                 question/case content (questions.board.json wired; cases next)
test/
  boardLint.test.ts     unit tests for each lint rule + bank regression test
.github/workflows/      CI: typecheck + test + build, then deploy dist to GitHub Pages
```

## Cutover (when at parity)

The included `.github/workflows/deploy.yml` builds and deploys `dist/` to GitHub Pages. To go live:
1. Move this project to the root of the `Wardsandboards/Wards-and-Boards` repo (replacing the
   static files), keeping `CNAME` and `.nojekyll`.
2. In the repo's **Settings → Pages**, set the source to **GitHub Actions**.
3. Push. Actions type-checks, tests, builds, and deploys. No local Node needed for deploys.

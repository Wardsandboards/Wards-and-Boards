# OpenStem · wardsandboards

A free clinical-physiology teaching site for medical students. Understand the mechanism in
**Learn** (ward-moment cases with interactive graphs), then test recall in **Practice**
(physician-written, peer-reviewed board questions). Built by a practicing hospitalist.

## Run it locally
It is a single static page, no build step. Serve the folder and open it:

    python3 -m http.server 8000

then visit http://localhost:8000

## Files
- `index.html` — the whole app (React + Babel via CDN, inline-SVG graphs)
- `cases.js` — all Learn content (the `CASES` array)
- `questions.board.json` — the Practice board questions

## Hosting
Deployed free on GitHub Pages (Settings → Pages → Deploy from branch → main → /root).

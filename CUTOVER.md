# Going live (cutover)

This rebuilds the live site from the new Vite app instead of the old single HTML file.
Because the app now has a build step, **GitHub Pages must deploy via GitHub Actions** (not
"deploy from a branch"). The included [.github/workflows/deploy.yml](.github/workflows/deploy.yml)
type-checks, tests, builds, and publishes `dist/` on every push to `main`.

Your custom domain is preserved: `public/CNAME` (wardsandboards.com) and `public/.nojekyll` are
copied into the build output automatically.

## Steps (do them in this order)

1. **Switch the Pages source first.** In the GitHub repo → **Settings → Pages → Build and
   deployment → Source → "GitHub Actions"**. (Doing this before the push avoids a window where
   Pages tries to serve the unbuilt Vite source.)

2. **Move the app into the repo.** Copy the contents of `wardsandboards-app/` into the root of the
   `Wardsandboards/Wards-and-Boards` repo, replacing the old static files
   (`index.html`, `cases.js`, `learning-points.js`, `questions.board.json`). Keep `.git`. The new
   `public/CNAME` and `public/.nojekyll` replace the old root copies. Do **not** copy `node_modules`
   or `dist` (they are gitignored).

3. **Commit and push to `main`** in GitHub Desktop. The Action runs (~1–2 min): typecheck → test →
   build → deploy.

4. **Verify in incognito** at https://wardsandboards.com (your normal browser caches the old page
   hard). Check the Actions tab if it does not update.

## Rollback

Revert the commit and switch **Settings → Pages → Source** back to "Deploy from a branch" (`main` /
root). The old single-file site returns on the next build.

## Notes

- The sandboxed Node in `../tools/node` is only for local dev. CI installs its own Node, so the
  build does not depend on this machine.
- `vite.config.ts` uses `base: './'` (relative asset paths), so the site works whether served from
  the custom domain root or a project-pages sub-path.
- Optional polish later: `public/og.svg` is a ready-made social card; convert it to `og.png` and add
  `<meta property="og:image" content="https://wardsandboards.com/og.png" />` so link previews show an
  image (most platforms do not render SVG previews).

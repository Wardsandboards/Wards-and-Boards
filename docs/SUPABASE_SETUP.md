# Turning on real accounts + Google sign-in

The code for real accounts and Google sign-in is already built and gated behind two env vars.
**Until you do the steps below, the live site is unchanged** — it stays on the local demo sign-in.
When you finish, the "Continue with Google" button becomes a real Google login (the small "demo"
label disappears).

Everything here is the part only you can do (creating accounts, holding keys). It takes ~15 minutes
and is free at this scale.

## 1. Create a Supabase project (~5 min)
- Go to **supabase.com**, sign in, click **New project**.
- Give it a name, pick a region near you, set a database password (save it somewhere).
- Wait for provisioning to finish.

## 2. Create the database tables (~1 min)
- In the project: **SQL Editor → New query**.
- Open **`supabase/migrations/0001_init.sql`** from this repo, copy all of it, paste into the editor,
  and click **Run**. You should see "Success."

## 3. Copy your keys (~1 min)
- **Project Settings → API**.
- Copy the **Project URL** and the **anon public** key. (The anon key is meant to live in the
  browser; security comes from the row-level-security policies in the migration.)

## 4. Enable Google sign-in (~5 min)
- Supabase → **Authentication → Providers → Google** → toggle it on. It asks for a Client ID and
  Secret, which you make in Google:
  - **console.cloud.google.com** → create or pick a project.
  - **APIs & Services → Credentials → Create Credentials → OAuth client ID → Web application**.
  - Under **Authorized redirect URIs**, add the callback URL Supabase shows on that Google provider
    page (it looks like `https://<your-project-ref>.supabase.co/auth/v1/callback`).
  - Click **Create**, copy the **Client ID** and **Client Secret**, paste them into Supabase's
    Google provider, and **Save**.
- Supabase → **Authentication → URL Configuration**: set **Site URL** to
  `https://wardsandboards.com`, and add `http://localhost:5173` to the redirect allow-list (for
  local testing).

## 5. Add the keys to the live build (~2 min)
The production build reads the keys from GitHub Actions secrets.
- GitHub repo → **Settings → Secrets and variables → Actions → New repository secret**. Add two:
  - `VITE_SUPABASE_URL` = your Project URL
  - `VITE_SUPABASE_ANON_KEY` = your anon public key
- Then trigger a rebuild: **Actions tab → latest run → Re-run jobs** (or push any commit). The new
  build activates real Google sign-in.

## Local testing (optional)
Copy `.env.example` to `.env`, paste the same two values, and run `npm run dev`. The Google button
does a real login locally too.

## What works after this, and what's next
- ✅ "Continue with Google" is a real Google login; the user's name and email come from Google, and
  a `profiles` row is created automatically (see the SQL).
- ⏳ **Next increment (not yet wired):** moving per-user data — progress, ratings, contributions —
  onto these tables for true cross-device persistence. Right now the **identity** is real but that
  per-user data still lives in the browser. The database schema for it is already created by the
  migration; the app just needs to read/write it, which is the next step.

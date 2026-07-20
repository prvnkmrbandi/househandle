# House Handle — Full Project (Coalville)

This folder has everything: the real backend API and the real React
frontend. Two separate pieces, deployed separately, that talk to each
other over the internet.

```
house-handle/
├── backend/     → Node.js/Express API + database schema (deploys to Render)
└── frontend/    → React app, the customer booking flow (deploys to Vercel)
```

## The order to do this in (matches what we've been doing step by step)

1. **Supabase** — create a project, run `backend/schema.sql` in its SQL
   Editor. This creates your database. ✅ *(you've already done this)*
2. **GitHub** — create a repository and upload this whole `house-handle`
   folder to it (backend and frontend together, in one repo, is fine).
3. **Render** — create a Web Service from that GitHub repo, but set the
   **Root Directory** to `backend` (important — otherwise Render tries to
   run the whole repo as one project). Add your Supabase and Stripe keys
   as environment variables there (see `backend/.env.example`).
4. **Vercel** — create a new project from the *same* GitHub repo, but set
   its **Root Directory** to `frontend`. Add `VITE_API_URL` pointing at
   your live Render backend URL (see `frontend/.env.example`).
5. Once both are live, open your Vercel URL — you should see the real
   House Handle app, loading real services from your real database.

## Why one repo, two root directories?

Render and Vercel both let you point at a *subfolder* of a repository
rather than the whole thing. This means you don't need two separate
GitHub repos — just tell each platform which folder is theirs during
setup (`backend` for Render, `frontend` for Vercel).

## What to do if something doesn't connect

- **Frontend loads but jobs never appear / spinner forever** → check
  `VITE_API_URL` in Vercel's environment variables is your actual Render
  URL, and that the Render service shows "Live" (not sleeping/crashed).
- **Backend won't start on Render** → check the Root Directory is set to
  `backend`, and that all four environment variables from
  `backend/.env.example` are filled in.
- **"CORS error" in the browser console** → the backend already has CORS
  enabled for all origins in `server.js`, so this usually means the
  frontend is pointing at the wrong URL, not a real CORS problem.

## What's still missing before this is a real, live business tool
See `backend/README.md` and `frontend/README.md` for the honest list —
mainly: authentication, real distance-based pro matching, and the pro
app / admin dashboard still need building in React the same way the
customer app was (this package only covers the customer side).

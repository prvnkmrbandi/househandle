# House Handle — Public Website (househandle.co.uk)

This is the public marketing site — separate from the customer/pro app.
Its job is to explain the business and collect waitlist sign-ups before
launch. The waitlist form is real: submitting it saves a genuine row to
your Supabase database via the same backend as the app.

## What's included
- `src/App.jsx` — the entire site: hero, how it works, services, and the
  waitlist form
- `src/api.js` — the one real network call this site makes: `POST /waitlist`
- `src/styles.css` — same design system as the app (Fraunces + IBM Plex,
  the paper/green/stamp look)

## Setup
```
cd house-handle-website
npm install
cp .env.example .env      # point VITE_API_URL at your backend
npm run dev
```
Then open http://localhost:5174

**The backend must already be running** (the same one from `../backend`,
deployed on Render) — this site uses the exact same API as the app, just
one endpoint of it (`/waitlist`).

## Deploying it for real, on your actual domain
1. Push this folder to GitHub, in the same repo as `backend` and `frontend`.
2. Go to vercel.com → **New Project** → import the repository (or, if the
   repo's already imported for the app, click **"Add New Project"** again
   and import it a second time — each root directory becomes its own
   Vercel project).
3. Set **Root Directory** to `website`.
4. Add environment variable `VITE_API_URL` = your live Render backend URL.
5. Deploy — Vercel gives you a `.vercel.app` URL first.
6. **Connect your real domain:** in this Vercel project's Settings →
   Domains, add `househandle.co.uk` (and `www.househandle.co.uk`).
   Vercel will show you DNS records (usually an A record and a CNAME) to
   add at wherever you bought the domain (GoDaddy, based on your browser
   tabs from earlier — their DNS settings page is where these go).
7. DNS changes can take anywhere from a few minutes to a few hours to
   take effect.

## Why this is a separate project from the app
The website (househandle.co.uk) and the app (the one customers/pros use
to actually book and manage jobs) are different audiences with different
purposes — a visitor doesn't need the booking app's login screen just to
read about the business and join a waitlist. Keeping them as separate
Vercel projects means:
- The marketing site can go live on your real domain immediately
- The app can live on a subdomain later (e.g. `app.househandle.co.uk`)
  or stay on its `.vercel.app` address during testing, without conflicting

## What's deliberately left out
- No admin view of waitlist sign-ups yet — check them directly in
  Supabase → Table Editor → `waitlist` table for now.
- No email confirmation sent when someone joins — just saved silently.
  Adding real "you're on the list" emails would need an email service
  (e.g. Resend or Postmark) wired into the backend's `/waitlist` route.

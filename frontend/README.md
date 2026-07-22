# House Handle — Frontend (React)

A real, working React app (built with Vite) covering the customer booking
flow: Home → pick a job → address → time slot → accept terms → pay →
confirmed → track/cancel → rate. It talks to the real backend in
`../backend` via `fetch()` — nothing here is faked.

## What's included
- `src/pages/` — one file per screen, plus `src/pages/auth/` for Sign Up and Log In
- `src/context/AuthContext.jsx` — tracks the logged-in customer using real
  Supabase Auth (sign up, log in, log out, session persistence)
- `src/context/BookingContext.jsx` — holds the booking-in-progress, and now
  pulls the real logged-in customer's ID automatically (no more placeholder)
- `src/components/RequireAuth.jsx` — sends anyone not logged in to `/login`
  before they can reach the booking flow
- `src/api.js` — every call to the backend goes through here
- `src/styles.css` — the House Handle look (Fraunces + IBM Plex, the
  paper/green/stamp colour palette used throughout the design)

## Setup
```
cd house-handle-frontend
npm install
cp .env.example .env      # fill in VITE_API_URL, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
npm run dev
```
Then open http://localhost:5173

**Important:** the backend must be running (locally or on Render) for
anything beyond the loading spinner on Home to work — this app has no
fallback fake data, it's built to talk to the real API from the start.

**For login/sign-up to work**, `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
must be set — get these from Supabase → Settings → API Keys. Use the
**Publishable key** (safe for the browser), never the secret key.

## How sign-up actually works
1. Customer fills in the Sign Up form → this creates a real account in
   Supabase Auth (handles password hashing, sessions, etc. for you)
2. The frontend then calls `POST /customers` on your backend, creating a
   matching row in the `customers` table, using the **same ID** as the
   Auth account
3. From then on, every booking, every page, uses that real ID — so each
   customer only ever sees their own bookings and profile, not anyone else's

## Deploying it for real
1. Push this folder to GitHub (same way as the backend).
2. Go to vercel.com → New Project → import the repository.
3. Set the **Root Directory** to `frontend` (since this sits alongside
   `backend` in the same repo).
4. Add environment variables: `VITE_API_URL`, `VITE_SUPABASE_URL`,
   `VITE_SUPABASE_ANON_KEY`.
5. Deploy. Vercel gives you a URL immediately; connect your real domain
   (househandle.co.uk) afterwards in Vercel's project settings.

## The admin page — how access actually works now
`/admin` uses a **real, server-verified login** — not a password hidden
in the browser. It works like this:
1. You log in with a real email/password (a genuine Supabase Auth account)
2. The frontend sends that login's access token to the backend with every
   admin request
3. The backend checks the token is valid *and* that the account is
   listed in the `admins` table — only then does it allow the request

**To create your first admin account**, see the setup steps in
`backend/MIGRATION-excluded-pro-ids.md`. In short: sign up for an account
(same as a customer would), then manually add a row to the `admins`
table in Supabase with that account's user ID.

## What's deliberately left out (a developer will need to add)
- The **pro app doesn't have login yet** — it still uses a placeholder ID
  in `ProContext.jsx`. The same pattern used for customers (AuthContext +
  RequireAuth) can be reused for pros.
- Password reset / forgot password flow
- Email verification enforcement (Supabase can require this — currently
  off by default so testing is easier)
- Real-time slot availability — the time slots on the booking screen are
  hardcoded for now; a real `/availability` endpoint would replace them.
- Admin dashboard — not built in React yet.

# House Handle — Frontend (React)

A real, working React app (built with Vite) covering the customer booking
flow: Home → pick a job → address → time slot → accept terms → pay →
confirmed → track/cancel → rate. It talks to the real backend in
`../backend` via `fetch()` — nothing here is faked.

## What's included
- `src/pages/` — one file per screen
- `src/context/BookingContext.jsx` — holds the booking-in-progress as you
  move between screens (service picked, address, slot, etc.)
- `src/api.js` — every call to the backend goes through here
- `src/styles.css` — the House Handle look (Fraunces + IBM Plex, the
  paper/green/stamp colour palette used throughout the design)

## Setup
```
cd house-handle-frontend
npm install
cp .env.example .env      # point VITE_API_URL at your backend
npm run dev
```
Then open http://localhost:5173

**Important:** the backend must be running (locally or on Render) for
anything beyond the loading spinner on Home to work — this app has no
fallback fake data, it's built to talk to the real API from the start.

## Deploying it for real
1. Push this folder to GitHub (same way as the backend).
2. Go to vercel.com → New Project → import the repository.
3. Set the **Root Directory** to `frontend` (since this sits alongside
   `backend` in the same repo).
4. Add an environment variable: `VITE_API_URL` = your live Render backend URL.
5. Deploy. Vercel gives you a URL immediately; connect your real domain
   (househandle.co.uk) afterwards in Vercel's project settings.

## What's deliberately left out (same as the backend)
- Login/authentication — `customerId` is currently a hardcoded placeholder
  in `BookingContext.jsx`. Real login needs to replace that.
- The pro-facing app and admin dashboard — this package only covers the
  customer side. The same pattern (pages + context + api.js) can be
  reused to build those next.
- Real-time slot availability — the time slots on the booking screen are
  hardcoded for now; a real `/availability` endpoint would replace them.

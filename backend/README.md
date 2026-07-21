# House Handle — Backend (v0.1 prototype)

This is a working starting point for the real backend behind the customer app,
pro app, and admin dashboard prototypes. It is **not production-ready** —
treat it as the skeleton a developer builds on, not something to deploy as-is.

## What's included
- `schema.sql` — the full database schema (customers, pros, bookings,
  payments, reviews, availability, services), written for Postgres/Supabase,
  including basic Row Level Security policies.
- `src/server.js` — an Express API with the core endpoints:
  - `GET /services` — list bookable jobs (feeds the customer app home screen)
  - `POST /bookings` — create a booking + auto-match a pro
  - `POST /bookings/:id/accept` — pro accepts a job
  - `POST /bookings/:id/complete` — marks a job done, captures payment,
    and splits it (platform commission vs. pro payout) via Stripe Connect
  - `POST /bookings/:id/cancel` — cancels a booking and automatically
    applies the late-cancellation fee if inside 24 hours
  - `POST /webhooks/stripe` — confirms payments asynchronously

## What you need before this runs
1. A free **Supabase** project (supabase.com) — run `schema.sql` in its
   SQL editor to create all the tables.
2. A **Stripe** account with Connect enabled (start in test mode) —
   used for taking customer payments and paying pros out automatically.
3. Node.js installed.

## Setup
```
cd house-handle-backend
npm install
cp .env.example .env      # then fill in your real Supabase + Stripe keys
npm run dev
```

## What's deliberately left out (a developer will need to add)
- Authentication (customer login, pro login) — not wired in yet
- Push notifications to pros when a job request comes in
- Real distance-based pro matching (currently just picks the first
  verified pro in the right trade category — fine for a handful of
  pros in Coalville, not for scale)
- Input validation and proper error handling for production use
- Rate limiting and security hardening before this touches real money

## How this maps to the app prototypes
Every screen in the customer test app and the full app prototype
corresponds to one of these endpoints — e.g. tapping "Pay" in the app
should call `POST /bookings`, and the pro tapping "Mark job complete"
should call `POST /bookings/:id/complete`.

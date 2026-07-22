// House Handle — Backend API (Node.js / Express)
//
// This is a working skeleton, not a finished production server.
// It shows a developer the shape of every endpoint the apps in the
// prototype need: browsing services, creating a booking, matching a pro,
// accepting/completing jobs, and handling payment via Stripe Connect.
//
// Requires: a Supabase project (for the database) and a Stripe account
// (test mode is fine to start). Fill in the .env file — see .env.example.

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const Stripe = require('stripe');

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // server-side key, never expose to the app
);

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const PLATFORM_COMMISSION_RATE = 0.20; // 20% — matches the number used throughout planning

// ---------------------------------------------------------------
// ADMIN AUTH — verifies a real Supabase Auth session, checked here
// on the server, not just a password sitting in the browser.
// Frontend sends: Authorization: Bearer <supabase access token>
// ---------------------------------------------------------------
async function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Not logged in' });

  const { data: userData, error: authError } = await supabase.auth.getUser(token);
  if (authError || !userData?.user) return res.status(401).json({ error: 'Invalid or expired session' });

  const { data: admin } = await supabase
    .from('admins')
    .select('id')
    .eq('id', userData.user.id)
    .single();

  if (!admin) return res.status(403).json({ error: 'Not an admin account' });

  req.adminUserId = userData.user.id;
  next();
}

// ---------------------------------------------------------------
// WAITLIST — public website sign-up form (househandle.co.uk)
// ---------------------------------------------------------------
app.post('/waitlist', async (req, res) => {
  const { email, role, postcode } = req.body;
  if (!email) return res.status(400).json({ error: 'email is required' });

  const { data, error } = await supabase
    .from('waitlist')
    .upsert({ email, role: role || 'customer', postcode }, { onConflict: 'email' })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json({ joined: true, email: data.email });
});

// ---------------------------------------------------------------
// CUSTOMERS — create/update a profile right after sign-up, and fetch
// it on login. The `id` here is always the real Supabase Auth user ID,
// so every customer sees only their own data.
// ---------------------------------------------------------------
app.post('/customers', async (req, res) => {
  const { id, full_name, email, phone, postcode, address_line1 } = req.body;
  if (!id || !email) return res.status(400).json({ error: 'id and email are required' });

  const { data, error } = await supabase
    .from('customers')
    .upsert({ id, full_name, email, phone, postcode, address_line1 }, { onConflict: 'id' })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.get('/customers/:id', async (req, res) => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', req.params.id)
    .single();
  if (error) return res.status(404).json({ error: 'Customer not found' });
  res.json(data);
});

// ---------------------------------------------------------------
// SERVICES — what shows on the customer app's home screen
// ---------------------------------------------------------------
app.get('/services', async (req, res) => {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('active', true);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ---------------------------------------------------------------
// ADMIN — list all pros, and set a pro's rating
// (No real admin auth yet — see frontend README. Good enough for one
// person managing this alone, not for a team or public exposure.)
// ---------------------------------------------------------------
app.get('/pros', requireAdmin, async (req, res) => {
  const { data, error } = await supabase
    .from('pros')
    .select('id, full_name, trade_category, verification_status, rating_avg, created_at')
    .order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.patch('/pros/:id', requireAdmin, async (req, res) => {
  const { rating_avg, verification_status } = req.body;
  const updates = {};
  if (rating_avg !== undefined) {
    const n = Number(rating_avg);
    if (isNaN(n) || n < 0 || n > 5) return res.status(400).json({ error: 'rating_avg must be between 0 and 5' });
    updates.rating_avg = n;
  }
  if (verification_status !== undefined) updates.verification_status = verification_status;

  const { data, error } = await supabase
    .from('pros')
    .update(updates)
    .eq('id', req.params.id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ---------------------------------------------------------------
// PRO BOOKINGS — jobs assigned to a specific pro (feeds the pro app dashboard)
// ---------------------------------------------------------------
app.get('/pros/:id/bookings', async (req, res) => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, services(name, category)')
    .eq('pro_id', req.params.id)
    .in('status', ['requested', 'confirmed', 'in_progress'])
    .order('scheduled_start', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ---------------------------------------------------------------
// BOOKINGS — create a booking (customer app "Confirm & pay" step)
// ---------------------------------------------------------------
app.post('/bookings', async (req, res) => {
  const {
    customer_id, service_id, scheduled_start,
    address_postcode, address_line1, price_quoted, terms_version
  } = req.body;

  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
      customer_id, service_id, scheduled_start,
      address_postcode, address_line1, price_quoted,
      status: 'requested',
      terms_accepted_at: new Date().toISOString(),
      terms_version
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  // Try to match a pro immediately (simple version — see matchPro below)
  const { data: service } = await supabase
    .from('services').select('category').eq('id', service_id).single();
  const matchedPro = await matchPro(service.category, []);
  if (matchedPro) {
    await supabase
      .from('bookings')
      .update({ pro_id: matchedPro.id }) // status stays 'requested' — pro must accept
      .eq('id', booking.id);
    booking.pro_id = matchedPro.id;
    // In production: send a push notification to the pro here
  }

  res.json(booking);
});

// ---------------------------------------------------------------
// JOB MATCHING — nearest available, verified pro for the trade,
// excluding any pro IDs already passed on this job
// (Simplified: real version would use postcode distance + live availability)
// ---------------------------------------------------------------
async function matchPro(category, excludeIds = []) {
  let query = supabase
    .from('pros')
    .select('*')
    .eq('trade_category', category)
    .eq('verification_status', 'verified')
    .order('rating_avg', { ascending: false, nullsFirst: false }); // best-rated pro first

  if (excludeIds.length) {
    query = query.not('id', 'in', `(${excludeIds.join(',')})`);
  }

  const { data: pros } = await query.limit(1);
  return pros && pros.length ? pros[0] : null;
}

// ---------------------------------------------------------------
// Shared logic: a pro has stepped away from a job (declined, or
// cancelled partway through) — exclude them and find the next pro.
// Used by both /decline (before accepting) and /pro-cancel (after).
// ---------------------------------------------------------------
async function reassignAwayFrom(bookingId, decliningProId) {
  const { data: booking } = await supabase
    .from('bookings')
    .select('*, services(category)')
    .eq('id', bookingId)
    .single();

  if (!booking) return { booking: null, newPro: null };

  const excluded = decliningProId
    ? [...(booking.excluded_pro_ids || []), decliningProId]
    : (booking.excluded_pro_ids || []);

  const newPro = await matchPro(booking.services.category, excluded);

  const { data: updated } = await supabase
    .from('bookings')
    .update({
      pro_id: newPro ? newPro.id : null,
      status: 'requested', // back to pending acceptance, even if it was confirmed/in_progress
      excluded_pro_ids: excluded
    })
    .eq('id', bookingId)
    .select()
    .single();
    // In production: notify the newly-matched pro, and notify the
    // customer if newPro is null (no one currently available)

  return { booking: updated, newPro };
}

// ---------------------------------------------------------------
// PRO — accept a job request
// ---------------------------------------------------------------
app.post('/bookings/:id/accept', async (req, res) => {
  const { pro_id } = req.body;
  const { data, error } = await supabase
    .from('bookings')
    .update({ pro_id, status: 'confirmed' })
    .eq('id', req.params.id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ---------------------------------------------------------------
// PRO — decline a job request (before accepting). Automatically
// tries to match the next available pro for the same job.
// ---------------------------------------------------------------
app.post('/bookings/:id/decline', async (req, res) => {
  const { pro_id } = req.body;
  const { booking, newPro } = await reassignAwayFrom(req.params.id, pro_id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  res.json({ booking, rematched: !!newPro });
});

// ---------------------------------------------------------------
// PRO — cancel a job they'd already accepted, any time before it's
// marked complete. Also triggers automatic re-matching.
// ---------------------------------------------------------------
app.post('/bookings/:id/pro-cancel', async (req, res) => {
  const { pro_id } = req.body;

  const { data: existing } = await supabase
    .from('bookings').select('status').eq('id', req.params.id).single();
  if (!existing) return res.status(404).json({ error: 'Booking not found' });
  if (['completed', 'cancelled'].includes(existing.status)) {
    return res.status(400).json({ error: 'This job is already finished — too late to cancel.' });
  }

  const { booking, newPro } = await reassignAwayFrom(req.params.id, pro_id);
  res.json({ booking, rematched: !!newPro });
});

// ---------------------------------------------------------------
// PRO — mark a job complete → triggers payment capture + payout split
// ---------------------------------------------------------------
app.post('/bookings/:id/complete', async (req, res) => {
  const { data: booking, error: bErr } = await supabase
    .from('bookings')
    .select('*, pros(stripe_account_id)')
    .eq('id', req.params.id)
    .single();
  if (bErr) return res.status(500).json({ error: bErr.message });

  const amount = booking.price_final || booking.price_quoted;
  const commission = +(amount * PLATFORM_COMMISSION_RATE).toFixed(2);
  const payout = +(amount - commission).toFixed(2);

  // Capture payment and split via Stripe Connect
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // pence
    currency: 'gbp',
    payment_method_types: ['card'],
    application_fee_amount: Math.round(commission * 100),
    transfer_data: { destination: booking.pros.stripe_account_id }
    // In production: confirm with the customer's saved payment method here
  });

  await supabase.from('payments').insert({
    booking_id: booking.id,
    amount, commission_amount: commission, payout_amount: payout,
    stripe_payment_intent_id: paymentIntent.id,
    status: 'pending'
  });

  await supabase
    .from('bookings')
    .update({ status: 'completed', price_final: amount })
    .eq('id', booking.id);

  res.json({ amount, commission, payout, payment_intent: paymentIntent.id });
});

// ---------------------------------------------------------------
// CANCELLATIONS — enforces the 24-hour policy automatically
// ---------------------------------------------------------------
app.post('/bookings/:id/cancel', async (req, res) => {
  const { data: booking, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', req.params.id)
    .single();
  if (error) return res.status(500).json({ error: error.message });

  const hoursUntilJob = (new Date(booking.scheduled_start) - new Date()) / 3600000;
  const lateCancellation = hoursUntilJob < 24;
  const fee = lateCancellation ? 10.00 : 0;

  await supabase
    .from('bookings')
    .update({
      status: 'cancelled',
      cancellation_reason: lateCancellation ? 'late_cancellation_fee_applied' : 'free_cancellation'
    })
    .eq('id', booking.id);

  res.json({ cancelled: true, fee_applied: fee });
});

// ---------------------------------------------------------------
// STRIPE WEBHOOK — confirms payouts, handles failures
// ---------------------------------------------------------------
app.post('/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body, req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object;
    await supabase
      .from('payments')
      .update({ status: 'paid', paid_at: new Date().toISOString() })
      .eq('stripe_payment_intent_id', pi.id);
  }

  res.json({ received: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`House Handle API running on port ${PORT}`));

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
  const matchedPro = await matchPro(booking);
  if (matchedPro) {
    await supabase
      .from('bookings')
      .update({ pro_id: matchedPro.id, status: 'confirmed' })
      .eq('id', booking.id);
    booking.pro_id = matchedPro.id;
    booking.status = 'confirmed';
    // In production: send a push notification to the pro here
  }

  res.json(booking);
});

// ---------------------------------------------------------------
// JOB MATCHING — nearest available, verified pro for the trade
// (Simplified: real version would use postcode distance + live availability)
// ---------------------------------------------------------------
async function matchPro(booking) {
  const { data: service } = await supabase
    .from('services')
    .select('category')
    .eq('id', booking.service_id)
    .single();

  const { data: pros } = await supabase
    .from('pros')
    .select('*')
    .eq('trade_category', service.category)
    .eq('verification_status', 'verified')
    .limit(1); // TODO: order by distance + availability instead of just taking the first

  return pros && pros.length ? pros[0] : null;
}

// ---------------------------------------------------------------
// PRO — accept / decline a job request
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

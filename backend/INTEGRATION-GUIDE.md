# Connecting the House Handle prototype to the real backend

This shows exactly what changes when the HTML prototype stops faking
things and starts talking to the real API in `house-handle-backend`.

---

## 1. The core change: `fetch()` instead of local JavaScript

**Before (prototype — fake, nothing saved):**
```javascript
function completePay(){
  bookingHistory.unshift({job:current.job, slot:current.slot, price:current.price, status:'Upcoming'});
  go('confirmed');
}
```
This just edits an in-memory list. Closing the page loses everything.

**After (connected to the real backend):**
```javascript
async function completePay(){
  const btn = document.getElementById('pay-btn');
  btn.classList.add('loading');
  btn.innerHTML = '<span class="spinner"></span>Processing…';

  try {
    const response = await fetch('https://api.househandle.co.uk/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_id: currentCustomerId,       // from login/session
        service_id: current.serviceId,
        scheduled_start: current.slotISO,
        address_postcode: document.getElementById('in-postcode').value,
        address_line1: document.getElementById('in-address').value,
        price_quoted: current.price,
        terms_version: 'v1.0'
      })
    });

    if (!response.ok) throw new Error('Booking failed');
    const booking = await response.json();   // the real saved booking, with an id

    currentBookingId = booking.id;
    go('confirmed');
  } catch (err) {
    alert('Something went wrong — please try again.');
  } finally {
    btn.classList.remove('loading');
    btn.innerHTML = 'Pay <span id="pay-amt"></span>';
  }
}
```

The shape is always the same: **call the API → wait for the real answer → update the screen based on what actually happened**, instead of assuming success.

---

## 2. Every prototype action maps to a real endpoint

| What the app does | Old (fake) | New (real) |
|---|---|---|
| Load "Common jobs" on Home | Hardcoded `job-grid` HTML | `fetch('/services')` on page load, build the cards from the response |
| Confirm & pay | Pushes to a local array | `fetch('/bookings', {method:'POST'})` |
| Pro accepts a job | `pTab2('p-active')` | `fetch('/bookings/:id/accept', {method:'POST'})` |
| Pro marks complete | Shows a static earnings breakdown | `fetch('/bookings/:id/complete', {method:'POST'})` — the *real* commission split comes back in the response, not a hardcoded number |
| Cancel booking | Hardcoded £10 fee shown | `fetch('/bookings/:id/cancel', {method:'POST'})` — backend calculates the fee based on the *actual* time left, not a guess |

---

## 3. What needs to exist before this works

1. **Backend deployed somewhere reachable** — not running on a developer's laptop. Options: Railway, Render, Fly.io — all have free/cheap tiers good enough for Coalville-scale traffic.
2. **CORS enabled** — already included in `server.js` (the `cors` package) so the browser is allowed to call the API from a different domain.
3. **HTTPS** — browsers block real payment flows over plain HTTP. Any of the hosts above give you HTTPS automatically.
4. **A real base URL** — replace every `https://api.househandle.co.uk/...` placeholder above with wherever the backend actually ends up running (e.g. `https://house-handle-api.up.railway.app` while testing).

---

## 4. The piece still missing: authentication

Right now, nothing identifies *which* customer or pro is making a request —
`currentCustomerId` in the example above doesn't exist yet. Before this
goes properly live, you need a login system (Supabase Auth is the natural
fit alongside the database already in use) so:
- a customer can only see their own bookings
- a pro can only accept/complete jobs assigned to them

This is genuinely a developer task — worth budgeting for as part of the
build, not something to skip.

---

## 5. Suggested order for a developer to do this work

1. Deploy the backend (Section 3) and confirm `GET /services` works from a browser.
2. Add authentication (Section 4).
3. Replace one flow at a time in the HTML prototype, starting with the
   simplest (loading services on Home), then booking creation, then the
   pro-side actions, then payments last (since it's the highest-stakes
   part to get right).
4. Test each flow end-to-end with Stripe in test mode before switching
   to live keys.

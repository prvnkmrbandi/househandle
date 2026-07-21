import { useState } from 'react';
import { joinWaitlist } from './api.js';

export default function App() {
  return (
    <div>
      <Nav />
      <Hero />
      <TrustStrip />
      <HowItWorks />
      <Services />
      <WaitlistSection />
      <Footer />
    </div>
  );
}

function Nav() {
  const appUrl = import.meta.env.VITE_APP_URL || '#';
  return (
    <nav>
      <div className="wrap">
        <div className="logo">House Handle<span className="dot">.</span></div>
        <div className="nav-links">
          <a href="#services">Services</a>
          <a href="#how">How it works</a>
        </div>
        <div style={{display:'flex', gap:10}}>
          <a href="#join" className="btn">Join the waitlist</a>
          <a href={appUrl} className="btn btn-solid">Book now</a>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  const appUrl = import.meta.env.VITE_APP_URL || '#';
  return (
    <header className="hero">
      <div className="wrap hero-grid">
        <div>
          <span className="eyebrow">Coalville — now booking</span>
          <h1>Home jobs, <em>fixed price</em>,<br />booked in minutes.</h1>
          <p className="lede">
            Plumbing, gardening, cleaning and repairs from vetted local pros.
            See the price before you book. No call-around, no surprise invoice.
          </p>
          <div className="hero-ctas">
            <a href={appUrl} className="btn btn-solid">Book a job now</a>
            <a href="#how" className="btn">See how it works</a>
          </div>
          <div className="hero-note">NO QUOTE HAGGLING &nbsp;·&nbsp; DBS-CHECKED PROS &nbsp;·&nbsp; PAY IN-APP</div>
        </div>

        <div className="ticket-stage">
          <div className="ticket">
            <div className="ticket-top">
              <div className="tk">JOB TICKET №0417</div>
              <div className="tk">TODAY, 2:00PM</div>
            </div>
            <h3>Leaking tap, kitchen</h3>
            <div className="sub">LE67 — Coalville</div>
            <div className="ticket-row"><span>Call-out &amp; diagnosis</span><span>£0</span></div>
            <div className="ticket-row"><span>Washer replacement</span><span>£38</span></div>
            <div className="ticket-row"><span>Parts</span><span>£7</span></div>
            <div className="ticket-foot">
              <span className="total-label">Fixed total</span>
              <span className="total">£45</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function TrustStrip() {
  return (
    <div className="trust">
      <div className="wrap">
        <div className="trust-item">✓ DBS &amp; ID-checked professionals</div>
        <div className="trust-item">✓ Gas Safe registered for gas work</div>
        <div className="trust-item">✓ Public liability insured</div>
        <div className="trust-item">✓ Re-do it free if it's not right</div>
      </div>
    </div>
  );
}

function HowItWorks() {
  return (
    <section id="how">
      <div className="wrap">
        <div className="sec-head">
          <span className="eyebrow">How it works</span>
          <h2>Three steps, no phone tag.</h2>
          <p>Most booking sites make you post a job and wait for calls. We skip that — pick the job, see the price, pick a pro.</p>
        </div>
        <div className="steps">
          <div className="step">
            <div className="num">01</div>
            <h3>Choose the job</h3>
            <p>Tell us what's wrong or what you need doing. Common jobs show a fixed price straight away.</p>
          </div>
          <div className="step">
            <div className="num">02</div>
            <h3>Pick a slot</h3>
            <p>Same-day and next-day slots, shown by what's actually free nearby.</p>
          </div>
          <div className="step">
            <div className="num">03</div>
            <h3>Pro turns up, job's done</h3>
            <p>Vetted, insured, rated. Pay in the app when it's finished.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

const SERVICES = [
  { name: 'Plumbing', desc: 'Leaks, blockages, taps, toilets and small installs from Gas Safe & WaterSafe pros.', price: 45 },
  { name: 'Gardening', desc: 'Mowing, hedge trims, tidy-ups and one-off overgrown garden rescues.', price: 35 },
  { name: 'Cleaning', desc: 'Regular home cleans, end-of-tenancy and one-off deep cleans.', price: 28 },
  { name: 'Handyman', desc: "Flat-pack, shelving, curtain rails, TV mounting — the odd-jobs list, sorted.", price: 30 }
];

function Services() {
  return (
    <section id="services" style={{background:'var(--paper-2)', borderTop:'1px solid var(--line)', borderBottom:'1px solid var(--line)'}}>
      <div className="wrap">
        <div className="sec-head">
          <span className="eyebrow">Services at launch</span>
          <h2>Common jobs, priced upfront.</h2>
        </div>
        <div className="services-grid">
          {SERVICES.map((s) => (
            <div className="svc-card" key={s.name}>
              <h3>{s.name}</h3>
              <div className="desc">{s.desc}</div>
              <div className="price-row"><span className="tk">From</span><span className="amt">£{s.price}</span></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WaitlistSection() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('customer');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('loading');
    setError(null);
    try {
      await joinWaitlist({ email, role, postcode: 'LE67' });
      setStatus('success');
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  }

  return (
    <section id="join">
      <div className="wrap">
        <div className="cta">
          <div>
            <h2>Be first through the door.</h2>
            <p>Join the waitlist for early access in Coalville, or register interest as a founding tradesperson.</p>
          </div>
          <div>
            {status === 'success' ? (
              <div className="cta-success">
                You're on the list — we'll email you when House Handle launches near you.
              </div>
            ) : (
              <form className="cta-form" onSubmit={handleSubmit}>
                <input
                  type="email"
                  placeholder="you@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="customer">I need a job done</option>
                  <option value="pro">I'm a tradesperson</option>
                </select>
                <button className="btn btn-solid" type="submit" disabled={status === 'loading'}>
                  {status === 'loading' ? 'Joining…' : 'Join waitlist'}
                </button>
              </form>
            )}
            {status === 'error' && <div className="cta-error">{error}</div>}
            <div className="cta-note">NO SPAM. ONE EMAIL WHEN WE LAUNCH NEAR YOU.</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer>
      <div className="wrap">
        <div className="logo" style={{fontSize:17}}>House Handle<span className="dot">.</span></div>
        <div className="fine">© 2026 HOUSE HANDLE LTD · COALVILLE, UK · househandle.co.uk</div>
      </div>
    </footer>
  );
}

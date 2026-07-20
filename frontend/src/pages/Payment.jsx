import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useBooking } from '../context/BookingContext.jsx';

export default function Payment() {
  const { currentService, address, slot, customerId, setBooking, history, setHistory } = useBooking();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  if (!currentService || !slot) {
    navigate('/');
    return null;
  }

  async function pay() {
    setLoading(true);
    setError(null);
    try {
      const result = await api.createBooking({
        customer_id: customerId,
        service_id: currentService.id,
        scheduled_start: slot.iso,
        address_postcode: address.postcode,
        address_line1: address.line1,
        price_quoted: currentService.fixed_price,
        terms_version: 'v1.0'
      });

      setBooking(result);
      setHistory([{ ...result, service_name: currentService.name }, ...history]);
      navigate('/confirmed');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="screen">
      <button className="btn-back" onClick={() => navigate('/review')}>← Back</button>
      <div className="s-h1">Payment</div>
      <div className="s-sub">Held now, charged once the job's complete</div>

      <div className="pay-card">
        <div className="pay-dots">•••• •••• •••• 4242</div>
        <div className="s-sub" style={{margin:0}}>Visa, exp 09/28 — via Stripe (test mode)</div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <button className="btn-app" disabled={loading} onClick={pay}>
        {loading ? 'Processing…' : `Pay £${Number(currentService.fixed_price).toFixed(2)}`}
      </button>
    </div>
  );
}

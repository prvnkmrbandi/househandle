import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useBooking } from '../context/BookingContext.jsx';

export default function Cancel() {
  const { booking } = useBooking();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  if (!booking) {
    navigate('/');
    return null;
  }

  async function confirmCancel() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.cancelBooking(booking.id);
      setResult(res); // { cancelled: true, fee_applied: 10 or 0 }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <div className="screen">
        <div className="stamp-big">
          <div className="stamp-circ" style={{borderColor:'var(--stamp)', color:'var(--stamp)'}}>
            {result.fee_applied > 0 ? 'Refunded' : 'Cancelled'}
          </div>
        </div>
        <div className="s-h1" style={{textAlign:'center'}}>Booking cancelled</div>
        <div className="s-sub" style={{textAlign:'center'}}>
          {result.fee_applied > 0
            ? `£${result.fee_applied.toFixed(2)} late-cancellation fee applied`
            : 'Free cancellation — no fee applied'}
        </div>
        <button className="btn-app" onClick={() => navigate('/')}>Back to home</button>
      </div>
    );
  }

  return (
    <div className="screen">
      <button className="btn-back" onClick={() => navigate('/confirmed')}>← Back</button>
      <div className="s-h1">Cancel booking?</div>
      <div className="s-sub">
        The backend checks your actual slot time against now — if you're inside 24 hours,
        a late-cancellation fee applies automatically.
      </div>

      {error && <div className="error-banner">{error}</div>}

      <button className="btn-app danger" disabled={loading} onClick={confirmCancel}>
        {loading ? 'Cancelling…' : 'Confirm cancellation'}
      </button>
      <button className="btn-app ghost" onClick={() => navigate('/confirmed')}>Keep booking</button>
    </div>
  );
}

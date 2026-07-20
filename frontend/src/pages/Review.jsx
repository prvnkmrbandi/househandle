import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext.jsx';
import MiniTicket from '../components/MiniTicket.jsx';

export default function Review() {
  const { currentService, address, slot } = useBooking();
  const [agreed, setAgreed] = useState(false);
  const navigate = useNavigate();

  if (!currentService || !slot) {
    navigate('/');
    return null;
  }

  return (
    <div className="screen">
      <button className="btn-back" onClick={() => navigate('/slot')}>← Back</button>
      <div className="s-h1">Review & confirm</div>

      <MiniTicket
        rows={[
          { label: 'Job', value: currentService.name },
          { label: 'Slot', value: slot.label },
          { label: 'Address', value: address.postcode }
        ]}
        total={{ label: 'Total', value: `£${Number(currentService.fixed_price).toFixed(2)}` }}
      />

      <label className="agree-row">
        <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
        <span>I accept the Customer Terms of Service, including the 24-hour cancellation policy</span>
      </label>

      <button className="btn-app" disabled={!agreed} onClick={() => navigate('/pay')}>
        Confirm & pay
      </button>
    </div>
  );
}

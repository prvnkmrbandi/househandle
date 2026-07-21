import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext.jsx';

export default function Address() {
  const { address, setAddress } = useBooking();
  const navigate = useNavigate();

  return (
    <div className="screen">
      <button className="btn-back" onClick={() => navigate('/service')}>← Back</button>
      <div className="s-h1">Where's the job?</div>
      <div className="s-sub">We'll match a pro nearby</div>

      <label className="field-label">Postcode</label>
      <input
        className="field-input"
        value={address.postcode}
        onChange={(e) => setAddress({ ...address, postcode: e.target.value })}
      />

      <label className="field-label">Address line</label>
      <input
        className="field-input"
        value={address.line1}
        onChange={(e) => setAddress({ ...address, line1: e.target.value })}
      />

      <div className="photo-box">📷 Add a photo (optional) — helps the pro come prepared</div>
      <button className="btn-app" onClick={() => navigate('/slot')}>Continue</button>
    </div>
  );
}

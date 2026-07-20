import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext.jsx';

// In production these come from GET /availability, filtered by postcode + trade.
// Hardcoded here since that endpoint isn't built yet (see backend README "what's left out").
const SLOTS = [
  { label: 'Today, 2:00pm', iso: () => { const d = new Date(); d.setHours(14,0,0,0); return d.toISOString(); } },
  { label: 'Today, 4:30pm', iso: () => { const d = new Date(); d.setHours(16,30,0,0); return d.toISOString(); } },
  { label: 'Tomorrow, 9:00am', iso: () => { const d = new Date(); d.setDate(d.getDate()+1); d.setHours(9,0,0,0); return d.toISOString(); } }
];

export default function SlotPicker() {
  const { slot, setSlot } = useBooking();
  const navigate = useNavigate();

  function pick(s) {
    setSlot({ label: s.label, iso: s.iso() });
  }

  return (
    <div className="screen">
      <button className="btn-back" onClick={() => navigate('/address')}>← Back</button>
      <div className="s-h1">Pick a time</div>
      <div className="s-sub">Real slots from pros near LE67</div>

      <div className="slot-list">
        {SLOTS.map((s) => (
          <div
            key={s.label}
            className={'slot-item' + (slot?.label === s.label ? ' selected' : '')}
            onClick={() => pick(s)}
          >
            <span>{s.label.split(',')[0]}</span>
            <span>{s.label.split(',')[1]}</span>
          </div>
        ))}
      </div>

      <button className="btn-app" disabled={!slot} onClick={() => navigate('/review')}>Continue</button>
    </div>
  );
}

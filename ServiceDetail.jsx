import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext.jsx';
import MiniTicket from '../components/MiniTicket.jsx';

export default function ServiceDetail() {
  const { currentService } = useBooking();
  const navigate = useNavigate();

  if (!currentService) {
    navigate('/');
    return null;
  }

  const price = Number(currentService.fixed_price);

  return (
    <div className="screen">
      <button className="btn-back" onClick={() => navigate('/')}>← Back</button>
      <div className="s-h1">{currentService.name}</div>
      <div className="s-sub">{currentService.category}</div>

      <MiniTicket
        rows={[
          { label: 'Call-out & diagnosis', value: '£0' },
          { label: 'Fix / part replacement', value: `£${(price - 7).toFixed(2)}` },
          { label: 'Parts', value: '£7.00' }
        ]}
        total={{ label: 'Fixed total', value: `£${price.toFixed(2)}` }}
      />

      <div className="s-sub" style={{lineHeight:1.5}}>
        Includes a Gas Safe / DBS-checked pro, all standard parts, and a 30-day fix guarantee.
      </div>
      <button className="btn-app" onClick={() => navigate('/address')}>Book this job</button>
    </div>
  );
}

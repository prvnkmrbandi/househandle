import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext.jsx';

export default function Confirmed() {
  const { booking, slot } = useBooking();
  const navigate = useNavigate();

  if (!booking) {
    navigate('/');
    return null;
  }

  return (
    <div className="screen">
      <div className="stamp-big"><div className="stamp-circ">Booked</div></div>
      <div className="s-h1" style={{textAlign:'center'}}>You're booked in</div>
      <div className="s-sub" style={{textAlign:'center'}}>{slot?.label}</div>

      <div className="pro-line">
        <div className="pro-avatar"></div>
        <div>
          <div style={{fontSize:14, fontWeight:600}}>
            {booking.pro_id ? 'Pro matched — awaiting acceptance' : 'Matching a pro…'}
          </div>
          <div className="s-sub" style={{margin:0}}>
            {booking.pro_id ? "We'll notify you once they accept" : "We'll notify you once matched"}
          </div>
        </div>
      </div>

      <button className="btn-app" onClick={() => navigate('/track')}>Track this job</button>
      <button className="btn-app danger" onClick={() => navigate('/cancel')}>Cancel this booking</button>
    </div>
  );
}

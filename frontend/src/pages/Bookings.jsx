import { useBooking } from '../context/BookingContext.jsx';
import MiniTicket from '../components/MiniTicket.jsx';
import BottomTabs from '../components/BottomTabs.jsx';

export default function Bookings() {
  const { history } = useBooking();

  return (
    <>
      <div className="screen">
        <div className="s-h1">My bookings</div>
        <div className="s-sub">
          {history.length ? `${history.length} booking(s) this session` : 'No bookings yet'}
        </div>

        {history.map((b) => (
          <MiniTicket
            key={b.id}
            rows={[
              { label: b.service_name, value: b.status },
              { label: new Date(b.scheduled_start).toLocaleString('en-GB'), value: `£${b.price_quoted}` }
            ]}
          />
        ))}
      </div>
      <BottomTabs />
    </>
  );
}

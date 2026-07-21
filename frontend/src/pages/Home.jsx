import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useBooking } from '../context/BookingContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const ICONS = { plumbing: '🚰', gardening: '🌿', cleaning: '🧽', handyman: '🔧' };

export default function Home() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { setCurrentService } = useBooking();
  const { profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.getServices()
      .then(setServices)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function pick(service) {
    setCurrentService(service);
    navigate('/service');
  }

  const firstName = profile?.full_name?.split(' ')[0] || 'there';

  return (
    <div className="screen">
      <div className="s-h1">Hi, {firstName} 👋</div>
      <div className="s-sub">{profile?.postcode || 'Coalville'}</div>
      <div className="search-bar">🔍 What needs doing?</div>
      <div className="s-sub" style={{fontWeight:600, color:'var(--ink)'}}>Common jobs</div>

      {loading && <div className="loading">Loading services…</div>}
      {error && (
        <div className="error-banner">
          Couldn't reach the backend ({error}). Check VITE_API_URL in your .env file
          and make sure the backend is running.
        </div>
      )}

      {!loading && !error && (
        <div className="job-grid">
          {services.map((s) => (
            <div className="job-card" key={s.id} onClick={() => pick(s)}>
              <div className="jc-icon">{ICONS[s.category] || '🛠️'}</div>
              <div className="jc-name">{s.name}</div>
              <div className="jc-price">From £{s.fixed_price}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Login() {
  const { logIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await logIn({ email, password });
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="screen">
      <div className="s-h1">Welcome back</div>
      <div className="s-sub">Log in to see your bookings</div>

      <form onSubmit={handleSubmit}>
        <label className="field-label">Email</label>
        <input className="field-input" type="email" required value={email}
          onChange={(e) => setEmail(e.target.value)} />

        <label className="field-label">Password</label>
        <input className="field-input" type="password" required value={password}
          onChange={(e) => setPassword(e.target.value)} />

        {error && <div className="error-banner">{error}</div>}

        <button className="btn-app" type="submit" disabled={loading}>
          {loading ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      <div className="s-sub" style={{textAlign:'center', marginTop:16}}>
        New here? <Link to="/signup" style={{color:'var(--green)', fontWeight:600}}>Create an account</Link>
      </div>
    </div>
  );
}

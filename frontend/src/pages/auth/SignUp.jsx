import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export default function SignUp() {
  const { signUp } = useAuth();
  const [form, setForm] = useState({
    fullName: '', email: '', password: '', phone: '', postcode: '', addressLine1: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  function update(field, value) {
    setForm({ ...form, [field]: value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signUp(form);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="screen">
      <div className="s-h1">Create your account</div>
      <div className="s-sub">Takes a minute — then you can book real jobs</div>

      <form onSubmit={handleSubmit}>
        <label className="field-label">Full name</label>
        <input className="field-input" required value={form.fullName}
          onChange={(e) => update('fullName', e.target.value)} />

        <label className="field-label">Email</label>
        <input className="field-input" type="email" required value={form.email}
          onChange={(e) => update('email', e.target.value)} />

        <label className="field-label">Password</label>
        <input className="field-input" type="password" required minLength={6} value={form.password}
          onChange={(e) => update('password', e.target.value)} />

        <label className="field-label">Phone</label>
        <input className="field-input" value={form.phone}
          onChange={(e) => update('phone', e.target.value)} />

        <label className="field-label">Postcode</label>
        <input className="field-input" value={form.postcode}
          onChange={(e) => update('postcode', e.target.value)} />

        <label className="field-label">Address line</label>
        <input className="field-input" value={form.addressLine1}
          onChange={(e) => update('addressLine1', e.target.value)} />

        {error && <div className="error-banner">{error}</div>}

        <button className="btn-app" type="submit" disabled={loading}>
          {loading ? 'Creating account…' : 'Sign up'}
        </button>
      </form>

      <div className="s-sub" style={{textAlign:'center', marginTop:16}}>
        Already have an account? <Link to="/login" style={{color:'var(--green)', fontWeight:600}}>Log in</Link>
      </div>
    </div>
  );
}

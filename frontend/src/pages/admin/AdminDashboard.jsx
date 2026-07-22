import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient.js';
import { api } from '../../api.js';

export default function AdminDashboard() {
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_e, newSession) => {
      setSession(newSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  if (checking) return <div className="loading">Loading…</div>;
  if (!session) return <AdminLogin />;
  return <ProsTable token={session.access_token} />;
}

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setLoading(false);
  }

  return (
    <div style={{maxWidth:360, margin:'80px auto', padding:'0 20px'}}>
      <div className="s-h1">Admin login</div>
      <div className="s-sub">
        Not linked anywhere publicly. Logging in here uses a real account —
        see the setup note in backend/MIGRATION-excluded-pro-ids.md for how
        to create one.
      </div>
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
    </div>
  );
}

function ProsTable({ token }) {
  const [pros, setPros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [drafts, setDrafts] = useState({}); // { [proId]: ratingString }

  function load() {
    setLoading(true);
    api.getAllPros(token)
      .then((data) => {
        setPros(data);
        const d = {};
        data.forEach((p) => { d[p.id] = p.rating_avg ?? ''; });
        setDrafts(d);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, [token]);

  async function saveRating(proId) {
    setSavingId(proId);
    try {
      await api.updatePro(proId, { rating_avg: drafts[proId] }, token);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingId(null);
    }
  }

  async function toggleVerified(pro) {
    setSavingId(pro.id);
    try {
      await api.updatePro(pro.id, {
        verification_status: pro.verification_status === 'verified' ? 'pending' : 'verified'
      }, token);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingId(null);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  return (
    <div style={{maxWidth:900, margin:'40px auto', padding:'0 20px'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div className="s-h1">Pros</div>
        <button className="btn" onClick={handleLogout}>Log out</button>
      </div>
      <div className="s-sub">
        Set a pro's rating here — the booking system automatically offers jobs to the
        highest-rated available pro first. Verified pros only ever get matched.
      </div>

      {loading && <div className="loading">Loading…</div>}
      {error && <div className="error-banner">{error}</div>}

      {!loading && (
        <table style={{width:'100%', borderCollapse:'collapse', fontSize:14}}>
          <thead>
            <tr style={{textAlign:'left', borderBottom:'1.5px solid var(--ink)'}}>
              <th style={{padding:'10px 8px'}}>Name</th>
              <th style={{padding:'10px 8px'}}>Trade</th>
              <th style={{padding:'10px 8px'}}>Verified</th>
              <th style={{padding:'10px 8px'}}>Rating (0–5)</th>
              <th style={{padding:'10px 8px'}}></th>
            </tr>
          </thead>
          <tbody>
            {pros.map((p) => (
              <tr key={p.id} style={{borderBottom:'1px solid var(--line)'}}>
                <td style={{padding:'10px 8px'}}>{p.full_name}</td>
                <td style={{padding:'10px 8px'}}>{p.trade_category}</td>
                <td style={{padding:'10px 8px'}}>
                  <button
                    className="btn"
                    style={{padding:'4px 10px', fontSize:11}}
                    disabled={savingId === p.id}
                    onClick={() => toggleVerified(p)}
                  >
                    {p.verification_status}
                  </button>
                </td>
                <td style={{padding:'10px 8px'}}>
                  <input
                    type="number" min="0" max="5" step="0.1"
                    style={{width:70, padding:'6px 8px', border:'1px solid var(--line)', borderRadius:4}}
                    value={drafts[p.id]}
                    onChange={(e) => setDrafts({ ...drafts, [p.id]: e.target.value })}
                  />
                </td>
                <td style={{padding:'10px 8px'}}>
                  <button
                    className="btn btn-solid"
                    style={{padding:'6px 14px', fontSize:11}}
                    disabled={savingId === p.id}
                    onClick={() => saveRating(p.id)}
                  >
                    {savingId === p.id ? 'Saving…' : 'Save'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!loading && pros.length === 0 && <div className="s-sub">No pros yet.</div>}
    </div>
  );
}

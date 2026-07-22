import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api.js';
import { usePro } from '../../context/ProContext.jsx';
import ProBottomTabs from '../../components/ProBottomTabs.jsx';

export default function ProDashboard() {
  const { proId, available, setAvailable } = usePro();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const navigate = useNavigate();

  function reload() {
    setLoading(true);
    api.getProBookings(proId)
      .then(setJobs)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(reload, [proId]);

  async function accept(jobId) {
    setActionError(null);
    try {
      await api.acceptBooking(jobId, proId);
      reload();
    } catch (err) {
      setActionError(err.message);
    }
  }

  async function decline(jobId) {
    setActionError(null);
    try {
      const res = await api.declineBooking(jobId, proId);
      reload();
      if (!res.rematched) {
        setActionError('Declined — no other verified pro is available for this job right now.');
      }
    } catch (err) {
      setActionError(err.message);
    }
  }

  const requests = jobs.filter((j) => j.status === 'requested');
  const confirmed = jobs.filter((j) => j.status !== 'requested');

  return (
    <>
      <div className="screen">
        <div className="s-h1">Morning, Dave</div>
        <div className="s-sub">Coalville &amp; 8mi radius</div>

        <div className="mini-ticket" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <span style={{fontSize:13.5, fontWeight:600}}>Available for jobs</span>
          <button
            onClick={() => setAvailable(!available)}
            style={{
              width:38, height:22, borderRadius:12, border:'none', position:'relative', cursor:'pointer',
              background: available ? 'var(--green)' : 'var(--line)'
            }}
          >
            <span style={{
              position:'absolute', top:2, left: available ? 18 : 2, width:18, height:18,
              background:'#fff', borderRadius:'50%', transition:'left .15s'
            }}></span>
          </button>
        </div>

        {loading && <div className="loading">Loading jobs…</div>}
        {error && (
          <div className="error-banner">
            Couldn't reach the backend ({error}). Make sure DEMO_PRO_ID in
            ProContext.jsx is a real, verified pro ID from your `pros` table.
          </div>
        )}
        {actionError && <div className="error-banner">{actionError}</div>}

        {!loading && !error && requests.length > 0 && (
          <>
            <div className="s-sub" style={{fontWeight:600, color:'var(--stamp)'}}>
              New requests — needs your response
            </div>
            {requests.map((job) => (
              <div className="mini-ticket" key={job.id} style={{borderColor:'var(--stamp)'}}>
                <div className="mt-row">
                  <span>{job.services?.name || 'Job'}</span>
                  <span>£{job.price_quoted}</span>
                </div>
                <div className="mt-row">
                  <span>{new Date(job.scheduled_start).toLocaleString('en-GB')}</span>
                  <span>{job.address_postcode}</span>
                </div>
                <div style={{display:'flex', gap:8, marginTop:10}}>
                  <button className="btn-app" style={{marginTop:0, flex:1}} onClick={() => accept(job.id)}>
                    Accept
                  </button>
                  <button className="btn-app ghost" style={{marginTop:0, flex:1}} onClick={() => decline(job.id)}>
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </>
        )}

        <div className="s-sub" style={{fontWeight:600, color:'var(--ink)', marginTop: requests.length ? 24 : 0}}>
          Today's jobs
        </div>

        {!loading && !error && confirmed.length === 0 && (
          <div className="s-sub">No confirmed jobs yet.</div>
        )}

        {!loading && confirmed.map((job) => (
          <div className="mini-ticket" key={job.id} onClick={() => navigate(`/pro/job/${job.id}`)} style={{cursor:'pointer'}}>
            <div className="mt-row">
              <span>{job.services?.name || 'Job'}</span>
              <span>£{job.price_quoted}</span>
            </div>
            <div className="mt-row">
              <span>{new Date(job.scheduled_start).toLocaleString('en-GB')}</span>
              <span style={{color:'var(--green)', fontWeight:600}}>{job.status}</span>
            </div>
          </div>
        ))}
      </div>
      <ProBottomTabs />
    </>
  );
}

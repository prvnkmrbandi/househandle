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
  const navigate = useNavigate();

  useEffect(() => {
    api.getProBookings(proId)
      .then(setJobs)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [proId]);

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

        <div className="s-sub" style={{fontWeight:600, color:'var(--ink)'}}>Today's jobs</div>

        {loading && <div className="loading">Loading jobs…</div>}
        {error && (
          <div className="error-banner">
            Couldn't reach the backend ({error}). Make sure DEMO_PRO_ID in
            ProContext.jsx is a real pro ID from your `pros` table.
          </div>
        )}

        {!loading && !error && jobs.length === 0 && (
          <div className="s-sub">No jobs assigned right now.</div>
        )}

        {!loading && jobs.map((job) => (
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

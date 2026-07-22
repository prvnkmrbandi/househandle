import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../api.js';
import { usePro } from '../../context/ProContext.jsx';

export default function ActiveJob() {
  const { id } = useParams();
  const { proId, lastEarnings, setLastEarnings } = usePro();
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  async function complete() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.completeBooking(id);
      // res = { amount, commission, payout, payment_intent }
      setResult(res);
      setLastEarnings([res, ...lastEarnings]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function cancelJob() {
    setCancelling(true);
    setError(null);
    try {
      await api.proCancelBooking(id, proId);
      navigate('/pro');
    } catch (err) {
      setError(err.message);
      setCancelling(false);
    }
  }

  if (result) {
    return (
      <div className="screen">
        <div className="stamp-big"><div className="stamp-circ">Paid</div></div>
        <div className="s-h1" style={{textAlign:'center'}}>Job complete</div>
        <div className="mini-ticket" style={{marginTop:16}}>
          <div className="mt-row"><span>Job total</span><span>£{result.amount.toFixed(2)}</span></div>
          <div className="mt-row"><span>Platform commission</span><span>-£{result.commission.toFixed(2)}</span></div>
          <div className="mt-total"><span>You receive</span><span>£{result.payout.toFixed(2)}</span></div>
        </div>
        <button className="btn-app" onClick={() => navigate('/pro')}>Back to dashboard</button>
      </div>
    );
  }

  return (
    <div className="screen">
      <button className="btn-back" onClick={() => navigate('/pro')}>← Back</button>
      <div className="s-h1">Job in progress</div>
      <div className="s-sub">Marking this complete captures payment and pays you automatically</div>

      {error && <div className="error-banner">{error}</div>}

      <button className="btn-app" disabled={loading || cancelling} onClick={complete}>
        {loading ? 'Processing…' : 'Mark job complete'}
      </button>

      <button className="btn-app danger" disabled={loading || cancelling} onClick={cancelJob}>
        {cancelling ? 'Cancelling…' : "Can't do this job"}
      </button>
      <div className="s-sub" style={{marginTop:4}}>
        This immediately looks for another available pro for the customer.
      </div>
    </div>
  );
}

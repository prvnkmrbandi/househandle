import { usePro } from '../../context/ProContext.jsx';
import ProBottomTabs from '../../components/ProBottomTabs.jsx';

export default function ProEarnings() {
  const { lastEarnings } = usePro();
  const total = lastEarnings.reduce((sum, e) => sum + e.payout, 0);

  return (
    <>
      <div className="screen">
        <div className="s-h1">Earnings</div>
        <div className="s-sub">This session (resets on refresh — a real earnings history needs a backend endpoint that isn't built yet)</div>

        <div className="mini-ticket">
          <div className="mt-total" style={{borderTop:'none', paddingTop:0, marginTop:0}}>
            <span>Total this session</span><span>£{total.toFixed(2)}</span>
          </div>
        </div>

        {lastEarnings.length === 0 && <div className="s-sub">No completed jobs yet this session.</div>}

        {lastEarnings.map((e, i) => (
          <div className="mini-ticket" key={i}>
            <div className="mt-row"><span>Job total</span><span>£{e.amount.toFixed(2)}</span></div>
            <div className="mt-row"><span>Commission</span><span>-£{e.commission.toFixed(2)}</span></div>
            <div className="mt-total"><span>Payout</span><span>£{e.payout.toFixed(2)}</span></div>
          </div>
        ))}
      </div>
      <ProBottomTabs />
    </>
  );
}

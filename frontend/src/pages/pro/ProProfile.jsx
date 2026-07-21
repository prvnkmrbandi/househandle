import ProBottomTabs from '../../components/ProBottomTabs.jsx';

export default function ProProfile() {
  return (
    <>
      <div className="screen">
        <div className="s-h1">Profile</div>
        <label className="field-label">Name</label>
        <input className="field-input" defaultValue="Dave M." readOnly />
        <label className="field-label">Trade</label>
        <input className="field-input" defaultValue="Plumbing — Gas Safe reg. 998231" readOnly />
        <label className="field-label">Verification</label>
        <input className="field-input" defaultValue="✓ Verified" readOnly />
        <button className="btn-app ghost">Bank account</button>
        <button className="btn-app ghost">Partner Agreement</button>
      </div>
      <ProBottomTabs />
    </>
  );
}

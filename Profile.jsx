import BottomTabs from '../components/BottomTabs.jsx';

export default function Profile() {
  return (
    <>
      <div className="screen">
        <div className="s-h1">Profile</div>
        <label className="field-label">Name</label>
        <input className="field-input" defaultValue="Sam Whitfield" readOnly />
        <label className="field-label">Email</label>
        <input className="field-input" defaultValue="sam.w@email.com" readOnly />
        <label className="field-label">Address</label>
        <input className="field-input" defaultValue="14 Belvoir Road, Coalville" readOnly />
        <button className="btn-app ghost">Payment methods</button>
        <button className="btn-app ghost">Terms & policies</button>
      </div>
      <BottomTabs />
    </>
  );
}

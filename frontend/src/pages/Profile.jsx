import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import BottomTabs from '../components/BottomTabs.jsx';

export default function Profile() {
  const { profile, user, logOut } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logOut();
    navigate('/login');
  }

  return (
    <>
      <div className="screen">
        <div className="s-h1">Profile</div>
        <label className="field-label">Name</label>
        <input className="field-input" value={profile?.full_name || ''} readOnly />
        <label className="field-label">Email</label>
        <input className="field-input" value={user?.email || ''} readOnly />
        <label className="field-label">Address</label>
        <input className="field-input" value={profile?.address_line1 || ''} readOnly />
        <label className="field-label">Postcode</label>
        <input className="field-input" value={profile?.postcode || ''} readOnly />

        <button className="btn-app ghost">Payment methods</button>
        <button className="btn-app ghost">Terms & policies</button>
        <button className="btn-app danger" onClick={handleLogout}>Log out</button>
      </div>
      <BottomTabs />
    </>
  );
}

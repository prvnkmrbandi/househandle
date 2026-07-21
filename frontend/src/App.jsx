import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home.jsx';
import ServiceDetail from './pages/ServiceDetail.jsx';
import Address from './pages/Address.jsx';
import SlotPicker from './pages/SlotPicker.jsx';
import Review from './pages/Review.jsx';
import Payment from './pages/Payment.jsx';
import Confirmed from './pages/Confirmed.jsx';
import Cancel from './pages/Cancel.jsx';
import Tracking from './pages/Tracking.jsx';
import Rate from './pages/Rate.jsx';
import Bookings from './pages/Bookings.jsx';
import Profile from './pages/Profile.jsx';
import BottomTabs from './components/BottomTabs.jsx';
import RequireAuth from './components/RequireAuth.jsx';
import Login from './pages/auth/Login.jsx';
import SignUp from './pages/auth/SignUp.jsx';
import ProDashboard from './pages/pro/ProDashboard.jsx';
import ActiveJob from './pages/pro/ActiveJob.jsx';
import ProEarnings from './pages/pro/ProEarnings.jsx';
import ProProfile from './pages/pro/ProProfile.jsx';

export default function App() {
  const location = useLocation();
  const isPro = location.pathname.startsWith('/pro');
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <div className="app">
      <div className="top">
        <Link to={isPro ? '/pro' : '/'} style={{textDecoration:'none', color:'inherit'}}>
          <div className="brand">House Handle<span>.</span></div>
        </Link>
        {!isAuthPage && (
          <Link
            to={isPro ? '/' : '/pro'}
            style={{fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:'#6b6759', textDecoration:'underline'}}
          >
            {isPro ? 'Customer app' : 'Pro app'}
          </Link>
        )}
      </div>

      <Routes>
        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Customer app — all require login */}
        <Route path="/" element={<RequireAuth><HomeWithTabs /></RequireAuth>} />
        <Route path="/service" element={<RequireAuth><ServiceDetail /></RequireAuth>} />
        <Route path="/address" element={<RequireAuth><Address /></RequireAuth>} />
        <Route path="/slot" element={<RequireAuth><SlotPicker /></RequireAuth>} />
        <Route path="/review" element={<RequireAuth><Review /></RequireAuth>} />
        <Route path="/pay" element={<RequireAuth><Payment /></RequireAuth>} />
        <Route path="/confirmed" element={<RequireAuth><Confirmed /></RequireAuth>} />
        <Route path="/cancel" element={<RequireAuth><Cancel /></RequireAuth>} />
        <Route path="/track" element={<RequireAuth><Tracking /></RequireAuth>} />
        <Route path="/rate" element={<RequireAuth><Rate /></RequireAuth>} />
        <Route path="/bookings" element={<RequireAuth><Bookings /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />

        {/* Pro app — not yet login-protected, see README */}
        <Route path="/pro" element={<ProDashboard />} />
        <Route path="/pro/job/:id" element={<ActiveJob />} />
        <Route path="/pro/earnings" element={<ProEarnings />} />
        <Route path="/pro/profile" element={<ProProfile />} />
      </Routes>
    </div>
  );
}

function HomeWithTabs() {
  return (
    <>
      <Home />
      <BottomTabs />
    </>
  );
}

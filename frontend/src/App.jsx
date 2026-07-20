import { Routes, Route, Link } from 'react-router-dom';
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

export default function App() {
  return (
    <div className="app">
      <div className="top">
        <Link to="/" style={{textDecoration:'none', color:'inherit'}}>
          <div className="brand">House Handle<span>.</span></div>
        </Link>
      </div>

      <Routes>
        <Route path="/" element={<HomeWithTabs />} />
        <Route path="/service" element={<ServiceDetail />} />
        <Route path="/address" element={<Address />} />
        <Route path="/slot" element={<SlotPicker />} />
        <Route path="/review" element={<Review />} />
        <Route path="/pay" element={<Payment />} />
        <Route path="/confirmed" element={<Confirmed />} />
        <Route path="/cancel" element={<Cancel />} />
        <Route path="/track" element={<Tracking />} />
        <Route path="/rate" element={<Rate />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/profile" element={<Profile />} />
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

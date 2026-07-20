import { NavLink } from 'react-router-dom';

export default function BottomTabs() {
  return (
    <div className="tabbar">
      <NavLink to="/" end className={({isActive}) => 'tabbar-btn' + (isActive ? ' active' : '')}>
        <span className="ic"></span>Home
      </NavLink>
      <NavLink to="/bookings" className={({isActive}) => 'tabbar-btn' + (isActive ? ' active' : '')}>
        <span className="ic"></span>Bookings
      </NavLink>
      <NavLink to="/profile" className={({isActive}) => 'tabbar-btn' + (isActive ? ' active' : '')}>
        <span className="ic"></span>Profile
      </NavLink>
    </div>
  );
}

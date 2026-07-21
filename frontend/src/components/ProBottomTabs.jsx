import { NavLink } from 'react-router-dom';

export default function ProBottomTabs() {
  return (
    <div className="tabbar">
      <NavLink to="/pro" end className={({isActive}) => 'tabbar-btn' + (isActive ? ' active' : '')}>
        <span className="ic"></span>Dashboard
      </NavLink>
      <NavLink to="/pro/earnings" className={({isActive}) => 'tabbar-btn' + (isActive ? ' active' : '')}>
        <span className="ic"></span>Earnings
      </NavLink>
      <NavLink to="/pro/profile" className={({isActive}) => 'tabbar-btn' + (isActive ? ' active' : '')}>
        <span className="ic"></span>Profile
      </NavLink>
    </div>
  );
}

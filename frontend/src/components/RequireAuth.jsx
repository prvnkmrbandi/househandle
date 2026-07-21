import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function RequireAuth({ children }) {
  const { isLoggedIn, loading } = useAuth();

  if (loading) return <div className="loading">Loading…</div>;
  if (!isLoggedIn) return <Navigate to="/login" replace />;

  return children;
}

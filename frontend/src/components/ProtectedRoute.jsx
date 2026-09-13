import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requireApproved = false, requireAdmin = false }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requireAdmin && user?.role !== 'admin') return <Navigate to="/" replace />;
  if (requireApproved && user?.role !== 'admin' && user?.status !== 'approved') {
    return <Navigate to="/pending" replace />;
  }

  return children;
}

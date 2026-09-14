import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requireApproved = false, requireAdmin = false }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return <div className="page">جارِ التحميل...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requireAdmin && user?.role !== 'admin') return <Navigate to="/" replace />;
  if (requireApproved && user?.role !== 'admin' && user?.status !== 'approved') {
    return <Navigate to="/pending" replace />;
  }

  return children;
}

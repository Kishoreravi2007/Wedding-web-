import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  adminOnly?: boolean;
}

export function ProtectedRoute({ children, requireAuth = true, adminOnly = false }: ProtectedRouteProps) {
  const { currentUser } = useAuth();

  if (requireAuth && !currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && currentUser?.email !== 'admin@wedding.com') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

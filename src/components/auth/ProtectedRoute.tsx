import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

// ========================
// PROTECTED ROUTE
// Redirects to /login if not authenticated
// ========================

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

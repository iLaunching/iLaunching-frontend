import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

// ========================
// PROTECTED ROUTE
// Redirects to /login if not authenticated
// Redirects to /onboarding if onboarding not completed (unless on onboarding page)
// ========================

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOnboarding?: boolean; // Set to false for onboarding page itself
}

export const ProtectedRoute = ({ children, requireOnboarding = true }: ProtectedRouteProps) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user needs onboarding (only if we require it and not already on onboarding page)
  if (requireOnboarding && user && location.pathname !== '/onboarding') {
    // Get user from localStorage to check onboarding status
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        // Redirect to onboarding if not completed
        if (userData.onboarding_completed === false) {
          return <Navigate to="/onboarding" replace />;
        }
      } catch (error) {
        console.error('Failed to parse user data:', error);
      }
    }
  }

  return <>{children}</>;
};

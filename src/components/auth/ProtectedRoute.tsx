import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useEffect, useState } from 'react';
import { authApi } from '@/api/auth';

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
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!requireOnboarding || location.pathname === '/onboarding') {
        setIsChecking(false);
        return;
      }

      try {
        // Fetch fresh user data from database
        const response = await authApi.getMe();
        const onboardingCompleted = response.user.onboarding_completed;
        
        // Update localStorage with fresh data
        localStorage.setItem('user', JSON.stringify(response.user));
        
        // Check if user needs onboarding
        if (onboardingCompleted === false) {
          setNeedsOnboarding(true);
        } else {
          setNeedsOnboarding(false);
        }
      } catch (error) {
        console.error('Failed to check onboarding status:', error);
        // If check fails, don't block access
        setNeedsOnboarding(false);
      } finally {
        setIsChecking(false);
      }
    };

    if (isAuthenticated) {
      checkOnboardingStatus();
    } else {
      setIsChecking(false);
    }
  }, [isAuthenticated, requireOnboarding, location.pathname]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Show loading while checking onboarding status
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Redirect to onboarding if needed
  if (needsOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

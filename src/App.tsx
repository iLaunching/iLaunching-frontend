import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { PublicRoute } from '@/components/auth/PublicRoute';
import { initializeLanguageDetection } from '@/i18n/languageDetection';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import SignupInterface from './pages/SignupInterface';
import SmartHub from './pages/SmartHub';
import Onboarding from './pages/Onboarding';
import EssentialInformation from './pages/EssentialInformation';
import Settings from './pages/Settings';
import General from './pages/settings/General';
import Member from './pages/settings/Member';
import Upgrade from './pages/settings/Upgrade';
import Members from './pages/settings/Members';
import Teams from './pages/settings/Teams';
import Matrix from './pages/settings/Matrix';
import Security from './pages/settings/Security';
import Trash from './pages/settings/Trash';
import MySettings from './pages/settings/MySettings';
import Membership from './pages/settings/Membership';
import Notifications from './pages/settings/Notifications';

// ========================
// REACT QUERY CLIENT
// ========================
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// ========================
// APP COMPONENT
// React Router + React Query + Auth Routes + Language Detection
// ========================
function App() {
  const { i18n } = useTranslation();
  
  // Initialize language detection on app load
  useEffect(() => {
    const initLanguage = async () => {
      await initializeLanguageDetection((lang: string) => {
        i18n.changeLanguage(lang);
      });
    };
    
    initLanguage();
  }, [i18n]);
  
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/signup-interface" element={<SignupInterface />} />
          <Route path="/essential-information" element={<EssentialInformation />} />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute requireOnboarding={false}>
                <Onboarding />
              </ProtectedRoute>
            }
          />
          <Route
            path="/smart-hub"
            element={
              <ProtectedRoute>
                <SmartHub />
              </ProtectedRoute>
            }
          >
            <Route path="settings" element={<Settings />}>
              <Route path="general" element={<General />} />
              <Route path="upgrade" element={<Upgrade />} />
              <Route path="members" element={<Members />} />
              <Route path="teams" element={<Teams />} />
              <Route path="matrix" element={<Matrix />} />
              <Route path="security" element={<Security />} />
              <Route path="trash" element={<Trash />} />
              <Route path="member" element={<Member />} />
              <Route path="my-settings" element={<MySettings />} />
              <Route path="membership" element={<Membership />} />
              <Route path="notifications" element={<Notifications />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;

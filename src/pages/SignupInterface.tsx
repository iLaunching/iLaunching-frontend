import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import BackgroundImage from '../components/BackgroundImage';
import Header from '@/components/layout/Header';

const SignupInterface = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);
  const [message, setMessage] = useState('Processing your authentication...');

  useEffect(() => {
    // Handle OAuth callback
    const oauthResult = authApi.handleOAuthCallback();
    
    if (oauthResult.success) {
      console.log('OAuth authentication successful:', {
        action: oauthResult.action,
        provider: oauthResult.provider
      });
      
      setMessage(`Authenticated with ${oauthResult.provider}. Loading your profile...`);
      
      // Fetch user info to confirm authentication
      authApi.getMe()
        .then(response => {
          console.log('User authenticated via OAuth:', response.user);
          console.log('🔍 Onboarding status:', response.user.onboarding_completed);
          console.log('🔍 Type:', typeof response.user.onboarding_completed);
          setIsProcessing(false);
          
          // Trigger workflow based on action type and provider
          if (oauthResult.action === 'signup') {
            // New user from OAuth signup
            console.log(`New user signup via ${oauthResult.provider} - checking onboarding status`);
            setMessage(`Welcome ${response.user.email}! Your account is ready.`);
            
            // Stay on signup-interface page, don't navigate away
            console.log('🔵 Staying on signup-interface for new signup');
            // User can manually proceed to onboarding from here
          } else if (oauthResult.action === 'login') {
            // Existing user login via OAuth
            console.log(`Existing user login via ${oauthResult.provider}`);
            setMessage(`Welcome back ${response.user.email}!`);
            
            setTimeout(() => {
              navigate('/dashboard');
            }, 1500);
          }
        })
        .catch(error => {
          console.error('Failed to fetch user info:', error);
          setIsProcessing(false);
          setMessage('Authentication succeeded but failed to load your profile. Please try again.');
        });
    } else if (oauthResult.error) {
      console.error('OAuth authentication failed:', oauthResult.error);
      setIsProcessing(false);
      setMessage(`Authentication failed: ${oauthResult.error}`);
    } else {
      // No OAuth callback detected - stay on page for manual handling
      console.log('No OAuth parameters detected in URL');
      setIsProcessing(false);
      setMessage('Waiting for authentication...');
    }
  }, [navigate]);

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Background Image */}
      <BackgroundImage 
        opacity={1}
        overlay={true}
        overlayColor="bg-black/60"
      />
      
      {/* Header */}
      <Header aiActive={false} className="relative z-20" hideLogo={true} textColor="text-white" />
      
      {/* Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white/95 rounded-2xl shadow-xl p-8 text-center">
        {isProcessing ? (
          <>
            <div className="mb-6">
              <div className="inline-block">
                <svg 
                  className="animate-spin h-12 w-12 text-blue-600" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24"
                >
                  <circle 
                    className="opacity-25" 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    stroke="currentColor" 
                    strokeWidth="4"
                  />
                  <path 
                    className="opacity-75" 
                    fill="currentColor" 
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              Authenticating...
            </h2>
            <p className="text-gray-600">
              {message}
            </p>
          </>
        ) : (
          <>
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                <svg 
                  className="w-8 h-8 text-green-600" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M5 13l4 4L19 7" 
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              Success!
            </h2>
            <p className="text-gray-600">
              {message}
            </p>
          </>
        )}
        </div>
      </div>
    </div>
  );
};

export default SignupInterface;

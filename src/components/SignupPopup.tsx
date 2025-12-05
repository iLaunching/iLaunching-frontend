import { X, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';

interface SignupPopupProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: AuthView;
  userName?: string;
}

type AuthView = 'main' | 'email' | 'work-email' | 'name' | 'password' | 'verify' | 'options';

const SignupPopup = ({ isOpen, onClose, initialView = 'main', userName = '' }: SignupPopupProps) => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<AuthView>(initialView);
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [userExists, setUserExists] = useState(false);
  const [accountType, setAccountType] = useState<'personal' | 'business'>('personal');
  
  // Update firstName whenever userName prop changes
  useEffect(() => {
    if (userName) {
      console.log('👤 Setting firstName from userName:', userName);
      setFirstName(userName);
    }
  }, [userName]);
  
  // Reset to initial view when popup opens
  useEffect(() => {
    if (isOpen) {
      setCurrentView(initialView);
    }
  }, [isOpen, initialView]);
  
  // Get API URL from environment
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  
  // Email validation
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  const isEmailValid = email.trim() !== '' && isValidEmail(email);
  const isPasswordValid = password.length >= 8;
  const isConfirmationValid = password === confirmPassword && isPasswordValid;

  // Handle Google OAuth login
  const handleGoogleLogin = () => {
    // Redirect to backend OAuth endpoint
    // API_URL already includes /api/v1
    const googleAuthUrl = `${API_URL}/auth/google/login?redirect_url=${encodeURIComponent(window.location.origin + '/signup-interface')}`;
    console.log('🔵 Google OAuth URL:', googleAuthUrl);
    console.log('🔵 Redirect will be:', window.location.origin + '/signup-interface');
    window.location.href = googleAuthUrl;
  };

  // Handle Facebook OAuth login
  const handleFacebookLogin = () => {
    // Redirect to backend OAuth endpoint
    const facebookAuthUrl = `${API_URL}/auth/facebook/login?redirect_url=${encodeURIComponent(window.location.origin + '/signup-interface')}`;
    window.location.href = facebookAuthUrl;
  };

  // Handle Microsoft OAuth login
  const handleMicrosoftLogin = () => {
    // Redirect to backend OAuth endpoint
    const microsoftAuthUrl = `${API_URL}/auth/microsoft/login?redirect_url=${encodeURIComponent(window.location.origin + '/signup-interface')}`;
    window.location.href = microsoftAuthUrl;
  };

  // Handle checking if email exists before moving to name or password
  const handleEmailContinue = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const result = await authApi.checkEmail(email);
      setUserExists(result.exists);
      console.log('📧 Email check result:', { exists: result.exists, email });
      // If user exists, go to password. If new user, go to name collection
      const nextView = result.exists ? 'password' : 'name';
      console.log('➡️ Moving to view:', nextView);
      setCurrentView(nextView);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to check email');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle login for existing users
  const handleLogin = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      await authApi.login(email, password);
      onClose();
      window.location.reload();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Incorrect password');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle name collection for new users
  const handleNameContinue = () => {
    setError('');
    
    if (!firstName.trim()) {
      setError('Please enter your first name');
      return;
    }
    
    if (!lastName.trim()) {
      setError('Please enter your last name');
      return;
    }
    
    // Names validated, move to password stage
    setCurrentView('password');
  };

  // Handle signup for new users - send verification code
  const handleSignupContinue = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Send verification code
      await authApi.sendVerificationCode(email);
      setCurrentView('verify');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send verification code');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle verification code submission
  const handleVerifyCode = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Verify the code
      await authApi.verifyCode(email, verificationCode);
      
      // Code verified, now create the account with first and last name and account type
      console.log('🔵 Creating account with:', { email, firstName, lastName, accountType });
      await authApi.signup(email, password, firstName, lastName, accountType);
      
      // Success! Close popup and use React Router navigation for smoother transition
      onClose();
      
      // Use React Router for smooth transition (no full page reload)
      navigate('/signup-interface?action=signup&provider=email');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resending verification code
  const handleResendCode = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      await authApi.sendVerificationCode(email);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to resend code');
    } finally {
      setIsLoading(false);
    }
  };

  // Add/remove body class when popup opens/closes
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('popup-open');
    } else {
      document.body.classList.remove('popup-open');
    }
    
    // Cleanup on unmount
    return () => {
      document.body.classList.remove('popup-open');
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes slideInFromLeft {
          from {
            transform: translateX(-100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slideInFromRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
      <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Frosted background with dark tint */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      />
      
      {/* Content container with close button */}
      <div className="relative z-10 flex items-start gap-4">
        {/* White content area */}
        <div 
          className="relative bg-white rounded-2xl shadow-2xl overflow-hidden flex"
          style={{
            maxWidth: '960px',
            width: '100%',
            maxHeight: '90vh',
            fontFamily: "'Work Sans', sans-serif"
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex-1 relative" style={{ minWidth: '380px', maxWidth: '440px', minHeight: '600px' }}>
          
          {/* Main View - Login/Signup Options */}
          {currentView === 'main' && (
            <div className="absolute inset-0">
            <>
              {/* Header */}
              <div className="px-8 pt-8 pb-6">
                <h2 className="text-2xl font-semibold text-black mb-5">
                  Log in or sign up in seconds
                </h2>
                <p className="text-gray-700">
                  Use your email or another service to continue with Ilaunching (its free)!
                </p>
              </div>

              {/* Auth Buttons */}
              <div className="px-8 pb-8">
                <div className="space-y-4">
                  {/* Continue with Google */}
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full flex items-center py-3 px-4 border border-gray-300 rounded-xl hover:bg-gray-100 transition-colors duration-50 relative"
                  >
                <svg className="w-5 h-5 absolute left-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                  <span className="text-sm font-medium text-gray-700 w-full text-center">Continue with Google</span>
                </button>

                {/* Continue with Facebook */}
                <button
                  type="button"
                  onClick={handleFacebookLogin}
                  className="w-full flex items-center py-3 px-4 border border-gray-300 rounded-xl hover:bg-gray-100 transition-colors duration-50 relative"
                >
                <svg className="w-5 h-5 absolute left-4" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                  <span className="text-sm font-medium text-gray-700 w-full text-center">Continue with Facebook</span>
                </button>

                {/* Continue with Email Button */}
                <button
                  type="button"
                  onClick={() => {
                    setAccountType('personal');
                    setCurrentView('email');
                  }}
                  className="w-full flex items-center py-3 px-4 border border-grey-300 rounded-xl hover:bg-gray-100 transition-colors duration-100 relative"
                >
                <svg className="w-5 h-5 absolute left-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
                  <span className="text-sm font-medium text-gray-700 w-full text-center">Continue with Email</span>
                </button>

                {/* Continue with Work Email Button */}
                <button
                  type="button"
                  onClick={() => {
                    setAccountType('business');
                    setCurrentView('work-email');
                  }}
                  className="w-full flex items-center py-3 px-4 border border-grey-300 rounded-xl hover:bg-gray-100 transition-colors duration-100 relative"
                >
                <svg className="w-5 h-5 absolute left-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/>
                </svg>
                  <span className="text-sm font-medium text-gray-700 w-full text-center">Continue with Work Email</span>
                </button>

                {/* Continue Another Way */}
                <button
                  type="button"
                  onClick={() => setCurrentView('options')}
                  className="w-full flex items-center justify-center py-3 px-4 rounded-xl hover:bg-gray-100 transition-colors duration-50 relative"
                >
                  <span className="text-sm font-medium text-gray-700">Continue Another Way</span>
                </button>
              </div>

            {/* Terms & Privacy */}
            <p className="mt-6 text-left text-xs text-gray-500">
              By continuing, you agree to our{' '}
              <a href="/essential-information#terms" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 font-medium">
                Terms of Use
              </a>
              {' '}read our{' '}
              <a href="/essential-information#privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 font-medium">
                Privacy Policy
              </a>
            </p>
          </div>
          </>
            </div>
          )}

          {/* Email View */}
          {currentView === 'email' && (
            <div
              className="absolute inset-0 animate-slideIn"
              style={{
                animation: 'slideInFromRight 0.3s ease-out forwards'
              }}
            >
              {/* Header with Back Button */}
              <div className="px-8 pt-8 pb-6">
                <div className="flex items-center gap-3 mb-5">
                  <button 
                    onClick={() => setCurrentView('main')} 
                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors duration-50"
                    type="button"
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-700" />
                  </button>
                  <h2 className="text-2xl font-semibold text-black">Continue with email</h2>
                </div>
                <p className="text-gray-700">
                  We'll check if you have an account, and help create one if you don't.
                </p>
              </div>

              {/* Email Input Form */}
              <div className="px-8 pb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email (personal or work)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-1 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="name@example.com"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && isEmailValid && !isLoading) {
                      handleEmailContinue();
                    }
                  }}
                />
                {error && (
                  <p className="text-red-500 text-sm mt-2">{error}</p>
                )}
                <button 
                  type="button"
                  disabled={!isEmailValid || isLoading}
                  className={`w-full mt-4 py-3 px-6 font-medium rounded-xl transition-colors duration-50 ${
                    isEmailValid && !isLoading
                      ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  onClick={handleEmailContinue}
                >
                  {isLoading ? 'Checking...' : 'Continue'}
                </button>
              </div>
            </div>
          )}

          {/* Work Email View */}
          {currentView === 'work-email' && (
            <div
              className="absolute inset-0 animate-slideIn"
              style={{
                animation: 'slideInFromRight 0.3s ease-out forwards'
              }}
            >
              {/* Header with Back Button */}
              <div className="px-8 pt-8 pb-6">
                <div className="flex items-center gap-3 mb-5">
                  <button 
                    onClick={() => setCurrentView('main')} 
                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors duration-50"
                    type="button"
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-700" />
                  </button>
                  <h2 className="text-2xl font-semibold text-black">Continue with your work email</h2>
                </div>
                <p className="text-gray-700">
                  Using your work email makes it easier to design together with your team.
                </p>
              </div>

              {/* Work Email Input Form */}
              <div className="px-8 pb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Work email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-1 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="name@company.com"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && isEmailValid && !isLoading) {
                      handleEmailContinue();
                    }
                  }}
                />
                {error && (
                  <p className="text-red-500 text-sm mt-2">{error}</p>
                )}
                <button 
                  type="button"
                  disabled={!isEmailValid || isLoading}
                  className={`w-full mt-4 py-3 px-6 font-medium rounded-xl transition-colors duration-50 ${
                    isEmailValid && !isLoading
                      ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  onClick={handleEmailContinue}
                >
                  {isLoading ? 'Checking...' : 'Continue'}
                </button>
              </div>
            </div>
          )}

          {/* Name View - Collect first and last name for new users */}
          {currentView === 'name' && (
            <div
              className="absolute inset-0 animate-slideIn"
              style={{
                animation: 'slideInFromRight 0.3s ease-out forwards'
              }}
              onAnimationStart={() => console.log('✅ Name view rendered. firstName:', firstName, 'lastName:', lastName)}
            >
              {/* Header with Back Button */}
              <div className="px-8 pt-8 pb-6">
                <div className="flex items-center gap-3 mb-5">
                  <button 
                    onClick={() => {
                      setCurrentView('email');
                      setError('');
                    }} 
                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors duration-50"
                    type="button"
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-700" />
                  </button>
                  <h2 className="text-2xl font-semibold text-black">What's your name?</h2>
                </div>
                <p className="text-gray-700">
                  This helps us personalize your experience.
                </p>
              </div>

              {/* Name Input Form */}
              <div className="px-8 pb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-1 focus:ring-blue-500 focus:border-transparent outline-none transition-all mb-4"
                  placeholder="John"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && firstName.trim() && lastName.trim()) {
                      handleNameContinue();
                    }
                  }}
                />

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-1 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Doe"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && firstName.trim() && lastName.trim()) {
                      handleNameContinue();
                    }
                  }}
                />
                {error && (
                  <p className="text-red-500 text-sm mt-2">{error}</p>
                )}
                <button 
                  type="button"
                  disabled={!firstName.trim() || !lastName.trim()}
                  className={`w-full mt-4 py-3 px-6 font-medium rounded-xl transition-colors duration-50 ${
                    firstName.trim() && lastName.trim()
                      ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  onClick={handleNameContinue}
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Password View */}
          {currentView === 'password' && (
            <div
              className="absolute inset-0 animate-slideIn"
              style={{
                animation: 'slideInFromRight 0.3s ease-out forwards'
              }}
            >
              {/* Header with Back Button */}
              <div className="px-8 pt-8 pb-6">
                <div className="flex items-center gap-3 mb-5">
                  <button 
                    onClick={() => {
                      // Go back to name for new users, email for existing users
                      setCurrentView(userExists ? 'email' : 'name');
                      setError('');
                      setPassword('');
                      setConfirmPassword('');
                    }} 
                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors duration-50"
                    type="button"
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-700" />
                  </button>
                  <h2 className="text-2xl font-semibold text-black">
                    {userExists ? 'Welcome back!' : 'Create your account'}
                  </h2>
                </div>
                <p className="text-gray-700 break-all">
                  {userExists ? `Log in with ${email}` : `Set up your account for ${email}`}
                </p>
              </div>

              {/* Password Input Form */}
              <div className="px-8 pb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {userExists ? 'Password' : 'Create a password'}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-1 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Password"
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      if (userExists && isPasswordValid) {
                        handleLogin();
                      } else if (!userExists && isConfirmationValid) {
                        handleSignupContinue();
                      }
                    }
                  }}
                />
                
                {/* Show confirm password section only for new signups */}
                {!userExists && (
                  <>
                    <hr className="my-4 border-gray-300" style={{ borderWidth: 2 }} />
                    <p className="text-xs text-gray-500 mb-4">Use 8 or more characters with a mix of letters, numbers & symbols.</p>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      confirm your password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-1 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      placeholder="Confirm Password"
                      onKeyDown={e => {
                        if (e.key === 'Enter' && isConfirmationValid) {
                          handleSignupContinue();
                        }
                      }}
                    />
                  </>
                )}
                
                {error && (
                  <p className="text-red-500 text-sm mt-2">{error}</p>
                )}
                <button
                  type="button"
                  disabled={(userExists ? !isPasswordValid : !isConfirmationValid) || isLoading}
                  onClick={userExists ? handleLogin : handleSignupContinue}
                  className={`w-full mt-4 py-3 px-6 font-medium rounded-xl transition-colors duration-50 ${
                    (userExists ? isPasswordValid : isConfirmationValid) && !isLoading
                      ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isLoading ? (userExists ? 'Logging in...' : 'Sending code...') : (userExists ? 'Log in' : 'Continue')}
                </button>
              </div>
            </div>
          )}

          {/* Verification Code View */}
          {currentView === 'verify' && (
            <div
              className="absolute inset-0 animate-slideIn"
              style={{
                animation: 'slideInFromRight 0.3s ease-out forwards'
              }}
            >
              {/* Header with Back Button */}
              <div className="px-8 pt-8 pb-6">
                <div className="flex items-center gap-3 mb-5">
                  <button 
                    onClick={() => setCurrentView('password')} 
                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors duration-50"
                    type="button"
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-700" />
                  </button>
                  <h2 className="text-2xl font-semibold text-black">Verify your email</h2>
                </div>
                <p className="text-gray-700 break-all">We sent a 6-digit code to {email}</p>
              </div>

              {/* Verification Code Input */}
              <div className="px-8 pb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter verification code
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={e => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setVerificationCode(value);
                  }}
                  maxLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-1 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-center text-2xl tracking-widest font-mono"
                  placeholder="000000"
                  onKeyDown={e => {
                    if (e.key === 'Enter' && verificationCode.length === 6) {
                      handleVerifyCode();
                    }
                  }}
                />
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Code expires in 10 minutes
                </p>
                
                {error && (
                  <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
                )}
                
                <button
                  type="button"
                  disabled={verificationCode.length !== 6 || isLoading}
                  onClick={handleVerifyCode}
                  className={`w-full mt-4 py-3 px-6 font-medium rounded-xl transition-colors duration-50 ${
                    verificationCode.length === 6 && !isLoading
                      ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isLoading ? 'Verifying...' : 'Verify and Create Account'}
                </button>
                
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isLoading}
                  className="w-full mt-3 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Resend code
                </button>
              </div>
            </div>
          )}

          {/* Options View */}
          {currentView === 'options' && (
            <div
              className="absolute inset-0 animate-slideIn"
              style={{
                animation: 'slideInFromRight 0.3s ease-out forwards'
              }}
            >
              {/* Header with Back Button */}
              <div className="px-8 pt-8 pb-6">
                <div className="flex items-center gap-3 mb-5">
                  <button 
                    onClick={() => setCurrentView('main')} 
                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors duration-50"
                    type="button"
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-700" />
                  </button>
                  <h2 className="text-2xl font-semibold text-black">Continue to iLaunching</h2>
                </div>
              </div>

              {/* Auth Options */}
              <div className="px-8 pb-8">
                <div className="space-y-3">
                  {/* Continue with Google */}
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full flex items-center py-3 px-4 border border-gray-300 rounded-xl hover:bg-gray-100 transition-colors duration-50 relative"
                  >
                    <svg className="w-5 h-5 absolute left-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="w-full text-center text-sm font-medium text-gray-700">Continue with Google</span>
                  </button>

                  {/* Continue with Facebook */}
                  <button
                    type="button"
                    onClick={handleFacebookLogin}
                    className="w-full flex items-center py-3 px-4 border border-gray-300 rounded-xl hover:bg-gray-100 transition-colors duration-50 relative"
                  >
                    <svg className="w-5 h-5 absolute left-4" fill="#1877F2" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span className="w-full text-center text-sm font-medium text-gray-700">Continue with Facebook</span>
                  </button>

                  {/* Continue with Microsoft */}
                  <button
                    type="button"
                    onClick={handleMicrosoftLogin}
                    className="w-full flex items-center py-3 px-4 border border-gray-300 rounded-xl hover:bg-gray-100 transition-colors duration-50 relative"
                  >
                    <svg className="w-5 h-5 absolute left-4" fill="#00A4EF" viewBox="0 0 24 24">
                      <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z"/>
                    </svg>
                    <span className="w-full text-center text-sm font-medium text-gray-700">Continue with Microsoft</span>
                  </button>

                  {/* Continue with Email */}
                  <button
                    type="button"
                    onClick={() => setCurrentView('email')}
                    className="w-full flex items-center py-3 px-4 border border-gray-300 rounded-xl hover:bg-gray-100 transition-colors duration-50 relative"
                  >
                    <svg className="w-5 h-5 absolute left-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                    </svg>
                    <span className="w-full text-center text-sm font-medium text-gray-700">Continue with Email</span>
                  </button>

                  {/* Continue with Work Email */}
                  <button
                    type="button"
                    onClick={() => setCurrentView('email')}
                    className="w-full flex items-center py-3 px-4 border border-gray-300 rounded-xl hover:bg-gray-100 transition-colors duration-50 relative"
                  >
                    <svg className="w-5 h-5 absolute left-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="w-full text-center text-sm font-medium text-gray-700">Continue with Work Email</span>
                  </button>
                </div>

                {/* Terms & Privacy */}
                <p className="mt-6 text-left text-xs text-gray-500">
                  By continuing, you agree to our{' '}
                  <a href="/essential-information#terms" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 font-medium">
                    Terms of Use
                  </a>
                  {' '}read our{' '}
                  <a href="/essential-information#privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 font-medium">
                    Privacy Policy
                  </a>
                </p>
              </div>
            </div>
          )}
          </div>

          {/* Image Section */}
          <div 
            className="hidden md:block flex-1 relative overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600"
            style={{ minWidth: '400px' }}
          >
            <img 
              src="/signup_poup1.png"
              alt="Welcome to iLaunching"
              className="absolute inset-0 w-full h-full object-cover"
              loading="eager"
              fetchPriority="high"
              decoding="sync"
              style={{ 
                imageRendering: 'crisp-edges',
                willChange: 'transform'
              }}
            />
          </div>
        </div>

        {/* Close button - positioned outside content area on the right */}
        <button
          onClick={onClose}
          className="flex-shrink-0 p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all group"
          style={{
            marginTop: '0',
          }}
        >
          <X 
            className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-300" 
            strokeWidth={2}
          />
        </button>
      </div>
    </div>
    </>
  );
};

export default SignupPopup;

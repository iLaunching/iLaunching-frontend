import { X, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

interface SignupPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthView = 'main' | 'email' | 'password' | 'options';

const SignupPopup = ({ isOpen, onClose }: SignupPopupProps) => {
  const [currentView, setCurrentView] = useState<AuthView>('main');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Email validation
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  const isEmailValid = email.trim() !== '' && isValidEmail(email);
  const isPasswordValid = password.length >= 8;
  const isConfirmationValid = password === confirmPassword && isPasswordValid;

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
            <div
              className="absolute inset-0 animate-slideIn"
              style={{
                animation: 'slideInFromLeft 0.3s ease-out forwards'
              }}
            >
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
              {/* Continue with Email */}
              <button
                type="button"
                className=" w-full flex items-center py-3 px-4 border border-gray-300 rounded-xl hover:bg-gray-100 transition-colors duration-50 relative"
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
                className=" w-full flex items-center py-3 px-4 border border-gray-300 rounded-xl hover:bg-gray-100 transition-colors duration-50 relative"
              >
                <svg className="w-5 h-5 absolute left-4" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="text-sm font-medium text-gray-700 w-full text-center">Continue with Facebook</span>
              </button>

              {/* Continue with Email Button */}
              <button
                type="button"
                onClick={() => setCurrentView('email')}
                className="w-full flex items-center py-3 px-4 border border-grey-300 rounded-xl hover:bg-gray-100 transition-colors duration-100 relative"
              >
                <svg className="w-5 h-5 absolute left-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
                <span className="text-sm font-medium text-gray-700 w-full text-center">Continue with Email</span>
              </button>

              {/* Continue Another Way */}
              <button
                type="button"
                onClick={() => setCurrentView('options')}
                className="w-full flex items-center justify-center py-3 px-4  rounded-xl hover:bg-gray-100 transition-colors duration-50 relative"
                
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

            {/* Work Email Button */}
            <button
              type="button"
              className="w-full flex items-start gap-2 py-3 px-0 mt-4 transition-colors duration-50"
              onClick={() => setCurrentView('email')}
            >
              <svg 
                className="w-5 h-5 text-gray-900" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
                />
              </svg>
              <span className="text-sm font-medium text-gray-900 group-hover:text-gray-600 hover:text-gray-600 transition-colors duration-50">
                Sign up with your work email
              </span>
            </button>
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
                    if (e.key === 'Enter' && isEmailValid) {
                      setCurrentView('password');
                    }
                  }}
                />
                <button 
                  type="button"
                  disabled={!isEmailValid}
                  className={`w-full mt-4 py-3 px-6 font-medium rounded-xl transition-colors duration-50 ${
                    isEmailValid 
                      ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  onClick={() => {
                    if (isEmailValid) setCurrentView('password');
                  }}
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
                    onClick={() => setCurrentView('email')} 
                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors duration-50"
                    type="button"
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-700" />
                  </button>
                  <h2 className="text-2xl font-semibold text-black">Log into your account</h2>
                </div>
                <p className="text-gray-700 break-all">with {email}</p>
              </div>

              {/* Password Input Form */}
              <div className="px-8 pb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  set a password for your account
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-1 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Password"
                />
                <hr className="my-4 border-gray-300" style={{ borderWidth: 2 }} />
                <p className="text-xs text-gray-500 mb-4">Use 8 or more characters with a mix of letters, numbers & symbols.</p>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  confirm yor password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-1 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Confirm Password"
                  onKeyDown={e => {
                    if (e.key === 'Enter' && isConfirmationValid) {
                      // handle login here
                    }
                  }}
                />
                <button
                  type="button"
                  disabled={!isConfirmationValid}
                  className={`w-full mt-4 py-3 px-6 font-medium rounded-xl transition-colors duration-50 ${
                    isConfirmationValid
                      ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  // onClick={...} // handle login here
                >
                  login
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

                  {/* Continue with Phone Number */}
                  <button
                    type="button"
                    className="w-full flex items-center py-3 px-4 border border-gray-300 rounded-xl hover:bg-gray-100 transition-colors duration-50 relative"
                  >
                    <svg className="w-5 h-5 absolute left-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="w-full text-center text-sm font-medium text-gray-700">Continue with Phone Number</span>
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

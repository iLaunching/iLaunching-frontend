import { X } from 'lucide-react';

interface SignupPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const SignupPopup = ({ isOpen, onClose }: SignupPopupProps) => {
  if (!isOpen) return null;

  return (
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
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex-1" style={{ minWidth: '300px', maxWidth: '400px' }}>
          {/* Header */}
          <div className="px-8 pt-8 pb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Log in or sign up in seconds
            </h2>
            <p className="text-gray-600">
              Use your email or another service to continue with Ilaunching (its free)!
            </p>
          </div>

          {/* Auth Buttons */}
          <div className="px-8 pb-8">
            <div className="space-y-3">
              {/* Continue with Google */}
              <button
                type="button"
                className="w-full flex items-center py-3 px-4 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all relative"
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
                className="w-full flex items-center py-3 px-4 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all relative"
              >
                <svg className="w-5 h-5 absolute left-4" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="text-sm font-medium text-gray-700 w-full text-center">Continue with Facebook</span>
              </button>

              {/* Continue with Email */}
              <button
                type="button"
                className="w-full flex items-center py-3 px-4 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all relative"
              >
                <svg className="w-5 h-5 absolute left-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
                <span className="text-sm font-medium text-gray-700 w-full text-center">Continue with Email</span>
              </button>

              {/* Continue Another Way */}
              <button
                type="button"
                className="w-full flex items-center py-3 px-4 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all relative"
              >
                <svg className="w-5 h-5 absolute left-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="text-sm font-medium text-gray-700 w-full text-center">Continue Another Way</span>
              </button>
            </div>

            {/* Terms & Privacy */}
            <p className="mt-6 text-center text-xs text-gray-500">
              By continuing, you agree to our{' '}
              <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                Terms of Service
              </a>
              {' '}and{' '}
              <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                Privacy Policy
              </a>
            </p>
          </div>
          </div>

          {/* Image Section */}
          <div 
            className="hidden md:block flex-1 bg-gradient-to-br from-blue-500 to-purple-600 relative"
            style={{ minWidth: '400px' }}
          >
            <div className="absolute inset-0 flex items-center justify-center p-8">
              {/* Placeholder Image */}
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-white">
                  <svg 
                    className="w-48 h-48 mx-auto mb-4 opacity-50" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1.5} 
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                    />
                  </svg>
                  <p className="text-xl font-semibold">Welcome to iLaunching</p>
                  <p className="text-sm opacity-75 mt-2">Your journey starts here</p>
                </div>
              </div>
            </div>
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
  );
};

export default SignupPopup;

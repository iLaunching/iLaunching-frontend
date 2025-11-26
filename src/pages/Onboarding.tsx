import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/api/auth';

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Onboarding form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    preferences: {},
  });

  useEffect(() => {
    // Handle OAuth callback if present
    const oauthResult = authApi.handleOAuthCallback();
    
    if (oauthResult.success) {
      console.log('OAuth authentication successful on onboarding page:', oauthResult.action);
      // Tokens are already stored by handleOAuthCallback
    }
    
    // Check if user is authenticated
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/');
    }
  }, [navigate]);

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      // TODO: Call API to update user profile and set onboarding_completed = true
      // const response = await fetch('/api/v1/profile/complete-onboarding', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${localStorage.getItem('access_token')}`
      //   },
      //   body: JSON.stringify(formData)
      // });

      // For now, redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Progress Bar */}
        <div className="bg-gray-100 h-2">
          <div 
            className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-300"
            style={{ width: `${(currentStep / 3) * 100}%` }}
          />
        </div>

        <div className="p-8 md:p-12">
          {/* Step Indicator */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                      step === currentStep
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white scale-110'
                        : step < currentStep
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {step < currentStep ? '✓' : step}
                  </div>
                  {step < 3 && (
                    <div className={`w-16 h-1 mx-2 ${step < currentStep ? 'bg-green-500' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step 1: Welcome & Name */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  Welcome to <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">iLaunching</span>!
                </h1>
                <p className="text-gray-600 text-lg">Let's get you set up in just a few steps</p>
              </div>

              <div className="space-y-4 mt-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    placeholder="Enter your first name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    placeholder="Enter your last name"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: About You */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Tell us about yourself</h2>
                <p className="text-gray-600">This helps us personalize your experience</p>
              </div>

              <div className="space-y-4 mt-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio (Optional)
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
                    placeholder="Tell us a bit about yourself..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: All Set */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fadeIn text-center">
              <div className="flex justify-center">
                <div className="w-24 h-24 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">You're all set!</h2>
                <p className="text-gray-600 text-lg">Ready to start your journey with iLaunching</p>
              </div>

              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 mt-6">
                <h3 className="font-semibold text-gray-900 mb-4">What's next?</h3>
                <ul className="space-y-2 text-left text-gray-700">
                  <li className="flex items-start">
                    <span className="text-indigo-600 mr-2">✓</span>
                    <span>Explore your personalized dashboard</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-600 mr-2">✓</span>
                    <span>Connect with our AI assistant</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-600 mr-2">✓</span>
                    <span>Start building your projects</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                currentStep === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Back
            </button>

            <button
              onClick={handleNext}
              disabled={isLoading}
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processing...' : currentStep === 3 ? 'Get Started' : 'Continue'}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}

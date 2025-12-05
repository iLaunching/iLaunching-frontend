import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import OnboardingBackground from '../components/OnboardingBackground';
import Header from '@/components/layout/Header';
import OnboardingPrompt from '@/components/OnboardingPrompt';
import SimpleTypewriter from '@/components/SimpleTypewriter';
import OnboardingAiHeader from '@/components/OnboardingAiHeader';
import SmartHubAvatarColorPicker from '@/components/SmartHubAvatarColorPicker';
import OnboardingMarketingOptions from '@/components/OnboardingMarketingOptions';
import { ONBOARDING_HUB_NAME_QUESTION, ONBOARDING_HUB_COLOR_QUESTION, ONBOARDING_SMART_MATRIX_NAME_QUESTION, ONBOARDING_MARKETTING_QUESTION, ONBOARDING_THANKYOU_MESSAGE } from '@/constants/messages';
import { APP_CONFIG } from '@/constants';
import { authApi } from '../api/auth';

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentStage, setCurrentStage] = useState<'hub_name' | 'hub_color' | 'smart_matrix_name' | 'marketing' | 'thankyou' | 'complete'>('hub_name');
  const [showPrompt, setShowPrompt] = useState(false);
  const [hubName, setHubName] = useState('');
  const [selectedColorId, setSelectedColorId] = useState<number | undefined>(undefined);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [matrixName, setMatrixName] = useState('');
  const [selectedMarketingId, setSelectedMarketingId] = useState<number | undefined>(undefined);
  const [selectedMarketingName, setSelectedMarketingName] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [firstName, setFirstName] = useState('there');
  const [showMovingAi, setShowMovingAi] = useState(false);
  const [showAcknowledge, setShowAcknowledge] = useState(false);
  const [hubId, setHubId] = useState<string>('');
  const [acknowledgeStepMessage, setAcknowledgeStepMessage] = useState<string>('Almost there...');
  const hasCompletedRef = useRef(false);

  useEffect(() => {
    // Check if user is authenticated and fetch their data
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/');
    } else {
      // Fetch user profile
      authApi.getMe()
        .then(response => {
          const user = response.user as any;
          const fullName = user.first_name && user.last_name 
            ? `${user.first_name} ${user.last_name}`
            : user.name || user.email;
          const userFirstName = user.first_name || fullName.split(' ')[0];
          setFirstName(userFirstName);
          setIsInitialized(true);
        })
        .catch(error => {
          console.error('Failed to fetch user:', error);
          navigate('/');
        });
    }
  }, [navigate]);

  // Reset typewriter completion state when stage changes
  useEffect(() => {
    if (isInitialized) {
      setShowPrompt(false);
      hasCompletedRef.current = false;
    }
  }, [currentStage, isInitialized]);

  const handleTypewriterComplete = useCallback(() => {
    // Only trigger once per stage with strong guard
    if (!hasCompletedRef.current && isInitialized) {
      console.log('Typewriter completed - setting state');
      hasCompletedRef.current = true;
      // Show the prompt after typewriter completes (except for thankyou stage)
      setTimeout(() => {
        if (currentStage === 'thankyou') {
          // Trigger AI animation for thankyou stage
          setShowMovingAi(true);
          // After AI animation completes, show acknowledge box and start backend creation
          setTimeout(() => {
            setShowAcknowledge(true);
            // Start backend creation process
            createSmartHubAndMatrix();
          }, 1500); // Wait for AI animation (1.2s) + small delay
        } else {
          setShowPrompt(true);
        }
      }, 300);
    }
  }, [isInitialized, currentStage]);

  // Memoize the message to prevent unnecessary recalculations
  const currentMessage = useMemo(() => {
    switch (currentStage) {
      case 'hub_name':
        return ONBOARDING_HUB_NAME_QUESTION[0];
      case 'hub_color':
        return ONBOARDING_HUB_COLOR_QUESTION[0];
      case 'smart_matrix_name':
        return ONBOARDING_SMART_MATRIX_NAME_QUESTION[0];
      case 'marketing':
        return ONBOARDING_MARKETTING_QUESTION[Math.floor(Math.random() * ONBOARDING_MARKETTING_QUESTION.length)];
      case 'thankyou':
        return ONBOARDING_THANKYOU_MESSAGE[Math.floor(Math.random() * ONBOARDING_THANKYOU_MESSAGE.length)];
      case 'complete':
        return 'Great! Your Smart Hub is ready.';
      default:
        return '';
    }
  }, [currentStage]);

  // Select acknowledge message with first name
  const acknowledgeMessage = useMemo(() => {
    return `Welcome ${firstName}!`;
  }, [firstName]);

  console.log('Onboarding render - isInitialized:', isInitialized, 'currentMessage:', currentMessage, 'stage:', currentStage);

  const handleSubmit = useCallback((message: string) => {
    if (currentStage === 'hub_name') {
      setHubName(message);
      setShowPrompt(false);
      console.log('Hub name:', message);
      // Move to color selection stage
      setCurrentStage('hub_color');
    }
  }, [currentStage]);

  const handleColorSelect = useCallback((colorId: number, color: string) => {
    setSelectedColorId(colorId);
    setSelectedColor(color);
    console.log('Selected color:', colorId, color);
  }, []);

  const handleContinue = useCallback(() => {
    console.log('Continue clicked - Hub Name:', hubName, 'Color ID:', selectedColorId, 'Color:', selectedColor);
    setShowPrompt(false);
    setCurrentStage('smart_matrix_name');
  }, [hubName, selectedColorId, selectedColor]);

  const handleMatrixNameSubmit = useCallback((message: string) => {
    setMatrixName(message);
    setShowPrompt(false);
    console.log('Matrix name:', message);
    setCurrentStage('marketing');
  }, []);

  const handleMarketingSelect = useCallback((optionId: number, optionName: string) => {
    setSelectedMarketingId(optionId);
    setSelectedMarketingName(optionName);
    console.log('Marketing option selected:', optionId, optionName);
    setShowPrompt(false);
    setCurrentStage('thankyou');
  }, []);

  const createSmartHubAndMatrix = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      const API_URL = 'https://ilaunching-servers-production.up.railway.app';
      
      // Step 1: Create Smart Hub
      setAcknowledgeStepMessage('Creating your Smart Hub...');
      const hubResponse = await fetch(`${API_URL}/api/v1/onboarding/create-hub?hub_name=${encodeURIComponent(hubName)}&hub_color_id=${selectedColorId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!hubResponse.ok) {
        const errorData = await hubResponse.json().catch(() => ({ detail: 'Unknown error' }));
        console.error('Hub creation failed:', hubResponse.status, errorData);
        throw new Error(errorData.detail || 'Failed to create Smart Hub');
      }
      
      const hubData = await hubResponse.json();
      setHubId(hubData.hub_id);
      console.log('Smart Hub created:', hubData);
      
      // Small delay for user to see the message
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Step 2: Create Smart Matrix
      setAcknowledgeStepMessage('Setting up your Smart Matrix...');
      const matrixResponse = await fetch(`${API_URL}/api/v1/onboarding/create-matrix?hub_id=${hubData.hub_id}&matrix_name=${encodeURIComponent(matrixName)}&marketing_option_id=${selectedMarketingId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!matrixResponse.ok) {
        const errorData = await matrixResponse.json().catch(() => ({ detail: 'Unknown error' }));
        console.error('Matrix creation failed:', matrixResponse.status, errorData);
        throw new Error(errorData.detail || 'Failed to create Smart Matrix');
      }
      
      const matrixData = await matrixResponse.json();
      console.log('Smart Matrix created:', matrixData);
      
      // Small delay for user to see the message
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Step 3: Complete
      setAcknowledgeStepMessage('All set! Taking you to your Smart Hub...');
      
      // Refresh user data to update onboarding_completed status in localStorage
      try {
        const userResponse = await authApi.getMe();
        // Update localStorage with fresh user data
        localStorage.setItem('user', JSON.stringify(userResponse.user));
        console.log('✅ User data refreshed after onboarding completion');
      } catch (error) {
        console.error('Failed to refresh user data:', error);
      }
      
      // Navigate to Smart Hub dashboard after short delay
      setTimeout(() => {
        navigate('/smart-hub');
      }, 2000);
      
    } catch (error) {
      console.error('Onboarding creation failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setAcknowledgeStepMessage(`Error: ${errorMessage}`);
    }
  }, [hubName, selectedColorId, matrixName, selectedMarketingId, navigate]);

  return (
    <div className="min-h-screen relative">
      {/* Onboarding Background */}
      <OnboardingBackground shouldFadeWhite={showAcknowledge} />
      
      {/* Header with white text and logo only - fixed at top - hide during thankyou */}
      {!showMovingAi && (
        <Header aiActive={false} hideLogo={true} textColor="text-white" hideLanguageSwitcher={true} />
      )}
      
      {isInitialized && (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div 
            className={`w-[60%] h-[70vh] max-w-5xl rounded-2xl overflow-hidden relative z-10 flex flex-col transition-all duration-1000`}
            style={{
              background: showAcknowledge 
                ? 'transparent' 
                : 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.68) 50%, rgba(255, 255, 255, 0.78) 100%)',
              backdropFilter: showAcknowledge ? 'none' : 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: showAcknowledge ? 'none' : 'blur(20px) saturate(180%)',
              border: showAcknowledge ? 'none' : '1px solid rgba(255, 255, 255, 0.25)',
              boxShadow: showAcknowledge ? 'none' : '0 8px 32px 0 rgba(31, 38, 135, 0.37), inset 0 1px 0 0 rgba(255, 255, 255, 0.3)',
            }}
          >
            {/* AI Header with icon and acknowledge message */}
            {!showMovingAi && (
              <OnboardingAiHeader 
                aiName="iLaunching"
                acknowledgeMessage={acknowledgeMessage}
              />
            )}
            
            {/* Content area with typewriter and color picker */}
            <div className={`flex-1 flex flex-col px-8 pb-[30px] overflow-y-auto custom-scrollbar ${
              currentStage === 'thankyou' && showMovingAi 
                ? 'items-center justify-center pt-0' 
                : 'items-center justify-start pt-24'
            }`}>
              <div className={`w-full max-w-[700px] mb-8 text-left transition-opacity duration-700 ${
                showAcknowledge ? 'opacity-0' : 'opacity-100'
              }`}>
                <SimpleTypewriter 
                  key={currentStage}
                  text={currentMessage}
                  speed={APP_CONFIG.typewriterSpeed}
                  onComplete={handleTypewriterComplete}
                  className="text-gray-900"
                  style={{ 
                    fontFamily: 'Work Sans, sans-serif',
                    fontSize: '26px',
                    color: APP_CONFIG.colors.text,
                  }}
                />
              </div>
              
              {/* Animated AI moving down on thankyou stage */}
              {currentStage === 'thankyou' && showMovingAi && (
                <div className="w-full max-w-[700px] flex flex-col items-center mb-8">
                  <div className="animate-ai-move-down">
                    <div className="onboarding-ai-icon-moved" style={{ userSelect: 'none', WebkitUserSelect: 'none', cursor: 'default' }}>
                      <span className="onboarding-ai-letter-moved" style={{ userSelect: 'none', WebkitUserSelect: 'none', cursor: 'default' }}>i</span>
                    </div>
                  </div>
                  
                  {/* Acknowledge box appears below AI after animation */}
                  {showAcknowledge && (
                    <div className="mt-6 animate-acknowledge-fade-in">
                      <div className="acknowledge-box">
                        <span className="acknowledge-text">{acknowledgeStepMessage}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Show color picker for hub_color stage after typewriter completes */}
              {currentStage === 'hub_color' && showPrompt && (
                <>
                  <div className="w-full animate-fade-in mt-8">
                    <SmartHubAvatarColorPicker
                      userName={firstName}
                      selectedColorId={selectedColorId}
                      onColorSelect={handleColorSelect}
                    />
                  </div>
                  
                  {/* Continue Button for hub_color stage */}
                  <div className="w-full flex justify-center mt-8">
                    <button
                      onClick={handleContinue}
                      className="px-6 py-2.5 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors duration-200"
                      style={{ fontFamily: 'Work Sans, sans-serif' }}
                    >
                      Continue
                    </button>
                  </div>
                </>
              )}
              
              {/* Show marketing options for marketing stage after typewriter completes */}
              {currentStage === 'marketing' && showPrompt && (
                <div className="w-full animate-fade-in mt-8">
                  <OnboardingMarketingOptions
                    onSelect={handleMarketingSelect}
                    selectedOptionId={selectedMarketingId}
                  />
                </div>
              )}
            </div>
            
            {/* ChatPrompt at bottom with 20px margin - show for hub_name and smart_matrix_name stages */}
            {showPrompt && (currentStage === 'hub_name' || currentStage === 'smart_matrix_name') && (
              <div className="absolute bottom-5 left-0 right-0 px-6 animate-fade-in">
                <OnboardingPrompt 
                  onSubmit={currentStage === 'hub_name' ? handleSubmit : handleMatrixNameSubmit}
                  placeholder={currentStage === 'hub_name' ? "Type your Smart Hub name here..." : "Type your Smart Matrix name here..."}
                  containerStyle={{
                    background: 'rgba(255, 255, 255, 0.65)',
                    backdropFilter: 'none',
                    WebkitBackdropFilter: 'none',
                    boxShadow: '0 2px 8px rgba(147, 51, 234, 0.08), 0 1px 4px rgba(37, 99, 235, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
        
        /* Custom scrollbar styling */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(147, 51, 234, 0.3);
          border-radius: 10px;
          transition: background 0.2s ease;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(147, 51, 234, 0.5);
        }
        
        /* AI icon animation - moves down from header */
        @keyframes ai-move-down {
          0% {
            opacity: 0;
            transform: translate(-300px, -250px) scale(0.8);
          }
          60% {
            opacity: 1;
          }
          100% {
            opacity: 1;
            transform: translate(0, 0) scale(1);
          }
        }
        
        .animate-ai-move-down {
          animation: ai-move-down 1.2s ease-out forwards;
        }
        
        /* Moved AI icon styles */
        .onboarding-ai-icon-moved {
          width: 80px;
          height: 80px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: rotate(45deg);
          background: linear-gradient(135deg, 
            rgba(59, 130, 246, 0.08) 0%, 
            rgba(147, 51, 234, 0.08) 50%, 
            rgba(236, 72, 153, 0.08) 100%
          );
          border-radius: 16px;
          border: 2px solid rgba(147, 51, 234, 0.2);
        }
        
        .onboarding-ai-icon-moved::before {
          content: '';
          position: absolute;
          top: -3px;
          left: -3px;
          right: -3px;
          bottom: -3px;
          background: linear-gradient(45deg, 
            #3b82f6 0%, 
            #8b5cf6 25%, 
            #ec4899 50%, 
            #f59e0b 75%, 
            #3b82f6 100%
          );
          background-size: 400% 400%;
          border-radius: 18px;
          z-index: -1;
          opacity: 0.6;
          filter: blur(4px);
          animation: iconBorderFlow 3s ease-in-out infinite;
        }
        
        .onboarding-ai-letter-moved {
          transform: rotate(-45deg);
          font-family: 'Fredoka', sans-serif;
          font-size: 48px;
          font-weight: 700;
          background: linear-gradient(45deg, 
            #3b82f6 0%, 
            #8b5cf6 25%, 
            #ec4899 50%, 
            #f59e0b 75%, 
            #3b82f6 100%
          );
          background-size: 400% 400%;
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: aiColorFlow 3s ease-in-out infinite;
          filter: drop-shadow(0 0 12px rgba(59, 130, 246, 0.4));
        }
        
        @keyframes iconBorderFlow {
          0%, 100% {
            background-position: 0% 50%;
            opacity: 0.6;
          }
          50% {
            background-position: 100% 50%;
            opacity: 0.8;
          }
        }
        
        @keyframes aiColorFlow {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        /* Acknowledge box animation and styles */
        @keyframes acknowledge-fade-in {
          0% {
            opacity: 0;
            transform: translateY(-10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-acknowledge-fade-in {
          animation: acknowledge-fade-in 0.6s ease-out forwards;
        }
        
        .acknowledge-box {
          font-size: 16px;
          font-weight: 500;
          color: rgba(17, 15, 117, 1);
          padding: 12px 24px;
          border-radius: 12px;
          line-height: 1.4;
          font-style: italic;
          background: rgba(147, 51, 234, 0.08);
          border: 1px solid rgba(147, 51, 234, 0.2);
          position: relative;
          overflow: hidden;
          white-space: nowrap;
          font-family: 'Work Sans', sans-serif;
          box-shadow: 0 4px 12px rgba(147, 51, 234, 0.1);
        }
        
        .acknowledge-box::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(147, 51, 234, 0.1), transparent);
          animation: acknowledge-glow 2s ease-in-out infinite;
        }
        
        .acknowledge-text {
          position: relative;
          z-index: 1;
        }
        
        @keyframes acknowledge-glow {
          0% {
            left: -100%;
          }
          100% {
            left: 100%;
          }
        }
      `}</style>
    </div>
  );
}

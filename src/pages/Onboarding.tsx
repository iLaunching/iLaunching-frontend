import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import OnboardingBackground from '../components/OnboardingBackground';
import Header from '@/components/layout/Header';
import OnboardingPrompt from '@/components/OnboardingPrompt';
import SimpleTypewriter from '@/components/SimpleTypewriter';
import OnboardingAiHeader from '@/components/OnboardingAiHeader';
import { ONBOARDING_HUB_NAME_QUESTION, ONBOARDING_HUB_COLOR_QUESTION } from '@/constants/messages';
import { APP_CONFIG } from '@/constants';
import { authApi } from '../api/auth';

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentStage, setCurrentStage] = useState<'hub_name' | 'hub_color' | 'complete'>('hub_name');
  const [showPrompt, setShowPrompt] = useState(false);
  const [hubName, setHubName] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [firstName, setFirstName] = useState('there');
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
      // Show the prompt after typewriter completes
      setTimeout(() => {
        setShowPrompt(true);
      }, 300);
    }
  }, [isInitialized]);

  // Memoize the message to prevent unnecessary recalculations
  const currentMessage = useMemo(() => {
    switch (currentStage) {
      case 'hub_name':
        return ONBOARDING_HUB_NAME_QUESTION[0];
      case 'hub_color':
        return ONBOARDING_HUB_COLOR_QUESTION[0];
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

  return (
    <div className="min-h-screen relative">
      {/* Onboarding Background */}
      <OnboardingBackground />
      
      {/* Header with white text and logo only - fixed at top */}
      <Header aiActive={false} hideLogo={true} textColor="text-white" hideLanguageSwitcher={true} />
      
      {isInitialized && (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div 
            className="w-[60%] h-[70vh] max-w-5xl rounded-2xl overflow-hidden relative z-10 flex flex-col"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.68) 50%, rgba(255, 255, 255, 0.78) 100%)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37), inset 0 1px 0 0 rgba(255, 255, 255, 0.3)',
            }}
          >
            {/* AI Header with icon and acknowledge message */}
            <OnboardingAiHeader 
              aiName="iLaunching"
              acknowledgeMessage={acknowledgeMessage}
            />
            
            {/* Content area with typewriter */}
            <div className="flex-1 flex items-start justify-center px-8 pt-24">
              <div className="w-full max-w-[700px]">
                <SimpleTypewriter 
                  key={currentStage}
                  text={currentMessage}
                  speed={APP_CONFIG.typewriterSpeed}
                  onComplete={handleTypewriterComplete}
                  className="text-gray-900"
                  style={{ 
                    fontFamily: APP_CONFIG.fonts.primary,
                    fontSize: '26px',
                    color: APP_CONFIG.colors.text,
                  }}
                />
              </div>
            </div>
            
            {/* ChatPrompt at bottom with 20px margin - only show for hub_name stage */}
            {showPrompt && currentStage === 'hub_name' && (
              <div className="absolute bottom-5 left-0 right-0 px-6 animate-fade-in">
                <OnboardingPrompt 
                  onSubmit={handleSubmit}
                  placeholder="Type your Smart Hub name here..."
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
      `}</style>
    </div>
  );
}

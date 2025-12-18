import { X, ArrowLeft } from 'lucide-react';
import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import OnboardingAiHeader from './OnboardingAiHeader';
import SimpleTypewriter from './SimpleTypewriter';
import OnboardingPrompt from './OnboardingPrompt';
import SmartHubAvatarColorPicker from './SmartHubAvatarColorPicker';
import JourneyTierSelector from './JourneyTierSelector';
import SmartHubUserCase from './SmartHubUserCase';
import { authApi } from '@/api/auth';
import { ONBOARDING_HUB_NAME_QUESTION, ONBOARDING_HUB_COLOR_QUESTION, ONBOARDING_SMART_MATRIX_NAME_QUESTION } from '@/constants/messages';
import { APP_CONFIG } from '@/constants';

interface SmartHubCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  menuColor: string;
  textColor: string;
  borderLineColor: string;
  globalHoverColor: string;
  chatBk1?: string;
  solidColor?: string;
  buttonHoverColor?: string;
  promptBk?: string;
  promptTextColor?: string;
  aiAcknowledgeTextColor?: string;
}

export default function SmartHubCreator({
  isOpen,
  onClose,
  menuColor,
  textColor,
  borderLineColor,
  globalHoverColor,
  chatBk1,
  solidColor,
  buttonHoverColor,
  promptBk,
  promptTextColor,
  aiAcknowledgeTextColor
}: SmartHubCreatorProps) {
  const queryClient = useQueryClient();
  
  // Debug: Log the ai_acknowledge_text_color value
  console.log('🎨 SmartHubCreator aiAcknowledgeTextColor:', aiAcknowledgeTextColor);
  console.log('🎨 SmartHubCreator ALL COLORS:', { 
    aiAcknowledgeTextColor, 
    promptBk, 
    promptTextColor,
    textColor,
    solidColor
  });
  
  const [currentStage, setCurrentStage] = useState<'use_case' | 'hub_name' | 'hub_color' | 'journey' | 'smart_matrix_name' | 'invite_people' | 'thankyou'>('use_case');
  const [showPrompt, setShowPrompt] = useState(false);
  const [showTypewriter, setShowTypewriter] = useState(false);
  const [selectedUseCaseId, setSelectedUseCaseId] = useState<number | undefined>(undefined);
  const [selectedUseCaseName, setSelectedUseCaseName] = useState<string>('');
  const [hubName, setHubName] = useState('');
  const [selectedColorId, setSelectedColorId] = useState<number>(27);
  const [selectedColor, setSelectedColor] = useState<string>('#80b918');
  const [selectedJourney, setSelectedJourney] = useState<string>('Validate Journey');
  const [matrixName, setMatrixName] = useState('');
  const [invitedEmails, setInvitedEmails] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState<string>('');
  const [emailError, setEmailError] = useState<string>('');
  const [errorTypewriterMessage, setErrorTypewriterMessage] = useState<string>('');
  const [firstName, setFirstName] = useState('there');
  const [showMovingAi, setShowMovingAi] = useState(false);
  const [showAcknowledge, setShowAcknowledge] = useState(false);
  const [acknowledgeStepMessage, setAcknowledgeStepMessage] = useState<string>('Almost there...');
  const [isStartingOver, setIsStartingOver] = useState(false);
  const [isReturningFromMatrix, setIsReturningFromMatrix] = useState(false);
  const [isReturningToMatrix, setIsReturningToMatrix] = useState(false);
  const [isReturningToJourney, setIsReturningToJourney] = useState(false);
  const hasCompletedRef = useRef(false);
  const teamMembersScrollRef = useRef<HTMLDivElement>(null);

  // Fetch user's first name when popup opens
  useEffect(() => {
    if (isOpen) {
      // Reset all state when popup opens
      setCurrentStage('use_case');
      setShowPrompt(false);
      setShowTypewriter(false);
      setSelectedUseCaseId(undefined);
      setSelectedUseCaseName('');
      setHubName('');
      setSelectedColorId(27);
      setSelectedColor('#80b918');
      setSelectedJourney('Validate Journey');
      setMatrixName('');
      setInvitedEmails([]);
      setEmailInput('');
      setEmailError('');
      setErrorTypewriterMessage('');
      setIsStartingOver(false);
      setIsReturningFromMatrix(false);
      setIsReturningToMatrix(false);
      setIsReturningToJourney(false);
      hasCompletedRef.current = false;
      
      // Fetch user profile for first name
      authApi.getMe()
        .then(response => {
          const user = response.user as any;
          const userFirstName = user.first_name || user.name?.split(' ')[0] || 'there';
          setFirstName(userFirstName);
          
          // Delay typewriter to let acknowledge message animate first
          setTimeout(() => {
            setShowTypewriter(true);
          }, 500); // Wait for acknowledge animation to complete
        })
        .catch(error => {
          console.error('Failed to fetch user:', error);
          // Still show typewriter even if fetch fails
          setTimeout(() => {
            setShowTypewriter(true);
          }, 800);
        });
    } else {
      // Reset all state when popup closes
      setCurrentStage('use_case');
      setShowPrompt(false);
      setShowTypewriter(false);
      setSelectedUseCaseId(undefined);
      setSelectedUseCaseName('');
      setHubName('');
      setSelectedColorId(27);
      setSelectedColor('#80b918');
      setSelectedJourney('Validate Journey');
      setMatrixName('');
      setInvitedEmails([]);
      setEmailInput('');
      setEmailError('');
      setErrorTypewriterMessage('');
      setShowMovingAi(false);
      setShowAcknowledge(false);
      setAcknowledgeStepMessage('Almost there...');
      setIsStartingOver(false);
      hasCompletedRef.current = false;
    }
  }, [isOpen]);

  // Reset typewriter completion state when stage changes
  useEffect(() => {
    setShowPrompt(false);
    hasCompletedRef.current = false;
  }, [currentStage]);

  // Memoize the message to prevent unnecessary recalculations
  const currentMessage = useMemo(() => {
    // Show error message if on invite_people stage and there's an error
    if (currentStage === 'invite_people' && errorTypewriterMessage) {
      return errorTypewriterMessage;
    }
    
    switch (currentStage) {
      case 'use_case':
        return isStartingOver 
          ? `No problem, ${firstName}! Let's start fresh. What will you use this Smart Hub for?` 
          : 'What will you use this Smart Hub for?';
      case 'hub_name':
        return hubName 
          ? `I see you previously chose "${hubName}". Feel free to change it, keep it as is, or use the "Start Over" button below to begin from scratch!` 
          : `${ONBOARDING_HUB_NAME_QUESTION[0]} (You can also use the "Start Over" button below if you need to start fresh!)`;
      case 'hub_color':
        return isReturningFromMatrix
          ? `Sure, ${firstName}! Let's change your Smart Hub color. Pick a new one below!`
          : ONBOARDING_HUB_COLOR_QUESTION[0];
      case 'journey':
        return isReturningToJourney && selectedJourney
          ? `Sure, ${firstName}! Let's change your journey. You had selected "${selectedJourney}". Feel free to choose a different one!`
          : 'Which journey best fits your goals?';
      case 'smart_matrix_name':
        return isReturningToMatrix && matrixName
          ? `Sure, ${firstName}! Let's rename your Smart Matrix. It was "${matrixName}". What would you like to call it now?`
          : matrixName 
          ? `I see you previously chose "${matrixName}". Feel free to change it, keep it as is, or use the "Change Smart Hub Color" button below to go back!` 
          : `${ONBOARDING_SMART_MATRIX_NAME_QUESTION[0]} (You can also use the "Change Smart Hub Color" button below if you need to change your hub color!)`;
      case 'invite_people':
        return "Who's joining us in this Smart Hub?";
      case 'thankyou':
        return `Thank you, ${firstName}! We're setting up your Smart Hub...`;
      default:
        return '';
    }
  }, [currentStage, errorTypewriterMessage, firstName, hubName, matrixName, isStartingOver, isReturningFromMatrix, isReturningToMatrix, isReturningToJourney, selectedJourney]);

  // Create acknowledge message with first name
  const acknowledgeMessage = useMemo(() => {
    return `Sure ${firstName}!`;
  }, [firstName]);

  const handleTypewriterComplete = useCallback(() => {
    if (!hasCompletedRef.current) {
      console.log('Typewriter completed - showing prompt');
      hasCompletedRef.current = true;
      setTimeout(() => {
        setShowPrompt(true);
      }, 300);
    }
  }, []);

  const handleUseCaseSelect = useCallback((optionId: number, optionName: string) => {
    setSelectedUseCaseId(optionId);
    setSelectedUseCaseName(optionName);
    console.log('Use case selected:', optionId, optionName);
  }, []);

  const handleUseCaseContinue = useCallback(() => {
    console.log('Use Case Continue - Selected:', selectedUseCaseId, selectedUseCaseName);
    setShowPrompt(false);
    setIsStartingOver(false);
    setCurrentStage('hub_name');
  }, [selectedUseCaseId, selectedUseCaseName]);

  const handleSubmit = useCallback((message: string) => {
    if (currentStage === 'hub_name') {
      setHubName(message);
      setShowPrompt(false);
      console.log('Hub name submitted:', message);
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
    setIsReturningFromMatrix(false);
    setCurrentStage('smart_matrix_name');
  }, [hubName, selectedColorId, selectedColor]);

  const handleJourneySelect = useCallback((journey: string) => {
    setSelectedJourney(journey);
    console.log('Journey selected:', journey);
  }, []);

  const handleJourneyContinue = useCallback(() => {
    console.log('Journey Continue - Selected:', selectedJourney);
    setShowPrompt(false);
    setIsReturningToJourney(false);
    setCurrentStage('invite_people');
  }, [selectedJourney]);

  // Handle back button navigation
  const handleBack = useCallback(() => {
    setShowPrompt(false);
    setShowTypewriter(false);
    hasCompletedRef.current = false;
    
    switch (currentStage) {
      case 'hub_name':
        setCurrentStage('use_case');
        break;
      case 'hub_color':
        setCurrentStage('hub_name');
        break;
      case 'journey':
        setIsReturningToMatrix(true);
        setCurrentStage('smart_matrix_name');
        break;
      case 'smart_matrix_name':
        setCurrentStage('journey');
        break;
      case 'invite_people':
        setIsReturningToJourney(true);
        setCurrentStage('journey');
        break;
      default:
        break;
    }
    
    // Retrigger typewriter after stage changes
    setTimeout(() => {
      setShowTypewriter(true);
    }, 100);
  }, [currentStage]);

  // Get back button text based on current stage
  const getBackButtonText = useCallback(() => {
    switch (currentStage) {
      case 'hub_name':
        return 'Change use case';
      case 'hub_color':
        return 'Change smart hub name';
      case 'journey':
        return 'Rename Smart Matrix';
      case 'smart_matrix_name':
        return 'Change journey';
      case 'invite_people':
        return 'Change journey';
      default:
        return 'Back';
    }
  }, [currentStage]);

  // Handle start over button - go back to stage 1
  const handleStartOver = useCallback(() => {
    setShowPrompt(false);
    setShowTypewriter(false);
    hasCompletedRef.current = false;
    setIsStartingOver(true);
    setCurrentStage('use_case');
    
    // Retrigger typewriter after stage changes
    setTimeout(() => {
      setShowTypewriter(true);
    }, 100);
  }, []);

  // Handle back to color button - for smart_matrix_name stage
  const handleBackToColor = useCallback(() => {
    setShowPrompt(false);
    setShowTypewriter(false);
    hasCompletedRef.current = false;
    setIsReturningFromMatrix(true);
    setCurrentStage('hub_color');
    
    // Retrigger typewriter after stage changes
    setTimeout(() => {
      setShowTypewriter(true);
    }, 100);
  }, []);

  const createSmartHubAndMatrix = useCallback(async () => {
    try {
      const token = localStorage.getItem('access_token');
      const API_URL = 'https://ilaunching-servers-production.up.railway.app';
      
      // Validate required data
      if (!hubName || !selectedColorId || !matrixName || !selectedUseCaseId) {
        console.error('Missing required data:', { hubName, selectedColorId, matrixName, selectedUseCaseId });
        setAcknowledgeStepMessage('Error: Missing required information');
        return;
      }
      
      console.log('Starting hub creation with:', { hubName, selectedColorId, matrixName, selectedUseCaseId, selectedJourney });
      
      // Step 1: Create Smart Hub with journey and use case
      setAcknowledgeStepMessage('Creating your Smart Hub...');
      const hubResponse = await fetch(`${API_URL}/api/v1/onboarding/create-hub?hub_name=${encodeURIComponent(hubName)}&hub_color_id=${selectedColorId}&journey=${encodeURIComponent(selectedJourney)}&use_case_id=${selectedUseCaseId}`, {
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
      console.log('Smart Hub created:', hubData);
      
      // Small delay for user to see the message
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Step 2: Create Smart Matrix (without use case - that's stored on the hub)
      setAcknowledgeStepMessage('Setting up your Smart Matrix...');
      const matrixResponse = await fetch(`${API_URL}/api/v1/onboarding/create-matrix?hub_id=${hubData.hub_id}&matrix_name=${encodeURIComponent(matrixName)}`, {
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
      setAcknowledgeStepMessage('All set! Your Smart Hub is ready.');
      
      // Invalidate the query cache to refetch hub list
      await queryClient.invalidateQueries({ queryKey: ['current-smart-hub'] });
      console.log('Query cache invalidated - hub list will refresh');
      
      // Close modal after short delay
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (error) {
      console.error('Hub creation failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setAcknowledgeStepMessage(`Error: ${errorMessage}`);
      // Keep modal open on error so user can see the message
      setTimeout(() => {
        onClose();
      }, 4000);
    }
  }, [hubName, selectedColorId, matrixName, selectedUseCaseId, selectedJourney, onClose, queryClient]);

  const handleSkipInvite = useCallback(() => {
    console.log('Creating hub - Use Case:', selectedUseCaseId, selectedUseCaseName, 'Name:', hubName, 'Color ID:', selectedColorId, 'Color:', selectedColor, 'Matrix:', matrixName, 'Journey:', selectedJourney, 'Invited Emails:', invitedEmails);
    
    // Hide prompt and trigger thank you animation
    setShowPrompt(false);
    setCurrentStage('thankyou');
    
    // Show moving AI animation after short delay
    setTimeout(() => {
      setShowMovingAi(true);
      
      // Show acknowledge box and start backend creation
      setTimeout(() => {
        setShowAcknowledge(true);
        // Start backend creation process
        createSmartHubAndMatrix();
      }, 1500);
    }, 300);
  }, [createSmartHubAndMatrix, selectedJourney, hubName, selectedColorId, selectedColor, matrixName, selectedUseCaseId, selectedUseCaseName, invitedEmails]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  const handleEmailKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && emailInput.trim()) {
      e.preventDefault();
      const trimmedEmail = emailInput.trim();
      
      if (!validateEmail(trimmedEmail)) {
        setEmailError('Please enter a valid email address');
        setErrorTypewriterMessage('Hmm, that doesn\'t look like a valid email address. Try again!');
        return;
      }
      
      if (invitedEmails.includes(trimmedEmail)) {
        setEmailError('This email has already been added');
        setErrorTypewriterMessage('You\'ve already added that email!');
        return;
      }
      
      setInvitedEmails([...invitedEmails, trimmedEmail]);
      setEmailInput('');
      setEmailError('');
      setErrorTypewriterMessage('');
      
      // Scroll to bottom after adding email
      setTimeout(() => {
        if (teamMembersScrollRef.current) {
          teamMembersScrollRef.current.scrollTop = teamMembersScrollRef.current.scrollHeight;
        }
      }, 100);
    }
  };

  const handleEmailInputChange = (value: string) => {
    setEmailInput(value);
    setEmailError('');
    setErrorTypewriterMessage('');
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    setInvitedEmails(invitedEmails.filter(email => email !== emailToRemove));
  };

  const handleMatrixNameSubmit = useCallback((message: string) => {
    setMatrixName(message);
    setShowPrompt(false);
    setIsReturningToMatrix(false);
    console.log('Matrix name submitted:', message);
    // Move to journey selection
    setCurrentStage('journey');
  }, []);

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        .creator-close-btn {
          position: absolute;
          top: 20px;
          right: 20px;
          background-color: transparent;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 360px;
          z-index: 10;
          transition: background-color 0.2s;
        }
        .creator-close-btn:hover {
          background-color: ${globalHoverColor};
        }
        .creator-continue-btn {
          padding: 10px 32px;
          background-color: ${solidColor};
          color: #FFFFFF;
          border-radius: 8px;
          font-weight: 400;
          border: none;
          cursor: pointer;
          font-family: 'Work Sans', sans-serif;
          font-size: 16px;
          height: fit-content;
          
          
        }
        .creator-continue-btn:hover {
          background-color: ${buttonHoverColor};
        
          
        }
      `}</style>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          
          
          background: chatBk1,
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {/* Popup - Match onboarding dimensions */}
        <div
          style={{
            backgroundColor: 'transparent',
            borderRadius: '16px',
            width: '60%',  
            height: '80vh',
            maxWidth: '1200px',
           /* boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',*/
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button - Top Right Corner */}
          <button
            onClick={onClose}
            className="creator-close-btn flex-shrink-0 p-1.5 rounded-full transition-all group"
            style={{
              backgroundColor: `${textColor}10`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = `${textColor}20`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = `${textColor}10`;
            }}
          >
            <X 
              className="group-hover:rotate-90 transition-transform duration-300"
              size={20}
              style={{ color: textColor }}
              strokeWidth={2}
            />
          </button>

          {/* AI Header with indicator - hide during AI animation */}
          {!showMovingAi && (
            <OnboardingAiHeader 
              aiName="iLaunching"
              acknowledgeMessage={acknowledgeMessage}
              aiAcknowledgeTextColor={aiAcknowledgeTextColor}
            />
          )}

          {/* Content Area - Match onboarding layout */}
          <div style={{ 
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: '0 32px 0 32px',
            overflowY: 'auto',
            alignItems: 'center',
            justifyContent: currentStage === 'thankyou' && showMovingAi ? 'center' : 'start',
            paddingTop: currentStage === 'thankyou' && showMovingAi ? '0' : '96px',
            paddingBottom: (currentStage === 'use_case' || currentStage === 'hub_color' || currentStage === 'journey' || currentStage === 'invite_people') && showPrompt ? '100px' : '30px'
          }}>
            {/* Typewriter Message - hide during AI animation */}
            {!showMovingAi && (
              <div style={{ width: '100%', maxWidth: '700px', marginBottom: '32px', textAlign: 'left' }}>
                {showTypewriter && (
                  <SimpleTypewriter
                    key={currentStage === 'invite_people' && errorTypewriterMessage ? errorTypewriterMessage : currentStage}
                    text={currentMessage}
                    onComplete={handleTypewriterComplete}
                    speed={APP_CONFIG.typewriterSpeed}
                    className="text-gray-900"
                    style={{ 
                      fontFamily: 'Work Sans, sans-serif',
                      fontSize: '26px',
                      color: errorTypewriterMessage ? '#ef4444' : textColor
                    }}
                  />
                )}
              </div>
            )}
            
            {/* Animated AI moving down on thankyou stage */}
            {currentStage === 'thankyou' && showMovingAi && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
                maxWidth: '700px'
              }}>
                <div className="animate-ai-move-down">
                  <div className="onboarding-ai-icon-moved" style={{ userSelect: 'none', WebkitUserSelect: 'none', cursor: 'default' }}>
                    <span className="onboarding-ai-letter-moved" style={{ userSelect: 'none', WebkitUserSelect: 'none', cursor: 'default' }}>i</span>
                  </div>
                </div>
                
                {/* Acknowledge box appears below AI after animation */}
                {showAcknowledge && (
                  <div style={{ marginTop: '24px' }} className="animate-acknowledge-fade-in">
                    <div 
                      className="acknowledge-box"
                      style={{ 
                        color: aiAcknowledgeTextColor || 'rgba(17, 15, 117, 1)'
                      }}
                    >
                      <span className="acknowledge-text">
                        {acknowledgeStepMessage}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Show use case selector for use_case stage after typewriter completes */}
            {currentStage === 'use_case' && showPrompt && (
              <div style={{ 
                width: '100%', 
                animation: 'fadeIn 0.5s ease-in-out',
                marginTop: '32px'
              }}>
                <SmartHubUserCase
                  selectedOptionId={selectedUseCaseId}
                  onSelect={handleUseCaseSelect}
                  textColor={textColor}
                  borderLineColor={borderLineColor}
                  globalHoverColor={globalHoverColor}
                  solidColor={solidColor}
                />
              </div>
            )}

            {/* Show color picker for hub_color stage after typewriter completes */}
            {currentStage === 'hub_color' && showPrompt && (
              <div style={{ 
                width: '100%', 
                animation: 'fadeIn 0.5s ease-in-out',
                marginTop: '32px'
              }}>
                <SmartHubAvatarColorPicker
                  userName={firstName}
                  hubName={hubName}
                  selectedColorId={selectedColorId}
                  onColorSelect={handleColorSelect}
                  textColor={textColor}
                />
              </div>
            )}

            {/* Show journey tier selector for journey stage after typewriter completes */}
            {currentStage === 'journey' && showPrompt && (
              <div style={{ 
                width: '100%', 
                animation: 'fadeIn 0.5s ease-in-out',
                marginTop: '32px'
              }}>
                <JourneyTierSelector
                  selectedTier={selectedJourney}
                  onSelect={handleJourneySelect}
                  textColor={textColor}
                />
              </div>
            )}

            {/* Show invite people input for invite_people stage after typewriter completes */}
            {currentStage === 'invite_people' && showPrompt && (
              <div style={{ 
                width: '100%',
                maxWidth: '700px',
                animation: 'fadeIn 0.5s ease-in-out',
                marginTop: '32px'
              }}>
                {/* Email input */}
                <div>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => handleEmailInputChange(e.target.value)}
                    onKeyDown={handleEmailKeyDown}
                    placeholder="Enter email address"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      border: `1px solid ${emailError ? '#ef4444' : borderLineColor}`,
                      color: textColor,
                      fontFamily: 'Work Sans, sans-serif',
                      fontSize: '14px',
                      outline: 'none',
                      backgroundColor: 'transparent',
                    }}
                    onFocus={(e) => {
                      if (!emailError) {
                        e.currentTarget.style.borderColor = textColor;
                      }
                    }}
                    onBlur={(e) => {
                      if (!emailError) {
                        e.currentTarget.style.borderColor = borderLineColor;
                      }
                    }}
                  />
                  
                  {/* Show "Press ENTER to add" when input has value and no error */}
                  <div style={{
                    marginTop: '8px',
                    fontSize: '12px',
                    color: 'rgba(0, 0, 0, 0.5)',
                    fontFamily: 'Work Sans, sans-serif',
                    opacity: emailInput.trim() && !emailError ? 1 : 0,
                    visibility: emailInput.trim() && !emailError ? 'visible' : 'hidden',
                    height: '15px',
                    transition: 'opacity 0.2s ease'
                  }}>
                    Press ENTER to add
                  </div>
                  
                  {/* Error message placeholder (hidden by typewriter now) */}
                  <div style={{
                    height: '20px'
                  }}>
                  </div>
                </div>

                {/* Team members list */}
                <div style={{
                  marginTop: '0px',
                  borderRadius: '8px',
                  border: `1px solid ${borderLineColor}`,
                 
                  overflow: 'hidden'
                }}>
                  {/* Fixed title */}
                  <div style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: textColor,
                    padding: '16px 16px 12px 16px',
                    fontFamily: 'Work Sans, sans-serif',
                   
                    borderBottom: `1px solid ${borderLineColor}`
                  }}>
                    Team Members
                  </div>

                  {/* Scrollable content */}
                  <div 
                    ref={teamMembersScrollRef}
                    style={{
                      maxHeight: '150px',
                      overflowY: 'auto',
                      padding: '0 16px 16px 16px'
                    }}
                  >

                  {/* You (Owner) */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 0'
                  }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: selectedColor || '#FF6B6B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontWeight: 600,
                      fontSize: '14px',
                      fontFamily: 'Work Sans, sans-serif'
                    }}>
                      {firstName.charAt(0).toUpperCase()}
                    </div>
                    <div style={{
                      fontFamily: 'Work Sans, sans-serif',
                      fontSize: '14px',
                      color: textColor
                    }}>
                      You (Owner)
                    </div>
                  </div>

                  {/* iLaunching */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 0'
                  }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: '#000000',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontWeight: 600,
                      fontSize: '14px',
                      fontFamily: 'Work Sans, sans-serif'
                    }}>
                      i
                    </div>
                    <div style={{
                      fontFamily: 'Work Sans, sans-serif',
                      fontSize: '14px',
                      color: textColor
                    }}>
                      iLaunching
                    </div>
                  </div>

                  {/* Added invited emails */}
                  {invitedEmails.map((email, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '8px 0'
                    }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: '#9ca3af',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        fontWeight: 600,
                        fontSize: '14px',
                        fontFamily: 'Work Sans, sans-serif'
                      }}>
                        {email.charAt(0).toUpperCase()}
                      </div>
                      <div style={{
                        fontFamily: 'Work Sans, sans-serif',
                        fontSize: '14px',
                        color: textColor,
                        flex: 1
                      }}>
                        {email}
                      </div>
                      <button
                        onClick={() => handleRemoveEmail(email)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'rgba(0, 0, 0, 0.4)',
                          transition: 'color 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#ef4444';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'rgba(0, 0, 0, 0.4)';
                        }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  </div>
                </div>
              </div>
            )}

            {/* Prompt Input - Positioned at bottom like onboarding - For hub_name and smart_matrix_name stages */}
            {showPrompt && (currentStage === 'hub_name' || currentStage === 'smart_matrix_name') ? (
              <div style={{ 
                position: 'absolute',
                bottom: '20px',
                left: '0',
                right: '0',
                padding: '0 24px'
              }}>
                <OnboardingPrompt
                  onSubmit={currentStage === 'hub_name' ? handleSubmit : handleMatrixNameSubmit}
                  placeholder={currentStage === 'hub_name' ? "Type your Smart Hub name here..." : "Type your Smart Matrix name here..."}
                  initialValue={currentStage === 'hub_name' ? hubName : matrixName}
                  containerStyle={{
                    backgroundColor: promptBk || 'white'
                  }}
                  textColor={promptTextColor || '#000000'}
                  showStartOverButton={true}
                  onStartOverClick={currentStage === 'hub_name' ? handleStartOver : handleBackToColor}
                  startOverButtonText={currentStage === 'hub_name' ? 'Start Over' : 'Change Smart Hub Color'}
                  startOverButtonBgColor="transparent"
                  startOverButtonHoverColor={globalHoverColor}
                  startOverButtonTextColor={textColor}
                  startOverButtonBorderColor={borderLineColor}
                />
              </div>
            ) : null}
          </div>

          {/* Sticky Footer - Continue Button for use_case, hub_color and journey stages */}
          {showPrompt && (currentStage === 'use_case' || currentStage === 'hub_color' || currentStage === 'journey') && (
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '20px 32px',
              borderTop: `1px solid ${borderLineColor}`,
              display: 'flex',
              justifyContent: currentStage === 'use_case' ? 'center' : 'space-between',
              alignItems: 'center',
              zIndex: 10
            }}>
              {/* Back Button - Hidden on first stage */}
              {currentStage !== 'use_case' && (
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200"
                  style={{
                    backgroundColor: 'transparent',
                    color: textColor,
                    border: `1px solid ${textColor}40`,
                    fontSize: '14px',
                    fontFamily: 'Work Sans, sans-serif'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = `${textColor}10`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <ArrowLeft size={16} />
                  {getBackButtonText()}
                </button>
              )}
              
              <button
                onClick={
                  currentStage === 'use_case' 
                    ? handleUseCaseContinue 
                    : currentStage === 'hub_color' 
                    ? handleContinue 
                    : handleJourneyContinue
                }
                className="creator-continue-btn"
              >
                Continue
              </button>
            </div>
          )}

          {/* Sticky Footer - Skip Button for invite_people stage */}
          {showPrompt && currentStage === 'invite_people' && (
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '20px 32px',
              borderTop: `1px solid ${borderLineColor}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              zIndex: 10
            }}>
              {/* Back Button */}
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200"
                style={{
                  backgroundColor: 'transparent',
                  color: textColor,
                  border: `1px solid ${textColor}40`,
                  fontSize: '14px',
                  fontFamily: 'Work Sans, sans-serif'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = `${textColor}10`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <ArrowLeft size={16} />
                {getBackButtonText()}
              </button>
              
              <button
                onClick={handleSkipInvite}
                className="creator-continue-btn"
              >
                {invitedEmails.length > 0 ? 'Continue' : 'Just us for now'}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

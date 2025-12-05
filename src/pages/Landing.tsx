import { useEffect, useState, useCallback, useRef } from 'react';
import AIBackground from '@/components/layout/AIBackground';
import ConnectedMindsBackground from '@/components/layout/ConnectedMindsBackground';
import DeepSeaBackground from '@/components/layout/DeepSeaBackground';
import DeepPurpleSeaBackground from '@/components/layout/DeepPurpleSeaBackground';
import DeepPinkSeaBackground from '@/components/layout/DeepPinkSeaBackground';
import Header from '@/components/layout/Header';
import ChatPrompt from '@/components/ChatPrompt';
import TiptapTypewriter from '@/components/TiptapTypewriter';
import SignupPopup from '@/components/SignupPopup';
import { StreamingChatInterface } from '@/components/StreamingChatInterface';
import CollaborativeToolAnimation from '@/components/CollaborativeToolAnimation';
import SalesControlPanel from '@/components/SalesControlPanel';
import GoogleAccountPicker from '@/components/GoogleAccountPicker';
import FacebookAccountPicker from '@/components/FacebookAccountPicker';
import { UserPlus, LogIn } from 'lucide-react';
import { APP_CONFIG } from '@/constants';
import { getRandomWillThisMakeMoneyMessage, getRandomLaunchMyIdeaMessage, getRandomSeeWhatYouCanDoForMeMessage } from '@/constants/messages';
import { 
  getRandomWelcomeMessage, 
  getRandomWelcomeBackMessage,
  getEmailPlaceholder,
  getNamePlaceholder,
  getPasswordCreatePlaceholder,
  getPasswordInputPlaceholder,
  getYesPleaseButtonText,
  getLogMeInButtonText,
  getContinueWithoutSignupText
} from '@/i18n/landingHelpers';
import { useLandingAuth } from '@/hooks/useLandingAuth';
import { authApi } from '@/api/auth';
import { useTranslation } from 'react-i18next';


export default function Landing() {
  const { i18n: i18nInstance } = useTranslation();
  
  // Use the auth hook for state management
  const {
    authState,
    handleEmailSubmit,
    handleSignupChoice,
    handleLoginChoice,
    handleNameSubmit,
    handlePasswordCreate,
    handlePasswordLogin,
    skipToNameInput,
    enterSalesMode,
    showGoogleAccountPicker,
    showFacebookAccountPicker,
  } = useLandingAuth();
  
  // State to control button visibility after typewriter completes
  const [showButtons, setShowButtons] = useState(false);
  // State to control when to show name input prompt after message completes
  const [showNameInput, setShowNameInput] = useState(false);
  // State to control signup popup visibility
  const [isSignupPopupOpen, setIsSignupPopupOpen] = useState(false);
  const [signupPopupInitialView, setSignupPopupInitialView] = useState<'main' | 'options'>('main');
  // Ref to track the message that's currently rendered in typewriter
  const typewriterMessageRef = useRef<string>('');
  // Key to control typewriter remounting
  const [typewriterKey, setTypewriterKey] = useState(0);
  // State for background transition
  const [backgroundType, setBackgroundType] = useState<'ai' | 'connected' | 'deepSea' | 'deepPurple' | 'deepPink'>('ai');
  const [isTransitioning, setIsTransitioning] = useState(false);
  // State for chat window
  const [showChatWindow, setShowChatWindow] = useState(false);
  
  // Handle OAuth callback on page load
  useEffect(() => {
    const oauthResult = authApi.handleOAuthCallback();
    
    if (oauthResult.success) {
      console.log('OAuth authentication successful:', {
        action: oauthResult.action,
        provider: oauthResult.provider
      });
      
      // Fetch user info to confirm authentication
      authApi.getMe()
        .then(response => {
          console.log('User authenticated via OAuth:', response.user);
          
          // Save Google account to localStorage for account picker FIRST before any redirects
          if (oauthResult.provider === 'google' && response.user) {
            try {
              const existingAccounts = JSON.parse(localStorage.getItem('google_accounts') || '[]');
              console.log('📦 Existing accounts:', existingAccounts);
              
              const user = response.user as any;
              const fullName = user.first_name && user.last_name 
                ? `${user.first_name} ${user.last_name}`
                : user.name || user.email;
              const firstName = user.first_name || fullName.split(' ')[0];
              const avatarColor = getAvatarColor(user.email);
              const newAccount = {
                id: user.id,
                email: user.email,
                name: fullName,
                picture: user.avatar_url || user.avatar_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName)}&background=${avatarColor}&color=fff&length=1`,
                avatarColor: avatarColor,
                lastUsed: Date.now()
              };
              
              console.log('🆕 New account to save:', newAccount);
              
              // Check if account already exists
              const accountExists = existingAccounts.some((acc: any) => acc.email === newAccount.email);
              console.log('🔍 Account already exists?', accountExists);
              
              if (!accountExists) {
                existingAccounts.push(newAccount);
                console.log('✅ Added new Google account to localStorage');
              } else {
                // Update lastUsed timestamp for existing account
                const accountIndex = existingAccounts.findIndex((acc: any) => acc.email === newAccount.email);
                if (accountIndex !== -1) {
                  existingAccounts[accountIndex].lastUsed = Date.now();
                  console.log('✅ Updated lastUsed timestamp for existing account');
                }
              }
              localStorage.setItem('google_accounts', JSON.stringify(existingAccounts));
              console.log('🔍 Verify saved:', localStorage.getItem('google_accounts'));
            } catch (err) {
              console.error('❌ Failed to save Google account:', err);
            }
          }
          
          // Save Facebook account to localStorage for account picker
          if (oauthResult.provider === 'facebook' && response.user) {
            try {
              const existingAccounts = JSON.parse(localStorage.getItem('facebook_accounts') || '[]');
              console.log('📦 Existing Facebook accounts:', existingAccounts);
              
              const user = response.user as any;
              const fullName = user.first_name && user.last_name 
                ? `${user.first_name} ${user.last_name}`
                : user.name || user.email;
              const firstName = user.first_name || fullName.split(' ')[0];
              const newAccount = {
                id: user.id,
                email: user.email,
                name: fullName,
                picture: user.avatar_url || user.avatar_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(firstName)}&background=1877F2&color=fff`,
                lastUsed: Date.now()
              };
              
              console.log('🆕 New Facebook account to save:', newAccount);
              
              // Check if account already exists
              const accountExists = existingAccounts.some((acc: any) => acc.email === newAccount.email);
              console.log('🔍 Facebook account already exists?', accountExists);
              
              if (!accountExists) {
                existingAccounts.push(newAccount);
                console.log('✅ Added new Facebook account to localStorage');
              } else {
                // Update lastUsed timestamp for existing account
                const accountIndex = existingAccounts.findIndex((acc: any) => acc.email === newAccount.email);
                if (accountIndex !== -1) {
                  existingAccounts[accountIndex].lastUsed = Date.now();
                  console.log('✅ Updated lastUsed timestamp for existing Facebook account');
                }
              }
              localStorage.setItem('facebook_accounts', JSON.stringify(existingAccounts));
              console.log('🔍 Verify saved Facebook accounts:', localStorage.getItem('facebook_accounts'));
            } catch (err) {
              console.error('❌ Failed to save Facebook account:', err);
            }
          }
          
          if (oauthResult.provider && !['google', 'facebook'].includes(oauthResult.provider)) {
            console.log('⚠️ Not saving account - provider:', oauthResult.provider, 'user:', !!response.user);
          }
          
          // Add a small delay to ensure localStorage is written before redirect
          setTimeout(() => {
            // Trigger workflow based on action type and provider
            if (oauthResult.action === 'signup') {
              // New user from OAuth signup
              console.log(`New user signup via ${oauthResult.provider} - checking onboarding status`);
              
              if (response.user.onboarding_completed === false) {
                // Redirect to onboarding
                window.location.href = '/onboarding';
              } else {
                // Show welcome message for returning user
                alert(`Welcome ${response.user.email}! Signed up with ${oauthResult.provider}.`);
              }
            } else if (oauthResult.action === 'login') {
              // Existing user login via OAuth
              console.log(`Existing user login via ${oauthResult.provider}`);
              alert(`Welcome back ${response.user.email}! Logged in with ${oauthResult.provider}.`);
            }
          }, 100);
        })
        .catch(error => {
          console.error('Failed to fetch user info:', error);
          alert('Authentication succeeded but failed to load user profile.');
        });
    } else if (oauthResult.error) {
      console.error('OAuth authentication failed:', oauthResult.error);
      alert(`Authentication failed: ${oauthResult.error}`);
    }
  }, []);
  
  // Generate consistent avatar color from email (like Google does)
  const getAvatarColor = (email: string): string => {
    const colors = [
      'EA4335', // Google Red
      '4285F4', // Google Blue
      'FBBC04', // Google Yellow
      '34A853', // Google Green
      'FF6D00', // Deep Orange
      '9C27B0', // Purple
      '00ACC1', // Cyan
      '7CB342', // Light Green
    ];
    
    // Simple hash function to get consistent color for same email
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      hash = email.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };
  
  // Initialize with welcome message on first load
  useEffect(() => {
    const hasVisitedThisSession = sessionStorage.getItem('hasVisitedLanding');
    
    if (!hasVisitedThisSession) {
      sessionStorage.setItem('hasVisitedLanding', 'true');
    }
  }, []);
  
  // Force re-render when language changes
  const [languageKey, setLanguageKey] = useState(0);
  useEffect(() => {
    const handleLanguageChange = () => {
      setLanguageKey(prev => prev + 1);
    };
    
    i18nInstance.on('languageChanged', handleLanguageChange);
    
    return () => {
      i18nInstance.off('languageChanged', handleLanguageChange);
    };
  }, [i18nInstance]);

  // Update typewriter key only when message actually changes
  useEffect(() => {
    // Debounce to prevent rapid updates
    const timer = setTimeout(() => {
      // Get the message based on current state
      let currentMessage = '';
      
      if (authState.message) {
        currentMessage = authState.message;
      } else if (authState.error) {
        currentMessage = authState.error;
      } else if (authState.stage === 'email_input') {
        const hasVisited = sessionStorage.getItem('hasVisitedLanding');
        currentMessage = hasVisited ? getRandomWelcomeBackMessage() : getRandomWelcomeMessage();
      }
      
      // Only update if message actually changed
      if (currentMessage && currentMessage !== typewriterMessageRef.current) {
        typewriterMessageRef.current = currentMessage;
        setTypewriterKey(prev => prev + 1);
      }
    }, 50); // 50ms debounce
    
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authState.message, authState.error, authState.stage, languageKey]);
  
  // Reset button visibility when stage changes to new_user or email_checking
  useEffect(() => {
    if (authState.stage === 'new_user' || authState.stage === 'email_checking') {
      setShowButtons(false);
    }
  }, [authState.stage]);
  
  // Reset name input visibility when stage changes to name_input
  useEffect(() => {
    if (authState.stage === 'name_input') {
      setShowNameInput(false);
    }
  }, [authState.stage]);
  
  // Initialize sales conversation - memoized to prevent re-renders
  const initializeSalesConversation = useCallback(async () => {
    // The StreamingChatInterface handles its own initialization
    console.log('Sales conversation initialized with user:', authState.name || authState.user?.name);
  }, [authState.name, authState.user?.name]);
  
  // Handle Google account selection for OAuth users
  const handleGoogleAccountSelect = useCallback((account: { id: string; email: string; name: string; picture: string }) => {
    console.log('🔐 Google account selected:', account);
    // Redirect to Google OAuth login with email hint
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const loginUrl = `${API_URL}/auth/google/login?redirect_url=${encodeURIComponent(window.location.origin + '/signup-interface')}&login_hint=${encodeURIComponent(account.email)}`;
    console.log('Redirecting to Google OAuth:', loginUrl);
    window.location.href = loginUrl;
  }, []);
  
  const handleFacebookAccountSelect = useCallback((account: { id: string; email: string; name: string; picture: string }) => {
    console.log('🔐 Facebook account selected:', account);
    // Redirect to Facebook OAuth login with redirect_url
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const loginUrl = `${API_URL}/auth/facebook/login?redirect_url=${encodeURIComponent(window.location.origin + '/signup-interface')}`;
    console.log('Redirecting to Facebook OAuth:', loginUrl);
    window.location.href = loginUrl;
  }, []);
  
  // Handle user input based on current stage
  const handleMessage = useCallback(async (message: string) => {
    if (authState.isProcessing) return;
    
    switch (authState.stage) {
      case 'email_input':
        await handleEmailSubmit(message);
        break;
      case 'name_input':
        // Store the name and transition directly to sales
        if (message.trim()) {
          handleNameSubmit(message);
          
          // Start background transition immediately
          setIsTransitioning(true);
          
          // Randomly select a background
          const backgrounds = ['connected', 'deepSea', 'deepPurple', 'deepPink'] as const;
          const randomBackground = backgrounds[Math.floor(Math.random() * backgrounds.length)];
          
          // Change background
          setTimeout(() => {
            setBackgroundType(randomBackground);
          }, 50);
          
          // Complete background transition
          setTimeout(() => {
            setIsTransitioning(false);
          }, 800);
          
          // Show chat window after background is settled
          setTimeout(async () => {
            setShowChatWindow(true);
            // Initialize the sales conversation with API
            await initializeSalesConversation();
          }, 900);
        }
        break;
      case 'password_create':
        await handlePasswordCreate(message);
        break;
      case 'password_input':
        await handlePasswordLogin(message);
        break;
      default:
        break;
    }
  }, [authState.isProcessing, authState.stage, handleEmailSubmit, handleNameSubmit, handlePasswordCreate, handlePasswordLogin, initializeSalesConversation]);
  
  // Get placeholder based on current stage
  const getPlaceholder = () => {
    switch (authState.stage) {
      case 'email_input':
        return getEmailPlaceholder();
      case 'name_input':
        return getNamePlaceholder();
      case 'password_create':
        return getPasswordCreatePlaceholder();
      case 'password_input':
        return getPasswordInputPlaceholder();
      default:
        return getEmailPlaceholder();
    }
  };
  
  // Get input type based on current stage
  const getInputType = () => {
    return (authState.stage === 'password_create' || authState.stage === 'password_input') 
      ? 'password' 
      : 'text';
  };

  // Initialize sales conversation
  // Determine if chat should be visible
  const shouldShowChat = authState.stage !== 'authenticated' && 
                         authState.stage !== 'new_user';
  
  // Should show chat container during name_input but with opacity control
  const isNameInputStage = authState.stage === 'name_input';
  
  // Determine if we should show the button container (visible during new_user)
  const shouldShowButtonContainer = authState.stage === 'new_user';
  
  // Handle typewriter completion - memoized to prevent re-renders
  const handleTypewriterComplete = useCallback(() => {
    if (authState.stage === 'new_user') {
      // When the "not registered" message completes, fade in buttons
      setTimeout(() => {
        setShowButtons(true);
      }, 100);
    } else if (authState.stage === 'name_input') {
      // When the "ask name" message completes, fade in the name input
      setTimeout(() => {
        setShowNameInput(true);
      }, 100);
    }
  }, [authState.stage]);
  
  // Handle signup popup open - memoized to prevent re-renders
  const handleSignupClick = useCallback(() => {
    setIsSignupPopupOpen(true);
  }, []);
  
  // Handle sales demo click - skip to name input stage
  const handleSalesDemoClick = useCallback(() => {
    // Get random message from seeWhatYouCanDoForMe array
    const randomMessage = getRandomSeeWhatYouCanDoForMeMessage();
    // Skip to name input with the custom message
    skipToNameInput(randomMessage);
  }, [skipToNameInput]);

  const handleMakeMoneyClick = useCallback(() => {
    // Get random message from willThisMakeMoney array
    const randomMessage = getRandomWillThisMakeMoneyMessage();
    // Skip to name input with the custom message
    skipToNameInput(randomMessage);
  }, [skipToNameInput]);

  const handleLaunchIdeaClick = useCallback(() => {
    // Get random message from launchMyIdea array
    const randomMessage = getRandomLaunchMyIdeaMessage();
    // Skip to name input with the custom message
    skipToNameInput(randomMessage);
  }, [skipToNameInput]);

  // Handle Google button click - check for saved accounts
  const handleGoogleClick = useCallback(() => {
    try {
      const stored = localStorage.getItem('google_accounts');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      
      if (stored) {
        const accounts = JSON.parse(stored);
        if (accounts && accounts.length > 0) {
          // Has saved accounts - trigger GoogleAccountPicker flow
          console.log('📱 Found', accounts.length, 'saved Google accounts, showing picker');
          showGoogleAccountPicker();
          return;
        }
      }
      
      // No saved accounts - go directly to Google OAuth
      console.log('🔵 No saved accounts, redirecting to Google OAuth');
      const googleAuthUrl = `${API_URL}/auth/google/login?redirect_url=${encodeURIComponent(window.location.origin + '/signup-interface')}`;
      window.location.href = googleAuthUrl;
    } catch (err) {
      console.error('Error checking Google accounts:', err);
      // On error, go to OAuth as fallback
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const googleAuthUrl = `${API_URL}/auth/google/login?redirect_url=${encodeURIComponent(window.location.origin + '/signup-interface')}`;
      window.location.href = googleAuthUrl;
    }
  }, [showGoogleAccountPicker]);

  // Handle Facebook button click - check for saved accounts
  const handleFacebookClick = useCallback(() => {
    try {
      const stored = localStorage.getItem('facebook_accounts');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      
      if (stored) {
        const accounts = JSON.parse(stored);
        if (accounts && accounts.length > 0) {
          // Has saved accounts - trigger FacebookAccountPicker flow
          console.log('📱 Found', accounts.length, 'saved Facebook accounts, showing picker');
          showFacebookAccountPicker();
          return;
        }
      }
      
      // No saved accounts - go directly to Facebook OAuth
      console.log('🔵 No saved accounts, redirecting to Facebook OAuth');
      const facebookAuthUrl = `${API_URL}/auth/facebook/login?redirect_url=${encodeURIComponent(window.location.origin + '/signup-interface')}`;
      window.location.href = facebookAuthUrl;
    } catch (err) {
      console.error('Error checking Facebook accounts:', err);
      // On error, go to OAuth as fallback
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const facebookAuthUrl = `${API_URL}/auth/facebook/login?redirect_url=${encodeURIComponent(window.location.origin + '/signup-interface')}`;
      window.location.href = facebookAuthUrl;
    }
  }, [showFacebookAccountPicker]);
  
  // Get current display message
  const getCurrentMessage = () => {
    // If we have a message in state, use it (includes error messages formatted nicely)
    if (authState.message) {
      return authState.message;
    }
    
    // Show raw error as fallback
    if (authState.error) {
      return authState.error;
    }
    
    // Show appropriate message based on stage
    const hasVisited = sessionStorage.getItem('hasVisitedLanding');
    if (authState.stage === 'email_input') {
      return hasVisited ? getRandomWelcomeBackMessage() : getRandomWelcomeMessage();
    }
    
    // Default fallback
    return '';
  };

  return (
    <div className={`relative ${authState.stage === 'sales' ? 'h-screen' : 'min-h-screen'}`}>
      {/* Background with smooth transition */}
      <div className={`background-transition ${isTransitioning ? 'transitioning' : ''}`}>
        <div className={`background-layer ${backgroundType === 'ai' ? 'active' : 'inactive'}`}>
          <AIBackground />
        </div>
        <div className={`background-layer ${backgroundType === 'connected' ? 'active' : 'inactive'}`}>
          <ConnectedMindsBackground />
        </div>
        <div className={`background-layer ${backgroundType === 'deepSea' ? 'active' : 'inactive'}`}>
          <DeepSeaBackground />
        </div>
        <div className={`background-layer ${backgroundType === 'deepPurple' ? 'active' : 'inactive'}`}>
          <DeepPurpleSeaBackground />
        </div>
        <div className={`background-layer ${backgroundType === 'deepPink' ? 'active' : 'inactive'}`}>
          <DeepPinkSeaBackground />
        </div>
      </div>
      
      {/* Collaborative Cursor Animation - Show only in sales stage, hide when popup is open */}
      {authState.stage === 'sales' && (
        <>
          <CollaborativeToolAnimation className="fixed inset-0 z-40" />
          <style>{`
            body:not(.popup-open), 
            body:not(.popup-open) *, 
            body:not(.popup-open) *:hover {
              cursor: none !important;
            }
            
            /* Show pointer cursor on interactive elements in collaborative animation */
            body:not(.popup-open) .fixed.inset-0.z-40 button,
            body:not(.popup-open) .fixed.inset-0.z-40 .bg-white.rounded-xl {
              cursor: pointer !important;
            }
            
            /* Show pointer cursor on dropdown menus and ALL their children */
            body:not(.popup-open) .dropdown-menu,
            body:not(.popup-open) .dropdown-menu *,
            body:not(.popup-open) .dropdown-option,
            body:not(.popup-open) .dropdown-option *,
            body:not(.popup-open) .plus-button-menu .dropdown-menu,
            body:not(.popup-open) .plus-button-menu .dropdown-menu *,
            body:not(.popup-open) .plus-button-menu .dropdown-option,
            body:not(.popup-open) .plus-button-menu .dropdown-option *,
            body:not(.popup-open) .import-button-menu .dropdown-menu,
            body:not(.popup-open) .import-button-menu .dropdown-menu *,
            body:not(.popup-open) .import-button-menu .dropdown-option,
            body:not(.popup-open) .import-button-menu .dropdown-option * {
              cursor: pointer !important;
            }
            
            /* Hide collaborative animation when popup is open */
            body.popup-open .fixed.inset-0.z-40 {
              display: none !important;
            }
          `}</style>
        </>
      )}
      
      {/* Sticky Chat Interface - Show in sales stage */}
      {(showChatWindow || authState.stage === 'sales') && (
        <>
          <div className="chat-window-sticky">
            <StreamingChatInterface
              testMode={true}
              topOffset={0}
              placeholder="Tell me about your business challenge..."
              className="h-full"
              maxWidth="full"
              style={{ width: '45vw', minWidth: '420px', maxWidth: '800px' }}
              backgroundType={backgroundType}
              showGetStarted={authState.stage === 'sales'}
              userName={authState.name || authState.user?.name || ''}
              onGetStartedClick={() => {
                console.log('Get Started clicked in sales stage');
                // Add your Get Started logic here
              }}
            />
          </div>
          
          {/* Sales Control Panel - Right side, controlled by MCP */}
          <div className="sales-panel-sticky">
            <SalesControlPanel />
          </div>
        </>
      )}
      
      {/* Content overlay */}
      <div className={`relative flex flex-col ${authState.stage === 'sales' ? 'hidden' : 'min-h-screen'}`}>
        <Header 
          aiActive={authState.stage === 'sales'} 
          className={authState.stage === 'introduction' || authState.stage === 'sales' ? 'opacity-0' : 'opacity-100'}
        />
        
        {/* Center the chat interface - Add top padding for sticky header */}
        <div 
          className="flex-1 flex items-center justify-center p-8"
          style={{ paddingTop: '140px' }}
        >
          <div className="w-full max-w-[800px] flex flex-col" style={{ gap: '10px' }}>
            {/* Tiptap Typewriter - Hide when in sales stage */}
            {authState.stage !== 'sales' && (
              <TiptapTypewriter 
                key={typewriterKey} // Only remount when message actually changes
                text={getCurrentMessage()}
                speed={APP_CONFIG.typewriterSpeed}
                onComplete={handleTypewriterComplete}
                className="text-gray-900"
                style={{ 
                  fontFamily: APP_CONFIG.fonts.primary,
                  fontSize: '26px',
                  color: APP_CONFIG.colors.text,
              }}
              />
            )}
            
            {/* Chat Prompt - Hide when in sales stage or OAuth login */}
            {shouldShowChat && authState.stage !== 'sales' && authState.stage !== 'oauth_login' && (
              <div className={`transition-opacity duration-500 ${
                isNameInputStage && !showNameInput ? 'opacity-0' : 'opacity-100'
              }`}>
                <ChatPrompt 
                  onSubmit={handleMessage}
                  placeholder={getPlaceholder()}
                  type={getInputType()}
                  showSignupButton={authState.stage === 'email_input'}
                  onSignupClick={handleSignupClick}
                  showSalesDemoButton={authState.stage === 'email_input'}
                  onSalesDemoClick={handleSalesDemoClick}
                  showLaunchIdeaButton={authState.stage === 'email_input'}
                  onLaunchIdeaClick={handleLaunchIdeaClick}
                  showMakeMoneyButton={authState.stage === 'email_input'}
                  onMakeMoneyClick={handleMakeMoneyClick}
                  showGoogleButton={authState.stage === 'email_input'}
                  onGoogleClick={handleGoogleClick}
                  showFacebookButton={authState.stage === 'email_input'}
                  onFacebookClick={handleFacebookClick}
                />
              </div>
            )}
            
            {/* OAuth Account Picker - Google or Facebook based on provider */}
            {authState.stage === 'oauth_login' && (
              <div className="flex flex-col items-center gap-4 transition-opacity duration-500 opacity-100">
                {authState.oauth_provider === 'google' && (
                  <GoogleAccountPicker 
                    onAccountSelect={handleGoogleAccountSelect}
                    onAddAccount={() => {
                      setIsSignupPopupOpen(true);
                      setSignupPopupInitialView('options');
                    }}
                    className="scale-110"
                  />
                )}
                {authState.oauth_provider === 'facebook' && (
                  <FacebookAccountPicker 
                    onAccountSelect={handleFacebookAccountSelect}
                    onAddAccount={() => {
                      setIsSignupPopupOpen(true);
                      setSignupPopupInitialView('options');
                    }}
                    className="scale-110"
                  />
                )}
              </div>
            )}
            
            {/* New User Buttons - Hide when in sales stage */}
            {shouldShowButtonContainer && authState.stage !== 'sales' && (
              <div 
                className="flex flex-col items-center gap-4 mt-6"
                style={{ marginBottom: '200px', minHeight: '60px' }}
              >
                <div className="flex gap-8 justify-center">
                  <button
                    onClick={handleLoginChoice}
                    className={`flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 hover:scale-105 transition-all duration-500 shadow-md ${
                      showButtons ? 'opacity-100' : 'opacity-0'
                    }`}
                    style={{ maxHeight: '45px' }}
                  >
                    <LogIn className="w-5 h-5" />
                    {getLogMeInButtonText()}
                  </button>
              


                  <button
                    onClick={handleSignupChoice}
                    className={`flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all duration-500 ${
                      showButtons ? 'opacity-100' : 'opacity-0'
                    }`}
                    style={{ maxHeight: '45px',minWidth: '300px',maxWidth: '350px', justifyContent: 'center'    }}
                  >
                    <UserPlus className="w-5 h-5" />
                    {getYesPleaseButtonText()}
                  </button>
                </div>
                
                {/* Skip to Sales Mode Button */}
                <button
                  onClick={enterSalesMode}
                  className={`text-white/70 hover:text-white text-sm underline transition-all duration-500 ${
                    showButtons ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  {getContinueWithoutSignupText()}
                </button>
              </div>


            )}
            


            {/* Show user info when authenticated */}
            {authState.stage === 'authenticated' && authState.user && (
              <div className="mt-4 p-4 bg-white/10 backdrop-blur-sm rounded-lg">
                <p className="text-white text-lg">
                  Welcome, {authState.user.name}! 🎉
                </p>
                <p className="text-white/70 text-sm">
                  {authState.user.email}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Background transition styles */}
      <style>{`
        .background-transition {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -1;
        }
        
        .background-layer {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          transition: opacity 1s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .background-layer.active {
          opacity: 1;
        }
        
        .background-layer.inactive {
          opacity: 0;
        }
        
        .background-transition.transitioning .background-layer {
          transition: opacity 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        
        /* Chat Window Styles - Scrollable */
        .chat-window-sticky {
          position: absolute;
          left: 20px;
          top: 0;
          z-index: 5;
          width: 45vw; /* 45% of viewport width */
          min-width: 420px; /* Minimum width for usability */
          max-width: 800px; /* Maximum width for very large screens */
          height: 100vh;
          padding: 0;
          margin: 0;
          animation: slideInLeft 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        @keyframes slideInLeft {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }
        
        /* Sales Control Panel - Right side */
        .sales-panel-sticky {
          position: absolute;
          right: 0;
          top: 0;
          z-index: 1;
          width: 55%; /* 55% of viewport width as requested */
          height: 100vh;
          padding: 0;
          margin: 0;
          animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        
        /* Responsive chat window */
        @media (max-width: 1400px) {
          .chat-window-sticky {
            left: 10px;
            width: 50vw; /* 50% of viewport on medium-large screens */
            max-width: 700px;
          }
        }
        
        @media (max-width: 1200px) {
          .chat-window-sticky {
            left: 10px;
            width: 55vw; /* 55% of viewport on medium screens */
            max-width: 600px;
          }
        }
        
        @media (max-width: 1024px) {
          .chat-window-sticky {
            left: 10px;
            width: 60vw; /* 60% of viewport on smaller screens */
            max-width: 500px;
          }
        }
        
        @media (max-width: 768px) {
          .chat-window-sticky {
            position: fixed;
            left: 10px;
            right: 10px;
            top: auto;
            bottom: 20px;
            transform: none;
            width: auto;
            max-height: 60vh;
            animation: slideInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          }
          
          .sales-panel-sticky {
            position: fixed;
            right: 10px;
            left: 10px;
            top: 10px;
            width: auto;
            max-height: 35vh;
            animation: slideInDown 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          }
        }
        
        @keyframes slideInDown {
          from {
            transform: translateY(-100%);
          }
          to {
            transform: translateY(0);
          }
        }
        
        @keyframes slideInUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
      `}</style>
      
      {/* Signup Popup */}
      <SignupPopup 
        isOpen={isSignupPopupOpen}
        onClose={() => {
          setIsSignupPopupOpen(false);
          setSignupPopupInitialView('main');
        }}
        initialView={signupPopupInitialView}
        userName={authState.name || ''}
      />
    </div>
  );
}

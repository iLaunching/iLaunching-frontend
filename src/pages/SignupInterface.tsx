import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authApi } from '../api/auth';
import { useAuthStore } from '@/store/authStore';
import { 
  getRandomEmailSignupMessage, 
  getRandomGoogleSignupMessage, 
  getRandomFacebookSignupMessage, 
  getRandomMicrosoftSignupMessage 
} from '@/i18n/messageHelpers';
import BackgroundImage from '../components/BackgroundImage';
import Header from '@/components/layout/Header';
import GuardedTypewriter from '@/components/GuardedTypewriter';

const SignupInterface = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(['messages', 'common']);
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isProcessing, setIsProcessing] = useState(true);
  const [message, setMessage] = useState('');
  const [showButton, setShowButton] = useState(false);
  const [editorInstance, setEditorInstance] = useState<any>(null);
  const [hasCompleted, setHasCompleted] = useState(false);

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

  // Congratulation messages for different providers
  const getCongratsMessage = (providerName: string) => {
    const messages = {
      google: getRandomGoogleSignupMessage(),
      facebook: getRandomFacebookSignupMessage(),
      microsoft: getRandomMicrosoftSignupMessage(),
      email: getRandomEmailSignupMessage(),
      default: `<h1>Welcome to the network! 🎉</h1><p>Your account is ready!</p><hr /><p>I'm building your personal hub inside our global network right now...</p><p>✨ <strong>You're joining thousands of creators</strong> who are already launching their dreams.</p>`
    };
    return messages[providerName as keyof typeof messages] || messages.default;
  };

  const handleTypewriterComplete = () => {
    if (hasCompleted) {
      console.log('⏭️ Already completed, skipping...');
      return;
    }
    
    console.log('🎯 Typewriter completed, waiting 1 second...');
    setHasCompleted(true);
    
    setTimeout(() => {
      if (editorInstance) {
        console.log('📝 Appending completion message...');
        
        // Create completion message nodes using ProseMirror schema
        // This approach doesn't trigger re-initialization like insertContent does
        const { state, view } = editorInstance;
        const { tr, schema } = state;
        
        // Get the end position (before the last closing tag)
        const endPos = state.doc.content.size;
        
        // Create nodes for the completion message
        const hrNode = schema.nodes.horizontalRule.create();
        const h2Node = schema.nodes.heading.create(
          { level: 2 },
          schema.text(t('messages:completion.title'))
        );
        const pNode = schema.nodes.paragraph.create(
          null,
          schema.text(t('messages:completion.subtitle'))
        );
        
        // Insert nodes at the end
        tr.insert(endPos, [hrNode, h2Node, pNode]);
        
        // Apply the transaction
        view.dispatch(tr);
        
        console.log('📝 Completion message appended using transaction');
        
        // Show button after a short delay
        setTimeout(() => {
          setShowButton(true);
        }, 500);
      }
    }, 1000);
  };

  const handleGetStarted = () => {
    console.log('🚀 User clicked Get Started');
    navigate('/onboarding');
  };

  useEffect(() => {
    // Optimize: Start data fetching immediately, don't wait for image
    const initializeAuth = async () => {
      // Check for URL parameters
      const params = new URLSearchParams(window.location.search);
      const action = params.get('action');
      const provider = params.get('provider');
      
      // Handle email signup redirect (from SignupPopup after verification)
      if (action === 'signup' && provider === 'email') {
        console.log('Email signup detected, showing welcome message');
        
        try {
          // Fetch user info to confirm authentication
          const response = await authApi.getMe();
          console.log('User authenticated via email:', response.user);
          
          // Update auth store with user data and tokens from localStorage
          const accessToken = localStorage.getItem('access_token');
          const refreshToken = localStorage.getItem('refresh_token');
          if (accessToken && refreshToken) {
            setAuth(response.user, accessToken, refreshToken);
            console.log('✅ Auth store updated with user and tokens');
          }
          
          // Set message for email signup
          setMessage(getCongratsMessage('email'));
          setIsProcessing(false);
          
          // Clean up URL parameters
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error) {
          console.error('Failed to fetch user info:', error);
          setMessage('Authentication succeeded but failed to load your profile. Please try again.');
          setIsProcessing(false);
        }
        
        return; // Exit early to prevent OAuth handling
      }
      
      // Handle OAuth callback
      const oauthResult = authApi.handleOAuthCallback();
      
      if (oauthResult.success) {
        console.log('OAuth authentication successful:', {
          action: oauthResult.action,
          provider: oauthResult.provider
        });
        
        try {
          // Fetch user info to confirm authentication
          const response = await authApi.getMe();
          console.log('User authenticated via OAuth:', response.user);
          console.log('🔍 Onboarding status:', response.user.onboarding_completed);
          console.log('🔍 Type:', typeof response.user.onboarding_completed);
          
          // Save Google account to localStorage for account picker
          if (oauthResult.provider === 'google' && response.user) {
            try {
              const existingAccounts = JSON.parse(localStorage.getItem('google_accounts') || '[]');
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
              
              const accountExists = existingAccounts.some((acc: any) => acc.email === newAccount.email);
              if (!accountExists) {
                existingAccounts.push(newAccount);
              } else {
                // Update lastUsed timestamp for existing account
                const accountIndex = existingAccounts.findIndex((acc: any) => acc.email === newAccount.email);
                if (accountIndex !== -1) {
                  existingAccounts[accountIndex].lastUsed = Date.now();
                }
              }
              localStorage.setItem('google_accounts', JSON.stringify(existingAccounts));
              console.log('✅ Saved Google account to localStorage from SignupInterface:', newAccount.email);
            } catch (err) {
              console.error('❌ Failed to save Google account from SignupInterface:', err);
            }
          }
          
          // Save Facebook account to localStorage for account picker
          if (oauthResult.provider === 'facebook' && response.user) {
            try {
              const existingAccounts = JSON.parse(localStorage.getItem('facebook_accounts') || '[]');
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
              
              const accountExists = existingAccounts.some((acc: any) => acc.email === newAccount.email);
              if (!accountExists) {
                existingAccounts.push(newAccount);
              } else {
                // Update lastUsed timestamp for existing account
                const accountIndex = existingAccounts.findIndex((acc: any) => acc.email === newAccount.email);
                if (accountIndex !== -1) {
                  existingAccounts[accountIndex].lastUsed = Date.now();
                }
              }
              localStorage.setItem('facebook_accounts', JSON.stringify(existingAccounts));
              console.log('✅ Saved Facebook account to localStorage from SignupInterface:', newAccount.email);
            } catch (err) {
              console.error('❌ Failed to save Facebook account from SignupInterface:', err);
            }
          }
          
          // Update auth store with user data and tokens from localStorage
          const accessToken = localStorage.getItem('access_token');
          const refreshToken = localStorage.getItem('refresh_token');
          if (accessToken && refreshToken) {
            setAuth(response.user, accessToken, refreshToken);
            console.log('✅ Auth store updated with user and tokens');
          }
          
          // Trigger workflow based on action type and provider
          if (oauthResult.action === 'signup') {
            // New user from OAuth signup
            console.log(`New user signup via ${oauthResult.provider} - showing signup interface`);
            
            // Set message ONCE - this prevents re-initialization
            setMessage(getCongratsMessage(oauthResult.provider || 'default'));
            setIsProcessing(false);
            
            // Stay on signup-interface page for new signups
            console.log('🔵 Staying on signup-interface for new signup');
          } else if (oauthResult.action === 'login') {
            // Existing user login via OAuth - redirect immediately, don't show interface
            console.log(`Existing user login via ${oauthResult.provider} - redirecting immediately`);
            
            // Check if onboarding is needed and redirect immediately
            if (response.user.onboarding_completed === false) {
              console.log('🔵 Redirecting to onboarding');
              navigate('/onboarding');
            } else {
              console.log('🔵 Redirecting to smart-hub');
              navigate('/smart-hub');
            }
          }
        } catch (error) {
          console.error('Failed to fetch user info:', error);
          setMessage('Authentication succeeded but failed to load your profile. Please try again.');
          setIsProcessing(false);
        }
      } else if (oauthResult.error) {
        console.error('OAuth authentication failed:', oauthResult.error);
        setMessage(`Authentication failed: ${oauthResult.error}`);
        setIsProcessing(false);
      } else {
        // No OAuth callback detected - stay on page for manual handling
        console.log('No OAuth parameters detected in URL');
        setMessage('Waiting for authentication...');
        setIsProcessing(false);
      }
    };

    // Start auth initialization immediately
    initializeAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-gray-900">
      {/* Background Image - Always rendered to prevent white flash */}
      <BackgroundImage 
        opacity={1}
        overlay={true}
        overlayColor="bg-black/60"
      />
      
      {/* Header - Always visible */}
      <div className="fixed top-0 left-0 right-0 z-20">
        <Header aiActive={false} className="relative" hideLogo={true} textColor="text-white" />
      </div>

      {/* Main Content - Always visible, no delays */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 pt-20 min-h-screen">
        {!isProcessing && message && (
          <div className="w-full max-w-2xl space-y-6 animate-fade-in">
              <GuardedTypewriter
                text={message}
                speed={30}
                className="tiptap-content"
                style={{
                  backgroundColor: 'transparent',
                  color: 'white',
                  fontSize: '1.5rem',
                  lineHeight: '1.75',
                  fontFamily: "'Work Sans', sans-serif"
                }}
                onComplete={handleTypewriterComplete}
                onEditorReady={setEditorInstance}
              />
              
              {showButton && (
                <div className="flex justify-center animate-fade-in">
                  <button
                    onClick={handleGetStarted}
                    className="px-8 py-4 bg-white text-black font-semibold rounded-xl hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                    style={{ fontFamily: "'Work Sans', sans-serif" }}
                  >
                    🚀 {t('common:buttons.getStarted')}
                  </button>
                </div>
              )}
            </div>
          )}
          
          {isProcessing && (
            <div className="flex items-center justify-center">
              <div className="inline-block">
                <svg 
                  className="animate-spin h-12 w-12 text-white" 
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
          )}
        </div>

      {/* CSS for animations */}
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
};

export default SignupInterface;

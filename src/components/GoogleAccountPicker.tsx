import { useEffect, useState } from 'react';

interface GoogleAccount {
  id: string;
  email: string;
  name: string;
  picture: string;
  lastUsed?: number; // Timestamp of last use
}

interface GoogleAccountPickerProps {
  onAccountSelect: (account: GoogleAccount) => void;
  onAddAccount?: () => void;
  className?: string;
}

/**
 * GoogleAccountPicker Component
 * Shows previously used Google accounts with custom styling (like Canva)
 * Stores account info in localStorage after first OAuth
 */
export default function GoogleAccountPicker({ 
  onAccountSelect,
  onAddAccount,
  className = '' 
}: GoogleAccountPickerProps) {
  const [savedAccounts, setSavedAccounts] = useState<GoogleAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load previously used accounts from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('google_accounts');
      if (stored) {
        const accounts = JSON.parse(stored);
        // Sort by lastUsed timestamp (most recent first)
        const sortedAccounts = accounts.sort((a: any, b: any) => 
          (b.lastUsed || 0) - (a.lastUsed || 0)
        );
        setSavedAccounts(sortedAccounts);
        console.log('✅ Loaded saved accounts:', sortedAccounts.length, 'sorted by lastUsed');
      }
    } catch (err) {
      console.error('Error loading saved accounts:', err);
    }
    setIsLoading(false);
  }, []);

  const getDisplayName = (account: GoogleAccount) => {
    // If name exists and is different from email, extract first and last name
    if (account.name && account.name !== account.email) {
      const nameParts = account.name.trim().split(/\s+/);
      if (nameParts.length >= 2) {
        // Return first name and last name with space
        return `${nameParts[0]} ${nameParts[nameParts.length - 1]}`;
      }
      return account.name;
    }
    // Otherwise extract first part of email before @
    return account.email.split('@')[0];
  };

  const handleAccountClick = (account: GoogleAccount) => {
    console.log('🔐 Selected account:', account.email);
    onAccountSelect(account);
  };

  const handleAddAccount = () => {
    console.log('➕ Adding new Google account');
    if (onAddAccount) {
      // Use callback if provided (e.g., to open SignupPopup)
      onAddAccount();
    } else {
      // Fallback: Direct redirect to Google OAuth
      const backendUrl = import.meta.env.VITE_API_URL || 'https://auth-server-production-b51c.up.railway.app/api/v1';
      const googleLoginUrl = `${backendUrl}/auth/google/login`;
      window.location.href = googleLoginUrl;
    }
  };

  const handleGoogleAuth = () => {
    console.log('🔐 Redirecting to Google OAuth');
    const backendUrl = import.meta.env.VITE_API_URL || 'https://auth-server-production-b51c.up.railway.app/api/v1';
    const googleLoginUrl = `${backendUrl}/auth/google/login`;
    window.location.href = googleLoginUrl;
  };

  const handleRemoveAccounts = () => {
    console.log('🗑️ Removing all saved accounts');
    localStorage.removeItem('google_accounts');
    setSavedAccounts([]);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-2">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/50"></div>
        <p className="text-white/60 text-sm" style={{ fontFamily: 'Work Sans' }}>Loading accounts...</p>
      </div>
    );
  }

  return (
    <div 
      className={`google-account-picker ${className}`}
      style={{
        animation: 'fadeInSlide 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards',
      }}
    >
      <style>{`
        @keyframes fadeInSlide {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      <div className="bg-transparent rounded-2xl p-6 w-[50vw] mx-auto" style={{ fontFamily: 'Work Sans' }}>
        {/* Section 1: Account List in Row Layout */}
        <div className="flex justify-center overflow-x-auto gap-3 pb-2 mb-6 pt-4 scrollbar-hide">
          {savedAccounts.map((account, index) => (
            <div
              key={account.id}
              className={`flex-shrink-0 flex flex-col items-center gap-3 p-5 bg-white rounded-xl transition-all duration-200 relative group shadow-md hover:shadow-lg`}
              style={{ fontFamily: 'Work Sans', width:"300px", height:'270px', padding:'30px'}}
            >
              <img
                src={account.picture}
                alt={account.name}
                className={`w-20 h-20 rounded-full border-2 ${
                  index === 0 
                    ? 'border-blue-400/50 group-hover:border-blue-400/70' 
                    : 'border-gray-200 group-hover:border-gray-300'
                }`}
              />
              <div className="w-full text-center flex-1">
                <p className="font-medium text-black text-3xl truncate mt-2" style={{ fontFamily: 'Work Sans' }}>{getDisplayName(account)}</p>
                {index === 0 && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] px-2 py-0.5 rounded-full text-black whitespace-nowrap" style={{ backgroundColor: '#C3EAC4', fontFamily: 'Work Sans' }}>
                    Last used
                  </span>
                )}
                <p className="text-2sm text-gray-600 truncate mt-1" style={{ fontFamily: 'Work Sans' }}>{account.email}</p>
              </div>
              <button
                onClick={() => handleAccountClick(account)}
                className="w-full py-2 px-4 rounded-lg text-white text-sm font-medium transition-colors duration-200"
                style={{ backgroundColor: '#8B3DFF', fontFamily: 'Work Sans' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7029CC'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#8B3DFF'}
              >
                Select
              </button>
            </div>
          ))}
        </div>
        
        {/* Continue with Google Button - Only show when no accounts */}
        {savedAccounts.length === 0 && (
          <div className="flex justify-center mb-6">
            <button
              onClick={handleGoogleAuth}
              className="w-full flex items-center py-3 px-4 border border-gray-300 rounded-xl hover:bg-gray-100 transition-colors duration-50 relative bg-white max-w-[350px]"
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
              <span className="text-sm font-medium text-gray-700 w-full text-center" style={{ fontFamily: 'Work Sans' }}>Continue with Google</span>
            </button>
          </div>
        )}
        
        {/* Section 2: Use Another Account Button - Centered */}
        <div className="flex justify-center mb-6">
          <button
            onClick={handleAddAccount}
            className="w-fit-content flex items-center justify-center gap-2 py-2 px-4 border border-gray-300 rounded-xl hover:bg-gray-100 transition-colors duration-50 bg-white"
            style={{ fontFamily: 'Work Sans'}}
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span className="text-sm font-medium text-gray-700" style={{ fontFamily: 'Work Sans' }}>Continue with another account</span>
          </button>
        </div>
        
        {/* Section 3: Remove Accounts Button - Text with Icon */}
        {savedAccounts.length > 0 && (
          <div className="flex justify-center pt-2">
            <button
              onClick={handleRemoveAccounts}
              className="flex items-center gap-2 transition-colors duration-200 group"
              style={{ color: '#8B3DFF' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#7029CC'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#8B3DFF'}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span className="text-sm underline" style={{ fontFamily: 'Work Sans' }}>Remove accounts</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

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
  className?: string;
}

/**
 * GoogleAccountPicker Component
 * Shows previously used Google accounts with custom styling (like Canva)
 * Stores account info in localStorage after first OAuth
 */
export default function GoogleAccountPicker({ 
  onAccountSelect,
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
    // Redirect to Google OAuth to add a new account
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
        <p className="text-white/60 text-sm">Loading accounts...</p>
      </div>
    );
  }

  return (
    <div className={`google-account-picker ${className}`}>
      <div className="bg-transparent rounded-2xl p-6 w-fit max-w-md mx-auto">
        {/* Section 1: Account List in Row Layout */}
        <div className="flex overflow-x-auto gap-3 pb-2 mb-6 pt-4 scrollbar-hide">
          {savedAccounts.map((account, index) => (
            <div
              key={account.id}
              className={`flex-shrink-0 flex flex-col items-center gap-3 p-5 bg-white rounded-xl transition-all duration-200 relative group`}
              style={{ fontFamily: 'Work Sans', minWidth:'120px', width:'fit-content', height:'200px'}}
            >
              <img
                src={account.picture}
                alt={account.name}
                className={`w-16 h-16 rounded-full border-2 ${
                  index === 0 
                    ? 'border-blue-400/50 group-hover:border-blue-400/70' 
                    : 'border-gray-200 group-hover:border-gray-300'
                }`}
              />
              <div className="w-full text-center flex-1">
                <p className="font-bold text-black text-sm truncate">{getDisplayName(account)}</p>
                {index === 0 && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] px-2 py-0.5 rounded-full text-black whitespace-nowrap" style={{ backgroundColor: '#C3EAC4', fontFamily: 'Work Sans' }}>
                    Last used
                  </span>
                )}
                <p className="text-xs text-gray-600 truncate mt-1">{account.email}</p>
              </div>
              <button
                onClick={() => handleAccountClick(account)}
                className="w-full py-2 px-4 rounded-lg text-white text-sm font-medium transition-colors duration-200"
                style={{ backgroundColor: '#8B3DFF' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7029CC'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#8B3DFF'}
              >
                Select
              </button>
            </div>
          ))}
        </div>
        
        {/* Section 2: Use Another Account Button - Centered */}
        <div className="flex justify-center mb-6">
          <button
            onClick={handleAddAccount}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-gray-300 rounded-xl hover:bg-gray-100 transition-colors duration-50 bg-white"
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span className="text-sm font-medium text-gray-700">Continue with another account</span>
          </button>
        </div>
        
        {/* Section 3: Remove Accounts Button - Text with Icon */}
        {savedAccounts.length > 0 && (
          <div className="flex justify-center pt-4 border-t border-white/10">
            <button
              onClick={handleRemoveAccounts}
              className="flex items-center gap-2 text-white/60 hover:text-white/90 transition-colors duration-200 group"
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
              <span className="text-sm underline">Remove accounts</span>
            </button>
          </div>
        )}
        
        {savedAccounts.length === 0 && (
          <div className="text-center py-6 -mt-2">
            <p className="text-white/40 text-xs">Sign in with Google to save your account for next time</p>
          </div>
        )}
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import VariousMenus from './VariousMenus';

interface FacebookAccount {
  id: string;
  email: string;
  name: string;
  picture: string;
  lastUsed?: number; // Timestamp of last use
}

interface FacebookAccountPickerProps {
  onAccountSelect: (account: FacebookAccount) => void;
  onAddAccount?: () => void;
  className?: string;
}

/**
 * FacebookAccountPicker Component
 * Shows previously used Facebook accounts with custom styling (like Canva)
 * Stores account info in localStorage after first OAuth
 */
export default function FacebookAccountPicker({ 
  onAccountSelect,
  onAddAccount,
  className = '' 
}: FacebookAccountPickerProps) {
  const [savedAccounts, setSavedAccounts] = useState<FacebookAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isVariousMenusOpen, setIsVariousMenusOpen] = useState(false);

  // Get API URL from environment
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  // Load previously used accounts from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('facebook_accounts');
      if (stored) {
        const accounts = JSON.parse(stored);
        // Sort by lastUsed timestamp (most recent first)
        const sortedAccounts = accounts.sort((a: any, b: any) => 
          (b.lastUsed || 0) - (a.lastUsed || 0)
        );
        setSavedAccounts(sortedAccounts);
        console.log('✅ Loaded saved Facebook accounts:', sortedAccounts.length, 'sorted by lastUsed');
      }
    } catch (err) {
      console.error('Error loading saved Facebook accounts:', err);
    }
    setIsLoading(false);
  }, []);

  const getDisplayName = (account: FacebookAccount) => {
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

  const handleAccountClick = (account: FacebookAccount) => {
    console.log('🔐 Selected Facebook account:', account.email);
    onAccountSelect(account);
  };

  const handleAddAccount = () => {
    console.log('➕ Adding new Facebook account');
    if (onAddAccount) {
      // Use callback if provided (e.g., to open SignupPopup)
      onAddAccount();
    } else {
      // Fallback: Direct redirect to Facebook OAuth
      const facebookAuthUrl = `${API_URL}/auth/facebook/login?redirect_url=${encodeURIComponent(window.location.origin + '/signup-interface')}`;
      window.location.href = facebookAuthUrl;
    }
  };

  const handleFacebookAuth = () => {
    // Redirect to backend OAuth endpoint
    const facebookAuthUrl = `${API_URL}/auth/facebook/login?redirect_url=${encodeURIComponent(window.location.origin + '/signup-interface')}`;
    window.location.href = facebookAuthUrl;
  };

  const handleRemoveAccounts = () => {
    console.log('🗑️ Opening remove accounts menu');
    setIsVariousMenusOpen(true);
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
      className={`facebook-account-picker ${className}`}
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
              style={{ fontFamily: 'Work Sans', minWidth:'30%', maxWidth:'38%',width:"100%", height:'270px', padding:'30px'}}
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
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-xs px-3 py-1 rounded-full text-black whitespace-nowrap" style={{ backgroundColor: '#C3EAC4', fontFamily: 'Work Sans' }}>
                    Last used
                  </span>
                )}
                <p className="text-2sm text-gray-600 truncate mt-1" style={{ fontFamily: 'Work Sans' }}>{account.email}</p>
              </div>
              <button
                onClick={() => handleAccountClick(account)}
                className="w-full py-2 px-4 rounded-lg text-white text-sm font-medium transition-colors duration-200"
                style={{ backgroundColor: '#1877F2', fontFamily: 'Work Sans' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#166FE5'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1877F2'}
              >
                Select
              </button>
            </div>
          ))}
        </div>
        
        {/* Continue with Facebook Button - Only show when no accounts */}
        {savedAccounts.length === 0 && (
          <div className="flex justify-center mb-6">
            <button
              onClick={handleFacebookAuth}
              className="w-full flex items-center py-3 px-4 border border-gray-300 rounded-xl hover:bg-gray-100 transition-colors duration-50 relative bg-white max-w-[350px]"
            >
              <svg className="w-5 h-5 absolute left-4" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span className="text-sm font-medium text-gray-700 w-full text-center" style={{ fontFamily: 'Work Sans' }}>Continue with Facebook</span>
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
              style={{ color: '#1877F2' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#166FE5'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#1877F2'}
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
      
      {/* VariousMenus Popup */}
      <VariousMenus
        isOpen={isVariousMenusOpen}
        onClose={() => {
          setIsVariousMenusOpen(false);
          // Refresh accounts after closing
          const stored = localStorage.getItem('facebook_accounts');
          if (stored) {
            const accounts = JSON.parse(stored);
            const sortedAccounts = accounts.sort((a: any, b: any) => 
              (b.lastUsed || 0) - (a.lastUsed || 0)
            );
            setSavedAccounts(sortedAccounts);
          } else {
            setSavedAccounts([]);
          }
        }}
        provider="facebook"
      />
    </div>
  );
}

import { X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface Account {
  id: string;
  email: string;
  name: string;
  picture: string;
  avatarColor?: string;
  lastUsed?: number;
}

interface VariousMenusProps {
  isOpen: boolean;
  onClose: () => void;
  provider: 'google' | 'facebook';
  onAccountsChanged?: () => void;
}

const VariousMenus = ({ isOpen, onClose, provider, onAccountsChanged }: VariousMenusProps) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<Set<string>>(new Set());

  // Load accounts from localStorage
  useEffect(() => {
    if (isOpen) {
      const storageKey = `${provider}_accounts`;
      const storedAccounts = localStorage.getItem(storageKey);
      if (storedAccounts) {
        try {
          const parsedAccounts = JSON.parse(storedAccounts);
          setAccounts(parsedAccounts);
        } catch (error) {
          console.error('Error parsing accounts:', error);
          setAccounts([]);
        }
      } else {
        setAccounts([]);
      }
      setSelectedAccounts(new Set());
    }
  }, [isOpen, provider]);

  const handleAccountToggle = (accountId: string) => {
    setSelectedAccounts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(accountId)) {
        newSet.delete(accountId);
      } else {
        newSet.add(accountId);
      }
      return newSet;
    });
  };

  const handleRemoveSelected = () => {
    const storageKey = `${provider}_accounts`;
    const remainingAccounts = accounts.filter(acc => !selectedAccounts.has(acc.id));
    localStorage.setItem(storageKey, JSON.stringify(remainingAccounts));
    setAccounts(remainingAccounts);
    setSelectedAccounts(new Set());
    
    // Notify parent component
    if (onAccountsChanged) {
      onAccountsChanged();
    }
    
    // Close if no accounts left
    if (remainingAccounts.length === 0) {
      onClose();
    }
  };

  const getDisplayName = (account: Account) => {
    if (account.name) {
      const nameParts = account.name.trim().split(/\s+/);
      if (nameParts.length >= 2) {
        return `${nameParts[0]} ${nameParts[nameParts.length - 1]}`;
      }
      return account.name;
    }
    return account.email.split('@')[0];
  };

  if (!isOpen) return null;

  const providerName = provider === 'google' ? 'Google' : 'Facebook';

  return createPortal(
    <>
      <style>{`
        @keyframes slideInFromRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
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
              fontFamily: "'Work Sans', sans-serif"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-1 relative" style={{ minWidth: '380px', maxWidth: '440px', minHeight: '600px' }}>
              
              {/* Content */}
              <div className="absolute inset-0 flex flex-col">
                {/* Header */}
                <div className="px-8 pt-8 pb-6">
                  <h2 className="text-2xl font-semibold text-black mb-2">
                    Remove {providerName} Accounts
                  </h2>
                  <p className="text-gray-700 text-sm">
                    Select the accounts you want to remove from this device
                  </p>
                </div>

                {/* Accounts List */}
                <div className="flex-1 overflow-y-auto px-8 pb-6">
                  <div className="space-y-3">
                    {accounts.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No {providerName} accounts found
                      </div>
                    ) : (
                      accounts.map((account) => (
                        <div
                          key={account.id}
                          onClick={() => handleAccountToggle(account.id)}
                          className={`flex items-center gap-3 p-3 border-2 rounded-xl cursor-pointer transition-all ${
                            selectedAccounts.has(account.id)
                              ? 'border-red-500 bg-red-50'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {/* Checkbox */}
                          <div
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                              selectedAccounts.has(account.id)
                                ? 'bg-red-500 border-red-500'
                                : 'border-gray-300'
                            }`}
                          >
                            {selectedAccounts.has(account.id) && (
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>

                          {/* Avatar */}
                          <img
                            src={account.picture}
                            alt={account.name}
                            className="w-10 h-10 rounded-full border-2 border-gray-200"
                          />

                          {/* Account Info */}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-black truncate">{getDisplayName(account)}</p>
                            <p className="text-sm text-gray-600 truncate">{account.email}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Footer with Remove Button */}
                {accounts.length > 0 && (
                  <div className="px-8 py-6 border-t border-gray-200 bg-gray-50">
                    <button
                      onClick={handleRemoveSelected}
                      disabled={selectedAccounts.size === 0}
                      className={`w-full py-3 px-4 rounded-xl font-medium transition-all ${
                        selectedAccounts.size === 0
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-red-500 text-white hover:bg-red-600 active:scale-95'
                      }`}
                    >
                      Remove Selected Accounts ({selectedAccounts.size})
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Image Section */}
            <div 
              className="hidden md:block flex-1 relative overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600"
              style={{ minWidth: '400px' }}
            >
              <img 
                src="/signup_poup1.png"
                alt="Welcome to iLaunching"
                className="absolute inset-0 w-full h-full object-cover"
                loading="eager"
                fetchPriority="high"
                decoding="sync"
                style={{ 
                  imageRendering: 'crisp-edges',
                  willChange: 'transform'
                }}
              />
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
    </>,
    document.body
  );
};

export default VariousMenus;

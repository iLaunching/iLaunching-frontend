import { X, Trash2 } from 'lucide-react';
import { useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import OnboardingAiHeader from './OnboardingAiHeader';
import SimpleTypewriter from './SimpleTypewriter';
import { APP_CONFIG } from '@/constants';
import api from '@/lib/api';

type DeleteContext = 'smart-hub' | 'user' | 'project' | 'team-member' | 'matrix' | 'journey' | 'generic';

interface DeleteStageConfig {
  message: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  requiresInput?: boolean;
  inputPlaceholder?: string;
  showAdditionalContent?: boolean;
  additionalContent?: React.ReactNode;
}

interface DeleteMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (inputValue?: string) => void;
  menuColor: string;
  textColor: string;
  borderLineColor: string;
  globalHoverColor: string;
  chatBk1?: string;
  solidColor?: string;
  buttonHoverColor?: string;
  aiAcknowledgeTextColor?: string;
  dangerButtonTextColor: string;
  dangerButtonColor: string;
  dangerButtonHoverColor: string;
  dangerButtonSolidColor?: string;
  dangerToneBk?: string;
  dangerToneBorder?: string;
  dangerToneText?: string;
  dangerBkLightColor?: string;
  dangerBkSolidColor?: string;
  dangerBkSolidTextColor?: string;
  context: DeleteContext;
  itemName?: string;
  stages?: DeleteStageConfig[];
  customMessage?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  smartHubsCount?: number;
  isDefaultSmartHub?: boolean;
  smartHubId?: string;
  smartHubs?: Array<{
    id: string;
    name: string;
    hub_color_id: number;
    color?: string;
    journey?: string;
  }>;
}

export default function DeleteMenu({
  isOpen,
  onClose,
  onConfirm,
  menuColor,
  textColor,
  borderLineColor,
  globalHoverColor,
  chatBk1,
  solidColor,
  buttonHoverColor,
  aiAcknowledgeTextColor,
  dangerButtonColor,
  dangerButtonTextColor,
  dangerButtonHoverColor,
  dangerButtonSolidColor,
  dangerToneBk,
  dangerToneBorder,
  dangerToneText,
  dangerBkLightColor,
  dangerBkSolidColor,
  dangerBkSolidTextColor,
  context,
  itemName,
  stages,
  customMessage,
  confirmButtonText: propConfirmButtonText,
  cancelButtonText: propCancelButtonText,
  smartHubsCount = 1,
  isDefaultSmartHub = false,
  smartHubId,
  smartHubs = []
}: DeleteMenuProps) {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [showTypewriter, setShowTypewriter] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [showMovingAi, setShowMovingAi] = useState(false);
  const [showAcknowledge, setShowAcknowledge] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [acknowledgeMessage, setAcknowledgeMessage] = useState('Processing...');
  const hasCompletedRef = useRef(false);

  // Get default stages based on context
  const getDefaultStages = useCallback((): DeleteStageConfig[] => {
    switch (context) {
      case 'smart-hub':
        return [
          {
            message: customMessage || `Are you sure you want to delete ${itemName ? `"${itemName}"` : 'this Smart Hub'}? This action cannot be undone.`,
            confirmButtonText: propConfirmButtonText || 'Delete Smart Hub',
            cancelButtonText: propCancelButtonText || 'Cancel'
          }
        ];
      case 'user':
        return [
          {
            message: customMessage || `Are you sure you want to delete ${itemName ? `"${itemName}"` : 'this user'}? All their data will be permanently removed.`,
            confirmButtonText: propConfirmButtonText || 'Delete User',
            cancelButtonText: propCancelButtonText || 'Cancel'
          }
        ];
      case 'project':
        return [
          {
            message: customMessage || `Delete ${itemName ? `"${itemName}"` : 'this project'}? This will remove all associated data and cannot be undone.`,
            confirmButtonText: propConfirmButtonText || 'Delete Project',
            cancelButtonText: propCancelButtonText || 'Cancel'
          }
        ];
      case 'team-member':
        return [
          {
            message: customMessage || `Remove ${itemName ? `"${itemName}"` : 'this member'} from the team? They will lose access to all shared resources.`,
            confirmButtonText: propConfirmButtonText || 'Remove Member',
            cancelButtonText: propCancelButtonText || 'Cancel'
          }
        ];
      case 'matrix':
        return [
          {
            message: customMessage || `Delete ${itemName ? `"${itemName}"` : 'this Smart Matrix'}? All progress and data will be lost.`,
            confirmButtonText: propConfirmButtonText || 'Delete Matrix',
            cancelButtonText: propCancelButtonText || 'Cancel'
          }
        ];
      case 'journey':
        return [
          {
            message: customMessage || `Are you sure you want to delete ${itemName ? `"${itemName}"` : 'this journey'}? This cannot be reversed.`,
            confirmButtonText: propConfirmButtonText || 'Delete Journey',
            cancelButtonText: propCancelButtonText || 'Cancel'
          }
        ];
      case 'generic':
      default:
        return [
          {
            message: customMessage || `Are you sure you want to delete ${itemName ? `"${itemName}"` : 'this item'}?`,
            confirmButtonText: propConfirmButtonText || 'Delete',
            cancelButtonText: propCancelButtonText || 'Cancel'
          }
        ];
    }
  }, [context, itemName, customMessage, propConfirmButtonText, propCancelButtonText]);

  const activeStages = stages || getDefaultStages();
  const currentStage = activeStages[currentStageIndex];

  // Reset and show typewriter when modal opens or stage changes
  useEffect(() => {
    if (isOpen) {
      setShowTypewriter(false);
      setShowPrompt(false);
      setInputValue('');
      setShowMovingAi(false);
      setShowAcknowledge(false);
      setAnimationComplete(false);
      hasCompletedRef.current = false;
      
      // Start typewriter after a short delay
      setTimeout(() => {
        setShowTypewriter(true);
      }, 500);
    } else {
      // Reset state when modal closes
      setCurrentStageIndex(0);
      setShowTypewriter(false);
      setShowPrompt(false);
      setInputValue('');
      setShowMovingAi(false);
      setShowAcknowledge(false);
      setAnimationComplete(false);
      hasCompletedRef.current = false;
    }
  }, [isOpen, currentStageIndex]);

  // Reset typewriter completion state when stage changes
  useEffect(() => {
    setShowPrompt(false);
    hasCompletedRef.current = false;
  }, [currentStageIndex]);

  const handleTypewriterComplete = useCallback(() => {
    if (!hasCompletedRef.current) {
      hasCompletedRef.current = true;
      setTimeout(() => {
        setShowPrompt(true);
      }, 300);
    }
  }, []);

  const handleConfirm = useCallback(() => {
    // Validation for smart hub deletion
    if (context === 'smart-hub') {
      // Check if there's only one smart hub
      if (smartHubsCount <= 1) {
        setShowMovingAi(true);
        setShowPrompt(false);
        setShowTypewriter(false);
        setAnimationComplete(false);
        
        setTimeout(() => {
          setAnimationComplete(true);
          setShowAcknowledge(true);
          setAcknowledgeMessage('Cannot delete your only Smart Hub');
          
          // Close modal after showing message
          setTimeout(() => {
            onClose();
          }, 2000);
        }, 1200);
        return;
      }
      
      // Check if it's the default smart hub
      if (isDefaultSmartHub) {
        setShowMovingAi(true);
        setShowPrompt(false);
        setShowTypewriter(false);
        setAnimationComplete(false);
        
        setTimeout(() => {
          setAnimationComplete(true);
          setShowAcknowledge(true);
          setAcknowledgeMessage('Cannot delete default Smart Hub');
          
          // Close modal after showing message
          setTimeout(() => {
            onClose();
          }, 2000);
        }, 1200);
        return;
      }
    }
    
    // Trigger AI animation first
    setShowMovingAi(true);
    setShowPrompt(false);
    setShowTypewriter(false);
    setAnimationComplete(false);
    
    // Mark animation as complete and show acknowledge box
    setTimeout(() => {
      setAnimationComplete(true);
      setShowAcknowledge(true);
      setAcknowledgeMessage('Deleting...');
      
      // Execute deletion for smart hub
      if (context === 'smart-hub') {
        setTimeout(async () => {
          try {
            // Since it's not default, find the default smart hub and switch to it
            const defaultHub = smartHubs.find(hub => hub.id !== smartHubId);
            
            if (defaultHub) {
              setAcknowledgeMessage('Switching to default Smart Hub...');
              
              // Switch current smart hub to the default one
              await api.post(`/smart-hubs/${defaultHub.id}/switch`);
              
              setAcknowledgeMessage('Deleting Smart Hub...');
              
              // Delete the smart hub (will cascade delete matrices)
              await api.delete(`/smart-hubs/${smartHubId}`);
              
              setAcknowledgeMessage('Smart Hub deleted successfully');
              
              // Close modal and trigger parent callback after short delay
              setTimeout(() => {
                onConfirm(currentStage.requiresInput ? inputValue : undefined);
                onClose();
              }, 1500);
            } else {
              setAcknowledgeMessage('Error: No default hub found');
              setTimeout(() => {
                onClose();
              }, 2000);
            }
          } catch (error: any) {
            console.error('Failed to delete smart hub:', error);
            setAcknowledgeMessage(`Error: ${error.response?.data?.detail || error.message || 'Failed to delete'}`);
            setTimeout(() => {
              onClose();
            }, 3000);
          }
        }, 500);
      } else {
        // For other contexts, call the original onConfirm
        setTimeout(() => {
          if (currentStageIndex < activeStages.length - 1) {
            setCurrentStageIndex(prev => prev + 1);
          } else {
            onConfirm(currentStage.requiresInput ? inputValue : undefined);
          }
        }, 500);
      }
    }, 1200); // Wait for animation to complete
  }, [context, smartHubsCount, isDefaultSmartHub, smartHubId, smartHubs, currentStageIndex, activeStages.length, currentStage, inputValue, onConfirm, onClose]);

  const handleBack = useCallback(() => {
    if (currentStageIndex > 0) {
      setCurrentStageIndex(prev => prev - 1);
    } else {
      onClose();
    }
  }, [currentStageIndex, onClose]);

  if (!isOpen) return null;

  const modalContent = (
    <>
      <style>{`
        .delete-close-btn {
          position: absolute;
          top: 16px;
          right: 16px;
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
        .delete-close-btn:hover {
          background-color: ${globalHoverColor};
        }
        .delete-danger-btn {
          padding: 10px 32px;
          
          color: ${dangerToneText};
          border-radius: 8px;
          font-weight: 400;
          border: 1px solid ${dangerToneBorder};
          cursor: pointer;
          font-family: 'Work Sans', sans-serif;
          font-size: 16px;
          height: fit-content;
        }
        .delete-danger-btn:hover {
          background-color: ${dangerBkSolidColor};
          color: ${dangerButtonTextColor};
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
          background: chatBk1 || 'rgba(0, 0, 0, 0.5)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {/* Modal - Match SmartHubCreator dimensions */}
        <div
          style={{
            backgroundColor: 'transparent',
            borderRadius: '16px',
            width: '60%',
            height: '80vh',
            maxWidth: '1200px',
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
            className="delete-close-btn flex-shrink-0 p-1.5 rounded-full transition-all group"
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
              acknowledgeMessage="Sure!"
              aiAcknowledgeTextColor={aiAcknowledgeTextColor}
            />
          )}

          {/* Content Area - Match SmartHubCreator layout */}
          <div style={{ 
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: '0 32px 0 32px',
            overflowY: 'auto',
            alignItems: 'center',
            justifyContent: showMovingAi ? 'center' : 'start',
            paddingTop: showMovingAi ? '0' : '96px',
            paddingBottom: showPrompt ? '100px' : '30px'
          }}>
            {/* Animated AI moving diagonally into center when delete button clicked */}
            {showMovingAi && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
                maxWidth: '700px'
              }}>
                <div className="animate-ai-move-down">
                  <div className="onboarding-ai-icon-moved" style={{ userSelect: 'none', WebkitUserSelect: 'none', cursor: 'default' }}>
                    {!animationComplete ? (
                      <span className="onboarding-ai-letter-moved" style={{ userSelect: 'none', WebkitUserSelect: 'none', cursor: 'default' }}>i</span>
                    ) : (
                      <div style={{ 
                        transform: 'rotate(-45deg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Trash2 
                          size={40} 
                          style={{ 
                            color: '#ef4444',
                            filter: 'drop-shadow(0 0 12px rgba(239, 68, 68, 0.6))'
                          }} 
                          strokeWidth={2}
                        />
                      </div>
                    )}
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
                        {acknowledgeMessage}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Typewriter Message - show before delete button clicked */}
            {!showMovingAi && (
              <div style={{ width: '100%', maxWidth: '700px', marginBottom: '32px', textAlign: 'left' }}>
                {showTypewriter && (
                  <SimpleTypewriter
                    key={`${context}-stage-${currentStageIndex}`}
                    text={currentStage.message}
                    onComplete={handleTypewriterComplete}
                    speed={APP_CONFIG.typewriterSpeed}
                    className="text-gray-900"
                    style={{ 
                      fontFamily: 'Work Sans, sans-serif',
                      fontSize: '26px',
                      color: textColor
                    }}
                    highlightColor={dangerButtonColor}
                    customColor={dangerBkSolidColor}
                  />
                )}
              </div>
            )}

            {/* Additional Content (if provided) */}
            {!showMovingAi && showPrompt && currentStage.showAdditionalContent && currentStage.additionalContent && (
              <div style={{
                width: '100%',
                maxWidth: '700px',
                marginBottom: '32px',
                animation: 'fadeIn 0.5s ease-in-out'
              }}>
                {currentStage.additionalContent}
              </div>
            )}

            {/* Input Field (if required) */}
            {!showMovingAi && showPrompt && currentStage.requiresInput && (
              <div style={{
                width: '100%',
                maxWidth: '700px',
                marginBottom: '24px',
                animation: 'fadeIn 0.5s ease-in-out'
              }}>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={currentStage.inputPlaceholder || 'Type to confirm...'}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: `1px solid ${borderLineColor}`,
                    backgroundColor: 'transparent',
                    color: textColor,
                    fontSize: '16px',
                    fontFamily: 'Work Sans, sans-serif',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = textColor;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = borderLineColor;
                  }}
                />
              </div>
            )}
          </div>

          {/* Sticky Footer - Buttons */}
          {!showMovingAi && showPrompt && (
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '20px 32px',
            
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 10
            }}>
              <button
                onClick={handleConfirm}
                disabled={currentStage.requiresInput && !inputValue.trim()}
                className="delete-danger-btn"
              >
                {currentStage.confirmButtonText || 'Delete'}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}

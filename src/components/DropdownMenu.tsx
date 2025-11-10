import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export interface MenuOption {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  keepMenuOpen?: boolean;
}

interface DropdownMenuProps {
  /** The trigger button content */
  trigger: React.ReactNode | ((isOpen: boolean) => React.ReactNode);
  /** Array of menu options */
  options: MenuOption[];
  /** Position of the menu relative to trigger */
  position?: 'top' | 'bottom' | 'left' | 'right';
  /** Custom className for the menu container */
  className?: string;
  /** Custom className for the trigger button */
  triggerClassName?: string;
  /** Whether to show chevron icon on trigger */
  showChevron?: boolean;
  /** Whether the menu is disabled */
  disabled?: boolean;
  /** Tooltip text for the trigger button */
  tooltip?: string;
}

export default function DropdownMenu({
  trigger,
  options,
  position = 'bottom',
  className = '',
  triggerClassName = '',
  showChevron = false,
  disabled = false,
  tooltip
}: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const calculateMenuPosition = () => {
    if (!triggerRef.current) return { top: 0, left: 0 };
    
    const rect = triggerRef.current.getBoundingClientRect();
    const menuWidth = 200; // min-width from CSS
    // Calculate more accurate menu height: padding + (options * item height)
    const estimatedMenuHeight = 8 + (options.length * 36); // 4px padding top/bottom + 36px per option
    
    let top = 0;
    let left = 0;
    
    switch (position) {
      case 'top':
        top = rect.top - estimatedMenuHeight - 20; // Menu height + 10px gap above the button
        left = rect.left + 30; // 20px gap from the left edge of the button
        break;
      case 'bottom':
        top = rect.bottom + 20; // 10px gap below the button
        left = rect.left + 20; // 20px gap from the left edge of the button
        break;
      case 'left':
        top = rect.top;
        left = rect.left - menuWidth - 20;
        break;
      case 'right':
        top = rect.top;
        left = rect.right + 30;
        break;
    }
    
    // Ensure menu stays within viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    if (left + menuWidth > viewportWidth) {
      left = viewportWidth - menuWidth - 16;
    }
    if (left < 16) {
      left = 16;
    }
    if (top + estimatedMenuHeight > viewportHeight) {
      top = viewportHeight - estimatedMenuHeight - 16;
    }
    if (top < 16) {
      top = 16;
    }
    
    return { top, left };
  };

  const handleTriggerClick = () => {
    if (!disabled) {
      if (!isOpen) {
        const pos = calculateMenuPosition();
        setMenuPosition(pos);
      }
      setIsOpen(!isOpen);
    }
  };

  const handleOptionClick = (option: MenuOption) => {
    if (!option.disabled) {
      option.onClick();
      if (!option.keepMenuOpen) {
        setIsOpen(false);
      }
    }
  };



  return (
    <div className={`dropdown-menu-container ${className}`} ref={menuRef}>
      <button
        ref={triggerRef}
        className={`dropdown-trigger ${triggerClassName} ${disabled ? 'disabled' : ''} ${isOpen ? 'active' : ''}`}
        onClick={handleTriggerClick}
        disabled={disabled}
        type="button"
        {...(tooltip && !isOpen && { 'data-tooltip': tooltip })}
      >
        {typeof trigger === 'function' ? trigger(isOpen) : trigger}
        {showChevron && (
          <ChevronDown 
            className={`chevron-icon ${isOpen ? 'rotated' : ''}`} 
            size={16} 
          />
        )}
      </button>

      {isOpen && (
        <div 
          className="dropdown-menu" 
          style={{
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
          }}
        >
          <div className="main-menu">
            {options.map((option) => {
              const isBackButton = option.id.includes('back');
              
              if (isBackButton) {
                return (
                  <div key={option.id} className="back-button-container">
                    <button
                      className={`dropdown-option back-button ${option.disabled ? 'disabled' : ''} ${option.className || ''}`}
                      onClick={() => handleOptionClick(option)}
                      disabled={option.disabled}
                      type="button"
                    >
                      {option.icon && (
                        <span className="option-icon">{option.icon}</span>
                      )}
                      <span className="option-label">
                        <span className="back-arrow">← </span>
                        <span className="back-text-default">{option.label}</span>
                        <span className="back-text-hover">Back</span>
                      </span>
                    </button>
                  </div>
                );
              }
              
              return (
                <button
                  key={option.id}
                  className={`dropdown-option ${option.disabled ? 'disabled' : ''} ${option.className || ''}`}
                  onClick={() => handleOptionClick(option)}
                  disabled={option.disabled}
                  type="button"
                >
                  {option.icon && (
                    <span className="option-icon">{option.icon}</span>
                  )}
                  <span className="option-label">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <style>{`
        .dropdown-menu-container {
          position: relative;
          display: inline-block;
        }

        .dropdown-trigger {
          display: flex;
          align-items: center;
          gap: 6px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 8px 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 14px;
          color: #374151;
        }

        .dropdown-trigger:hover:not(.disabled) {
          background: #f9fafb;
          border-color: #d1d5db;
        }

        .dropdown-trigger:focus {
          outline: none;
          ring: 2px solid #3b82f6;
          ring-opacity: 50%;
        }

        .dropdown-trigger.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .chevron-icon {
          transition: transform 0.2s ease;
        }

        .chevron-icon.rotated {
          transform: rotate(180deg);
        }

        .dropdown-menu {
          position: fixed;
          z-index: 9999;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          min-width: 200px;
          max-width: 300px;
          padding-top: 10px;
          padding-bottom: 10px;
          animation: menuFadeIn 0.15s ease-out;
        }

        @keyframes menuFadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }



        .dropdown-option {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 8px 12px;
          border: none;
          background: none;
          cursor: pointer;
          border-radius: 6px;
          font-size: 14px;
          color: #374151;
          text-align: left;
          margin: 0;
          transition: background-color 0.15s ease;
        }

        .dropdown-option:hover:not(.disabled) {
          background: #f3f4f6;
        }
      

        .dropdown-option.disabled {
          opacity: 0.5;
          cursor: not-allowed;
          
        }

        .main-menu {
          display: flex;
          flex-direction: column;
          width: 100%;
          overflow: hidden;
        }

        .option-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .option-label {
          flex: 1;
        }

        .back-button-container {
          border-bottom: 1px solid #e5e7eb;
          margin-bottom: 4px;
          padding-bottom: 4px;
        }

        .back-arrow {
          display: inline-block;
          font-weight: 500;
          font-size: 20px;
          vertical-align: middle;
          line-height: 1;
          margin-right: 5px;
        }

        .back-button .back-text-hover {
          display: none;
          font-weight: 500;
          vertical-align: middle;
        }

        .back-button .back-text-default {
          display: inline;
          font-weight: 500;
          vertical-align: middle;
        }

        .back-button-container:hover .back-text-default {
          display: none;
        }

        .back-button-container:hover .back-text-hover {
          display: inline;
        }
      `}</style>
    </div>
  );
}
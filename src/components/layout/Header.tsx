import { useEffect } from 'react';
import LanguageSwitcher from '../LanguageSwitcher';

interface HeaderProps {
  aiActive?: boolean; // Whether AI is active in sales mode
  className?: string; // Optional className for visibility control
  hideLogo?: boolean; // Hide the animated logo
  textColor?: string; // Text color for the title
  hideLanguageSwitcher?: boolean; // Hide the language switcher
}

export default function Header({ aiActive = false, className = '', hideLogo = false, textColor = 'text-black', hideLanguageSwitcher = false }: HeaderProps) {
  // Preload critical images for instant loading
  useEffect(() => {
    const images = [
      '/signup_poup1.png',
      '/ilaunching_dash.png' // Onboarding background
    ];
    
    const links: HTMLLinkElement[] = [];
    
    images.forEach(imageUrl => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = imageUrl;
      link.setAttribute('fetchpriority', 'high');
      document.head.appendChild(link);
      links.push(link);
    });
    
    return () => {
      links.forEach(link => {
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
      });
    };
  }, []);
  
  return (
    <header 
      className={`w-full fixed top-0 left-0 right-0 transition-opacity duration-500 ${className}`}
      style={{
        paddingLeft: '50px',
        paddingRight: '50px',
        paddingTop: '30px',
        paddingBottom: '20px',
        backgroundColor: 'transparent',
      
        zIndex: 10000,
      }}
    >
       
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-4">
        {/* AI Tool Logo - 50x50px diamond with animated "i" */}
        {!hideLogo && (
          <div className="ai-icon-container">
            <div className={`ai-icon ${aiActive ? 'ai-active' : ''}`}>
              <span className={`ai-letter ${aiActive ? 'ai-active' : ''}`}>i</span>
            </div>
          </div>
        )}
        
          {/* Text */}
          <h1 
            className={textColor}
            style={{
              fontFamily: "'Baloo 2', sans-serif",
              fontSize: '40px',
              fontWeight: '600',
              lineHeight: '1',
            }}
          >
            iLaunching
          </h1>
        </div>

        {/* Language Switcher */}
        {!hideLanguageSwitcher && <LanguageSwitcher textColor={textColor} />}
      </div>

      <style>{`
        .ai-icon-container {
          flex-shrink: 0;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ai-icon {
          width: 40px;
          height: 40px;
          transform: rotate(45deg);
          background: linear-gradient(135deg, 
            rgba(59, 130, 246, 0.08) 0%, 
            rgba(147, 51, 234, 0.08) 50%,
            rgba(236, 72, 153, 0.08) 100%
          );
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(59, 130, 246, 0.8);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid rgba(59, 130, 246, 0.15);
          border-radius: 8px;
          position: relative;
          overflow: visible;
          box-shadow: 
            0 0 20px rgba(59, 130, 246, 0.1),
            inset 0 1px 1px rgba(255, 255, 255, 0.6);
        }

        .ai-icon::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(45deg, 
            #3b82f6,
            #8b5cf6,
            #ec4899,
            #f59e0b,
            #3b82f6
          );
          background-size: 400% 400%;
          border-radius: 10px;
          z-index: -1;
          opacity: 0;
          animation: iconBorderFlow 3s ease-in-out infinite;
          filter: blur(0.5px);
        }

        .ai-icon::after {
          content: '';
          position: absolute;
          top: -4px;
          left: -4px;
          right: -4px;
          bottom: -4px;
          background: linear-gradient(45deg, 
            rgba(59, 130, 246, 0.4),
            rgba(147, 51, 234, 0.4),
            rgba(236, 72, 153, 0.4),
            rgba(251, 146, 60, 0.4),
            rgba(59, 130, 246, 0.4)
          );
          background-size: 400% 400%;
          border-radius: 12px;
          z-index: -2;
          opacity: 0;
          animation: iconBorderFlow 3s ease-in-out infinite 0.5s;
          filter: blur(2px);
        }

        .ai-icon .ai-letter {
          transform: rotate(-45deg);
          font-family: 'Fredoka', sans-serif;
          font-size: 38px;
          font-weight: 700;
          font-style: normal;
          background: linear-gradient(
            45deg,
            #3b82f6 0%,
            #8b5cf6 25%,
            #ec4899 50%,
            #f59e0b 75%,
            #3b82f6 100%
          );
          background-size: 400% 400%;
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: aiColorFlow 3s ease-in-out infinite;
          filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.3));
        }

        /* Animations */
        @keyframes aiColorFlow {
          0% {
            background-position: 0% 0%;
            transform: rotate(-45deg) scale(1);
          }
          33% {
            background-position: 100% 100%;
            transform: rotate(-45deg) scale(1.05);
          }
          66% {
            background-position: 0% 100%;
            transform: rotate(-45deg) scale(1);
          }
          100% {
            background-position: 0% 0%;
            transform: rotate(-45deg) scale(1);
          }
        }

        @keyframes iconBorderFlow {
          0% {
            background-position: 0% 0%;
            opacity: 0;
            transform: scale(1);
          }
          33% {
            background-position: 100% 100%;
            opacity: 0.6;
            transform: scale(1.02);
          }
          66% {
            background-position: 0% 100%;
            opacity: 0.3;
            transform: scale(1);
          }
          100% {
            background-position: 0% 0%;
            opacity: 0;
            transform: scale(1);
          }
        }

        /* AI Active State - stops animations and shows settled appearance */
        .ai-icon.ai-active::before,
        .ai-icon.ai-active::after {
          animation: none !important;
          opacity: 0.2 !important;
          background: linear-gradient(45deg, 
            rgba(59, 130, 246, 0.2),
            rgba(147, 51, 234, 0.2),
            rgba(236, 72, 153, 0.2),
            rgba(251, 146, 60, 0.2)
          ) !important;
        }

        .ai-icon.ai-active .ai-letter {
          animation: none !important;
          background: rgba(59, 130, 246, 0.6) !important;
          background-clip: text !important;
          -webkit-background-clip: text !important;
          -webkit-text-fill-color: transparent !important;
          filter: drop-shadow(0 0 4px rgba(59, 130, 246, 0.2)) !important;
        }

        .ai-icon.ai-active {
          background: linear-gradient(135deg, 
            rgba(59, 130, 246, 0.04) 0%, 
            rgba(147, 51, 234, 0.04) 50%,
            rgba(236, 72, 153, 0.04) 100%
          ) !important;
          border: 1px solid rgba(59, 130, 246, 0.08) !important;
          box-shadow: 
            0 0 8px rgba(59, 130, 246, 0.05),
            inset 0 1px 1px rgba(255, 255, 255, 0.3) !important;
        }

        /* Hover effects */
        .ai-icon:hover::before,
        .ai-icon:hover::after {
          opacity: 0.8 !important;
        }

        .ai-icon:hover {
          transform: rotate(45deg) scale(1.05);
          box-shadow: 
            0 0 30px rgba(59, 130, 246, 0.3),
            inset 0 1px 1px rgba(255, 255, 255, 0.8);
        }

        /* Don't scale on hover when AI is active */
        .ai-icon.ai-active:hover {
          transform: rotate(45deg) scale(1) !important;
        }
      `}</style>
    </header>
  );
}

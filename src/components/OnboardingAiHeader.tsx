interface OnboardingAiHeaderProps {
  aiName?: string;
  acknowledgeMessage?: string;
}

export default function OnboardingAiHeader({ 
  aiName = 'AI Assistant',
  acknowledgeMessage = ''
}: OnboardingAiHeaderProps) {
  // Split acknowledge message into words for animation
  const renderAcknowledgeWords = (message: string) => {
    if (!message) return null;
    const words = message.split(' ');
    return words.map((word, index) => (
      <span
        key={index}
        className="acknowledge-word"
        style={{ animationDelay: `${index * 0.03}s` }}
      >
        {word}{index < words.length - 1 ? ' ' : ''}
      </span>
    ));
  };

  return (
    <>
      <div className="onboarding-ai-header">
        {/* AI Icon (diamond shape with animated lowercase i) */}
        <div className="onboarding-ai-icon" style={{ userSelect: 'none', WebkitUserSelect: 'none', cursor: 'default' }}>
          <span className="onboarding-ai-letter" style={{ userSelect: 'none', WebkitUserSelect: 'none', cursor: 'default' }}>i</span>
        </div>
        
        {/* AI Name */}
        <div className="onboarding-ai-name">
          {aiName}
        </div>
        
        {/* AI Acknowledge (only show if not empty) */}
        {acknowledgeMessage && (
          <div className="onboarding-ai-acknowledge">
            {renderAcknowledgeWords(acknowledgeMessage)}
          </div>
        )}
      </div>

      <style>{`
        .onboarding-ai-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 30px 10px 10px 30px;
          position: relative;
          overflow: visible;
        }

        .onboarding-ai-icon {
          flex-shrink: 0;
          width: 35px;
          height: 35px;
          transform: rotate(45deg);
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(147, 51, 234, 0.08) 50%, rgba(236, 72, 153, 0.08) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(59, 130, 246, 0.8);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid rgba(59, 130, 246, 0.15);
          border-radius: 8px;
          position: relative;
          overflow: visible;
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.1), inset 0 1px 1px rgba(255, 255, 255, 0.6);
        }

        .onboarding-ai-icon::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(45deg, #3b82f6, #8b5cf6, #ec4899, #f59e0b, #3b82f6);
          background-size: 400% 400%;
          border-radius: 10px;
          z-index: -1;
          opacity: 0;
          filter: blur(0.5px);
          animation: iconBorderFlow 3s ease-in-out infinite;
        }

        .onboarding-ai-icon::after {
          content: '';
          position: absolute;
          top: -4px;
          left: -4px;
          right: -4px;
          bottom: -4px;
          background: linear-gradient(45deg, rgba(59, 130, 246, 0.4), rgba(147, 51, 234, 0.4), rgba(236, 72, 153, 0.4), rgba(251, 146, 60, 0.4), rgba(59, 130, 246, 0.4));
          background-size: 400% 400%;
          border-radius: 12px;
          z-index: -2;
          opacity: 0;
          filter: blur(2px);
          animation: iconBorderFlow 3s ease-in-out infinite 0.5s;
        }

        .onboarding-ai-letter {
          transform: rotate(-45deg);
          font-family: 'Fredoka', sans-serif;
          font-size: 32px;
          font-weight: 700;
          font-style: normal;
          background: linear-gradient(45deg, 
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

        .onboarding-ai-name {
          font-size: 14px;
          font-weight: 600;
          color: rgba(59, 130, 246, 0.8);
          padding: 4px 8px;
          border-radius: 6px;
          line-height: 1.2;
          user-select: none;
          pointer-events: none;
          text-shadow: 0 0 8px rgba(59, 130, 246, 0.2);
          font-family: 'Work Sans', sans-serif;
        }

        .onboarding-ai-acknowledge {
          font-size: 14px;
          font-weight: 500;
          color: rgba(17, 15, 117, 1);
          padding: 2px 6px;
          border-radius: 4px;
          line-height: 1.2;
          user-select: none;
          pointer-events: none;
          text-shadow: 0 0 6px rgba(147, 51, 234, 0.2);
          font-style: italic;
          background: rgba(147, 51, 234, 0.05);
          border: 1px solid rgba(147, 51, 234, 0.1);
          transition: opacity 0.2s ease, transform 0.2s ease;
          position: relative;
          overflow: hidden;
          white-space: pre-wrap;
          font-family: 'Work Sans', sans-serif;
        }
        
        /* Individual word animation */
        .onboarding-ai-acknowledge .acknowledge-word {
          display: inline;
          opacity: 0;
          animation: acknowledgeTypewriter 0.50s ease-out both;
        }

        /* Glow effect for acknowledge - starts after word animation */
        .onboarding-ai-acknowledge::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          border-radius: 6px;
          background: linear-gradient(45deg, 
            rgba(147, 51, 234, 0.3),
            rgba(168, 85, 247, 0.3),
            rgba(147, 51, 234, 0.3)
          );
          background-size: 400% 400%;
          z-index: -1;
          opacity: 0;
          animation: acknowledgeGlow 2s ease-in-out infinite 1s;
          filter: blur(4px);
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

        @keyframes aiHeaderSlideIn {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes acknowledgeTypewriter {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

        @keyframes acknowledgeGlow {
          0%, 100% {
            opacity: 0;
            background-position: 0% 0%;
          }
          50% {
            opacity: 0.6;
            background-position: 100% 100%;
          }
        }
      `}</style>
    </>
  );
}

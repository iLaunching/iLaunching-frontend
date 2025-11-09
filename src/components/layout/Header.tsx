export default function Header() {
  return (
    <header 
      className="w-full fixed top-0 left-0 right-0"
      style={{
        paddingLeft: '50px',
        paddingRight: '50px',
        paddingTop: '30px',
        paddingBottom: '20px',
        backgroundColor: 'transparent',
        zIndex: 10000,
      }}
    >
       
      <div className="flex items-center gap-4">
        {/* AI Tool Logo - 50x50px diamond with animated "i" */}
        <div className="ai-icon-container">
          <div className="ai-icon">
            <span className="ai-letter">i</span>
          </div>
        </div>
        
        {/* Text */}
        <h1 
          className="text-black"
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
      `}</style>
    </header>
  );
}

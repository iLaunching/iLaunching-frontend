import { useEffect, useRef } from 'react';

export default function ConnectedMindsBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Mouse tracking for interactive effects
    const handleMouseMove = (e: MouseEvent) => {
      if (container) {
        const rect = container.getBoundingClientRect();
        const mouseX = ((e.clientX - rect.left) / rect.width) * 100;
        const mouseY = ((e.clientY - rect.top) / rect.height) * 100;
        
        container.style.setProperty('--mouse-x', mouseX + '%');
        container.style.setProperty('--mouse-y', mouseY + '%');
      }
    };

    // Dynamic height adjustment
    const adjustHeight = () => {
      if (container && container.parentElement) {
        const parentHeight = container.parentElement.offsetHeight;
        if (parentHeight > 100) {
          container.style.height = parentHeight + 'px';
        }
      }
    };

    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', adjustHeight);
    
    // Run initially
    adjustHeight();

    // Cleanup
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', adjustHeight);
    };
  }, []);

  return (
    <div ref={containerRef} className="connected-minds-container">
      <div className="mesh-overlay"></div>

      <style>{`
        .connected-minds-container {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: linear-gradient(135deg, #2563eb 0%, #7c3aed 50%, #a855f7 100%);
          color: #ffffff;
          overflow: hidden;
          font-weight: 400;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          min-height: 400px;
          z-index: -1;
          background-image: 
            radial-gradient(circle at 20% 80%, rgba(37, 99, 235, 0.4) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.4) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(124, 58, 237, 0.3) 0%, transparent 50%);
          animation: mesh-shift 15s infinite ease-in-out;
        }

        @keyframes mesh-shift {
          0%, 100% {
            background-position: 0% 0%, 100% 100%, 50% 50%;
          }
          50% {
            background-position: 100% 100%, 0% 0%, 25% 75%;
          }
        }

        .mesh-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(255, 255, 255, 0.1) 2px,
            rgba(255, 255, 255, 0.1) 4px
          );
          animation: mesh-lines 8s infinite linear;
        }

        @keyframes mesh-lines {
          0% { transform: translateY(0); }
          100% { transform: translateY(20px); }
        }

        /* Interactive mouse effect */
        .connected-minds-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), 
            rgba(255, 255, 255, 0.1) 0%, 
            transparent 50%);
          pointer-events: none;
          transition: opacity 0.3s ease;
          opacity: 0;
        }

        .connected-minds-container:hover::before {
          opacity: 1;
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .connected-minds-container {
            min-height: 300px;
          }
        }
      `}</style>
    </div>
  );
}
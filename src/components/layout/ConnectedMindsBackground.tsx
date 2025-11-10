export default function ConnectedMindsBackground() {
  return (
    <div className="connected-minds-container">
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
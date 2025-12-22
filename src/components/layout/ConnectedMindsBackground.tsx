export default function ConnectedMindsBackground() {
  return (
    <div className="connected-minds-container">
      {/* Lightening overlay for left side where editor is */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.75) 0%, rgba(255, 255, 255, 0.55) 30%, rgba(255, 255, 255, 0.32) 45%, rgba(255, 255, 255, 0.12) 55%, transparent 70%)',
          zIndex: 10,
        }}
      />

      <style>{`
        .connected-minds-container {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: linear-gradient(135deg, #06B6D4 0%, #C026D3 33%, #EC4899 66%, #F59E0B 100%);
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
            radial-gradient(circle at 20% 80%, rgba(6, 182, 212, 0.6) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(192, 38, 211, 0.6) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(236, 72, 153, 0.5) 0%, transparent 50%),
            radial-gradient(circle at 60% 60%, rgba(245, 158, 11, 0.4) 0%, transparent 50%);
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
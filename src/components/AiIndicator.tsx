/**
 * Simple AI Indicator Component - Visual indicator only, doesn't interfere with content
 * Based on your Editor.js AI tool design
 */



interface AiIndicatorProps {
  /** AI name to display */
  aiName?: string;
  /** Acknowledgment text */
  aiAcknowledge?: string;
  /** Whether to show the indicator */
  show?: boolean;
  /** Custom styling */
  className?: string;
}

export default function AiIndicator({ 
  aiName = "AI Assistant",
  aiAcknowledge = "",
  show = true,
  className = ""
}: AiIndicatorProps) {
  if (!show) return null;

  return (
    <div className={`ai-indicator ${className}`}>
      <div className="ai-indicator-container">
        {/* AI Icon (diamond shape with animated lowercase i) */}
        <div className="ai-icon" style={{ userSelect: 'none', WebkitUserSelect: 'none', cursor: 'default' }}>
          <span className="ai-letter" style={{ userSelect: 'none', WebkitUserSelect: 'none', cursor: 'default' }}>i</span>
        </div>
        
        {/* AI Name */}
        <div className="ai-name" style={{ userSelect: 'none', WebkitUserSelect: 'none', cursor: 'default' }}>
          {aiName}
        </div>
        
        {/* AI Acknowledge (only show if not empty) */}
        {aiAcknowledge && (
          <div className="ai-acknowledge" style={{ userSelect: 'none', WebkitUserSelect: 'none', cursor: 'default' }}>
            {aiAcknowledge}
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
          .ai-indicator {
            display: flex;
            align-items: center;
            margin-bottom: 12px;
            padding: 8px 12px;
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border-left: 3px solid #3b82f6;
            border-radius: 6px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            max-width: fit-content;
          }

          .ai-indicator-container {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .ai-icon {
            width: 24px;
            height: 24px;
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
            position: relative;
            overflow: hidden;
            flex-shrink: 0;
            user-select: none;
            cursor: default;
          }

          .ai-icon::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            animation: shimmer 3s infinite;
          }

          @keyframes shimmer {
            0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
            100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
          }

          .ai-letter {
            color: white;
            font-size: 14px;
            font-weight: 600;
            font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
            animation: pulse 2s infinite;
            z-index: 10;
            position: relative;
            user-select: none;
            cursor: default;
          }

          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.9; transform: scale(0.98); }
          }

          .ai-name {
            font-weight: 600;
            font-size: 13px;
            color: #1e293b;
            white-space: nowrap;
            user-select: none;
            cursor: default;
          }

          .ai-acknowledge {
            font-size: 11px;
            color: #64748b;
            font-style: italic;
            white-space: nowrap;
            user-select: none;
            cursor: default;
          }

          /* Responsive behavior */
          @media (max-width: 768px) {
            .ai-indicator {
              margin-bottom: 8px;
              padding: 6px 10px;
              user-select: none;
              cursor: default;
            }
            
            .ai-icon {
              width: 20px;
              height: 20px;
              user-select: none;
              cursor: default;
            }
            
            .ai-letter {
              font-size: 12px;
              user-select: none;
              cursor: default;
            }
            
            .ai-name {
              font-size: 12px;
              user-select: none;
              cursor: default;
            }
            
            .ai-acknowledge {
              font-size: 10px;
              user-select: none;
              cursor: default;
            }
          }
        `
      }} />
    </div>
  );
}
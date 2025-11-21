import { useState, useEffect } from 'react';
import { MousePointer2 } from 'lucide-react';

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', 
  '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
];

const USERS = [
  { 
    id: 1, 
    name: 'Sarah', 
    color: COLORS[0],
    message: 'Help with my clothing brand idea'
  },
  { 
    id: 2, 
    name: 'Mike', 
    color: COLORS[1],
    message: 'Design feedback needed'
  },
  { 
    id: 3, 
    name: 'Emma', 
    color: COLORS[2],
    message: 'What do you think of this layout?'
  }
];

// Predefined animation paths with smooth pauses
const getAnimationPath = (id: number, width: number, height: number) => {
  const paths = [
    // Sarah - Figure 8 pattern with smooth pauses
    (t: number) => {
      const cycle = 14;
      const moveTime = t % cycle;
      const pauseStart = 3;
      const pauseEnd = 9;
      
      let progress = t;
      
      // Full stop during pause
      if (moveTime > pauseStart && moveTime < pauseEnd) {
        progress = t - (moveTime - pauseStart);
      }
      
      return {
        x: width * 0.3 + Math.sin(progress * 0.3) * width * 0.15,
        y: height * 0.4 + Math.sin(progress * 0.6) * height * 0.2
      };
    },
    // Mike - Circular motion with smooth pauses
    (t: number) => {
      const cycle = 16;
      const moveTime = t % cycle;
      const pauseStart = 4;
      const pauseEnd = 11;
      
      let progress = t;
      
      // Full stop during pause
      if (moveTime > pauseStart && moveTime < pauseEnd) {
        progress = t - (moveTime - pauseStart);
      }
      
      return {
        x: width * 0.7 + Math.cos(progress * 0.25) * width * 0.2,
        y: height * 0.5 + Math.sin(progress * 0.25) * height * 0.2
      };
    },
    // Emma - Wave pattern with smooth pauses
    (t: number) => {
      const cycle = 18;
      const moveTime = t % cycle;
      const pauseStart = 5;
      const pauseEnd = 13;
      
      let progress = t;
      
      // Full stop during pause
      if (moveTime > pauseStart && moveTime < pauseEnd) {
        progress = t - (moveTime - pauseStart);
      }
      
      return {
        x: width * 0.2 + (progress * 0.15 % (Math.PI * 2)) / (Math.PI * 2) * width * 0.6,
        y: height * 0.6 + Math.sin(progress * 0.4) * height * 0.15
      };
    }
  ];
  
  return paths[id - 1];
};

interface CursorProps {
  x: number;
  y: number;
  name: string;
  color: string;
  opacity: number;
  showMessage?: boolean;
  message?: string;
}

const Cursor = ({ x, y, name, color, opacity, showMessage, message }: CursorProps) => (
  <div
    className="pointer-events-none fixed"
    style={{
      left: `${x}px`,
      top: `${y}px`,
      transform: 'translate(-2px, -2px)',
      opacity,
      transition: 'opacity 0.3s ease',
      zIndex: 40,
    }}
  >
    <MousePointer2 
      className="drop-shadow-lg" 
      style={{ color }}
      fill={color}
      size={24}
    />
    <div 
      className="ml-4 -mt-1 rounded text-white text-xs font-medium shadow-lg overflow-hidden"
      style={{ 
        backgroundColor: color,
        width: showMessage ? '280px' : '60px',
        height: showMessage ? 'auto' : '24px',
        padding: showMessage ? '8px 12px' : '4px 8px',
        transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        whiteSpace: showMessage ? 'normal' : 'nowrap'
      }}
    >
      <div className="font-semibold">{name}</div>
      <div 
        className="text-white/90 mt-1 text-xs leading-relaxed"
        style={{
          opacity: showMessage ? 1 : 0,
          maxHeight: showMessage ? '100px' : '0',
          transition: 'opacity 0.4s ease-in-out, max-height 0.6s ease-in-out',
          transitionDelay: showMessage ? '0.2s, 0s' : '0s, 0s'
        }}
      >
        {message}
      </div>
    </div>
  </div>
);

interface CollaborativeToolAnimationProps {
  className?: string;
}

export default function CollaborativeToolAnimation({ className }: CollaborativeToolAnimationProps) {
  const [cursors, setCursors] = useState<Array<any>>([]);
  const [ownCursor, setOwnCursor] = useState({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [showMessages, setShowMessages] = useState<{[key: number]: boolean}>({});

  // Track user's own cursor
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setOwnCursor({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Set initial dimensions
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Animate cursors
  useEffect(() => {
    if (dimensions.width === 0) return;

    let startTime = Date.now();
    let animationFrame: number;
    const messageTimes: {[key: number]: number | null} = {};

    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      
      const newCursors = USERS.map(user => {
        const pathFn = getAnimationPath(user.id, dimensions.width, dimensions.height);
        const pos = pathFn(elapsed);
        
        // Check if cursor should be paused (showing message)
        const cycle = user.id === 1 ? 14 : user.id === 2 ? 16 : 18;
        const moveTime = elapsed % cycle;
        const pauseStart = user.id === 1 ? 3 : user.id === 2 ? 4 : 5;
        const pauseEnd = user.id === 1 ? 9 : user.id === 2 ? 11 : 13;
        
        const isPaused = moveTime > pauseStart && moveTime < pauseEnd;
        
        // Show message after a brief delay when paused
        if (isPaused) {
          if (!messageTimes[user.id]) {
            messageTimes[user.id] = elapsed;
          }
          const timePaused = elapsed - (messageTimes[user.id] || 0);
          if (timePaused > 0.3) {
            setShowMessages(prev => ({ ...prev, [user.id]: true }));
          }
        } else {
          messageTimes[user.id] = null;
          setShowMessages(prev => ({ ...prev, [user.id]: false }));
        }
        
        return {
          ...user,
          ...pos,
          opacity: 1
        };
      });

      setCursors(newCursors);
      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [dimensions]);

  return (
    <div className={`w-full h-screen overflow-hidden relative pointer-events-none cursor-none ${className || ''}`}>
      {/* Animated Cursors */}
      {cursors.map(cursor => (
        <Cursor
          key={cursor.id}
          x={cursor.x}
          y={cursor.y}
          name={cursor.name}
          color={cursor.color}
          opacity={cursor.opacity}
          showMessage={showMessages[cursor.id]}
          message={cursor.message}
        />
      ))}

      {/* User's Own Cursor */}
      <Cursor
        x={ownCursor.x}
        y={ownCursor.y}
        name="You"
        color={COLORS[7]}
        opacity={1}
        showMessage={false}
      />
    </div>
  );
}
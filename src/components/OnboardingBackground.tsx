import { useEffect } from 'react';

interface OnboardingBackgroundProps {
  imageUrl?: string;
  opacity?: number;
  overlay?: boolean;
  overlayColor?: string;
  shouldFadeWhite?: boolean;
}

const OnboardingBackground = ({ 
  imageUrl = '/ilaunching_dash.png',
  opacity = 1,
  overlay = true,
  overlayColor = 'bg-black/60',
  shouldFadeWhite = false
}: OnboardingBackgroundProps) => {
  
  useEffect(() => {
    // Preload the onboarding background image for instant loading
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = imageUrl;
    link.setAttribute('fetchpriority', 'high');
    document.head.appendChild(link);
    
    console.log('🎨 Onboarding background preloaded:', imageUrl);
    
    return () => {
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, [imageUrl]);

  return (
    <div className="fixed inset-0 overflow-hidden" style={{ zIndex: 0 }}>
      {/* Background Image with optimized loading */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('${imageUrl}')`,
          opacity,
          willChange: 'transform',
          imageRendering: 'crisp-edges',
          transform: 'translateZ(0)', // Force GPU acceleration
        }}
      />

      {/* Overlay with frosted glass effect */}
      {overlay && (
        <div 
          className={`absolute inset-0 ${overlayColor}`}
          style={{
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
        />
      )}
      
      {/* White fade overlay for thankyou stage */}
      <div 
        className="absolute inset-0 bg-white transition-opacity duration-1000 ease-out"
        style={{
          opacity: shouldFadeWhite ? 0.6 : 0,
        }}
      />
    </div>
  );
};

export default OnboardingBackground;

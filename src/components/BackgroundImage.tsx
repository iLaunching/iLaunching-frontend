import { useEffect } from 'react';

interface BackgroundImageProps {
  imageUrl?: string;
  opacity?: number;
  overlay?: boolean;
  overlayColor?: string;
}

const BackgroundImage = ({ 
  imageUrl = '/interface background.png',
  opacity = 1,
  overlay = true,
  overlayColor = 'bg-black/30'
}: BackgroundImageProps) => {
  
  useEffect(() => {
        // Additional preload for dynamic image URLs (if different from default)
    if (imageUrl !== '/interface background.png') {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = imageUrl;
      link.setAttribute('fetchpriority', 'high');
      document.head.appendChild(link);
      
      console.log('🖼️ Background image preloaded:', imageUrl);
      
      return () => {
        document.head.removeChild(link);
      };
    }
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
        }}
      />

      {/* Overlay */}
      {overlay && (
        <div className={`absolute inset-0 ${overlayColor}`} />
      )}
    </div>
  );
};

export default BackgroundImage;

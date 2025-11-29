import { useEffect, useRef } from 'react';

interface BackgroundVideoProps {
  videoUrl?: string;
  opacity?: number;
  overlay?: boolean;
  overlayColor?: string;
}

const BackgroundVideo = ({ 
  videoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', // Google sample video - guaranteed to work
  opacity = 0.5,
  overlay = true,
  overlayColor = 'bg-gradient-to-br from-blue-900/70 via-purple-900/70 to-indigo-900/70'
}: BackgroundVideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Ensure video plays on mount
    if (videoRef.current) {
      console.log('🎥 Video element found, attempting to play:', videoUrl);
      videoRef.current.play().catch(error => {
        console.log('❌ Video autoplay prevented:', error);
      });
    } else {
      console.log('❌ Video ref not found');
    }
  }, [videoUrl]);

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 0 }}>
      {/* Video element */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity }}
        onLoadedData={() => console.log('✅ Video loaded successfully')}
        onError={(e) => console.error('❌ Video failed to load:', e)}
      >
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay */}
      {overlay && (
        <div className={`absolute inset-0 ${overlayColor}`} />
      )}
    </div>
  );
};

export default BackgroundVideo;

export default function DeepPurpleSeaBackground() {
  return (
    <div className="fixed inset-0 w-full h-full">
      {/* Base gradient with vibrant purple colors */}
      <div 
        className="absolute inset-0 w-full h-full"
        style={{
          background: 'linear-gradient(116.04deg, #C026D3 0%, #9333EA 35%, #7C3AED 65%, #4C1D95 100%)',
          zIndex: 0
        }}
      />
      {/* Lightening overlay for left side where editor is */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.6) 30%, rgba(255, 255, 255, 0.35) 45%, rgba(255, 255, 255, 0.15) 55%, transparent 70%)',
        }}
      />
    </div>
  );
}

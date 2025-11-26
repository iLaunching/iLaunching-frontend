export default function DeepSeaBackground() {
  return (
    <div className="fixed inset-0 w-full h-full">
      {/* Base gradient with vibrant, saturated colors */}
      <div 
        className="absolute inset-0 w-full h-full"
        style={{
          background: 'linear-gradient(109.56deg, #06B6D4 0%, #0284C7 35%, #0369A1 65%, #082F49 100%)',
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

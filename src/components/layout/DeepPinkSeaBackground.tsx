export default function DeepPinkSeaBackground() {
  return (
    <>
      <div 
        className="absolute inset-0 w-full h-full"
        style={{
          background: 'linear-gradient(109.54882935524327deg, #ec4899 0%, #4b2a57 100%)',
        }}
      />
      {/* Lightening overlay for left side where editor is */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.6) 30%, rgba(255, 255, 255, 0.35) 45%, rgba(255, 255, 255, 0.15) 55%, transparent 70%)',
        }}
      />
    </>
  );
}

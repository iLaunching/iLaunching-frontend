export default function DeepPurpleSeaBackground() {
  return (
    <>
      <div 
        className="absolute inset-0 w-full h-full"
        style={{
          background: 'linear-gradient(116.0418165948938deg, #8b5cf6 0%, #190438 100%)',
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

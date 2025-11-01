import AIBackground from '@/components/layout/AIBackground';
import Header from '@/components/layout/Header';

export default function Landing() {
  return (
    <div className="relative">
      <AIBackground />
      
      {/* Content overlay */}
      <div className="absolute inset-0">
        <Header />
        {/* Add more content here */}
      </div>
    </div>
  );
}

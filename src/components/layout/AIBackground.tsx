import { useEffect, useRef } from 'react';

export default function AIBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const shapeCount = 15;
    const diamondCount = 8;

    // Generate regular floating shapes (circles)
    for (let i = 0; i < shapeCount; i++) {
      const shape = document.createElement('div');
      shape.className = 'floating-shape';
      
      const size = Math.random() * 80 + 30;
      shape.style.width = size + 'px';
      shape.style.height = size + 'px';
      shape.style.borderRadius = '50%';
      shape.style.left = Math.random() * 100 + '%';
      shape.style.top = Math.random() * 100 + '%';
      
      container.appendChild(shape);
    }

    // Generate diamond shapes inspired by logo
    for (let i = 0; i < diamondCount; i++) {
      const diamond = document.createElement('div');
      diamond.className = 'floating-shape diamond';
      
      const size = Math.random() * 60 + 40;
      diamond.style.width = size + 'px';
      diamond.style.height = size + 'px';
      diamond.style.left = Math.random() * 100 + '%';
      diamond.style.top = Math.random() * 100 + '%';
      
      container.appendChild(diamond);
    }

    // Add additional brand focal points
    for (let i = 0; i < 3; i++) {
      const focal = document.createElement('div');
      focal.className = 'brand-focal';
      focal.style.left = Math.random() * 80 + 10 + '%';
      focal.style.top = Math.random() * 80 + 10 + '%';
      focal.style.transform = `rotate(${Math.random() * 90}deg)`;
      
      container.appendChild(focal);
    }
  }, []);

  return (
    <div ref={containerRef} className="ai-background-container">
      <div className="diagonal-lines"></div>
      <div className="diagonal-lines reverse"></div>
      <div className="brand-focal"></div>

      <style>{`
        .ai-background-container {
          position: relative;
          width: 100%;
          height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #f4f6ff 50%, #f0f4ff 100%);
          overflow: hidden;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .floating-shape {
          position: absolute;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(147, 51, 234, 0.06));
          border: 1px solid rgba(59, 130, 246, 0.1);
          opacity: 0.4;
        }

        .floating-shape.diamond {
          transform: rotate(45deg);
          border-radius: 8px;
          background: linear-gradient(135deg, 
            rgba(37, 99, 235, 0.1) 0%, 
            rgba(59, 130, 246, 0.08) 50%, 
            rgba(147, 51, 234, 0.06) 100%);
        }

        .diagonal-lines {
          position: absolute;
          width: 100%;
          height: 100%;
          background-image: repeating-linear-gradient(
            45deg,
            transparent,
            transparent 20px,
            rgba(59, 130, 246, 0.03) 20px,
            rgba(59, 130, 246, 0.03) 22px
          );
        }

        .diagonal-lines.reverse {
          background-image: repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 25px,
            rgba(147, 51, 234, 0.03) 25px,
            rgba(147, 51, 234, 0.03) 27px
          );
        }

        .brand-focal {
          position: absolute;
          top: 30%;
          left: 20%;
          width: 120px;
          height: 120px;
          background: linear-gradient(135deg, rgba(37, 99, 235, 0.12), rgba(147, 51, 234, 0.08));
          transform: rotate(45deg);
          border-radius: 12px;
          opacity: 0.6;
          border: 2px solid rgba(59, 130, 246, 0.15);
        }

        .ai-background-container:hover .brand-focal {
          opacity: 0.8;
          transition: opacity 0.3s ease;
        }
      `}</style>
    </div>
  );
}

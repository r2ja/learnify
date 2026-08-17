'use client';

import { useEffect, useRef, memo } from 'react';
import Link from 'next/link';

function AnimatedSidebarComponent() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    
    resizeCanvas();

    const particles: Array<{
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
    }> = [];

    // Create particles
    for (let i = 0; i < 100; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.2
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw particles
      particles.forEach(particle => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`;
        ctx.fill();
        
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
      });
      
      // Draw connecting lines
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach(p2 => {
          const distance = Math.sqrt(
            Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)
          );
          if (distance < 80) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 * (1 - distance / 80)})`;
            ctx.stroke();
          }
        });
      });
      
      requestAnimationFrame(draw);
    };
    
    draw();
    
    const handleResize = () => {
      resizeCanvas();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return (
    <div className="hidden md:block md:w-1/2 h-full bg-[#253439] relative">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full"></canvas>
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
        <Link href="/" className="inline-block">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white italic font-playfair hover:scale-105 transition-transform text-center">
            LEARNIFY
          </h1>
        </Link>
        <p className="mt-4 text-white/70 text-lg text-center max-w-md">Personalized Learning, Tailored for You</p>
      </div>
    </div>
  );
}

// Memoize the component to prevent unnecessary re-renders
export const AnimatedSidebar = memo(AnimatedSidebarComponent); 
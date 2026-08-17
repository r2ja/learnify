'use client';

import { FC, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface FloatingPathsProps {
  position: number;
  opacity?: number;
}

export const FloatingPaths: FC<FloatingPathsProps> = ({ position, opacity = 0.9 }) => {
  const [windowHeight, setWindowHeight] = useState(0);
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    setWindowHeight(window.innerHeight);
    setWindowWidth(window.innerWidth);
    
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const offsetY = 0.1 * (windowHeight - 200);
  const scaleFactor = windowWidth > 1024 ? 1 : 0.8; // Adjust scale based on screen size

  // Create more spread out paths for dashboard
  const paths = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    d: `M${1076 + i * 8 * position * scaleFactor} ${-189 + i * 6 + offsetY}C${
      1076 + i * 8 * position * scaleFactor
    } ${-189 + i * 6 + offsetY} ${1008 + i * 8 * position * scaleFactor} ${
      216 - i * 6 + offsetY
    } ${544 + i * 8 * position * scaleFactor} ${343 - i * 6 + offsetY}C${
      80 + i * 8 * position * scaleFactor
    } ${470 - i * 6 + offsetY} ${12 + i * 8 * position * scaleFactor} ${
      875 - i * 6 + offsetY
    } ${12 + i * 8 * position * scaleFactor} ${875 - i * 6 + offsetY}`,
    width: 0.4 + i * 0.02,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg viewBox="0 0 696 316" fill="none" className="w-full h-full">
        <title>Background Paths</title>
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke="currentColor"
            strokeWidth={path.width}
            strokeOpacity={0.03 + path.id * 0.01}
            initial={{ pathLength: 0.3, opacity: 0.4 }}
            animate={{
              pathLength: 1,
              opacity: [0.2, 0.4, 0.2],
              pathOffset: [0, 1, 0],
            }}
            transition={{
              duration: 25 + Math.random() * 15,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          />
        ))}
      </svg>
    </div>
  );
};

export const DashboardBackgroundPaths: FC = () => {
  return (
    <div className="fixed inset-0 text-[var(--primary)] opacity-40 z-0 pointer-events-none overflow-hidden">
      <FloatingPaths position={1} />
      <FloatingPaths position={-1} />
    </div>
  );
};

export default DashboardBackgroundPaths; 
'use client';

import { FC, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface FloatingPathsProps {
  position: number;
}

export const FloatingPaths: FC<FloatingPathsProps> = ({ position }) => {
  const [windowHeight, setWindowHeight] = useState(0);

  useEffect(() => {
    setWindowHeight(window.innerHeight);
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const offsetY = 0.1 * (windowHeight - 200);

  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M${1076 + i * 5 * position} ${-189 + i * 6 + offsetY}C${
      1076 + i * 5 * position
    } ${-189 + i * 6 + offsetY} ${1008 + i * 5 * position} ${
      216 - i * 6 + offsetY
    } ${544 + i * 5 * position} ${343 - i * 6 + offsetY}C${
      80 + i * 5 * position
    } ${470 - i * 6 + offsetY} ${12 + i * 5 * position} ${
      875 - i * 6 + offsetY
    } ${12 + i * 5 * position} ${875 - i * 6 + offsetY}`,
    width: 0.5 + i * 0.03,
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
            strokeOpacity={0.1 + path.id * 0.03}
            initial={{ pathLength: 0.3, opacity: 0.6 }}
            animate={{
              pathLength: 1,
              opacity: [0.3, 0.6, 0.3],
              pathOffset: [0, 1, 0],
            }}
            transition={{
              duration: 20 + Math.random() * 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          />
        ))}
      </svg>
    </div>
  );
};

export const BackgroundPaths: FC = () => {
  return (
    <div className="fixed inset-0 text-[var(--primary)] opacity-90 z-0 pointer-events-none">
      <FloatingPaths position={1} />
      <FloatingPaths position={-1} />
    </div>
  );
};

export default BackgroundPaths; 
'use client';

import React, { useEffect } from 'react';
import styles from './ShootingStarsBackground.module.css';

export const ShootingStarsBackground: React.FC<{ 
  children?: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  // Number of shooting stars
  const numberOfStars = 20;
  
  return (
    <div className={`${styles.background} ${className}`}>
      <div className={styles.night}>
        {[...Array(numberOfStars)].map((_, i) => (
          <div key={i} className={styles.shooting_star} style={{
            animationDelay: `${Math.random() * 3000}ms`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`
          }}></div>
        ))}
      </div>
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
}; 
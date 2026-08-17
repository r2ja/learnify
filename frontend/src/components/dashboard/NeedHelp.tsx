'use client';

import React from 'react';
import Link from 'next/link';

export function NeedHelp() {
  return (
    <div className="bg-[var(--primary)] text-white p-6 rounded-2xl relative overflow-hidden animate-fadeIn animation-delay-700">
      {/* Background decorative stars (similar to header) */}
      <div className="absolute top-0 right-0 w-full h-full">
        <div className="absolute bottom-10 right-10 w-16 h-16 opacity-20">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
        </div>
        <div className="absolute top-5 right-20 w-12 h-12 opacity-10">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
        </div>
      </div>
      
      <div className="relative z-10">
        <div className="text-xl font-bold mb-6">
          Need help solving a <br /> tricky question?
        </div>
        
        <Link href="/chat">
          <button className="bg-white text-[var(--primary)] px-4 py-2 rounded-full font-medium hover:bg-gray-100 transition-all duration-300 hover:shadow-lg hover:transform hover:scale-105">
            Let's Go
          </button>
        </Link>
      </div>
    </div>
  );
} 
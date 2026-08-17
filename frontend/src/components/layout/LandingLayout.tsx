'use client';

import { ReactNode } from 'react';
import { LandingNavbar } from './LandingNavbar';

interface LandingLayoutProps {
  children: ReactNode;
}

export function LandingLayout({ children }: LandingLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden">
      <LandingNavbar />
      <main className="ml-20 p-0 flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
} 
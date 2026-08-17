'use client';

import { ReactNode } from 'react';
import { Navbar } from './Navbar';

interface MainLayoutProps {
  children: ReactNode;
  showNavbar?: boolean;
}

export function MainLayout({ children, showNavbar = true }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden">
      {showNavbar && <Navbar />}
      <main className={`${showNavbar ? 'ml-20' : ''} p-0 flex-1 overflow-hidden`}>
        {children}
      </main>
    </div>
  );
} 
'use client';

import Link from 'next/link';
import { ReactNode } from 'react';

interface NavItemProps {
  href: string;
  isActive: boolean;
  icon: ReactNode;
}

export function NavItem({ href, isActive, icon }: NavItemProps) {
  return (
    <Link 
      href={href} 
      className={`
        relative p-2 rounded-lg transition-all duration-300
        flex items-center justify-center
        ${isActive 
          ? 'text-white bg-[#1a272a] shadow-md' 
          : 'text-gray-300 hover:text-white hover:bg-[#1a272a]'
        }
      `}
    >
      <div className="relative z-10">
        {icon}
      </div>
      
      {/* Animated hover effect */}
      <span className={`
        absolute inset-0 rounded-lg transition-all duration-300
        ${isActive ? 'opacity-0' : 'opacity-0 hover:opacity-10'}
        bg-white
      `}></span>
      
      {/* Active indicator */}
      {isActive && (
        <span className="absolute -right-1 top-1/2 -translate-y-1/2 h-3 w-1 bg-white rounded-l-full"></span>
      )}
    </Link>
  );
} 
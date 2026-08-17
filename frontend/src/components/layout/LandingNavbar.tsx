'use client';

import Link from 'next/link';

export function LandingNavbar() {
  return (
    <nav className="w-20 h-screen fixed left-0 top-0 bg-[var(--sidebar)] rounded-r-3xl p-4 flex flex-col items-center shadow-lg">
      {/* Logo */}
      <div className="mt-6 mb-12 flex flex-col items-center">
        <Link href="/" className="text-white font-playfair italic font-bold text-center hover:scale-110 transition-transform duration-300 no-underline">
          <div className="writing-mode-vertical text-2xl tracking-widest drop-shadow-[0_0_6px_rgba(255,255,255,0.3)]">
            LEARNIFY
          </div>
        </Link>
      </div>
      
      {/* Spacer to push login/signup buttons to the middle */}
      <div className="flex-grow"></div>
      
      {/* Login and Signup Buttons */}
      <div className="flex flex-col gap-6 mb-8">
        {/* Login Button */}
        <div className="group relative">
          <Link 
            href="/auth/login" 
            className="text-white bg-[#1a272a] p-2 rounded-lg transition-all duration-300 hover:bg-opacity-90 flex items-center justify-center relative z-10"
            aria-label="Login"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
          </Link>
          <span className="absolute -right-16 top-1/2 -translate-y-1/2 bg-[#1a272a] text-white text-xs py-1 px-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-30">
            Login
          </span>
        </div>
        
        {/* Signup Button */}
        <div className="group relative">
          <Link 
            href="/auth/signup" 
            className="text-white bg-[#1a272a] p-2 rounded-lg transition-all duration-300 hover:bg-opacity-90 flex items-center justify-center relative z-10"
            aria-label="Sign up"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </Link>
          <span className="absolute -right-16 top-1/2 -translate-y-1/2 bg-[#1a272a] text-white text-xs py-1 px-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-30">
            Sign up
          </span>
        </div>
      </div>
      
      {/* Bottom spacer */}
      <div className="flex-grow"></div>
    </nav>
  );
} 
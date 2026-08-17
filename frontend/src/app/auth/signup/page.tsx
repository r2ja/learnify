'use client';

import Link from 'next/link';
import { SignupForm } from '@/components/auth/SignupForm';
import { useEffect } from 'react';
import { AnimatedSidebar } from '@/components/auth/AnimatedSidebar';

export default function SignupPage() {
  useEffect(() => {
    // Add overflow control to the body
    document.body.style.overflow = 'hidden';
    
    return () => {
      // Reset overflow when component unmounts
      document.body.style.overflow = '';
    };
  }, []);
  
  return (
    <div className="fixed inset-0 flex flex-col md:flex-row w-screen h-screen overflow-hidden">
      {/* Left side - Logo and animation */}
      <AnimatedSidebar />
      
      {/* Right side - Signup form */}
      <div className="w-full md:w-1/2 h-full bg-white flex justify-center items-center px-8">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-darkTeal text-center">
              Create Account
            </h2>
            <p className="text-gray-600 text-center">
              Join Learnify and start your personalized learning journey
            </p>
          </div>

          <SignupForm />
          
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-secondary hover:text-secondary-700 font-medium">
                Log in
              </Link>
            </p>
          </div>
          
          <div className="mt-6 text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} Learnify. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
} 
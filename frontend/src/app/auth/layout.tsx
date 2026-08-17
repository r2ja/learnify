'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/components/auth/AuthContext';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        {children}
      </div>
    </AuthProvider>
  );
} 
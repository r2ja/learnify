'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCookie, deleteCookie } from 'cookies-next';

interface User {
  id: string;
  email: string;
  name?: string;
  role: string;
  image?: string;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User) => void;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  refreshUserData: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch current user data from the API
  const fetchUserData = async (): Promise<User | null> => {
    try {
      console.log('AuthContext: Fetching user data from /api/auth/me');
      // Fetch the current user data with credentials included
      const response = await fetch('/api/auth/me', {
        credentials: 'include', // Include cookies in the request
      });
      
      console.log('AuthContext: /api/auth/me response status:', response.status);
      
      if (response.ok) {
        const userData = await response.json();
        console.log('AuthContext: User data received:', userData);
        
        // Set the user state with the complete data from the API
        setUser(userData);
        return userData;
      } else {
        // Token expired or invalid, clear it
        console.log('AuthContext: Authentication failed, clearing token');
        deleteCookie('auth_token');
        setUser(null);
        return null;
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
      return null;
    }
  };

  // Check for authentication on page load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await fetchUserData();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (userData: User) => {
    console.log('AuthContext: Login with user data:', userData);
    setUser(userData);
  };

  const logout = async () => {
    try {
      console.log('AuthContext: Logging out');
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies in the request
      });

      if (response.ok) {
        setUser(null);
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Function to manually refresh user data
  const refreshUserData = async (): Promise<User | null> => {
    console.log('AuthContext: Manually refreshing user data');
    return fetchUserData();
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        login, 
        logout, 
        isAuthenticated: !!user,
        loading,
        refreshUserData 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 
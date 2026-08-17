'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';

interface LearningProfile {
  learningStyle: string;
  preferences: any;
  assessmentDate: string;
}

export function DashboardHeader() {
  const { user } = useAuth();
  const [learningProfile, setLearningProfile] = useState<LearningProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchLearningProfile = async () => {
      if (!user) return;
      
      try {
        const response = await fetch(`/api/users/${user.id}/learning-profile`);
        
        if (response.ok) {
          const data = await response.json();
          setLearningProfile(data);
        } else if (response.status !== 404) {
          // 404 is expected if user hasn't taken assessment yet
          const errorData = await response.json();
          setError(errorData.error || 'Failed to load learning profile');
        }
      } catch (err) {
        console.error('Error fetching learning profile:', err);
        setError('Unable to load your learning profile');
      } finally {
        setLoading(false);
      }
    };
    
    fetchLearningProfile();
  }, [user]);
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };
  
  return (
    <div className="bg-darkTeal rounded-2xl p-6 text-white shadow-md">
      <div className="flex items-center mb-3">
        <div className="bg-[#33454b] rounded-full h-14 w-14 flex items-center justify-center mr-4">
          {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
        </div>
        <div>
          <h2 className="text-2xl font-bold">{getGreeting()}, {user?.name || 'Student'}</h2>
          {loading ? (
            <div className="text-white/80">Loading your learning profile...</div>
          ) : error ? (
            <div className="text-red-300 text-sm">Error: {error}</div>
          ) : learningProfile ? (
            <div className="text-white/80">Learning Style: {learningProfile.learningStyle}</div>
          ) : (
            <div className="text-white/80">
              <a href="/assessment" className="underline">Take the learning style assessment</a>
            </div>
          )}
        </div>
      </div>
      <p className="text-white/80 leading-relaxed">
        Your personalized dashboard shows your progress, upcoming tasks, and courses tailored to your unique learning style.
      </p>
    </div>
  );
} 
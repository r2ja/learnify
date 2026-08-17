'use client';

import { DashboardHeader } from './DashboardHeader';
import { CoursesSection } from './CoursesSection';
import { DailyProgress } from './DailyProgress';
import { QuizResults } from './QuizResults';
import { NeedHelp } from './NeedHelp';
import { DashboardBackgroundPaths } from './DashboardBackgroundPaths';

export function DashboardContent() {
  return (
    <div className="relative min-h-screen p-6 overflow-hidden">
      {/* Animated Background */}
      <DashboardBackgroundPaths />
      
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Section (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Section */}
          <DashboardHeader />
          
          {/* Courses Section */}
          <CoursesSection />
        </div>
        
        {/* Right Section (1/3 width) */}
        <div className="space-y-6">
          {/* Daily Progress */}
          <DailyProgress />
          
          {/* Quiz Results */}
          <QuizResults />
          
          {/* Need Help Section */}
          <NeedHelp />
        </div>
      </div>
    </div>
  );
} 
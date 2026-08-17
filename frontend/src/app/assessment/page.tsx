'use client';

import { MainLayout } from '@/components/layout/MainLayout';
import { LearningAssessment } from '@/components/assessment/LearningAssessment';
import { ShootingStarsBackground } from '@/components/assessment/ShootingStarsBackground';

export default function AssessmentPage() {
  return (
    <MainLayout showNavbar={true}>
      <div className="relative min-h-screen w-full">
        <ShootingStarsBackground>
          <LearningAssessment />
        </ShootingStarsBackground>
      </div>
    </MainLayout>
  );
} 
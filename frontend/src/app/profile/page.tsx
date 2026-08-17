'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProfileContent } from '@/components/profile/ProfileContent';
import { ShootingStarsBackground } from '@/components/assessment/ShootingStarsBackground';

export default function ProfilePage() {
  return (
    <MainLayout>
      <main className="relative w-full h-full">
        <ShootingStarsBackground className="!opacity-30" />
        <div className="relative z-10">
          <ProfileContent />
        </div>
      </main>
    </MainLayout>
  );
} 
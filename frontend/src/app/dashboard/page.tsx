'use client';

import { MainLayout } from '@/components/layout/MainLayout';
import { DashboardContent } from '@/components/dashboard/DashboardContent';

export default function DashboardPage() {
  return (
    <MainLayout>
      <div className="overflow-hidden">
        <DashboardContent />
      </div>
    </MainLayout>
  );
} 
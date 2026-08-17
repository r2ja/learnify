'use client';

import { useParams } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { CourseExam } from '@/components/courses/CourseExam';
import { ShootingStarsBackground } from '@/components/assessment/ShootingStarsBackground';

export default function CourseExamPage() {
  const params = useParams();
  const courseId = params.courseId as string;

  return (
    <MainLayout>
      <div className="relative min-h-screen w-full">
        <ShootingStarsBackground>
          <CourseExam courseId={courseId} />
        </ShootingStarsBackground>
      </div>
    </MainLayout>
  );
} 
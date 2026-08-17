'use client';

import { useParams } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { ChapterQuiz } from '@/components/courses/ChapterQuiz';
import { ShootingStarsBackground } from '@/components/assessment/ShootingStarsBackground';

export default function ChapterQuizPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const chapterId = params.chapterId as string;

  return (
    <MainLayout>
      <div className="relative min-h-screen w-full">
        <ShootingStarsBackground>
          <ChapterQuiz courseId={courseId} chapterId={chapterId} />
        </ShootingStarsBackground>
      </div>
    </MainLayout>
  );
} 
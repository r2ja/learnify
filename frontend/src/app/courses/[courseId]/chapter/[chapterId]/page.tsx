'use client';

import { useParams } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { CourseChatWindow } from '@/components/learning/CourseChatWindow';
import { ShootingStarsBackground } from '@/components/assessment/ShootingStarsBackground';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ChapterLearningPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const chapterId = params.chapterId as string;

  return (
    <MainLayout>
      <div className="relative h-screen w-full flex-1">
        <ShootingStarsBackground>
          <div className="w-full h-full flex flex-col">
            <div className="p-4 bg-white/80 backdrop-blur-sm border-b border-gray-200">
              <Link href={`/courses/${courseId}`} className="text-gray-600 hover:text-[var(--primary)] flex items-center">
                <ArrowLeft size={16} className="mr-1" />
                Back to Course
              </Link>
            </div>
            <div className="flex-1 overflow-hidden">
              <CourseChatWindow courseId={courseId} chapterId={chapterId} />
            </div>
          </div>
        </ShootingStarsBackground>
      </div>
    </MainLayout>
  );
} 
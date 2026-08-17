'use client';

import { MainLayout } from '@/components/layout/MainLayout';
import { CourseChatWindow } from '@/components/learning/CourseChatWindow';

export default function ChatPage() {
  return (
    <MainLayout>
      <div className="h-screen w-full flex-1">
        <CourseChatWindow />
      </div>
    </MainLayout>
  );
} 
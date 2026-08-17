'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { courseApi } from '@/lib/api';
import Link from 'next/link';

interface Course {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  category: string;
  chapters: number;
  duration: string;
  level: string;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const data = await courseApi.getAll();
        setCourses(data);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to load courses');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCourses();
  }, []);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">All Courses</h1>
          <Link href="/dashboard" className="text-[var(--primary)] hover:underline">
            Back to Dashboard
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary)]"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="text-[var(--primary)] underline"
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Link 
                href={`/courses/${course.id}`}
                key={course.id}
                className="block"
              >
                <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 h-full flex flex-col">
                  <div className="bg-[var(--primary)] h-32 relative">
                    {course.imageUrl ? (
                      <img 
                        src={course.imageUrl}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-xl font-bold">
                        {course.title.split(' ').map(word => word[0]).join('').toUpperCase()}
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-white/90 text-[var(--primary)] px-2 py-1 rounded-full text-xs font-medium">
                      {course.level}
                    </div>
                  </div>
                  
                  <div className="p-5 flex-1 flex flex-col">
                    <h2 className="font-bold text-lg mb-2">{course.title}</h2>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">
                      {course.description || "No description available"}
                    </p>
                    
                    <div className="mt-auto">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">{course.chapters} lectures</span>
                        <span className="text-gray-500">{course.duration}</span>
                      </div>
                      
                      <div className="mt-4 text-[var(--primary)] font-medium text-sm">
                        View course details →
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
} 
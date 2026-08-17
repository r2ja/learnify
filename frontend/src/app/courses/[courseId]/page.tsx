'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';

interface SyllabusItem {
  title: string;
  content?: string;
  readings?: string[];
  exercises?: number;
  duration?: string;
}

interface SyllabusData {
  chapters?: SyllabusItem[];
}

interface CourseDetails {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  category: string;
  chapters: number;
  duration: string;
  level: string;
  syllabus?: SyllabusData | SyllabusItem[] | any;
}

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formattedSyllabus, setFormattedSyllabus] = useState<SyllabusItem[]>([]);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/courses/${courseId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch course details');
        }
        
        const data = await response.json();
        
        // Parse syllabus if it's a string
        if (typeof data.syllabus === 'string') {
          try {
            data.syllabus = JSON.parse(data.syllabus);
          } catch (e) {
            console.error('Error parsing syllabus JSON:', e);
          }
        }
        
        setCourse(data);
        
        // Process syllabus data
        let syllabusChapters: SyllabusItem[] = [];
        
        if (data.syllabus) {
          // If syllabus has a chapters array (as in our seed data)
          if (data.syllabus.chapters && Array.isArray(data.syllabus.chapters)) {
            syllabusChapters = data.syllabus.chapters;
          }
          // If syllabus is directly an array of chapters
          else if (Array.isArray(data.syllabus)) {
            syllabusChapters = data.syllabus;
          }
        }
        
        // If we still don't have syllabus data, generate it based on chapter count
        if (syllabusChapters.length === 0 && data.chapters > 0) {
          syllabusChapters = Array.from({ length: data.chapters }, (_, idx) => ({
            title: `Chapter ${idx + 1}`,
            duration: `${Math.floor(Math.random() * 2) + 1} hours`
          }));
        }
        
        setFormattedSyllabus(syllabusChapters);
      } catch (err) {
        setError('Error loading course details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary)]"></div>
        </div>
      </MainLayout>
    );
  }

  if (error || !course) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <h2 className="text-2xl font-bold text-red-600">Error</h2>
          <p className="text-gray-600">{error || 'Course not found'}</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Course Header */}
        <div className="bg-[var(--primary)] text-white p-8 rounded-xl mb-8">
          <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="bg-white/20 px-3 py-1 rounded-full">{course.category}</div>
            <div className="bg-white/20 px-3 py-1 rounded-full">{course.level}</div>
            <div className="bg-white/20 px-3 py-1 rounded-full">{course.duration}</div>
          </div>
        </div>

        {/* Course Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">About this Course</h2>
              <p className="text-gray-700">{course.description}</p>
            </div>

            {/* Syllabus */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">Course Syllabus</h2>
              {formattedSyllabus.length > 0 ? (
                <div className="space-y-4">
                  {formattedSyllabus.map((chapter, idx) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="bg-[var(--primary)] bg-opacity-10 rounded-full w-8 h-8 flex items-center justify-center mr-3 text-[var(--primary)]">
                            {idx + 1}
                          </div>
                          <span className="font-medium">{chapter.title}</span>
                        </div>
                        <span className="text-gray-500 text-sm">
                          {chapter.duration || (chapter.exercises ? `${chapter.exercises} exercises` : '1-2 hours')}
                        </span>
                      </div>
                      
                      {/* Show chapter content if available */}
                      {chapter.content && (
                        <div className="mt-3 ml-11 text-sm text-gray-600">
                          {chapter.content}
                        </div>
                      )}
                      
                      {/* Show readings if available */}
                      {chapter.readings && chapter.readings.length > 0 && (
                        <div className="mt-3 ml-11">
                          <h4 className="text-sm font-semibold text-gray-700 mb-1">Recommended Readings:</h4>
                          <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                            {chapter.readings.map((reading, readingIdx) => (
                              <li key={readingIdx}>{reading}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* Show exercises count if available */}
                      {chapter.exercises && (
                        <div className="mt-2 ml-11">
                          <span className="text-xs font-semibold bg-[var(--primary)] bg-opacity-10 text-[var(--primary)] px-2 py-1 rounded-full">
                            {chapter.exercises} exercises
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No syllabus information available.</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
              <button className="w-full py-3 px-4 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-lg font-medium transition-colors mb-4">
                Enroll in Course
              </button>
              
              <div className="border-t pt-4 mt-4">
                <h3 className="font-semibold mb-2">Course Details</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span className="text-gray-600">Lectures</span>
                    <span className="font-medium">{course.chapters}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Duration</span>
                    <span className="font-medium">{course.duration}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Level</span>
                    <span className="font-medium">{course.level}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 
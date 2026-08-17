'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Award, ChevronRight, PlayCircle, Users, BarChart } from 'lucide-react';

// Types
interface Chapter {
  title: string;
  content: string;
  readings: string[];
  exercises: number;
}

interface Syllabus {
  chapters: Chapter[];
}

interface Course {
  id: string;
  title: string;
  description: string;
  chapters: number;
  duration: string;
  level: string;
  imageUrl: string;
  category: string;
  syllabus?: Syllabus;
  createdAt: string;
  updatedAt: string;
}

export function CourseDetail({ courseId }: { courseId: string }) {
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/courses/${courseId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Course not found');
          }
          throw new Error('Failed to fetch course details');
        }
        
        const data = await response.json();
        setCourse(data);
      } catch (err) {
        console.error('Error fetching course:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  const handleEnroll = async () => {
    // In a real application, this would call an API to enroll the user in the course
    alert('Enrollment feature coming soon!');
  };

  if (loading) {
    return (
      <div className="w-full p-6 md:p-8 flex justify-center items-center min-h-[70vh]">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[var(--primary)] border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-6 md:p-8">
        <div className="bg-red-50 text-red-600 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
          <button 
            onClick={() => router.push('/courses')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="w-full p-6 md:p-8">
        <div className="bg-yellow-50 text-yellow-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-2">Course Not Found</h2>
          <p>We couldn't find the course you're looking for.</p>
          <button 
            onClick={() => router.push('/courses')}
            className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-8">
      {/* Course Header */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="bg-[var(--primary)] bg-opacity-10 p-6 border-b">
          <div className="flex items-center mb-1">
            <Link href="/courses" className="text-gray-600 hover:text-[var(--primary)] text-sm mr-2">Courses</Link>
            <ChevronRight size={14} className="text-gray-400 mr-2" />
            <span className="text-sm text-gray-600">{course.title}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{course.title}</h1>
          <p className="text-gray-600 mb-4">{course.description}</p>
          
          <div className="flex flex-wrap gap-4 text-sm mt-4">
            <div className="flex items-center">
              <Clock size={16} className="mr-2 text-[var(--primary)]" />
              <span>{course.duration}</span>
            </div>
            <div className="flex items-center">
              <BookOpen size={16} className="mr-2 text-[var(--primary)]" />
              <span>{course.chapters} chapters</span>
            </div>
            <div className="flex items-center">
              <Award size={16} className="mr-2 text-[var(--primary)]" />
              <span>{course.level}</span>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="border-b">
          <div className="flex">
            <button 
              onClick={() => setActiveTab('overview')} 
              className={`px-4 py-3 text-sm font-medium border-b-2 ${activeTab === 'overview' ? 'border-[var(--primary)] text-[var(--primary)]' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
            >
              Overview
            </button>
            <button 
              onClick={() => setActiveTab('syllabus')} 
              className={`px-4 py-3 text-sm font-medium border-b-2 ${activeTab === 'syllabus' ? 'border-[var(--primary)] text-[var(--primary)]' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
            >
              Syllabus
            </button>
          </div>
        </div>
        
        {/* Tab Content */}
        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              <h2 className="text-xl font-bold mb-4">About This Course</h2>
              <p className="text-gray-700 mb-6">{course.description}</p>
              
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h3 className="flex items-center text-lg font-semibold text-blue-800 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2">
                    <path d="M12 2c5.522 0 10 4.478 10 10s-4.478 10-10 10S2 17.522 2 12 6.478 2 12 2zm-1.5 14h3v-2h-3v2zm3.5-5c0-.827-.673-1.5-1.5-1.5h-1c-.827 0-1.5.673-1.5 1.5v.5h2v-.5h1v.5c0 .827-.673 1.5-1.5 1.5h-1c-.827 0-1.5-.673-1.5-1.5V11h-2v.5c0 1.93 1.57 3.5 3.5 3.5h1c1.93 0 3.5-1.57 3.5-3.5V11z"/>
                  </svg>
                  AI-Powered Learning
                </h3>
                <p className="text-blue-700">This course features adaptive learning that adjusts to your pace and learning style. Our AI generates personalized explanations, examples, and practice problems.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2 flex items-center">
                    <Users size={18} className="mr-2 text-[var(--primary)]" />
                    Who This Course is For
                  </h3>
                  <ul className="list-disc pl-5 text-gray-700">
                    <li>Students with no prior experience in {course.category}</li>
                    <li>Self-learners interested in {course.title.toLowerCase()}</li>
                    <li>Professionals looking to refresh their knowledge</li>
                  </ul>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2 flex items-center">
                    <BarChart size={18} className="mr-2 text-[var(--primary)]" />
                    What You'll Learn
                  </h3>
                  <ul className="list-disc pl-5 text-gray-700">
                    <li>Fundamentals of {course.title.toLowerCase()}</li>
                    <li>Practical skills through hands-on exercises</li>
                    <li>Real-world application of concepts</li>
                  </ul>
                </div>
              </div>
              
              <button 
                onClick={handleEnroll} 
                className="w-full py-3 bg-[var(--primary)] text-white font-medium rounded-md hover:brightness-110 transition-all"
              >
                Enroll in this Course
              </button>
            </div>
          )}
          
          {/* Syllabus Tab */}
          {activeTab === 'syllabus' && (
            <div>
              <h2 className="text-xl font-bold mb-4">Course Syllabus</h2>
              <p className="text-gray-600 mb-6">This course consists of {course.chapters} chapters. Each chapter includes readings, video lectures, and exercises to help reinforce your learning.</p>
              
              <div className="space-y-4">
                {course.syllabus?.chapters.map((chapter, index) => (
                  <div key={index} className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-50 p-4 flex justify-between items-center">
                      <h3 className="font-semibold">Chapter {index + 1}: {chapter.title}</h3>
                      <div className="flex items-center text-sm text-gray-500">
                        <BookOpen size={14} className="mr-1" />
                        <span>{chapter.exercises} exercises</span>
                      </div>
                    </div>
                    <div className="p-4 border-t">
                      <p className="text-gray-700 mb-4">{chapter.content}</p>
                      
                      {chapter.readings.length > 0 && (
                        <div className="mt-3">
                          <h4 className="text-sm font-semibold mb-1">Readings:</h4>
                          <ul className="list-disc pl-5 text-sm text-gray-600">
                            {chapter.readings.map((reading, idx) => (
                              <li key={idx}>{reading}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      <Link 
                        href={`/courses/${courseId}/chapter/${index + 1}`} 
                        className="mt-4 inline-flex items-center text-sm font-medium text-[var(--primary)] hover:underline"
                      >
                        <PlayCircle size={16} className="mr-1" />
                        Start Learning
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8">
                <button 
                  onClick={handleEnroll} 
                  className="w-full py-3 bg-[var(--primary)] text-white font-medium rounded-md hover:brightness-110 transition-all"
                >
                  Enroll in this Course
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { courseApi } from '@/lib/api';

// Define interfaces for type safety
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

interface Course {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  category: string;
  chapters: number;
  duration: string;
  level: string;
  syllabus?: SyllabusData | SyllabusItem[] | any;
}

interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
  onStartCourse: (courseId: string) => void;
}

// Modal component for course details
function CourseModal({ isOpen, onClose, course, onStartCourse }: CourseModalProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    
    // Prevent scrolling of the body when modal is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  if (!isOpen || !mounted) return null;
  
  // Extract syllabus chapters from course data
  let syllabusChapters: SyllabusItem[] = [];
  
  if (course.syllabus) {
    // If syllabus has a chapters array (as in our seed data)
    if (course.syllabus.chapters && Array.isArray(course.syllabus.chapters)) {
      syllabusChapters = course.syllabus.chapters;
    }
    // If syllabus is directly an array of chapters
    else if (Array.isArray(course.syllabus)) {
      syllabusChapters = course.syllabus;
    }
  }
  
  // If we still don't have syllabus data, generate it based on chapter count
  if (syllabusChapters.length === 0 && course.chapters > 0) {
    syllabusChapters = Array.from({ length: course.chapters }, (_, idx) => ({
      title: `Chapter ${idx + 1}`,
      duration: `${Math.floor(Math.random() * 2) + 1} hours`
    }));
  }
  
  // Portal content
  const modalContent = (
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-[5px] z-[9999] flex items-center justify-center p-4 animate-fadeIn"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-scaleIn"
        style={{ animationDuration: '250ms' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[var(--primary)] text-white p-6 relative">
          <button 
            onClick={onClose}
            className="absolute right-4 top-4 text-white hover:text-gray-200 transition-colors bg-black/20 hover:bg-black/30 p-1.5 rounded-full"
            aria-label="Close modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 className="text-2xl font-bold">{course.title}</h2>
          <div className="text-white/80 mt-1">
            {course.chapters} Lectures • {course.level}
          </div>
        </div>
        
        {/* Content - Syllabus */}
        <div className="overflow-y-auto p-6 flex-grow">
          <h3 className="text-lg font-bold mb-4">Course Syllabus</h3>
          <div className="space-y-4">
            {syllabusChapters.map((chapter, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="bg-[var(--primary)] bg-opacity-10 rounded-full w-8 h-8 flex items-center justify-center mr-3 text-[var(--primary)]">
                      {idx + 1}
                    </div>
                    <span className="font-medium">{chapter.title}</span>
                  </div>
                  <span className="text-gray-500 text-sm">
                    {chapter.duration || (chapter.exercises ? `${chapter.exercises} exercises` : `1-2 hours`)}
                  </span>
                </div>
                
                {/* Show chapter content if available */}
                {chapter.content && (
                  <div className="mt-2 ml-11 text-sm text-gray-600">
                    {chapter.content.length > 200 
                      ? `${chapter.content.substring(0, 200)}...` 
                      : chapter.content}
                  </div>
                )}
                
                {/* Show readings if available */}
                {chapter.readings && chapter.readings.length > 0 && (
                  <div className="mt-2 ml-11">
                    <span className="text-xs font-semibold text-gray-500">Recommended reading:</span>
                    <span className="text-xs text-gray-500 ml-1">{chapter.readings[0]}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Footer with action button */}
        <div className="p-6 border-t border-gray-200 flex justify-center">
          <button 
            onClick={() => onStartCourse(course.id)}
            className="py-2 px-8 rounded-md text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] transition-colors duration-300 font-medium flex items-center"
          >
            <span>Learn Course</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
  
  // Use createPortal only on client side
  return createPortal(modalContent, document.body);
}

export function CoursesSection() {
  const [activeTab, setActiveTab] = useState('All Courses');
  const tabs = ['All Courses']; // Simplified tabs as requested
  
  // State for modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchingCourseDetails, setFetchingCourseDetails] = useState(false);
  
  const router = useRouter();
  
  // Fetch courses from API
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
  
  const handleViewCourse = async (course: Course) => {
    try {
      setFetchingCourseDetails(true);
      
      // Fetch detailed course info including syllabus
      const detailedCourse = await courseApi.getById(course.id);
      
      // Ensure syllabus data is properly parsed if it's a string
      if (typeof detailedCourse.syllabus === 'string') {
        try {
          detailedCourse.syllabus = JSON.parse(detailedCourse.syllabus);
        } catch (e) {
          console.error('Error parsing syllabus JSON:', e);
        }
      }
      
      setSelectedCourse(detailedCourse);
      setIsModalOpen(true);
    } catch (err) {
      console.error('Error fetching course details:', err);
      // Fall back to showing the basic course data
      setSelectedCourse(course);
      setIsModalOpen(true);
    } finally {
      setFetchingCourseDetails(false);
    }
  };
  
  const handleStartCourse = (courseId: string) => {
    // Redirect to the course detail page
    router.push(`/courses/${courseId}`);
    setIsModalOpen(false);
  };
  
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 shadow-sm relative z-10 animate-fadeIn animation-delay-300">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-bold">My Courses</h2>
        <Link 
          href="/courses" 
          className="text-sm text-[var(--primary)] hover:underline"
        >
          View All
        </Link>
      </div>
      
      {/* Tabs */}
      <div className="flex flex-wrap space-x-4 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`pb-1 transition-all duration-300 ${
              activeTab === tab 
              ? 'text-black font-semibold border-b-2 border-[var(--primary)]' 
              : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      
      {/* Course List */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--primary)]"></div>
        </div>
      ) : error ? (
        <div className="py-10 text-center">
          <p className="text-red-500">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 text-[var(--primary)] underline"
          >
            Try again
          </button>
        </div>
      ) : courses.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-gray-500">No courses available at the moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {courses.map((course, index) => (
            <div 
              key={course.id} 
              className={`flex justify-between items-center py-4 border-b last:border-b-0 animate-fadeIn`}
              style={{ animationDelay: `${(index + 1) * 100}ms` }}
            >
              <div className="flex-1">
                <h3 className="font-medium text-lg">{course.title}</h3>
                <div className="text-gray-500 text-sm">{course.chapters} Lectures</div>
              </div>
              <div className="flex items-center">
                <span className="text-gray-500 mr-4">{course.level}</span>
                <button 
                  className="py-2 px-4 rounded-md text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] transition-colors duration-300 text-sm"
                  onClick={() => handleViewCourse(course)}
                  disabled={fetchingCourseDetails}
                >
                  {fetchingCourseDetails ? 'Loading...' : 'View Course'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Course Modal */}
      {selectedCourse && (
        <CourseModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          course={selectedCourse}
          onStartCourse={handleStartCourse}
        />
      )}
    </div>
  );
} 
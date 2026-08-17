'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Award } from 'lucide-react';

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
}

export function CoursesOverview() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedLevel, setSelectedLevel] = useState('All Levels');
  const [searchQuery, setSearchQuery] = useState('');
  const [animateCards, setAnimateCards] = useState(false);

  // Fetch courses from the API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/courses');
        
        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }
        
        const data = await response.json();
        setCourses(data);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to load courses. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Get unique categories from courses
  const categories = ['All Categories', 
    ...Array.from(new Set(courses.map(course => course.category)))
  ];

  // Define levels options
  const levels = ['All Levels', 'Beginner', 'Intermediate', 'Advanced'];

  // Filter courses based on selections
  const filteredCourses = courses.filter(course => {
    const matchesCategory = selectedCategory === 'All Categories' || course.category === selectedCategory;
    const matchesLevel = selectedLevel === 'All Levels' || course.level === selectedLevel;
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesLevel && matchesSearch;
  });

  useEffect(() => {
    setAnimateCards(true);
  }, []);

  if (loading) {
    return (
      <div className="w-full p-6 md:p-8 flex justify-center items-center h-[70vh]">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[var(--primary)] border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-6 md:p-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-md">
          <p>{error}</p>
          <button 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-3">
            AI-Powered Learning Paths
          </h1>
          <p className="text-gray-600 max-w-2xl">
            Experience personalized education powered by our advanced AI tutors. Content adapts to your learning style through intelligent text, image, and video generation.
          </p>
        </div>

        {/* Filters Section - Khan Academy style */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Level Filter */}
            <div>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              >
                {levels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600">
          <p>Showing {filteredCourses.length} of {courses.length} courses</p>
        </div>

        {/* Courses Grid - Khan Academy style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCourses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 10 }}
              animate={animateCards ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="h-full"
            >
              <Link href={`/courses/${course.id}`} className="block h-full">
                <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 h-full flex flex-col overflow-hidden">
                  {/* Course Header */}
                  <div className="h-32 bg-[var(--primary)] bg-opacity-10 p-4 relative">
                    <div className="absolute right-4 top-4 flex flex-col items-end">
                      <span className={`text-xs px-2 py-1 rounded-full mb-2 ${
                        course.level === 'Beginner' ? 'bg-green-100 text-green-700' :
                        course.level === 'Intermediate' ? 'bg-blue-100 text-blue-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {course.level}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold">{course.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{course.category}</p>
                  </div>

                  {/* Course Content */}
                  <div className="p-4 flex-grow">
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">{course.description}</p>

                    {/* Course Meta Info */}
                    <div className="flex items-center text-xs text-gray-500 mt-auto space-x-4">
                      <div className="flex items-center">
                        <BookOpen size={14} className="mr-1" />
                        <span>{course.chapters} Chapters</span>
                      </div>
                      <div className="flex items-center">
                        <Clock size={14} className="mr-1" />
                        <span>{course.duration}</span>
                      </div>
                    </div>
                  </div>

                  {/* AI Badge and Start Button */}
                  <div className="px-4 pb-4 pt-2">
                    <div className="mb-2 flex justify-center">
                      <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 mr-1">
                          <path d="M12 2c5.522 0 10 4.478 10 10s-4.478 10-10 10S2 17.522 2 12 6.478 2 12 2zm-1.5 14h3v-2h-3v2zm3.5-5c0-.827-.673-1.5-1.5-1.5h-1c-.827 0-1.5.673-1.5 1.5v.5h2v-.5h1v.5c0 .827-.673 1.5-1.5 1.5h-1c-.827 0-1.5-.673-1.5-1.5V11h-2v.5c0 1.93 1.57 3.5 3.5 3.5h1c1.93 0 3.5-1.57 3.5-3.5V11z"/>
                        </svg>
                        Adaptive AI Learning
                      </span>
                    </div>
                    <div className="py-2 bg-[var(--primary)] hover:brightness-110 text-white text-center rounded-md transition-all text-sm">
                      Start Learning
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredCourses.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">No Courses Found</h3>
            <p className="text-gray-600 mb-4">
              We couldn't find any courses matching your current filters.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All Categories');
                setSelectedLevel('All Levels');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-[var(--primary)] text-white rounded-md hover:brightness-110"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 
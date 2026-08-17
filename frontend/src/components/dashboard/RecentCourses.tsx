import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Course {
  id: string;
  title: string;
  progress: number;
  lastAccessed: string;
  image: string;
  category: string;
}

const RecentCourses = () => {
  // This would come from an API in a real application
  const courses: Course[] = [
    {
      id: '1',
      title: 'Introduction to Machine Learning',
      progress: 68,
      lastAccessed: '2 hours ago',
      image: '/images/course-ml.jpg',
      category: 'Computer Science'
    },
    {
      id: '2',
      title: 'Advanced JavaScript Concepts',
      progress: 42,
      lastAccessed: 'Yesterday',
      image: '/images/course-js.jpg',
      category: 'Web Development'
    },
    {
      id: '3',
      title: 'Data Structures and Algorithms',
      progress: 23,
      lastAccessed: '3 days ago',
      image: '/images/course-dsa.jpg',
      category: 'Computer Science'
    }
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Recent Courses</h2>
        <Link href="/courses" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
          View All Courses
        </Link>
      </div>
      
      <div className="space-y-4">
        {courses.map((course) => (
          <Link href={`/courses/${course.id}`} key={course.id} className="block">
            <div className="flex items-center p-4 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                <div className="bg-indigo-100 absolute inset-0 flex items-center justify-center text-indigo-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
              
              <div className="ml-4 flex-grow">
                <h3 className="font-medium text-gray-900">{course.title}</h3>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <span className="mr-3">{course.category}</span>
                  <span>Last accessed: {course.lastAccessed}</span>
                </div>
                
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full" 
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                  <div className="text-right text-xs text-gray-500 mt-1">
                    {course.progress}% complete
                  </div>
                </div>
              </div>
              
              <div className="ml-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RecentCourses; 
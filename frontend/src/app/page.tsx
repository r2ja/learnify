'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { LandingLayout } from '@/components/layout/LandingLayout';

export default function Home() {
  const [animateHero, setAnimateHero] = useState(false);
  const [animateFeatures, setAnimateFeatures] = useState(false);
  
  useEffect(() => {
    // Animate sections as they come into view
    const handleScroll = () => {
      if (window.scrollY > 50) setAnimateHero(true);
      if (window.scrollY > 200) setAnimateFeatures(true);
    };
    
    // Set initial animations faster
    setTimeout(() => setAnimateHero(true), 100);
    setTimeout(() => setAnimateFeatures(true), 300);
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <LandingLayout>
      {/* Background Elements */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-0 w-64 h-64 rounded-full bg-[#253439] opacity-5 blur-3xl animate-float-slow"></div>
        <div className="absolute top-[30%] left-[15%] w-96 h-96 rounded-full bg-[#253439] opacity-5 blur-3xl animate-float-slow animation-delay-1000"></div>
        <div className="absolute bottom-32 right-[15%] w-80 h-80 rounded-full bg-[#253439] opacity-5 blur-3xl animate-float-slow animation-delay-2000"></div>
      </div>

      <div className="w-full relative z-10">
        {/* Container for consistent margins across all sections */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <section className={`py-16 mb-24 transition-all duration-500 ease-out ${animateHero ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-8">
              <div className="lg:col-span-7">
                <h2 className="text-5xl md:text-6xl font-bold mb-6 animate-fadeIn" style={{ color: '#253439' }}>
                  Personalized Learning,<br />tailored for you.
                </h2>
                <p className="text-lg md:text-xl mb-8 animate-fadeIn animation-delay-300" style={{ color: '#253439' }}>
                  Learnify revolutionizes education with AI-driven personalized learning. 
                  Our platform adapts to your unique style, delivering tailored content—
                  text, images, and videos—for better understanding and retention. With 
                  learning assessments, smart content generation, and progress tracking, 
                  Learnify makes learning engaging, efficient, and truly yours.
                </p>
                <Link 
                  href="/auth/signup" 
                  className="px-8 py-4 text-lg rounded-full text-white font-medium inline-block transition-all duration-300 hover:scale-105 hover:shadow-lg animate-fadeIn animation-delay-600 hover:brightness-110"
                  style={{ backgroundColor: '#253439' }}
                >
                  Get Started
                </Link>
              </div>
              
              <div className="lg:col-span-5 flex justify-center lg:justify-start mt-8 lg:mt-0">
                <div className="animate-float relative">
                  <Image 
                    src="/assets/images/brain.svg" 
                    alt="Brain with book and circuits" 
                    width={500}
                    height={500}
                    priority
                    className="object-contain transition-all duration-300 hover:scale-105"
                  />
                  <div className="absolute -z-10 inset-0 rounded-full bg-[#253439] opacity-10 blur-3xl animate-pulse"></div>
                </div>
              </div>
            </div>
          </section>

          {/* Feature Cards Section */}
          <section className={`py-16 mb-24 relative transition-all duration-700 ease-out ${animateFeatures ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="absolute inset-0 -mx-4 sm:-mx-6 lg:-mx-8 bg-[#253439] opacity-5 z-0"></div>
            <h2 className="text-4xl font-bold mb-12 text-center relative z-10" style={{ color: '#253439' }}>
              Our Core Features
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
              <div className="p-8 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg" style={{ backgroundColor: '#253439' }}>
                <div className="mb-4">
                  <div className="bg-[#33454b] inline-flex rounded-lg p-3 mb-4">
                    <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white">Learning Assessment</h3>
                </div>
                <p className="text-white text-base opacity-90">
                  Discover your unique learning style through our comprehensive assessment tools. We analyze how you best absorb information.
                </p>
              </div>

              <div className="p-8 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg" style={{ backgroundColor: '#253439' }}>
                <div className="mb-4">
                  <div className="bg-[#33454b] inline-flex rounded-lg p-3 mb-4">
                    <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white">Personalized Content</h3>
                </div>
                <p className="text-white text-base opacity-90">
                  Content that adapts to your learning style for better understanding and retention. Each lesson is crafted just for you.
                </p>
              </div>

              <div className="p-8 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg" style={{ backgroundColor: '#253439' }}>
                <div className="mb-4">
                  <div className="bg-[#33454b] inline-flex rounded-lg p-3 mb-4">
                    <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white">Progress Tracking</h3>
                </div>
                <p className="text-white text-base opacity-90">
                  Monitor your growth with detailed analytics and achievement milestones. See your progress in real-time as you learn.
                </p>
              </div>
            </div>
          </section>

          {/* Key Benefits Section */}
          <section className={`py-16 mb-24 transition-all duration-700 ease-out ${animateFeatures ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-4xl font-bold mb-12 text-center" style={{ color: '#253439' }}>
              Why Choose Learnify?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
                <h3 className="text-2xl font-bold mb-4" style={{ color: '#253439' }}>AI-Powered Learning</h3>
                <p className="text-lg text-gray-700">Our advanced AI algorithms analyze your learning patterns and preferences to create a truly personalized educational experience. The system learns as you do.</p>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
                <h3 className="text-2xl font-bold mb-4" style={{ color: '#253439' }}>Adaptive Content</h3>
                <p className="text-lg text-gray-700">Content that adapts to your learning style, presenting information in ways that resonate with how you learn best, whether that's visual, auditory, or hands-on.</p>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
                <h3 className="text-2xl font-bold mb-4" style={{ color: '#253439' }}>Learning Community</h3>
                <p className="text-lg text-gray-700">Connect with fellow learners, share insights, and collaborate on projects to enhance your educational journey through our vibrant community platform.</p>
              </div>
              <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
                <h3 className="text-2xl font-bold mb-4" style={{ color: '#253439' }}>Expert Support</h3>
                <p className="text-lg text-gray-700">Get help from subject matter experts and educators who can guide you through challenging concepts with personalized explanations when you need them.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </LandingLayout>
  );
}

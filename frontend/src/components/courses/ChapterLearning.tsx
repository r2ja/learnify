'use client';

import React, { useState } from 'react';
import { BookOpen, ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface ChapterLearningProps {
  courseId: string;
  chapterId: string;
}

export function ChapterLearning({ courseId, chapterId }: ChapterLearningProps) {
  // In a real app, you would fetch the specific chapter and course data
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 5;

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-6">
      <div className="mb-8">
        <Link href={`/courses/${courseId}`} className="text-gray-500 hover:text-gray-700 flex items-center">
          <ArrowLeft size={16} className="mr-1" />
          Back to Course
        </Link>
      </div>

      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm p-6 md:p-8 mb-6 border border-white/20">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Chapter Title: Sample Learning Content</h1>
          <div className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </div>
        </div>

        <div className="prose max-w-none mb-8">
          {currentPage === 1 && (
            <>
              <h2>Introduction to the Topic</h2>
              <p>
                This is sample content for the chapter. In a real application, this would contain
                the actual learning material for the chapter. This could include text, images,
                videos, code snippets, and interactive elements.
              </p>
              <p>
                Navigate through the pages to continue learning about this topic. Each page
                builds on concepts introduced in previous pages.
              </p>
            </>
          )}

          {currentPage === 2 && (
            <>
              <h2>Core Concepts</h2>
              <p>
                Here we would introduce the main concepts of this chapter. This is page 2
                of the learning material.
              </p>
              <ul>
                <li>First important concept</li>
                <li>Second important concept</li>
                <li>Third important concept</li>
              </ul>
            </>
          )}

          {currentPage === 3 && (
            <>
              <h2>Advanced Topics</h2>
              <p>
                Now that we understand the basics, let's dive deeper into more advanced
                topics related to this chapter.
              </p>
              <p>
                This is page 3 of the learning content. In a real application, this would
                contain more detailed explanations and examples.
              </p>
            </>
          )}

          {currentPage === 4 && (
            <>
              <h2>Practical Examples</h2>
              <p>
                Let's look at some practical examples to reinforce what we've learned so far.
              </p>
              <pre className="bg-gray-100 p-4 rounded">
                <code>
                  {`// Example code or demonstration
function example() {
  return "This is an example";
}`}
                </code>
              </pre>
            </>
          )}

          {currentPage === 5 && (
            <>
              <h2>Summary and Next Steps</h2>
              <p>
                Congratulations on completing this chapter! Here's a summary of what we covered:
              </p>
              <ul>
                <li>Introduction to the topic</li>
                <li>Core concepts and principles</li>
                <li>Advanced topics and considerations</li>
                <li>Practical examples and applications</li>
              </ul>
              <p>
                You're now ready to test your knowledge with the chapter quiz.
              </p>
            </>
          )}
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-md flex items-center ${
              currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <ArrowLeft size={16} className="mr-1" />
            Previous
          </button>

          {currentPage === totalPages ? (
            <Link href={`/courses/${courseId}/chapter/${chapterId}/quiz`}>
              <button className="px-4 py-2 bg-[var(--primary)] text-white rounded-md hover:brightness-110">
                Take Chapter Quiz
              </button>
            </Link>
          ) : (
            <button
              onClick={handleNextPage}
              className="px-4 py-2 bg-[var(--primary)] text-white rounded-md hover:brightness-110 flex items-center"
            >
              Next
              <ArrowRight size={16} className="ml-1" />
            </button>
          )}
        </div>
      </div>

      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm p-6 border border-white/20">
        <h2 className="text-xl font-bold mb-4">Chapter Navigation</h2>
        <div className="space-y-2">
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index + 1)}
              className={`w-full text-left p-2 rounded ${
                currentPage === index + 1
                  ? 'bg-[var(--primary)] text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <div className="flex items-center">
                <BookOpen size={16} className="mr-2" />
                <span>Page {index + 1}</span>
                {currentPage === index + 1 && <span className="ml-2 text-sm">(Current)</span>}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 
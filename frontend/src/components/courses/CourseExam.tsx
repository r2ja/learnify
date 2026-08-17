'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, CheckCircle, XCircle, AlertCircle, Award, ChevronRight } from 'lucide-react';

interface ExamQuestion {
  id: string;
  question: string;
  options: string[];
  correctOption: number;
  explanation: string;
}

interface Exam {
  id: string;
  courseId: string;
  courseName: string;
  timeLimit: number; // in minutes
  passingScore: number; // percentage
  questions: ExamQuestion[];
}

// Dummy exam data
const exams: Record<string, Exam> = {
  'intro-to-programming': {
    id: 'exam-intro-to-programming',
    courseId: 'intro-to-programming',
    courseName: 'Introduction to Programming',
    timeLimit: 30,
    passingScore: 70,
    questions: [
      {
        id: 'q1',
        question: 'What is an algorithm?',
        options: [
          'A specific type of computer hardware',
          'A step-by-step procedure for solving a problem',
          'A programming language',
          'A type of software application'
        ],
        correctOption: 1,
        explanation: 'An algorithm is a step-by-step procedure for solving a problem or accomplishing a task, forming the basis of all computer programs.'
      },
      {
        id: 'q2',
        question: 'Which of the following best describes binary code?',
        options: [
          'A programming language used by beginners',
          'A code that only uses the numbers 0 and 1',
          'A code that combines letters and numbers',
          'A secure encryption method'
        ],
        correctOption: 1,
        explanation: 'Binary code uses only two digits (0 and 1) to represent information in computing systems.'
      },
      {
        id: 'q3',
        question: 'What is the primary function of a CPU?',
        options: [
          'To store data permanently',
          'To connect to the internet',
          'To process instructions and perform calculations',
          'To display information on the screen'
        ],
        correctOption: 2,
        explanation: 'The Central Processing Unit (CPU) is responsible for processing instructions, performing calculations, and controlling the operation of other hardware components.'
      },
      // Additional exam questions would be defined here
    ]
  }
};

// Add more exams for other courses as needed
['data-structures', 'machine-learning', 'web-development', 'mobile-app-development', 'advanced-ai'].forEach(courseId => {
  exams[courseId] = {
    ...exams['intro-to-programming'],
    id: `exam-${courseId}`,
    courseId,
    courseName: `Course Name for ${courseId}`
  };
});

export function CourseExam({ courseId }: { courseId: string }) {
  const router = useRouter();
  const [exam, setExam] = useState<Exam | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isExamCompleted, setIsExamCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    // Fetch exam data
    const examData = exams[courseId];
    if (examData) {
      setExam(examData);
      setTimeLeft(examData.timeLimit * 60); // Convert minutes to seconds
      setSelectedOptions(new Array(examData.questions.length).fill(-1));
    }
  }, [courseId]);

  // Timer countdown
  useEffect(() => {
    if (!exam || isExamCompleted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleExamCompletion();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [exam, isExamCompleted, timeLeft]);

  if (!exam) {
    return (
      <div className="min-h-screen w-full flex justify-center items-center bg-[var(--background)]">
        <div className="text-center">
          <div className="inline-block animate-spin mb-4">
            <Clock size={32} className="text-[var(--primary)]" />
          </div>
          <p>Loading exam...</p>
        </div>
      </div>
    );
  }

  const handleOptionSelect = (optionIndex: number) => {
    if (isSubmitted || isExamCompleted) return;

    const newSelectedOptions = [...selectedOptions];
    newSelectedOptions[currentQuestionIndex] = optionIndex;
    setSelectedOptions(newSelectedOptions);
  };

  const handleNextQuestion = () => {
    setShowExplanation(false);
    setIsSubmitted(false);
    
    if (currentQuestionIndex < exam.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleExamCompletion();
    }
  };

  const handleSubmitAnswer = () => {
    setIsSubmitted(true);
    setShowExplanation(true);
  };

  const handleExamCompletion = () => {
    // Calculate score
    let correctAnswers = 0;
    
    selectedOptions.forEach((selected, index) => {
      if (selected === exam.questions[index].correctOption) {
        correctAnswers++;
      }
    });
    
    const finalScore = Math.round((correctAnswers / exam.questions.length) * 100);
    setScore(finalScore);
    setIsExamCompleted(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const currentQuestion = exam.questions[currentQuestionIndex];
  const userSelectedOption = selectedOptions[currentQuestionIndex];
  const isCorrect = userSelectedOption === currentQuestion.correctOption;

  return (
    <div className="min-h-screen w-full bg-[var(--background)] p-6 md:p-8">
      <div className="max-w-3xl mx-auto">
        {!isExamCompleted ? (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Exam Header */}
            <div className="bg-[var(--primary)] text-white p-6">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => router.push(`/courses/${courseId}`)}
                  className="flex items-center text-white hover:text-gray-200 transition-colors"
                >
                  <ArrowLeft size={20} className="mr-2" />
                  <span>Back to Course</span>
                </button>
                <div className="flex items-center bg-white/20 rounded-full px-3 py-1.5">
                  <Clock size={16} className="mr-2" />
                  <span className="font-medium">{formatTime(timeLeft)}</span>
                </div>
              </div>
              <h1 className="text-2xl font-bold">Final Exam</h1>
              <p className="text-white/80 mt-1">{exam.courseName}</p>
            </div>
            
            {/* Progress Bar */}
            <div className="bg-gray-100 h-2">
              <div
                className="bg-[var(--primary)] h-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / exam.questions.length) * 100}%` }}
              ></div>
            </div>
            
            {/* Question Section */}
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <span className="text-gray-500">
                  Question {currentQuestionIndex + 1} of {exam.questions.length}
                </span>
                <span className="bg-[var(--primary)] bg-opacity-10 text-[var(--primary)] px-3 py-1 rounded-full text-sm font-medium">
                  {isSubmitted ? (isCorrect ? '+1 Point' : '+0 Points') : '1 Point'}
                </span>
              </div>
              
              <h2 className="text-xl font-semibold mb-6">{currentQuestion.question}</h2>
              
              <div className="space-y-3 mb-6">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    className={`w-full text-left p-4 rounded-lg border transition-all ${
                      userSelectedOption === index 
                        ? isSubmitted
                          ? isCorrect
                            ? 'bg-green-50 border-green-300'
                            : 'bg-red-50 border-red-300'
                          : 'bg-[var(--primary)] bg-opacity-10 border-[var(--primary)]'
                        : isSubmitted && index === currentQuestion.correctOption
                          ? 'bg-green-50 border-green-300'
                          : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleOptionSelect(index)}
                    disabled={isSubmitted}
                  >
                    <div className="flex items-center">
                      <div className={`w-6 h-6 rounded-full mr-3 flex items-center justify-center ${
                        userSelectedOption === index
                          ? isSubmitted
                            ? isCorrect
                              ? 'bg-green-500 text-white'
                              : 'bg-red-500 text-white'
                            : 'bg-[var(--primary)] text-white'
                          : isSubmitted && index === currentQuestion.correctOption
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-600'
                      }`}>
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span>{option}</span>
                      
                      {isSubmitted && (
                        <div className="ml-auto">
                          {index === currentQuestion.correctOption && (
                            <CheckCircle size={20} className="text-green-500" />
                          )}
                          {userSelectedOption === index && index !== currentQuestion.correctOption && (
                            <XCircle size={20} className="text-red-500" />
                          )}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              
              {/* Explanation */}
              {showExplanation && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                  className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6"
                >
                  <div className="flex items-start">
                    <AlertCircle size={20} className="text-blue-500 mr-2 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-blue-700 mb-1">Explanation</h3>
                      <p className="text-blue-800">{currentQuestion.explanation}</p>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {/* Action Button */}
              <div className="flex justify-end">
                {!isSubmitted ? (
                  <button
                    onClick={handleSubmitAnswer}
                    className="px-6 py-2 bg-[var(--primary)] text-white rounded-md hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    disabled={userSelectedOption === -1}
                  >
                    Submit Answer
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    className="px-6 py-2 bg-[var(--primary)] text-white rounded-md hover:brightness-110 flex items-center"
                  >
                    {currentQuestionIndex < exam.questions.length - 1 ? 'Next Question' : 'Finish Exam'}
                    <ChevronRight size={18} className="ml-1" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          // Exam Results
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-sm overflow-hidden"
          >
            <div className="bg-[var(--primary)] text-white p-6">
              <h1 className="text-2xl font-bold mb-1">Exam Completed</h1>
              <p className="text-white/80">{exam.courseName}</p>
            </div>
            
            <div className="p-6">
              <div className="flex flex-col items-center text-center mb-8">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 ${
                  score >= exam.passingScore ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {score >= exam.passingScore ? (
                    <Award size={48} className="text-green-600" />
                  ) : (
                    <XCircle size={48} className="text-red-600" />
                  )}
                </div>
                
                <h2 className="text-2xl font-bold mb-2">Your Score: {score}%</h2>
                
                <p className={`text-lg ${
                  score >= exam.passingScore ? 'text-green-600' : 'text-red-600'
                }`}>
                  {score >= exam.passingScore ? 'Passed! Congratulations!' : 'Failed - Please Try Again'}
                </p>
                
                <p className="text-gray-600 mt-2">
                  Passing score: {exam.passingScore}%
                </p>
              </div>
              
              {score >= exam.passingScore && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center mb-8">
                  <Award size={64} className="mx-auto text-green-600 mb-4" />
                  <h3 className="text-xl font-bold text-green-800 mb-2">Course Completed!</h3>
                  <p className="text-green-700 mb-4">
                    You have successfully completed the {exam.courseName} course.
                    Your certificate is now available to download.
                  </p>
                  <button className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                    Download Certificate
                  </button>
                </div>
              )}
              
              <div className="p-4 bg-gray-50 rounded-lg mb-6">
                <h3 className="font-semibold mb-2">Exam Summary</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-gray-600 mb-1">Total Questions</p>
                    <p className="font-medium">{exam.questions.length}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Correct Answers</p>
                    <p className="font-medium">{Math.round((score / 100) * exam.questions.length)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Completion Time</p>
                    <p className="font-medium">{formatTime((exam.timeLimit * 60) - timeLeft)}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                {score < exam.passingScore && (
                  <button 
                    onClick={() => {
                      setIsExamCompleted(false);
                      setCurrentQuestionIndex(0);
                      setSelectedOptions(new Array(exam.questions.length).fill(-1));
                      setTimeLeft(exam.timeLimit * 60);
                    }}
                    className="flex-1 py-2.5 border border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition-colors rounded-md"
                  >
                    Retake Exam
                  </button>
                )}
                
                <Link href="/dashboard" className="flex-1">
                  <button className="w-full py-2.5 bg-[var(--primary)] text-white hover:brightness-110 transition-colors rounded-md">
                    Go to Dashboard
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
} 
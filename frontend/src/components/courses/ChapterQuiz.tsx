'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, CheckCircle, XCircle, AlertCircle, ChevronRight, ArrowRight, Award } from 'lucide-react';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctOption: number;
  explanation: string;
}

interface Quiz {
  id: string;
  chapterId: string;
  chapterTitle: string;
  courseId: string;
  courseName: string;
  timeLimit: number; // in minutes
  passingScore: number; // percentage
  questions: QuizQuestion[];
}

// Dummy quiz data
const quizzes: Record<string, Quiz> = {
  'intro-programming-ch1': {
    id: 'quiz-intro-programming-ch1',
    chapterId: 'intro-programming-ch1',
    chapterTitle: 'Introduction to Computing Concepts',
    courseId: 'intro-to-programming',
    courseName: 'Introduction to Programming',
    timeLimit: 10,
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
      {
        id: 'q4',
        question: 'Which of these is NOT an input device?',
        options: [
          'Keyboard',
          'Mouse',
          'Monitor',
          'Microphone'
        ],
        correctOption: 2,
        explanation: 'A monitor is an output device that displays information. Keyboards, mice, and microphones are all input devices that send data to the computer.'
      },
      {
        id: 'q5',
        question: 'What is the difference between hardware and software?',
        options: [
          'Hardware is expensive, software is free',
          'Hardware is physical components, software is programs and data',
          'Hardware is created by companies, software by individuals',
          'Hardware is for business use, software for personal use'
        ],
        correctOption: 1,
        explanation: 'Hardware refers to the physical components of a computer system that you can touch (like the CPU, monitor, keyboard), while software consists of programs, data, and instructions.'
      }
    ]
  }
};

// Add more quizzes for other chapters as needed
['data-structures-ch1', 'ml-ch1', 'web-dev-ch1', 'mobile-dev-ch1', 'advanced-ai-ch1'].forEach(chapterId => {
  quizzes[chapterId] = {
    ...quizzes['intro-programming-ch1'],
    id: `quiz-${chapterId}`,
    chapterId,
    chapterTitle: `Chapter Title for ${chapterId}`,
    courseId: chapterId.split('-')[0],
    courseName: `Course Name for ${chapterId.split('-')[0]}`
  };
});

interface ChapterQuizProps {
  courseId: string;
  chapterId: string;
}

export function ChapterQuiz({ courseId, chapterId }: ChapterQuizProps) {
  const router = useRouter();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    // Fetch quiz data
    const quizData = quizzes[chapterId];
    if (quizData) {
      setQuiz(quizData);
      setTimeLeft(quizData.timeLimit * 60); // Convert minutes to seconds
      setSelectedOptions(new Array(quizData.questions.length).fill(-1));
    }
  }, [chapterId]);

  // Timer countdown
  useEffect(() => {
    if (!quiz || isQuizCompleted || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleQuizCompletion();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quiz, isQuizCompleted, timeLeft]);

  if (!quiz) {
    return (
      <div className="min-h-screen w-full flex justify-center items-center bg-[var(--background)]">
        <div className="text-center">
          <div className="inline-block animate-spin mb-4">
            <Clock size={32} className="text-[var(--primary)]" />
          </div>
          <p>Loading quiz...</p>
        </div>
      </div>
    );
  }

  const handleOptionSelect = (optionIndex: number) => {
    if (isSubmitted || isQuizCompleted) return;

    const newSelectedOptions = [...selectedOptions];
    newSelectedOptions[currentQuestionIndex] = optionIndex;
    setSelectedOptions(newSelectedOptions);
  };

  const handleNextQuestion = () => {
    setShowExplanation(false);
    setIsSubmitted(false);
    
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleQuizCompletion();
    }
  };

  const handleSubmitAnswer = () => {
    setIsSubmitted(true);
    setShowExplanation(true);
  };

  const handleQuizCompletion = () => {
    // Calculate score
    let correctAnswers = 0;
    
    selectedOptions.forEach((selected, index) => {
      if (selected === quiz.questions[index].correctOption) {
        correctAnswers++;
      }
    });
    
    const finalScore = Math.round((correctAnswers / quiz.questions.length) * 100);
    setScore(finalScore);
    setIsQuizCompleted(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const userSelectedOption = selectedOptions[currentQuestionIndex];
  const isCorrect = userSelectedOption === currentQuestion.correctOption;

  const handleContinue = () => {
    // In a real app, this would save the quiz results to the backend
    // and update the user's progress
    router.push(`/courses/${courseId}`);
  };

  return (
    <div className="min-h-screen w-full bg-[var(--background)] p-6 md:p-8">
      <div className="max-w-3xl mx-auto">
        {!isQuizCompleted ? (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Quiz Header */}
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
              <h1 className="text-2xl font-bold">{quiz.chapterTitle} - Quiz</h1>
              <p className="text-white/80 mt-1">{quiz.courseName}</p>
            </div>
            
            {/* Progress Bar */}
            <div className="bg-gray-100 h-2">
              <div
                className="bg-[var(--primary)] h-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
              ></div>
            </div>
            
            {/* Question Section */}
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <span className="text-gray-500">
                  Question {currentQuestionIndex + 1} of {quiz.questions.length}
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
                      <span className={`${
                        isSubmitted && (index === userSelectedOption || index === currentQuestion.correctOption)
                          ? 'font-medium'
                          : ''
                      }`}>
                        {option}
                      </span>
                      
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
              
              {/* Explanation Section */}
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
                    {currentQuestionIndex < quiz.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                    <ChevronRight size={18} className="ml-1" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          // Quiz Results
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl shadow-sm overflow-hidden"
          >
            <div className="bg-[var(--primary)] text-white p-6">
              <h1 className="text-2xl font-bold mb-1">Quiz Completed</h1>
              <p className="text-white/80">{quiz.chapterTitle}</p>
            </div>
            
            <div className="p-6">
              <div className="flex flex-col items-center text-center mb-8">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-4 ${
                  score >= quiz.passingScore ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {score >= quiz.passingScore ? (
                    <CheckCircle size={48} className="text-green-600" />
                  ) : (
                    <XCircle size={48} className="text-red-600" />
                  )}
                </div>
                
                <h2 className="text-2xl font-bold mb-2">Your Score: {score}%</h2>
                
                <p className={`text-lg ${
                  score >= quiz.passingScore ? 'text-green-600' : 'text-red-600'
                }`}>
                  {score >= quiz.passingScore ? 'Passed!' : 'Failed - Please Try Again'}
                </p>
                
                <p className="text-gray-600 mt-2">
                  Passing score: {quiz.passingScore}%
                </p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg mb-6">
                <h3 className="font-semibold mb-2">Quiz Summary</h3>
                <div className="flex justify-between">
                  <div>
                    <p className="text-gray-600 mb-1">Total Questions</p>
                    <p className="font-medium">{quiz.questions.length}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Correct Answers</p>
                    <p className="font-medium">{Math.round((score / 100) * quiz.questions.length)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Completion Time</p>
                    <p className="font-medium">{formatTime((quiz.timeLimit * 60) - timeLeft)}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href={`/courses/${courseId}/chapter/${chapterId}`} className="flex-1">
                  <button className="w-full py-2.5 border border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition-colors rounded-md">
                    Revisit Chapter
                  </button>
                </Link>
                
                <button
                  onClick={handleContinue}
                  className="w-full sm:w-auto px-6 py-2 bg-[var(--primary)] text-white rounded-md hover:brightness-110"
                >
                  {score >= quiz.passingScore ? 'Continue to Next Chapter' : 'Try Again Later'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
} 
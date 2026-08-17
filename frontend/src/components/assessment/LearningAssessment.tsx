'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthContext';

interface Question {
  id: number;
  question: string;
  options: string[];
  type: 'single' | 'multiple' | 'rating';
}

interface LearningStyleResult {
  primaryStyle: string;
  preferences: Record<string, any>;
}

export function LearningAssessment() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string | string[] | number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sample questions - in a real app this would come from an API
  const questions: Question[] = [
    {
      id: 1,
      question: "How do you prefer to consume learning content?",
      options: ["Reading text", "Watching videos", "Interactive exercises", "Listening to audio"],
      type: "single"
    },
    {
      id: 2,
      question: "Which of these subjects are you most interested in learning?",
      options: ["Programming", "Design", "Business", "Data Science", "Mathematics"],
      type: "multiple"
    },
    {
      id: 3,
      question: "How important is a structured learning path to you?",
      options: ["Not important", "Somewhat important", "Very important", "Essential"],
      type: "single"
    },
    {
      id: 4,
      question: "Rate your ability to focus for long periods of study:",
      options: ["1", "2", "3", "4", "5"],
      type: "rating"
    },
    {
      id: 5,
      question: "Do you learn better with deadlines or a flexible schedule?",
      options: ["Strict deadlines", "Soft deadlines", "Completely flexible schedule"],
      type: "single"
    }
  ];

  const currentQuestion = questions[currentQuestionIndex];

  const handleSingleAnswer = (option: string) => {
    setAnswers({ ...answers, [currentQuestion.id]: option });
  };

  const handleMultipleAnswer = (option: string) => {
    const currentAnswer = answers[currentQuestion.id] as string[] || [];
    
    if (currentAnswer.includes(option)) {
      setAnswers({
        ...answers,
        [currentQuestion.id]: currentAnswer.filter(item => item !== option)
      });
    } else {
      setAnswers({
        ...answers,
        [currentQuestion.id]: [...currentAnswer, option]
      });
    }
  };

  const handleRating = (rating: number) => {
    setAnswers({ ...answers, [currentQuestion.id]: rating });
  };

  const isAnswered = () => {
    const answer = answers[currentQuestion.id];
    if (!answer) return false;
    
    if (currentQuestion.type === 'multiple') {
      return (answer as string[]).length > 0;
    }
    
    return true;
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Analyze assessment answers to determine learning style
  const analyzeLearningStyle = (): LearningStyleResult => {
    // This is a simplified algorithm - in a real app, this would be more sophisticated
    // and possibly done server-side with a machine learning model
    
    const contentPreference = answers[1] as string;
    let primaryStyle = 'Visual Learner'; // Default
    
    if (contentPreference === 'Reading text') {
      primaryStyle = 'Reading/Writing Learner';
    } else if (contentPreference === 'Watching videos') {
      primaryStyle = 'Visual Learner';
    } else if (contentPreference === 'Interactive exercises') {
      primaryStyle = 'Kinesthetic Learner';
    } else if (contentPreference === 'Listening to audio') {
      primaryStyle = 'Auditory Learner';
    }
    
    // Collect additional preferences
    const preferences = {
      subjects: answers[2] || [],
      structuredLearning: answers[3] || 'Somewhat important',
      focusAbility: answers[4] || 3,
      schedulePreference: answers[5] || 'Flexible schedule',
    };
    
    return { primaryStyle, preferences };
  };

  const handleSubmit = async () => {
    if (!user) {
      setError('You must be logged in to save your assessment results');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Analyze results
      const { primaryStyle, preferences } = analyzeLearningStyle();
      
      // Save learning profile to database
      const response = await fetch(`/api/users/${user.id}/learning-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          learningStyle: primaryStyle,
          preferences: preferences,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save learning profile');
      }
      
      // Navigate to dashboard after completing the assessment
      router.push('/dashboard');
    } catch (err) {
      console.error('Error submitting assessment:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setIsSubmitting(false);
    }
  };

  const renderOptions = () => {
    const { type, options } = currentQuestion;
    
    if (type === 'single') {
      return (
        <div className="space-y-3">
          {options.map((option, index) => {
            const isSelected = answers[currentQuestion.id] === option;
            return (
              <div 
                key={index}
                onClick={() => handleSingleAnswer(option)}
                className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                  isSelected 
                    ? 'bg-darkTeal border-darkTeal text-white' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {option}
              </div>
            );
          })}
        </div>
      );
    }
    
    if (type === 'multiple') {
      const selectedOptions = answers[currentQuestion.id] as string[] || [];
      
      return (
        <div className="space-y-3">
          {options.map((option, index) => {
            const isSelected = selectedOptions.includes(option);
            return (
              <div 
                key={index}
                onClick={() => handleMultipleAnswer(option)}
                className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                  isSelected 
                    ? 'bg-darkTeal border-darkTeal text-white' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-5 h-5 mr-3 border rounded flex-shrink-0 flex items-center justify-center transition-colors ${
                    isSelected 
                      ? 'bg-white border-white' 
                      : 'border-gray-400'
                  }`}>
                    {isSelected && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-darkTeal" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  {option}
                </div>
              </div>
            );
          })}
        </div>
      );
    }
    
    if (type === 'rating') {
      return (
        <div className="flex justify-between items-center mt-8 mb-4 px-4">
          {options.map((option, index) => {
            const rating = index + 1;
            const isSelected = answers[currentQuestion.id] === rating;
            return (
              <button
                key={index}
                onClick={() => handleRating(rating)}
                className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-medium transition-all duration-200 hover:scale-110 ${
                  isSelected 
                    ? 'bg-darkTeal text-white shadow-lg' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 relative z-10">
      <div className="mb-10 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold mb-3 text-darkTeal">Learning Style Assessment</h1>
        <p className="text-gray-700 text-lg max-w-xl mx-auto">
          Help us understand how you learn best so we can tailor your experience for maximum effectiveness.
        </p>
      </div>
      
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="w-full bg-gray-300 rounded-full h-2.5 backdrop-blur-sm">
          <div
            className="h-2.5 rounded-full bg-gradient-to-r from-[#253439] to-[#1a272a] transition-all duration-300"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-600">
          <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
          <span>{Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% Complete</span>
        </div>
      </div>
      
      {/* Question Card */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 transform transition-all duration-300 hover:shadow-2xl">
        <h2 className="text-2xl font-bold mb-6 text-darkTeal">{currentQuestion.question}</h2>
        {renderOptions()}
      </div>
      
      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className="px-8 py-3 border border-gray-400 rounded-lg text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-all duration-200"
        >
          Previous
        </button>
        
        <button
          onClick={handleNext}
          disabled={!isAnswered() || isSubmitting}
          className="px-8 py-3 bg-darkTeal text-white rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-opacity-90 hover:scale-105 transition-all duration-200"
        >
          {currentQuestionIndex < questions.length - 1 ? 'Next' : (isSubmitting ? 'Submitting...' : 'Finish')}
        </button>
      </div>
    </div>
  );
} 
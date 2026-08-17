'use client';

import { FC } from 'react';

interface SuggestedQuestionsProps {
  questions: string[];
  onQuestionClick: (question: string) => void;
}

export const SuggestedQuestions: FC<SuggestedQuestionsProps> = ({ 
  questions, 
  onQuestionClick 
}) => {
  // Duplicate questions to make the animation loop appear smoother
  const displayQuestions = [...questions, ...questions];
  
  return (
    <div className="w-full max-w-3xl overflow-hidden relative py-4">
      <div className="flex gap-4 whitespace-nowrap animate-[ticker_15s_linear_infinite] hover:paused">
        {displayQuestions.map((question, index) => (
          <button
            key={index}
            className="bg-white border border-[var(--primary)]/20 px-6 py-3 rounded-full text-sm font-medium text-gray-800 transition-all hover:bg-[var(--primary-foreground)] hover:border-[var(--primary)] hover:-translate-y-0.5"
            onClick={() => onQuestionClick(question)}
          >
            {question}
          </button>
        ))}
      </div>
      
      {/* Gradient fades on edges to improve visual transition */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[var(--background)] to-transparent z-10"></div>
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[var(--background)] to-transparent z-10"></div>
    </div>
  );
};

export default SuggestedQuestions; 
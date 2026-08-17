'use client';

import React, { useEffect, useRef } from 'react';

interface QuizScore {
  subject: string;
  score: number;
  quiz: number;
  color: string;
}

// Sample quiz data
const quizScores: QuizScore[] = [
  {
    subject: 'Fundamentals Of Computer Science',
    score: 50,
    quiz: 1,
    color: '#F59E0B' // Amber color
  },
  {
    subject: 'Objected Oriented Programming',
    score: 83,
    quiz: 1,
    color: '#10B981' // Green color
  },
  {
    subject: 'Technical Report Writing',
    score: 50,
    quiz: 1,
    color: '#F59E0B' // Amber color
  }
];

function CircleProgress({ score, color }: { score: number, color: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Setup canvas with high resolution
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Circle parameters
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const radius = Math.min(centerX, centerY) - 10;
    const lineWidth = 8;

    // Animation parameters
    const targetAngle = (score / 100) * Math.PI * 2;
    let currentAngle = 0;
    const animationDuration = 1000; // ms
    const startTime = performance.now();

    // Background circle
    function drawBackground() {
      if (!ctx) return;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = '#E5E7EB'; // Light gray
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    }

    // Progress circle with animation
    function animate(timestamp: number) {
      if (!ctx) return;
      
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);
      currentAngle = progress * targetAngle;

      // Clear and redraw
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw background
      drawBackground();

      // Draw progress
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, -Math.PI / 2, currentAngle - Math.PI / 2);
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Draw percentage text
      ctx.fillStyle = '#111';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${Math.round(progress * score)}%`, centerX, centerY);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
  }, [score, color]);

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-full" 
      width="100" 
      height="100"
    />
  );
}

export function QuizResults() {
  return (
    <div className="dashboard-card p-6 animate-fadeIn animation-delay-600">
      <h3 className="text-xl font-bold mb-6">Quiz Results</h3>
      
      <div className="grid grid-cols-3 gap-4">
        {quizScores.map((quiz, index) => (
          <div key={index} className="flex flex-col items-center animate-scaleIn" style={{ animationDelay: `${600 + (index * 150)}ms` }}>
            <div className="w-24 h-24 mb-2">
              <CircleProgress score={quiz.score} color={quiz.color} />
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-600 w-32 truncate">{quiz.subject}</p>
              <p className="text-xs font-medium">Quiz {quiz.quiz}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 
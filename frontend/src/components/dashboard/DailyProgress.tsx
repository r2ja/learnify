'use client';

import React, { useEffect, useRef } from 'react';

export function DailyProgress() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Sample data for the chart
  const data = [
    { day: 'mon', hours: 0 },
    { day: 'tue', hours: 1.5 },
    { day: 'wed', hours: 2.5 },
    { day: 'thu', hours: 1 },
    { day: 'fri', hours: 4 },
    { day: 'sat', hours: 3 },
    { day: 'sun', hours: 2 }
  ];
  
  // Draw the chart on mount
  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Create a resizeObserver to handle responsiveness
    const resizeCanvas = () => {
      if (!canvasRef.current) return;
      drawChart();
    };
    
    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(canvasRef.current);
    
    // Initial draw
    drawChart();
    
    // Cleanup
    return () => {
      if (canvasRef.current) {
        resizeObserver.unobserve(canvasRef.current);
      }
    };
  }, []);
  
  // Separated chart drawing logic for clarity and reuse
  const drawChart = () => {
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
    
    // Chart settings
    const padding = { top: 40, right: 30, bottom: 40, left: 40 };
    const chartWidth = rect.width - padding.left - padding.right;
    const chartHeight = rect.height - padding.top - padding.bottom;
    
    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);
    
    // Find max value for scaling and ensure minimum height
    const maxHours = Math.max(5, Math.max(...data.map(d => d.hours)));
    
    // Calculate point positions
    const points = data.map((d, i) => ({
      x: padding.left + (i * (chartWidth / (data.length - 1))),
      y: padding.top + chartHeight - (d.hours / maxHours) * chartHeight,
      hours: d.hours
    }));
    
    // Animate the chart
    animateChart(ctx, points, padding, rect, chartHeight);
  };
  
  const animateChart = (
    ctx: CanvasRenderingContext2D, 
    points: Array<{x: number, y: number, hours: number}>,
    padding: {top: number, right: number, bottom: number, left: number},
    rect: DOMRect,
    chartHeight: number
  ) => {
    // Animation settings
    const duration = 1500; // ms
    const startTime = performance.now();
    
    // Draw axis lines (y-axis)
    ctx.beginPath();
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 1;
    
    // Draw horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (i / 5) * chartHeight;
      ctx.moveTo(padding.left - 5, y);
      ctx.lineTo(rect.width - padding.right, y);
      
      // Add y-axis labels
      ctx.fillStyle = '#9CA3AF';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${5 - i}`, padding.left - 10, y + 4);
    }
    ctx.stroke();
    
    // Draw day labels
    ctx.fillStyle = '#6B7280';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    
    data.forEach((d, i) => {
      ctx.fillText(d.day, points[i].x, rect.height - 15);
    });
    
    // Animation function
    function animate(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Clear main chart area only
      ctx.clearRect(
        padding.left, 
        padding.top - 20, 
        rect.width - padding.left - padding.right, 
        chartHeight + 40
      );
      
      // Draw the line with animation
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      
      // Draw line segments progressively
      for (let i = 1; i < points.length; i++) {
        if ((i / points.length) <= progress) {
          // Create a smooth curve between points
          const xc = (points[i].x + points[i-1].x) / 2;
          const yc = (points[i].y + points[i-1].y) / 2;
          ctx.quadraticCurveTo(points[i-1].x, points[i-1].y, xc, yc);
          
          if (i === points.length - 1 && progress === 1) {
            ctx.quadraticCurveTo(
              points[points.length-2].x, 
              points[points.length-2].y,
              points[points.length-1].x, 
              points[points.length-1].y
            );
          }
        }
      }
      
      // Style the line 
      ctx.strokeStyle = 'var(--primary)';
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // Draw fill under the line
      if (progress > 0) {
        const visiblePoints = points.slice(0, Math.ceil(progress * points.length));
        if (visiblePoints.length > 0) {
          ctx.lineTo(visiblePoints[visiblePoints.length-1].x, padding.top + chartHeight);
          ctx.lineTo(points[0].x, padding.top + chartHeight);
          ctx.closePath();
          const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight);
          gradient.addColorStop(0, 'rgba(37, 52, 57, 0.2)');
          gradient.addColorStop(1, 'rgba(37, 52, 57, 0.0)');
          ctx.fillStyle = gradient;
          ctx.fill();
        }
      }
      
      // Draw points with shadow
      const pointsToDraw = Math.ceil(progress * points.length);
      for (let i = 0; i < pointsToDraw; i++) {
        // Point shadow
        ctx.beginPath();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 2;
        ctx.arc(points[i].x, points[i].y, 6, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
        
        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // Point border
        ctx.beginPath();
        ctx.arc(points[i].x, points[i].y, 6, 0, Math.PI * 2);
        ctx.strokeStyle = 'var(--primary)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Inner point
        ctx.beginPath();
        ctx.arc(points[i].x, points[i].y, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'var(--primary)';
        ctx.fill();
        
        // Draw hour labels on top of the points with animation
        if (progress > 0.95 || (i < points.length - 1 && progress > (i + 1) / points.length)) {
          ctx.fillStyle = 'var(--primary)';
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`${points[i].hours}h`, points[i].x, points[i].y - 15);
        }
      }
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }
    
    // Start animation
    requestAnimationFrame(animate);
  };
  
  return (
    <div className="dashboard-card p-6 animate-fadeIn animation-delay-500">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold">Daily Progress</h3>
          <p className="text-gray-500 text-sm">Learning Hours</p>
        </div>
        <div className="relative">
          <button className="flex items-center space-x-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5">
            <span>Weekly</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="w-full h-48 relative">
        <canvas 
          ref={canvasRef} 
          className="w-full h-full" 
        />
      </div>
    </div>
  );
} 
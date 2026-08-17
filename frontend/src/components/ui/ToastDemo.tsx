'use client';

import React from 'react';
import { useToast } from './ToastProvider';

export const ToastDemo: React.FC = () => {
  const { showToast } = useToast();

  return (
    <div className="p-6 space-y-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-800">Toast Notification Demo</h2>
      <p className="text-gray-600">Click the buttons below to see different types of toast notifications.</p>
      
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => showToast('success', 'Success toast message!')}
          className="px-4 py-2 text-white bg-primary-700 rounded-md hover:bg-primary-800 transition-colors"
        >
          Success Toast
        </button>
        
        <button
          onClick={() => showToast('error', 'Error toast message!')}
          className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
        >
          Error Toast
        </button>
        
        <button
          onClick={() => showToast('warning', 'Warning toast message!')}
          className="px-4 py-2 text-white bg-amber-500 rounded-md hover:bg-amber-600 transition-colors"
        >
          Warning Toast
        </button>
        
        <button
          onClick={() => showToast('info', 'Info toast message!')}
          className="px-4 py-2 text-white bg-darkTeal rounded-md hover:bg-[#1a2529] transition-colors"
        >
          Info Toast
        </button>
        
        <button
          onClick={() => 
            showToast('success', 'This is a toast with longer duration!', 6000)
          }
          className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
        >
          Long Duration Toast (6s)
        </button>
      </div>
    </div>
  );
}; 
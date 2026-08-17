'use client';

import { useState } from 'react';

interface FormFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  type?: string;
  placeholder?: string;
  showForgot?: boolean;
  onForgotClick?: () => void;
  required?: boolean;
  error?: string;
}

export function FormField({
  label,
  name,
  value,
  onChange,
  type = 'text',
  placeholder,
  showForgot = false,
  onForgotClick,
  required = false,
  error,
}: FormFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = `${name}-input`;
  const actualType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className="mb-4 w-full">
      <div className="flex justify-between mb-2">
        <label htmlFor={inputId} className="block text-gray-700 font-medium">
          {label}{required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {showForgot && (
          <button
            type="button"
            className="text-indigo-600 text-sm hover:text-indigo-800"
            onClick={onForgotClick}
          >
            Forgot?
          </button>
        )}
      </div>
      <div className="relative">
        <input
          id={inputId}
          name={name}
          type={actualType}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          className={`w-full px-4 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 ${error ? 'focus:ring-red-500' : 'focus:ring-indigo-500'}`}
          placeholder={placeholder}
          aria-label={label}
          aria-invalid={!!error}
          required={required}
        />
        {type === 'password' && (
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 text-gray-400"
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              {showPassword ? (
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7A9.97 9.97 0 014.02 8.971m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" 
                />
              ) : (
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                />
              )}
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" 
              />
            </svg>
          </button>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-500" id={`${inputId}-error`}>
          {error}
        </p>
      )}
    </div>
  );
} 
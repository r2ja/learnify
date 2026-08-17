'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  type?: ToastType;
  message: string;
  duration?: number;
  onClose?: () => void;
  isVisible: boolean;
}

export const Toast: React.FC<ToastProps> = ({
  type = 'info',
  message,
  duration = 3000,
  onClose,
  isVisible,
}) => {
  const [isShowing, setIsShowing] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsShowing(true);
      const timer = setTimeout(() => {
        setIsShowing(false);
        setTimeout(() => {
          onClose && onClose();
        }, 300); // Wait for exit animation to complete
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const getTypeStyles = (): string => {
    switch (type) {
      case 'success':
        return 'bg-primary-700 text-white';
      case 'error':
        return 'bg-red-600 text-white';
      case 'warning':
        return 'bg-amber-500 text-white';
      case 'info':
      default:
        return 'bg-darkTeal text-white';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <XCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'info':
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  if (!isVisible && !isShowing) {
    return null;
  }

  return (
    <div
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ease-in-out ${
        isShowing ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'
      }`}
    >
      <div
        className={`flex items-center max-w-md p-4 rounded-lg shadow-lg ${getTypeStyles()}`}
        role="alert"
      >
        <div className="inline-flex items-center justify-center flex-shrink-0 mr-3">
          {getIcon()}
        </div>
        <div className="text-sm font-medium">{message}</div>
        <button
          type="button"
          className="ml-3 -mr-1.5 -my-1.5 rounded-lg p-1.5 inline-flex items-center justify-center h-8 w-8 transition-colors hover:bg-white/10"
          aria-label="Close"
          onClick={() => {
            setIsShowing(false);
            setTimeout(() => {
              onClose && onClose();
            }, 300);
          }}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}; 
'use client';

import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

export type ToastType = 'success' | 'error';

interface ToastProps {
  type: ToastType;
  message: string;
  onClose: () => void;
  duration?: number;
}

export const Toast = ({ type, message, onClose, duration = 5000 }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const styles = {
    success: 'bg-green-600 border-green-500',
    error: 'bg-red-600 border-red-500',
  };

  const Icon = type === 'success' ? CheckCircle : AlertCircle;

  return (
    <div className={`fixed bottom-6 right-6 flex items-center p-4 rounded-lg shadow-2xl border text-white animate-in slide-in-from-right duration-300 ${styles[type]} z-[100]`}>
      <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
      <span className="mr-6 font-medium">{message}</span>
      <button 
        onClick={onClose}
        className="ml-auto hover:opacity-70 transition-opacity p-1"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

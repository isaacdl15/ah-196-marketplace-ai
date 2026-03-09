'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose?: () => void;
}

export default function Toast({ message, type = 'info', duration = 4000, onClose }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible) return null;

  const colors = {
    success: { bg: '#dcfce7', border: '#86efac', text: '#15803d', icon: CheckCircle },
    error: { bg: '#fee2e2', border: '#fca5a5', text: '#dc2626', icon: XCircle },
    info: { bg: '#dbeafe', border: '#93c5fd', text: '#1d4ed8', icon: CheckCircle },
  };

  const { bg, border, text, icon: Icon } = colors[type];

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg"
      style={{ backgroundColor: bg, border: `1px solid ${border}`, color: text, maxWidth: 400 }}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span className="text-sm font-medium">{message}</span>
      <button
        onClick={() => { setVisible(false); onClose?.(); }}
        className="ml-2 opacity-60 hover:opacity-100 transition-opacity"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

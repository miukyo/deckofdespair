"use client";

import React, { useState, useEffect, createContext, useContext } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";

// Types
type ToastType = "success" | "error" | "warning" | "info";
type ToastPosition =
  | "top-right"
  | "top-left"
  | "bottom-right"
  | "bottom-left"
  | "top-center"
  | "bottom-center";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type: ToastType, duration?: number, id?: string) => void;
  toasts: Toast[];
  hideToast: (id: string) => void;
}

// Context
const ToastContext = createContext<ToastContextType | null>(null);

// Provider Component
interface ToastProviderProps {
  children: React.ReactNode;
  position?: ToastPosition;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({
  children,
  position = "bottom-right",
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const positionClasses = {
    "top-right": "top-4 right-4 items-end",
    "top-left": "top-4 left-4 items-start",
    "bottom-right": "bottom-4 right-4 items-end",
    "bottom-left": "bottom-4 left-4 items-start",
    "top-center": "top-4 left-1/2 -translate-x-1/2 items-center",
    "bottom-center": "bottom-4 left-1/2 -translate-x-1/2 items-center",
  };

  const showToast = (
    message: string,
    type: ToastType,
    duration: number = 3000,
    id: string = Date.now().toString()
  ) => {
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    // Auto-hide after duration
    if (duration !== Infinity) {
      setTimeout(() => {
        hideToast(id);
      }, duration);
    }

    return id;
  };

  const hideToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast, toasts }}>
      {children}
      <div className={`fixed z-50 flex flex-col gap-2 ${positionClasses[position]}`}>
        <AnimatePresence>
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onClose={() => hideToast(toast.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

// Hook
export const useToast = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return context;
};

// Individual Toast Component
interface ToastItemProps {
  toast: Toast;
  onClose: () => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onClose }) => {
  const [progress, setProgress] = useState(100);

  const getColor = () => {
    switch (toast.type) {
      case "success":
        return "bg-green-500";
      case "error":
        return "bg-red-500";
      case "warning":
        return "bg-yellow-500";
      case "info":
        return "bg-blue-500";
    }
  };

  // Handle progress bar animation for auto-close
  useEffect(() => {
    if (toast.duration === Infinity) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev - (100 / (toast.duration || 5000)) * 100;
        return Math.max(0, newProgress);
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="bg-neutral-900 border border-neutral-700 rounded-lg shadow-lg overflow-hidden w-[320px]"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}>
      <div className="flex items-center px-4 p-2">
        <div className="flex-1 pr-6 mt-0.5">
          <p className="text-white text-sm leading-none">{toast.message}</p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-neutral-400 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress bar */}
      {toast.duration !== Infinity && (
        <div className="h-0.5 w-full bg-neutral-800">
          <div
            className={`h-full ${getColor()}`}
            style={{ width: `${progress}%`, transition: "width 100ms linear" }}
          />
        </div>
      )}
    </motion.div>
  );
};

// Helper component for making toast usage easier
interface ToastDemoProps {}

export const ToastDemo: React.FC<ToastDemoProps> = () => {
  const { showToast } = useToast();

  return (
    <div className="flex gap-2">
      <button
        className="bg-green-600 hover:bg-green-700 px-3 py-2 rounded-lg text-white"
        onClick={() => showToast("Success message example", "success")}>
        Show Success
      </button>
      <button
        className="bg-red-600 hover:bg-red-700 px-3 py-2 rounded-lg text-white"
        onClick={() => showToast("Error message example", "error")}>
        Show Error
      </button>
      <button
        className="bg-yellow-600 hover:bg-yellow-700 px-3 py-2 rounded-lg text-white"
        onClick={() => showToast("Warning message example", "warning")}>
        Show Warning
      </button>
      <button
        className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg text-white"
        onClick={() => showToast("Info message example", "info")}>
        Show Info
      </button>
    </div>
  );
};

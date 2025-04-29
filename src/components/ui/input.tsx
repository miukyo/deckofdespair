"use client";

import React, { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ icon, className = "", fullWidth = false, error, ...props }, ref) => {
    return (
      <div className={`${fullWidth ? "w-full" : ""} relative`}>
        <div className="relative">
          {icon && (
            <div className="absolute top-1/2 left-3 -translate-y-1/2 text-neutral-400">{icon}</div>
          )}
          <input
            ref={ref}
            className={`${
              icon ? "pl-10" : "pl-3"
            } pr-3 py-2 bg-neutral-800 text-white rounded-lg w-full focus:outline-none focus:ring-1 focus:ring-neutral-600 ${
              error ? "border border-red-500" : ""
            } ${className}`}
            {...props}
          />
        </div>
        {error && <div className="text-red-500 text-xs mt-1">{error}</div>}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;

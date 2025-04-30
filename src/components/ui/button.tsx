"use client";

import React from "react";
import { motion } from "motion/react";
import { LucideIcon } from "lucide-react";

interface ButtonProps {
  children?: React.ReactNode;
  icon?: React.ReactElement<LucideIcon>;
  variant?: "default" | "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  showTooltip?: boolean;
  tooltipText?: string;
  tooltipPosition?: "top" | "right" | "bottom" | "left";
}

export default function Button({
  children,
  icon,
  variant = "default",
  size = "md",
  className = "",
  onClick,
  disabled = false,
  showTooltip = false,
  tooltipText = "",
  tooltipPosition = "right",
}: ButtonProps) {
  const [isTooltipVisible, setIsTooltipVisible] = React.useState(false);

  const variantClasses = {
    default: "bg-neutral-900 text-neutral-400 hover:text-white",
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-neutral-800 text-white hover:bg-neutral-700",
    outline: "bg-transparent border border-neutral-700 text-white hover:bg-neutral-900",
  };

  const sizeClasses = {
    sm: "p-1.5 text-sm",
    md: "p-2",
    lg: "p-3 text-lg",
  };

  const tooltipPositions = {
    top: "bottom-full mb-2 left-1/2 -translate-x-1/2",
    right: "left-full ml-2 top-1/2 -translate-y-1/2",
    bottom: "top-full mt-2 left-1/2 -translate-x-1/2",
    left: "right-full mr-2 top-1/2 -translate-y-1/2",
  };

  return (
    <>
      <motion.button
        className={`${variantClasses[variant]} ${sizeClasses[size]} rounded-lg ${className} ${
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        }`}
        whileHover={{ scale: disabled ? 1 : 1.1 }}
        whileTap={{ scale: disabled ? 1 : 0.9 }}
        onClick={disabled ? undefined : onClick}
        onHoverStart={() => showTooltip && setIsTooltipVisible(true)}
        onHoverEnd={() => showTooltip && setIsTooltipVisible(false)}
        disabled={disabled}>
        {icon ? (
          <div className="flex items-center justify-center gap-2">
            {icon}
            {children}
          </div>
        ) : (
          children
        )}
      </motion.button>

      {showTooltip && isTooltipVisible && tooltipText && (
        <motion.div
          className={`absolute ${tooltipPositions[tooltipPosition]} whitespace-nowrap text-white bg-neutral-800 px-2 py-1 rounded text-sm z-10`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}>
          {tooltipText}
        </motion.div>
      )}
    </>
  );
}

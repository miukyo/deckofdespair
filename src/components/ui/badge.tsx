"use client";

import React from "react";
import { motion } from "motion/react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "primary" | "outline" | "score";
  icon?: React.ReactNode;
  className?: string;
  animate?: boolean;
}

export default function Badge({
  children,
  variant = "default",
  icon,
  className = "",
  animate = false,
}: BadgeProps) {
  const variantClasses = {
    default: "bg-neutral-900 text-white border border-neutral-700",
    primary: "bg-blue-600 text-white",
    outline: "bg-transparent border border-neutral-700 text-white",
    score: "bg-neutral-800 px-2 py-1 rounded text-white font-bold",
  };

  return (
    <motion.div
      className={`${variantClasses[variant]} px-4 py-2 rounded-lg inline-flex justify-center items-center gap-2 ${className}`}
      initial={animate ? { scale: 0.95 } : undefined}
      animate={
        animate
          ? {
              scale: [0.95, 1.05, 0.95],
              transition: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }
          : undefined
      }>
      {icon && <span>{icon}</span>}
      <span>{children}</span>
    </motion.div>
  );
}

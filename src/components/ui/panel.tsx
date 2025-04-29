"use client";

import React from "react";
import { motion } from "motion/react";

interface PanelProps {
  children: React.ReactNode;
  title?: string | React.ReactNode;
  variant?: "default" | "bordered";
  className?: string;
  animate?: boolean;
}

export default function Panel({
  children,
  title,
  variant = "default",
  className = "",
  animate = false,
}: PanelProps) {
  const variantClasses = {
    default: "bg-neutral-900",
    bordered: "bg-neutral-900 border border-neutral-700",
  };

  return (
    <motion.div
      className={`${variantClasses[variant]} rounded-lg p-4 ${className}`}
      initial={animate ? { opacity: 0, y: 20 } : undefined}
      animate={animate ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.3 }}>
      {title && <h2 className="text-white font-bold text-xl mb-4">{title}</h2>}
      {children}
    </motion.div>
  );
}

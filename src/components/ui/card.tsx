"use client";

import React from "react";
import { motion } from "motion/react";

interface CardProps {
  type?: "answer" | "prompt";
  children?: React.ReactNode;
  variant?: "default" | "played" | "flipped";
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  animate?: boolean;
  hoverEffect?: boolean;
  footer?: React.ReactNode;
  header?: React.ReactNode;
}

export default function Card({
  type = "answer",
  children,
  variant = "default",
  className = "",
  onClick,
  disabled = false,
  animate = true,
  hoverEffect = true,
  footer,
  header,
}: CardProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  const baseClasses = {
    answer: "w-36 h-48 bg-white text-black border-2 border-neutral-300",
    prompt: "w-full max-w-md min-w-sm h-48 bg-black text-white border-2 border-white",
  };

  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  return (
    <motion.div
      className={`relative ${disabled ? "opacity-50" : ""} ${
        onClick && !disabled ? "cursor-pointer" : ""
      }`}
      onHoverStart={() => hoverEffect && !disabled && setIsHovered(true)}
      onHoverEnd={() => hoverEffect && setIsHovered(false)}
      onClick={handleClick}
      initial={{ y: 0 }}
      animate={
        animate
          ? {
              y: isHovered && hoverEffect && !disabled ? -20 : 0,
              rotate: type === "prompt" ? [0, 1, -1, 0] : 0,
              transition: {
                y: {
                  type: "spring",
                  stiffness: 500,
                  damping: 20,
                },
                rotate: {
                  duration: 3,
                  repeat: type === "prompt" ? Number.POSITIVE_INFINITY : 0,
                  repeatType: "reverse",
                  ease: "easeInOut",
                },
              },
            }
          : {}
      }
      whileTap={onClick && !disabled ? { scale: 0.95 } : {}}>
      <div className={`${baseClasses[type]} rounded-lg flex flex-col p-4 shadow-lg ${className}`}>
        {header && <div className="absolute top-4 left-4 font-bold text-sm">{header}</div>}
        <div className="flex-1 flex justify-center hyphens-auto wrap-anywhere text-pretty">{children}</div>
        {footer && <div className="absolute bottom-4 right-4 font-bold text-[10px]">{footer}</div>}
      </div>
    </motion.div>
  );
}

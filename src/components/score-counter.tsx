"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";

interface ScoreCounterProps {
  icon: ReactNode;
  value: number;
  label: string;
}

export default function ScoreCounter({ icon, value, label }: ScoreCounterProps) {
  return (
    <div className="flex flex-col items-center bg-neutral-900 p-2 rounded-lg border border-neutral-700 min-w-[80px]">
      <div className="flex items-center gap-1">
        {icon}
        <motion.div
          className="font-bold text-white"
          key={value}
          initial={{ scale: 1.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}>
          {value}
        </motion.div>
      </div>
      <div className="text-xs text-neutral-400">{label}</div>
    </div>
  );
}

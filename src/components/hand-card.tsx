"use client";

import { useState } from "react";
import { motion } from "motion/react";
import PlayingCard from "./playing-card";

interface HandCardProps {
  suit: "hearts" | "diamonds" | "clubs" | "spades" | "joker";
  value: number;
  onPlay: () => void;
}

export default function HandCard({ suit, value, onPlay }: HandCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPlayed, setIsPlayed] = useState(false);

  const handlePlay = () => {
    if (isPlayed) return;

    setIsPlayed(true);
    onPlay();

    // Reset card after animation completes
    setTimeout(() => {
      setIsPlayed(false);
    }, 1000);
  };

  return (
    <motion.div
      className="relative cursor-pointer"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={handlePlay}
      initial={{ y: 0 }}
      animate={
        isPlayed
          ? {
              y: -200,
              opacity: 0,
              transition: {
                type: "spring",
                stiffness: 300,
                damping: 20,
              },
            }
          : isHovered
          ? {
              y: -20,
              transition: {
                type: "spring",
                stiffness: 300,
                damping: 20,
              },
            }
          : {
              y: 0,
              transition: {
                type: "spring",
                stiffness: 300,
                damping: 20,
              },
            }
      }
      whileTap={{ scale: 0.95 }}>
      <PlayingCard suit={suit} value={value} />

      {isHovered && !isPlayed && (
        <motion.div
          className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-[#3a3a6e] text-white px-2 py-1 rounded text-sm whitespace-nowrap"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}>
          {suit === "joker" ? "Add Multiplier" : "Play Card"}
        </motion.div>
      )}
    </motion.div>
  );
}

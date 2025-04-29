"use client";

import { motion } from "motion/react";
import { Club, Diamond, Heart, Spade, Sparkles } from "lucide-react";

type Suit = "hearts" | "diamonds" | "clubs" | "spades" | "joker";

interface PlayingCardProps {
  suit: Suit;
  value: number;
}

export default function PlayingCard({ suit, value }: PlayingCardProps) {
  const getSuitIcon = () => {
    switch (suit) {
      case "hearts":
        return <Heart className="h-6 w-6 fill-red-500 text-red-500" />;
      case "diamonds":
        return <Diamond className="h-6 w-6 fill-red-500 text-red-500" />;
      case "clubs":
        return <Club className="h-6 w-6" />;
      case "spades":
        return <Spade className="h-6 w-6" />;
      case "joker":
        return <Sparkles className="h-6 w-6 text-yellow-400" />;
    }
  };

  const getCardColor = () => {
    switch (suit) {
      case "hearts":
      case "diamonds":
        return "text-red-500";
      case "joker":
        return "text-yellow-400";
      default:
        return "text-white";
    }
  };

  const getCardValue = () => {
    if (suit === "joker") return "J";
    if (value === 1) return "A";
    if (value === 11) return "J";
    if (value === 12) return "Q";
    if (value === 13) return "K";
    return value.toString();
  };

  return (
    <motion.div
      className={`relative w-24 h-36 bg-white rounded-lg flex flex-col justify-between p-2 ${
        suit === "joker" ? "bg-gradient-to-br from-purple-900 to-purple-700" : ""
      }`}
      initial={{ rotate: 0 }}
      animate={{
        rotate: [0, 2, -2, 0],
        transition: {
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
          ease: "easeInOut",
        },
      }}>
      <div className="flex justify-between">
        <div className={`font-bold text-lg ${getCardColor()}`}>{getCardValue()}</div>
        <div>{getSuitIcon()}</div>
      </div>

      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        {suit === "joker" ? (
          <div className="text-3xl font-bold text-yellow-400">JOKER</div>
        ) : (
          <div className={`text-4xl font-bold ${getCardColor()}`}>{getCardValue()}</div>
        )}
      </div>

      <div className="flex justify-between self-end rotate-180">
        <div className={`font-bold text-lg ${getCardColor()}`}>{getCardValue()}</div>
        <div>{getSuitIcon()}</div>
      </div>
    </motion.div>
  );
}

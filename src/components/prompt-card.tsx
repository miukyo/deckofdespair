"use client";

import React from "react";
import Card from "./ui/card";
import { Card as CardT } from "../utils/peer/types";

export default function PromptCard({ promptCard }: { promptCard: CardT }) {
  const processText = (inputText: string) => {
    if (!inputText.includes("_")) {
      return inputText;
    }

    const parts = inputText.split("_");
    const result: React.ReactNode[] = [];

    parts.forEach((part, index) => {
      // Add the text part
      if (part) {
        result.push(<span key={"text" + index}>{part}</span>);
      }

      // Add blank with underscores (except after the last part)
      if (index < parts.length - 1) {
        result.push(
          <span key={"under" + index} className="tracking-[-0.15em] mr-1">
            ________
          </span>
        );
      }
    });

    return result;
  };

  // Determine text size based on content length
  const textSizeClass = promptCard.text?.length > 100 ? "text-lg" : promptCard.text?.length > 50 ? "text-xl" : "text-2xl";

  return (
    <Card
      type="prompt"
      animate={true}
      header="Deck of Despair"
      footer={`Pick ${promptCard.minPick || 1}`}
      hoverEffect={false}>
      <div className={textSizeClass + " font-bold text-center mt-8"}>{processText(promptCard.text)}</div>
    </Card>
  );
}

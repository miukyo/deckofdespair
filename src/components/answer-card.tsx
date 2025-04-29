import Card from "./ui/card";

interface AnswerCardProps {
  text: string;
  onPlay?: () => void;
  isPlayed?: boolean;
  isFlipped?: boolean;
  isDisabled?: boolean;
}

export default function AnswerCard({
  text,
  onPlay,
  isPlayed = false,
  isFlipped = false,
  isDisabled = false,
}: AnswerCardProps) {
  const handlePlay = () => {
    if (isDisabled || isPlayed) return;
    if (onPlay) onPlay();
  };

  // Determine text size based on content length
  const textSizeClass = text?.length > 120 ? "text-xs" : text?.length > 60 ? "text-sm" : "text-md";

  return (
    <Card
      type="answer"
      onClick={handlePlay}
      disabled={isDisabled || isPlayed}
      animate={!isFlipped}
      hoverEffect={!isDisabled}
      footer="Deck of Despair"
      className={isPlayed && !isFlipped ? "opacity-0 transform -translate-y-20" : ""}>
      <div className={`font-bold w-full leading-none ${textSizeClass}`}>{text}</div>
    </Card>
  );
}

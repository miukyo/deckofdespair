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

    const audioContext = new window.AudioContext();

    fetch("/sounds/Button.mp3")
      .then((response) => response.arrayBuffer())
      .then((arrayBuffer) => audioContext.decodeAudioData(arrayBuffer))
      .then((audioBuffer) => {
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.detune.value = Math.random() * 200 - 100; // Random detune between -100 and +100 cents
        const gainNode = audioContext.createGain();
        gainNode.gain.value = 0.5; // Set volume to 50%
        source.connect(gainNode).connect(audioContext.destination);
        source.start();
      });

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
      footer="Deck of Disorder"
      className={isPlayed && !isFlipped ? "opacity-0 transform -translate-y-20" : ""}>
      <div className={`font-bold w-full leading-none ${textSizeClass}`}>{text}</div>
    </Card>
  );
}

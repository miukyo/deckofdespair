import React, { useState } from "react";
import Button from "./button";
import { HeadphoneOff, Headphones } from "lucide-react";

const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    const audio = document.getElementById("background-music") as HTMLAudioElement;
    audio.volume = 0.2; // Set volume to 10%
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="fixed bottom-4 right-4">
      <audio id="background-music" src="/sounds/Music.mp3" loop />
      <Button className="border border-neutral-700" onClick={togglePlay}>{isPlaying ? <Headphones size={16} /> : <HeadphoneOff size={16} />}</Button>
    </div>
  );
};

export default MusicPlayer;

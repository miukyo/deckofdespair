export const playAudio = (url: string, randomPitch = false, volume = 1) => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const audioSource = audioContext.createBufferSource();
  const gainNode = audioContext.createGain();

  fetch(url)
    .then((response) => response.arrayBuffer())
    .then((arrayBuffer) => audioContext.decodeAudioData(arrayBuffer))
    .then((audioBuffer) => {
      audioSource.buffer = audioBuffer;
      if (randomPitch) audioSource.detune.value = -100 + Math.random() * 200; // Random pitch variation between -100 and +100 cents
      gainNode.gain.value = volume;
      audioSource.connect(gainNode).connect(audioContext.destination);
      audioSource.start();
    });
};

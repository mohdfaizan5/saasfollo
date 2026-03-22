"use client";

import { useCallback, useEffect, useRef } from "react";

export function useOptionClickSound(
  src = "/dragon-studio-button-press-382713.mp3",
) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(src);
    audio.preload = "auto";
    audio.volume = 0.55;
    audioRef.current = audio;

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [src]);

  return useCallback(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    audio.currentTime = 0;
    const playPromise = audio.play();
    if (playPromise) {
      playPromise.catch(() => {
        // Ignore autoplay-style interruptions for quick interactions.
      });
    }
  }, []);
}

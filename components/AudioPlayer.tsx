"use client";

import { useEffect, useRef, useState } from "react";
import { calculatePoints, getScoreColors } from "@/lib/scoring";

interface Props {
  previewUrl: string;
  onTimeUpdate?: (currentTime: number) => void;
  onEnded?: () => void;
}

export default function AudioPlayer({ previewUrl, onTimeUpdate, onEnded }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = previewUrl;
    audio.load();
    setProgress(0);
    setCurrentTime(0);
    audio.play().catch(() => {});
  }, [previewUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => {
      const t = audio.currentTime;
      setCurrentTime(t);
      setProgress((t / (audio.duration || 30)) * 100);
      onTimeUpdate?.(t);
    };

    const onEnd = () => onEnded?.();

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnd);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnd);
    };
  }, [onTimeUpdate, onEnded]);

  const points = calculatePoints(currentTime);
  const { barColor, textColor } = getScoreColors(currentTime);

  return (
    <div className="bg-gray-900 rounded-2xl p-6 flex flex-col gap-3">
      <audio ref={audioRef} />

      <div className="flex items-center justify-end">
        <span className={`text-2xl font-black ${textColor}`}>+{points}</span>
      </div>

      <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
        <div
          className={`h-3 rounded-full transition-colors duration-500 ${barColor}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

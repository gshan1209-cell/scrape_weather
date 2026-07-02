"use client";

import { Pause, Play } from "lucide-react";

type Props = {
  labels: string[];
  value: number;
  isPlaying: boolean;
  onChange: (value: number) => void;
  onPlayToggle: () => void;
};

export function MapTimeline({ labels, value, isPlaying, onChange, onPlayToggle }: Props) {
  return (
    <div className="absolute inset-x-3 bottom-3 rounded-xl bg-black/55 p-3 backdrop-blur">
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={isPlaying ? "Pause" : "Play"}
          onClick={onPlayToggle}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15 text-white transition hover:bg-white/25"
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>
        <input
          aria-label="預報時間"
          className="h-1.5 min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-white/20 accent-white [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md"
          type="range"
          min={0}
          max={labels.length - 1}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
        />
        <span className="w-16 text-right text-sm font-semibold text-white">{labels[value]}</span>
      </div>
      <div className="mt-2 hidden grid-cols-10 text-[10px] text-white/50 sm:grid">
        {labels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </div>
  );
}

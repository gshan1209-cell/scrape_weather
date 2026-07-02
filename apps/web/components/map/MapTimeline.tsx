"use client";

import { Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  labels: string[];
  value: number;
  isPlaying: boolean;
  onChange: (value: number) => void;
  onPlayToggle: () => void;
};

export function MapTimeline({ labels, value, isPlaying, onChange, onPlayToggle }: Props) {
  return (
    <div className="absolute inset-x-3 bottom-3 rounded-md bg-black/45 p-3 backdrop-blur">
      <div className="flex items-center gap-3">
        <Button type="button" aria-label={isPlaying ? "Pause" : "Play"} onClick={onPlayToggle} className="h-9 w-9 px-0">
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <input
          aria-label="預報時間"
          className="h-2 min-w-0 flex-1 accent-white"
          type="range"
          min={0}
          max={labels.length - 1}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
        />
        <span className="w-16 text-right text-sm font-semibold">{labels[value]}</span>
      </div>
      <div className="mt-2 hidden grid-cols-10 text-[10px] text-white/60 sm:grid">
        {labels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </div>
  );
}

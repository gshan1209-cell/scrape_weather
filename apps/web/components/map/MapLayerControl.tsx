"use client";

import { CloudRain, ThermometerSun, Wind } from "lucide-react";
import { WEATHER_OVERLAY_OPTIONS } from "@/features/weather-map/overlay-options";
import type { WeatherOverlay } from "@/features/weather-map/types";
import { cn } from "@/lib/utils";

const icons = {
  rain: CloudRain,
  wind: Wind,
  temperature: ThermometerSun,
};

type Props = {
  value: WeatherOverlay;
  onChange: (value: WeatherOverlay) => void;
};

export function MapLayerControl({ value, onChange }: Props) {
  return (
    <div className="absolute right-3 top-3 flex max-w-[calc(100%-1.5rem)] flex-wrap justify-end gap-1.5 rounded-xl bg-black/40 p-1.5 backdrop-blur">
      {WEATHER_OVERLAY_OPTIONS.map((option) => {
        const Icon = icons[option.value as keyof typeof icons];
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            title={option.description}
            aria-label={option.label}
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium transition-all",
              active
                ? "bg-white text-stone-900 shadow-sm"
                : "bg-transparent text-white/70 hover:bg-white/10 hover:text-white",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

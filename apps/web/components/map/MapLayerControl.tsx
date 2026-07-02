"use client";

import { Cloud, CloudRain, Gauge, ThermometerSun, Wind } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WEATHER_OVERLAY_OPTIONS } from "@/features/weather-map/overlay-options";
import type { WeatherOverlay } from "@/features/weather-map/types";
import { cn } from "@/lib/utils";

const icons = {
  rain: CloudRain,
  wind: Wind,
  temperature: ThermometerSun,
  clouds: Cloud,
  pressure: Gauge,
};

type Props = {
  value: WeatherOverlay;
  onChange: (value: WeatherOverlay) => void;
};

export function MapLayerControl({ value, onChange }: Props) {
  return (
    <div className="absolute right-3 top-3 flex max-w-[calc(100%-1.5rem)] flex-wrap justify-end gap-2 rounded-md bg-black/35 p-2 backdrop-blur">
      {WEATHER_OVERLAY_OPTIONS.map((option) => {
        const Icon = icons[option.value];
        return (
          <Button
            key={option.value}
            type="button"
            title={option.description}
            aria-label={option.label}
            onClick={() => onChange(option.value)}
            className={cn(
              "h-9 rounded-md px-3 text-xs",
              value === option.value ? "bg-white text-stone-950 hover:bg-white" : "bg-white/15 text-white hover:bg-white/25",
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{option.label}</span>
          </Button>
        );
      })}
    </div>
  );
}

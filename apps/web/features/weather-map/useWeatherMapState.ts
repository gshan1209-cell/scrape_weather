"use client";

import { useMemo, useState } from "react";
import type { WeatherMapConfig, WeatherMapLocation, WeatherOverlay } from "./types";

const TIME_LABELS = ["Now", "+6h", "+12h", "+24h", "+2d", "+3d", "+4d", "+5d", "+6d", "+7d"];

const CITY_COORDS: Record<string, { lat: number; lon: number }> = {
  Taipei: { lat: 25.033, lon: 121.5654 },
  Taichung: { lat: 24.1477, lon: 120.6736 },
  Tainan: { lat: 22.9999, lon: 120.227 },
  Kaohsiung: { lat: 22.6273, lon: 120.3014 },
  Hualien: { lat: 23.9872, lon: 121.6015 },
};

export function useWeatherMapState(config: WeatherMapConfig, city: string, district?: string) {
  const [overlay, setOverlay] = useState<WeatherOverlay>(config.defaultOverlay);
  const [selectedTimeIndex, setSelectedTimeIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const location: WeatherMapLocation = useMemo(() => {
    const coords = CITY_COORDS[city] ?? { lat: config.defaultLat, lon: config.defaultLon };
    return { city, district, ...coords };
  }, [city, config.defaultLat, config.defaultLon, district]);

  const currentTimeLabel = useMemo(() => TIME_LABELS[selectedTimeIndex] ?? "Now", [selectedTimeIndex]);

  return {
    overlay,
    setOverlay,
    selectedTimeIndex,
    setSelectedTimeIndex,
    isPlaying,
    setIsPlaying,
    togglePlaying: () => setIsPlaying((value) => !value),
    timeLabels: TIME_LABELS,
    currentTimeLabel,
    location,
  };
}

"use client";

import { useMemo, useState } from "react";
import type { WeatherMapConfig, WeatherMapLocation, WeatherOverlay } from "./types";

const TIME_LABELS = ["現在", "+6 小時", "+12 小時", "+24 小時", "+2 天", "+3 天", "+4 天", "+5 天", "+6 天", "+7 天"];

const CITY_COORDS: Record<string, { lat: number; lon: number }> = {
  Taipei: { lat: 25.033, lon: 121.5654 },
  Taichung: { lat: 24.1477, lon: 120.6736 },
  Tainan: { lat: 22.9999, lon: 120.227 },
  Kaohsiung: { lat: 22.6273, lon: 120.3014 },
  Hualien: { lat: 23.9872, lon: 121.6015 },
  臺北市: { lat: 25.033, lon: 121.5654 },
  臺中市: { lat: 24.1477, lon: 120.6736 },
  臺南市: { lat: 22.9999, lon: 120.227 },
  高雄市: { lat: 22.6273, lon: 120.3014 },
  花蓮縣: { lat: 23.9872, lon: 121.6015 },
};

export function useWeatherMapState(config: WeatherMapConfig, city: string, district?: string) {
  const [overlay, setOverlay] = useState<WeatherOverlay>(config.defaultOverlay);
  const [selectedTimeIndex, setSelectedTimeIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const location: WeatherMapLocation = useMemo(() => {
    const coords = CITY_COORDS[city] ?? { lat: config.defaultLat, lon: config.defaultLon };
    return { city, district, ...coords };
  }, [city, config.defaultLat, config.defaultLon, district]);

  const currentTimeLabel = useMemo(() => TIME_LABELS[selectedTimeIndex] ?? "現在", [selectedTimeIndex]);

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

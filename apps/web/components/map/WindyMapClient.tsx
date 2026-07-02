"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { WeeklyAdvisoryResponse } from "@/features/advisory/types";
import type { WeatherMapConfig, WeatherOverlay } from "@/features/weather-map/types";
import { MapFloatingAdvice } from "./MapFloatingAdvice";
import { MapProviderFallback } from "./MapProviderFallback";

type Props = {
  config: WeatherMapConfig;
  city: string;
  district?: string;
  crop?: string;
  advisory?: WeeklyAdvisoryResponse;
  onLocationSelect?: (city: string, district?: string) => void;
};

export function WindyMapClient({ config, city, district, crop, advisory, onLocationSelect }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [windyLoaded, setWindyLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!leafletLoaded || !windyLoaded || !window.windyInit || !containerRef.current) return;

    try {
      window.windyInit(
        {
          key: config.windyApiKey,
          lat: config.defaultLat,
          lon: config.defaultLon,
          zoom: config.defaultZoom,
          overlay: normalizeWindyOverlay(config.defaultOverlay),
        },
        (windyAPI) => {
          windyAPI.store.set("overlay", normalizeWindyOverlay(config.defaultOverlay));
        },
      );
    } catch (error) {
      console.error("Failed to initialize Windy map", error);
      setFailed(true);
    }
  }, [leafletLoaded, windyLoaded, config]);

  if (failed) {
    return <MapProviderFallback reason="Windy 地圖載入失敗，已自動改用 Leaflet 模擬地圖。" config={config} city={city} district={district} crop={crop} advisory={advisory} onLocationSelect={onLocationSelect} />;
  }

  return (
    <section className="relative overflow-hidden rounded-md border border-stone-200 bg-stone-950 shadow-sm">
      <Script
        src="https://unpkg.com/leaflet@1.4.0/dist/leaflet.js"
        strategy="afterInteractive"
        onLoad={() => setLeafletLoaded(true)}
        onError={() => setFailed(true)}
      />
      <Script
        src="https://api.windy.com/assets/map-forecast/libBoot.js"
        strategy="afterInteractive"
        onLoad={() => setWindyLoaded(true)}
        onError={() => setFailed(true)}
      />

      <div id="windy" ref={containerRef} className="h-[520px] min-h-[70vh] w-full" />
      <MapFloatingAdvice advisory={advisory} crop={crop} />
    </section>
  );
}

function normalizeWindyOverlay(overlay: WeatherOverlay) {
  const map: Record<WeatherOverlay, string> = {
    rain: "rain",
    wind: "wind",
    temperature: "temp",
    clouds: "clouds",
    pressure: "pressure",
  };

  return map[overlay] ?? "rain";
}

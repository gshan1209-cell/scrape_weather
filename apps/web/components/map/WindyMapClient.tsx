"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { WeeklyAdvisoryResponse } from "@/features/advisory/types";
import type { WeatherMapConfig, WeatherOverlay } from "@/features/weather-map/types";
import { MapFloatingAdvice } from "./MapFloatingAdvice";
import { MapProviderFallback } from "./MapProviderFallback";

type WindyStore = {
  set: (key: string, value: unknown, opts?: Record<string, unknown>) => void;
};

type WindyApi = {
  store: WindyStore;
};

type WindyInit = (
  options: Record<string, unknown>,
  callback: (windyAPI: WindyApi) => void,
) => void;

type Props = {
  config: WeatherMapConfig;
  city: string;
  district?: string;
  crop?: string;
  advisory?: WeeklyAdvisoryResponse;
  onLocationSelect?: (city: string, district?: string) => void;
};

type WindyStatus = "載入 Leaflet script" | "載入 Windy script" | "初始化 Windy" | "Windy map" | "Fallback Leaflet";

const WINDY_INIT_TIMEOUT_MS = 8000;

export function WindyMapClient({ config, city, district, crop, advisory, onLocationSelect }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const initializedRef = useRef(false);
  const completedRef = useRef(false);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [windyLoaded, setWindyLoaded] = useState(false);
  const [status, setStatus] = useState<WindyStatus>("載入 Leaflet script");
  const [failed, setFailed] = useState(!config.windyApiKey);

  useEffect(() => {
    if (failed || completedRef.current) return;

    const timer = window.setTimeout(() => {
      if (!completedRef.current) {
        setStatus("Fallback Leaflet");
        setFailed(true);
      }
    }, WINDY_INIT_TIMEOUT_MS);

    return () => window.clearTimeout(timer);
  }, [failed]);

  useEffect(() => {
    if (failed || initializedRef.current) return;
    if (!leafletLoaded) {
      setStatus("載入 Leaflet script");
      return;
    }
    if (!windyLoaded) {
      setStatus("載入 Windy script");
      return;
    }

    const windyInit = window.windyInit as WindyInit | undefined;
    if (!windyInit || !containerRef.current) {
      setStatus("初始化 Windy");
      return;
    }

    try {
      initializedRef.current = true;
      setStatus("初始化 Windy");
      windyInit(
        {
          key: config.windyApiKey,
          lat: config.defaultLat,
          lon: config.defaultLon,
          zoom: config.defaultZoom,
          overlay: normalizeWindyOverlay(config.defaultOverlay),
        },
        (windyAPI) => {
          windyAPI.store.set("overlay", normalizeWindyOverlay(config.defaultOverlay));
          completedRef.current = true;
          setStatus("Windy map");
        },
      );
    } catch (error) {
      console.error("Failed to initialize Windy map", error);
      setStatus("Fallback Leaflet");
      setFailed(true);
    }
  }, [leafletLoaded, windyLoaded, failed, config]);

  if (failed) {
    return <MapProviderFallback reason="Windy 地圖載入失敗，已自動改用 Leaflet 模擬地圖。" config={config} city={city} district={district} crop={crop} advisory={advisory} onLocationSelect={onLocationSelect} />;
  }

  return (
    <section className="relative overflow-hidden rounded-md border border-stone-200 bg-stone-950 shadow-sm">
      <Script
        src="https://unpkg.com/leaflet@1.4.0/dist/leaflet.js"
        strategy="afterInteractive"
        onLoad={() => {
          setLeafletLoaded(true);
          setStatus("載入 Windy script");
        }}
        onError={() => {
          setStatus("Fallback Leaflet");
          setFailed(true);
        }}
      />
      <Script
        src="https://api.windy.com/assets/map-forecast/libBoot.js"
        strategy="afterInteractive"
        onLoad={() => {
          setWindyLoaded(true);
          setStatus("初始化 Windy");
        }}
        onError={() => {
          setStatus("Fallback Leaflet");
          setFailed(true);
        }}
      />

      <div id="windy" ref={containerRef} className="h-[520px] min-h-[70vh] w-full" />
      <div className="absolute left-4 top-4 rounded-md bg-white/95 px-4 py-3 text-stone-900 shadow-sm backdrop-blur">
        <p className="text-xs font-medium text-stone-500">{status}</p>
        <h2 className="text-lg font-semibold">Windy map</h2>
      </div>
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

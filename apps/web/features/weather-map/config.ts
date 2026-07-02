import type { WeatherMapConfig, WeatherMapProvider, WeatherOverlay } from "./types";

const overlays: WeatherOverlay[] = ["rain", "wind", "temperature", "clouds", "pressure"];

export function getWeatherMapConfig(): WeatherMapConfig {
  const provider = normalizeProvider(process.env.NEXT_PUBLIC_WEATHER_MAP_PROVIDER);
  const defaultOverlay = normalizeOverlay(process.env.NEXT_PUBLIC_WINDY_DEFAULT_OVERLAY);

  return {
    provider,
    defaultLat: toNumber(process.env.NEXT_PUBLIC_WINDY_DEFAULT_LAT, 23.6978),
    defaultLon: toNumber(process.env.NEXT_PUBLIC_WINDY_DEFAULT_LON, 120.9605),
    defaultZoom: toNumber(process.env.NEXT_PUBLIC_WINDY_DEFAULT_ZOOM, 7),
    defaultOverlay,
    windyApiKey: process.env.NEXT_PUBLIC_WINDY_API_KEY || process.env.NEXT_PUBLIC_WINDY_MAP_API_KEY || undefined,
  };
}

function normalizeProvider(value: string | undefined): WeatherMapProvider {
  return value === "windy" ? "windy" : "mock";
}

function normalizeOverlay(value: string | undefined): WeatherOverlay {
  return overlays.includes(value as WeatherOverlay) ? (value as WeatherOverlay) : "rain";
}

function toNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

import type { WeatherOverlay } from "./types";

export const WEATHER_OVERLAY_OPTIONS: Array<{
  value: WeatherOverlay;
  label: string;
  description: string;
}> = [
  { value: "rain", label: "降雨", description: "降雨帶與田區排水風險" },
  { value: "temperature", label: "溫度", description: "高溫熱害與低溫區訊號" },
  { value: "wind", label: "風速", description: "近地面風速與設施受風風險" },
];

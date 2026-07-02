import type { WeatherOverlay } from "./types";

export const WEATHER_OVERLAY_OPTIONS: Array<{
  value: WeatherOverlay;
  label: string;
  description: string;
}> = [
  { value: "rain", label: "Rain", description: "Precipitation bands and field drainage risk" },
  { value: "wind", label: "Wind", description: "Surface wind flow and gust exposure" },
  { value: "temperature", label: "Temperature", description: "Heat stress and cool pocket signals" },
  { value: "clouds", label: "Clouds", description: "Cloud cover and changing sky conditions" },
  { value: "pressure", label: "Pressure", description: "Pressure pattern and frontal movement" },
];

export type WeatherMapProvider = "mock" | "windy";

export type WeatherOverlay = "rain" | "wind" | "temperature" | "clouds" | "pressure";

export interface WeatherMapLocation {
  city: string;
  district?: string;
  lat: number;
  lon: number;
}

export interface WeatherMapConfig {
  provider: WeatherMapProvider;
  defaultLat: number;
  defaultLon: number;
  defaultZoom: number;
  defaultOverlay: WeatherOverlay;
  windyApiKey?: string;
}

export interface WeatherMapState {
  overlay: WeatherOverlay;
  selectedTimeIndex: number;
  isPlaying: boolean;
  location: WeatherMapLocation;
}

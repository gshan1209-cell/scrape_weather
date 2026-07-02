export type DailyWeather = {
  date: string;
  weather: string;
  minTemp?: number | null;
  maxTemp?: number | null;
  rainProbability?: number | null;
  comfort?: string | null;
  uvIndex?: number | null;
  windDescription?: string | null;
  rawTimeRange?: string | null;
};

export type WeeklyWeatherResponse = {
  city: string;
  district?: string | null;
  updatedAt: string;
  source: string;
  days: DailyWeather[];
};

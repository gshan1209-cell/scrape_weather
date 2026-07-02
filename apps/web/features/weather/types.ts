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

export type WeatherStation = {
  stationId: string;
  stationName: string;
  countyName: string;
  townName: string;
  lat: number;
  lon: number;
  altitude?: number | null;
  obsTime?: string | null;
  airTemperature?: number | null;
  precipitation?: number | null;
  windSpeed?: number | null;
  windDirection?: number | null;
  relativeHumidity?: number | null;
  airPressure?: number | null;
  weather?: string | null;
};

export type StationsResponse = {
  updatedAt: string;
  stations: WeatherStation[];
};

import type { LocationListResponse } from "@/features/location/types";
import type { HealthResponse } from "@/features/system/types";
import type { StationsResponse, WeeklyWeatherResponse } from "@/features/weather/types";
import type { WeeklyAdvisoryResponse } from "@/features/advisory/types";

export const DEMO_SOURCE = "示範資料／非即時天氣";
export const DEMO_TIME_LABELS = Array.from({length: 10}, (_, index) => `示範影格 ${index + 1}`);
const locations = [
  {city: "臺北市", districts: ["北投區", "士林區"]},
  {city: "臺中市", districts: ["新社區", "東勢區"]},
  {city: "臺南市", districts: ["新化區", "安南區"]},
  {city: "花蓮縣", districts: ["壽豐鄉", "吉安鄉"]},
  {city: "高雄市", districts: ["美濃區", "旗山區"]},
];
const crops = ["水稻", "葉菜", "果樹", "一般作物"];

function weather(city: string, district?: string): WeeklyWeatherResponse {
  const index = locations.findIndex(location => location.city === city);
  const selectedDistrict = district || locations[index]?.districts[0] || "";
  const valid = index >= 0 && locations[index].districts.includes(selectedDistrict);
  return {
    city, district: selectedDistrict, updatedAt: null, source: DEMO_SOURCE,
    dataStatus: valid ? "mock" : "empty", reason: valid ? "local_demo" : "unknown_demo_location",
    days: valid ? Array.from({length: 7}, (_, day) => ({
      date: `2024-01-0${day + 1}`,
      weather: day % 2 ? "示範短暫雨" : "示範晴時多雲",
      minTemp: 18 + index * 2 + day % 3,
      maxTemp: 25 + index * 2 + day % 3,
      rainProbability: 10 + (day * 15 + index * 5) % 70,
      windDescription: "示範風向，非觀測", uvIndex: 3 + day % 3,
      comfort: "固定示範數值",
    })) : [],
  };
}

function advisory(city: string, district: string | undefined, crop: string): WeeklyAdvisoryResponse {
  const sample = weather(city, district);
  const valid = sample.days.length > 0 && crops.includes(crop);
  return {
    city, district: sample.district, crop, source: DEMO_SOURCE,
    dataStatus: valid ? "mock" : "empty", reason: valid ? "local_demo" : "unknown_demo_selection",
    riskLevel: "info", alerts: [],
    summary: valid ? `${city} ${sample.district} · ${crop} 操作範例，非實際農事建議。` : "此選項尚無示範資料。",
    suggestions: valid ? [
      `${crop} 示範提醒：切換地區可比較固定範例，請勿用於實際作業。`,
      "範例數字不代表真實觀測，不提供施作判斷。",
    ] : [],
  };
}

export function demoGet<T>(path: string): T {
  const url = new URL(path, "https://local-demo.invalid");
  const city = url.searchParams.get("city") || locations[0].city;
  const district = url.searchParams.get("district") || undefined;
  let response: LocationListResponse | HealthResponse | StationsResponse | WeeklyWeatherResponse | WeeklyAdvisoryResponse;
  switch (url.pathname) {
    case "/locations": response = {locations: locations.map(location => ({...location, districts: [...location.districts]}))}; break;
    case "/health": response = {status: "demo", service: "local-demo", version: "fixed-sample-2024-01"}; break;
    case "/weather/stations": response = {updatedAt: null, source: DEMO_SOURCE, dataStatus: "unavailable", reason: "demo_no_observations", stations: []}; break;
    case "/weather/weekly": response = weather(city, district); break;
    case "/advisory/weekly": response = advisory(city, district, url.searchParams.get("crop") || crops[0]); break;
    default: throw new Error("此項目尚無示範資料。");
  }
  return response as T;
}

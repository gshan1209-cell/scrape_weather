import type { WeeklyAdvisoryResponse } from "@/features/advisory/types";
import { DEMO_SOURCE } from "./demo-data";
import type { DailyWeather, StationsResponse, WeatherStation, WeeklyWeatherResponse } from "@/features/weather/types";

export type DataState = {
  kind: "ready" | "demo" | "mock" | "loading" | "config" | "error" | "empty" | "stale" | "unknown";
  title: string;
  message: string;
  showData: boolean;
  isSynced: boolean;
  tone: "info" | "warning";
};

const messages = {
  ready: ["資料已同步", "目前顯示已確認時間的預報資料。"],
  mock: ["模擬資料", "目前使用模擬資料，僅供展示，不能視為即時官方預報。"],
  demo: ["示範模式", "示範資料／非即時天氣。固定樣本期間為 2024-01-01 至 2024-01-07，僅供畫面操作，不代表真實觀測或實際農事建議。"],
  loading: ["資料載入中", "正在取得所選地區的資料。"],
  config: ["服務尚未配置", "尚未設定有效的正式天氣後端，暫時無法取得預報資料。"],
  error: ["載入失敗", "資料無法取得，請稍後重試。"],
  empty: ["尚無資料", "所選城市尚無預報資料。"],
  stale: ["資料已過期", "預報已過期，暫不提供農事建議，請重新整理或稍後再試。"],
  unknown: ["資料時間未確認", "無法確認來源時間，暫不提供農事建議。"],
} satisfies Record<DataState["kind"], [string, string]>;

function state(kind: DataState["kind"], message?: string): DataState {
  return {kind, title: messages[kind][0], message: message ?? messages[kind][1], showData: ["ready", "demo", "mock"].includes(kind), isSynced: kind === "ready", tone: ["ready", "loading"].includes(kind) ? "info" : "warning"};
}

function failure(error: Error): DataState {
  return (error as Error & {code?: string}).code === "API_NOT_CONFIGURED"
    ? state("config")
    : state("error", (error as Error & {code?: string}).code === "API_TIMEOUT" ? "天氣服務回應逾時，請稍後重試。" : undefined);
}

function timestamp(value?: string | null): number {
  if (!value) return NaN;
  const normalized = value.replace(" ", "T");
  return Date.parse(/(?:Z|[+-]\d{2}:?\d{2})$/i.test(normalized) ? normalized : `${normalized}+08:00`);
}

function freshness(value: string | null | undefined, now: number): DataState["kind"] {
  const sourceTime = timestamp(value);
  if (!Number.isFinite(sourceTime) || sourceTime > now + 5 * 60_000) return "unknown";
  return now - sourceTime > 180 * 60_000 ? "stale" : "ready";
}

function taipeiDate(now: number): string {
  const parts = new Intl.DateTimeFormat("en-CA", {timeZone: "Asia/Taipei", year: "numeric", month: "2-digit", day: "2-digit"}).formatToParts(now);
  return ["year", "month", "day"].map(type => parts.find(part => part.type === type)?.value).join("-");
}

export function currentForecastDays(days: DailyWeather[], now = Date.now()): DailyWeather[] {
  const today = taipeiDate(now);
  return days.filter(day => /^\d{4}-\d{2}-\d{2}$/.test(day.date) && day.date >= today);
}

export function currentWeatherDay(days: DailyWeather[], now = Date.now()): DailyWeather | undefined {
  return days.find(day => day.date === taipeiDate(now));
}

export function currentStations(stations: WeatherStation[], now = Date.now()): WeatherStation[] {
  return stations.filter(station => freshness(station.obsTime, now) === "ready");
}

type WeatherInput = {data?: WeeklyWeatherResponse; loading: boolean; error?: Error; city: string; district?: string; now?: number};
export function getWeatherState({data, loading, error, city, district, now = Date.now()}: WeatherInput): DataState {
  if (error) return failure(error);
  if (loading) return state("loading");
  if (!data || !data.days.length || data.city !== city || (district && data.district !== district)) return state("empty");
  if (data.dataStatus === "error" || data.dataStatus === "unavailable") return state("error");
  if (data.dataStatus === "empty") return state("empty");
  if (data.dataStatus === "stale") return state("stale");
  if (data.source === DEMO_SOURCE && data.dataStatus === "mock") return state("demo");
  if (data.dataStatus === "mock" || ["模擬天氣資料", "Mock Weather Data"].includes(data.source)) return state("mock");
  if (!currentForecastDays(data.days, now).length) return state("stale");
  const kind = freshness(data.updatedAt, now);
  if (data.dataStatus !== "live" || data.source !== "CWA OpenData") return state(kind === "stale" ? "stale" : "unknown");
  return state(kind);
}

export function getAdviceState({weather, data, loading, error}: {weather: DataState; data?: WeeklyAdvisoryResponse; loading: boolean; error?: Error}): DataState {
  if (!weather.showData) return weather;
  if (error) return failure(error);
  if (loading) return state("loading");
  if (!data) return state("empty", "目前尚無農事提醒。");
  if (data.dataStatus === "stale") return state("stale");
  if (data.dataStatus === "empty") return state("empty");
  if (data.dataStatus === "error" || data.dataStatus === "unavailable") return state("error");
  if (weather.kind === "demo") return state(data.source === DEMO_SOURCE && data.dataStatus === "mock" ? "demo" : "unknown");
  if (data.dataStatus === "mock" || ["模擬天氣資料", "Mock Weather Data"].includes(data.source ?? "")) return state("mock");
  if (data.dataStatus !== "live" || data.source !== "CWA OpenData") return state("unknown");
  return state(weather.kind === "mock" ? "mock" : "ready");
}

export function getStationState({data, loading, error, now = Date.now()}: {data?: StationsResponse; loading: boolean; error?: Error; now?: number}): DataState {
  if (error) return failure(error);
  if (loading) return state("loading", "正在取得測站觀測資料。");
  if (data?.source === DEMO_SOURCE) return state("empty", "示範模式不提供真實測站觀測，請使用地區控制切換範例。");
  if (data?.dataStatus === "unavailable") return state("config", "尚未配置官方測站資料來源。");
  if (data?.dataStatus === "error") return state("error", data.reason === "upstream_tls_error" ? "測站來源的安全連線驗證失敗，暫無可用觀測。" : "測站來源目前無法取得，暫無可用觀測。");
  if (!data?.stations.length || data.dataStatus === "empty") return state("empty", "官方來源未提供測站觀測資料。");
  if (data.dataStatus === "stale") return state("stale", "測站觀測已過期，暫不顯示舊觀測值。");
  return state(data.dataStatus !== "live" ? "unknown" : freshness(data.updatedAt, now));
}

export function formatSourceTime(value?: string | null): string {
  const parsed = timestamp(value);
  if (!Number.isFinite(parsed)) return "時間未提供";
  return new Intl.DateTimeFormat("zh-TW", {timeZone: "Asia/Taipei", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false, timeZoneName: "short"}).format(parsed);
}

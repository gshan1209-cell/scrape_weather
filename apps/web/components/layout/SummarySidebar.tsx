"use client";

import { AlertTriangle, CalendarDays, CheckCircle2, Cloud, CloudRain, CloudSun, Map, MapPin, RefreshCw, Server, Sprout, Sun, ThermometerSun, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { WeeklyAdvisoryResponse } from "@/features/advisory/types";
import type { HealthResponse } from "@/features/system/types";
import type { DailyWeather } from "@/features/weather/types";
import { cn } from "@/lib/utils";
import { formatSourceTime, type DataState } from "@/lib/weather-state";

type Props = {
  city: string;
  district?: string;
  crop: string;
  day?: DailyWeather;
  days?: DailyWeather[];
  advisory?: WeeklyAdvisoryResponse;
  loading: boolean;
  updatedAt?: string | null;
  source?: string;
  health?: HealthResponse;
  healthLoading: boolean;
  healthError?: Error;
  mapMode: string;
  weatherError?: Error;
  advisoryError?: Error;
  themeColor?: string;
  weatherState: DataState;
  adviceState: DataState;
};

export function SummarySidebar({
  city,
  district,
  crop,
  day,
  days = [],
  advisory,
  loading,
  updatedAt,
  source,
  health,
  healthLoading,
  healthError,
  mapMode,
  weatherError,
  advisoryError,
  themeColor = "#2f7d57",
  weatherState,
  adviceState,
}: Props) {
  const officialAdvice = adviceState.kind === "ready" && advisory;
  const riskLevel = officialAdvice ? advisory.riskLevel : "info";
  const apiOnline = health?.status === "ok" && !healthError;
  const suggestions = adviceState.showData ? advisory?.suggestions ?? [] : [];
  const visibleDays = weatherState.showData ? days : [];

  return (
    <div className="rounded-xl border border-stone-200/80 bg-white shadow-card overflow-hidden">
      {/* Risk header */}
      <div className="p-4 text-white" style={{ background: themeColor }}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-white/70">今日摘要</p>
            <h2 className="mt-1 text-lg font-bold">{officialAdvice ? riskTitle(riskLevel) : adviceState.title}</h2>
          </div>
          <Badge tone={officialAdvice ? riskLevel : adviceState.tone}>{officialAdvice ? riskLabel(riskLevel) : adviceState.title}</Badge>
        </div>
        {adviceState.showData && advisory?.summary && (
          <p className="mt-3 text-sm leading-relaxed text-white/80">{advisory.summary}</p>
        )}
        {!adviceState.showData && <p className="mt-3 text-sm leading-relaxed text-white/80">{adviceState.message}</p>}

        {/* Quick location/crop/temp */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          <Chip>{city}{district ? ` · ${district}` : ""}</Chip>
          <Chip>{crop}</Chip>
          {weatherState.showData && day && <Chip>{day.minTemp ?? "--"}° / {day.maxTemp ?? "--"}°</Chip>}
        </div>
      </div>

      {/* Farming suggestions */}
      <div className="p-4">
        <div className="mb-3 flex items-center gap-2">
          <Sprout className="h-4 w-4 text-field" />
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">本週農事建議</p>
          {suggestions.length > 0 && (
            <span className="ml-auto text-[11px] font-medium text-stone-400">{suggestions.length} 項</span>
          )}
        </div>
        {suggestions.length > 0 ? (
          <div className="space-y-2">
            {suggestions.map((text, idx) => (
              <div key={idx} className="flex gap-2.5 rounded-lg bg-stone-50 p-2.5 text-sm text-stone-700 transition-colors hover:bg-stone-100">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-field-50 text-[11px] font-bold text-field">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{text}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-stone-400 italic">尚無農事建議</p>
        )}
      </div>

      {/* Weekly forecast */}
      <div className="border-t border-stone-100 p-4">
        <div className="mb-3 flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-field" />
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">一週預報</p>
        </div>
        {visibleDays.length > 0 ? (
          <div className="divide-y divide-stone-100">
            {visibleDays.map((d) => (
              <DayRow key={d.date} day={d} />
            ))}
          </div>
        ) : (
          <p className="text-xs text-stone-500">{weatherState.title}：{weatherState.message}</p>
        )}
      </div>

      {/* Footer: system + data */}
      <div className="border-t border-stone-100 bg-stone-50/50 p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-stone-400">
              {apiOnline ? <CheckCircle2 className="h-3 w-3 text-field" /> : <WifiOff className="h-3 w-3 text-red-400" />}
              {weatherState.kind === "config" ? "服務尚未配置" : healthLoading ? "檢查中" : apiOnline ? `API 在線 v${health?.version}` : "API 離線"}
            </span>
            <span className="text-stone-400">
              {sourceLabel(source)} · {formatSourceTime(updatedAt)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-stone-400">
            <span>地圖 {mapMode}</span>
            <span>·</span>
            <span className={cn(weatherError && "text-red-400")}>
              預報 {weatherState.title}
            </span>
            <span>·</span>
            <span className={cn(advisoryError && "text-red-400")}>
              提醒 {adviceState.title}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-white/15 px-2.5 py-0.5 text-[11px] font-medium backdrop-blur">
      {children}
    </span>
  );
}

function DayRow({ day }: { day: DailyWeather }) {
  const DAY_LABELS = ["日", "一", "二", "三", "四", "五", "六"];
  const d = new Date(day.date);
  const dow = DAY_LABELS[d.getDay()];
  const WeatherIcon = weatherIcon(day.weather);

  return (
    <div className="flex items-center gap-2 py-2 text-sm">
      <span className="w-8 text-center text-[11px] font-medium text-stone-400">
        {d.getMonth() + 1}/{d.getDate()}
      </span>
      <span className="w-6 text-center text-xs font-bold text-stone-500">週{dow}</span>
      <WeatherIcon className="h-4 w-4 shrink-0 text-stone-400" />
      <span className="min-w-0 flex-1 truncate text-stone-700">{day.weather}</span>
      {day.rainProbability != null && (
        <span className="flex shrink-0 items-center gap-0.5 text-xs text-sky-600">
          <CloudRain className="h-3 w-3" />
          {day.rainProbability}%
        </span>
      )}
      <span className="shrink-0 text-right text-xs tabular-nums text-stone-500">
        <span className="font-semibold text-stone-700">{day.minTemp ?? "--"}</span>
        <span className="mx-0.5 text-stone-300">~</span>
        <span className="font-semibold text-stone-700">{day.maxTemp ?? "--"}</span>°
      </span>
    </div>
  );
}

function weatherIcon(text: string) {
  const t = text.toLowerCase();
  if (t.includes("雨") || t.includes("rain")) return CloudRain;
  if (t.includes("陰") || t.includes("雲") || t.includes("cloud")) return Cloud;
  if (t.includes("晴") || t.includes("sun") || t.includes("clear")) return Sun;
  return CloudSun;
}

function riskLabel(level: string) {
  if (level === "danger") return "高風險";
  if (level === "warning") return "注意";
  if (level === "normal") return "正常";
  return "資訊";
}

function riskTitle(level: string) {
  if (level === "danger") return "請優先調整作業";
  if (level === "warning") return "本週需留意天氣";
  if (level === "normal") return "田間條件穩定";
  return "正在彙整摘要";
}

function sourceLabel(source?: string) {
  if (!source) return "--";
  if (source === "Mock Weather Data" || source === "模擬天氣資料") return "模擬";
  if (source === "CWA OpenData") return "CWA";
  return source;
}

"use client";

import { AlertTriangle, CalendarDays, CheckCircle2, CloudRain, Map, MapPin, Server, ThermometerSun, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { WeeklyAdvisoryResponse } from "@/features/advisory/types";
import type { HealthResponse } from "@/features/system/types";
import type { DailyWeather } from "@/features/weather/types";

type Props = {
  city: string;
  district?: string;
  crop: string;
  day?: DailyWeather;
  advisory?: WeeklyAdvisoryResponse;
  loading: boolean;
  updatedAt?: string;
  source?: string;
  health?: HealthResponse;
  healthLoading: boolean;
  healthError?: Error;
  mapMode: string;
  weatherError?: Error;
  advisoryError?: Error;
};

export function SummarySidebar({
  city,
  district,
  crop,
  day,
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
}: Props) {
  const riskLevel = advisory?.riskLevel ?? "info";
  const apiOnline = health?.status === "ok" && !healthError;

  return (
    <aside className="lg:sticky lg:top-20">
      <div className="rounded-md border border-stone-200 bg-white shadow-sm">
        <div className="border-b border-stone-200 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-stone-500">今日摘要</p>
              <h2 className="mt-1 text-xl font-semibold text-stone-950">{loading ? "資料載入中" : riskTitle(riskLevel)}</h2>
            </div>
            <Badge tone={riskLevel}>{riskLabel(riskLevel)}</Badge>
          </div>
          <p className="mt-3 text-sm leading-6 text-stone-600">{advisory?.summary ?? "正在整理天氣風險與農事提醒。"}</p>
        </div>

        <div className="grid gap-3 p-4">
          <SummaryItem icon={MapPin} label="地區" value={`${city}${district ? ` / ${district}` : ""}`} />
          <SummaryItem icon={CalendarDays} label="作物" value={crop} />
          <SummaryItem icon={ThermometerSun} label="溫度" value={day ? `${day.minTemp ?? "--"} / ${day.maxTemp ?? "--"} °C` : "--"} />
          <SummaryItem icon={CloudRain} label="降雨機率" value={day?.rainProbability == null ? "--" : `${day.rainProbability}%`} />
          <SummaryItem icon={AlertTriangle} label="提醒數" value={`${advisory?.alerts.length ?? 0} 則`} />
        </div>

        <div className="border-t border-stone-200 p-4">
          <p className="text-xs font-medium text-stone-500">系統狀態</p>
          <div className="mt-3 grid gap-2">
            <StatusLine
              icon={apiOnline ? CheckCircle2 : WifiOff}
              label="API"
              value={healthLoading ? "檢查中" : apiOnline ? `在線 v${health?.version}` : "離線"}
              tone={apiOnline ? "normal" : "danger"}
            />
            <StatusLine icon={Map} label="地圖" value={mapMode} tone="info" />
            <StatusLine icon={Server} label="預報" value={weatherError ? "讀取失敗" : day ? "已同步" : "等待資料"} tone={weatherError ? "danger" : "normal"} />
            <StatusLine icon={AlertTriangle} label="提醒" value={advisoryError ? "讀取失敗" : advisory ? "已產生" : "等待資料"} tone={advisoryError ? "danger" : "normal"} />
          </div>
        </div>

        <div className="border-t border-stone-200 p-4">
          <p className="text-xs font-medium text-stone-500">資料狀態</p>
          <dl className="mt-2 space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-stone-500">來源</dt>
              <dd className="text-right font-medium text-stone-800">{sourceLabel(source)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-stone-500">更新</dt>
              <dd className="text-right font-medium text-stone-800">{formatDateTime(updatedAt)}</dd>
            </div>
          </dl>
        </div>
      </div>
    </aside>
  );
}

function SummaryItem({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-md bg-stone-50 p-3">
      <Icon className="h-4 w-4 shrink-0 text-field" />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-stone-500">{label}</p>
        <p className="mt-0.5 truncate text-sm font-semibold text-stone-900">{value}</p>
      </div>
    </div>
  );
}

function StatusLine({ icon: Icon, label, value, tone }: { icon: typeof Server; label: string; value: string; tone: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md bg-stone-50 px-3 py-2">
      <div className="flex items-center gap-2 text-sm font-medium text-stone-700">
        <Icon className="h-4 w-4 text-field" />
        {label}
      </div>
      <Badge tone={tone}>{value}</Badge>
    </div>
  );
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
  if (source === "Mock Weather Data" || source === "模擬天氣資料") return "模擬天氣資料";
  if (source === "CWA OpenData") return "CWA 開放資料";
  return source ?? "--";
}

function formatDateTime(value?: string) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("zh-TW", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

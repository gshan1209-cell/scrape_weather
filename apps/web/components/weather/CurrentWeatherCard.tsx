import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DailyWeather } from "@/features/weather/types";
import { RainRiskBadge } from "./RainRiskBadge";
import { TemperatureRange } from "./TemperatureRange";

export function CurrentWeatherCard({ day, loading, source }: { day?: DailyWeather; loading: boolean; source?: string }) {
  return (
    <Card className="bg-card-gradient">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">今日天氣</p>
        {day && (
          <Badge tone={day.rainProbability != null && day.rainProbability >= 60 ? "warning" : "info"}>
            UV {day.uvIndex ?? "--"}
          </Badge>
        )}
      </div>

      {loading ? (
        <div className="mt-6 flex items-center gap-2 text-sm text-stone-400">
          <span className="h-2 w-2 animate-pulse-soft rounded-full bg-field" />
          正在載入預報...
        </div>
      ) : day ? (
        <>
          <div className="mt-3 text-2xl font-bold text-stone-900 leading-tight">{day.weather}</div>

          <div className="mt-4 flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-field-50 px-3 py-1.5 text-sm font-semibold text-field-dark">
              <TemperatureRange min={day.minTemp} max={day.maxTemp} />
            </span>
            <RainRiskBadge value={day.rainProbability} />
            {day.comfort && (
              <span className="rounded-lg bg-stone-100 px-3 py-1.5 text-xs font-medium text-stone-600">
                {day.comfort}
              </span>
            )}
          </div>

          {day.windDescription && (
            <p className="mt-3 text-xs text-stone-500">風向風速：{day.windDescription}</p>
          )}

          <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-3">
            <span className="text-xs text-stone-400">資料來源</span>
            <span className="text-xs font-semibold text-field">{sourceLabel(source)}</span>
          </div>
        </>
      ) : (
        <div className="mt-6 text-sm text-stone-400">尚無預報資料。</div>
      )}
    </Card>
  );
}

function sourceLabel(source?: string) {
  if (!source) return "--";
  if (source === "Mock Weather Data" || source === "模擬天氣資料") return "模擬天氣資料";
  if (source === "CWA OpenData") return "CWA 開放資料";
  return source;
}

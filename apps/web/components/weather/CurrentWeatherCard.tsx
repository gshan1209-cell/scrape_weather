import { Card } from "@/components/ui/card";
import { DailyWeather } from "@/features/weather/types";
import { RainRiskBadge } from "./RainRiskBadge";
import { TemperatureRange } from "./TemperatureRange";

export function CurrentWeatherCard({ day, loading, source }: { day?: DailyWeather; loading: boolean; source?: string }) {
  return (
    <Card>
      <div className="text-sm font-semibold text-stone-500">今日天氣</div>
      {loading ? (
        <div className="mt-4 text-sm text-stone-500">正在載入預報...</div>
      ) : day ? (
        <>
          <div className="mt-2 text-2xl font-semibold text-stone-900">{day.weather}</div>
          <div className="mt-4 flex flex-wrap gap-2">
            <RainRiskBadge value={day.rainProbability} />
            <span className="rounded bg-stone-100 px-2 py-1 text-xs font-semibold text-stone-700">
              <TemperatureRange min={day.minTemp} max={day.maxTemp} />
            </span>
            <span className="rounded bg-stone-100 px-2 py-1 text-xs font-semibold text-stone-700">紫外線 {day.uvIndex ?? "--"}</span>
          </div>
          <div className="mt-4 text-xs text-stone-500">資料來源：{sourceLabel(source)}</div>
        </>
      ) : (
        <div className="mt-4 text-sm text-stone-500">尚無預報資料。</div>
      )}
    </Card>
  );
}

function sourceLabel(source?: string) {
  if (source === "Mock Weather Data") return "模擬天氣資料";
  if (source === "CWA OpenData") return "CWA 開放資料";
  return source ?? "--";
}

import { Card } from "@/components/ui/card";
import { DailyWeather } from "@/features/weather/types";
import { RainRiskBadge } from "./RainRiskBadge";
import { TemperatureRange } from "./TemperatureRange";

export function CurrentWeatherCard({ day, loading, source }: { day?: DailyWeather; loading: boolean; source?: string }) {
  return (
    <Card>
      <div className="text-sm font-semibold text-stone-500">Today</div>
      {loading ? (
        <div className="mt-4 text-sm text-stone-500">Loading forecast...</div>
      ) : day ? (
        <>
          <div className="mt-2 text-2xl font-semibold text-stone-900">{day.weather}</div>
          <div className="mt-4 flex flex-wrap gap-2">
            <RainRiskBadge value={day.rainProbability} />
            <span className="rounded bg-stone-100 px-2 py-1 text-xs font-semibold text-stone-700">
              <TemperatureRange min={day.minTemp} max={day.maxTemp} />
            </span>
            <span className="rounded bg-stone-100 px-2 py-1 text-xs font-semibold text-stone-700">UV {day.uvIndex ?? "--"}</span>
          </div>
          <div className="mt-4 text-xs text-stone-500">Source: {source}</div>
        </>
      ) : (
        <div className="mt-4 text-sm text-stone-500">No forecast loaded.</div>
      )}
    </Card>
  );
}

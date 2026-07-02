import { DailyWeather } from "@/features/weather/types";
import { RainRiskBadge } from "./RainRiskBadge";
import { TemperatureRange } from "./TemperatureRange";

export function DailyWeatherItem({ day }: { day: DailyWeather }) {
  return (
    <div className="grid grid-cols-[6rem_1fr] gap-3 border-b border-stone-100 py-3 last:border-0 sm:grid-cols-[7rem_1fr_7rem_6rem]">
      <div className="text-sm font-semibold text-stone-800">{day.date}</div>
      <div className="min-w-0 text-sm text-stone-600">{day.weather}</div>
      <div className="text-sm text-stone-700">
        <TemperatureRange min={day.minTemp} max={day.maxTemp} />
      </div>
      <RainRiskBadge value={day.rainProbability} />
    </div>
  );
}

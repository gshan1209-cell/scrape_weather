import { Card } from "@/components/ui/card";
import { DailyWeatherItem } from "./DailyWeatherItem";
import { DailyWeather } from "@/features/weather/types";

export function WeeklyForecastCard({ days, loading }: { days: DailyWeather[]; loading: boolean }) {
  return (
    <Card>
      <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">一週預報</p>
      {loading ? (
        <div className="mt-5 flex items-center gap-2 text-sm text-stone-400">
          <span className="h-2 w-2 animate-pulse-soft rounded-full bg-field" />
          正在載入一週資料...
        </div>
      ) : days.length ? (
        <div className="mt-3 divide-y divide-stone-100">
          {days.map((day) => (
            <DailyWeatherItem key={day.date} day={day} />
          ))}
        </div>
      ) : (
        <div className="mt-5 text-sm text-stone-400">尚無一週預報資料。</div>
      )}
    </Card>
  );
}

import { Card } from "@/components/ui/card";
import { DailyWeatherItem } from "./DailyWeatherItem";
import { DailyWeather } from "@/features/weather/types";

export function WeeklyForecastCard({ days, loading }: { days: DailyWeather[]; loading: boolean }) {
  return (
    <Card>
      <div className="text-sm font-semibold text-stone-500">一週預報</div>
      {loading ? (
        <div className="mt-4 text-sm text-stone-500">正在載入一週資料...</div>
      ) : days.length ? (
        <div className="mt-2">
          {days.map((day) => (
            <DailyWeatherItem key={day.date} day={day} />
          ))}
        </div>
      ) : (
        <div className="mt-4 text-sm text-stone-500">尚無一週預報資料。</div>
      )}
    </Card>
  );
}

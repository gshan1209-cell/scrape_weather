import { Card } from "@/components/ui/card";
import { DailyWeatherItem } from "./DailyWeatherItem";
import { DailyWeather } from "@/features/weather/types";

export function WeeklyForecastCard({ days, loading }: { days: DailyWeather[]; loading: boolean }) {
  return (
    <Card>
      <div className="text-sm font-semibold text-stone-500">Weekly forecast</div>
      {loading ? (
        <div className="mt-4 text-sm text-stone-500">Loading week...</div>
      ) : days.length ? (
        <div className="mt-2">
          {days.map((day) => (
            <DailyWeatherItem key={day.date} day={day} />
          ))}
        </div>
      ) : (
        <div className="mt-4 text-sm text-stone-500">No weekly data available.</div>
      )}
    </Card>
  );
}

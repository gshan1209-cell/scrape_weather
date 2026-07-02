"use client";

import { CalendarDays, CloudRain } from "lucide-react";
import { DailyWeather } from "@/features/weather/types";

const DAY_LABELS = ["日", "一", "二", "三", "四", "五", "六"];

export function DailyWeatherItem({ day }: { day: DailyWeather }) {
  const date = new Date(day.date);
  const dayOfWeek = DAY_LABELS[date.getDay()];

  return (
    <div className="flex items-center gap-3 py-3 transition-colors hover:bg-stone-50/50">
      <div className="flex w-14 shrink-0 flex-col items-center">
        <CalendarDays className="h-4 w-4 text-stone-400" />
        <span className="mt-0.5 text-[11px] font-medium text-stone-400">
          {date.getMonth() + 1}/{date.getDate()}
        </span>
        <span className="text-xs font-bold text-stone-700">週{dayOfWeek}</span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-stone-800 truncate">{day.weather}</p>
        <div className="mt-1 flex items-center gap-2 text-xs text-stone-500">
          <span className="font-semibold text-stone-700">
            {day.minTemp ?? "--"}° ~ {day.maxTemp ?? "--"}°
          </span>
          {day.rainProbability != null && (
            <span className="flex items-center gap-1">
              <CloudRain className="h-3 w-3" />
              {day.rainProbability}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

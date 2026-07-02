"use client";

import { MapPin } from "lucide-react";
import { WeeklyAdvisoryResponse } from "@/features/advisory/types";
import type { WeatherMapConfig } from "@/features/weather-map/types";
import { useWeatherMapState } from "@/features/weather-map/useWeatherMapState";
import { MapFloatingAdvice } from "./MapFloatingAdvice";
import { MapLayerControl } from "./MapLayerControl";
import { MapLegend } from "./MapLegend";
import { MapTimeline } from "./MapTimeline";

type Props = {
  config: WeatherMapConfig;
  city: string;
  district?: string;
  crop?: string;
  advisory?: WeeklyAdvisoryResponse;
};

const overlayClass: Record<string, string> = {
  rain: "from-sky-950 via-blue-800 to-emerald-700",
  wind: "from-stone-950 via-teal-800 to-cyan-600",
  temperature: "from-red-950 via-orange-700 to-yellow-500",
  clouds: "from-zinc-900 via-slate-600 to-stone-300",
  pressure: "from-indigo-950 via-violet-800 to-cyan-600",
};

export function WindyInspiredMap({ config, city, district, crop, advisory }: Props) {
  const map = useWeatherMapState(config, city, district);

  return (
    <section className="relative overflow-hidden rounded-md border border-stone-200 bg-stone-950 text-white shadow-sm">
      <div className={`relative min-h-[420px] md:min-h-[520px] bg-gradient-to-br ${overlayClass[map.overlay]}`}>
        <div className="absolute inset-0 opacity-35">
          <div className="absolute left-[-10%] top-[18%] h-24 w-[120%] rotate-[-8deg] bg-white/20 blur-2xl" />
          <div className="absolute left-[-5%] top-[44%] h-16 w-[110%] rotate-[12deg] bg-cyan-200/25 blur-xl" />
          <div className="absolute left-[20%] top-[68%] h-20 w-[90%] rotate-[-4deg] bg-emerald-200/20 blur-2xl" />
        </div>

        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(0deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:64px_64px]" />

        <div className="absolute left-[52%] top-[48%] -translate-x-1/2 -translate-y-1/2">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-white text-field shadow-lg">
            <MapPin className="h-6 w-6" />
            <span className="absolute h-20 w-20 rounded-full border border-white/60" />
          </div>
        </div>

        <div className="absolute left-4 top-4 max-w-[calc(100%-2rem)] rounded-md bg-black/45 px-4 py-3 backdrop-blur">
          <p className="text-xs font-medium text-white/70">{map.currentTimeLabel} forecast layer</p>
          <h2 className="text-lg font-semibold">{city}{district ? `, ${district}` : ""}</h2>
        </div>

        <MapLayerControl value={map.overlay} onChange={map.setOverlay} />
        <MapFloatingAdvice advisory={advisory} crop={crop} />
        <MapLegend overlay={map.overlay} />
        <MapTimeline
          labels={map.timeLabels}
          value={map.selectedTimeIndex}
          isPlaying={map.isPlaying}
          onChange={map.setSelectedTimeIndex}
          onPlayToggle={map.togglePlaying}
        />
      </div>
    </section>
  );
}

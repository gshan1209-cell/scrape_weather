import type { WeatherOverlay } from "@/features/weather-map/types";

const labels: Record<WeatherOverlay, [string, string, string]> = {
  rain: ["小雨", "中雨", "大雨"],
  wind: ["微風", "陣風", "強風"],
  temperature: ["偏涼", "舒適", "高溫"],
  clouds: ["少雲", "多雲", "陰天"],
  pressure: ["低壓", "穩定", "高壓"],
};

const gradients: Record<WeatherOverlay, string> = {
  rain: "from-sky-300 via-blue-500 to-purple-700",
  temperature: "from-cyan-300 via-yellow-300 to-red-500",
  wind: "from-emerald-200 via-teal-400 to-cyan-700",
  clouds: "from-stone-200 via-stone-400 to-stone-700",
  pressure: "from-indigo-300 via-violet-500 to-cyan-700",
};

const titles: Record<WeatherOverlay, string> = {
  rain: "降雨",
  temperature: "溫度",
  wind: "風速",
  clouds: "雲量",
  pressure: "氣壓",
};

export function MapLegend({ overlay }: { overlay: WeatherOverlay }) {
  return (
    <div className="absolute bottom-24 left-3 rounded-md bg-black/40 p-3 text-xs backdrop-blur md:bottom-20">
      <div className="mb-2 font-semibold">{titles[overlay]}</div>
      <div className={`h-2 w-36 rounded bg-gradient-to-r ${gradients[overlay]}`} />
      <div className="mt-1 flex w-36 justify-between text-white/70">
        {labels[overlay].map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </div>
  );
}

import type { WeatherOverlay } from "@/features/weather-map/types";

const labels: Record<WeatherOverlay, [string, string, string]> = {
  rain: ["Light", "Moderate", "Heavy"],
  wind: ["Calm", "Breezy", "Strong"],
  temperature: ["Cool", "Warm", "Hot"],
  clouds: ["Clear", "Broken", "Overcast"],
  pressure: ["Low", "Stable", "High"],
};

export function MapLegend({ overlay }: { overlay: WeatherOverlay }) {
  return (
    <div className="absolute bottom-24 left-3 rounded-md bg-black/40 p-3 text-xs backdrop-blur md:bottom-20">
      <div className="mb-2 font-semibold capitalize">{overlay}</div>
      <div className="h-2 w-36 rounded bg-gradient-to-r from-cyan-300 via-yellow-300 to-red-400" />
      <div className="mt-1 flex w-36 justify-between text-white/70">
        {labels[overlay].map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </div>
  );
}

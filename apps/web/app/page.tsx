"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CloudSun, RefreshCw } from "lucide-react";
import { AlertBanner } from "@/components/farmer/AlertBanner";
import { CropSelector } from "@/components/farmer/CropSelector";
import { FarmerAdviceCard } from "@/components/farmer/FarmerAdviceCard";
import { WorkSuggestionCard } from "@/components/farmer/WorkSuggestionCard";
import { PageContainer } from "@/components/layout/PageContainer";
import { WeatherMapShell } from "@/components/map/WeatherMapShell";
import { CurrentWeatherCard } from "@/components/weather/CurrentWeatherCard";
import { WeeklyForecastCard } from "@/components/weather/WeeklyForecastCard";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useWeeklyAdvisory } from "@/features/advisory/hooks";
import { useLocations } from "@/features/location/hooks";
import { useWeeklyWeather } from "@/features/weather/hooks";

export default function HomePage() {
  const [city, setCity] = useState("Taipei");
  const [district, setDistrict] = useState("Beitou");
  const [crop, setCrop] = useState("rice");
  const weather = useWeeklyWeather(city, district);
  const advisory = useWeeklyAdvisory(city, district, crop);
  const locations = useLocations();

  const districts = useMemo(() => {
    return locations.data?.locations.find((item) => item.city === city)?.districts ?? ["Beitou"];
  }, [city, locations.data]);

  function handleCity(value: string) {
    setCity(value);
    const nextDistricts = locations.data?.locations.find((item) => item.city === value)?.districts;
    setDistrict(nextDistricts?.[0] ?? "");
  }

  const firstDay = weather.data?.days[0];

  return (
    <PageContainer>
      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-md bg-field p-5 text-white shadow-sm">
          <div className="flex items-center gap-2 text-sm font-medium opacity-90">
            <CloudSun className="h-4 w-4" />
            CWA OpenData farm weather
          </div>
          <h1 className="mt-3 max-w-2xl text-3xl font-semibold tracking-normal md:text-4xl">
            Weekly field decisions, grounded in weather risk.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/85">
            Select a production area and crop to review heat, rain, wind, and work timing for the week ahead.
          </p>
        </div>

        <div className="rounded-md border border-stone-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-3">
            <Select label="City" value={city} onChange={(event) => handleCity(event.target.value)}>
              {(locations.data?.locations ?? [{ city: "Taipei", districts: [] }]).map((item) => (
                <option key={item.city} value={item.city}>
                  {item.city}
                </option>
              ))}
            </Select>
            <Select label="District" value={district} onChange={(event) => setDistrict(event.target.value)}>
              {districts.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
            <CropSelector value={crop} onChange={setCrop} />
          </div>
          <Button className="mt-4 w-full" onClick={() => { weather.reload(); advisory.reload(); locations.reload(); }}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </section>

      {(weather.error || advisory.error) && (
        <AlertBanner level="warning" title="API connection issue" message="The web app could not reach one of the API endpoints." />
      )}

      <WeatherMapShell city={city} district={district} crop={crop} advisory={advisory.data} />

      <section className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <CurrentWeatherCard day={firstDay} loading={weather.loading} source={weather.data?.source} />
        <FarmerAdviceCard advisory={advisory.data} loading={advisory.loading} />
      </section>

      {advisory.data?.alerts.map((alert) => (
        <AlertBanner key={`${alert.type}-${alert.title}`} level={alert.level} title={alert.title} message={alert.message} />
      ))}

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <WeeklyForecastCard days={weather.data?.days ?? []} loading={weather.loading} />
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-stone-700">
            <AlertTriangle className="h-4 w-4 text-sun" />
            Work suggestions
          </div>
          {(advisory.data?.suggestions ?? []).map((item) => (
            <WorkSuggestionCard key={item} text={item} />
          ))}
        </div>
      </section>
    </PageContainer>
  );
}

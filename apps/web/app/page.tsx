"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CloudSun, RefreshCw } from "lucide-react";
import { AlertBanner } from "@/components/farmer/AlertBanner";
import { CropSelector } from "@/components/farmer/CropSelector";
import { FarmerAdviceCard } from "@/components/farmer/FarmerAdviceCard";
import { WorkSuggestionCard } from "@/components/farmer/WorkSuggestionCard";
import { PageContainer } from "@/components/layout/PageContainer";
import { SummarySidebar } from "@/components/layout/SummarySidebar";
import { WeatherMapShell } from "@/components/map/WeatherMapShell";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { CurrentWeatherCard } from "@/components/weather/CurrentWeatherCard";
import { WeeklyForecastCard } from "@/components/weather/WeeklyForecastCard";
import { useWeeklyAdvisory } from "@/features/advisory/hooks";
import { useLocations } from "@/features/location/hooks";
import { useSystemHealth } from "@/features/system/hooks";
import { getWeatherMapConfig } from "@/features/weather-map/config";
import { useWeeklyWeather } from "@/features/weather/hooks";

export default function HomePage() {
  const [city, setCity] = useState("臺北市");
  const [district, setDistrict] = useState("北投區");
  const [crop, setCrop] = useState("水稻");
  const weather = useWeeklyWeather(city, district);
  const advisory = useWeeklyAdvisory(city, district, crop);
  const locations = useLocations();
  const health = useSystemHealth();

  const mapConfig = useMemo(() => getWeatherMapConfig(), []);
  const mapMode = mapConfig.provider === "windy" && mapConfig.windyApiKey ? "Windy" : "Leaflet 模擬";

  const districts = useMemo(() => {
    return locations.data?.locations.find((item) => item.city === city)?.districts ?? ["北投區"];
  }, [city, locations.data]);

  function handleCity(value: string) {
    setCity(value);
    const nextDistricts = locations.data?.locations.find((item) => item.city === value)?.districts;
    setDistrict(nextDistricts?.[0] ?? "");
  }

  function handleLocationSelect(selectedCity: string, selectedDistrict?: string) {
    setCity(selectedCity);

    const cityEntry = locations.data?.locations.find((item) => item.city === selectedCity);
    if (cityEntry) {
      if (selectedDistrict && cityEntry.districts.includes(selectedDistrict)) {
        setDistrict(selectedDistrict);
      } else {
        setDistrict(cityEntry.districts[0] ?? "");
      }
    } else if (selectedDistrict) {
      setDistrict(selectedDistrict);
    }
  }

  function refreshAll() {
    weather.reload();
    advisory.reload();
    locations.reload();
    health.reload();
  }

  const firstDay = weather.data?.days[0];
  const isLoading = weather.loading || advisory.loading || locations.loading;

  return (
    <PageContainer>
      <div className="grid gap-5 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <SummarySidebar
          city={city}
          district={district}
          crop={crop}
          day={firstDay}
          advisory={advisory.data}
          loading={isLoading}
          updatedAt={weather.data?.updatedAt}
          source={weather.data?.source}
          health={health.data}
          healthLoading={health.loading}
          healthError={health.error}
          mapMode={mapMode}
          weatherError={weather.error}
          advisoryError={advisory.error}
        />

        <div className="min-w-0 space-y-5">
          <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-md bg-field p-5 text-white shadow-sm">
              <div className="flex items-center gap-2 text-sm font-medium opacity-90">
                <CloudSun className="h-4 w-4" />
                CWA 開放資料農事天氣
              </div>
              <h1 className="mt-3 max-w-2xl text-3xl font-semibold tracking-normal md:text-4xl">
                用一週天氣風險安排田間工作。
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/85">
                選擇地區與作物，快速掌握高溫、降雨、風速與本週農事建議。
              </p>
            </div>

            <div className="rounded-md border border-stone-200 bg-white p-4 shadow-sm">
              <div className="grid gap-3 sm:grid-cols-3">
                <Select label="縣市" value={city} onChange={(event) => handleCity(event.target.value)}>
                  {(locations.data?.locations ?? [{ city: "臺北市", districts: [] }]).map((item) => (
                    <option key={item.city} value={item.city}>
                      {item.city}
                    </option>
                  ))}
                </Select>
                <Select label="行政區" value={district} onChange={(event) => setDistrict(event.target.value)}>
                  {districts.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </Select>
                <CropSelector value={crop} onChange={setCrop} />
              </div>
              <Button className="mt-4 w-full" onClick={refreshAll}>
                <RefreshCw className="h-4 w-4" />
                重新整理
              </Button>
            </div>
          </section>

          {(weather.error || advisory.error || locations.error) && (
            <AlertBanner level="warning" title="API 連線異常" message="部分資料暫時無法同步，系統會保留目前可用內容。" />
          )}

          <WeatherMapShell city={city} district={district} crop={crop} advisory={advisory.data} onLocationSelect={handleLocationSelect} />

          <section className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
            <CurrentWeatherCard day={firstDay} loading={weather.loading} source={weather.data?.source} />
            <FarmerAdviceCard advisory={advisory.data} loading={advisory.loading} />
          </section>

          {advisory.data?.alerts.map((alert) => (
            <AlertBanner key={`${alert.type}-${alert.title}`} level={alert.level} title={alert.title} message={alert.message} />
          ))}

          <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <WeeklyForecastCard days={weather.data?.days ?? []} loading={weather.loading} />
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-stone-700">
                <AlertTriangle className="h-4 w-4 text-sun" />
                農事建議
              </div>
              {(advisory.data?.suggestions ?? []).map((item) => (
                <WorkSuggestionCard key={item} text={item} />
              ))}
            </div>
          </section>
        </div>
      </div>
    </PageContainer>
  );
}

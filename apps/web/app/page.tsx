"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CloudRain, CloudSun, MapPin, RefreshCw, ThermometerSun, Wind } from "lucide-react";
import { AlertBanner } from "@/components/farmer/AlertBanner";
import { CropSelector } from "@/components/farmer/CropSelector";
import { FarmerAdviceCard } from "@/components/farmer/FarmerAdviceCard";
import { PageContainer } from "@/components/layout/PageContainer";
import { SummarySidebar } from "@/components/layout/SummarySidebar";
import { WeatherMapShell } from "@/components/map/WeatherMapShell";
import { Button } from "@/components/ui/button";
import { CurrentWeatherCard } from "@/components/weather/CurrentWeatherCard";
import { useWeeklyAdvisory } from "@/features/advisory/hooks";
import { useLocations } from "@/features/location/hooks";
import { useSystemHealth } from "@/features/system/hooks";
import { getWeatherMapConfig } from "@/features/weather-map/config";
import { useStations, useWeeklyWeather } from "@/features/weather/hooks";
import { tempToColor, tempToGradient } from "@/lib/utils";
import { isDemoMode } from "@/lib/weather-api";
import { currentForecastDays, currentStations, currentWeatherDay, formatSourceTime, getAdviceState, getStationState, getWeatherState } from "@/lib/weather-state";

const FALLBACK_CITY = "臺北市";
const FALLBACK_DISTRICT = "北投區";

export default function HomePage() {
  const demoMode = isDemoMode();
  const [city, setCity] = useState(FALLBACK_CITY);
  const [district, setDistrict] = useState(FALLBACK_DISTRICT);
  const [crop, setCrop] = useState("水稻");
  const weather = useWeeklyWeather(city, district);
  const advisory = useWeeklyAdvisory(city, district, crop);
  const locations = useLocations();
  const health = useSystemHealth();
  const stations = useStations();
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  const weatherState = getWeatherState({...weather, city, district, now});
  const adviceState = getAdviceState({weather: weatherState, ...advisory});
  const stationState = getStationState({...stations, now});
  const mapStations = useMemo(() => stations.data && ({...stations.data, stations: stationState.showData ? currentStations(stations.data.stations, now) : []}), [stations.data, stationState.showData, now]);

  const mapConfig = useMemo(() => getWeatherMapConfig(), []);
  const mapMode = mapConfig.provider === "windy" && mapConfig.windyApiKey ? "Windy" : "Leaflet 模擬";

  const districtsForCity = useCallback((selectedCity: string) => {
    const observedTowns = Array.from(new Set(stations.data?.stations
      .filter(station => station.countyName === selectedCity && station.townName)
      .map(station => station.townName) ?? [])).sort();
    if (observedTowns.length) return observedTowns;
    const configuredTowns = locations.data?.locations.find(location => location.city === selectedCity)?.districts;
    return configuredTowns?.length ? configuredTowns : selectedCity === FALLBACK_CITY ? [FALLBACK_DISTRICT] : [];
  }, [stations.data, locations.data]);

  // Build county/town lists from station data
  const { countyList, townList } = useMemo(() => {
    if (!stations.data?.stations.length) {
      const locCounties = locations.data?.locations ?? [];
      return {
        countyList: locCounties.length > 0
          ? locCounties.map((l) => ({ name: l.city, count: 0 }))
          : [{ name: FALLBACK_CITY, count: 0 }],
        townList: districtsForCity(city),
      };
    }

    const countyMap = new Map<string, Set<string>>();
    for (const st of stations.data.stations) {
      if (!st.countyName) continue;
      if (!countyMap.has(st.countyName)) {
        countyMap.set(st.countyName, new Set());
      }
      if (st.townName) {
        countyMap.get(st.countyName)!.add(st.townName);
      }
    }

    const sorted = Array.from(countyMap.entries())
      .map(([name, towns]) => ({ name, count: towns.size }))
      .sort((a, b) => b.count - a.count);

    return {
      countyList: sorted,
      townList: districtsForCity(city),
    };
  }, [stations.data, city, locations.data, districtsForCity]);

  function handleCity(value: string) {
    setCity(value);
    setDistrict(districtsForCity(value)[0] ?? "");
  }

  const handleLocationSelect = useCallback(
    (selectedCity: string, selectedDistrict?: string) => {
      setCity(selectedCity);
      const towns = districtsForCity(selectedCity);

      if (selectedDistrict && towns.includes(selectedDistrict)) {
        setDistrict(selectedDistrict);
      } else {
        setDistrict(towns[0] ?? "");
      }
    },
    [districtsForCity],
  );

  function refreshAll() {
    weather.reload();
    advisory.reload();
    locations.reload();
    health.reload();
    stations.reload();
  }

  const allDays = weatherState.showData ? weatherState.kind === "demo" ? weather.data?.days ?? [] : currentForecastDays(weather.data?.days ?? [], now) : [];
  const firstDay = weatherState.kind === "demo" ? allDays[0] : currentWeatherDay(allDays, now);
  const isLoading = weather.loading || advisory.loading;

  const themeColor = useMemo(() => {
    const temp = firstDay?.maxTemp ?? firstDay?.minTemp ?? 26;
    return tempToColor(temp);
  }, [firstDay]);

  const themeGradient = useMemo(() => {
    const temp = firstDay?.maxTemp ?? firstDay?.minTemp ?? 26;
    return tempToGradient(temp);
  }, [firstDay]);

  return (
    <PageContainer>
      <div className="grid gap-6 lg:grid-cols-[17rem_minmax(0,1fr)]">
        {/* ---------- Sidebar ---------- */}
        <aside className="hidden lg:block">
          <div className="lg:sticky lg:top-24 animate-fade-in">
            <SummarySidebar
              city={city}
              district={district}
              crop={crop}
              day={firstDay}
              days={allDays}
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
              themeColor={themeColor}
              weatherState={weatherState}
              adviceState={adviceState}
            />
          </div>
        </aside>

        {/* ---------- Main ---------- */}
        <div className="min-w-0 space-y-6 animate-slide-up">
          {/* Hero + Controls */}
          <section className="rounded-xl p-6 text-white shadow-elevated md:p-8" style={{ background: themeGradient }}>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-lg">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
                  <CloudSun className="h-3.5 w-3.5" />
                  {demoMode ? "示範資料 · 非即時天氣" : "CWA 開放資料 · 農事天氣"}
                </div>
                <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
                  {demoMode ? "農事天氣示範，" : "一週天氣風險，"}<br />
                  <span className="text-sun-light">{demoMode ? "先體驗畫面操作" : "田間工作一手掌握"}</span>
                </h1>
                <p className="mt-3 text-sm leading-relaxed text-white/75">
                  {demoMode ? "切換地區與作物，操作固定範例；不代表即時天氣或實際農事建議。" : "選擇地區與作物，即時取得溫度、降雨、風速預報與農事提醒建議。"}
                </p>

                {firstDay && (
                  <div className="mt-5 flex flex-wrap gap-3">
                    <div className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-sm backdrop-blur">
                      <ThermometerSun className="h-4 w-4 text-sun-light" />
                      {firstDay.minTemp ?? "--"}° / {firstDay.maxTemp ?? "--"}°
                    </div>
                    <div className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-sm backdrop-blur">
                      <CloudRain className="h-4 w-4 text-sky-light" />
                      降雨 {firstDay.rainProbability != null ? `${firstDay.rainProbability}%` : "--"}
                    </div>
                    <div className="flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-sm backdrop-blur">
                      <Wind className="h-4 w-4 text-white/60" />
                      {firstDay.windDescription ?? "--"}
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-xl bg-white/10 p-4 backdrop-blur lg:min-w-[340px]">
                <div className="mb-3 flex items-center gap-1.5 text-xs font-medium text-white/70">
                  <MapPin className="h-3.5 w-3.5" />
                  選擇地區
                </div>
                <div className="grid gap-2.5 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                  <select
                    aria-label="縣市"
                    value={city}
                    onChange={(e) => handleCity(e.target.value)}
                    className="h-10 rounded-lg border border-white/20 bg-white/10 px-3 text-sm text-white backdrop-blur [&>option]:text-stone-900"
                  >
                    {countyList.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}{c.count > 0 ? ` (${c.count})` : ""}
                      </option>
                    ))}
                  </select>
                  <select
                    aria-label="行政區"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="h-10 rounded-lg border border-white/20 bg-white/10 px-3 text-sm text-white backdrop-blur [&>option]:text-stone-900"
                  >
                    {townList.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <CropSelector value={crop} onChange={setCrop} className="h-10 rounded-lg border border-white/20 bg-white/10 text-sm text-white backdrop-blur [&>option]:text-stone-900" />
                </div>
                <Button
                  onClick={refreshAll}
                  className="mt-3 w-full bg-white/15 text-white hover:bg-white/25 border border-white/20"
                >
                  <RefreshCw className="h-4 w-4" />
                  重新整理
                </Button>
              </div>
            </div>
          </section>

          {/* Mobile sidebar */}
          <section className="lg:hidden">
            <SummarySidebar
              city={city}
              district={district}
              crop={crop}
              day={firstDay}
              days={allDays}
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
              themeColor={themeColor}
              weatherState={weatherState}
              adviceState={adviceState}
            />
          </section>

          {/* Error banner */}
          {weatherState.kind !== "ready" && weatherState.kind !== "loading" && <AlertBanner level="warning" title={weatherState.title} message={weatherState.message} />}
          {adviceState.kind === "error" && weatherState.showData && <AlertBanner level="warning" title="農事提醒載入失敗" message={adviceState.message} />}
          {stationState.kind !== "ready" && stationState.kind !== "loading" && <AlertBanner level="warning" title={`測站：${stationState.title}`} message={`${stationState.message} 來源時間：${formatSourceTime(stations.data?.updatedAt)}`} />}

          {/* Map */}
          <section className="animate-fade-in rounded-xl shadow-map overflow-hidden">
            <WeatherMapShell city={city} district={district} crop={crop} advisory={adviceState.showData ? advisory.data : undefined} adviceState={adviceState} stations={mapStations} stationState={stationState} onLocationSelect={handleLocationSelect} />
          </section>

          {/* Alert banners */}
          {adviceState.kind === "ready" && advisory.data?.alerts.map((alert) => (
            <AlertBanner key={`${alert.type}-${alert.title}`} level={alert.level} title={alert.title} message={alert.message} />
          ))}

          {/* Today + Advice */}
          <section className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
            <CurrentWeatherCard day={firstDay} loading={weather.loading} source={weather.data?.source} state={weatherState} />
            <FarmerAdviceCard advisory={advisory.data} loading={advisory.loading} state={adviceState} />
          </section>
        </div>
      </div>
    </PageContainer>
  );
}

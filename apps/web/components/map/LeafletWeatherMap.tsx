"use client";

import { useEffect, useRef, useState } from "react";
import { WeeklyAdvisoryResponse } from "@/features/advisory/types";
import type { WeatherMapConfig, WeatherOverlay } from "@/features/weather-map/types";
import { useWeatherMapState } from "@/features/weather-map/useWeatherMapState";
import { useStations } from "@/features/weather/hooks";
import type { StationsResponse, WeatherStation } from "@/features/weather/types";
import { MapFloatingAdvice } from "./MapFloatingAdvice";
import { MapLayerControl } from "./MapLayerControl";
import { MapLegend } from "./MapLegend";
import { MapTimeline } from "./MapTimeline";

type LeafletModule = typeof import("leaflet");
type LeafletMap = import("leaflet").Map;
type LeafletLayerGroup = import("leaflet").LayerGroup;
type LeafletMouseEvent = import("leaflet").LeafletMouseEvent;

type Props = {
  config: WeatherMapConfig;
  city: string;
  district?: string;
  crop?: string;
  advisory?: WeeklyAdvisoryResponse;
  stations?: StationsResponse;
  onLocationSelect?: (city: string, district?: string) => void;
};

type MapPoint = {
  label: string;
  city: string;
  district: string;
  lat: number;
  lon: number;
};

const TAIWAN_POINTS: MapPoint[] = [
  { label: "北部", city: "臺北市", district: "北投區", lat: 25.033, lon: 121.5654 },
  { label: "中部", city: "臺中市", district: "新社區", lat: 24.1477, lon: 120.6736 },
  { label: "南部", city: "臺南市", district: "新化區", lat: 22.9999, lon: 120.227 },
  { label: "東部", city: "花蓮縣", district: "壽豐鄉", lat: 23.9872, lon: 121.6015 },
  { label: "高屏", city: "高雄市", district: "美濃區", lat: 22.6273, lon: 120.3014 },
];

export function LeafletWeatherMap({ config, city, district, crop, advisory, stations: stationsProp, onLocationSelect }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const leafletRef = useRef<LeafletModule | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const overlayRef = useRef<LeafletLayerGroup | null>(null);
  const stationLayerRef = useRef<LeafletLayerGroup | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const map = useWeatherMapState(config, city, district);
  const stationsFromHook = useStations();
  const stationsData = stationsProp ?? stationsFromHook.data;

  useEffect(() => {
    let disposed = false;

    async function initMap() {
      if (!containerRef.current || mapRef.current) return;

      try {
        const L = await import("leaflet");
        if (disposed || !containerRef.current) return;

        leafletRef.current = L;
        const leafletMap = L.map(containerRef.current, {
          center: [config.defaultLat, config.defaultLon],
          zoom: config.defaultZoom,
          zoomControl: true,
          scrollWheelZoom: true,
        });

        leafletMap.createPane("weatherOverlayPane");
        leafletMap.createPane("weatherStationPane");
        const overlayPane = leafletMap.getPane("weatherOverlayPane");
        const stationPane = leafletMap.getPane("weatherStationPane");
        if (overlayPane) {
          overlayPane.style.zIndex = "430";
          overlayPane.style.pointerEvents = "auto";
        }
        if (stationPane) {
          stationPane.style.zIndex = "650";
          stationPane.style.pointerEvents = "auto";
        }

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 18,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(leafletMap);

        leafletMap.on("click", (event: LeafletMouseEvent) => {
          const nearest = findNearestPoint(event.latlng.lat, event.latlng.lng);
          onLocationSelect?.(nearest.city, nearest.district);
        });

        mapRef.current = leafletMap;
        overlayRef.current = L.layerGroup().addTo(leafletMap);
        stationLayerRef.current = L.layerGroup().addTo(leafletMap);
        requestAnimationFrame(() => leafletMap.invalidateSize());
        setMapReady(true);
      } catch (error) {
        console.error("Failed to initialize Leaflet map", error);
        setMapError("Leaflet 地圖載入失敗，請確認前端套件與瀏覽器環境。");
      }
    }

    initMap();

    return () => {
      disposed = true;
      overlayRef.current?.clearLayers();
      stationLayerRef.current?.clearLayers();
      mapRef.current?.remove();
      mapRef.current = null;
      overlayRef.current = null;
      stationLayerRef.current = null;
      leafletRef.current = null;
    };
  }, [config.defaultLat, config.defaultLon, config.defaultZoom, onLocationSelect]);

  useEffect(() => {
    if (!mapReady || !leafletRef.current || !overlayRef.current) return;

    drawMockOverlay(leafletRef.current, overlayRef.current, map.overlay, map.selectedTimeIndex, city, onLocationSelect);
  }, [city, map.overlay, map.selectedTimeIndex, mapReady, onLocationSelect]);

  useEffect(() => {
    if (!mapReady || !leafletRef.current || !stationLayerRef.current) return;

    drawStationMarkers(leafletRef.current, stationLayerRef.current, stationsData?.stations ?? [], city, onLocationSelect);
  }, [city, mapReady, stationsData, onLocationSelect]);

  useEffect(() => {
    if (!mapReady || !mapRef.current) return;

    mapRef.current.setView([map.location.lat, map.location.lon], Math.max(config.defaultZoom, 7), {
      animate: true,
      duration: 0.35,
    });
  }, [config.defaultZoom, map.location.lat, map.location.lon, mapReady]);

  return (
    <section className="relative overflow-hidden rounded-md border border-stone-200 bg-stone-950 shadow-sm">
      <div ref={containerRef} className="h-[520px] min-h-[70vh] w-full" aria-label="台灣天氣地圖" />

      {!mapReady && !mapError && (
        <div className="absolute inset-0 grid place-items-center bg-stone-950 text-sm font-medium text-white">正在載入地圖...</div>
      )}

      {mapError && (
        <div className="absolute inset-0 grid place-items-center bg-stone-950 p-6 text-center text-sm font-medium text-white">
          {mapError}
        </div>
      )}

      <div className="absolute left-4 top-4 max-w-[calc(100%-2rem)] rounded-md bg-white/95 px-4 py-3 text-stone-900 shadow-sm backdrop-blur">
        <p className="text-xs font-medium text-stone-500">{map.currentTimeLabel} 模擬天氣圖層</p>
        <h2 className="text-lg font-semibold">{city}{district ? `, ${district}` : ""}</h2>
        <p className="mt-1 text-xs text-stone-500">點擊地圖區域或測站可切換左側摘要與預報資料</p>
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
    </section>
  );
}

function drawStationMarkers(
  L: LeafletModule,
  group: LeafletLayerGroup,
  stations: WeatherStation[],
  selectedCity: string,
  onLocationSelect?: (city: string, district?: string) => void,
) {
  group.clearLayers();

  for (const station of stations) {
    if (!Number.isFinite(station.lat) || !Number.isFinite(station.lon)) continue;

    const hasTemperature = station.airTemperature != null;
    const isSelectedCity = station.countyName === selectedCity;
    const color = hasTemperature ? tempColor(station.airTemperature as number) : "#64748b";
    const marker = L.circleMarker([station.lat, station.lon], {
      radius: isSelectedCity ? 7 : 5,
      color: isSelectedCity ? "#14532d" : color,
      fillColor: color,
      fillOpacity: hasTemperature ? 0.9 : 0.55,
      weight: isSelectedCity ? 2.5 : 1.5,
      pane: "weatherStationPane",
    });

    const tempText = hasTemperature ? `${station.airTemperature}°C` : "無溫度資料";
    const precipText = station.precipitation != null ? `${station.precipitation}mm` : "-";
    const humidText = station.relativeHumidity != null ? `${station.relativeHumidity}%` : "-";
    const windText = station.windSpeed != null ? `${station.windSpeed}m/s` : "-";
    const pressureText = station.airPressure != null ? `${station.airPressure}hPa` : "-";
    const obsTime = station.obsTime ? station.obsTime.replace("T", " ").slice(0, 16) : "-";
    const weatherText = station.weather || "-";

    const tooltipHtml = `<b>${escapeHtml(station.stationName)}</b><br/>${escapeHtml(tempText)} / ${escapeHtml(humidText)}<br/>雨 ${escapeHtml(precipText)} / 風 ${escapeHtml(windText)}`;

    marker.bindTooltip(tooltipHtml, {
      direction: "top",
      offset: [0, -8],
      sticky: true,
    });

    marker.on("click", (event: LeafletMouseEvent) => {
      L.DomEvent.stopPropagation(event);

      const popupHtml = `
        <div style="min-width:200px;font-size:13px;line-height:1.7">
          <b style="font-size:15px">${escapeHtml(station.stationName)}</b>
          <div style="color:#666;margin-bottom:6px">${escapeHtml(station.countyName)} ${escapeHtml(station.townName)}</div>
          <div><b>溫度</b> ${escapeHtml(tempText)} &nbsp; <b>濕度</b> ${escapeHtml(humidText)}</div>
          <div><b>天氣</b> ${escapeHtml(weatherText)}</div>
          <div><b>雨量</b> ${escapeHtml(precipText)} &nbsp; <b>風速</b> ${escapeHtml(windText)}</div>
          <div><b>氣壓</b> ${escapeHtml(pressureText)}</div>
          <div style="color:#999;margin-top:4px;font-size:11px">觀測時間 ${escapeHtml(obsTime)}</div>
        </div>
      `;

      marker.unbindPopup();
      marker.bindPopup(popupHtml, { maxWidth: 280 }).openPopup();

      onLocationSelect?.(station.countyName, station.townName);
    });

    group.addLayer(marker);
    marker.bringToFront();
  }
}

function tempColor(temp: number): string {
  if (temp >= 35) return "#b91c1c";
  if (temp >= 31) return "#dc2626";
  if (temp >= 28) return "#ea580c";
  if (temp >= 24) return "#f59e0b";
  if (temp >= 20) return "#84cc16";
  if (temp >= 16) return "#22c55e";
  if (temp >= 12) return "#06b6d4";
  return "#3b82f6";
}

function drawMockOverlay(
  L: LeafletModule,
  group: LeafletLayerGroup,
  overlay: WeatherOverlay,
  timeIndex: number,
  selectedCity: string,
  onLocationSelect?: (city: string, district?: string) => void,
) {
  group.clearLayers();

  const offset = timeIndex * 0.04;
  TAIWAN_POINTS.forEach((point) => {
    L.circleMarker([point.lat, point.lon], {
      radius: point.city === selectedCity ? 9 : 6,
      color: point.city === selectedCity ? "#14532d" : "#334155",
      fillColor: point.city === selectedCity ? "#22c55e" : "#ffffff",
      fillOpacity: 0.95,
      weight: 2,
      pane: "weatherOverlayPane",
    })
      .bindTooltip(`${point.city} ${point.district}`, { permanent: false })
      .on("click", (event) => {
        L.DomEvent.stopPropagation(event);
        onLocationSelect?.(point.city, point.district);
      })
      .addTo(group);
  });

  if (overlay === "rain") {
    TAIWAN_POINTS.forEach((point, index) => {
      L.circle([point.lat + offset, point.lon - offset], {
        radius: 28000 + index * 6000,
        color: "#2563eb",
        fillColor: index % 2 === 0 ? "#38bdf8" : "#6366f1",
        fillOpacity: 0.28,
        opacity: 0.7,
        weight: point.city === selectedCity ? 4 : 2,
        pane: "weatherOverlayPane",
      })
        .bindTooltip(`${point.label} 降雨機率 ${45 + index * 8}%`)
        .on("click", (event) => {
          L.DomEvent.stopPropagation(event);
          onLocationSelect?.(point.city, point.district);
        })
        .addTo(group);
    });
    return;
  }

  if (overlay === "temperature") {
    TAIWAN_POINTS.forEach((point, index) => {
      L.circle([point.lat, point.lon], {
        radius: 24000 + index * 5000,
        color: "#ea580c",
        fillColor: index > 2 ? "#ef4444" : "#facc15",
        fillOpacity: 0.32,
        opacity: 0.75,
        weight: point.city === selectedCity ? 4 : 2,
        pane: "weatherOverlayPane",
      })
        .bindTooltip(`${point.label} 體感溫度 ${30 + index} °C`)
        .on("click", (event) => {
          L.DomEvent.stopPropagation(event);
          onLocationSelect?.(point.city, point.district);
        })
        .addTo(group);
    });
    return;
  }

  TAIWAN_POINTS.forEach((point, index) => {
    const start: [number, number] = [point.lat - 0.12, point.lon - 0.2];
    const end: [number, number] = [point.lat + 0.12 + offset, point.lon + 0.24 + offset];
    L.polyline([start, end], {
      color: point.city === selectedCity ? "#047857" : "#0f766e",
      opacity: 0.85,
      weight: point.city === selectedCity ? 7 : 4 + index,
      pane: "weatherOverlayPane",
    })
      .bindTooltip(`${point.label} 風速 ${12 + index * 3} km/h`)
      .on("click", (event) => {
        L.DomEvent.stopPropagation(event);
        onLocationSelect?.(point.city, point.district);
      })
      .addTo(group);
    L.circleMarker(end, {
      radius: 5,
      color: "#0f766e",
      fillColor: "#ccfbf1",
      fillOpacity: 0.9,
      weight: 2,
      pane: "weatherOverlayPane",
    }).addTo(group);
  });
}

function findNearestPoint(lat: number, lon: number) {
  return TAIWAN_POINTS.reduce((nearest, point) => {
    const currentDistance = distanceSquared(lat, lon, point.lat, point.lon);
    const nearestDistance = distanceSquared(lat, lon, nearest.lat, nearest.lon);
    return currentDistance < nearestDistance ? point : nearest;
  }, TAIWAN_POINTS[0]);
}

function distanceSquared(latA: number, lonA: number, latB: number, lonB: number) {
  return (latA - latB) ** 2 + (lonA - lonB) ** 2;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

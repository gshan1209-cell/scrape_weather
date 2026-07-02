"use client";

import { useEffect, useRef, useState } from "react";
import { WeeklyAdvisoryResponse } from "@/features/advisory/types";
import type { WeatherMapConfig, WeatherOverlay } from "@/features/weather-map/types";
import { useWeatherMapState } from "@/features/weather-map/useWeatherMapState";
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

export function LeafletWeatherMap({ config, city, district, crop, advisory, onLocationSelect }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const leafletRef = useRef<LeafletModule | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const overlayRef = useRef<LeafletLayerGroup | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const map = useWeatherMapState(config, city, district);

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
      mapRef.current?.remove();
      mapRef.current = null;
      overlayRef.current = null;
      leafletRef.current = null;
    };
  }, [config.defaultLat, config.defaultLon, config.defaultZoom, onLocationSelect]);

  useEffect(() => {
    if (!mapReady || !leafletRef.current || !overlayRef.current) return;

    drawMockOverlay(leafletRef.current, overlayRef.current, map.overlay, map.selectedTimeIndex, city, onLocationSelect);
  }, [city, map.overlay, map.selectedTimeIndex, mapReady, onLocationSelect]);

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
        <p className="mt-1 text-xs text-stone-500">點擊地圖區域可切換左側摘要與預報資料</p>
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

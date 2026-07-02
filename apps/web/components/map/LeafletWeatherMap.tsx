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

type Props = {
  config: WeatherMapConfig;
  city: string;
  district?: string;
  crop?: string;
  advisory?: WeeklyAdvisoryResponse;
};

const TAIWAN_POINTS = [
  { name: "北部", lat: 25.033, lon: 121.5654 },
  { name: "中部", lat: 24.1477, lon: 120.6736 },
  { name: "南部", lat: 22.9999, lon: 120.227 },
  { name: "東部", lat: 23.9872, lon: 121.6015 },
  { name: "屏東", lat: 22.5519, lon: 120.5488 },
];

export function LeafletWeatherMap({ config, city, district, crop, advisory }: Props) {
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

        L.circleMarker([map.location.lat, map.location.lon], {
          radius: 8,
          color: "#14532d",
          fillColor: "#22c55e",
          fillOpacity: 0.9,
          weight: 2,
        })
          .bindTooltip(`${map.location.city}${map.location.district ? ` ${map.location.district}` : ""}`, { permanent: false })
          .addTo(leafletMap);

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
  }, [config.defaultLat, config.defaultLon, config.defaultZoom, map.location.city, map.location.district, map.location.lat, map.location.lon]);

  useEffect(() => {
    if (!mapReady || !leafletRef.current || !overlayRef.current) return;

    drawMockOverlay(leafletRef.current, overlayRef.current, map.overlay, map.selectedTimeIndex);
  }, [map.overlay, map.selectedTimeIndex, mapReady]);

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

function drawMockOverlay(L: LeafletModule, group: LeafletLayerGroup, overlay: WeatherOverlay, timeIndex: number) {
  group.clearLayers();

  const offset = timeIndex * 0.04;
  if (overlay === "rain") {
    TAIWAN_POINTS.forEach((point, index) => {
      L.circle([point.lat + offset, point.lon - offset], {
        radius: 28000 + index * 6000,
        color: "#2563eb",
        fillColor: index % 2 === 0 ? "#38bdf8" : "#6366f1",
        fillOpacity: 0.28,
        opacity: 0.7,
        weight: 2,
      }).bindTooltip(`${point.name} 降雨機率 ${45 + index * 8}%`).addTo(group);
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
        weight: 2,
      }).bindTooltip(`${point.name} 體感溫度 ${30 + index} C`).addTo(group);
    });
    return;
  }

  TAIWAN_POINTS.forEach((point, index) => {
    const start: [number, number] = [point.lat - 0.12, point.lon - 0.2];
    const end: [number, number] = [point.lat + 0.12 + offset, point.lon + 0.24 + offset];
    L.polyline([start, end], {
      color: "#0f766e",
      opacity: 0.85,
      weight: 4 + index,
    }).bindTooltip(`${point.name} 風速 ${12 + index * 3} km/h`).addTo(group);
    L.circleMarker(end, {
      radius: 5,
      color: "#0f766e",
      fillColor: "#ccfbf1",
      fillOpacity: 0.9,
      weight: 2,
    }).addTo(group);
  });
}

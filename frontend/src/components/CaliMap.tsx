import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ComunaMetric } from "../types";
import { formatCOPCompact } from "../utils/formatters";

interface CaliMapProps {
  comunas: ComunaMetric[];
  selectedCommune: ComunaMetric | null;
  onSelect: (c: ComunaMetric) => void;
  filterRisk: string;
}

const CALI_CENTER: [number, number] = [3.4516, -76.5320];

export default function CaliMap({
  comunas,
  selectedCommune,
  onSelect,
  filterRisk,
}: CaliMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [mapLoaded, setMapLoaded] = useState(false);

  // Inicialización del Mapa Leaflet
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: CALI_CENTER,
      zoom: 12,
      minZoom: 10,
      maxZoom: 17,
      zoomControl: true,
      attributionControl: true,
    });

    // Capa base estándar de OpenStreetMap (100% gratuita, sin API Key)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = layerGroup;
    mapInstanceRef.current = map;
    setMapLoaded(true);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Actualización de marcadores cuando cambian las comunas, el filtro o la selección
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    comunas.forEach((c) => {
      if (filterRisk !== "todos" && c.riskLevel !== filterRisk) {
        return;
      }

      const isSelected = selectedCommune?.id === c.id;

      // Colores según nivel de riesgo
      const color =
        c.riskLevel === "alto"
          ? "#D92D20"
          : c.riskLevel === "medio"
            ? "#F59E0B"
            : "#00875A";

      const fillColor =
        c.riskLevel === "alto"
          ? "#FEE2E2"
          : c.riskLevel === "medio"
            ? "#FEF3C7"
            : "#D1FAE5";

      // Círculo interactivo que representa la zona geográfica de la comuna
      const circle = L.circleMarker([c.lat, c.lng], {
        radius: isSelected ? 18 : 13,
        color: isSelected ? "#003366" : color,
        weight: isSelected ? 3.5 : 2,
        fillColor: isSelected ? color : fillColor,
        fillOpacity: isSelected ? 0.9 : 0.75,
      });

      // Contenido del popup interactivo
      const popupContent = `
        <div style="font-family: 'Inter', sans-serif; min-width: 180px; padding: 2px;">
          <div style="font-weight: 800; color: #003366; font-size: 13px; margin-bottom: 3px;">
            ${c.nombre}
          </div>
          <div style="font-size: 11px; color: #64748B; margin-bottom: 6px;">
            Tipo: ${c.tipo === "urbana" ? "Comuna Urbana" : "Corregimiento Rural"}
          </div>
          <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 6px; font-size: 11px; line-height: 1.4;">
            <div><strong>Inversión:</strong> ${formatCOPCompact(c.totalInvertido)}</div>
            <div><strong>Contratos:</strong> ${c.totalContratos}</div>
            <div><strong>Alertas:</strong> <span style="color: ${color}; font-weight: bold;">${c.banderas}</span></div>
          </div>
          <button id="btn-select-${c.id}" style="margin-top: 8px; width: 100%; background: #003366; color: white; border: none; border-radius: 4px; padding: 4px 8px; font-size: 11px; font-weight: bold; cursor: pointer;">
            Ver Perfil de Inversión
          </button>
        </div>
      `;

      circle.bindPopup(popupContent);

      circle.on("popupopen", () => {
        const btn = document.getElementById(`btn-select-${c.id}`);
        if (btn) {
          btn.onclick = () => onSelect(c);
        }
      });

      // Tooltip flotante al pasar el mouse
      circle.bindTooltip(
        `<strong>${c.nombre}</strong><br/>${formatCOPCompact(c.totalInvertido)} (${c.totalContratos} contr.)`,
        { direction: "top", offset: [0, -10], opacity: 0.9 }
      );

      circle.on("click", () => {
        onSelect(c);
      });

      markersLayerRef.current?.addLayer(circle);
    });
  }, [comunas, filterRisk, selectedCommune, onSelect, mapLoaded]);

  // Si se selecciona una comuna desde afuera, centrar mapa suavemente
  useEffect(() => {
    if (selectedCommune && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([selectedCommune.lat, selectedCommune.lng], 13, {
        duration: 1.2,
      });
    }
  }, [selectedCommune]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
      {/* Encabezado del Mapa */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between gap-4 flex-wrap bg-white">
        <div>
          <h2 className="font-display font-800 text-[16px] text-[#003366] flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
              <line x1="8" y1="2" x2="8" y2="18" />
              <line x1="16" y1="6" x2="16" y2="22" />
            </svg>
            Mapa Territorial de Santiago de Cali (Leaflet)
          </h2>
          <p className="text-[12px] text-slate-400 mt-0.5">
            22 Comunas y Corregimientos · Centrado en lat: 3.4516, lng: -76.5320
          </p>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-600 flex-wrap">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-3 h-3 rounded-full bg-[#D1FAE5] border-2 border-[#00875A] inline-block"></span> Sin alertas
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-3 h-3 rounded-full bg-[#FEF3C7] border-2 border-[#F59E0B] inline-block"></span> Alerta media
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-3 h-3 rounded-full bg-[#FEE2E2] border-2 border-[#D92D20] inline-block"></span> Alerta alta
          </span>
        </div>
      </div>

      {/* Contenedor del mapa Leaflet */}
      <div className="relative w-full h-[460px] bg-slate-100">
        <div ref={mapContainerRef} className="w-full h-full z-0" style={{ minHeight: "460px" }} />

        {/* Botón flotante para resetear vista a Cali completo */}
        <button
          onClick={() => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.flyTo(CALI_CENTER, 12, { duration: 0.8 });
            }
          }}
          className="absolute bottom-4 right-4 z-[400] bg-white/95 backdrop-blur-xs text-[#003366] text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-md border border-slate-200 hover:bg-white transition-all flex items-center gap-1.5"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
          Restablecer Vista Cali
        </button>
      </div>
    </div>
  );
}

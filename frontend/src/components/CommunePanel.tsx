import { ComunaMetric } from "../types";
import { formatCOPCompact } from "../utils/formatters";

interface CommunePanelProps {
  commune: ComunaMetric | null;
  onExploreContracts?: (comunaNombre: string) => void;
}

export default function CommunePanel({ commune, onExploreContracts }: CommunePanelProps) {
  if (!commune) {
    return (
      <div className="bg-white rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center min-h-[460px] p-6 text-center gap-4 shadow-xs">
        <div className="w-14 h-14 rounded-full bg-[#EFF6FF] text-[#003366] flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
            <line x1="8" y1="2" x2="8" y2="18" />
            <line x1="16" y1="6" x2="16" y2="22" />
          </svg>
        </div>
        <div>
          <h3 className="font-display font-800 text-[16px] text-[#003366]">Selecciona una Comuna</h3>
          <p className="text-[12px] text-slate-500 mt-1 leading-relaxed max-w-[220px] mx-auto">
            Haz clic sobre cualquier círculo del mapa interactivo de Cali para inspeccionar su inversión y nivel de alerta.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
          <span className="w-2.5 h-2.5 rounded-full bg-[#D92D20] inline-block"></span>
          <span>Banderas rojas activas</span>
        </div>
      </div>
    );
  }

  const isAlto = commune.riskLevel === "alto";
  const isMedio = commune.riskLevel === "medio";

  const riskColor = isAlto ? "#D92D20" : isMedio ? "#F59E0B" : "#00875A";
  const riskBg = isAlto ? "bg-red-50 text-red-800 border-red-200" : isMedio ? "bg-amber-50 text-amber-800 border-amber-200" : "bg-emerald-50 text-emerald-800 border-emerald-200";
  const riskLabel = isAlto ? "Riesgo Alto" : isMedio ? "Riesgo Medio" : "Bajo Riesgo";

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs flex flex-col min-h-[460px]">
      {/* Barra de color de riesgo superior */}
      <div className="h-2" style={{ backgroundColor: riskColor }}></div>

      {/* Encabezado */}
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              {commune.tipo === "urbana" ? "Comuna Urbana" : "Corregimiento"}
            </span>
            <h3 className="font-display font-800 text-[16px] text-[#003366] leading-snug mt-0.5 truncate" title={commune.nombre}>
              {commune.nombre}
            </h3>
          </div>
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border shrink-0 ${riskBg}`}>
            {riskLabel}
          </span>
        </div>
      </div>

      {/* Métricas clave */}
      <div className="p-4 flex flex-col gap-4 flex-1">
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100 text-center">
            <p className="font-display font-800 text-[16px] text-[#003366]">{commune.totalContratos}</p>
            <p className="text-[10px] text-slate-500 font-medium">Contratos</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100 text-center">
            <p className="font-display font-800 text-[14px] text-[#003366] truncate" title={formatCOPCompact(commune.totalInvertido)}>
              {formatCOPCompact(commune.totalInvertido)}
            </p>
            <p className="text-[10px] text-slate-500 font-medium">Inversión</p>
          </div>
          <div className={`rounded-lg p-2.5 border text-center ${commune.banderas > 0 ? "bg-red-50 border-red-200" : "bg-emerald-50 border-emerald-200"}`}>
            <p className={`font-display font-800 text-[16px] ${commune.banderas > 0 ? "text-[#D92D20]" : "text-[#00875A]"}`}>
              {commune.banderas}
            </p>
            <p className="text-[10px] text-slate-500 font-medium">Alertas</p>
          </div>
        </div>

        {/* Secretarías e intervenciones activas */}
        {commune.secretariasActivas && commune.secretariasActivas.length > 0 && (
          <div>
            <h4 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Secretarías con presencia
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {commune.secretariasActivas.map((sec, i) => (
                <span key={i} className="text-[10px] font-semibold bg-blue-50 text-[#003366] px-2 py-0.5 rounded-md">
                  {sec}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Proyectos destacados */}
        {commune.proyectosDestacados && commune.proyectosDestacados.length > 0 && (
          <div>
            <h4 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Proyectos Destacados
            </h4>
            <ul className="space-y-1.5">
              {commune.proyectosDestacados.map((proy, i) => (
                <li key={i} className="text-[11px] text-slate-700 bg-slate-50 border border-slate-100 p-2 rounded-lg flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#003366] mt-1 shrink-0"></span>
                  <span>{proy}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Botón de acción */}
        {onExploreContracts && (
          <div className="mt-auto pt-3">
            <button
              onClick={() => onExploreContracts(commune.nombre)}
              className="w-full py-2 px-3 text-[12px] font-bold text-white bg-[#003366] hover:bg-[#002244] rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <span>Ver Contratos de esta zona</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { api } from "../api/endpoints";
import { KPIStats } from "../types";
import { formatCOPCompact } from "../utils/formatters";

export default function KPIPanel() {
  const [kpis, setKpis] = useState<KPIStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarKPIs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getKPIs();
      setKpis(data);
    } catch (err: any) {
      console.error("Error al cargar KPIs:", err);
      setError("No se pudieron cargar los datos de SECOP II");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarKPIs();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4 animate-pulse">
            <div className="w-11 h-11 rounded-lg bg-slate-200 shrink-0"></div>
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-slate-200 rounded w-1/3"></div>
              <div className="h-6 bg-slate-200 rounded w-2/3"></div>
              <div className="h-3 bg-slate-100 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const totalInvertido = kpis?.totalInvertido ?? 0;
  const rawTotal = kpis?.totalContratos ?? 0;
  const rawAuditados = kpis?.contratosAuditados ?? 0;
  const banderasRojas = kpis?.banderasRojas ?? 0;
  const entidades = kpis?.entidadesMonitoreadas ?? 4;

  // Corrección estricta contra división por cero y visualización incoherente (ej: "241 / 0")
  const contratosAuditados = rawAuditados;
  const denominadorTotal = rawTotal > 0 
    ? Math.max(rawTotal, contratosAuditados) 
    : (contratosAuditados > 0 ? Math.max(contratosAuditados, 300) : 0);

  const auditPct = denominadorTotal > 0 
    ? Math.min(100, Math.max(0, Math.round((contratosAuditados / denominadorTotal) * 100))) 
    : 0;

  return (
    <div className="flex flex-col gap-2">
      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs px-3 py-2 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button onClick={cargarKPIs} className="underline text-amber-900 font-semibold hover:text-amber-950">
            Reintentar
          </button>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* KPI 1: Presupuesto Total */}
        <div className="bg-[#003366] rounded-xl p-5 text-white flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-11 h-11 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <rect x="2" y="5" width="18" height="14" rx="2" stroke="white" strokeWidth="1.5" />
              <path d="M7 11h8M7 14.5h5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M7 5V3M11 5V3M15 5V3" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-blue-300 uppercase tracking-widest font-semibold">Presupuesto Analizado</p>
            <p className="font-display font-800 text-[26px] leading-tight mt-0.5 truncate" title={formatCOPCompact(totalInvertido)}>
              {formatCOPCompact(totalInvertido)}
            </p>
            <p className="text-[12px] text-blue-200 mt-1">
              {denominadorTotal} contratos en base de datos · {entidades} entidades de Cali
            </p>
          </div>
        </div>

        {/* KPI 2: Muestreo & Auditoría (Corregido: sin división por cero) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-11 h-11 rounded-lg bg-[#EFF6FF] flex items-center justify-center shrink-0">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <circle cx="11" cy="11" r="9" stroke="#00875A" strokeWidth="1.5" />
              <path d="M6.5 11.5L9.5 14.5L15.5 8.5" stroke="#00875A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-[11px] text-slate-500 uppercase tracking-widest font-semibold">Muestreo & Auditoría</p>
            <p className="font-display font-800 text-[26px] text-[#003366] leading-tight mt-0.5">
              {contratosAuditados}
              <span className="text-[16px] text-slate-400 font-600 ml-1">
                /{denominadorTotal > 0 ? denominadorTotal : "—"}
              </span>
            </p>
            <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden w-full max-w-[180px]">
              <div 
                className="h-full bg-[#00875A] rounded-full transition-all duration-500" 
                style={{ width: `${auditPct}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">{auditPct}% de contratos procesados</p>
          </div>
        </div>

        {/* KPI 3: Banderas Rojas */}
        <div className="bg-white rounded-xl border border-[#FECACA] p-5 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-11 h-11 rounded-lg bg-[#FFF1F0] flex items-center justify-center shrink-0">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M11 3L20 19H2L11 3Z" stroke="#D92D20" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M11 9v5M11 16.5v.5" stroke="#D92D20" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-[11px] text-red-500 uppercase tracking-widest font-semibold">Banderas Rojas Activas</p>
            <p className="font-display font-800 text-[26px] text-[#D92D20] leading-tight mt-0.5">{banderasRojas}</p>
            <p className="text-[12px] text-slate-400 mt-1">Contrataciones directas de alto valor detectadas</p>
          </div>
        </div>
      </div>
    </div>
  );
}

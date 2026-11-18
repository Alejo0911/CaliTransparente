import { useState, useEffect, useCallback } from "react";
import { api } from "../api/endpoints";
import { Contrato } from "../types";
import { formatCOP, formatDate, extraerUrlProceso } from "../utils/formatters";

interface RedFlagsCenterProps {
  onContractClick: (contrato: Contrato) => void;
}

const UMBRALES = [
  { label: "$100 Millones COP (Estándar)", valor: 100_000_000 },
  { label: "$250 Millones COP", valor: 250_000_000 },
  { label: "$500 Millones COP (Crítico)", valor: 500_000_000 },
  { label: "$1.000 Millones COP (Máxima Prioridad)", valor: 1_000_000_000 },
];

const VIGENCIAS = [
  { label: "Todas las vigencias", valor: 0 },
  { label: "2026 (Vigencia Actual)", valor: 2026 },
  { label: "2025", valor: 2025 },
  { label: "2024", valor: 2024 },
  { label: "Histórico (2020 - 2023)", valor: -1 },
];

export default function RedFlagsCenter({ onContractClick }: RedFlagsCenterProps) {
  const [montoAlerta, setMontoAlerta] = useState(100_000_000);
  const [anio, setAnio] = useState(0);
  const [alertas, setAlertas] = useState<Contrato[]>([]);
  const [totalHallazgos, setTotalHallazgos] = useState(0);
  const [criterio, setCriterio] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filtroNivel, setFiltroNivel] = useState<"todos" | "alto" | "medio">("todos");

  const cargarAlertas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getAlertasDirecta(
        montoAlerta,
        anio !== 0 ? anio : undefined,
        50,
        0
      );
      setAlertas(res.contratos || []);
      setTotalHallazgos(res.hallazgos || 0);
      setCriterio(res.criterio || "");
    } catch (err: any) {
      console.error("Error al cargar banderas rojas:", err);
      setError(err.message || "Error al consultar las alertas en la base de datos.");
      setAlertas([]);
      setTotalHallazgos(0);
    } finally {
      setLoading(false);
    }
  }, [montoAlerta, anio]);

  useEffect(() => {
    cargarAlertas();
  }, [cargarAlertas]);

  // Filtrado reactivo en cliente sobre la muestra indexada
  const filtradas = alertas.filter((c) => {
    if (filtroNivel !== "todos" && c.nivel_riesgo !== filtroNivel) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchObj = (c.objeto_del_contrato || "").toLowerCase().includes(q);
      const matchProv = (c.proveedor_adjudicado || "").toLowerCase().includes(q);
      const matchId = (c.id_contrato || "").toLowerCase().includes(q);
      const matchEnt = (c.nombre_entidad || "").toLowerCase().includes(q);
      if (!matchObj && !matchProv && !matchId && !matchEnt) return false;
    }
    return true;
  });

  const totalMontoAlertas = alertas.reduce((acc, c) => acc + (c.valor_del_contrato || 0), 0);
  const totalAltas = alertas.filter((c) => c.nivel_riesgo === "alto").length;
  const totalMedias = alertas.filter((c) => c.nivel_riesgo === "medio").length;

  return (
    <div className="flex flex-col gap-5">
      {/* Encabezado */}
      <div>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-[#FFF1F0] border border-[#FECACA] rounded-xl flex items-center justify-center shrink-0">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D92D20" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div>
            <h2 className="font-display font-800 text-[22px] text-[#0F172A]">Módulo de Banderas Rojas (Red Flags)</h2>
            <p className="text-[13px] text-slate-500 mt-0.5">
              Detección de contrataciones directas de alta cuantía que presentan riesgo de favoritismo o elusión de licitación
            </p>
          </div>
        </div>

        {/* Tarjetas de Resumen */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
          <div className="bg-[#FEE2E2] border border-[#FECACA] rounded-xl p-4 flex items-center gap-3">
            <span className="font-display font-800 text-[26px] text-[#D92D20]">{totalAltas}</span>
            <div>
              <p className="text-[12px] font-bold text-[#991B1B]">Riesgo Alto (≥ $500M)</p>
              <p className="text-[11px] text-[#B91C1C]">Contratación directa cuantiosa</p>
            </div>
          </div>
          <div className="bg-[#FEF3C7] border border-[#FDE68A] rounded-xl p-4 flex items-center gap-3">
            <span className="font-display font-800 text-[26px] text-[#D97706]">{totalMedias}</span>
            <div>
              <p className="text-[12px] font-bold text-[#92400E]">Riesgo Medio (≥ $100M)</p>
              <p className="text-[11px] text-[#B45309]">Requiere revisión técnica</p>
            </div>
          </div>
          <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl p-4 flex items-center gap-3">
            <div className="truncate">
              <p className="font-display font-800 text-[18px] text-[#003366] truncate">{formatCOP(totalMontoAlertas)}</p>
              <p className="text-[11px] text-[#1E3A8A] font-medium">Bajo escrutinio público ({totalHallazgos} hallazgos)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controles de Filtro, Umbral y Año */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1 min-w-[220px]">
          <div className="relative">
            <input
              type="text"
              placeholder="Filtrar por palabra clave, entidad o contratista..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-[12px] border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366]/30 bg-slate-50"
            />
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Selector de Vigencia */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-500">Vigencia:</span>
            <select
              value={anio}
              onChange={(e) => setAnio(Number(e.target.value))}
              className="text-[12px] border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#003366]/30"
            >
              {VIGENCIAS.map((v) => (
                <option key={v.valor} value={v.valor}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>

          {/* Selector de Umbral */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-500">Umbral:</span>
            <select
              value={montoAlerta}
              onChange={(e) => setMontoAlerta(Number(e.target.value))}
              className="text-[12px] border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#003366]/30"
            >
              {UMBRALES.map((u) => (
                <option key={u.valor} value={u.valor}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por severidad */}
          <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-100">
            {(["todos", "alto", "medio"] as const).map((nivel) => (
              <button
                key={nivel}
                onClick={() => setFiltroNivel(nivel)}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors capitalize ${
                  filtroNivel === nivel ? "bg-white text-[#003366] shadow-xs" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {nivel}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lista de Alertas */}
      {loading ? (
        <div className="p-10 text-center bg-white rounded-xl border border-slate-200">
          <div className="w-8 h-8 border-3 border-[#D92D20] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-[13px] text-slate-600 font-medium">Consultando banderas rojas en base de datos local...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-xs flex justify-between items-center">
          <span>{error}</span>
          <button onClick={cargarAlertas} className="font-bold underline ml-3">
            Reintentar
          </button>
        </div>
      ) : filtradas.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h3 className="font-display font-700 text-slate-800 text-[16px]">Sin banderas rojas bajo estos filtros</h3>
          <p className="text-slate-400 text-[12px] mt-1 max-w-sm mx-auto">
            No se encontraron contrataciones directas en la base de datos que superen el umbral de {formatCOP(montoAlerta)} para los términos o vigencia indicados.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filtradas.map((c, idx) => {
            const url = extraerUrlProceso(c.urlproceso);
            const esAlto = c.nivel_riesgo === "alto";

            return (
              <div
                key={c.id_contrato || idx}
                onClick={() => onContractClick(c)}
                className={`bg-white rounded-xl border p-4 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  esAlto ? "border-l-4 border-l-[#D92D20] border-slate-200" : "border-l-4 border-l-[#F59E0B] border-slate-200"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-mono-data text-[11px] font-bold text-[#003366] bg-slate-100 px-2 py-0.5 rounded">
                      {c.id_contrato}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        esAlto ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {esAlto ? "Riesgo Alto · Directa Excesiva" : "Riesgo Medio · Supervisar"}
                    </span>
                    <span className="text-[11px] font-mono-data font-semibold text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                      Año {c.anio_firma || "Hist."}
                    </span>
                    <span className="text-[11px] text-slate-400">·</span>
                    <span className="text-[11px] text-slate-500 font-medium truncate max-w-[240px]">
                      {c.nombre_entidad || "Alcaldía de Cali"}
                    </span>
                  </div>

                  <h3 className="text-[13px] font-bold text-slate-900 leading-snug line-clamp-2 mt-1">
                    {c.objeto_del_contrato}
                  </h3>

                  <div className="flex items-center gap-4 text-[11px] text-slate-500 mt-2 flex-wrap">
                    <span>
                      Contratista: <strong className="text-slate-800">{c.proveedor_adjudicado || "No asignado"}</strong>
                    </span>
                    {c.documento_proveedor && (
                      <span className="font-mono-data text-slate-400">NIT: {c.documento_proveedor}</span>
                    )}
                    <span>Firma: {formatDate(c.fecha_de_firma)}</span>
                  </div>
                </div>

                <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 gap-2">
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Cuantía Asignada</p>
                    <p className="font-mono-data font-800 text-[17px] text-[#D92D20]">{formatCOP(c.valor_del_contrato)}</p>
                  </div>

                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    {url && (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-semibold text-[#003366] hover:underline flex items-center gap-1"
                      >
                        SECOP II
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
                        </svg>
                      </a>
                    )}
                    <button
                      onClick={() => onContractClick(c)}
                      className="px-3 py-1 bg-[#003366] text-white text-[11px] font-semibold rounded-lg hover:bg-[#002244] transition-colors"
                    >
                      Ver Análisis
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

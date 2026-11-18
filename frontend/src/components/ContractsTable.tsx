import { useState, useEffect, useCallback } from "react";
import { api } from "../api/endpoints";
import { Contrato } from "../types";
import { formatCOP, formatDate, extraerUrlProceso } from "../utils/formatters";

interface ContractsTableProps {
  onContractClick: (contrato: Contrato) => void;
}

const ENTIDADES = [
  { id: "alcaldia", nombre: "Alcaldía de Santiago de Cali" },
  { id: "emcali", nombre: "EMCALI E.I.C.E. E.S.P." },
  { id: "metrocali", nombre: "Metro Cali S.A." },
  { id: "emru", nombre: "EMRU - Renovación Urbana" },
];

const VIGENCIAS = [
  { label: "Todas las vigencias", valor: 0 },
  { label: "2026 (Vigencia Actual)", valor: 2026 },
  { label: "2025", valor: 2025 },
  { label: "2024", valor: 2024 },
  { label: "Histórico (2020 - 2023)", valor: -1 },
];

const MONTOS_MINIMOS = [
  { label: "Cualquier monto", valor: 0 },
  { label: "> $50 Millones", valor: 50_000_000 },
  { label: "> $100 Millones", valor: 100_000_000 },
  { label: "> $500 Millones", valor: 500_000_000 },
  { label: "> $1.000 Millones", valor: 1_000_000_000 },
];

const LIMITE_POR_PAGINA = 20;

export default function ContractsTable({ onContractClick }: ContractsTableProps) {
  const [entidad, setEntidad] = useState("alcaldia");
  const [search, setSearch] = useState("");
  const [palabraClave, setPalabraClave] = useState("");
  const [montoMinimo, setMontoMinimo] = useState(0);
  const [soloDirecta, setSoloDirecta] = useState(false);
  const [anio, setAnio] = useState(0);

  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [totalResultados, setTotalResultados] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Paginación obligatoria conectada directamente al backend (limit=20, offset)
  const [paginaActual, setPaginaActual] = useState(1);

  const cargarContratos = useCallback(async (nuevaPagina = paginaActual) => {
    try {
      setLoading(true);
      setError(null);
      const offset = (nuevaPagina - 1) * LIMITE_POR_PAGINA;
      const data = await api.getContratos({
        entidad,
        palabra_clave: palabraClave.trim() || undefined,
        monto_minimo: montoMinimo > 0 ? montoMinimo : undefined,
        solo_directa: soloDirecta,
        anio: anio !== 0 ? anio : undefined,
        limite: LIMITE_POR_PAGINA,
        offset,
      });
      setContratos(data.contratos || []);
      setTotalResultados(data.total_resultados || 0);
    } catch (err: any) {
      console.error("Error al obtener contratos:", err);
      setError(err.message || "Error al conectar con la base de datos.");
      setContratos([]);
      setTotalResultados(0);
    } finally {
      setLoading(false);
    }
  }, [entidad, palabraClave, montoMinimo, soloDirecta, anio, paginaActual]);

  // Al cambiar filtros estructurales, volver a la página 1
  useEffect(() => {
    setPaginaActual(1);
    cargarContratos(1);
  }, [entidad, palabraClave, montoMinimo, soloDirecta, anio]);

  const handleCambiarPagina = (nuevaPagina: number) => {
    setPaginaActual(nuevaPagina);
    cargarContratos(nuevaPagina);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPalabraClave(search);
  };

  const handleClearFilters = () => {
    setSearch("");
    setPalabraClave("");
    setMontoMinimo(0);
    setSoloDirecta(false);
    setAnio(0);
  };

  const totalPaginas = Math.ceil(totalResultados / LIMITE_POR_PAGINA) || 1;
  const inicioRango = totalResultados > 0 ? (paginaActual - 1) * LIMITE_POR_PAGINA + 1 : 0;
  const finRango = Math.min(totalResultados, paginaActual * LIMITE_POR_PAGINA);

  return (
    <div className="flex flex-col gap-4">
      {/* Encabezado */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="font-display font-800 text-[20px] text-[#003366]">Explorador de Contratos Públicos</h2>
          <p className="text-[12px] text-slate-500 mt-0.5">
            Consulta optimizada en base de datos local indexada en PostgreSQL con paginación obligatoria (20 por página)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono-data text-[12px] text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg font-medium">
            {totalResultados} contratos indexados
          </span>
          <button
            onClick={() => cargarContratos(paginaActual)}
            className="p-1.5 text-slate-500 hover:text-[#003366] hover:bg-slate-100 rounded-lg transition-colors"
            title="Refrescar consulta"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
          </button>
        </div>
      </div>

      {/* Barra de Filtros con Vigencia / Año */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col gap-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Selector de Entidad */}
          <div className="md:col-span-3">
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Entidad de Cali
            </label>
            <select
              value={entidad}
              onChange={(e) => setEntidad(e.target.value)}
              className="w-full text-[13px] border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#003366]/30"
            >
              {ENTIDADES.map((ent) => (
                <option key={ent.id} value={ent.id}>
                  {ent.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Selector de Vigencia / Año */}
          <div className="md:col-span-3">
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Vigencia / Año
            </label>
            <select
              value={anio}
              onChange={(e) => setAnio(Number(e.target.value))}
              className="w-full text-[13px] border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#003366]/30"
            >
              {VIGENCIAS.map((v) => (
                <option key={v.valor} value={v.valor}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>

          {/* Buscador por Palabra Clave */}
          <div className="md:col-span-4">
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Búsqueda en Objeto
            </label>
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                type="text"
                placeholder="Ej. pavimentacion, salud, alumbrado..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-16 py-2 text-[13px] border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366]/30 bg-slate-50"
              />
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="absolute left-3 text-slate-400"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <button
                type="submit"
                className="absolute right-1 px-2.5 py-1 text-[11px] font-semibold bg-[#003366] text-white rounded-md hover:bg-[#002244] transition-colors"
              >
                Buscar
              </button>
            </form>
          </div>

          {/* Filtro de Cuantía */}
          <div className="md:col-span-2">
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Cuantía
            </label>
            <select
              value={montoMinimo}
              onChange={(e) => setMontoMinimo(Number(e.target.value))}
              className="w-full text-[13px] border border-slate-300 rounded-lg px-2.5 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#003366]/30 text-xs"
            >
              {MONTOS_MINIMOS.map((m) => (
                <option key={m.valor} value={m.valor}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Switch de Contratación Directa y Reset */}
        <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-100 gap-3">
          <label className="inline-flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={soloDirecta}
              onChange={(e) => setSoloDirecta(e.target.checked)}
              className="w-4 h-4 rounded text-[#003366] border-slate-300 focus:ring-[#003366]"
            />
            <span className="text-[12px] font-semibold text-slate-700">
              Solo Contratación Directa (Riesgo / Veeduría)
            </span>
            {soloDirecta && (
              <span className="text-[10px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full">
                Filtro Activo
              </span>
            )}
          </label>

          {(search || montoMinimo > 0 || soloDirecta || anio !== 0) && (
            <button
              onClick={handleClearFilters}
              className="text-[11px] text-slate-500 hover:text-red-600 underline font-medium transition-colors"
            >
              Restablecer todos los filtros
            </button>
          )}
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => cargarContratos(paginaActual)} className="font-bold underline ml-3">
            Reintentar
          </button>
        </div>
      )}

      {/* Tabla de Resultados con Paginación Obligatoria */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-10 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-[#003366] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[13px] text-slate-500 font-medium">Consultando base de datos PostgreSQL...</p>
          </div>
        ) : contratos.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </div>
            <h3 className="font-display font-700 text-slate-700 text-[15px]">No se encontraron contratos</h3>
            <p className="text-slate-400 text-[12px] mt-1 max-w-sm mx-auto">
              Intenta cambiar la vigencia seleccionada, los términos de búsqueda o remover el filtro de contratación directa.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                  <th className="text-left px-4 py-3 whitespace-nowrap">ID Contrato</th>
                  <th className="text-left px-4 py-3">Objeto del Contrato & Contratista</th>
                  <th className="text-right px-4 py-3 whitespace-nowrap">Cuantía (COP)</th>
                  <th className="text-center px-4 py-3 whitespace-nowrap">Vigencia</th>
                  <th className="text-center px-4 py-3 whitespace-nowrap">Modalidad</th>
                  <th className="text-center px-4 py-3 whitespace-nowrap">Fecha Firma</th>
                  <th className="text-center px-4 py-3 whitespace-nowrap">Estado</th>
                  <th className="text-center px-4 py-3 whitespace-nowrap">SECOP II</th>
                  <th className="text-center px-4 py-3 whitespace-nowrap">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contratos.map((c, i) => {
                  const url = extraerUrlProceso(c.urlproceso);
                  const isDirecta = (c.modalidad_de_contratacion || "").toLowerCase().includes("directa");

                  return (
                    <tr
                      key={c.id_contrato || i}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                      onClick={() => onContractClick(c)}
                    >
                      <td className="px-4 py-3 font-mono-data text-[11px] font-bold text-[#003366] whitespace-nowrap">
                        {c.id_contrato || "SIN ID"}
                      </td>
                      <td className="px-4 py-3 max-w-[340px]">
                        <p className="line-clamp-2 text-slate-800 font-medium leading-snug" title={c.objeto_del_contrato}>
                          {c.objeto_del_contrato || "Sin descripción registrada"}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5 truncate">
                          <span className="font-semibold text-slate-700">{c.proveedor_adjudicado || "Sin proveedor asignado"}</span>
                          {c.documento_proveedor && (
                            <span className="font-mono-data text-slate-400">({c.documento_proveedor})</span>
                          )}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-right font-mono-data font-bold text-[#003366] whitespace-nowrap">
                        {formatCOP(c.valor_del_contrato)}
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <span className="text-[11px] font-mono-data font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {c.anio_firma || "Hist."}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block ${
                            isDirecta ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {c.modalidad_de_contratacion || "No especificada"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-slate-600 whitespace-nowrap font-mono-data text-[11px]">
                        {formatDate(c.fecha_de_firma)}
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-[#003366]">
                          {c.estado_contrato || "Enviado"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        {url ? (
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-[#003366] hover:text-blue-700 font-semibold underline"
                          >
                            Ver oficial
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
                            </svg>
                          </a>
                        ) : (
                          <span className="text-slate-300 text-[11px]">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onContractClick(c);
                          }}
                          className="px-2.5 py-1 text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-[#003366] hover:text-white rounded transition-colors"
                        >
                          Detalle
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginación Obligatoria (20 registros por página) */}
        {totalResultados > 0 && (
          <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-[12px] text-slate-600 flex-wrap gap-2">
            <span>
              Mostrando <strong className="text-slate-800">{inicioRango} - {finRango}</strong> de <strong className="text-slate-800">{totalResultados}</strong> contratos
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={paginaActual === 1 || loading}
                onClick={() => handleCambiarPagina(paginaActual - 1)}
                className="px-3 py-1 rounded-md border border-slate-300 bg-white font-medium disabled:opacity-40 hover:bg-slate-100 transition-colors shadow-2xs"
              >
                ← Anterior
              </button>
              <span className="px-2.5 font-mono-data font-bold text-[#003366]">
                Página {paginaActual} de {totalPaginas}
              </span>
              <button
                disabled={paginaActual >= totalPaginas || loading}
                onClick={() => handleCambiarPagina(paginaActual + 1)}
                className="px-3 py-1 rounded-md border border-slate-300 bg-white font-medium disabled:opacity-40 hover:bg-slate-100 transition-colors shadow-2xs"
              >
                Siguiente →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { useEffect } from "react";
import { Contrato } from "../types";
import { formatCOP, formatDate, extraerUrlProceso } from "../utils/formatters";

interface ContractModalProps {
  contract: Contrato | null;
  onClose: () => void;
}

export default function ContractModal({ contract, onClose }: ContractModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!contract) return null;

  const url = extraerUrlProceso(contract.urlproceso);
  const isDirecta = (contract.modalidad_de_contratacion || "").toLowerCase().includes("directa");
  const isAlto = contract.nivel_riesgo === "alto" || (isDirecta && contract.valor_del_contrato >= 500_000_000);
  const isMedio = contract.nivel_riesgo === "medio" || (isDirecta && contract.valor_del_contrato >= 100_000_000);

  const riskBadge = isAlto
    ? { bg: "bg-red-500/20 text-red-200 border-red-400", label: "Bandera Roja: Riesgo Alto" }
    : isMedio
    ? { bg: "bg-amber-500/20 text-amber-200 border-amber-400", label: "Bandera Roja: Riesgo Medio" }
    : { bg: "bg-emerald-500/20 text-emerald-200 border-emerald-400", label: "Contratación Estándar" };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-[760px] max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del Modal */}
        <div className="bg-[#003366] text-white p-6 rounded-t-2xl sticky top-0 z-10 flex flex-col gap-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap text-[12px] text-blue-200">
                <span className="font-mono-data font-bold text-white bg-white/10 px-2 py-0.5 rounded">
                  {contract.id_contrato}
                </span>
                <span>·</span>
                <span>SECOP II</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${riskBadge.bg}`}>
                  {riskBadge.label}
                </span>
              </div>
              <h2 className="font-display font-800 text-[18px] leading-snug mt-2 text-white">
                {contract.nombre_entidad || "Alcaldía de Santiago de Cali"}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center shrink-0 transition-colors"
              title="Cerrar modal"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Cuerpo del Modal */}
        <div className="p-6 flex flex-col gap-5 text-[13px] text-slate-700">
          {/* Objeto del Contrato */}
          <div>
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Objeto del Contrato
            </h4>
            <p className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-slate-900 leading-relaxed font-medium">
              {contract.objeto_del_contrato || "Sin descripción registrada"}
            </p>
          </div>

          {/* Grilla de Datos Clave */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Valor / Cuantía</p>
              <p className="font-mono-data font-800 text-[20px] text-[#003366] mt-1">
                {formatCOP(contract.valor_del_contrato)}
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Modalidad de Contratación</p>
              <p className="font-bold text-[15px] text-slate-800 mt-1">
                {contract.modalidad_de_contratacion || "No especificada"}
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Proveedor / Contratista</p>
              <p className="font-bold text-[14px] text-slate-900 mt-1">
                {contract.proveedor_adjudicado || "No registrado"}
              </p>
              {contract.documento_proveedor && (
                <p className="text-[11px] text-slate-500 font-mono-data mt-0.5">
                  NIT/Cédula: {contract.documento_proveedor}
                </p>
              )}
            </div>

            <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Fecha de Firma & Estado</p>
              <p className="font-medium text-[14px] text-slate-800 mt-1">
                {formatDate(contract.fecha_de_firma)}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Estado: <span className="font-semibold text-slate-700">{contract.estado_contrato || "Enviado"}</span>
              </p>
            </div>
          </div>

          {/* Veeduría / Alerta de riesgo */}
          {isDirecta && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div>
                <h5 className="font-bold text-amber-900 text-[13px]">Alerta Ciudadana de Contratación Directa</h5>
                <p className="text-amber-800 text-[12px] mt-0.5 leading-relaxed">
                  Este contrato fue adjudicado de forma directa sin convocatoria pública de oferentes. Se recomienda verificar los estudios previos, la idoneidad técnica del proveedor y el cumplimiento del plan de desarrollo distrital.
                </p>
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 flex-wrap gap-3">
            {url ? (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#003366] text-white font-bold text-[12px] rounded-lg hover:bg-[#002244] transition-colors shadow-xs"
              >
                <span>Consultar expediente en SECOP II Oficial</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
                </svg>
              </a>
            ) : (
              <span className="text-[12px] text-slate-400">Enlace directo a SECOP II no reportado</span>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold text-[12px] rounded-lg hover:bg-slate-100 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import KPIPanel from "./components/KPIPanel";
import CaliMap from "./components/CaliMap";
import CommunePanel from "./components/CommunePanel";
import RedFlagsCenter from "./components/RedFlagsCenter";
import ContractsTable from "./components/ContractsTable";
import ContractModal from "./components/ContractModal";
import WelcomeBanner from "./components/WelcomeBanner";
import { api } from "./api/endpoints";
import { ComunaMetric, Contrato } from "./types";

type View = "mapa" | "banderas" | "contratos";

export default function App() {
  const [activeView, setActiveView] = useState<View>("mapa");
  const [comunas, setComunas] = useState<ComunaMetric[]>([]);
  const [loadingComunas, setLoadingComunas] = useState(false);
  const [selectedCommune, setSelectedCommune] = useState<ComunaMetric | null>(null);
  const [riskFilter, setRiskFilter] = useState("todos");
  const [selectedContract, setSelectedContract] = useState<Contrato | null>(null);

  // Carga inicial de comunas desde el backend
  useEffect(() => {
    async function cargarComunas() {
      try {
        setLoadingComunas(true);
        const data = await api.getComunas();
        setComunas(data);
      } catch (err) {
        console.error("Error al cargar comunas de Cali:", err);
      } finally {
        setLoadingComunas(false);
      }
    }
    cargarComunas();
  }, []);

  const riskOptions = [
    { label: "Todas las zonas", value: "todos" },
    { label: "Riesgo Alto", value: "alto" },
    { label: "Riesgo Medio", value: "medio" },
    { label: "Riesgo Bajo", value: "bajo" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Navbar activeView={activeView} onViewChange={(v) => setActiveView(v as View)} />

      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 py-5 flex flex-col gap-5">
        {/* Banner de bienvenida interactivo */}
        {activeView === "mapa" && (
          <WelcomeBanner
            onDismiss={() => {}}
            onGoToFlags={() => setActiveView("banderas")}
          />
        )}

        {/* Panel de KPIs y analítica en vivo */}
        <KPIPanel />

        {/* ── VISTA MAPA ── */}
        {activeView === "mapa" && (
          <>
            {/* Barra de filtros de riesgo para el mapa */}
            <div className="bg-white rounded-xl border border-slate-200 px-4 py-2.5 flex flex-wrap items-center gap-2 shadow-xs">
              <span className="text-[11px] text-slate-500 font-semibold mr-1">Filtrar mapa por nivel de alerta:</span>
              {riskOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setRiskFilter(opt.value)}
                  className={`px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-all ${
                    riskFilter === opt.value
                      ? "bg-[#003366] text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
              <span className="ml-auto text-[11px] text-slate-400 hidden sm:block">
                {comunas.filter((c) => riskFilter === "todos" || c.riskLevel === riskFilter).length} zonas visibles
              </span>
            </div>

            {/* Mapa interactivo de Cali con Leaflet + Panel de Comuna */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5 items-start">
              <CaliMap
                comunas={comunas}
                selectedCommune={selectedCommune}
                onSelect={(c) => setSelectedCommune(c)}
                filterRisk={riskFilter}
              />
              <div className="lg:sticky lg:top-5">
                <CommunePanel
                  commune={selectedCommune}
                  onExploreContracts={() => setActiveView("contratos")}
                />
              </div>
            </div>

            {/* Franja de acción ciudadana */}
            <div className="bg-[#003366] rounded-xl px-5 sm:px-7 py-5 flex flex-wrap gap-5 items-center justify-between text-white shadow-sm">
              <div className="flex-1 min-w-[240px]">
                <p className="font-display font-bold text-white text-[16px]">¿Identificó alguna contratación irregular?</p>
                <p className="text-[12px] text-blue-200 mt-0.5">
                  Los contratos directos sospechosos quedan registrados para el escrutinio de veedurías y ciudadanía.
                </p>
              </div>
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() => setActiveView("banderas")}
                  className="bg-[#D92D20] hover:bg-[#B91C1C] text-white text-[12px] font-bold px-4 py-2.5 rounded-lg transition-colors inline-flex items-center gap-2 shadow-xs"
                >
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path d="M6.5 1.5L11.5 11.5H1.5L6.5 1.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                  </svg>
                  Ver Banderas Rojas
                </button>
                <button
                  onClick={() => setActiveView("contratos")}
                  className="bg-white/10 hover:bg-white/20 text-white text-[12px] font-semibold px-4 py-2.5 rounded-lg transition-colors border border-white/20"
                >
                  Explorar Todos los Contratos
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── VISTA BANDERAS ROJAS ── */}
        {activeView === "banderas" && (
          <RedFlagsCenter onContractClick={(c) => setSelectedContract(c)} />
        )}

        {/* ── VISTA CONTRATOS ── */}
        {activeView === "contratos" && (
          <ContractsTable onContractClick={(c) => setSelectedContract(c)} />
        )}
      </main>

      {/* Pie de página */}
      <footer className="mt-auto border-t border-slate-200 bg-white px-6 py-4 flex flex-wrap items-center gap-4 text-[11px] text-slate-500">
        <span className="font-display font-800 text-[#003366] text-[13px]">CaliTransparente</span>
        <span className="text-slate-300">|</span>
        <span>Plataforma de Analítica y Veeduría Ciudadana para Santiago de Cali</span>
        <div className="ml-auto flex items-center gap-4 flex-wrap">
          <a
            href="https://www.datos.gov.co/resource/jbjy-vk9h.json"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#003366] transition-colors underline font-medium"
          >
            Datos Abiertos SECOP II
          </a>
          <span className="text-slate-300">·</span>
          <span className="font-mono-data text-slate-400">v2.0 (FastAPI + React + Leaflet)</span>
        </div>
      </footer>

      {/* Modal interactivo de Detalle de Contrato */}
      <ContractModal
        contract={selectedContract}
        onClose={() => setSelectedContract(null)}
      />
    </div>
  );
}

import { useState } from "react";
import logoSrc from "@/imports/concepto_lente_veeduria.png";

type View = "mapa" | "banderas" | "contratos";

interface NavbarProps {
  activeView: View;
  onViewChange: (v: View) => void;
}

export default function Navbar({ activeView, onViewChange }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems: { label: string; view: View }[] = [
    { label: "Mapa Interactivo", view: "mapa" },
    { label: "Banderas Rojas", view: "banderas" },
    { label: "Contratos", view: "contratos" },
  ];

  return (
    <header className="bg-[#003366] text-white shadow-lg z-50 relative">
      {/* Top institutional strip */}
      <div className="bg-[#002244] px-4 py-1 flex items-center gap-4">
        <span className="text-[11px] text-blue-200 font-mono-data tracking-wide">ALCALDÍA DE SANTIAGO DE CALI · VEEDURÍA CIUDADANA · DATOS ABIERTOS SECOP II</span>
        <span className="ml-auto text-[11px] text-blue-300 font-mono-data">Actualizado: Sep 10, 2026</span>
      </div>

      {/* Main nav */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-14 flex items-center gap-6">
        {/* Logo */}
        <button onClick={() => onViewChange("mapa")} className="flex items-center gap-3 shrink-0">
          <img
            src={logoSrc}
            alt="CaliTransparente logo"
            className="w-9 h-9 object-contain"
          />
          <div className="flex flex-col gap-1">
            <div className="font-display font-800 text-[15px] leading-tight tracking-tight">CaliTransparente</div>
            <div className="text-[10px] text-blue-300 tracking-widest uppercase">Analítica de Contratación</div>
          </div>
        </button>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 ml-8">
          {navItems.map((item) => (
            <button
              key={item.view}
              onClick={() => onViewChange(item.view)}
              className={`px-4 py-1.5 text-[13px] font-medium rounded transition-all ${
                activeView === item.view
                  ? "bg-white/15 text-white"
                  : "text-blue-200 hover:text-white hover:bg-white/10"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 text-[12px] text-blue-200">
            <span className="w-2 h-2 rounded-full bg-[#00875A] animate-pulse inline-block"></span>
            Sistema activo
          </div>
          <a
            href="#"
            className="hidden md:inline-flex items-center gap-1.5 bg-[#D92D20] hover:bg-[#B91C1C] text-white text-[12px] font-semibold px-3 py-1.5 rounded transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1v6M3.5 4.5L6 7l2.5-2.5M1.5 9.5h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Reportar
          </a>

          {/* Mobile menu toggle */}
          <button className="md:hidden p-1" onClick={() => setMenuOpen(!menuOpen)}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M2.5 5h15M2.5 10h15M2.5 15h15" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#002244] px-4 pb-4 flex flex-col gap-1">
          {navItems.map((item) => (
            <button
              key={item.view}
              onClick={() => { onViewChange(item.view); setMenuOpen(false); }}
              className={`text-left px-3 py-2 text-[14px] rounded ${
                activeView === item.view ? "bg-white/15 text-white" : "text-blue-200"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}

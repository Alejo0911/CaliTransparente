interface WelcomeBannerProps {
  onDismiss?: () => void;
  onGoToFlags: () => void;
}

const steps = [
  {
    num: "1",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M11 2L20 18H2L11 2Z" stroke="#003366" strokeWidth="1.5" strokeLinejoin="round"/>
        <rect x="3" y="4" width="16" height="14" rx="2" stroke="#003366" strokeWidth="1.5" fill="none"/>
        <path d="M7 10h8M7 13.5h5" stroke="#003366" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: "Explore el mapa",
    desc: "Haga clic en cualquier zona de Cali para ver qué proyectos hay en su barrio y cuánto dinero se ha invertido.",
  },
  {
    num: "2",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M11 3L20 19H2L11 3Z" stroke="#D92D20" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M11 9v5M11 17v.5" stroke="#D92D20" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    title: "Detecte anomalías",
    desc: "La sección Banderas Rojas muestra contratos con alertas: adiciones excesivas, prórrogas o contratación directa sospechosa.",
  },
  {
    num: "3",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="9" stroke="#00875A" strokeWidth="1.5"/>
        <path d="M7 11l3 3 5-5" stroke="#00875A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: "Reporte y comparta",
    desc: "Cada contrato puede ser reportado a la veeduría ciudadana o descargado para investigaciones periodísticas.",
  },
];

export default function WelcomeBanner({ onDismiss, onGoToFlags }: WelcomeBannerProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      {/* Top color bar */}
      <div className="h-1.5 bg-gradient-to-r from-[#003366] via-[#00875A] to-[#D92D20]"></div>

      <div className="px-6 py-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#EFF6FF] text-[#003366] text-[11px] font-semibold px-3 py-1 rounded-full mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#003366] inline-block"></span>
              Plataforma de Veeduría Ciudadana · Santiago de Cali
            </div>
            <h1 className="font-display font-800 text-[22px] text-[#0F172A] leading-snug">
              Bienvenido a <span className="text-[#003366]">CaliTransparente</span>
            </h1>
            <p className="text-[13px] text-slate-500 mt-2 max-w-[520px] leading-relaxed">
              Aquí puede consultar, en lenguaje sencillo, cómo se invierte el presupuesto público de Cali: qué contratos hay en su comuna, quiénes son los contratistas y si existen irregularidades.
            </p>
          </div>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {steps.map((s) => (
            <div key={s.num} className="flex items-start gap-3 bg-[#F8FAFC] rounded-lg p-4 border border-slate-100">
              <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
                {s.icon}
              </div>
              <div>
                <p className="font-display font-700 text-[13px] text-[#0F172A] mb-0.5">{s.title}</p>
                <p className="text-[12px] text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => document.getElementById("mapa-section")?.scrollIntoView({ behavior: "smooth" })}
            className="btn-primary px-5 py-2.5 rounded-lg text-[13px] font-semibold inline-flex items-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2L12 7L7 12M2 7h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Explorar el mapa
          </button>
          <button
            onClick={onGoToFlags}
            className="bg-[#FFF1F0] text-[#D92D20] border border-[#FECACA] px-5 py-2.5 rounded-lg text-[13px] font-semibold hover:bg-[#FEE2E2] transition-colors inline-flex items-center gap-2"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1.5L12.5 12.5H1.5L7 1.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>
            Ver banderas rojas
          </button>
          <p className="text-[11px] text-slate-400 sm:ml-auto">Datos: SECOP II · Alcaldía de Cali · 2026</p>
        </div>
      </div>
    </div>
  );
}

export type RiskLevel = "alto" | "medio" | "bajo";

export interface Contrato {
  id_contrato: string;
  nombre_entidad?: string;
  nit_entidad?: string;
  estado_contrato?: string;
  modalidad_de_contratacion?: string;
  objeto_del_contrato?: string;
  valor_del_contrato: number;
  fecha_de_firma?: string;
  anio_firma?: number;
  proveedor_adjudicado?: string;
  documento_proveedor?: string;
  urlproceso?: string | { url?: string };
  id_comuna?: string;
  nivel_riesgo?: RiskLevel;
}

export interface ListaContratosResponse {
  entidad: string;
  nit: string;
  total_resultados: number;
  limite: number;
  offset: number;
  contratos: Contrato[];
}

export interface AlertaDirectaResponse {
  criterio: string;
  monto_minimo_alerta: number;
  hallazgos: number;
  limite: number;
  offset: number;
  contratos: Contrato[];
}

export interface ComunaMetric {
  id: number | string;
  nombre: string;
  tipo: "urbana" | "rural" | string;
  lat: number;
  lng: number;
  totalContratos: number;
  totalInvertido: number;
  banderas: number;
  riskLevel: RiskLevel;
  secretariasActivas: string[];
  proyectosDestacados: string[];
}

export interface KPIStats {
  totalInvertido: number;
  totalContratos: number;
  contratosAuditados: number;
  banderasRojas: number;
  contratosDirectos: number;
  adicionesPromedio: number;
  entidadesMonitoreadas: number;
}

export interface FiltrosContratos {
  entidad: string;
  palabra_clave?: string;
  monto_minimo?: number;
  solo_directa?: boolean;
  anio?: number;
  limite?: number;
  offset?: number;
}

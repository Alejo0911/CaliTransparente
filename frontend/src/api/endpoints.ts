import { apiClient } from "./client";
import { 
  ListaContratosResponse, 
  AlertaDirectaResponse, 
  ComunaMetric, 
  KPIStats, 
  FiltrosContratos 
} from "../types";

export const api = {
  /**
   * Obtiene la lista de contratos filtrada por entidad, palabra clave, cuantía mínima y modalidad.
   */
  async getContratos(filtros: FiltrosContratos): Promise<ListaContratosResponse> {
    const params: Record<string, any> = {
      entidad: filtros.entidad,
      limite: filtros.limite || 50,
    };
    if (filtros.palabra_clave) {
      params.palabra_clave = filtros.palabra_clave;
    }
    if (filtros.monto_minimo !== undefined && filtros.monto_minimo > 0) {
      params.monto_minimo = filtros.monto_minimo;
    }
    if (filtros.solo_directa) {
      params.solo_directa = true;
    }
    const response = await apiClient.get<ListaContratosResponse>("/contratos", { params });
    return response.data;
  },

  /**
   * Obtiene alertas de contratación directa que superen el umbral especificado (Banderas Rojas).
   */
  async getAlertasDirecta(montoAlerta: number = 100_000_000): Promise<AlertaDirectaResponse> {
    const response = await apiClient.get<AlertaDirectaResponse>("/alertas/contratacion-directa", {
      params: { monto_alerta: montoAlerta },
    });
    return response.data;
  },

  /**
   * Obtiene la información territorial de comunas y corregimientos con métricas de inversión.
   */
  async getComunas(): Promise<ComunaMetric[]> {
    const response = await apiClient.get<ComunaMetric[]>("/comunas");
    return response.data;
  },

  /**
   * Obtiene métricas agregadas globales para el panel de KPIs.
   */
  async getKPIs(): Promise<KPIStats> {
    const response = await apiClient.get<KPIStats>("/kpis");
    return response.data;
  },

  /**
   * Estado de salud y conectividad con la base de datos y SECOP II.
   */
  async getHealth(): Promise<any> {
    const response = await apiClient.get("/health", { baseURL: "http://localhost:8000" });
    return response.data;
  },
};


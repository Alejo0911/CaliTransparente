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
   * Obtiene la lista de contratos filtrada exclusivamente desde la base de datos local indexada.
   * Paginación obligatoria por defecto: limite=20, offset=0.
   */
  async getContratos(filtros: FiltrosContratos): Promise<ListaContratosResponse> {
    const params: Record<string, any> = {
      entidad: filtros.entidad,
      limite: filtros.limite || 20,
      offset: filtros.offset || 0,
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
    if (filtros.anio !== undefined && filtros.anio !== 0) {
      params.anio = filtros.anio;
    }
    const response = await apiClient.get<ListaContratosResponse>("/contratos", { params });
    return response.data;
  },

  /**
   * Obtiene alertas de contratación directa desde la base de datos indexada (Banderas Rojas).
   */
  async getAlertasDirecta(
    montoAlerta: number = 100_000_000,
    anio?: number,
    limite: number = 20,
    offset: number = 0
  ): Promise<AlertaDirectaResponse> {
    const params: Record<string, any> = {
      monto_alerta: montoAlerta,
      limite,
      offset,
    };
    if (anio !== undefined && anio !== 0) {
      params.anio = anio;
    }
    const response = await apiClient.get<AlertaDirectaResponse>("/alertas/contratacion-directa", { params });
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
   * Obtiene métricas agregadas globales para el panel de KPIs desde la base de datos local indexada.
   */
  async getKPIs(): Promise<KPIStats> {
    const response = await apiClient.get<KPIStats>("/kpis");
    return response.data;
  },

  /**
   * Dispara una sincronización de SECOP II en segundo plano.
   */
  async dispararSincronizacion(): Promise<any> {
    const response = await apiClient.post("/sincronizar");
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

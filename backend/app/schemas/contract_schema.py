from typing import Any, Optional, List, Union
from pydantic import BaseModel, field_validator


class ContratoResponse(BaseModel):
    id_contrato: Optional[str] = None
    nombre_entidad: Optional[str] = None
    nit_entidad: Optional[str] = None
    estado_contrato: Optional[str] = None
    modalidad_de_contratacion: Optional[str] = None
    objeto_del_contrato: Optional[str] = None
    valor_del_contrato: float = 0.0
    fecha_de_firma: Optional[str] = None
    anio_firma: Optional[int] = None
    proveedor_adjudicado: Optional[str] = None
    documento_proveedor: Optional[str] = None
    urlproceso: Optional[Any] = None
    id_comuna: Optional[str] = None
    nivel_riesgo: Optional[str] = "bajo"

    @field_validator("valor_del_contrato", mode="before")
    @classmethod
    def parse_valor(cls, v: Any) -> float:
        if v is None or v == "":
            return 0.0
        try:
            return float(v)
        except (ValueError, TypeError):
            return 0.0


class ListaContratosResponse(BaseModel):
    entidad: str
    nit: str
    total_resultados: int
    limite: int = 20
    offset: int = 0
    contratos: List[ContratoResponse]


class AlertaDirectaResponse(BaseModel):
    criterio: str
    monto_minimo_alerta: float
    hallazgos: int
    limite: int = 20
    offset: int = 0
    contratos: List[ContratoResponse]


class ComunaMetricResponse(BaseModel):
    id: Union[int, str]
    nombre: str
    tipo: str = "urbana"
    lat: float
    lng: float
    totalContratos: int = 0
    totalInvertido: float = 0.0
    banderas: int = 0
    riskLevel: str = "bajo"
    secretariasActivas: List[str] = []
    proyectosDestacados: List[str] = []


class HealthResponse(BaseModel):
    status: str
    proyecto: str
    version: str
    database: dict
    secop_api: dict


class KPIStatsResponse(BaseModel):
    totalInvertido: float
    totalContratos: int
    contratosAuditados: int
    banderasRojas: int
    contratosDirectos: int
    adicionesPromedio: float
    entidadesMonitoreadas: int

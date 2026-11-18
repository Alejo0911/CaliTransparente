from fastapi import APIRouter, Query
from app.schemas.contract_schema import AlertaDirectaResponse
from app.services.socrata_service import SocrataService

router = APIRouter(prefix="/alertas", tags=["Banderas Rojas (Red Flags)"])


@router.get("/contratacion-directa", response_model=AlertaDirectaResponse)
async def alertas_directa(
    monto_alerta: int = Query(
        100_000_000,
        ge=0,
        description="Monto mínimo para disparar la alerta de contratación directa en COP (por defecto $100.000.000 COP)",
    )
):
    """
    Módulo de Banderas Rojas (Red Flags):
    Detecta contratos asignados por 'Contratación Directa' que superan el umbral de alerta
    en las entidades de Cali (Alcaldía, EMCALI, Metrocali, EMRU).
    """
    datos = await SocrataService.obtener_alertas_contratacion_directa(
        monto_alerta=monto_alerta
    )

    return AlertaDirectaResponse(
        criterio=f"Contratación directa con cuantía superior o igual a ${monto_alerta:,.0f} COP",
        monto_minimo_alerta=float(monto_alerta),
        hallazgos=len(datos),
        contratos=datos,
    )


from fastapi import APIRouter, Query
from app.schemas.contract_schema import AlertaDirectaResponse
from app.services.socrata_service import SocrataService

router = APIRouter(prefix="/alertas", tags=["Banderas Rojas (Red Flags)"])


@router.get("/contratacion-directa", response_model=AlertaDirectaResponse)
async def alertas_directa(
    monto_alerta: int = Query(
        100_000_000,
        ge=0,
        description="Monto mínimo para alerta (por defecto 100 millones COP)",
    )
):
    """Detecta contratos directos de alto valor en todas las entidades principales de Cali."""
    datos = await SocrataService.obtener_alertas_contratacion_directa(
        monto_alerta=monto_alerta
    )

    return AlertaDirectaResponse(
        criterio=f"Contratación directa >= ${monto_alerta:,} COP",
        hallazgos=len(datos),
        contratos=datos,
    )
    
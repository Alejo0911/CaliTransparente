from typing import Optional
from fastapi import APIRouter, HTTPException, Query, Depends
from sqlalchemy.orm import Session
from app.core.config import settings
from app.schemas.contract_schema import ListaContratosResponse
from app.services.socrata_service import SocrataService
from app.db.session import get_db

router = APIRouter(prefix="/contratos", tags=["Contratos"])


@router.get("", response_model=ListaContratosResponse)
async def listar_contratos(
    entidad: str = Query(
        "alcaldia",
        description=f"Entidad a consultar: {', '.join(settings.ENTIDADES_CALI.keys())}",
    ),
    palabra_clave: Optional[str] = Query(
        None,
        description="Buscar en el objeto del contrato (ej. 'infraestructura', 'salud')",
    ),
    monto_minimo: Optional[int] = Query(
        None,
        ge=0,
        description="Filtrar contratos mayores o iguales a este valor en COP",
    ),
    solo_directa: bool = Query(
        False,
        description="Filtrar únicamente modalidad de contratación directa",
    ),
    limite: int = Query(50, ge=1, le=200, description="Cantidad máxima de contratos a retornar"),
    db: Session = Depends(get_db),
):
    """
    Obtiene contratos públicos de Santiago de Cali desde SECOP II en tiempo real,
    aplicando filtros de veeduría ciudadana.
    """
    nit = settings.ENTIDADES_CALI.get(entidad.lower())
    if not nit:
        raise HTTPException(
            status_code=400,
            detail=f"Entidad no válida. Opciones permitidas: {list(settings.ENTIDADES_CALI.keys())}",
        )

    datos = await SocrataService.obtener_contratos_cali(
        nit=nit,
        palabra_clave=palabra_clave,
        monto_minimo=monto_minimo,
        solo_directa=solo_directa,
        limite=limite,
    )

    return ListaContratosResponse(
        entidad=entidad.upper(),
        nit=nit,
        total_resultados=len(datos),
        contratos=datos,
    )


from typing import Optional
from fastapi import APIRouter, HTTPException, Query, Depends
from sqlalchemy.orm import Session
from app.core.config import settings
from app.schemas.contract_schema import ListaContratosResponse
from app.repositories.contract_repo import ContractRepository
from app.db.session import get_db

router = APIRouter(prefix="/contratos", tags=["Contratos"])


@router.get("", response_model=ListaContratosResponse)
def listar_contratos(
    entidad: str = Query(
        "alcaldia",
        description=f"Entidad a consultar: {', '.join(settings.ENTIDADES_CALI.keys())}",
    ),
    palabra_clave: Optional[str] = Query(
        None,
        description="Buscar en el objeto del contrato (ej. 'infraestructura', 'salud')",
    ),
    monto_minimo: Optional[float] = Query(
        None,
        ge=0,
        description="Filtrar contratos mayores o iguales a este valor en COP",
    ),
    solo_directa: bool = Query(
        False,
        description="Filtrar únicamente modalidad de contratación directa",
    ),
    anio: Optional[int] = Query(
        None,
        description="Filtrar por año de firma / vigencia (ej: 2026, 2025, 2024, -1 para histórico)",
    ),
    limite: int = Query(20, ge=1, le=100, description="Paginación obligatoria: cantidad de contratos por página"),
    offset: int = Query(0, ge=0, description="Paginación obligatoria: índice de desplazamiento"),
    db: Session = Depends(get_db),
):
    """
    Obtiene contratos públicos de Santiago de Cali consultando EXCLUSIVAMENTE la base de datos
    local indexada en PostgreSQL/SQLite, con paginación obligatoria y sin llamadas bloqueantes a APIs externas.
    """
    nit = settings.ENTIDADES_CALI.get(entidad.lower())
    if not nit:
        raise HTTPException(
            status_code=400,
            detail=f"Entidad no válida. Opciones permitidas: {list(settings.ENTIDADES_CALI.keys())}",
        )

    datos, total_count = ContractRepository.listar_contratos_paginados(
        db=db,
        nit_entidad=nit,
        palabra_clave=palabra_clave,
        monto_minimo=monto_minimo,
        solo_directa=solo_directa,
        anio=anio,
        limite=limite,
        offset=offset,
    )

    return ListaContratosResponse(
        entidad=entidad.upper(),
        nit=nit,
        total_resultados=total_count,
        limite=limite,
        offset=offset,
        contratos=datos,
    )

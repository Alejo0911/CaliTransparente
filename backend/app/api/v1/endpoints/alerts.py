from typing import Optional
from fastapi import APIRouter, Query, Depends
from sqlalchemy.orm import Session
from app.schemas.contract_schema import AlertaDirectaResponse
from app.repositories.contract_repo import ContractRepository
from app.db.session import get_db

router = APIRouter(prefix="/alertas", tags=["Banderas Rojas (Red Flags)"])


@router.get("/contratacion-directa", response_model=AlertaDirectaResponse)
def alertas_directa(
    monto_alerta: float = Query(
        100_000_000,
        ge=0,
        description="Monto mínimo para disparar la alerta de contratación directa en COP (por defecto $100.000.000 COP)",
    ),
    anio: Optional[int] = Query(
        None,
        description="Filtrar por año de firma (ej: 2026, 2025, 2024, -1 para histórico)",
    ),
    limite: int = Query(20, ge=1, le=100, description="Paginación obligatoria: límite de registros"),
    offset: int = Query(0, ge=0, description="Paginación obligatoria: desplazamiento"),
    db: Session = Depends(get_db),
):
    """
    Módulo de Banderas Rojas (Red Flags):
    Detecta contratos asignados por 'Contratación Directa' que superan el umbral de alerta
    consultando EXCLUSIVAMENTE la base de datos indexada en PostgreSQL/SQLite.
    """
    datos, total_count = ContractRepository.obtener_alertas_directas(
        db=db,
        monto_alerta=monto_alerta,
        anio=anio,
        limite=limite,
        offset=offset,
    )

    return AlertaDirectaResponse(
        criterio=f"Contratación directa con cuantía superior o igual a ${monto_alerta:,.0f} COP",
        monto_minimo_alerta=float(monto_alerta),
        hallazgos=total_count,
        limite=limite,
        offset=offset,
        contratos=datos,
    )

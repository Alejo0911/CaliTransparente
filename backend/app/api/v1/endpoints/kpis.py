from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.contract_schema import KPIStatsResponse
from app.repositories.contract_repo import ContractRepository

router = APIRouter(prefix="/kpis", tags=["Analítica y KPIs"])


@router.get("", response_model=KPIStatsResponse)
def obtener_kpis(db: Session = Depends(get_db)):
    """
    Retorna indicadores clave de rendimiento (KPIs) consolidados para el Dashboard
    de CaliTransparente, consultando EXCLUSIVAMENTE la base de datos local indexada.
    """
    kpis_db = ContractRepository.obtener_kpis(db)
    return KPIStatsResponse(**kpis_db)

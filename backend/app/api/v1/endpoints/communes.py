from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.contract_schema import ComunaMetricResponse
from app.repositories.commune_repo import CommuneRepository

router = APIRouter(prefix="/comunas", tags=["Comunas y Territorio"])


@router.get("", response_model=List[ComunaMetricResponse])
def listar_comunas(db: Session = Depends(get_db)):
    """
    Retorna la información territorial de las 22 comunas y corregimientos de Santiago de Cali,
    incluyendo coordenadas geográficas y métricas asociadas de inversión pública y alertas.
    """
    metricas = CommuneRepository.obtener_metricas_comunas(db)
    return metricas


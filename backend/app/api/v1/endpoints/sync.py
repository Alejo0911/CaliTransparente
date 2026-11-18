from fastapi import APIRouter, BackgroundTasks, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db, SessionLocal
from app.services.etl_service import SecopETLService

router = APIRouter(prefix="/sincronizar", tags=["Sincronización ETL"])


def _tarea_sincronizacion():
    db = SessionLocal()
    try:
        etl = SecopETLService()
        etl.sincronizar_todas_las_entidades(db, limite_por_entidad=150)
    finally:
        db.close()


@router.post("", tags=["Sincronización ETL"])
def sincronizar_secop(background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    Dispara la sincronización asíncrona de datos desde la API de SECOP II hacia
    la base de datos local en segundo plano sin bloquear al usuario.
    """
    background_tasks.add_task(_tarea_sincronizacion)
    return {
        "status": "iniciado",
        "mensaje": "Proceso de extracción y carga ETL ejecutándose en segundo plano."
    }


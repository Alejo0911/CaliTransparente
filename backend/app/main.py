import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.session import engine, Base, check_db_connection, SessionLocal
from app.db.models import EntidadModel, ContratoModel
from app.repositories.commune_repo import CommuneRepository
from app.services.socrata_service import SocrataService
from app.services.etl_service import SecopETLService
from app.api.v1.api import api_router

logger = logging.getLogger("uvicorn.error")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Inicializar tablas de base de datos
    Base.metadata.create_all(bind=engine)
    
    # Precargar catálogo de comunas y entidades de Cali si no existen
    db = SessionLocal()
    try:
        CommuneRepository.seed_comunas_si_no_existen(db)
        
        nombres_entidades = {
            "890399011": "ALCALDÍA DE SANTIAGO DE CALI",
            "890399003": "EMPRESAS MUNICIPALES DE CALI - EMCALI E.I.C.E. E.S.P.",
            "805013171": "METRO CALI S.A.",
            "805027556": "EMPRESA MUNICIPAL DE RENOVACIÓN URBANA - EMRU"
        }
        for clave, nit in settings.ENTIDADES_CALI.items():
            ent = db.query(EntidadModel).filter(EntidadModel.nit == nit).first()
            if not ent:
                db.add(EntidadModel(
                    nit=nit,
                    nombre=nombres_entidades.get(nit, f"ENTIDAD {clave.upper()} DE CALI"),
                    tipo="Distrital"
                ))
        db.commit()

        # Si la base de datos de contratos está vacía, poblar con contratos reales de SECOP II
        total_contratos = db.query(ContratoModel).count()
        if total_contratos == 0:
            logger.info("Base de datos sin contratos. Ejecutando sincronización inicial de SECOP II...")
            etl = SecopETLService()
            etl.sincronizar_todas_las_entidades(db, limite_por_entidad=100)
            logger.info(f"Sincronización inicial completada. Total contratos en BD: {db.query(ContratoModel).count()}")
    except Exception as e:
        logger.warning(f"[Startup Warning] Error en inicialización de datos: {e}")
    finally:
        db.close()

    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Plataforma de Analítica y Veeduría Ciudadana - Contratación Pública en Santiago de Cali (SECOP II)",
    version=settings.VERSION,
    lifespan=lifespan,
)

# Middleware CORS para permitir peticiones desde Vite / React
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Montar las rutas de la API v1
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/health", tags=["Sistema"])
async def health_check():
    """Estado del sistema, verificación de conexión a BD y estado de la API SECOP II."""
    db_status = check_db_connection()
    secop_status = await SocrataService.verificar_estado_secop()
    
    status_global = "ok" if db_status.get("status") == "connected" and secop_status.get("online") else "degraded"
    
    return {
        "status": status_global,
        "proyecto": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "database": db_status,
        "secop_api": secop_status,
    }

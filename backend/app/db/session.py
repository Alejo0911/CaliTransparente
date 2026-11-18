import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

logger = logging.getLogger("uvicorn.error")

# Base declarativa para modelos ORM
Base = declarative_base()

def _get_engine(db_url: str):
    if db_url.startswith("sqlite"):
        return create_engine(
            db_url,
            connect_args={"check_same_thread": False},
            future=True
        )
    return create_engine(
        db_url,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20,
        future=True
    )

database_url = settings.DATABASE_URL
try:
    engine = _get_engine(database_url)
    # Probar conexión si no es sqlite
    if not database_url.startswith("sqlite"):
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
    logger.info(f"Conexión a BD establecida con: {database_url.split('@')[-1]}")
except Exception as e:
    logger.warning(f"No se pudo conectar a PostgreSQL ({e}). Usando base de datos SQLite de desarrollo local.")
    database_url = "sqlite:///./cali_transparente.db"
    engine = _get_engine(database_url)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    future=True
)

def check_db_connection() -> dict:
    """Verifica el estado de la conexión a la base de datos."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {
            "status": "connected",
            "dialect": engine.dialect.name,
            "url": engine.url.render_as_string(hide_password=True)
        }
    except Exception as exc:
        return {
            "status": "disconnected",
            "error": str(exc),
            "dialect": engine.dialect.name
        }

def get_db():
    """Generador de sesiones de base de datos para inyección de dependencias."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

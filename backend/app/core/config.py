import os
from typing import List, Dict
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "CaliTransparente API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # URL oficial de la API de SECOP II en Datos Abiertos Colombia
    SOCRATA_BASE_URL: str = "https://www.datos.gov.co/resource/jbjy-vk9h.json"
    SOCRATA_APP_TOKEN: str = os.getenv("SOCRATA_APP_TOKEN", "")

    # Base de Datos: PostgreSQL por defecto, fallback a SQLite local si no está configurada
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql+psycopg2://postgres:postgres@localhost:5432/cali_transparente"
    )

    # CORS habilitado para frontend local Vite
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "*"
    ]

    # Diccionario oficial de NITs de entidades descentralizadas y centrales de Santiago de Cali
    ENTIDADES_CALI: Dict[str, str] = {
        "alcaldia": "890399011",
        "emcali": "890399003",
        "metrocali": "805013171",
        "emru": "805027556",
    }

    model_config = {
        "env_file": ".env",
        "extra": "ignore",
    }


settings = Settings()

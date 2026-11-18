import re
import logging
from typing import Optional
import requests
import pandas as pd
from sqlalchemy.orm import Session

from app.core.config import settings
from app.repositories.contract_repo import ContractRepository
from app.repositories.commune_repo import CommuneRepository
from app.db.models import EntidadModel

logger = logging.getLogger("uvicorn.error")


def _detectar_comuna_desde_texto(texto: str) -> Optional[str]:
    """Extrae el número de comuna si está presente en el objeto del contrato."""
    if not texto:
        return None
    match = re.search(r"comuna\s*(\d{1,2})", texto, re.IGNORECASE)
    if match:
        num = int(match.group(1))
        if 1 <= num <= 22:
            return str(num)
    if re.search(r"corregimiento\s*norte|golondrinas|montebello", texto, re.IGNORECASE):
        return "rural-norte"
    if re.search(r"corregimiento\s*sur|pance|villacarmelo", texto, re.IGNORECASE):
        return "rural-sur"
    return None


class SecopETLService:
    def __init__(self, api_url: Optional[str] = None):
        self.api_url = api_url or settings.SOCRATA_BASE_URL

    def extraer_datos(self, nit_entidad: str, limite: int = 100) -> pd.DataFrame:
        """Extrae registros de la API Socrata filtrando por el NIT de la entidad."""
        query = f"""
            SELECT 
                id_contrato,
                numero_proceso,
                objeto_del_contrato,
                valor_del_contrato,
                fecha_de_firma,
                modalidad_de_contratacion,
                estado_contrato,
                proveedor_adjudicado,
                documento_proveedor,
                urlproceso,
                nit_entidad,
                nombre_entidad
            WHERE nit_entidad = '{nit_entidad}'
            ORDER BY fecha_de_firma DESC
            LIMIT {limite}
        """
        headers = {"Accept": "application/json"}
        if settings.SOCRATA_APP_TOKEN:
            headers["X-App-Token"] = settings.SOCRATA_APP_TOKEN

        try:
            response = requests.get(
                self.api_url, 
                params={"$query": query}, 
                headers=headers, 
                timeout=20
            )
            response.raise_for_status()
            data = response.json()
            if not data:
                return pd.DataFrame()
            return pd.DataFrame(data)
        except Exception as e:
            logger.error(f"Error en extracción ETL para NIT {nit_entidad}: {e}")
            return pd.DataFrame()

    def transformar_datos(self, df: pd.DataFrame) -> pd.DataFrame:
        """Limpieza, normalización y transformación de datos para el modelo."""
        if df.empty:
            return df

        df_limpio = df.copy()

        mapeo_columnas = {
            'id_contrato': 'id_contrato',
            'numero_proceso': 'numero_proceso',
            'objeto_del_contrato': 'objeto_contrato',
            'valor_del_contrato': 'cuantia',
            'fecha_de_firma': 'fecha_firma',
            'modalidad_de_contratacion': 'modalidad',
            'estado_contrato': 'estado',
            'proveedor_adjudicado': 'contratista_nombre',
            'documento_proveedor': 'contratista_nit',
            'urlproceso': 'url_proceso',
            'nit_entidad': 'nit_entidad',
            'nombre_entidad': 'nombre_entidad'
        }
        
        cols_a_renombrar = {k: v for k, v in mapeo_columnas.items() if k in df_limpio.columns}
        df_limpio.rename(columns=cols_a_renombrar, inplace=True)

        if 'cuantia' in df_limpio.columns:
            df_limpio['cuantia'] = pd.to_numeric(df_limpio['cuantia'], errors='coerce').fillna(0.0)

        if 'fecha_firma' in df_limpio.columns:
            df_limpio['fecha_firma'] = pd.to_datetime(df_limpio['fecha_firma'], errors='coerce')

        # Normalizar url_proceso si viene como dict
        if 'url_proceso' in df_limpio.columns:
            df_limpio['url_proceso'] = df_limpio['url_proceso'].apply(
                lambda u: u.get('url', '') if isinstance(u, dict) else (u if isinstance(u, str) else '')
            )

        # Detectar comuna asociada en el objeto
        if 'objeto_contrato' in df_limpio.columns:
            df_limpio['id_comuna'] = df_limpio['objeto_contrato'].apply(_detectar_comuna_desde_texto)

        return df_limpio

    def cargar_a_base_datos(self, db: Session, df: pd.DataFrame) -> int:
        """Upsert de los contratos en PostgreSQL / SQLite."""
        if df.empty:
            return 0

        CommuneRepository.seed_comunas_si_no_existen(db)
        contador = 0

        for _, row in df.iterrows():
            nit = row.get("nit_entidad")
            if not nit:
                continue

            entidad_db = db.query(EntidadModel).filter(EntidadModel.nit == nit).first()
            if not entidad_db:
                entidad_db = EntidadModel(
                    nit=nit, 
                    nombre=row.get("nombre_entidad", f"ENTIDAD CALI {nit}"),
                    tipo="Municipal"
                )
                db.add(entidad_db)
                db.commit()

            contrato_dict = {
                "id_contrato": row.get("id_contrato"),
                "numero_proceso": row.get("numero_proceso"),
                "objeto_contrato": row.get("objeto_contrato", "SIN ESPECIFICAR"),
                "cuantia": float(row.get("cuantia", 0.0)),
                "fecha_firma": row.get("fecha_firma") if pd.notnull(row.get("fecha_firma")) else None,
                "modalidad": row.get("modalidad"),
                "estado": row.get("estado"),
                "contratista_nombre": row.get("contratista_nombre"),
                "contratista_nit": str(row.get("contratista_nit", "")),
                "url_proceso": row.get("url_proceso"),
                "nit_entidad": nit,
                "id_comuna": row.get("id_comuna")
            }

            try:
                ContractRepository.guardar_o_actualizar(db, contrato_dict)
                contador += 1
            except Exception as e:
                db.rollback()
                logger.warning(f"Error al insertar contrato {contrato_dict.get('id_contrato')}: {e}")

        return contador

    def ejecutar_pipeline_para_entidad(self, db: Session, nombre_clave: str, limite: int = 50) -> int:
        nit = settings.ENTIDADES_CALI.get(nombre_clave.lower())
        if not nit:
            raise ValueError(f"Entidad no encontrada en el catálogo: {nombre_clave}")

        df_raw = self.extraer_datos(nit_entidad=nit, limite=limite)
        df_clean = self.transformar_datos(df_raw)
        return self.cargar_a_base_datos(db, df_clean)

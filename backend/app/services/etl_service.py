import re
import logging
from typing import Optional, Dict
from datetime import datetime
import requests
import pandas as pd
from sqlalchemy.orm import Session

from app.core.config import settings
from app.repositories.contract_repo import ContractRepository
from app.repositories.commune_repo import CommuneRepository
from app.db.models import EntidadModel

logger = logging.getLogger("uvicorn.error")

NOMBRES_ENTIDADES_CALI = {
    "890399011": "ALCALDÍA DE SANTIAGO DE CALI",
    "890399003": "EMPRESAS MUNICIPALES DE CALI - EMCALI E.I.C.E. E.S.P.",
    "805013171": "METRO CALI S.A.",
    "805027556": "EMPRESA MUNICIPAL DE RENOVACIÓN URBANA - EMRU",
}


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


def _extraer_anio(fecha_firma, fecha_inicio, fecha_fin, proceso, id_contrato) -> Optional[int]:
    """Determina la vigencia o año del contrato."""
    for dt in [fecha_firma, fecha_inicio, fecha_fin]:
        if pd.notnull(dt) and hasattr(dt, "year"):
            return int(dt.year)
    for text in [proceso, id_contrato]:
        if text and pd.notnull(text):
            match = re.search(r"(202[0-7])", str(text))
            if match:
                return int(match.group(1))
    return 2024  # Valor representativo por defecto para contratos históricos


class SecopETLService:
    def __init__(self, api_url: Optional[str] = None):
        self.api_url = api_url or settings.SOCRATA_BASE_URL

    def extraer_datos(self, nit_entidad: str, limite: int = 150) -> pd.DataFrame:
        """Extrae registros de la API Socrata filtrando por el NIT de la entidad con campos válidos de SECOP II."""
        query = (
            f"SELECT id_contrato, proceso_de_compra, objeto_del_contrato, valor_del_contrato, "
            f"fecha_de_firma, fecha_de_inicio_del_contrato, fecha_de_fin_del_contrato, "
            f"modalidad_de_contratacion, estado_contrato, proveedor_adjudicado, "
            f"documento_proveedor, urlproceso, nit_entidad, nombre_entidad "
            f"WHERE nit_entidad = '{nit_entidad}' "
            f"ORDER BY fecha_de_firma DESC "
            f"LIMIT {limite}"
        )
        headers = {"Accept": "application/json"}
        if settings.SOCRATA_APP_TOKEN:
            headers["X-App-Token"] = settings.SOCRATA_APP_TOKEN

        try:
            response = requests.get(
                self.api_url, 
                params={"$query": query}, 
                headers=headers, 
                timeout=25
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
            'proceso_de_compra': 'numero_proceso',
            'objeto_del_contrato': 'objeto_contrato',
            'valor_del_contrato': 'cuantia',
            'fecha_de_firma': 'fecha_firma',
            'fecha_de_inicio_del_contrato': 'fecha_inicio',
            'fecha_de_fin_del_contrato': 'fecha_fin',
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

        for col_f in ['fecha_firma', 'fecha_inicio', 'fecha_fin']:
            if col_f in df_limpio.columns:
                df_limpio[col_f] = pd.to_datetime(df_limpio[col_f], errors='coerce')

        # Normalizar url_proceso si viene como dict
        if 'url_proceso' in df_limpio.columns:
            df_limpio['url_proceso'] = df_limpio['url_proceso'].apply(
                lambda u: u.get('url', '') if isinstance(u, dict) else (u if isinstance(u, str) else '')
            )

        # Detectar comuna asociada en el objeto
        if 'objeto_contrato' in df_limpio.columns:
            df_limpio['id_comuna'] = df_limpio['objeto_contrato'].apply(_detectar_comuna_desde_texto)

        # Extraer año de firma
        df_limpio['anio_firma'] = df_limpio.apply(
            lambda r: _extraer_anio(
                r.get('fecha_firma'),
                r.get('fecha_inicio'),
                r.get('fecha_fin'),
                r.get('numero_proceso'),
                r.get('id_contrato')
            ),
            axis=1
        )

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
                nombre_ent = NOMBRES_ENTIDADES_CALI.get(nit, row.get("nombre_entidad", f"ENTIDAD CALI {nit}"))
                entidad_db = EntidadModel(
                    nit=nit, 
                    nombre=nombre_ent,
                    tipo="Distrital"
                )
                db.add(entidad_db)
                db.commit()

            comuna_val = row.get("id_comuna")
            if pd.isna(comuna_val) or str(comuna_val).lower() == "nan":
                comuna_val = None

            anio_val = row.get("anio_firma")
            if pd.isna(anio_val) or str(anio_val).lower() == "nan":
                anio_val = None
            else:
                try:
                    anio_val = int(anio_val)
                except (ValueError, TypeError):
                    anio_val = None

            contrato_dict = {
                "id_contrato": str(row.get("id_contrato")),
                "numero_proceso": str(row.get("numero_proceso")) if pd.notnull(row.get("numero_proceso")) else None,
                "objeto_contrato": str(row.get("objeto_contrato", "SIN ESPECIFICAR")),
                "cuantia": float(row.get("cuantia", 0.0)),
                "fecha_firma": row.get("fecha_firma") if pd.notnull(row.get("fecha_firma")) else None,
                "anio_firma": anio_val,
                "modalidad": str(row.get("modalidad")) if pd.notnull(row.get("modalidad")) else "Contratación directa",
                "estado": str(row.get("estado")) if pd.notnull(row.get("estado")) else "Enviado Proveedor",
                "contratista_nombre": str(row.get("contratista_nombre")) if pd.notnull(row.get("contratista_nombre")) else "NO REGISTRADO",
                "contratista_nit": str(row.get("contratista_nit")) if pd.notnull(row.get("contratista_nit")) else "",
                "url_proceso": str(row.get("url_proceso")) if pd.notnull(row.get("url_proceso")) else None,
                "nit_entidad": nit,
                "id_comuna": comuna_val
            }

            try:
                ContractRepository.guardar_o_actualizar(db, contrato_dict)
                contador += 1
            except Exception as e:
                db.rollback()
                logger.warning(f"Error al insertar contrato {contrato_dict.get('id_contrato')}: {e}")

        return contador

    def sincronizar_todas_las_entidades(self, db: Session, limite_por_entidad: int = 150) -> Dict[str, int]:
        """Sincroniza todas las entidades de Cali en la base de datos."""
        resumen = {}
        for entidad_clave, nit in settings.ENTIDADES_CALI.items():
            try:
                df_raw = self.extraer_datos(nit_entidad=nit, limite=limite_por_entidad)
                df_clean = self.transformar_datos(df_raw)
                total = self.cargar_a_base_datos(db, df_clean)
                resumen[entidad_clave] = total
            except Exception as exc:
                logger.error(f"Error al sincronizar entidad {entidad_clave}: {exc}")
                resumen[entidad_clave] = 0
        return resumen

    def ejecutar_pipeline_para_entidad(self, db: Session, nombre_clave: str, limite: int = 150) -> int:
        nit = settings.ENTIDADES_CALI.get(nombre_clave.lower())
        if not nit:
            raise ValueError(f"Entidad no encontrada en el catálogo: {nombre_clave}")

        df_raw = self.extraer_datos(nit_entidad=nit, limite=limite)
        df_clean = self.transformar_datos(df_raw)
        return self.cargar_a_base_datos(db, df_clean)

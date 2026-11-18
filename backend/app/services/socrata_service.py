import logging
from typing import Optional, List, Dict, Any
import httpx
from fastapi import HTTPException
from app.core.config import settings

logger = logging.getLogger("uvicorn.error")


class SocrataService:
    @staticmethod
    def _normalizar_contrato(c: Dict[str, Any]) -> Dict[str, Any]:
        """Limpia y estandariza los campos del contrato de SECOP II."""
        # Limpieza de valor
        raw_val = c.get("valor_del_contrato", 0)
        try:
            val_float = float(raw_val) if raw_val is not None else 0.0
        except (ValueError, TypeError):
            val_float = 0.0

        # Normalizar urlproceso
        url_raw = c.get("urlproceso")
        url_str = ""
        if isinstance(url_raw, dict):
            url_str = url_raw.get("url", "")
        elif isinstance(url_raw, str):
            url_str = url_raw

        modalidad = c.get("modalidad_de_contratacion", "") or ""
        # Asignar nivel de riesgo inicial
        nivel_riesgo = "bajo"
        if modalidad.lower() == "contratación directa":
            if val_float >= 500_000_000:
                nivel_riesgo = "alto"
            elif val_float >= 100_000_000:
                nivel_riesgo = "medio"

        return {
            "id_contrato": c.get("id_contrato"),
            "nombre_entidad": c.get("nombre_entidad"),
            "nit_entidad": c.get("nit_entidad"),
            "estado_contrato": c.get("estado_contrato"),
            "modalidad_de_contratacion": modalidad,
            "objeto_del_contrato": c.get("objeto_del_contrato"),
            "valor_del_contrato": val_float,
            "fecha_de_firma": c.get("fecha_de_firma"),
            "proveedor_adjudicado": c.get("proveedor_adjudicado"),
            "documento_proveedor": c.get("documento_proveedor"),
            "urlproceso": url_str if url_str else url_raw,
            "nivel_riesgo": nivel_riesgo,
        }

    @classmethod
    async def _ejecutar_soql(cls, query_soql: str) -> List[Dict[str, Any]]:
        """Ejecuta una consulta SoQL asíncrona contra la API de Datos Abiertos."""
        headers = {"Accept": "application/json"}
        if settings.SOCRATA_APP_TOKEN:
            headers["X-App-Token"] = settings.SOCRATA_APP_TOKEN

        async with httpx.AsyncClient(timeout=25.0) as client:
            try:
                response = await client.get(
                    settings.SOCRATA_BASE_URL,
                    params={"$query": query_soql},
                    headers=headers,
                )
                response.raise_for_status()
                data = response.json()
                return [cls._normalizar_contrato(item) for item in data]
            except httpx.HTTPStatusError as exc:
                logger.error(f"Error HTTP Socrata ({exc.response.status_code}): {exc.response.text}")
                raise HTTPException(
                    status_code=502,
                    detail=f"Error en respuesta de SECOP II ({exc.response.status_code})",
                )
            except httpx.RequestError as exc:
                logger.error(f"Fallo de conexión con Socrata: {exc}")
                raise HTTPException(
                    status_code=504,
                    detail=f"Tiempo de espera agotado o fallo de red con Datos Abiertos: {str(exc)}",
                )

    @classmethod
    async def obtener_contratos_cali(
        cls,
        nit: str,
        palabra_clave: Optional[str] = None,
        monto_minimo: Optional[int] = None,
        solo_directa: bool = False,
        limite: int = 50,
    ) -> List[Dict[str, Any]]:
        """Construye y ejecuta la consulta SoQL filtrada para una entidad de Cali."""
        condiciones = [f"nit_entidad = '{nit}'"]

        if palabra_clave:
            texto_limpio = palabra_clave.replace("'", "''").lower()
            condiciones.append(f"lower(objeto_del_contrato) LIKE '%{texto_limpio}%'")

        if monto_minimo is not None and monto_minimo > 0:
            condiciones.append(f"valor_del_contrato >= {monto_minimo}")

        if solo_directa:
            condiciones.append("modalidad_de_contratacion = 'Contratación directa'")

        where_clause = " AND ".join(condiciones)

        query = f"""
            SELECT 
                id_contrato,
                nombre_entidad,
                nit_entidad,
                estado_contrato,
                modalidad_de_contratacion,
                objeto_del_contrato,
                valor_del_contrato,
                fecha_de_firma,
                proveedor_adjudicado,
                documento_proveedor,
                urlproceso
            WHERE {where_clause}
            ORDER BY fecha_de_firma DESC
            LIMIT {limite}
        """
        return await cls._ejecutar_soql(query)

    @classmethod
    async def obtener_alertas_contratacion_directa(cls, monto_alerta: int = 100_000_000) -> List[Dict[str, Any]]:
        """Detecta contratos directos de alto valor en todas las entidades principales de Cali."""
        nits = "', '".join(settings.ENTIDADES_CALI.values())

        query = f"""
            SELECT 
                id_contrato,
                nombre_entidad,
                nit_entidad,
                estado_contrato,
                modalidad_de_contratacion,
                objeto_del_contrato,
                valor_del_contrato,
                fecha_de_firma,
                proveedor_adjudicado,
                documento_proveedor,
                urlproceso
            WHERE 
                nit_entidad IN ('{nits}')
                AND modalidad_de_contratacion = 'Contratación directa'
                AND valor_del_contrato >= {monto_alerta}
            ORDER BY valor_del_contrato DESC
            LIMIT 50
        """
        return await cls._ejecutar_soql(query)

    @classmethod
    async def verificar_estado_secop(cls) -> Dict[str, Any]:
        """Verifica la conectividad básica con la API de Datos Abiertos."""
        headers = {"Accept": "application/json"}
        if settings.SOCRATA_APP_TOKEN:
            headers["X-App-Token"] = settings.SOCRATA_APP_TOKEN

        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.get(
                    settings.SOCRATA_BASE_URL,
                    params={"$limit": "1"},
                    headers=headers,
                )
                return {
                    "online": response.status_code == 200,
                    "status_code": response.status_code,
                    "endpoint": settings.SOCRATA_BASE_URL
                }
            except Exception as e:
                return {
                    "online": False,
                    "error": str(e),
                    "endpoint": settings.SOCRATA_BASE_URL
                }

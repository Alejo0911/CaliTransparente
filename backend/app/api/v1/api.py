from fastapi import APIRouter
from app.api.v1.endpoints import contracts, alerts, communes, kpis

api_router = APIRouter()
api_router.include_router(contracts.router)
api_router.include_router(alerts.router)
api_router.include_router(communes.router)
api_router.include_router(kpis.router)


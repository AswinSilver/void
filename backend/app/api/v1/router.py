from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, scans, dashboard, threat_intel, reports, ai_chat

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(scans.router, prefix="/scans", tags=["Scans"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
api_router.include_router(threat_intel.router, prefix="/threat-intel", tags=["Threat Intelligence"])
api_router.include_router(reports.router, prefix="/reports", tags=["Reports"])
api_router.include_router(ai_chat.router, prefix="/ai", tags=["AI Chat"])

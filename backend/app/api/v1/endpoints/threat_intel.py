from fastapi import APIRouter, Depends, Query
from typing import Optional
from app.core.security import get_current_user
from app.models.models import User

router = APIRouter()


@router.get("/lookup")
async def lookup_ioc(
    ioc_type: str = Query(..., description="url | ip | domain | hash | email"),
    value: str = Query(..., description="The IOC value to look up"),
    current_user: User = Depends(get_current_user),
):
    """
    Look up an IOC across VirusTotal, AbuseIPDB, URLhaus, AlienVault OTX, OpenPhish.
    TODO: Implement actual API integrations.
    """
    from app.services.threat_intel import perform_threat_intel_lookup
    result = await perform_threat_intel_lookup(ioc_type, value)
    return {
        "ioc_type": ioc_type,
        "value": value,
        "sources": result
    }

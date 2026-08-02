from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import User, Report, ScanRecord

router = APIRouter()


@router.get("/{scan_id}")
async def get_report(
    scan_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Report).join(ScanRecord).where(
            ScanRecord.id == scan_id,
            ScanRecord.user_id == current_user.id,
        )
    )
    report = result.scalar_one_or_none()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    return {
        "id": str(report.id),
        "scan_id": str(report.scan_id),
        "title": report.title,
        "executive_summary": report.executive_summary,
        "technical_summary": report.technical_summary,
        "recommendations": report.recommendations,
        "mitre_techniques": report.mitre_techniques,
        "affected_assets": report.affected_assets,
        "evidence_urls": report.evidence_urls,
        "created_at": report.created_at.isoformat(),
    }

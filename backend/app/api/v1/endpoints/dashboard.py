from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, select, and_
from datetime import datetime, timedelta
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import User, ScanRecord, RiskLevel, ScanType

router = APIRouter()


@router.get("/stats")
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    week_ago = datetime.utcnow() - timedelta(days=7)

    base_filter = ScanRecord.user_id == current_user.id

    # Today's scans
    today_scans = await db.execute(
        select(func.count()).select_from(ScanRecord).where(and_(base_filter, ScanRecord.created_at >= today))
    )
    today_count = today_scans.scalar()

    # High risk
    high_risk = await db.execute(
        select(func.count()).select_from(ScanRecord).where(and_(
            base_filter,
            ScanRecord.risk_level.in_([RiskLevel.high, RiskLevel.critical]),
            ScanRecord.created_at >= today,
        ))
    )
    high_risk_count = high_risk.scalar()

    # Total scans
    total = await db.execute(select(func.count()).select_from(ScanRecord).where(base_filter))
    total_count = total.scalar()

    # Detected phishing
    phishing = await db.execute(
        select(func.count()).select_from(ScanRecord).where(and_(
            base_filter,
            ScanRecord.risk_level.in_([RiskLevel.high, RiskLevel.critical]),
        ))
    )
    phishing_count = phishing.scalar()

    # False positives
    fp = await db.execute(
        select(func.count()).select_from(ScanRecord).where(and_(
            base_filter, ScanRecord.is_false_positive == True
        ))
    )
    fp_count = fp.scalar()

    # Scan type distribution
    type_dist_result = await db.execute(
        select(ScanRecord.scan_type, func.count()).select_from(ScanRecord)
        .where(base_filter).group_by(ScanRecord.scan_type)
    )
    type_dist = {row[0].value: row[1] for row in type_dist_result.fetchall()}

    # Risk distribution
    risk_dist_result = await db.execute(
        select(ScanRecord.risk_level, func.count()).select_from(ScanRecord)
        .where(and_(base_filter, ScanRecord.risk_level.isnot(None)))
        .group_by(ScanRecord.risk_level)
    )
    risk_dist = {row[0].value: row[1] for row in risk_dist_result.fetchall()}

    # Recent 5 scans
    recent_result = await db.execute(
        select(ScanRecord).where(base_filter)
        .order_by(ScanRecord.created_at.desc()).limit(5)
    )
    recent_scans = recent_result.scalars().all()

    return {
        "today_scans": today_count,
        "high_risk_today": high_risk_count,
        "total_scans": total_count,
        "detected_phishing": phishing_count,
        "false_positives": fp_count,
        "scan_type_distribution": type_dist,
        "risk_distribution": risk_dist,
        "recent_scans": [
            {
                "id": str(s.id),
                "scan_type": s.scan_type.value,
                "target": s.target[:80],
                "risk_level": s.risk_level.value if s.risk_level else None,
                "risk_score": s.risk_score,
                "status": s.status,
                "created_at": s.created_at.isoformat(),
            }
            for s in recent_scans
        ],
    }

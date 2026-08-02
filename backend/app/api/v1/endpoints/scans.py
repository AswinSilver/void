from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from pydantic import BaseModel, HttpUrl
from typing import Optional
import uuid
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import User, ScanRecord, ScanType, RiskLevel

router = APIRouter()


class URLScanRequest(BaseModel):
    url: str
    deep_scan: bool = False


class SMSScanRequest(BaseModel):
    message: str


class QRScanRequest(BaseModel):
    extracted_text: str  # text extracted from QR


@router.post("/url")
async def scan_url(
    data: URLScanRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    scan = ScanRecord(
        id=uuid.uuid4(),
        scan_type=ScanType.url,
        target=data.url,
        status="pending",
        user_id=current_user.id,
    )
    db.add(scan)
    await db.commit()
    await db.refresh(scan)
    from app.workers.tasks import scan_url as scan_url_task
    scan_url_task.delay(str(scan.id), data.url)
    return {"scan_id": str(scan.id), "status": "pending"}


@router.post("/email")
async def scan_email(
    file: UploadFile = File(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    content = await file.read() if file else b""
    scan = ScanRecord(
        id=uuid.uuid4(),
        scan_type=ScanType.email,
        target=file.filename if file else "raw_email",
        status="pending",
        user_id=current_user.id,
    )
    db.add(scan)
    await db.commit()
    await db.refresh(scan)
    from app.workers.tasks import scan_email as scan_email_task
    scan_email_task.delay(str(scan.id), content, file.filename if file else "raw_email")
    return {"scan_id": str(scan.id), "status": "pending"}


@router.post("/sms")
async def scan_sms(
    data: SMSScanRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    scan = ScanRecord(
        id=uuid.uuid4(),
        scan_type=ScanType.sms,
        target=data.message[:200],
        status="pending",
        user_id=current_user.id,
    )
    db.add(scan)
    await db.commit()
    await db.refresh(scan)
    from app.workers.tasks import scan_sms as scan_sms_task
    scan_sms_task.delay(str(scan.id), data.message)
    return {"scan_id": str(scan.id), "status": "pending"}


@router.post("/domain")
async def scan_domain(
    domain: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    scan = ScanRecord(
        id=uuid.uuid4(),
        scan_type=ScanType.domain,
        target=domain,
        status="pending",
        user_id=current_user.id,
    )
    db.add(scan)
    await db.commit()
    await db.refresh(scan)
    from app.workers.tasks import scan_domain as scan_domain_task
    scan_domain_task.delay(str(scan.id), domain)
    return {"scan_id": str(scan.id), "status": "pending"}


@router.post("/qr")
async def scan_qr(
    data: QRScanRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    scan = ScanRecord(
        id=uuid.uuid4(),
        scan_type=ScanType.qr,
        target=data.extracted_text[:200] if data.extracted_text else "QR Code",
        status="pending",
        user_id=current_user.id,
    )
    db.add(scan)
    await db.commit()
    await db.refresh(scan)
    from app.workers.tasks import scan_qr as scan_qr_task
    scan_qr_task.delay(str(scan.id), data.extracted_text)
    return {"scan_id": str(scan.id), "status": "pending"}


@router.get("/{scan_id}")
async def get_scan(
    scan_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ScanRecord).where(and_(
            ScanRecord.id == scan_id,
            ScanRecord.user_id == current_user.id,
        ))
    )
    scan = result.scalar_one_or_none()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")

    return {
        "id": str(scan.id),
        "scan_type": scan.scan_type.value,
        "target": scan.target,
        "status": scan.status,
        "risk_score": scan.risk_score,
        "risk_level": scan.risk_level.value if scan.risk_level else None,
        "verdict": scan.verdict,
        "scan_data": scan.scan_data,
        "ai_analysis": scan.ai_analysis,
        "threat_intel": scan.threat_intel,
        "created_at": scan.created_at.isoformat(),
        "completed_at": scan.completed_at.isoformat() if scan.completed_at else None,
    }


@router.get("/")
async def list_scans(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    scan_type: Optional[str] = None,
    risk_level: Optional[str] = None,
    status: Optional[str] = None,
):
    filters = [ScanRecord.user_id == current_user.id]
    if scan_type:
        filters.append(ScanRecord.scan_type == scan_type)
    if risk_level:
        filters.append(ScanRecord.risk_level == risk_level)
    if status:
        filters.append(ScanRecord.status == status)

    from sqlalchemy import func
    count_result = await db.execute(
        select(func.count()).select_from(ScanRecord).where(and_(*filters))
    )
    total = count_result.scalar()

    result = await db.execute(
        select(ScanRecord).where(and_(*filters))
        .order_by(ScanRecord.created_at.desc())
        .offset((page - 1) * page_size).limit(page_size)
    )
    scans = result.scalars().all()

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "scans": [
            {
                "id": str(s.id),
                "scan_type": s.scan_type.value,
                "target": s.target[:100],
                "status": s.status,
                "risk_score": s.risk_score,
                "risk_level": s.risk_level.value if s.risk_level else None,
                "verdict": s.verdict,
                "is_bookmarked": s.is_bookmarked,
                "is_false_positive": s.is_false_positive,
                "created_at": s.created_at.isoformat(),
            }
            for s in scans
        ]
    }

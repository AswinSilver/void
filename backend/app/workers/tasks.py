import asyncio
from datetime import datetime
import uuid

from app.workers.celery_app import celery_app
from app.services.url_scanner import perform_url_scan
from app.services.email_scanner import perform_email_scan
from app.services.domain_scanner import perform_domain_scan
from app.services.sms_scanner import perform_sms_scan
from app.services.qr_scanner import perform_qr_scan
from app.core.database import AsyncSessionLocal
from app.models.models import ScanRecord

async def update_db_record(scan_id: str, result: dict):
    async with AsyncSessionLocal() as db:
        scan = await db.get(ScanRecord, uuid.UUID(scan_id))
        if scan:
            scan.status = "done"
            scan.risk_score = result.get("risk_score")
            scan.risk_level = result.get("risk_level")
            scan.verdict = result.get("verdict")
            scan.scan_data = result.get("scan_data", {})
            scan.ai_analysis = result.get("ai_analysis", {})
            scan.threat_intel = result.get("threat_intel", {})
            scan.completed_at = datetime.utcnow()
            await db.commit()

async def scan_url(scan_id: str, url: str):
    result = await perform_url_scan(url)
    await update_db_record(scan_id, result)
    return {"scan_id": scan_id, "status": "done"}

async def scan_email(scan_id: str, file_content: bytes, filename: str):
    result = await perform_email_scan(file_content, filename)
    await update_db_record(scan_id, result)
    return {"scan_id": scan_id, "status": "done"}

async def scan_domain(scan_id: str, domain: str):
    result = await perform_domain_scan(domain)
    await update_db_record(scan_id, result)
    return {"scan_id": scan_id, "status": "done"}

async def scan_sms(scan_id: str, message: str):
    result = await perform_sms_scan(message)
    await update_db_record(scan_id, result)
    return {"scan_id": scan_id, "status": "done"}

async def scan_qr(scan_id: str, extracted_text: str):
    result = await perform_qr_scan(extracted_text)
    await update_db_record(scan_id, result)
    return {"scan_id": scan_id, "status": "done"}

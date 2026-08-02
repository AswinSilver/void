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

@celery_app.task(name="app.workers.tasks.scan_url", bind=True)
def scan_url(self, scan_id: str, url: str):
    result = asyncio.run(perform_url_scan(url))
    asyncio.run(update_db_record(scan_id, result))
    return {"scan_id": scan_id, "status": "done"}

@celery_app.task(name="app.workers.tasks.scan_email", bind=True)
def scan_email(self, scan_id: str, file_content: bytes, filename: str):
    result = asyncio.run(perform_email_scan(file_content, filename))
    asyncio.run(update_db_record(scan_id, result))
    return {"scan_id": scan_id, "status": "done"}

@celery_app.task(name="app.workers.tasks.scan_domain", bind=True)
def scan_domain(self, scan_id: str, domain: str):
    result = asyncio.run(perform_domain_scan(domain))
    asyncio.run(update_db_record(scan_id, result))
    return {"scan_id": scan_id, "status": "done"}

@celery_app.task(name="app.workers.tasks.scan_sms", bind=True)
def scan_sms(self, scan_id: str, message: str):
    result = asyncio.run(perform_sms_scan(message))
    asyncio.run(update_db_record(scan_id, result))
    return {"scan_id": scan_id, "status": "done"}

@celery_app.task(name="app.workers.tasks.scan_qr", bind=True)
def scan_qr(self, scan_id: str, extracted_text: str):
    result = asyncio.run(perform_qr_scan(extracted_text))
    asyncio.run(update_db_record(scan_id, result))
    return {"scan_id": scan_id, "status": "done"}

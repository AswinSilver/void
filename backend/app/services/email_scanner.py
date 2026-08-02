import asyncio
import random
from app.models.models import RiskLevel

async def perform_email_scan(file_content: bytes, filename: str) -> dict:
    """
    Mock Email scanning service for development.
    """
    await asyncio.sleep(4)
    
    scan_data = {
        "headers": {
            "from": "Microsoft Security <security@micros0ft-alerts.net>",
            "reply_to": "no-reply@tracking-domain.ru",
            "subject": "Urgent: Your account will be suspended in 24 hours",
            "date": "Fri, 1 Aug 2024 09:22:11 +0000",
            "message_id": "<abc123@micros0ft-alerts.net>",
            "received_count": 4,
        },
        "auth": {
            "spf": {"result": "fail", "domain": "micros0ft-alerts.net"},
            "dkim": {"result": "none", "domain": "N/A"},
            "dmarc": {"result": "fail", "policy": "none"},
        },
        "links": [
            {"url": "https://login.micros0ft.net/verify", "risk": "critical"},
            {"url": "https://click.tracking.ru/?id=abc123", "risk": "high"},
        ],
        "attachments": [],
        "indicators": [
            "SPF authentication failed — email not sent from claimed domain",
            "DKIM signature absent — cannot verify email integrity",
            "DMARC policy check failed",
            "Reply-To address uses .ru TLD — suspicious for Microsoft communications",
            "Sender domain 'micros0ft-alerts.net' is typosquatting Microsoft",
            "Urgency language detected: '24 hours', 'suspended'",
            "Embedded link leads to credential harvesting page",
        ],
    }
    
    return {
        "risk_score": random.uniform(85.0, 95.0),
        "risk_level": RiskLevel.high,
        "verdict": "Phishing Email",
        "scan_data": scan_data,
        "ai_analysis": {},
        "threat_intel": {}
    }

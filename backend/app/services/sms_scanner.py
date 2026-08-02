import asyncio
import random
from app.models.models import RiskLevel

async def perform_sms_scan(message: str) -> dict:
    """
    Mock SMS scanning service for development.
    """
    await asyncio.sleep(2)
    
    scan_data = {
        "categories": ["Fake Delivery", "Credential Harvesting", "Urgency Manipulation"],
        "indicators": [
            "Impersonating a major courier service (FedEx/DHL)",
            "Urgency language: 'Your package is on hold'",
            "Shortened/suspicious URL to evade detection",
            "Requests personal information via web form",
            "Sender is a mobile number, not a verified shortcode",
        ],
        "url_found": "https://dl.vry-post.com/track?id=38291",
        "url_risk": "critical",
    }
    
    ai_analysis = {
        "verdict": 'This SMS is a classic "smishing" (SMS phishing) attack mimicking a package delivery notification. The message creates urgency by claiming a package is held, then directs the victim to a fraudulent website to "confirm" their address or pay a small fee — capturing credit card or personal data in the process.'
    }
    
    return {
        "risk_score": random.uniform(85.0, 95.0),
        "risk_level": RiskLevel.high,
        "verdict": "Phishing SMS — Fake Delivery Scam",
        "scan_data": scan_data,
        "ai_analysis": ai_analysis,
        "threat_intel": {}
    }

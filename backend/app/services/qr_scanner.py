import asyncio
import random
from app.models.models import RiskLevel

async def perform_qr_scan(extracted_text: str) -> dict:
    """
    Mock QR scanning service for development.
    """
    await asyncio.sleep(2)
    
    scan_data = {
        "type": "URL",
        "extracted": "https://qr-redirect.me/abc?next=https://fake-apple-id.pw/login" if not extracted_text else extracted_text,
        "final_url": "https://fake-apple-id.pw/login",
        "redirect_count": 2,
        "indicators": [
            "QR redirects twice before reaching destination",
            "Final URL leads to credential harvesting page",
            "Domain 'fake-apple-id.pw' impersonating Apple",
            "Suspicious TLD: .pw (commonly used in phishing)",
        ],
    }
    
    ai_analysis = {
        "verdict": 'This QR code encodes a URL that performs two redirects before landing on a credential harvesting page impersonating Apple ID login. The use of a QR code as an intermediary is a classic smishing vector to bypass link-click protections.'
    }
    
    return {
        "risk_score": random.uniform(88.0, 96.0),
        "risk_level": RiskLevel.high,
        "verdict": "Malicious QR Code",
        "scan_data": scan_data,
        "ai_analysis": ai_analysis,
        "threat_intel": {}
    }

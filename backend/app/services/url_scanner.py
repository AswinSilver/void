import asyncio
from datetime import datetime, timedelta
import random

from app.models.models import RiskLevel

async def perform_url_scan(url: str) -> dict:
    """
    Mock URL scanning service for development.
    Simulates fetching data from threat intelligence sources and performing analysis.
    """
    # Simulate network delay for scanning
    await asyncio.sleep(5)
    
    # Mock data closely resembling the MOCK_RESULT in the frontend
    scan_data = {
        "ssl": {"valid": True, "issuer": "Let's Encrypt", "expiry": (datetime.utcnow() + timedelta(days=180)).strftime("%Y-%m-%d")},
        "domain_age_days": random.randint(1, 30),
        "registrar": "NameCheap, Inc.",
        "registrar_country": "US",
        "ip": f"{random.randint(1, 255)}.{random.randint(1, 255)}.{random.randint(1, 255)}.{random.randint(1, 255)}",
        "asn": "AS13335 Cloudflare",
        "hosting_country": "US",
        "redirect_chain": [
            {"url": "http://suspicious-banking.net", "status": 301},
            {"url": "https://suspicious-banking.net/redir", "status": 302},
            {"url": url, "status": 200},
        ],
        "blacklists": {
            "virustotal": {"detections": random.randint(10, 40), "total": 72},
            "urlhaus": {"found": True},
            "openphish": {"found": True},
        },
        "dns": {"a": ["104.21.89.43"], "mx": [], "ns": ["ns1.cloudflare.com"], "spf": "none", "dmarc": "none"},
    }
    
    ai_analysis = {
        "reasons": [
            "Domain registered very recently — extremely new, typical of phishing infrastructure",
            "Hosted in suspicious ASN (fast-flux behavior detected)",
            f"Known phishing IP — detections found on multiple blacklists",
            "Redirect chain with hops ending on the target URL",
            "Fake bank login page detected via visual AI analysis",
            "Domain is typosquatting a major financial institution",
            "No SPF or DMARC records — easily spoofable domain",
        ],
        "verdict": "This URL is a high-confidence phishing page impersonating a banking portal. The combination of a newly registered domain, aggressive redirect chain, fake login form, and presence on multiple threat intelligence blacklists strongly indicates this is a credential harvesting attack.",
        "mitre": ["T1566.002 – Spear Phishing Link", "T1071.001 – Web Protocols", "T1598 – Phishing for Information"],
    }
    
    return {
        "risk_score": random.uniform(85.0, 98.0),
        "risk_level": RiskLevel.critical,
        "verdict": "Likely Phishing",
        "scan_data": scan_data,
        "ai_analysis": ai_analysis,
        "threat_intel": {
            "VirusTotal": {"detections": f"{scan_data['blacklists']['virustotal']['detections']}/72", "status": "malicious"},
            "URLhaus": {"detections": "Found", "status": "malicious"},
        }
    }

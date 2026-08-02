import asyncio
import random
from app.models.models import RiskLevel

async def perform_domain_scan(domain: str) -> dict:
    """
    Mock Domain scanning service for development.
    """
    await asyncio.sleep(3)
    
    scan_data = {
        "domain": domain,
        "whois": {
            "registrar": "NameCheap, Inc.",
            "registered": "2024-07-29",
            "expires": "2025-07-29",
            "updated": "2024-07-29",
            "age_days": 3,
            "privacy": True,
            "country": "US",
        },
        "dns": {
            "a": ["104.21.89.43", "172.67.142.91"],
            "mx": [],
            "ns": ["ns1.cloudflare.com", "ns2.cloudflare.com"],
            "txt": [],
            "spf": "None",
            "dmarc": "None",
        },
        "hosting": {"isp": "Cloudflare", "country": "United States", "asn": "AS13335", "city": "San Francisco"},
        "risk_indicators": [
            {"indicator": "Recently registered (3 days)", "severity": "critical"},
            {"indicator": "Domain privacy enabled", "severity": "medium"},
            {"indicator": "No MX records — not used for email", "severity": "low"},
            {"indicator": "No SPF or DMARC policies", "severity": "high"},
            {"indicator": "Typosquatting a major bank", "severity": "critical"},
            {"indicator": "Registered with fast-flux hosting (Cloudflare proxy)", "severity": "medium"},
            {"indicator": "Suspicious TLD pattern for financial impersonation", "severity": "high"},
        ],
    }
    
    return {
        "risk_score": random.uniform(90.0, 99.0),
        "risk_level": RiskLevel.critical,
        "verdict": "High-Confidence Phishing Domain",
        "scan_data": scan_data,
        "ai_analysis": {},
        "threat_intel": {}
    }

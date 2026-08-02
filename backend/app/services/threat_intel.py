import asyncio
import random

async def perform_threat_intel_lookup(ioc_type: str, value: str) -> dict:
    """
    Mock Threat Intelligence lookup service for development.
    Supports URL, IP, Domain, Hash, Email.
    """
    await asyncio.sleep(1.5)
    
    # Generate some realistic mock data based on the IOC value length to vary it slightly
    score_mod = (len(value) % 5) * 5
    
    return {
        "virustotal": {
            "detections": 15 + score_mod,
            "total": 72,
            "categories": ["phishing", "malware"] if score_mod > 5 else ["suspicious"],
            "last_seen": "2024-08-01"
        },
        "abuseipdb": {
            "confidence": min(100, 40 + score_mod * 4),
            "reports": 5 + score_mod,
            "country": "RU" if score_mod % 2 == 0 else "CN",
            "isp": "Hosting Solutions Ltd"
        },
        "urlhaus": {
            "found": score_mod > 0,
            "status": "online",
            "added": "2024-07-29",
            "tags": ["phishing", "credential-theft"]
        },
        "alienvault_otx": {
            "pulse_count": 1 + (score_mod // 5),
            "malware_families": ["QakBot", "Emotet"][:1 + (score_mod % 2)],
            "adversaries": ["TA505", "Lazarus"][:1 + (score_mod % 2)]
        },
        "openphish": {
            "found": score_mod > 10,
            "phish_detail_url": "#",
            "target": "Microsoft" if score_mod % 2 == 0 else "Apple"
        }
    }

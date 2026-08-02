import asyncio
import uuid

async def perform_ai_chat(message: str, conversation_id: str | None = None, scan_id: str | None = None, provider: str = "openai") -> dict:
    """
    Mock AI Chat service. 
    In a real app, this would use LangChain to talk to OpenAI/Gemini/Groq, 
    retrieve the scan context from the DB using scan_id, and maintain conversation history.
    """
    await asyncio.sleep(2)
    
    if not conversation_id:
        conversation_id = str(uuid.uuid4())
        
    responses = [
        f"Based on my analysis of the scan, this appears to be a sophisticated attack.",
        f"I've cross-referenced this IOC against multiple threat intelligence databases.",
        f"The risk score is elevated because of the presence of credential harvesting forms.",
        f"I can help you generate a full report on this if you'd like.",
        f"To mitigate this threat, I recommend blocking the domain and notifying affected users."
    ]
    
    import random
    response_text = f"[{provider.capitalize()}] {random.choice(responses)} (You asked: '{message}')"
    
    if scan_id:
        response_text = f"Looking at scan {scan_id[:8]}... " + response_text
        
    return {
        "conversation_id": conversation_id,
        "role": "assistant",
        "content": response_text,
        "model": f"{provider}-mock",
    }

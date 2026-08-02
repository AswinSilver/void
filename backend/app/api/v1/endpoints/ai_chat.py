from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.core.security import get_current_user
from app.models.models import User

router = APIRouter()


class ChatMessage(BaseModel):
    conversation_id: str | None = None
    scan_id: str | None = None
    message: str
    provider: str = "openai"  # openai | gemini | groq


@router.post("/chat")
async def chat(
    data: ChatMessage,
    current_user: User = Depends(get_current_user),
):
    """
    AI chat endpoint. TODO: Implement LangChain conversation chain with
    scan context injection and RAG over threat intelligence.
    """
    from app.services.ai_chat import perform_ai_chat
    result = await perform_ai_chat(data.message, data.conversation_id, data.scan_id, data.provider)
    return result

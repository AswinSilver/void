from fastapi import APIRouter, Depends
from app.core.security import get_current_user
from app.models.models import User

router = APIRouter()


@router.get("/")
async def list_users(current_user: User = Depends(get_current_user)):
    return {"message": "Users endpoint"}

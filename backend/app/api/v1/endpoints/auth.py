from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, EmailStr
from datetime import timedelta
import uuid

from app.core.database import get_db
from app.core.security import (
    verify_password, get_password_hash,
    create_access_token, create_refresh_token, decode_token,
    get_current_user
)
from app.core.config import settings
from app.models.models import User, UserRole

router = APIRouter()


class RegisterRequest(BaseModel):
    email: EmailStr
    username: str
    full_name: str | None = None
    password: str


class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: dict


class RefreshRequest(BaseModel):
    refresh_token: str


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(data: RegisterRequest, db: AsyncSession = Depends(get_db)):
    # Check existing user
    result = await db.execute(select(User).where(
        (User.email == data.email) | (User.username == data.username)
    ))
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Email or username already registered")

    user = User(
        id=uuid.uuid4(),
        email=data.email,
        username=data.username,
        full_name=data.full_name,
        hashed_password=get_password_hash(data.password),
        role=UserRole.user,
        is_active=True,
        is_verified=False,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return {"message": "Registration successful", "user_id": str(user.id)}


@router.post("/login", response_model=LoginResponse)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == form_data.username))
    user = result.scalar_one_or_none()
    if not user or not verify_password(form_data.password, user.hashed_password or ""):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account deactivated")

    token_data = {"sub": str(user.id), "role": user.role.value}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    return LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user={
            "id": str(user.id),
            "email": user.email,
            "username": user.username,
            "full_name": user.full_name,
            "role": user.role.value,
            "avatar_url": user.avatar_url,
        }
    )


@router.post("/refresh", response_model=LoginResponse)
async def refresh_token(data: RefreshRequest, db: AsyncSession = Depends(get_db)):
    payload = decode_token(data.refresh_token)
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    result = await db.execute(select(User).where(User.id == payload.get("sub")))
    user = result.scalar_one_or_none()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found")

    token_data = {"sub": str(user.id), "role": user.role.value}
    return LoginResponse(
        access_token=create_access_token(token_data),
        refresh_token=create_refresh_token(token_data),
        user={
            "id": str(user.id),
            "email": user.email,
            "username": user.username,
            "full_name": user.full_name,
            "role": user.role.value,
            "avatar_url": user.avatar_url,
        }
    )


@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "username": current_user.username,
        "full_name": current_user.full_name,
        "role": current_user.role.value,
        "avatar_url": current_user.avatar_url,
        "organization_id": str(current_user.organization_id) if current_user.organization_id else None,
        "mfa_enabled": current_user.mfa_enabled,
        "is_verified": current_user.is_verified,
        "created_at": current_user.created_at.isoformat(),
    }

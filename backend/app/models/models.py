import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import String, Boolean, DateTime, Text, Float, Integer, ForeignKey, JSON, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
import enum


class Base(DeclarativeBase):
    pass


class UserRole(str, enum.Enum):
    admin = "admin"
    analyst = "analyst"
    user = "user"


class ScanType(str, enum.Enum):
    url = "url"
    email = "email"
    qr = "qr"
    sms = "sms"
    domain = "domain"


class RiskLevel(str, enum.Enum):
    safe = "safe"
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class Organization(Base):
    __tablename__ = "organizations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    logo_url: Mapped[Optional[str]] = mapped_column(Text)
    plan: Mapped[str] = mapped_column(String(50), default="free")
    max_members: Mapped[int] = mapped_column(Integer, default=5)
    max_scans_per_day: Mapped[int] = mapped_column(Integer, default=100)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    users: Mapped[list["User"]] = relationship("User", back_populates="organization")
    api_keys: Mapped[list["APIKey"]] = relationship("APIKey", back_populates="organization")
    scans: Mapped[list["ScanRecord"]] = relationship("ScanRecord", back_populates="organization")


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    username: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    full_name: Mapped[Optional[str]] = mapped_column(String(255))
    hashed_password: Mapped[Optional[str]] = mapped_column(String(255))
    avatar_url: Mapped[Optional[str]] = mapped_column(Text)
    role: Mapped[UserRole] = mapped_column(SAEnum(UserRole), default=UserRole.user)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    mfa_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    mfa_secret: Mapped[Optional[str]] = mapped_column(String(255))
    oauth_provider: Mapped[Optional[str]] = mapped_column(String(50))
    oauth_provider_id: Mapped[Optional[str]] = mapped_column(String(255))
    organization_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("organizations.id"))
    last_login: Mapped[Optional[datetime]] = mapped_column(DateTime)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    organization: Mapped[Optional["Organization"]] = relationship("Organization", back_populates="users")
    scans: Mapped[list["ScanRecord"]] = relationship("ScanRecord", back_populates="user")
    api_keys: Mapped[list["APIKey"]] = relationship("APIKey", back_populates="user")
    ai_conversations: Mapped[list["AIConversation"]] = relationship("AIConversation", back_populates="user")


class APIKey(Base):
    __tablename__ = "api_keys"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    key_hash: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    key_prefix: Mapped[str] = mapped_column(String(12), nullable=False)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    organization_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("organizations.id"))
    scopes: Mapped[list] = mapped_column(JSON, default=list)
    rate_limit_per_hour: Mapped[int] = mapped_column(Integer, default=100)
    total_requests: Mapped[int] = mapped_column(Integer, default=0)
    last_used_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship("User", back_populates="api_keys")
    organization: Mapped[Optional["Organization"]] = relationship("Organization", back_populates="api_keys")


class ScanRecord(Base):
    __tablename__ = "scan_records"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    scan_type: Mapped[ScanType] = mapped_column(SAEnum(ScanType), nullable=False)
    target: Mapped[str] = mapped_column(Text, nullable=False)  # URL / email / phone / domain
    risk_score: Mapped[Optional[float]] = mapped_column(Float)
    risk_level: Mapped[Optional[RiskLevel]] = mapped_column(SAEnum(RiskLevel))
    verdict: Mapped[Optional[str]] = mapped_column(String(255))
    status: Mapped[str] = mapped_column(String(50), default="pending")  # pending | running | done | error
    task_id: Mapped[Optional[str]] = mapped_column(String(255))  # Celery task ID
    tags: Mapped[list] = mapped_column(JSON, default=list)
    is_bookmarked: Mapped[bool] = mapped_column(Boolean, default=False)
    is_false_positive: Mapped[bool] = mapped_column(Boolean, default=False)
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    organization_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("organizations.id"))
    scan_data: Mapped[dict] = mapped_column(JSON, default=dict)  # Full raw results
    ai_analysis: Mapped[Optional[dict]] = mapped_column(JSON)
    threat_intel: Mapped[Optional[dict]] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime)

    user: Mapped[Optional["User"]] = relationship("User", back_populates="scans")
    organization: Mapped[Optional["Organization"]] = relationship("Organization", back_populates="scans")
    report: Mapped[Optional["Report"]] = relationship("Report", back_populates="scan", uselist=False)
    iocs: Mapped[list["IOC"]] = relationship("IOC", back_populates="scan")


class Report(Base):
    __tablename__ = "reports"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    scan_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("scan_records.id"), unique=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    executive_summary: Mapped[Optional[str]] = mapped_column(Text)
    technical_summary: Mapped[Optional[str]] = mapped_column(Text)
    recommendations: Mapped[Optional[str]] = mapped_column(Text)
    mitre_techniques: Mapped[list] = mapped_column(JSON, default=list)
    affected_assets: Mapped[list] = mapped_column(JSON, default=list)
    evidence_urls: Mapped[list] = mapped_column(JSON, default=list)
    pdf_url: Mapped[Optional[str]] = mapped_column(Text)
    markdown_url: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    scan: Mapped["ScanRecord"] = relationship("ScanRecord", back_populates="report")


class IOC(Base):
    __tablename__ = "iocs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    scan_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("scan_records.id"))
    ioc_type: Mapped[str] = mapped_column(String(50))  # url | ip | domain | hash | email
    value: Mapped[str] = mapped_column(Text, nullable=False, index=True)
    confidence: Mapped[float] = mapped_column(Float, default=0.0)
    source: Mapped[Optional[str]] = mapped_column(String(100))
    context: Mapped[Optional[str]] = mapped_column(Text)
    first_seen: Mapped[Optional[datetime]] = mapped_column(DateTime)
    last_seen: Mapped[Optional[datetime]] = mapped_column(DateTime)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    scan: Mapped["ScanRecord"] = relationship("ScanRecord", back_populates="iocs")


class ThreatIntelCache(Base):
    __tablename__ = "threat_intel_cache"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ioc_type: Mapped[str] = mapped_column(String(50), nullable=False)
    value: Mapped[str] = mapped_column(Text, nullable=False, index=True)
    source: Mapped[str] = mapped_column(String(100), nullable=False)
    data: Mapped[dict] = mapped_column(JSON, default=dict)
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class AIConversation(Base):
    __tablename__ = "ai_conversations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    scan_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("scan_records.id"))
    title: Mapped[Optional[str]] = mapped_column(String(500))
    messages: Mapped[list] = mapped_column(JSON, default=list)  # [{role: user/assistant, content: ...}]
    model_used: Mapped[Optional[str]] = mapped_column(String(100))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user: Mapped["User"] = relationship("User", back_populates="ai_conversations")

from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
import datetime
import enum
from app.models.base import Base

class KYCStatus(str, enum.Enum):
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    VERIFIED = "VERIFIED"
    NEEDS_REVIEW = "NEEDS_REVIEW"
    REJECTED = "REJECTED"

class KYCDocumentType(str, enum.Enum):
    AADHAAR = "AADHAAR"
    PAN = "PAN"
    PASSPORT = "PASSPORT"
    DRIVING_LICENSE = "DRIVING_LICENSE"

class KYCRecord(Base):
    __tablename__ = "kyc_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    document_type = Column(SQLEnum(KYCDocumentType), default=KYCDocumentType.AADHAAR, nullable=False)
    document_number = Column(String(100), nullable=False)
    extracted_name = Column(String(255), nullable=True)
    extracted_dob = Column(String(50), nullable=True)
    ocr_confidence = Column(Float, default=0.96)
    status = Column(SQLEnum(KYCStatus), default=KYCStatus.VERIFIED, nullable=False)
    review_notes = Column(String(255), nullable=True)
    document_preview = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="kyc_records")

from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.kyc import KYCStatus, KYCDocumentType

class KycUploadRequest(BaseModel):
    document_type: KYCDocumentType
    document_number: str
    full_name: str
    date_of_birth: Optional[str] = "1994-08-15"

class KycResponse(BaseModel):
    id: int
    user_id: int
    document_type: KYCDocumentType
    document_number: str
    extracted_name: Optional[str] = None
    extracted_dob: Optional[str] = None
    ocr_confidence: float
    status: KYCStatus
    review_notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class KycReviewRequest(BaseModel):
    status: KYCStatus
    review_notes: Optional[str] = None

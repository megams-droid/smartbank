from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.models import User, KYCRecord, Notification
from backend.app.schemas.schemas import KYCSubmitRequest, KYCResponse, KYCReviewRequest
from backend.app.auth.security import get_current_user, get_current_admin

router = APIRouter(prefix="/api/kyc", tags=["KYC Verification Demo"])


@router.get("/status", response_model=List[KYCResponse])
def get_kyc_status(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    records = db.query(KYCRecord).filter(KYCRecord.user_id == current_user.id).order_by(KYCRecord.created_at.desc()).all()
    return records


@router.post("/submit", response_model=KYCResponse)
def submit_kyc_document(
    payload: KYCSubmitRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Simulates KYC document submission and OCR extraction.
    NOTE: Simulated prototype demo for hackathon showcase.
    """
    existing = db.query(KYCRecord).filter(
        KYCRecord.user_id == current_user.id,
        KYCRecord.document_type == payload.document_type
    ).first()

    if existing:
        existing.document_number = payload.document_number
        existing.extracted_name = payload.extracted_name
        existing.extracted_dob = payload.extracted_dob or "1996-08-14"
        existing.extracted_address = payload.extracted_address or "742 Evergreen Heights, Bengaluru, KA 560001"
        existing.ocr_confidence = 0.97
        existing.status = "VERIFIED"
        db.commit()
        db.refresh(existing)
        rec = existing
    else:
        rec = KYCRecord(
            user_id=current_user.id,
            document_type=payload.document_type,
            document_number=payload.document_number,
            extracted_name=payload.extracted_name,
            extracted_dob=payload.extracted_dob or "1996-08-14",
            extracted_address=payload.extracted_address or "742 Evergreen Heights, Bengaluru, KA 560001",
            ocr_confidence=0.97,
            status="VERIFIED",
        )
        db.add(rec)
        db.commit()
        db.refresh(rec)

    # Add notification
    notif = Notification(
        user_id=current_user.id,
        title="KYC Verification Successful",
        message=f"Your {payload.document_type} verification was processed and approved with high OCR confidence (97%).",
        type="SYSTEM_NOTICE",
    )
    db.add(notif)
    db.commit()

    return rec


@router.post("/{kyc_id}/review", response_model=KYCResponse)
def review_kyc(
    kyc_id: str,
    payload: KYCReviewRequest,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    rec = db.query(KYCRecord).filter(KYCRecord.id == kyc_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="KYC record not found")

    rec.status = payload.status
    if payload.rejection_reason:
        rec.rejection_reason = payload.rejection_reason
    db.commit()
    db.refresh(rec)
    return rec

from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.transaction import TransactionType, AnomalyStatus

class TransactionCreate(BaseModel):
    account_id: int
    amount: float
    type: TransactionType = TransactionType.EXPENSE
    category: Optional[str] = None
    merchant: str
    payment_method: Optional[str] = "UPI"
    description: Optional[str] = None
    date: Optional[datetime] = None

class TransactionUpdate(BaseModel):
    category: Optional[str] = None
    merchant: Optional[str] = None
    description: Optional[str] = None
    anomaly_status: Optional[AnomalyStatus] = None

class TransactionResponse(BaseModel):
    id: int
    user_id: int
    account_id: int
    amount: float
    type: TransactionType
    category: str
    merchant: str
    payment_method: str
    description: Optional[str] = None
    date: datetime
    status: str
    ai_confidence: float
    ai_explanation: Optional[str] = None
    is_anomaly: bool
    anomaly_score: float
    anomaly_risk_level: str
    anomaly_reason: Optional[str] = None
    anomaly_status: AnomalyStatus
    created_at: datetime

    class Config:
        from_attributes = True

class CategorizeRequest(BaseModel):
    merchant: str
    description: Optional[str] = None
    amount: Optional[float] = None

class CategorizeResponse(BaseModel):
    category: str
    confidence: float
    reason: str
    model_version: str

class AnomalyCheckResponse(BaseModel):
    is_anomaly: bool
    anomaly_score: float
    risk_level: str
    reason: str
    explanation: str
    model_version: str

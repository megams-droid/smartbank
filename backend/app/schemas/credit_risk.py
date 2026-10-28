from pydantic import BaseModel
from typing import Optional, List, Dict
from datetime import datetime
from app.models.credit_risk import RiskBand

class FactorBreakdown(BaseModel):
    name: str
    score: float
    grade: str
    impact: str
    description: str

class CreditRiskResponse(BaseModel):
    id: int
    user_id: int
    score: int
    risk_band: RiskBand
    factors: List[FactorBreakdown]
    explanation: str
    model_version: str
    disclaimer: str
    created_at: datetime

    class Config:
        from_attributes = True

class CreditRiskAnalyzeRequest(BaseModel):
    monthly_income: Optional[float] = None
    existing_emi: Optional[float] = None
    employment_type: Optional[str] = "Salaried"

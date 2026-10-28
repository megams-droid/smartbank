from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
import datetime
import enum
from app.models.base import Base

class RiskBand(str, enum.Enum):
    LOW = "LOW"
    MODERATE = "MODERATE"
    HIGH = "HIGH"

class CreditRiskAssessment(Base):
    __tablename__ = "credit_risk_assessments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    score = Column(Integer, default=740, nullable=False)  # 300 - 850 simulated scale
    risk_band = Column(SQLEnum(RiskBand), default=RiskBand.LOW, nullable=False)
    
    # Transparent breakdown factors (0-100)
    income_stability_score = Column(Float, default=85.0)
    repayment_history_score = Column(Float, default=90.0)
    expense_ratio_score = Column(Float, default=75.0)
    transaction_stability_score = Column(Float, default=80.0)
    savings_growth_score = Column(Float, default=70.0)

    explanation = Column(String(500), nullable=True)
    model_version = Column(String(50), default="CreditRisk-v2.1")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="credit_assessments")

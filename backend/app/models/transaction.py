from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Enum as SQLEnum
from sqlalchemy.orm import relationship
import datetime
import enum
from app.models.base import Base

class TransactionType(str, enum.Enum):
    INCOME = "INCOME"
    EXPENSE = "EXPENSE"
    TRANSFER = "TRANSFER"

class TransactionCategory(str, enum.Enum):
    FOOD = "Food"
    SHOPPING = "Shopping"
    TRANSPORT = "Transport"
    EDUCATION = "Education"
    ENTERTAINMENT = "Entertainment"
    BILLS = "Bills"
    HEALTHCARE = "Healthcare"
    TRAVEL = "Travel"
    RENT = "Rent"
    SALARY = "Salary"
    INVESTMENT = "Investment"
    OTHER = "Other"

class PaymentMethod(str, enum.Enum):
    UPI = "UPI"
    DEBIT_CARD = "Debit Card"
    CREDIT_CARD = "Credit Card"
    BANK_TRANSFER = "Bank Transfer"
    CASH = "Cash"

class AnomalyStatus(str, enum.Enum):
    OPEN = "OPEN"
    UNDER_REVIEW = "UNDER_REVIEW"
    RESOLVED = "RESOLVED"
    FALSE_POSITIVE = "FALSE_POSITIVE"

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    account_id = Column(Integer, ForeignKey("accounts.id", ondelete="CASCADE"), nullable=False, index=True)
    
    amount = Column(Float, nullable=False)
    type = Column(SQLEnum(TransactionType), default=TransactionType.EXPENSE, nullable=False)
    category = Column(String(50), default="Other", nullable=False)
    merchant = Column(String(100), nullable=False)
    payment_method = Column(String(50), default="UPI", nullable=False)
    description = Column(String(255), nullable=True)
    date = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    status = Column(String(50), default="COMPLETED", nullable=False)
    
    # AI Metadata
    ai_confidence = Column(Float, default=1.0)
    ai_explanation = Column(String(255), nullable=True)
    is_anomaly = Column(Boolean, default=False, index=True)
    anomaly_score = Column(Float, default=0.0)
    anomaly_risk_level = Column(String(20), default="LOW")  # LOW, MEDIUM, HIGH
    anomaly_reason = Column(String(255), nullable=True)
    anomaly_status = Column(SQLEnum(AnomalyStatus), default=AnomalyStatus.OPEN)

    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="transactions")
    account = relationship("Account", back_populates="transactions")

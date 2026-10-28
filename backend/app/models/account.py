from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
import datetime
import enum
from app.models.base import Base

class AccountType(str, enum.Enum):
    SAVINGS = "SAVINGS"
    CHECKING = "CHECKING"
    EMERGENCY = "EMERGENCY"
    INVESTMENT = "INVESTMENT"

class AccountStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    FROZEN = "FROZEN"
    CLOSED = "CLOSED"

class Account(Base):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    account_number = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    account_type = Column(SQLEnum(AccountType), default=AccountType.SAVINGS, nullable=False)
    balance = Column(Float, default=0.0, nullable=False)
    currency = Column(String(10), default="INR", nullable=False)
    status = Column(SQLEnum(AccountStatus), default=AccountStatus.ACTIVE, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="accounts")
    transactions = relationship("Transaction", back_populates="account", cascade="all, delete-orphan")

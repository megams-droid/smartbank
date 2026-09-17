import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    Text,
    Enum,
    Integer,
)
from sqlalchemy.orm import relationship
from backend.app.database import Base


def generate_uuid():
    return str(uuid.uuid4())


def now_utc():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="CUSTOMER", nullable=False)  # CUSTOMER, ADMIN, SUPPORT_AGENT
    phone = Column(String(50), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    monthly_income = Column(Float, default=45000.0)
    created_at = Column(DateTime, default=now_utc)
    updated_at = Column(DateTime, default=now_utc, onupdate=now_utc)

    accounts = relationship("Account", back_populates="user", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="user", cascade="all, delete-orphan")
    budgets = relationship("Budget", back_populates="user", cascade="all, delete-orphan")
    goals = relationship("FinancialGoal", back_populates="user", cascade="all, delete-orphan")
    recurring_expenses = relationship("RecurringExpense", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    ai_insights = relationship("AIInsight", back_populates="user", cascade="all, delete-orphan")
    kyc_records = relationship("KYCRecord", back_populates="user", cascade="all, delete-orphan")
    credit_assessments = relationship("CreditRiskAssessment", back_populates="user", cascade="all, delete-orphan")
    anomalies = relationship("AnomalyRecord", back_populates="user", cascade="all, delete-orphan")


class Account(Base):
    __tablename__ = "accounts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    account_number = Column(String(50), unique=True, nullable=False)
    account_name = Column(String(100), nullable=False)
    account_type = Column(String(50), default="SAVINGS", nullable=False)  # SAVINGS, CHECKING, EMERGENCY_FUND, INVESTMENT
    balance = Column(Float, default=0.0, nullable=False)
    currency = Column(String(10), default="INR", nullable=False)
    status = Column(String(50), default="ACTIVE", nullable=False)  # ACTIVE, FROZEN, CLOSED
    is_primary = Column(Boolean, default=False)
    created_at = Column(DateTime, default=now_utc)
    updated_at = Column(DateTime, default=now_utc, onupdate=now_utc)

    user = relationship("User", back_populates="accounts")
    transactions = relationship("Transaction", back_populates="account", cascade="all, delete-orphan")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    account_id = Column(String(36), ForeignKey("accounts.id"), nullable=False, index=True)
    date = Column(DateTime, default=now_utc, index=True)
    amount = Column(Float, nullable=False)
    type = Column(String(20), nullable=False)  # INCOME, EXPENSE, TRANSFER
    category = Column(String(50), nullable=False, index=True)  # Food, Shopping, Transport, Bills, etc.
    merchant = Column(String(150), nullable=False)
    payment_method = Column(String(50), default="UPI")  # UPI, DEBIT_CARD, CREDIT_CARD, BANK_TRANSFER, CASH
    description = Column(Text, nullable=True)
    status = Column(String(50), default="COMPLETED")  # COMPLETED, PENDING, FLAGGED
    is_anomaly = Column(Boolean, default=False)
    anomaly_score = Column(Float, default=0.0)
    anomaly_reason = Column(Text, nullable=True)
    is_recurring = Column(Boolean, default=False)
    ai_confidence = Column(Float, default=0.95)
    ai_categorization_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=now_utc)
    updated_at = Column(DateTime, default=now_utc, onupdate=now_utc)

    user = relationship("User", back_populates="transactions")
    account = relationship("Account", back_populates="transactions")
    anomaly_record = relationship("AnomalyRecord", back_populates="transaction", uselist=False, cascade="all, delete-orphan")


class Budget(Base):
    __tablename__ = "budgets"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    category = Column(String(50), nullable=False)
    monthly_limit = Column(Float, nullable=False)
    current_spent = Column(Float, default=0.0)
    month_year = Column(String(7), nullable=False)  # "2026-09"
    alert_threshold = Column(Float, default=90.0)  # Percentage trigger
    created_at = Column(DateTime, default=now_utc)
    updated_at = Column(DateTime, default=now_utc, onupdate=now_utc)

    user = relationship("User", back_populates="budgets")


class FinancialGoal(Base):
    __tablename__ = "financial_goals"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String(150), nullable=False)
    target_amount = Column(Float, nullable=False)
    current_amount = Column(Float, default=0.0)
    target_date = Column(DateTime, nullable=False)
    category = Column(String(50), default="SAVINGS")
    status = Column(String(50), default="ACTIVE")  # ACTIVE, COMPLETED, PAUSED
    icon = Column(String(50), default="Target")
    created_at = Column(DateTime, default=now_utc)
    updated_at = Column(DateTime, default=now_utc, onupdate=now_utc)

    user = relationship("User", back_populates="goals")


class RecurringExpense(Base):
    __tablename__ = "recurring_expenses"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    merchant = Column(String(150), nullable=False)
    category = Column(String(50), nullable=False)
    estimated_amount = Column(Float, nullable=False)
    frequency = Column(String(50), default="MONTHLY")  # MONTHLY, WEEKLY, YEARLY
    last_billed_date = Column(DateTime, nullable=True)
    next_due_date = Column(DateTime, nullable=False)
    payment_method = Column(String(50), default="UPI")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=now_utc)
    updated_at = Column(DateTime, default=now_utc, onupdate=now_utc)

    user = relationship("User", back_populates="recurring_expenses")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), default="SYSTEM_NOTICE")  # BUDGET_ALERT, ANOMALY_WARNING, RECURRING_DUE, GOAL_PROGRESS, SYSTEM_NOTICE
    is_read = Column(Boolean, default=False)
    metadata_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=now_utc)

    user = relationship("User", back_populates="notifications")


class AIInsight(Base):
    __tablename__ = "ai_insights"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    insight_type = Column(String(50), nullable=False)  # SPENDING_INCREASE, BUDGET_RISK, SAVING_OPPORTUNITY, CASH_FLOW_TREND, ANOMALY_SUMMARY
    title = Column(String(200), nullable=False)
    summary = Column(Text, nullable=False)
    explanation_why = Column(Text, nullable=False)
    action_suggested = Column(Text, nullable=True)
    impact_score = Column(Float, default=7.5)  # 1-10
    created_at = Column(DateTime, default=now_utc)

    user = relationship("User", back_populates="ai_insights")


class AnomalyRecord(Base):
    __tablename__ = "anomalies"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    transaction_id = Column(String(36), ForeignKey("transactions.id"), nullable=False, unique=True)
    anomaly_score = Column(Float, nullable=False)
    risk_level = Column(String(20), default="HIGH")  # LOW, MEDIUM, HIGH
    reason = Column(Text, nullable=False)
    status = Column(String(50), default="OPEN")  # OPEN, UNDER_REVIEW, RESOLVED, FALSE_POSITIVE
    model_version = Column(String(50), default="v1.2.4-hybrid")
    reviewed_by = Column(String(100), nullable=True)
    review_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=now_utc)
    updated_at = Column(DateTime, default=now_utc, onupdate=now_utc)

    user = relationship("User", back_populates="anomalies")
    transaction = relationship("Transaction", back_populates="anomaly_record")


class KYCRecord(Base):
    __tablename__ = "kyc_records"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    document_type = Column(String(50), default="AADHAAR")  # AADHAAR, PAN, PASSPORT, VOTER_ID
    document_number = Column(String(100), nullable=False)
    extracted_name = Column(String(200), nullable=False)
    extracted_dob = Column(String(50), nullable=True)
    extracted_address = Column(Text, nullable=True)
    ocr_confidence = Column(Float, default=0.96)
    status = Column(String(50), default="VERIFIED")  # PENDING, PROCESSING, VERIFIED, NEEDS_REVIEW, REJECTED
    rejection_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=now_utc)
    updated_at = Column(DateTime, default=now_utc, onupdate=now_utc)

    user = relationship("User", back_populates="kyc_records")


class CreditRiskAssessment(Base):
    __tablename__ = "credit_risk_assessments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    risk_band = Column(String(50), default="MODERATE")  # LOW, MODERATE, HIGH, CRITICAL
    estimated_score = Column(Integer, default=745)  # 300 - 850 educational simulation
    income_consistency_score = Column(Integer, default=85)
    repayment_history_score = Column(Integer, default=90)
    expense_ratio_score = Column(Integer, default=68)
    transaction_stability_score = Column(Integer, default=82)
    existing_obligations_score = Column(Integer, default=78)
    key_factors_json = Column(Text, nullable=True)
    explanation = Column(Text, nullable=False)
    created_at = Column(DateTime, default=now_utc)

    user = relationship("User", back_populates="credit_assessments")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), nullable=True)
    action = Column(String(100), nullable=False)
    entity_type = Column(String(50), nullable=False)
    entity_id = Column(String(100), nullable=True)
    ip_address = Column(String(50), default="127.0.0.1")
    details_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=now_utc)

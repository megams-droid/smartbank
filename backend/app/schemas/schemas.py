from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field, ConfigDict


# --- Auth & User Schemas ---
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    role: Optional[str] = "CUSTOMER"


class UserCreate(UserBase):
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(UserBase):
    id: str
    avatar_url: Optional[str] = None
    is_active: bool
    monthly_income: float
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenData(BaseModel):
    user_id: Optional[str] = None
    role: Optional[str] = None


# --- Account Schemas ---
class AccountBase(BaseModel):
    account_name: str
    account_type: str = "SAVINGS"  # SAVINGS, CHECKING, EMERGENCY_FUND, INVESTMENT
    currency: str = "INR"


class AccountCreate(AccountBase):
    initial_balance: float = 0.0


class AccountResponse(AccountBase):
    id: str
    user_id: str
    account_number: str
    balance: float
    status: str
    is_primary: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TransferRequest(BaseModel):
    source_account_id: str
    destination_account_id: Optional[str] = None
    destination_account_number: Optional[str] = None
    amount: float = Field(..., gt=0)
    description: Optional[str] = "Fund Transfer"
    payment_method: str = "UPI"


# --- Transaction Schemas ---
class TransactionBase(BaseModel):
    amount: float
    type: str  # INCOME, EXPENSE, TRANSFER
    category: str
    merchant: str
    payment_method: str = "UPI"
    description: Optional[str] = None
    date: Optional[datetime] = None


class TransactionCreate(TransactionBase):
    account_id: str


class TransactionUpdate(BaseModel):
    category: Optional[str] = None
    merchant: Optional[str] = None
    description: Optional[str] = None
    amount: Optional[float] = None


class TransactionResponse(TransactionBase):
    id: str
    user_id: str
    account_id: str
    status: str
    is_anomaly: bool
    anomaly_score: float
    anomaly_reason: Optional[str] = None
    is_recurring: bool
    ai_confidence: float
    ai_categorization_reason: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Budget Schemas ---
class BudgetBase(BaseModel):
    category: str
    monthly_limit: float
    month_year: Optional[str] = None  # "YYYY-MM"
    alert_threshold: Optional[float] = 90.0


class BudgetCreate(BudgetBase):
    pass


class BudgetUpdate(BaseModel):
    monthly_limit: Optional[float] = None
    alert_threshold: Optional[float] = None


class BudgetResponse(BudgetBase):
    id: str
    user_id: str
    current_spent: float
    utilization_percentage: float = 0.0
    status: str = "Normal"  # Normal, Watch, Near Limit, Exceeded
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Financial Goal Schemas ---
class GoalBase(BaseModel):
    name: str
    target_amount: float
    target_date: datetime
    category: Optional[str] = "SAVINGS"
    icon: Optional[str] = "Target"


class GoalCreate(GoalBase):
    initial_amount: Optional[float] = 0.0


class GoalUpdate(BaseModel):
    name: Optional[str] = None
    target_amount: Optional[float] = None
    current_amount: Optional[float] = None
    target_date: Optional[datetime] = None
    status: Optional[str] = None


class GoalContribution(BaseModel):
    amount: float = Field(..., gt=0)
    account_id: str


class GoalResponse(GoalBase):
    id: str
    user_id: str
    current_amount: float
    progress_percentage: float = 0.0
    remaining_amount: float = 0.0
    suggested_monthly_saving: float = 0.0
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Recurring Expense Schemas ---
class RecurringExpenseBase(BaseModel):
    merchant: str
    category: str
    estimated_amount: float
    frequency: str = "MONTHLY"
    payment_method: str = "UPI"


class RecurringExpenseCreate(RecurringExpenseBase):
    next_due_date: datetime


class RecurringExpenseResponse(RecurringExpenseBase):
    id: str
    user_id: str
    last_billed_date: Optional[datetime] = None
    next_due_date: datetime
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Notification Schemas ---
class NotificationResponse(BaseModel):
    id: str
    title: str
    message: str
    type: str
    is_read: bool
    created_at: datetime
    metadata_json: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# --- AI Schemas ---
class CategorizationRequest(BaseModel):
    merchant: str
    amount: Optional[float] = None
    description: Optional[str] = None


class CategorizationResponse(BaseModel):
    category: str
    confidence: float
    reason: str
    model_version: str = "v1.2.0-nlp-hybrid"
    is_recurring_guess: bool = False


class AnomalyCheckRequest(BaseModel):
    amount: float
    category: str
    merchant: str
    account_id: Optional[str] = None


class AnomalyResponse(BaseModel):
    is_anomaly: bool
    anomaly_score: float
    risk_level: str  # LOW, MEDIUM, HIGH
    reason: str
    model_version: str = "v1.4.2-isoforest-stat"
    factors: Dict[str, Any] = {}


class AnomalyReviewRequest(BaseModel):
    status: str  # UNDER_REVIEW, RESOLVED, FALSE_POSITIVE
    review_notes: Optional[str] = None


class CategoryForecast(BaseModel):
    category: str
    historical_avg: float
    forecasted_amount: float
    trend_percentage: float
    trend_direction: str  # UP, DOWN, STABLE
    confidence: float
    explanation: str


class ForecastResponse(BaseModel):
    period: str  # "Next Month (October 2026)"
    estimated_total_expenses: float
    historical_monthly_avg: float
    forecast_change_percentage: float
    categories: List[CategoryForecast]
    methodology: str
    model_version: str = "v2.1-time-series-ensemble"
    created_at: str


class HealthFactorBreakdown(BaseModel):
    name: str
    score: int
    weight: float
    status: str
    description: str


class FinancialHealthResponse(BaseModel):
    overall_score: int  # 0 to 100
    rating: str  # EXCELLENT, GOOD, MODERATE, NEEDS_ATTENTION
    factors: List[HealthFactorBreakdown]
    summary_insight: str
    improvement_tips: List[str]
    calculation_details: str
    created_at: str


class ChatRequest(BaseModel):
    message: str
    conversation_history: Optional[List[Dict[str, str]]] = []


class ChatResponse(BaseModel):
    reply: str
    grounded_data: Optional[Dict[str, Any]] = None
    suggested_actions: Optional[List[str]] = []
    mode: str = "DATABASE_INTELLIGENCE"  # DATABASE_INTELLIGENCE or LLM_AUGMENTED


class InsightResponse(BaseModel):
    id: str
    insight_type: str
    title: str
    summary: str
    explanation_why: str
    action_suggested: Optional[str] = None
    impact_score: float
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- KYC Schemas ---
class KYCSubmitRequest(BaseModel):
    document_type: str = "AADHAAR"  # AADHAAR, PAN, PASSPORT, VOTER_ID
    document_number: str
    extracted_name: str
    extracted_dob: Optional[str] = None
    extracted_address: Optional[str] = None


class KYCResponse(BaseModel):
    id: str
    user_id: str
    document_type: str
    document_number: str
    extracted_name: str
    extracted_dob: Optional[str] = None
    extracted_address: Optional[str] = None
    ocr_confidence: float
    status: str
    rejection_reason: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class KYCReviewRequest(BaseModel):
    status: str  # VERIFIED, REJECTED, NEEDS_REVIEW
    rejection_reason: Optional[str] = None


# --- Credit Risk Schemas ---
class CreditRiskRequest(BaseModel):
    monthly_income: Optional[float] = None
    requested_loan_amount: Optional[float] = 100000.0
    loan_tenure_months: Optional[int] = 12


class CreditRiskResponse(BaseModel):
    risk_band: str  # LOW, MODERATE, HIGH, CRITICAL
    estimated_score: int  # 300-850
    income_consistency_score: int
    repayment_history_score: int
    expense_ratio_score: int
    transaction_stability_score: int
    existing_obligations_score: int
    key_factors: List[Dict[str, Any]]
    explanation: str
    max_recommended_credit: float
    created_at: str


# --- Dashboard & Admin Schemas ---
class DashboardSummary(BaseModel):
    total_balance: float
    monthly_income: float
    monthly_expenses: float
    net_savings: float
    savings_rate: float
    health_score: int
    active_anomalies_count: int
    near_limit_budgets_count: int
    active_goals_count: int
    upcoming_recurring_total: float
    recent_transactions: List[TransactionResponse]
    top_categories: List[Dict[str, Any]]
    cash_flow_trend: List[Dict[str, Any]]
    budget_utilization: List[Dict[str, Any]]
    ai_insights: List[InsightResponse]


class AdminStatsResponse(BaseModel):
    total_users: int
    total_accounts: int
    total_transactions: int
    total_volume: float
    open_anomalies_count: int
    pending_kyc_count: int
    model_inference_count: int
    model_accuracy_estimate: float
    anomaly_detection_rate: float
    last_trained_timestamp: str


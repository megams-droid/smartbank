from pydantic import BaseModel
from typing import List, Dict, Optional, Any
from datetime import datetime

class AnomalyItem(BaseModel):
    transaction_id: int
    merchant: str
    amount: float
    date: datetime
    anomaly_score: float
    risk_level: str
    reason: str
    explanation: str

class CategoryForecast(BaseModel):
    category: str
    current_month_spent: float
    forecasted_amount: float
    trend: str  # INCREASING, DECREASING, STABLE
    confidence: float
    explanation: str

class ForecastResponse(BaseModel):
    forecast_month: str
    total_estimated_expenses: float
    model_name: str
    category_breakdowns: List[CategoryForecast]
    overall_explanation: str

class HealthFactor(BaseModel):
    name: str
    score: float
    max_score: float = 100.0
    weight: float
    status: str
    description: str

class HealthScoreResponse(BaseModel):
    overall_score: int
    rating: str  # Excellent, Good, Fair, Needs Attention
    factors: List[HealthFactor]
    summary_advice: str
    calculation_formula: str

class InsightCard(BaseModel):
    id: str
    title: str
    summary: str
    category: Optional[str] = None
    change_percentage: Optional[float] = None
    impact: str  # POSITIVE, NEGATIVE, NEUTRAL, WARNING
    reason: str
    action_prompt: Optional[str] = None

class AssistantQuery(BaseModel):
    message: str

class AssistantResponse(BaseModel):
    reply: str
    source_type: str  # DATABASE_FACT, STATISTICAL_CALCULATION, PREDICTION, FINANCIAL_GUIDANCE
    data_points: Optional[Dict[str, Any]] = None
    suggested_actions: Optional[List[str]] = None

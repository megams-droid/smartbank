from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class BudgetCreate(BaseModel):
    category: str
    monthly_limit: float
    period: Optional[str] = "MONTHLY"

class BudgetUpdate(BaseModel):
    monthly_limit: float

class BudgetResponse(BaseModel):
    id: int
    user_id: int
    category: str
    monthly_limit: float
    period: str
    spent_amount: float = 0.0
    utilization_percentage: float = 0.0
    status: str = "NORMAL"  # NORMAL, WATCH, NEAR_LIMIT, EXCEEDED
    created_at: datetime

    class Config:
        from_attributes = True

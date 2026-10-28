from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class GoalCreate(BaseModel):
    name: str
    target_amount: float
    current_amount: Optional[float] = 0.0
    target_date: datetime
    category: Optional[str] = "Savings"

class GoalUpdate(BaseModel):
    name: Optional[str] = None
    target_amount: Optional[float] = None
    target_date: Optional[datetime] = None
    status: Optional[str] = None

class GoalDeposit(BaseModel):
    amount: float
    from_account_id: Optional[int] = None

class GoalResponse(BaseModel):
    id: int
    user_id: int
    name: str
    target_amount: float
    current_amount: float
    target_date: datetime
    category: str
    status: str
    progress_percentage: float = 0.0
    remaining_amount: float = 0.0
    suggested_monthly_saving: float = 0.0
    created_at: datetime

    class Config:
        from_attributes = True

from pydantic import BaseModel
from typing import List, Dict
from datetime import datetime

class CategorySpend(BaseModel):
    category: str
    amount: float
    percentage: float
    transaction_count: int

class MonthlyReportResponse(BaseModel):
    month_name: str
    year: int
    total_income: float
    total_expenses: float
    net_savings: float
    savings_rate_percentage: float
    category_breakdown: List[CategorySpend]
    top_merchants: List[Dict[str, str | float | int]]
    ai_monthly_summary: str

from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.models.account import AccountType, AccountStatus

class AccountCreate(BaseModel):
    name: str
    account_type: AccountType = AccountType.SAVINGS
    initial_balance: float = 0.0

class AccountResponse(BaseModel):
    id: int
    user_id: int
    account_number: str
    name: str
    account_type: AccountType
    balance: float
    currency: str
    status: AccountStatus
    created_at: datetime

    class Config:
        from_attributes = True

class TransferRequest(BaseModel):
    from_account_id: int
    to_account_number: str
    amount: float
    description: Optional[str] = "Transfer"
    category: Optional[str] = "Transfer"

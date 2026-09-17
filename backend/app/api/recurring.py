from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.models import User, RecurringExpense
from backend.app.schemas.schemas import RecurringExpenseCreate, RecurringExpenseResponse
from backend.app.auth.security import get_current_user

router = APIRouter(prefix="/api/recurring", tags=["Recurring Expenses"])


@router.get("", response_model=List[RecurringExpenseResponse])
def get_recurring_expenses(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    expenses = db.query(RecurringExpense).filter(RecurringExpense.user_id == current_user.id).all()
    return expenses


@router.post("", response_model=RecurringExpenseResponse)
def create_recurring_expense(
    payload: RecurringExpenseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    new_rec = RecurringExpense(
        user_id=current_user.id,
        merchant=payload.merchant,
        category=payload.category,
        estimated_amount=payload.estimated_amount,
        frequency=payload.frequency,
        payment_method=payload.payment_method,
        next_due_date=payload.next_due_date,
        is_active=True,
    )
    db.add(new_rec)
    db.commit()
    db.refresh(new_rec)
    return new_rec


@router.patch("/{rec_id}/toggle")
def toggle_recurring_status(
    rec_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rec = db.query(RecurringExpense).filter(RecurringExpense.id == rec_id, RecurringExpense.user_id == current_user.id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recurring expense not found")

    rec.is_active = not rec.is_active
    db.commit()
    return {"success": True, "is_active": rec.is_active}

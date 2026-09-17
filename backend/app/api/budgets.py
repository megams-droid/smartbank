from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.app.database import get_db
from backend.app.models.models import User, Budget, Transaction
from backend.app.schemas.schemas import BudgetCreate, BudgetUpdate, BudgetResponse
from backend.app.auth.security import get_current_user

router = APIRouter(prefix="/api/budgets", tags=["Budgets"])


@router.get("", response_model=List[BudgetResponse])
def get_budgets(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    curr_month = datetime.utcnow().strftime("%Y-%m")
    budgets = db.query(Budget).filter(Budget.user_id == current_user.id).all()

    # Recalculate actual spending from transactions for accuracy
    result = []
    for b in budgets:
        # Sum expenses in this category for the current month
        spent_sum = db.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == current_user.id,
            Transaction.category.ilike(b.category),
            Transaction.type.in_(["EXPENSE", "TRANSFER"]),
        ).scalar() or 0.0

        b.current_spent = float(spent_sum)
        utilization = round((b.current_spent / max(b.monthly_limit, 1.0)) * 100, 1)

        if utilization > 100.0:
            stat = "Exceeded"
        elif utilization >= 90.0:
            stat = "Near Limit"
        elif utilization >= 70.0:
            stat = "Watch"
        else:
            stat = "Normal"

        res_item = BudgetResponse(
            id=b.id,
            user_id=b.user_id,
            category=b.category,
            monthly_limit=b.monthly_limit,
            current_spent=b.current_spent,
            month_year=b.month_year or curr_month,
            alert_threshold=b.alert_threshold,
            utilization_percentage=utilization,
            status=stat,
            created_at=b.created_at,
        )
        result.append(res_item)

    return result


@router.post("", response_model=BudgetResponse)
def create_or_update_budget(
    payload: BudgetCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    curr_month = payload.month_year or datetime.utcnow().strftime("%Y-%m")
    existing = db.query(Budget).filter(
        Budget.user_id == current_user.id,
        Budget.category.ilike(payload.category),
    ).first()

    if existing:
        existing.monthly_limit = payload.monthly_limit
        existing.alert_threshold = payload.alert_threshold or 90.0
        db.commit()
        db.refresh(existing)
        b = existing
    else:
        b = Budget(
            user_id=current_user.id,
            category=payload.category,
            monthly_limit=payload.monthly_limit,
            current_spent=0.0,
            month_year=curr_month,
            alert_threshold=payload.alert_threshold or 90.0,
        )
        db.add(b)
        db.commit()
        db.refresh(b)

    # Compute utilization
    spent_sum = db.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == current_user.id,
        Transaction.category.ilike(b.category),
        Transaction.type.in_(["EXPENSE", "TRANSFER"]),
    ).scalar() or 0.0

    b.current_spent = float(spent_sum)
    utilization = round((b.current_spent / max(b.monthly_limit, 1.0)) * 100, 1)
    stat = "Exceeded" if utilization > 100 else "Near Limit" if utilization >= 90 else "Watch" if utilization >= 70 else "Normal"

    return BudgetResponse(
        id=b.id,
        user_id=b.user_id,
        category=b.category,
        monthly_limit=b.monthly_limit,
        current_spent=b.current_spent,
        month_year=b.month_year,
        alert_threshold=b.alert_threshold,
        utilization_percentage=utilization,
        status=stat,
        created_at=b.created_at,
    )


@router.put("/{budget_id}", response_model=BudgetResponse)
def update_budget(
    budget_id: str,
    payload: BudgetUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    b = db.query(Budget).filter(Budget.id == budget_id, Budget.user_id == current_user.id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Budget not found")

    if payload.monthly_limit is not None:
        b.monthly_limit = payload.monthly_limit
    if payload.alert_threshold is not None:
        b.alert_threshold = payload.alert_threshold

    db.commit()
    db.refresh(b)

    utilization = round((b.current_spent / max(b.monthly_limit, 1.0)) * 100, 1)
    stat = "Exceeded" if utilization > 100 else "Near Limit" if utilization >= 90 else "Watch" if utilization >= 70 else "Normal"

    return BudgetResponse(
        id=b.id,
        user_id=b.user_id,
        category=b.category,
        monthly_limit=b.monthly_limit,
        current_spent=b.current_spent,
        month_year=b.month_year,
        alert_threshold=b.alert_threshold,
        utilization_percentage=utilization,
        status=stat,
        created_at=b.created_at,
    )


@router.delete("/{budget_id}")
def delete_budget(
    budget_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    b = db.query(Budget).filter(Budget.id == budget_id, Budget.user_id == current_user.id).first()
    if not b:
        raise HTTPException(status_code=404, detail="Budget not found")
    db.delete(b)
    db.commit()
    return {"success": True, "message": "Budget deleted successfully"}

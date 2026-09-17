from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.models import User, FinancialGoal, Account, Transaction, Notification
from backend.app.schemas.schemas import (
    GoalCreate,
    GoalUpdate,
    GoalContribution,
    GoalResponse,
)
from backend.app.auth.security import get_current_user

router = APIRouter(prefix="/api/goals", tags=["Financial Goals"])


@router.get("", response_model=List[GoalResponse])
def get_goals(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    goals = db.query(FinancialGoal).filter(FinancialGoal.user_id == current_user.id).all()
    result = []
    
    now = datetime.utcnow()
    for g in goals:
        progress = round(min(100.0, (g.current_amount / max(g.target_amount, 1.0)) * 100), 1)
        remaining = max(0.0, g.target_amount - g.current_amount)
        
        # Calculate months remaining to target date
        months_left = max(1, (g.target_date.year - now.year) * 12 + (g.target_date.month - now.month))
        suggested_monthly = round(remaining / months_left, 0)

        result.append(
            GoalResponse(
                id=g.id,
                user_id=g.user_id,
                name=g.name,
                target_amount=g.target_amount,
                current_amount=g.current_amount,
                target_date=g.target_date,
                category=g.category,
                status="COMPLETED" if progress >= 100.0 else g.status,
                icon=g.icon or "Target",
                progress_percentage=progress,
                remaining_amount=remaining,
                suggested_monthly_saving=suggested_monthly,
                created_at=g.created_at,
            )
        )
    return result


@router.post("", response_model=GoalResponse)
def create_goal(
    payload: GoalCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    new_goal = FinancialGoal(
        user_id=current_user.id,
        name=payload.name,
        target_amount=payload.target_amount,
        current_amount=payload.initial_amount or 0.0,
        target_date=payload.target_date,
        category=payload.category or "SAVINGS",
        icon=payload.icon or "Target",
    )
    db.add(new_goal)
    db.commit()
    db.refresh(new_goal)

    progress = round(min(100.0, (new_goal.current_amount / max(new_goal.target_amount, 1.0)) * 100), 1)
    remaining = max(0.0, new_goal.target_amount - new_goal.current_amount)
    now = datetime.utcnow()
    months_left = max(1, (new_goal.target_date.year - now.year) * 12 + (new_goal.target_date.month - now.month))
    suggested_monthly = round(remaining / months_left, 0)

    return GoalResponse(
        id=new_goal.id,
        user_id=new_goal.user_id,
        name=new_goal.name,
        target_amount=new_goal.target_amount,
        current_amount=new_goal.current_amount,
        target_date=new_goal.target_date,
        category=new_goal.category,
        status=new_goal.status,
        icon=new_goal.icon,
        progress_percentage=progress,
        remaining_amount=remaining,
        suggested_monthly_saving=suggested_monthly,
        created_at=new_goal.created_at,
    )


@router.post("/{goal_id}/contribute")
def contribute_to_goal(
    goal_id: str,
    payload: GoalContribution,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    goal = db.query(FinancialGoal).filter(FinancialGoal.id == goal_id, FinancialGoal.user_id == current_user.id).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Financial goal not found")

    account = db.query(Account).filter(Account.id == payload.account_id, Account.user_id == current_user.id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    if account.balance < payload.amount:
        raise HTTPException(status_code=400, detail=f"Insufficient balance in {account.account_name} (Available: ₹{account.balance:,.0f})")

    account.balance -= payload.amount
    goal.current_amount += payload.amount

    if goal.current_amount >= goal.target_amount:
        goal.status = "COMPLETED"

    # Add transaction record
    txn = Transaction(
        user_id=current_user.id,
        account_id=account.id,
        amount=payload.amount,
        type="TRANSFER",
        category="Savings Goal",
        merchant=f"Goal Deposit: {goal.name}",
        payment_method="UPI",
        description=f"Contribution to savings goal '{goal.name}'",
        status="COMPLETED",
        date=datetime.utcnow(),
    )
    db.add(txn)

    # Add notification
    notif = Notification(
        user_id=current_user.id,
        title=f"Goal Milestone: {goal.name}",
        message=f"Added ₹{payload.amount:,.0f} to {goal.name}. Current total: ₹{goal.current_amount:,.0f} / ₹{goal.target_amount:,.0f}.",
        type="GOAL_PROGRESS",
    )
    db.add(notif)

    db.commit()

    return {
        "success": True,
        "message": f"Successfully contributed ₹{payload.amount:,.0f} to {goal.name}",
        "new_goal_amount": goal.current_amount,
        "progress_percentage": round((goal.current_amount / max(goal.target_amount, 1.0)) * 100, 1),
    }

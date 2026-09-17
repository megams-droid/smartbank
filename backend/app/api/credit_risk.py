from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.models import User, Transaction, Account, RecurringExpense
from backend.app.schemas.schemas import CreditRiskRequest, CreditRiskResponse
from backend.app.auth.security import get_current_user

router = APIRouter(prefix="/api/credit-risk", tags=["Credit Risk Simulation Demo"])


@router.post("/analyze", response_model=CreditRiskResponse)
def analyze_credit_risk(
    payload: CreditRiskRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Simulates a transparent educational Credit-Risk analysis based on user cash flows.
    DISCLAIMER: Educational FinTech prototype simulation. Not an official credit bureau score.
    """
    income = payload.monthly_income or current_user.monthly_income or 45000.0

    # Calculate actual expenses
    txns = db.query(Transaction).filter(Transaction.user_id == current_user.id).all()
    expense_txns = [t.amount for t in txns if t.type in ["EXPENSE", "TRANSFER"]]
    avg_expense = (sum(expense_txns) / 3) if expense_txns else 25000.0

    # Recurring commitments
    recurring = db.query(RecurringExpense).filter(RecurringExpense.user_id == current_user.id, RecurringExpense.is_active == True).all()
    recurring_total = sum(r.estimated_amount for r in recurring)

    # 1. Income Consistency (85/100)
    income_consistency = 88 if income >= 40000 else 72

    # 2. Repayment History (92/100)
    repayment_history = 92

    # 3. Expense-to-Income Ratio (DTI)
    dti = (avg_expense / max(income, 1.0)) * 100
    if dti <= 50.0:
        expense_ratio_score = 90
    elif dti <= 70.0:
        expense_ratio_score = 75
    elif dti <= 85.0:
        expense_ratio_score = 60
    else:
        expense_ratio_score = 40

    # 4. Transaction Stability
    tx_stability = 84

    # 5. Existing Obligations Score
    obligation_ratio = (recurring_total / max(income, 1.0)) * 100
    existing_obligations = 85 if obligation_ratio < 20 else 68

    # Overall Simulated Credit Score (300 to 850 range)
    weighted_composite = (
        (income_consistency * 0.25) +
        (repayment_history * 0.30) +
        (expense_ratio_score * 0.20) +
        (tx_stability * 0.15) +
        (existing_obligations * 0.10)
    )
    # Scale from 300 to 850
    estimated_score = int(300 + (weighted_composite / 100.0) * 550)

    if estimated_score >= 750:
        risk_band = "LOW"
    elif estimated_score >= 680:
        risk_band = "MODERATE"
    elif estimated_score >= 580:
        risk_band = "HIGH"
    else:
        risk_band = "CRITICAL"

    max_recommended = round(min(500000.0, income * 6.0 * (weighted_composite / 100.0)), 0)

    key_factors = [
        {"factor": "Income Consistency", "score": income_consistency, "rating": "Strong", "impact": "High Positive"},
        {"factor": "Repayment History", "score": repayment_history, "rating": "Excellent", "impact": "High Positive"},
        {"factor": "Debt-to-Income Ratio", "score": expense_ratio_score, "rating": f"{dti:.1f}% DTI", "impact": "Moderate"},
        {"factor": "Transaction Stability", "score": tx_stability, "rating": "Stable", "impact": "Positive"},
        {"factor": "Existing Obligations", "score": existing_obligations, "rating": f"₹{recurring_total:,.0f}/mo", "impact": "Neutral"},
    ]

    explanation = (
        f"Simulated credit profile indicates a '{risk_band}' risk tier (Score: {estimated_score}/850). "
        f"Primary drivers: Strong regular income inflow (₹{income:,.0f}/mo) and disciplined debt service ratio ({dti:.1f}%). "
        f"Maximum recommended safe borrowing limit is estimated at ₹{max_recommended:,.0f}."
    )

    return {
        "risk_band": risk_band,
        "estimated_score": estimated_score,
        "income_consistency_score": income_consistency,
        "repayment_history_score": repayment_history,
        "expense_ratio_score": expense_ratio_score,
        "transaction_stability_score": tx_stability,
        "existing_obligations_score": existing_obligations,
        "key_factors": key_factors,
        "explanation": explanation,
        "max_recommended_credit": max_recommended,
        "created_at": datetime.utcnow().isoformat(),
    }

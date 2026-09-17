from typing import List, Dict, Any, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from backend.app.database import get_db
from backend.app.models.models import (
    User,
    Account,
    Transaction,
    Budget,
    FinancialGoal,
    RecurringExpense,
    AnomalyRecord,
    AIInsight,
)
from backend.app.schemas.schemas import (
    CategorizationRequest,
    CategorizationResponse,
    AnomalyCheckRequest,
    AnomalyResponse,
    AnomalyReviewRequest,
    ForecastResponse,
    FinancialHealthResponse,
    ChatRequest,
    ChatResponse,
    InsightResponse,
)
from backend.app.auth.security import get_current_user
from backend.app.ai.categorization import categorize_transaction
from backend.app.ai.anomaly_detection import detect_anomaly
from backend.app.ai.forecasting import generate_expense_forecast
from backend.app.ai.financial_health import calculate_financial_health
from backend.app.ai.assistant import process_assistant_query
from backend.app.ai.insights import generate_ai_insights

router = APIRouter(prefix="/api/ai", tags=["AI Intelligence Engine"])


@router.post("/categorize", response_model=CategorizationResponse)
def api_categorize(payload: CategorizationRequest):
    result = categorize_transaction(
        merchant=payload.merchant,
        description=payload.description or "",
        amount=payload.amount or 0.0,
    )
    return result


@router.post("/check-anomaly", response_model=AnomalyResponse)
def api_check_anomaly(
    payload: AnomalyCheckRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    hist_txns = db.query(Transaction).filter(Transaction.user_id == current_user.id).order_by(desc(Transaction.date)).limit(100).all()
    hist_dicts = [{"amount": t.amount, "category": t.category, "type": t.type, "date": t.date.isoformat()} for t in hist_txns]

    result = detect_anomaly(
        amount=payload.amount,
        category=payload.category,
        merchant=payload.merchant,
        historical_transactions=hist_dicts,
    )
    return result


@router.get("/anomalies")
def get_user_anomalies(
    status_filter: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(AnomalyRecord).join(Transaction).filter(AnomalyRecord.user_id == current_user.id)
    if status_filter and status_filter.lower() != "all":
        query = query.filter(AnomalyRecord.status == status_filter.upper())
    
    anomalies = query.order_by(desc(AnomalyRecord.created_at)).all()
    
    result = []
    for a in anomalies:
        txn = a.transaction
        result.append({
            "id": a.id,
            "transaction_id": a.transaction_id,
            "anomaly_score": a.anomaly_score,
            "risk_level": a.risk_level,
            "reason": a.reason,
            "status": a.status,
            "model_version": a.model_version,
            "created_at": a.created_at,
            "transaction": {
                "amount": txn.amount if txn else 0,
                "merchant": txn.merchant if txn else "Unknown",
                "category": txn.category if txn else "Unknown",
                "date": txn.date if txn else datetime.utcnow(),
                "payment_method": txn.payment_method if txn else "UPI",
            }
        })
    return result


@router.post("/anomalies/{anomaly_id}/review")
def review_anomaly(
    anomaly_id: str,
    payload: AnomalyReviewRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rec = db.query(AnomalyRecord).filter(AnomalyRecord.id == anomaly_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Anomaly record not found")

    rec.status = payload.status
    rec.review_notes = payload.review_notes
    rec.reviewed_by = current_user.full_name

    # If resolved or marked false positive, unflag transaction status
    if payload.status in ["RESOLVED", "FALSE_POSITIVE"] and rec.transaction:
        rec.transaction.status = "COMPLETED"

    db.commit()
    return {"success": True, "status": rec.status}


@router.get("/forecast", response_model=ForecastResponse)
def get_forecast(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    txns = db.query(Transaction).filter(Transaction.user_id == current_user.id).all()
    txn_dicts = [{"amount": t.amount, "category": t.category, "type": t.type, "date": t.date.isoformat()} for t in txns]
    
    forecast_data = generate_expense_forecast(txn_dicts)
    return forecast_data


@router.get("/financial-health", response_model=FinancialHealthResponse)
def get_financial_health_score(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    accounts = db.query(Account).filter(Account.user_id == current_user.id).all()
    total_balance = sum(a.balance for a in accounts)
    emergency_bal = sum(a.balance for a in accounts if a.account_type in ["EMERGENCY_FUND", "SAVINGS"])

    # Monthly expense estimate
    txns = db.query(Transaction).filter(Transaction.user_id == current_user.id).all()
    expense_txns = [t for t in txns if t.type in ["EXPENSE", "TRANSFER"]]
    monthly_expense = (sum(t.amount for t in expense_txns) / max(1, len(set(t.date.strftime('%Y-%m') for t in txns)))) if txns else 25000.0

    budgets = db.query(Budget).filter(Budget.user_id == current_user.id).all()
    budget_dicts = [{"monthly_limit": b.monthly_limit, "current_spent": b.current_spent} for b in budgets]

    goals = db.query(FinancialGoal).filter(FinancialGoal.user_id == current_user.id).all()
    goal_dicts = [{"target_amount": g.target_amount, "current_amount": g.current_amount} for g in goals]

    txn_dicts = [{"amount": t.amount, "category": t.category, "type": t.type, "date": t.date.isoformat()} for t in txns]

    health = calculate_financial_health(
        monthly_income=current_user.monthly_income or 45000.0,
        monthly_expenses=monthly_expense,
        total_savings=total_balance,
        emergency_fund_balance=emergency_bal,
        budgets=budget_dicts,
        goals=goal_dicts,
        transactions=txn_dicts,
    )
    return health


@router.get("/insights", response_model=List[InsightResponse])
def get_insights(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    txns = db.query(Transaction).filter(Transaction.user_id == current_user.id).all()
    txn_dicts = [{"amount": t.amount, "category": t.category, "type": t.type, "date": t.date.isoformat(), "merchant": t.merchant} for t in txns]

    budgets = db.query(Budget).filter(Budget.user_id == current_user.id).all()
    budget_dicts = [{"category": b.category, "monthly_limit": b.monthly_limit, "current_spent": b.current_spent} for b in budgets]

    goals = db.query(FinancialGoal).filter(FinancialGoal.user_id == current_user.id).all()
    goal_dicts = [{"name": g.name, "target_amount": g.target_amount, "current_amount": g.current_amount} for g in goals]

    anomalies = db.query(AnomalyRecord).filter(AnomalyRecord.user_id == current_user.id).all()
    anomaly_dicts = [{"anomaly_score": a.anomaly_score, "risk_level": a.risk_level, "reason": a.reason, "status": a.status} for a in anomalies]

    insights = generate_ai_insights(
        transactions=txn_dicts,
        budgets=budget_dicts,
        goals=goal_dicts,
        anomalies=anomaly_dicts,
    )

    # Format response
    result = []
    for idx, ins in enumerate(insights):
        result.append(
            InsightResponse(
                id=f"ins-{idx+1}",
                insight_type=ins["insight_type"],
                title=ins["title"],
                summary=ins["summary"],
                explanation_why=ins["explanation_why"],
                action_suggested=ins.get("action_suggested"),
                impact_score=ins.get("impact_score", 7.5),
                created_at=datetime.utcnow(),
            )
        )
    return result


@router.post("/chat", response_model=ChatResponse)
def api_chat_assistant(
    payload: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    accounts = db.query(Account).filter(Account.user_id == current_user.id).all()
    acc_dicts = [{"account_name": a.account_name, "account_type": a.account_type, "balance": a.balance} for a in accounts]

    txns = db.query(Transaction).filter(Transaction.user_id == current_user.id).order_by(desc(Transaction.date)).all()
    txn_dicts = [{"amount": t.amount, "category": t.category, "type": t.type, "merchant": t.merchant, "date": t.date.isoformat()} for t in txns]

    budgets = db.query(Budget).filter(Budget.user_id == current_user.id).all()
    budget_dicts = [{"category": b.category, "monthly_limit": b.monthly_limit, "current_spent": b.current_spent} for b in budgets]

    goals = db.query(FinancialGoal).filter(FinancialGoal.user_id == current_user.id).all()
    goal_dicts = [{"name": g.name, "target_amount": g.target_amount, "current_amount": g.current_amount} for g in goals]

    recurring = db.query(RecurringExpense).filter(RecurringExpense.user_id == current_user.id).all()
    rec_dicts = [{"merchant": r.merchant, "estimated_amount": r.estimated_amount, "next_due_date": r.next_due_date.isoformat(), "is_active": r.is_active} for r in recurring]

    anomalies = db.query(AnomalyRecord).filter(AnomalyRecord.user_id == current_user.id).all()
    anomaly_dicts = [{"risk_level": a.risk_level, "anomaly_score": a.anomaly_score, "reason": a.reason, "status": a.status} for a in anomalies]

    # Quick health summary
    emergency_bal = sum(a.balance for a in accounts if a.account_type in ["EMERGENCY_FUND", "SAVINGS"])
    monthly_expense = (sum(t.amount for t in txns if t.type in ["EXPENSE", "TRANSFER"]) / 3) if txns else 25000.0
    health = calculate_financial_health(
        monthly_income=current_user.monthly_income or 45000.0,
        monthly_expenses=monthly_expense,
        total_savings=sum(a.balance for a in accounts),
        emergency_fund_balance=emergency_bal,
        budgets=budget_dicts,
        goals=goal_dicts,
        transactions=txn_dicts,
    )

    response = process_assistant_query(
        user_message=payload.message,
        user_name=current_user.full_name,
        accounts=acc_dicts,
        transactions=txn_dicts,
        budgets=budget_dicts,
        goals=goal_dicts,
        recurring=rec_dicts,
        anomalies=anomaly_dicts,
        health_data=health,
    )
    return response

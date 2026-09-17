from typing import List, Dict, Any
from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
import pandas as pd

from backend.app.database import get_db
from backend.app.models.models import (
    User,
    Account,
    Transaction,
    Budget,
    FinancialGoal,
    RecurringExpense,
    AnomalyRecord,
)
from backend.app.schemas.schemas import DashboardSummary, TransactionResponse, InsightResponse
from backend.app.auth.security import get_current_user
from backend.app.ai.financial_health import calculate_financial_health
from backend.app.ai.insights import generate_ai_insights

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("", response_model=DashboardSummary)
def get_dashboard_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    accounts = db.query(Account).filter(Account.user_id == current_user.id).all()
    total_balance = sum(a.balance for a in accounts)
    emergency_bal = sum(a.balance for a in accounts if a.account_type in ["EMERGENCY_FUND", "SAVINGS"])

    # All transactions
    txns = db.query(Transaction).filter(Transaction.user_id == current_user.id).order_by(desc(Transaction.date)).all()

    # Current month data
    curr_m = datetime.now(timezone.utc).strftime("%Y-%m")
    curr_txns = [t for t in txns if t.date.strftime("%Y-%m") == curr_m]

    monthly_income = sum(t.amount for t in curr_txns if t.type == "INCOME")
    if monthly_income == 0.0:
        monthly_income = current_user.monthly_income or 45000.0

    monthly_expenses = sum(t.amount for t in curr_txns if t.type in ["EXPENSE", "TRANSFER"])
    net_savings = max(0.0, monthly_income - monthly_expenses)
    savings_rate = round((net_savings / max(monthly_income, 1.0)) * 100, 1)

    # Budgets
    budgets = db.query(Budget).filter(Budget.user_id == current_user.id).all()
    budget_utilization = []
    near_limit_count = 0

    for b in budgets:
        # Calculate actual spent for this category
        cat_spent = sum(t.amount for t in curr_txns if t.category.lower() == b.category.lower() and t.type in ["EXPENSE", "TRANSFER"])
        b.current_spent = cat_spent
        pct = round((cat_spent / max(b.monthly_limit, 1.0)) * 100, 1)
        if pct >= 90.0:
            near_limit_count += 1
            
        stat = "Exceeded" if pct > 100 else "Near Limit" if pct >= 90 else "Watch" if pct >= 70 else "Normal"
        budget_utilization.append({
            "id": b.id,
            "category": b.category,
            "monthly_limit": b.monthly_limit,
            "current_spent": cat_spent,
            "utilization_pct": pct,
            "status": stat,
        })

    # Goals
    goals = db.query(FinancialGoal).filter(FinancialGoal.user_id == current_user.id).all()
    active_goals_count = len([g for g in goals if g.status == "ACTIVE"])

    # Recurring expenses
    recurring = db.query(RecurringExpense).filter(RecurringExpense.user_id == current_user.id, RecurringExpense.is_active == True).all()
    upcoming_recurring_total = sum(r.estimated_amount for r in recurring)

    # Anomalies
    anomalies = db.query(AnomalyRecord).filter(AnomalyRecord.user_id == current_user.id, AnomalyRecord.status.in_(["OPEN", "UNDER_REVIEW"])).all()
    active_anomalies_count = len(anomalies)

    # Financial health
    budget_dicts = [{"monthly_limit": b.monthly_limit, "current_spent": b.current_spent} for b in budgets]
    goal_dicts = [{"target_amount": g.target_amount, "current_amount": g.current_amount} for g in goals]
    txn_dicts = [{"amount": t.amount, "category": t.category, "type": t.type, "date": t.date.isoformat(), "merchant": t.merchant} for t in txns]

    health = calculate_financial_health(
        monthly_income=monthly_income,
        monthly_expenses=monthly_expenses if monthly_expenses > 0 else 22500.0,
        total_savings=total_balance,
        emergency_fund_balance=emergency_bal,
        budgets=budget_dicts,
        goals=goal_dicts,
        transactions=txn_dicts,
    )

    # Top spending categories
    category_map = {}
    for t in curr_txns:
        if t.type in ["EXPENSE", "TRANSFER"]:
            category_map[t.category] = category_map.get(t.category, 0.0) + t.amount
    
    top_categories = [
        {"category": k, "amount": round(v, 2), "percentage": round((v / max(monthly_expenses, 1.0)) * 100, 1)}
        for k, v in sorted(category_map.items(), key=lambda x: x[1], reverse=True)[:6]
    ]

    # Cash flow trend across past 4 months
    cash_flow_trend = []
    if txns:
        df = pd.DataFrame(txn_dicts)
        df["date"] = pd.to_datetime(df["date"])
        df["month"] = df["date"].dt.strftime("%b %Y")
        
        # Unique ordered months
        months_ordered = df.sort_values("date")["month"].unique()
        for m in months_ordered[-5:]:
            m_df = df[df["month"] == m]
            inc = float(m_df[m_df["type"] == "INCOME"]["amount"].sum())
            if inc == 0.0:
                inc = 45000.0
            exp = float(m_df[m_df["type"].isin(["EXPENSE", "TRANSFER"])]["amount"].sum())
            sav = max(0.0, inc - exp)
            cash_flow_trend.append({
                "month": m,
                "income": round(inc, 0),
                "expenses": round(exp, 0),
                "savings": round(sav, 0),
            })
    
    if not cash_flow_trend:
        cash_flow_trend = [
            {"month": "Jun 2026", "income": 45000, "expenses": 27200, "savings": 17800},
            {"month": "Jul 2026", "income": 45000, "expenses": 28900, "savings": 16100},
            {"month": "Aug 2026", "income": 45000, "expenses": 26400, "savings": 18600},
            {"month": "Sep 2026", "income": 45000, "expenses": 27850, "savings": 17150},
        ]

    # AI insights
    anomaly_dicts = [{"anomaly_score": a.anomaly_score, "risk_level": a.risk_level, "reason": a.reason, "status": a.status} for a in anomalies]
    raw_insights = generate_ai_insights(
        transactions=txn_dicts,
        budgets=budget_dicts,
        goals=goal_dicts,
        anomalies=anomaly_dicts,
    )
    ai_insights = [
        InsightResponse(
            id=f"dash-ins-{idx+1}",
            insight_type=ins["insight_type"],
            title=ins["title"],
            summary=ins["summary"],
            explanation_why=ins["explanation_why"],
            action_suggested=ins.get("action_suggested"),
            impact_score=ins.get("impact_score", 7.5),
            created_at=datetime.now(timezone.utc),
        )
        for idx, ins in enumerate(raw_insights[:4])
    ]

    # Recent transactions (top 10)
    recent_txns = [
        TransactionResponse.model_validate(t) for t in txns[:10]
    ]

    return DashboardSummary(
        total_balance=round(total_balance, 2),
        monthly_income=round(monthly_income, 2),
        monthly_expenses=round(monthly_expenses, 2),
        net_savings=round(net_savings, 2),
        savings_rate=savings_rate,
        health_score=health["overall_score"],
        active_anomalies_count=active_anomalies_count,
        near_limit_budgets_count=near_limit_count,
        active_goals_count=active_goals_count,
        upcoming_recurring_total=round(upcoming_recurring_total, 2),
        recent_transactions=recent_txns,
        top_categories=top_categories,
        cash_flow_trend=cash_flow_trend,
        budget_utilization=budget_utilization,
        ai_insights=ai_insights,
    )


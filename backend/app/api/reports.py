import io
import csv
from datetime import datetime
from typing import Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from sqlalchemy import desc

from backend.app.database import get_db
from backend.app.models.models import User, Transaction, Account, Budget
from backend.app.auth.security import get_current_user

router = APIRouter(prefix="/api/reports", tags=["Reports & Exports"])


@router.get("/monthly")
def get_monthly_report(
    month_year: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    target_month = month_year or datetime.utcnow().strftime("%Y-%m")
    
    txns = db.query(Transaction).filter(
        Transaction.user_id == current_user.id
    ).order_by(desc(Transaction.date)).all()

    filtered_txns = [t for t in txns if t.date.strftime("%Y-%m") == target_month]
    
    income_txns = [t for t in filtered_txns if t.type == "INCOME"]
    expense_txns = [t for t in filtered_txns if t.type in ["EXPENSE", "TRANSFER"]]

    total_income = sum(t.amount for t in income_txns)
    total_expenses = sum(t.amount for t in expense_txns)
    net_savings = max(0.0, total_income - total_expenses)
    savings_rate = (net_savings / max(total_income, 1.0)) * 100

    # Category breakdown
    category_totals = {}
    for t in expense_txns:
        c = t.category
        category_totals[c] = category_totals.get(c, 0.0) + t.amount

    cat_list = [
        {"category": k, "amount": round(v, 2), "percentage": round((v / max(total_expenses, 1.0)) * 100, 1)}
        for k, v in sorted(category_totals.items(), key=lambda x: x[1], reverse=True)
    ]

    # Budgets for that month
    budgets = db.query(Budget).filter(Budget.user_id == current_user.id).all()
    budget_performance = []
    for b in budgets:
        spent = category_totals.get(b.category, 0.0)
        budget_performance.append({
            "category": b.category,
            "monthly_limit": b.monthly_limit,
            "actual_spent": spent,
            "variance": round(b.monthly_limit - spent, 2),
            "utilization_pct": round((spent / max(b.monthly_limit, 1.0)) * 100, 1),
            "status": "Exceeded" if spent > b.monthly_limit else "Within Budget"
        })

    return {
        "month_year": target_month,
        "generated_at": datetime.utcnow().isoformat(),
        "summary": {
            "total_income": total_income,
            "total_expenses": total_expenses,
            "net_savings": net_savings,
            "savings_rate": round(savings_rate, 1),
            "transaction_count": len(filtered_txns),
        },
        "category_breakdown": cat_list,
        "budget_performance": budget_performance,
        "transactions": [
            {
                "id": t.id,
                "date": t.date.isoformat(),
                "amount": t.amount,
                "type": t.type,
                "category": t.category,
                "merchant": t.merchant,
                "payment_method": t.payment_method,
                "status": t.status,
            }
            for t in filtered_txns
        ]
    }


@router.get("/export/csv")
def export_transactions_csv(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    txns = db.query(Transaction).filter(Transaction.user_id == current_user.id).order_by(desc(Transaction.date)).all()

    output = io.StringIO()
    writer = csv.writer(output)
    
    # Headers
    writer.writerow([
        "Transaction ID",
        "Date",
        "Type",
        "Category",
        "Merchant",
        "Amount (INR)",
        "Payment Method",
        "Description",
        "Status",
        "Is Anomaly",
        "AI Confidence",
    ])

    for t in txns:
        writer.writerow([
            t.id,
            t.date.strftime("%Y-%m-%d %H:%M:%S"),
            t.type,
            t.category,
            t.merchant,
            f"{t.amount:.2f}",
            t.payment_method,
            t.description or "",
            t.status,
            "Yes" if t.is_anomaly else "No",
            f"{t.ai_confidence:.2f}",
        ])

    csv_content = output.getvalue()
    filename = f"smartbank_transactions_{datetime.utcnow().strftime('%Y%m%d')}.csv"

    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

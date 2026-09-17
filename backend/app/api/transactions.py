from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_

from backend.app.database import get_db
from backend.app.models.models import (
    User,
    Account,
    Transaction,
    Budget,
    AnomalyRecord,
    Notification,
)
from backend.app.schemas.schemas import (
    TransactionCreate,
    TransactionUpdate,
    TransactionResponse,
)
from backend.app.auth.security import get_current_user
from backend.app.ai.categorization import categorize_transaction
from backend.app.ai.anomaly_detection import detect_anomaly

router = APIRouter(prefix="/api/transactions", tags=["Transactions"])


@router.get("", response_model=List[TransactionResponse])
def get_transactions(
    category: Optional[str] = None,
    type: Optional[str] = None,
    account_id: Optional[str] = None,
    is_anomaly: Optional[bool] = None,
    search: Optional[str] = None,
    limit: int = Query(50, ge=1, le=500),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Transaction).filter(Transaction.user_id == current_user.id)

    if category and category.lower() != "all":
        query = query.filter(Transaction.category.ilike(category))
    if type and type.lower() != "all":
        query = query.filter(Transaction.type == type.upper())
    if account_id:
        query = query.filter(Transaction.account_id == account_id)
    if is_anomaly is not None:
        query = query.filter(Transaction.is_anomaly == is_anomaly)
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                Transaction.merchant.ilike(search_pattern),
                Transaction.description.ilike(search_pattern),
                Transaction.category.ilike(search_pattern),
            )
        )

    txns = query.order_by(desc(Transaction.date)).offset(offset).limit(limit).all()
    return txns


@router.get("/{txn_id}", response_model=TransactionResponse)
def get_transaction_detail(
    txn_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    txn = db.query(Transaction).filter(Transaction.id == txn_id, Transaction.user_id == current_user.id).first()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return txn


@router.post("", response_model=TransactionResponse)
def create_transaction(
    payload: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    account = db.query(Account).filter(Account.id == payload.account_id, Account.user_id == current_user.id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Selected account does not exist")

    # 1. AI Categorization
    cat_result = categorize_transaction(
        merchant=payload.merchant,
        description=payload.description or "",
        amount=payload.amount,
    )
    final_category = payload.category if payload.category and payload.category not in ["", "Auto", "Other"] else cat_result["category"]

    # 2. AI Anomaly Detection
    # Fetch recent transactions for statistical context
    hist_txns = db.query(Transaction).filter(Transaction.user_id == current_user.id).order_by(desc(Transaction.date)).limit(100).all()
    hist_dicts = [{"amount": t.amount, "category": t.category, "type": t.type, "date": t.date.isoformat()} for t in hist_txns]
    
    anomaly_result = detect_anomaly(
        amount=payload.amount,
        category=final_category,
        merchant=payload.merchant,
        historical_transactions=hist_dicts,
    )

    # 3. Create Transaction Record
    new_txn = Transaction(
        user_id=current_user.id,
        account_id=payload.account_id,
        date=payload.date or datetime.now(timezone.utc),
        amount=payload.amount,
        type=payload.type.upper(),
        category=final_category,
        merchant=payload.merchant,
        payment_method=payload.payment_method,
        description=payload.description,
        status="FLAGGED" if anomaly_result["is_anomaly"] and anomaly_result["risk_level"] == "HIGH" else "COMPLETED",
        is_anomaly=anomaly_result["is_anomaly"],
        anomaly_score=anomaly_result["anomaly_score"],
        anomaly_reason=anomaly_result["reason"] if anomaly_result["is_anomaly"] else None,
        is_recurring=cat_result.get("is_recurring_guess", False),
        ai_confidence=cat_result["confidence"],
        ai_categorization_reason=cat_result["reason"],
    )
    db.add(new_txn)
    db.flush()

    # 4. Update Account Balance
    if new_txn.type == "INCOME":
        account.balance += new_txn.amount
    else:
        account.balance -= new_txn.amount

    # 5. If Anomaly, create AnomalyRecord and Notification
    if anomaly_result["is_anomaly"]:
        anomaly_rec = AnomalyRecord(
            user_id=current_user.id,
            transaction_id=new_txn.id,
            anomaly_score=anomaly_result["anomaly_score"],
            risk_level=anomaly_result["risk_level"],
            reason=anomaly_result["reason"],
            status="OPEN",
            model_version=anomaly_result.get("model_version", "v1.4.2-isoforest-stat"),
        )
        db.add(anomaly_rec)

        notif = Notification(
            user_id=current_user.id,
            title=f"⚠️ {anomaly_result['risk_level']} Risk Anomaly Detected",
            message=f"Transaction of ₹{payload.amount:,.0f} at {payload.merchant} flagged. {anomaly_result['reason']}",
            type="ANOMALY_WARNING",
        )
        db.add(notif)

    # 6. Update Budget spent for current month
    curr_month = datetime.now(timezone.utc).strftime("%Y-%m")
    budget = db.query(Budget).filter(
        Budget.user_id == current_user.id,
        Budget.category.ilike(final_category),
        Budget.month_year == curr_month,
    ).first()
    
    if budget and new_txn.type in ["EXPENSE", "TRANSFER"]:
        budget.current_spent += new_txn.amount
        if budget.current_spent >= budget.monthly_limit * (budget.alert_threshold / 100):
            b_notif = Notification(
                user_id=current_user.id,
                title=f"🚨 Budget Warning: {budget.category}",
                message=f"You have used ₹{budget.current_spent:,.0f} of your ₹{budget.monthly_limit:,.0f} monthly limit for {budget.category}.",
                type="BUDGET_ALERT",
            )
            db.add(b_notif)

    db.commit()
    db.refresh(new_txn)
    return new_txn


@router.put("/{txn_id}", response_model=TransactionResponse)
def update_transaction(
    txn_id: str,
    payload: TransactionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    txn = db.query(Transaction).filter(Transaction.id == txn_id, Transaction.user_id == current_user.id).first()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")

    if payload.category:
        txn.category = payload.category
    if payload.merchant:
        txn.merchant = payload.merchant
    if payload.description is not None:
        txn.description = payload.description
    if payload.amount is not None and payload.amount != txn.amount:
        diff = payload.amount - txn.amount
        account = db.query(Account).filter(Account.id == txn.account_id).first()
        if account:
            if txn.type == "INCOME":
                account.balance += diff
            else:
                account.balance -= diff
        txn.amount = payload.amount

    db.commit()
    db.refresh(txn)
    return txn


@router.delete("/{txn_id}")
def delete_transaction(
    txn_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    txn = db.query(Transaction).filter(Transaction.id == txn_id, Transaction.user_id == current_user.id).first()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")

    # Revert account balance
    account = db.query(Account).filter(Account.id == txn.account_id).first()
    if account:
        if txn.type == "INCOME":
            account.balance -= txn.amount
        else:
            account.balance += txn.amount

    db.delete(txn)
    db.commit()
    return {"success": True, "message": "Transaction deleted successfully"}

from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.models import User, Account, Transaction, Notification
from backend.app.schemas.schemas import AccountCreate, AccountResponse, TransferRequest
from backend.app.auth.security import get_current_user

router = APIRouter(prefix="/api/accounts", tags=["Accounts"])


@router.get("", response_model=List[AccountResponse])
def get_user_accounts(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    accounts = db.query(Account).filter(Account.user_id == current_user.id).all()
    return accounts


@router.get("/{account_id}", response_model=AccountResponse)
def get_account_by_id(account_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    account = db.query(Account).filter(Account.id == account_id, Account.user_id == current_user.id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return account


@router.post("", response_model=AccountResponse)
def create_account(payload: AccountCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    count = db.query(Account).filter(Account.user_id == current_user.id).count()
    acc_num = f"SB-{current_user.id[:6].upper()}-{count+1:02d}"
    
    new_acc = Account(
        user_id=current_user.id,
        account_number=acc_num,
        account_name=payload.account_name,
        account_type=payload.account_type,
        balance=payload.initial_balance,
        currency=payload.currency,
        is_primary=(count == 0),
    )
    db.add(new_acc)
    db.commit()
    db.refresh(new_acc)
    return new_acc


@router.post("/transfer")
def transfer_funds(payload: TransferRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Simulates fund transfer between accounts or to external recipient.
    Updates source and destination balances atomically.
    """
    source = db.query(Account).filter(Account.id == payload.source_account_id, Account.user_id == current_user.id).first()
    if not source:
        raise HTTPException(status_code=404, detail="Source account not found")

    if source.balance < payload.amount:
        raise HTTPException(status_code=400, detail=f"Insufficient balance in {source.account_name} (Available: ₹{source.balance:,.0f})")

    # Deduct source
    source.balance -= payload.amount
    
    # Destination account if internal
    dest = None
    if payload.destination_account_id:
        dest = db.query(Account).filter(Account.id == payload.destination_account_id).first()
    elif payload.destination_account_number:
        dest = db.query(Account).filter(Account.account_number == payload.destination_account_number).first()

    dest_name = dest.account_name if dest else (payload.destination_account_number or "External Beneficiary")
    if dest:
        dest.balance += payload.amount

    # Create debit transaction
    debit_txn = Transaction(
        user_id=current_user.id,
        account_id=source.id,
        amount=payload.amount,
        type="EXPENSE" if not dest else "TRANSFER",
        category="Transfer",
        merchant=f"Transfer to {dest_name}",
        payment_method=payload.payment_method,
        description=payload.description or f"Transfer from {source.account_name} to {dest_name}",
        status="COMPLETED",
        date=datetime.utcnow(),
    )
    db.add(debit_txn)

    # If internal transfer to another user or same user's account, add credit record
    if dest and dest.user_id != current_user.id:
        credit_txn = Transaction(
            user_id=dest.user_id,
            account_id=dest.id,
            amount=payload.amount,
            type="INCOME",
            category="Transfer",
            merchant=f"Transfer from {current_user.full_name}",
            payment_method=payload.payment_method,
            description=f"Received from {current_user.full_name}",
            status="COMPLETED",
            date=datetime.utcnow(),
        )
        db.add(credit_txn)

    # Add notification
    notif = Notification(
        user_id=current_user.id,
        title="Fund Transfer Successful",
        message=f"₹{payload.amount:,.0f} transferred successfully from {source.account_name} to {dest_name}.",
        type="SYSTEM_NOTICE",
    )
    db.add(notif)

    db.commit()

    return {
        "success": True,
        "message": f"Successfully transferred ₹{payload.amount:,.0f}",
        "source_new_balance": source.balance,
        "destination": dest_name,
        "transaction_id": debit_txn.id,
    }

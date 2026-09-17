from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.models import User, Account
from backend.app.schemas.schemas import UserCreate, UserLogin, UserResponse, TokenResponse
from backend.app.auth.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_current_user,
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse)
def register_user(payload: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists."
        )

    new_user = User(
        email=payload.email.lower(),
        full_name=payload.full_name,
        phone=payload.phone,
        hashed_password=get_password_hash(payload.password),
        role=payload.role if payload.role in ["CUSTOMER", "ADMIN", "SUPPORT_AGENT"] else "CUSTOMER",
        monthly_income=45000.0,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Automatically create a primary savings account
    primary_acc = Account(
        user_id=new_user.id,
        account_number=f"SB-{new_user.id[:8].upper()}-01",
        account_name="Primary Savings",
        account_type="SAVINGS",
        balance=25000.0,
        currency="INR",
        is_primary=True,
    )
    db.add(primary_acc)
    db.commit()

    token = create_access_token(data={"sub": new_user.id, "role": new_user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": new_user,
    }


@router.post("/login", response_model=TokenResponse)
def login_user(payload: UserLogin, db: Session = Depends(get_db)):
    email_lookup = payload.email.lower()
    if email_lookup in ["customer@smartbank.ai", "demo@smartbank.ai"]:
        email_lookup = "alex@smartbank.ai"

    user = db.query(User).filter(User.email == email_lookup).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Account is disabled")

    token = create_access_token(data={"sub": user.id, "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user,
    }


@router.post("/demo-login", response_model=TokenResponse)
def demo_login(role: str = "CUSTOMER", db: Session = Depends(get_db)):
    """
    1-Click Demo Login for hackathon judges and demo evaluations.
    """
    target_role = "ADMIN" if role.upper() == "ADMIN" else "CUSTOMER"
    user = db.query(User).filter(User.role == target_role).first()
    if not user:
        # Fallback to any user
        user = db.query(User).first()

    if not user:
        raise HTTPException(status_code=404, detail="No demo user found. Please run seed script.")

    token = create_access_token(data={"sub": user.id, "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user,
    }


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return current_user

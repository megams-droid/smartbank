import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from backend.app.database import SessionLocal, engine, Base
from backend.app.models.models import (
    User,
    Account,
    Transaction,
    Budget,
    FinancialGoal,
    RecurringExpense,
    Notification,
    AIInsight,
    AnomalyRecord,
    KYCRecord,
    CreditRiskAssessment,
)
from backend.app.auth.security import get_password_hash
from backend.app.ai.categorization import categorize_transaction
from backend.app.ai.anomaly_detection import detect_anomaly


def seed_database(db: Session = None):
    close_at_end = False
    if db is None:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        close_at_end = True

    try:
        # Check if already seeded
        existing_user = db.query(User).filter(User.email == "alex@smartbank.ai").first()
        if existing_user:
            print("Database already contains demo seed data.")
            return

        print("Seeding SmartBank AI demo database with 120+ synthetic transactions...")

        # 1. Create Demo Users
        alex = User(
            email="alex@smartbank.ai",
            full_name="Alex Chen",
            hashed_password=get_password_hash("password123"),
            role="CUSTOMER",
            phone="+91 98765 43210",
            avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            monthly_income=45000.0,
            is_active=True,
        )
        db.add(alex)

        admin = User(
            email="admin@smartbank.ai",
            full_name="Chief Risk Officer (Admin)",
            hashed_password=get_password_hash("admin123"),
            role="ADMIN",
            phone="+91 98000 11223",
            avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
            monthly_income=95000.0,
            is_active=True,
        )
        db.add(admin)

        priya = User(
            email="priya@smartbank.ai",
            full_name="Priya Sharma",
            hashed_password=get_password_hash("password123"),
            role="CUSTOMER",
            phone="+91 91234 56789",
            avatar_url="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
            monthly_income=55000.0,
            is_active=True,
        )
        db.add(priya)
        db.flush()

        # 2. Create Accounts for Alex
        acc_savings = Account(
            user_id=alex.id,
            account_number="SB-882190-01",
            account_name="Primary Savings",
            account_type="SAVINGS",
            balance=82450.0,
            currency="INR",
            is_primary=True,
        )
        acc_checking = Account(
            user_id=alex.id,
            account_number="SB-882190-02",
            account_name="Checking Account",
            account_type="CHECKING",
            balance=24200.0,
            currency="INR",
            is_primary=False,
        )
        acc_emergency = Account(
            user_id=alex.id,
            account_number="SB-882190-03",
            account_name="Emergency Fund Reserve",
            account_type="EMERGENCY_FUND",
            balance=35000.0,
            currency="INR",
            is_primary=False,
        )
        acc_investment = Account(
            user_id=alex.id,
            account_number="SB-882190-04",
            account_name="High-Yield Liquid Index",
            account_type="INVESTMENT",
            balance=115000.0,
            currency="INR",
            is_primary=False,
        )
        db.add_all([acc_savings, acc_checking, acc_emergency, acc_investment])
        db.flush()

        # Accounts for Priya
        priya_acc = Account(
            user_id=priya.id,
            account_number="SB-993412-01",
            account_name="Primary Savings",
            account_type="SAVINGS",
            balance=48500.0,
            currency="INR",
            is_primary=True,
        )
        db.add(priya_acc)
        db.flush()

        # 3. Create Smart Budgets for Alex
        curr_month = datetime.utcnow().strftime("%Y-%m")
        budgets_data = [
            ("Food", 6000.0, 90.0),
            ("Shopping", 5000.0, 85.0),
            ("Transport", 3500.0, 90.0),
            ("Bills", 4500.0, 90.0),
            ("Entertainment", 2500.0, 80.0),
            ("Healthcare", 3000.0, 90.0),
        ]
        for cat, limit, thresh in budgets_data:
            b = Budget(
                user_id=alex.id,
                category=cat,
                monthly_limit=limit,
                current_spent=0.0,
                month_year=curr_month,
                alert_threshold=thresh,
            )
            db.add(b)

        # 4. Create Financial Goals for Alex
        now = datetime.utcnow()
        goals_data = [
            ("MacBook Pro M-Series Fund", 80000.0, 32000.0, now + timedelta(days=120), "Electronics", "Laptop"),
            ("3-Month Emergency Safety Net", 75000.0, 35000.0, now + timedelta(days=180), "Emergency", "Shield"),
            ("Tokyo Vacation Trip", 120000.0, 45000.0, now + timedelta(days=240), "Travel", "Plane"),
            ("Executive AI Certification", 40000.0, 28000.0, now + timedelta(days=60), "Education", "GraduationCap"),
        ]
        for name, target, curr, t_date, cat, icon in goals_data:
            g = FinancialGoal(
                user_id=alex.id,
                name=name,
                target_amount=target,
                current_amount=curr,
                target_date=t_date,
                category=cat,
                icon=icon,
                status="ACTIVE",
            )
            db.add(g)

        # 5. Create Recurring Expenses
        recurring_data = [
            ("Netflix Premium UHD", "Entertainment", 649.0, now + timedelta(days=8), "DEBIT_CARD"),
            ("ACT Fibernet 300Mbps", "Bills", 799.0, now + timedelta(days=12), "UPI"),
            ("Spotify Family Plan", "Entertainment", 179.0, now + timedelta(days=15), "UPI"),
            ("Cult.fit Pass Elite", "Healthcare", 1250.0, now + timedelta(days=20), "CREDIT_CARD"),
            ("Jio Fiber Broadband", "Bills", 399.0, now + timedelta(days=25), "UPI"),
        ]
        for merchant, cat, amt, due, pm in recurring_data:
            rec = RecurringExpense(
                user_id=alex.id,
                merchant=merchant,
                category=cat,
                estimated_amount=amt,
                frequency="MONTHLY",
                payment_method=pm,
                next_due_date=due,
                last_billed_date=due - timedelta(days=30),
                is_active=True,
            )
            db.add(rec)

        # 6. Generate 100+ Realistic Historical & Current Transactions
        # Covering 4 months (Jun 2026, Jul 2026, Aug 2026, Sep 2026)
        merchants_pool = [
            ("Swiggy Delivery", "Food", 240, 680, "UPI"),
            ("Zomato Gourmet", "Food", 320, 850, "UPI"),
            ("Starbucks Coffee", "Food", 350, 650, "CREDIT_CARD"),
            ("Dominos Pizza", "Food", 450, 920, "UPI"),
            ("Chai Point", "Food", 120, 280, "UPI"),
            ("Zepto Daily Groceries", "Shopping", 350, 1400, "UPI"),
            ("Blinkit Quick Commerce", "Shopping", 280, 1100, "UPI"),
            ("Amazon Marketplace", "Shopping", 650, 2800, "CREDIT_CARD"),
            ("Myntra Fashion App", "Shopping", 1200, 3200, "CREDIT_CARD"),
            ("Uber India Premier", "Transport", 180, 540, "UPI"),
            ("Ola Cabs Ride", "Transport", 150, 420, "UPI"),
            ("Metro Smart Card Recharge", "Transport", 300, 500, "UPI"),
            ("HPCL Petrol Fuel", "Transport", 500, 1500, "DEBIT_CARD"),
            ("Airtel Postpaid Mobile", "Bills", 599, 599, "UPI"),
            ("BESCOM Electricity Bill", "Bills", 1450, 2200, "UPI"),
            ("Apollo Pharmacy", "Healthcare", 250, 1200, "UPI"),
            ("BookMyShow Movies", "Entertainment", 400, 900, "UPI"),
            ("Coursera Learning", "Education", 2999, 3999, "CREDIT_CARD"),
        ]

        transactions_to_add = []
        historical_dicts = []

        # Generate month-by-month transactions
        for month_offset in range(3, -1, -1):
            base_date = now - timedelta(days=month_offset * 30)
            
            # Monthly Salary (Day 1)
            salary_date = base_date.replace(day=1, hour=10, minute=0)
            sal_txn = Transaction(
                user_id=alex.id,
                account_id=acc_savings.id,
                date=salary_date,
                amount=45000.0,
                type="INCOME",
                category="Salary",
                merchant="TechCorp Global Payroll",
                payment_method="BANK_TRANSFER",
                description="Monthly Salary Credit",
                status="COMPLETED",
                is_anomaly=False,
                anomaly_score=5.0,
                is_recurring=True,
                ai_confidence=0.99,
                ai_categorization_reason="Identified regular payroll deposit signature.",
            )
            transactions_to_add.append(sal_txn)
            historical_dicts.append({"amount": 45000.0, "category": "Salary", "type": "INCOME", "date": salary_date.isoformat()})

            # Monthly Apartment Rent (Day 3)
            rent_date = base_date.replace(day=3, hour=11, minute=30)
            rent_txn = Transaction(
                user_id=alex.id,
                account_id=acc_savings.id,
                date=rent_date,
                amount=12000.0,
                type="EXPENSE",
                category="Rent",
                merchant="Landlord Residential Lease",
                payment_method="BANK_TRANSFER",
                description="Monthly Apartment Rent",
                status="COMPLETED",
                is_anomaly=False,
                anomaly_score=10.0,
                is_recurring=True,
                ai_confidence=0.98,
                ai_categorization_reason="Matches recurring residential lease agreement.",
            )
            transactions_to_add.append(rent_txn)
            historical_dicts.append({"amount": 12000.0, "category": "Rent", "type": "EXPENSE", "date": rent_date.isoformat()})

            # Monthly Recurring Subscriptions
            rec_dates = [base_date.replace(day=d, hour=14, minute=0) for d in [8, 12, 15, 20]]
            for (m, cat, amt, _, pm), r_date in zip(recurring_data[:4], rec_dates):
                rec_txn = Transaction(
                    user_id=alex.id,
                    account_id=acc_checking.id if pm == "UPI" else acc_savings.id,
                    date=r_date,
                    amount=amt,
                    type="EXPENSE",
                    category=cat,
                    merchant=m,
                    payment_method=pm,
                    description=f"Auto-debit for {m}",
                    status="COMPLETED",
                    is_anomaly=False,
                    anomaly_score=8.0,
                    is_recurring=True,
                    ai_confidence=0.99,
                    ai_categorization_reason="Known recurring monthly subscription.",
                )
                transactions_to_add.append(rec_txn)
                historical_dicts.append({"amount": amt, "category": cat, "type": "EXPENSE", "date": r_date.isoformat()})

            # 22-26 daily casual transactions per month
            num_txns = random.randint(22, 26)
            for i in range(num_txns):
                day_val = min(28, max(1, random.randint(2, 28)))
                hour_val = random.randint(8, 22)
                min_val = random.randint(0, 59)
                t_date = base_date.replace(day=day_val, hour=hour_val, minute=min_val)

                m_name, cat, min_amt, max_amt, pm = random.choice(merchants_pool)
                amt = float(random.randint(min_amt, max_amt))

                # Check categorization
                cat_eval = categorize_transaction(m_name, "", amt)

                txn_item = Transaction(
                    user_id=alex.id,
                    account_id=acc_checking.id if pm == "UPI" else acc_savings.id,
                    date=t_date,
                    amount=amt,
                    type="EXPENSE",
                    category=cat,
                    merchant=m_name,
                    payment_method=pm,
                    description=f"Payment at {m_name}",
                    status="COMPLETED",
                    is_anomaly=False,
                    anomaly_score=random.uniform(5.0, 22.0),
                    is_recurring=cat_eval.get("is_recurring_guess", False),
                    ai_confidence=cat_eval["confidence"],
                    ai_categorization_reason=cat_eval["reason"],
                )
                transactions_to_add.append(txn_item)
                historical_dicts.append({"amount": amt, "category": cat, "type": "EXPENSE", "date": t_date.isoformat()})

        # Insert Intentional Anomalies for Hackathon Showcase
        # 1. Deliberate Anomaly: ₹12,500 Luxury Designer Jewelry/Watch purchase (2 days ago)
        anomaly_date_1 = now - timedelta(days=2, hours=4)
        anom_eval_1 = detect_anomaly(12500.0, "Shopping", "Titan Haute Horlogerie", historical_dicts)
        anom_txn_1 = Transaction(
            user_id=alex.id,
            account_id=acc_savings.id,
            date=anomaly_date_1,
            amount=12500.0,
            type="EXPENSE",
            category="Shopping",
            merchant="Titan Haute Horlogerie",
            payment_method="CREDIT_CARD",
            description="Luxury timepiece purchase in-store",
            status="FLAGGED",
            is_anomaly=True,
            anomaly_score=anom_eval_1["anomaly_score"],
            anomaly_reason=anom_eval_1["reason"],
            is_recurring=False,
            ai_confidence=0.96,
            ai_categorization_reason="Merchant matches luxury goods boutique.",
        )
        transactions_to_add.append(anom_txn_1)

        # 2. Deliberate Anomaly: ₹24,000 International Hardware Store (12 days ago)
        anomaly_date_2 = now - timedelta(days=12, hours=8)
        anom_eval_2 = detect_anomaly(24000.0, "Shopping", "Apple Authorized Reseller", historical_dicts)
        anom_txn_2 = Transaction(
            user_id=alex.id,
            account_id=acc_savings.id,
            date=anomaly_date_2,
            amount=24000.0,
            type="EXPENSE",
            category="Shopping",
            merchant="Apple Authorized Reseller",
            payment_method="CREDIT_CARD",
            description="Studio display accessory hardware",
            status="FLAGGED",
            is_anomaly=True,
            anomaly_score=anom_eval_2["anomaly_score"],
            anomaly_reason=anom_eval_2["reason"],
            is_recurring=False,
            ai_confidence=0.97,
            ai_categorization_reason="Merchant matches authorized computer and electronics store.",
        )
        transactions_to_add.append(anom_txn_2)

        # Add all transactions to DB
        db.add_all(transactions_to_add)
        db.flush()

        # Create Anomaly Records for Admin Review Queue
        anom_rec_1 = AnomalyRecord(
            user_id=alex.id,
            transaction_id=anom_txn_1.id,
            anomaly_score=anom_txn_1.anomaly_score,
            risk_level="HIGH",
            reason=anom_txn_1.anomaly_reason or "Amount ₹12,500 is 4.2x above historical 95th percentile.",
            status="OPEN",
            model_version="v1.4.2-isoforest-stat",
        )
        anom_rec_2 = AnomalyRecord(
            user_id=alex.id,
            transaction_id=anom_txn_2.id,
            anomaly_score=anom_txn_2.anomaly_score,
            risk_level="HIGH",
            reason=anom_txn_2.anomaly_reason or "High value transaction deviation detected.",
            status="UNDER_REVIEW",
            reviewed_by="Automated SecOps",
            review_notes="Flagged for user step-up 2FA confirmation.",
            model_version="v1.4.2-isoforest-stat",
        )
        db.add_all([anom_rec_1, anom_rec_2])

        # 7. Create KYC Record
        kyc = KYCRecord(
            user_id=alex.id,
            document_type="AADHAAR",
            document_number="XXXX-XXXX-8921",
            extracted_name="Alex Chen",
            extracted_dob="1996-08-14",
            extracted_address="742 Evergreen Heights, Koramangala 4th Block, Bengaluru, KA 560034",
            ocr_confidence=0.98,
            status="VERIFIED",
        )
        db.add(kyc)

        # KYC for Priya (Under Review for Admin demo)
        kyc_priya = KYCRecord(
            user_id=priya.id,
            document_type="PAN",
            document_number="ABCDE1234F",
            extracted_name="Priya Sharma",
            extracted_dob="1998-03-22",
            extracted_address="Flat 402, Lotus Residency, Indiranagar, Bengaluru, KA 560038",
            ocr_confidence=0.94,
            status="NEEDS_REVIEW",
        )
        db.add(kyc_priya)

        # 8. Create Credit Risk Assessment
        credit = CreditRiskAssessment(
            user_id=alex.id,
            risk_band="MODERATE",
            estimated_score=745,
            income_consistency_score=88,
            repayment_history_score=92,
            expense_ratio_score=75,
            transaction_stability_score=84,
            existing_obligations_score=85,
            key_factors_json='[{"factor": "Income Stability", "rating": "Strong"}, {"factor": "Low Default Probability", "rating": "Excellent"}]',
            explanation="Steady monthly payroll inflow (₹45,000) with disciplined debt obligations and high savings rate.",
        )
        db.add(credit)

        # 9. Create Notifications
        notif1 = Notification(
            user_id=alex.id,
            title="⚠️ High Risk Anomaly Detected",
            message="Unusual ₹12,500 transaction at Titan Haute Horlogerie flagged for review. Amount is 4.2x above your 90-day average.",
            type="ANOMALY_WARNING",
            is_read=False,
        )
        notif2 = Notification(
            user_id=alex.id,
            title="🚨 Food Budget at 91% Limit",
            message="You have spent ₹5,450 of your ₹6,000 Food & Dining budget.",
            type="BUDGET_ALERT",
            is_read=False,
        )
        notif3 = Notification(
            user_id=alex.id,
            title="🎯 Goal Milestone: MacBook Pro",
            message="Congratulations! Your MacBook Pro Fund has crossed the 40% milestone (₹32,000 saved).",
            type="GOAL_PROGRESS",
            is_read=True,
        )
        db.add_all([notif1, notif2, notif3])

        # Commit everything
        db.commit()
        print("✅ Database seeding completed successfully! 120+ transactions created.")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        if close_at_end:
            db.close()


if __name__ == "__main__":
    seed_database()

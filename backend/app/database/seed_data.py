import datetime
import random
from sqlalchemy.orm import Session
from app.models.user import User, UserRole
from app.models.account import Account, AccountType, AccountStatus
from app.models.transaction import Transaction, TransactionType, AnomalyStatus
from app.models.budget import Budget
from app.models.goal import FinancialGoal
from app.models.recurring import RecurringExpense
from app.models.notification import Notification
from app.models.kyc import KYCRecord, KYCStatus, KYCDocumentType
from app.models.credit_risk import CreditRiskAssessment, RiskBand
from app.models.audit import AuditLog
from app.auth.hash import get_password_hash
from app.ai.categorization import predict_category
from app.ai.anomaly_detection import evaluate_transaction_anomaly

def seed_demo_database(db: Session):
    # Check if already seeded
    existing_user = db.query(User).filter(User.email == "demo@smartbank.ai").first()
    if existing_user:
        return

    # 1. Create Demo Customer & Admin
    demo_customer = User(
        email="demo@smartbank.ai",
        hashed_password=get_password_hash("password123"),
        full_name="Alex Varma",
        phone="+91 98765 43210",
        role=UserRole.CUSTOMER,
        avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
    )
    db.add(demo_customer)

    demo_admin = User(
        email="admin@smartbank.ai",
        hashed_password=get_password_hash("adminpassword123"),
        full_name="Sarah Jenkins (Risk Lead)",
        phone="+91 91234 56789",
        role=UserRole.ADMIN,
        avatar_url="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150"
    )
    db.add(demo_admin)
    db.flush()

    # 2. Create Accounts for Customer
    acc_savings = Account(
        user_id=demo_customer.id,
        account_number="SB-8829-4102",
        name="Primary Savings",
        account_type=AccountType.SAVINGS,
        balance=82450.00,
        currency="INR",
        status=AccountStatus.ACTIVE
    )
    acc_checking = Account(
        user_id=demo_customer.id,
        account_number="SB-1940-5821",
        name="Checking Account",
        account_type=AccountType.CHECKING,
        balance=24200.00,
        currency="INR",
        status=AccountStatus.ACTIVE
    )
    acc_emergency = Account(
        user_id=demo_customer.id,
        account_number="SB-9931-7734",
        name="Emergency Reserve Fund",
        account_type=AccountType.EMERGENCY,
        balance=35000.00,
        currency="INR",
        status=AccountStatus.ACTIVE
    )
    db.add_all([acc_savings, acc_checking, acc_emergency])
    db.flush()

    # 3. Create 120+ Rich Synthetic Transactions over past 90 days
    now = datetime.datetime.utcnow()
    transactions = []

    # Historical template patterns
    daily_merchants = [
        ("Swiggy Delivery", "Food", (180, 520), "UPI", "Lunch & dinner food delivery"),
        ("Zomato Online", "Food", (220, 680), "UPI", "Restaurant order"),
        ("Chai Point", "Food", (80, 160), "UPI", "Evening tea & snacks"),
        ("Blinkit Groceries", "Food", (350, 1200), "UPI", "Instant grocery essentials"),
        ("Uber Ride", "Transport", (140, 420), "UPI", "Daily commute cab ride"),
        ("Rapido Bike", "Transport", (45, 95), "UPI", "Metro station connector"),
        ("Shell Petrol Station", "Transport", (800, 1800), "Debit Card", "Vehicle fuel top-up"),
        ("Amazon India", "Shopping", (450, 2800), "Credit Card", "Household & tech essentials"),
        ("D-Mart Retail", "Food", (1200, 3400), "Debit Card", "Bi-weekly household supplies"),
        ("Myntra Fashion", "Shopping", (899, 2499), "UPI", "Apparel & footwear purchase"),
        ("Apollo Pharmacy", "Healthcare", (150, 750), "UPI", "Prescription medicines & vitamins"),
        ("BookMyShow Movies", "Entertainment", (400, 950), "UPI", "Weekend movie tickets"),
    ]

    historical_amounts = []

    # Generate 3 months of recurring salary & rent
    for month_offset in [2, 1, 0]:
        base_date = now - datetime.timedelta(days=month_offset * 30)
        
        # Salary credit
        salary_date = base_date.replace(day=1)
        transactions.append(Transaction(
            user_id=demo_customer.id,
            account_id=acc_savings.id,
            amount=85000.00,
            type=TransactionType.INCOME,
            category="Salary",
            merchant="TechCorp Global Payroll",
            payment_method="Bank Transfer",
            description="Monthly salary credit for software engineer",
            date=salary_date,
            status="COMPLETED",
            ai_confidence=0.99,
            ai_explanation="Direct payroll credit pattern recognized",
            is_anomaly=False,
            anomaly_score=0.01,
            anomaly_risk_level="LOW",
            anomaly_status=AnomalyStatus.RESOLVED
        ))

        # Rent payment
        rent_date = base_date.replace(day=5)
        transactions.append(Transaction(
            user_id=demo_customer.id,
            account_id=acc_savings.id,
            amount=15000.00,
            type=TransactionType.EXPENSE,
            category="Rent",
            merchant="Apartment Maintenance & Rent",
            payment_method="Bank Transfer",
            description="Monthly apartment rent transfer",
            date=rent_date,
            status="COMPLETED",
            ai_confidence=0.95,
            ai_explanation="Monthly recurring rent transfer pattern",
            is_anomaly=False,
            anomaly_score=0.08,
            anomaly_risk_level="LOW",
            anomaly_status=AnomalyStatus.RESOLVED
        ))
        historical_amounts.append(15000.0)

        # Subscriptions
        sub_date = base_date.replace(day=10)
        transactions.append(Transaction(
            user_id=demo_customer.id,
            account_id=acc_checking.id,
            amount=649.00,
            type=TransactionType.EXPENSE,
            category="Entertainment",
            merchant="Netflix India",
            payment_method="Credit Card",
            description="Monthly Premium 4K Subscription",
            date=sub_date,
            status="COMPLETED",
            ai_confidence=0.99,
            ai_explanation="Matches verified entertainment subscription pattern",
            is_anomaly=False,
            anomaly_score=0.02,
            anomaly_risk_level="LOW"
        ))
        historical_amounts.append(649.0)

        transactions.append(Transaction(
            user_id=demo_customer.id,
            account_id=acc_checking.id,
            amount=799.00,
            type=TransactionType.EXPENSE,
            category="Bills",
            merchant="Airtel Broadband",
            payment_method="UPI",
            description="Monthly 200Mbps Fiber Internet",
            date=sub_date + datetime.timedelta(days=2),
            status="COMPLETED",
            ai_confidence=0.98,
            ai_explanation="Matches verified utility provider pattern",
            is_anomaly=False,
            anomaly_score=0.02,
            anomaly_risk_level="LOW"
        ))
        historical_amounts.append(799.0)

        transactions.append(Transaction(
            user_id=demo_customer.id,
            account_id=acc_checking.id,
            amount=119.00,
            type=TransactionType.EXPENSE,
            category="Entertainment",
            merchant="Spotify Premium",
            payment_method="UPI",
            description="Individual Music Subscription",
            date=sub_date + datetime.timedelta(days=4),
            status="COMPLETED",
            ai_confidence=0.99,
            ai_explanation="Matches digital audio subscription pattern",
            is_anomaly=False,
            anomaly_score=0.02,
            anomaly_risk_level="LOW"
        ))
        historical_amounts.append(119.0)

    # Generate 100 random daily transactions
    for day in range(88, 0, -1):
        tx_date = now - datetime.timedelta(days=day, hours=random.randint(1, 20), minutes=random.randint(0, 59))
        num_txs_today = random.choices([1, 2, 3], weights=[0.5, 0.35, 0.15])[0]
        
        for _ in range(num_txs_today):
            merchant, cat, (min_a, max_a), method, desc = random.choice(daily_merchants)
            amt = round(random.uniform(min_a, max_a), 2)
            historical_amounts.append(amt)
            
            ai_info = predict_category(merchant, desc, amt)
            
            account_choice = acc_checking.id if amt < 1000 else acc_savings.id
            
            transactions.append(Transaction(
                user_id=demo_customer.id,
                account_id=account_choice,
                amount=amt,
                type=TransactionType.EXPENSE,
                category=ai_info["category"],
                merchant=merchant,
                payment_method=method,
                description=desc,
                date=tx_date,
                status="COMPLETED",
                ai_confidence=ai_info["confidence"],
                ai_explanation=ai_info["reason"],
                is_anomaly=False,
                anomaly_score=round(random.uniform(0.02, 0.18), 3),
                anomaly_risk_level="LOW",
                anomaly_status=AnomalyStatus.RESOLVED
            ))

    # 4. Insert TWO DELIBERATE ANOMALY TRANSACTIONS for hackathon demo!
    # A. Recent High Anomaly: ₹12,500 Titan Watches (Flagged)
    anomaly_date_1 = now - datetime.timedelta(days=2, hours=3)
    anomaly_eval_1 = evaluate_transaction_anomaly(12500.0, "Shopping", historical_amounts)
    
    transactions.append(Transaction(
        user_id=demo_customer.id,
        account_id=acc_savings.id,
        amount=12500.00,
        type=TransactionType.EXPENSE,
        category="Shopping",
        merchant="Titan Luxury Chronograph Store",
        payment_method="Credit Card",
        description="Luxury chronograph wristwatch purchase",
        date=anomaly_date_1,
        status="COMPLETED",
        ai_confidence=0.92,
        ai_explanation="Merchant matched luxury retail shopping",
        is_anomaly=True,
        anomaly_score=0.91,
        anomaly_risk_level="HIGH",
        anomaly_reason=anomaly_eval_1["reason"],
        anomaly_status=AnomalyStatus.OPEN
    ))

    # B. Moderate Anomaly: ₹8,900 Electronics (Under review)
    anomaly_date_2 = now - datetime.timedelta(days=12, hours=5)
    anomaly_eval_2 = evaluate_transaction_anomaly(8900.0, "Shopping", historical_amounts)

    transactions.append(Transaction(
        user_id=demo_customer.id,
        account_id=acc_savings.id,
        amount=8900.00,
        type=TransactionType.EXPENSE,
        category="Shopping",
        merchant="Apple Authorized Premium Reseller",
        payment_method="Credit Card",
        description="Noise Cancelling Headphones & MagSafe",
        date=anomaly_date_2,
        status="COMPLETED",
        ai_confidence=0.95,
        ai_explanation="Merchant matched consumer electronics retail",
        is_anomaly=True,
        anomaly_score=0.74,
        anomaly_risk_level="MEDIUM",
        anomaly_reason=anomaly_eval_2["reason"],
        anomaly_status=AnomalyStatus.UNDER_REVIEW
    ))

    db.add_all(transactions)

    # 5. Create Realistic Budgets
    budgets = [
        Budget(user_id=demo_customer.id, category="Food", monthly_limit=6000.0),
        Budget(user_id=demo_customer.id, category="Shopping", monthly_limit=4000.0),
        Budget(user_id=demo_customer.id, category="Transport", monthly_limit=3000.0),
        Budget(user_id=demo_customer.id, category="Bills", monthly_limit=5000.0),
        Budget(user_id=demo_customer.id, category="Entertainment", monthly_limit=2500.0),
    ]
    db.add_all(budgets)

    # 6. Create Financial Goals
    goals = [
        FinancialGoal(
            user_id=demo_customer.id,
            name="MacBook Pro M3 Fund",
            target_amount=120000.0,
            current_amount=78000.0,
            target_date=now + datetime.timedelta(days=120),
            category="Tech & Gadgets",
            status="IN_PROGRESS"
        ),
        FinancialGoal(
            user_id=demo_customer.id,
            name="Emergency 6-Month Reserve",
            target_amount=100000.0,
            current_amount=35000.0,
            target_date=now + datetime.timedelta(days=240),
            category="Emergency",
            status="IN_PROGRESS"
        ),
        FinancialGoal(
            user_id=demo_customer.id,
            name="Japan Autumn Vacation",
            target_amount=180000.0,
            current_amount=45000.0,
            target_date=now + datetime.timedelta(days=300),
            category="Travel",
            status="IN_PROGRESS"
        )
    ]
    db.add_all(goals)

    # 7. Create Recurring Expenses
    recurring = [
        RecurringExpense(user_id=demo_customer.id, merchant="Netflix India", category="Entertainment", amount=649.0, frequency="MONTHLY", next_due_date=now + datetime.timedelta(days=12)),
        RecurringExpense(user_id=demo_customer.id, merchant="Airtel Broadband Fiber", category="Bills", amount=799.0, frequency="MONTHLY", next_due_date=now + datetime.timedelta(days=14)),
        RecurringExpense(user_id=demo_customer.id, merchant="Spotify Premium", category="Entertainment", amount=119.0, frequency="MONTHLY", next_due_date=now + datetime.timedelta(days=16)),
        RecurringExpense(user_id=demo_customer.id, merchant="Cult.fit Fitness Membership", category="Healthcare", amount=1500.0, frequency="MONTHLY", next_due_date=now + datetime.timedelta(days=22)),
    ]
    db.add_all(recurring)

    # 8. Create KYC Records
    kyc_1 = KYCRecord(
        user_id=demo_customer.id,
        document_type=KYCDocumentType.PAN,
        document_number="ABCDE1234F",
        extracted_name="Alex Varma",
        extracted_dob="1994-08-15",
        ocr_confidence=0.98,
        status=KYCStatus.VERIFIED,
        review_notes="Automated OCR identity verification confirmed with zero discrepancies."
    )
    db.add(kyc_1)

    # 9. Create Credit Risk Assessment
    credit_assessment = CreditRiskAssessment(
        user_id=demo_customer.id,
        score=768,
        risk_band=RiskBand.LOW,
        income_stability_score=92.0,
        repayment_history_score=95.0,
        expense_ratio_score=78.0,
        transaction_stability_score=84.0,
        savings_growth_score=72.0,
        explanation="Consistent monthly tech payroll salary credits with low debt utilization and stable utility bill payments over 90 days.",
        model_version="SmartBank-CreditRisk-v2.1"
    )
    db.add(credit_assessment)

    # 10. Create Notifications
    notifications = [
        Notification(
            user_id=demo_customer.id,
            title="Potential Anomaly Flagged",
            message="Titan Luxury Chronograph Store (₹12,500) is 5.8x above your typical transaction average. Please review.",
            type="ANOMALY",
            is_read=False
        ),
        Notification(
            user_id=demo_customer.id,
            title="Budget Utilization Alert",
            message="You have utilized 94% of your monthly Shopping budget (₹3,760 / ₹4,000).",
            type="BUDGET",
            is_read=False
        ),
        Notification(
            user_id=demo_customer.id,
            title="Goal Milestone Achieved",
            message="Your MacBook Pro M3 Fund reached 65% completion! Suggested next deposit: ₹7,000.",
            type="GOAL",
            is_read=True
        ),
        Notification(
            user_id=demo_customer.id,
            title="Upcoming Recurring Bill",
            message="Airtel Broadband Fiber (₹799) is scheduled in 4 days.",
            type="ALERT",
            is_read=True
        )
    ]
    db.add_all(notifications)

    # 11. Create Audit Logs
    audit = AuditLog(
        user_id=demo_customer.id,
        action="USER_LOGIN",
        entity_type="AUTH",
        entity_id=str(demo_customer.id),
        details="Demo Customer logged in successfully from demo session",
        ip_address="127.0.0.1"
    )
    db.add(audit)

    db.commit()

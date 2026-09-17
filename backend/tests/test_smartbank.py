import pytest
from backend.app.ai.categorization import categorize_transaction
from backend.app.ai.anomaly_detection import detect_anomaly
from backend.app.ai.forecasting import generate_expense_forecast
from backend.app.ai.financial_health import calculate_financial_health
from backend.app.ai.assistant import process_assistant_query


def test_ai_categorization():
    # Food test
    res_food = categorize_transaction("Swiggy Delivery", "Biryani and drinks", 450.0)
    assert res_food["category"] == "Food"
    assert res_food["confidence"] >= 0.90
    assert "food" in res_food["reason"].lower() or "dining" in res_food["reason"].lower()

    # Transport test
    res_uber = categorize_transaction("Uber India", "Airport ride", 650.0)
    assert res_uber["category"] == "Transport"
    assert res_uber["confidence"] >= 0.90

    # Streaming test
    res_netflix = categorize_transaction("Netflix Premium", "Monthly subscription", 649.0)
    assert res_netflix["category"] == "Entertainment"
    assert res_netflix["is_recurring_guess"] is True


def test_anomaly_detection_normal_vs_outlier():
    # Synthetic normal history (around ₹300 - ₹800)
    history = [
        {"amount": 350.0, "category": "Food", "type": "EXPENSE"},
        {"amount": 420.0, "category": "Food", "type": "EXPENSE"},
        {"amount": 500.0, "category": "Transport", "type": "EXPENSE"},
        {"amount": 650.0, "category": "Shopping", "type": "EXPENSE"},
        {"amount": 250.0, "category": "Food", "type": "EXPENSE"},
        {"amount": 780.0, "category": "Bills", "type": "EXPENSE"},
        {"amount": 450.0, "category": "Food", "type": "EXPENSE"},
        {"amount": 320.0, "category": "Food", "type": "EXPENSE"},
        {"amount": 600.0, "category": "Shopping", "type": "EXPENSE"},
        {"amount": 550.0, "category": "Transport", "type": "EXPENSE"},
    ]

    # Normal transaction: ₹450
    normal_eval = detect_anomaly(450.0, "Food", "Swiggy", history)
    assert normal_eval["is_anomaly"] is False
    assert normal_eval["risk_level"] == "LOW"

    # Outlier transaction: ₹12,500 (Extreme spike compared to historical mean ~₹487)
    outlier_eval = detect_anomaly(12500.0, "Shopping", "Luxury Boutique", history)
    assert outlier_eval["is_anomaly"] is True
    assert outlier_eval["risk_level"] in ["HIGH", "MEDIUM"]
    assert outlier_eval["anomaly_score"] >= 60.0
    assert "higher" in outlier_eval["reason"].lower() or "deviation" in outlier_eval["reason"].lower()


def test_expense_forecasting():
    sample_txns = [
        {"amount": 5000.0, "category": "Food", "type": "EXPENSE", "date": "2026-06-15"},
        {"amount": 5200.0, "category": "Food", "type": "EXPENSE", "date": "2026-07-15"},
        {"amount": 5450.0, "category": "Food", "type": "EXPENSE", "date": "2026-08-15"},
        {"amount": 3000.0, "category": "Transport", "type": "EXPENSE", "date": "2026-06-10"},
        {"amount": 3100.0, "category": "Transport", "type": "EXPENSE", "date": "2026-07-10"},
        {"amount": 3200.0, "category": "Transport", "type": "EXPENSE", "date": "2026-08-10"},
    ]
    forecast = generate_expense_forecast(sample_txns)
    assert "estimated_total_expenses" in forecast
    assert forecast["estimated_total_expenses"] > 0
    assert len(forecast["categories"]) > 0
    assert forecast["categories"][0]["forecasted_amount"] > 0
    assert forecast["categories"][0]["explanation"] != ""


def test_financial_health_score():
    health = calculate_financial_health(
        monthly_income=45000.0,
        monthly_expenses=25000.0,
        total_savings=85000.0,
        emergency_fund_balance=35000.0,
        budgets=[{"monthly_limit": 6000.0, "current_spent": 5400.0}],
        goals=[{"target_amount": 80000.0, "current_amount": 32000.0}],
        transactions=[{"amount": 450.0, "type": "EXPENSE", "category": "Food"}] * 15,
    )
    assert 0 <= health["overall_score"] <= 100
    assert health["rating"] in ["EXCELLENT", "GOOD", "MODERATE", "NEEDS_ATTENTION"]
    assert len(health["factors"]) == 5
    assert len(health["improvement_tips"]) > 0


def test_assistant_grounded_query():
    accounts = [{"account_name": "Primary Savings", "balance": 82450.0}]
    txns = [
        {"amount": 450.0, "category": "Food", "merchant": "Swiggy", "type": "EXPENSE", "date": "2026-09-10"},
        {"amount": 12000.0, "category": "Rent", "merchant": "Landlord", "type": "EXPENSE", "date": "2026-09-01"},
    ]
    budgets = [{"category": "Food", "monthly_limit": 6000.0}]
    
    # Test balance query
    bal_res = process_assistant_query("What is my total balance?", "Alex", accounts, txns, budgets, [], [], [])
    assert "82,450" in bal_res["reply"]

    # Test biggest expense
    exp_res = process_assistant_query("What is my biggest expense?", "Alex", accounts, txns, budgets, [], [], [])
    assert "12,000" in exp_res["reply"] or "Landlord" in exp_res["reply"]

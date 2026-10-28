from app.ai.categorization import predict_category
from app.ai.anomaly_detection import evaluate_transaction_anomaly
from app.ai.forecasting import generate_expense_forecast
from app.ai.financial_health import calculate_financial_health_score
from app.ai.assistant import query_financial_assistant

def test_categorization_merchant_nlp():
    swiggy_res = predict_category("Swiggy Delivery", "Order #9921", 450.0)
    assert swiggy_res["category"] == "Food"
    assert swiggy_res["confidence"] > 0.8
    assert "Food" in swiggy_res["reason"] or "food" in swiggy_res["reason"]

    uber_res = predict_category("Uber India", "Cab ride to airport", 520.0)
    assert uber_res["category"] == "Transport"

    netflix_res = predict_category("Netflix Subscription", "Monthly billing", 649.0)
    assert netflix_res["category"] == "Entertainment"

def test_anomaly_detection_isolation_forest():
    # Normal spending distribution: 200 - 800
    baseline = [250.0, 320.0, 480.0, 510.0, 620.0, 750.0, 390.0, 410.0, 550.0, 600.0, 300.0]
    
    # Normal amount: ₹450
    normal_eval = evaluate_transaction_anomaly(450.0, "Food", baseline)
    assert normal_eval["is_anomaly"] is False
    assert normal_eval["risk_level"] == "LOW"

    # Extreme anomalous amount: ₹14,500
    anom_eval = evaluate_transaction_anomaly(14500.0, "Shopping", baseline)
    assert anom_eval["is_anomaly"] is True
    assert anom_eval["risk_level"] in ["MEDIUM", "HIGH"]
    assert "higher" in anom_eval["reason"] or "Z-score" in anom_eval["explanation"]

def test_expense_forecasting():
    category_data = {
        "Food": [4800.0, 5100.0, 5300.0],
        "Transport": [2200.0, 2400.0, 2500.0]
    }
    forecast = generate_expense_forecast(category_data)
    assert forecast["total_estimated_expenses"] > 5000.0
    assert len(forecast["category_breakdowns"]) == 2
    assert "SmartBank" in forecast["model_name"]

def test_financial_health_calculation():
    health = calculate_financial_health_score(
        monthly_income=85000.0,
        monthly_expenses=35000.0,
        total_savings=90000.0,
        budget_adherence_pct=100.0,
        goal_progress_pct=65.0
    )
    assert 0 <= health["overall_score"] <= 100
    assert len(health["factors"]) == 5
    assert health["rating"] in ["Excellent", "Good"]

def test_financial_assistant_grounded_answers():
    context = {
        "total_balance": 141650.0,
        "monthly_income": 85000.0,
        "monthly_expenses": 32400.0,
        "savings": 52600.0,
        "savings_rate": 61.8,
        "category_spending": {"Food": 5240.0, "Shopping": 4100.0},
        "top_expenses": [{"merchant": "Rent Transfer", "amount": 15000.0, "category": "Rent", "date": "05 Sep"}],
        "recent_anomalies": [],
        "budgets": [{"category": "Food", "monthly_limit": 6000.0, "utilization_percentage": 87.3}],
        "goals": []
    }
    
    res1 = query_financial_assistant("How much did I spend on food this month?", context)
    assert "5,240" in res1["reply"] or "Food" in res1["reply"]
    assert res1["source_type"] == "DATABASE_FACT"

    res2 = query_financial_assistant("What is my biggest expense?", context)
    assert "Rent" in res2["reply"] or "15,000" in res2["reply"]

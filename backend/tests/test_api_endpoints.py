import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_demo_login_customer():
    response = client.post("/api/auth/demo-login?role=CUSTOMER")
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "CUSTOMER"
    assert data["user"]["email"] == "alex@smartbank.ai"


def test_demo_login_admin():
    response = client.post("/api/auth/demo-login?role=ADMIN")
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "ADMIN"


def test_dashboard_and_banking_flow():
    # Login as customer
    login_res = client.post("/api/auth/demo-login?role=CUSTOMER")
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Dashboard
    dash_res = client.get("/api/dashboard", headers=headers)
    assert dash_res.status_code == 200
    dash_data = dash_res.json()
    assert "total_balance" in dash_data
    assert dash_data["total_balance"] > 0
    assert len(dash_data["recent_transactions"]) > 0
    assert len(dash_data["ai_insights"]) > 0

    # Accounts
    acc_res = client.get("/api/accounts", headers=headers)
    assert acc_res.status_code == 200
    assert len(acc_res.json()) >= 3

    # Transactions
    tx_res = client.get("/api/transactions", headers=headers)
    assert tx_res.status_code == 200
    assert len(tx_res.json()) > 0

    # Create Transaction with AI auto-categorization
    acc_id = acc_res.json()[0]["id"]
    new_tx_res = client.post(
        "/api/transactions",
        headers=headers,
        json={
            "account_id": acc_id,
            "amount": 450.0,
            "category": "Auto",
            "merchant": "Swiggy Delivery",
            "payment_method": "UPI",
            "description": "Late night pizza dinner",
            "type": "EXPENSE",
        },
    )
    assert new_tx_res.status_code == 200
    new_tx = new_tx_res.json()
    assert new_tx["category"] == "Food"
    assert new_tx["ai_confidence"] >= 0.90

    # AI Forecast
    fc_res = client.get("/api/ai/forecast", headers=headers)
    assert fc_res.status_code == 200
    assert "estimated_total_expenses" in fc_res.json()

    # AI Health
    hlth_res = client.get("/api/ai/financial-health", headers=headers)
    assert hlth_res.status_code == 200
    assert "overall_score" in hlth_res.json()

    # AI Chat
    chat_res = client.post(
        "/api/ai/chat",
        headers=headers,
        json={"message": "How much did I spend on Food this month?"},
    )
    assert chat_res.status_code == 200
    assert "Food" in chat_res.json()["reply"]

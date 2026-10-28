def test_dashboard_and_transactions_flow(client):
    # 1. Login
    login_res = client.post("/api/auth/login", json={
        "email": "demo@smartbank.ai",
        "password": "password123"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Get Dashboard
    dash_res = client.get("/api/dashboard", headers=headers)
    assert dash_res.status_code == 200
    dash_data = dash_res.json()
    assert dash_data["overview"]["total_balance"] > 0
    assert len(dash_data["cash_flow"]) == 6
    assert len(dash_data["budgets"]) > 0

    # 3. Get Accounts
    accs_res = client.get("/api/accounts", headers=headers)
    assert accs_res.status_code == 200
    accounts = accs_res.json()
    assert len(accounts) >= 3
    savings_acc = accounts[0]

    # 4. Create Transaction with live AI Categorization
    tx_create_res = client.post("/api/transactions", headers=headers, json={
        "account_id": savings_acc["id"],
        "merchant": "Swiggy Express",
        "amount": 420.0,
        "type": "EXPENSE",
        "description": "Lunch wrap order"
    })
    assert tx_create_res.status_code == 200
    tx_data = tx_create_res.json()
    assert tx_data["category"] == "Food"
    assert tx_data["is_anomaly"] is False

    # 5. Create Anomalous Transaction
    anom_tx_res = client.post("/api/transactions", headers=headers, json={
        "account_id": savings_acc["id"],
        "merchant": "Rolex Boutique Bangalore",
        "amount": 18500.0,
        "type": "EXPENSE",
        "description": "Luxury watch"
    })
    assert anom_tx_res.status_code == 200
    anom_data = anom_tx_res.json()
    assert anom_data["is_anomaly"] is True
    assert anom_data["anomaly_risk_level"] in ["MEDIUM", "HIGH"]

    # 6. Check Assistant
    chat_res = client.post("/api/ai/chat", headers=headers, json={
        "message": "How much did I spend on food?"
    })
    assert chat_res.status_code == 200
    assert "Food" in chat_res.json()["reply"]

    # 7. Check KYC Status
    kyc_res = client.get("/api/kyc/status", headers=headers)
    assert kyc_res.status_code == 200

    # 8. Check Credit Risk Assessment
    cr_res = client.get("/api/credit-risk", headers=headers)
    assert cr_res.status_code == 200
    assert cr_res.json()["score"] >= 700

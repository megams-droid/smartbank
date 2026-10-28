def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_login_demo_customer(client):
    response = client.post("/api/auth/login", json={
        "email": "demo@smartbank.ai",
        "password": "password123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["email"] == "demo@smartbank.ai"
    assert data["role"] == "CUSTOMER"

def test_login_demo_admin(client):
    response = client.post("/api/auth/login", json={
        "email": "admin@smartbank.ai",
        "password": "adminpassword123"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["role"] == "ADMIN"

def test_login_invalid_credentials(client):
    response = client.post("/api/auth/login", json={
        "email": "demo@smartbank.ai",
        "password": "wrongpassword"
    })
    assert response.status_code == 401

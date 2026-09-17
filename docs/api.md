# 🌐 SmartBank AI — REST API Specification & Endpoint Documentation

Base URL: `http://localhost:8000` (or configured API domain)  
Interactive OpenAPI Swagger Docs: `http://localhost:8000/docs`  
ReDoc Documentation: `http://localhost:8000/redoc`

---

## 1. Authentication & User Management

### `POST /api/auth/register`
Creates a new customer account and returns JWT token.
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "SecurePassword123!",
    "full_name": "Siddharth Verma",
    "phone": "+91 98765 43210"
  }
  ```
- **Response**: `200 OK` (TokenResponse with User object)

### `POST /api/auth/login`
Authenticates existing credentials.
- **Request Body**:
  ```json
  {
    "email": "customer@smartbank.ai",
    "password": "password123"
  }
  ```
- **Response**: `200 OK` (`access_token`, `token_type: "bearer"`, `user`)

### `GET /api/auth/me`
Fetches current authenticated user profile and roles.

---

## 2. Customer Dashboard & Banking Core

### `GET /api/dashboard`
Aggregates real-time financial overview, balances, net cash flow, active anomaly count, near-limit budgets, and dynamic AI insight cards.

### `GET /api/accounts`
Lists all simulated customer accounts (Primary Savings, Checking Account, Emergency Fund).

### `POST /api/accounts/transfer`
Executes simulated inter-account or third-party UPI transfer.

---

## 3. Transactions & AI Pipeline

### `GET /api/transactions`
Retrieves paginated and filtered transactions.
- **Query Parameters**: `category`, `type`, `account_id`, `is_anomaly`, `search`, `limit`, `offset`.

### `POST /api/transactions`
Creates a transaction, runs **AI Auto-Categorization** and **Isolation Forest Anomaly Detection**, and updates account balances.
- **Request Body**:
  ```json
  {
    "account_id": "acc-uuid-1",
    "amount": 450.0,
    "type": "EXPENSE",
    "category": "Food",
    "merchant": "Swiggy",
    "payment_method": "UPI",
    "description": "Lunch order"
  }
  ```

---

## 4. AI & Machine Learning Services

### `POST /api/ai/categorize`
Direct inference endpoint for categorizing arbitrary merchant text strings with explainable rationale.

### `POST /api/ai/anomaly-check`
Infers anomaly risk level (`LOW`, `MEDIUM`, `HIGH`) and statistical Z-Score for a prospective transaction.

### `GET /api/ai/forecast`
Returns next-month expense projections by category using Weighted Moving Average and linear trend dampening.

### `GET /api/ai/financial-health`
Returns 0–100 Financial Health Index with 5-pillar factor breakdown (Savings Rate, Budget Adherence, Spending Consistency, Emergency Fund, Goal Milestones).

### `POST /api/ai/chat`
Answers financial questions grounded strictly in the user's actual database transactions and account data.
- **Request Body**:
  ```json
  {
    "message": "Where did I spend the most money this month?",
    "conversation_history": []
  }
  ```

---

## 5. Financial Management (Budgets, Goals, Reports, KYC, Admin)

### `GET /api/budgets` & `POST /api/budgets`
Lists and creates monthly budget limits with automatic threshold notifications.

### `GET /api/goals` & `POST /api/goals` & `POST /api/goals/{id}/contribute`
Manages savings targets and allocates funds from accounts to goal reserves.

### `GET /api/reports/monthly` & `GET /api/reports/export/csv`
Generates comprehensive monthly financial reports and downloads transaction CSV.

### `POST /api/kyc/upload` & `GET /api/kyc/status`
Simulated KYC document OCR processing and verification status.

### `POST /api/credit-risk/analyze`
Educational simulated credit risk scoring with multi-factor weighting.

### `GET /api/admin/fraud` & `POST /api/admin/fraud/{id}/review`
Admin Risk Center queue for reviewing, resolving, or flagging suspicious anomaly records.

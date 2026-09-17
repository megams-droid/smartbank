# 🏗️ SmartBank AI — System Architecture & Technical Design

## 1. System Overview

**SmartBank AI** is a multi-tier, explainable AI-powered FinTech platform engineered to turn everyday banking transactions into actionable financial intelligence. The system combines modern reactive frontend design, a high-throughput asynchronous REST API backend, lightweight and explainable Machine Learning engines, and a relational persistence layer.

```mermaid
flowchart TD
    subgraph ClientLayer ["Client Layer (Browser / Mobile)"]
        UI["React 18 + Vite + TypeScript + Tailwind CSS"]
        Charts["Recharts Interactive Data Visualizations"]
        State["Auth Context + Reactive State Management"]
    end

    subgraph APILayer ["API & Business Logic (FastAPI)"]
        Router["FastAPI Asynchronous Routers"]
        AuthMiddleware["OAuth2 Bearer JWT + RBAC Middleware"]
        Controllers["Banking & Intelligence Controllers"]
    end

    subgraph AIEngine ["AI / ML Intelligence Services"]
        CatML["TF-IDF + Naive Bayes Expense Categorizer"]
        AnomalyML["Isolation Forest + Statistical Z-Score Outlier Detector"]
        ForecastML["WMA + Linear Regression Time-Series Forecaster"]
        HealthML["5-Pillar Rule-Based Financial Health Engine"]
        AssistantEngine["Grounded Database-Aware Financial Assistant"]
    end

    subgraph StorageLayer ["Persistence & Cache"]
        DB[("PostgreSQL 15 / SQLite Dual-Engine (SQLAlchemy 2.0)")]
        ModelsDir[("Serialized ML Model Joblib Artifacts")]
    end

    UI --> Router
    Router --> AuthMiddleware
    AuthMiddleware --> Controllers
    Controllers --> CatML
    Controllers --> AnomalyML
    Controllers --> ForecastML
    Controllers --> HealthML
    Controllers --> AssistantEngine
    CatML --> ModelsDir
    AnomalyML --> ModelsDir
    Controllers --> DB
```

---

## 2. Core Processing Pipeline

Every transaction submitted by a customer passes through the deterministic and explainable SmartBank AI Intelligence Pipeline:

```mermaid
sequenceDiagram
    autonumber
    actor Customer as User / Client
    participant API as FastAPI Backend
    participant Categorizer as NLP Categorizer
    participant Anomaly as Isolation Forest Engine
    participant DB as Database (SQLAlchemy)
    participant Admin as Admin Risk Center

    Customer->>API: POST /api/transactions (amount, merchant, desc)
    API->>Categorizer: Infer Category + Confidence Score
    Categorizer-->>API: Category: "Food", Confidence: 95%
    API->>Anomaly: Evaluate Multi-factor Outlier Risk
    Anomaly-->>API: Score: 0.88, Risk: HIGH, Anomaly: True
    API->>DB: Persist Transaction (Status: FLAGGED)
    API->>DB: Create AnomalyRecord & Budget Alert Notification
    API-->>Customer: Return Transaction + Explainable 'Why?' Rationale
    Admin->>API: GET /api/admin/fraud (Review queue)
    Admin->>API: POST /api/admin/fraud/{id}/review (Status: RESOLVED)
```

---

## 3. Component Hierarchy

### Frontend Architecture (`frontend/src/`)
- **`layouts/`**: `DashboardLayout` (Collapsible responsive navigation, top header, user profile dropdown, active notification badges, compliance footer).
- **`pages/`**:
  - `LandingPage`: FinTech product landing page with hero CTA, feature spotlights, architecture preview, FAQ, and quick demo jump.
  - `DashboardPage`: Metric overview cards (Net Worth, Monthly Income, Spending, Savings Rate, Health Score), real-time charts, AI Insight Cards, and anomaly alerts.
  - `TransactionsPage`: Interactive transaction table with filtering, search, pagination, add/edit/delete modals, and "Why?" explainability popovers.
  - `BudgetsPage`: Category spending tracking with 4-tier alert status (Normal, Watch, Near Limit, Exceeded).
  - `GoalsPage`: Target savings milestones, progress bars, and dynamic monthly savings recommendations.
  - `ForecastPage`: Predictive expense analysis curves and category projection cards.
  - `FinancialHealthPage`: Transparent 5-pillar wellness score (0-100) with dynamic improvement recommendations.
  - `AssistantPage`: Conversational AI financial assistant with grounded database queries and predefined action prompts.
  - `KYCPage` & `CreditRiskPage`: Simulated onboarding OCR verification and educational credit-risk underwriting breakdown.
  - `admin/`: `AdminDashboardPage`, `FraudQueuePage`, `AdminKYCPage`, `AdminUsersPage`, and `AdminSystemPage`.

### Backend Architecture (`backend/app/`)
- **`api/`**: REST endpoints partitioned by domain (Auth, Accounts, Transactions, Budgets, Goals, Recurring, AI, KYC, Credit Risk, Reports, Notifications, Admin).
- **`ai/`**: Modular Python AI inference modules (`categorization.py`, `anomaly_detection.py`, `forecasting.py`, `financial_health.py`, `insights.py`, `assistant.py`).
- **`auth/`**: Password hashing with bcrypt, JWT token generation and validation, and role-based access checks (`CUSTOMER`, `ADMIN`, `SUPPORT_AGENT`).
- **`models/` & `schemas/`**: SQLAlchemy 2.0 ORM models and Pydantic v2 data contracts.

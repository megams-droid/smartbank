# 🗄️ SmartBank AI — Database Architecture & Entity Relationship Design

## 1. Database Overview

SmartBank AI uses a normalized relational database schema engineered with **SQLAlchemy 2.0 ORM** supporting both **PostgreSQL 15** (for containerized and production environments) and **SQLite** (for zero-dependency local development and testing).

- Primary keys: UUIDv4 strings for distributed uniqueness.
- Foreign keys: Enforced with cascading deletes for user lifecycle consistency.
- Timestamps: UTC-indexed `created_at` and `updated_at` on every table.
- Indexing: Strategic indexes on `user_id`, `account_id`, `category`, and `date` for millisecond dashboard query latency.

---

## 2. Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    USERS ||--o{ ACCOUNTS : owns
    USERS ||--o{ TRANSACTIONS : executes
    USERS ||--o{ BUDGETS : configures
    USERS ||--o{ FINANCIAL_GOALS : sets
    USERS ||--o{ RECURRING_EXPENSES : schedules
    USERS ||--o{ NOTIFICATIONS : receives
    USERS ||--o{ AI_INSIGHTS : generates
    USERS ||--o{ ANOMALIES : triggers
    USERS ||--o{ KYC_RECORDS : submits
    USERS ||--o{ CREDIT_RISK_ASSESSMENTS : receives
    ACCOUNTS ||--o{ TRANSACTIONS : records
    TRANSACTIONS ||--o| ANOMALIES : flags

    USERS {
        string id PK
        string email UK
        string full_name
        string hashed_password
        string role
        string phone
        string avatar_url
        boolean is_active
        float monthly_income
        datetime created_at
        datetime updated_at
    }

    ACCOUNTS {
        string id PK
        string user_id FK
        string account_number UK
        string account_name
        string account_type
        float balance
        string currency
        string status
        boolean is_primary
        datetime created_at
        datetime updated_at
    }

    TRANSACTIONS {
        string id PK
        string user_id FK
        string account_id FK
        datetime date
        float amount
        string type
        string category
        string merchant
        string payment_method
        string description
        string status
        boolean is_anomaly
        float anomaly_score
        string anomaly_reason
        boolean is_recurring
        float ai_confidence
        string ai_categorization_reason
        datetime created_at
        datetime updated_at
    }

    BUDGETS {
        string id PK
        string user_id FK
        string category
        float monthly_limit
        float current_spent
        string month_year
        float alert_threshold
        datetime created_at
        datetime updated_at
    }

    FINANCIAL_GOALS {
        string id PK
        string user_id FK
        string name
        float target_amount
        float current_amount
        datetime target_date
        string category
        string status
        string icon
        datetime created_at
        datetime updated_at
    }

    RECURRING_EXPENSES {
        string id PK
        string user_id FK
        string merchant
        string category
        float estimated_amount
        string frequency
        datetime last_billed_date
        datetime next_due_date
        string payment_method
        boolean is_active
        datetime created_at
        datetime updated_at
    }

    NOTIFICATIONS {
        string id PK
        string user_id FK
        string title
        text message
        string type
        boolean is_read
        text metadata_json
        datetime created_at
    }

    AI_INSIGHTS {
        string id PK
        string user_id FK
        string insight_type
        string title
        text summary
        text explanation_why
        text action_suggested
        float impact_score
        datetime created_at
    }

    ANOMALIES {
        string id PK
        string user_id FK
        string transaction_id FK,UK
        float anomaly_score
        string risk_level
        text reason
        string status
        string model_version
        string reviewed_by
        text review_notes
        datetime created_at
        datetime updated_at
    }

    KYC_RECORDS {
        string id PK
        string user_id FK
        string document_type
        string document_number
        string extracted_name
        string extracted_dob
        text extracted_address
        float ocr_confidence
        string status
        text rejection_reason
        datetime created_at
        datetime updated_at
    }

    CREDIT_RISK_ASSESSMENTS {
        string id PK
        string user_id FK
        string risk_band
        int estimated_score
        int income_consistency_score
        int repayment_history_score
        int expense_ratio_score
        int transaction_stability_score
        int existing_obligations_score
        text key_factors_json
        text explanation
        datetime created_at
    }

    AUDIT_LOGS {
        string id PK
        string user_id
        string action
        string entity_type
        string entity_id
        string ip_address
        text details_json
        datetime created_at
    }
```

---

## 3. Schema Data Constraints & Business Rules
1. **Accounts**: Balance cannot be updated without a corresponding Transaction or Transfer entry.
2. **Budgets**: `month_year` indexed format (`YYYY-MM`) enables longitudinal tracking across calendar months.
3. **Anomalies**: 1-to-1 unique relationship with `transactions.id`, ensuring each flagged transaction has an explicit administrative review state (`OPEN`, `UNDER_REVIEW`, `RESOLVED`, `FALSE_POSITIVE`).
4. **Audit Trail**: Administrative actions and user authentication events log IP address, entity ID, and change details to `audit_logs`.

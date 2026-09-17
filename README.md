# 🏦 SMARTBANK AI — AI-Powered Smart Banking & Financial Intelligence Platform

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat&logo=python&logoColor=white)](https://python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.3+-20232A?style=flat&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5+-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4+-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.4+-F7931E?style=flat&logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **"Turn everyday banking data into intelligent financial decisions."**  
> SmartBank AI is a FinTech startup prototype engineered to transform raw financial transactions into continuous, explainable intelligence: **Data Ingestion → NLP Auto-Categorization → Isolation Forest Anomaly Detection → Predictive Expense Forecasting → Grounded Financial Assistant → Action & Admin Risk Review**.

---

## 📑 Table of Contents
1. [Product Vision & Core Pipeline](#1-product-vision--core-pipeline)
2. [Key Differentiators & Innovation Points](#2-key-differentiators--innovation-points)
3. [Technology Stack](#3-technology-stack)
4. [Architecture & Micro-Pipelines](#4-architecture--micro-pipelines)
5. [Application Routes](#5-application-routes)
6. [Quick Start & Installation](#6-quick-start--installation)
7. [Demo Accounts & Preloaded Credentials](#7-demo-accounts--preloaded-credentials)
8. [3–5 Minute Hackathon Presentation Script](#8-35-minute-hackathon-presentation-script)
9. [AI / ML Methodology & Explainability ("Why?")](#9-ai--ml-methodology--explainability-why)
10. [Security & Compliance Disclaimer](#10-security--compliance-disclaimer)
11. [Project Verification Status](#11-project-verification-status)

---

## 1. Product Vision & Core Pipeline

SmartBank AI is not a basic CRUD dashboard. It delivers an integrated financial intelligence layer across every user touchpoint:

```
USER FINANCIAL DATA
       ↓
TRANSACTION PROCESSING
       ↓
AI / ML ANALYSIS
       ↓
PATTERN & OUTLIER DETECTION (Isolation Forest)
       ↓
EXPENSE FORECASTING (Moving Average + Linear Trend)
       ↓
PERSONALIZED EXPLAINABLE INSIGHTS ("Why?")
       ↓
USER ACTION & ADMIN RISK REVIEW
```

---

## 2. Key Differentiators & Innovation Points

1. **Explainable AI Everywhere ("Why?" Interactions)**: Every AI insight, forecast projection, and anomaly flag provides a clear plain-English mathematical rationale.
2. **Real-Time Anomaly & Fraud Risk Detection**: Unsupervised `IsolationForest` combined with longitudinal statistical Z-Score profiling detects off-hours, high-value, or atypical transactions.
3. **Predictive Expense Forecasting**: Projects upcoming monthly spend across individual categories using Weighted Moving Average (WMA) and linear slope dampening.
4. **Transparent 5-Pillar Financial Health Index (0–100)**: Evaluates Savings Rate (25%), Budget Adherence (25%), Spending Consistency (20%), Emergency Fund Buffer (15%), and Goal Milestones (15%).
5. **Grounded Financial Assistant**: Conversational AI assistant that parses natural language questions into verified SQL aggregations over the user's database records.
6. **Customer + Admin Risk Lifecycle**: End-to-end fraud management workflow where flagged transactions transition from customer alert to administrative resolution (`OPEN` → `UNDER_REVIEW` → `RESOLVED` / `FALSE_POSITIVE`).
7. **Simulated KYC & Credit Risk Underwriting**: Demo OCR extraction flow and educational credit-risk risk band evaluation.
8. **Indian Rupee (₹) First**: Native formatting (₹82,450) tailored for modern digital banking ecosystems (UPI, Debit Card, Net Banking).

---

## 3. Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript & Vite
- **Styling**: Tailwind CSS, modern dark glassmorphism FinTech aesthetics
- **Icons & Data Visualization**: Lucide React, Recharts interactive charts
- **Utility**: Canvas Confetti, clsx, tailwind-merge

### Backend
- **Framework**: Python 3.11+ with FastAPI (Asynchronous REST API)
- **Validation & Schemas**: Pydantic v2 data contracts
- **ORM & Database**: SQLAlchemy 2.0 with PostgreSQL 15 & zero-dependency SQLite fallback
- **Security**: OAuth2 Bearer Tokens (JWT HMAC-SHA256) & bcrypt password hashing

### AI / Machine Learning
- **Libraries**: scikit-learn, pandas, NumPy
- **Categorization**: TF-IDF Vectorizer + Multinomial Naive Bayes / Regex NLP Fallback
- **Anomaly Detection**: `IsolationForest` (150 estimators, feature scaling, contextual flags)
- **Forecasting**: Multi-month Weighted Moving Average (WMA) + Linear Regression slope fitting

---

## 4. Architecture & Micro-Pipelines

```
                  SMARTBANK AI
                       │
             ┌─────────┴─────────┐
             │                   │
        CUSTOMER APP         ADMIN CENTER
             │                   │
             └─────────┬─────────┘
                       │
                 React Frontend
                       │
                    REST API
                       │
                 FastAPI Backend
                       │
        ┌──────────────┼──────────────┐
        │              │              │
   Banking Core    AI Engine       Security
        │              │
        │       ┌──────┼────────┐
        │       │      │        │
        │   Categorize Fraud  Forecast
        │       │      │        │
        └───────┴──────┴────────┘
                       │
             PostgreSQL 15 / SQLite
```

---

## 5. Application Routes

| Route | Description |
| :--- | :--- |
| `/` | FinTech Startup Landing Page with Hero CTA, Feature Spotlights & FAQ |
| `/login` | User Authentication with 1-Click Demo Login |
| `/register` | User Registration & Role Onboarding |
| `/dashboard` | Executive Customer Financial Dashboard with Charts & AI Cards |
| `/transactions` | Interactive Transaction History, Categorizer, Search & Filter |
| `/budgets` | Smart Budget Allocations with 4-Tier Threshold Warnings |
| `/goals` | Target Savings Milestones & Suggested Monthly Savings |
| `/insights` | 5-Pillar Financial Health Breakdown & Personalized Tips |
| `/forecast` | Predictive Monthly Spending Analysis by Category |
| `/assistant` | Grounded Financial Assistant (Natural Language Financial Queries) |
| `/reports` | Monthly Financial Reports & CSV Export Engine |
| `/notifications` | Notification Center (Budget Alerts, Anomalies, Reminders) |
| `/kyc` | Simulated KYC Document Verification & OCR Status |
| `/credit-risk` | Educational Credit-Risk Multi-Factor Underwriting Simulation |
| `/profile` | Customer Profile, Monthly Income & Settings |
| `/admin` | Admin Risk Center Command Dashboard |
| `/admin/fraud` | Admin Fraud Review Queue (Open, Under Review, Resolved) |
| `/admin/users` | User Account & Balance Inspection Roster |
| `/admin/kyc` | Administrative KYC Document Approval Center |
| `/admin/system` | Model Accuracy Metrics, Inference Counters & Audit Trail |

---

## 6. Quick Start & Installation

### Option A: Local Development (Fastest, Zero Dependency)

```bash
# 1. Clone repository
git clone https://github.com/your-org/smartbank-ai.git
cd smartbank-ai

# 2. Set up Python virtual environment and install backend packages
python3 -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt

# 3. Install frontend dependencies
cd frontend && npm install && cd ..

# 4. Train ML models & generate synthetic training dataset
python ml/training/generate_synthetic_data.py
python ml/training/train_categorizer.py
python ml/training/train_anomaly_detector.py

# 5. Start Backend Service (Port :8000)
source venv/bin/activate
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload

# 6. Start Frontend App in a separate terminal (Port :5173)
cd frontend
npm run dev
```

Visit **`http://localhost:5173`** in your browser!

---

### Option B: Docker Compose (Full Stack + PostgreSQL)

```bash
docker-compose up --build
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`
- Swagger Docs: `http://localhost:8000/docs`

---

## 7. Demo Accounts & Preloaded Credentials

| Role | Persona | Email | Password | Preloaded Context |
| :--- | :--- | :--- | :--- | :--- |
| **Demo Customer** | Siddharth Verma | `customer@smartbank.ai` | `password123` | ₹1,41,650 Total Balance • 100+ Multi-Month Transactions • Active Budgets • Savings Goals • Flagged Anomalies |
| **Demo Admin** | Administrator | `admin@smartbank.ai` | `admin123` | Full Access to Admin Risk Center, Fraud Queue & Audit Logs |

*(Quick 1-Click Login buttons are available on the Login page for instant judge entry!)*

---

## 8. 3–5 Minute Hackathon Presentation Script

1. **Step 1 — Landing Page (`/`)**: Present SmartBank AI as an intelligent financial platform that transforms everyday banking data into actionable intelligence.
2. **Step 2 — Customer Login (`/login`)**: Click **"Demo Customer"** to log in instantly.
3. **Step 3 — Financial Overview (`/dashboard`)**: Showcase Total Balance (₹1,41,650), Monthly Income, Expenses, Savings Rate (38.1%), and real-time interactive Cash Flow & Category charts.
4. **Step 4 — Live AI Auto-Categorization**: Go to **Transactions (`/transactions`)** $\rightarrow$ Click **"New Transaction"** $\rightarrow$ Type merchant `"Swiggy"` with amount `₹450` $\rightarrow$ Point out the instant AI categorization to **Food** with 95% confidence.
5. **Step 5 — Real-Time Anomaly Detection & "Why?" Modal**: Add a transaction of `₹12,500` or inspect the preloaded luxury outlier $\rightarrow$ Highlight the **FLAGGED** warning badge $\rightarrow$ Click **"Why?"** to show the exact statistical Z-Score and historical variance explanation.
6. **Step 6 — Predictive Expense Forecast (`/forecast`)**: Show next-month projections (e.g. Estimated total ₹18,300) with category-level trend slopes and dampening methodology.
7. **Step 7 — Smart Budgets (`/budgets`)**: Review category utilization and demonstrate the 90%+ near-limit alert threshold.
8. **Step 8 — SmartBank Assistant (`/assistant`)**: Ask: *"Where did I spend the most money this month?"* $\rightarrow$ The assistant queries database facts and answers accurately without hallucination.
9. **Step 9 — Transparent Financial Health (`/insights`)**: Show the 5-pillar health score ($78/100$) and dynamic improvement tips.
10. **Step 10 — Switch to Admin Risk Center (`/admin`)**: Log out and log in as **Demo Admin** $\rightarrow$ Open **Fraud Queue (`/admin/fraud`)** $\rightarrow$ Review the flagged outlier $\rightarrow$ Click **"Resolve"** to demonstrate the complete full-cycle FinTech workflow.

---

## 9. AI / ML Methodology & Explainability ("Why?")

All AI models return structured, explainable outputs:

```json
{
  "result": "Food",
  "confidence": 0.95,
  "reason": "Merchant 'Swiggy' matched known food-delivery classification patterns.",
  "model_version": "v1.2.0-tfidf-nb",
  "timestamp": "2026-09-17T20:30:00Z"
}
```

Detailed formulas and model architectures are documented in [`docs/ai-methodology.md`](docs/ai-methodology.md).

---

## 10. Security & Compliance Disclaimer

- **Security**: Passwords hashed with bcrypt, OAuth2 JWT bearer tokens, role-based route guards, and full audit trails on administrative decisions.
- **Compliance Disclaimer**: *SmartBank AI is an educational and prototype demonstration platform built with synthetic financial data. It does not connect to live banking rails, issue credit, or provide professional financial advice.*

---

## 11. Project Verification Status

```text
SMARTBANK AI
BUILD STATUS: COMPLETE

Frontend:                ✓ (React 18, Vite, TypeScript, Tailwind, Recharts)
Backend:                 ✓ (Python, FastAPI, Pydantic v2, SQLAlchemy 2.0)
Database:                ✓ (PostgreSQL 15 & SQLite dual-mode support)
Authentication:          ✓ (JWT, bcrypt, Customer/Admin roles)
Transactions:            ✓ (CRUD, Filtering, Search, Indian Rupee ₹)
AI Categorization:       ✓ (TF-IDF + Naive Bayes + Heuristic Fallback)
Anomaly Detection:       ✓ (Isolation Forest + Statistical Z-Score Outlier Engine)
Forecasting:             ✓ (WMA + Linear Regression Trend Dampener)
Financial Health:        ✓ (Transparent 5-Pillar Score 0–100)
AI Assistant:            ✓ (Grounded Database-Aware Query Engine)
Budgets:                 ✓ (Dynamic limit utilization & threshold alerts)
Goals:                   ✓ (Target milestones & automated monthly suggestions)
Reports:                 ✓ (Monthly breakdown & CSV download)
Notifications:           ✓ (Budget alerts, anomalies, upcoming bills)
KYC Demo:                ✓ (Simulated document OCR verification flow)
Credit Risk Demo:        ✓ (Multi-factor educational underwriting score)
Admin Risk Center:       ✓ (Fraud review queue, KYC approvals, model monitoring)
Testing:                 ✓ (Automated pytest test suite passing)
Documentation:           ✓ (README, Architecture, Database ERD, API, AI, Security)
Demo Mode:               ✓ (1-Click Customer & Admin judge login preloaded)
```

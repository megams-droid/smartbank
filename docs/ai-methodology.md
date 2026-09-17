# 🧠 SmartBank AI — AI/ML Methodology & Explainability Framework

## 1. Core Principle: Explainability First ("Why?")

A core product requirement of SmartBank AI is that **no AI prediction is presented as a black box**. Every insight, anomaly flag, forecast projection, and category label is accompanied by a human-interpretable rationale.

---

## 2. Methodology Breakdown by AI Service

### 1. AI Expense Auto-Categorization
- **Algorithm**: TF-IDF (Term Frequency-Inverse Document Frequency, n-grams 1-2) with Multinomial Naive Bayes classification + Regex Heuristic fallback.
- **Input**: Merchant name, raw transaction description, and amount.
- **Output**: Category, confidence score (0.00–1.00), and reason text.
- **Explainability**: "Merchant description matches known food-service pattern (confidence 95%)."

### 2. Isolation Forest Anomaly & Fraud Risk Detection
- **Algorithm**: `sklearn.ensemble.IsolationForest` (150 estimators, dynamic contamination parameter) combined with longitudinal statistical Z-Score evaluation.
- **Feature Vector**:
  1. `amount`: Raw transaction amount in ₹.
  2. `log_amount`: Log-transformed value ($\ln(1 + \text{amount})$) to normalize fat-tailed financial distributions.
  3. `hour`: Hour of transaction (0–23).
  4. `is_night`: Binary flag for off-hours activity (11 PM – 6 AM).
  5. `day_of_week`: Day index (0–6).
  6. `cat_frequency`: Historical frequency distribution of the merchant category.
  7. `z_score`: User-specific historical spending deviation score:
     $$Z = \frac{\text{Amount} - \mu_{\text{user}}}{\sigma_{\text{user}}}$$
- **Classification Bands**:
  - `HIGH Risk`: Isolation Forest score > 0.70 OR $Z > 4.5$
  - `MEDIUM Risk`: Isolation Forest score > 0.55 OR $Z > 3.0$
  - `LOW Risk`: Standard baseline activity
- **Explainability**: Explains the exact variance (e.g., "Amount ₹12,500 is 5.2x higher than historical average of ₹2,400").

### 3. Time-Series Expense Forecasting
- **Algorithm**: Weighted Moving Average (WMA) with Linear Regression trend slope dampening over previous 3–6 months.
- **Formula**:
  $$\text{WMA} = 0.2 \cdot M_{t-2} + 0.3 \cdot M_{t-1} + 0.5 \cdot M_t$$
  $$\text{Forecast} = \max(0, \text{WMA} + 0.5 \cdot \text{slope})$$
- **Output**: Category breakdown, percentage trajectory change, and direction indicator (`UP`, `DOWN`, `STABLE`).

### 4. 5-Pillar Financial Health Index (0–100)
Transparent wellness index (NOT a bank credit score):
1. **Savings Rate (25%)**: Ratio of net savings to monthly income ($\ge 30\%$ yields 100).
2. **Budget Adherence (25%)**: Ratio of actual spend vs defined monthly limit across active categories.
3. **Spending Consistency (20%)**: Variance and frequency of ad-hoc discretionary spikes.
4. **Emergency Fund Buffer (15%)**: Ratio of liquid savings to 3 months of typical expenses.
5. **Goal Milestones (15%)**: Weighted progress percentage across active financial targets.

### 5. Grounded Financial Assistant
- Operates in **Database Intelligence Mode** by default (parsing natural language queries into deterministic SQL aggregations over the user's verified transactions, accounts, and budgets).
- Distinguishes clearly between:
  - **Database Facts** ("You spent ₹5,240 on Food this month across 12 transactions.")
  - **Estimates/Forecasts** ("Based on current trends, your projected next-month bills total ₹4,500.")
  - **Financial Best Practices** ("General 50/30/20 guidelines suggest capping discretionary spending at 30%.")

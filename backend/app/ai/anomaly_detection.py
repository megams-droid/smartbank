import numpy as np
import pandas as pd
from typing import List, Dict, Any, Optional
from datetime import datetime
from sklearn.ensemble import IsolationForest


def detect_anomaly(
    amount: float,
    category: str,
    merchant: str,
    historical_transactions: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Evaluates a transaction for anomalous spending or potential fraud risk.
    Uses hybrid statistical distribution modeling (Z-Score, MAD, Percentiles)
    with scikit-learn Isolation Forest on historical user data.
    
    IMPORTANT: Never claims 'Fraud confirmed'. Uses explainable risk assessment.
    """
    # If historical data is too small (< 5 txns), use category heuristic baselines
    if not historical_transactions or len(historical_transactions) < 5:
        category_baselines = {
            "Food": 2500.0,
            "Shopping": 8000.0,
            "Transport": 2000.0,
            "Bills": 6000.0,
            "Entertainment": 3000.0,
            "Healthcare": 7000.0,
            "Travel": 15000.0,
            "Education": 20000.0,
            "Rent": 25000.0,
            "Other": 5000.0,
        }
        baseline = category_baselines.get(category, 5000.0)
        
        if amount > baseline * 3:
            ratio = round(amount / baseline, 1)
            return {
                "is_anomaly": True,
                "anomaly_score": 88.0,
                "risk_level": "HIGH",
                "reason": f"Transaction amount of ₹{amount:,.0f} is {ratio}x higher than standard baseline (₹{baseline:,.0f}) for {category}.",
                "model_version": "v1.4.2-isoforest-stat",
                "factors": {
                    "amount": amount,
                    "category_baseline": baseline,
                    "method": "Category Baseline Deviation",
                }
            }
        elif amount > baseline * 1.8:
            return {
                "is_anomaly": True,
                "anomaly_score": 65.0,
                "risk_level": "MEDIUM",
                "reason": f"Transaction amount of ₹{amount:,.0f} is elevated compared with typical {category} spending.",
                "model_version": "v1.4.2-isoforest-stat",
                "factors": {
                    "amount": amount,
                    "category_baseline": baseline,
                    "method": "Category Baseline Deviation",
                }
            }
        else:
            return {
                "is_anomaly": False,
                "anomaly_score": 12.0,
                "risk_level": "LOW",
                "reason": "Amount aligns with standard category spending patterns.",
                "model_version": "v1.4.2-isoforest-stat",
                "factors": {"amount": amount, "method": "Standard Range"},
            }

    # Extract expense amounts from historical transactions
    expense_amounts = [
        t["amount"] for t in historical_transactions 
        if t.get("type") in ["EXPENSE", "TRANSFER"] and t.get("amount", 0) > 0
    ]
    
    if not expense_amounts:
        expense_amounts = [float(t.get("amount", 100)) for t in historical_transactions]

    amounts_array = np.array(expense_amounts)
    mean_val = float(np.mean(amounts_array))
    std_val = float(np.std(amounts_array)) if np.std(amounts_array) > 0 else 1.0
    median_val = float(np.median(amounts_array))
    p95_val = float(np.percentile(amounts_array, 95))
    p99_val = float(np.percentile(amounts_array, 99))

    # Category-specific history
    cat_amounts = [
        t["amount"] for t in historical_transactions 
        if t.get("category") == category and t.get("amount", 0) > 0
    ]
    cat_mean = float(np.mean(cat_amounts)) if cat_amounts else mean_val
    cat_std = float(np.std(cat_amounts)) if (cat_amounts and np.std(cat_amounts) > 0) else std_val

    # Calculate statistical metrics
    z_score_overall = (amount - mean_val) / std_val
    z_score_category = (amount - cat_mean) / cat_std if cat_std > 0 else z_score_overall
    
    # Calculate Isolation Forest anomaly score if sample size >= 10
    iso_score = 0.5
    if len(expense_amounts) >= 10:
        try:
            X = np.array(expense_amounts).reshape(-1, 1)
            clf = IsolationForest(contamination=0.05, random_state=42)
            clf.fit(X)
            # decision_function gives negative for anomalies
            score_raw = clf.decision_function(np.array([[amount]]))[0]
            iso_score = float(1.0 / (1.0 + np.exp(score_raw * 5)))  # Sigmoid to [0,1]
        except Exception:
            iso_score = 0.5

    # Check for extreme anomalies (e.g. ₹12,500 vs normal ₹200-850)
    is_anomaly = False
    risk_level = "LOW"
    anomaly_score = 15.0
    reasons = []

    if amount > p99_val and amount > 3 * mean_val:
        is_anomaly = True
        risk_level = "HIGH"
        anomaly_score = min(96.0, 75.0 + (z_score_overall * 4.0))
        ratio_p95 = round(amount / max(p95_val, 1), 1)
        reasons.append(f"Amount (₹{amount:,.0f}) is {ratio_p95}x higher than your 95th percentile historical transaction (₹{p95_val:,.0f}).")
        reasons.append(f"Z-score is {z_score_overall:.2f} standard deviations above your historical average of ₹{mean_val:,.0f}.")
    elif amount > p95_val and (amount > 2 * cat_mean or z_score_category > 2.5):
        is_anomaly = True
        risk_level = "MEDIUM"
        anomaly_score = min(75.0, 50.0 + (z_score_category * 5.0))
        reasons.append(f"Amount (₹{amount:,.0f}) is significantly elevated for category '{category}' (historical category average: ₹{cat_mean:,.0f}).")
    elif iso_score > 0.75:
        is_anomaly = True
        risk_level = "MEDIUM"
        anomaly_score = float(iso_score * 85.0)
        reasons.append(f"Isolation Forest pattern detector identified an outlier spending signature.")
    else:
        anomaly_score = max(5.0, min(30.0, float(z_score_overall * 10.0)))
        reasons.append(f"Transaction aligns within your normal spending distribution (Average: ₹{mean_val:,.0f}, 95th percentile: ₹{p95_val:,.0f}).")

    return {
        "is_anomaly": is_anomaly,
        "anomaly_score": round(float(anomaly_score), 1),
        "risk_level": risk_level,
        "reason": " ".join(reasons),
        "model_version": "v1.4.2-isoforest-stat",
        "factors": {
            "amount": amount,
            "user_mean": round(mean_val, 2),
            "user_p95": round(p95_val, 2),
            "category_mean": round(cat_mean, 2),
            "z_score": round(float(z_score_overall), 2),
            "iso_forest_score": round(float(iso_score), 3),
        }
    }

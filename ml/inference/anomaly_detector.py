"""
SmartBank AI — ML Inference: Anomaly Detector
"""

import os
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, List


_MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "isolation_forest.joblib")
_bundle = None


def get_model_bundle():
    global _bundle
    if _bundle is None and os.path.exists(_MODEL_PATH):
        try:
            _bundle = joblib.load(_MODEL_PATH)
        except Exception:
            _bundle = None
    return _bundle


def score_transaction(
    amount: float,
    category: str,
    merchant: str,
    historical_transactions: List[Dict[str, Any]] = None,
    hour: int = 14,
    day_of_week: int = 2,
) -> Dict[str, Any]:
    bundle = get_model_bundle()
    
    # Statistical baseline computation from user history
    hist_amounts = [t.get("amount", 0.0) for t in (historical_transactions or []) if t.get("amount", 0) > 0]
    if hist_amounts:
        mean_amt = float(np.mean(hist_amounts))
        std_amt = float(np.std(hist_amounts)) if len(hist_amounts) > 1 else mean_amt * 0.5
        z_score = (amount - mean_amt) / max(std_amt, 1.0)
    else:
        mean_amt = 1500.0
        z_score = (amount - mean_amt) / 1000.0

    is_night = 1 if hour < 6 or hour >= 23 else 0
    cat_freq = 0.25

    if bundle is not None:
        try:
            model = bundle["model"]
            scaler = bundle["scaler"]
            log_amt = np.log1p(amount)
            features = np.array([[amount, log_amt, hour, day_of_week, is_night, cat_freq]])
            features_scaled = scaler.transform(features)
            
            raw_pred = model.predict(features_scaled)[0]
            raw_score = -float(model.score_samples(features_scaled)[0])
            is_anomaly = (raw_pred == -1) or (z_score > 3.2)
            
            # Risk level
            if raw_score > 0.70 or z_score > 4.5:
                risk_level = "HIGH"
            elif raw_score > 0.55 or z_score > 3.0:
                risk_level = "MEDIUM"
            else:
                risk_level = "LOW"
                is_anomaly = False

            reason = (
                f"Amount ₹{amount:,.0f} deviates significantly from user's standard expense pattern (Z-Score: {z_score:.2f})."
                if is_anomaly else "Normal transaction behavior."
            )

            return {
                "is_anomaly": is_anomaly,
                "anomaly_score": round(raw_score, 3),
                "risk_level": risk_level,
                "reason": reason,
                "model_version": bundle.get("model_version", "v1.4.2-isoforest-stat"),
            }
        except Exception:
            pass

    # Statistical fallback
    is_anomaly = amount > 10000.0 and (z_score > 2.8)
    risk_level = "HIGH" if amount > 25000.0 or z_score > 4.0 else "MEDIUM" if is_anomaly else "LOW"
    
    return {
        "is_anomaly": is_anomaly,
        "anomaly_score": 0.82 if is_anomaly else 0.12,
        "risk_level": risk_level,
        "reason": f"Transaction amount of ₹{amount:,.0f} is significantly above historical baseline." if is_anomaly else "Standard transaction.",
        "model_version": "v1.4.2-stat-fallback",
    }

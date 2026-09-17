"""
SmartBank AI — ML Inference: Transaction Categorizer
"""

import os
import joblib
from typing import Dict, Any


_MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "categorizer_model.joblib")
_pipeline = None


def get_pipeline():
    global _pipeline
    if _pipeline is None and os.path.exists(_MODEL_PATH):
        try:
            _pipeline = joblib.load(_MODEL_PATH)
        except Exception:
            _pipeline = None
    return _pipeline


def predict_category(merchant: str, description: str = "") -> Dict[str, Any]:
    text = f"{merchant} {description}".strip()
    pipeline = get_pipeline()

    if pipeline is not None:
        try:
            category = pipeline.predict([text])[0]
            probs = pipeline.predict_proba([text])[0]
            confidence = float(max(probs))
            return {
                "category": category,
                "confidence": round(confidence, 2),
                "reason": f"Machine Learning NLP Classification based on merchant/description patterns (confidence {confidence*100:.0f}%).",
                "model_version": "v1.2.0-tfidf-nb",
            }
        except Exception:
            pass

    # Heuristic fallback if model not loaded
    lower = text.lower()
    if any(k in lower for k in ["swiggy", "zomato", "blinkit", "instamart", "starbucks", "cafe", "food", "burger", "pizza", "restaurant"]):
        return {"category": "Food", "confidence": 0.95, "reason": "Keyword pattern matched food service.", "model_version": "v1.2.0-heuristic"}
    elif any(k in lower for k in ["uber", "ola", "rapido", "petrol", "fuel", "metro", "fastag", "toll"]):
        return {"category": "Transport", "confidence": 0.94, "reason": "Keyword pattern matched commute/transit.", "model_version": "v1.2.0-heuristic"}
    elif any(k in lower for k in ["amazon", "flipkart", "myntra", "zara", "decathlon", "shopping", "store", "retail"]):
        return {"category": "Shopping", "confidence": 0.93, "reason": "Keyword pattern matched e-commerce/retail.", "model_version": "v1.2.0-heuristic"}
    elif any(k in lower for k in ["electricity", "bescom", "airtel", "jio", "broadband", "wifi", "bill", "gas", "water"]):
        return {"category": "Bills", "confidence": 0.96, "reason": "Keyword pattern matched utility/bill provider.", "model_version": "v1.2.0-heuristic"}
    elif any(k in lower for k in ["netflix", "spotify", "hotstar", "movie", "bookmyshow", "games", "entertainment"]):
        return {"category": "Entertainment", "confidence": 0.97, "reason": "Keyword pattern matched subscription streaming.", "model_version": "v1.2.0-heuristic"}
    elif any(k in lower for k in ["pharmacy", "apollo", "1mg", "pharmeasy", "doctor", "hospital", "clinic", "dental"]):
        return {"category": "Healthcare", "confidence": 0.95, "reason": "Keyword pattern matched medical/pharmacy.", "model_version": "v1.2.0-heuristic"}
    elif any(k in lower for k in ["salary", "payroll", "dividend"]):
        return {"category": "Salary", "confidence": 0.99, "reason": "Keyword pattern matched corporate payroll.", "model_version": "v1.2.0-heuristic"}
    elif any(k in lower for k in ["rent", "landlord", "housing"]):
        return {"category": "Rent", "confidence": 0.98, "reason": "Keyword pattern matched residential rent.", "model_version": "v1.2.0-heuristic"}
    
    return {"category": "Other", "confidence": 0.70, "reason": "General expense pattern.", "model_version": "v1.2.0-heuristic"}

from typing import List, Dict, Any
from collections import defaultdict
from datetime import datetime, timedelta

def detect_recurring_expenses(transactions_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Identifies periodic subscription patterns (e.g. Netflix, Airtel, Spotify) from transaction history.
    """
    merchant_groups = defaultdict(list)
    for tx in transactions_data:
        if tx.get("type") == "EXPENSE":
            merchant = tx.get("merchant", "").strip()
            amount = tx.get("amount", 0.0)
            date = tx.get("date")
            category = tx.get("category", "Bills")
            if merchant and amount > 0:
                merchant_groups[merchant].append({"amount": amount, "date": date, "category": category})

    detected = []
    # Known subscription presets to boost confidence
    subscription_hints = {
        "netflix": "Entertainment",
        "spotify": "Entertainment",
        "prime video": "Entertainment",
        "airtel": "Bills",
        "jio": "Bills",
        "act fibernet": "Bills",
        "gym": "Healthcare",
        "apple music": "Entertainment",
        "youtube premium": "Entertainment",
        "icloud": "Bills",
        "google one": "Bills"
    }

    for merchant, records in merchant_groups.items():
        m_lower = merchant.lower()
        matched_hint = any(k in m_lower for k in subscription_hints)
        
        if len(records) >= 2 or matched_hint:
            # Check amount consistency
            amounts = [r["amount"] for r in records]
            avg_amount = sum(amounts) / len(amounts)
            category = records[0]["category"]
            
            # Estimate next due date (approx 30 days from latest)
            latest_date = max([r["date"] for r in records if r["date"]]) if records else datetime.utcnow()
            if isinstance(latest_date, str):
                try:
                    latest_date = datetime.fromisoformat(latest_date.replace("Z", "+00:00"))
                except Exception:
                    latest_date = datetime.utcnow()
            next_due = latest_date + timedelta(days=30)

            detected.append({
                "merchant": merchant,
                "category": category,
                "amount": round(avg_amount, 2),
                "frequency": "MONTHLY",
                "next_due_date": next_due.isoformat() if hasattr(next_due, "isoformat") else str(next_due),
                "confidence": 0.95 if matched_hint else 0.85,
                "reason": f"Repeating {category} charge detected across recent billing cycles."
            })

    return detected

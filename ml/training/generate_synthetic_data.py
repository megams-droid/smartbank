"""
SmartBank AI — Synthetic Financial Dataset Generator
Generates realistic multi-month Indian Rupee financial transaction data
including salaries, daily living expenses, recurring subscriptions, and deliberate anomalous outliers.
"""

import os
import random
import pandas as pd
import numpy as np
from datetime import datetime, timedelta, timezone

MERCHANTS_BY_CATEGORY = {
    "Food": [
        ("Swiggy", (150, 850)),
        ("Zomato", (180, 950)),
        ("Blinkit Grocery", (300, 2200)),
        ("Instamart", (250, 1800)),
        ("Zepto Supermarket", (200, 1600)),
        ("Starbucks Cafe", (350, 1200)),
        ("Chai Point", (80, 450)),
        ("McDonalds", (250, 900)),
        ("Dominos Pizza", (350, 1250)),
        ("Local Supermarket", (500, 3500)),
    ],
    "Transport": [
        ("Uber Ride", (120, 750)),
        ("Ola Cabs", (100, 680)),
        ("Rapido Bike", (40, 180)),
        ("Indian Oil Petrol", (800, 3000)),
        ("HPCL Fuel Station", (1000, 3500)),
        ("Metro Smart Card Recharge", (200, 1000)),
        ("Fastag Toll", (100, 500)),
    ],
    "Shopping": [
        ("Amazon India", (450, 4800)),
        ("Flipkart", (500, 5500)),
        ("Myntra Fashion", (800, 3800)),
        ("Zara Retail", (1500, 6500)),
        ("Decathlon Sports", (600, 4200)),
        ("Nykaa Beauty", (400, 2600)),
        ("Uniqlo Store", (1200, 5800)),
    ],
    "Bills": [
        ("Electricity Board Bescom", (1200, 3800)),
        ("Airtel Fiber Broadband", (799, 1499)),
        ("Jio Fiber Telecom", (699, 1199)),
        ("Piped Gas Adani", (400, 1100)),
        ("Water Supply Board", (300, 800)),
        ("Mobile Postpaid Plan", (499, 999)),
    ],
    "Entertainment": [
        ("Netflix India", (649, 649)),
        ("Spotify Premium", (119, 179)),
        ("BookMyShow Movies", (300, 1400)),
        ("Sony LIV Subscription", (299, 599)),
        ("Disney Hotstar", (299, 899)),
        ("Steam Games", (450, 2500)),
        ("Gaming Arena", (300, 1200)),
    ],
    "Healthcare": [
        ("Apollo Pharmacy", (250, 2200)),
        ("1mg Healthcare", (350, 1800)),
        ("Pharmeasy Online", (400, 2400)),
        ("Dr Consultation Clinic", (500, 1500)),
        ("Diagnostic Lab Tests", (800, 3200)),
        ("Dental Care Centre", (700, 2800)),
    ],
    "Education": [
        ("Coursera Course", (1200, 4500)),
        ("Udemy Online Learning", (449, 1499)),
        ("Books & Stationery Store", (300, 1800)),
        ("Language Learning App", (499, 1299)),
    ],
    "Rent": [
        ("Monthly House Rent Transfer", (20000, 25000)),
    ],
}

PAYMENT_METHODS = ["UPI", "UPI", "UPI", "Debit Card", "Credit Card", "Bank Transfer"]


def generate_dataset(num_records: int = 1500, anomaly_rate: float = 0.04) -> pd.DataFrame:
    random.seed(42)
    np.random.seed(42)

    records = []
    end_date = datetime.now(timezone.utc)
    start_date = end_date - timedelta(days=180)

    # 1. Generate monthly salaries
    current_date = start_date.replace(day=1)
    while current_date <= end_date:
        salary_date = current_date + timedelta(days=random.randint(0, 2))
        records.append({
            "date": salary_date.strftime("%Y-%m-%d %H:%M:%S"),
            "amount": 75000.0,
            "type": "INCOME",
            "category": "Salary",
            "merchant": "Infosys Corp Payroll",
            "payment_method": "Bank Transfer",
            "description": "Monthly Salary Credit",
            "is_anomaly": False,
            "anomaly_reason": None,
        })
        # Advance to next month
        if current_date.month == 12:
            current_date = current_date.replace(year=current_date.year + 1, month=1)
        else:
            current_date = current_date.replace(month=current_date.month + 1)

    # 2. Generate regular expenses
    num_expenses = num_records - len(records)
    categories = list(MERCHANTS_BY_CATEGORY.keys())
    weights = [0.35, 0.20, 0.15, 0.10, 0.08, 0.06, 0.04, 0.02]

    for _ in range(num_expenses):
        category = random.choices(categories, weights=weights, k=1)[0]
        merchant, (min_amt, max_amt) = random.choice(MERCHANTS_BY_CATEGORY[category])
        
        # Random timestamp
        days_offset = random.randint(0, 180)
        txn_time = start_date + timedelta(
            days=days_offset,
            hours=random.randint(7, 23),
            minutes=random.randint(0, 59),
            seconds=random.randint(0, 59),
        )

        amount = round(random.uniform(min_amt, max_amt), 2)
        payment_method = random.choice(PAYMENT_METHODS)
        description = f"{category} purchase at {merchant}"

        records.append({
            "date": txn_time.strftime("%Y-%m-%d %H:%M:%S"),
            "amount": amount,
            "type": "EXPENSE",
            "category": category,
            "merchant": merchant,
            "payment_method": payment_method,
            "description": description,
            "is_anomaly": False,
            "anomaly_reason": None,
        })

    # 3. Inject deliberate synthetic anomalies
    num_anomalies = int(num_records * anomaly_rate)
    anomalous_merchants = [
        ("Luxury Watch Boutique Dubai", "Shopping", (85000, 145000), "Transaction amount is 28.4x higher than standard shopping purchases."),
        ("Crypto Exchange Global", "Other", (45000, 95000), "High-value transfer to unverified foreign crypto platform at 3:14 AM."),
        ("International Gaming Casino", "Entertainment", (32000, 68000), "Extreme entertainment spend outlier outside domestic footprint."),
        ("Electronics Mega Retail", "Shopping", (58000, 120000), "Sudden single-purchase spike exceeding 80% of monthly average income."),
        ("Overseas Wire Remittance", "Transfer", (75000, 130000), "Unusual large-denomination outward remittance transfer."),
    ]

    for i in range(num_anomalies):
        merch, cat, (min_a, max_a), reason = random.choice(anomalous_merchants)
        days_offset = random.randint(5, 175)
        txn_time = start_date + timedelta(
            days=days_offset,
            hours=random.choice([1, 2, 3, 4, 23]),  # off-hours
            minutes=random.randint(0, 59),
        )
        amt = round(random.uniform(min_a, max_a), 2)

        records.append({
            "date": txn_time.strftime("%Y-%m-%d %H:%M:%S"),
            "amount": amt,
            "type": "EXPENSE",
            "category": cat,
            "merchant": merch,
            "payment_method": "Credit Card" if random.random() > 0.5 else "Bank Transfer",
            "description": f"Urgent transaction - {merch}",
            "is_anomaly": True,
            "anomaly_reason": reason,
        })

    df = pd.DataFrame(records)
    df["date"] = pd.to_datetime(df["date"])
    df = df.sort_values("date").reset_index(drop=True)
    return df


if __name__ == "__main__":
    output_dir = os.path.join(os.path.dirname(__file__), "..", "data")
    os.makedirs(output_dir, exist_ok=True)
    
    df = generate_dataset(num_records=1600, anomaly_rate=0.035)
    csv_path = os.path.join(output_dir, "synthetic_transactions.csv")
    df.to_csv(csv_path, index=False)
    print(f"✅ Generated {len(df)} synthetic financial transactions saved to {csv_path}")
    print(f"📊 Normal records: {len(df[~df['is_anomaly']])} | Anomalies: {len(df[df['is_anomaly']])}")

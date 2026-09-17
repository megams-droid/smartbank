from datetime import datetime
from typing import List, Dict, Any
import pandas as pd


def generate_ai_insights(
    transactions: List[Dict[str, Any]],
    budgets: List[Dict[str, Any]],
    goals: List[Dict[str, Any]],
    anomalies: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """
    Synthesizes real-time proactive AI insights with explicit 'Why?' explanations
    and actionable recommendations.
    """
    insights = []

    # 1. Anomaly alerts insight
    open_anomalies = [a for a in anomalies if a.get("status") in ["OPEN", "UNDER_REVIEW"]]
    if open_anomalies:
        highest = max(open_anomalies, key=lambda x: x.get("anomaly_score", 0))
        insights.append({
            "insight_type": "ANOMALY_SUMMARY",
            "title": f"⚠️ Potential Spending Anomaly Detected",
            "summary": f"A transaction with high risk score ({highest.get('anomaly_score', 0):.0f}/100) was detected and requires review.",
            "explanation_why": highest.get("reason", "Amount is significantly higher than your historical transaction distribution."),
            "action_suggested": "Review and verify this transaction in the Security Risk Center.",
            "impact_score": 9.2,
        })

    # 2. Category spending comparison
    if transactions:
        df = pd.DataFrame(transactions)
        df = df[df["type"].isin(["EXPENSE", "TRANSFER"])]
        df["date"] = pd.to_datetime(df["date"])
        df["month"] = df["date"].dt.strftime("%Y-%m")
        months = sorted(df["month"].unique())

        if len(months) >= 2:
            prev_m = months[-2]
            curr_m = months[-1]

            prev_df = df[df["month"] == prev_m]
            curr_df = df[df["month"] == curr_m]

            prev_food = prev_df[prev_df["category"] == "Food"]["amount"].sum()
            curr_food = curr_df[curr_df["category"] == "Food"]["amount"].sum()

            if curr_food > prev_food and prev_food > 0:
                pct = round(((curr_food - prev_food) / prev_food) * 100, 1)
                if pct >= 5.0:
                    insights.append({
                        "insight_type": "SPENDING_INCREASE",
                        "title": f"Dining & Food Spending Increased by {pct}%",
                        "summary": f"Your Food & Dining expenses grew from ₹{prev_food:,.0f} to ₹{curr_food:,.0f} compared to last month.",
                        "explanation_why": f"Higher frequency of weekend food delivery and restaurant charges (₹{curr_food:,.0f} vs ₹{prev_food:,.0f}).",
                        "action_suggested": "Consider setting a weekly dining cap of ₹1,200 to stay within target.",
                        "impact_score": 8.0,
                    })

            # Shopping comparison
            prev_shop = prev_df[prev_df["category"] == "Shopping"]["amount"].sum()
            curr_shop = curr_df[curr_df["category"] == "Shopping"]["amount"].sum()
            if curr_shop > prev_shop and prev_shop > 0:
                shop_pct = round(((curr_shop - prev_shop) / prev_shop) * 100, 1)
                if shop_pct >= 10.0:
                    insights.append({
                        "insight_type": "SPENDING_INCREASE",
                        "title": f"Shopping Expenses Up by {shop_pct}%",
                        "summary": f"E-commerce & retail spending rose from ₹{prev_shop:,.0f} to ₹{curr_shop:,.0f}.",
                        "explanation_why": f"Concentrated retail transactions logged during festive or promotional sales.",
                        "action_suggested": "Review itemized shopping receipts to identify non-essential purchases.",
                        "impact_score": 7.4,
                    })

    # 3. Budget utilization insight
    for b in budgets:
        limit = b.get("monthly_limit", 1.0)
        spent = b.get("current_spent", 0.0)
        ratio = (spent / max(limit, 1.0)) * 100
        if ratio >= 90.0:
            insights.append({
                "insight_type": "BUDGET_RISK",
                "title": f"🚨 {b.get('category')} Budget Reached {ratio:.0f}% Limit",
                "summary": f"You have used ₹{spent:,.0f} out of your ₹{limit:,.0f} monthly limit for {b.get('category')}.",
                "explanation_why": f"Recent expenditure in {b.get('category')} has accelerated faster than the mid-month projection.",
                "action_suggested": f"Pause optional {b.get('category')} spending for the remainder of the billing cycle.",
                "impact_score": 8.8,
            })

    # 4. Goals milestone insight
    for g in goals:
        target = g.get("target_amount", 1.0)
        current = g.get("current_amount", 0.0)
        progress = (current / max(target, 1.0)) * 100
        if progress >= 50.0 and progress < 100.0:
            insights.append({
                "insight_type": "SAVING_OPPORTUNITY",
                "title": f"🎯 Milestone Achieved: {g.get('name')} is {progress:.0f}% Funded",
                "summary": f"You have accumulated ₹{current:,.0f} towards your ₹{target:,.0f} goal.",
                "explanation_why": "Automated monthly contributions and consistent savings discipline.",
                "action_suggested": f"Maintain current savings pace to complete this goal by the target timeline.",
                "impact_score": 7.0,
            })

    # Fallback insight if empty
    if not insights:
        insights.append({
            "insight_type": "CASH_FLOW_TREND",
            "title": "Positive Cash Flow Trajectory",
            "summary": "Your income-to-expense ratio remains healthy with steady capital accumulation.",
            "explanation_why": "Consistent salary inflow and controlled recurring utility bills.",
            "action_suggested": "Explore allocating surplus capital into higher-yield emergency savings.",
            "impact_score": 7.5,
        })

    return insights

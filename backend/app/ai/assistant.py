import re
from datetime import datetime
from typing import List, Dict, Any, Optional


def process_assistant_query(
    user_message: str,
    user_name: str,
    accounts: List[Dict[str, Any]],
    transactions: List[Dict[str, Any]],
    budgets: List[Dict[str, Any]],
    goals: List[Dict[str, Any]],
    recurring: List[Dict[str, Any]],
    anomalies: List[Dict[str, Any]],
    health_data: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Intelligent conversational FinTech assistant grounded directly in the user's
    actual database records. Distinguishes database facts, calculations, and predictions.
    """
    query = user_message.lower().strip()
    
    # 1. Total Balance Inquiry
    if any(k in query for k in ["total balance", "how much money", "account balance", "my balance", "net balance"]):
        total_bal = sum(a.get("balance", 0.0) for a in accounts)
        accounts_breakdown = ", ".join([f"{a.get('account_name')}: ₹{a.get('balance', 0):,.0f}" for a in accounts])
        reply = (
            f"Your total balance across all accounts is **₹{total_bal:,.0f}**.\n\n"
            f"**Account Breakdown:**\n"
            + "\n".join([f"• **{a.get('account_name')}**: ₹{a.get('balance', 0):,.0f}" for a in accounts])
        )
        return {
            "reply": reply,
            "grounded_data": {"total_balance": total_bal, "accounts": accounts},
            "suggested_actions": ["View Accounts", "Transfer Funds", "Check Cash Flow"],
            "mode": "DATABASE_INTELLIGENCE"
        }

    # 2. Food Spending
    if "food" in query or "dining" in query or "swiggy" in query or "zomato" in query:
        food_txns = [t for t in transactions if t.get("category") == "Food" and t.get("type") in ["EXPENSE", "TRANSFER"]]
        total_food = sum(t.get("amount", 0.0) for t in food_txns)
        food_budget = next((b for b in budgets if b.get("category") == "Food"), None)
        
        reply = f"You have spent **₹{total_food:,.0f}** on **Food & Dining** across {len(food_txns)} recorded transactions."
        if food_budget:
            limit = food_budget.get("monthly_limit", 1.0)
            pct = (total_food / limit) * 100
            reply += f"\n\nYour monthly Food budget is **₹{limit:,.0f}** (currently **{pct:.1f}%** utilized)."
            if pct > 90:
                reply += " ⚠️ **Warning:** You are nearing your monthly food budget limit."

        top_merchants = {}
        for t in food_txns:
            m = t.get("merchant", "Other")
            top_merchants[m] = top_merchants.get(m, 0) + t.get("amount", 0)
        
        if top_merchants:
            sorted_m = sorted(top_merchants.items(), key=lambda x: x[1], reverse=True)[:3]
            reply += "\n\n**Top Food Merchants:**\n" + "\n".join([f"• {m}: ₹{amt:,.0f}" for m, amt in sorted_m])

        return {
            "reply": reply,
            "grounded_data": {"category": "Food", "total_spent": total_food, "count": len(food_txns)},
            "suggested_actions": ["View Food Transactions", "Adjust Food Budget", "Forecast Next Month"],
            "mode": "DATABASE_INTELLIGENCE"
        }

    # 3. Biggest / Largest Expense
    if any(k in query for k in ["biggest expense", "largest expense", "highest spend", "where am i spending the most", "most spent"]):
        expense_txns = [t for t in transactions if t.get("type") in ["EXPENSE", "TRANSFER"]]
        if expense_txns:
            max_txn = max(expense_txns, key=lambda x: x.get("amount", 0))
            
            # Category totals
            cat_totals = {}
            for t in expense_txns:
                c = t.get("category", "Other")
                cat_totals[c] = cat_totals.get(c, 0) + t.get("amount", 0)
            
            top_cat = max(cat_totals.items(), key=lambda x: x[1]) if cat_totals else ("None", 0)

            reply = (
                f"Your single largest recorded expense is **₹{max_txn.get('amount', 0):,.0f}** at **{max_txn.get('merchant')}** "
                f"({max_txn.get('category')}) on {str(max_txn.get('date', ''))[:10]}.\n\n"
                f"Across all categories, your highest total spending category is **{top_cat[0]}** with a cumulative **₹{top_cat[1]:,.0f}** spent."
            )
            return {
                "reply": reply,
                "grounded_data": {"max_transaction": max_txn, "top_category": top_cat},
                "suggested_actions": ["Review Transaction", "View Category Analytics", "Check Anomaly Details"],
                "mode": "DATABASE_INTELLIGENCE"
            }

    # 4. Savings / Net Savings Inquiry
    if any(k in query for k in ["how much did i save", "total savings", "net savings", "savings rate", "saved this month"]):
        income_total = sum(t.get("amount", 0) for t in transactions if t.get("type") == "INCOME")
        expense_total = sum(t.get("amount", 0) for t in transactions if t.get("type") in ["EXPENSE", "TRANSFER"])
        net_saved = max(0.0, income_total - expense_total)
        savings_rate = (net_saved / max(income_total, 1.0)) * 100

        reply = (
            f"Based on your recorded transaction data:\n\n"
            f"• **Total Recorded Income:** ₹{income_total:,.0f}\n"
            f"• **Total Recorded Expenses:** ₹{expense_total:,.0f}\n"
            f"• **Net Savings:** **₹{net_saved:,.0f}**\n"
            f"• **Current Savings Rate:** **{savings_rate:.1f}%**\n\n"
            f"{'🎉 Great job maintaining a high savings rate!' if savings_rate >= 25 else '💡 Recommendation: Aim to boost savings by 5% through recurring bill optimizations.'}"
        )
        return {
            "reply": reply,
            "grounded_data": {"income": income_total, "expenses": expense_total, "net_savings": net_saved, "savings_rate": savings_rate},
            "suggested_actions": ["Allocate to Goals", "View Savings Trend", "Check Financial Health"],
            "mode": "DATABASE_INTELLIGENCE"
        }

    # 5. Anomalies & Fraud Alerts
    if any(k in query for k in ["anomaly", "fraud", "unusual", "suspicious", "risk alert", "alert"]):
        open_anomalies = [a for a in anomalies if a.get("status") in ["OPEN", "UNDER_REVIEW"]]
        if open_anomalies:
            reply = f"⚠️ You have **{len(open_anomalies)} potential unusual activity alerts** requiring review:\n\n"
            for a in open_anomalies[:3]:
                reply += f"• **Risk Level: {a.get('risk_level', 'HIGH')}** (Score: {a.get('anomaly_score', 0):.0f}/100)\n  *Reason:* {a.get('reason')}\n\n"
            reply += "You can mark these transactions as verified or escalate to the security team."
        else:
            reply = "✅ **No active anomalies detected.** All your recent transactions match your regular spending behavior."
        
        return {
            "reply": reply,
            "grounded_data": {"open_anomalies_count": len(open_anomalies), "anomalies": open_anomalies},
            "suggested_actions": ["Review Risk Center", "View All Transactions", "Security Settings"],
            "mode": "DATABASE_INTELLIGENCE"
        }

    # 6. Recurring Subscriptions
    if any(k in query for k in ["recurring", "subscription", "monthly bill", "netflix", "spotify", "broadband"]):
        if recurring:
            total_rec = sum(r.get("estimated_amount", 0) for r in recurring if r.get("is_active", True))
            reply = (
                f"You have **{len(recurring)} active recurring subscriptions** totaling **₹{total_rec:,.0f}/month**:\n\n"
                + "\n".join([f"• **{r.get('merchant')}**: ₹{r.get('estimated_amount', 0):,.0f}/mo (Next due: {str(r.get('next_due_date', ''))[:10]})" for r in recurring])
            )
        else:
            reply = "No active recurring subscriptions are currently tracked in your profile."
        
        return {
            "reply": reply,
            "grounded_data": {"recurring_expenses": recurring},
            "suggested_actions": ["Manage Subscriptions", "Budget Optimization", "Set Payment Reminders"],
            "mode": "DATABASE_INTELLIGENCE"
        }

    # 7. Financial Health
    if any(k in query for k in ["health score", "financial health", "how healthy", "wellness score"]):
        score = health_data.get("overall_score", 78) if health_data else 78
        rating = health_data.get("rating", "GOOD") if health_data else "GOOD"
        summary = health_data.get("summary_insight", "Solid financial health with consistent savings.") if health_data else "Solid financial discipline."
        
        reply = (
            f"Your **Financial Health Score** is **{score}/100** ({rating}).\n\n"
            f"**Analysis:** {summary}\n\n"
            f"**Top Recommendations:**\n"
            + "\n".join([f"• {tip}" for tip in (health_data.get("improvement_tips", ["Keep maintaining your 25%+ savings buffer."]) if health_data else ["Keep maintaining your savings buffer."])])
            + "\n\n*(Note: This is an educational wellness index, not a formal credit score.)*"
        )
        return {
            "reply": reply,
            "grounded_data": health_data or {"score": score, "rating": rating},
            "suggested_actions": ["View Score Factors", "View Budgets", "Explore Goals"],
            "mode": "DATABASE_INTELLIGENCE"
        }

    # 8. Affordability Check (e.g., "Can I afford 15000" or "Can I buy laptop")
    afford_match = re.search(r"(?:can i afford|can i buy|afford)\D*(\d+[\d,]*)", query)
    if afford_match:
        try:
            target_val = float(afford_match.group(1).replace(",", ""))
            checking_bal = sum(a.get("balance", 0) for a in accounts if a.get("account_type") in ["CHECKING", "SAVINGS"])
            surplus = checking_bal - target_val
            
            if surplus > 20000:
                reply = (
                    f"✅ **Yes, you can comfortably afford ₹{target_val:,.0f}.**\n\n"
                    f"Your accessible liquid balance is **₹{checking_bal:,.0f}**. After this purchase, you will retain **₹{surplus:,.0f}**, "
                    f"safely preserving your basic monthly buffer."
                )
            elif surplus >= 0:
                reply = (
                    f"⚠️ **You can technically afford ₹{target_val:,.0f}, but caution is advised.**\n\n"
                    f"Your liquid balance is **₹{checking_bal:,.0f}**, leaving only **₹{surplus:,.0f}** remaining. "
                    f"This may temporarily tighten your upcoming recurring bill coverage."
                )
            else:
                shortfall = abs(surplus)
                reply = (
                    f"❌ **Not recommended at this time.**\n\n"
                    f"A purchase of **₹{target_val:,.0f}** exceeds your liquid balance (₹{checking_bal:,.0f}) by **₹{shortfall:,.0f}**. "
                    f"Consider creating a Dedicated Savings Goal to accumulate this over 3–6 months."
                )
            
            return {
                "reply": reply,
                "grounded_data": {"target_amount": target_val, "liquid_balance": checking_bal, "remaining_buffer": surplus},
                "suggested_actions": ["Create Savings Goal", "Check Monthly Budget", "View Forecast"],
                "mode": "DATABASE_INTELLIGENCE"
            }
        except Exception:
            pass

    # 9. General Smart Fallback / Greeting
    reply = (
        f"Hello {user_name}! I am **SmartBank AI Assistant**, your financial co-pilot. I have live access to your accounts, budgets, and transaction history.\n\n"
        f"Here are some questions you can ask me:\n"
        f"• *'How much did I spend on Food this month?'*\n"
        f"• *'What is my single biggest expense?'*\n"
        f"• *'How much did I save this month?'*\n"
        f"• *'Do I have any potential anomaly alerts?'*\n"
        f"• *'What are my recurring monthly subscriptions?'*\n"
        f"• *'Can I afford a ₹15,000 purchase?'*\n"
        f"• *'Explain my Financial Health score'* "
    )
    return {
        "reply": reply,
        "grounded_data": None,
        "suggested_actions": ["Food Spending", "Biggest Expense", "Total Savings", "Anomaly Check"],
        "mode": "DATABASE_INTELLIGENCE"
    }

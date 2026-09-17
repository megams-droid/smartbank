from datetime import datetime, timezone
from typing import List, Dict, Any


def calculate_financial_health(
    monthly_income: float,
    monthly_expenses: float,
    total_savings: float,
    emergency_fund_balance: float,
    budgets: List[Dict[str, Any]],
    goals: List[Dict[str, Any]],
    transactions: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Computes a transparent, explainable 0–100 Financial Health Score.
    
    DISCLAIMER: This is an educational and personal financial wellness index,
    NOT an official bank credit score or lending appraisal.
    """
    # 1. Savings Rate Score (Weight: 25%)
    # Target: 30%+ savings rate gets 100 points
    net_savings = max(0.0, monthly_income - monthly_expenses)
    savings_rate = (net_savings / max(monthly_income, 1.0)) * 100
    
    if savings_rate >= 30.0:
        savings_score = 100
        savings_status = "Optimal"
    elif savings_rate >= 20.0:
        savings_score = int(80 + ((savings_rate - 20.0) / 10.0) * 20)
        savings_status = "Healthy"
    elif savings_rate >= 10.0:
        savings_score = int(60 + ((savings_rate - 10.0) / 10.0) * 20)
        savings_status = "Fair"
    elif savings_rate > 0:
        savings_score = int((savings_rate / 10.0) * 60)
        savings_status = "Low"
    else:
        savings_score = 25
        savings_status = "Deficit"

    # 2. Budget Adherence Score (Weight: 25%)
    if budgets:
        budget_scores = []
        for b in budgets:
            limit = b.get("monthly_limit", 1.0)
            spent = b.get("current_spent", 0.0)
            ratio = spent / max(limit, 1.0)
            if ratio <= 0.70:
                budget_scores.append(100)
            elif ratio <= 0.90:
                budget_scores.append(85)
            elif ratio <= 1.00:
                budget_scores.append(70)
            else:
                budget_scores.append(max(20, int(70 - (ratio - 1.0) * 100)))
        budget_score = int(sum(budget_scores) / len(budget_scores))
    else:
        budget_score = 75  # default baseline if no explicit budget set

    if budget_score >= 85:
        budget_status = "Excellent"
    elif budget_score >= 70:
        budget_status = "Disciplined"
    else:
        budget_status = "Needs Attention"

    # 3. Spending Consistency Score (Weight: 20%)
    # High frequency of irregular non-essential spikes lowers consistency
    expense_txns = [t["amount"] for t in transactions if t.get("type") in ["EXPENSE", "TRANSFER"] and t.get("amount", 0) > 0]
    if len(expense_txns) >= 10:
        large_spikes = sum(1 for a in expense_txns if a > (monthly_income * 0.15))
        consistency_score = max(50, 95 - (large_spikes * 8))
    else:
        consistency_score = 80

    if consistency_score >= 85:
        consistency_status = "Very Stable"
    elif consistency_score >= 70:
        consistency_status = "Moderate Variance"
    else:
        consistency_status = "High Volatility"

    # 4. Emergency Fund Progress Score (Weight: 15%)
    # Target: 3 months of typical expenses
    target_emergency = max(monthly_expenses * 3.0, 30000.0)
    emergency_ratio = min(1.0, emergency_fund_balance / target_emergency)
    emergency_score = int(emergency_ratio * 100)
    emergency_score = max(30, emergency_score)

    if emergency_score >= 80:
        emergency_status = "Well Protected"
    elif emergency_score >= 50:
        emergency_status = "Building Reserve"
    else:
        emergency_status = "Underfunded"

    # 5. Financial Goal Milestones Score (Weight: 15%)
    if goals:
        goal_ratios = []
        for g in goals:
            target = g.get("target_amount", 1.0)
            current = g.get("current_amount", 0.0)
            goal_ratios.append(min(1.0, current / max(target, 1.0)))
        goal_progress = sum(goal_ratios) / len(goal_ratios)
        goal_score = int(goal_progress * 100)
        goal_score = max(40, goal_score)
    else:
        goal_score = 70

    if goal_score >= 80:
        goal_status = "On Track"
    elif goal_score >= 50:
        goal_status = "Active Progress"
    else:
        goal_status = "Early Stage"

    # Compute overall weighted score
    overall_score = int(
        (savings_score * 0.25) +
        (budget_score * 0.25) +
        (consistency_score * 0.20) +
        (emergency_score * 0.15) +
        (goal_score * 0.15)
    )
    overall_score = max(10, min(100, overall_score))

    # Overall Rating
    if overall_score >= 85:
        rating = "EXCELLENT"
        summary = "Outstanding financial discipline with strong savings buffer, strict budget control, and consistent goal milestones."
    elif overall_score >= 70:
        rating = "GOOD"
        summary = "Solid financial health. Your savings rate and budget adherence are healthy, with minor room to build emergency reserves."
    elif overall_score >= 55:
        rating = "MODERATE"
        summary = "Fair financial balance. Tightening discretionary spending and establishing a 3-month emergency buffer will boost your score."
    else:
        rating = "NEEDS_ATTENTION"
        summary = "High expense volatility and near-limit budget utilization detected. Immediate savings adjustments recommended."

    # Dynamic improvement tips
    tips = []
    if savings_score < 80:
        tips.append(f"Increase monthly savings by ₹{max(2000, int(monthly_income * 0.05)):,d} to achieve a 25%+ optimal savings rate.")
    if budget_score < 75:
        tips.append("Review categories nearing 90% limit (e.g., Food & Shopping) to prevent budget overruns.")
    if emergency_score < 75:
        tips.append(f"Allocate ₹{int(target_emergency - emergency_fund_balance):,d} across upcoming paychecks to reach your 3-month safety fund.")
    if consistency_score < 75:
        tips.append("Reduce ad-hoc single purchases exceeding ₹5,000 to smooth cash flow volatility.")
    if not tips:
        tips.append("Keep maintaining your regular automated savings and reviewing monthly recurring bills.")

    factors = [
        {
            "name": "Savings Rate",
            "score": savings_score,
            "weight": 0.25,
            "status": savings_status,
            "description": f"Saved {savings_rate:.1f}% (₹{net_savings:,.0f}) of monthly income.",
        },
        {
            "name": "Budget Adherence",
            "score": budget_score,
            "weight": 0.25,
            "status": budget_status,
            "description": f"Evaluated across {len(budgets)} active category limits.",
        },
        {
            "name": "Spending Consistency",
            "score": consistency_score,
            "weight": 0.20,
            "status": consistency_status,
            "description": "Historical variance and frequency of discretionary spending spikes.",
        },
        {
            "name": "Emergency Fund",
            "score": emergency_score,
            "weight": 0.15,
            "status": emergency_status,
            "description": f"Emergency reserve is at {emergency_ratio*100:.0f}% of 3-month target (₹{target_emergency:,.0f}).",
        },
        {
            "name": "Goal Milestones",
            "score": goal_score,
            "weight": 0.15,
            "status": goal_status,
            "description": f"Progress across {len(goals)} active financial targets.",
        },
    ]

    calculation_details = (
        "Weighted Index: (Savings Rate × 25%) + (Budget Adherence × 25%) + "
        "(Spending Consistency × 20%) + (Emergency Fund × 15%) + (Goal Milestones × 15%)."
    )

    return {
        "overall_score": overall_score,
        "rating": rating,
        "factors": factors,
        "summary_insight": summary,
        "improvement_tips": tips,
        "calculation_details": calculation_details,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }


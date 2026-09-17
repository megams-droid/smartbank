import re
from typing import Tuple, Dict, Any

# Extensive merchant mapping with regex patterns and explainable reasoning
MERCHANT_RULES = {
    # Food & Dining
    r"(swiggy|zomato|mcdonalds|dominos|kfc|starbucks|burger king|chai point|subway|pizza hut|blinkit food|instamart food|restaurant|cafe|dhaba|bakery|diner)": (
        "Food",
        0.98,
        "Merchant identified as a known food delivery platform or dining establishment."
    ),
    # Groceries & Shopping
    r"(zepto|blinkit|bigbasket|instamart|dmart|reliance fresh|nature basket|amazon|flipkart|myntra|ajio|zara|h&m|ikea|croma|vijay sales|supermarket|groceries|kirana)": (
        "Shopping",
        0.95,
        "Merchant matches known e-commerce, supermarket, or retail shopping outlet."
    ),
    # Transport & Commute
    r"(uber|ola|rapido|blusmart|irctc|metro|indian railways|petrol|hpcl|bpcl|iocl|shell|fuel|fastag|parking|flight|indigo|air india|vistara|cleartrip|makemytrip)": (
        "Transport",
        0.96,
        "Merchant matches ride-hailing, fuel, transit, or travel transportation service."
    ),
    # Bills & Utilities
    r"(electricity|bescom|tneb|mahadiscom|tata power|adanipower|airtel|jio|vi |vodafone|bsnl|broadband|act fibernet|tata play|gas bill|water bill|piped gas|igl|mgl)": (
        "Bills",
        0.97,
        "Transaction detected as regular utility, telecom, electricity, or broadband bill payment."
    ),
    # Entertainment & Subscriptions
    r"(netflix|spotify|hotstar|disney\+|amazon prime|youtube premium|apple music|bookmyshow|pvr|inox|playstation|steam|xbox|audible)": (
        "Entertainment",
        0.99,
        "Transaction matches digital streaming, gaming, or cinema entertainment service."
    ),
    # Education
    r"(coursera|udemy|edx|upgrad|simplilearn|unacademy|byju|college|university|school fees|tuition|books|chegg)": (
        "Education",
        0.94,
        "Merchant matches recognized educational institution, e-learning platform, or academic vendor."
    ),
    # Healthcare & Wellness
    r"(apollo|practo|1mg|pharmeasy|netmeds|medplus|hospital|clinic|pharmacy|diagnostic|cult\.fit|gym|fitness)": (
        "Healthcare",
        0.96,
        "Merchant matches pharmacy, hospital, medical diagnostic, or fitness center."
    ),
    # Rent & Housing
    r"(nobroker|nestaway|landlord|house rent|society maintenance|property tax|flat rent)": (
        "Rent",
        0.98,
        "Description matches residential rent or apartment maintenance transaction."
    ),
    # Salary & Income
    r"(salary|payroll|bonus|stipend|freelance|dividend|interest credit|consulting fee)": (
        "Salary",
        0.99,
        "Transaction pattern indicates regular payroll, stipend, or compensation deposit."
    ),
    # Travel & Hospitality
    r"(airbnb|oyo|marriott|taj hotels|booking\.com|agoda|hostelworld|resort)": (
        "Travel",
        0.95,
        "Merchant matches hotel booking, lodging, or holiday travel service."
    ),
}

# Subscriptions / recurring keywords
RECURRING_PATTERNS = [
    r"netflix", r"spotify", r"prime", r"hotstar", r"youtube premium",
    r"broadband", r"fibernet", r"electricity", r"gym", r"rent", r"sip", r"mutual fund"
]


def categorize_transaction(merchant: str, description: str = "", amount: float = 0.0) -> Dict[str, Any]:
    """
    Intelligently categorizes a transaction based on merchant name, description, and amount.
    Returns category, confidence score, explainable rationale, and recurring indicator.
    """
    combined_text = f"{merchant} {description}".lower().strip()

    # Match predefined high-accuracy NLP regex patterns
    for pattern, (category, confidence, reason) in MERCHANT_RULES.items():
        if re.search(pattern, combined_text):
            is_recurring = any(re.search(rp, combined_text) for rp in RECURRING_PATTERNS)
            return {
                "category": category,
                "confidence": confidence,
                "reason": reason,
                "model_version": "v1.2.0-nlp-hybrid",
                "is_recurring_guess": is_recurring,
            }

    # Fallback keyword checks
    if any(w in combined_text for w in ["food", "snack", "tea", "coffee", "lunch", "dinner", "biryani", "pizza", "burger"]):
        return {
            "category": "Food",
            "confidence": 0.88,
            "reason": "Text contains common culinary or dining keywords.",
            "model_version": "v1.2.0-nlp-hybrid",
            "is_recurring_guess": False,
        }

    if any(w in combined_text for w in ["cab", "auto", "taxi", "toll", "bus", "train"]):
        return {
            "category": "Transport",
            "confidence": 0.89,
            "reason": "Text indicates commuter travel or transit service.",
            "model_version": "v1.2.0-nlp-hybrid",
            "is_recurring_guess": False,
        }

    if any(w in combined_text for w in ["doctor", "lab", "medicine", "pill", "tablet", "dental"]):
        return {
            "category": "Healthcare",
            "confidence": 0.90,
            "reason": "Text contains medical or health-related terminology.",
            "model_version": "v1.2.0-nlp-hybrid",
            "is_recurring_guess": False,
        }

    # Default fallback
    return {
        "category": "Other",
        "confidence": 0.70,
        "reason": "No strong merchant signature found; classified into general personal expenses.",
        "model_version": "v1.2.0-nlp-hybrid",
        "is_recurring_guess": False,
    }

"""
SmartBank AI — Transaction Categorizer Model Training
Trains a TF-IDF Vectorizer + Multinomial Naive Bayes / SGD Classifier
for automated merchant & description expense categorization.
"""

import os
import joblib
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import Pipeline
from sklearn.naive_bayes import MultinomialNB
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score, f1_score


def train_categorizer():
    data_path = os.path.join(os.path.dirname(__file__), "..", "data", "synthetic_transactions.csv")
    if not os.path.exists(data_path):
        from generate_synthetic_data import generate_dataset
        df = generate_dataset()
        os.makedirs(os.path.dirname(data_path), exist_ok=True)
        df.to_csv(data_path, index=False)
    else:
        df = pd.read_csv(data_path)

    # Prepare features (Text: Merchant + Description) and Target (Category)
    df["text_features"] = df["merchant"].fillna("") + " " + df["description"].fillna("")
    X = df["text_features"]
    y = df["category"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(ngram_range=(1, 2), lowercase=True, max_features=2500)),
        ("clf", MultinomialNB(alpha=0.1)),
    ])

    print("🚀 Training AI Expense Categorization Model...")
    pipeline.fit(X_train, y_train)

    y_pred = pipeline.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred, average="weighted")

    print(f"✅ Categorization Model Trained Successfully!")
    print(f"🎯 Test Accuracy: {acc * 100:.2f}%")
    print(f"📈 Weighted F1 Score: {f1:.4f}")
    print("\nDetailed Classification Report:")
    print(classification_report(y_test, y_pred))

    # Save trained pipeline
    models_dir = os.path.join(os.path.dirname(__file__), "..", "models")
    os.makedirs(models_dir, exist_ok=True)
    model_file = os.path.join(models_dir, "categorizer_model.joblib")
    joblib.dump(pipeline, model_file)
    print(f"💾 Model artifact saved to: {model_file}")

    return pipeline


if __name__ == "__main__":
    train_categorizer()

"""
SmartBank AI — Isolation Forest Anomaly Detection Model Training
Trains an Isolation Forest unsupervised model with contextual risk feature scaling,
and benchmarks precision, recall, and F1 score against labeled synthetic outliers.
"""

import os
import joblib
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, confusion_matrix, precision_score, recall_score, f1_score


def extract_features(df: pd.DataFrame):
    df["date"] = pd.to_datetime(df["date"])
    df["hour"] = df["date"].dt.hour
    df["day_of_week"] = df["date"].dt.dayofweek
    df["is_night"] = df["hour"].apply(lambda h: 1 if h < 6 or h >= 23 else 0)
    df["log_amount"] = np.log1p(df["amount"])
    
    # Category frequency encoding
    cat_freq = df["category"].value_counts(normalize=True).to_dict()
    df["cat_frequency"] = df["category"].map(cat_freq)

    feature_cols = ["amount", "log_amount", "hour", "day_of_week", "is_night", "cat_frequency"]
    return df[feature_cols]


def train_anomaly_detector():
    data_path = os.path.join(os.path.dirname(__file__), "..", "data", "synthetic_transactions.csv")
    if not os.path.exists(data_path):
        from generate_synthetic_data import generate_dataset
        df = generate_dataset()
        os.makedirs(os.path.dirname(data_path), exist_ok=True)
        df.to_csv(data_path, index=False)
    else:
        df = pd.read_csv(data_path)

    X = extract_features(df.copy())
    y_true = df["is_anomaly"].values

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    contamination = max(0.01, min(0.10, sum(y_true) / len(y_true)))

    print(f"🚀 Training Isolation Forest Anomaly Detector (Contamination: {contamination:.3f})...")
    iso_forest = IsolationForest(
        n_estimators=150,
        contamination=contamination,
        random_state=42,
        max_samples="auto",
        n_jobs=-1,
    )
    iso_forest.fit(X_scaled)

    # Predictions: -1 is anomaly, 1 is normal
    preds_raw = iso_forest.predict(X_scaled)
    y_pred = np.where(preds_raw == -1, True, False)

    # Anomaly decision scores (lower means more anomalous)
    scores = -iso_forest.score_samples(X_scaled)

    prec = precision_score(y_true, y_pred, zero_division=0)
    rec = recall_score(y_true, y_pred, zero_division=0)
    f1 = f1_score(y_true, y_pred, zero_division=0)

    print("✅ Isolation Forest Model Evaluated!")
    print(f"🎯 Precision: {prec * 100:.2f}%")
    print(f"📡 Recall:    {rec * 100:.2f}%")
    print(f"📈 F1 Score:  {f1:.4f}")
    print("\nConfusion Matrix:")
    print(confusion_matrix(y_true, y_pred))

    # Save model and scaler artifacts
    models_dir = os.path.join(os.path.dirname(__file__), "..", "models")
    os.makedirs(models_dir, exist_ok=True)
    model_bundle = {
        "model": iso_forest,
        "scaler": scaler,
        "contamination": contamination,
        "model_version": "v1.4.2-isoforest-stat",
    }
    model_file = os.path.join(models_dir, "isolation_forest.joblib")
    joblib.dump(model_bundle, model_file)
    print(f"💾 Model artifact saved to: {model_file}")

    return model_bundle


if __name__ == "__main__":
    train_anomaly_detector()

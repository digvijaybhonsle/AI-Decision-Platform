import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    r2_score, mean_squared_error,
    accuracy_score, precision_score, recall_score
)
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.linear_model import LinearRegression, LogisticRegression
import joblib
import os
import time
import traceback

from preprocessing import preprocess_data

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "models")
os.makedirs(MODEL_PATH, exist_ok=True)


def train_model(df, model_type, features=None, target=None):
    try:
        # ============================
        # 🔥 PREPROCESS
        # ============================
        df = preprocess_data(df)
        df.columns = df.columns.str.strip()

        if df.empty:
            return {"error": "Dataset is empty after preprocessing"}

        if df.shape[1] < 2:
            return {"error": "Not enough columns in dataset"}

        # ============================
        # 🎯 TARGET COLUMN
        # ============================
        if target is None:
            target = df.columns[-1]

        if target not in df.columns:
            return {
                "error": f"Target column '{target}' not found in dataset",
                "available_columns": list(df.columns)
            }

        # ============================
        # 🎯 FEATURES
        # ============================
        if features is None or len(features) == 0:
            features = [col for col in df.columns if col != target]

        missing = [col for col in features if col not in df.columns]
        if missing:
            return {"error": f"Some features not found: {missing}"}

        if not features:
            return {"error": "No valid features available"}

        # ============================
        # 📊 PREPARE DATA
        # ============================
        X = df[features]
        y = df[target]

        if len(X) < 10:
            return {"error": "Not enough data points (minimum 10 required)"}

        # Auto detect task type
        is_classifier = y.nunique() <= 10   # heuristic

        # ============================
        # 🤖 SELECT MODEL
        # ============================
        if model_type == "random_forest":
            if is_classifier:
                model = RandomForestClassifier(n_estimators=200, random_state=42)
            else:
                model = RandomForestRegressor(n_estimators=200, max_depth=15, random_state=42)

        elif model_type == "linear":
            if is_classifier:
                return {"error": "Linear Regression not suitable for classification task"}
            model = LinearRegression()

        elif model_type == "logistic":
            if not is_classifier:
                return {"error": "Logistic Regression only suitable for classification"}
            model = LogisticRegression(max_iter=1000, random_state=42)

        else:
            return {"error": f"Unsupported model type: {model_type}. Use 'random_forest', 'linear', or 'logistic'"}

        # ============================
        # 🔀 TRAIN-TEST SPLIT
        # ============================
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y if is_classifier else None
        )

        # ============================
        # 🚀 TRAIN MODEL
        # ============================
        model.fit(X_train, y_train)

        # ============================
        # 📈 EVALUATE
        # ============================
        y_pred = model.predict(X_test)

        if is_classifier:
            metrics = {
                "accuracy": round(accuracy_score(y_test, y_pred), 4),
                "precision": round(precision_score(y_test, y_pred, average="weighted", zero_division=0), 4),
                "recall": round(recall_score(y_test, y_pred, average="weighted", zero_division=0), 4),
            }
            task = "classification"
        else:
            mse = mean_squared_error(y_test, y_pred)
            metrics = {
                "r2_score": round(r2_score(y_test, y_pred), 4),
                "mse": round(mse, 4),
                "rmse": round(mse ** 0.5, 4),
            }
            task = "regression"

        # ============================
        # 💾 SAVE MODEL
        # ============================
        timestamp = int(time.time())
        model_filename = f"{model_type}_{target}_{timestamp}.pkl"
        model_path = os.path.join(MODEL_PATH, model_filename)

        joblib.dump({
            "model": model,           # ← This is the actual trained model object
            "features": features,
            "target": target,
            "task": task,
            "model_type": model_type,
            "created_at": timestamp,
            "metrics": metrics
        }, model_path)

        print(f"✅ Model saved successfully: {model_path}")

        # ============================
        # ✅ RETURN TO FASTAPI
        # ============================
        return {
            "status": "success",
            "task": task,
            "model_type": model_type,
            "target": target,
            "features": features,
            "model_obj": model,           # ← Important: Return the actual model object
            "model_path": model_path,
            "metrics": metrics
        }

    except Exception as e:
        print("❌ TRAIN MODEL ERROR:")
        print(traceback.format_exc())
        return {
            "error": f"Training failed: {str(e)}",
            "trace": traceback.format_exc()
        }
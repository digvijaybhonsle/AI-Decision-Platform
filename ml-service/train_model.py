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
            return {"error": "Not enough columns"}

        # ============================
        # 🎯 TARGET
        # ============================
        if target is None:
            target = df.columns[-1]

        if target not in df.columns:
            return {
                "error": f"Target '{target}' not found",
                "available_columns": df.columns.tolist()
            }

        # ============================
        # 🎯 FEATURES
        # ============================
        if features is None:
            features = [col for col in df.columns if col != target]

        missing = [col for col in features if col not in df.columns]
        if missing:
            return {"error": f"Missing features: {missing}"}

        if not features:
            return {"error": "No valid features"}

        # ============================
        # 📊 DATA PREP
        # ============================
        X = df[features]
        y = df[target]

        if len(X) < 10:
            return {"error": "Not enough data"}

        # ============================
        # 🔍 AUTO TASK DETECTION
        # ============================
        is_classifier = y.nunique() < 10

        # ============================
        # 🤖 MODEL SELECTION
        # ============================
        if model_type == "random_forest":
            model = (
                RandomForestClassifier(n_estimators=200, random_state=42)
                if is_classifier
                else RandomForestRegressor(n_estimators=200, max_depth=15, random_state=42)
            )

        elif model_type == "linear":
            if is_classifier:
                return {"error": "Linear not valid for classification"}
            model = LinearRegression()

        elif model_type == "logistic":
            if not is_classifier:
                return {"error": "Logistic only for classification"}
            model = LogisticRegression(max_iter=1000)

        else:
            return {"error": "Invalid model type"}

        # ============================
        # 🔀 SPLIT
        # ============================
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )

        # ============================
        # 🚀 TRAIN
        # ============================
        model.fit(X_train, y_train)

        # ============================
        # 📈 PREDICT
        # ============================
        y_pred = model.predict(X_test)

        # ============================
        # 📊 METRICS (PRO LEVEL)
        # ============================
        if is_classifier:
            metrics = {
                "accuracy": round(accuracy_score(y_test, y_pred), 4),
                "precision": round(precision_score(y_test, y_pred, average="weighted", zero_division=0), 4),
                "recall": round(recall_score(y_test, y_pred, average="weighted", zero_division=0), 4),
            }
            task = "classification"

        else:
            mse = mean_squared_error(y_test, y_pred)
            rmse = mse ** 0.5

            metrics = {
                "r2_score": round(r2_score(y_test, y_pred), 4),
                "mse": round(mse, 4),
                "rmse": round(rmse, 4),
            }
            task = "regression"

        # ============================
        # 💾 SAVE MODEL
        # ============================
        model_filename = f"{model_type}_{target}_{int(time.time())}.pkl"
        model_path = os.path.join(MODEL_PATH, model_filename)

        joblib.dump({
            "model": model,
            "features": features,
            "target": target,
            "task": task,
            "created_at": int(time.time())
        }, model_path)

        # ============================
        # ✅ RESPONSE (CLEAN API)
        # ============================
        return {
            "task": task,
            "model_type": model_type,
            "target": target,
            "features": features,
            "model_path": model_path,
            "metrics": metrics
        }

    except Exception as e:
        import traceback
        return {
            "error": str(e),
            "trace": traceback.format_exc()
        }
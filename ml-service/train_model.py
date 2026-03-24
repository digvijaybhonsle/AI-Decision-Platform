import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_squared_error, accuracy_score
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
        df = preprocess_data(df)
        df.columns = df.columns.str.strip()

        if df.empty:
            return {"error": "Dataset is empty after preprocessing"}

        # 🎯 Target
        if target is None:
            target = "Total_Spending" if "Total_Spending" in df.columns else df.columns[-1]

        if target not in df.columns:
            return {"error": f"Target column '{target}' not found"}

        # 🎯 Features
        if features is None:
            features = [col for col in df.columns if col != target]

        # ✅ STRICT validation
        missing = [col for col in features if col not in df.columns]
        if missing:
            return {"error": f"Missing feature columns: {missing}"}

        X = df[features]
        y = df[target]

        # Split
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )

        # Model selection
        if model_type == "random_forest":
            if y.nunique() < 10:
                model = RandomForestClassifier(n_estimators=200)
                is_classifier = True
            else:
                model = RandomForestRegressor(n_estimators=200, max_depth=15)
                is_classifier = False

        elif model_type == "linear":
            model = LinearRegression()
            is_classifier = False

        elif model_type == "logistic":
            model = LogisticRegression(max_iter=1000)
            is_classifier = True

        else:
            return {"error": "Invalid model type"}

        # Train
        model.fit(X_train, y_train)

        # Predict
        y_pred = model.predict(X_test)

        # Metrics
        if is_classifier:
            metric = {"accuracy": accuracy_score(y_test, y_pred)}
        else:
            metric = {
                "r2_score": r2_score(y_test, y_pred),
                "mse": mean_squared_error(y_test, y_pred)
            }

        return {
            "model_type": model_type,
            "target": target,
            "features": features,
            "model_obj": model,
            **metric
        }

    except Exception as e:
        import traceback
        return {
            "error": str(e),
            "trace": traceback.format_exc()
        }
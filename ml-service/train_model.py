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
        # 🔥 Preprocess
        df = preprocess_data(df)
        df.columns = df.columns.str.strip()

        print("📊 Columns after preprocessing:", df.columns.tolist())

        # ❌ Empty check
        if df.empty:
            return {"error": "Dataset is empty after preprocessing"}

        if df.shape[1] < 2:
            return {"error": "Not enough columns after preprocessing"}

        # 🎯 Target
        if target is None:
            target = "Total_Spending" if "Total_Spending" in df.columns else df.columns[-1]

        print("🎯 Target:", target)

        if target not in df.columns:
            return {
                "error": f"Target column '{target}' not found",
                "available_columns": df.columns.tolist()
            }

        # 🎯 Features
        if features is None:
            features = [col for col in df.columns if col != target]

        print("🧩 Features:", features)

        # ✅ STRICT validation
        missing = [col for col in features if col not in df.columns]
        if missing:
            return {
                "error": f"Missing feature columns: {missing}",
                "available_columns": df.columns.tolist()
            }

        # 🔥 Avoid leakage (optional but smart)
        if target == "Total_Spending":
            features = [col for col in features if not col.lower().startswith("mnt")]

        if not features:
            return {"error": "No valid features left after filtering"}

        # Final X, y
        X = df[features]
        y = df[target]

        # ❌ Final safety check
        if X.empty or y.empty:
            return {"error": "Feature or target data is empty"}

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

        # 🚀 Train
        print("🚀 Training started...")
        model.fit(X_train, y_train)
        print("✅ Training completed")

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

        # 💾 Save model
        model_filename = f"{model_type}_{int(time.time())}.pkl"
        model_path = os.path.join(MODEL_PATH, model_filename)
        joblib.dump(model, model_path)

        print("💾 Model saved at:", model_path)

        return {
            "model_type": model_type,
            "target": target,
            "features": features,
            "model_path": model_path,
            **metric
        }

    except Exception as e:
        import traceback
        print("❌ ERROR:", str(e))
        print(traceback.format_exc())

        return {
            "error": str(e),
            "trace": traceback.format_exc()
        }
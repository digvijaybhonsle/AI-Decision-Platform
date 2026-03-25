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
        # ============================
        # 🔥 PREPROCESS
        # ============================
        df = preprocess_data(df)
        df.columns = df.columns.str.strip()

        print("📊 Columns after preprocessing:", df.columns.tolist())

        # ❌ Empty checks
        if df.empty:
            return {"error": "Dataset is empty after preprocessing"}

        if df.shape[1] < 2:
            return {"error": "Not enough columns after preprocessing"}

        # ============================
        # 🎯 TARGET
        # ============================
        if target is None:
            target = "Total_Spending" if "Total_Spending" in df.columns else df.columns[-1]

        print("🎯 Target:", target)

        if target not in df.columns:
            return {
                "error": f"Target column '{target}' not found",
                "available_columns": df.columns.tolist()
            }

        # ============================
        # 🎯 FEATURES
        # ============================
        if features is None:
            features = [col for col in df.columns if col != target]

        print("🧩 Features (before filter):", features)

        # Validate features
        missing = [col for col in features if col not in df.columns]
        if missing:
            return {
                "error": f"Missing feature columns: {missing}",
                "available_columns": df.columns.tolist()
            }

        # 🔥 Prevent leakage
        if target == "Total_Spending":
            features = [col for col in features if not col.lower().startswith("mnt")]

        print("🧩 Features (after filter):", features)

        if not features:
            return {"error": "No valid features left after filtering"}

        # ============================
        # 📊 DATA PREP
        # ============================
        X = df[features]
        y = df[target]

        if X.empty or y.empty:
            return {"error": "Feature or target data is empty"}

        if len(X) < 5:
            return {"error": "Not enough data rows for training"}

        # ============================
        # 🔀 SPLIT
        # ============================
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )

        if X_train.empty or y_train.empty:
            return {"error": "Training split is empty"}

        # ============================
        # 🤖 MODEL SELECTION
        # ============================
        if model_type == "random_forest":
            if y.nunique() < 10:
                model = RandomForestClassifier(n_estimators=200, random_state=42)
                is_classifier = True
            else:
                model = RandomForestRegressor(n_estimators=200, max_depth=15, random_state=42)
                is_classifier = False

        elif model_type == "linear":
            model = LinearRegression()
            is_classifier = False

        elif model_type == "logistic":
            model = LogisticRegression(max_iter=1000)
            is_classifier = True

        else:
            return {"error": "Invalid model type"}

        print("🤖 Model selected:", type(model).__name__)

        # ============================
        # 🚀 TRAIN
        # ============================
        print("🚀 Training started...")
        model.fit(X_train, y_train)
        print("✅ Training completed")

        # 🚨 CRITICAL FIX
        if model is None:
            return {"error": "Model training failed. Model is None"}

        # ============================
        # 📈 PREDICT
        # ============================
        y_pred = model.predict(X_test)

        if len(y_pred) == 0:
            return {"error": "Prediction failed"}

        # ============================
        # 📊 METRICS
        # ============================
        if is_classifier:
            metric = {"accuracy": accuracy_score(y_test, y_pred)}
        else:
            metric = {
                "r2_score": r2_score(y_test, y_pred),
                "mse": mean_squared_error(y_test, y_pred)
            }

        print("📊 Metrics:", metric)

        # ============================
        # 💾 SAVE MODEL (FIXED STRUCTURE)
        # ============================
        model_filename = f"{model_type}_{target}_{int(time.time())}.pkl"
        model_path = os.path.join(MODEL_PATH, model_filename)

        joblib.dump({
            "model": model,               # ✅ IMPORTANT FIX
            "features": features,
            "target": target,
            "created_at": int(time.time())
        }, model_path)

        print("💾 Model saved at:", model_path)

        # ============================
        # ✅ RETURN
        # ============================
        return {
            "model_type": model_type,
            "target": target,
            "features": features,
            "model_path": model_path,
            "model_obj": model,   # ✅ now guaranteed valid
            "metrics": metric
        }

    except Exception as e:
        import traceback
        print("❌ ERROR:", str(e))
        print(traceback.format_exc())

        return {
            "error": str(e),
            "trace": traceback.format_exc()
        }
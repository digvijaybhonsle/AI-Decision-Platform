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


def train_model(df, model_type, features, target):
    try:
        # ✅ Preprocess
        df = preprocess_data(df)

        # ✅ Validate columns
        for col in features + [target]:
            if col not in df.columns:
                return {"error": f"Column '{col}' not found in dataset"}

        X = df[features]
        y = df[target]

        # ✅ Train test split
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )

        # 🔥 Model Selection
        if model_type == "random_forest":
            if y.nunique() < 10:
                model = RandomForestClassifier(n_estimators=200)
            else:
                model = RandomForestRegressor(n_estimators=200, max_depth=15)

        elif model_type == "linear":
            model = LinearRegression()

        elif model_type == "logistic":
            model = LogisticRegression(max_iter=1000)

        else:
            return {"error": "Invalid model type"}

        # ✅ Train
        model.fit(X_train, y_train)

        # ✅ Predict
        y_pred = model.predict(X_test)

        # ✅ Evaluate
        if hasattr(model, "predict_proba") or y.nunique() < 10:
            acc = accuracy_score(y_test, y_pred)
            metric = {"accuracy": acc}
        else:
            r2 = r2_score(y_test, y_pred)
            mse = mean_squared_error(y_test, y_pred)
            metric = {"r2_score": r2, "mse": mse}

        # ✅ Ensure models folder exists
        os.makedirs(MODEL_PATH, exist_ok=True)

        # ✅ Save model
        model_filename = f"{model_type}_{target}_{int(time.time())}.pkl"
        model_path = os.path.join(MODEL_PATH, model_filename)

        joblib.dump(model, model_path)

        return {
            "model_type": model_type,
            "target": target,
            "features": features,
            "model_path": model_path,
            **metric
        }

    except Exception as e:
        return {"error": str(e)}
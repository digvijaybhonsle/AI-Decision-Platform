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
    """
    Train a model dynamically on a dataset with all numeric features.
    
    Args:
        df: pandas DataFrame
        model_type: 'random_forest', 'linear', or 'logistic'
        features: list of features to use (optional)
        target: target column name (optional)
    
    Returns:
        dict with model info, metrics, features used, or error
    """
    try:
        # ✅ Preprocess dataset dynamically
        df = preprocess_data(df)
        df.columns = df.columns.str.strip()  # remove leading/trailing spaces

        # ✅ Identify target dynamically
        if target is None:
            # Default target is 'Total_Spending' if it exists
            target = "Total_Spending" if "Total_Spending" in df.columns else df.columns[-1]

        if target not in df.columns:
            return {"error": f"Target column '{target}' not found in dataset"}

        # ✅ Identify features dynamically
        if features is None:
            features = [col for col in df.columns if col != target]

        # Keep only existing columns
        features = [col for col in features if col in df.columns]

        if not features:
            return {"error": "No valid features found in dataset"}

        X = df[features]
        y = df[target]

        # ✅ Train-test split
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )

        # 🔥 Model selection
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

        # ✅ Train model
        model.fit(X_train, y_train)

        # ✅ Predict
        y_pred = model.predict(X_test)

        # ✅ Evaluate
        if is_classifier:
            metric = {"accuracy": accuracy_score(y_test, y_pred)}
        else:
            metric = {
                "r2_score": r2_score(y_test, y_pred),
                "mse": mean_squared_error(y_test, y_pred)
            }

        # ✅ Save model + features together for downstream use
        model_filename = f"{model_type}_{target}_{int(time.time())}.pkl"
        model_path = os.path.join(MODEL_PATH, model_filename)

        joblib.dump({"model": model, "features": features}, model_path)

        return {
            "model_type": model_type,
            "target": target,
            "features": features,
            "model_path": model_path,
            **metric
        }

    except Exception as e:
        return {"error": str(e)}
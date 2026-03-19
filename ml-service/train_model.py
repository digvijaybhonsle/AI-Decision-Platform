import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_squared_error
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
import joblib

from preprocessing import preprocess_data


def train_model(model_type="random_forest"):
    df = pd.read_excel("datasets/marketing_campaign.xlsx")
    df = preprocess_data(df)

    X = df[['Income', 'Kidhome', 'Teenhome', 'Recency']]
    y = df['Total_Spending']

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    # 🔥 Model Selection
    if model_type == "random_forest":
        model = RandomForestRegressor(n_estimators=200, max_depth=15)
    elif model_type == "linear":
        model = LinearRegression()
    else:
        return {"error": "Invalid model type"}

    # Train
    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)

    r2 = r2_score(y_test, y_pred)
    mse = mean_squared_error(y_test, y_pred)

    # Save model
    joblib.dump(model, "models/model.pkl")

    return {
        "model_type": model_type,
        "r2_score": r2,
        "mse": mse
    }
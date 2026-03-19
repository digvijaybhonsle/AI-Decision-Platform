from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
import joblib
import shutil
import os
import pandas as pd

from predict import predict_with_confidence
from insights import generate_insights
from train_model import train_model
from typing import List
from typing import Dict

app = FastAPI()

# ==============================
# 🧠 GLOBAL STATE
# ==============================
model = None
current_dataset = None


# ==============================
# 📦 REQUEST SCHEMAS
# ==============================

# class PredictRequest(BaseModel):
#     income: float
#     kidhome: int
#     teenhome: int
#     recency: int


class TrainRequest(BaseModel):
    model_type: str
    features: List[str]
    target: str


# ==============================
# 🥇 STEP 1: UPLOAD DATASET
# ==============================

@app.post("/upload-dataset")
def upload_dataset(file: UploadFile = File(...)):
    global current_dataset

    file_path = f"datasets/{file.filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    current_dataset = file.filename

    return {
        "message": "Dataset uploaded successfully",
        "filename": file.filename
    }


# ==============================
# 🥈 STEP 2: PREVIEW DATASET
# ==============================

@app.get("/dataset-preview")
def dataset_preview():
    if current_dataset is None:
        return {"error": "No dataset uploaded"}

    path = f"datasets/{current_dataset}"

    if current_dataset.endswith(".xlsx"):
        df = pd.read_excel(path)
    else:
        df = pd.read_csv(path)

    df.columns = df.columns.str.strip()

    return {
        "columns": list(df.columns),
        "rows": df.head(10).to_dict(orient="records")
    }


# ==============================
# 🥉 STEP 3: TRAIN MODEL
# ==============================

@app.post("/train")
def train(req: TrainRequest):
    global model

    if current_dataset is None:
        return {"error": "Upload dataset first"}

    path = f"datasets/{current_dataset}"

    # Load dataset
    if current_dataset.endswith(".xlsx"):
        df = pd.read_excel(path)
    else:
        df = pd.read_csv(path)

    df.columns = df.columns.str.strip()
    df = df.dropna()

    X = df[req.features]
    y = df[req.target]

    # Model selection
    if req.model_type == "random_forest":
        from sklearn.ensemble import RandomForestRegressor
        model_obj = RandomForestRegressor()
    elif req.model_type == "linear":
        from sklearn.linear_model import LinearRegression
        model_obj = LinearRegression()
    else:
        return {"error": "Invalid model type"}

    model_obj.fit(X, y)

    # Save model + features
    joblib.dump({
        "model": model_obj,
        "features": req.features
    }, "models/model.pkl")

    model = model_obj

    return {
        "message": "Model trained successfully",
        "features_used": req.features,
        "target": req.target
    }


# ==============================
# 🏅 STEP 4: PREDICT
# ==============================

@app.post("/predict")
def predict(data: Dict[str, float]):
    if model is None:
        return {"error": "Model not trained yet"}

    loaded = joblib.load("models/model.pkl")

    model_obj = loaded["model"]
    features = loaded["features"]

    if not all(f in data for f in features):
        return {
            "error": f"Missing required features. Expected: {features}"
        }

    try:
        values = [data[f] for f in features]
    except KeyError:
        return {"error": f"Missing required features: {features}"}

    prediction = model_obj.predict([values])[0]

    return {
        "prediction": float(prediction)
    }


# ==============================
# 🏆 STEP 5: SIMULATE
# ==============================

@app.post("/simulate")
def simulate(requests: list[dict]):
    loaded = joblib.load("models/model.pkl")

    model_obj = loaded["model"]
    features = loaded["features"]

    results = []

    for req in requests:
        if not all(f in req for f in features):
            return {
                "error": f"Each input must contain features: {features}"
            }
        values = [req[f] for f in features]
        pred = model_obj.predict([values])[0]

        results.append({
            "input": req,
            "prediction": float(pred)
        })

    return results


# ==============================
# 🎯 STEP 6: INSIGHTS
# ==============================

@app.get("/insights")
def insights():
    if current_dataset is None:
        return {"error": "No dataset available"}

    return generate_insights()


# ==============================
# 📊 EXTRA: FEATURE IMPORTANCE
# ==============================

@app.get("/feature-importance")
def feature_importance():
    if model is None:
        return {"error": "Model not trained yet"}

    try:
        loaded = joblib.load("models/model.pkl")
        model_obj = loaded["model"]
        features = loaded["features"]
    except:
        return {"error": "Model file not found"}

    # Some models (like Linear Regression) may not have feature_importances_
    if not hasattr(model_obj, "feature_importances_"):
        return {
            "error": "Feature importance not available for this model"
        }

    importances = model_obj.feature_importances_

    # Convert to clean JSON
    result = [
        {"feature": f, "importance": float(i)}
        for f, i in zip(features, importances)
    ]
    result = sorted(result, key=lambda x: x["importance"], reverse=True)

    return result



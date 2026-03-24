import traceback

from fastapi import FastAPI, UploadFile, File, Form
from pydantic import BaseModel
import joblib
import shutil
import os
import pandas as pd
import json

from predict import predict_with_confidence
from insights import generate_insights
from train_model import train_model
from typing import List, Optional
from typing import Dict

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DATASET_PATH = os.path.join(BASE_DIR, "datasets")
MODEL_PATH = os.path.join(BASE_DIR, "models")

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
    datasetId: str
    model_type: str
    features: Optional[List[str]] = None
    target: Optional[str] = None


MODEL_DIR = "models"
DATASET_DIR = "datasets"

os.makedirs(MODEL_DIR, exist_ok=True)
os.makedirs(DATASET_DIR, exist_ok=True)

model = None
current_model_file = None


@app.post("/train")
async def train(req: TrainRequest):
    global model, current_model_file

    try:
        # 📂 Load dataset using datasetId
        dataset_path = os.path.join(DATASET_DIR, f"{req.datasetId}.csv")

        if not os.path.exists(dataset_path):
            return {"error": f"Dataset not found: {req.datasetId}"}

        df = pd.read_csv(dataset_path)

        # 🧹 Clean columns
        df.columns = df.columns.str.strip()

        # 🚀 Train model
        result = train_model(
            df,
            req.model_type,
            req.features,
            req.target
        )

        if "error" in result:
            return result

        # 💾 Save model (ONLY ONCE)
        model_filename = f"{req.model_type}_{result['target']}_{int(pd.Timestamp.now().timestamp())}.pkl"
        model_file_path = os.path.join(MODEL_DIR, model_filename)

        joblib.dump({
            "model": result["model_obj"],
            "features": result["features"]
        }, model_file_path)

        # 🔥 Load into memory
        model = result["model_obj"]
        current_model_file = model_file_path

        return {
            "status": "success",
            "model_type": req.model_type,
            "target": result["target"],
            "features": result["features"],
            "metrics": {
                "r2_score": result.get("r2_score"),
                "mse": result.get("mse"),
                "accuracy": result.get("accuracy")
            },
            "model_file": model_file_path
        }

    except Exception as e:
        return {
            "error": str(e),
            "trace": traceback.format_exc()
        }


@app.post("/predict")
def predict(data: Dict[str, float]):
    global current_model_file

    try:
        if current_model_file is None:
            return {"error": "No model trained yet"}

        # Load the latest trained model
        loaded = joblib.load(current_model_file)
        model_obj = loaded["model"]
        features = loaded["features"]

        # Validate input features
        missing = [f for f in features if f not in data]
        if missing:
            return {"error": f"Missing required features: {missing}"}

        # Prepare input values
        values = [data[f] for f in features]

        # Make prediction
        prediction = model_obj.predict([values])[0]

        return {"prediction": float(prediction)}

    except Exception as e:
        return {"error": str(e)}

# ==============================
# STEP 5: SIMULATE
# ==============================
@app.post("/simulate")
def simulate(requests: List[Dict[str, float]]):
    global model, current_model_file
    if model is None or current_model_file is None:
        return {"error": "Model not trained yet"}

    loaded = joblib.load(current_model_file)
    model_obj = loaded["model"]
    features = loaded["features"]

    results = []
    for req in requests:
        if not all(f in req for f in features):
            return {"error": f"Each input must contain features: {features}"}
        values = [req[f] for f in features]
        pred = model_obj.predict([values])[0]
        results.append({"input": req, "prediction": float(pred)})

    return results


# ==============================
# STEP 6: INSIGHTS
# ==============================
@app.get("/insights")
def insights():
    if current_dataset is None:
        return {"error": "No dataset available"}
    return generate_insights()


# ==============================
# EXTRA: FEATURE IMPORTANCE
# ==============================
@app.get("/feature-importance")
def feature_importance():
    global model, current_model_file
    if model is None or current_model_file is None:
        return {"error": "Model not trained yet"}

    loaded = joblib.load(current_model_file)
    model_obj = loaded["model"]
    features = loaded["features"]

    if not hasattr(model_obj, "feature_importances_"):
        return {"error": "Feature importance not available for this model"}

    importances = model_obj.feature_importances_
    result = [{"feature": f, "importance": float(i)} for f, i in zip(features, importances)]
    return sorted(result, key=lambda x: x["importance"], reverse=True)



import traceback
from fastapi import FastAPI, UploadFile, File, Form
from pydantic import BaseModel
import joblib
import os
import pandas as pd
import json
import time

from predict import predict_with_confidence
from insights import generate_insights
from train_model import train_model
from typing import List
from typing import Dict
from fastapi.middleware.cors import CORSMiddleware


BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DATASET_PATH = os.path.join(BASE_DIR, "datasets")
MODEL_PATH = os.path.join(BASE_DIR, "models")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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




MODEL_DIR = "models"
DATASET_DIR = "datasets"

os.makedirs(MODEL_DIR, exist_ok=True)
os.makedirs(DATASET_DIR, exist_ok=True)

model = None
current_model_file = None


@app.post("/train")
async def train(
    file: UploadFile = File(...),
    model_type: str = Form(...),
    features: str = Form(None),
    target: str = Form(None)
):
    global model, current_model_file

    try:
        # 📂 Save uploaded file
        file_path = os.path.join(DATASET_DIR, file.filename)

        with open(file_path, "wb") as buffer:
            buffer.write(await file.read())

        print("📁 File received:", file.filename)

        # 📊 Load dataset
        df = pd.read_csv(file_path)
        df.columns = df.columns.str.strip()

        print("📊 Dataset shape:", df.shape)

        # 🔥 Parse features JSON safely
        if features:
            try:
                features = json.loads(features)
            except:
                return {"error": "Invalid features format"}

        print("📊 Features:", features)
        print("🎯 Target:", target)

        # 🚀 Train model
        result = train_model(
            df,
            model_type,
            features,
            target
        )

        if "error" in result:
            return result

        # ⏱ Timestamp
        timestamp = int(time.time())

        # 💾 Save model
        model_filename = f"{model_type}_{result.get('target')}_{timestamp}.pkl"
        model_file_path = os.path.join(MODEL_DIR, model_filename)

        joblib.dump({
            "model": result.get("model_obj"),
            "features": result.get("features"),
            "target": result.get("target"),
            "created_at": timestamp
        }, model_file_path)

        print("💾 Model saved:", model_file_path)

        # 🔥 Load into memory
        model = result.get("model_obj")
        current_model_file = model_file_path

        return {
            "status": "success",
            "model_type": model_type,
            "target": result.get("target"),
            "features": result.get("features"),
            "metrics": {
                "r2_score": result.get("r2_score"),
                "mse": result.get("mse"),
                "accuracy": result.get("accuracy")
            },
            "model_file": model_file_path
        }

    except Exception as e:
        import traceback
        print("❌ ERROR:", str(e))
        print(traceback.format_exc())

        return {
            "error": str(e),
            "trace": traceback.format_exc()
        }
    

@app.post("/predict")
def predict(data: Dict[str, float]):
    global current_model_file

    try:
        # ❌ No model check
        if current_model_file is None:
            return {"error": "No model trained yet"}

        print("📥 Incoming prediction data:", data)
        print("📁 Using model:", current_model_file)

        # 🚀 Use improved prediction function
        result = predict_with_confidence(current_model_file, data)

        # ❌ If error from prediction layer
        if "error" in result:
            return result

        return {
            "status": "success",
            "prediction": result["prediction"],
            "confidence": result["confidence"],
            "range": result["range"]
        }

    except Exception as e:
        import traceback
        print("❌ PREDICT ERROR:", str(e))
        print(traceback.format_exc())

        return {
            "error": str(e),
            "trace": traceback.format_exc()
        }

# ==============================

@app.post("/simulate")
def simulate(requests: List[Dict[str, float]]):
    global current_model_file

    try:
        if current_model_file is None:
            return {"error": "Model not trained yet"}

        print("📥 Simulation requests:", requests)

        results = []

        for req in requests:
            result = predict_with_confidence(current_model_file, req)

            if "error" in result:
                return {
                    "error": "Simulation failed for one of the inputs",
                    "details": result
                }

            results.append({
                "input": req,
                "prediction": result["prediction"],
                "confidence": result["confidence"],
                "range": result["range"]
            })

        return {
            "status": "success",
            "total_scenarios": len(results),
            "results": results
        }

    except Exception as e:
        import traceback
        print("❌ SIMULATE ERROR:", str(e))
        print(traceback.format_exc())

        return {
            "error": str(e),
            "trace": traceback.format_exc()
        }


# ==============================
# STEP 6: INSIGHTS
# ==============================
@app.get("/insights")
def insights():
    global current_dataset

    if current_dataset is None:
        return {"error": "No dataset available"}

    return generate_insights(current_dataset)


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


@app.get("/models")
def list_models():
    try:
        files = os.listdir(MODEL_DIR)

        models = []
        for f in files:
            if f.endswith(".pkl"):
                models.append({
                    "model_file": f,
                    "path": os.path.join(MODEL_DIR, f)
                })

        return {
            "total_models": len(models),
            "models": models
        }

    except Exception as e:
        return {"error": str(e)}
    

    
@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "ML API running",
        "model_loaded": current_model_file is not None
    }



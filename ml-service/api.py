import asyncio
import traceback
import uuid
import os
import json
import time

import pandas as pd
import joblib

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict

from predict import predict_with_confidence
from insights import generate_insights_from_df
from train_model import train_model

# ==============================
# CONFIGURATION
# ==============================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_DIR = "models"
DATASET_DIR = "datasets"

os.makedirs(MODEL_DIR, exist_ok=True)
os.makedirs(DATASET_DIR, exist_ok=True)

app = FastAPI(title="AI Decision Platform - ML Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==============================
# GLOBAL STATE
# ==============================
current_model_file: str | None = None


# ==============================
# HELPER FUNCTIONS
# ==============================
async def save_uploaded_file(file: UploadFile) -> str:
    unique_name = f"{uuid.uuid4()}_{file.filename}"
    file_path = os.path.join(DATASET_DIR, unique_name)

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    with open(file_path, "wb") as buffer:
        buffer.write(content)

    print(f"📁 File saved: {file_path} | Size: {len(content)} bytes")
    return file_path


# ==============================
# TRAINING ENDPOINT
# ==============================
@app.post("/train")
async def train(
    file: UploadFile = File(...),
    model_type: str = Form(...),
    features: str = Form(None),
    target: str = Form(None)
):
    global current_model_file

    try:
        file_path = await save_uploaded_file(file)

        # Load CSV
        try:
            df = pd.read_csv(file_path, encoding="utf-8")
        except:
            df = pd.read_csv(file_path, encoding="latin1")

        df.columns = df.columns.str.strip()

        if df.empty:
            raise HTTPException(status_code=400, detail="CSV has no data")

        # Parse features if provided
        if features:
            try:
                features = json.loads(features)
                if not isinstance(features, list):
                    raise ValueError("Features must be a list")
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Invalid features format: {str(e)}")

        # Train model (non-blocking)
        result = await asyncio.to_thread(
            train_model, df, model_type, features, target
        )

        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])

        # Save model
        timestamp = int(time.time())
        model_filename = f"{model_type}_{timestamp}.pkl"
        model_file_path = os.path.join(MODEL_DIR, model_filename)

        joblib.dump({
            "model": result.get("model_obj"),
            "features": result.get("features"),
            "target": result.get("target"),
            "created_at": timestamp
        }, model_file_path)

        # Load into memory
        current_model_file = model_file_path

        # Cleanup uploaded file
        try:
            os.remove(file_path)
        except:
            pass

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

    except HTTPException as e:
        raise e
    except Exception as e:
        print("❌ TRAIN ERROR:", str(e))
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


# ==============================
# PREDICT & SIMULATE
# ==============================
@app.post("/predict")
def predict(data: Dict[str, float]):
    global current_model_file

    if current_model_file is None:
        raise HTTPException(status_code=400, detail="No model trained yet")

    try:
        result = predict_with_confidence(current_model_file, data)

        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])

        return {
            "status": "success",
            "prediction": result["prediction"],
            "confidence": result["confidence"],
            "range": result["range"]
        }
    except Exception as e:
        print("❌ PREDICT ERROR:", str(e))
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/simulate")
def simulate(requests: List[Dict[str, float]]):
    global current_model_file

    if current_model_file is None:
        raise HTTPException(status_code=400, detail="Model not trained yet")

    try:
        results = []
        for req in requests:
            result = predict_with_confidence(current_model_file, req)
            if "error" in result:
                raise HTTPException(status_code=400, detail=f"Simulation failed: {result['error']}")

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
        print("❌ SIMULATE ERROR:", str(e))
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


# ==============================
# COMPATIBILITY ROUTE FOR YOUR NODE.JS CODE
# ==============================
@app.post("/api/simulations/run")
async def run_simulation(requests: List[Dict[str, float]]):
    """This route is added so your existing Node.js /api/simulations/run call works without changing the URL."""
    return simulate(requests)


# ==============================
# OTHER ENDPOINTS
# ==============================
@app.post("/insights")
async def insights(file: UploadFile = File(...)):
    try:
        df = pd.read_csv(file.file)
        return generate_insights_from_df(df)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to process file: {str(e)}")


@app.get("/feature-importance")
def feature_importance():
    global current_model_file
    if not current_model_file or not os.path.exists(current_model_file):
        raise HTTPException(status_code=400, detail="No trained model available")

    try:
        loaded = joblib.load(current_model_file)
        model_obj = loaded.get("model")
        features = loaded.get("features")

        if not model_obj or not features:
            raise HTTPException(status_code=400, detail="Invalid model file")

        if not hasattr(model_obj, "feature_importances_"):
            raise HTTPException(
                status_code=400,
                detail=f"Feature importance not available for {type(model_obj).__name__}"
            )

        importances = model_obj.feature_importances_
        result = [
            {"feature": f, "importance": float(i)}
            for f, i in zip(features, importances)
        ]
        result = sorted(result, key=lambda x: x["importance"], reverse=True)

        return {
            "model_type": type(model_obj).__name__,
            "feature_importance": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/models")
def list_models():
    try:
        files = [f for f in os.listdir(MODEL_DIR) if f.endswith(".pkl")]
        models = [{"model_file": f, "path": os.path.join(MODEL_DIR, f)} for f in files]
        return {"total_models": len(models), "models": models}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "ML API running",
        "model_loaded": current_model_file is not None,
        "model_file": current_model_file
    }
import asyncio
import traceback
import uuid
from fastapi import FastAPI, UploadFile, File, Form
from pydantic import BaseModel
import joblib
import os
import pandas as pd
import json
import time

from predict import predict_with_confidence
from insights import generate_insights_from_df
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


from fastapi import FastAPI, UploadFile, File, Form, HTTPException
import pandas as pd
import os, json, time, joblib, traceback
from typing import Dict

@app.post("/train")
async def train(
    file: UploadFile = File(...),
    model_type: str = Form(...),
    features: str = Form(None),
    target: str = Form(None)
):
    global model, current_model_file

    try:
        # ============================
        # 📂 SAVE FILE (UNIQUE NAME)
        # ============================
        unique_name = f"{uuid.uuid4()}_{file.filename}"
        file_path = os.path.join(DATASET_DIR, unique_name)

        # ✅ stream-safe read
        content = await file.read()

        if not content:
            raise HTTPException(status_code=400, detail="Uploaded file is empty")

        with open(file_path, "wb") as buffer:
            buffer.write(content)

        print("📁 File saved:", file_path)
        print("📦 Size:", len(content))

        # ============================
        # 📊 LOAD CSV (ROBUST)
        # ============================
        try:
            df = pd.read_csv(file_path, encoding="utf-8")
        except:
            try:
                df = pd.read_csv(file_path, encoding="latin1")
            except Exception as e:
                raise HTTPException(
                    status_code=400,
                    detail=f"CSV parsing failed: {str(e)}"
                )

        # ✅ clean columns
        df.columns = df.columns.str.strip()

        if df.empty:
            raise HTTPException(status_code=400, detail="CSV has no data")

        print("📊 Shape:", df.shape)

        # ============================
        # 🔥 PARSE FEATURES
        # ============================
        if features:
            try:
                features = json.loads(features)
                if not isinstance(features, list):
                    raise ValueError("Features must be array")
            except Exception as e:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid features format: {str(e)}"
                )

        print("📊 Features:", features)
        print("🎯 Target:", target)

        # ============================
        # 🚀 TRAIN (NON-BLOCKING FIX)
        # ============================
        result = await asyncio.to_thread(
            train_model,
            df,
            model_type,
            features,
            target
        )

        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])

        # ============================
        # 💾 SAVE MODEL
        # ============================
        timestamp = int(time.time())

        model_filename = f"{model_type}_{timestamp}.pkl"
        model_file_path = os.path.join(MODEL_DIR, model_filename)

        joblib.dump({
            "model": result.get("model_obj"),
            "features": result.get("features"),
            "target": result.get("target"),
            "created_at": timestamp
        }, model_file_path)

        print("💾 Model saved:", model_file_path)

        # ============================
        # 🔥 LOAD INTO MEMORY
        # ============================
        model = result.get("model_obj")
        current_model_file = model_file_path

        # ============================
        # 🧹 CLEANUP FILE (IMPORTANT)
        # ============================
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
        return {"error": e.detail}

    except Exception as e:
        print("❌ TRAIN ERROR:", str(e))
        print(traceback.format_exc())

        return {
            "error": str(e),
            "trace": traceback.format_exc()
        }

# ============================
# 🔮 PREDICT API (SAFE)
# ============================
@app.post("/predict")
def predict(data: Dict[str, float]):
    global current_model_file

    try:
        if current_model_file is None:
            raise HTTPException(status_code=400, detail="No model trained yet")

        print("📥 Incoming data:", data)
        print("📁 Using model:", current_model_file)

        result = predict_with_confidence(current_model_file, data)

        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])

        return {
            "status": "success",
            "prediction": result["prediction"],
            "confidence": result["confidence"],
            "range": result["range"]
        }

    except HTTPException as e:
        return {"error": e.detail}

    except Exception as e:
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
@app.post("/insights")
async def insights(file: UploadFile = File(...)):
    import pandas as pd

    df = pd.read_csv(file.file)

    return generate_insights_from_df(df)


# ==============================
# EXTRA: FEATURE IMPORTANCE
# ==============================
@app.get("/feature-importance")
def feature_importance():
    import os
    import joblib

    global current_model_file

    try:
        # ❌ Do NOT rely on global model (Render resets it)
        if current_model_file is None:
            return {"error": "No trained model available"}

        if not os.path.exists(current_model_file):
            return {"error": "Model file not found"}

        # ✅ Always load fresh
        loaded = joblib.load(current_model_file)

        model_obj = loaded.get("model")
        features = loaded.get("features")

        # 🚨 Safety checks
        if model_obj is None:
            return {"error": "Model is None"}

        if not features:
            return {"error": "Features missing in model file"}

        # ❌ Not all models support importance
        if not hasattr(model_obj, "feature_importances_"):
            return {
                "error": "Feature importance not available for this model",
                "model_type": type(model_obj).__name__
            }

        importances = model_obj.feature_importances_

        # ✅ Ensure same length
        if len(importances) != len(features):
            return {"error": "Feature mismatch with model"}

        result = [
            {"feature": f, "importance": float(i)}
            for f, i in zip(features, importances)
        ]

        # 🔥 Sort descending
        result = sorted(result, key=lambda x: x["importance"], reverse=True)

        return {
            "model_type": type(model_obj).__name__,
            "feature_importance": result
        }

    except Exception as e:
        import traceback
        return {
            "error": str(e),
            "trace": traceback.format_exc()
        }


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



from fastapi import FastAPI, UploadFile, File, Form
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
    model_type: str
    features: List[str]
    target: str


# ==============================
# 🥇 STEP 1: UPLOAD DATASET
# ==============================

@app.post("/upload-dataset")
def upload_dataset(file: UploadFile = File(...)):
    global current_dataset

    file_path = os.path.join(DATASET_PATH, file.filename)

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


MODEL_DIR = "models"
os.makedirs(MODEL_DIR, exist_ok=True)


@app.post("/train")
async def train(
    file: UploadFile = File(...),
    model_type: str = Form(...),
    features: str = Form(...),
    target: str = Form(...)
):
    try:
        # ✅ Convert features string → list
        features = json.loads(features)

        # ✅ Read file directly
        if file.filename.endswith(".csv"):
            df = pd.read_csv(file.file)
        elif file.filename.endswith(".xlsx"):
            df = pd.read_excel(file.file)
        else:
            return {"error": "Unsupported file format"}

        # ✅ Clean data
        df.columns = df.columns.str.strip()
        df = df.dropna()

        # ✅ Validate columns
        for col in features + [target]:
            if col not in df.columns:
                return {"error": f"Column '{col}' not found"}

        X = df[features]
        y = df[target]

        # 🔥 Model selection
        if model_type == "random_forest":
            from sklearn.ensemble import RandomForestRegressor
            model = RandomForestRegressor()
        elif model_type == "linear":
            from sklearn.linear_model import LinearRegression
            model = LinearRegression()
        else:
            return {"error": "Invalid model type"}

        # ✅ Train
        model.fit(X, y)

        # ✅ Save model
        model_path = os.path.join(MODEL_DIR, "model.pkl")

        joblib.dump({
            "model": model,
            "features": features
        }, model_path)

        return {
            "message": "Model trained successfully",
            "features_used": features,
            "target": target
        }

    except Exception as e:
        return {"error": str(e)}


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



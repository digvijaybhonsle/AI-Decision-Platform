import joblib
import numpy as np

import os 

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DATASET_PATH = os.path.join(BASE_DIR, "datasets")
MODEL_PATH = os.path.join(BASE_DIR, "models")

model = joblib.load(os.path.join(MODEL_PATH, "model.pkl"))

def predict_with_confidence(data):
    tree_predictions = np.array([
        tree.predict([data])[0] for tree in model.estimators_
    ])

    prediction = tree_predictions.mean()
    std_dev = tree_predictions.std()

    # ✅ Normalized confidence
    confidence = 1 - (std_dev / prediction)
    confidence = max(0, min(1, confidence))

    lower = prediction - std_dev
    upper = prediction + std_dev

    return {
        "prediction": float(prediction),
        "confidence": float(confidence),
        "range": {
            "min": float(lower),
            "max": float(upper)
        }
    }
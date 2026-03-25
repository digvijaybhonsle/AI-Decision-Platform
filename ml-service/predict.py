import joblib
import numpy as np
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "models")


def load_model(model_file):
    if not os.path.exists(model_file):
        raise FileNotFoundError(f"Model not found: {model_file}")
    
    return joblib.load(model_file)


def predict_with_confidence(model_file, input_data: dict):
    """
    model_file → path of saved model
    input_data → dict of feature values
    """

    try:
        loaded = load_model(model_file)

        model = loaded["model"]
        features = loaded["features"]

        # ✅ Validate input
        missing = [f for f in features if f not in input_data]
        if missing:
            return {"error": f"Missing features: {missing}"}

        # ✅ Prepare ordered input
        values = [input_data[f] for f in features]
        values = np.array(values).reshape(1, -1)

        # ✅ Predict
        prediction = model.predict(values)[0]

        # ============================
        # 🌲 RANDOM FOREST CASE
        # ============================
        if hasattr(model, "estimators_"):
            tree_predictions = np.array([
                tree.predict(values)[0] for tree in model.estimators_
            ])

            std_dev = tree_predictions.std()

            # Safe confidence
            if prediction != 0:
                confidence = 1 - (std_dev / abs(prediction))
            else:
                confidence = 0.5  # fallback

            confidence = max(0, min(1, confidence))

            lower = prediction - std_dev
            upper = prediction + std_dev

        # ============================
        # 📈 LINEAR / LOGISTIC CASE
        # ============================
        else:
            std_dev = 0
            confidence = 0.8  # fallback confidence
            lower = prediction
            upper = prediction

        return {
            "prediction": float(prediction),
            "confidence": float(confidence),
            "range": {
                "min": float(lower),
                "max": float(upper)
            }
        }

    except Exception as e:
        import traceback
        return {
            "error": str(e),
            "trace": traceback.format_exc()
        }
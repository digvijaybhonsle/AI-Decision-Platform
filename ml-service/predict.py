import joblib
import numpy as np
import os
import traceback

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


def load_model(model_file):
    """Load model with robust path handling"""
    if not os.path.isabs(model_file):
        model_file = os.path.join(BASE_DIR, model_file)

    if not os.path.exists(model_file):
        raise FileNotFoundError(f"Model not found: {model_file}")

    loaded = joblib.load(model_file)

    if not isinstance(loaded, dict):
        raise ValueError("Invalid model file format")

    if "model" not in loaded or "features" not in loaded:
        raise ValueError("Model file missing required keys: 'model' or 'features'")

    return loaded


def predict_with_confidence(model_file, input_data: dict):
    try:
        loaded = load_model(model_file)
        model = loaded.get("model")
        features = loaded.get("features") or []

        if not features:
            return {"error": "No features found in trained model"}

        if not isinstance(features, list):
            return {"error": "Features list is invalid"}

        # ============================
        # ✅ VALIDATION
        # ============================
        missing = [f for f in features if f not in input_data]
        if missing:
            return {
                "error": f"Missing required features: {missing}",
                "required_features": features
            }

        extra = [f for f in input_data if f not in features]
        if extra:
            print(f"Warning: Extra features ignored: {extra}")

        # ============================
        # 🔥 CONVERT TO CORRECT ORDER
        # ============================
        try:
            values = [float(input_data[f]) for f in features]
        except (ValueError, TypeError) as e:
            return {"error": f"Invalid numeric value for features: {str(e)}"}

        values = np.array(values).reshape(1, -1)

        # ============================
        # ✅ MAKE PREDICTION
        # ============================
        prediction = model.predict(values)[0]

        # ============================
        # 🌲 CONFIDENCE CALCULATION
        # ============================
        if hasattr(model, "estimators_"):  # Tree-based models (RandomForest, etc.)
            try:
                tree_predictions = np.array([
                    tree.predict(values)[0] for tree in model.estimators_
                ])
                std_dev = tree_predictions.std()
                confidence = max(0.0, min(1.0, 1 - (std_dev / (abs(prediction) + 1e-8))))
                lower = float(prediction - std_dev)
                upper = float(prediction + std_dev)
            except Exception:
                confidence = 0.75
                lower = upper = float(prediction)
        else:
            # Linear models or others
            confidence = 0.80
            lower = upper = float(prediction)

        return {
            "prediction": float(prediction),
            "confidence": float(confidence),
            "range": {"min": lower, "max": upper},
            "features_used": features,           # ← This is what frontend needs
            "model_type": type(model).__name__
        }

    except FileNotFoundError as e:
        return {"error": str(e)}
    except Exception as e:
        print("❌ Error in predict_with_confidence:")
        print(traceback.format_exc())
        return {
            "error": f"Prediction failed: {str(e)}",
            "trace": traceback.format_exc()
        }
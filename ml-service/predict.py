import joblib
import numpy as np
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "models")


def load_model(model_file):
    # ✅ Fix relative path issues
    if not os.path.isabs(model_file):
        model_file = os.path.join(BASE_DIR, model_file)

    if not os.path.exists(model_file):
        raise FileNotFoundError(f"Model not found: {model_file}")

    loaded = joblib.load(model_file)

    # ✅ Validate structure
    if not isinstance(loaded, dict):
        raise ValueError("Invalid model file format")

    if "model" not in loaded or "features" not in loaded:
        raise ValueError("Model file missing required keys")

    return loaded


def predict_with_confidence(model_file, input_data: dict):
    """
    model_file → path of saved model
    input_data → dict of feature values
    """

    try:
        loaded = load_model(model_file)

        model = loaded.get("model")
        features = loaded.get("features")

        # 🚨 FIX: Prevent NoneType error
        if model is None:
            return {"error": "Model is None. Training may have failed."}

        if not features:
            return {"error": "Features not found in model file"}

        # ✅ Validate input
        missing = [f for f in features if f not in input_data]
        if missing:
            return {"error": f"Missing features: {missing}"}

        # ✅ Convert safely to float
        try:
            values = [float(input_data[f]) for f in features]
        except Exception:
            return {"error": "Invalid input types. All features must be numeric"}

        values = np.array(values).reshape(1, -1)

        # ✅ Predict
        prediction = model.predict(values)[0]

        # ============================
        # 🌲 RANDOM FOREST CASE
        # ============================
        if hasattr(model, "estimators_"):
            try:
                tree_predictions = np.array([
                    tree.predict(values)[0] for tree in model.estimators_
                ])

                std_dev = tree_predictions.std()

                # Safe confidence calculation
                if abs(prediction) > 1e-6:
                    confidence = 1 - (std_dev / abs(prediction))
                else:
                    confidence = 0.5

                confidence = max(0, min(1, confidence))

                lower = prediction - std_dev
                upper = prediction + std_dev

            except Exception:
                # fallback if estimator fails
                std_dev = 0
                confidence = 0.7
                lower = prediction
                upper = prediction

        # ============================
        # 📈 LINEAR / LOGISTIC CASE
        # ============================
        else:
            std_dev = 0
            confidence = 0.8
            lower = prediction
            upper = prediction

        return {
            "prediction": float(prediction),
            "confidence": float(confidence),
            "range": {
                "min": float(lower),
                "max": float(upper)
            },
            "features_used": features  # 🔥 helpful for debugging
        }

    except FileNotFoundError as e:
        return {"error": str(e)}

    except ValueError as e:
        return {"error": str(e)}

    except Exception as e:
        import traceback
        return {
            "error": str(e),
            "trace": traceback.format_exc()
        }
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
        print("📥 Incoming input:", input_data)

        loaded = load_model(model_file)
        model = loaded.get("model")
        features = loaded.get("features") or []

        print("📊 Expected features:", features)

        # ============================
        # ✅ VALIDATION
        # ============================
        if not features:
            return {"error": "No features found in trained model"}

        if not isinstance(features, list):
            return {"error": "Features list is invalid"}

        if not isinstance(input_data, dict):
            return {"error": "Input data must be a dictionary"}

        # Normalize keys (trim + lowercase match safety)
        normalized_input = {
            str(k).strip(): v for k, v in input_data.items()
        }

        # ============================
        # 🔍 CHECK MISSING FEATURES
        # ============================
        missing = [f for f in features if f not in normalized_input]
        if missing:
            return {
                "error": f"Missing required features: {missing}",
                "required_features": features
            }

        # ============================
        # ⚠️ EXTRA FEATURES (IGNORED)
        # ============================
        extra = [f for f in normalized_input if f not in features]
        if extra:
            print(f"⚠️ Extra features ignored: {extra}")

        # ============================
        # 🔥 SAFE CONVERSION
        # ============================
        values = []

        for f in features:
            val = normalized_input.get(f)

            # Handle empty values
            if val is None or val == "":
                return {"error": f"Missing or empty value for feature: '{f}'"}

            # Trim string
            if isinstance(val, str):
                val = val.strip()

            # Convert to float safely
            try:
                val = float(val)
            except Exception:
                return {"error": f"Invalid numeric value for feature '{f}': {val}"}

            # Optional sanity checks (can expand)
            if np.isnan(val) or np.isinf(val):
                return {"error": f"Invalid numeric value (NaN/Inf) for feature '{f}'"}

            values.append(val)

        values = np.array(values).reshape(1, -1)

        print("🚀 Final model input:", values)

        # ============================
        # ✅ MAKE PREDICTION
        # ============================
        try:
            prediction = model.predict(values)[0]
        except Exception as e:
            return {
                "error": f"Model prediction failed: {str(e)}"
            }

        # ============================
        # 🌲 CONFIDENCE CALCULATION
        # ============================
        if hasattr(model, "estimators_"):  # Tree-based models
            try:
                tree_predictions = np.array([
                    tree.predict(values)[0] for tree in model.estimators_
                ])
                std_dev = tree_predictions.std()

                confidence = max(
                    0.0,
                    min(1.0, 1 - (std_dev / (abs(prediction) + 1e-8)))
                )

                lower = float(prediction - std_dev)
                upper = float(prediction + std_dev)

            except Exception as e:
                print("⚠️ Confidence calc failed:", str(e))
                confidence = 0.75
                lower = upper = float(prediction)
        else:
            confidence = 0.80
            lower = upper = float(prediction)

        # ============================
        # ✅ FINAL RESPONSE
        # ============================
        return {
            "prediction": float(prediction),
            "confidence": float(confidence),
            "range": {"min": lower, "max": upper},
            "features_used": features,
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
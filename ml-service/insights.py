import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler


def generate_insights_from_df(df):
    try:
        # =========================
        # CLEAN DATA
        # =========================
        df = df.copy()
        df.columns = df.columns.str.strip()

        for col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")

        df = df.dropna()

        numeric_cols = df.select_dtypes(include=["number"]).columns.tolist()

        if len(numeric_cols) < 2:
            return {"error": "Not enough numeric data"}

        # =========================
        # TARGET SELECTION
        # =========================
        variances = df[numeric_cols].var()
        target_col = variances.idxmax()

        X = df.drop(columns=[target_col])
        y = df[target_col]

        # =========================
        # MODEL TRAINING
        # =========================
        model = RandomForestRegressor(n_estimators=100, random_state=42)
        model.fit(X, y)

        # =========================
        # FEATURE IMPORTANCE
        # =========================
        importance = model.feature_importances_
        feature_importance = dict(zip(X.columns, importance))

        # sort
        feature_importance = dict(
            sorted(feature_importance.items(), key=lambda x: x[1], reverse=True)
        )

        # =========================
        # CORRELATION
        # =========================
        corr = df.corr()[target_col].drop(target_col)
        correlation = corr.to_dict()

        # =========================
        # SUMMARY
        # =========================
        summary = {
            "target": target_col,
            "mean": float(y.mean()),
            "max": float(y.max()),
            "min": float(y.min()),
        }

        # =========================
        # TREND
        # =========================
        trend_col = X.columns[0]

        trend = (
            df[[trend_col, target_col]]
            .sort_values(by=trend_col)
            .groupby(trend_col)[target_col]
            .mean()
            .reset_index()
            .head(20)
            .to_dict(orient="records")
        )

        # =========================
        # ML-BASED RECOMMENDATIONS
        # =========================
        recommendations = []

        top_feature = list(feature_importance.keys())[0]

        recommendations.append(
            f"'{top_feature}' has the highest impact on {target_col}"
        )

        high_corr = max(correlation, key=lambda k: abs(correlation[k]))
        recommendations.append(
            f"'{high_corr}' is strongly correlated with {target_col}"
        )

        if y.std() > y.mean() * 0.5:
            recommendations.append("High variance detected — stabilize inputs")

        recommendations.append("Focus on optimizing top features to improve outcome")

        return {
            "summary": summary,
            "trend": trend,
            "feature_importance": feature_importance,
            "correlation": correlation,
            "recommendations": recommendations,
        }

    except Exception as e:
        import traceback
        return {
            "error": str(e),
            "trace": traceback.format_exc(),
        }
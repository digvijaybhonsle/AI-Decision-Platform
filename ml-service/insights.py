import pandas as pd
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_PATH = os.path.join(BASE_DIR, "datasets")


def generate_insights_from_df(df):
    try:
        # =========================
        # 🧹 CLEAN DATA
        # =========================
        df = df.copy()
        df.columns = df.columns.str.strip()

        # convert possible numeric strings
        for col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")

        df = df.dropna()

        # =========================
        # 🔢 Numeric Columns
        # =========================
        numeric_cols = df.select_dtypes(include=["number"]).columns.tolist()

        if len(numeric_cols) < 2:
            return {"error": "Not enough numeric data for insights"}

        # =========================
        # 💰 Detect Spending Columns (SMARTER)
        # =========================
        spending_cols = [
            col for col in numeric_cols
            if any(k in col.lower() for k in ["mnt", "spend", "amount", "price"])
        ]

        # =========================
        # 🎯 Target Selection (SMART)
        # =========================
        if spending_cols:
            df["Total_Spending"] = df[spending_cols].sum(axis=1)
            target_col = "Total_Spending"

        elif "income" in [c.lower() for c in numeric_cols]:
            target_col = next(c for c in numeric_cols if c.lower() == "income")

        else:
            # fallback → highest variance column
            variances = df[numeric_cols].var()
            target_col = variances.idxmax()

        # =========================
        # 📊 Summary
        # =========================
        summary = {
            "columns_analyzed": numeric_cols,
            "target_used": target_col,
            "avg_target": float(df[target_col].mean()),
            "max_target": float(df[target_col].max()),
            "min_target": float(df[target_col].min()),
        }

        # =========================
        # 📈 Trend (BETTER)
        # =========================
        # choose x column intelligently
        x_col = None
        for col in numeric_cols:
            if col != target_col:
                x_col = col
                break

        trend = (
            df[[x_col, target_col]]
            .sort_values(by=x_col)
            .groupby(x_col)[target_col]
            .mean()
            .reset_index()
            .head(20)
        )

        trend_data = trend.to_dict(orient="records")

        # =========================
        # 📊 Distribution (NORMALIZED)
        # =========================
        distribution_raw = df[numeric_cols].sum()

        # normalize to % (better UI)
        total = distribution_raw.sum()
        distribution = {
            col: float((val / total) * 100) if total != 0 else 0
            for col, val in distribution_raw.items()
        }

        # =========================
        # 💡 Recommendations (SMARTER)
        # =========================
        recommendations = []

        mean_val = df[target_col].mean()
        median_val = df[target_col].median()
        std_val = df[target_col].std()

        if mean_val < median_val:
            recommendations.append("Performance is skewed — improve consistency")

        if std_val > mean_val * 0.5:
            recommendations.append("High variability detected — stabilize operations")

        if spending_cols:
            top_spend = max(spending_cols, key=lambda c: df[c].mean())
            recommendations.append(f"Focus more on {top_spend} category")

        if mean_val > 0 and std_val < mean_val * 0.2:
            recommendations.append("Stable growth observed — scale strategy")

        if not recommendations:
            recommendations.append("Data looks stable — maintain current strategy")

        return {
            "summary": summary,
            "trend": trend_data,
            "distribution": distribution,
            "recommendations": recommendations,
        }

    except Exception as e:
        import traceback
        return {
            "error": str(e),
            "trace": traceback.format_exc(),
        }
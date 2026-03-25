import pandas as pd
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_PATH = os.path.join(BASE_DIR, "datasets")


def generate_insights(file_path: str):
    try:
        # 📂 Load dataset dynamically
        if file_path.endswith(".csv"):
            df = pd.read_csv(file_path)
        else:
            df = pd.read_excel(file_path)

        df.columns = df.columns.str.strip()
        df = df.dropna()

        print("📊 Columns:", df.columns.tolist())

        # =========================
        # 🔢 Numeric Columns
        # =========================
        numeric_cols = df.select_dtypes(include=['number']).columns.tolist()

        if len(numeric_cols) < 2:
            return {"error": "Not enough numeric data for insights"}

        # =========================
        # 💰 Detect Spending Columns
        # =========================
        spending_cols = [col for col in df.columns if "mnt" in col.lower() or "spend" in col.lower()]

        if spending_cols:
            df["Total_Spending"] = df[spending_cols].sum(axis=1)
            target_col = "Total_Spending"
        else:
            # fallback → last numeric column
            target_col = numeric_cols[-1]

        # =========================
        # 📊 Summary
        # =========================
        summary = {
            "columns_analyzed": numeric_cols,
            "target_used": target_col,
            "avg_target": float(df[target_col].mean()),
            "max_target": float(df[target_col].max()),
            "min_target": float(df[target_col].min())
        }

        # =========================
        # 📈 Trend (auto select X axis)
        # =========================
        x_col = numeric_cols[0] if numeric_cols[0] != target_col else numeric_cols[1]

        trend = (
            df.groupby(x_col)[target_col]
            .mean()
            .reset_index()
            .head(20)
        )

        trend_data = trend.to_dict(orient="records")

        # =========================
        # 📊 Distribution
        # =========================
        distribution = df[numeric_cols].sum().to_dict()

        # =========================
        # 💡 Recommendations (dynamic)
        # =========================
        recommendations = []

        if df[target_col].mean() < df[target_col].median():
            recommendations.append("Target strategies to improve overall performance")

        if df[target_col].std() > df[target_col].mean() * 0.5:
            recommendations.append("High variability detected — stabilize operations")

        if spending_cols:
            recommendations.append("Focus on high-performing product categories")

        if not recommendations:
            recommendations.append("Data looks stable — maintain current strategy")

        return {
            "summary": summary,
            "trend": trend_data,
            "distribution": distribution,
            "recommendations": recommendations
        }

    except Exception as e:
        import traceback
        return {
            "error": str(e),
            "trace": traceback.format_exc()
        }
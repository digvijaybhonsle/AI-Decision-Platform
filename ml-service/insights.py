import pandas as pd
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DATASET_PATH = os.path.join(BASE_DIR, "datasets")
MODEL_PATH = os.path.join(BASE_DIR, "models")

def generate_insights():
    df = pd.read_excel(os.path.join(DATASET_PATH, "marketing_campaign.xlsx"))
    df.columns = df.columns.str.strip()
    df = df.dropna()

    # Total Spending
    df['Total_Spending'] = (
        df['MntWines'] +
        df['MntFruits'] +
        df['MntMeatProducts'] +
        df['MntFishProducts'] +
        df['MntSweetProducts'] +
        df['MntGoldProds']
    )

    # 📊 Summary
    summary = {
        "avg_income": df['Income'].mean(),
        "avg_spending": df['Total_Spending'].mean()
    }

    # 📈 Income vs Spending trend
    trend = df.groupby('Income')['Total_Spending'].mean().reset_index()

    trend_data = trend.head(20).to_dict(orient="records")

    # 📊 Distribution (for pie chart)
    distribution = df[['MntWines','MntFruits','MntMeatProducts']].sum().to_dict()

    # 💡 Recommendations
    recommendations = []

    if summary["avg_income"] > 50000:
        recommendations.append("Target high-income customers for premium products")

    if summary["avg_spending"] < 1000:
        recommendations.append("Increase marketing efforts to boost spending")

    return {
        "summary": summary,
        "trend": trend_data,
        "distribution": distribution,
        "recommendations": recommendations
    }
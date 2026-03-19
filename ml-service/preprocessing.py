import pandas as pd

def preprocess_data(df):
    # Drop useless columns
    df = df.drop(['ID'], axis=1, errors='ignore')

    # Create target column
    df['Total_Spending'] = (
        df['MntWines'] +
        df['MntFruits'] +
        df['MntMeatProducts'] +
        df['MntFishProducts'] +
        df['MntSweetProducts'] +
        df['MntGoldProds']
    )

    # Select features
    df = df[['Income', 'Kidhome', 'Teenhome', 'Recency', 'Total_Spending']]

    # Remove null values
    df = df.dropna()

    return df
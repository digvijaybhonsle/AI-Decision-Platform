import pandas as pd

def preprocess_data(df):
    df = df.copy()

    # Drop ID safely
    df = df.drop(['ID'], axis=1, errors='ignore')

    # Detect Mnt columns
    mnt_cols = [col for col in df.columns if col.lower().startswith('mnt')]

    # ✅ Only create if NOT exists
    if 'Total_Spending' not in df.columns:
        if mnt_cols:
            df['Total_Spending'] = df[mnt_cols].sum(axis=1)
        else:
            return df  # no forced column

    # Keep only numeric
    numeric_cols = df.select_dtypes(include=['int64', 'float64']).columns.tolist()

    df = df[numeric_cols]

    # Drop nulls
    df = df.dropna()

    return df
import pandas as pd

def preprocess_data(df):
    df = df.copy()

    # Drop ID
    df = df.drop(['ID'], axis=1, errors='ignore')

    # 🔥 Convert everything possible to numeric
    for col in df.columns:
        df[col] = pd.to_numeric(df[col], errors='ignore')

    # Detect Mnt columns
    mnt_cols = [col for col in df.columns if col.lower().startswith('mnt')]

    # Create target if not exists
    if 'Total_Spending' not in df.columns and mnt_cols:
        df['Total_Spending'] = df[mnt_cols].sum(axis=1)

    # Keep only numeric
    df = df.select_dtypes(include=['number'])

    # Drop nulls
    df = df.dropna()

    return df
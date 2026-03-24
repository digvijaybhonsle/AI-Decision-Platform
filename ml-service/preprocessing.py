import pandas as pd

def preprocess_data(df):
    """
    Dynamic preprocessing:
    - Drops 'ID' column if exists
    - Creates 'Total_Spending' from all columns starting with 'Mnt'
    - Automatically selects all numeric features and the target
    - Drops null values
    """
    # Drop 'ID' if present
    df = df.drop(['ID'], axis=1, errors='ignore')

    # Identify all columns starting with 'Mnt' dynamically
    mnt_cols = [col for col in df.columns if col.lower().startswith('mnt')]
    if mnt_cols:
        df['Total_Spending'] = df[mnt_cols].sum(axis=1)
    else:
        df['Total_Spending'] = 0  # fallback if no 'Mnt*' columns

    # Select numeric features dynamically
    numeric_cols = df.select_dtypes(include=['int64', 'float64']).columns.tolist()

    # Ensure 'Total_Spending' is included
    if 'Total_Spending' not in numeric_cols:
        numeric_cols.append('Total_Spending')

    df = df[numeric_cols]

    # Drop rows with nulls
    df = df.dropna()

    return df
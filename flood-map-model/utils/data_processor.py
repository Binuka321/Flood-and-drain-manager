import pandas as pd
import numpy as np
from typing import Tuple, List
import os

class DataProcessor:

    @staticmethod
    def load_csv(filepath: str) -> pd.DataFrame:
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"File not found: {filepath}")
        return pd.read_csv(filepath)

    @staticmethod
    def validate_dataset(df: pd.DataFrame, required_columns: List[str] = None) -> Tuple[bool, str]:
        if df is None or df.empty:
            return False, "Dataset is empty"

        if required_columns:
            missing_cols = [col for col in required_columns if col not in df.columns]
            if missing_cols:
                return False, f"Missing required columns: {missing_cols}"

        if df.isnull().any().any():
            return False, "Dataset contains null values"

        return True, "Dataset is valid"

    # 🔥 FIXED FUNCTION (VERY IMPORTANT)
    @staticmethod
    def preprocess_data(df: pd.DataFrame, target_column: str, drop_columns: List[str] = None):

        df = df.copy()

        if drop_columns:
            df = df.drop(columns=[col for col in drop_columns if col in df.columns])

        if target_column not in df.columns:
            raise ValueError(f"Target column '{target_column}' not found")

        y = df[target_column]
        X = df.drop(columns=[target_column])

        # 🔥 KEEP ONLY NUMERIC FEATURES
        X = X.select_dtypes(include=["number"])

        # 🔥 HANDLE MISSING VALUES
        X = X.fillna(0)

        # 🔥 FORCE FLOAT
        X = X.astype(float)

        return X, y

    @staticmethod
    def split_datasets(rainfall_df: pd.DataFrame, flood_df: pd.DataFrame):

        merged_df = pd.merge(
            rainfall_df,
            flood_df,
            on=['location', 'month'],
            how='inner'
        )

        if merged_df.empty:
            raise ValueError("No matching records between datasets")

        return merged_df

    @staticmethod
    def create_features(df: pd.DataFrame):

        df = df.copy()

        if 'rainfall' in df.columns:
            df['rainfall_moving_avg'] = df.groupby('location')['rainfall'].transform(
                lambda x: x.rolling(window=3, min_periods=1).mean()
            )

            df['rainfall_deviation'] = df.groupby('location')['rainfall'].transform(
                lambda x: (x - x.mean()) / (x.std() if x.std() != 0 else 1)
            )

        return df

    @staticmethod
    def encode_target(y: pd.Series):

        mapping = {val: idx for idx, val in enumerate(sorted(y.unique()))}
        y_encoded = y.map(mapping)

        return y_encoded.astype(int), mapping
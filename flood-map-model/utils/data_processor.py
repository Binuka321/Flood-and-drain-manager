import pandas as pd
import numpy as np
from typing import Tuple, List
import os

class DataProcessor:
    """
    Data processing utilities for flood prediction
    """
    
    @staticmethod
    def load_csv(filepath: str) -> pd.DataFrame:
        """
        Load CSV file
        
        Args:
            filepath: Path to CSV file
            
        Returns:
            DataFrame
        """
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"File not found: {filepath}")
        
        return pd.read_csv(filepath)
    
    @staticmethod
    def validate_dataset(df: pd.DataFrame, required_columns: List[str] = None) -> Tuple[bool, str]:
        """
        Validate dataset
        
        Args:
            df: DataFrame to validate
            required_columns: List of required column names
            
        Returns:
            Tuple of (is_valid, message)
        """
        if df is None or df.empty:
            return False, "Dataset is empty"
        
        if required_columns:
            missing_cols = [col for col in required_columns if col not in df.columns]
            if missing_cols:
                return False, f"Missing required columns: {missing_cols}"
        
        # Check for null values
        null_counts = df.isnull().sum()
        if null_counts.any():
            null_info = null_counts[null_counts > 0].to_dict()
            return False, f"Dataset contains null values: {null_info}"
        
        return True, "Dataset is valid"
    
    @staticmethod
    def preprocess_data(df: pd.DataFrame, target_column: str, drop_columns: List[str] = None) -> Tuple[pd.DataFrame, pd.Series]:
        """
        Preprocess data for model training
        
        Args:
            df: Input DataFrame
            target_column: Name of target column
            drop_columns: Columns to drop before training
            
        Returns:
            Tuple of (X, y)
        """
        df = df.copy()
        
        # Drop specified columns
        if drop_columns:
            df = df.drop(columns=[col for col in drop_columns if col in df.columns])
        
        # Separate features and target
        if target_column not in df.columns:
            raise ValueError(f"Target column '{target_column}' not found in dataset")
        
        y = df[target_column]
        X = df.drop(columns=[target_column])
        
        # Handle categorical variables
        X = pd.get_dummies(X, drop_first=True)
        
        # Ensure numeric types
        X = X.astype(float)
        
        return X, y
    
    @staticmethod
    def split_datasets(rainfall_df: pd.DataFrame, flood_impact_df: pd.DataFrame) -> pd.DataFrame:
        """
        Combine and prepare rainfall and flood impact datasets
        
        Args:
            rainfall_df: Rainfall dataset (with location, month, rainfall)
            flood_impact_df: Flood impact dataset (with location, impact/risk_level)
            
        Returns:
            Combined DataFrame
        """
        # Merge datasets on location
        merged_df = pd.merge(
            rainfall_df,
            flood_impact_df,
            on=['location', 'month'],
            how='inner'
        )
        
        if merged_df.empty:
            raise ValueError("No matching records between datasets. Check location and month columns.")
        
        return merged_df
    
    @staticmethod
    def create_features(df: pd.DataFrame) -> pd.DataFrame:
        """
        Create additional features from raw data
        
        Args:
            df: DataFrame with at least rainfall data
            
        Returns:
            DataFrame with engineered features
        """
        df = df.copy()
        
        # Example feature engineering
        if 'rainfall' in df.columns:
            # Moving average (if data is grouped by location)
            df['rainfall_moving_avg'] = df.groupby('location')['rainfall'].transform(
                lambda x: x.rolling(window=3, min_periods=1).mean()
            )
            
            # Rainfall anomaly
            df['rainfall_deviation'] = df.groupby('location')['rainfall'].transform(
                lambda x: (x - x.mean()) / x.std()
            )
        
        return df
    
    @staticmethod
    def encode_target(y: pd.Series, mapping: dict = None) -> Tuple[pd.Series, dict]:
        """
        Encode target variable to numeric
        
        Args:
            y: Target variable
            mapping: Optional custom mapping
            
        Returns:
            Tuple of (encoded_y, mapping)
        """
        if mapping is None:
            unique_values = sorted(y.unique())
            mapping = {val: idx for idx, val in enumerate(unique_values)}
        
        y_encoded = y.map(mapping)
        
        if y_encoded.isnull().any():
            raise ValueError("Some target values could not be encoded")
        
        return y_encoded.astype(int), mapping
    
    @staticmethod
    def get_summary_stats(df: pd.DataFrame) -> dict:
        """
        Get summary statistics of dataset
        
        Args:
            df: DataFrame
            
        Returns:
            Dictionary with summary stats
        """
        return {
            'rows': len(df),
            'columns': len(df.columns),
            'column_names': df.columns.tolist(),
            'dtypes': df.dtypes.astype(str).to_dict(),
            'null_counts': df.isnull().sum().to_dict(),
            'numeric_summary': df.describe().to_dict() if len(df.select_dtypes(include=[np.number]).columns) > 0 else {}
        }

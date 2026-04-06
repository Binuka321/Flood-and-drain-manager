"""
Data Loader - Utility for loading and preparing datasets from CSV files
"""

import os
import pandas as pd
from utils.data_processor import DataProcessor

class DataLoader:
    """Load and prepare datasets from CSV files"""
    
    @staticmethod
    def load_rainfall_csv(filepath):
        """
        Load rainfall data from CSV
        Expected columns: location, month, rainfall, latitude, longitude
        """
        df = pd.read_csv(filepath)
        processor = DataProcessor()
        
        is_valid, msg = processor.validate_dataset(df)
        if not is_valid:
            raise ValueError(f"Invalid rainfall data: {msg}")
        
        return df
    
    @staticmethod
    def load_flood_impact_csv(filepath):
        """
        Load flood impact data from CSV
        Expected columns: location, month, risk_level OR flood_events
        """
        df = pd.read_csv(filepath)
        processor = DataProcessor()
        
        is_valid, msg = processor.validate_dataset(df)
        if not is_valid:
            raise ValueError(f"Invalid flood impact data: {msg}")
        
        return df
    
    @staticmethod
    def create_sample_csvs(data_dir='./data/datasets'):
        """Create sample CSV files for testing"""
        os.makedirs(data_dir, exist_ok=True)
        
        # Sample rainfall data
        rainfall_df = pd.DataFrame({
            'location': ['Colombo', 'Colombo', 'Colombo', 'Anuradhapura', 'Anuradhapura', 'Anuradhapura'],
            'month': [1, 2, 3, 1, 2, 3],
            'rainfall': [125.3, 98.7, 145.2, 145.2, 98.7, 165.2],
            'latitude': [6.9271, 6.9271, 6.9271, 8.3114, 8.3114, 8.3114],
            'longitude': [80.7789, 80.7789, 80.7789, 80.4037, 80.4037, 80.4037]
        })
        
        # Sample flood impact data
        flood_df = pd.DataFrame({
            'location': ['Colombo', 'Colombo', 'Colombo', 'Anuradhapura', 'Anuradhapura', 'Anuradhapura'],
            'month': [1, 2, 3, 1, 2, 3],
            'risk_level': ['Low', 'Low', 'Moderate', 'Moderate', 'Low', 'Moderate'],
            'flood_events': [0, 0, 1, 1, 0, 1]
        })
        
        rainfall_path = os.path.join(data_dir, 'rainfall_data.csv')
        flood_path = os.path.join(data_dir, 'flood_impact_data.csv')
        
        rainfall_df.to_csv(rainfall_path, index=False)
        flood_df.to_csv(flood_path, index=False)
        
        return rainfall_path, flood_path

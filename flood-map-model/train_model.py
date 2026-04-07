#!/usr/bin/env python3
"""
Training script to train the ML model with district-level flood and rainfall forecast datasets.
Uses `sri_lanka_flood_dataset_district.csv` and `sri_lanka_rainfall_forecast_district.csv` if available.
"""

import pandas as pd
import numpy as np
import os
import sys
import json
from datetime import datetime
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from models.flood_model import FloodPredictionModel

def load_training_data(flood_csv_path, forecast_csv_path):
    """Load and prepare training data from the district-level flood and rainfall forecast CSVs."""
    print(f"📂 Loading flood dataset from: {flood_csv_path}")
    print(f"📂 Loading rainfall forecast dataset from: {forecast_csv_path}")

    flood_df = pd.read_csv(flood_csv_path, parse_dates=['timestamp'])
    forecast_df = pd.read_csv(forecast_csv_path, parse_dates=['timestamp'])

    print(f"✓ Loaded {len(flood_df)} flood records")
    print(f"✓ Loaded {len(forecast_df)} forecast records")

    if 'district' not in flood_df.columns:
        raise ValueError("Flood dataset must contain a 'district' column")
    if 'district' not in forecast_df.columns:
        raise ValueError("Rainfall forecast dataset must contain a 'district' column")
    if 'timestamp' not in flood_df.columns or 'timestamp' not in forecast_df.columns:
        raise ValueError("Both datasets must contain a 'timestamp' column")

    combined = pd.merge(
        flood_df,
        forecast_df,
        on=['timestamp', 'district'],
        how='inner',
        suffixes=('', '_forecast')
    )

    if combined.empty:
        raise ValueError('Merged dataset is empty. Check timestamp and district alignment.')

    if 'location' not in combined.columns:
        combined['location'] = combined['district']

    print(f"✓ Merged dataset contains {len(combined)} records")

    print(f"\n📊 Data Overview:")
    print(f"   - Columns: {', '.join(combined.columns.tolist())}")
    print(f"   - Date range: {combined['timestamp'].min()} to {combined['timestamp'].max()}")
    print(f"   - Districts: {combined['district'].nunique()} unique")
    print(f"   - Risk levels: {combined['risk_level'].unique().tolist()}")

    return combined

def prepare_features_and_labels(df):
    """Prepare features and labels for training"""
    print(f"\n🔧 Preparing features and labels...")
    
    # Map risk levels to numeric values
    risk_mapping = {'Low': 0, 'Medium': 1, 'High': 2, 'Very High': 3}
    df['risk_numeric'] = df['risk_level'].map(risk_mapping)
    
    # Select features for the model. Use forecast rainfall as the main input
    feature_columns = [
        'predicted_rainfall_mm',
        'latitude',
        'longitude',
        'water_level_m',
        'flow_rate_m3s',
        'elevation_m',
        'historical_risk'
    ]
    
    # Validate feature availability
    missing = [col for col in feature_columns if col not in df.columns]
    if missing:
        raise ValueError(f"Missing required feature columns: {missing}")

    X = df[feature_columns]
    y = df['risk_numeric']
    
    print(f"   ✓ Features: {feature_columns}")
    print(f"   ✓ Target: risk_level (numeric)")
    print(f"   ✓ X shape: {X.shape}")
    print(f"   ✓ y shape: {y.shape}")
    
    # Data statistics
    print(f"\n📈 Feature Statistics:")
    for col in feature_columns:
        print(f"   - {col}: min={df[col].min():.2f}, max={df[col].max():.2f}, mean={df[col].mean():.2f}")
    
    print(f"\n🎯 Target Distribution:")
    for risk_level, count in df['risk_level'].value_counts().items():
        percentage = (count / len(df)) * 100
        print(f"   - {risk_level}: {count} ({percentage:.1f}%)")
    
    return X, y, feature_columns

def train_random_forest(X, y):
    """Train Random Forest model"""
    print(f"\n🌲 Training Random Forest model...")
    
    model = FloodPredictionModel(model_type='random_forest')
    metrics = model.train(X, y, test_size=0.2)
    
    print(f"   ✓ Model trained")
    print(f"   ✓ Training Accuracy: {metrics['train_accuracy']:.4f}")
    print(f"   ✓ Test Accuracy: {metrics['test_accuracy']:.4f}")
    print(f"   ✓ Precision: {metrics['precision']:.4f}")
    print(f"   ✓ Recall: {metrics['recall']:.4f}")
    
    # Save model
    model.save('random_forest')
    
    return model, metrics['test_accuracy'], model.model.feature_importances_

def train_gradient_boosting(X, y):
    """Train Gradient Boosting model"""
    print(f"\n📈 Training Gradient Boosting model...")
    
    model = FloodPredictionModel(model_type='gradient_boosting')
    metrics = model.train(X, y, test_size=0.2)
    
    print(f"   ✓ Model trained")
    print(f"   ✓ Training Accuracy: {metrics['train_accuracy']:.4f}")
    print(f"   ✓ Test Accuracy: {metrics['test_accuracy']:.4f}")
    print(f"   ✓ Precision: {metrics['precision']:.4f}")
    print(f"   ✓ Recall: {metrics['recall']:.4f}")
    
    # Save model
    model.save('gradient_boosting')
    
    return model, metrics['test_accuracy'], model.model.feature_importances_

def save_models(rf_model, gb_model, output_dir):
    """Models are already saved by the train function"""
    print(f"\n💾 Models already saved during training")
    print(f"   ✓ Random Forest model saved")
    print(f"   ✓ Gradient Boosting model saved")

def generate_training_report(rf_model, gb_model, rf_metrics, gb_metrics, rf_importance, gb_importance, 
                            feature_columns, df, output_dir):
    """Generate training report and save as JSON"""
    print(f"\n📑 Generating training report...")
    
    rf_score = rf_metrics['test_accuracy']
    gb_score = gb_metrics['test_accuracy']
    
    report = {
        "timestamp": datetime.now().isoformat(),
        "training_data": {
            "total_records": len(df),
            "date_range": {
                "start": str(df['timestamp'].min()),
                "end": str(df['timestamp'].max())
            },
            "locations": int(df['location_id'].nunique()),
            "risk_distribution": df['risk_level'].value_counts().to_dict()
        },
        "models": {
            "random_forest": {
                "type": "Random Forest",
                "train_accuracy": float(rf_metrics.get('train_accuracy', 0)),
                "test_accuracy": float(rf_score),
                "precision": float(rf_metrics.get('precision', 0)),
                "recall": float(rf_metrics.get('recall', 0)),
                "f1_score": float(rf_metrics.get('f1_score', 0)),
                "hyperparameters": {
                    "n_estimators": 100,
                    "max_depth": 15,
                    "min_samples_split": 5,
                    "random_state": 42
                },
                "feature_importance": {
                    feature_columns[i]: float(rf_importance[i])
                    for i in range(len(feature_columns))
                }
            },
            "gradient_boosting": {
                "type": "Gradient Boosting",
                "train_accuracy": float(gb_metrics.get('train_accuracy', 0)),
                "test_accuracy": float(gb_score),
                "precision": float(gb_metrics.get('precision', 0)),
                "recall": float(gb_metrics.get('recall', 0)),
                "f1_score": float(gb_metrics.get('f1_score', 0)),
                "hyperparameters": {
                    "n_estimators": 100,
                    "learning_rate": 0.1,
                    "max_depth": 5,
                    "random_state": 42
                },
                "feature_importance": {
                    feature_columns[i]: float(gb_importance[i])
                    for i in range(len(feature_columns))
                }
            }
        },
        "features": feature_columns,
        "risk_levels": ["Low (0)", "Medium (1)", "High (2)", "Very High (3)"],
        "training_statistics": {
            "best_model": "gradient_boosting" if gb_score > rf_score else "random_forest",
            "best_model_accuracy": float(max(rf_score, gb_score)),
            "random_forest_accuracy": float(rf_score),
            "gradient_boosting_accuracy": float(gb_score),
            "accuracy_difference": float(abs(rf_score - gb_score))
        }
    }
    
    report_path = os.path.join(output_dir, 'training_report.json')
    with open(report_path, 'w') as f:
        json.dump(report, f, indent=2)
    
    print(f"   ✓ Training report saved: {report_path}")
    
    # Print summary
    print(f"\n{'='*60}")
    print(f"📊 TRAINING SUMMARY")
    print(f"{'='*60}")
    print(f"Random Forest Test Accuracy:     {rf_score:.4f} ({rf_score*100:.2f}%)")
    print(f"  → Train Accuracy: {rf_metrics.get('train_accuracy', 0):.4f}")
    print(f"  → Precision: {rf_metrics.get('precision', 0):.4f}")
    print(f"  → Recall: {rf_metrics.get('recall', 0):.4f}")
    print(f"\nGradient Boosting Test Accuracy: {gb_score:.4f} ({gb_score*100:.2f}%)")
    print(f"  → Train Accuracy: {gb_metrics.get('train_accuracy', 0):.4f}")
    print(f"  → Precision: {gb_metrics.get('precision', 0):.4f}")
    print(f"  → Recall: {gb_metrics.get('recall', 0):.4f}")
    best = "Gradient Boosting" if gb_score > rf_score else "Random Forest"
    print(f"\n🏆 Best Model: {best}")
    print(f"{'='*60}\n")
    
    return report

def main():
    """Main training function"""
    print(f"🚀 Flood Prediction Model Training Script")
    print(f"{'='*60}\n")
    
    # Set paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(script_dir, 'data')
    models_dir = os.path.join(script_dir, 'models')
    
    # Load training data from the new district flood dataset and rainfall forecast dataset
    flood_csv = os.path.join(data_dir, 'sri_lanka_flood_dataset_district.csv')
    forecast_csv = os.path.join(data_dir, 'sri_lanka_rainfall_forecast_district.csv')
    fallback_csv = os.path.join(data_dir, 'flood_dataset_sample_v2.csv')

    if os.path.exists(flood_csv) and os.path.exists(forecast_csv):
        df = load_training_data(flood_csv, forecast_csv)
    elif os.path.exists(fallback_csv):
        print(f"⚠️ New dataset files not found, falling back to legacy dataset: {fallback_csv}")
        df = pd.read_csv(fallback_csv)
    else:
        print(f"❌ Error: Training data not found. Expected either:")
        print(f"   - {flood_csv}")
        print(f"   - {forecast_csv}")
        print(f"or fallback dataset: {fallback_csv}")
        return False

    # Prepare features and labels
    X, y, feature_columns = prepare_features_and_labels(df)
    
    # Train models
    rf_model, rf_score, rf_importance = train_random_forest(X, y)
    gb_model, gb_score, gb_importance = train_gradient_boosting(X, y)
    
    # Save models
    save_models(rf_model, gb_model, models_dir)
    
    # Get metrics (convert scores to metrics dicts for reporting)
    rf_metrics = rf_model.metrics
    gb_metrics = gb_model.metrics
    
    # Generate report
    report = generate_training_report(
        rf_model, gb_model, 
        rf_metrics, gb_metrics, 
        rf_importance, gb_importance,
        feature_columns, df, 
        data_dir
    )
    
    print(f"✅ Training completed successfully!")
    print(f"\n📋 Next steps:")
    print(f"   1. Start the Flask ML service: python app.py")
    print(f"   2. Start the Node.js backend: npm start (in backend/)")
    print(f"   3. Start the frontend: npm run dev (in frontend/)")
    print(f"   4. Generate predictions: POST /api/prediction/generate-ml")
    print(f"\n🎯 Models trained and saved! Ready to make predictions.")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)

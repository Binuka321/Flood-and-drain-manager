#!/usr/bin/env python
"""
Example script demonstrating how to train a flood prediction model
"""

import requests
import json

# Configuration
ML_SERVICE_URL = "http://localhost:5000"
TRAINING_ENDPOINT = f"{ML_SERVICE_URL}/api/ml/training/train"
PREDICTION_ENDPOINT = f"{ML_SERVICE_URL}/api/ml/prediction/predict"

# Sample rainfall data (in real scenario, this would come from CSV or API)
RAINFALL_DATA = [
    {"location": "Colombo", "month": 1, "rainfall": 125.3, "latitude": 6.9271, "longitude": 80.7789},
    {"location": "Colombo", "month": 2, "rainfall": 98.7, "latitude": 6.9271, "longitude": 80.7789},
    {"location": "Colombo", "month": 3, "rainfall": 145.2, "latitude": 6.9271, "longitude": 80.7789},
    {"location": "Colombo", "month": 4, "rainfall": 168.9, "latitude": 6.9271, "longitude": 80.7789},
    {"location": "Colombo", "month": 5, "rainfall": 189.4, "latitude": 6.9271, "longitude": 80.7789},
    {"location": "Colombo", "month": 6, "rainfall": 145.6, "latitude": 6.9271, "longitude": 80.7789},
    
    {"location": "Anuradhapura", "month": 1, "rainfall": 145.2, "latitude": 8.3114, "longitude": 80.4037},
    {"location": "Anuradhapura", "month": 2, "rainfall": 98.7, "latitude": 8.3114, "longitude": 80.4037},
    {"location": "Anuradhapura", "month": 3, "rainfall": 165.2, "latitude": 8.3114, "longitude": 80.4037},
    {"location": "Anuradhapura", "month": 4, "rainfall": 198.9, "latitude": 8.3114, "longitude": 80.4037},
    {"location": "Anuradhapura", "month": 5, "rainfall": 219.4, "latitude": 8.3114, "longitude": 80.4037},
    {"location": "Anuradhapura", "month": 6, "rainfall": 165.6, "latitude": 8.3114, "longitude": 80.4037},
]

# Sample flood impact data
FLOOD_IMPACT_DATA = [
    {"location": "Colombo", "month": 1, "risk_level": "Low", "flood_events": 0},
    {"location": "Colombo", "month": 2, "risk_level": "Low", "flood_events": 0},
    {"location": "Colombo", "month": 3, "risk_level": "Moderate", "flood_events": 1},
    {"location": "Colombo", "month": 4, "risk_level": "Moderate", "flood_events": 2},
    {"location": "Colombo", "month": 5, "risk_level": "High", "flood_events": 3},
    {"location": "Colombo", "month": 6, "risk_level": "Moderate", "flood_events": 1},
    
    {"location": "Anuradhapura", "month": 1, "risk_level": "Moderate", "flood_events": 1},
    {"location": "Anuradhapura", "month": 2, "risk_level": "Low", "flood_events": 0},
    {"location": "Anuradhapura", "month": 3, "risk_level": "Moderate", "flood_events": 1},
    {"location": "Anuradhapura", "month": 4, "risk_level": "High", "flood_events": 2},
    {"location": "Anuradhapura", "month": 5, "risk_level": "High", "flood_events": 4},
    {"location": "Anuradhapura", "month": 6, "risk_level": "Moderate", "flood_events": 1},
]

def train_model():
    """Train the flood prediction model"""
    print("📚 Training Flood Prediction Model...")
    print("-" * 50)
    
    training_payload = {
        "rainfall_data": {
            "data": RAINFALL_DATA,
            "format": "json"
        },
        "flood_impact_data": {
            "data": FLOOD_IMPACT_DATA,
            "format": "json"
        },
        "target_column": "risk_level",
        "model_type": "random_forest",
        "test_size": 0.3,
        "save_model": True,
        "model_name": "flood_model_v1"
    }
    
    try:
        response = requests.post(TRAINING_ENDPOINT, json=training_payload)
        response.raise_for_status()
        
        result = response.json()
        print("✅ Training successful!")
        print(f"\n📊 Model Metrics:")
        print(f"  - Train Accuracy: {result['metrics']['train_accuracy']:.2%}")
        print(f"  - Test Accuracy: {result['metrics']['test_accuracy']:.2%}")
        print(f"  - Precision: {result['metrics']['precision']:.2%}")
        print(f"  - Recall: {result['metrics']['recall']:.2%}")
        print(f"  - F1 Score: {result['metrics']['f1_score']:.2%}")
        
        print(f"\n📈 Top Features:")
        for i, feature in enumerate(result['feature_importance'][:3], 1):
            print(f"  {i}. {feature['feature']}: {feature['importance']:.2%}")
        
        return True
    
    except requests.exceptions.RequestException as e:
        print(f"❌ Training failed: {e}")
        return False

def make_prediction(location, month, rainfall, latitude, longitude):
    """Make a prediction"""
    print(f"\n🔮 Making prediction for {location} (Month: {month})...")
    
    prediction_payload = {
        "features": {
            "rainfall": rainfall,
            "latitude": latitude,
            "longitude": longitude,
            "month": month,
            "flood_events": 0  # Base value
        }
    }
    
    try:
        response = requests.post(PREDICTION_ENDPOINT, json=prediction_payload)
        response.raise_for_status()
        
        result = response.json()
        print(f"✅ Prediction: {result['prediction_label']}")
        print(f"   Confidence: {result['confidence']:.2%}")
        
        return result
    
    except requests.exceptions.RequestException as e:
        print(f"❌ Prediction failed: {e}")
        return None

def make_batch_predictions():
    """Make batch predictions"""
    print("\n📊 Making batch predictions...")
    
    prediction_payload = {
        "features": [
            [125.3, 6.9271, 80.7789, 1, 0],  # Colombo, month 1
            [189.4, 6.9271, 80.7789, 5, 0],  # Colombo, month 5
            [145.2, 8.3114, 80.4037, 1, 0],  # Anuradhapura, month 1
            [219.4, 8.3114, 80.4037, 5, 0],  # Anuradhapura, month 5
        ]
    }
    
    try:
        response = requests.post(PREDICTION_ENDPOINT, json=prediction_payload)
        response.raise_for_status()
        
        result = response.json()
        print(f"✅ Batch predictions completed!")
        print(f"   Processed: {result['batch_size']} samples")
        
        for i, pred in enumerate(result['predictions'], 1):
            print(f"   {i}. {pred['prediction_label']} (Confidence: {pred['confidence']:.2%})")
        
        return result
    
    except requests.exceptions.RequestException as e:
        print(f"❌ Batch prediction failed: {e}")
        return None

if __name__ == "__main__":
    print("🌊 Flood Prediction ML Service - Example Script")
    print("=" * 50)
    
    # Train model
    if train_model():
        # Make single predictions
        make_prediction("Colombo", 1, 125.3, 6.9271, 80.7789)
        make_prediction("Colombo", 5, 189.4, 6.9271, 80.7789)
        make_prediction("Anuradhapura", 5, 219.4, 8.3114, 80.4037)
        
        # Make batch predictions
        make_batch_predictions()
    
    print("\n" + "=" * 50)
    print("✨ Example script completed!")

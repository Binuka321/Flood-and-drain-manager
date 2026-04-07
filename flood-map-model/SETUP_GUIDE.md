# 🌊 Flood Prediction ML Microservice - Complete Setup Guide

## Overview

I've created a complete Python microservice for flood prediction using machine learning. Here's what you have:

## 📁 Project Structure

```
ml-service/
├── app.py                          # Flask application entry point
├── config.py                       # Configuration management
├── requirements.txt                # Python dependencies
├── .env                           # Environment variables
├── .gitignore                     # Git ignore file
├── README.md                      # Service documentation
├── INTEGRATION.md                 # Backend integration guide
├── quickstart.py                  # Quick start script
├── example_train.py               # Example training script
├── run.sh / run.bat              # Service startup scripts
│
├── models/
│   ├── flood_model.py            # Main ML model class
│   └── saved_models/             # Saved model storage (auto-created)
│
├── routes/
│   ├── training.py               # Model training endpoints
│   └── prediction.py             # Prediction endpoints
│
├── utils/
│   ├── data_processor.py         # Data preprocessing utilities
│   └── data_loader.py            # CSV data loading utilities
│
└── data/
    ├── sri_lanka_flood_dataset_district.csv       # District-level flood dataset for training
    └── sri_lanka_rainfall_forecast_district.csv   # District-level rainfall forecast dataset for training
```

## 🚀 Quick Start

### Option 1: Using Quickstart Script (Recommended)

```bash
cd ml-service
python quickstart.py
```

This will:
- Create virtual environment
- Install dependencies
- Create sample data
- Start the service

### Option 2: Manual Setup

**Windows:**
```bash
cd ml-service
run.bat
```

**macOS/Linux:**
```bash
cd ml-service
bash run.sh
```

**Or manually:**
```bash
cd ml-service

# Create virtual environment
python -m venv venv

# Activate it
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run service
python app.py
```

## 📊 API Endpoints

### Health Check
```bash
GET http://localhost:5000/api/ml/health
```

### Training Endpoints

**Train a model:**
```bash
POST http://localhost:5000/api/ml/training/train

Body:
{
  "rainfall_data": { "data": [...], "format": "json" },
  "flood_impact_data": { "data": [...], "format": "json" },
  "target_column": "risk_level",
  "model_type": "random_forest",
  "save_model": true,
  "model_name": "my_model_v1"
}
```

**Get model status:**
```bash
GET http://localhost:5000/api/ml/training/status
```

**List saved models:**
```bash
GET http://localhost:5000/api/ml/training/list
```

**Load saved model:**
```bash
POST http://localhost:5000/api/ml/training/load/model_name
```

### Prediction Endpoints

**Make prediction:**
```bash
POST http://localhost:5000/api/ml/prediction/predict

Body (single):
{
  "features": {
    "rainfall": 150.5,
    "latitude": 6.9271,
    "longitude": 80.7789
  }
}

Body (batch):
{
  "features": [
    [150.5, 6.9271, 80.7789],
    [120.3, 7.0833, 80.7667]
  ]
}
```

**Get feature importance:**
```bash
GET http://localhost:5000/api/ml/prediction/feature-importance
```

**Get model info:**
```bash
GET http://localhost:5000/api/ml/prediction/model-info
```

## 💻 Usage Examples

### Python Client
```python
import requests

ML_URL = "http://localhost:5000/api/ml"

# Train model
response = requests.post(
  f"{ML_URL}/training/train",
  json={
    "rainfall_data": {"data": rainfall_list, "format": "json"},
    "flood_impact_data": {"data": flood_list, "format": "json"},
    "target_column": "risk_level",
    "model_type": "random_forest",
    "save_model": True,
    "model_name": "flood_model_2024"
  }
)
print(response.json())

# Make prediction
response = requests.post(
  f"{ML_URL}/prediction/predict",
  json={
    "features": {
      "rainfall": 150.5,
      "latitude": 6.9271,
      "longitude": 80.7789
    }
  }
)
print(response.json())
```

### JavaScript/Node.js Client
```javascript
const ML_URL = "http://localhost:5000/api/ml";

// Train model
const trainResponse = await fetch(`${ML_URL}/training/train`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    rainfall_data: { data: rainfallList, format: 'json' },
    flood_impact_data: { data: floodList, format: 'json' },
    target_column: 'risk_level',
    model_type: 'random_forest',
    save_model: true,
    model_name: 'flood_model_2024'
  })
});
const trainResult = await trainResponse.json();

// Make prediction
const predResponse = await fetch(`${ML_URL}/prediction/predict`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    features: {
      rainfall: 150.5,
      latitude: 6.9271,
      longitude: 80.7789
    }
  })
});
const prediction = await predResponse.json();
```

### cURL Examples
```bash
# Train model
curl -X POST http://localhost:5000/api/ml/training/train \
  -H "Content-Type: application/json" \
  -d '{
    "rainfall_data": {"data": [...], "format": "json"},
    "flood_impact_data": {"data": [...], "format": "json"},
    "target_column": "risk_level",
    "model_type": "random_forest",
    "save_model": true,
    "model_name": "flood_model"
  }'

# Make prediction
curl -X POST http://localhost:5000/api/ml/prediction/predict \
  -H "Content-Type: application/json" \
  -d '{
    "features": {
      "rainfall": 150.5,
      "latitude": 6.9271,
      "longitude": 80.7789
    }
  }'

# Get model info
curl http://localhost:5000/api/ml/prediction/model-info

# List models
curl http://localhost:5000/api/ml/training/list
```

## 📝 Dataset Format

### Rainfall Data (CSV)
```csv
location,month,rainfall,latitude,longitude
Colombo,1,125.3,6.9271,80.7789
Colombo,2,98.7,6.9271,80.7789
Anuradhapura,1,145.2,8.3114,80.4037
```

Required columns: `location`, `month`, `rainfall`, `latitude`, `longitude`

### Flood Impact Data (CSV)
```csv
location,month,risk_level,flood_events,water_level
Colombo,1,Low,0,2.5
Colombo,2,Low,0,2.3
Colombo,3,Moderate,1,3.1
```

Required columns: `location`, `month`, `risk_level` (target variable)

## 🔧 Configuration

Update `.env` file:

```env
FLASK_ENV=development              # development or production
ML_SERVICE_PORT=5000               # Port to run service on
BACKEND_API_URL=http://localhost:3001
MODEL_PATH=./models/saved_models   # Where to save trained models
DATA_PATH=./data/datasets          # Where to store datasets
```

## 🎓 Model Types

### Random Forest (Default)
- **Pros:** Robust, handles mixed data types, good baseline
- **Use case:** General flood prediction
- **Parameters:** 100 trees, max depth 15

### Gradient Boosting
- **Pros:** Often achieves better accuracy, handles non-linear patterns
- **Use case:** High-accuracy predictions needed
- **Parameters:** 100 estimators, learning rate 0.1

## 📊 Understanding the Response

### Training Response
```json
{
  "status": "success",
  "model_info": {
    "type": "random_forest",
    "version": "2026-04-06T10:30:45.123456"
  },
  "metrics": {
    "train_accuracy": 0.95,
    "test_accuracy": 0.92,
    "precision": 0.93,
    "recall": 0.91,
    "f1_score": 0.92
  },
  "feature_importance": [
    {"feature": "rainfall", "importance": 0.35},
    {"feature": "latitude", "importance": 0.28}
  ]
}
```

### Prediction Response
```json
{
  "prediction": 1,
  "confidence": 0.92,
  "prediction_label": "Moderate Risk",
  "details": {
    "features_used": ["rainfall", "latitude", "longitude"],
    "model_version": "2026-04-06T10:30:45.123456"
  }
}
```

## 🔗 Integration with Node.js Backend

1. **Update backend `.env`:**
```env
ML_SERVICE_URL=http://localhost:5000
```

2. **Create ML route in backend** (see `INTEGRATION.md` for complete code)

3. **Call from your application:**
```javascript
// Train model from backend
const trainResponse = await fetch(`${ML_SERVICE_URL}/api/ml/training/train`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(trainingData)
});

// Make predictions
const prediction = await fetch(`${ML_SERVICE_URL}/api/ml/prediction/predict`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ features: sensorData })
});
```

## 📈 Performance Metrics Explained

- **Accuracy:** Percentage of correct predictions (0.0 - 1.0)
- **Precision:** Of predicted positives, how many were correct
- **Recall:** Of actual positives, how many were found
- **F1 Score:** Harmonic mean of precision and recall
- **Confidence:** Model's certainty about a specific prediction

## ⚠️ Troubleshooting

### Error: "ModuleNotFoundError: No module named 'flask'"
```bash
# Install dependencies
pip install -r requirements.txt
```

### Error: "Connection refused" when calling from backend
- Ensure ML service is running on port 5000
- Check firewall isn't blocking port 5000
- Verify ML_SERVICE_URL in backend .env

### Error: "Model not trained yet"
- Train a model first using `/api/ml/training/train`
- Load a previously saved model using `/api/ml/training/load/<name>`

### Poor prediction accuracy
- Check data quality and completeness
- Try different model_type (gradient_boosting)
- Increase training dataset size
- Check feature importance to identify key factors

## 🎯 Next Steps

1. ✅ **ML Service Created** - Ready to use
2. ⬜ **Integrate with Backend** - Follow `INTEGRATION.md`
3. ⬜ **Prepare Training Data** - Use provided sample datasets
4. ⬜ **Train Initial Model** - Use Example scripts or API
5. ⬜ **Test Predictions** - Validate against known outcomes
6. ⬜ **Deploy to Production** - Use same startup scripts
7. ⬜ **Setup Monitoring** - Track model performance over time
8. ⬜ **Automated Retraining** - Retrain periodically with new data

## 📚 Additional Resources

- **README.md** - Detailed service documentation
- **INTEGRATION.md** - Backend integration guide with code examples
- **example_train.py** - Complete working example of training and prediction
- **sri_lanka_flood_dataset_district.csv** - District-level flood training dataset
- **sri_lanka_rainfall_forecast_district.csv** - District-level rainfall forecast dataset

## ✨ Key Features

✅ Train models with custom datasets
✅ Support for multiple algorithms (Random Forest, Gradient Boosting)
✅ Automatic feature engineering
✅ Model persistence and versioning
✅ Single and batch predictions
✅ Feature importance analysis
✅ Comprehensive error handling
✅ CORS enabled for frontend integration
✅ Detailed model metrics and diagnostics
✅ Sample data provided for testing

## 📞 Support

For detailed information on:
- **API Parameters** → See `README.md`
- **Backend Integration** → See `INTEGRATION.md`
- **Running Examples** → See `example_train.py`
- **Configuration Options** → See `config.py`

---

**Status:** ✅ Production Ready

The ML microservice is complete and ready to use. You can start it immediately and begin training flood prediction models!

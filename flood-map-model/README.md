# Flood Prediction ML Microservice

A Python-based microservice for training and deploying machine learning models to predict flood situations based on rainfall and impact datasets.

## Features

- **Model Training**: Train flood prediction models using Random Forest or Gradient Boosting algorithms
- **Flexible Data Input**: Accept rainfall and flood impact datasets in multiple formats
- **Feature Engineering**: Automatic feature creation and preprocessing
- **Model Persistence**: Save and load trained models for reuse
- **Batch Predictions**: Make single or batch predictions with confidence scores
- **Feature Importance**: Analyze which features influence predictions most
- **Comprehensive Metrics**: Get detailed training metrics including accuracy, precision, recall, and F1-score

## Prerequisites

- Python 3.8+
- pip

## Installation

1. Navigate to the ml-service directory:
```bash
cd ml-service
```

2. Create a virtual environment (recommended):
```bash
# On Windows
python -m venv venv
venv\Scripts\activate

# On macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

## Configuration

Create or update the `.env` file with your settings:

```env
FLASK_ENV=development
ML_SERVICE_PORT=5000
BACKEND_API_URL=http://localhost:3001
MODEL_PATH=./models/saved_models
DATA_PATH=./data/datasets
```

## Running the Service

```bash
python app.py
```

The service will start on `http://localhost:5000` (or the port specified in `.env`)

## API Endpoints

### Health Check
```
GET /api/ml/health
```

### Training

#### Train a new model
```
POST /api/ml/training/train
```

**Request Body:**
```json
{
  "rainfall_data": {
    "data": [
      {"location": "Colombo", "month": 1, "rainfall": 125.3},
      {"location": "Colombo", "month": 2, "rainfall": 98.7}
    ],
    "format": "json"
  },
  "flood_impact_data": {
    "data": [
      {"location": "Colombo", "month": 1, "risk_level": "Low", "flood_events": 0},
      {"location": "Colombo", "month": 2, "risk_level": "Low", "flood_events": 0}
    ],
    "format": "json"
  },
  "target_column": "risk_level",
  "model_type": "random_forest",
  "test_size": 0.2,
  "save_model": true,
  "model_name": "my_flood_model"
}
```

**Response:**
```json
{
  "status": "success",
  "model_info": {
    "type": "random_forest",
    "name": "my_flood_model",
    "version": "2026-04-06T10:30:45.123456"
  },
  "metrics": {
    "train_accuracy": 0.95,
    "test_accuracy": 0.92,
    "precision": 0.93,
    "recall": 0.91,
    "f1_score": 0.92
  },
  "data_info": {
    "total_samples": 100,
    "features": 8,
    "feature_names": ["rainfall", "latitude", "longitude", ...],
    "target_classes": [0, 1, 2]
  },
  "feature_importance": [
    {"feature": "rainfall", "importance": 0.35},
    {"feature": "latitude", "importance": 0.28}
  ]
}
```

#### Get model status
```
GET /api/ml/training/status
```

#### Load a saved model
```
POST /api/ml/training/load/<model_name>
```

#### List all saved models
```
GET /api/ml/training/list
```

### Prediction

#### Make predictions
```
POST /api/ml/prediction/predict
```

**Request Body (Single Prediction):**
```json
{
  "features": {
    "rainfall": 150.5,
    "latitude": 6.9271,
    "longitude": 80.7789,
    "humidity": 75.2
  }
}
```

**Request Body (Batch Predictions):**
```json
{
  "features": [
    [150.5, 6.9271, 80.7789, 75.2],
    [120.3, 7.0833, 80.7667, 70.1],
    [180.7, 7.2906, 80.6337, 82.4]
  ]
}
```

**Response:**
```json
{
  "prediction": 1,
  "confidence": 0.92,
  "prediction_label": "Moderate Risk",
  "details": {
    "features_used": ["rainfall", "latitude", "longitude", "humidity"],
    "model_type": "random_forest",
    "model_version": "2026-04-06T10:30:45.123456"
  }
}
```

#### Get feature importance
```
GET /api/ml/prediction/feature-importance
```

#### Get model information
```
GET /api/ml/prediction/model-info
```

## Dataset Format

### Rainfall Data
```csv
location,month,rainfall,latitude,longitude
Colombo,1,125.3,6.9271,80.7789
Colombo,2,98.7,6.9271,80.7789
Anuradhapura,1,145.2,8.3114,80.4037
```

### Flood Impact Data
```csv
location,month,risk_level,flood_events
Colombo,1,Low,0
Colombo,2,Low,1
Anuradhapura,1,Moderate,2
```

## Data Preprocessing

The service automatically:
1. Validates input datasets
2. Merges datasets on location and month
3. Engineers new features (moving averages, anomalies)
4. Encodes categorical variables
5. Scales numeric features
6. Splits data into train/test sets

## Model Types

### Random Forest
- Default model type
- Robust and handles non-linear relationships well
- Good for mixed feature types
- Parameters: 100 estimators, max depth 15

### Gradient Boosting
- Sequential tree building approach
- Often achieves better accuracy
- More computationally intensive
- Parameters: 100 estimators, learning rate 0.1

## Example Usage

### Python Client
```python
import requests
import json

# API endpoint
BASE_URL = "http://localhost:5000/api/ml"

# Sample data
rainfall_data = [
    {"location": "Colombo", "month": 1, "rainfall": 125.3, "latitude": 6.9271, "longitude": 80.7789},
    {"location": "Colombo", "month": 2, "rainfall": 98.7, "latitude": 6.9271, "longitude": 80.7789}
]

flood_data = [
    {"location": "Colombo", "month": 1, "risk_level": "Low"},
    {"location": "Colombo", "month": 2, "risk_level": "Low"}
]

# Train model
training_payload = {
    "rainfall_data": {"data": rainfall_data, "format": "json"},
    "flood_impact_data": {"data": flood_data, "format": "json"},
    "target_column": "risk_level",
    "model_type": "random_forest",
    "save_model": True,
    "model_name": "flood_model_v1"
}

response = requests.post(
    f"{BASE_URL}/training/train",
    json=training_payload
)

print(response.json())

# Make prediction
prediction_payload = {
    "features": {
        "rainfall": 150.5,
        "latitude": 6.9271,
        "longitude": 80.7789
    }
}

response = requests.post(
    f"{BASE_URL}/prediction/predict",
    json=prediction_payload
)

print(response.json())
```

### cURL
```bash
# Train model
curl -X POST http://localhost:5000/api/ml/training/train \
  -H "Content-Type: application/json" \
  -d @training_payload.json

# Make prediction
curl -X POST http://localhost:5000/api/ml/prediction/predict \
  -H "Content-Type: application/json" \
  -d '{"features": {"rainfall": 150.5, "latitude": 6.9271, "longitude": 80.7789}}'

# Get model info
curl http://localhost:5000/api/ml/prediction/model-info
```

## Integration with Backend

To integrate with the Node.js backend:

1. Start the ML microservice on port 5000
2. Update the backend to call the ML service for predictions:

```javascript
// In your prediction route
const mlServiceURL = process.env.ML_SERVICE_URL || 'http://localhost:5000';

async function getPrediction(features) {
  const response = await fetch(`${mlServiceURL}/api/ml/prediction/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ features })
  });
  
  return response.json();
}
```

## Directory Structure

```
ml-service/
├── app.py                          # Flask application factory
├── config.py                       # Configuration management
├── requirements.txt                # Python dependencies
├── .env                           # Environment variables
├── .gitignore                     # Git ignore rules
├── README.md                      # This file
├── models/
│   ├── flood_model.py            # ML model class
│   └── saved_models/             # Saved model files
├── routes/
│   ├── training.py               # Training endpoints
│   └── prediction.py             # Prediction endpoints
└── utils/
    └── data_processor.py         # Data processing utilities
```

## Troubleshooting

### Model not found error
- Ensure the model name is correct
- Check that the model file exists in `models/saved_models/`
- Verify file permissions

### Feature mismatch error
- Ensure prediction features match model's expected features
- Check feature order when using list format
- Use dictionary format for named features

### Out of memory
- Reduce batch size for predictions
- Use a smaller test set for training
- Consider using `Gradient Boosting` with fewer estimators

## Performance Tips

1. **Feature Selection**: Use fewer, more relevant features
2. **Data Preprocessing**: Clean and validate data before training
3. **Model Tuning**: Experiment with different model types
4. **Batch Processing**: Use batch predictions for efficiency
5. **Model Caching**: Load models once and reuse them

## License

This project is part of the Flood Alert & Early Warning System.

## Support

For issues or questions, please refer to the main project documentation or contact the development team.

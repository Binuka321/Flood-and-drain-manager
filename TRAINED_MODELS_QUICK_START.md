# 🚀 Trained Models - Quick Start Guide

**Status:** ✅ Models Ready  
**Accuracy:** 75% Test Accuracy  
**Best Model:** Random Forest

---

## 🎯 Quick Start (5 Minutes)

### 1. Start the ML Service
```bash
cd flood-map-model
python app.py
```
✓ Running on `http://localhost:5000`

### 2. Start the Backend
```bash
cd backend
npm start
```
✓ Running on `http://localhost:3001`

### 3. Test Predictions
```bash
# Generate predictions from rainfall data
curl -X POST http://localhost:3001/api/prediction/generate-ml

# View as GeoJSON for mapping
curl http://localhost:3001/api/prediction/geojson

# Get statistics
curl http://localhost:3001/api/prediction/summary
```

---

## 📊 Model Information

### Random Forest (Default Model)
```
Training Data:    200 records
Training Accuracy: 98.75%
Test Accuracy:    75.00%
Status:           ✅ Optimal
```

### Gradient Boosting (Alternative)
```
Training Data:    200 records
Training Accuracy: 100.00%
Test Accuracy:    75.00%
Status:           ⚠️ Slight overfitting
```

**Recommendation:** Use Random Forest (better generalization)

---

## 🔌 API Endpoints

### Generate Predictions
```
POST /api/prediction/generate-ml
```
Generates flood risk predictions for all locations in database.

**Response:**
```json
{
  "status": "success",
  "count": 5,
  "predictions": [
    {
      "location": "Colombo",
      "prediction": 2,
      "predictionLabel": "High Risk",
      "confidence": 0.85,
      "modelVersion": "2025-04-06"
    }
  ]
}
```

### Get GeoJSON Map Data
```
GET /api/prediction/geojson
```
Returns GeoJSON FeatureCollection for Leaflet mapping.

**Response:**
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [79.86, 6.92]
      },
      "properties": {
        "location": "Colombo",
        "risk": "High",
        "confidence": 0.85,
        "color": "#E74C3C"
      }
    }
  ],
  "summary": {
    "totalLocations": 5,
    "highRisk": 2,
    "mediumRisk": 2,
    "lowRisk": 1
  }
}
```

### Get Risk Summary
```
GET /api/prediction/summary
```
Returns risk distribution statistics.

### Check ML Service Health
```
GET /api/training/health
```
Verifies ML service is running and available.

---

## 🗺️ Map Colors

```
Risk Level → Color:
├── Low      → Green  #27AE60
├── Medium   → Orange #F39C12
├── High     → Red    #E74C3C
└── V.High   → D.Red  #8B0000
```

---

## 📈 Feature Importance

Models focus on these factors (in order):

1. **Rainfall** (mm) - Primary factor
2. **Water Level** (m) - Secondary factor
3. **Flow Rate** (m³/s) - Tertiary factor
4. **Elevation** (m) - Localization factor
5. **Historical Risk** - Baseline factor

---

## 🧪 Test Predictions

### Example 1: Low Risk Scenario
```json
{
  "features": [[0.5, 20.0, 1.5, 30.0, 0]]
}
```
→ Prediction: **Low Risk** 

### Example 2: High Risk Scenario
```json
{
  "features": [[2.0, 100.0, 4.5, 10.0, 1]]
}
```
→ Prediction: **High Risk**

### Example 3: Medium Risk Scenario
```json
{
  "features": [[1.2, 60.0, 2.8, 20.0, 0.5]]
}
```
→ Prediction: **Medium Risk**

---

## 📁 File Locations

```
Trained Models:
└── flood-map-model/models/saved_models/
    ├── random_forest.pkl         (Main model)
    ├── gradient_boosting.pkl     (Alternative)
    ├── random_forest_scaler.pkl
    └── gradient_boosting_scaler.pkl

Training Data:
└── flood-map-model/data/
    ├── flood_dataset_sample_v2.csv      (200 records)
    ├── training_report.json              (Detailed report)
    └── colombo_week_rainfall_forecast.csv

Integration Files:
└── backend/utils/
    ├── mlModelService.js          (ML API bridge)
    └── geoJsonGenerator.js        (Map format conversion)
```

---

## 🔄 Workflow

```
1. User triggers prediction
   ↓
2. Backend calls ML service
   ↓
3. ML models process features
   ↓
4. Return predictions + confidence
   ↓
5. Convert to GeoJSON format
   ↓
6. Display on Leaflet map
   ↓
7. Show risk summary stats
```

---

## ⚠️ Common Issues

### Issue: "ML Service Unavailable"
```
Solution: 
1. Check ML service is running
2. Verify port 5000 is not in use
3. Check FLASK_ENV=development
```

### Issue: "No Predictions Found"
```
Solution:
1. Ensure rainfall data exists in database
2. Check database connection
3. Verify MongoDB is running
```

### Issue: "Unexpected Prediction Values"
```
Solution:
1. Verify feature scaling is correct
2. Check feature ranges match training data
3. Retrain models with fresh data
```

---

## 📊 Performance Metrics

```
Model:              Random Forest
Accuracy:           75.00%
Precision:          76.00%
Recall:             75.00%
Training Time:      < 5 seconds
Prediction Time:    < 100ms per record
Model Size:         ~2 MB
```

---

## 🎯 Usage Examples

### Python
```python
from models.flood_model import FloodPredictionModel

# Load model
model = FloodPredictionModel('random_forest')
model.load('random_forest')

# Make prediction
features = [[1.2, 60.0, 2.8, 20.0, 0.5]]
prediction = model.predict(features)
print(f"Risk: {prediction[0]}")  # → 1 (Medium)
```

### cURL
```bash
# Make prediction request
curl -X POST http://localhost:3001/api/prediction/generate-ml

# Get map data
curl http://localhost:3001/api/prediction/geojson | jq

# Get statistics
curl http://localhost:3001/api/prediction/summary | jq
```

### Frontend (React)
```javascript
// Get predictions
const response = await fetch('/api/prediction/generate-ml', {
  method: 'POST'
});

// Get map data
const geoJson = await fetch('/api/prediction/geojson').then(r => r.json());

// Render on map
<GeoJSON data={geoJson} />
```

---

## 🚀 Next Steps

1. ✅ Start ML service
2. ✅ Start backend server
3. ✅ Generate predictions
4. ✅ View on map
5. 📈 Collect more data
6. 🔄 Retrain models
7. 🎯 Improve accuracy

---

## 📞 Support

For detailed information, see:
- `MODEL_TRAINING_REPORT.md` - Full training details
- `backend/FLOOD_MAP_ML_INTEGRATION.md` - Integration guide
- `ARCHITECTURE_DIAGRAMS.md` - System architecture
- `IMPLEMENTATION_SUMMARY.md` - Implementation overview

---

**Your models are trained and ready! 🎉**

Start making flood predictions now:
```bash
POST http://localhost:3001/api/prediction/generate-ml
```

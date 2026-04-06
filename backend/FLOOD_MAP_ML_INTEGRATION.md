# 🌊 Flood Map - ML Model Integration Guide

## Overview

The Flood Alert system now integrates a Python ML microservice (`flood-map-model`) with the Node.js backend to generate intelligent flood risk maps using machine learning predictions and geospatial mapping.

## Architecture

```
┌─────────────────────┐
│  Frontend (React)   │
│   FloodMapApp.jsx   │
└────────────┬────────┘
             │
             ▼
┌──────────────────────────────┐
│   Node.js Express Backend    │
│   (Port 3001)                │
├──────────────────────────────┤
│ New Routes:                  │
│ POST /api/prediction/        │ 
│      generate-ml        ────►│ 
│ GET  /api/prediction/        │
│      geojson                 │
│ GET  /api/prediction/summary │
│ GET  /api/prediction/heatmap │
│ GET  /api/training/health    │
└──────────────────┬───────────┘
                   │
                   ▼
          ┌─────────────────┐
          │ MongoDB         │
          │ (Predictions)   │
          └─────────────────┘
          
          ┌──────────────────────────────┐
          │ Python Flask ML Service      │
          │ flood-map-model (Port 5000)  │
          ├──────────────────────────────┤
          │ /api/ml/training/train       │
          │ /api/ml/prediction/predict   │
          │ /api/ml/prediction/*         │
          └──────────────────────────────┘
```

## Key Components Created

### 1. **ML Model Service** (`backend/utils/mlModelService.js`)
Communicates with the Python microservice via REST API:
- Train models with custom datasets
- Make single & batch flood predictions
- Retrieve feature importance
- Check model status and information

### 2. **GeoJSON Generator** (`backend/utils/geoJsonGenerator.js`)
Converts ML predictions to geospatial data:
- Generate point-based GeoJSON from predictions
- Create choropleth layers for districts
- Generate heatmap data
- Calculate risk statistics and summaries
- Color-code risk levels for visualization

### 3. **Updated Prediction Model** (`backend/models/Prediction.js`)
Enhanced database schema:
- Stores ML prediction results
- Tracks rainfall, water level, humidity
- Records model version and type
- Maintains backward compatibility with legacy FRI field

### 4. **Enhanced Prediction Routes** (`backend/routes/predictionRoutes.js`)
New API endpoints:
- `POST /api/prediction/generate-ml` - Generate predictions using ML model
- `GET /api/prediction/geojson` - Get predictions as GeoJSON
- `GET /api/prediction/summary` - Get risk statistics
- `GET /api/prediction/heatmap` - Get heatmap data

### 5. **Training Routes** (`backend/routes/trainingRoutes.js`)
Model management endpoints:
- `GET /api/training/status` - Current model status
- `GET /api/training/model-info` - Model information
- `GET /api/training/feature-importance` - Feature analysis
- `GET /api/training/health` - ML service health check

## Setup & Configuration

### 1. Update Backend Environment

The backend `.env` has been updated with:
```env
PORT=3001                              # Backend uses port 3001
ML_SERVICE_URL=http://localhost:5000   # ML service on port 5000
MONGO_URI=...                          # MongoDB connection
JWT_SECRET=...                         # JWT secret
```

### 2. Start Services (Two Terminals)

**Terminal 1 - ML Service:**
```bash
cd flood-map-model
python quickstart.py
# Or: run.bat (Windows) / bash run.sh (macOS/Linux)
```
Service will run on: `http://localhost:5000`

**Terminal 2 - Backend:**
```bash
cd backend
npm install
npm start
```
Backend will run on: `http://localhost:3001`

### 3. Start Frontend (Third Terminal)

```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

### Prediction Endpoints

#### Generate Flood Predictions (ML-based)
```
POST /api/prediction/generate-ml
```
**Response:**
```json
{
  "status": "success",
  "data": {
    "totalPredictions": 25,
    "predictions": [
      {
        "_id": "...",
        "location": "Colombo",
        "latitude": 6.9271,
        "longitude": 80.7789,
        "rainfall": 150.5,
        "waterLevel": 3.2,
        "mlPrediction": {
          "prediction": 2,
          "predictionLabel": "High Risk",
          "confidence": 0.92,
          "modelVersion": "2026-04-06T...",
          "modelType": "random_forest"
        },
        "riskLevel": "High Risk"
      }
    ],
    "modelInfo": {
      "type": "random_forest",
      "accuracy": 0.92
    }
  }
}
```

#### Get GeoJSON for Map
```
GET /api/prediction/geojson
```
**Response:**
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [80.7789, 6.9271]
      },
      "properties": {
        "location": "Colombo",
        "riskLevel": "High Risk",
        "confidence": "92.15",
        "color": "#E74C3C",
        "popupText": "..."
      }
    }
  ],
  "metadata": {
    "riskDistribution": {
      "Low Risk": 5,
      "Moderate Risk": 8,
      "High Risk": 10,
      "Very High Risk": 2
    }
  }
}
```

#### Get Flood Map Summary
```
GET /api/prediction/summary
```
**Response:**
```json
{
  "status": "success",
  "summary": {
    "totalLocations": 25,
    "averageConfidence": "87.64",
    "riskDistribution": {
      "Low Risk": 5,
      "Moderate Risk": 8,
      "High Risk": 10,
      "Very High Risk": 2
    },
    "highRiskLocations": [
      {
        "location": "Anuradhapura",
        "riskLevel": "Very High Risk",
        "confidence": "95.32"
      }
    ]
  }
}
```

#### Get Heatmap Data
```
GET /api/prediction/heatmap
```
**Response:**
```json
{
  "status": "success",
  "data": [
    [6.9271, 80.7789, 0.75],
    [7.2906, 80.6337, 0.50],
    ...
  ]
}
```

### Training Endpoints

#### Check ML Service Health
```
GET /api/training/health
```
**Response:**
```json
{
  "status": "healthy",
  "service": "ML Model Service",
  "available": true,
  "url": "http://localhost:5000"
}
```

#### Get Model Information
```
GET /api/training/model-info
```
**Response:**
```json
{
  "status": "success",
  "data": {
    "model_type": "random_forest",
    "is_trained": true,
    "version": "2026-04-06T...",
    "performance": {
      "accuracy": 0.92,
      "precision": 0.93,
      "recall": 0.91,
      "f1_score": 0.92
    }
  }
}
```

#### Get Feature Importance
```
GET /api/training/feature-importance
```
**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "feature": "rainfall",
      "importance": 0.35
    },
    {
      "feature": "water_level",
      "importance": 0.28
    }
  ]
}
```

## Integration Workflow

### 1. Backend Calls ML Service

```javascript
// backend/routes/predictionRoutes.js
import { MLModelService } from '../utils/mlModelService.js';

// Make predictions
const predictions = await MLModelService.batchPredict(rainfallData);
```

### 2. Predictions Saved to Database

```javascript
// Predictions are stored in MongoDB
const savedPrediction = await Prediction.findOneAndUpdate(
  { location: pred.location },
  {
    mlPrediction: {
      prediction: pred.prediction,
      predictionLabel: pred.predictionLabel,
      confidence: pred.confidence,
      modelVersion: modelInfo.version,
      modelType: modelInfo.model_type
    }
  },
  { upsert: true, new: true }
);
```

### 3. Convert to GeoJSON

```javascript
// backend/utils/geoJsonGenerator.js
const geoJson = GeoJSONGenerator.generateFromPredictions(predictions);
// Returns ready-to-use GeoJSON for Leaflet map
```

### 4. Frontend Displays Map

```javascript
// frontend/src/FloodMap/FloodMapApp.jsx
const floodData = await fetch('/api/prediction/geojson').then(r => r.json());
// Use Leaflet GeoJSON layer to display
```

## Frontend Integration Example

### Update FloodMapApp.jsx

```javascript
import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, GeoJSON, Popup } from "react-leaflet";

export default function FloodMapApp({ onBack }) {
  const [floodData, setFloodData] = useState(null);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    // Fetch predictions and convert to GeoJSON
    fetchFloodData();
    fetchSummary();
  }, []);

  const fetchFloodData = async () => {
    try {
      const response = await fetch('/api/prediction/geojson');
      const data = await response.json();
      setFloodData(data);
    } catch (error) {
      console.error('Error fetching flood data:', error);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await fetch('/api/prediction/summary');
      const data = await response.json();
      setSummary(data.summary);
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const generatePredictions = async () => {
    try {
      const response = await fetch('/api/prediction/generate-ml', {
        method: 'POST'
      });
      const result = await response.json();
      
      if (result.status === 'success') {
        fetchFloodData();
        fetchSummary();
      }
    } catch (error) {
      console.error('Error generating predictions:', error);
    }
  };

  const onEachFeature = (feature, layer) => {
    const props = feature.properties;
    layer.bindPopup(`
      <div>
        <h3>${props.location}</h3>
        <p><strong>Risk Level:</strong> ${props.riskLevel}</p>
        <p><strong>Confidence:</strong> ${props.confidence}%</p>
        <p><strong>Rainfall:</strong> ${props.rainfall}mm</p>
      </div>
    `);
  };

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <button onClick={generatePredictions}>Generate ML Predictions</button>
      </div>

      {summary && (
        <div style={{ padding: '10px', backgroundColor: '#f0f0f0', marginBottom: '20px' }}>
          <h4>Flood Risk Summary</h4>
          <p>Total Locations: {summary.totalLocations}</p>
          <p>Average Confidence: {summary.averageConfidence}%</p>
          <p>High Risk Areas: {summary.riskDistribution['High Risk'] + summary.riskDistribution['Very High Risk']}</p>
        </div>
      )}

      <MapContainer center={[7, 81]} zoom={7} style={{ height: '600px' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {floodData && <GeoJSON data={floodData} onEachFeature={onEachFeature} />}
      </MapContainer>
    </div>
  );
}
```

## Risk Levels & Colors

| Risk Level | Color | Significance |
|-----------|-------|--------------|
| Low Risk | 🟢 Green (#27AE60) | Low flood probability |
| Moderate Risk | 🟠 Orange (#F39C12) | Potential for flooding |
| High Risk | 🔴 Red (#E74C3C) | High flood probability |
| Very High Risk | 🔴 Dark Red (#8B0000) | Critical flood risk |

## Workflow: From Data to Map

```
1. Raw Rainfall Data
   ↓
2. ML Model Prediction (flood-map-model service)
   prediction = model.predict(rainfall, water_level, etc.)
   ↓
3. Save to Database (Prediction collection)
   ↓
4. Convert to GeoJSON
   geoJson = GeoJSONGenerator.generateFromPredictions(predictions)
   ↓
5. API Response (GeoJSON format)
   GET /api/prediction/geojson
   ↓
6. Frontend Renders Map
   <GeoJSON data={geoJson} />
   ↓
7. Interactive Map with Flood Predictions
   User clicks on location → sees risk level & confidence
```

## Error Handling

### ML Service Unavailable
```json
{
  "error": "ML Model service unavailable",
  "message": "Please ensure the flood-map-model service is running on port 5000"
}
```

**Solution:**
```bash
cd flood-map-model
python quickstart.py
```

### No Rainfall Data
```json
{
  "error": "No rainfall data available",
  "message": "Please add rainfall data first"
}
```

**Solution:** Add rainfall data via `/api/rainfall/add` endpoint

### No Predictions Generated
```json
{
  "type": "FeatureCollection",
  "features": [],
  "message": "No predictions available. Generate predictions first."
}
```

**Solution:** Call `POST /api/prediction/generate-ml` first

## Troubleshooting

### Port Conflicts

- **Backend (Port 3001):** `http://localhost:3001`
- **ML Service (Port 5000):** `http://localhost:5000`
- **Frontend (Port 5173):** `http://localhost:5173`

If ports are in use, change in `.env` files.

### Connection Issues

1. **Check ML Service:**
   ```bash
   curl http://localhost:5000/api/ml/health
   ```

2. **Check Backend:**
   ```bash
   curl http://localhost:3001/api/health
   ```

3. **Check Database:** Ensure MongoDB connection string is valid

### Slow Predictions

- Check ML model accuracy and performance
- Ensure sufficient rainfall/water level data
- Consider using fewer locations for batch predictions

## Files Modified/Created

```
backend/
├── .env (Updated)
│   └── Added ML_SERVICE_URL=http://localhost:5000
│   └── Changed PORT to 3001
│
├── models/
│   └── Prediction.js (Updated)
│       └── Added mlPrediction fields
│
├── routes/
│   ├── predictionRoutes.js (Updated)
│   │   ├── Added POST /generate-ml
│   │   ├── Added GET /geojson
│   │   ├── Added GET /summary
│   │   └── Added GET /heatmap
│   │
│   └── trainingRoutes.js (New)
│       ├── GET /health
│       ├── GET /model-info
│       ├── GET /feature-importance
│       └── GET /status
│
├── utils/
│   ├── mlModelService.js (New)
│   │   └── Communicates with Python ML service
│   │
│   └── geoJsonGenerator.js (New)
│       └── Converts predictions to GeoJSON
│
└── server.js (Updated)
    └── Registered trainingRouter
```

## Next Steps

1. ✅ ML service integrated with backend
2. ✅ Predictions converted to GeoJSON
3. ⬜ Update FloodMapApp.jsx to use new endpoints
4. ⬜ Add real-time prediction updates
5. ⬜ Deploy to production

## Support

For detailed information:
- **ML Service:** See `flood-map-model/README.md`
- **Backend Routes:** Check route handlers above
- **Frontend Integration:** Update FloodMapApp.jsx with examples above

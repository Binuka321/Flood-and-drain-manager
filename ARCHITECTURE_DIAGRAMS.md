# 🌊 Flood Map ML System - Visual Architecture Guide

## Complete System Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                    🌐 USER INTERFACE (React Frontend)                       │
│                         Port 5173                                          │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                      Flood Alert Dashboard                           │  │
│  │  ┌────────────────────────────────────────────────────────────────┐ │  │
│  │  │  FloodMapApp Component                                         │ │  │
│  │  │  - Leaflet Map                                                 │ │  │
│  │  │  - Geolocation Layer (GeoJSON)                                 │ │  │
│  │  │  - Risk Indicators                                             │ │  │
│  │  │  ┌──────────────────────────────┐                             │ │  │
│  │  │  │ Button: "Generate Predictions"│                             │ │  │
│  │  │  └──────┬───────────────────────┘                             │ │  │
│  │  │         │                                                      │ │  │
│  │  │  [🟢Low] [🟠Moderate] [🔴High] [🔴VeryHigh]                   │ │  │
│  │  │         Confidence: 92%                                        │ │  │
│  │  └─────────┼──────────────────────────────────────────────────────┘ │  │
│  │            │                                                         │  │
│  └────────────┼──────────────────────────────────────────────────────────┘  │
│               │ HTTP Request                                                 │
│               ▼                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐
│  │           🔵 REST LAYER (Express Backend)                             │
│  │              Port 3001                                                 │
│  │  ┌──────────────────────────────────────────────────────────────────┐ │
│  │  │ POST /api/prediction/generate-ml                                 │ │
│  │  │  └─ predictionRoutes.js                                          │ │
│  │  │     ├─ Get rainfall data from DB                                 │ │
│  │  │     ├─ Call MLModelService.batchPredict()                        │ │
│  │  │     ├─ Save results to Prediction collection                     │ │
│  │  │     └─ Return success response                                   │ │
│  │  └──────────────────────────────────────────────────────────────────┘ │
│  │                                                                        │ │
│  │  ┌──────────────────────────────────────────────────────────────────┐ │
│  │  │ GET /api/prediction/geojson                                      │ │
│  │  │  └─ predictionRoutes.js                                          │ │
│  │  │     ├─ Fetch predictions from DB                                 │ │
│  │  │     ├─ Call GeoJSONGenerator.generateFromPredictions()           │ │
│  │  │     └─ Return GeoJSON FeatureCollection                          │ │
│  │  └──────────────────────────────────────────────────────────────────┘ │
│  │                                                                        │ │
│  │  ┌──────────────────────────────────────────────────────────────────┐ │
│  │  │ GET /api/prediction/summary                                      │ │
│  │  │  └─ Fetch predictions & return statistics                        │ │
│  │  │     - Total locations                                            │ │
│  │  │     - Risk distribution                                          │ │
│  │  │     - High-risk locations                                        │ │
│  │  └──────────────────────────────────────────────────────────────────┘ │
│  │                                                                        │ │
│  │  ┌──────────────────────────────────────────────────────────────────┐ │
│  │  │ Unit 1: MLModelService                                           │ │
│  │  │  └─ mlModelService.js (180+ lines)                              │ │
│  │  │     ├─ trainModel() - Send data to ML service                    │ │
│  │  │     ├─ batchPredict() - Make batch predictions                   │ │
│  │  │     ├─ predictFloodRisk() - Single prediction                    │ │
│  │  │     ├─ getModelInfo() - Model metadata                           │ │
│  │  │     ├─ getFeatureImportance() - Feature analysis                 │ │
│  │  │     └─ isServiceAvailable() - Health check                       │ │
│  │  └──────────────────────────────────────────────────────────────────┘ │
│  │                                                                        │ │
│  │  ┌──────────────────────────────────────────────────────────────────┐ │
│  │  │ Unit 2: GeoJSONGenerator                                         │ │
│  │  │  └─ geoJsonGenerator.js (200+ lines)                            │ │
│  │  │     ├─ generateFromPredictions() - Points to GeoJSON             │ │
│  │  │     ├─ getRiskColor() - Risk → Color mapping                     │ │
│  │  │     ├─ calculateRiskDistribution() - Statistics                  │ │
│  │  │     ├─ generateHeatmapData() - Heatmap layer                     │ │
│  │  │     └─ generateSummary() - Summary stats                         │ │
│  │  └──────────────────────────────────────────────────────────────────┘ │
│  │                                                                        │ │
│  └───────────┬──────────────────────────────────────────────────────────┘ │
│              │ REST Calls                 │ Database Queries               │
│              │ (HTTP)                     │ (MongoDB)                      │
└──────────────┼────────────────────────────┼──────────────────────────────┘
               │                            │
               ▼                            ▼
   ┌──────────────────────┐      ┌──────────────────────┐
   │  🟣 ML Service       │      │  💾 Database         │
   │  (Python Flask)      │      │  MongoDB Atlas       │
   │  Port 5000           │      │                      │
   │                      │      │  Collections:        │
   │ ┌──────────────────┐ │      │  - Users             │
   │ │ Random Forest    │ │      │  - Rainfall          │
   │ │ Gradient Boosting│ │      │  - Predictions       │
   │ │                  │ │      │  - Weather           │
   │ │ Trained on:      │ │      └──────────────────────┘
   │ │ - Rainfall data  │ │
   │ │ - Flood history  │ │
   │ │ - Water levels   │ │      Prediction Document:
   │ │                  │ │      {
   │ │ Outputs:         │ │        location: "Colombo",
   │ │ - Prediction (0-3)│       latitude: 6.9271,
   │ │ - Confidence (%)  │       longitude: 80.7789,
   │ │ - Probabilities   │       rainfall: 150.5,
   │ │ - Features used   │       waterLevel: 3.2,
   │ └──────────────────┘ │       mlPrediction: {
   │                      │         prediction: 2,
   │ REST API:            │         predictionLabel: "High Risk",
   │ - /api/ml/training   │         confidence: 0.92
   │ - /api/ml/prediction │       },
   │ - /api/ml/health     │       timestamp: Date
   │                      │      }
   └──────────────────────┘
```

## Data Flow Sequence

```
1. USER ACTION
   └─► Click "Generate Predictions" button

2. FRONTEND REQUEST
   └─► POST /api/prediction/generate-ml

3. BACKEND PROCESSING
   ├─► Get rainfall data from DB
   ├─► Call MLModelService.batchPredict()
   │   └─► HTTP → Python ML Service
   │       └─► Random Forest model predicts
   │           └─► Returns: prediction, confidence
   ├─► Save to MongoDB Prediction collection
   └─► Return success response

4. FRONTEND FETCHES MAP DATA
   └─► GET /api/prediction/geojson

5. BACKEND CONVERTS TO GEOJSON
   ├─► Fetch predictions from DB
   ├─► GeoJSONGenerator.generateFromPredictions()
   │   ├─► Create Feature objects with coordinates
   │   ├─► Apply risk colors (Green→Red)
   │   └─► Add properties (location, confidence, etc.)
   └─► Return GeoJSON FeatureCollection

6. FRONTEND RENDERS MAP
   ├─► Parse GeoJSON
   ├─► Create Leaflet markers/circles
   ├─► Style by risk level
   (🟢 green, 🟠 orange, 🔴 red, 🔴 dark red)
   └─► Add popup on click

7. USER SEES FLOOD MAP
   └─► Interactive map with color-coded risk
       - Click marker → see details
       - See summary statistics
       - Risk breakdown by district
```

## Component Communication

```
FloodMapApp.jsx
    ↓ (onClick)
[Generate Predictions Button]
    ↓ POST /api/prediction/generate-ml
predictionRoutes.js (generate-ml handler)
    ↓ calls
MLModelService.batchPredict()
    ↓ HTTP POST
flood-map-model/api/ml/prediction/predict
    ↓ ML Model returns predictions
Prediction Schema (MongoDB)
    ↓ saved by predictionRoutes.js
predictionRoutes.js (geojson handler)
    ↓ GET /api/prediction/geojson
GeoJSONGenerator.generateFromPredictions()
    ↓ converts to GeoJSON
FloodMapApp.jsx
    ↓ receives GeoJSON
<GeoJSON layer> on Leaflet map
    ↓ displays
User sees flood risk map
```

## Risk Level Color Scheme

```
┌──────────────────────────────────────────┐
│         FLOOD RISK VISUALIZATION          │
├──────────────────────────────────────────┤
│                                          │
│  🟢 LOW RISK          #27AE60            │
│     Safe conditions, minimal flooding    │
│     Confidence: Various                  │
│                                          │
│  🟠 MODERATE RISK     #F39C12            │
│     Potential for flooding               │
│     Alert status: Watch                  │
│                                          │
│  🔴 HIGH RISK         #E74C3C            │
│     High flood probability               │
│     Alert status: Warning                │
│                                          │
│  🔴 VERY HIGH RISK    #8B0000            │
│     Critical flood conditions            │
│     Alert status: Critical               │
│                                          │
└──────────────────────────────────────────┘

Risk Score Mapping:
0 → Green (Low Risk)
1 → Orange (Moderate Risk)
2 → Red (High Risk)
3 → Dark Red (Very High Risk)

Confidence: 0-1 (0% - 100%)
```

## API Endpoint Map

```
┌─ Frontend (React) ─────┐
│       5173             │
│                        │
│ FloodMapApp.jsx        │
└────────┬───────────────┘
         │ HTTP REST
         ▼
┌─ Backend (Express) ─────────────────────────┐
│          3001                               │
│                                             │
│  PREDICTION ROUTES                          │
│  ├─ POST /api/prediction/generate-ml        │
│  │  └─ Trigger ML predictions              │
│  │     └─ MLModelService.batchPredict()    │
│  │        └─ Returns: {predictions, ...}   │
│  │                                          │
│  ├─ GET /api/prediction/geojson            │
│  │  └─ Fetch map data                      │
│  │     └─ GeoJSONGenerator.generate...()   │
│  │        └─ Returns: {"features": [...]}  │
│  │                                          │
│  ├─ GET /api/prediction/summary            │
│  │  └─ Fetch statistics                    │
│  │     └─ Risk distribution, counts        │
│  │                                          │
│  └─ GET /api/prediction/heatmap            │
│     └─ Fetch heatmap data                  │
│        └─ Returns: [[lat,lon,intensity]]   │
│                                             │
│  TRAINING ROUTES                            │
│  ├─ GET /api/training/health               │
│  ├─ GET /api/training/model-info           │
│  ├─ GET /api/training/feature-importance   │
│  └─ GET /api/training/status               │
│                                             │
│  SERVICE LAYER                              │
│  ├─ MLModelService                         │
│  │  └─ Communicates with Python service    │
│  │     ├─ trainModel()                     │
│  │     ├─ batchPredict()                   │
│  │     └─ getModelInfo()                   │
│  │                                          │
│  └─ GeoJSONGenerator                       │
│     └─ Converts predictions to map format  │
│        ├─ generateFromPredictions()        │
│        ├─ getRiskColor()                   │
│        └─ generateSummary()                │
│                                             │
│  DATABASE MODELS                            │
│  └─ Prediction Schema                      │
│     ├─ location                            │
│     ├─ latitude, longitude                 │
│     ├─ mlPrediction {...}                  │
│     └─ timestamp                           │
│                                             │
└─────────┬──────────────────────────────────┘
          │ HTTP/Socket
          ▼
┌─ ML Service (Flask) ──────────┐     ┌─ Database ──────────┐
│       5000                    │     │ MongoDB Atlas       │
│                               │     │                     │
│  ML Prediction API            │     │ Collections:        │
│  ├─ POST .../training/train   │     │ - Predictions      │
│  ├─ POST .../prediction/      │     │ - Rainfall         │
│  │       predict              │     │ - Users            │
│  ├─ GET .../prediction/       │     │ - Weather          │
│  │       model-info           │     │                     │
│  └─ GET .../health            │     └─────────────────────┘
│                               │
│  Services:                    │
│  ├─ Random Forest Model      │
│  ├─ Gradient Boosting Model  │
│  ├─ Data Preprocessing       │
│  └─ Model Persistence        │
│                               │
└───────────────────────────────┘
```

## File Structure & Relationships

```
frontend/
└─ src/FloodMap/
   └─ FloodMapApp.jsx
      ├─ fetch /api/prediction/generate-ml
      ├─ fetch /api/prediction/geojson
      └─ render GeoJSON on Leaflet map

backend/
├─ models/
│  └─ Prediction.js (Schema with mlPrediction)
│
├─ routes/
│  ├─ predictionRoutes.js (Updated - 150 lines)
│  │  ├─ generate-ml handler
│  │  │  └─ calls MLModelService.batchPredict()
│  │  ├─ geojson handler
│  │  │  └─ calls GeoJSONGenerator
│  │  └─ summary handler
│  │
│  └─ trainingRoutes.js (New - 80 lines)
│     └─ health, model-info, feature-importance
│
├─ utils/
│  ├─ mlModelService.js (New - 180 lines)
│  │  └─ Bridge to Python ML service
│  │
│  └─ geoJsonGenerator.js (New - 200 lines)
│     └─ Converts predictions → GeoJSON
│
├─ server.js (Updated)
│  └─ Registered trainingRouter
│
└─ .env (Updated)
   └─ ML_SERVICE_URL, PORT changed

flood-map-model/
├─ app.py
├─ models/
├─ routes/
└─ requirements.txt
```

## Summary: What Each Layer Does

```
┌──────────────────────────────────────────────────────┐
│  FRONTEND LAYER (React)                              │
│  Responsibility: User interface & visualization      │
│  - Display Leaflet map                              │
│  - Show flood risk with colors                      │
│  - Handle user interactions                         │
└─────────────────┬──────────────────────────────────┘
                  │ REST API Calls
┌─────────────────▼──────────────────────────────────┐
│  BACKEND LAYER (Express)                            │
│  Responsibility: API, routing, data management      │
│  - Receive predictions request                     │
│  - Call ML service                                 │
│  - Save results to DB                              │
│  - Convert to map format                           │
│  - Return API responses                            │
├──────────────────────────────────────────────────────┤
│  SERVICE LAYER (Node.js modules)                    │
│  - MLModelService: interfaces with Python           │
│  - GeoJSONGenerator: transforms data               │
├──────────────────────────────────────────────────────┤
│  DATABASE LAYER (MongoDB)                           │
│  - Stores predictions                              │
│  - Stores rainfall data                            │
│  - Persistent storage                              │
└──────────────────────────────────────────────────────┘
                  │ REST API Calls
┌─────────────────▼──────────────────────────────────┐
│  ML SERVICE LAYER (Python/Flask)                   │
│  Responsibility: Machine Learning predictions      │
│  - Train models                                    │
│  - Make predictions                                │
│  - Provide model info                              │
└──────────────────────────────────────────────────────┘
```

---

This architecture provides a complete, scalable system for ML-powered flood prediction with geospatial visualization!

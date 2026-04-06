# 🚀 Flood Map ML Integration - Quick Reference

## ⚡ Quick Start (5 minutes)

### Step 1: Start ML Service (Terminal 1)
```bash
cd flood-map-model
python quickstart.py
```
✅ ML service running on `http://localhost:5000`

### Step 2: Start Backend (Terminal 2)
```bash
cd backend
npm start
```
✅ Backend running on `http://localhost:3001`

### Step 3: Start Frontend (Terminal 3)
```bash
cd frontend
npm run dev
```
✅ Frontend running on `http://localhost:5173`

## 📊 Core Workflow

```
Button: "Generate ML Predictions"
    ↓
POST /api/prediction/generate-ml
    ↓
Backend calls flood-map-model ML service
    ↓
ML predictions returned
    ↓
Save to MongoDB
    ↓
GET /api/prediction/geojson
    ↓
Convert to GeoJSON format
    ↓
Frontend renders Leaflet map with flood risk
```

## 🎯 Key Endpoints

### Generate Predictions
```bash
curl -X POST http://localhost:3001/api/prediction/generate-ml
```

### Get Map Data (GeoJSON)
```bash
curl http://localhost:3001/api/prediction/geojson
```

### Get Statistics
```bash
curl http://localhost:3001/api/prediction/summary
```

### Check ML Service Health
```bash
curl http://localhost:3001/api/training/health
```

## 💻 Frontend Code Snippet

```javascript
// Fetch and display flood map
const response = await fetch('/api/prediction/geojson');
const geoJsonData = await response.json();

<GeoJSON 
  data={geoJsonData} 
  onEachFeature={(feature, layer) => {
    layer.bindPopup(`
      <h3>${feature.properties.location}</h3>
      <p>Risk: ${feature.properties.riskLevel}</p>
      <p>Confidence: ${feature.properties.confidence}%</p>
    `);
  }}
/>
```

## 🎨 Risk Colors

- 🟢 **Low Risk** - Safe (`#27AE60`)
- 🟠 **Moderate Risk** - Be cautious (`#F39C12`)
- 🔴 **High Risk** - Alert (`#E74C3C`)
- 🔴 **Very High Risk** - Critical (`#8B0000`)

## 📁 Key Files

| File | Purpose |
|------|---------|
| `backend/utils/mlModelService.js` | Communicates with ML service |
| `backend/utils/geoJsonGenerator.js` | Converts predictions to map format |
| `backend/routes/predictionRoutes.js` | Prediction API endpoints |
| `backend/routes/trainingRoutes.js` | ML model management |
| `backend/models/Prediction.js` | Database schema |

## 🔌 Port Configuration

```
Frontend:  3173 (or 5173)
Backend:   3001
ML Service: 5000
MongoDB:   Atlas (cloud)
```

## ✅ Complete API List

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/prediction/generate-ml` | Generate predictions using ML |
| GET | `/api/prediction/geojson` | Get GeoJSON for map |
| GET | `/api/prediction/summary` | Get risk statistics |
| GET | `/api/prediction/heatmap` | Get heatmap data |
| GET | `/api/prediction/:location` | Get single location |
| GET | `/api/training/health` | ML service status |
| GET | `/api/training/model-info` | Model details |
| GET | `/api/training/feature-importance` | Feature analysis |

## 🐛 Quick Troubleshooting

### ML Service Not Working?
```bash
# Check if running
curl http://localhost:5000/api/ml/health

# Start it
cd flood-map-model && python quickstart.py
```

### No Predictions?
```bash
# First add rainfall data via frontend
# Then call: POST /api/prediction/generate-ml
```

### Port Already in Use?
Update `.env` files in backend and flood-map-model to use different ports.

## 📈 Data Flow

```
Rainfall Data (DB)
    ↓
ML Model Prediction
    ↓
Risk Scores + Confidence
    ↓
GeoJSON Conversion
    ↓
Leaflet Map Display
    ↓
User sees Flood Risk Map
```

## 🎓 Understanding Response

```json
{
  "prediction": 2,              // 0=Low, 1=Moderate, 2=High, 3=Very High
  "predictionLabel": "High Risk",
  "confidence": 0.92,           // 0-1 (92% confident)
  "modelType": "random_forest",
  "timestamp": "2026-04-06T..."
}
```

## 💡 Tips

1. **Always generate predictions** before trying to view the map
2. **Check ML health** if predictions seem wrong
3. **Use `/summary` endpoint** for quick statistics
4. **Feature importance** helps understand what matters
5. **Batch predictions** are faster than single predictions

## 🚨 Common Issues

| Issue | Solution |
|-------|----------|
| "Service unavailable" | Start ML service: `python flood-map-model/quickstart.py` |
| "No data available" | Add rainfall data first |
| "Empty map" | Call `POST /api/prediction/generate-ml` |
| "Slow predictions" | Check model accuracy & increase data |

## 📝 Environment Variables

```env
# backend/.env
PORT=3001
ML_SERVICE_URL=http://localhost:5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=...

# flood-map-model/.env
FLASK_ENV=development
ML_SERVICE_PORT=5000
MODEL_PATH=./models/saved_models
DATA_PATH=./data/datasets
```

## 🎬 Demo Scenario

1. **Upload rainfall data** via `/api/rainfall/add`
2. **Generate predictions:** `curl -X POST localhost:3001/api/prediction/generate-ml`
3. **View map:** Frontend loads GeoJSON from `/api/prediction/geojson`
4. **See results:** Map shows district flood risks with confidence levels
5. **Get stats:** `curl localhost:3001/api/prediction/summary`

## 🔗 Component Links

```
Frontend (FloodMapApp.jsx)
    ↓
Backend Routes (predictionRoutes.js)
    ↓
ML Model Service (mlModelService.js)
    ↓
Python Service (flood-map-model)
    ↓
Machine Learning Model
```

---

**Status: ✅ Ready to Use**

Start with Step 1 and you'll have a working flood prediction map in 5 minutes!

# ML Microservice Integration Guide

This guide explains how to integrate the Python ML microservice with your Node.js backend.

## Architecture Overview

```
┌─────────────────┐
│   Frontend      │
│   (React/Vue)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐          ┌──────────────────┐
│  Node.js Backend│◄────────►│ Python ML Service│
│   (Express)     │  REST API│   (Flask)        │
└─────────────────┘          └──────────────────┘
         │
         ▼
┌─────────────────┐
│   MongoDB       │
└─────────────────┘
```

## Setup Instructions

### 1. Start the ML Microservice

```bash
cd ml-service

# On Windows
run.bat

# On macOS/Linux
bash run.sh

# Or with Python directly
python app.py
```

The service will start on `http://localhost:5000`

### 2. Update your Node.js Backend

Add the ML service URL to your `.env` file:

```env
ML_SERVICE_URL=http://localhost:5000
ML_API_BASE_PATH=/api/ml
```

### 3. Create a New Route for ML Integration

Create a file `backend/routes/mlRoutes.js`:

```javascript
import express from 'express';
import fetch from 'node-fetch';

export const mlRouter = express.Router();

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5000';

// Train a new model
mlRouter.post('/train', async (req, res) => {
  try {
    const { rainfallData, floodImpactData, modelName, modelType } = req.body;
    
    const response = await fetch(`${ML_SERVICE_URL}/api/ml/training/train`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rainfall_data: {
          data: rainfallData,
          format: 'json'
        },
        flood_impact_data: {
          data: floodImpactData,
          format: 'json'
        },
        target_column: 'risk_level',
        model_type: modelType || 'random_forest',
        save_model: true,
        model_name: modelName || 'flood_model_default'
      })
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json(result);
    }
    
    // Save training record to MongoDB
    // const training = new Training({
    //   modelName: modelName,
    //   modelType: modelType,
    //   accuracy: result.metrics.test_accuracy,
    //   trainedAt: new Date(),
    //   metrics: result.metrics
    // });
    // await training.save();
    
    res.json({
      status: 'success',
      message: 'Model trained successfully',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      error: 'Training failed',
      details: error.message
    });
  }
});

// Make prediction
mlRouter.post('/predict', async (req, res) => {
  try {
    const features = req.body;
    
    const response = await fetch(`${ML_SERVICE_URL}/api/ml/prediction/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ features })
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json(result);
    }
    
    // Save prediction to MongoDB
    // const prediction = new Prediction({
    //   features: features,
    //   prediction: result.prediction,
    //   confidence: result.confidence,
    //   predictionLabel: result.prediction_label,
    //   createdAt: new Date()
    // });
    // await prediction.save();
    
    res.json({
      status: 'success',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      error: 'Prediction failed',
      details: error.message
    });
  }
});

// Get model info
mlRouter.get('/model-info', async (req, res) => {
  try {
    const response = await fetch(`${ML_SERVICE_URL}/api/ml/prediction/model-info`);
    const result = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json(result);
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get model info',
      details: error.message
    });
  }
});

// Get feature importance
mlRouter.get('/feature-importance', async (req, res) => {
  try {
    const response = await fetch(`${ML_SERVICE_URL}/api/ml/prediction/feature-importance`);
    const result = await response.json();
    
    if (!response.ok) {
      return res.status(response.status).json(result);
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get feature importance',
      details: error.message
    });
  }
});
```

### 4. Register the Route in server.js

```javascript
import { mlRouter } from './routes/mlRoutes.js';

// ... other imports and setup ...

app.use('/api/ml', mlRouter);
```

## API Integration Examples

### Training Workflow

```javascript
// 1. Collect rainfall data from sensors or database
const rainfallData = await getRainfallData({
  startDate: '2024-01-01',
  endDate: '2024-12-31'
});

// 2. Collect flood impact data
const floodImpactData = await getFloodImpactData({
  startDate: '2024-01-01',
  endDate: '2024-12-31'
});

// 3. Send to backend to train model
const response = await fetch('/api/ml/train', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    rainfallData,
    floodImpactData,
    modelName: `flood_model_${new Date().getFullYear()}`,
    modelType: 'random_forest'
  })
});

const result = await response.json();
console.log('Model trained:', result.data.metrics);
```

### Prediction Workflow

```javascript
// 1. Collect current sensor data
const currentData = {
  rainfall: getSensorValue('rainfall'),
  temperature: getSensorValue('temperature'),
  latitude: location.lat,
  longitude: location.lng,
  humidity: getSensorValue('humidity')
};

// 2. Send to backend for prediction
const response = await fetch('/api/ml/predict', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(currentData)
});

const prediction = await response.json();

// 3. Handle prediction result
if (prediction.data.prediction_label === 'High Risk') {
  triggerFloodAlert(prediction.data.confidence);
}
```

### Batch Predictions

```javascript
// Make predictions for multiple locations
const locations = await getMonitoredLocations();
const features = locations.map(loc => [
  loc.rainfall,
  loc.temperature,
  loc.latitude,
  loc.longitude,
  loc.humidity
]);

const response = await fetch(`${ML_SERVICE_URL}/api/ml/prediction/predict`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ features })
});

const predictions = await response.json();

// Process batch results
predictions.data.predictions.forEach((pred, index) => {
  const location = locations[index];
  updateLocationRisk(location.id, pred.prediction_label, pred.confidence);
});
```

## Frontend Integration (React)

### Custom Hook for ML Service

```typescript
// hooks/useMLService.ts
import { useState, useCallback } from 'react';

export const useMLService = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const trainModel = useCallback(async (rainfallData, floodImpactData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/ml/train', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rainfallData,
          floodImpactData,
          modelName: `model_${Date.now()}`
        })
      });

      if (!response.ok) throw new Error('Training failed');
      return await response.json();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const predict = useCallback(async (features) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/ml/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(features)
      });

      if (!response.ok) throw new Error('Prediction failed');
      return await response.json();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { trainModel, predict, loading, error };
};
```

### Use in Component

```typescript
// components/ModelTrainer.tsx
import { useMLService } from '@/hooks/useMLService';

export function ModelTrainer() {
  const { trainModel, loading, error } = useMLService();

  const handleTrain = async () => {
    try {
      const rainfallData = await fetchRainfallData();
      const floodImpactData = await fetchFloodImpactData();
      
      const result = await trainModel(rainfallData, floodImpactData);
      console.log('Model trained:', result.data.metrics);
    } catch (err) {
      console.error('Training error:', err);
    }
  };

  return (
    <button onClick={handleTrain} disabled={loading}>
      {loading ? 'Training...' : 'Train Model'}
    </button>
  );
}
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Application                       │
│           (React Dashboard / FloodAlertDashboard)            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ HTTP/REST
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   Node.js Express Backend                     │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  Routes                                                 │ │
│  │  - /api/auth        (Authentication)                   │ │
│  │  - /api/rainfall    (Rainfall data)                    │ │
│  │  - /api/prediction  (Predictions from DB)             │ │
│  │  - /api/ml          (ML Service proxy) ◄──┐           │ │
│  └─────────────────────────────────────────────────────────┘ │
│                     │                         │               │
│                     ▼                         │               │
│           ┌───────────────┐                  │               │
│           │   MongoDB     │                  │               │
│           │   Database    │                  │               │
│           └───────────────┘                  │               │
└─────────────────────────────────────────────┼───────────────┘
                                              │
                                              │ HTTP/REST
                                              │
                                              ▼
                         ┌─────────────────────────────────────┐
                         │   Python Flask ML Microservice      │
                         │  ┌──────────────────────────────────┐
                         │  │ Routes                           │
                         │  │ - /api/ml/training/train         │
                         │  │ - /api/ml/prediction/predict     │
                         │  │ - /api/ml/training/status        │
                         │  │ - /api/ml/prediction/model-info  │
                         │  └──────────────────────────────────┘
                         │  ┌──────────────────────────────────┐
                         │  │ Models                           │
                         │  │ - Random Forest                  │
                         │  │ - Gradient Boosting             │
                         │  └──────────────────────────────────┘
                         └─────────────────────────────────────┘
```

## Monitoring and Logging

### Add Logging to Backend

```javascript
// Middleware for logging ML requests
app.use('/api/ml', (req, res, next) => {
  console.log(`[ML API] ${req.method} ${req.path}`);
  console.time(`[ML API] ${req.method} ${req.path}`);
  
  res.on('finish', () => {
    console.timeEnd(`[ML API] ${req.method} ${req.path}`);
    console.log(`[ML API] Status: ${res.statusCode}`);
  });
  
  next();
});
```

### Health Checks

```javascript
// Verify ML service is running
setInterval(async () => {
  try {
    const response = await fetch(`${ML_SERVICE_URL}/api/ml/health`);
    if (response.ok) {
      console.log('✅ ML Service is running');
    }
  } catch (error) {
    console.error('❌ ML Service is down:', error.message);
    // Consider alerting infrastructure team
  }
}, 60000); // Check every minute
```

## Troubleshooting

### Connection Issues
- Verify ML service is running on port 5000
- Check firewall settings
- Ensure ML_SERVICE_URL is correctly configured

### Data Validation Errors
- Check dataset format matches expected schema
- Ensure required columns are present
- Validate data types

### Model Performance
- Check training metrics in response
- Analyze feature importance
- Consider hyperparameter tuning

## Next Steps

1. ✅ ML Microservice is ready
2. ⬜ Integrate with Node.js backend
3. ⬜ Add database models for tracking training/predictions
4. ⬜ Implement UI for model training and monitoring
5. ⬜ Setup automated retraining schedules
6. ⬜ Add model versioning and rollback capabilities

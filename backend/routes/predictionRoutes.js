import express from 'express';
import Rainfall from '../models/Rainfall.js';
import Prediction from '../models/Prediction.js';
import { MLModelService } from '../utils/mlModelService.js';
import { GeoJSONGenerator } from '../utils/geoJsonGenerator.js';

const router = express.Router();

/**
 * Generate flood predictions using ML model
 * POST /api/prediction/generate-ml
 */
router.post('/generate-ml', async (req, res) => {
  try {
    // Check if ML service is available
    const mlAvailable = await MLModelService.isServiceAvailable();
    if (!mlAvailable) {
      return res.status(503).json({ 
        error: 'ML Model service unavailable',
        message: 'Please ensure the flood-map-model service is running on port 5000'
      });
    }

    // Get rainfall data from database
    const rainfallData = await Rainfall.find();
    
    if (rainfallData.length === 0) {
      return res.status(400).json({ 
        error: 'No rainfall data available',
        message: 'Please add rainfall data first'
      });
    }

    // Make batch predictions with ML model
    const predictions = await MLModelService.batchPredict(
      rainfallData.map(item => ({
        location: item.location,
        latitude: item.latitude,
        longitude: item.longitude,
        rainfall: item.rainfall,
        waterLevel: item.waterLevel || 2.5,
        humidity: 75
      }))
    );

    // Get model info for tracking
    const modelInfo = await MLModelService.getModelInfo();

    // Save predictions to database
    const savedPredictions = [];
    for (let pred of predictions) {
      const saved = await Prediction.findOneAndUpdate(
        { location: pred.location },
        {
          location: pred.location,
          latitude: pred.latitude,
          longitude: pred.longitude,
          rainfall: pred.rainfall,
          waterLevel: pred.waterLevel,
          mlPrediction: {
            prediction: pred.prediction,
            predictionLabel: pred.predictionLabel,
            confidence: pred.confidence,
            modelVersion: modelInfo.version,
            modelType: modelInfo.model_type
          },
          // Keep FRI for backward compatibility
          riskLevel: pred.predictionLabel,
          updatedAt: new Date()
        },
        { upsert: true, returnDocument: 'after' }
      );
      savedPredictions.push(saved);
    }

    res.json({
      status: 'success',
      message: 'Predictions generated successfully',
      data: {
        totalPredictions: savedPredictions.length,
        predictions: savedPredictions,
        modelInfo: {
          type: modelInfo.model_type,
          version: modelInfo.version,
          accuracy: modelInfo.performance?.accuracy,
          metrics: modelInfo.performance
        }
      }
    });
  } catch (error) {
    console.error('Prediction generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate predictions',
      details: error.message 
    });
  }
});

/**
 * Get predictions as GeoJSON for Flood Map
 * GET /api/prediction/geojson
 */
router.get('/geojson', async (req, res) => {
  try {
    const predictions = await Prediction.find().sort({ updatedAt: -1 });
    
    if (predictions.length === 0) {
      return res.json({
        type: 'FeatureCollection',
        features: [],
        message: 'No predictions available. Generate predictions first.'
      });
    }

    // Convert to display format
    const displayPredictions = predictions.map(pred => ({
      location: pred.location,
      latitude: pred.latitude,
      longitude: pred.longitude,
      rainfall: pred.rainfall,
      waterLevel: pred.waterLevel,
      predictionLabel: pred.mlPrediction?.predictionLabel || pred.riskLevel,
      confidence: pred.mlPrediction?.confidence || 0.5,
      timestamp: pred.updatedAt
    }));

    // Generate GeoJSON
    const geoJson = GeoJSONGenerator.generateFromPredictions(displayPredictions);

    res.json(geoJson);
  } catch (error) {
    console.error('GeoJSON generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate GeoJSON',
      details: error.message 
    });
  }
});

/**
 * Get flood map summary with statistics
 * GET /api/prediction/summary
 */
router.get('/summary', async (req, res) => {
  try {
    const predictions = await Prediction.find();
    
    if (predictions.length === 0) {
      return res.json({
        message: 'No predictions available',
        summary: null
      });
    }

    // Convert to display format
    const displayPredictions = predictions.map(pred => ({
      location: pred.location,
      latitude: pred.latitude,
      longitude: pred.longitude,
      rainfall: pred.rainfall,
      waterLevel: pred.waterLevel,
      predictionLabel: pred.mlPrediction?.predictionLabel || pred.riskLevel,
      confidence: pred.mlPrediction?.confidence || 0.5,
      timestamp: pred.updatedAt
    }));

    const summary = GeoJSONGenerator.generateSummary(displayPredictions);

    res.json({
      status: 'success',
      summary: summary
    });
  } catch (error) {
    console.error('Summary error:', error);
    res.status(500).json({ 
      error: 'Failed to generate summary',
      details: error.message 
    });
  }
});

/**
 * Get heatmap data for visualization
 * GET /api/prediction/heatmap
 */
router.get('/heatmap', async (req, res) => {
  try {
    const predictions = await Prediction.find();
    
    const displayPredictions = predictions.map(pred => ({
      location: pred.location,
      latitude: pred.latitude,
      longitude: pred.longitude,
      rainfall: pred.rainfall,
      waterLevel: pred.waterLevel,
      predictionLabel: pred.mlPrediction?.predictionLabel || pred.riskLevel,
      confidence: pred.mlPrediction?.confidence || 0.5
    }));

    const heatmapData = GeoJSONGenerator.generateHeatmapData(displayPredictions);

    res.json({
      status: 'success',
      data: heatmapData
    });
  } catch (error) {
    console.error('Heatmap generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate heatmap data',
      details: error.message 
    });
  }
});

/**
 * Get single location prediction
 * GET /api/prediction/location/:location
 */
router.get('/location/:location', async (req, res) => {
  try {
    const prediction = await Prediction.findOne({ location: req.params.location });
    
    if (!prediction) {
      return res.status(404).json({ 
        error: 'Prediction not found for location',
        location: req.params.location
      });
    }

    res.json({
      status: 'success',
      data: prediction
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch prediction',
      details: error.message 
    });
  }
});

/**
 * Make a single ML prediction and save it to MongoDB
 * POST /api/prediction/predict
 */
router.post('/predict', async (req, res) => {
  try {
    const {
      location,
      latitude,
      longitude,
      rainfall,
      waterLevel,
      humidity = 75
    } = req.body;

    if (!location || latitude === undefined || longitude === undefined || rainfall === undefined || waterLevel === undefined) {
      return res.status(400).json({
        error: 'Missing required prediction fields',
        required: ['location', 'latitude', 'longitude', 'rainfall', 'waterLevel']
      });
    }

    const mlPrediction = await MLModelService.predictFloodRisk(
      location,
      rainfall,
      waterLevel,
      latitude,
      longitude,
      humidity
    );

    let modelInfo = { version: 'unknown', model_type: 'unknown' };
    try {
      modelInfo = await MLModelService.getModelInfo();
    } catch (err) {
      console.warn('Could not fetch model info:', err.message);
    }

    const savedPrediction = await Prediction.findOneAndUpdate(
      { location },
      {
        location,
        latitude,
        longitude,
        rainfall,
        waterLevel,
        humidity,
        mlPrediction: {
          prediction: mlPrediction.prediction,
          predictionLabel: mlPrediction.predictionLabel,
          confidence: mlPrediction.confidence,
          modelVersion: modelInfo.version,
          modelType: modelInfo.model_type
        },
        riskLevel: mlPrediction.predictionLabel,
        updatedAt: new Date()
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );

    res.json({
      status: 'success',
      message: 'ML prediction saved to MongoDB',
      data: savedPrediction
    });
  } catch (error) {
    console.error('ML prediction save error:', error);
    res.status(500).json({
      error: 'Failed to make and save ML prediction',
      details: error.message
    });
  }
});

/**
 * Get all predictions (traditional endpoint)
 * GET /api/prediction
 */
router.get('/', async (req, res) => {
  try {
    const data = await Prediction.find().sort({ updatedAt: -1 });
    res.json(data);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch predictions',
      details: error.message 
    });
  }
});

/**
 * Generate prediction (legacy - ADMIN ONLY)
 * Uses simple formula instead of ML model
 */
router.post('/generate', async (req, res) => {
  try {
    const data = await Rainfall.find();

    const results = [];

    for (let item of data) {
      // Legacy simple formula
      const FRI =
        (0.5 * (item.waterLevel / 2.5)) +
        (0.3 * (item.rainfall / 120)) +
        (0.2 * Math.random());

      let riskLevel = 'Low';
      if (FRI > 0.7) riskLevel = 'High';
      else if (FRI > 0.4) riskLevel = 'Medium';

      const prediction = await Prediction.create({
        location: item.location,
        latitude: item.latitude,
        longitude: item.longitude,
        rainfall: item.rainfall,
        waterLevel: item.waterLevel,
        FRI,
        riskLevel,
        mlPrediction: {
          prediction: FRI > 0.7 ? 2 : FRI > 0.4 ? 1 : 0,
          predictionLabel: riskLevel,
          confidence: 0.6,
          modelVersion: 'legacy_formula',
          modelType: 'simple_formula'
        }
      });

      results.push(prediction);
    }

    res.json({
      status: 'success',
      message: 'Legacy predictions generated',
      data: results
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to generate legacy predictions',
      details: error.message 
    });
  }
});

export { router as predictionRouter };
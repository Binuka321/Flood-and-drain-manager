import mongoose from 'mongoose';

const predictionSchema = new mongoose.Schema({
  location: String,
  latitude: Number,
  longitude: Number,
  rainfall: Number,
  waterLevel: Number,
  humidity: { type: Number, default: 75 },
  // ML Model Prediction Data
  mlPrediction: {
    prediction: mongoose.Schema.Types.Mixed, // numeric or label output from ML model
    predictionLabel: String,   // 'Low Risk', 'Moderate Risk', etc.
    confidence: Number,        // 0-1 confidence score
    modelVersion: String,      // Model version used
    modelType: String          // 'random_forest' or 'gradient_boosting'
  },
  // Legacy FRI field for backward compatibility
  FRI: Number,
  riskLevel: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Prediction', predictionSchema);
import mongoose from 'mongoose';

const predictionSchema = new mongoose.Schema({
  location: String,
  latitude: Number,
  longitude: Number,
  FRI: Number,
  riskLevel: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Prediction', predictionSchema);
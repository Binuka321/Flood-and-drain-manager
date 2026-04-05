import mongoose from 'mongoose';

const rainfallSchema = new mongoose.Schema({
  location: String,
  latitude: Number,
  longitude: Number,
  rainfall: Number,
  waterLevel: Number,
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('Rainfall', rainfallSchema);
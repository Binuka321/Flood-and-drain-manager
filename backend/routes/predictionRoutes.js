import express from 'express';
import Rainfall from '../models/Rainfall.js';
import Prediction from '../models/Prediction.js';

const router = express.Router();

// Generate prediction (ADMIN ONLY)
router.post('/generate', async (req, res) => {
  const data = await Rainfall.find();

  const results = [];

  for (let item of data) {
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
      FRI,
      riskLevel
    });

    results.push(prediction);
  }

  res.json(results);
});

// Get predictions
router.get('/', async (req, res) => {
  const data = await Prediction.find().sort({ createdAt: -1 });
  res.json(data);
});

export { router as predictionRouter };
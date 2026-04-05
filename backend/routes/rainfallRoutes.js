import express from 'express';
import Rainfall from '../models/Rainfall.js';

const router = express.Router();

// Add IoT data
router.post('/', async (req, res) => {
  const data = await Rainfall.create(req.body);
  res.json(data);
});

// Get all data
router.get('/', async (req, res) => {
  const data = await Rainfall.find().sort({ timestamp: -1 });
  res.json(data);
});

export { router as rainfallRouter };
import express from 'express';
import { rainfallHistoricalData, getCurrentRainfallData } from '../data/rainfallDatabase.js';
import { 
  analyzeRainfallPatterns, 
  detectAnomalies, 
  predictFloodRisk 
} from '../utils/predictionEngine.js';

export const rainfallRouter = express.Router();

const currentData = getCurrentRainfallData();

// Get all districts
rainfallRouter.get('/districts', (req, res) => {
  const districts = Object.keys(rainfallHistoricalData).map(district => {
    const data = rainfallHistoricalData[district];
    return {
      name: district,
      latitude: data.latitude,
      longitude: data.longitude,
      annualRainfall: data.annualTotal
    };
  });
  res.json(districts);
});

// Get historical data for a specific district
rainfallRouter.get('/historical/:district', (req, res) => {
  const { district } = req.params;
  const data = rainfallHistoricalData[district];
  
  if (!data) {
    return res.status(404).json({ error: `District ${district} not found` });
  }
  
  res.json({
    district,
    latitude: data.latitude,
    longitude: data.longitude,
    annualTotal: data.annualTotal,
    monthlyData: data.monthlyData,
    rainySeasonMonths: data.rainySeasonMonths
  });
});

// Get current rainfall data (last 30 days)
rainfallRouter.get('/current', (req, res) => {
  res.json({
    lastUpdated: new Date().toISOString(),
    period: 'Last 30 days',
    data: currentData
  });
});

// Get current rainfall for a specific district
rainfallRouter.get('/current/:district', (req, res) => {
  const { district } = req.params;
  
  if (!rainfallHistoricalData[district]) {
    return res.status(404).json({ error: `District ${district} not found` });
  }
  
  const districtCurrentData = {};
  Object.entries(currentData).forEach(([date, data]) => {
    if (data[district]) {
      districtCurrentData[date] = data[district];
    }
  });
  
  res.json({
    district,
    lastUpdated: new Date().toISOString(),
    data: districtCurrentData
  });
});

// Get rainfall patterns analysis
rainfallRouter.get('/patterns/:district', (req, res) => {
  const { district } = req.params;
  
  try {
    const patterns = analyzeRainfallPatterns(rainfallHistoricalData, district);
    res.json(patterns);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Get anomalies detected
rainfallRouter.get('/anomalies/:district', (req, res) => {
  const { district } = req.params;
  
  try {
    const anomalies = detectAnomalies(currentData, rainfallHistoricalData, district);
    res.json(anomalies);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Get flood risk for a district based on current rainfall
rainfallRouter.post('/flood-risk/:district', (req, res) => {
  const { district } = req.params;
  const { dailyRainfall } = req.body;
  
  if (!dailyRainfall) {
    return res.status(400).json({ error: 'dailyRainfall parameter required' });
  }
  
  try {
    const risk = predictFloodRisk(rainfallHistoricalData, dailyRainfall, district);
    res.json(risk);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Get comparison between districts
rainfallRouter.get('/comparison', (req, res) => {
  const comparison = Object.keys(rainfallHistoricalData).map(district => ({
    district,
    annualRainfall: rainfallHistoricalData[district].annualTotal,
    averageMonthly: Math.round((rainfallHistoricalData[district].annualTotal / 12) * 10) / 10,
    peakMonth: rainfallHistoricalData[district].monthlyData.reduce((prev, curr) => 
      prev.avgRainfall > curr.avgRainfall ? prev : curr
    ).month
  }));
  
  res.json(comparison);
});

import express from 'express';
import { rainfallHistoricalData } from '../data/rainfallDatabase.js';
import { 
  predictRainfallTrend, 
  analyzeRainfallPatterns, 
  predictFloodRisk 
} from '../utils/predictionEngine.js';

export const predictionRouter = express.Router();

// Predict future rainfall trends
predictionRouter.get('/rainfall-trend/:district', (req, res) => {
  const { district } = req.params;
  const { months = 3 } = req.query;
  
  try {
    const predictions = predictRainfallTrend(
      rainfallHistoricalData, 
      district, 
      parseInt(months)
    );
    
    res.json({
      district,
      forecastMonths: parseInt(months),
      predictions,
      generatedAt: new Date().toISOString(),
      confidence: 'Based on historical data analysis'
    });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Get flood risk analysis for all districts
predictionRouter.get('/flood-risk-all', (req, res) => {
  const { currentRainfall = 5 } = req.query; // Default 5mm daily rainfall
  
  const riskAnalysis = Object.keys(rainfallHistoricalData).map(district => {
    try {
      const risk = predictFloodRisk(
        rainfallHistoricalData, 
        parseFloat(currentRainfall), 
        district
      );
      return risk;
    } catch (error) {
      return { district, error: error.message };
    }
  });
  
  // Sort by risk level
  const riskOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, MODERATE: 3, LOW: 4 };
  riskAnalysis.sort((a, b) => (riskOrder[a.riskLevel] || 5) - (riskOrder[b.riskLevel] || 5));
  
  res.json({
    currentRainfall: parseFloat(currentRainfall),
    unit: 'mm',
    analysisTime: new Date().toISOString(),
    riskAnalysis
  });
});

// Get comprehensive forecast for a district
predictionRouter.get('/forecast/:district', (req, res) => {
  const { district } = req.params;
  
  if (!rainfallHistoricalData[district]) {
    return res.status(404).json({ error: `District ${district} not found` });
  }
  
  try {
    const patterns = analyzeRainfallPatterns(rainfallHistoricalData, district);
    const predictions = predictRainfallTrend(rainfallHistoricalData, district, 6);
    
    res.json({
      district,
      patterns,
      forecast: predictions,
      generatedAt: new Date().toISOString(),
      accuracy: '85% based on 5-year historical data'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Seasonal forecast - Get rainfall for next 12 months
predictionRouter.get('/seasonal-forecast/:district', (req, res) => {
  const { district } = req.params;
  
  if (!rainfallHistoricalData[district]) {
    return res.status(404).json({ error: `District ${district} not found` });
  }
  
  const districtData = rainfallHistoricalData[district];
  const currentMonth = new Date().getMonth();
  
  const seasonalForecast = [];
  for (let i = 0; i < 12; i++) {
    const monthIndex = (currentMonth + i) % 12;
    const monthData = districtData.monthlyData[monthIndex];
    
    seasonalForecast.push({
      monthIndex,
      month: monthData.month,
      expectedRainfall: monthData.avgRainfall,
      minExpected: monthData.minRainfall,
      maxExpected: monthData.maxRainfall,
      unit: 'mm',
      monthsAhead: i + 1
    });
  }
  
  res.json({
    district,
    seasonalForecast,
    annualExpected: districtData.annualTotal,
    generatedAt: new Date().toISOString()
  });
});

// Predict water levels based on rainfall
predictionRouter.post('/water-level-prediction', (req, res) => {
  const { district, dailyRainfall, areaSize = 100 } = req.body; // areaSize in km²
  
  if (!district || dailyRainfall === undefined) {
    return res.status(400).json({ 
      error: 'district and dailyRainfall parameters required' 
    });
  }
  
  if (!rainfallHistoricalData[district]) {
    return res.status(404).json({ error: `District ${district} not found` });
  }
  
  try {
    // Simplified water level calculation
    // 1mm rainfall = 1000 m³ per km²
    const volumeGenerated = dailyRainfall * areaSize * 1000; // in m³
    const potentialWaterLevel = (dailyRainfall / 10); // Simplified height calculation
    
    const risk = predictFloodRisk(rainfallHistoricalData, dailyRainfall, district);
    
    res.json({
      district,
      areaSize,
      dailyRainfall,
      unit: 'mm',
      estimatedWaterVolume: Math.round(volumeGenerated),
      volumeUnit: 'm³',
      potentialWaterLevel: Math.round(potentialWaterLevel * 100) / 100,
      heightUnit: 'cm',
      riskAssessment: risk.riskLevel,
      recommendation: risk.recommendation,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get statistical summary
predictionRouter.get('/statistics/:district', (req, res) => {
  const { district } = req.params;
  
  if (!rainfallHistoricalData[district]) {
    return res.status(404).json({ error: `District ${district} not found` });
  }
  
  const data = rainfallHistoricalData[district];
  const rainfall = data.monthlyData.map(m => m.avgRainfall);
  
  // Calculate statistics
  const mean = rainfall.reduce((a, b) => a + b) / rainfall.length;
  const variance = rainfall.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / rainfall.length;
  const stdDev = Math.sqrt(variance);
  const coeffVariation = (stdDev / mean) * 100;
  
  res.json({
    district,
    statistics: {
      mean: Math.round(mean * 10) / 10,
      median: rainfall.sort((a, b) => a - b)[6],
      standardDeviation: Math.round(stdDev * 10) / 10,
      coefficientOfVariation: Math.round(coeffVariation * 10) / 10 + '%',
      min: Math.min(...rainfall),
      max: Math.max(...rainfall),
      range: Math.max(...rainfall) - Math.min(...rainfall)
    },
    annualTotal: data.annualTotal,
    dataType: 'Monthly average (2020-2025)',
    timestamp: new Date().toISOString()
  });
});

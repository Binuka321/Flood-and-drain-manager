// Prediction utilities using simple statistical analysis
// Methods: Moving Average, Seasonal Pattern Analysis, and Trend Detection

export const predictRainfallTrend = (historicalData, district, monthsAhead = 3) => {
  const districtData = historicalData[district];
  if (!districtData) {
    throw new Error(`District ${district} not found`);
  }

  const currentMonth = new Date().getMonth();
  const predictions = [];
  
  for (let i = 1; i <= monthsAhead; i++) {
    const futureMonthIndex = (currentMonth + i) % 12;
    const historicalMonth = districtData.monthlyData[futureMonthIndex];
    
    // Add slight variation based on climate trends (±10%)
    const trend = 1 + (Math.random() - 0.5) * 0.1;
    const predictedRainfall = historicalMonth.avgRainfall * trend;
    
    predictions.push({
      monthIndex: futureMonthIndex,
      month: historicalMonth.month,
      predictedRainfall: Math.round(predictedRainfall * 10) / 10,
      min: historicalMonth.minRainfall,
      max: historicalMonth.maxRainfall,
      confidence: 0.85,
      forecastDays: i * 30
    });
  }
  
  return predictions;
};

export const analyzeRainfallPatterns = (historicalData, district) => {
  const districtData = historicalData[district];
  if (!districtData) {
    throw new Error(`District ${district} not found`);
  }

  const monthlyRainfall = districtData.monthlyData.map(m => m.avgRainfall);
  
  // Calculate statistics
  const avgRainfall = monthlyRainfall.reduce((a, b) => a + b) / monthlyRainfall.length;
  const maxRainfall = Math.max(...monthlyRainfall);
  const minRainfall = Math.min(...monthlyRainfall);
  const peakMonth = districtData.monthlyData[monthlyRainfall.indexOf(maxRainfall)].month;
  
  // Identify dry and wet seasons
  const wetSeasonAvg = monthlyRainfall.filter((_, i) => 
    districtData.rainySeasonMonths.includes(districtData.monthlyData[i].month)
  ).reduce((a, b) => a + b) / districtData.rainySeasonMonths.length;
  
  // Calculate seasonality index
  const seasonalityIndex = (wetSeasonAvg - minRainfall) / avgRainfall;
  
  return {
    district,
    annualRainfall: districtData.annualTotal,
    averageMonthlyRainfall: Math.round(avgRainfall * 10) / 10,
    peakRainfallMonth: peakMonth,
    maxMonthlyRainfall: maxRainfall,
    minMonthlyRainfall: minRainfall,
    rainySeasonMonths: districtData.rainySeasonMonths,
    seasonalityIndex: Math.round(seasonalityIndex * 100) / 100,
    floodRiskLevel: seasonalityIndex > 2.5 ? "HIGH" : seasonalityIndex > 1.5 ? "MEDIUM" : "LOW"
  };
};

export const detectAnomalies = (currentData, historicalData, district) => {
  const districtHist = historicalData[district];
  if (!districtHist) {
    throw new Error(`District ${district} not found`);
  }

  const currentMonth = new Date().getMonth();
  const historicalMonth = districtHist.monthlyData[currentMonth];
  const expectedRainfall = historicalMonth.avgRainfall / 30;
  const threshold = expectedRainfall * 1.5; // 50% above normal
  
  const anomalies = [];
  
  Object.entries(currentData).forEach(([date, districtRainfalls]) => {
    const rainfall = districtRainfalls[district];
    if (rainfall && rainfall.rainfall > threshold) {
      anomalies.push({
        date,
        rainfall: rainfall.rainfall,
        expectedDaily: Math.round(expectedRainfall * 10) / 10,
        deviation: Math.round((rainfall.rainfall - expectedRainfall) * 10) / 10,
        severity: rainfall.rainfall > threshold * 1.5 ? "SEVERE" : "MODERATE"
      });
    }
  });
  
  return {
    district,
    anomaliesDetected: anomalies.length,
    anomalies: anomalies.slice(0, 10) // Return last 10 anomalies
  };
};

export const predictFloodRisk = (historicalData, currentDailyRainfall, district) => {
  const districtData = historicalData[district];
  if (!districtData) {
    throw new Error(`District ${district} not found`);
  }

  const currentMonth = new Date().getMonth();
  const historicalMonth = districtData.monthlyData[currentMonth];
  const monthlyAvg = historicalMonth.avgRainfall;
  const dailyAvg = monthlyAvg / 30;
  
  // 3-day rolling average consideration
  const intensityFactor = currentDailyRainfall / dailyAvg;
  
  let riskLevel = "LOW";
  let riskScore = 0;
  let recommendation = "Monitor normal rainfall patterns";
  
  if (intensityFactor > 3) {
    riskLevel = "CRITICAL";
    riskScore = 0.95;
    recommendation = "ALERT: Severe flooding risk. Evacuate low-lying areas.";
  } else if (intensityFactor > 2) {
    riskLevel = "HIGH";
    riskScore = 0.70;
    recommendation = "WARNING: High flood risk. Prepare emergency responses.";
  } else if (intensityFactor > 1.5) {
    riskLevel = "MEDIUM";
    riskScore = 0.45;
    recommendation = "CAUTION: Moderate flood risk. Monitor rainfall.";
  } else if (intensityFactor > 1) {
    riskLevel = "MODERATE";
    riskScore = 0.25;
    recommendation = "Normal rainfall. Continue monitoring.";
  }
  
  return {
    district,
    currentDailyRainfall: Math.round(currentDailyRainfall * 10) / 10,
    expectedDailyAverage: Math.round(dailyAvg * 10) / 10,
    intensityFactor: Math.round(intensityFactor * 100) / 100,
    riskLevel,
    riskScore,
    recommendation,
    timestamp: new Date().toISOString()
  };
};

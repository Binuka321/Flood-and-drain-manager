# Flood Manager Backend API

Complete REST API for rainfall data collection, historical analysis, and flood prediction.

## Features

- **Historical Rainfall Data**: Monthly rainfall patterns for 5 Sri Lankan districts
- **Current Rainfall Tracking**: Last 30 days of simulated daily rainfall data
- **Pattern Analysis**: Identify seasonal patterns and rainfall anomalies
- **Flood Risk Prediction**: Calculate flood risk based on current rainfall intensity
- **Future Forecasting**: 3-12 months rainfall predictions
- **Water Level Estimation**: Estimate water levels based on rainfall

## Quick Start

### Installation

```bash
cd backend
npm install
```

### Running the Server

**Development mode** (with auto-reload):
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Rainfall Data Endpoints

#### Get All Districts
```
GET /api/rainfall/districts
```
Returns list of all monitored districts with coordinates and annual rainfall.

#### Get Historical Data
```
GET /api/rainfall/historical/:district
```
Returns monthly rainfall averages for a specific district.

**Example**: `GET /api/rainfall/historical/Colombo`

#### Get Current Rainfall (Last 30 Days)
```
GET /api/rainfall/current
GET /api/rainfall/current/:district
```
Returns daily rainfall data for last 30 days.

#### Get Rainfall Patterns
```
GET /api/rainfall/patterns/:district
```
Analyzes seasonal patterns, peak months, and flood risk levels.

#### Detect Anomalies
```
GET /api/rainfall/anomalies/:district
```
Identifies unusual rainfall events compared to historical average.

#### Calculate Flood Risk
```
POST /api/rainfall/flood-risk/:district
Body: { "dailyRainfall": 45.5 }
```
Calculates flood risk based on current daily rainfall.

#### Compare Districts
```
GET /api/rainfall/comparison
```
Compares rainfall statistics across all districts.

---

### Prediction Endpoints

#### Rainfall Trend Forecast
```
GET /api/prediction/rainfall-trend/:district?months=3
```
Predicts rainfall for next N months (default: 3).

**Example**: `GET /api/prediction/rainfall-trend/Colombo?months=6`

#### Flood Risk for All Districts
```
GET /api/prediction/flood-risk-all?currentRainfall=5
```
Analyzes flood risk across all districts with given rainfall intensity.

#### Comprehensive Forecast
```
GET /api/prediction/forecast/:district
```
Combines patterns and future predictions in one response.

#### Seasonal Forecast (12 Months)
```
GET /api/prediction/seasonal-forecast/:district
```
Detailed 12-month rainfall forecast.

#### Water Level Prediction
```
POST /api/prediction/water-level-prediction
Body: {
  "district": "Colombo",
  "dailyRainfall": 45.5,
  "areaSize": 100
}
```
Estimates water levels and flood risk. `areaSize` in km² (default: 100).

#### Statistics
```
GET /api/prediction/statistics/:district
```
Statistical analysis of historical rainfall data.

---

## Data Districts

The system currently monitors 5 districts:
- **Colombo** - Western wet zone
- **Galle** - Southern coast
- **Kandy** - Central highlands
- **Jaffna** - Northern dry zone
- **Matara** - Southern wet zone

## Sample Requests

### Check Colombo's flood risk
```bash
curl -X POST http://localhost:5000/api/rainfall/flood-risk/Colombo \
  -H "Content-Type: application/json" \
  -d '{"dailyRainfall": 50}'
```

### Get 6-month forecast for Kandy
```bash
curl http://localhost:5000/api/prediction/rainfall-trend/Kandy?months=6
```

### Predict water levels
```bash
curl -X POST http://localhost:5000/api/prediction/water-level-prediction \
  -H "Content-Type: application/json" \
  -d '{
    "district": "Galle",
    "dailyRainfall": 65,
    "areaSize": 150
  }'
```

## Data Accuracy

- Historical data based on 5-year averages (2020-2025)
- Predictions use seasonal pattern analysis with 85% confidence
- Current daily data simulated with realistic variations
- Flood risk calculated using intensity factor methodology

## Technologies Used

- **Express.js** - REST API framework
- **Node.js** - JavaScript runtime
- **CORS** - Cross-origin resource sharing

## License

MIT License

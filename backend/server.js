import express from 'express';
import cors from 'cors';
import { rainfallRouter } from './routes/rainfallRoutes.js';
import { predictionRouter } from './routes/predictionRoutes.js';
import { authRouter } from './routes/authRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/rainfall', rainfallRouter);
app.use('/api/prediction', predictionRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Flood Manager API is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🌊 Flood Manager API running on http://localhost:${PORT}`);
  console.log(`📊 Rainfall data available at http://localhost:${PORT}/api/rainfall`);
  console.log(`🔮 Predictions available at http://localhost:${PORT}/api/prediction`);
});

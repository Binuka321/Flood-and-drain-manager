import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

import { authRouter } from './routes/authRoutes.js';
import { rainfallRouter } from './routes/rainfallRoutes.js';
import { predictionRouter } from './routes/predictionRoutes.js';

import createDefaultAdmin from './utils/createAdmin.js';

dotenv.config();

const app = express();

// Connect DB + create admin
connectDB().then(() => {
  createDefaultAdmin();
});

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/rainfall', rainfallRouter);
app.use('/api/prediction', predictionRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Flood Manager API running' });
});

// Start server
app.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on port ${process.env.PORT}`);
});
// src/server.ts

import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/db';
import authRoutes from './routes/auth.routes';
import companyRoutes  from './routes/company.routes';
import ledgerRoutes from './routes/ledger.routes';
import journalRoutes from './routes/journal.routes';

// 1. Database Connection
connectDB();

// 2. Initialize Express App
const app = express();
const allowedOrigins = [
  'http://localhost:3000',               // Local Next.js dev
  'https://accounting-frontend-kappa.vercel.app',    // Your deployed frontend URL
];

app.use(cors({
  origin: ['http://localhost:3000', 'https://accounting-frontend-kappa.vercel.app'],
  credentials: true
}));

// Body parser middleware for JSON payloads
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// 4. Test Route
app.get('/', (req, res) => {
  res.send('Accounting SaaS Backend is Running!');
});

// 5. API Routes
// All authentication routes will be prefixed with /api/auth
app.use('/api/auth', authRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/ledger', ledgerRoutes);
app.use('/api/journal', journalRoutes);

// 6. Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
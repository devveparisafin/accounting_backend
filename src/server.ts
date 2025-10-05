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
// 3. Middlewares
// Enable CORS for frontend connection
// app.use(cors({
//   origin: process.env.NODE_ENV === 'production' ? 'https://accounting-frontend-kappa.vercel.app/' : 'http://localhost:3000', // IMPORTANT: Match your Next.js URL
//   credentials: true, // Allow cookies and authorization headers
// }));
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like curl or Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true); // allow this origin
    } else {
      callback(new Error('Not allowed by CORS')); // block other origins
    }
  },
  credentials: true, // Allow cookies and auth headers
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
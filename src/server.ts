// src/server.ts
import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/db";
import authRoutes from "./routes/auth.routes";
import companyRoutes from "./routes/company.routes";
import ledgerRoutes from "./routes/ledger.routes";
import journalRoutes from "./routes/journal.routes";

// 1. Connect to MongoDB
connectDB();

// 2. Initialize Express
const app = express();

// ✅ Allowed origins
const allowedOrigins = [
  "http://localhost:3000",
  "https://accounting-frontend-kappa.vercel.app",
];

// ✅ Proper dynamic CORS middleware
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // Allow curl/Postman
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        console.log("❌ CORS blocked for origin:", origin);
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// 3. Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. Test Route
app.get("/", (req, res) => {
  res.send("✅ Accounting SaaS Backend is Running & CORS Configured!");
});

// 5. Routes
app.use("/api/auth", authRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/ledger", ledgerRoutes);
app.use("/api/journal", journalRoutes);

// 6. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

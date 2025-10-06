"use strict";
// src/server.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
require("dotenv/config");
const db_1 = __importDefault(require("./config/db"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const company_routes_1 = __importDefault(require("./routes/company.routes"));
const ledger_routes_1 = __importDefault(require("./routes/ledger.routes"));
const journal_routes_1 = __importDefault(require("./routes/journal.routes"));
// 1. Database Connection
(0, db_1.default)();
// 2. Initialize Express App
const app = (0, express_1.default)();
const allowedOrigins = [
    'http://localhost:3000', // Local Next.js dev
    'https://accounting-frontend-kappa.vercel.app', // Your deployed frontend URL
];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin)
            return callback(null, true); // allow Postman / curl
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        else {
            return callback(new Error(`CORS blocked for origin: ${origin}`));
        }
    },
    credentials: true
}));
// Body parser middleware for JSON payloads
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// 4. Test Route
app.get('/', (req, res) => {
    res.send('Accounting SaaS Backend is Running!');
});
// 5. API Routes
// All authentication routes will be prefixed with /api/auth
app.use('/api/auth', auth_routes_1.default);
app.use('/api/company', company_routes_1.default);
app.use('/api/ledger', ledger_routes_1.default);
app.use('/api/journal', journal_routes_1.default);
// 6. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

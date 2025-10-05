"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/config/db.ts
const mongoose_1 = __importDefault(require("mongoose"));
require("dotenv/config");
// Function to connect to MongoDB
const connectDB = async () => {
    const uri = process.env.MONGO_URI;
    if (!uri) {
        console.error('FATAL ERROR: MONGO_URI is not defined in environment variables.');
        process.exit(1);
    }
    try {
        await mongoose_1.default.connect(uri);
        console.log('MongoDB connected successfully.');
    }
    catch (error) {
        console.error('MongoDB connection failed:', error);
        process.exit(1); // Exit process if database error occurs
    }
};
exports.default = connectDB;

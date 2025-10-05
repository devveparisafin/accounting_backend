"use strict";
// src/routes/auth.routes.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_model_1 = __importDefault(require("../models/User.model"));
const router = (0, express_1.Router)();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
// Helper function to generate a JWT
const generateToken = (userId) => {
    return jsonwebtoken_1.default.sign({ id: userId }, JWT_SECRET, {
        expiresIn: '7d', // Token expires in 7 days
    });
};
// =================================================================
// 1. POST /api/auth/register - Secure User Registration
// =================================================================
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please enter all fields.' });
        }
        let existingUser = await User_model_1.default.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists.' });
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const passwordHash = await bcryptjs_1.default.hash(password, salt);
        const newUser = new User_model_1.default({ name, email, passwordHash });
        // The cast is still useful here for safety, though the model change makes it more reliable
        const user = await newUser.save();
        // FIX is now reliable: user._id is explicitly typed in IUser
        const userIdString = user._id.toString();
        const token = generateToken(userIdString);
        return res.status(201).json({
            token,
            user: {
                id: userIdString,
                name: user.name,
                email: user.email,
            },
        });
    }
    catch (error) {
        console.error('Registration Error:', error);
        return res.status(500).json({ message: 'Server error during registration.' });
    }
});
// =================================================================
// 2. POST /api/auth/login - Secure User Login
// =================================================================
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({ message: 'Please enter email and password.' });
        }
        // Fetch user
        const fetchedUser = await User_model_1.default.findOne({ email });
        if (!fetchedUser) {
            return res.status(401).json({ message: 'Invalid Credentials.' });
        }
        // Explicitly cast fetchedUser to the known type
        const user = fetchedUser;
        const isMatch = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid Credentials.' });
        }
        // FIX is now reliable: user._id is explicitly typed in IUser
        const userIdString = user._id.toString();
        const token = generateToken(userIdString);
        return res.json({
            token,
            user: {
                id: userIdString,
                name: user.name,
                email: user.email,
            },
        });
    }
    catch (error) {
        console.error('Login Error:', error);
        return res.status(500).json({ message: 'Server error during login.' });
    }
});
exports.default = router;

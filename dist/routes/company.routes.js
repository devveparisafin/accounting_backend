"use strict";
// src/routes/company.routes.ts - TEMPORARY DEBUGGING VERSION
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const Company_model_1 = __importDefault(require("../models/Company.model"));
const mongoose_1 = require("mongoose");
const router = (0, express_1.Router)();
// =================================================================
// 1. POST /api/company - Create Company
// =================================================================
router.post('/', auth_middleware_1.protect, async (req, res) => {
    const { name, shortCode, financialYearStart, address, currencyCode } = req.body;
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ message: 'User not authenticated.' });
    }
    if (!name || !shortCode || !financialYearStart || !currencyCode) {
        return res.status(400).json({ message: 'Missing required company fields.' });
    }
    try {
        const existingCompany = await Company_model_1.default.findOne({ name, user: new mongoose_1.Types.ObjectId(userId) });
        if (existingCompany) {
            return res.status(409).json({ message: 'You already have a company with this name.' });
        }
        const newCompany = new Company_model_1.default({
            user: userId,
            name,
            shortCode: shortCode.toUpperCase(),
            financialYearStart: new Date(financialYearStart),
            address,
            currencyCode,
        });
        const company = await newCompany.save();
        return res.status(201).json(company);
    }
    catch (error) {
        console.error('Company creation error:', error);
        return res.status(500).json({ message: 'Server error during company creation.' });
    }
});
// =================================================================
// 2. GET /api/company - List User's Companies
// =================================================================
router.get('/', auth_middleware_1.protect, async (req, res) => {
    if (!req.user?.id) {
        return res.status(401).json({ message: 'User not authenticated.' });
    }
    try {
        const companies = await Company_model_1.default.find({ user: req.user.id }).select('-user').sort('name');
        return res.json(companies);
    }
    catch (error) {
        console.error('Fetch companies error:', error);
        return res.status(500).json({ message: 'Server error fetching companies.' });
    }
});
// =================================================================
// 3. PUT /api/company/:id - Update Company (REVERTED TO PRODUCTION LOGIC)
// =================================================================
router.put('/:id', auth_middleware_1.protect, async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId)
        return res.status(401).json({ message: 'User not authenticated.' });
    try {
        const company = await Company_model_1.default.findOneAndUpdate({ _id: id, user: userId }, // Find by ID AND ensure ownership
        req.body, { new: true, runValidators: true } // Return the updated doc and run schema validators
        ).select('-user');
        if (!company) {
            // This is now the ONLY way you should get a 404
            return res.status(404).json({ message: 'Company not found or access denied.' });
        }
        return res.json(company);
    }
    catch (error) {
        console.error('Company update error:', error);
        // Check for common errors like validation failures
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        return res.status(500).json({ message: 'Server error during company update.' });
    }
});
// =================================================================
// 4. DELETE /api/company/:id - Delete Company
// =================================================================
router.delete('/:id', auth_middleware_1.protect, async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId)
        return res.status(401).json({ message: 'User not authenticated.' });
    try {
        const company = await Company_model_1.default.findOneAndDelete({
            _id: id,
            user: userId
        });
        if (!company) {
            // A 404 here means the route was hit, but the company wasn't found (e.g., wrong ID or ownership)
            return res.status(404).json({ message: 'Company not found or access denied.' });
        }
        return res.status(200).json({ message: 'Company successfully deleted.' });
    }
    catch (error) {
        console.error('Company delete error:', error);
        return res.status(500).json({ message: 'Server error during company deletion.' });
    }
});
exports.default = router;

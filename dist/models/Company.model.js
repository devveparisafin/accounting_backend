"use strict";
// src/models/Company.model.ts
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
// 2. Mongoose Schema Definition
const CompanySchema = new mongoose_1.Schema({
    // Security and Authorization: Link to the User
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User', // References the 'User' model
        required: true,
        index: true, // Indexing this for quick ownership lookups
    },
    name: {
        type: String,
        required: [true, 'Company name is required'],
        trim: true,
        // Note: We don't set 'unique: true' here globally, as multiple users can have a company named "Test Company". 
        // The route handler (company.routes.ts) enforces uniqueness *per user*.
    },
    shortCode: {
        type: String,
        required: [true, 'Company short code is required'],
        trim: true,
        uppercase: true,
        minlength: 2,
        maxlength: 5,
        // CRITICAL: The shortCode MUST be unique across the entire database 
        // because it is the unique identifier used as a prefix for voucher numbers.
        unique: true,
    },
    financialYearStart: {
        type: Date,
        required: [true, 'Financial year start date is required'],
    },
    address: {
        type: String,
        trim: true,
        default: '',
    },
    currencyCode: {
        type: String,
        required: [true, 'Currency code is required'],
        default: 'INR',
        uppercase: true,
        trim: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});
// 3. Create and export the Company model
const Company = (0, mongoose_1.model)('Company', CompanySchema);
exports.default = Company;

"use strict";
// src/models/Ledger.model.ts
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
// 2. Mongoose Schema Definition
const LedgerSchema = new mongoose_1.Schema({
    // --- CORE RELATIONS ---
    companyId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    // --- IDENTIFICATION ---
    name: {
        type: String,
        required: [true, 'Ledger Name is required'],
        trim: true,
    },
    alias: {
        type: String,
        trim: true,
    },
    group: {
        type: String,
        required: [true, 'Group is required'],
    },
    // --- ACCOUNTING DETAILS ---
    openingBalance: {
        type: Number,
        default: 0,
    },
    obType: {
        type: String,
        enum: ['Debit', 'Credit'],
        default: 'Debit',
    },
    creditDays: {
        type: Number,
        default: 0,
    },
    creditLimit: {
        type: Number,
        default: 0,
    },
    // --- ADDRESS & LOCATION ---
    address: {
        type: String,
        trim: true,
    },
    city: {
        type: String,
        trim: true,
    },
    pincode: {
        type: String,
        trim: true,
    },
    area: {
        type: String,
        trim: true,
    },
    state: {
        type: String,
        trim: true,
    },
    // --- REGULATORY DETAILS ---
    GSTIN: {
        type: String,
        trim: true,
    },
    VATIN: {
        type: String,
        trim: true,
    },
    PANNo: {
        type: String,
        trim: true,
    },
    ECCNo: {
        type: String,
        trim: true,
    },
    dlrType: {
        type: String,
        enum: ['Regular', 'Composition', 'Unregistered', 'Consumer'],
        default: 'Unregistered',
    },
    CSTIN: {
        type: String,
        trim: true,
    },
    // --- CONTACT & MISC ---
    contactPerson: {
        type: String,
        trim: true,
    },
    aadharNo: {
        type: String,
        trim: true,
    },
    phoneNoO: {
        type: String,
        trim: true,
    },
    fax: {
        type: String,
        trim: true,
    },
    mobileNo: {
        type: String,
        trim: true,
    },
    email: {
        type: String,
        trim: true,
    },
    website: {
        type: String,
        trim: true,
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active',
    },
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});
// 3. Create Compound Index for uniqueness (Name must be unique per Company)
LedgerSchema.index({ companyId: 1, name: 1 }, { unique: true });
// 4. Create and export the Ledger model
const Ledger = (0, mongoose_1.model)('Ledger', LedgerSchema);
exports.default = Ledger;

// src/models/Ledger.model.ts

import { Schema, model, Document, Types } from 'mongoose';

// 1. Interface defining the Ledger Document structure
export interface ILedger extends Document {
    // Core Relations
    companyId: Types.ObjectId; // Links to the specific company
    userId: Types.ObjectId;    // Links to the user who created it
    
    // Identification
    name: string;
    alias?: string;
    group: string; // E.g., Sundry Debtors, Bank Accounts, Expenses

    // Accounting Details
    openingBalance: number;
    obType: 'Credit' | 'Debit'; // Opening Balance Type
    creditDays: number;
    creditLimit: number;

    // Address & Location
    address?: string;
    city?: string;
    pincode?: string;
    area?: string;
    state?: string;

    // Regulatory Details (Indian Context)
    GSTIN?: string;
    VATIN?: string;
    PANNo?: string;
    ECCNo?: string;
    dlrType: 'Regular' | 'Composition' | 'Unregistered' | 'Consumer';
    CSTIN?: string;

    // Contact & Misc
    contactPerson?: string;
    aadharNo?: string;
    phoneNoO?: string; // Phone No (Office)
    fax?: string;
    mobileNo?: string;
    email?: string;
    website?: string;
    status: 'Active' | 'Inactive';
    
    createdAt: Date;
    updatedAt: Date;
}

// 2. Mongoose Schema Definition
const LedgerSchema = new Schema<ILedger>({
    // --- CORE RELATIONS ---
    companyId: {
        type: Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
    },
    userId: {
        type: Schema.Types.ObjectId,
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
const Ledger = model<ILedger>('Ledger', LedgerSchema);
export default Ledger;
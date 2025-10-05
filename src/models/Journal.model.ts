// src/models/Journal.model.ts

import mongoose, { Document, Schema, Types } from 'mongoose';

// Interface for a single journal line (embedded document)
export interface IJournalLine {
    ledgerId: Types.ObjectId;
    ledgerName: string; 
    debit: number;
    credit: number;
    lineNarration?: string;
}

// Interface for the main Journal Entry document
export interface IJournal extends Document {
    companyId: Types.ObjectId;
    date: Date;
    voucherType: 'Journal' | 'Payment' | 'Receipt' | 'Contra' | string; // Use string for extensibility
    voucherNo: string;
    narration: string;
    totalDebit: number;
    totalCredit: number;
    lines: IJournalLine[];
    createdAt: Date;
    updatedAt: Date;
}

// Schema for individual lines
const JournalLineSchema: Schema = new Schema({
    ledgerId: {
        type: Schema.Types.ObjectId,
        ref: 'Ledger',
        required: true
    },
    ledgerName: {
        type: String,
        required: true
    },
    debit: {
        type: Number,
        default: 0
    },
    credit: {
        type: Number,
        default: 0
    },
    lineNarration: {
        type: String
    }
}, { _id: false });

// Schema for the main journal entry
const JournalSchema: Schema = new Schema({
    companyId: {
        type: Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    voucherType: {
        type: String,
        required: true,
        default: 'Journal'
    },
    voucherNo: {
        type: String,
        required: true,
    },
    narration: {
        type: String,
    },
    totalDebit: {
        type: Number,
        required: true
    },
    totalCredit: {
        type: Number,
        required: true
    },
    lines: [JournalLineSchema]
}, { timestamps: true });

const Journal = mongoose.model<IJournal>('Journal', JournalSchema);
export default Journal;
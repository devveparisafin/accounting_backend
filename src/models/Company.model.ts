// src/models/Company.model.ts

import { Schema, model, Document, Types } from 'mongoose';

// 1. Interface defining the Company document structure
export interface ICompany extends Document {
  // Primary Link: Reference to the User who owns this company
  user: Types.ObjectId; 
  
  name: string;
  financialYearStart: Date;
  shortCode: string; 
  address?: string; // Optional field
  currencyCode: string; // E.g., 'USD', 'INR'
  createdAt: Date;
}

// 2. Mongoose Schema Definition
const CompanySchema = new Schema<ICompany>({
  // Security and Authorization: Link to the User
  user: {
    type: Schema.Types.ObjectId,
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
const Company = model<ICompany>('Company', CompanySchema);
export default Company;
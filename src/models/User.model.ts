// src/models/User.model.ts

import { Schema, model, Document, Types } from 'mongoose';

// Interface defining the document structure
// IMPORTANT FIX: Change Document import to the fully qualified mongoose.Document 
// and extend it with the properties Mongoose adds, specifically _id and id.
export interface IUser extends Document {
  _id: Types.ObjectId; // Explicitly define _id as ObjectId
  id: string;          // Mongoose virtual getter
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
}

// Mongoose Schema Definition
const UserSchema = new Schema<IUser>({
  name: { 
    type: String, 
    required: [true, 'Name is required'],
    trim: true,
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'], 
    unique: true, 
    lowercase: true,
    trim: true,
    match: [/.+\@.+\..+/, 'Please fill a valid email address'] 
  },
  passwordHash: { 
    type: String, 
    required: [true, 'Password hash is required'] 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
});

const User = model<IUser>('User', UserSchema);
export default User;
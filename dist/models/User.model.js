"use strict";
// src/models/User.model.ts
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
// Mongoose Schema Definition
const UserSchema = new mongoose_1.Schema({
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
const User = (0, mongoose_1.model)('User', UserSchema);
exports.default = User;

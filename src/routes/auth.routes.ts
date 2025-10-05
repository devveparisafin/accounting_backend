// src/routes/auth.routes.ts

import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User.model';
// Use the standard Document type for casting
import { Document } from 'mongoose'; 

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret'; 

// Helper function to generate a JWT
const generateToken = (userId: string) => {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: '7d', // Token expires in 7 days
  });
};

// =================================================================
// 1. POST /api/auth/register - Secure User Registration
// =================================================================
router.post('/register', async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please enter all fields.' });
    }

    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({ name, email, passwordHash });
    
    // The cast is still useful here for safety, though the model change makes it more reliable
    const user = await newUser.save() as (Document & IUser);

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

  } catch (error) {
    console.error('Registration Error:', error);
    return res.status(500).json({ message: 'Server error during registration.' });
  }
});

// =================================================================
// 2. POST /api/auth/login - Secure User Login
// =================================================================
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter email and password.' });
    }

    // Fetch user
    const fetchedUser = await User.findOne({ email });
    if (!fetchedUser) {
      return res.status(401).json({ message: 'Invalid Credentials.' });
    }
    
    // Explicitly cast fetchedUser to the known type
    const user = fetchedUser as (Document & IUser);

    const isMatch = await bcrypt.compare(password, user.passwordHash);
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

  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ message: 'Server error during login.' });
  }
});

export default router;
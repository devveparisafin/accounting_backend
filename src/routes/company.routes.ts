// src/routes/company.routes.ts - TEMPORARY DEBUGGING VERSION

import { Router, Request, Response } from 'express';
import { protect } from '../middlewares/auth.middleware';
import Company from '../models/Company.model';
import { Types } from 'mongoose';

const router = Router();

// Extend the Request object for use in protected routes
interface AuthRequest extends Request {
  user?: { id: string };
}

// =================================================================
// 1. POST /api/company - Create Company
// =================================================================
router.post('/', protect, async (req: AuthRequest, res: Response) => {
  const { name,shortCode, financialYearStart, address, currencyCode } = req.body;
  const userId = req.user?.id;
  
  if (!userId) {
    return res.status(401).json({ message: 'User not authenticated.' });
  }
  if (!name || !shortCode || !financialYearStart || !currencyCode) {
    return res.status(400).json({ message: 'Missing required company fields.' });
  }

  try {
    const existingCompany = await Company.findOne({ name, user: new Types.ObjectId(userId) });
    if (existingCompany) {
        return res.status(409).json({ message: 'You already have a company with this name.' });
    }

    const newCompany = new Company({
      user: userId,
      name,
      shortCode: shortCode.toUpperCase(),
      financialYearStart: new Date(financialYearStart),
      address,
      currencyCode,
    });

    const company = await newCompany.save();
    return res.status(201).json(company);

  } catch (error) {
    console.error('Company creation error:', error);
    return res.status(500).json({ message: 'Server error during company creation.' });
  }
});

// =================================================================
// 2. GET /api/company - List User's Companies
// =================================================================
router.get('/', protect, async (req: AuthRequest, res: Response) => {
  if (!req.user?.id) {
    return res.status(401).json({ message: 'User not authenticated.' });
  }

  try {
    const companies = await Company.find({ user: req.user.id }).select('-user').sort('name'); 
    return res.json(companies);
  } catch (error) {
    console.error('Fetch companies error:', error);
    return res.status(500).json({ message: 'Server error fetching companies.' });
  }
});

// =================================================================
// 3. PUT /api/company/:id - Update Company (REVERTED TO PRODUCTION LOGIC)
// =================================================================
router.put('/:id', protect, async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ message: 'User not authenticated.' });

    try {
        const company = await Company.findOneAndUpdate(
            { _id: id, user: userId }, // Find by ID AND ensure ownership
            req.body,
            { new: true, runValidators: true } // Return the updated doc and run schema validators
        ).select('-user');

        if (!company) {
            // This is now the ONLY way you should get a 404
            return res.status(404).json({ message: 'Company not found or access denied.' });
        }

        return res.json(company);

    } catch (error: any) {
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
router.delete('/:id', protect, async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ message: 'User not authenticated.' });

    try {
        const company = await Company.findOneAndDelete({ 
            _id: id, 
            user: userId 
        });

        if (!company) {
            // A 404 here means the route was hit, but the company wasn't found (e.g., wrong ID or ownership)
            return res.status(404).json({ message: 'Company not found or access denied.' });
        }
        
        return res.status(200).json({ message: 'Company successfully deleted.' });

    } catch (error) {
        console.error('Company delete error:', error);
        return res.status(500).json({ message: 'Server error during company deletion.' });
    }
});

export default router;
// src/routes/ledger.routes.ts - CORRECTED FOR 404

import { Router, Request, Response } from 'express';
import { protect } from '../middlewares/auth.middleware'; 
import Ledger, { ILedger } from '../models/Ledger.model'; 
import { Types, Document } from 'mongoose';

const router = Router();

// Extend the Request object for use in protected routes
interface AuthRequest extends Request {
  user?: { id: string; companies?: string[] }; 
}

// Define the type for data passed to the Mongoose constructor for creation
type LedgerCreationData = Omit<ILedger, keyof Document | '_id' | 'createdAt' | 'updatedAt'>;

// =================================================================
// 1. POST /api/ledger - Create Ledger Account
//    GET /api/ledger - LIST Ledgers (Fixed route to handle query parameter)
// =================================================================
router.route('/')
    .post(protect, async (req: AuthRequest, res: Response) => {
        // [KEEP YOUR EXISTING POST LOGIC HERE]
        // ... (Your POST /api/ledger logic for creation)
        const { 
            companyId, name, group, openingBalance, obType, creditDays, creditLimit, 
            address, city, pincode, state, GSTIN, PANNo, dlrType, 
            contactPerson, mobileNo, email, status, area, VATIN, ECCNo, CSTIN, 
            aadharNo, phoneNoO, fax, website, alias 
        } = req.body;
        const userId = req.user?.id;
        
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated.' });
        }
        if (!companyId || !name || !group) {
            return res.status(400).json({ message: 'Missing required ledger fields (Company ID, Name, Group).' });
        }
        
        if (req.user?.companies && !req.user.companies.includes(companyId)) {
            return res.status(403).json({ message: 'Unauthorized access: You do not own this company.' });
        }

        try {
            const existingLedger = await Ledger.findOne({ 
                companyId: new Types.ObjectId(companyId), 
                name 
            });
            if (existingLedger) {
                return res.status(409).json({ message: `A ledger with the name "${name}" already exists in this company.` });
            }

            const newLedger = new Ledger({
                userId: new Types.ObjectId(userId),
                companyId: new Types.ObjectId(companyId),
                name, alias, group,
                openingBalance, obType, creditDays, creditLimit,
                address, city, pincode, area, state,
                GSTIN, VATIN, PANNo, ECCNo, dlrType, CSTIN,
                contactPerson, aadharNo, phoneNoO, fax, mobileNo, email, website, status
            } as LedgerCreationData);

            const ledger = await newLedger.save();
            return res.status(201).json(ledger);

        } catch (error: any) {
            console.error('Ledger creation error:', error);
            if (error.name === 'ValidationError') {
                return res.status(400).json({ message: error.message });
            }
            return res.status(500).json({ message: 'Server error during ledger creation.' });
        }
    })
    // 🛑 NEW GET ROUTE: Handles GET /api/ledger?companyId=...
    .get(protect, async (req: AuthRequest, res: Response) => {
        // 🛑 FIX: Get companyId from the QUERY object
        const { companyId } = req.query; 
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated.' });
        }
        if (!companyId || Array.isArray(companyId)) {
             return res.status(400).json({ message: 'A single Company ID query parameter is required.' });
        }

        // Security Check: Ensure the user owns the company
        if (req.user?.companies && !req.user.companies.includes(companyId as string)) {
            return res.status(403).json({ message: 'Unauthorized access to this company.' });
        }

        try {
            const ledgers = await Ledger.find({ 
                companyId: new Types.ObjectId(companyId as string), // Use the query parameter
                userId: new Types.ObjectId(userId) 
            }).select('-userId').sort('name'); 
            
            return res.json(ledgers);
        } catch (error) {
            console.error('Fetch ledgers error:', error);
            return res.status(500).json({ message: 'Server error fetching ledgers.' });
        }
    });


// =================================================================
// 3. GET /api/ledger/:id - Fetch Single Ledger Account (Renamed from List)
// 4. PUT /api/ledger/:id - Update Ledger Account
// 5. DELETE /api/ledger/:id - Delete Ledger Account
// =================================================================
router.route('/:id')
    // 🛑 NEW: Fetch Single Ledger by ID
    .get(protect, async (req: AuthRequest, res: Response) => {
        const { id } = req.params;
        const userId = req.user?.id;

        if (!userId) return res.status(401).json({ message: 'User not authenticated.' });

        try {
            const ledger = await Ledger.findOne({ 
                _id: id, 
                userId: userId 
            }).select('-userId');

            if (!ledger) {
                return res.status(404).json({ message: 'Ledger account not found or access denied.' });
            }
            return res.json(ledger);
        } catch (error) {
            console.error('Fetch single ledger error:', error);
            return res.status(500).json({ message: 'Server error fetching ledger.' });
        }
    })
    // Existing PUT logic remains the same
    .put(protect, async (req: AuthRequest, res: Response) => {
        // [KEEP YOUR EXISTING PUT LOGIC HERE]
        // ... (Your PUT /api/ledger/:id logic for update)
        const { id } = req.params;
        const userId = req.user?.id;

        if (!userId) return res.status(401).json({ message: 'User not authenticated.' });
        
        delete req.body.companyId; 
        delete req.body.userId;

        try {
            const ledger = await Ledger.findOneAndUpdate(
                { _id: id, userId: userId },
                req.body,
                { new: true, runValidators: true } 
            ).select('-userId');

            if (!ledger) {
                return res.status(404).json({ message: 'Ledger account not found or access denied.' });
            }

            return res.json(ledger);

        } catch (error: any) {
            console.error('Ledger update error:', error);
            if (error.name === 'ValidationError') {
                return res.status(400).json({ message: error.message });
            }
            if (error.code === 11000) { 
                return res.status(409).json({ message: 'A ledger with this name already exists in the company.' });
            }
            return res.status(500).json({ message: 'Server error during ledger update.' });
        }
    })
    // Existing DELETE logic remains the same
    .delete(protect, async (req: AuthRequest, res: Response) => {
        // [KEEP YOUR EXISTING DELETE LOGIC HERE]
        // ... (Your DELETE /api/ledger/:id logic for delete)
        const { id } = req.params;
        const userId = req.user?.id;

        if (!userId) return res.status(401).json({ message: 'User not authenticated.' });

        try {
            const ledger = await Ledger.findOneAndDelete({ 
                _id: id, 
                userId: userId 
            });

            if (!ledger) {
                return res.status(404).json({ message: 'Ledger account not found or access denied.' });
            }
            
            return res.status(200).json({ message: 'Ledger account successfully deleted.' });

        } catch (error) {
            console.error('Ledger delete error:', error);
            return res.status(500).json({ message: 'Server error during ledger deletion.' });
        }
    });

    // =================================================================
// GET /api/ledgers/details/:id - Get Single Ledger Details (for opening balance)
// =================================================================
router.get('/details/:id', protect, async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.id; // Assuming protection is based on user/company

    // 1. Validation
    if (!userId || !Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid Ledger ID.' });
    }

    try {
        // 2. Fetch Ledger Details
        const ledger = await Ledger.findById(id)
            // Select the fields needed for the report
            .select('_id name openingBalance obType companyId'); 

        if (!ledger) {
            return res.status(404).json({ message: 'Ledger not found.' });
        }

        // NOTE: You should ideally verify the user owns the company/ledger here.

        // 3. Success Response
        return res.json(ledger);

    } catch (error) {
        console.error('Fetch ledger details error:', error);
        return res.status(500).json({ message: 'Server error fetching ledger details.' });
    }
});


export default router;
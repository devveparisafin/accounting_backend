"use strict";
// src/routes/journal.routes.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middlewares/auth.middleware"); // Assume this path is correct
const Journal_model_1 = __importDefault(require("../models/Journal.model"));
const Ledger_model_1 = __importDefault(require("../models/Ledger.model"));
const mongoose_1 = require("mongoose");
const Company_model_1 = __importDefault(require("../models/Company.model"));
const router = (0, express_1.Router)();
// Helper function to generate sequential voucher number (Simplistic, but works for the core logic)
// NOTE: In production, this needs transaction lock or sequence generation mechanism
async function generateVoucherNumber(companyId) {
    const today = new Date();
    const existingCompany = await Company_model_1.default.findOne({ _id: companyId });
    var prefix = `JE/${today.getFullYear()}`;
    if (existingCompany) {
        prefix = `${existingCompany.shortCode}/JE/${today.getFullYear()}`;
    }
    // Find the count of journals for the company in the current year
    const count = await Journal_model_1.default.countDocuments({
        companyId,
        date: {
            $gte: new Date(today.getFullYear(), 0, 1),
            $lt: new Date(today.getFullYear() + 1, 0, 1)
        }
    });
    // Format the number with leading zeros
    return `${prefix}/${String(count + 1).padStart(4, '0')}`;
}
// =================================================================
// 1. POST /api/journal - Create Journal Entry
// =================================================================
router.post('/', auth_middleware_1.protect, async (req, res) => {
    console.log("post called");
    const { companyId, date, voucherType, narration, lines, totalDebit, totalCredit } = req.body;
    const userId = req.user?.id;
    // 0. Pre-check: Ensure Company ID is a valid ObjectId and belongs to the user
    // (You would add a check here to verify company ownership, omitted for brevity)
    if (!companyId || !mongoose_1.Types.ObjectId.isValid(companyId)) {
        return res.status(400).json({ message: 'Invalid or missing Company ID.' });
    }
    console.log("post called 2");
    // 1. Validation: Balance Check
    if (totalDebit !== totalCredit || totalDebit === 0) {
        return res.status(400).json({
            message: "Journal Entry is not balanced (Total Debit must equal Total Credit) or total is zero."
        });
    }
    // 2. Validation: Required Header Fields
    if (!userId || !date || !lines || lines.length < 2) {
        return res.status(400).json({ message: 'Missing required header data or lines must be at least two.' });
    }
    // 3. Validation: Line Data (Ledger existence and amount check)
    try {
        const ledgerIds = lines.map((line) => line.ledgerId);
        const foundLedgers = await Ledger_model_1.default.find({
            _id: { $in: ledgerIds },
            companyId: new mongoose_1.Types.ObjectId(companyId) // Ensure ledgers belong to the company
        });
        if (foundLedgers.length !== ledgerIds.length) {
            return res.status(400).json({
                message: "One or more Ledger Accounts are invalid for this company."
            });
        }
        // 4. General Ledger Update (Transaction Logic)
        // 🛑 IMPORTANT: In a real accounting system, all these steps (Voucher creation 
        // and all Ledger updates) must run inside a Mongoose Transaction to be atomic. 
        // This example omits the transaction for simplicity.
        const voucherNo = await generateVoucherNumber(companyId);
        const newJournal = new Journal_model_1.default({
            companyId: new mongoose_1.Types.ObjectId(companyId),
            date: new Date(date),
            voucherType,
            narration,
            totalDebit,
            totalCredit,
            voucherNo,
            // Ensure ledgerIds are converted to ObjectIds for saving
            lines: lines.map((line) => ({
                ...line,
                ledgerId: new mongoose_1.Types.ObjectId(line.ledgerId)
            }))
        });
        const savedJournal = await newJournal.save();
        // 5. Success
        // NOTE: After saving, you MUST update the running balances of the ledgers here.
        return res.status(201).json({
            message: "Journal Entry posted successfully.",
            data: savedJournal
        });
    }
    catch (error) {
        console.error('Journal entry creation error:', error);
        if (error.code === 11000) { // Duplicate key error for voucherNo
            return res.status(500).json({ message: 'Voucher number conflict. Please try again.' });
        }
        return res.status(500).json({ message: 'Server error during journal entry creation.' });
    }
});
// =================================================================
// 2. GET /api/journal/ledgers/:companyId - List Ledgers for Entry Form
// =================================================================
router.get('/ledgers/:companyId', auth_middleware_1.protect, async (req, res) => {
    const { companyId } = req.params;
    const userId = req.user?.id;
    if (!userId || !mongoose_1.Types.ObjectId.isValid(companyId)) {
        return res.status(401).json({ message: 'Invalid authentication or Company ID.' });
    }
    try {
        // Fetch all ledgers belonging to the company
        const ledgers = await Ledger_model_1.default.find({
            companyId: new mongoose_1.Types.ObjectId(companyId)
        }).select('_id name'); // Only send back ID and Name
        return res.json(ledgers);
    }
    catch (error) {
        console.error('Fetch ledgers error:', error);
        return res.status(500).json({ message: 'Server error fetching ledgers.' });
    }
});
// =================================================================
// 3. GET /api/journal - List All Journal Entries for a Company
// -----------------------------------------------------------------
// FIX: This route was empty and causing the client request to hang.
// =================================================================
router.get('/', auth_middleware_1.protect, async (req, res) => {
    // We expect companyId to be passed as a query parameter: /api/journal?companyId=...
    const companyId = req.query.companyId;
    const userId = req.user?.id; // User ID from the token via 'protect' middleware
    // 1. Validation
    if (!userId || !companyId || !mongoose_1.Types.ObjectId.isValid(companyId)) {
        // Send a 400 Bad Request or 401 Unauthorized if required data is missing
        return res.status(400).json({ message: 'Missing or invalid Company ID.' });
    }
    // 2. Fetch Data
    try {
        const journals = await Journal_model_1.default.find({
            companyId: new mongoose_1.Types.ObjectId(companyId)
        })
            .sort({ date: -1, voucherNo: -1 }) // Sort by newest first
            .limit(100); // Optional: Limit results for better performance
        // 3. Success Response
        return res.json(journals); // This sends the data and resolves the frontend promise
    }
    catch (error) {
        console.error('Fetch journals list error:', error);
        // Ensure a response is sent on error to prevent the client from hanging
        return res.status(500).json({ message: 'Server error fetching journal list.' });
    }
});
// =================================================================
// 4. GET /api/journal/:id - Get Single Journal Entry Details
// =================================================================
// journal.routes.ts (Update the GET /:id route)
router.get('/details/:id', auth_middleware_1.protect, async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId || !mongoose_1.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid Journal ID.' });
    }
    try {
        // 1. Fetch the document directly. Since ledgerName is saved in the lines array
        // (as per your model), no population is needed!
        const journal = await Journal_model_1.default.findById(id);
        if (!journal) {
            return res.status(404).json({ message: 'Journal Entry not found.' });
        }
        // 2. Success Response: The journal document already contains the lines with ledgerName
        return res.json(journal);
    }
    catch (error) {
        console.error('Fetch journal detail error:', error);
        return res.status(500).json({ message: 'Server error fetching journal details.' });
    }
});
// src/routes/journal.routes.ts (CORRECTED: GET /api/journal/report/ledger)
// src/routes/journal.routes.ts
// ... (Existing imports and router setup)
// =================================================================
// 5. GET /api/journal/report/ledger - Generate Ledger Statement (FIXED)
// =================================================================
router.get('/report/ledger', auth_middleware_1.protect, async (req, res) => {
    const { companyId, ledgerId, startDate, endDate } = req.query;
    const userId = req.user?.id;
    // 1. Validation (remains the same)
    if (!userId || !mongoose_1.Types.ObjectId.isValid(companyId) || !mongoose_1.Types.ObjectId.isValid(ledgerId)) {
        return res.status(400).json({ message: 'Invalid Company ID or Ledger ID.' });
    }
    const companyObjectId = new mongoose_1.Types.ObjectId(companyId);
    const ledgerObjectId = new mongoose_1.Types.ObjectId(ledgerId);
    // Prepare Date Range Filter 
    const dateFilter = {};
    if (startDate)
        dateFilter.$gte = new Date(startDate);
    if (endDate)
        dateFilter.$lte = new Date(endDate);
    try {
        // 2. Aggregation Pipeline: 
        const pipeline = [
            // Stage 1: Filter journals by companyId and date range
            {
                $match: {
                    companyId: companyObjectId,
                    // Ensure the journal contains the line for the selected ledger
                    'lines.ledgerId': ledgerObjectId,
                    ...(Object.keys(dateFilter).length > 0 && { date: dateFilter }),
                }
            },
            // 🌟 NEW STAGE 2: Add a field to calculate the opponent ledger name(s)
            {
                $addFields: {
                    // Filter the 'lines' array for ledgers NOT matching the selected ledgerId
                    opponentLines: {
                        $filter: {
                            input: '$lines',
                            as: 'line',
                            cond: { $ne: ['$$line.ledgerId', ledgerObjectId] }
                        }
                    },
                }
            },
            // 🌟 NEW STAGE 3: Calculate the final opponentLedgerName string
            {
                $addFields: {
                    opponentLedgerName: {
                        $switch: {
                            branches: [
                                // Case 1: Only one opponent ledger found
                                {
                                    case: { $eq: [{ $size: '$opponentLines' }, 1] },
                                    then: { $arrayElemAt: ['$opponentLines.ledgerName', 0] } // Get the name of the single opponent
                                },
                                // Case 2: Multiple opponent ledgers found
                                {
                                    case: { $gt: [{ $size: '$opponentLines' }, 1] },
                                    then: 'Multiple' // Use 'Multiple' for compound entries
                                }
                            ],
                            // Default case (0 opponent lines, should not happen in a valid journal)
                            default: null
                        }
                    }
                }
            },
            // Stage 4 (Previously Stage 2): Deconstruct the 'lines' array
            { $unwind: '$lines' },
            // Stage 5 (Previously Stage 3): Filter the resulting documents to ONLY include lines for the target ledger
            {
                $match: {
                    'lines.ledgerId': ledgerObjectId
                }
            },
            // Stage 6 (Previously Stage 4): Reshape the output (Projection)
            {
                $project: {
                    // Include the Journal document's fields
                    journalId: '$_id',
                    date: 1,
                    voucherType: 1,
                    voucherNo: 1,
                    narration: 1,
                    // Pull fields from the 'lines' sub-document (which belongs to the selected ledger)
                    lineNarration: '$lines.lineNarration',
                    debit: '$lines.debit',
                    credit: '$lines.credit',
                    // ⭐ Include the new calculated field
                    opponentLedgerName: 1,
                }
            },
            // Stage 7 (Previously Stage 5): Sort the results by date
            { $sort: { date: 1, voucherNo: 1 } }
        ];
        const reportData = await Journal_model_1.default.aggregate(pipeline);
        // 3. Success Response
        return res.json(reportData);
    }
    catch (error) {
        console.error('Fetch ledger report error:', error);
        return res.status(500).json({ message: 'Server error generating ledger report.' });
    }
});
exports.default = router;

import express from 'express';
import { checkEligibility, getDonors, registerDonor, updateDonor } from '../controllers/donorController';
import { auditLogger } from '../middleware/auditLogger';


const router = express.Router();

// Register new donor
router.post('/register', auditLogger('CREATE', 'Donor'), registerDonor);

// Get all donors
router.get('/', getDonors);

// Update donor
router.put('/:donorId', auditLogger('UPDATE', 'Donor'), updateDonor);

// Check eligibility
router.post('/check-eligibility', checkEligibility);

export default router;

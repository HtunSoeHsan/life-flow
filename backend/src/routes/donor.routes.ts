import express from 'express';
import { checkEligibility, getDonors, registerDonor, updateDonor } from '../controllers/donorController';


const router = express.Router();

// Register new donor
router.post('/register', registerDonor);

// Get all donors
router.get('/', getDonors);

// Update donor
router.put('/:donorId', updateDonor);

// Check eligibility
router.post('/check-eligibility', checkEligibility);

export default router;

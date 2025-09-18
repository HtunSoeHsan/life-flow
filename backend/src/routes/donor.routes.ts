import express from 'express';
import { checkEligibility, getDonors, registerDonor, updateDonor } from '../controllers/donorController';
import { auditLogger } from '../middleware/auditLogger';


const router = express.Router();

// Register new donor
router.post('/register', auditLogger('CREATE', 'Donor'), registerDonor);

// Get all donors
router.get('/', getDonors);

// Search donor by ID
router.get('/search', async (req, res) => {
  try {
    const { donorId } = req.query;
    const hospitalId = req.hospitalId || req.headers['x-hospital-id'] as string;
    
    if (!hospitalId) {
      return res.status(400).json({ error: 'Hospital ID required' });
    }
    
    if (!donorId) {
      return res.status(400).json({ error: 'Donor ID required' });
    }
    
    const SchemaManager = require('../database/schemaManager').default;
    const schemaManager = SchemaManager.getInstance();
    const tenantClient = schemaManager.getTenantClient(hospitalId);
    
    const donor = await tenantClient.donor.findFirst({
      where: { donorId: donorId as string }
    });
    
    if (!donor) {
      return res.status(404).json({ success: false, error: 'Donor not found' });
    }
    
    res.json({ success: true, data: donor });
  } catch (error) {
    console.error('Error searching donor:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update donor
router.put('/:donorId', auditLogger('UPDATE', 'Donor'), updateDonor);

// Check eligibility
router.post('/check-eligibility', checkEligibility);

export default router;

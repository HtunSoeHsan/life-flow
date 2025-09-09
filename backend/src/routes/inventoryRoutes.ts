import express from 'express';
import {
  getInventorySummary,
  getBloodUnits,
  createBloodUnit,
  updateBloodUnitStatus,
  updateTestResults,
  issueBloodUnit,
  getExpiringUnits
} from '../controllers/inventoryController';
import { auditLogger } from '../middleware/auditLogger';

const router = express.Router();

// Get inventory summary by blood group
router.get('/summary', getInventorySummary);

// Get blood units with filters and pagination
router.get('/units', getBloodUnits);

// Create new blood unit
router.post('/units', auditLogger('CREATE', 'BloodUnit'), createBloodUnit);

// Update blood unit status
router.put('/units/:unitId/status', auditLogger('UPDATE', 'BloodUnit'), updateBloodUnitStatus);

// Update test results
router.put('/units/:unitId/tests', auditLogger('UPDATE', 'BloodUnit'), updateTestResults);

// Issue blood unit
router.post('/units/:unitId/issue', auditLogger('ISSUE', 'BloodUnit'), issueBloodUnit);

// Get expiring units
router.get('/expiring', getExpiringUnits);

export default router;
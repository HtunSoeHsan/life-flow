import { Router } from 'express';
import { DistributionController } from '../controllers/DistributionController';
import SchemaManager from '../database/schemaManager';
import { auditLogger } from '../middleware/auditLogger';

const router = Router();
const schemaManager = SchemaManager.getInstance();

// Helper function to get controller instance
const getController = (req: any) => {
  const hospitalId = req.hospitalId || req.headers['x-hospital-id'] as string;
  if (!hospitalId) {
    throw new Error('Hospital ID required');
  }
  const tenantClient = schemaManager.getTenantClient(hospitalId);
  return new DistributionController(tenantClient);
};

// GET /api/distributions - Get all distribution requests with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const controller = getController(req);
    await controller.getDistributions(req, res);
  } catch (error) {
    res.status(400).json({ error: 'Hospital ID required' });
  }
});

// POST /api/distributions - Create new distribution request
router.post('/', auditLogger('CREATE', 'Distribution'), async (req, res) => {
  try {
    // Use target hospital's database for the request
    const targetHospitalId = req.body.targetHospitalId;
    if (!targetHospitalId) {
      return res.status(400).json({ error: 'Target hospital ID required' });
    }
    
    const tenantClient = schemaManager.getTenantClient(targetHospitalId);
    const controller = new DistributionController(tenantClient);
    await controller.createDistributionRequest(req, res);
  } catch (error) {
    res.status(400).json({ error: 'Hospital ID required' });
  }
});

// GET /api/distributions/stats - Get distribution statistics
router.get('/stats', async (req, res) => {
  try {
    const controller = getController(req);
    await controller.getDistributionStats(req, res);
  } catch (error) {
    res.status(400).json({ error: 'Hospital ID required' });
  }
});

// GET /api/distributions/my-requests - Get requests made by this hospital
router.get('/my-requests', async (req, res) => {
  try {
    const controller = getController(req);
    await controller.getMyRequests(req, res);
  } catch (error) {
    res.status(400).json({ error: 'Hospital ID required' });
  }
});

// GET /api/distributions/available-units - Get available blood units for distribution
router.get('/available-units', async (req, res) => {
  try {
    const controller = getController(req);
    await controller.getAvailableBloodUnits(req, res);
  } catch (error) {
    res.status(400).json({ error: 'Hospital ID required' });
  }
});

// GET /api/distributions/:id - Get specific distribution request
router.get('/:id', async (req, res) => {
  try {
    const controller = getController(req);
    await controller.getDistributionById(req, res);
  } catch (error) {
    res.status(400).json({ error: 'Hospital ID required' });
  }
});

// PUT /api/distributions/:id - Update distribution request
router.put('/:id', auditLogger('UPDATE', 'Distribution'), async (req, res) => {
  try {
    const controller = getController(req);
    await controller.updateDistribution(req, res);
  } catch (error) {
    res.status(400).json({ error: 'Hospital ID required' });
  }
});

// POST /api/distributions/:id/issue - Issue blood units for distribution
router.post('/:id/issue', auditLogger('ISSUE', 'Distribution'), async (req, res) => {
  try {
    const controller = getController(req);
    await controller.issueBloodUnits(req, res);
  } catch (error) {
    res.status(400).json({ error: 'Hospital ID required' });
  }
});

// POST /api/distributions/:id/cancel - Cancel distribution request
router.post('/:id/cancel', auditLogger('CANCEL', 'Distribution'), async (req, res) => {
  try {
    const controller = getController(req);
    await controller.cancelDistribution(req, res);
  } catch (error) {
    res.status(400).json({ error: 'Hospital ID required' });
  }
});

// DELETE /api/distributions/:id - Delete distribution request
router.delete('/:id', auditLogger('DELETE', 'Distribution'), async (req, res) => {
  try {
    const controller = getController(req);
    await controller.deleteDistribution(req, res);
  } catch (error) {
    res.status(400).json({ error: 'Hospital ID required' });
  }
});

export default router;

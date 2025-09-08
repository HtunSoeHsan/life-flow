import { Router } from 'express';
import { DistributionController } from '../controllers/DistributionController';
import { PrismaClient } from '.prisma/tenant-client';

const router = Router();
const prisma = new PrismaClient();
const distributionController = new DistributionController(prisma);

// GET /api/distributions - Get all distribution requests with filtering and pagination
router.get('/', distributionController.getDistributions.bind(distributionController));

// POST /api/distributions - Create new distribution request
router.post('/', distributionController.createDistributionRequest.bind(distributionController));

// GET /api/distributions/stats - Get distribution statistics
router.get('/stats', distributionController.getDistributionStats.bind(distributionController));

// GET /api/distributions/:id - Get specific distribution request
router.get('/:id', distributionController.getDistributionById.bind(distributionController));

// PUT /api/distributions/:id - Update distribution request
router.put('/:id', distributionController.updateDistribution.bind(distributionController));

// POST /api/distributions/:id/issue - Issue blood units for distribution
router.post('/:id/issue', distributionController.issueBloodUnits.bind(distributionController));

// POST /api/distributions/:id/cancel - Cancel distribution request
router.post('/:id/cancel', distributionController.cancelDistribution.bind(distributionController));

// DELETE /api/distributions/:id - Delete distribution request
router.delete('/:id', distributionController.deleteDistribution.bind(distributionController));

export default router;

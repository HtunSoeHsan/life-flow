import express from 'express';
import {
  getCollections,
  createCollection,
  updateCollectionStatus,
  completeCollection,
  testEndpoint
} from '../controllers/collectionController';
import { auditLogger } from '../middleware/auditLogger';

const router = express.Router();

// Test endpoint
router.post('/test', testEndpoint);

// Get all collections
router.get('/', getCollections);

// Create new collection
router.post('/', auditLogger('CREATE', 'Collection'), createCollection);

// Update collection status
router.put('/:collectionId/status', auditLogger('UPDATE', 'Collection'), updateCollectionStatus);

// Complete collection (create blood unit)
router.post('/:collectionId/complete', auditLogger('CREATE', 'BloodUnit'), completeCollection);

export default router;
import express from 'express';
import { 
  createHospital,
  getAllHospitals,
  getHospitalData,
  updateHospital,
  getHospitalUsers,
  createHospitalUser,
  updateHospitalUser,
  getBloodInventorySummary
} from '../controllers/hospitalController';
import masterClient from '../database/masterClient';

const router = express.Router();

// Create a new hospital (tenant)
router.post('/', createHospital);

// Get all hospitals (admin view)
router.get('/', getAllHospitals);

// Get specific hospital data
router.get('/:hospitalId', getHospitalData);

// Update hospital
router.put('/:hospitalId', updateHospital);

// Hospital user management
router.get('/:hospitalId/users', getHospitalUsers);
router.post('/:hospitalId/users', createHospitalUser);
router.put('/:hospitalId/users/:userId', updateHospitalUser);

// Blood inventory summary across all hospitals
router.get('/inventory/summary', getBloodInventorySummary);

export default router;

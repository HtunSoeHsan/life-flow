import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';

const router = Router();
const authController = new AuthController();

// Hospital login
router.post('/hospital/login', authController.hospitalLogin.bind(authController));

// Super admin login
router.post('/admin/login', authController.adminLogin.bind(authController));

export default router;